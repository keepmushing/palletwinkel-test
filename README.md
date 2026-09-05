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

Deze repo *is* de site. De HTML-bestanden zijn de bron; er wordt niets gebouwd.

De hosting (Hostinger, `palletwinkel.com`) draait echter een **Node-webapp**, geen
gewone statische hosting. Die verwacht een `package.json` en een startbestand.
Daarom staan er twee bestanden in deze map die met de site zelf niets te maken
hebben:

- `package.json` — geen enkele dependency, geen buildstap. Enkel
  `"start": "node server.js"`.
- `server.js` — een fikse vijftig regels die de bestanden in deze map
  uitserveren. Gedraagt zich gelijk aan `serve.ps1`, de lokale preview.

### Waarom het buildscript de site naar `.next` kopieert

De webapp staat bij Hostinger vastgepind op framework **Next.js** en dat is daar
niet te wijzigen — de wizard onder `Change repository` loopt vast op een
netwerkfout. Hostinger serveert bij zo'n framework de **uitvoermap** als
statische bestanden, en voor Next.js is dat `.next`. Een statische site maakt
die map nooit aan, dus faalde elke deploy op
`ERROR: No output directory found after build`. En de geslaagde deploy van
augustus serveerde een `.next` zonder `index.html` in de wortel — vandaar
maandenlang een 403.

Daarom kopieert het buildscript de site naar `.next`. Er wordt nog steeds niets
gecompileerd; het is letterlijk `cp -R`. `.next/` staat in `.gitignore` en komt
dus niet in de repo. `package.json`, `server.js`, `serve.ps1` en `README.md`
worden er weer uit gehaald, zodat die niet publiek geserveerd worden.

**Dit is een omweg, geen oplossing.** Zodra de frameworkinstelling op `Other`
gezet kan worden — Deployments > Deployment settings, build command leeg,
output directory `.` — mag het buildscript weg.

**Verhuis je later naar gewone statische hosting** (of naar Hostingers
`Advanced > Git` op een PHP/HTML-website), dan mogen die twee bestanden weg.
Zet dan: build command = geen, output directory = `.`. Aan de HTML verandert er
niets.

## Mappen

```
palletwinkel/
  index.html              Homepage (NL)
  en/                     Engelse versie
  fr/                     Franse versie
  producten/              Overzicht + zeven detailpagina's
  werkwijze/  realisaties/  over-ons/  faq/  contact/  offerte/
  privacy/  voorwaarden/  cookies/
  assets/
    css/site.css          Designsysteem — alle kleuren, maten en componenten
    js/site.js            Mobiele nav en footerjaartal. Meer niet.
    img/                  Foto's (WebP + JPG-fallback, 480/1024/1920 px)
    fonts/                Leeg. De site draait bewust op Arial — zie site.css.
  404.html                Foutpagina, in dezelfde stijl
  sitemap.xml  robots.txt  Voor zoekmachines
  server.js  package.json  Enkel voor de Node-hosting — zie "Hosting"
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

7. **Header en footer staan in elk bestand.** Dat is de prijs van geen build:
   wat de server stuurt, staat letterlijk in de map. Wijzig je de navigatie of de
   footer, wijzig ze dan overal. Controleer achteraf of het aantal klopt:
   `findstr /s /m /c:"Hoofdnavigatie" *.html` moet 18 Nederlandse pagina's geven
   (en/ en fr/ hebben een eigen, vertaalde navigatie).

- [ ] **Formulier-backend.** `/offerte/` is volledig opgebouwd maar verstuurt niets.
      Waar komt een inzending binnen? (doc 01, sectie J) Zolang dit open staat, mag
      die pagina niet live.
- [ ] **Registratienummer ISPM-15 verifiëren.** `BE-1689` staat als bevestigd feit op
      tien pagina's. Klopt dat nummer? Een fout certificaatnummer op een exportkist is
      geen tekstfoutje.
- [ ] **Geel gemarkeerde tekst wegwerken.** Zoek ze met:
      `findstr /s /c:"class=\"ph" *.html`
- [ ] **Domein bevestigen.** Overal staat nu `palletje.be` (canonical, hreflang,
      sitemap). Dat is afgeleid uit het configurator-subdomein, niet expliciet
      bevestigd — doc 01, blokker 4. Zet de andere domeinen op redirect.
- [ ] Logo in SVG, favicon (32, 180, SVG) en Open Graph-beeld 1200 × 630
- [ ] Foto's uit de shotlist (doc 03). Elke `.photo`, `.case-visual` en
      `.feature-visual` draagt in `data-note` de opdracht voor het beeld.
- [ ] Privacybeleid, algemene voorwaarden en cookiebeleid laten opstellen. De
      pagina's staan er, met de structuur; de tekst moet van uw boekhouder of jurist
      komen. Ze staan op `noindex` tot dat gebeurd is.
- [ ] EN- en FR-pagina's laten nakijken door een moedertaalspreker. Het zijn nu
      samenvattingspagina's — de detailpagina's bestaan alleen in het Nederlands.
- [ ] Beslissen of aankoop, verkoop en herstel van pallets op de site komen. De
      huidige site palletje.be vermeldt die diensten; de zes vastgelegde categorieën
      niet. Zie de FAQ.
- [ ] Beslissen waar "Vloeren" uit de configurator thuishoort (doc 01, blokker 2).

Afgewerkt: sitemap.xml en robots.txt staan er. Een cookiebanner is vandaag niet
nodig — de site plaatst geen enkele cookie. Dat verandert zodra er een ingesloten
kaart, statistieken of een externe formulierdienst bij komt; zie `/cookies/`.

## Van staging naar live

Zolang de site op een tijdelijk domein staat, is ze afgeschermd voor
zoekmachines: elke pagina draagt `noindex, nofollow` en `robots.txt` staat op
`Disallow: /`. Dat is bewust — er staan nog niet bevestigde teksten in, en die
mogen niet in Google belanden.

Op de dag van de livegang, in deze volgorde:

1. **Alle gele markeringen weg.** Zoek ze met
   `findstr /s /c:"class=\"ph" *.html`. Zolang er één overblijft, ga je niet live.

2. **Domein rechtzetten** als het definitieve domein niet `palletje.be` is.
   Het staat in `canonical`, `hreflang`, `og:url`, de JSON-LD op de homepage,
   `sitemap.xml` en `robots.txt`. In Git Bash:
   `grep -rl "palletje.be" . | xargs sed -i "s|palletje\.be|nieuwdomein.be|g"`

3. **De staging-tag verwijderen** uit alle pagina's:
   `find . -name index.html -exec sed -i "/TIJDELIJK — STAGING/,+2d" {} +`

4. **De drie juridische pagina's terug op noindex zetten.** Die horen ook na de
   livegang uit de index te blijven, maar hun links moeten wel gevolgd worden.
   Zet in `privacy/`, `voorwaarden/` en `cookies/` weer
   `<meta name="robots" content="noindex, follow">` boven de stylesheet.

5. **`robots.txt` terugzetten** op:

   ```
   User-agent: *
   Allow: /

   Sitemap: https://palletje.be/sitemap.xml
   ```

6. **Controleren** met de preview-server: `Disallow` weg, geen `noindex` meer op
   de 17 gewone pagina's, en alle URL's in `sitemap.xml` op het juiste domein.
