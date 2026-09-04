/* 't Palletje — minimale interactie. Geen framework, geen dependencies.
   Alles wat hier staat, moet werken als JS uitvalt: de site is bruikbaar
   zonder dit bestand. */

(function () {
  'use strict';

  /* --- Mobiele navigatie ------------------------------------------------ */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    // Pas verbergen zodra JS draait. Zonder JS blijft de nav gewoon zichtbaar.
    // Moet gelijk lopen met het breekpunt in site.css (.nav-toggle).
    var mq = window.matchMedia('(max-width: 980px)');

    var close = function () {
      nav.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    };

    var open = function () {
      nav.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
    };

    var sync = function () {
      if (mq.matches) { close(); } else { nav.hidden = false; toggle.setAttribute('aria-expanded', 'false'); }
    };

    sync();
    mq.addEventListener('change', sync);

    toggle.addEventListener('click', function () {
      if (nav.hidden) { open(); } else { close(); }
    });

    // Sluiten na een keuze, en met Escape.
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && mq.matches) { close(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mq.matches && !nav.hidden) { close(); toggle.focus(); }
    });
  }

  /* --- Jaartal in de footer -------------------------------------------- */
  var y = document.querySelectorAll('[data-year]');
  for (var i = 0; i < y.length; i++) { y[i].textContent = new Date().getFullYear(); }
})();
