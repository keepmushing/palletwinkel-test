/* =============================================================================
   't Palletje — offertemandje

   Houdt bij wat een bezoeker aan zijn offerte toevoegt, en onthoudt zijn
   gegevens zodat een vaste klant ze niet elke keer opnieuw hoeft in te tikken.
   Alles staat in localStorage: geen server, geen cookies, en de gegevens
   verlaten deze browser niet.

   Twee sleutels:
     palletje-offerte   de regels van de offerte
     palletje-klant     naam, adres en contactgegevens, alleen als de bezoeker
                        daar zelf voor kiest ("Sla contactgegevens op")

   LET OP bij het opslaan van het 3D-beeld: een PNG uit het canvas is al snel
   200 kB, en localStorage houdt het rond 5 MB voor de hele site. Het beeld gaat
   daarom als JPEG van 220 px breed naar binnen, ongeveer 8 kB per regel.
   ============================================================================= */

(function (global) {
  'use strict';

  var SLEUTEL_OFFERTE = 'palletje-offerte';
  var SLEUTEL_KLANT   = 'palletje-klant';
  var MAX_REGELS      = 40;

  function lees(sleutel, terugval) {
    try {
      var ruw = localStorage.getItem(sleutel);
      return ruw ? JSON.parse(ruw) : terugval;
    } catch (e) {
      return terugval;
    }
  }

  function schrijf(sleutel, waarde) {
    try {
      localStorage.setItem(sleutel, JSON.stringify(waarde));
      return true;
    } catch (e) {
      /* Vol of geweigerd (privévenster). De offerte werkt dan nog binnen deze
         pagina, maar overleeft het verversen niet. */
      return false;
    }
  }

  /* ---- de regels ------------------------------------------------------- */

  function regels() {
    var r = lees(SLEUTEL_OFFERTE, []);
    return Array.isArray(r) ? r : [];
  }

  function bewaar(lijst) {
    schrijf(SLEUTEL_OFFERTE, lijst.slice(0, MAX_REGELS));
    meld();
  }

  function aantalRegels() {
    return regels().reduce(function (n, r) { return n + (+r.aantal || 1); }, 0);
  }

  function voegToe(regel) {
    var lijst = regels();
    lijst.push({
      id: 'r' + lijst.length + '-' + regel.type + '-' + (regel.maat || '').replace(/\s/g, ''),
      type: regel.type,
      naam: regel.naam,
      maat: regel.maat,
      aantal: Math.max(1, +regel.aantal || 1),
      opmerkingen: regel.opmerkingen || '',
      bijlagen: regel.bijlagen || [],
      specs: regel.specs || [],
      beeld: regel.beeld || ''
    });
    bewaar(lijst);
    return lijst.length;
  }

  function wijzigAantal(id, aantal) {
    var lijst = regels();
    for (var i = 0; i < lijst.length; i++) {
      if (lijst[i].id === id) { lijst[i].aantal = Math.max(1, +aantal || 1); break; }
    }
    bewaar(lijst);
  }

  function verwijder(id) {
    bewaar(regels().filter(function (r) { return r.id !== id; }));
  }

  function leeg() {
    bewaar([]);
  }

  /* ---- de klantgegevens ------------------------------------------------ */

  function klant() {
    return lees(SLEUTEL_KLANT, null);
  }

  function bewaarKlant(gegevens) {
    return schrijf(SLEUTEL_KLANT, gegevens);
  }

  function vergeetKlant() {
    try { localStorage.removeItem(SLEUTEL_KLANT); } catch (e) {}
  }

  /* ---- teller in de kop ------------------------------------------------ */

  function meld() {
    var n = aantalRegels();
    document.querySelectorAll('[data-offerte-teller]').forEach(function (el) {
      el.textContent = n;
      el.closest('[data-offerte-knop]')?.classList.toggle('leeg', n === 0);
    });
    document.dispatchEvent(new CustomEvent('offerte:gewijzigd', { detail: { aantal: n } }));
  }

  /* ---- het beeld verkleinen ------------------------------------------- */

  function miniatuur(canvas, breedte) {
    try {
      breedte = breedte || 220;
      var h = Math.round(canvas.height * breedte / canvas.width);
      var c = document.createElement('canvas');
      c.width = breedte; c.height = h;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#f6f6f4';
      ctx.fillRect(0, 0, breedte, h);
      ctx.drawImage(canvas, 0, 0, breedte, h);
      return c.toDataURL('image/jpeg', 0.72);
    } catch (e) {
      return '';
    }
  }

  /* ---- de aanvraag als leesbare tekst ---------------------------------- */

  function alsTekst(gegevens) {
    var uit = [];
    var lijst = regels();

    uit.push("OFFERTEAANVRAAG — 't Palletje");
    uit.push('');
    lijst.forEach(function (r, i) {
      uit.push((i + 1) + '. ' + r.naam + ' — ' + r.aantal + ' stuk' + (r.aantal > 1 ? 's' : ''));
      if (r.maat) uit.push('   Afmeting: ' + r.maat);
      (r.specs || []).forEach(function (s) { uit.push('   ' + s[0] + ': ' + s[1]); });
      if (r.opmerkingen) uit.push('   Opmerking: ' + r.opmerkingen);
      if (r.bijlagen && r.bijlagen.length) uit.push('   Bijlage(n): ' + r.bijlagen.join(', '));
      uit.push('');
    });

    if (gegevens) {
      uit.push('--- GEGEVENS ---');
      Object.keys(gegevens).forEach(function (k) {
        if (gegevens[k] !== '' && gegevens[k] != null && gegevens[k] !== false) {
          uit.push(k + ': ' + gegevens[k]);
        }
      });
      uit.push('');
    }

    var metBijlage = lijst.some(function (r) { return r.bijlagen && r.bijlagen.length; });
    if (metBijlage) {
      uit.push('LET OP: de genoemde bijlagen zitten niet automatisch bij deze mail.');
      uit.push('Voeg ze toe voor u verstuurt.');
    }
    return uit.join('\n');
  }

  global.Offerte = {
    regels: regels,
    aantal: aantalRegels,
    voegToe: voegToe,
    wijzigAantal: wijzigAantal,
    verwijder: verwijder,
    leeg: leeg,
    klant: klant,
    bewaarKlant: bewaarKlant,
    vergeetKlant: vergeetKlant,
    miniatuur: miniatuur,
    alsTekst: alsTekst,
    meld: meld
  };

  if (document.readyState !== 'loading') meld();
  else document.addEventListener('DOMContentLoaded', meld);
})(window);
