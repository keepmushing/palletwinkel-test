"use client";

import { useMemo, useState } from "react";

const products = [
  { code: "01", title: "Pallets op maat", text: "Gebouwd rond uw product, belasting, opslag en transport." },
  { code: "02", title: "Export & HT", text: "ISPM 15-conforme oplossingen voor internationale zendingen." },
  { code: "03", title: "Kisten & skids", text: "Robuuste houten verpakkingen voor machines en componenten." },
];

const steps = ["Afmetingen doorgeven", "Technische controle", "Heldere offerte", "Productie & levering"];

export default function Home() {
  const [length, setLength] = useState("1200");
  const [width, setWidth] = useState("800");
  const [quantity, setQuantity] = useState("100");
  const [use, setUse] = useState("Eenmalig transport");

  const summary = useMemo(() => {
    const l = Number(length) || 0;
    const w = Number(width) || 0;
    const q = Number(quantity) || 0;
    return `${l} × ${w} mm · ${q} stuks · ${use}`;
  }, [length, width, quantity, use]);

  return (
    <main>
      <header className="nav-wrap">
        <a className="brand" href="#top" aria-label="Palletwinkel home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>PALLET<span>WINKEL</span></span>
        </a>
        <nav aria-label="Hoofdnavigatie">
          <a href="#oplossingen">Oplossingen</a>
          <a href="#werkwijze">Werkwijze</a>
          <a href="#waarom">Waarom wij</a>
        </nav>
        <a className="button button-small" href="#configurator">Start configurator <span>↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> Industriële houten verpakking</p>
          <h1>De juiste pallet.<br /><em>Zonder omwegen.</em></h1>
          <p className="lead">Pallets, kisten en skids op maat. Snel berekend, technisch gecontroleerd en gebouwd voor uw product.</p>
          <div className="hero-actions">
            <a className="button" href="#configurator">Stel uw pallet samen <span>→</span></a>
            <a className="text-link" href="#offerte">Of upload uw project <span>↗</span></a>
          </div>
          <div className="trust-row">
            <span><b>✓</b> Maatwerk</span><span><b>✓</b> Snelle omschakeling</span><span><b>✓</b> HT mogelijk</span>
          </div>
        </div>
        <div className="hero-visual" aria-label="Technische illustratie van een houten pallet">
          <div className="measure measure-x">1200 mm</div>
          <div className="measure measure-y">800 mm</div>
          <div className="pallet">
            <div className="deck">{Array.from({ length: 7 }).map((_, i) => <i key={i} />)}</div>
            <div className="blocks">{Array.from({ length: 6 }).map((_, i) => <i key={i} />)}</div>
            <div className="runners"><i /><i /><i /></div>
          </div>
          <div className="spec-card"><small>PROJECT</small><strong>PW–0248</strong><span>MAATWERK / EXPORT</span></div>
        </div>
      </section>

      <section className="metric-strip" aria-label="Kerncijfers">
        <div><strong>≤ 5 min</strong><span>gerichte omschakeltijd</span></div>
        <div><strong>3 routes</strong><span>pallet · kist · skid</span></div>
        <div><strong>1 aanspreekpunt</strong><span>van vraag tot levering</span></div>
      </section>

      <section className="section" id="oplossingen">
        <div className="section-head"><div><p className="eyebrow"><span /> Wat we maken</p><h2>Geen catalogusdenken.<br />Wel de juiste constructie.</h2></div><p>We vertrekken van uw lading en logistiek. Zo betaalt u voor wat nodig is — en niet voor overbodig hout, gewicht of complexiteit.</p></div>
        <div className="product-grid">
          {products.map((p) => <article key={p.code}><span>{p.code}</span><div className={`product-icon icon-${p.code}`} aria-hidden="true"><i /><i /><i /></div><h3>{p.title}</h3><p>{p.text}</p><a href="#configurator">Project starten →</a></article>)}
        </div>
      </section>

      <section className="config-section" id="configurator">
        <div className="config-intro">
          <p className="eyebrow light"><span /> Snelle aanvraag</p>
          <h2>Van afmetingen<br />naar een maakbaar plan.</h2>
          <p>Geef de basis door. Wij controleren belasting, houtsecties, ondersteuning en exportvereisten vóór u een offerte ontvangt.</p>
          <ol>{steps.map((s, i) => <li key={s}><b>0{i + 1}</b><span>{s}</span></li>)}</ol>
        </div>
        <form className="config-card" id="offerte" onSubmit={(e) => e.preventDefault()}>
          <div className="config-top"><span>PALLETCONFIGURATOR</span><small>Stap 1 / basis</small></div>
          <label>Lengte <span>mm</span><input inputMode="numeric" value={length} onChange={(e) => setLength(e.target.value)} aria-label="Lengte in millimeter" /></label>
          <label>Breedte <span>mm</span><input inputMode="numeric" value={width} onChange={(e) => setWidth(e.target.value)} aria-label="Breedte in millimeter" /></label>
          <label>Aantal <span>stuks</span><input inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} aria-label="Aantal stuks" /></label>
          <label>Gebruik<select value={use} onChange={(e) => setUse(e.target.value)}><option>Eenmalig transport</option><option>Meermalig gebruik</option><option>Export buiten EU</option><option>Opslag / productie</option></select></label>
          <div className="config-summary"><small>UW BASIS</small><strong>{summary}</strong></div>
          <a className="button config-button" href={`mailto:info@palletwinkel.com?subject=Aanvraag pallet ${length}x${width}&body=${encodeURIComponent(summary)}`}>Vraag technische controle <span>→</span></a>
          <p className="privacy-note">Geen automatische bestelling. Eerst controle door een specialist.</p>
        </form>
      </section>

      <section className="section split" id="waarom">
        <div><p className="eyebrow"><span /> Waarom Palletwinkel</p><h2>Gebouwd voor variatie.<br />Ingericht op snelheid.</h2></div>
        <div className="benefits">
          <article><b>01</b><div><h3>Sneller wisselen</h3><p>Een productie-opstelling die maatwerk niet als verstoring behandelt.</p></div></article>
          <article><b>02</b><div><h3>Technisch meedenken</h3><p>Constructie, stapeling en transport worden samen bekeken.</p></div></article>
          <article><b>03</b><div><h3>Van klein naar schaal</h3><p>Prototypes, herhaalorders en grotere volumes binnen één werkwijze.</p></div></article>
        </div>
      </section>

      <section className="process" id="werkwijze"><p className="eyebrow light"><span /> Werkwijze</p><h2>Vier stappen. Eén duidelijke lijn.</h2><div>{steps.map((s, i) => <article key={s}><b>0{i + 1}</b><span>{s}</span>{i < 3 && <i>→</i>}</article>)}</div></section>

      <footer>
        <div className="footer-main"><div><a className="brand brand-footer" href="#top"><span className="brand-mark"><i /><i /><i /></span><span>PALLET<span>WINKEL</span></span></a><p>Pallets en houten verpakkingen op maat.<br />Gebouwd in West-Vlaanderen.</p></div><div><small>START UW AANVRAAG</small><a className="footer-cta" href="#configurator">Naar de configurator <span>↗</span></a></div></div>
        <div className="footer-bottom"><span>© 2026 Palletwinkel</span><span>Privacy · Voorwaarden</span><span>Een initiatief van Biselco</span></div>
      </footer>
    </main>
  );
}
