# Configurator — 't Palletje

**Dit is de enige plek waar de configurator onderhouden wordt.** Er bestaat een
tweede kopie in `djoeneuh/palletje-configurator`; die is sinds 7 september 2026
bevroren en dient alleen nog om de rekenkern los te testen. Wijzig daar niets:
wat daar verandert, komt niet op de website terecht.

Geen backend, geen buildstap. De bestanden hier worden geserveerd zoals ze zijn.

## Bestanden

| Bestand | Wat het is |
|---|---|
| `index.html` | De pagina: productkiezer, invoerformulier, 3D-weergave, samenvatting. Draagt de kop en voettekst van de site en gebruikt `/assets/css/site.css`. |
| `engine.js` | Alle regels en berekeningen. Pure functies, geen browsercode. **Dit is het bestand dat je aanpast als een regel verandert.** |
| `app.js` | Verbindt het formulier met de rekenkern en tekent de 3D-weergave. |
| `three.min.js` | Three.js r128, meegeleverd zodat de app zonder internet werkt. |
| `pallet-configurator-spec.md` | De teruggewonnen palletregels in gewone taal. |

## Productkiezer

Zonder `?product=` in het adres begint de bezoeker bij een keuzescherm met vier
groepen — Palletten, Kisten, Kratten, Deksels / Vloeren — en een kaart per
product. Pas na die keuze verschijnt het formulier. Dat volgt het model van
configurator.palletje.be en zorgt dat de keuze tussen een kist en een krat
vooraan staat in plaats van verstopt in een tabbalk.

Vanaf de site kun je twee kanten op:

- `?product=kist` springt meteen naar dat product. De vertaaltabel van namen
  naar codes staat onderaan `index.html`.
- `#grp-kisten` toont de kiezer, geopend bij die groep. In de HTML van de site
  is dat `data-anker="grp-kisten"` op een link met `class="cfg"`.

## Intern: het bestand voor CNC en zagerij

Het blok met de CSV en de zaaglijst staat **standaard verborgen**. Aanzetten met
`?intern=1`, uitzetten met `?intern=0`; de browser onthoudt de keuze.

Let op: dit verbergt, het beveiligt niet. Een statische site kan niet nagaan wie
er kijkt. Moet het echt dicht, zet dan een wachtwoord op de map via
hPanel > Beveiliging > Mappen beveiligen.

## Wat de klant krijgt

- **Download CSV** — het nagelbestand voor de CNC. Intern.
- **Download configuratie (JSON)** — de volledige configuratie: alle afgeleide
  waarden, een stuklijst, elke plank met haar positie, elke nagelverbinding en
  een PNG van de 3D-weergave. Intern.

## CSV format

Semicolon-separated, decimal comma, CRLF line endings (opens directly in Belgian Excel). Two blocks in one file:

1. **Nagelpunten** (rows 1…n) for the CNC machine.
2. A blank line, then **Zaaglijst**: one line `Zaaglijst;<product>;<outer size>`, a header `Onderdeel;Aantal;Lengte;Breedte;Dikte`, and one row per part type (walls, uprights, lid included — the CNC only gets the floor, the rest is for the saw).
   If the CNC software chokes on the extra rows, splitting into two files is a two-line change in `csv()`.

```
X_boven;Y_boven;Nagels_boven;Lagen_boven;X_onder;Y_onder;Nagels_onder;Lagen_onder
```

- Origin (0,0) = bottom-left corner of the floor footprint. X runs along the length, Y along the width. Values in mm, centre of the joint.
  For boxes the footprint is the outer floor (wall thickness included, uprights excluded); the floor slats of a KIS/KRS start 16 mm in from the edge.
- Left four columns: joints made from the top (through the deck). Right four: joints made from the bottom.
  Rows are independent lists; when one side has fewer joints its columns are simply empty.
- `Nagels`: 3, or 4 when the pallet is heavy (heavy-duty ticked or load ≥ 600 kg).
- `Lagen`: number of boards the nail passes through before it reaches the block/beam.
  - PBL, top: 2 where a block is underneath (top slat + cross board into block), otherwise 1 (top slat into cross board).
  - PBL, bottom: runner into block = 1; with onderlatten = 2 (onderlat + runner into block).
  - PBA, HVL, KIS/KRS floor: top slat into beam = 1; onderlat into beam = 1.
  - KIB/KRB floor: slat into long frame beam = 1 (top); cross beam into frame beam = 1 and onderlat into cross beam = 1 (bottom).
  - KIP/KRP: same as PBL (a block pallet under the box).

To change any of this, edit `nailJoints()` and `csv()` in `engine.js`.

## Changing rules

Everything numeric lives at the top of `engine.js`: slat/block/beam tables, the 600 kg and 1500 kg thresholds,
nails per joint, the 600 mm pallet-jack opening, and the spacing constants (700/1000 mm between blocks, 800 mm between beams, 500/900 mm between block rows).

## Quick test in Node

```
node -e "const E=require('./engine.js').PalletEngine;const c=E.compute({type:'PBL',length:1200,width:800,weight:300,distance:100});console.log(c.latten,c.poten,c.blokken)"
```
Expected: `5 3 3` (the same as the original site for its default pallet).

## Boxes (kisten/kratten) — how the sizes work

The customer enters the size of the **goods**. Inner size = length + 50, width and height rounded up to the next 100 mm after adding 50 (as the original did).
Kisten are closed (slats flush), kratten have three gap choices (floor, sides, lid). Suffix = floor type:
S = slats on cross beams, B = slats across on long frame beams plus cross beams, P = a block pallet.
Heavy for boxes = heavy-duty ticked, or `(weight−500)/50 + (height−800)/100 ≥ 15`; heavy uses 100×22 slats, 63×110 beams and 50×100 uprights.

Deviations from the original, on purpose:
- The original counted KIB/KRB floor slats from the width but spread them along the length (and the lid the other way round). Here slats are counted along the direction they are spread.
- Flush slat counts use `floor(span / 100)`, so a 1250 mm span gets 12 slats with a 4 mm gap rather than 13 overlapping ones. Change `slatCount()` if you'd rather cut the last slat narrower.
- KIB/KRB heights were rounded (`round`) in the original; here always rounded up like the other boxes.

## Next steps (not built yet)

- Validate box wall/upright layout against how you actually build them (the cut list is derived from the 3D layout).
- Quote request / cart, if you want it again — the old one sent everything to a server route + Supabase; this rebuild deliberately has no backend.

## Verwijderd: Houten wand (HWA)

Op vraag van de klant (7 september 2026) is het wandproduct geschrapt en heet de
groep `Vloeren` voortaan **`Deksels / Vloeren`** — een vlak paneel is ofwel een
deksel op een kist, ofwel een vloer, en van die twee was er maar één gewenst.

De productregel is uit `PRODUCTS` verdwenen, dus hij is niet meer te kiezen. De
takken met `kind === 'wall'` in `engine.js` en `app.js` staan er bewust nog: ze
zijn onbereikbaar, ze zitten verweven in de nagel- en geometrieberekening, en
eruit halen levert niets op. De wand terugzetten is één regel.
