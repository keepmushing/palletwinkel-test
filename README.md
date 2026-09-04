# 't Palletje — website

Statische site. Geen build, geen dependencies, geen Node. Wat je hier ziet, is
wat de server serveert.

## De site lokaal bekijken

Dubbelklikken op `index.html` werkt **niet** goed: de pagina's linken naar
absolute paden (`/producten/`, `/contact/`). Start in plaats daarvan de
meegeleverde preview-server.

Rechtsklik op `serve.ps1` > **Uitvoeren met PowerShell**, of in een terminal:

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Open daarna <http://localhost:8080/>. Stoppen met Ctrl+C.

Zit poort 8080 al bezet, gebruik dan `-Port 8081`.

## Hosting

Deze repo *is* de site. De wortel van de repo is de webroot: `index.html` hoort
op `/` te staan.

- **Build command:** geen
- **Output directory:** `.` (de wortel zelf)
- **Node-versie:** niet van toepassing

Stond de hosting eerder ingesteld op een Next.js-build (`next build`, output
`.next`), dan moet die instelling uit. Er valt niets meer te bouwen.

## Mappen

```
palletwinkel/
  index.html              Homepage (NL)
  en/                     Engelse versie
  fr/                     Franse versie
  producten/              Overzicht + zes detailpagina's
  werkwijze/  realisaties/  over-ons/  faq/  contact/  offerte/
  privacy/  voorwaarden/  cookies/
  assets/
    css/site.css          Designsysteem — alle kleuren, maten en componenten
    js/site.js            Mobiele nav en footerjaartal. Meer niet.
    img/                  Foto's (WebP + JPG-fallback, 480/1024/1920 px)
    fonts/                Inter en IBM Plex Mono, lokaal gehost
  serve.ps1               Preview-server
```

## Regels bij het aanpassen

1. **Kleuren, maten en typografie komen uit `assets/css/site.css`.** Die waarden
   staan in doc 03 — BRAND & ASSETS. Verander ze daar eerst, dan hier. Schrijf
   nooit een losse hex-kleur in een HTML-bestand.

2. **Geel gemarkeerde tekst is nog niet bevestigd.** Alles met `class="ph"` of
   `class="ph-block"` komt uit doc 01 — FEITENDOSSIER en staat daar nog op
   TE BEVESTIGEN. Zolang die markering er staat, mag de pagina niet live.
   Zoek ze allemaal met: `findstr /s /c:"ph-block" *.html`

3. **Elke claim moet in doc 01 sectie H op JA staan.** Geen uitzonderingen.
   Raakt een claim niet bevestigd, dan verdwijnt hij — hij wordt niet vervangen
   door een vagere versie.

4. **Monospace (`class="spec"`) alleen voor maten, gewichten, aantallen en
   certificaatnummers.** Het werkt alleen zolang het niet overal staat.

5. **Elke pagina heeft één `<h1>`, een eigen `<title>` en een eigen
   `meta description`.** Eén pagina = één zoekintentie.

6. **Elke foto krijgt een beschrijvende bestandsnaam én alt-tekst vóór ze de
   site op gaat.** Formaat staat in doc 03. Achteraf toevoegen gebeurt nooit.

## Nog te doen vóór livegang

- [ ] Domein kiezen en `example.be` vervangen in alle `<link rel="canonical">`
      en `hreflang`-tags
- [ ] Logo in SVG, favicon (32, 180, SVG) en Open Graph-beeld 1200 × 630
- [ ] Inter en IBM Plex Mono downloaden naar `assets/fonts/` en `@font-face`
      toevoegen (nu valt de site terug op Segoe UI)
- [ ] Foto's uit de shotlist (doc 03)
- [ ] Formulier-backend: waar komt een inzending binnen? (doc 01, sectie J)
- [ ] Cookiebanner met gelijkwaardige knoppen Accepteren / Weigeren / Instellingen
- [ ] Privacybeleid, algemene voorwaarden, cookiebeleid
- [ ] `sitemap.xml` en `robots.txt`
- [ ] EN- en FR-copy laten nakijken door een moedertaalspreker
