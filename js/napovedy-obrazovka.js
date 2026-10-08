/* ============================================================
   POPISY REŽIMOV A NÁPOVEDY K TLAČIDLÁM
   Nad filtrami je vždy veta o tom, čo sa v zvolenom režime robí.
   Každé tlačidlo má krátke vysvetlenie, ktoré sa ukáže, keď nad
   ním podržíš myš.
   ============================================================ */
function modeHelpKey() {
  const F = state.filters, m = state.mode;
  if (m === 'aircraft' && F.acMode === 'cmp') return 'aircraft.cmp';
  if (m === 'airport')  return 'airport.' + F.apMode;
  if (m === 'callsign') return 'callsign.' + F.csMode;
  if (m === 'waypoint') return 'waypoint.' + F.wpMode;
  if (m === 'heading')  return 'heading.' + (F.hgMode === 'static' ? 'static' : F.hgMode === 'calc' ? 'calc' : F.hgKind);
  if (m === 'coord')    return 'coord.' + F.coMode;
  if (m === 'daily' || m === 'exam') return m;
  return m;
}
function renderModeHelp() {
  const el = document.getElementById('filters');
  if (!el) return;
  const k = modeHelpKey(), H = HELP[k];
  el.insertAdjacentHTML('afterbegin', `<div class="mode-help">
      <div><strong>ČO TU ROBÍŠ</strong>${H ? `<span class="mh-steps">${H[1].map((x, i) => `<i>${i + 1}</i>${x[1]}`).join('<u>›</u>')}</span>` : ''}</div>
      ${H ? `<button class="hp-open" data-hp="${k}">❓ AKO NA TO</button>` : ''}
    </div>`);
}

/* kľúč = „atribút=hodnota" z data-* tlačidla, alebo jeho id s # */
const TIPS = {
  '#btn-demo': 'Pustí krátku ukážku na tejto otázke: ukáže, kde je zadanie, sama správne odpovie a vysvetlí, čo nasleduje. Do skóre sa nezapočíta.',
  'acmode=id': 'Na fotke je jedno lietadlo a ty určíš jeho typ.', 'acmode=cmp': 'Dve podobné lietadlá vedľa seba — vyberáš, ktoré je ktoré.',
  'hgmode=calc': 'Úlohy na počítanie s kurzom: opačný kurz, zatáčka o X stupňov, kratšia zatáčka.',
  'hckind=all': 'Všetky tri typy úloh namiešané.', 'hckind=recip': 'Len opačný kurz (kurz ± 180).', 'hckind=turn': 'Len nový kurz po zatáčke o daný počet stupňov.', 'hckind=short': 'Len: ktorým smerom je zatáčka kratšia.',
  'comode=scen': 'Celý let krok za krokom: bod, hladina, podmienka, frekvencia.',
  'mode=daily': 'Dnešný tréning — namiešané otázky zo všetkých modulov podľa toho, čo máš opakovať.',
  'mode=exam': 'Skúška — na čas, bez nápovedí, výsledok na konci.',
  'dans=choice': 'Odpovedáš výberom z možností (klávesy 1 až 6).', 'dans=type': 'Odpovede píšeš z hlavy.',
  'exn': 'Koľko otázok bude mať skúška.', 'exmin': 'Časový limit skúšky.', 'dcount': 'Koľko otázok bude mať dnešný tréning.',
  '#exam-go': 'Spustí skúšku a časomieru.', '#exam-fix': 'Pustí len otázky, ktoré si v skúške pokazil.', '#exam-again': 'Nová skúška s inými otázkami.',
  '#btn-report': 'Otvorí e-mail tvorcovi so správou, v ktorej je už vyplnené, v ktorom module a pri ktorej otázke si. Dopíš, čo je zle.',
  'mode=home': 'Úvod — návod, čo je v ktorom module a ako sa s trenažérom učiť.',
  'go': 'Otvorí tento modul.',
  'mode=coord': 'MOD 06 — koordinačné body, hladiny na nich a frekvencie susedných stanovíšť.',
  'comode=cop': 'Koordinačné body na mape: ktorému susedovi patria a kde ležia.', 'comode=freq': 'Frekvencie stanovíšť.',
  'comode=vert': 'Vertikálne hranice stanovíšť.', 'comode=level': 'Aká hladina a podmienka platí na ktorom bode pre ktorý let.',
  'comode=fill': 'Dopĺňanie celých tabuliek z dohody.', 'comode=study': 'Všetky tabuľky a mapa na prezeranie.',
  'coans=choice': 'Ľahká verzia: vyberáš zo šiestich podobných možností (v doplňovačke z rozbaľovacej ponuky).', 'coans=type': 'Hardcore: odpoveď píšeš. Pri hladine stačí „FL250" alebo „eastbound".',
  'conb=all': 'Všetci susedia.', 'conb': 'Len tento sused.', 'cotable': 'Vyberie tabuľku, ktorú budeš dopĺňať.',
  'coweak': 'Zapne cvičenie len z otázok, ktoré si pokazil.', 'coclear': 'Vymaže uložený pokrok MOD 06.',
  '#co-check': 'Vyhodnotí tabuľku; nesprávne políčka sa doplnia červeným.', '#co-clear': 'Vymaže vyplnené políčka.',
  'mode=heading': 'MOD 05 — navádzanie jedného lietadla kurzami po 5° cez bránky alebo nad miesta.',
  'hgkind=gate': 'Ciele sú náhodné bránky na mape.', 'hgkind=city': 'Ciele sú slovenské mestá a letiská.', 'hgkind=fra': 'Ciele sú význačné body FRA z MOD 04.',
  'hgmode=move': 'Lietadlo letí a ty ho kurzami navádzaš cez ciele.', 'hgmode=static': 'Lietadlo stojí; len určíš kurz na bod a hneď vidíš, či je správny.',
  'hgdiff=easy': 'Ľahšia verzia: pomalšie lietadlo a širšia bránka; v statickom režime sa uzná aj kurz o 5° vedľa.',
  'hgdiff=hard': 'Hardcore: rýchle lietadlo a úzka bránka; v statickom režime sa uzná len presný kurz.',
  '#hs-next': 'Nová úloha. To isté spraví Enter.',
  'hgnames=on': 'Miesta sú na mape pomenované a cieľ je zvýraznený.', 'hgnames=off': 'Na mape sú len bodky bez mien — polohu cieľa musíš vedieť.',
  'hgrose=on': 'Zapne okolo lietadla kruh s kurzami — pomôcka na odhad.', 'hgrose=off': 'Bez kruhu okolo lietadla — kurz odhaduješ z hlavy.',
  '#hg-go': 'Odošle kurz. To isté spraví Enter.', '#hg-pause': 'Zastaví alebo znova spustí lietadlo.',
  '#hg-hint': 'Prezradí približný kurz na cieľ, zaokrúhlený na 5°.',
  'mode=aircraft': 'MOD 01 — spoznávanie typov lietadiel podľa fotky.',
  'mode=airport':  'MOD 02 — ICAO kódy letísk, mapa Európy a prefixy štátov.',
  'mode=callsign': 'MOD 03 — trojpísmenové kódy prevádzkovateľov a ich volacie znaky.',
  'mode=waypoint': 'MOD 04 — význačné body FRA v FIR Bratislava na mape.',
  '#btn-set':   'Ukáže alebo skryje tabuľku nastavení pod otázkou (režim, obtiažnosť, filtre). Skrytá = otázka sa zmestí na jednu obrazovku.',
  '#btn-fs':    'Roztiahne trenažér na celú obrazovku — funguje v každom module a dá sa v nej prepínať medzi modulmi. Späť klávesom Esc alebo tým istým tlačidlom.',
  '#btn-skip':  'Preskočí otázku. Počíta sa ako chyba a zapíše sa do slabých miest. V MOD 05 dá nový cieľ.',
  '#btn-reset': 'Začne cvičenie odznova s tými istými filtrami a vynuluje skóre hore.',
  '#btn-hint':  'Ukáže ďalšiu nápovedu. Nápovedy idú od najmenšej po najväčšiu.',
  '#submit-btn': 'Odošle odpoveď. To isté spraví kláves Enter.',
  '#next-btn':  'Ďalšia otázka. To isté spraví kláves Enter.',
  '#restart-btn': 'Spustí rovnaké cvičenie znova.',
  '#blind-check': 'Vyhodnotí slepú mapu. Prázdne a nesprávne políčka sa doplnia červeným.',
  '#blind-reset': 'Vymaže všetky políčka slepej mapy.',
  '#cs-show':   'Odkryje odpoveď. To isté spraví medzerník.',
  '#cs-yes':    'Vedel som — kartička sa započíta ako správna. Kláves 1.',
  '#cs-no':     'Nevedel som — kartička sa vráti neskôr v cvičení. Kláves 2.',
  '#cs-pack':   'Rozdelí výber na dávky po 20 volačiek, aby si sa učil po malých kúskoch.',
  '.choice-btn': 'Klikni na odpoveď, ktorú považuješ za správnu.',
  /* MOD 01 */
  'wake=all': 'Všetky lietadlá.', 'wake=L': 'Len kategória turbulencie v úplave LIGHT.', 'wake=M': 'Len MEDIUM.',
  'wake=H': 'Len HEAVY.', 'wake=J': 'Len SUPER (A380).',
  /* MOD 02 */
  'apmode=quiz':   'Klasický kvíz: kód → mesto a mesto → kód.',
  'apmode=map':    'Kvíz s mapou: vľavo svieti poloha letiska, vpravo odpovedáš.',
  'apmode=click':  'Ty klikáš do mapy, kde letisko leží.',
  'apmode=prefix': 'Učíš sa prvé dve písmená kódu — ktorý štát má ktorý prefix. Bez mapy.',
  'apmode=study':  'Mapa oblastí ICAO na prezeranie, nič sa neskúša.',
  'acans=choice':  'Ľahká verzia: vyberáš typ lietadla zo štyroch podobných možností.', 'acans=type': 'Hardcore: typ lietadla píšeš z hlavy.',
  'apans=choice':  'Ľahká verzia: vyberáš zo štyroch podobných možností; pri klikaní do mapy väčšia tolerancia.',
  'apans=type':    'Hardcore: odpoveď píšeš z hlavy; pri klikaní do mapy polovičná tolerancia.',
  'apcat=all':     'Všetky letiská.', 'apcat=sk': 'Len slovenské letiská.',
  'apcat=neigh':   'Len letiská susedných štátov (CZ, AT, HU, PL, UA).',
  'apcat=other':   'Ostatné letiská — zvyšok Európy a svet (v režimoch s mapou len Európa).',
  'appx=doc':      'Len kódy, ktoré sú na mape v prezentácii „3.6 Zobrazovanie dát".',
  'appx=all':      'Aj kódy, ktoré v prezentácii nie sú, ale sú v ICAO Doc 7910 (Albánsko, Moldavsko, Bielorusko…).',
  'apweak':        'Zapne cvičenie len z otázok, ktoré si pokazil. Číslo v zátvorke je ich počet.',
  'apclear':       'Vymaže uložené slabé miesta a počítadlo ZVLÁDNUTÉ pre MOD 02.',
  /* MOD 03 */
  'csmode=quiz':   'Kvíz: kód ↔ volačka, písaním alebo výberom z možností.',
  'csmode=cards':  'Kartičky: odpoveď si povieš sám, odkryješ ju a ohodnotíš sa.',
  'csmode=list':   'Zoznam na čítanie so zakrývaním stĺpcov.',
  'csans=choice':  'Ľahká verzia: vyberáš zo štyroch možností — susedov v abecede.',
  'csans=type':    'Hardcore: odpoveď píšeš z hlavy.',
  'csdir=both':    'Otázky idú oboma smermi.', 'csdir=i2c': 'Len kód → volačka (BAW → ?).', 'csdir=c2i': 'Len volačka → kód (SPEEDBIRD → ?).',
  'cscat=top':     'Len prevádzkovatelia z tabuľky zo simulátora — tí, ktorých naozaj stretneš.',
  'csorder=freq':  'Čím častejšie sa prevádzkovateľ objavuje na simulátore, tým skôr príde na rad; najčastejší prídu aj viackrát. Balíček 1 je potom 20 najpoužívanejších.',
  'csorder=rand':  'Čisto náhodné poradie, bez ohľadu na to, ako často sa volačka používa. Balíčky sú podľa abecedy.',
  'cscat=all':     'Všetky volačky z dokumentu.', 'cscat=sk': 'Len 25 dopravcov, ktorí bežne lietajú cez Slovensko. Dobrý začiatok.',
  'cscat=other':   'Všetci ostatní dopravcovia.',
  'cskind=all':    'Všetky volačky vo výbere.',
  'cskind=hard':   'Len volačky, z ktorých sa kód nedá vyčítať (BAW → SPEEDBIRD). Tie sa treba naučiť naspamäť.',
  'cskind=logical': 'Len volačky, v ktorých sú písmená kódu (RYR → RYANAIR). Tie sú ľahké.',
  'csl=all':       'Všetky začiatočné písmená kódu.', 'csl': 'Len kódy, ktoré sa začínajú týmto písmenom.',
  'cspk=prev':     'Predchádzajúci balíček.', 'cspk=next': 'Ďalší balíček 20 volačiek.',
  'csweak':        'Zapne cvičenie len z volačiek, ktoré si pokazil.',
  'csclear':       'Vymaže uložené slabé miesta a počítadlo ZVLÁDNUTÉ pre MOD 03.',
  'cshide=none':   'Ukáže kódy aj volačky.', 'cshide=call': 'Zakryje volačky — skúšaš sa z nich, odkrývaš klikom.',
  'cshide=icao':   'Zakryje kódy — skúšaš sa z nich, odkrývaš klikom.',
  /* MOD 04 */
  'wpmode=quiz':   'Dostaneš názov a klikáš na bod na mape.',
  'wpmode=name':   'Na mape svieti bod a ty píšeš jeho názov.',
  'wpmode=blind':  'Všetky body naraz bez mien — vypĺňaš názvy k číslam.',
  'wpmode=study':  'Mapa so všetkými názvami na prezeranie, nič sa neskúša.',
  'wpdiff=easy':   'Ľahšia verzia: menej bodov na mape, resp. susedné body sú pomenované.',
  'wpdiff=hard':   'Ťažšia verzia: na mape sú všetky body a nič nie je pomenované.',
  'wpb=all':       'Všetky body.', 'wpb=border': 'Len body, ktoré ležia na hranici FIR (do 2 NM).',
  'wpgrp=all':     'Body z celej FIR Bratislava.', 'wpgrp=W': 'Len sektor WEST.', 'wpgrp=C': 'Len sektor CENTRAL.',
  'wpgrp=E':       'Len sektor EAST.', 'wpgrp=NAV': 'Len navigačné zariadenia (VOR/DME, NDB).',
};
function tipFor(el) {
  if (el.id && TIPS['#' + el.id]) return TIPS['#' + el.id];
  for (const k in el.dataset) {
    const t = TIPS[k + '=' + el.dataset[k]] || TIPS[k];
    if (t) return t;
  }
  if (el.classList.contains('choice-btn')) return TIPS['.choice-btn'];
  return '';
}
(function tipInit() {
  const box = document.createElement('div');
  box.className = 'tipbox';
  /* v paneli, nie v body — inak by na celej obrazovke nebolo nápovedu vidno */
  document.querySelector('.panel').appendChild(box);
  const hide = () => { box.style.display = 'none'; };
  document.addEventListener('mouseover', e => {
    const el = e.target.closest ? e.target.closest('button, select') : null;
    const t = el ? tipFor(el) : '';
    if (!t) { hide(); return; }
    box.textContent = t;
    box.style.display = 'block';
    const r = el.getBoundingClientRect();
    let top = r.top - box.offsetHeight - 8;
    if (top < 8) top = r.bottom + 8;
    box.style.top = top + 'px';
    box.style.left = Math.max(8, Math.min(r.left, window.innerWidth - box.offsetWidth - 8)) + 'px';
  });
  document.addEventListener('mousedown', hide);
  window.addEventListener('scroll', hide, true);
})();

/* ============================================================
   VEĽKOSŤ MAPY A CELÁ OBRAZOVKA
   ============================================================ */
/* Každá mapa si do CSS zapíše svoj pomer strán (--ar), aby sa dala
   zväčšiť presne na výšku okna bez orezania. */
(function mapSizing() {
  const card = document.getElementById('qcard');
  const fit = () => card.querySelectorAll('.map-wrap').forEach(w => {
    const svg = w.querySelector('svg'); if (!svg) return;
    const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
    if (vb.length === 4 && vb[3]) w.style.setProperty('--ar', (vb[2] / vb[3]).toFixed(4));
  });
  new MutationObserver(fit).observe(card, { childList: true });
  fit();
})();
/* celá obrazovka je dostupná v každom module */
function modeHasMap() { return true; }
function fsActive() { return document.body.classList.contains('fs-on'); }
function fsSync() {
  const b = document.getElementById('btn-fs');
  b.textContent = fsActive() ? '✕' : '⛶'; b.title = fsActive() ? 'Zavrieť celú obrazovku' : 'Celá obrazovka'; b.classList.toggle('on', !!fsActive());
}
/* Rozloženie na celé okno robí CSS trieda, takže funguje vždy. Skutočná
   celá obrazovka prehliadača sa k tomu len pridá, ak ju prehliadač dovolí
   (v niektorých oknách ju zakazuje — vtedy ostane aspoň celé okno). */
let fsReal = false;
function fsToggle() {
  const on = !fsActive();
  document.body.classList.toggle('fs-on', on);
  const el = document.documentElement;
  if (on && el.requestFullscreen) {
    const p = el.requestFullscreen();
    if (p && p.then) p.then(() => { fsReal = true; }).catch(() => { fsReal = false; });
  } else if (!on && document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen();
  }
  fsSync();
  window.scrollTo(0, 0);
}
document.getElementById('btn-fs').onclick = fsToggle;
document.getElementById('btn-report').onclick = () => reportBug();
document.getElementById('btn-demo').onclick = () => demoRun();
/* Nastavenia pod otázkou sa dajú zbaliť. Na úzkom okne sú zbalené od
   začiatku, aby otázka a odpoveď boli na jednej obrazovke. */
(function settingsToggle() {
  let off = null;
  try { off = localStorage.getItem('atcoTrainerV2.setOff'); } catch (e) {}
  document.body.classList.toggle('set-off', off === null ? window.innerWidth < 1100 : off === '1');
  const b = document.getElementById('btn-set');
  const sync = () => { b.innerHTML = (document.body.classList.contains('set-off') ? '⚙<span> NASTAVENIA</span>' : '⚙<span> SKRYŤ</span>'); };
  b.onclick = () => {
    const now = document.body.classList.toggle('set-off');
    try { localStorage.setItem('atcoTrainerV2.setOff', now ? '1' : '0'); } catch (e) {}
    sync();
    if (!now) document.getElementById('filters').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };
  sync();
})();
/* Esc v skutočnej celej obrazovke ju ukončí v prehliadači — zruš aj rozloženie */
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && fsReal) { fsReal = false; document.body.classList.remove('fs-on'); }
  fsSync();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && fsActive() && !document.fullscreenElement) { document.body.classList.remove('fs-on'); fsSync(); }
});
