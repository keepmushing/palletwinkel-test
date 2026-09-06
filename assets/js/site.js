/* ==========================================================
   't Palletje — sitebrede JavaScript
   Overgenomen uit palletje-home-v43-logo90.html, met één
   verschil: elk onderdeel controleert eerst of het op deze
   pagina bestaat. Zo draait hetzelfde bestand op de homepage
   én op elke subpagina zonder fouten.
   ========================================================== */
(function () {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ====== 1. CONFIGURATOR — pas deze twee regels aan en alle knoppen kloppen ====== */
  const CONFIGURATOR_URL = "/configurator/";
  const PRODUCT_PARAM    = "product";   // wordt CONFIGURATOR_URL?product=pallet

  $$('a.cfg').forEach(a => {
    const p = a.dataset.product;
    a.href = p ? `${CONFIGURATOR_URL}?${PRODUCT_PARAM}=${encodeURIComponent(p)}` : CONFIGURATOR_URL;
  });

  /* ====== 2. mobiel menu ====== */
  const burger = $('#burger'), menu = $('#menu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    $$('a', menu).forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ====== 3. dropdown — werkt met muis, toetsenbord en op mobiel ====== */
  const ddBtn = $('#ddBtn'), ddMenu = $('#ddMenu');
  if (ddBtn && ddMenu) {
    const closeDd = () => { ddMenu.classList.remove('open'); ddBtn.setAttribute('aria-expanded', 'false'); };
    ddBtn.addEventListener('click', e => {
      e.stopPropagation();
      const open = ddMenu.classList.toggle('open');
      ddBtn.setAttribute('aria-expanded', open);
    });
    ddBtn.parentElement.addEventListener('mouseenter', () => { if (window.innerWidth > 820) { ddMenu.classList.add('open'); ddBtn.setAttribute('aria-expanded', 'true'); } });
    ddBtn.parentElement.addEventListener('mouseleave', () => { if (window.innerWidth > 820) closeDd(); });
    document.addEventListener('click', closeDd);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDd(); });
  }

  /* ====== 4. dialogen — vervallen ==============================================
     De productmodals uit het ontwerp zijn echte pagina's geworden, dus er staan
     nergens nog [data-dialog]- of [data-close]-knoppen in de HTML. Het enige
     dialoogvenster dat overblijft is het fotoalbum (#lightbox); dat opent en
     sluit zichzelf in blok 6. Een algemene dialooglus hier hing daar enkel een
     tweede, identieke achtergrondsluiter bovenop.
     ========================================================================== */

  /* ====== 4b. een link naar een FAQ-antwoord opent dat antwoord ====== */
  function openFaq() {
    let el = null;
    try { el = location.hash ? document.querySelector(location.hash) : null; } catch (e) { return; }
    if (el && el.tagName === 'DETAILS') { el.open = true; el.scrollIntoView({ block: 'center' }); }
  }
  $$('a[href^="#"]').forEach(a => {
    let doel = null;
    try { doel = document.querySelector(a.getAttribute('href') || '#geen'); } catch (e) { return; }
    if (doel && doel.tagName === 'DETAILS') a.addEventListener('click', () => { doel.open = true; });
  });
  window.addEventListener('hashchange', openFaq);
  openFaq();

  /* ====== 4c. zoekfunctie ======================================================
     De index bestaat uit twee delen:
     1. wat op deze pagina staat (kaarten, diensten, stappen, vragen) — zo blijft
        hij kloppen wanneer je teksten aanpast;
     2. een vaste lijst van alle pagina's, zodat je vanaf elke pagina de hele
        site doorzoekt. Nieuwe pagina toegevoegd? Zet ze in PAGINAS hieronder.
     ========================================================================== */
  const PAGINAS = [
    { soort: 'Pagina',  titel: 'Home', tekst: "Startpagina van 't Palletje: pallets, kisten, glasbokken, opzetranden en houten transportoplossingen op maat.", url: '/' },
    { soort: 'Product', titel: 'Pallets op maat', tekst: 'Blokpallet of balkpallet, elke afmeting en elke belasting. Voor intern transport, verzending en herhaalbare logistiek.', url: '/producten/pallet-op-maat/' },
    { soort: 'Product', titel: 'Kisten en kratten', tekst: 'Open of gesloten houten verpakking, afgestemd op product en toepassing. Stapelbaar, nestbaar, met deksel of scharnieren.', url: '/producten/kisten-en-kratten/' },
    { soort: 'Product', titel: 'Exportkisten', tekst: 'Houten exportkisten met ISPM-15-markering onder onze eigen registratie, voor zendingen buiten de Europese Unie.', url: '/producten/exportkisten/' },
    { soort: 'Product', titel: 'Glasbokken', tekst: 'Voor glas dat niet mag breken, verschuiven of beschadigen. Van standaard bokken tot multiplex bakjes op klanttekening.', url: '/producten/glasbokken/' },
    { soort: 'Product', titel: 'Palletranden en opzetranden', tekst: 'Standaard en op maat gemaakte randen om palletlading te verhogen, af te schermen en stapelbaar te maken.', url: '/producten/opzetranden/' },
    { soort: 'Product', titel: 'Hout en plaatmateriaal op maat', tekst: 'Houten vloer- en wandpanelen uit pallethout. Voor een tijdelijk terras, een werfvloer of een overbrugging van ruw terrein.', url: '/producten/hout-en-plaatmateriaal/' },
    { soort: 'Product', titel: 'Houten constructies op maat', tekst: 'Skids, transportwiegen, machineverpakking, verdeelbakjes en inlays voor kwetsbare onderdelen.', url: '/producten/houten-constructies-op-maat/' },
    { soort: 'Pagina',  titel: 'Alle producten', tekst: 'Overzicht van alles wat wij maken: pallets, kisten, kratten, exportkisten, glasbokken, opzetranden, platen en constructies.', url: '/producten/' },
    { soort: 'Pagina',  titel: 'Configurator', tekst: 'Stel zelf uw pallet, kist, krat, houten vloer of wand samen. Met 3D-weergave en een bestand voor de zagerij.', url: '/configurator/' },
    { soort: 'Pagina',  titel: 'Werkwijze', tekst: 'Van vraag naar veilige oplossing: u bezorgt de info, wij bezorgen een voorstel, produceren en leveren.', url: '/werkwijze/' },
    { soort: 'Pagina',  titel: 'Realisaties', tekst: 'Bewijs uit de praktijk. Glasbakjes voor restauratieglas, exportkisten, skids en maatwerkconstructies.', url: '/realisaties/' },
    { soort: 'Pagina',  titel: 'Over ons', tekst: 'Houten transportoplossingen op maat uit Wingene. Technisch genoeg om mee te denken, praktisch genoeg om vooruit te gaan.', url: '/over-ons/' },
    { soort: 'Pagina',  titel: 'Veelgestelde vragen', tekst: 'Prijs en offerte, kiezen en afmetingen, bestellen, levering, laden en lossen, verpakken, export en hergebruik.', url: '/faq/' },
    { soort: 'Pagina',  titel: 'Contact', tekst: 'Morellestraat 1, 8750 Wingene. Bel 0499 19 68 02 of mail info@palletje.be.', url: '/contact/' },
    { soort: 'Pagina',  titel: 'Offerte aanvragen', tekst: 'Stuur uw project door met maten, gewicht, aantal en bestemming. Een foto of tekening erbij versnelt alles.', url: '/offerte/' },
    { soort: 'Onderwerp', titel: 'ISPM-15 en export', tekst: 'Exportkisten met onze eigen ISPM-15-markering. Wij kopen behandeld hout aan, produceren zelf en merken onder onze eigen registratie.', url: '/#ispm15' },
    { soort: 'Onderwerp', titel: 'PPWR-beslisroute', tekst: 'Welke PPWR-route past bij uw onderneming? Loop de vragen door en zie welke beslissingen u moet nemen en welke documentatie wij kunnen aanleveren.', url: '/ppwr/' },
    { soort: 'Onderwerp', titel: 'Diensten', tekst: 'Verpakkingsontwikkeling, prototyping, kleine testseries, R en D, verpakken in ons atelier, op locatie of inclusief levering.', url: '/#diensten' },
    { soort: 'Pagina',  titel: 'English', tekst: 'Wooden transport solutions made to measure: pallets, crates, export boxes, glass racks.', url: '/en/' },
    { soort: 'Pagina',  titel: 'Francais', tekst: 'Solutions de transport en bois sur mesure: palettes, caisses, caisses export, chevalets a verre.', url: '/fr/' },
    { soort: 'Pagina',  titel: 'Privacyverklaring', tekst: 'Hoe wij met uw gegevens omgaan.', url: '/privacy/' },
    { soort: 'Pagina',  titel: 'Cookiebeleid', tekst: 'Welke cookies deze site gebruikt.', url: '/cookies/' },
    { soort: 'Pagina',  titel: 'Algemene voorwaarden', tekst: 'De voorwaarden bij onze offertes en leveringen.', url: '/voorwaarden/' }
  ];

  const zoekknop = $('#zoekknop'), zoekbalk = $('#zoekbalk'),
        zoekveld = $('#zoekveld'), zoeklijst = $('#zoekresultaten');

  if (zoekknop && zoekbalk && zoekveld && zoeklijst) {
    const index = [];
    const kort = t => t.replace(/\s+/g, ' ').trim();

    /* --- wat op deze pagina staat --- */
    $$('#producten .card').forEach(c => index.push({
      soort: 'Product', titel: kort(c.querySelector('h3').textContent),
      tekst: kort(c.querySelector('p').textContent), doel: '#producten'
    }));
    $$('.service').forEach(s => index.push({
      soort: 'Dienst', titel: kort(s.querySelector('h3').textContent),
      tekst: kort(s.querySelector('p').textContent), doel: '#diensten'
    }));
    $$('#duurzaamheid .path, #werkwijze .step').forEach(s => index.push({
      soort: s.closest('#werkwijze') ? 'Werkwijze' : 'Regelgeving',
      titel: kort(s.querySelector('h3').textContent),
      tekst: kort(s.textContent).slice(0, 160),
      doel: s.closest('#werkwijze') ? '#werkwijze' : '#' + (s.id || 'duurzaamheid')
    }));
    $$('.faq details').forEach(dt => index.push({
      soort: 'Vraag', titel: kort(dt.querySelector('summary').textContent),
      tekst: kort((dt.querySelector('.faq-copy') || dt.querySelector('p') || dt).textContent),
      doel: '#faq', details: dt
    }));
    [['#ispm15', 'Export', 'Exportkisten met onze eigen ISPM-15-markering'],
     ['#realisaties', 'Realisatie', 'Precisie voor restauratieglas'],
     ['#contact', 'Contact', 'Liever meteen iemand spreken?'],
     ['#over-ons', 'Over ons', 'Technisch genoeg om mee te denken']].forEach(([doel, soort, titel]) => {
      const el = $(doel); if (!el) return;
      index.push({ soort, titel, tekst: kort(el.textContent).slice(0, 160), doel });
    });
    $$('.sector-list li').forEach(li => index.push({
      soort: 'Sector', titel: kort(li.textContent), tekst: 'Wij werken voor deze sector.', doel: '#producten'
    }));

    /* --- en de rest van de site --- */
    const alHier = new Set(index.map(i => i.titel.toLowerCase()));
    PAGINAS.forEach(p => { if (!alHier.has(p.titel.toLowerCase())) index.push(p); });

    const accentloos = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const veilig = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    function markeer(tekst, term) {
      const i = accentloos(tekst).indexOf(term);
      if (i < 0) return veilig(tekst.slice(0, 90)) + (tekst.length > 90 ? '…' : '');
      const start = Math.max(0, i - 30);
      return (start ? '…' : '') + veilig(tekst.slice(start, i)) +
        '<mark>' + veilig(tekst.slice(i, i + term.length)) + '</mark>' +
        veilig(tekst.slice(i + term.length, i + term.length + 60)) + '…';
    }

    function zoek() {
      const term = accentloos(zoekveld.value.trim());
      zoeklijst.innerHTML = '';
      if (term.length < 2) return;
      const treffers = index.map(it => {
        const t = accentloos(it.titel), x = accentloos(it.tekst);
        let score = 0;
        if (t.startsWith(term)) score = 3; else if (t.includes(term)) score = 2; else if (x.includes(term)) score = 1;
        return { it, score };
      }).filter(r => r.score).sort((a, b) => b.score - a.score).slice(0, 7);

      if (!treffers.length) {
        const leeg = document.createElement('li');
        leeg.className = 'zoekleeg';
        leeg.textContent = 'Niets gevonden. Probeer bijvoorbeeld kist, ISPM, glas of levertermijn.';
        zoeklijst.append(leeg);
        return;
      }
      treffers.forEach(({ it }) => {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.innerHTML = `<span class="soort">${veilig(it.soort)}</span><span class="titel">${veilig(it.titel)}</span>` +
                      `<span class="fragment">${markeer(it.tekst, term)}</span>`;
        b.addEventListener('click', () => {
          sluitZoek();
          if (it.url) { location.href = it.url; return; }
          if (it.details) { it.details.hidden = false; it.details.open = true; }
          const doel = $(it.doel);
          if (doel) doel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (it.details) setTimeout(() => it.details.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350);
        });
        li.append(b); zoeklijst.append(li);
      });
    }
    function openZoek() {
      zoekbalk.classList.add('open');
      zoekknop.setAttribute('aria-expanded', 'true');
      zoekveld.focus();
    }
    function sluitZoek() {
      zoekbalk.classList.remove('open');
      zoekknop.setAttribute('aria-expanded', 'false');
      zoekveld.value = ''; zoeklijst.innerHTML = '';
    }
    let hoverMoment = 0;
    zoekknop.addEventListener('mouseenter', () => {
      if (window.innerWidth > 820 && !zoekbalk.classList.contains('open')) { hoverMoment = Date.now(); openZoek(); }
    });
    zoekknop.addEventListener('click', e => {
      e.stopPropagation();
      // net door de muisbeweging geopend? dan niet meteen weer sluiten
      if (Date.now() - hoverMoment < 600) { zoekveld.focus(); return; }
      zoekbalk.classList.contains('open') ? sluitZoek() : openZoek();
    });
    const zoeksluit = $('#zoeksluit');
    if (zoeksluit) zoeksluit.addEventListener('click', sluitZoek);
    zoekveld.addEventListener('input', zoek);
    zoekbalk.addEventListener('click', e => e.stopPropagation());
    document.addEventListener('click', () => { if (zoekbalk.classList.contains('open')) sluitZoek(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && zoekbalk.classList.contains('open')) sluitZoek(); });
  }

  /* ====== 4d. Vraagbaak: themas, zoeken en vaste antwoordlinks ====== */
  (function () {
    const root = $('#faq');
    if (!root) return;
    const items = $$('details', root);
    const query = $('#faq-query', root), clear = $('#faq-clear', root);
    const buttons = $$('[data-topic-button]', root), heading = $('#faq-heading', root),
          status = $('#faq-status', root), reset = $('#faq-reset', root);
    const controls = $('.faq-controls', root), leeg = $('#faq-empty', root);
    if (!items.length || !query || !buttons.length || !heading || !status) return;

    let selected = null;
    const normalize = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const synonyms = { bache: 'zijkant', schuifzeil: 'zijkant', meubelbak: 'gesloten vrachtwagen', camionette: 'bestelwagen', kabinet: 'bestelwagen', remorque: 'aanhangwagen', laadkai: 'laadkade', laadkaai: 'laadkade', palletwagen: 'transpallet', leveringstermijn: 'levertijd', levertermijn: 'levertijd', kostprijs: 'prijs' };
    const searchable = new Map(items.map(d => {
      const knop = buttons[Number(d.dataset.topic)];
      const kop = d.querySelector('summary'), body = d.querySelector('.faq-copy');
      return [d, normalize((kop ? kop.textContent : '') + ' ' + (body ? body.textContent : '') + ' ' + (knop ? knop.textContent : ''))];
    }));

    function render() {
      const raw = normalize(query.value.trim());
      const terms = raw.split(/\s+/).filter(Boolean).flatMap(t => (synonyms[t] || t).split(' '));
      let count = 0;
      items.forEach(d => {
        const show = raw ? terms.every(t => searchable.get(d).includes(t))
                         : (selected === null ? d.dataset.popular === 'true' : d.dataset.topic === selected);
        d.hidden = !show; if (!show) d.open = false; if (show) count++;
      });
      buttons.forEach(b => b.setAttribute('aria-pressed', String(!raw && b.dataset.topicButton === selected)));
      const gekozen = buttons.find(b => b.dataset.topicButton === selected);
      heading.textContent = raw ? 'Zoekresultaten' : selected === null ? 'Vaak gevraagd' : gekozen.querySelector('strong').textContent;
      status.textContent = raw ? count + ' ' + (count === 1 ? 'antwoord gevonden' : 'antwoorden gevonden')
                               : selected === null ? 'Drie veelgestelde vragen om mee te starten.' : count + ' vragen over dit thema.';
      if (clear) clear.hidden = !query.value;
      if (reset) reset.hidden = !raw && selected === null;
      if (leeg) leeg.hidden = count !== 0;
    }
    function setHash(hash) { try { history.replaceState(null, '', location.pathname + location.search + hash); } catch (e) { /* preview mag history blokkeren */ } }
    buttons.forEach(b => b.addEventListener('click', () => { selected = b.dataset.topicButton; query.value = ''; items.forEach(d => d.open = false); setHash('#faq'); render(); }));
    query.addEventListener('input', () => { setHash('#faq'); render(); });
    if (clear) clear.addEventListener('click', () => { query.value = ''; render(); query.focus(); });
    if (reset) reset.addEventListener('click', () => { selected = null; query.value = ''; items.forEach(d => d.open = false); setHash('#faq'); render(); });

    function openTarget(scroll = true) {
      let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) { return; }
      const d = document.getElementById(id);
      if (!d || !items.includes(d)) return;
      query.value = ''; selected = d.dataset.topic; render();
      items.forEach(other => other.open = other === d);
      if (scroll) requestAnimationFrame(() => d.scrollIntoView({ block: 'center', behavior: 'auto' }));
    }
    items.forEach(d => d.addEventListener('toggle', () => {
      if (d.open && !d.hidden) { items.forEach(other => { if (other !== d) other.open = false; }); setHash('#' + d.id); }
    }));
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#faq-"]'); if (!a) return;
      const id = a.getAttribute('href').slice(1);
      if (!items.some(d => d.id === id)) return;
      e.preventDefault(); setHash('#' + id); openTarget();
    });
    window.addEventListener('hashchange', () => openTarget());
    $$('[data-copy]', root).forEach(b => b.addEventListener('click', async () => {
      const url = new URL(location.href); url.hash = b.dataset.copy;
      const msg = $('#faq-copy-status', root);
      try {
        if (!navigator.clipboard) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(url.href);
        if (msg) msg.textContent = 'Link gekopieerd.';
        b.textContent = 'Gekopieerd'; setTimeout(() => b.textContent = 'Kopieer link', 2000);
      } catch (e) {
        setHash('#' + b.dataset.copy);
        if (msg) msg.textContent = 'Kopieer de link uit de adresbalk of via Link naar dit antwoord.';
        b.textContent = 'Kopieer via adresbalk';
      }
    }));
    if (controls) controls.hidden = false;
    render(); openTarget();
  })();

  /* ====== 5. actief menu-item tijdens scrollen (alleen op de homepage) ====== */
  if (document.body.dataset.pagina === 'home' && 'IntersectionObserver' in window) {
    const secties = ['producten', 'diensten', 'werkwijze', 'faq', 'contact'];
    const waarnemer = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        $$('.links > a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-75px 0px -70% 0px' });
    secties.forEach(id => { const el = document.getElementById(id); if (el) waarnemer.observe(el); });
  }

  /* ====== 6. FOTOS ============================================================
     Hier zet je de foto's per product. Leg de bestanden in /assets/img/.
     Bestaat een bestand nog niet, dan toont de site automatisch een blauw vlak
     met het bijschrift — de site blijft dus werken terwijl je foto's verzamelt.
     ========================================================================== */
  const ALBUMS = {
    pallets: { titel: 'Pallets op maat', pagina: '/producten/pallet-op-maat/', fotos: [
      { src: '/assets/img/pallet-op-maat-1.jpg', bijschrift: 'Pallet op maat — 1200 × 800 mm' },
      { src: '/assets/img/pallet-op-maat-2.jpg', bijschrift: 'Zware pallet voor machinetransport' },
      { src: '/assets/img/pallet-op-maat-3.jpg', bijschrift: 'Serieproductie, klaar voor verzending' }
    ]},
    kisten: { titel: 'Kisten & kratten', pagina: '/producten/kisten-en-kratten/', fotos: [
      { src: '/assets/img/kist-1.jpg', bijschrift: 'Gesloten exportkist met ISPM-15-merk' },
      { src: '/assets/img/kist-2.jpg', bijschrift: 'Open krat met deksel' },
      { src: '/assets/img/kist-3.jpg', bijschrift: 'Kist in opbouw in het atelier' }
    ]},
    glas: { titel: 'Glasbokken', pagina: '/producten/glasbokken/', fotos: [
      { src: '/assets/img/glasbok-1.jpg', bijschrift: 'Glasbok op maat' },
      { src: '/assets/img/glasbok-2.jpg', bijschrift: 'Multiplex glasbakjes voor restauratieglas' },
      { src: '/assets/img/glasbok-3.jpg', bijschrift: 'Beladen bok, klaar voor transport' }
    ]},
    randen: { titel: 'Palletranden / opzetranden', pagina: '/producten/opzetranden/', fotos: [
      { src: '/assets/img/opzetrand-1.jpg', bijschrift: 'Opzetrand op europallet' },
      { src: '/assets/img/opzetrand-2.jpg', bijschrift: 'Gestapelde randen' }
    ]},
    platen: { titel: 'Hout en platen op maat', pagina: '/producten/hout-en-plaatmateriaal/', fotos: [
      { src: '/assets/img/platen-1.jpg', bijschrift: 'Tijdelijk terras in pallethout' },
      { src: '/assets/img/platen-2.jpg', bijschrift: 'Werfvloer over ruw terrein' },
      { src: '/assets/img/platen-3.jpg', bijschrift: 'Wandpanelen' }
    ]},
    constructies: { titel: 'Constructies op maat', pagina: '/producten/houten-constructies-op-maat/', fotos: [
      { src: '/assets/img/constructie-1.jpg', bijschrift: 'Skid voor zware machine' },
      { src: '/assets/img/constructie-2.jpg', bijschrift: 'Transportwieg' },
      { src: '/assets/img/constructie-3.jpg', bijschrift: 'Verdeelbakjes voor onderdelen' }
    ]}
  };

  const pijl = r => `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${r < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg>`;

  /* --- carrousel op elke productkaart --- */
  $$('.photo[data-album]').forEach(vak => {
    const album = ALBUMS[vak.dataset.album];
    if (!album) return;
    let i = 0;

    album.fotos.forEach((f, n) => {
      const s = document.createElement('div');
      s.className = 'slide' + (n === 0 ? ' on' : '');
      const img = new Image();
      img.src = f.src; img.alt = f.bijschrift; img.loading = n === 0 ? 'eager' : 'lazy';
      img.onerror = () => img.remove();          // geen bestand? dan blijft het blauwe vlak staan
      s.append(img);
      const bs = document.createElement('span');
      bs.className = 'bijschrift'; bs.textContent = f.bijschrift;
      s.append(bs);
      vak.append(s);
    });

    function toon(n) {
      const s = vak.querySelectorAll('.slide'), d = vak.querySelectorAll('.dots button');
      i = (n + s.length) % s.length;
      s.forEach((el, k) => el.classList.toggle('on', k === i));
      d.forEach((el, k) => el.classList.toggle('on', k === i));
    }

    if (album.fotos.length > 1) {
      ['prev', 'next'].forEach((r, n) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'photo-nav ' + r;
        b.setAttribute('aria-label', r === 'prev' ? 'Vorige foto' : 'Volgende foto');
        b.innerHTML = pijl(n === 0 ? -1 : 1);
        b.onclick = e => { e.stopPropagation(); toon(i + (n === 0 ? -1 : 1)); };
        vak.append(b);
      });
      const dots = document.createElement('div'); dots.className = 'dots';
      album.fotos.forEach((_, n) => {
        const d = document.createElement('button');
        d.type = 'button'; d.setAttribute('aria-label', `Foto ${n + 1}`);
        if (n === 0) d.classList.add('on');
        d.onclick = e => { e.stopPropagation(); toon(n); };
        dots.append(d);
      });
      vak.append(dots);
    }
  });

  /* --- het fotoalbum (lightbox) --- */
  const lb = $('#lightbox');
  if (lb) {
    let lbFotos = [], lbI = 0, lbTitelTekst = '';

    function lbToon(n) {
      if (!lbFotos.length) return;
      lbI = (n + lbFotos.length) % lbFotos.length;
      const f = lbFotos[lbI];
      const stage = $('#lbStage', lb);
      stage.innerHTML = '';
      const img = new Image();
      img.src = f.src; img.alt = f.bijschrift;
      img.onerror = () => {
        img.remove();
        const leegvak = document.createElement('div');
        leegvak.className = 'lb-leeg';
        leegvak.innerHTML = 'Hier komt de foto<br><small></small>';
        leegvak.querySelector('small').textContent = f.src;
        stage.append(leegvak);
      };
      stage.append(img);
      $('#lbTitel', lb).textContent = lbTitelTekst;
      $('#lbBijschrift', lb).textContent = f.bijschrift;
      $('#lbTeller', lb).textContent = `${lbI + 1} / ${lbFotos.length}`;
      $$('.lb-nav', lb).forEach(b => b.hidden = lbFotos.length < 2);
    }
    function lbOpen(slug) {
      const a = ALBUMS[slug]; if (!a) return;
      lbFotos = a.fotos; lbTitelTekst = a.titel;
      const meer = $('#lbMeer', lb);
      if (meer) { meer.href = a.pagina || '/producten/'; meer.hidden = false; }
      lbToon(0); lb.showModal();
    }
    $$('[data-album-open]').forEach(b => b.addEventListener('click', () => lbOpen(b.dataset.albumOpen)));
    $$('[data-lb]', lb).forEach(b => b.addEventListener('click', () => lbToon(lbI + Number(b.dataset.lb))));
    const sluit = $('[data-lb-sluit]', lb);
    if (sluit) sluit.addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    document.addEventListener('keydown', e => {
      if (!lb.open) return;
      if (e.key === 'ArrowLeft') lbToon(lbI - 1);
      if (e.key === 'ArrowRight') lbToon(lbI + 1);
    });
  }

  /* ====== 7. jaartal in de voettekst ====== */
  $$('[data-year], [data-jaar]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ====== 8. projectformulier ==================================================
     Er is nog geen server die inzendingen opvangt (README, "Formulier-backend").
     Zonder deze afhandeling levert de knop niets op: de hosting stuurt een POST
     gewoon dezelfde pagina terug, met status 200. De bezoeker denkt dan dat zijn
     aanvraag verstuurd is terwijl er niets gebeurd is.

     Zolang de backend er niet is, zetten we de ingevulde velden om in een
     e-mail die in het mailprogramma van de bezoeker opengaat. Niet elegant,
     wel eerlijk: hij ziet wat er verstuurd wordt en aan wie.

     Komt er een echte backend? Verwijder dan dit hele blok en zet het juiste
     adres in het action-attribuut van het formulier.
     ========================================================================== */
  const ONTVANGER = 'info@palletje.be';
  $$('form#projectformulier').forEach(formulier => {
    const melding = document.createElement('p');
    melding.className = 'hint';
    melding.setAttribute('role', 'status');
    melding.setAttribute('aria-live', 'polite');
    formulier.append(melding);

    formulier.addEventListener('submit', ev => {
      ev.preventDefault();
      if (!formulier.reportValidity()) return;

      const regels = [];
      $$('input, select, textarea', formulier).forEach(veld => {
        if (!veld.name || veld.type === 'file') return;
        const label = formulier.querySelector('label[for="' + veld.id + '"]');
        const naam = label ? label.textContent.replace('*', '').trim() : veld.name;
        const waarde = (veld.value || '').trim();
        if (waarde) regels.push(naam + ': ' + waarde);
      });

      const bestand = $('input[type=file]', formulier);
      if (bestand && bestand.files && bestand.files.length) {
        regels.push('', 'Bijlagen (voeg ze toe in uw e-mail): ' +
          Array.from(bestand.files).map(f => f.name).join(', '));
      }

      const onderwerp = 'Projectaanvraag via de website';
      const body = regels.join('\n') + '\n\n— verstuurd via palletje.be';
      location.href = 'mailto:' + ONTVANGER +
        '?subject=' + encodeURIComponent(onderwerp) +
        '&body=' + encodeURIComponent(body);

      melding.textContent = 'Uw aanvraag staat klaar in uw e-mailprogramma. ' +
        (bestand && bestand.files && bestand.files.length ? 'Voeg daar uw bestand nog toe en verstuur de mail. ' : 'Verstuur de mail om ze bij ons te krijgen. ') +
        'Gaat er niets open? Mail dan rechtstreeks naar ' + ONTVANGER + ' of bel 0499 19 68 02.';
    });
  });
})();
