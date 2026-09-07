# 't Palletje — website

Statische site. Geen build, geen dependencies, geen Node. Wat je hier ziet, is
wat de server serveert.

## Het ontwerp

Alle pagina's dragen sinds 6 september 2026 het ontwerp uit
`palletje-home-v43-logo90.html`: marineblauw en lucht, Inter, en het
radius-systeem 0 / 4 / 10 / 16 / pill. Dat ontwerpbestand is in drie stukken
uit elkaar gehaald:

- de stijl staat letterlijk in `assets/css/site.css`, met onderaan een blok
  aanvullingen voor de pagina's die de homepage niet is;
- het gedrag staat in `assets/js/site.js` — hetzelfde script als in het
  ontwerp, maar elk onderdeel kijkt eerst of het op deze pagina bestaat, zodat
  één bestand op alle 23 pagina's draait;
- de homepage zelf is de body van dat ontwerp, met echte links in plaats van
  ankers en modals.

**De signatuurvorm** (`--r-mark`, de vorm met één rechte hoek) hoort exact één
keer per pagina voor te komen: op het `.final`-blok. `controleer.ps1` bewaakt
dat.

**De productmodals uit het ontwerp zijn echte pagina's geworden.** In het
ontwerp opende "Lees meer" een `<dialog>` met de mededeling *worden later echte
pagina's*. Dat is nu gebeurd: elke kaart linkt naar `/producten/<slug>/`.

## De site nakijken

```
powershell -ExecutionPolicy Bypass -File controleer.ps1
```

Loopt elke pagina na op: kapotte interne links, ankers die nergens heen wijzen,
ontbrekende of dubbele id's, meer dan één `<h1>`, meer dan één `.final`, en
klassen die in geen enkele stylesheet gedefinieerd staan. Geeft `GEEN FOUTEN`
of een lijst per pagina. Draai dit voor elke push.

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
  index.html              Homepage (NL) — het volledige v43-ontwerp
  en/                     Engelse samenvattingspagina
  fr/                     Franse samenvattingspagina
  producten/              Overzicht + zeven detailpagina's
  configurator/           De configurator, in dezelfde huisstijl
    index.html            De pagina; schil uit site.css, rest uit configurator.css
    engine.js             Alle rekenregels. Hier verander je een norm.
    app.js                Verbindt het formulier met de engine, tekent de 3D
    three.min.js          Three.js r128, meegeleverd zodat het offline werkt
    configurator.css      Alleen wat site.css niet heeft
  ppwr/                   PPWR-beslisroute — zie hieronder
  werkwijze/  realisaties/  over-ons/  faq/  contact/  offerte/
  privacy/  voorwaarden/  cookies/
  assets/
    css/site.css          Designsysteem — alle kleuren, maten en componenten
    js/site.js            Menu, zoeken, vraagbaak, fotoalbums, configuratorlinks
    img/                  logo.png + de foto's (zie ALBUMS in site.js)
    fonts/                Inter, lokaal. Zie hieronder waarom.
  404.html                Foutpagina, in dezelfde stijl
  sitemap.xml  robots.txt  Voor zoekmachines
  controleer.ps1          Nakijker — zie "De site nakijken"
  server.js  package.json  Enkel voor de Node-hosting — zie "Hosting"
  serve.ps1               Preview-server
```

### De configurator

`/configurator/` is een kopie van
[github.com/djoeneuh/palletje-configurator](https://github.com/djoeneuh/palletje-configurator).
`engine.js`, `app.js` en `three.min.js` zijn **byte voor byte** overgenomen; het
rekenwerk is dus niet aangeraakt. Alleen de pagina en de stijl zijn nieuw, zodat
de configurator dezelfde kopbalk, kleuren en voettekst draagt als de site.

Tien producten: pallet met blokken of balken, kist en krat in drie
bodemvarianten elk, houten vloer en houten wand. De klant krijgt er een
3D-weergave, een samenvatting, een CSV voor de CNC en zagerij en een JSON met
de volledige configuratie.

Alle knoppen op de site die naar de configurator wijzen, dragen de klasse `cfg`.
`site.js` maakt daar `/configurator/?product=…` van; met `data-product="pallet"`,
`"kist"` of `"platen"` opent meteen de juiste tab. Verhuist de configurator ooit
naar een eigen subdomein, dan pas je één regel aan: `CONFIGURATOR_URL` bovenaan
`assets/js/site.js`.

### De PPWR-beslisroute

`/ppwr/` is de interactieve beslisroute uit
`ppwr-beslisroute-palletje-nieuwe-huisstijl.html`. De vragenlogica in
`assets/js/ppwr.js` is ongewijzigd overgenomen; alleen de schil en de stijl zijn
nieuw.

De stijl staat in `assets/css/ppwr.css` en hangt **volledig onder
`.beslisroute`**. Dat is geen nettigheid maar noodzaak: de route gebruikt
klassenamen die de site ook heeft — `.card`, `.step`, `.btn`, `.field`,
`.panel`, `.wrap`, `.eyebrow`. Zonder die wrapper zouden de twee stylesheets
elkaar over en weer overschrijven. Om dezelfde reden staan de tokens van de
route op `.beslisroute` en niet op `:root`: `--wood` betekent in `site.css` het
bruin van de nog-te-bevestigen markering en in de route het blauwe accent.

Het oorspronkelijke bestand was de oude papier-en-houtversie met een blok
`/* nieuwe huisstijl */` erbovenop geplakt. Dat dekte de hoofdkleuren af maar
niet alles: `.chip:hover` bleef beige, en het waarschuwingsblok gebruikte een
eigen amberfamilie. Hier is er één laag van gemaakt, waarin elke kleur uit het
palet van de site komt. Te controleren in de browser: geen enkele kleur binnen
`.beslisroute` valt buiten navy / blauw / lucht / lijn / inkt / grijs, plus de
bruinfamilie van de site voor de waarschuwing.

Bij afdrukken verbergt `@media print` de kopbalk, het kruimelpad, de paginakop
en de voettekst, en toont het `.printsheet` — het A4-blad dat `ppwr.js` vult.

### Waarom Inter lokaal staat

Het ontwerp laadde Inter bij Google Fonts. Dat stuurt het IP-adres van elke
bezoeker naar Google voor een bestand dat we net zo goed zelf kunnen serveren —
in de EU een terugkerend privacybezwaar, en een extra verbinding die de pagina
vertraagt. De twee bestanden in `assets/fonts/` dekken Latijn en
Latijn-uitgebreid, genoeg voor Nederlands, Frans en Engels. Het zijn variabele
fonts: één bestand per subset dekt alle diktes.

**De site doet nu geen enkel extern verzoek meer.** Te controleren in de
netwerkweergave van de browser: alles komt van het eigen domein.

## Regels bij het aanpassen

1. **Kleuren, maten en typografie komen uit `assets/css/site.css`.** Die waarden
   staan in doc 03 — BRAND & ASSETS. Verander ze daar eerst, dan hier. Schrijf
   nooit een losse hex-kleur in een HTML-bestand.

2. **Geel gemarkeerde tekst is nog niet bevestigd.** Alles met `class="ph"`
   komt uit doc 01 — FEITENDOSSIER en staat daar nog op TE BEVESTIGEN. Zolang
   die markering er staat, mag de pagina niet live. Vandaag staan er **64**,
   verspreid over 18 bestanden. Zoek ze met:
   `findstr /s /c:"class=\"ph\"" *.html`

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
   footer, wijzig ze dan overal — alle 23 pagina's. `controleer.ps1` merkt het
   als er ergens een id ontbreekt of dubbel staat, maar niet als je een link
   vergeet bij te werken. Neem `producten/pallet-op-maat/index.html` als
   voorbeeld; die is de maat voor alle andere.

8. **Nieuwe pagina toegevoegd?** Zet ze ook in `PAGINAS` bovenaan
   `assets/js/site.js`, anders vindt de zoekfunctie ze niet, en in
   `sitemap.xml`.

9. **Wijzig je `site.css` of `site.js`, bump dan het versiestempel.** De hosting
   stuurt `Cache-Control: max-age=604800` mee: zeven dagen. Zonder stempel krijgt
   een bezoeker die vorige week langskwam de nieuwe HTML met de oude stijl, en
   valt de pagina uit elkaar. Daarom staat achter elke gedeelde stijl en elk
   gedeeld script `?v=20260906d`. Verhoog dat getal in alle pagina's tegelijk:

   ```
   grep -rl "?v=20260906d" --include="*.html" . | xargs sed -i "s/?v=20260906d/?v=20260906e/g"
   ```

   Het stempel staat vandaag op `?v=20260906d`. Elke waarde die verandert
   volstaat; houd hem in alle pagina's gelijk. Voor de lettertypen en het logo
   is dit niet nodig: die bestanden veranderen niet, en een gewijzigd
   lettertype krijgt gewoon een nieuwe bestandsnaam.

- [ ] **Formulier-backend.** Er is nog geen server die een inzending opvangt
      (doc 01, sectie J). Tot die er is, zet `site.js` de ingevulde velden om in
      een e-mail die in het mailprogramma van de bezoeker opengaat, met een
      zichtbare melding erbij. Dat is een noodoplossing, geen eindpunt: een
      bezoeker zonder mailprogramma in de browser komt er niet mee weg, en een
      bijlage moet hij zelf toevoegen. **Waarom dit nodig was:** de hosting
      beantwoordt een POST met status 200 en dezelfde pagina, dus zonder deze
      afhandeling denkt de bezoeker dat zijn aanvraag verstuurd is terwijl er
      niets gebeurde. Kies een bestemming (een formulierdienst, een mailscript
      of een eigen endpoint), zet die in `action`, en verwijder blok 8 uit
      `assets/js/site.js`.
- [ ] **Registratienummer ISPM-15 verifiëren.** `BE-1689` staat 19 keer als bevestigd feit,
      verspreid over 12 bestanden. Klopt dat nummer? Een fout certificaatnummer op een exportkist is
      geen tekstfoutje.
- [ ] **Geel gemarkeerde tekst wegwerken.** 64 stuks in 18 bestanden. Zoek ze met:
      `findstr /s /c:"class=\"ph\"" *.html`
- [ ] **Foto's.** Alle beeldvlakken zijn nu blauwe placeholders met een
      bijschrift dat zegt welke foto er hoort. De bestandsnamen staan in
      `ALBUMS` bovenaan `assets/js/site.js`; leg de bestanden in
      `assets/img/` en ze verschijnen vanzelf. Ontbreekt er een, dan blijft het
      blauwe vlak staan — de site blijft dus werken terwijl u ze verzamelt.
- [ ] **Zachte 404 oplossen.** Hostinger stuurt op deze webapp élk onbekend pad
      naar `index.html` met status 200 in plaats van 404. Zolang de site op
      `noindex` staat is dat onschadelijk, maar vóór livegang moet een typfout in
      de URL een echte 404 geven met `404.html` — anders indexeert Google eindeloos
      veel duplicaten van de homepage. Te regelen in de routering van de hosting.

- [ ] **Domein bevestigen.** Overal staat nu `palletje.be` (canonical, hreflang,
      sitemap). Dat is afgeleid uit het configurator-subdomein, niet expliciet
      bevestigd — doc 01, blokker 4. Zet de andere domeinen op redirect.
- [ ] Logo in SVG en een Open Graph-beeld 1200 × 630. Het logo staat er nu als
      PNG van 360 × 360 (`assets/img/logo.png`), gebruikt als merkteken én als
      favicon. Voor een scherpe weergave op grote schermen en in
      deelvoorbeelden is een SVG en een echt OG-beeld beter.
- [ ] Privacybeleid, algemene voorwaarden en cookiebeleid laten opstellen. De
      pagina's staan er, met de structuur; de tekst moet van uw boekhouder of jurist
      komen. Ze staan op `noindex` tot dat gebeurd is.
- [ ] EN- en FR-pagina's laten nakijken door een moedertaalspreker. Het zijn nu
      samenvattingspagina's — de detailpagina's bestaan alleen in het Nederlands.
- [ ] Beslissen of aankoop, verkoop en herstel van pallets op de site komen. De
      huidige site palletje.be vermeldt die diensten; de zes vastgelegde categorieën
      niet. Zie de FAQ.
- [ ] Beslissen waar "Vloeren" uit de configurator thuishoort (doc 01, blokker 2).

- [ ] **Duplicaat FAQ.** De vijftig vragen staan zowel op de homepage (zo is het
      ontwerp) als op `/faq/`. Zolang de site op `noindex` staat is dat
      onschadelijk. Beslis vóór de livegang welke van de twee de canonieke
      versie is, of laat de homepage alleen de drie populaire vragen tonen met
      een doorverwijzing naar `/faq/`.

Afgewerkt: sitemap.xml en robots.txt staan er. Een cookiebanner is vandaag niet
nodig — de site plaatst geen enkele cookie en doet sinds de lokale fonts geen
enkel extern verzoek meer. Dat verandert zodra er een ingesloten kaart,
statistieken of een externe formulierdienst bij komt; zie `/cookies/`.

## Na elke wijziging aan CSS of JS: verhoog de versiestempel

De stylesheet en het script worden geladen als `site.css?v=JJJJMMDDx`. Zonder
stempel blijft een oud bestand in de browser van de bezoeker staan en valt de
pagina uit elkaar. De stempel staat op twee plaatsen en die moeten gelijklopen:
achter elke `<link>` en `<script>` in de HTML, én in `ASSET_V` bovenaan
`assets/js/site.js` (dat stempelt de foto's die het script zelf inlaadt).

Verhogen doe je overal tegelijk. Van `20260908a` naar `20260908b`:

```
OUD=20260908a; NIEUW=20260908b
grep -rl "v=$OUD" --include=*.html . | xargs sed -i "s/v=$OUD/v=$NIEUW/g"
sed -i "s/ASSET_V = \"$OUD\"/ASSET_V = \"$NIEUW\"/" assets/js/site.js
```

Dit is op 7 september 2026 twee keer misgegaan: drie CSS-wijzigingen onder
dezelfde stempel, waardoor de opdrachtgever dagenlang naar een oude versie keek
en dacht dat er niets veranderde.

### En de HTML zelf?

Die kan geen stempel dragen — `/werkwijze/` is nu eenmaal `/werkwijze/`. Daarom
zet `server.js` er sinds 8 september 2026 zelf `Cache-Control: no-cache` op,
plus een `ETag`. Zonder die regel plakt de hosting er ongevraagd
`max-age=604800` op en ziet een bezoeker de nieuwe opbouw pas een week later.
`Clear cache` bij Hostinger helpt daar niet tegen: dat raakt alleen hun eigen
laag, niet de browser van de bezoeker.

Dat kostte een hele avond zoeken: de knop "Toevoegen aan offerte" werkte al,
maar de opdrachtgever kreeg de oude paginaopbouw te zien en dacht dat er niets
was veranderd.
## Van staging naar live

Zolang de site op een tijdelijk domein staat, is ze afgeschermd voor
zoekmachines: elke pagina draagt `noindex, nofollow` en `robots.txt` staat op
`Disallow: /`. Dat is bewust — er staan nog niet bevestigde teksten in, en die
mogen niet in Google belanden.

Op de dag van de livegang, in deze volgorde:

1. **Alle gele markeringen weg.** Zoek ze met
   `findstr /s /c:"class=\"ph\"" *.html`. Zolang er één overblijft, ga je niet live.

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
   de gewone pagina's, en alle URL's in `sitemap.xml` op het juiste domein.

7. **`controleer.ps1` draaien.** Die moet `GEEN FOUTEN` geven voor je pusht.
