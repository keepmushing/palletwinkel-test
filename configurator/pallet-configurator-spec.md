# Pallet configurator — recovered rules (PBL + PBA)

Recovered from the compiled bundles of configurator.palletje.be (build 6be3ea19, snapshot 5 Sep 2026).
Everything below is what the current site actually does. Items marked **[CHECK]** are things I need you to confirm or decide.

All dimensions in mm. Axes used throughout: **X = along the pallet length, Y = across the width**, Z = vertical.

---

## 1. Inputs (both products)

| Field (site label) | Type | Default | Limits |
|---|---|---|---|
| Lengte | number | 1200 | 200 – 9000 |
| Breedte | number | 800 | 200 – 2500 |
| Gewicht (load) | number, kg | 300 | – |
| Tussenafstand (max gap between top slats) | choice | ≤10 cm | Manueel / 0 / ≤5 / ≤10 / ≤15 / ≤20 cm |
| Zwaardere uitvoering (heavy duty) | checkbox | off | |
| Compatibel met transpallet (pallet-jack) | checkbox | off | |
| Onderlatten (bottom slats) | checkbox | off | mutually exclusive with Nestelen |
| Options: HT/ISPM15, HT-certificaat, Samenbinden, Nestelen, Schimmelvrij hout, Droog hout | checkboxes | off | no effect on geometry |
| Aantal, Opmerkingen, Bijlage (max 8 files, 10 MB each) | order fields | | |

Derived values (Poten / Latten / Blokken / Balken / Onderlatten) are auto-computed but the customer can override them with +/− buttons.
The site shows a hint on PBL when width ≤ 700: "a Pallet met balken is more economical".

**Weight thresholds:** "heavy" = heavy-duty box ticked **or** weight ≥ 600 kg. A second threshold of ≥ 1500 kg selects bigger blocks (PBL only).

---

## 2. Material tables

**Top slat types (latType)**

| Key | Label | Width × thickness |
|---|---|---|
| normal | 75 × 16 | 75 × 16 |
| alternative | 100 × 16 | 100 × 16 |
| heavyDuty | 100 × 22 | 100 × 22 |

**Blocks (PBL only), depend on the slat type chosen** — length × width × height

| Slat type | normal block | transpallet block | heavy block (≥1500 kg or heavy duty) |
|---|---|---|---|
| 75 × 16 | 75 × 75 × 75 | 75 × 75 × 90 | (none → normal) |
| 100 × 16 | 95 × 95 × 78 | (none → normal) | 145 × 100 × 78 |
| 100 × 22 | 95 × 95 × 78 | (none → normal) | 145 × 100 × 78 |

**Beams (PBA only)** — width × height

| Key | Size | When |
|---|---|---|
| normal | 75 × 75 | default |
| transpallet | 50 × 100 | transpallet ticked |
| heavyDuty | 63 × 110 | heavy |

---

## 3. Top deck — number of slats (same for PBL and PBA)

Let `gap` = chosen Tussenafstand (mm), `W` = width, `s` = slat width.

```
countSlats(W, gap, s):
    gap > 0  → ceil( (W − s) / (s + gap) + 1 )
    gap = 0  → floor( W / s )
actualGap(W, n, s) = floor( (W − s) / (n − 1) − s )     # shown to the customer
```

**Slat type selection**
1. If heavy → `100 × 22`.
2. Else if a gap was chosen (not "Manueel"):
   - `nNormal` = countSlats with 75, `nAlt` = countSlats with 100.
   - Use `100 × 16` if (`nNormal` is even AND `nAlt` is odd) OR (gap = 0 AND W divisible by 100).
   - Otherwise use `75 × 16`.
3. Else (manual) → `75 × 16`, slat count entered by hand (min 2, max floor(W / s)).

**Slat positions (Y):** evenly spread, outer slats flush with the edges:
`y_i = s/2 + i · (W − s) / (n − 1)`, i = 0 … n−1 (measured from the edge).

Rationale of the odd/even rule, as I read it: they prefer an odd number of slats (a slat in the middle), and switch to 100 mm slats when that gives an odd count.

---

## 4. PBL — Pallet met blokken

Structure, top to bottom:
1. **Top slats** along X (count/positions from §3).
2. **Cross boards** (same section as the top slats) across Y, one at each block position, directly under the top slats.
3. **Blocks** — `poten` rows across Y × `blokken` per row along X.
4. **Bottom runners** along X, one under each row of blocks (same section as the slats).
5. Optional **onderlatten**: cross boards across Y under the runners, one at each block position (count = `blokken`).

**Block count per row along X (`blokken`)**, `bl` = block length:
```
heavy   → ceil( (L − bl) / (bl + 700)  + 1 )      # max ~700 mm between blocks
normal  → ceil( (L − bl) / (bl + 1000) + 1 )      # max ~1000 mm between blocks
min 3, max floor(L / bl)
```

**Rows of blocks across Y (`poten`)**, `bw` = block width:
```
W < 600     → 2
W < 1200    → 3
else heavy  → ceil( (W − bw) / (bw + 500) + 1 )
else normal → ceil( (W − bw) / (bw + 900) + 1 )
min 2, max floor(W / bw)
```

**Row positions (Y):** evenly spread with outer rows flush: `y_j = bw/2 + j · (W − bw) / (poten − 1)`.

**Block positions along X:** see §6.

**[CHECK] Inconsistency in the original:** the 3D model draws the blocks with a footprint equal to the *slat width* (75 or 100) instead of the block table sizes (95×95, 145×100…), while the stored config uses the table. I'll use the table sizes unless you say otherwise.

---

## 5. PBA — Pallet met balken

Structure:
1. **Top slats** along X (§3).
2. **Beams** across Y (full width), spread along X.
3. Optional **onderlatten** along X, under the beams, count chosen by the customer (default 2, min 2, max floor(W / s)), evenly spread across Y with outer ones flush.

**Beam count (`balken`)**, `bwd` = beam width:
```
balken = ceil( (L − bwd) / (bwd + 800) + 1 )       # max ~800 mm between beams
min 2, max floor(L / bwd)
```
**Beam positions along X:** see §6.

---

## 6. Positions along the length (X) — blocks and beams

`n` items of size `d` on length `L`, measured from the end of the pallet:

```
evenSpread(i) = d/2 + i · (L − d) / (n − 1)

if transpallet AND n is even AND L ≥ 600:
    gap = (L − d) / (n − 1) − d
    if gap ≤ 600:
        # split into two groups of n/2, leaving a 600 mm opening in the middle for the pallet jack
        half = (L − 600) / 2
        group 0 (i < n/2):  x = evenSpread on length `half`, then shifted to the first half
        group 1 (i ≥ n/2):  same, shifted to the second half
    else: evenSpread
else: evenSpread
```

---

## 7. Worked example — default pallet 1200 × 800, 300 kg, gap ≤10 cm, nothing ticked

- Slats: nNormal = 6 (even), nAlt = 5 (odd) → **5 slats of 100 × 16**, actual gap 75 mm. Y = 50, 225, 400, 575, 750.
- PBL: block 95 × 95 × 78. `blokken` = ceil(1105/1095 + 1) = **3** at X = 47.5, 600, 1152.5. `poten` = **3** rows at Y = 47.5, 400, 752.5. → 9 blocks. Cross boards at the same 3 X positions; 3 runners under the rows.
- PBA: beam 75 × 75. `balken` = ceil(1125/875 + 1) = **3** beams at X = 37.5, 600, 1162.5.

This matches what the live site shows (5 latten, 3 poten, 3 blokken, 100 × 16, gap 75 mm).

---

## 8. New: CNC nail file

The original never produced this; the geometry above gives every joint position. Proposed output, one row per joint, exactly your four columns:

| X | Y | Nails | Layers |
|---|---|---|---|

Joints I'd generate (all X/Y = centre of the joint, from the corner of the pallet):

- **PBL**: every point where a top slat crosses a block (through slat + cross board into block → 2 layers), every point where a runner crosses a block (1 layer), and if onderlatten: onderlat × runner points (1 layer).
- **PBA**: every point where a top slat crosses a beam (1 layer), and if onderlatten: onderlat × beam (1 layer).

**[CHECK] I need from you:**
1. Which corner of the pallet is (0, 0) for the machine, and are X/Y as defined above (X = length) correct?
2. Nails per joint: fixed (e.g. 2) or depending on slat width (75 → 2, 100 → 3)?
3. Does "layers" mean what I assumed (number of boards the nail passes through before the block/beam), or something else (e.g. nail length code)?
4. Is the joint list above complete, or do you also nail the runners to the onderlatten from below, etc.?
5. Excel (.xlsx) with a header row, or plain CSV? Semicolon or comma separated?

---

## 9. Data stored per configuration (from the original cart item)

`type, length, width, weight, latDistanceSelection, latType, blokType|balkType, latten, poten (PBL), blokken|balken, heavyDuty, transpallet, onderlatten (count), ht, htCertificate, schimmelvrij, droog, nestelen, binden` plus quantity, remarks, attachments, screenshot of the 3D view.
