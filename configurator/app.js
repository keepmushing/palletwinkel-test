/* UI for the configurator. Depends on engine.js (PalletEngine) and three.js r128 (global THREE). */
(function () {
  'use strict';
  const E = window.PalletEngine;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const form = $('#form');
  const state = { type: 'PBL', overrides: {}, onderlattenCount: 2 };
  let current = null;

  /* De stand waarop de drie tussenafstand-lijsten beginnen. Hiernaar keren ze
     terug bij "herstel automatisch" en bij een productwissel: bleef zo'n lijst
     op "Manueel kiezen" staan terwijl de handmatige aantallen gewist werden,
     dan begon je met twee latten over de volle breedte. */
  const STANDAARDLIJST = { distance: '100', sideDistance: '300', coverDistance: '300' };

  /* De maatvelden hadden hun eigen min/max in de HTML staan. Toen de
     breedtegrens in engine.js naar 4000 ging, bleef het invoerveld op 2500
     hangen — twee bronnen voor dezelfde regel lopen altijd uit elkaar. De
     grenzen komen nu uit de engine, zodat de rode rand van de browser klopt
     met wat de berekening aanvaardt. */
  ['length', 'width', 'height'].forEach(naam => {
    const veld = form.querySelector('[name=' + naam + ']'), grens = E.LIMITS[naam];
    if (veld && grens) { veld.min = grens.min; veld.max = grens.max; }
  });

  const toevoegKnop = () => $('#toevoegen');
  function zetToevoegen(aan) {
    const k = toevoegKnop();
    if (!k) return;
    k.disabled = !aan;
    k.title = aan ? '' : 'Pas eerst de afmetingen aan; deze maat valt buiten wat de configurator aankan.';
  }

  /* De knop naar de offerte stond alleen aan na een toevoeging in dezelfde
     sessie. Wie eerder iets toevoegde, wegnavigeerde en terugkwam, zag zijn
     mand wel meetellen maar kon er niet naartoe. */
  function toonOfferteKnop() {
    const k = $('#naarOfferte');
    if (k && window.Offerte) k.hidden = window.Offerte.aantal() === 0;
  }

  // ---- tabs (grouped) + mobile select ----
  const tabs = $('#tabs');
  const groups = {};
  Object.entries(E.PRODUCTS).forEach(([code, p]) => (groups[p.group] = groups[p.group] || []).push(code));
  const sel = document.createElement('select'); sel.className = 'tabs-select';
  Object.entries(groups).forEach(([gname, codes]) => {
    const gl = document.createElement('span'); gl.className = 'group'; gl.textContent = gname; tabs.appendChild(gl);
    const og = document.createElement('optgroup'); og.label = gname; sel.appendChild(og);
    codes.forEach(code => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tab'; b.dataset.type = code; b.textContent = E.PRODUCTS[code].name;
      b.addEventListener('click', () => setType(code)); tabs.appendChild(b);
      og.appendChild(new Option(E.PRODUCTS[code].name, code));
    });
  });
  $('.topbar').appendChild(sel);
  sel.addEventListener('change', () => setType(sel.value));

  function setType(code) {
    /* Ook de keuzelijsten terug naar automatisch. Bleven ze op "Manueel
       kiezen" staan terwijl de overrides gewist werden, dan begon het volgende
       product met twee latten over de volle breedte. */
    state.type = code; state.overrides = {}; lijstenAutomatisch();
    const P = E.PRODUCTS[code];
    $$('.tab').forEach(x => x.classList.toggle('is-active', x.dataset.type === code));
    sel.value = code;
    $('#title').textContent = P.name;
    document.body.dataset.kind = P.kind; document.body.dataset.type = code;
    // visibility: element shown if any show-* class matches, hidden if any hide-* matches
    const tags = new Set([P.kind, code, P.kind === 'box' && P.gaps ? 'krat' : null, P.kind === 'box' && !P.gaps ? 'kist' : null].filter(Boolean));
    $$('[class*="show-"],[class*="hide-"]').forEach(el => {
      const cls = Array.from(el.classList);
      const shows = cls.filter(c => c.startsWith('show-')).map(c => c.slice(5));
      const hides = cls.filter(c => c.startsWith('hide-')).map(c => c.slice(5));
      let vis = shows.length === 0 || shows.some(tg => tags.has(tg));
      if (hides.some(tg => tags.has(tg))) vis = false;
      el.classList.toggle('hidden', !vis);
    });
    // distance lists per product
    const dist = form.elements.distance;
    fill(dist, E.distOptions(E.DIST_20), STANDAARDLIJST.distance);
    fill(form.elements.sideDistance, E.distOptions(E.DIST_40), STANDAARDLIJST.sideDistance);
    fill(form.elements.coverDistance, E.distOptions(E.DIST_40), STANDAARDLIJST.coverDistance);
    $('#distLabel').firstChild.textContent = P.kind === 'wall' ? 'Tussenafstand latten' : P.kind === 'box' ? 'Tussenafstand vloer' : 'Tussenafstand latten';
    const hIn = form.querySelector('[name=height]'); if (P.kind === 'wall' && +hIn.value === 300) hIn.value = 800; if (P.kind === 'box' && +hIn.value === 800) hIn.value = 300;
    $('#dimsTitle').textContent = P.kind === 'box' ? 'Goederen' : P.kind === 'wall' ? 'Wand' : P.kind === 'floor' ? 'Vloer' : 'Pallet';
    update();
  }
  function fill(select, opts, def) {
    const keep = select.value; select.innerHTML = '';
    opts.forEach(o => select.append(new Option(o.label, o.value)));
    select.value = opts.some(o => String(o.value) === keep) ? keep : def;
  }
  const latTypeInput = form.elements.latTypeKey, balkTypeInput = form.elements.balkTypeKey;
  Object.values(E.LAT_TYPES).forEach(t => latTypeInput.append(new Option(t.label, t.key)));
  Object.values(E.BALK_TYPES).forEach(t => balkTypeInput.append(new Option(t.label, t.key)));
  const latTypeSel = $('#latType');
  Object.values(E.LAT_TYPES).forEach(t => latTypeSel.append(new Option(t.label, t.key)));

  function readInputs() {
    const f = form.elements;
    const num = n => +form.querySelector(`[name=${n}]`).value; // form.elements.length is the collection size, so query by name
    const chk = n => !!(f[n] && f[n].checked);
    const optionNames = ['ht', 'htCertificate', 'binden', 'nestelen', 'schimmelvrij', 'droog', 'unmountableFront', 'hingingCover', 'hookAnchors', 'kit', 'plasticInside', 'poTray', 'airtag', 'spraySafetySymbols', 'sprayLogo'];
    return {
      type: state.type, length: num('length'), width: num('width'), height: num('height'), weight: num('weight') || 0,
      distance: +f.distance.value, sideDistance: +f.sideDistance.value, coverDistance: +f.coverDistance.value,
      heavyDuty: chk('heavyDuty'), transpallet: chk('transpallet'), onderlatten: chk('onderlatten'), cover: chk('cover'),
      balken: chk('balken'), grondpalen: chk('grondpalen'), latTypeKey: f.latTypeKey.value, balkTypeKey: f.balkTypeKey.value,
      onderlattenCount: state.onderlattenCount, overrides: state.overrides,
      options: Object.fromEntries(optionNames.map(n => [n, chk(n)])),
    };
  }

  const CORE = ['length', 'width', 'height', 'weight', 'distance', 'sideDistance', 'coverDistance', 'heavyDuty', 'transpallet', 'latTypeKey', 'balkTypeKey', 'balken'];
  /* Elk lattenaantal hoort bij zijn eigen keuzelijst. Hier stond eerst één vlag
     die alleen naar de VLOERlijst keek en bij elke wijziging alle overrides
     weggooide. Gevolg: wie het aantal wandlatten of deksellatten met de hand
     had gezet, zag dat stilzwijgend terugvallen naar het minimum zodra hij een
     gewicht of een maat aanraakte — met een gat van een halve meter in de wand
     als resultaat. Nu overleeft een handmatig aantal zolang zijn eigen lijst op
     "Manueel kiezen" staat. */
  const MANUEEL = { latten: 'distance', sideLatten: 'sideDistance', coverLatten: 'coverDistance' };
  const opManueel = k => { const v = form.elements[MANUEEL[k]]; return !!v && v.value === '-1'; };

  const lijstenAutomatisch = () => Object.entries(STANDAARDLIJST).forEach(([naam, waarde]) => {
    const v = form.elements[naam]; if (v) v.value = waarde;
  });

  form.addEventListener('input', ev => {
    const n = ev.target.name;
    if (CORE.includes(n)) {
      const heavyNow = form.elements.heavyDuty.checked || (+form.querySelector('[name=weight]').value || 0) >= 600;
      const bewaard = {};
      Object.keys(MANUEEL).forEach(k => {
        if (n === MANUEEL[k]) {
          /* De gebruiker wijzigt juist deze lijst. Zet hij ze op "Manueel
             kiezen", dan vertrekken we van het aantal dat nu op het scherm
             staat in plaats van van het minimum — anders klapt een dek van vijf
             planken in tot twee. Kiest hij een afstand, dan vervalt de
             handmatige waarde; dat is precies wat hij vraagt. */
          if (ev.target.value === '-1' && current) bewaard[k] = current.c[k];
          return;
        }
        if (state.overrides[k] !== undefined && opManueel(k)) bewaard[k] = state.overrides[k];
      });
      if (state.overrides.latType !== undefined && !heavyNow && n !== 'latTypeKey') bewaard.latType = state.overrides.latType;
      state.overrides = bewaard;
    }
    if (n === 'onderlatten' && ev.target.checked && form.elements.nestelen) form.elements.nestelen.checked = false;
    if (n === 'nestelen' && ev.target.checked) form.elements.onderlatten.checked = false;
    update();
  });
  form.addEventListener('submit', e => e.preventDefault());
  $('#resetOv').addEventListener('click', () => { state.overrides = {}; lijstenAutomatisch(); update(); });

  $$('.stepper').forEach(st => {
    const key = st.dataset.key;
    $$('button', st).forEach(btn => btn.addEventListener('click', () => {
      if (!current) return;
      const d = +btn.dataset.d;
      if (key === 'onderlattenCount') state.onderlattenCount = Math.max(2, (current.c.onderlatten || state.onderlattenCount) + d);
      else {
        state.overrides[key] = current.c[key] + d;
        const hasDistance = current.c.product.kind !== 'box' || current.c.gaps; // kisten have no gap dropdown
        if (key === 'latten' && hasDistance) {
          form.elements.distance.value = '-1';
          if (current.c.product.kind === 'pallet') state.overrides.latType = state.overrides.latType || current.c.latType.key;
        }
        if (key === 'sideLatten' && current.c.gaps) form.elements.sideDistance.value = '-1';
        if (key === 'coverLatten' && current.c.gaps) form.elements.coverDistance.value = '-1';
      }
      update();
    }));
  });
  latTypeSel.addEventListener('change', () => { state.overrides.latType = latTypeSel.value; update(); });

  // ---- three.js ----
  const canvas = $('#canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 10, 40000);
  const l1 = new THREE.DirectionalLight(0xffffff, 1.1); l1.position.set(500, 1000, 2000); scene.add(l1);
  const l2 = new THREE.DirectionalLight(0xffffff, .6); l2.position.set(-500, -1000, -2000); scene.add(l2);
  scene.add(new THREE.AmbientLight(0xffffff, .55));
  /* Houtkleuren van de onderdelen.
     Deze stonden op geel-oranje tinten en liepen daardoor uit de pas met de
     productpictogrammen op de site. Die zijn opgemeten: het hout daar is een
     bleke, warme creme (#f1d3b6 is veruit de dominante tint) met schaduwvlakken
     tot ongeveer #7c5431. De waarden hieronder komen uit die meting, waarbij de
     oude verhouding licht/donker bewaard blijft: dekvlakken het lichtst,
     blokken en palen het donkerst, zodat de opbouw leesbaar blijft in 3D. */
  const COL = { lat: 0xf1d3b6, dwarslat: 0xdcbb9a, blok: 0x9b7150, ligger: 0xe8cbab, onderlat: 0xdcbb9a, balk: 0x9b7150, kaderbalk: 0xb28761,
    wandlat: 0xf2d4b9, kopwandlat: 0xe0c1a0, staander: 0xb98f6b, deksellat: 0xf1d3b6, dekselbalk: 0xb98f6b, paal: 0x9b7150 };
  const mats = Object.fromEntries(Object.entries(COL).map(([k, c]) => [k, new THREE.MeshStandardMaterial({ color: c, roughness: .85 })]));
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x6f4e30, transparent: true, opacity: .35 });
  let group = new THREE.Group(); scene.add(group);

  const orbit = { theta: .8, phi: 1.05, r: 2600, target: new THREE.Vector3() };
  function applyCam() {
    const { theta, phi, r, target } = orbit;
    camera.position.set(target.x + r * Math.sin(phi) * Math.sin(theta), target.y + r * Math.cos(phi), target.z + r * Math.sin(phi) * Math.cos(theta));
    camera.lookAt(target); render();
  }
  let drag = null;
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, pan: e.shiftKey }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
    if (drag.pan) { orbit.target.x -= dx * orbit.r / 800; orbit.target.y += dy * orbit.r / 800; }
    else { orbit.theta -= dx * .008; orbit.phi = Math.min(1.5, Math.max(.15, orbit.phi - dy * .008)); }
    applyCam();
  });
  canvas.addEventListener('pointerup', () => drag = null);
  canvas.addEventListener('wheel', e => { e.preventDefault(); orbit.r = Math.min(30000, Math.max(300, orbit.r * (1 + Math.sign(e.deltaY) * .1))); applyCam(); }, { passive: false });
  $('#resetCam').addEventListener('click', fitCamera);
  function fitCamera() {
    if (!current) return;
    const g = current.g, d = Math.max(g.footprint.L, g.footprint.W, g.height);
    orbit.theta = .8; orbit.phi = g.wall ? 1.35 : 1.05; orbit.r = d * 1.9 + 400; orbit.target.set(0, 0, 0); applyCam();
  }
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight, pr = renderer.getPixelRatio();
    if (canvas.width !== Math.round(w * pr) || canvas.height !== Math.round(h * pr)) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  }
  function render() { resize(); renderer.render(scene, camera); }
  window.addEventListener('resize', render);

  function draw(c, g) {
    scene.remove(group); group = new THREE.Group();
    // engine X,Y,Z (Z up) → three x, y(=Z), z(=−Y); centred on the footprint and on the vertical extent
    const zs = g.parts.flatMap(p => [p.z - p.sz / 2, p.z + p.sz / 2]);
    const zMid = (Math.min(...zs) + Math.max(...zs)) / 2;
    g.parts.forEach(p => {
      // walls are drawn standing up: engine Y = height → three y, engine Z (thickness) → three z
      const geo = g.wall ? new THREE.BoxGeometry(p.sx, p.sy, p.sz) : new THREE.BoxGeometry(p.sx, p.sz, p.sy);
      const mesh = new THREE.Mesh(geo, mats[p.kind] || mats.lat);
      if (g.wall) mesh.position.set(p.x - g.footprint.L / 2, p.y - g.footprint.W / 2, p.z - zMid);
      else mesh.position.set(p.x - g.footprint.L / 2, p.z - zMid, -(p.y - g.footprint.W / 2));
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
      group.add(mesh);
    });
    scene.add(group);
  }

  // ---- Excel-style live view of the CSV ----
  const sheetWrap = $('#sheetWrap'), sheetTable = $('#sheet'), rawToggle = $('#rawToggle');
  const colName = i => { let s = '', n = i; do { s = String.fromCharCode(65 + n % 26) + s; n = Math.floor(n / 26) - 1; } while (n >= 0); return s; };
  const isNum = v => /^-?\d+(,\d+)?$/.test(v);

  function renderSheet(text) {
    const rows = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map(l => l.split(';'));
    const cols = Math.max(1, ...rows.map(r => r.length));
    const keep = sheetWrap.scrollTop, keepX = sheetWrap.scrollLeft;   // keep the view put while typing
    const head = document.createElement('thead');
    const hr = head.insertRow();
    hr.appendChild(Object.assign(document.createElement('th'), { className: 'corner' }));
    for (let i = 0; i < cols; i++) hr.appendChild(Object.assign(document.createElement('th'), { textContent: colName(i) }));
    const body = document.createElement('tbody');
    rows.forEach((cells, r) => {
      const tr = body.insertRow();
      const blank = cells.every(v => v === '');
      const header = r === 0 || /^(Zaaglijst|Onderdeel)$/.test(cells[0]);
      if (blank) tr.className = 'is-blank'; else if (header) tr.className = 'is-header';
      tr.appendChild(Object.assign(document.createElement('th'), { className: 'rownum', textContent: r + 1 }));
      for (let i = 0; i < cols; i++) {
        const v = cells[i] ?? '';
        const td = tr.insertCell();
        td.textContent = v;
        if (isNum(v)) td.className = 'num';
      }
    });
    sheetTable.replaceChildren(head, body);
    sheetWrap.scrollTop = keep; sheetWrap.scrollLeft = keepX;
  }
  rawToggle.addEventListener('change', () => {
    $('#preview').classList.toggle('hidden', !rawToggle.checked);
    sheetWrap.classList.toggle('hidden', rawToggle.checked);
  });

  // ---- update ----
  function update() {
    const inp = readInputs();
    const c = E.compute(inp);
    const P = c.product;
    $('#pbaHint').classList.toggle('hidden', !(c.type === 'PBL' && c.width <= 700));
    $('.stepper[data-key=onderlattenCount]').classList.toggle('hidden', !(inp.onderlatten && !['PBL', 'KIP', 'KRP'].includes(c.type) && P.kind !== 'floor' && P.kind !== 'wall'));
    $('#balkTypeRow').classList.toggle('hidden', !(P.kind === 'wall' && inp.balken));
    if (!c.valid) {
      /* Buiten bereik gaf enkel een grijs regeltje met de grenzen erin, terwijl
         het 3D-vlak leeg werd en de knop "Toevoegen aan offerte" gewoon
         aanklikbaar bleef en niets deed. De klant wist dus niet wat er scheelde.
         Nu: een echte foutmelding, en de knop uit. */
      const L = E.LIMITS;
      $('#gapNote').textContent =
        'Deze maat kunnen wij niet configureren. Lengte ' + L.length.min + '–' + L.length.max +
        ' mm, breedte ' + L.width.min + '–' + L.width.max +
        ' mm, hoogte ' + L.height.min + '–' + L.height.max + ' mm. ' +
        'Grotere stukken maken wij wel, maar niet via de configurator — stuur uw project door.';
      $('#gapNote').classList.add('fout');
      zetToevoegen(false);
      current = null; $('#summary').innerHTML = ''; $('#preview').textContent = ''; sheetTable.replaceChildren(); scene.remove(group); render(); return;
    }
    $('#gapNote').classList.remove('fout');
    zetToevoegen(true);
    const g = E.geometry(c);
    const first = !current || current.c.type !== c.type;
    current = { c, g, inp };
    $('#gapNote').textContent = P.kind === 'box'
      ? `Binnenmaat ${c.innerL} × ${c.innerW} × ${c.innerH} mm · buitenmaat ${g.outer.L} × ${g.outer.W} × ${g.outer.H} mm (staanders en deksel inbegrepen) · latten ${c.latType.label}`
      : `Werkelijke tussenafstand: ${c.gap} mm · lattype ${c.latType.label} mm`;

    const vals = { latten: c.latten, poten: c.poten, blokken: c.blokken, balken: c.balken, sideLatten: c.sideLatten, coverLatten: c.coverLatten, endPosts: c.endPosts, onderlattenCount: c.onderlatten || state.onderlattenCount };
    const maxes = { latten: c.lattenMax, poten: c.potenMax, blokken: c.blokkenMax, balken: c.balkenMax, sideLatten: c.sideLattenMax, coverLatten: c.coverLattenMax, endPosts: c.endPostsMax || 16, onderlattenCount: c.onderMax || 16 };
    const mins = { latten: 2, poten: 2, blokken: c.type === 'PBL' ? 3 : 2, balken: 2, sideLatten: 2, coverLatten: 2, endPosts: 2, onderlattenCount: 2 };
    $$('.stepper').forEach(st => {
      const k = st.dataset.key; if (k === 'latType') return;
      $('output', st).value = vals[k] ?? '';
      $('button[data-d="-1"]', st).disabled = vals[k] <= mins[k];
      $('button[data-d="1"]', st).disabled = vals[k] >= maxes[k];
      st.classList.toggle('is-manual', k in state.overrides);
    });
    latTypeSel.value = c.latType.key;

    const rows = [];
    /* Buitenmaat = alles inbegrepen (staanders, deksel), uit de tekening zelf.
       Wie hierop een vrachtwagen boekt, moet het juiste getal krijgen. */
    if (P.kind === 'box') rows.push(['Buitenmaat', `${g.outer.L} × ${g.outer.W} × ${g.outer.H} mm`], ['Binnenmaat', `${c.innerL} × ${c.innerW} × ${c.innerH} mm`]);
    else if (P.kind === 'wall') rows.push(['Afmeting', `${c.length} × ${c.height} mm`]);
    else rows.push(['Afmeting', `${c.length} × ${c.width} mm`]);
    rows.push([P.kind === 'wall' ? 'Latten' : 'Vloerlatten', `${c.latten} × ${c.latType.label} mm${c.gap ? `, tussenafstand ${c.gap} mm` : ''}`]);
    if (c.blok) rows.push(['Blokken', `${c.poten} poten × ${c.blokken} = ${c.poten * c.blokken} stuks, ${c.blok.length} × ${c.blok.width} × ${c.blok.height} mm`]);
    if (c.balk && c.balken) rows.push([c.floor === 'B' ? 'Dwarsbalken' : 'Balken', `${c.balken} × ${c.balk.label} mm`]);
    if (c.frameBalken) rows.push(['Kaderbalken', `${c.frameBalken} × ${c.balk.label} mm`]);
    if (P.kind === 'floor') rows.push(['Dwarslatten', `${c.balken}`]);
    if (P.kind === 'wall') rows.push(['Palen', `${c.balken} × ${c.post.label} mm${c.grondpalen ? ', grondpalen' : ''}`]);
    if (P.kind === 'box') rows.push(['Wandlatten', `${c.sideLatten} per zijde${c.sideGap ? `, tussenafstand ${c.sideGap} mm` : ''}`],
      ['Staanders', `${c.sidePosts} per lange zijde, ${c.endPosts} per kopzijde, ${c.staander.label}`],
      ['Deksel', c.cover ? `${c.coverLatten} latten${c.coverGap ? `, tussenafstand ${c.coverGap} mm` : ''}` : 'geen']);
    if ('onderlatten' in c) rows.push(['Onderlatten', c.onderlatten ? `${c.onderlatten}` : 'geen']);
    rows.push(['Uitvoering', [c.heavy ? 'zwaar' : 'standaard', c.transpallet ? 'transpallet' : null].filter(Boolean).join(', ')],
      ['Nagelpunten', `${g.top.length} boven, ${g.bottom.length} onder, ${c.nails} nagels per punt`],
      ['Onderdelen', E.cutList(g).map(p => `${p.count}× ${p.label.toLowerCase()} ${p.length}×${p.width}×${p.thickness}`).join('; ')]);
    $('#summary').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
    const csvText = E.csv(c, g);
    $('#preview').textContent = csvText;
    renderSheet(csvText);
    draw(c, g);
    if (first) fitCamera(); else render();
  }

  // ---- downloads ----
  function save(name, text, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime })); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const fname = (c, g) => `${c.type}_${Math.round(g.outer.L)}x${Math.round(g.outer.W)}${g.box ? 'x' + Math.round(g.outer.H) : ''}${c.heavy ? '_zwaar' : ''}${c.transpallet ? '_transpallet' : ''}`;
  $('#download').addEventListener('click', () => { if (current) save(fname(current.c, current.g) + '.csv', E.csv(current.c, current.g), 'text/csv;charset=utf-8'); });
  $('#downloadJson').addEventListener('click', () => {
    if (!current) return;
    const { c, g, inp } = current;
    const out = { ...c, product: c.product.name, options: inp.options, footprint: g.footprint, outer: g.outer, totalHeight: g.height,
      cutList: E.cutList(g), parts: g.parts, joints: { top: g.top, bottom: g.bottom }, image: canvas.toDataURL('image/png') };
    save(fname(c, g) + '_config.json', JSON.stringify(out, null, 2), 'application/json');
  });

  // ---- toevoegen aan de offerte ----
  // De offerte zelf zit in assets/js/offerte.js; hier wordt alleen de huidige
  // configuratie omgezet in een regel die een mens kan lezen.
  const knopToevoegen = $('#toevoegen');
  if (knopToevoegen && window.Offerte) {
    knopToevoegen.addEventListener('click', () => {
      if (!current) return;
      const { c, g } = current;
      const aantal = Math.max(1, +($('#bestelAantal') || {}).value || 1);
      const maat = g.box
        ? `${g.outer.L} × ${g.outer.W} × ${Math.round(g.outer.H)} mm`
        : `${g.outer.L} × ${g.outer.W} mm`;
      /* "Afmeting" staat al als maat op de offerteregel; nog eens in de
         specificaties zou hem twee keer in de aanvraag zetten. */
      const specs = Array.from(document.querySelectorAll('#summary dt'))
        .map(dt => [dt.textContent, dt.nextElementSibling ? dt.nextElementSibling.textContent : ''])
        .filter(p => p[1] && p[0].trim() !== 'Afmeting');

      Offerte.voegToe({
        type: c.type,
        naam: c.product.name,
        maat: maat,
        aantal: aantal,
        opmerkingen: (($('#bestelOpmerking') || {}).value || '').trim(),
        bijlagen: Array.from((($('#bestelBijlage') || {}).files) || []).map(f => f.name),
        specs: specs,
        beeld: Offerte.miniatuur(canvas, 220)
      });

      const melding = $('#toegevoegdMelding');
      if (melding) {
        melding.textContent = `${aantal} × ${c.product.name} toegevoegd. U kunt nog een product configureren of naar uw offerte gaan.`;
        melding.classList.remove('hidden');
      }
      toonOfferteKnop();
    });
  }

  setType('PBL');
  toonOfferteKnop();                       // ook als de mand uit een vorig bezoek komt
  document.addEventListener('offerte:gewijzigd', toonOfferteKnop);
})();
