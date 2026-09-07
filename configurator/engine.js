/* 't Palletje — configurator engine (all products)
 * Pure functions, no DOM. Coordinates: X = along length, Y = across width, Z = up.
 * Output origin = bottom-left corner of the product's floor footprint (0,0). All sizes in mm.
 * Rules recovered from the original configurator; see pallet-configurator-spec.md and README.md.
 */
(function (root) {
  'use strict';

  const LIMITS = { length: { min: 200, max: 9000 }, width: { min: 200, max: 2500 }, height: { min: 200, max: 2500 } };

  const DIST_20 = [-1, 0, 50, 100, 150, 200];   // pallets, floors, box floor
  const DIST_40 = [-1, 0, 100, 200, 300, 400];  // crate sides and lid
  const distOptions = list => list.map(v => ({ value: v, label: v === -1 ? 'Manueel kiezen' : v === 0 ? '0 cm' : `<=${v / 10} cm` }));

  const LAT_TYPES = {
    normal: { key: 'normal', label: '75 x 16', width: 75, height: 16,
      blok: { normal: { length: 75, width: 75, height: 75 }, transpallet: { length: 75, width: 75, height: 90 } } },
    alternative: { key: 'alternative', label: '100 x 16', width: 100, height: 16,
      blok: { normal: { length: 95, width: 95, height: 78 }, heavy: { length: 145, width: 100, height: 78 } } },
    heavyDuty: { key: 'heavyDuty', label: '100 x 22', width: 100, height: 22,
      blok: { normal: { length: 95, width: 95, height: 78 }, heavy: { length: 145, width: 100, height: 78 } } },
  };
  const BALK_TYPES = {
    normal: { key: 'normal', label: '75 x 75', width: 75, height: 75 },
    transpallet: { key: 'transpallet', label: '50 x 100', width: 50, height: 100 },
    heavyDuty: { key: 'heavyDuty', label: '63 x 110', width: 63, height: 110 },
  };
  // uprights (staanders) for boxes: width = face width, height = thickness
  const STAANDER_TYPES = {
    normal: { key: 'normal', label: 'lat 100 x 22', width: 100, height: 22 },
    heavyDuty: { key: 'heavyDuty', label: 'balk 50 x 100', width: 50, height: 100 },
  };

  const HEAVY_WEIGHT = 600, HEAVY_BLOCK_WEIGHT = 1500, NAILS_NORMAL = 3, NAILS_HEAVY = 4, JACK_OPENING = 600;
  const BOX_CLEARANCE = 50, BOX_ROUND = 100, GROUND_POST = 500;

  const PRODUCTS = {
    PBL: { name: 'Pallet met blokken', group: 'Palletten', kind: 'pallet' },
    PBA: { name: 'Pallet met balken', group: 'Palletten', kind: 'pallet' },
    KIS: { name: 'Kist standaard', group: 'Kisten', kind: 'box', floor: 'S', gaps: false },
    KIB: { name: 'Kist met balken onderkader', group: 'Kisten', kind: 'box', floor: 'B', gaps: false },
    KIP: { name: 'Kist met palletbodem', group: 'Kisten', kind: 'box', floor: 'P', gaps: false },
    KRS: { name: 'Krat standaard', group: 'Kratten', kind: 'box', floor: 'S', gaps: true },
    KRB: { name: 'Krat met balken onderkader', group: 'Kratten', kind: 'box', floor: 'B', gaps: true },
    KRP: { name: 'Krat met palletbodem', group: 'Kratten', kind: 'box', floor: 'P', gaps: true },
    HVL: { name: 'Houten vloer', group: 'Deksels / Vloeren', kind: 'floor' },
  };

  // ---- helpers (identical to the original) ----
  const countSlats = (W, gap, s) => !W ? 0 : gap ? Math.ceil((W - s) / (s + gap) + 1) : Math.floor((W - s) / (s + gap) + 1);
  const actualGap = (W, n, s) => (!W || !n || n < 2) ? 0 : Math.floor((W - s) / (n - 1) - s);
  const heavyPallet = inp => !!inp.heavyDuty || (+inp.weight || 0) >= HEAVY_WEIGHT;
  // boxes: heavy depends on weight AND height (original formula)
  const heavyBox = inp => !!inp.heavyDuty || (Math.max((+inp.weight || 0) - 500, 0) / 50 + Math.max((+inp.height || 0) - 800, 0) / 100) >= 15;
  const clamp = (v, lo, hi) => { v = +v; if (isNaN(v)) return lo; return Math.min(hi, Math.max(lo, v)); };
  const roundUp = v => Math.ceil((v + BOX_CLEARANCE) / BOX_ROUND) * BOX_ROUND;

  function spread(n, d, L) {
    if (n <= 0) return [];
    if (n === 1) return [L / 2];
    const out = [];
    for (let i = 0; i < n; i++) out.push(d / 2 + i * (L - d) / (n - 1));
    return out;
  }
  function positionsX(transpallet, n, L, d) {
    if (transpallet && n % 2 === 0 && L >= JACK_OPENING) {
      const gap = (L - d) / (n - 1) - d;
      if (gap <= JACK_OPENING) {
        const half = (L - JACK_OPENING) / 2;
        const a = spread(n / 2, d, half);
        return a.concat(a.map(x => x + half + JACK_OPENING));
      }
    }
    return spread(n, d, L);
  }
  // slat count: from a gap choice (gap = 0 → flush), or manual override; with limits
  function slatCount(span, gap, s, override, min = 2) {
    const auto = gap !== -1 ? countSlats(span, gap, s) : min;
    const max = Math.max(min, Math.floor(span / s));
    return { n: clamp(override ?? auto, min, max), auto, max };
  }
  const flushCount = (span, s) => Math.max(2, Math.ceil(span / s));

  // =====================================================================
  // compute(): inputs → derived configuration
  // =====================================================================
  function compute(inp) {
    const P = PRODUCTS[inp.type] || PRODUCTS.PBL;
    const ov = inp.overrides || {};
    const L = +inp.length, W = +inp.width, H = +inp.height;
    const r = { type: inp.type, product: P, length: L, width: W, height: H, weight: +inp.weight || 0,
      transpallet: !!inp.transpallet, valid: L >= LIMITS.length.min && L <= LIMITS.length.max };
    if (P.kind === 'wall') r.valid = r.valid && H >= LIMITS.width.min && H <= LIMITS.width.max;
    else r.valid = r.valid && W >= LIMITS.width.min && W <= LIMITS.width.max;
    if (P.kind === 'box') r.valid = r.valid && H >= LIMITS.height.min && H <= LIMITS.height.max;
    if (!r.valid) return r;
    if (P.kind === 'pallet') return computePallet(inp, r, ov);
    if (P.kind === 'box') return computeBox(inp, r, ov);
    if (P.kind === 'floor') return computeFloor(inp, r, ov);
    return computeWall(inp, r, ov);
  }

  function chooseLatType(W, gap, heavy) {
    if (heavy) return LAT_TYPES.heavyDuty;
    if (gap === -1) return LAT_TYPES.normal;
    const nN = countSlats(W, gap, LAT_TYPES.normal.width), nA = countSlats(W, gap, LAT_TYPES.alternative.width);
    return ((nN % 2 === 0 && nA % 2 !== 0) || (gap === 0 && W % LAT_TYPES.alternative.width === 0)) ? LAT_TYPES.alternative : LAT_TYPES.normal;
  }

  function computePallet(inp, r, ov) {
    const L = r.length, W = r.width, gap = +inp.distance, heavy = heavyPallet(inp);
    let latType = chooseLatType(W, gap, heavy);
    if (ov.latType && LAT_TYPES[ov.latType]) latType = LAT_TYPES[ov.latType];
    const sc = slatCount(W, gap, latType.width, ov.latten);
    Object.assign(r, { heavy, latType, latten: sc.n, lattenAuto: sc.auto, lattenMax: sc.max,
      gap: actualGap(W, sc.n, latType.width), nails: heavy ? NAILS_HEAVY : NAILS_NORMAL });
    if (r.type === 'PBL') {
      let blok;
      if (inp.heavyDuty || r.weight >= HEAVY_BLOCK_WEIGHT) blok = latType.blok.heavy || latType.blok.normal;
      else if (inp.transpallet) blok = latType.blok.transpallet || latType.blok.normal;
      else blok = latType.blok.normal;
      Object.assign(r, palletBase(L, W, blok, heavy, ov));
      r.onderlatten = inp.onderlatten ? r.blokken : 0;
    } else {
      const balk = heavy ? BALK_TYPES.heavyDuty : inp.transpallet ? BALK_TYPES.transpallet : BALK_TYPES.normal;
      Object.assign(r, beamCount(L, balk, ov), { balk, onderMax: Math.max(2, Math.floor(W / latType.width)) });
      r.onderlatten = inp.onderlatten ? clamp(inp.onderlattenCount ?? 2, 2, r.onderMax) : 0;
    }
    return r;
  }

  // cross beams along a length: max ~800 mm apart
  function beamCount(L, balk, ov) {
    const balkenAuto = Math.ceil((L - balk.width) / (balk.width + 800) + 1);
    const balkenMax = Math.max(2, Math.floor(L / balk.width));
    return { balkenAuto, balkenMax, balken: clamp(ov.balken ?? balkenAuto, 2, balkenMax) };
  }

  // block layout for a pallet base of L × W (PBL, KIP, KRP)
  function palletBase(L, W, blok, heavy, ov, minBlokken = 3) {
    const spacing = heavy ? 700 : 1000;
    const blokkenAuto = Math.max(minBlokken, Math.ceil((L - blok.length) / (blok.length + spacing) + 1));
    const potenAuto = W < 600 ? 2 : W < 1200 ? 3 : Math.ceil((W - blok.width) / (blok.width + (heavy ? 500 : 900)) + 1);
    const blokkenMax = Math.max(minBlokken, Math.floor(L / blok.length));
    const potenMax = Math.max(2, Math.floor(W / blok.width));
    return { blok, blokkenAuto, potenAuto, blokkenMax, potenMax,
      blokken: clamp(ov.blokken ?? blokkenAuto, minBlokken, blokkenMax), poten: clamp(ov.poten ?? potenAuto, 2, potenMax) };
  }

  function computeBox(inp, r, ov) {
    const P = r.product, heavy = heavyBox(inp), floor = P.floor;
    const latType = heavy ? LAT_TYPES.heavyDuty : LAT_TYPES.alternative;
    const t = latType.height, s = latType.width;
    const staander = heavy ? STAANDER_TYPES.heavyDuty : STAANDER_TYPES.normal;
    const balk = heavy ? BALK_TYPES.heavyDuty : inp.transpallet ? BALK_TYPES.transpallet : BALK_TYPES.normal;
    // inner box dimensions = goods + 50 mm clearance, rounded up to 100 mm (length only + 50)
    const innerL = r.length + BOX_CLEARANCE;
    const innerW = floor === 'P' ? roundUp(r.width) - 2 * t : roundUp(r.width);
    const innerH = floor === 'P' ? roundUp(r.height) - t : roundUp(r.height) - 2 * t;
    const outerL = innerL + 2 * t, outerW = innerW + 2 * t;                    // incl. wall slats
    const extL = outerL + 2 * staander.height, extW = outerW + 2 * staander.height; // incl. uprights
    const gapFloor = P.gaps ? +inp.distance : 0, gapSide = P.gaps ? +inp.sideDistance : 0, gapCover = P.gaps ? +inp.coverDistance : 0;
    const wallH = floor === 'P' ? innerH + t : innerH + 2 * t; // on a pallet base the walls stand on the deck
    Object.assign(r, { heavy, latType, staander, balk, innerL, innerW, innerH, outerL, outerW, extL, extW, wallH, floor,
      cover: !!inp.cover, nails: heavy ? NAILS_HEAVY : NAILS_NORMAL, gaps: P.gaps });

    const side = slatCount(wallH, gapSide, s, ov.sideLatten);
    Object.assign(r, { sideLatten: side.n, sideLattenAuto: side.auto, sideLattenMax: side.max, sideGap: actualGap(wallH, side.n, s) });
    const cov = slatCount(innerW, gapCover, s, ov.coverLatten);
    Object.assign(r, { coverLatten: cov.n, coverLattenAuto: cov.auto, coverLattenMax: cov.max, coverGap: actualGap(innerW, cov.n, s) });
    const endPostsAuto = floor === 'B' ? Math.max(Math.ceil((innerW + 4 * t) / 500), 2) : innerW < 1000 ? 2 : Math.floor((innerW - 1000) / 600) + 3;
    Object.assign(r, { endPostsAuto, endPosts: clamp(ov.endPosts ?? endPostsAuto, 2, 16) });

    if (floor === 'S') {          // slats along X over the inner width, on cross beams
      const fl = slatCount(innerW, gapFloor, s, ov.latten);
      Object.assign(r, { latten: fl.n, lattenAuto: fl.auto, lattenMax: fl.max, gap: actualGap(innerW, fl.n, s) }, beamCount(outerL, balk, ov));
      r.onderMax = Math.max(2, Math.floor(innerW / s));
      r.onderlatten = inp.onderlatten ? clamp(inp.onderlattenCount ?? 2, 2, r.onderMax) : 0;
    } else if (floor === 'B') {   // slats across Y over the inner length, on long frame beams, on cross beams
      const fl = slatCount(innerL, gapFloor, s, ov.latten);
      Object.assign(r, { latten: fl.n, lattenAuto: fl.auto, lattenMax: fl.max, gap: actualGap(innerL, fl.n, s) }, beamCount(outerL, balk, ov));
      r.frameBalken = r.endPosts; // long frame beams: same count as the end uprights (original)
      r.onderMax = Math.max(2, Math.floor(outerW / s));
      r.onderlatten = inp.onderlatten ? clamp(inp.onderlattenCount ?? 2, 2, r.onderMax) : 0;
    } else {                      // 'P': block pallet of outerL × outerW; block layout uses the footprint incl. uprights
      const fl = slatCount(outerW, gapFloor, s, ov.latten);
      Object.assign(r, { latten: fl.n, lattenAuto: fl.auto, lattenMax: fl.max, gap: actualGap(outerW, fl.n, s) },
        palletBase(extL, extW, latType.blok.normal, heavy, ov, 2));
      r.onderlatten = inp.onderlatten ? r.blokken : 0;
    }
    r.sidePosts = floor === 'P' ? r.blokken : r.balken; // long-side uprights follow the cross members
    return r;
  }

  function computeFloor(inp, r, ov) {
    const latType = LAT_TYPES[inp.latTypeKey] || LAT_TYPES.normal;
    const sc = slatCount(r.width, +inp.distance, latType.width, ov.latten);
    const balkenMax = Math.max(2, Math.floor(r.length / latType.width));
    Object.assign(r, { heavy: false, latType, latten: sc.n, lattenAuto: sc.auto, lattenMax: sc.max, gap: actualGap(r.width, sc.n, latType.width),
      balken: clamp(ov.balken ?? 3, 2, balkenMax), balkenAuto: 3, balkenMax, nails: NAILS_NORMAL });
    return r;
  }

  function computeWall(inp, r, ov) {
    const latType = LAT_TYPES[inp.latTypeKey] || LAT_TYPES.normal;
    const sc = slatCount(r.height, +inp.distance, latType.width, ov.latten);
    const post = inp.balken ? (BALK_TYPES[inp.balkTypeKey] || BALK_TYPES.normal) : { key: 'lat', label: latType.label, width: latType.width, height: latType.height };
    const balkenMax = Math.max(2, Math.floor(r.length / post.width));
    Object.assign(r, { heavy: false, latType, post, latten: sc.n, lattenAuto: sc.auto, lattenMax: sc.max, gap: actualGap(r.height, sc.n, latType.width),
      balken: clamp(ov.balken ?? 3, 2, balkenMax), balkenAuto: 3, balkenMax, grondpalen: !!inp.grondpalen, nails: NAILS_NORMAL });
    return r;
  }

  // =====================================================================
  // geometry(): parts {kind,x,y,z,sx,sy,sz} (centres, z = 0 = top of floor deck) + nail joints
  // =====================================================================
  function geometry(c) {
    const parts = [], top = [], bottom = [];
    const box = (kind, x, y, zTop, sx, sy, sz) => parts.push({ kind, x, y, z: zTop - sz / 2, sx, sy, sz });
    const s = c.latType.width, t = c.latType.height;
    const jt = (x, y, layers) => top.push({ x, y, nails: c.nails, layers });
    const jb = (x, y, layers) => bottom.push({ x, y, nails: c.nails, layers });
    const g = { parts, top, bottom };

    // pallet deck on blocks (PBL, KIP, KRP): footprint L × W
    function blockPallet(L, W, latten, blok, blokken, poten, onderlatten, transpallet) {
      const slatY = spread(latten, s, W);
      slatY.forEach(y => box('lat', L / 2, y, 0, L, s, t));
      const colX = positionsX(transpallet, blokken, L, blok.length);
      const rowY = spread(poten, blok.width, W);
      colX.forEach(x => box('dwarslat', x, W / 2, -t, s, W, t));
      rowY.forEach(y => colX.forEach(x => box('blok', x, y, -2 * t, blok.length, blok.width, blok.height)));
      rowY.forEach(y => box('ligger', L / 2, y, -2 * t - blok.height, L, s, t));
      if (onderlatten) colX.forEach(x => box('onderlat', x, W / 2, -3 * t - blok.height, s, W, t));
      colX.forEach(x => slatY.forEach(y => jt(x, y, rowY.some(ry => Math.abs(ry - y) < (s + blok.width) / 2) ? 2 : 1)));
      rowY.forEach(y => colX.forEach(x => jb(x, y, onderlatten ? 2 : 1)));
      return 3 * t + blok.height + (onderlatten ? t : 0);
    }
    // slats along X on cross beams (PBA, KIS/KRS floor, HVL). Slats span [x0, x0+slatL], spread over [y0, y0+W]
    function beamDeck(L, W, x0, y0, slatL, latten, balk, balken, onderlatten, transpallet, beamL) {
      const slatY = spread(latten, s, W).map(y => y + y0);
      slatY.forEach(y => box('lat', x0 + slatL / 2, y, 0, slatL, s, t));
      const colX = positionsX(transpallet, balken, L, balk.width);
      colX.forEach(x => box('balk', x, y0 + W / 2, -t, balk.width, beamL, balk.height));
      let onderY = [];
      if (onderlatten) { onderY = spread(onderlatten, s, W).map(y => y + y0); onderY.forEach(y => box('onderlat', x0 + slatL / 2, y, -t - balk.height, slatL, s, t)); }
      colX.forEach(x => slatY.forEach(y => jt(x, y, 1)));
      colX.forEach(x => onderY.forEach(y => jb(x, y, 1)));
      return t + balk.height + (onderlatten ? t : 0);
    }

    if (c.type === 'PBL') return Object.assign(g, { footprint: { L: c.length, W: c.width }, height: blockPallet(c.length, c.width, c.latten, c.blok, c.blokken, c.poten, c.onderlatten, c.transpallet) });
    if (c.type === 'PBA') return Object.assign(g, { footprint: { L: c.length, W: c.width }, height: beamDeck(c.length, c.width, 0, 0, c.length, c.latten, c.balk, c.balken, c.onderlatten, c.transpallet, c.width) });
    if (c.type === 'HVL') return Object.assign(g, { footprint: { L: c.length, W: c.width }, height: beamDeck(c.length, c.width, 0, 0, c.length, c.latten, { width: s, height: t }, c.balken, 0, false, c.width) });
    if (c.type === 'HWA') { // drawn flat: X = length, Y = height, posts behind the slats
      const L = c.length, Hh = c.height, p = c.post;
      const slatY = spread(c.latten, s, Hh);
      slatY.forEach(y => box('lat', L / 2, y, 0, L, s, t));
      const colX = spread(c.balken, p.width, L);
      const postLen = Hh + (c.grondpalen ? GROUND_POST : 0);
      colX.forEach(x => box('paal', x, Hh / 2 - (c.grondpalen ? GROUND_POST / 2 : 0), -t, p.width, postLen, p.height));
      colX.forEach(x => slatY.forEach(y => jt(x, y, 1)));
      return Object.assign(g, { footprint: { L, W: Hh }, height: t + p.height, wall: true });
    }

    // ---- boxes: origin = corner of the outer floor footprint (outerL × outerW) ----
    const { innerL, innerW, outerL, outerW, wallH, staander: st, floor } = c;
    let depth;
    if (floor === 'S') depth = beamDeck(outerL, innerW, t, t, innerL, c.latten, c.balk, c.balken, c.onderlatten, c.transpallet, outerW);
    else if (floor === 'B') {
      const slatX = spread(c.latten, s, innerL).map(x => x + t);
      slatX.forEach(x => box('lat', x, outerW / 2, 0, s, innerW, t));
      const frameY = spread(c.frameBalken, c.balk.width, outerW);
      frameY.forEach(y => box('kaderbalk', outerL / 2, y, -t, outerL, c.balk.width, c.balk.height));
      const colX = positionsX(c.transpallet, c.balken, outerL, c.balk.width);
      colX.forEach(x => box('balk', x, outerW / 2, -t - c.balk.height, c.balk.width, outerW, c.balk.height));
      let onderY = [];
      if (c.onderlatten) { onderY = spread(c.onderlatten, s, outerW); onderY.forEach(y => box('onderlat', outerL / 2, y, -t - 2 * c.balk.height, outerL, s, t)); }
      slatX.forEach(x => frameY.forEach(y => jt(x, y, 1)));
      colX.forEach(x => frameY.forEach(y => jb(x, y, 1)));
      colX.forEach(x => onderY.forEach(y => jb(x, y, 1)));
      depth = t + 2 * c.balk.height + (c.onderlatten ? t : 0);
    } else depth = blockPallet(outerL, outerW, c.latten, c.blok, c.blokken, c.poten, c.onderlatten, c.transpallet);

    // walls: stacked slats from the bottom of the floor deck upward; long sides at y = t/2 and outerW − t/2, ends at x = t/2 and outerL − t/2
    const wallZ = spread(c.sideLatten, s, wallH).map(z => z - (floor === 'P' ? 0 : t));
    wallZ.forEach(z => { box('wandlat', outerL / 2, t / 2, z + s / 2, innerL, t, s); box('wandlat', outerL / 2, outerW - t / 2, z + s / 2, innerL, t, s); });
    wallZ.forEach(z => { box('kopwandlat', t / 2, outerW / 2, z + s / 2, t, outerW, s); box('kopwandlat', outerL - t / 2, outerW / 2, z + s / 2, t, outerW, s); });
    // uprights outside the walls, from the bottom of the floor structure to the top of the walls
    const z0 = floor === 'P' ? 0 : -t;              // bottom of the wall slats
    const postH = wallH + depth + z0, zTop = wallH + z0;
    const sideX = positionsX(c.transpallet, c.sidePosts, outerL + 2 * st.height, st.width).map(x => x - st.height);
    sideX.forEach(x => { box('staander', x, -st.height / 2, zTop, st.width, st.height, postH); box('staander', x, outerW + st.height / 2, zTop, st.width, st.height, postH); });
    spread(c.endPosts, st.width, outerW).forEach(y => { box('staander', -st.height / 2, y, zTop, st.height, st.width, postH); box('staander', outerL + st.height / 2, y, zTop, st.height, st.width, postH); });
    if (c.cover) {
      spread(c.coverLatten, s, innerW).map(y => y + t).forEach(y => box('deksellat', outerL / 2, y, zTop + t, innerL, s, t));
      sideX.forEach(x => box('dekselbalk', x, outerW / 2, zTop + t + st.height, st.width, outerW + 2 * st.height, st.height));
    }
    return Object.assign(g, { footprint: { L: outerL, W: outerW }, height: depth + wallH + (c.cover ? st.height : 0), box: true });
  }

  // ---- cut list: parts grouped by kind and dimensions (length ≥ width ≥ thickness) ----
  const KIND_LABEL = { lat: 'Vloerlat', dwarslat: 'Dwarslat', blok: 'Blok', ligger: 'Ligger', onderlat: 'Onderlat', balk: 'Balk',
    kaderbalk: 'Kaderbalk', wandlat: 'Zijwandlat', kopwandlat: 'Kopwandlat', staander: 'Staander', deksellat: 'Deksellat', dekselbalk: 'Dekselbalk', paal: 'Paal' };
  function cutList(g) {
    const m = {};
    g.parts.forEach(p => {
      const d = p.kind === 'blok' ? [p.sx, p.sy, p.sz] : [p.sx, p.sy, p.sz].sort((a, b) => b - a);
      const k = p.kind + '|' + d.join('x');
      m[k] = m[k] || { kind: p.kind, label: KIND_LABEL[p.kind] || p.kind, length: d[0], width: d[1], thickness: d[2], count: 0 };
      m[k].count++;
    });
    return Object.values(m);
  }

  function csv(c, g, sep = ';') {
    const fmt = v => (Math.round(v * 10) / 10).toString().replace('.', ',');
    const lines = [['X_boven', 'Y_boven', 'Nagels_boven', 'Lagen_boven', 'X_onder', 'Y_onder', 'Nagels_onder', 'Lagen_onder'].join(sep)];
    const n = Math.max(g.top.length, g.bottom.length);
    for (let i = 0; i < n; i++) {
      const a = g.top[i], b = g.bottom[i];
      lines.push([a ? fmt(a.x) : '', a ? fmt(a.y) : '', a ? a.nails : '', a ? a.layers : '', b ? fmt(b.x) : '', b ? fmt(b.y) : '', b ? b.nails : '', b ? b.layers : ''].join(sep));
    }
    lines.push('', ['Zaaglijst', c.product.name, `${c.type} ${g.footprint.L} x ${g.footprint.W}${g.box ? ' x ' + c.wallH : ''} mm`].join(sep));
    lines.push(['Onderdeel', 'Aantal', 'Lengte', 'Breedte', 'Dikte'].join(sep));
    cutList(g).forEach(p => lines.push([p.label, p.count, fmt(p.length), fmt(p.width), fmt(p.thickness)].join(sep)));
    return lines.join('\r\n') + '\r\n';
  }

  root.PalletEngine = { LIMITS, DIST_20, DIST_40, distOptions, LAT_TYPES, BALK_TYPES, STAANDER_TYPES, PRODUCTS,
    compute, geometry, cutList, csv, countSlats, actualGap, positionsX, spread, flushCount };
})(typeof module !== 'undefined' ? module.exports : window);
