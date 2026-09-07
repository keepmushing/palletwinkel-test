/* =============================================================================
   't Palletje — de offertepagina zelf

   Toont wat er in het mandje van offerte.js zit, laat de bezoeker het aantal
   aanpassen of een regel weghalen, en zet regels plus formulier om in één
   leesbare aanvraag.

   Waarom hier geen fetch naar een server staat: die is er nog niet. De
   aanvraag opent daarom in het e-mailprogramma van de bezoeker, precies zoals
   op /offerte/. Zodra er een formulierdienst gekozen is, is dit het enige
   bestand dat aangepast moet worden — zoek op VERZENDEN hieronder.

   Werkt offerte.js niet (oude browser, privévenster), dan blijft de pagina
   staan op het lege-mandje-blok in plaats van stuk te gaan.
   ============================================================================= */

(function () {
  'use strict';

  if (!window.Offerte) return;

  var $ = function (s, w) { return (w || document).querySelector(s); };

  var leegBlok     = $('#leegBlok');
  var mandBlok     = $('#mandBlok');
  var gegevensBlok = $('#gegevensBlok');
  var bedanktBlok  = $('#bedanktBlok');
  var regelsVak    = $('#regels');
  var formulier    = $('#aanvraagformulier');

  if (!regelsVak || !formulier) return;

  var ONTVANGER = 'palettenopmaat@gmail.com';

  /* ---- de regels tonen -------------------------------------------------- */

  function toonRegels() {
    var regels = Offerte.regels();

    var leeg = regels.length === 0;
    leegBlok.hidden     = !leeg;
    mandBlok.hidden     = leeg;
    gegevensBlok.hidden = leeg;

    regelsVak.innerHTML = '';

    regels.forEach(function (r) {
      var kaart = document.createElement('article');
      kaart.className = 'offerteregel';

      var beeld = document.createElement('div');
      beeld.className = 'offerteregel-beeld';
      if (r.beeld) {
        var img = new Image();
        img.src = r.beeld;
        img.alt = r.naam;
        beeld.append(img);
      } else {
        beeld.textContent = r.type || '';
      }

      var body = document.createElement('div');
      body.className = 'offerteregel-body';

      var kop = document.createElement('h3');
      kop.textContent = r.naam;
      body.append(kop);

      if (r.maat) {
        var maat = document.createElement('p');
        maat.className = 'offerteregel-maat';
        maat.textContent = r.maat;
        body.append(maat);
      }

      if (r.specs && r.specs.length) {
        var dl = document.createElement('dl');
        dl.className = 'offerteregel-specs';
        r.specs.forEach(function (s) {
          var dt = document.createElement('dt'); dt.textContent = s[0];
          var dd = document.createElement('dd'); dd.textContent = s[1];
          dl.append(dt, dd);
        });
        body.append(dl);
      }

      if (r.opmerkingen) {
        var op = document.createElement('p');
        op.className = 'offerteregel-opmerking';
        op.textContent = r.opmerkingen;
        body.append(op);
      }

      if (r.bijlagen && r.bijlagen.length) {
        var bij = document.createElement('p');
        bij.className = 'offerteregel-bijlage';
        bij.textContent = 'Bijlage: ' + r.bijlagen.join(', ');
        body.append(bij);
      }

      var acties = document.createElement('div');
      acties.className = 'offerteregel-acties';

      var wrap = document.createElement('div');
      wrap.className = 'aantalveld';
      var lab = document.createElement('label');
      lab.textContent = 'Aantal';
      lab.htmlFor = 'aantal-' + r.id;
      var inp = document.createElement('input');
      inp.type = 'number'; inp.min = '1'; inp.step = '1';
      inp.id = 'aantal-' + r.id;
      inp.value = r.aantal;
      inp.addEventListener('change', function () {
        Offerte.wijzigAantal(r.id, inp.value);
        toonRegels();
      });
      wrap.append(lab, inp);

      var weg = document.createElement('button');
      weg.type = 'button';
      weg.className = 'linkweg';
      weg.textContent = 'Verwijderen';
      weg.addEventListener('click', function () {
        Offerte.verwijder(r.id);
        toonRegels();
      });

      acties.append(wrap, weg);
      kaart.append(beeld, body, acties);
      regelsVak.append(kaart);
    });
  }

  /* ---- bewaarde klantgegevens ------------------------------------------ */

  var VELDEN = ['naam', 'bedrijf', 'email', 'telefoon', 'btw',
                'factuurStraat', 'factuurPostcode', 'factuurGemeente', 'factuurLand',
                'leverStraat', 'leverPostcode', 'leverGemeente', 'leverLand', 'laadwijze'];

  function vulKlantIn() {
    var k = Offerte.klant();
    var vergeet = $('#vergeetmij');
    if (!k) { if (vergeet) vergeet.hidden = true; return; }

    VELDEN.forEach(function (naam) {
      var el = formulier.elements[naam];
      if (el && k[naam]) el.value = k[naam];
    });
    if (k.verzending) {
      var radio = formulier.querySelector('input[name="verzending"][value="' + k.verzending + '"]');
      if (radio) radio.checked = true;
    }
    if (typeof k.zelfdeAdres === 'boolean') $('#zelfdeAdres').checked = k.zelfdeAdres;
    $('#onthoud').checked = true;
    if (vergeet) vergeet.hidden = false;
    werkAdresBij();
  }

  function bewaarKlantAls() {
    if (!$('#onthoud').checked) return;
    var k = {};
    VELDEN.forEach(function (naam) {
      var el = formulier.elements[naam];
      if (el) k[naam] = el.value;
    });
    var r = formulier.querySelector('input[name="verzending"]:checked');
    k.verzending = r ? r.value : '';
    k.zelfdeAdres = $('#zelfdeAdres').checked;
    Offerte.bewaarKlant(k);
    $('#vergeetmij').hidden = false;
  }

  /* ---- leveradres tonen of verbergen ----------------------------------- */

  function werkAdresBij() {
    var bezorgen = formulier.querySelector('input[name="verzending"]:checked');
    bezorgen = !bezorgen || bezorgen.value === 'Bezorging';
    $('#leveradresBlok').hidden = !bezorgen;
    $('#leveradresVelden').hidden = !bezorgen || $('#zelfdeAdres').checked;
  }

  /* ---- de aanvraag als tekst ------------------------------------------- */

  function gegevens() {
    var g = {};
    var r = formulier.querySelector('input[name="verzending"]:checked');
    var bezorgen = !r || r.value === 'Bezorging';
    var zelfde = $('#zelfdeAdres').checked;

    g['Naam'] = formulier.elements.naam.value.trim();
    g['Bedrijf'] = formulier.elements.bedrijf.value.trim();
    g['E-mail'] = formulier.elements.email.value.trim();
    g['Telefoon'] = formulier.elements.telefoon.value.trim();
    g['BTW-nummer'] = formulier.elements.btw.value.trim();

    g['Facturatieadres'] = [
      formulier.elements.factuurStraat.value.trim(),
      (formulier.elements.factuurPostcode.value.trim() + ' ' + formulier.elements.factuurGemeente.value.trim()).trim(),
      formulier.elements.factuurLand.value.trim()
    ].filter(Boolean).join(', ');

    g['Verzendingsmethode'] = r ? r.value : 'Bezorging';

    if (bezorgen) {
      g['Leveringsadres'] = zelfde
        ? 'Zelfde als facturatieadres'
        : [
            formulier.elements.leverStraat.value.trim(),
            (formulier.elements.leverPostcode.value.trim() + ' ' + formulier.elements.leverGemeente.value.trim()).trim(),
            formulier.elements.leverLand.value.trim()
          ].filter(Boolean).join(', ');
    }

    g['Gewenste leverdatum'] = formulier.elements.leverdatum.value;
    g['Laden en lossen'] = formulier.elements.laadwijze.value;
    g['Bijzondere risico’s'] = formulier.elements.risico.value.trim();
    g['Opmerkingen'] = formulier.elements.bericht.value.trim();
    return g;
  }

  /* ---- controle --------------------------------------------------------- */

  function controleer() {
    var mist = [];
    formulier.querySelectorAll('[required]').forEach(function (el) {
      if (!el.value.trim()) {
        var lab = formulier.querySelector('label[for="' + el.id + '"]');
        mist.push(lab ? lab.textContent.replace(' *', '') : el.name);
      }
    });
    var mail = formulier.elements.email;
    if (mail.value.trim() && mail.value.indexOf('@') === -1) mist.push('een geldig e-mailadres');

    var vak = $('#fouten');
    if (mist.length) {
      vak.textContent = 'Nog in te vullen: ' + mist.join(', ') + '.';
      vak.hidden = false;
      var eerste = formulier.querySelector('[required]:invalid, [required][value=""]');
      (eerste || formulier.elements.naam).focus();
      return false;
    }
    vak.hidden = true;
    return true;
  }

  /* ---- VERZENDEN --------------------------------------------------------
     Het enige stuk dat verandert zodra er een formulierdienst is. Dan gaat de
     tekst hieronder als POST naar die dienst in plaats van naar een mailto.
     ----------------------------------------------------------------------- */

  formulier.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!controleer()) return;

    bewaarKlantAls();

    var tekst = Offerte.alsTekst(gegevens());
    var onderwerp = 'Offerte-aanvraag — ' +
      (formulier.elements.bedrijf.value.trim() || formulier.elements.naam.value.trim());

    $('#kopieTekst').value = tekst;
    mandBlok.hidden = true;
    gegevensBlok.hidden = true;
    bedanktBlok.hidden = false;
    bedanktBlok.scrollIntoView({ behavior: 'smooth', block: 'start' });

    /* mailto: heeft een praktische lengtegrens rond 2000 tekens. Is de
       aanvraag langer, dan gaat alleen de korte versie mee en staat de
       volledige tekst op de pagina om te kopiëren. */
    var body = tekst.length > 1800
      ? tekst.slice(0, 1700) + '\n\n[...] De volledige aanvraag staat op de webpagina, klaar om te kopiëren.'
      : tekst;

    window.location.href = 'mailto:' + ONTVANGER +
      '?subject=' + encodeURIComponent(onderwerp) +
      '&body=' + encodeURIComponent(body);
  });

  /* ---- de kleine knoppen ------------------------------------------------ */

  $('#leegmaken').addEventListener('click', function () {
    if (!window.confirm('Alle regels uit uw offerte verwijderen?')) return;
    Offerte.leeg();
    toonRegels();
  });

  $('#vergeetmij').addEventListener('click', function () {
    Offerte.vergeetKlant();
    $('#onthoud').checked = false;
    $('#vergeetmij').hidden = true;
  });

  $('#opnieuwTonen').addEventListener('click', function () {
    bedanktBlok.hidden = true;
    toonRegels();
    mandBlok.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('#kopieerKnop').addEventListener('click', function () {
    var vak = $('#kopieTekst');
    var melding = $('#kopieMelding');
    var klaar = function () {
      melding.textContent = 'Gekopieerd.';
      setTimeout(function () { melding.textContent = ''; }, 2500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(vak.value).then(klaar, function () { vak.select(); });
    } else {
      vak.select();
      try { document.execCommand('copy'); klaar(); } catch (err) {}
    }
  });

  formulier.querySelectorAll('input[name="verzending"]').forEach(function (r) {
    r.addEventListener('change', werkAdresBij);
  });
  $('#zelfdeAdres').addEventListener('change', werkAdresBij);

  /* ---- op gang brengen -------------------------------------------------- */

  toonRegels();
  vulKlantIn();
  werkAdresBij();
})();
