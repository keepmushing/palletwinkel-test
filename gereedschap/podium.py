# Productrenders op één vlakke achtergrondkleur zetten (de "podiumkleur").
#
# Bron:  assets/img/<naam>.jpg          (origineel, blijft ongemoeid; niet wissen)
# Doel:  assets/img/<naam>-podium.jpg   (wat de site toont)
# Het script leest altijd het origineel, dus opnieuw draaien geeft hetzelfde
# resultaat. Een nieuwe naam voor het doelbestand, omdat de CDN van Hostinger
# bestanden tot zeven dagen bewaart: een verouderde pagina blijft zo bij het
# oude beeld en de oude CSS, in plaats van die twee te mengen.
#
# Werkwijze. B(x,y) = een gladde schatting van de oude achtergrond.
#   - Grijze pixels (achtergrond, schaduw, metaal, doorkijk tussen latten)
#     krijgen het verschil T - B erbij: schaduwen en details blijven exact zo
#     donker als ze waren, alleen de tint en het niveau van de achtergrond
#     verschuiven. Niets wordt vervaagd.
#   - Waar het beeld maar een paar niveaus van B afwijkt (ruis, vlekjes in de
#     oude achtergrond), wordt het exact T: de banner is vlak.
#   - Hout (verzadigd) blijft ongemoeid. Mengpixels op de productrand krijgen
#     een deel van T - B mee, zonder lichter te worden dan T.
#   - Schaduw loopt zacht uit naar exact T aan de beeldrand. Bij een geplakte
#     witte rechthoek (de machinebouwkist) was de schaduw op de rand van die
#     rechthoek afgeknipt; daar loopt ze nu naar buiten toe uit.
#
# Gebruik (Python met numpy, opencv-python-headless en pillow):
#   python gereedschap/podium.py            alle renders hieronder
#   python gereedschap/podium.py <naam>     één render (naam zonder .jpg)
# Controlebeelden komen in <temp>/podium-qa. Verander je T, pas dan ook
# --podium in assets/css/site.css aan en verhoog de ?v=-stempel.
# Getest met numpy 2.5.3, opencv-python-headless 5.0.0.93 en pillow 12.3.0. Met
# andere versies kan de uitvoer op bytes licht verschillen (niet zichtbaar);
# dan veranderen de acht -podium.jpg's in git en moet de stempel omhoog.
import os, sys, tempfile
import numpy as np, cv2
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QA = os.path.join(tempfile.gettempdir(), "podium-qa")
T = np.array([243, 248, 251], np.float32)          # #f3f8fb = --podium in site.css
RENDERS = ["pallet-op-maat-blokpallet-1800x800", "houten-exportkist-gesloten-machinebouw",
           "houten-exportkist-gesloten-4weg", "houten-krat-open-intern-transport",
           "glasbok-op-maat-glastransport", "opzetrand-europallet-stapelen",
           "houten-vloerpaneel-pallethout-werfvloer", "houten-skid-zware-machine-transport"]
RANDBREEDTE = 40          # px waarin alles naar exact T uitloopt aan de beeldrand
VLAK_ONDER, VLAK_BOVEN = .8, 2.5   # |gladde afwijking van B| in lum-niveaus: daaronder vlak T, daarboven volledig behouden
GLAD = 3.0                # px, gladstrijken van die afwijking (vlakt ruis en 8x8-blokjes van de oude JPEG af)
UITLOOP = 14              # px, 1/e-lengte van de schaduwuitloop buiten een geplakte rechthoek
RANDMENG = 3              # px mengpixels aan de binnenrand van een geplakte rechthoek
KWALITEIT = 92


def lum(a):
    return a[..., 0] * .2126 + a[..., 1] * .7152 + a[..., 2] * .0722


def chroma(a):
    return a.max(-1) - a.min(-1)


def glad(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def norm_conv(img, mask, sigma):
    """Gemiddelde van img over mask, gladgestreken; ook waar mask leeg is."""
    m = mask.astype(np.float32)
    den = cv2.GaussianBlur(m, (0, 0), sigma)
    if img.ndim == 3:
        return cv2.GaussianBlur(img * m[..., None], (0, 0), sigma) / np.maximum(den[..., None], 1e-4), den
    return cv2.GaussianBlur(img * m, (0, 0), sigma) / np.maximum(den, 1e-4), den


def norm_conv_prior(img, mask, sigma, prior, lam=.02):
    """Als norm_conv, maar waar weinig maskerpixels zijn schuift het geleidelijk
    naar prior, in plaats van met een harde grens."""
    m = mask.astype(np.float32)
    den = cv2.GaussianBlur(m, (0, 0), sigma)
    num = cv2.GaussianBlur(img * m[..., None], (0, 0), sigma)
    return (num + lam * prior) / (den[..., None] + lam)


def zoek_rechthoek(p, B0):
    """Een geplakte witte rechthoek op een grijzere achtergrond (de machinebouwkist)."""
    h, w, _ = p.shape
    wit = (p.min(-1) >= 251) & (chroma(p) <= 4)
    if lum(B0[None, None])[0, 0] >= 250 or wit.mean() <= .05:
        return None
    n, _, stats, _ = cv2.connectedComponentsWithStats(wit.astype(np.uint8), 8)
    groot = [k for k in range(1, n) if stats[k, cv2.CC_STAT_AREA] > .002 * h * w]
    if not groot:
        return None
    x0 = int(min(stats[k, 0] for k in groot)); y0 = int(min(stats[k, 1] for k in groot))
    x1 = int(max(stats[k, 0] + stats[k, 2] for k in groot)); y1 = int(max(stats[k, 1] + stats[k, 3] for k in groot))
    binnen = np.zeros((h, w), bool); binnen[y0:y1, x0:x1] = True
    return binnen, np.median(p[wit & binnen], axis=0), (x0, y0, x1 - x0, y1 - y0)


def schat_achtergrond(p, L, C, gebieden):
    """Gladde schatting B van de oude achtergrond, per gebied. Schaduw maakt
    alleen donkerder, dus na een ruwe eerste schatting tellen alleen pixels
    mee die minstens zo licht zijn als B (op ruis na): zo trekt de
    halfschaduw B niet omlaag. Waar weinig achtergrond is, schuift de schatting
    geleidelijk naar de vorige ronde (geen harde grens)."""
    B = np.zeros_like(p)
    for gebied, ref in gebieden:
        refL, refC = lum(ref[None, None])[0, 0], chroma(ref[None, None])[0, 0]
        kandidaat = gebied & (C <= refC + 5)
        Bk = norm_conv_prior(p, kandidaat & (np.abs(L - refL) <= 5), 40, np.broadcast_to(ref, p.shape))
        Ls, _ = norm_conv(L, kandidaat, 2.0)
        for _ in range(2):
            m = kandidaat & (Ls >= lum(Bk) - 1.0) & (np.abs(L - refL) <= 8)
            Bk = norm_conv_prior(p, m, 40, Bk)
        B[gebied] = Bk[gebied]
    return B


def verwerk(naam):
    bron = os.path.join(REPO, "assets", "img", f"{naam}.jpg")
    doel = os.path.join(REPO, "assets", "img", f"{naam}-podium.jpg")
    p = np.asarray(Image.open(bron).convert("RGB"), np.float32)
    h, w, _ = p.shape
    L, C = lum(p), chroma(p)

    rand = np.zeros((h, w), bool); rand[:24, :] = rand[-24:, :] = rand[:, :24] = rand[:, -24:] = True
    B0 = np.median(p[rand], axis=0)
    gebieden = [(np.ones((h, w), bool), B0)]
    rh = zoek_rechthoek(p, B0)
    if rh:
        gebieden = [(~rh[0], B0), (rh[0], rh[1])]
        print(f"  geplakte rechthoek {rh[2]}, kleur {rh[1]}")
    B = schat_achtergrond(p, L, C, gebieden)
    LB = lum(B)

    # 1. hout of niet: 0 = hout, 1 = grijs (achtergrond, schaduw, metaal, doorkijk)
    wgt = glad((22 - (C - chroma(B))) / 16)

    # 2. afwijking van de oude achtergrond. De beslissing "vlak of behouden"
    #    gebeurt op een gladgestreken versie (alleen over grijze pixels), zodat
    #    ruis vlak wordt; de waarde zelf blijft scherp, zodat details blijven.
    delta = p - B
    ld = L - LB
    lds, den = norm_conv(ld, wgt > .5, GLAD)
    lds = np.where(den > .05, lds, ld)
    houd = glad((np.abs(lds) - VLAK_ONDER) / (VLAK_BOVEN - VLAK_ONDER))
    afw = delta * houd[..., None]                     # wat er van het beeld overblijft boven T

    # 3. geplakte rechthoek: de schaduw liep tot op de rand en was daar
    #    afgeknipt. De buitenste RANDMENG rijen binnen de rand zijn mengpixels
    #    van het plakken (half wit, half grijs) en dus onbetrouwbaar. Bron is de
    #    rij/kolom net daarbinnen, gladgestreken langs de rand (de ruis per kolom
    #    doortrekken gaf verticale streepjes). Die waarde loopt vanaf die rij met
    #    exp(-d/UITLOOP) uit, door de mengrijen heen en verder naar buiten.
    #    In de hoekkwadranten buiten de rechthoek geldt de eindwaarde van de
    #    onder- of bovenlijn; bij de machinebouwkist zijn die eindwaarden 0.
    if rh:
        binnen = rh[0]
        x0, y0, bw, bh = rh[2]
        x1, y1 = x0 + bw - 1, y0 + bh - 1             # laatste kolom/rij binnen
        bx0, by0, bx1, by1 = x0 + RANDMENG, y0 + RANDMENG, x1 - RANDMENG, y1 - RANDMENG
        # bronpixels: grijs en minstens 3 px van het hout (daar zit JPEG-ringing)
        grijs_ok = (wgt > .5) & (cv2.dilate((wgt < .5).astype(np.uint8), np.ones((7, 7), np.uint8)) == 0)
        schaduw = np.minimum(afw, 0).astype(np.float32)

        def langs(lijn, ok):
            """1D langs de rand: gaten (hout dat de rand raakt, ringing) lineair
            opvullen vanuit de bruikbare pixels ernaast, dan gladstrijken."""
            n = len(lijn)
            pos = np.nonzero(ok)[0]
            if len(pos) == 0:
                return np.zeros((n, 3), np.float32)
            gevuld = np.stack([np.interp(np.arange(n), pos, lijn[pos, c]) for c in range(3)], -1)
            k = cv2.getGaussianKernel(25, 4).ravel()
            pad = np.pad(gevuld, ((12, 12), (0, 0)), mode="edge")
            return np.stack([np.convolve(pad[:, c], k, "valid") for c in range(3)], -1).astype(np.float32)

        def binnen_kern(ok, a, b):                     # alleen het kernstuk van de lijn telt
            ok = ok.copy(); ok[:a] = False; ok[b + 1:] = False
            return ok

        onder = langs(schaduw[by1], binnen_kern(grijs_ok[by1], bx0, bx1))
        boven = langs(schaduw[by0], binnen_kern(grijs_ok[by0], bx0, bx1))
        links = langs(schaduw[:, bx0], binnen_kern(grijs_ok[:, bx0], by0, by1))
        rechts = langs(schaduw[:, bx1], binnen_kern(grijs_ok[:, bx1], by0, by1))
        yy, xx = np.mgrid[0:h, 0:w]
        xc, yc = np.clip(xx, bx0, bx1), np.clip(yy, by0, by1)
        d = np.hypot(xx - xc, yy - yc).astype(np.float32)
        ext = np.where((yc == by1)[..., None], onder[xc],
              np.where((yc == by0)[..., None], boven[xc],
              np.where((xc == bx1)[..., None], rechts[yc], links[yc])))
        ext = np.minimum(ext, 0) * np.exp(-d / UITLOOP)[..., None]
        kern = (xx >= bx0) & (xx <= bx1) & (yy >= by0) & (yy <= by1)
        mengrand = binnen & ~kern
        buiten = ~binnen & (d <= 5 * UITLOOP)
        afw = np.where(mengrand[..., None], ext, afw)
        afw = np.where(buiten[..., None], np.minimum(afw, ext), afw)

    # 4. naar exact T aan de beeldrand
    yy, xx = np.mgrid[0:h, 0:w]
    tot_rand = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy)).astype(np.float32)
    afw *= glad(tot_rand / RANDBREEDTE)[..., None]

    # 5. samenstellen: grijs = T + afwijking; hout = origineel
    grijs = T + afw
    uit = wgt[..., None] * grijs + (1 - wgt[..., None]) * p

    # 6. productrand: mengpixels (1-2 px in het hout) bevatten nog oude
    #    achtergrond. Geef ze een deel van T - B mee, maar maak ze nooit lichter
    #    dan T; lichte randpixels (hooglicht dat op wit wegviel) gaan half naar T.
    product = (wgt < .5).astype(np.uint8)
    d_prod = cv2.distanceTransform(product, cv2.DIST_L2, 3)
    band1 = (product == 1) & (d_prod <= 1.01)
    band2 = (product == 1) & (d_prod > 1.01) & (d_prod <= 2.01)
    k = np.where(band1, .6, np.where(band2, .3, 0)) * (C < 60)
    verschoven = uit + k[..., None] * (T - B)
    TL = lum(T[None, None])[0, 0]
    lichter = (lum(verschoven) > np.maximum(lum(uit), TL))
    uit = np.where(lichter[..., None], uit, verschoven)
    licht_rand = (band1 | band2) & (lum(uit) > TL + 1) & (C < 30)
    uit = np.where(licht_rand[..., None], (uit + T) / 2, uit)

    uit = np.clip(np.rint(uit), 0, 255).astype(np.uint8)
    Image.fromarray(uit).save(doel, quality=KWALITEIT, subsampling=0, optimize=True, progressive=True)

    # controle + QA-beelden
    os.makedirs(QA, exist_ok=True)
    nieuw = np.asarray(Image.open(doel).convert("RGB")).astype(np.int16)
    buiten4 = np.zeros((h, w), bool); buiten4[:4, :] = buiten4[-4:, :] = buiten4[:, :4] = buiten4[:, -4:] = True
    afw4 = int(np.abs(nieuw[buiten4] - T.astype(np.int16)).max())
    hout = wgt < .05
    dhout = float(np.abs(nieuw[hout] - p[hout].astype(np.int16)).mean()) if hout.any() else 0.0
    lut = np.clip((np.arange(256) - 235) * 255 / 20, 0, 255).astype(np.uint8)
    Image.fromarray(p.astype(np.uint8)).save(os.path.join(QA, f"{naam}__orig.png"))
    Image.fromarray(nieuw.astype(np.uint8)).save(os.path.join(QA, f"{naam}__nieuw.png"))
    Image.fromarray(lut[p.astype(np.uint8)]).save(os.path.join(QA, f"{naam}__orig_rek.png"))
    Image.fromarray(lut[nieuw.astype(np.uint8)]).save(os.path.join(QA, f"{naam}__nieuw_rek.png"))
    print(f"{naam}: buitenste 4 px max afwijking {afw4}; hout gem. verschil {dhout:.2f}; "
          f"{os.path.getsize(bron) // 1024} -> {os.path.getsize(doel) // 1024} kB")


def naam_uit(arg):
    n = os.path.basename(arg)
    n = n[:-4] if n.lower().endswith(".jpg") else n
    return n[:-7] if n.endswith("-podium") else n


if __name__ == "__main__":
    namen = [naam_uit(a) for a in (sys.argv[1:] or RENDERS)]
    ontbreekt = [n for n in namen if not os.path.exists(os.path.join(REPO, "assets", "img", f"{n}.jpg"))]
    if ontbreekt:                                     # eerst alles nakijken, dan pas schrijven
        sys.exit("Bron niet gevonden: " + ", ".join(f"assets/img/{n}.jpg" for n in ontbreekt))
    for n in namen:
        verwerk(n)
