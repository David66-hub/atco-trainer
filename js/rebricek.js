/* ============================================================
   SÚŤAŽ — účty (prezývka + heslo), rebríček a hra DOBYVATEĽ
   Účty a rebríček idú cez Supabase (funkcie atco_* z priloženého SQL),
   hra naživo cez Supabase Realtime. Kým nie sú vyplnené SB_URL a SB_KEY,
   beží SKÚŠOBNÝ REŽIM: údaje ostávajú len v tomto prehliadači.
   ============================================================ */
const SB_URL = 'https://xzpfdaehwwyezjfketha.supabase.co';   // adresa projektu, napr. https://abcdefgh.supabase.co
const SB_KEY = 'sb_publishable_zCtKfNAduJIc6kr4N1YK2w_CRQT8fQz';   // verejný kľúč (anon / publishable)
const SB_ON = !!(SB_URL && SB_KEY);
const RK_ACCT = 'atcoTrainerV2.acct', RK_PEND = 'atcoTrainerV2.rkPend', RK_MOCK = 'atcoTrainerV2.rkMock';
const RK_MODS = [['aircraft', 'MOD 01 · LIETADLÁ'], ['airport', 'MOD 02 · LETISKÁ'], ['callsign', 'MOD 03 · VOLAČKY'], ['waypoint', 'MOD 04 · BODY FRA'], ['heading', 'MOD 05 · KURZY'],
  ['coord', 'MOD 06 · KOORDINÁCIA'], ['daily', 'DENNÝ TRÉNING'], ['exam', 'SKÚŠKA'], ['conquer', 'DOBYVATEĽ']];
const RK_SUBJ = [['q_atm', 'ATM'], ['q_nav', 'NAVIGÁCIA'], ['q_met', 'METEOROLÓGIA'], ['q_eqps', 'ZARIADENIA'], ['q_hum', 'ĽUDSKÉ FAKTORY'], ['q_acft', 'LIETADLÁ'], ['q_pen', 'PRAC. PROSTREDIE']];
const RK_ERR = { NICK_TAKEN: 'Táto prezývka je už obsadená — skús inú.', BAD_LOGIN: 'Nesprávna prezývka alebo heslo.',
  BAD_NICK: 'Prezývka musí mať 3 až 16 znakov (písmená, čísla, medzera, bodka, pomlčka).', BAD_PASS: 'Heslo musí mať aspoň 6 znakov.',
  BAD_TOKEN: 'Prihlásenie vypršalo — prihlás sa znova.' };
const RK = { acct: null, pend: {}, rows: null, view: 'all', err: '', busy: false, lastC: 0, lastW: 0, lastAct: Date.now(), n: 0, loading: false };
function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
/* ============================================================
   AKO NA TO (v4.5) — pravidlá a postup každého módu ako krátke okno
   s obrázkami: tri až päť kariet, na každej animovaná kresba, nadpis
   a jedna veta. Otvára sa len tlačidlom ❓.
   ============================================================ */
const HP_SEEN = 'atcoTrainerV2.helpSeen';
/* malé animované kresby (240 × 120); farby berú z premenných stránky */
function hpG(id) {
  const P = '<path class="hp-ink" d="M150,60 L96,44 L100,60 L96,76 Z M118,60 L100,26 L92,26 L104,60 L92,94 L100,94 Z"/>';
  const land = '<path class="hp-land" d="M22,66 C30,40 66,34 92,40 C120,24 168,28 206,44 C224,56 214,82 188,88 C150,100 96,98 62,92 C40,90 18,84 22,66 Z"/>';
  const G = {
    photo: `<rect class="hp-box" x="50" y="14" width="140" height="92" rx="10"/><g transform="translate(0,2)">${P}</g><g class="a-pop"><rect class="hp-tag" x="150" y="80" width="54" height="24" rx="8"/><text class="hp-tt" x="177" y="97">B738</text></g>`,
    choice: `<rect class="hp-opt" x="30" y="20" width="84" height="34" rx="9"/><rect class="hp-opt a-ok" x="126" y="20" width="84" height="34" rx="9"/><rect class="hp-opt" x="30" y="66" width="84" height="34" rx="9"/><rect class="hp-opt" x="126" y="66" width="84" height="34" rx="9"/><text class="hp-t a-pop" x="168" y="44">✓</text><text class="hp-k" x="42" y="42">1</text><text class="hp-k" x="138" y="42">2</text><text class="hp-k" x="42" y="88">3</text><text class="hp-k" x="138" y="88">4</text>`,
    type: `<rect class="hp-box" x="28" y="40" width="130" height="40" rx="10"/><text class="hp-t hp-mono a-type" x="42" y="67">LZIB</text><rect class="hp-cur a-blink" x="112" y="48" width="3" height="24"/><rect class="hp-tag a-pulse" x="170" y="40" width="46" height="40" rx="10"/><text class="hp-tt" x="193" y="66">↵</text>`,
    map: `${land}<circle class="hp-ring a-ring" cx="128" cy="62" r="10"/><circle class="hp-dot" cx="128" cy="62" r="6"/><text class="hp-s" x="128" y="48">LZSL</text>`,
    click: `${land}<circle class="hp-ring a-ring" cx="150" cy="58" r="10"/><circle class="hp-dot" cx="150" cy="58" r="5"/><path class="hp-cursor a-cur" d="M0,0 L0,22 L6,17 L10,26 L14,24 L10,15 L18,15 Z"/>`,
    timer: `<circle class="hp-box" cx="120" cy="64" r="42"/><rect class="hp-ink" x="112" y="12" width="16" height="8" rx="3"/><g class="a-spin" style="transform-origin:120px 64px"><line class="hp-line" x1="120" y1="64" x2="120" y2="30"/></g><circle class="hp-dot" cx="120" cy="64" r="4"/>`,
    cards: `<g class="a-flip" style="transform-origin:120px 60px"><rect class="hp-box" x="60" y="22" width="120" height="76" rx="12"/><text class="hp-t hp-mono" x="120" y="68">BAW</text></g><text class="hp-s a-pop" x="120" y="114">SPEEDBIRD</text>`,
    list: `<rect class="hp-box" x="40" y="14" width="160" height="92" rx="10"/><text class="hp-s" x="74" y="38">BAW</text><text class="hp-s" x="74" y="62">DLH</text><text class="hp-s" x="74" y="86">RYR</text><text class="hp-s" x="150" y="38">SPEEDBIRD</text><text class="hp-s" x="150" y="62">LUFTHANSA</text><text class="hp-s" x="150" y="86">RYANAIR</text><rect class="hp-mask a-slide" x="108" y="20" width="86" height="80" rx="6"/>`,
    gate: `<line class="hp-post" x1="176" y1="24" x2="176" y2="48"/><line class="hp-post" x1="176" y1="72" x2="176" y2="96"/><circle class="hp-amb" cx="176" cy="24" r="5"/><circle class="hp-amb" cx="176" cy="96" r="5"/><g class="a-fly"><g transform="translate(-72,24) scale(0.6)">${P}</g></g>`,
    compass: `<circle class="hp-box" cx="80" cy="60" r="44"/><text class="hp-s" x="80" y="30">N</text><g class="a-needle" style="transform-origin:80px 60px"><path class="hp-ink" d="M80,24 L88,60 L80,54 L72,60 Z"/></g><circle class="hp-dot" cx="80" cy="60" r="4"/><rect class="hp-tag" x="146" y="42" width="70" height="36" rx="10"/><text class="hp-tt" x="181" y="66">245°</text>`,
    calc: `<text class="hp-t hp-mono" x="120" y="52">090° + 180°</text><text class="hp-t hp-mono hp-g a-pop" x="120" y="92">= 270°</text>`,
    radio: `<path class="hp-ink" d="M112,100 L120,40 L128,100 Z"/><circle class="hp-dot" cx="120" cy="36" r="6"/><path class="hp-wave a-w1" d="M100,22 A26,26 0 0 0 100,50"/><path class="hp-wave a-w1" d="M140,22 A26,26 0 0 1 140,50"/><path class="hp-wave a-w2" d="M88,12 A42,42 0 0 0 88,60"/><path class="hp-wave a-w2" d="M152,12 A42,42 0 0 1 152,60"/><text class="hp-s hp-mono" x="190" y="96">134,475</text>`,
    layers: `<rect class="hp-l1 a-rise" x="70" y="14" width="100" height="26" rx="6"/><rect class="hp-l2 a-rise d2" x="70" y="46" width="100" height="26" rx="6"/><rect class="hp-l3 a-rise d3" x="70" y="78" width="100" height="26" rx="6"/><text class="hp-s" x="198" y="32">FL660</text><text class="hp-s" x="198" y="64">FL285</text><text class="hp-s" x="198" y="96">GND</text>`,
    route: `<path class="hp-track" d="M30,90 C80,90 90,34 140,34 S200,60 214,60"/><circle class="hp-dot" cx="30" cy="90" r="5"/><circle class="hp-amb a-pulse" cx="140" cy="34" r="6"/><circle class="hp-dot" cx="214" cy="60" r="5"/><text class="hp-s" x="140" y="20">COP</text><circle class="hp-ink a-route" r="6"/>`,
    table: `<rect class="hp-box" x="34" y="16" width="172" height="88" rx="10"/><line class="hp-grid" x1="34" y1="45" x2="206" y2="45"/><line class="hp-grid" x1="34" y1="74" x2="206" y2="74"/><line class="hp-grid" x1="92" y1="16" x2="92" y2="104"/><line class="hp-grid" x1="150" y1="16" x2="150" y2="104"/><rect class="hp-fill a-rise" x="96" y="49" width="50" height="21" rx="5"/><rect class="hp-fill a-rise d2" x="154" y="49" width="48" height="21" rx="5"/><rect class="hp-fill a-rise d3" x="96" y="78" width="50" height="21" rx="5"/>`,
    calendar: `${[1, 3, 7, 14, 30].map((d, i) => `<g class="a-rise d${i + 1}"><rect class="hp-box" x="${18 + i * 42}" y="38" width="36" height="44" rx="9"/><text class="hp-t hp-mono" x="${36 + i * 42}" y="68" style="font-size:17px">${d}</text></g>`).join('')}<text class="hp-s" x="120" y="104">dní do ďalšieho opakovania</text>`,
    swords: `<circle class="hp-p1 a-left" cx="62" cy="60" r="26"/><circle class="hp-p2 a-right" cx="178" cy="60" r="26"/><text class="hp-t a-pop" x="120" y="70" style="font-size:26px">VS</text>`,
    podium: `<rect class="hp-l2 a-rise d2" x="42" y="62" width="50" height="44" rx="6"/><rect class="hp-gold a-rise" x="95" y="38" width="50" height="68" rx="6"/><rect class="hp-l3 a-rise d3" x="148" y="76" width="50" height="30" rx="6"/><text class="hp-t" x="120" y="30" style="font-size:22px">🏆</text><text class="hp-k" x="62" y="90">2</text><text class="hp-k" x="115" y="78">1</text><text class="hp-k" x="168" y="98">3</text>`,
    login: `<circle class="hp-box" cx="84" cy="50" r="22"/><path class="hp-box" d="M46,104 C46,78 122,78 122,104 Z"/><rect class="hp-tag a-pop" x="138" y="40" width="80" height="40" rx="12"/><text class="hp-tt" x="178" y="66" style="font-size:13px">PROFIL</text>`,
    hint: `<circle class="hp-amb a-pulse" cx="70" cy="52" r="24"/><rect class="hp-ink" x="60" y="80" width="20" height="10" rx="3"/><text class="hp-t hp-mono" x="160" y="68">B7<tspan class="a-blink">__</tspan></text>`,
    eye: `<path class="hp-box" d="M40,60 C70,22 170,22 200,60 C170,98 70,98 40,60 Z"/><circle class="hp-l1" cx="120" cy="60" r="22"/><circle class="hp-ink a-look" cx="120" cy="60" r="10"/>`,
    blind: `${land}${[[70, 60, 1], [112, 50, 2], [150, 70, 3], [186, 58, 4]].map(p => `<g class="a-rise d${p[2]}"><circle class="hp-dot" cx="${p[0]}" cy="${p[1]}" r="11"/><text class="hp-n" x="${p[0]}" y="${p[1] + 5}">${p[2]}</text></g>`).join('')}`,
    score: `<g class="a-rise"><rect class="hp-fill" x="30" y="40" width="80" height="40" rx="12"/><text class="hp-t hp-mono hp-g" x="70" y="68">+3</text></g><g class="a-rise d3"><rect class="hp-bad" x="130" y="40" width="80" height="40" rx="12"/><text class="hp-t hp-mono hp-r" x="170" y="68">−2</text></g>`,
    terr: `<path class="hp-p1 a-rise" d="M40,30 L96,24 L104,62 L52,72 Z"/><path class="hp-p2 a-rise d2" d="M104,22 L176,30 L168,70 L110,62 Z"/><path class="hp-p1 a-rise d3" d="M54,78 L104,68 L116,100 L60,104 Z"/><path class="hp-free a-blink" d="M112,68 L170,76 L176,104 L122,102 Z"/><text class="hp-k" x="72" y="54">500</text><text class="hp-k" x="140" y="52">300</text>`,
    joker: `${[['½', 0], ['+10 s', 1], ['×2', 2]].map(j => `<g class="a-rise d${j[1] + 1}"><rect class="hp-jk" x="${22 + j[1] * 68}" y="42" width="60" height="36" rx="18"/><text class="hp-tt hp-a" x="${52 + j[1] * 68}" y="66" style="font-size:14px">${j[0]}</text></g>`).join('')}`,
    axis: `<line class="hp-line" x1="24" y1="78" x2="216" y2="78"/><g class="a-drop"><circle class="hp-p1" cx="84" cy="78" r="8"/></g><g class="a-drop d2"><circle class="hp-p2" cx="164" cy="78" r="8"/></g><g class="a-rise d4"><path class="hp-gold" d="M112,86 l-8,14 h16 Z"/><text class="hp-s" x="112" y="40">správne</text></g>`,
    heart: `<circle class="hp-box" cx="120" cy="64" r="30"/><text class="hp-t" x="120" y="72" style="font-size:20px">✈</text><text class="hp-r a-blink" x="96" y="26" style="font-size:18px">♥</text><text class="hp-r" x="120" y="20" style="font-size:18px">♥</text><text class="hp-r" x="144" y="26" style="font-size:18px">♥</text>`,
    bars: `${[70, 40, 86, 55].map((h, i) => `<rect class="hp-fill a-rise d${i + 1}" x="${44 + i * 42}" y="${104 - h}" width="28" height="${h}" rx="6"/>`).join('')}<line class="hp-line" x1="30" y1="104" x2="210" y2="104"/>`,
    mods: `${['01', '02', '03', '04', '05', '06'].map((m, i) => `<g class="a-rise d${i % 4 + 1}"><rect class="hp-box" x="${24 + (i % 3) * 66}" y="${18 + Math.floor(i / 3) * 46}" width="58" height="38" rx="10"/><text class="hp-k" x="${53 + (i % 3) * 66}" y="${42 + Math.floor(i / 3) * 46}" style="text-anchor:middle">${m}</text></g>`).join('')}`,
  };
  return `<svg class="hp-svg" viewBox="0 0 240 120" aria-hidden="true">${G[id] || G.mods}</svg>`;
}
/* obsah: kľúč módu → [nadpis okna, [[kresba, nadpis, jedna veta], …]] */
const HELP = {
  home: ['ATCO TRAINER', [['mods', 'Vyber si modul', 'Šesť modulov, denný tréning, skúška a hra — všetko v lište hore.'], ['choice', 'Nastav si obtiažnosť', 'ĽAHKÁ = výber z možností. HARDCORE = píšeš z hlavy.'], ['calendar', 'Vracaj sa', 'Čo vieš, príde znova o pár dní. Čo nevieš, hneď zajtra.'], ['login', 'Prihlás sa', 'Vpravo hore. Body, čas a úspešnosť sa potom ukladajú.']]],
  aircraft: ['MOD 01 · TYPY LIETADIEL', [['photo', 'Pozri sa na fotku', 'Na fotke je jedno lietadlo. Urč jeho typ.'], ['choice', 'ĽAHKÁ', 'Vyber zo štyroch možností — myšou alebo klávesmi 1 až 4.'], ['type', 'HARDCORE', 'Napíš ICAO označenie (B738) alebo názov a stlač Enter.'], ['hint', 'HINT', 'Keď nevieš, napovie ti po krokoch.']]],
  'aircraft.cmp': ['MOD 01 · POROVNANIE', [['photo', 'Dve podobné lietadlá', 'Vidíš dve fotky a úlohu, ktorý typ máš nájsť.'], ['click', 'Klikni na správnu', 'Alebo stlač 1 či 2.'], ['table', 'Čím sa líšia', 'Po odpovedi dostaneš tabuľku rozdielov.']]],
  'airport.quiz': ['MOD 02 · LETISKÁ', [['type', 'Kód ↔ mesto', 'Dostaneš ICAO kód a určíš mesto, alebo naopak.'], ['choice', 'ĽAHKÁ', 'Štyri možnosti na výber.'], ['type', 'HARDCORE', 'Píšeš z hlavy a potvrdíš Enterom.']]],
  'airport.map': ['MOD 02 · S MAPOU', [['map', 'Letisko svieti na mape', 'Vľavo vidíš, kde leží.'], ['type', 'Odpovedáš vpravo', 'Kód si tak spojíš s polohou.']]],
  'airport.click': ['MOD 02 · KLIK DO MAPY', [['type', 'Dostaneš kód alebo mesto', 'Nič nepíšeš.'], ['click', 'Klikni, kde letisko leží', 'ĽAHKÁ uzná 100 km, HARDCORE 50 km (na mape Slovenska 15 a 8 km).']]],
  'airport.prefix': ['MOD 02 · PREFIXY ŠTÁTOV', [['map', 'Prvé dve písmená = štát', 'LZ je Slovensko, LO Rakúsko, LK Česko.'], ['type', 'Prefix ↔ štát', 'Dostaneš jedno a napíšeš druhé.']]],
  'airport.study': ['MOD 02 · ŠTÚDIUM', [['eye', 'Tu sa nič neskúša', 'Mapa ukazuje, ktorá časť Európy má ktoré písmeno.'], ['click', 'Klikni na štát', 'Uvidíš detail jeho kódov.']]],
  'callsign.quiz': ['MOD 03 · VOLAČKY', [['cards', 'Kód ↔ volačka', 'BAW je SPEEDBIRD. Dostaneš jedno a určíš druhé.'], ['choice', 'ĽAHKÁ alebo HARDCORE', 'Výber zo štyroch, alebo písanie z hlavy.'], ['list', 'Zmenši si výber', 'Cez VÝBER, PÍSMENO a BALÍČEK — je ich vyše tisíc.']]],
  'callsign.cards': ['MOD 03 · KARTIČKY', [['cards', 'Povedz si odpoveď nahlas', 'Kartička ukáže kód alebo volačku.'], ['type', 'Medzerník odkryje', 'Nič nepíšeš.'], ['score', 'Ohodnoť sa', '1 = vedel som, 2 = nevedel som.']]],
  'callsign.list': ['MOD 03 · ZOZNAM', [['eye', 'Tu sa nič neskúša', 'Je to zoznam na čítanie.'], ['list', 'Zakry si stĺpec', 'A odkrývaj políčka kliknutím.']]],
  'waypoint.quiz': ['MOD 04 · BODY NA MAPE', [['type', 'Dostaneš názov bodu', 'Napríklad MEBAN.'], ['click', 'Klikni na jeho krúžok', 'Tam, kde bod na mape leží.']]],
  'waypoint.name': ['MOD 04 · POMENUJ BOD', [['map', 'Jeden bod svieti', 'Na mape je zvýraznený.'], ['type', 'Napíš jeho názov', 'A potvrď Enterom.']]],
  'waypoint.blind': ['MOD 04 · SLEPÁ MAPA', [['blind', 'Body majú len čísla', 'Mená na mape nie sú.'], ['type', 'Doplň názvy', 'Do políčok pod mapou — nemusíš všetky.'], ['table', 'VYHODNOTIŤ', 'V ĽAHKEJ verzii je v políčku prvé písmeno.']]],
  'waypoint.study': ['MOD 04 · ŠTÚDIUM', [['eye', 'Tu sa nič neskúša', 'Všetky body s menami, farebne podľa sektora.'], ['click', 'Klikni na bod', 'Uvidíš detail.']]],
  'heading.static': ['MOD 05 · STATICKÝ KURZ', [['compass', 'Lietadlo stojí', 'Na mape je oranžový bod.'], ['type', 'Napíš kurz po 5°', 'Ten, ktorý vedie na bod — napríklad 245 — a Enter.'], ['gate', 'Uvidíš, či sedí', 'Lietadlo sa natočí. Ďalší Enter dá novú úlohu.']]],
  'heading.gate': ['MOD 05 · BRÁNKY', [['gate', 'Lietadlo letí samo', 'Tvoj cieľ je oranžová bránka.'], ['type', 'Napíš kurz a Enter', 'Lietadlo hneď zatočí. Kurzy sú po 5°.'], ['score', 'Prelet = zásah', 'Hneď sa objaví ďalšia bránka.']]],
  'heading.city': ['MOD 05 · MIESTA', [['map', 'Cieľ je miesto', 'Hore vpravo je napísané, nad čo máš preletieť.'], ['type', 'Napíš kurz a Enter', 'Lietadlo zatočí.'], ['eye', 'Vypni názvy', 'Potom musíš vedieť, kde miesto leží.']]],
  'heading.fra': ['MOD 05 · BODY FRA', [['map', 'Ciele sú body z MOD 04', 'Precvičíš kurzy aj polohu bodov naraz.'], ['type', 'Napíš kurz a Enter', 'Kurzy sú po 5°.']]],
  'heading.calc': ['MOD 05 · POČÍTANIE', [['calc', 'Opačný kurz', 'Kurz ± 180.'], ['compass', 'Zatáčka o X stupňov', 'Doprava pričítaš, doľava odčítaš.'], ['choice', 'Kratšia zatáčka', 'Ktorým smerom je to bližšie.']]],
  'coord.cop': ['MOD 06 · KOORDINAČNÉ BODY', [['map', 'Bod svieti na mape', 'Urč, s ktorým susedom sa na ňom koordinuje.'], ['click', 'Alebo naopak', 'Dostaneš názov a klikneš, kde bod leží.']]],
  'coord.freq': ['MOD 06 · FREKVENCIE', [['radio', 'Stanovište ↔ frekvencia', 'Dostaneš jedno a určíš druhé.'], ['choice', 'Pozor na podobné čísla', 'Možnosti sú zámerne blízko seba.']]],
  'coord.vert': ['MOD 06 · VERTIKÁLNE HRANICE', [['layers', 'Odkiaľ pokiaľ', 'Urč, od akej po akú výšku stanovište siaha.'], ['eye', 'Po odpovedi rez', 'Uvidíš celú skupinu nad sebou.']]],
  'coord.level': ['MOD 06 · HLADINY', [['route', 'Situácia z dohody', 'Smer, trať a typ letu.'], ['table', 'Tri otázky po sebe', 'Koordinačný bod, hladina na ňom a podmienka.']]],
  'coord.fill': ['MOD 06 · DOPLŇOVAČKA', [['table', 'Tabuľka ako v dokumente', 'COP, hladina a podmienka sú prázdne.'], ['type', 'Doplň a VYHODNOTIŤ', 'Chyby sa doplnia červeným.']]],
  'coord.study': ['MOD 06 · ŠTÚDIUM', [['eye', 'Tu sa nič neskúša', 'Vľavo mapa bodov podľa suseda.'], ['table', 'Vpravo všetko z dohody', 'Frekvencie, hranice a tabuľky.']]],
  'coord.scen': ['MOD 06 · SCENÁR', [['route', 'Jeden let od začiatku', 'Krok za krokom až po odovzdanie.'], ['table', 'Bod, hladina, podmienka', 'Keď určíš bod, lietadlo k nemu vyletí.'], ['radio', 'Nakoniec frekvencia', 'Stanovište podľa vertikálnych hraníc.']]],
  daily: ['DNEŠNÝ TRÉNING', [['mods', 'Všetky moduly naraz', 'Otázky sú namiešané.'], ['calendar', 'Opakovanie podľa kalendára', 'Čo vieš, príde o 1, 3, 7, 14 a 30 dní.'], ['hint', 'Slabé miesta najprv', 'Čo si pokazil, príde hneď zajtra.']]],
  exam: ['SKÚŠKA', [['timer', 'Na čas', '12 sekúnd na otázku, pri písaní 20.'], ['eye', 'Bez nápovedí', 'Či si odpovedal správne, uvidíš až na konci.'], ['score', 'Body', 'Správna +3 (pri písaní +6), nesprávna alebo preskočená −2.'], ['podium', 'Od 80 % bonus', 'A ešte väčší za 90 a 100 %.']]],
  rank: ['REBRÍČEK', [['score', 'Bod za správnu odpoveď', 'V HARDCORE dva. Skúška a Dobyvateľ dávajú viac.'], ['timer', 'Čas tréningu', 'Beží, len keď odpovedáš — po 45 sekundách sa zastaví.'], ['bars', 'Prepni si pohľad', 'Celkovo, podľa modulu alebo podľa okruhu teórie.'], ['login', 'Treba byť prihlásený', 'Tlačidlo vpravo hore.']]],
  profile: ['PROFIL', [['login', 'Tvoj účet', 'Prihlásenie, odhlásenie a vynulovanie skóre.'], ['bars', 'Všetky štatistiky', 'Body, úspešnosť a čas podľa modulov.'], ['calendar', 'Pokrok v učení', 'Koľko máš naučené a čo je dnes na opakovanie.'], ['swords', 'Vzhľad v hre', 'Farba a lietadlo pre Dobyvateľa.']]],
  conquer: ['DOBYVATEĽ · PRAVIDLÁ', [['terr', 'Boj o mapu Slovenska', 'Každý priestor má body: letisko 500, CTR 400, TMA 300, TRA/TSA 200, LZR 150, G 100.'], ['axis', '1 · Štart', 'Tipneš číslo. Kto je najbližšie, vyberá si domovské letisko prvý.'], ['choice', '2 · Obsadzovanie', 'Správna odpoveď = berieš susedný voľný priestor. Najrýchlejší dva.'], ['swords', '3 · Súboje', 'Útočíš na suseda. Odpovedáte obaja; rýchlosť nerozhoduje.'], ['axis', 'Obaja správne? Rozstrel', 'Tipovacia otázka, najviac tri. V tretej rozhodne aj čas.'], ['heart', 'Domovské letisko', 'Má tri životy. Pri treťom zásahu vypadávaš.'], ['joker', 'Žolíky — raz za hru', '50:50, +10 sekúnd a dvojité body pri útoku.'], ['podium', 'Koniec', 'Najviac bodov vyhráva. Do rebríčka ide viac za viac ľudí a kôl.']]],
};
function hpKeyNow() {
  const m = state.mode;
  if (m === 'home' || m === 'conquer' || m === 'rank' || m === 'profile') return m;
  return modeHelpKey();
}
function hpClose() { const w = document.getElementById('hp-wrap'); if (w) w.remove(); document.removeEventListener('keydown', hpKey, true); }
function hpKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); return hpClose(); }
  if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); return hpGo(1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); return hpGo(-1); }
  if (/^[1-6]$/.test(e.key)) e.stopPropagation();          // čísla nesmú prejsť na otázku pod oknom
}
function hpGo(d) {
  const w = document.getElementById('hp-wrap'); if (!w) return;
  const H = HELP[w.dataset.k], n = +w.dataset.i + d;
  if (n >= H[1].length) return hpClose();
  hpDraw(w.dataset.k, Math.max(0, n));
}
function hpDraw(key, i) {
  const H = HELP[key]; if (!H) return;
  let w = document.getElementById('hp-wrap');
  if (!w) {
    w = document.createElement('div'); w.id = 'hp-wrap'; document.body.appendChild(w);
    w.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('[data-hpa]');
      if (e.target === w || (b && b.dataset.hpa === 'x')) return hpClose();
      if (!b) return;
      if (b.dataset.hpa === 'n') hpGo(1); else if (b.dataset.hpa === 'p') hpGo(-1); else if (b.dataset.hpa === 'd') hpDraw(w.dataset.k, +b.dataset.i);
      else if (b.dataset.hpa === 'demo') { hpClose(); dqDemo(); }
    });
    document.addEventListener('keydown', hpKey, true);
  }
  const S = H[1], st = S[i], last = i === S.length - 1;
  w.dataset.k = key; w.dataset.i = i;
  w.innerHTML = `<div class="hp" role="dialog" aria-label="${H[0]}">
      <div class="hp-top"><span>${H[0]}</span><button data-hpa="x" title="Zavrieť">✕</button></div>
      <div class="hp-card" key="${i}">${hpG(st[0])}<h3>${st[1]}</h3><p>${st[2]}</p></div>
      <div class="hp-dots">${S.map((x, n) => `<button data-hpa="d" data-i="${n}" class="${n === i ? 'on' : ''}" title="${x[1]}"></button>`).join('')}</div>
      <div class="hp-act">${i > 0 ? '<button class="btn ghost" data-hpa="p">◀ SPÄŤ</button>' : '<span></span>'}
        ${last && key === 'conquer' && !DQ.room ? '<button class="btn ghost" data-hpa="demo">▶ SKÚSIŤ VZOR HRY</button>' : ''}
        <button class="btn" data-hpa="n">${last ? 'ROZUMIEM ✓' : 'ĎALEJ ▶'}</button></div>
    </div>`;
}
function helpOpen(key) { if (HELP[key]) hpDraw(key, 0); }
/* okno sa otvára len tlačidlom ❓ — samo sa pri otvorení módu neukazuje (v4.6) */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-hp]'); if (b) { e.preventDefault(); helpOpen(b.dataset.hp === '*' ? hpKeyNow() : b.dataset.hp); } });
function dqEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
/* číslo verzie — zvyšuje sa pri každej úprave, vidno ho v hlavičke, na úvode aj v Dobyvateľovi */
const APP_VERSION = '4.6';
document.querySelectorAll('.app-ver').forEach(e => { e.textContent = 'v' + APP_VERSION; });
RK.acct = lsGet(RK_ACCT, null);
function rkPendKey() { return RK_PEND + ':' + (RK.acct ? RK.acct.nick.toLowerCase() : '-'); }
function rkPendSave() { if (RK.acct) lsSet(rkPendKey(), RK.pend); }
try { localStorage.removeItem(RK_PEND); } catch (e) {}      // starý spoločný kľúč — mohol miešať účty v jednom prehliadači
RK.pend = RK.acct ? lsGet(rkPendKey(), {}) : {};
RK.lastAns = 0;

/* skúšobná náhrada databázy — rovnaké funkcie, údaje len v prehliadači */
function rkMock(fn, a) {
  const db = lsGet(RK_MOCK, { players: {} }), P = db.players;
  const byTok = t => Object.keys(P).map(k => P[k]).find(p => p.token === t);
  let out = null;
  if (fn === 'atco_register') {
    const k = a.p_nick.toLowerCase();
    if (P[k]) throw new Error('NICK_TAKEN');
    P[k] = { nick: a.p_nick, pass: a.p_pass, token: Math.random().toString(36).slice(2) + Date.now().toString(36), mods: {} };
    out = { nick: P[k].nick, token: P[k].token };
  } else if (fn === 'atco_login') {
    const p = P[a.p_nick.toLowerCase()];
    if (!p || p.pass !== a.p_pass) throw new Error('BAD_LOGIN');
    out = { nick: p.nick, token: p.token };
  } else if (fn === 'atco_report') {
    const p = byTok(a.p_token);
    if (!p) throw new Error('BAD_TOKEN');
    a.p_rows.forEach(r => { const m = p.mods[r.m] = p.mods[r.m] || { p: 0, c: 0, w: 0, s: 0, g: 0, v: 0 }; 'pcwsgv'.split('').forEach(f => { m[f] += r[f] || 0; }); });
    out = { ok: true };
  } else if (fn === 'atco_reset') {
    const p = byTok(a.p_token);
    if (!p) throw new Error('BAD_TOKEN');
    p.mods = {}; out = { ok: true };
  } else if (fn === 'atco_qreport') {
    (db.qrep = db.qrep || []).push(a); out = { ok: true };
  } else if (fn === 'atco_ranking') {
    out = Object.keys(P).map(k => ({ nick: P[k].nick, mods: P[k].mods }));
  }
  lsSet(RK_MOCK, db);
  return out;
}
async function rkRpc(fn, args) {
  if (!SB_ON) return rkMock(fn, args || {});
  const r = await fetch(SB_URL + '/rest/v1/rpc/' + fn, { method: 'POST', keepalive: true,
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(args || {}) });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error((j && j.message) || 'NET');
  return j;
}
function rkErrText(e) { return RK_ERR[e && e.message] || 'Nepodarilo sa spojiť s rebríčkom. Skús to o chvíľu.'; }

/* ---------- zbieranie bodov a času ---------- */
function rkAdd(mod, d) {
  if (!RK.acct) return;
  const m = RK.pend[mod] = RK.pend[mod] || {};
  Object.keys(d).forEach(f => { m[f] = (m[f] || 0) + d[f]; });
}
/* HARDCORE (písanie / ťažšia verzia) dáva dva body, ľahká jeden */
function rkMult() {
  const F = state.filters, m = state.mode;
  const hard = m === 'aircraft' ? F.acAns === 'type' : m === 'airport' ? F.apAns === 'type' : m === 'callsign' ? F.csAns === 'type' :
    m === 'waypoint' ? F.wpDiff === 'hard' : m === 'heading' ? F.hgDiff === 'hard' : m === 'coord' ? F.coAns === 'type' :
    (m === 'daily' || m === 'exam') ? F.dAns === 'type' : false;
  return hard ? 2 : 1;
}
/* počítadlá správne / zle vedie každý modul po svojom — tu sa len sleduje ich prírastok */
function rkSample(now) {
  const c = state.correct || 0, w = state.wrong || 0;
  if (c >= RK.lastC && w >= RK.lastW && (c > RK.lastC || w > RK.lastW) && state.mode !== 'conquer' && state.mode !== 'rank' && state.mode !== 'profile' && state.mode !== 'home') {
    const dc = c - RK.lastC, dw = w - RK.lastW;
    rkAdd(state.mode, { c: dc, w: dw, p: dc * rkMult() });
    RK.lastAns = now || Date.now();
    rkPendSave();
  }
  RK.lastC = c; RK.lastW = w;
}
async function rkFlush() {
  if (RK.busy) { RK.again = true; return; }      // práve sa odosiela — po skončení sa pošle aj to nové
  if (!RK.acct) return;
  const rows = Object.keys(RK.pend).map(m => Object.assign({ m }, RK.pend[m])).filter(r => 'pcwsgv'.split('').some(f => r[f] > 0));
  if (!rows.length) return;
  const sent = RK.pend; RK.pend = {}; rkPendSave(); RK.busy = true;
  try { await rkRpc('atco_report', { p_token: RK.acct.token, p_rows: rows }); }
  catch (e) {
    Object.keys(sent).forEach(m => rkAdd(m, sent[m])); rkPendSave();
    if (e.message === 'BAD_TOKEN') { RK.acct = null; lsSet(RK_ACCT, null); RK.err = RK_ERR.BAD_TOKEN; }
  }
  RK.busy = false;
  if (RK.again) { RK.again = false; return rkFlush(); }
}
/* Čas smie počítať len jedno okno toho istého účtu — inak by dve otvorené karty počítali dvojmo. */
RK.tab = Math.random().toString(36).slice(2);
function rkOwnsClock(now) {
  try {
    const k = 'atcoTrainerV2.rkClock:' + RK.acct.nick.toLowerCase(), cur = JSON.parse(localStorage.getItem(k) || 'null');
    if (cur && cur.id !== RK.tab && now - cur.t < 2500) return false;
    localStorage.setItem(k, JSON.stringify({ id: RK.tab, t: now }));
  } catch (e) {}
  return true;
}
/* Jedna sekunda tréningu sa pripíše, len ak: je prihlásený účet, otvorené je cvičenie alebo bežiaca hra,
   okno je viditeľné, posledná odpoveď / ťah bol pred menej než 45 s a čas nepočíta iné okno. */
function rkTick(now, hidden) {
  rkSample(now);
  RK.n++;
  const m = state.mode, playing = m === 'conquer' ? !!(DQ.room && DQ.S && DQ.S.phase !== 'lobby' && DQ.S.phase !== 'end') : (m !== 'home' && m !== 'rank' && m !== 'profile');
  if (RK.acct && playing && !hidden && now - RK.lastAns < 45000 && rkOwnsClock(now)) rkAdd(m, { s: 1 });
  if (RK.n % 10 === 0) rkPendSave();
  if (RK.n % 30 === 0) rkFlush();
}
setInterval(() => rkTick(Date.now(), document.hidden), 1000);
document.addEventListener('visibilitychange', () => { if (document.hidden) { rkPendSave(); rkFlush(); } });

/* ---------- účet ---------- */
async function rkAuth(kind, nick, pass) {
  nick = (nick || '').trim().replace(/\s+/g, ' ');
  if (!/^[0-9A-Za-zÀ-ž _.\-]{3,16}$/.test(nick)) { RK.err = RK_ERR.BAD_NICK; return false; }
  if ((pass || '').length < 6) { RK.err = RK_ERR.BAD_PASS; return false; }
  try {
    const r = await rkRpc(kind === 'new' ? 'atco_register' : 'atco_login', { p_nick: nick, p_pass: pass });
    RK.acct = { nick: r.nick, token: r.token }; lsSet(RK_ACCT, RK.acct); RK.err = '';
    RK.pend = lsGet(rkPendKey(), {});
    return true;
  } catch (e) { RK.err = rkErrText(e); return false; }
}
function rkLogout() { rkPendSave(); rkFlush(); RK.acct = null; lsSet(RK_ACCT, null); RK.pend = {}; }
async function rkLoad() {
  RK.loading = true;
  await rkFlush();
  try { RK.rows = await rkRpc('atco_ranking', {}); RK.loadErr = ''; } catch (e) { RK.loadErr = rkErrText(e); }
  RK.loading = false;
  if (state.mode === 'rank') renderRank(document.getElementById('qcard'));
  if (state.mode === 'profile') renderProfile(document.getElementById('qcard'));
}
function rkTime(s) { s = s || 0; const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? h + ' h ' + m + ' min' : m ? m + ' min' : s ? s + ' s' : '—'; }
/* potvrdzovacie okno v štýle stránky */
function rkConfirm(title, text, yes, fn) {
  const m = document.createElement('div');
  m.className = 'rk-modal';
  m.innerHTML = `<div class="rk-modal-in"><h3>${title}</h3><p>${text}</p><div><button class="btn ghost" data-a="no">ZRUŠIŤ</button><button class="rk-reset solid" data-a="yes">${yes}</button></div></div>`;
  m.onclick = e => { const a = e.target.dataset && e.target.dataset.a; if (a || e.target === m) { m.remove(); if (a === 'yes') fn(); } };
  document.body.appendChild(m);
}
function rkAccountHTML() {
  if (RK.acct) return `<div class="rk-acct in"><span>Prihlásený ako <strong>${dqEsc(RK.acct.nick)}</strong></span><div class="rk-acct-b"><button class="rk-reset" id="rk-reset">VYNULOVAŤ MOJE SKÓRE</button><button class="btn ghost" id="rk-out">ODHLÁSIŤ</button></div></div>${RK.err ? `<div class="rk-err">${dqEsc(RK.err)}</div>` : ''}`;
  return `<div class="rk-acct">
      <div class="rk-acct-t"><strong>Prihlás sa, aby sa ti počítali body</strong><span>Stačí prezývka a heslo. Bez prihlásenia trenažér funguje ďalej, len ťa nebude vidno v rebríčku.</span></div>
      <div class="rk-form">
        <input type="text" id="rk-nick" placeholder="prezývka" maxlength="16" autocomplete="username" spellcheck="false">
        <input type="password" id="rk-pass" placeholder="heslo (min. 6 znakov)" autocomplete="current-password">
        <button class="btn" id="rk-in">PRIHLÁSIŤ</button>
        <button class="btn ghost" id="rk-new">VYTVORIŤ ÚČET</button>
      </div>
      ${RK.err ? `<div class="rk-err">${dqEsc(RK.err)}</div>` : ''}
    </div>`;
}
function rkBindAccount(after) {
  const go = async kind => {
    const n = document.getElementById('rk-nick').value, p = document.getElementById('rk-pass').value;
    await rkAuth(kind, n, p);
    after();
  };
  const bi = document.getElementById('rk-in'), bn = document.getElementById('rk-new'), bo = document.getElementById('rk-out'), br = document.getElementById('rk-reset');
  if (br) br.onclick = () => rkConfirm('Naozaj chceš vynulovať svoje skóre?', 'Vymažú sa tvoje body, odpovede, úspešnosť, čas aj hry v Dobyvateľovi a začínaš odznova. Nedá sa to vrátiť späť.', 'ÁNO, VYNULOVAŤ', async () => {
    RK.pend = {}; rkPendSave();
    try { await rkRpc('atco_reset', { p_token: RK.acct.token }); RK.err = ''; }
    catch (e) { RK.err = /atco_reset|PGRST202|schema cache/i.test(e.message) ? 'Vynulovanie ešte nie je zapnuté v databáze — treba v nej spustiť doplnok SQL.' : rkErrText(e); }
    after();
  });
  if (bi) bi.onclick = () => go('in');
  if (bn) bn.onclick = () => go('new');
  if (bo) bo.onclick = () => { rkLogout(); after(); };
  const pw = document.getElementById('rk-pass');
  if (pw) pw.addEventListener('keydown', e => { if (e.key === 'Enter') go('in'); });
}
/* tlačidlo vpravo hore: neprihlásený → PRIHLÁSIŤ, prihlásený → jeho prezývka; vedie na stránku PROFIL */
function rkHeadBtn() {
  const b = document.getElementById('acct-btn'); if (!b) return;
  b.textContent = RK.acct ? '👤 ' + RK.acct.nick : 'PRIHLÁSIŤ';
  b.classList.toggle('in', !!RK.acct); b.classList.toggle('on', state.mode === 'profile');
}
/* PROFIL — účet, všetky štatistiky hráča a jeho nastavenia na jednom mieste */
function renderProfile(card) {
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = 'profil';
  rkHeadBtn();
  const again = () => { renderProfile(card); rkLoad(); };
  if (!RK.acct) {
    card.innerHTML = `<div class="rk pf">
        <div class="rk-head"><div><h2>PROFIL</h2><p>Prihlás sa alebo si vytvor účet. Potom sa ti počítajú body, čas a úspešnosť, uvidíš sa v rebríčku a v Dobyvateľovi hráš pod svojím menom. Bez prihlásenia trenažér funguje ďalej, len sa nič z toho neukladá.</p></div></div>
        ${SB_ON ? '' : '<div class="rk-warn"><strong>SKÚŠOBNÝ REŽIM</strong> — účty sú zatiaľ len v tomto prehliadači.</div>'}
        ${rkAccountHTML()}
        ${pfLocalHTML()}
      </div>`;
    rkBindAccount(again); pfBindLocal(card);
    return;
  }
  const rowsAll = (RK.rows || []).map(r => { const M = r.mods || {}, o = { nick: r.nick, p: 0 }; RK_MODS.forEach(x => { o.p += (M[x[0]] || {}).p || 0; }); return o; }).sort((a, b) => b.p - a.p || a.nick.localeCompare(b.nick));
  const pos = rowsAll.findIndex(o => o.nick === RK.acct.nick), mine = ((RK.rows || []).find(r => r.nick === RK.acct.nick) || {}).mods || {};
  const g = m => Object.assign({ p: 0, c: 0, w: 0, s: 0, g: 0, v: 0 }, mine[m] || {}), T = { p: 0, c: 0, w: 0, s: 0 };
  RK_MODS.forEach(x => { const a = g(x[0]); 'pcws'.split('').forEach(f => { T[f] += a[f]; }); });
  const pct = (c, w) => (c + w) ? Math.round(c / (c + w) * 100) + ' %' : '—', cq = g('conquer'), ex = g('exam');
  const pend = Object.keys(RK.pend || {}).reduce((a, m) => a + ((RK.pend[m] || {}).p || 0), 0);
  const mxP = Math.max(1, ...RK_MODS.map(x => g(x[0]).p)), sub = RK_SUBJ.map(x => [x[1], g(x[0])]), anySub = sub.some(x => x[1].c + x[1].w > 0);
  card.innerHTML = `<div class="rk pf">
      <div class="rk-head"><div><h2>PROFIL · ${dqEsc(RK.acct.nick)}</h2><p>Všetko o tvojom účte na jednom mieste: poradie, body, úspešnosť a čas podľa modulov, Dobyvateľ, okruhy teórie a pokrok v učení.</p></div><button class="btn ghost" id="pf-refresh">${RK.loading ? 'NAČÍTAVAM…' : '↻ OBNOVIŤ'}</button></div>
      ${RK.loadErr ? `<div class="rk-err">${dqEsc(RK.loadErr)}</div>` : ''}${RK.err ? `<div class="rk-err">${dqEsc(RK.err)}</div>` : ''}
      <div class="rk-me"><div class="rk-me-top pf-top">
        <div><b>${pos >= 0 ? pos + 1 + '.' : '—'}</b><span>miesto z ${rowsAll.length || '—'}</span></div><div><b>${T.p}</b><span>bodov spolu</span></div><div><b>${rkTime(T.s)}</b><span>čas tréningu</span></div>
        <div><b>${pct(T.c, T.w)}</b><span>úspešnosť</span></div><div><b>${T.c + T.w}</b><span>odpovedí</span></div><div><b>${cq.g}</b><span>hier Dobyvateľa</span></div></div></div>
      ${pend ? `<div class="rk-note">Na odoslanie čaká ešte ${pend} bodov z tohto zariadenia — pripíšu sa do pol minúty alebo po stlačení OBNOVIŤ.</div>` : ''}
      <h3 class="pf-h">MODULY</h3>
      <div class="rk-tbl"><table><thead><tr><th>MODUL</th><th>BODY</th><th class="pf-bar"></th><th>SPRÁVNE</th><th>ZLE</th><th>ÚSPEŠNOSŤ</th><th>ČAS</th></tr></thead><tbody>
        ${RK_MODS.map(x => { const a = g(x[0]); return `<tr><td class="rk-nick">${x[1]}</td><td class="rk-pts">${a.p}</td><td class="pf-bar"><i><em style="width:${Math.round(a.p / mxP * 100)}%"></em></i></td><td>${a.c}</td><td>${a.w}</td><td>${pct(a.c, a.w)}</td><td>${rkTime(a.s)}</td></tr>`; }).join('')}
      </tbody></table></div>
      <div class="pf-grid">
        <div class="pf-box"><h3>DOBYVATEĽ</h3><div class="pf-kv"><span>Odohrané hry</span><b>${cq.g}</b><span>Výhry</span><b>${cq.v}</b><span>Podiel výhier</span><b>${cq.g ? Math.round(cq.v / cq.g * 100) + ' %' : '—'}</b><span>Body do rebríčka</span><b>${cq.p}</b><span>Úspešnosť odpovedí</span><b>${pct(cq.c, cq.w)}</b></div><small>Hry a výhry sa počítajú len z hier aspoň dvoch ľudí; body aj z hier proti počítaču (tam ich je málo).</small></div>
        <div class="pf-box"><h3>SKÚŠKY</h3><div class="pf-kv"><span>Body zo skúšok</span><b>${ex.p}</b><span>Zodpovedané otázky</span><b>${ex.c + ex.w}</b><span>Úspešnosť</span><b>${pct(ex.c, ex.w)}</b></div><small>Správna odpoveď +3 (pri písaní +6), nesprávna −2, bonus od 80 %.</small></div>
      </div>
      <h3 class="pf-h">OKRUHY TEÓRIE</h3>
      ${anySub ? `<div class="rk-tbl"><table><thead><tr><th>OKRUH</th><th>SPRÁVNE</th><th>ODPOVEDE</th><th>ÚSPEŠNOSŤ</th><th class="pf-bar"></th></tr></thead><tbody>${sub.map(x => { const n = x[1].c + x[1].w; return `<tr><td class="rk-nick">${x[0]}</td><td class="rk-pts">${x[1].c}</td><td>${n}</td><td>${pct(x[1].c, x[1].w)}</td><td class="pf-bar"><i><em style="width:${n ? Math.round(x[1].c / n * 100) : 0}%"></em></i></td></tr>`; }).join('')}</tbody></table></div>`
        : '<div class="rk-empty">Zatiaľ nič — okruhy sa počítajú z otázok v Dobyvateľovi, v hre aspoň dvoch ľudí.</div>'}
      ${pfLocalHTML()}
      <h3 class="pf-h">ÚČET</h3>
      ${rkAccountHTML()}
    </div>`;
  rkBindAccount(again); pfBindLocal(card);
  document.getElementById('pf-refresh').onclick = again;
}
/* čo je uložené len v tomto zariadení: pokrok v učení a vzhľad v Dobyvateľovi */
function pfLocalHTML() {
  const L = dqLook(), mods = ['aircraft', 'airport', 'callsign', 'waypoint', 'coord'];
  const weak = Object.keys(state.mistakes || {}).filter(k => state.mistakes[k] > 0).length;
  return `<h3 class="pf-h">POKROK V UČENÍ <em>— uložený v tomto zariadení</em></h3>
      <div class="rk-tbl"><table><thead><tr><th>MODUL</th><th>NAUČENÉ</th><th class="pf-bar"></th><th>NA OPAKOVANIE DNES</th><th>SLABÉ MIESTA</th></tr></thead><tbody>
        ${mods.map(m => { const p = modProgress(m); return `<tr><td class="rk-nick">${MOD_NAME[m]}</td><td class="rk-pts">${p.done} / ${p.total}</td><td class="pf-bar"><i><em style="width:${p.total ? Math.round(p.done / p.total * 100) : 0}%"></em></i></td><td>${p.due}</td><td>${p.weak}</td></tr>`; }).join('')}
      </tbody></table></div>
      <div class="rk-note">Naučené = otázka zodpovedaná správne aspoň dvakrát po sebe s odstupom. Slabých miest spolu: ${weak}.</div>
      <h3 class="pf-h">VZHĽAD V DOBYVATEĽOVI</h3>
      <div class="dq-look"><strong>TVOJA FARBA A LIETADLO</strong>
        <div class="dq-look-row">${DQ_PAL.map((c, ci) => `<button class="dq-sw${L.col === ci ? ' on' : ''}" data-pfcol="${ci}" style="background:${c}"></button>`).join('')}</div>
        <div class="dq-look-row">${DQ_ICO.map((ic, ii) => `<button class="dq-ic${L.ico === ii ? ' on' : ''}" data-pfico="${ii}">${ic}</button>`).join('')}</div>
        <div class="dq-look-row"><button class="rk-chip${dqLow() ? '' : ' on'}" id="pf-low">ANIMÁCIE: ${dqLow() ? 'MENEJ' : 'PLNÉ'}</button><small>Farbu dostaneš, ak ju v miestnosti nemá nikto pred tebou; inak ti hra pridelí prvú voľnú.</small></div>
      </div>`;
}
function pfBindLocal(card) {
  const save = ch => { lsSet(DQ_LOOKK, Object.assign(dqLook(), ch)); renderProfile(card); };
  card.querySelectorAll('[data-pfcol]').forEach(b => { b.onclick = () => save({ col: +b.dataset.pfcol }); });
  card.querySelectorAll('[data-pfico]').forEach(b => { b.onclick = () => save({ ico: +b.dataset.pfico }); });
  const lw = document.getElementById('pf-low'); if (lw) lw.onclick = () => { DQ.low = !dqLow(); lsSet(DQ_LOWK, DQ.low ? 1 : 0); renderProfile(card); };
}
function renderRank(card) {
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = 'liga';
  const v = RK.view, rows = (RK.rows || []).map(r => {
    const M = r.mods || {}, o = { nick: r.nick, p: 0, c: 0, w: 0, s: 0, g: 0, v: 0 };
    (v === 'all' ? RK_MODS.map(x => x[0]) : [v]).forEach(m => { const x = M[m]; if (x) 'pcwsgv'.split('').forEach(f => { o[f] += x[f] || 0; }); });
    o.M = M;
    return o;
  }).filter(o => v === 'all' || o.p || o.c || o.w || o.s || o.g).sort((a, b) => b.p - a.p || b.c - a.c || a.nick.localeCompare(b.nick));
  const meI = RK.acct ? rows.findIndex(o => o.nick === RK.acct.nick) : -1, me = rows[meI];
  const acc = o => (o.c + o.w) ? Math.round(o.c / (o.c + o.w) * 100) + ' %' : '—';
  const cq = v === 'conquer', sj = v.indexOf('q_') === 0;
  const head = sj ? ['#', 'HRÁČ', 'SPRÁVNE', 'ODPOVEDE', 'ÚSPEŠNOSŤ'] : cq ? ['#', 'HRÁČ', 'BODY', 'HRY', 'VÝHRY', 'ODPOVEDE', 'ÚSPEŠNOSŤ', 'ČAS'] : v === 'all' ? ['#', 'HRÁČ', 'BODY', 'ODPOVEDE', 'ÚSPEŠNOSŤ', 'ČAS', 'HRY', 'VÝHRY'] : ['#', 'HRÁČ', 'BODY', 'ODPOVEDE', 'ÚSPEŠNOSŤ', 'ČAS'];
  const line = (o, i) => {
    const d = o.M.conquer || {};
    const cells = sj ? [o.c, o.c + o.w, acc(o)] : cq ? [o.p, o.g, o.v, o.c + o.w, acc(o), rkTime(o.s)] : v === 'all' ? [o.p, o.c + o.w, acc(o), rkTime(o.s), d.g || 0, d.v || 0] : [o.p, o.c + o.w, acc(o), rkTime(o.s)];
    return `<tr class="${i === meI ? 'me' : ''}"><td class="rk-pos">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td class="rk-nick">${dqEsc(o.nick)}</td>${cells.map((c, k) => `<td${k === 0 ? ' class="rk-pts"' : ''}>${c}</td>`).join('')}</tr>`;
  };
  let mine = '';
  if (me) {
    const all = (RK.rows.find(r => r.nick === RK.acct.nick) || {}).mods || {};
    const mx = Math.max(1, ...RK_MODS.map(x => (all[x[0]] || {}).s || 0));
    mine = `<div class="rk-me">
        <div class="rk-me-top"><div><b>${meI + 1}.</b><span>z ${rows.length} hráčov</span></div><div><b>${me.p}</b><span>bodov</span></div><div><b>${rkTime(me.s)}</b><span>čas tréningu</span></div><div><b>${acc(me)}</b><span>úspešnosť z ${me.c + me.w} odpovedí</span></div><div><b>${(all.conquer || {}).g || 0}</b><span>hier Dobyvateľa</span></div></div>
        ${v === 'all' ? `<div class="rk-bars">${RK_MODS.map(x => { const s = (all[x[0]] || {}).s || 0, p = (all[x[0]] || {}).p || 0; return `<div><span>${x[1]}</span><i><em style="width:${Math.round(s / mx * 100)}%"></em></i><small>${rkTime(s)} · ${p} b.</small></div>`; }).join('')}</div>` : ''}
      </div>`;
  }
  card.innerHTML = `
    <div class="rk">
      <div class="rk-head"><div><h2>REBRÍČEK</h2><p>Body za správne odpovede, skúšky a Dobyvateľa. <a href="#" data-hp="rank">Ako sa počítajú ❓</a></p></div><button class="btn ghost" id="rk-refresh">${RK.loading ? 'NAČÍTAVAM…' : '↻ OBNOVIŤ'}</button></div>
      ${SB_ON ? '' : '<div class="rk-warn"><strong>SKÚŠOBNÝ REŽIM</strong> — rebríček ešte nie je pripojený na databázu. Účty a body sú zatiaľ len v tomto prehliadači a kolegovia ich nevidia.</div>'}
      ${RK.acct ? '' : '<div class="rk-acct in"><span>Nie si prihlásený — body sa ti nepočítajú a v rebríčku ťa nevidno.</span><div class="rk-acct-b"><button class="btn" id="rk-toprof">PRIHLÁSIŤ SA ▶</button></div></div>'}
      ${mine}
      <div class="rk-chips">${[['all', 'CELKOVO']].concat(RK_MODS).map(x => `<button class="rk-chip${v === x[0] ? ' on' : ''}" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>
      <div class="rk-chips sub"><span>OKRUHY TEÓRIE</span>${RK_SUBJ.map(x => `<button class="rk-chip${v === x[0] ? ' on' : ''}" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>
      ${sj ? '<div class="rk-note">Počítajú sa odpovede na otázky z tohto okruhu v Dobyvateľovi, v hre aspoň dvoch ľudí. Poradie je podľa počtu správnych odpovedí.</div>' : ''}
      ${RK.loadErr ? `<div class="rk-err">${dqEsc(RK.loadErr)}</div>` : ''}
      ${rows.length ? `<div class="rk-tbl"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(line).join('')}</tbody></table></div>`
        : `<div class="rk-empty">${RK.rows ? 'Zatiaľ tu nikto nemá body. Buď prvý.' : 'Načítavam rebríček…'}</div>`}
    </div>`;
  const tp = document.getElementById('rk-toprof'); if (tp) tp.onclick = () => startMode('profile');
  document.getElementById('rk-refresh').onclick = () => { renderRank(card); rkLoad(); };
  card.querySelectorAll('.rk-chip').forEach(b => { b.onclick = () => { RK.view = b.dataset.v; renderRank(card); }; });
}
