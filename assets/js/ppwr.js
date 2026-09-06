"use strict";
const P = "’t Palletje";

/* ---------------- state ---------------- */
const S = {
  q1:null, ref:"", scope:null, q3:[], q4:[], q5:null,
  sub:{retour:null,eigenaar:null,inspectie:null,omlopen:null},
  q6:[], open:1, listBuilt:false
};

/* ---------------- vragen ---------------- */
const STEPS = [
  {n:1,key:"q1",type:"single",title:"Wat is uw directe vraag?",
   sub:"Bepaalt de kortste route door dit overzicht.",
   opts:[
     {v:"A",l:"Wij hebben alleen een leveranciersverklaring nodig.",note:"Kortste route: enkele productgegevens volstaan meestal."},
     {v:"B",l:"Wij bouwen een intern PPWR- of kwaliteitsdossier op."},
     {v:"C",l:"Wij moeten onze verkoop-, export-, verhuur- of retourstromen beoordelen."},
     {v:"D",l:"Wij weten nog niet precies wat wij nodig hebben.",note:"U doorloopt alle beslissingen en krijgt daarna een aanbevolen route."}
   ]},
  {n:2,key:"scope",type:"single",title:"Over welke producten gaat het?",
   sub:"Artikelniveau bepaalt welk bewijs gekoppeld kan worden.",
   weighted:"Productspecifieke documentatie kan alleen betrouwbaar worden gekoppeld wanneer het betrokken artikel of de voldoende onderbouwde productfamilie bekend is.",
   input:true,
   opts:[
     {v:"een",l:"Eén artikel."},
     {v:"meerdere",l:"Meerdere artikelen."},
     {v:"familie",l:"Volledige productfamilie."},
     {v:"onbekend",l:"Nog niet bekend."}
   ]},
  {n:3,key:"q3",type:"multi",title:"Waar en hoe wordt de verpakking gebruikt?",
   sub:"Meerdere antwoorden mogelijk.",
   opts:[
     {v:"be",l:"Uitsluitend in België."},
     {v:"eu",l:"Levering naar andere EU-lidstaten."},
     {v:"export",l:"Export buiten de Europese Unie."},
     {v:"onbekend",l:"Bestemming is nog niet definitief bekend."},
     {v:"meerdere",l:"Verschillende bestemmingen of handelsstromen."}
   ]},
  {n:4,key:"q4",type:"multi",title:"Wat gebeurt er met de verpakking?",
   sub:"Meerdere antwoorden mogelijk.",
   opts:[
     {v:"verkocht",l:"De verpakking wordt samen met het product verkocht of overgedragen."},
     {v:"eigendom",l:"De verpakking blijft eigendom van onze onderneming."},
     {v:"verhuur",l:"De verpakking wordt verhuurd of ter beschikking gesteld."},
     {v:"retour",l:"De verpakking keert normaal terug."},
     {v:"pool",l:"De verpakking komt in een pool- of retoursysteem."},
     {v:"onbekend",l:"Onbekend of afhankelijk van de klant."}
   ]},
  {n:5,key:"q5",type:"single",title:"Wordt herbruikbaarheid geclaimd?",
   sub:"Technisch gebruik en juridische kwalificatie zijn niet hetzelfde.",
   opts:[
     {v:"nee",l:"Nee, wij claimen geen herbruikbaarheid."},
     {v:"technisch",l:"Ja, de verpakking wordt technisch meermaals gebruikt."},
     {v:"systeem",l:"Ja, er bestaat een georganiseerde retour-, inspectie- en herstelstroom."},
     {v:"tebepalen",l:"Nog te bepalen."}
   ]},
  {n:6,key:"q6",type:"multi",title:"Geldt een bijzondere toepassing?",
   sub:"Meerdere antwoorden mogelijk.",
   opts:[
     {v:"voedsel",l:"Rechtstreeks contact met levensmiddelen."},
     {v:"verpakt",l:"Uitsluitend vervoer van verpakte producten."},
     {v:"adr",l:"Gevaarlijke goederen."},
     {v:"machine",l:"Individueel ontworpen verpakking voor grote machines, apparatuur of goederen."},
     {v:"geen",l:"Geen bijzondere toepassing."},
     {v:"onbekend",l:"Niet bekend."}
   ]}
];

const SUBQ = [
  {k:"retour",q:"Wie organiseert de retour?",o:["Onze onderneming","Onze klant","Derde partij","Nog te bepalen"]},
  {k:"eigenaar",q:"Wie blijft eigenaar?",o:["Onze onderneming","Onze klant","Contractueel gedeeld","Nog te bepalen"]},
  {k:"inspectie",q:"Wie inspecteert of herstelt?",o:["Onze onderneming","Externe partij","Onze klant","Nog te bepalen"]},
  {k:"omlopen",q:"Wordt het aantal omlopen geregistreerd?",o:["Ja","Nee","Nog te bepalen"]}
];

const FUNCTIES = "Logistiek · aankoop · verkoop · kwaliteit/compliance · directie of contractverantwoordelijke.";

/* ---------------- helpers ---------------- */
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ic = (id,size,cls) => `<svg class="ic ${cls||""}" width="${size||16}" height="${size||16}" viewBox="0 0 16 16" aria-hidden="true"><use href="#${id}"/></svg>`;
const has = (a,v) => a.indexOf(v) !== -1;
const label = (n,v) => { const st = STEPS.find(s=>s.n===n); const o = st.opts.find(o=>o.v===v); return o?o.l:v; };

function activeSteps(){ return S.q1==="A" ? [1,2,3,6] : [1,2,3,4,5,6]; }
function answered(n){
  if(n===1) return !!S.q1;
  if(n===2) return !!S.scope;
  if(n===3) return S.q3.length>0;
  if(n===4) return S.q4.length>0;
  if(n===5) return !!S.q5;
  if(n===6) return S.q6.length>0;
}
function progress(){
  const a = activeSteps(); const miss = a.filter(n=>!answered(n));
  const d = a.length - miss.length;
  return {done:d,total:a.length,pct:Math.round(d/a.length*100),missing:miss};
}

/* ---------------- afgeleide vlaggen ---------------- */
function flags(){
  const f = {};
  f.voedsel = has(S.q6,"voedsel");
  f.machine = has(S.q6,"machine");
  f.adr = has(S.q6,"adr");
  f.stroomMulti = has(S.q3,"meerdere") || has(S.q3,"onbekend") ||
    (["be","eu","export"].filter(v=>has(S.q3,v)).length>1);
  f.export = has(S.q3,"export");
  f.eigendomOnduidelijk = has(S.q4,"onbekend") ||
    (S.q4.length>1 && ["eigendom","verhuur","retour","pool"].some(v=>has(S.q4,v)) && has(S.q4,"verkocht"));
  f.eigendomStroom = ["eigendom","verhuur","retour","pool","onbekend"].some(v=>has(S.q4,v));
  f.hergebruikTechnisch = S.q5==="technisch";
  f.hergebruikSysteem = S.q5==="systeem";
  f.hergebruikOnbeslist = S.q5==="tebepalen";
  f.scopeOnduidelijk = S.scope==="onbekend" || (!S.ref.trim() && S.scope!=="onbekend");
  f.subOpen = SUBQ.filter(s=>S.sub[s.k]==="Nog te bepalen" || (S.q5==="systeem" && !S.sub[s.k]));
  return f;
}

function route(){
  const f = flags();
  if(S.q1==="B") return 2;
  if(S.q1==="C") return 3;
  if(S.q1==="A") return 1;
  if(S.q1==="D"){
    if(f.stroomMulti || f.export || f.eigendomStroom || f.hergebruikSysteem) return 3;
    if(["meerdere","familie","onbekend"].indexOf(S.scope)!==-1 || f.hergebruikTechnisch ||
       f.hergebruikOnbeslist || f.machine || f.adr) return 2;
    return 1;
  }
  return null;
}

const ROUTES = {
  1:{tag:"Route 1", name:P+" basisverklaring",
     fit:"Geschikt wanneer alleen algemene leveranciersinformatie nodig is, artikel en beoogd gebruik voldoende duidelijk zijn en geen uitgebreide handelsstroomanalyse wordt gevraagd.",
     actie:"Bezorg de minimale productgegevens aan uw vaste contactpersoon bij ’t Palletje.",
     owner:"Aankoop of de vaste contactpersoon die met ’t Palletje communiceert."},
  2:{tag:"Route 2", name:P+" technisch dossier",
     fit:"Geschikt wanneer een kwaliteits-, duurzaamheids- of complianceverantwoordelijke een intern dossier opbouwt, productspecificaties en leveranciersbewijs nodig zijn, of meerdere artikelen en productfamilies worden beoordeeld.",
     actie:"Bevestig de dossierscope en de gevraagde bewijsstukken, en duid intern één dossierverantwoordelijke aan.",
     owner:"Kwaliteit/compliance, als dossierverantwoordelijke, in afstemming met aankoop."},
  3:{tag:"Route 3", name:P+" handelsstroomroute",
     fit:"Geschikt wanneer producten nationaal en internationaal worden verkocht, modulaire eenheden worden verhuurd, verpakkingen terugkeren, verschillende eigendoms- en afvalstromen bestaan of Valipac- en EPR-verantwoordelijkheden moeten worden onderzocht.",
     actie:"Leg per handelsstroom vast wie eigenaar blijft, waar de verpakking afval wordt en wie registreert en rapporteert.",
     owner:"Directie of contractverantwoordelijke, samen met logistiek en verkoop."}
};

/* ---------------- inhoud per route ---------------- */
function build(){
  const r = route(), f = flags();
  const beslis=[], gegevens=[], docs=[], open=[];

  if(r===1){
    beslis.push("Bevestig het beoogde gebruik en de eindbestemming van het artikel.");
    beslis.push("Bepaal wie intern de verklaring bewaart en bij audits doorgeeft.");
    gegevens.push("Artikelnummer of productomschrijving.");
    gegevens.push("Land van gebruik of eindbestemming.");
    gegevens.push("Bevestiging dat geen rechtstreeks voedselcontact wordt beoogd.");
    gegevens.push("De concrete vraag van uw klant, auditor of kwaliteitssysteem.");
    docs.push("Beknopte PPWR-leveranciersverklaring.");
    docs.push("Beschikbare productscope.");
    docs.push("Relevante algemene informatie over materialen, traceerbaarheid en documentatiestatus.");
    docs.push("Verwijzing naar aanvullende productspecifieke informatie wanneer nodig.");
  }
  if(r===2){
    beslis.push("Welke artikelen onder het dossier vallen.");
    beslis.push("Het beoogde gebruik van die artikelen.");
    beslis.push("Welke claims intern of extern worden gemaakt.");
    beslis.push("Welke bewijsstukken de auditor of eindklant werkelijk vraagt.");
    beslis.push("Wie intern dossierverantwoordelijke is.");
    gegevens.push("Artikelnummers of de af te bakenen productfamilie.");
    gegevens.push("Beoogd gebruik en toepassing per artikel.");
    gegevens.push("De vraagstelling van auditor, klant of kwaliteitssysteem.");
    gegevens.push("Landen of handelsstromen waarop het dossier betrekking heeft.");
    docs.push("Productspecificaties.");
    docs.push("Materialen- en componenteninformatie.");
    docs.push("Relevante leveranciersverklaringen.");
    docs.push("Informatie over bevestigingsmiddelen en palletklossen.");
    docs.push("Productidentificatie en traceerbaarheid.");
    docs.push("Status van de productgebonden beoordeling.");
    docs.push("Beschikbare informatie over herstel, verwerking en hergebruik.");
  }
  if(r===3){
    beslis.push("Verkoop, verhuur of terbeschikkingstelling.");
    beslis.push("Wie juridisch eigenaar blijft.");
    beslis.push("In welke landen de verpakking wordt aangeboden of gebruikt.");
    beslis.push("Waar de verpakking naar verwachting afval wordt.");
    beslis.push("Of een retour- of poolsysteem bestaat.");
    beslis.push("Wie intern verantwoordelijk is voor registratie en rapportage.");
    beslis.push("Of herbruikbaarheid formeel wordt geclaimd.");
    gegevens.push("Artikelnummers of productfamilie binnen de betrokken stromen.");
    gegevens.push("Handelsstromen: landen, bestemmingen en eigendomsvorm.");
    gegevens.push("Of de verpakking terugkeert, en bij wie.");
    gegevens.push("Uw marktrol per stroom, voor zover intern bepaald.");
    docs.push("Informatie over de geleverde transportverpakking.");
    docs.push("Artikel- en productgegevens.");
    docs.push("Beschikbare technische documentatie.");
    docs.push("Informatie die nodig is om de handelsstroom te beoordelen.");
    docs.push("Leveranciersbewijs binnen de toepasselijke productscope.");
  }

  /* dynamische toevoegingen */
  if(S.scope==="onbekend" || (!S.ref.trim() && S.scope)){
    gegevens.unshift("Artikelnummer of productomschrijving — nog te bezorgen.");
    open.push("Productspecifieke informatie nodig: zonder artikel of onderbouwde productfamilie kan documentatie niet betrouwbaar worden gekoppeld.");
  }
  if(f.stroomMulti){
    open.push("Een afzonderlijke beoordeling per relevante handelsstroom kan nodig zijn.");
    beslis.push("Bepaal welke handelsstromen afzonderlijk worden beoordeeld en gedocumenteerd.");
  }
  if(f.export) beslis.push("Bepaal wie de rol en verplichtingen buiten de EU opvolgt.");
  if(f.eigendomStroom || f.eigendomOnduidelijk){
    beslis.push("Interne beslissing vereist: bevestig eigendom, retour, verhuur of poolstatus. Te bevestigen door " + FUNCTIES.toLowerCase());
  }
  if(f.hergebruikTechnisch){
    open.push("Technisch opnieuw gebruiken is niet automatisch hetzelfde als juridisch als herbruikbare verpakking kwalificeren. Onderbouwing van ontwerp, omlopen, retour, inspectie, herstel en registratie kan nodig zijn.");
    beslis.push("Beslis of herbruikbaarheid formeel wordt geclaimd, en met welke onderbouwing.");
  }
  if(f.hergebruikOnbeslist) beslis.push("Interne beslissing vereist: wordt herbruikbaarheid geclaimd, ja of nee.");
  if(f.hergebruikSysteem){
    docs.push("Beschikbare informatie over herstel, inspectie en hergebruik van het geleverde artikel.");
    f.subOpen.forEach(s=>beslis.push("Interne beslissing vereist: " + s.q.replace("?","") + " — nog te bepalen."));
    SUBQ.forEach(s=>{ if(S.sub[s.k] && S.sub[s.k]!=="Nog te bepalen") open.push(s.q + " " + S.sub[s.k] + "."); });
  }
  if(f.adr) open.push("Gevaarlijke goederen: aanvullende beoordeling nodig naast de PPWR-documentatie.");
  if(f.machine) open.push("Mogelijke bijzondere beoordeling. Het feit dat een verpakking op maat is gemaakt, volstaat op zichzelf niet om een uitzondering toe te passen.");
  if(has(S.q6,"onbekend")) open.push("Bijzondere toepassing nog niet bekend: bevestig intern of voedselcontact, gevaarlijke goederen of maatwerk voor grote apparatuur van toepassing is.");
  if(S.q1==="A" && (f.stroomMulti || f.eigendomStroom || f.hergebruikSysteem))
    open.push("Uw antwoorden wijzen op meerdere stromen of eigendomsvormen. Route 3 kan een betere aansluiting geven dan de basisverklaring.");

  return {r,f,beslis,gegevens,docs,open};
}

/* ---------------- render: stappen ---------------- */
function renderRail(){
  const act = activeSteps();
  let h = "";
  STEPS.forEach(st=>{
    const on = has(act,st.n), done = answered(st.n), open = S.open===st.n;
    h += `<div class="step ${on?"":"hidden"} ${done?"done":""} ${open?"open":""} ${(!done&&!open)?"todo":""}" data-step="${st.n}">
      <div class="marker">${done && !open ? ic("i-check",13) : "S"+st.n}</div>
      <div class="card">
        <button class="step-head" data-head="${st.n}" aria-expanded="${open}">
          <span>
            <span class="step-title">${esc(st.title)}</span>
            <span class="step-sub">${done ? esc(summary(st.n)) : (open ? esc(st.sub) : "Nog te beantwoorden")}</span>
          </span>
          ${ic("i-chev",16,"chev")}
        </button>
        ${open ? `<div class="step-body">${body(st)}</div>` : ""}
      </div>
    </div>`;
  });
  h += `<div style="margin-top:16px"><button class="linkbtn muted" data-reset>Opnieuw beginnen</button></div>`;
  document.getElementById("rail").innerHTML = h;
}

function summary(n){
  if(n===1) return "Keuze " + S.q1 + " — " + shorten(label(1,S.q1));
  if(n===2) return (S.ref.trim() ? S.ref.trim() + " · " : "") + shorten(label(2,S.scope));
  if(n===3) return S.q3.map(v=>shorten(label(3,v))).join(" · ");
  if(n===4) return S.q4.map(v=>shorten(label(4,v))).join(" · ");
  if(n===5) return shorten(label(5,S.q5));
  if(n===6) return S.q6.map(v=>shorten(label(6,v))).join(" · ");
  return "";
}
function shorten(s){ s = s.replace(/\.$/,""); return s.length>58 ? s.slice(0,56)+"…" : s; }

function body(st){
  let h = "";
  if(st.weighted) h += `<p class="qhelp weighted">${esc(st.weighted)}</p>`;
  if(st.input){
    h += `<div class="field"><label for="ref">Artikelnummer of productomschrijving</label>
      <input id="ref" type="text" value="${esc(S.ref)}" placeholder="bv. PAL-1208-HT of ‘exportkist 120×80’" autocomplete="off"></div>`;
  }
  if(st.type==="multi") h += `<p class="multi-hint">Meerdere antwoorden mogelijk</p>`;
  h += `<div class="opts">`;
  st.opts.forEach(o=>{
    const sel = st.type==="multi" ? has(S[st.key],o.v) : S[st.key]===o.v;
    h += `<button class="opt" data-opt="${st.n}" data-val="${o.v}" aria-pressed="${sel}">
      <span class="box ${st.type==="single"?"round":""}">${ic("i-check",11)}</span>
      <span class="opt-label">${esc(o.l)}${o.note?`<span class="opt-note">${esc(o.note)}</span>`:""}</span></button>`;
  });
  h += `</div>`;

  /* contextuele notities in de stap zelf */
  if(st.n===3 && flags().stroomMulti)
    h += note("Handelsstroom","Een afzonderlijke beoordeling per relevante handelsstroom kan nodig zijn.");
  if(st.n===4 && (flags().eigendomStroom || flags().eigendomOnduidelijk))
    h += note("Interne beslissing vereist","Eigendom, retour, verhuur of pool wordt normaal bevestigd door: " + FUNCTIES);
  if(st.n===5 && S.q5==="technisch")
    h += note("Aanvullende beoordeling nodig","Technisch opnieuw gebruiken is niet automatisch hetzelfde als juridisch als herbruikbare verpakking kwalificeren. Onderbouwing van ontwerp, omlopen, retour, inspectie, herstel en registratie kan nodig zijn.");
  if(st.n===5 && S.q5==="systeem"){
    h += `<div class="subblock"><p class="multi-hint">Vier korte vragen over het systeem</p>`;
    SUBQ.forEach(s=>{
      h += `<div class="subq"><h4>${esc(s.q)}</h4><div class="chips">`;
      s.o.forEach(v=>{
        h += `<button class="chip" data-sub="${s.k}" data-val="${esc(v)}" aria-pressed="${S.sub[s.k]===v}">${esc(v)}</button>`;
      });
      h += `</div></div>`;
    });
    h += `</div>`;
  }
  if(st.n===6 && has(S.q6,"voedsel"))
    h += note("Stop","Vraag eerst een productspecifieke schriftelijke bevestiging. De standaarddocumentatie van ’t Palletje gaat uit van industriële logistieke toepassingen en niet van rechtstreeks voedselcontact.");
  if(st.n===6 && has(S.q6,"machine"))
    h += note("Mogelijke bijzondere beoordeling","Het feit dat een verpakking op maat is gemaakt, volstaat op zichzelf niet om een uitzondering toe te passen.");

  h += `<div class="step-foot">`;
  if(st.n>1) h += `<button class="linkbtn" data-go="${prevStep(st.n)}">Vorige vraag</button>`;
  if(nextStep(st.n)) h += `<button class="linkbtn" data-go="${nextStep(st.n)}">Volgende vraag</button>`;
  h += `</div>`;
  return h;
}
function note(t,b){ return `<div class="inline-note"><strong>${esc(t)}</strong>${esc(b)}</div>`; }
function nextStep(n){ const a=activeSteps(); const i=a.indexOf(n); return i>=0 && i<a.length-1 ? a[i+1] : null; }
function prevStep(n){ const a=activeSteps(); const i=a.indexOf(n); return i>0 ? a[i-1] : a[0]; }

/* ---------------- render: paneel ---------------- */
function renderPanel(){
  const p = progress();
  const d = build();
  const r = d.r;
  let h = `<div class="progress"><span class="eyebrow">Uitkomst</span><span class="bar"><i style="width:${p.pct}%"></i></span><span class="pct">${p.done}/${p.total}</span></div>`;

  if(!S.q1){
    h += `<h2>Nog geen route</h2>
      <p class="route-fit">Beantwoord vraag S1 om de aanbevolen route te zien. De uitkomst past zich bij iedere keuze onmiddellijk aan.</p>
      <div class="blk"><p class="empty">Deze beslisroute geeft geen conformiteitsoordeel. Ze toont welke beslissingen bij u liggen, welke gegevens ’t Palletje nodig heeft en welke documentatie wij kunnen ondersteunen.</p></div>`;
    document.getElementById("panel").innerHTML = h;
    return;
  }

  h += `<span class="route-tag">${ic("i-route",14)} Aanbevolen route · ${ROUTES[r].tag}</span>
        <h2>${esc(ROUTES[r].name)}</h2>
        <p class="route-fit">${esc(ROUTES[r].fit)}</p>`;

  if(d.f.voedsel){
    h += `<div class="alert"><div class="eyebrow">Stop — eerst bevestigen</div>Vraag eerst een productspecifieke schriftelijke bevestiging. De standaarddocumentatie van ’t Palletje gaat uit van industriële logistieke toepassingen en niet van rechtstreeks voedselcontact.</div>`;
  }

  h += blk("i-klant","Beslissingen die uw onderneming nog moet nemen","c-klant","Door klant te beslissen",d.beslis,"klant");
  h += blk("i-samen","Gegevens die ’t Palletje nodig heeft","c-samen","Gezamenlijk af te stemmen",d.gegevens,"samen");
  h += blk("i-pal","Documentatie die ’t Palletje kan ondersteunen","c-pal","Door ’t Palletje te documenteren",d.docs,"pal");

  if(r===2) h += `<p class="quality">Leveranciersbewijs wordt uitsluitend gekoppeld aan de component en het palletartikel waarop het werkelijk van toepassing is.</p>`;
  if(r===3) h += `<p class="quality">’t Palletje levert productinformatie. De klant beslist en documenteert zijn eigen gebruik, export, verhuur, retourstromen en wettelijke marktrol.</p>`;
  if(r===1) h += `<p class="quality">Niet meer documentatie dan nodig. Niet minder bewijs dan vereist.</p>`;

  h += `<div class="blk"><div class="blk-head">${ic("i-klant",16)}<h3>Aanbevolen interne eigenaar van de volgende actie</h3></div>
        <div class="owner">${esc(ROUTES[r].owner)}<br><span style="color:var(--ink-3)">Volgende actie: ${esc(ROUTES[r].actie)}</span></div></div>`;

  h += `<div class="blk"><div class="blk-head">${ic("i-open",16)}<h3>Open punten of bijzondere beoordeling</h3></div>`;
  h += d.open.length
    ? `<ul class="list">${d.open.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`
    : `<p class="empty">Op basis van uw antwoorden zijn er geen bijkomende aandachtspunten aangeduid.</p>`;
  h += `</div>`;

  const miss = p.missing;
  h += `<div class="cta">
      <button class="btn" data-makelist>Maak mijn actielijst</button>
      ${miss.length?`<button class="linkbtn" data-jump="${miss[0]}" style="align-self:center">Nog open: S${miss[0]} — ${esc(STEPS.find(s=>s.n===miss[0]).title)}</button>`:""}
    </div>`;

  document.getElementById("panel").innerHTML = h;
}
function blk(icon,title,cls,tag,items,liCls){
  return `<div class="blk"><div class="blk-head">${ic(icon,16)}<h3>${title}</h3><span class="tag ${cls}">${tag}</span></div>
    ${items.length?`<ul class="list">${items.map(x=>`<li class="${liCls}">${esc(x)}</li>`).join("")}</ul>`:`<p class="empty">Nog niet van toepassing.</p>`}</div>`;
}

/* ---------------- render: actielijst ---------------- */
function renderChecklist(){
  const el = document.getElementById("checklist");
  if(!S.listBuilt){ el.hidden = true; return; }
  el.hidden = false;
  const d = build(), r = d.r;
  const cl = (items,cls)=>items.map(x=>`<div class="cl-item"><input type="checkbox"><span class="${cls}">${esc(x)}</span></div>`).join("");
  el.innerHTML = `
    <div class="cl-head">
      <div><span class="eyebrow">Actielijst · ${ROUTES[r].tag} · ${esc(ROUTES[r].name)}</span>
        <h2>Uw volgende stappen${S.ref.trim()?" — "+esc(S.ref.trim()):""}</h2></div>
      <div class="cta" style="margin:0">
        <button class="btn ghost" data-print>Afdrukken of als PDF bewaren</button>
        <button class="btn ghost" data-copy>Kopieer als tekst</button>
        <span class="toast" id="toast"></span>
      </div>
    </div>
    <div class="cl-grid">
      <div class="cl-col"><h3>${ic("i-klant",15)} Uw onderneming beslist</h3>${cl(d.beslis)}</div>
      <div class="cl-col"><h3>${ic("i-samen",15)} Aan ’t Palletje te bezorgen</h3>${cl(d.gegevens)}
        ${d.open.length?`<h3 style="margin-top:14px">${ic("i-open",15)} Open punten</h3>${cl(d.open)}`:""}</div>
      <div class="cl-col"><h3>${ic("i-pal",15)} ’t Palletje kan ondersteunen</h3>${cl(d.docs)}
        <h3 style="margin-top:14px">${ic("i-route",15)} Volgende actie</h3>
        <div class="cl-item"><input type="checkbox"><span>${esc(ROUTES[r].actie)} — eigenaar: ${esc(ROUTES[r].owner)}</span></div></div>
    </div>`;
}

/* ---------------- render: printblad ---------------- */
function renderPrint(){
  const d = build(), r = d.r;
  const stamp = new Date().toLocaleDateString("nl-BE",{day:"2-digit",month:"2-digit",year:"numeric"});
  const qa = [];
  const push=(t,v)=>{ if(v) qa.push(`<div class="p-qa"><b>${t}</b>${esc(v)}</div>`); };
  push("S1 · Directe vraag", S.q1?("Keuze "+S.q1+" — "+label(1,S.q1)):"");
  push("S2 · Producten", (S.ref.trim()?S.ref.trim()+" — ":"") + (S.scope?label(2,S.scope):""));
  push("S3 · Gebruik en bestemming", S.q3.map(v=>label(3,v)).join(" "));
  if(S.q1!=="A") push("S4 · Wat gebeurt met de verpakking", S.q4.map(v=>label(4,v)).join(" "));
  if(S.q1!=="A") push("S5 · Herbruikbaarheid", S.q5?label(5,S.q5):"");
  if(S.q5==="systeem") SUBQ.forEach(s=>push("· "+s.q, S.sub[s.k]||"Nog te bepalen"));
  push("S6 · Bijzondere toepassing", S.q6.map(v=>label(6,v)).join(" "));

  const done = new Set();
  document.querySelectorAll("#checklist .cl-item input:checked").forEach(i=>{
    const sp = i.nextElementSibling; if(sp) done.add(sp.textContent.trim());
  });
  const ul = a => a.length
    ? `<ul>${a.map(x=>`<li class="chk${done.has(x)?" on":""}">${esc(x)}</li>`).join("")}</ul>`
    : `<ul><li>Geen punten aangeduid.</li></ul>`;
  const claim = r===2 ? "Leveranciersbewijs wordt uitsluitend gekoppeld aan de component en het palletartikel waarop het werkelijk van toepassing is."
    : r===3 ? "’t Palletje levert productinformatie. De klant beslist en documenteert zijn eigen gebruik, export, verhuur, retourstromen en wettelijke marktrol."
    : "Niet meer documentatie dan nodig. Niet minder bewijs dan vereist.";

  document.getElementById("printsheet").innerHTML = `
  <div class="p-head">
    <div>
      <div class="p-brand">’t Palletje · beslisroute · houten transportverpakkingen</div>
      <h1>Welke PPWR-route past bij uw onderneming?</h1>
      ${r?`<p class="p-route">${ROUTES[r].tag} · ${esc(ROUTES[r].name)}</p>
      <p class="p-claim">${esc(claim)}</p>`:`<p class="p-route">Nog geen route bepaald</p>`}
    </div>
    <div class="p-meta">Werkfiche · ${stamp}<br>${S.ref.trim()?esc(S.ref.trim()):"artikel nog te bevestigen"}<br>Aanbevolen route — geen conformiteitsverklaring</div>
  </div>
  ${d.f.voedsel?`<div class="p-flag"><b>Stop — rechtstreeks voedselcontact:</b> vraag eerst een productspecifieke schriftelijke bevestiging. De standaarddocumentatie van ’t Palletje gaat uit van industriële logistieke toepassingen.</div>`:""}
  <div class="p-cols">
    <div class="p-col"><h2 class="samen">Uw antwoorden</h2>${qa.join("")}
      <h2>Interne eigenaar volgende actie</h2><ul><li>${r?esc(ROUTES[r].owner):"—"}</li><li>${r?esc(ROUTES[r].actie):"—"}</li></ul></div>
    <div class="p-col"><h2>Door uw onderneming te beslissen</h2>${ul(d.beslis)}
      <h2>Open punten of bijzondere beoordeling</h2>${ul(d.open)}</div>
    <div class="p-col"><h2 class="samen">Aan ’t Palletje te bezorgen</h2>${ul(d.gegevens)}
      <h2 class="pal">’t Palletje kan ondersteunen</h2>${ul(d.docs)}</div>
  </div>
  <div class="p-tl">
    <div><h3>12 augustus 2026 — nu</h3><ul><li>Algemeen PPWR-kader toepasselijk</li><li>Rollen en handelsstromen identificeren</li><li>Belgische EPR- en registratiepositie controleren</li><li>Productinformatie en traceerbaarheid organiseren</li><li>Regels voor voedselcontact respecteren</li></ul></div>
    <div><h3>2028–2029 — volgende fase</h3><ul><li>Bepaalde geharmoniseerde etiketterings- en informatievereisten</li><li>Verdere uitvoeringsregels volgen</li><li>Dossiers en communicatie actualiseren</li></ul></div>
    <div><h3>Vanaf 2030 — verdere eisen</h3><ul><li>Vereisten rond recycleerbaarheid</li><li>Verpakkingsminimalisatie</li><li>Hergebruikdoelstellingen waar van toepassing</li><li>Verdere product- en systeemonderbouwing</li></ul></div>
  </div>
  <div class="p-foot">
    <span class="p-disc">Deze beslisroute is algemene ondersteuning en geen juridisch advies of automatische conformiteitsbeoordeling. De uiteindelijke beoordeling hangt af van het concrete product, gebruik, handelsstroom, de toepasselijke marktrol en de geldende regelgeving. Niet alle PPWR-verplichtingen gelden vanaf dezelfde datum.</span>
    <span class="p-sig">’t Palletje BV — houten transportverpakkingen<br>PPWR-documentatie op productniveau</span>
  </div>`;
}

/* ---------------- tekstexport ---------------- */
function asText(){
  const d = build(), r = d.r, L = [];
  L.push("’t Palletje — PPWR-beslisroute");
  L.push(r ? ROUTES[r].tag + ": " + ROUTES[r].name : "Nog geen route bepaald");
  if(S.ref.trim()) L.push("Artikel: " + S.ref.trim());
  L.push("");
  L.push("UW ANTWOORDEN");
  if(S.q1) L.push("- S1 " + label(1,S.q1));
  if(S.scope) L.push("- S2 " + label(2,S.scope));
  if(S.q3.length) L.push("- S3 " + S.q3.map(v=>label(3,v)).join(" "));
  if(S.q4.length) L.push("- S4 " + S.q4.map(v=>label(4,v)).join(" "));
  if(S.q5) L.push("- S5 " + label(5,S.q5));
  if(S.q5==="systeem") SUBQ.forEach(s=>L.push("  · " + s.q + " " + (S.sub[s.k]||"Nog te bepalen")));
  if(S.q6.length) L.push("- S6 " + S.q6.map(v=>label(6,v)).join(" "));
  const sec=(t,a)=>{ L.push(""); L.push(t); a.forEach(x=>L.push("[ ] " + x)); };
  sec("DOOR UW ONDERNEMING TE BESLISSEN", d.beslis);
  sec("AAN ’T PALLETJE TE BEZORGEN", d.gegevens);
  sec("’T PALLETJE KAN ONDERSTEUNEN", d.docs);
  if(d.open.length) sec("OPEN PUNTEN OF BIJZONDERE BEOORDELING", d.open);
  if(r){ L.push(""); L.push("VOLGENDE ACTIE: " + ROUTES[r].actie); L.push("INTERNE EIGENAAR: " + ROUTES[r].owner); }
  L.push("");
  L.push("Algemene ondersteuning, geen juridisch advies of automatische conformiteitsbeoordeling.");
  L.push("’t Palletje BV — houten transportverpakkingen — PPWR-documentatie op productniveau");
  return L.join("\n");
}

/* ---------------- render alles ---------------- */
function render(){ renderRail(); renderPanel(); renderChecklist(); renderPrint(); }

/* ---------------- events ---------------- */
document.addEventListener("click", e=>{
  const head = e.target.closest("[data-head]");
  if(head){ const n = +head.dataset.head; S.open = (S.open===n?0:n); render(); focusStep(n); return; }

  const go = e.target.closest("[data-go]");
  if(go){ S.open = +go.dataset.go; render(); focusStep(S.open); return; }

  const jump = e.target.closest("[data-jump]");
  if(jump){ jumpTo(+jump.dataset.jump); return; }

  const opt = e.target.closest("[data-opt]");
  if(opt){
    const n = +opt.dataset.opt, v = opt.dataset.val, st = STEPS.find(s=>s.n===n);
    if(st.type==="single"){
      S[st.key] = v;
      if(n===1 && v==="A"){ S.q4=[]; S.q5=null; }
      if(n===5 && v!=="systeem") S.sub = {retour:null,eigenaar:null,inspectie:null,omlopen:null};
      const nx = nextStep(n);
      S.open = (n===5 && v==="systeem") ? 5 : (nx || 0);
    }else{
      const arr = S[st.key];
      const excl = (n===3 ? ["be","onbekend"] : n===6 ? ["geen","onbekend"] : []);
      const i = arr.indexOf(v);
      if(i>=0) arr.splice(i,1);
      else if(has(excl,v)) S[st.key] = [v];
      else{
        excl.forEach(x=>{ const j=S[st.key].indexOf(x); if(j>=0) S[st.key].splice(j,1); });
        S[st.key].push(v);
      }
    }
    render();
    return;
  }

  const sub = e.target.closest("[data-sub]");
  if(sub){ S.sub[sub.dataset.sub] = (S.sub[sub.dataset.sub]===sub.dataset.val ? null : sub.dataset.val); render(); return; }

  if(e.target.closest("[data-makelist]")){
    const miss = progress().missing;
    if(miss.length){ jumpTo(miss[0]); return; }
    S.listBuilt = true; render();
    document.getElementById("checklist").scrollIntoView({behavior:"smooth",block:"start"});
    return;
  }
  if(e.target.closest("[data-print]")){ window.print(); return; }
  if(e.target.closest("[data-copy]")){
    const t = asText();
    const done = ()=>{ const el=document.getElementById("toast"); if(el){ el.textContent="Gekopieerd."; setTimeout(()=>el.textContent="",2500);} };
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(done,()=>fallback(t,done)); }
    else fallback(t,done);
    return;
  }
  if(e.target.closest("[data-reset]")){
    S.q1=null;S.ref="";S.scope=null;S.q3=[];S.q4=[];S.q5=null;S.q6=[];S.listBuilt=false;
    S.sub={retour:null,eigenaar:null,inspectie:null,omlopen:null};S.open=1;
    render(); window.scrollTo({top:0,behavior:"smooth"});
  }
});
function fallback(t,cb){
  const ta=document.createElement("textarea"); ta.value=t; ta.style.position="fixed"; ta.style.opacity="0";
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand("copy"); cb(); }catch(err){}
  document.body.removeChild(ta);
}
document.addEventListener("input", e=>{
  if(e.target.id==="ref"){ S.ref = e.target.value; renderPanel(); renderChecklist(); renderPrint(); }
});
function focusStep(n){
  const el = document.querySelector('[data-step="'+n+'"] .step-head');
  if(el && window.innerWidth<=900) el.scrollIntoView({behavior:"smooth",block:"center"});
}
function jumpTo(n){
  S.open = n; render();
  const el = document.querySelector('[data-step="'+n+'"]');
  if(el) el.scrollIntoView({behavior:"smooth",block:"center"});
}
window.addEventListener("beforeprint", renderPrint);
render();
