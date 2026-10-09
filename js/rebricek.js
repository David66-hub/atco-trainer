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
  ['coord', 'MOD 06 · KOORDINÁCIA'], ['daily', 'DENNÝ TRÉNING'], ['exam', 'DENNÁ VÝZVA'], ['conquer', 'DOBYVATEĽ'], ['theory', 'MOD 07 · TEÓRIA'], ['wake', 'MOD 08 · ROZSTUPY'], ['metar', 'MOD 09 · METAR'], ['phrase', 'MOD 10 · FRAZEOLÓGIA'], ['calc', 'MOD 11 · POČTY'], ['abbr', 'MOD 12 · SKRATKY'], ['bonus', 'BONUSY · ÚLOHY TÝŽDŇA']];
const RK_SUBJ = [['q_atm', 'ATM'], ['q_nav', 'NAVIGÁCIA'], ['q_met', 'METEOROLÓGIA'], ['q_eqps', 'ZARIADENIA'], ['q_hum', 'ĽUDSKÉ FAKTORY'], ['q_acft', 'LIETADLÁ'], ['q_pen', 'PRAC. PROSTREDIE'], ['q_law', 'LETECKÉ PRÁVO'], ['q_hist', 'HISTÓRIA'], ['q_gen', 'VŠEOBECNÝ PREHĽAD']];
const RK_ERR = { NICK_TAKEN: 'Táto prezývka je už obsadená — skús inú.', BAD_LOGIN: 'Nesprávna prezývka alebo heslo.',
  BAD_NICK: 'Prezývka musí mať 3 až 16 znakov (písmená, čísla, medzera, bodka, pomlčka).', BAD_PASS: 'Heslo musí mať aspoň 6 znakov.', WEAK_PASS: 'Nové heslo musí mať aspoň 8 znakov a obsahovať písmeno aj číslicu.',
  BAD_TOKEN: 'Prihlásenie vypršalo — prihlás sa znova.', NO_PLAYER: 'Hráč s takou prezývkou neexistuje.', SELF: 'Seba si pridať nemôžeš.', NOT_FRIEND: 'Správy sa dajú posielať len potvrdeným priateľom.',
  LIMIT: 'Priveľa žiadostí alebo správ naraz — skús to neskôr.', BAD_EMAIL: 'E-mail nemá správny tvar.', BAD_AVATAR: 'Obrázok sa nedá použiť — skús iný.', BAD_CODE: 'Kód miestnosti má štyri písmená.', EMPTY: 'Správa je prázdna.' };
/* ÚROVNE (v4.9): odomykajú sa celkovým počtom bodov; zatiaľ sú len na ozdobu, hru neovplyvňujú */
/* úrovne (v4.13.1): 58 stupňov, veže a approach zoradené podľa počtu obyvateľov mesta — od uchádzača cez veže a approach po ACC a zahraničie; [body, názov, skupina] */
const LV = [[0, 'Uchádzač', 'ZAČIATOK'], [100, 'Feasťák', 'ZAČIATOK'], [300, 'Študent ab-initio', 'ZAČIATOK'], [600, 'Riadiaci v základnom výcviku', 'ZAČIATOK'], [1000, 'Študent na simulátore', 'ZAČIATOK'], [1500, 'Stážista OJT TWR', 'VEŽA'], [2000, 'ATCO TWR Boleráz', 'VEŽA'], [2500, 'ATCO TWR Očová', 'VEŽA'], [3000, 'ATCO TWR Sliač', 'VEŽA'], [3600, 'ATCO TWR Svidník', 'VEŽA'], [4200, 'ATCO TWR Holíč', 'VEŽA'], [4900, 'ATCO TWR Senica', 'VEŽA'], [5600, 'ATCO TWR Partizánske', 'VEŽA'], [6400, 'ATCO TWR Lučenec', 'VEŽA'], [7200, 'ATCO TWR Ružomberok', 'VEŽA'], [8100, 'ATCO TWR Piešťany', 'VEŽA'], [9000, 'ATCO TWR Spišská Nová Ves', 'VEŽA'], [10000, 'ATCO TWR Nové Zámky', 'VEŽA'], [11000, 'ATCO TWR Prievidza', 'VEŽA'], [12000, 'ATCO TWR Poprad-Tatry', 'VEŽA'], [13000, 'ATCO TWR Martin', 'VEŽA'], [14000, 'ATCO TWR Trenčín', 'VEŽA'], [15000, 'ATCO TWR Nitra', 'VEŽA'], [16000, 'ATCO TWR Žilina', 'VEŽA'], [17000, 'ATCO TWR Prešov', 'VEŽA'], [18500, 'ATCO TWR Košice', 'VEŽA'], [20000, 'ATCO TWR Bratislava', 'VEŽA'], [22000, 'Stážista OJT APP', 'APPROACH'], [24000, 'ATCO APP Sliač', 'APPROACH'], [26000, 'ATCO APP Piešťany', 'APPROACH'], [28000, 'ATCO APP Poprad', 'APPROACH'], [30000, 'ATCO APP Žilina', 'APPROACH'], [32500, 'ATCO APP Košice', 'APPROACH'], [35000, 'ATCO APP Bratislava', 'APPROACH'], [38000, 'Stážista OJT ACC', 'ACC'], [41000, 'ATCO ACC Bratislava', 'ACC'], [44000, 'ATCO ACC Budapest', 'ZAHRANIČIE'], [47000, 'ATCO ACC Praha', 'ZAHRANIČIE'], [50000, 'ATCO ACC Warszawa', 'ZAHRANIČIE'], [53000, 'ATCO ACC Wien', 'ZAHRANIČIE'], [56000, 'ATCO ACC Zagreb', 'ZAHRANIČIE'], [59000, 'ATCO ACC München', 'ZAHRANIČIE'], [62000, 'ATCO ACC Zürich', 'ZAHRANIČIE'], [65000, 'ATCO ACC Milano', 'ZAHRANIČIE'], [68000, 'ATCO ACC Madrid', 'ZAHRANIČIE'], [71000, 'ATCO ACC Paris', 'ZAHRANIČIE'], [74000, 'ATCO UAC Karlsruhe', 'ZAHRANIČIE'], [77000, 'ATCO UAC Maastricht', 'ZAHRANIČIE'], [80000, 'ATCO ACC London', 'ZAHRANIČIE'], [83000, 'ATCO New York Center', 'ZAHRANIČIE'], [86000, 'ATCO Shanwick Oceanic', 'ZAHRANIČIE'], [88000, 'Inštruktor OJTI', 'VRCHOL'], [90000, 'Hodnotiteľ', 'VRCHOL'], [92000, 'Supervízor', 'VRCHOL'], [94000, 'Vedúci zmeny', 'VRCHOL'], [96000, 'Vedúci prevádzky', 'VRCHOL'], [98000, 'Legenda éteru', 'VRCHOL'], [100000, 'Kráľ neba', 'VRCHOL']];
/* štítok úrovne (v4.15): „LVL 5“ vo farbe skupiny, v plnej podobe aj s názvom */
function lvTag(n, full, lg) { const x = LV[Math.max(1, Math.min(LV.length, n)) - 1], g = LG[lg] ? lg : 1; return `<em class="lv-b l${g}${full ? ' full' : ''}" title="úroveň ${n} · ${x[1]} · liga ${LG[g]}"><b>LVL ${n}</b>${full ? `<i>${x[1]}</i>` : ''}</em>`; }
function rkLevel(p) { let n = 0; while (n + 1 < LV.length && p >= LV[n + 1][0]) n++; const nx = LV[n + 1]; return { n: n + 1, name: LV[n][1], from: LV[n][0], next: nx ? nx[0] : null, nextName: nx ? nx[1] : '', pct: nx ? Math.round((p - LV[n][0]) / (nx[0] - LV[n][0]) * 100) : 100 }; }
/* okno so všetkými úrovňami: kde som, čo mám odomknuté a koľko chýba k ďalším */
function lvOpen(p) {
  const old = document.getElementById('lv-wrap'); if (old) old.remove();
  const L = rkLevel(p), w = document.createElement('div'); w.id = 'lv-wrap';
  w.innerHTML = `<div class="hp lv" role="dialog" aria-label="Úrovne">
      <div class="hp-top"><span>ÚROVNE · MÁŠ ${p} BODOV</span><button data-lv="x" title="Zavrieť">✕</button></div>
      <div class="lv-list">${LV.map((x, i) => { const n = i + 1, done = n < L.n, cur = n === L.n, nx = LV[i + 1];
        return `${i === 0 || LV[i - 1][2] !== x[2] ? `<div class="lv-grp">${x[2]}</div>` : ''}<div class="lv-row${done ? ' done' : cur ? ' cur' : ' lock'}" style="animation-delay:${(Math.min(i, 10) * 0.03).toFixed(2)}s"><b>${n}</b><div><strong>${x[1]}</strong><span>${x[0] === 0 ? 'od začiatku' : 'od ' + x[0] + ' bodov'}${cur ? (nx ? ' · do ďalšej chýba ' + (nx[0] - p) : ' · najvyššia úroveň') : !done ? ' · chýba ' + (x[0] - p) : ''}</span>${cur && nx ? `<i><em style="width:${L.pct}%"></em></i>` : ''}</div><u>${done ? '✓' : cur ? 'TU SI' : '🔒'}</u></div>`; }).join('')}</div>
      <div class="lv-note">Úrovne sa odomykajú všetkými bodmi, ktoré si kedy získal — z cvičenia, dennej výzvy aj Dobyvateľa. Neklesajú.</div>
      <div class="hp-act"><span></span><button class="btn" data-lv="x">ZAVRIEŤ</button></div>
    </div>`;
  w.addEventListener('click', e => { if (e.target === w || (e.target.closest && e.target.closest('[data-lv]'))) w.remove(); });
  document.body.appendChild(w);
  const c = w.querySelector('.lv-row.cur'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'center' });
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const w = document.getElementById('lv-wrap'); if (w) w.remove(); } });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-lvopen]'); if (b) lvOpen(+b.dataset.lvopen || 0); });
function rkTotal(r) { const M = (r && r.mods) || {}; return RK_MODS.reduce((a, x) => a + ((M[x[0]] || {}).p || 0), 0); }
/* nová úroveň → oznam vpravo hore (porovnáva sa s poslednou úrovňou, ktorú toto zariadenie videlo) */
function rkLevelCheck() {
  if (!RK.acct || !RK.rows) return;
  const r = RK.rows.find(x => x.nick === RK.acct.nick); if (!r) return;
  const L = rkLevel(rkTotal(r)), k = 'atcoTrainerV2.lvSeen:' + RK.acct.nick.toLowerCase(), old = lsGet(k, 0);
  if (old && L.n > old) {
    let box = document.getElementById('soc-toasts'); if (!box) { box = document.createElement('div'); box.id = 'soc-toasts'; document.body.appendChild(box); }
    const el = document.createElement('div'); el.className = 'soc-toast k-level';
    el.innerHTML = `<small>NOVÁ ÚROVEŇ ${L.n}</small><b>${dqEsc(L.name)}</b><span>${L.next ? 'Ďalšia: ' + dqEsc(L.nextName) + ' pri ' + L.next + ' bodoch.' : 'Najvyššia úroveň.'}</span><div><button class="btn" data-st="x">SUPER</button></div>`;
    el.onclick = () => el.remove(); box.appendChild(el); setTimeout(() => el.remove(), 15000);
  }
  if (L.n !== old) lsSet(k, L.n);
}
const LG = ['', 'BRONZ', 'STRIEBRO', 'ZLATO', 'PLATINA', 'DIAMANT'], LGC = ['', '#b0703c', '#9aa3ad', '#e0a800', '#3aa6a0', '#5b8def'];
const AV = { m: {}, busy: false };   // profilovky a emoji hráčov podľa prezývky (v4.11)
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
  'airport.click': ['MOD 02 · NÁJDI NA MAPE', [['type', 'Dostaneš kód alebo mesto', 'Nič nepíšeš.'], ['click', 'Klikni, kde letisko leží', 'ĽAHKÁ uzná 100 km, HARDCORE 50 km (na mape Slovenska 15 a 8 km).']]],
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
  exam: ['DENNÁ VÝZVA', [['calendar', 'Každý deň nová', 'Dvadsať otázok, pre všetkých tie isté. Máš jeden pokus denne.'], ['timer', 'Na čas', '12 sekúnd na otázku, pri písaní 20.'], ['eye', 'Bez nápovedí', 'Či si odpovedal správne, uvidíš až na konci.'], ['score', 'Body', 'Správna +3 (pri písaní +6), nesprávna alebo preskočená −2.'], ['podium', 'Od 80 % bonus', 'A ešte väčší za 90 a 100 %.']]],
  rank: ['REBRÍČEK · AKO SA POČÍTA', [['score', 'Cvičenie v module', 'Správna odpoveď 1 bod, v HARDCORE (písanie) 2 body. Nesprávna 0.'], ['calendar', 'Denný tréning', 'Rovnako: 1 bod, pri písaní 2.'], ['timer', 'Denná výzva', 'Správna +3 (pri písaní +6), nesprávna −2. Bonus od 80 %. Počíta sa prvý pokus dňa.'], ['swords', 'Dobyvateľ', '500 × miesto × výkon × hráči × dĺžka × okruhy. Viac ľudí a kôl = viac bodov.'], ['bars', 'Úspešnosť', 'Správne odpovede delené všetkými. Preskočená otázka je nesprávna.'], ['timer', 'Čas tréningu', 'Beží, len keď odpovedáš. Po 45 sekundách bez odpovede sa zastaví.'], ['podium', 'Mesačné ligy', 'Body za mesiac. Prví traja postupujú, poslední traja zostupujú. Päť líg od Bronzu po Diamant.'], ['podium', 'Celkové poradie', 'Podľa všetkých bodov; pri zhode podľa počtu správnych odpovedí.'], ['login', 'Kto je v rebríčku', 'Len prihlásení. Bez účtu sa nič neukladá.']]],
  profile: ['PROFIL', [['login', 'Tvoj účet', 'Prihlásenie, odhlásenie a vynulovanie skóre.'], ['bars', 'Všetky štatistiky', 'Body, úspešnosť a čas podľa modulov.'], ['calendar', 'Pokrok v učení', 'Koľko máš naučené a čo je dnes na opakovanie.'], ['swords', 'Vzhľad v hre', 'Farba a lietadlo pre Dobyvateľa.']]],
  conquer: ['DOBYVATEĽ · PRAVIDLÁ', [['terr', 'Boj o mapu Slovenska', 'Každý priestor má body: letisko 500, CTR 400, TMA 300, TRA/TSA 200, LZR 150, G 100.'], ['axis', '1 · Štart', 'Tipneš číslo. Kto je najbližšie, vyberá si domovské letisko prvý.'], ['choice', '2 · Obsadzovanie', 'Správna odpoveď = berieš susedný voľný priestor. Najrýchlejší dva.'], ['swords', '3 · Súboje', 'Útočíš na suseda. Odpovedáte obaja; rýchlosť nerozhoduje.'], ['axis', 'Obaja správne? Rozstrel', 'Tipovacia otázka, najviac tri. V tretej rozhodne aj čas.'], ['heart', 'Domovské letisko', 'Má tri životy. Pri treťom zásahu vypadávaš.'], ['joker', 'Žolíky — raz za hru', '50:50, +10 sekúnd a dvojité body pri útoku.'], ['podium', 'Koniec', 'Najviac bodov vyhráva. Do rebríčka ide viac za viac ľudí a kôl.']]],
};
/* počas hry: jedna krátka karta k aktuálnej fáze; mimo otázky sa dá pokračovať na všetky pravidlá */
Object.assign(HELP, {
  theory: ['MOD 07 · TEÓRIA', [['list', 'Deväť okruhov', 'Vyber si okruh alebo nechaj všetky naraz.'], ['choice', 'Štyri možnosti', 'Klikni alebo stlač 1 až 4. Niektoré otázky majú fotku.'], ['hint', 'Chyby sa pamätajú', 'Zapni LEN MOJE CHYBY a opakuj, čo ti nejde.']]],
  wake: ['MOD 08 · ROZSTUPY', [['photo', 'Dve lietadlá', 'Jedno letí vpredu, druhé za ním.'], ['choice', 'Urči rozstup', 'Podľa kategórií SUPER, HEAVY, MEDIUM a LIGHT.'], ['table', 'Vysvetlenie', 'Po odpovedi uvidíš, prečo to tak je.']]],
  metar: ['MOD 09 · METAR', [['type', 'Vygenerovaná správa', 'Každá otázka má novú správu METAR.'], ['choice', 'Jedna vec zo správy', 'Vietor, dohľadnosť, oblačnosť, teplota alebo tlak.'], ['hint', 'Kódy zvlášť', 'V režime ČO ZNAMENÁ KÓD sa učíš skratky počasia.']]],
  phrase: ['MOD 10 · FRAZEOLÓGIA', [['radio', 'Štandardné slová', 'Čo presne znamená ROGER, WILCO či STANDBY.'], ['type', 'Hláskovanie a čísla', 'Abeceda a ako sa vysielajú čísla.'], ['choice', 'Read-back', 'Čo musí pilot zopakovať a čo stačí potvrdiť.']]],
  calc: ['MOD 11 · POČTY Z HLAVY', [['calc', 'Rýchle počty', 'Prevodná hladina, čas a vzdialenosť, klesanie, jednotky.'], ['choice', 'Vyber výsledok', 'Štyri možnosti, jedna správna.'], ['hint', 'Postup', 'Po odpovedi uvidíš, ako sa to počíta.']]],
  abbr: ['MOD 12 · SKRATKY', [['list', 'Skratky ICAO', 'Skratka na význam alebo naopak.'], ['radio', 'Q-kódy', 'QNH, QFE, QDM a ďalšie.'], ['hint', 'Chyby sa pamätajú', 'LEN MOJE CHYBY ti vráti, čo si pokazil.']]] });
function hpGameNow() {
  const S = DQ.S; if (!S || S.phase === 'lobby') return helpOpen('conquer');
  const ph = S.phase === 'rest' || S.phase === 'count' ? (S.cnt || S.phase) : S.phase;
  const M = {
    startq: ['axis', 'Tipni číslo', 'Kto je najbližšie k správnemu číslu, vyberá si letisko prvý.'], startrev: ['axis', 'Vyhodnotenie tipov', 'Poradie výberu letiska je podľa presnosti tipu.'],
    startpick: ['heart', 'Domovské letisko', 'Klikni na sivý kruh. Letisko má tri životy.'],
    claimq: ['choice', 'Obsadzovanie', 'Správna odpoveď = berieš priestor. Najrýchlejší dva.'], claimrev: ['choice', 'Kto odpovedal správne', 'Správni si teraz vyberú priestor.'],
    pick: ['terr', 'Vyber si priestor', 'Sivý priestor, ktorý susedí s tvojím.'], warpick: ['swords', 'Útok', 'Meče = súperov priestor. Sivý = voľný na obsadenie.'], war: ['swords', 'Idú súboje', 'Každý hráč je v kole raz na rade.'],
    modpick: ['mods', 'Okruh otázky', 'Útočník volí, z čoho otázka padne, a potvrdí.'], duelintro: ['swords', 'Súboj', 'Odpovedá útočník aj obranca.'],
    duelq: ['swords', 'Súboj', 'Rýchlosť nerozhoduje. Obaja správne = rozstrel.'], duelrev: ['swords', 'Výsledok súboja', 'Dobyté, ubránené (+100), alebo sa nič nemení.'],
    tieq: ['axis', 'Rozstrel', 'Vyhráva presnejší tip. Najviac tri, v treťom rozhodne aj čas.'], tierev: ['axis', 'Výsledok rozstrelu', 'Bližší tip vyhráva súboj.'],
    end: ['podium', 'Koniec hry', 'Pod stupňami je rozpis bodov a tvoje chyby.'],
  };
  const c = M[ph] || ['terr', 'Dobyvateľ', 'Boj o mapu: najviac bodov vyhráva.'];
  HELP._now = ['DOBYVATEĽ · PRÁVE TERAZ', dqAsking(S) && !S.rev ? [c] : [c].concat(HELP.conquer[1])];
  hpDraw('_now', 0);
}
function hpKeyNow() {
  const m = state.mode;
  if (m === 'about') return 'home';
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
        ${last && (key === 'conquer' || key === '_now') && !DQ.room ? '<button class="btn ghost" data-hpa="demo">▶ SKÚSIŤ VZOR HRY</button>' : ''}
        <button class="btn" data-hpa="n">${last ? 'ROZUMIEM ✓' : 'ĎALEJ ▶'}</button></div>
    </div>`;
}
function helpOpen(key) { if (HELP[key]) hpDraw(key, 0); }
/* okno sa otvára len tlačidlom ❓ — samo sa pri otvorení módu neukazuje (v4.6) */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-hp]'); if (b) { e.preventDefault(); if (b.dataset.hp === 'game') hpGameNow(); else helpOpen(b.dataset.hp === '*' ? hpKeyNow() : b.dataset.hp); } });
function dqEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
/* číslo verzie — zvyšuje sa pri každej úprave, vidno ho v hlavičke, na úvode aj v Dobyvateľovi */
const APP_VERSION = '5.4.7';
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
    if (a.p_pass.length < 8 || !/[A-Za-zÀ-ž]/.test(a.p_pass) || !/\d/.test(a.p_pass)) throw new Error('WEAK_PASS');
    P[k] = { nick: a.p_nick, pass: a.p_pass, token: Math.random().toString(36).slice(2) + Date.now().toString(36), mods: {}, created: new Date().toISOString() };
    out = { nick: P[k].nick, token: P[k].token };
  } else if (fn === 'atco_login') {
    const p = P[a.p_nick.toLowerCase()];
    if (!p || p.pass !== a.p_pass) throw new Error('BAD_LOGIN');
    out = { nick: p.nick, token: p.token };
  } else if (fn === 'atco_report') {
    const p = byTok(a.p_token);
    if (!p) throw new Error('BAD_TOKEN');
    a.p_rows.forEach(r => { const m = p.mods[r.m] = p.mods[r.m] || { p: 0, c: 0, w: 0, s: 0, g: 0, v: 0 }; 'pcwsgv'.split('').forEach(f => { m[f] += r[f] || 0; });
      if (r.m.indexOf('q_') !== 0) { const D = p.days = p.days || {}, k = dcDay(), d = D[k] = D[k] || { p: 0, c: 0, w: 0, s: 0 }; 'pcws'.split('').forEach(f => { d[f] += r[f] || 0; }); } });
    out = { ok: true };
  } else if (fn === 'atco_reset') {
    const p = byTok(a.p_token);
    if (!p) throw new Error('BAD_TOKEN');
    p.mods = {}; out = { ok: true };
  } else if (fn === 'atco_qreport') {
    (db.qrep = db.qrep || []).push(a); out = { ok: true };
  } else if (fn === 'atco_qfix_list') { out = db.qfix || [];
  } else if (fn === 'atco_progress_get' || fn === 'atco_progress_set' || fn === 'atco_instructor') {
    const p = byTok(a.p_token); if (!p) throw new Error('BAD_TOKEN');
    if (fn === 'atco_progress_get') out = { data: p.prog || null, at: p.progAt || null };
    else if (fn === 'atco_progress_set') { p.prog = JSON.parse(JSON.stringify(a.p_data)); p.progAt = new Date().toISOString(); out = { at: p.progAt }; }
    else { if (p.role !== 'instructor') throw new Error('FORBIDDEN'); out = Object.keys(P).map(k => ({ nick: P[k].nick, lg: P[k].lg || 1, seen: P[k].actAt ? new Date(P[k].actAt).toISOString() : new Date().toISOString(), mods: P[k].mods, days: Object.keys(P[k].days || {}).sort().map(d => Object.assign({ d }, P[k].days[d])), dc: P[k].dc ? [{ d: P[k].dc.day, g: P[k].dc.g, t: P[k].dc.t, s: P[k].dc.s }] : [] })); }
  } else if (fn === 'atco_my_days' || fn === 'atco_daily_submit') {
    const p = byTok(a.p_token); if (!p) throw new Error('BAD_TOKEN');
    if (fn === 'atco_my_days') out = Object.keys(p.days || {}).sort().slice(-28).map(d => Object.assign({ d }, p.days[d]));
    else if (p.dc && p.dc.day === dcDay()) out = { ok: false }; else { p.dc = { day: dcDay(), g: a.p_good, t: a.p_total, s: a.p_secs, p: a.p_pts }; out = { ok: true }; }
  } else if (/^atco_(me|set_profile|set_emoji|rename|change_pass|friend_|msg_|social)/.test(fn)) {
    const p = byTok(a.p_token), key = n => String(n || '').trim().toLowerCase(), F = db.fr = db.fr || [], M = db.msgs = db.msgs || [];
    if (!p) throw new Error('BAD_TOKEN');
    const me = key(p.nick), pair = (x, y) => F.find(f => (f.a === x && f.b === y) || (f.a === y && f.b === x)), okFr = n => { const f = pair(me, n); return f && f.st === 'ok'; };
    out = { ok: true };
    if (fn === 'atco_me') out = { nick: p.nick, email: p.email || '', avatar: p.avatar || '', bg: p.bg || '', created: p.created || null, role: p.role || '', emoji: p.emoji || '' };
    else if (fn === 'atco_set_emoji') p.emoji = String(a.p_emoji || '').slice(0, 8);
    else if (fn === 'atco_set_profile') { if (a.p_email != null) { if (a.p_email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.p_email)) throw new Error('BAD_EMAIL'); p.email = a.p_email; } if (a.p_avatar != null) p.avatar = a.p_avatar; if (a.p_bg != null) p.bg = a.p_bg; }
    else if (fn === 'atco_rename') { if (p.pass !== a.p_pass) throw new Error('BAD_LOGIN'); const k = key(a.p_nick); if (P[k] && P[k] !== p) throw new Error('NICK_TAKEN'); F.forEach(f => { if (f.a === me) f.a = k; if (f.b === me) f.b = k; }); M.forEach(m => { if (m.to === me) m.to = k; if (m.from === me) m.from = k; }); delete P[me]; p.nick = a.p_nick; P[k] = p; out = { nick: p.nick, token: p.token }; }
    else if (fn === 'atco_change_pass') { if (p.pass !== a.p_old) throw new Error('BAD_LOGIN'); p.pass = a.p_new; p.token = Math.random().toString(36).slice(2) + Date.now().toString(36); out = { nick: p.nick, token: p.token }; }
    else if (fn === 'atco_friend_add') { const k = key(a.p_nick); if (!P[k]) throw new Error('NO_PLAYER'); if (k === me) throw new Error('SELF'); const f = pair(me, k); if (f) { if (f.b === me) f.st = 'ok'; } else { F.push({ a: me, b: k, st: 'pending' }); M.push({ id: Date.now(), to: k, from: me, kind: 'friend', body: '', t: Date.now(), read: false }); } }
    else if (fn === 'atco_friend_answer') { const k = key(a.p_nick), i = F.findIndex(f => f.a === k && f.b === me); if (i >= 0) { if (a.p_ok) F[i].st = 'ok'; else F.splice(i, 1); } M.forEach(m => { if (m.to === me && m.from === k && m.kind === 'friend') m.read = true; }); }
    else if (fn === 'atco_friend_remove') { const k = key(a.p_nick), i = F.findIndex(f => (f.a === me && f.b === k) || (f.a === k && f.b === me)); if (i >= 0) F.splice(i, 1); }
    else if (fn === 'atco_msg_send') { const k = key(a.p_nick); if (!P[k]) throw new Error('NO_PLAYER'); if (!okFr(k)) throw new Error('NOT_FRIEND'); if (!String(a.p_body || '').trim()) throw new Error('EMPTY'); M.push({ id: Date.now() + Math.floor(Math.random() * 999), to: k, from: me, kind: a.p_kind === 'invite' ? 'invite' : 'msg', body: String(a.p_body).slice(0, 300), t: Date.now(), read: false }); }
    else if (fn === 'atco_msg_read') M.forEach(m => { if (m.to === me && (a.p_id == null || m.id === a.p_id)) m.read = true; });
    else if (fn === 'atco_msg_delete') db.msgs = M.filter(m => !(m.to === me && (a.p_id == null || m.id === a.p_id)));
    else if (fn === 'atco_social') {
      p.act = a.p_activity || ''; p.actAt = Date.now();
      out = { friends: F.filter(f => f.a === me || f.b === me).map(f => { const o = P[f.a === me ? f.b : f.a] || {}, on = f.st === 'ok' && Date.now() - (o.actAt || 0) < 75000; return { nick: o.nick, avatar: o.avatar || '', st: f.st === 'ok' ? 'ok' : f.a === me ? 'out' : 'in', online: on, activity: on ? o.act || '' : '', seen: o.actAt ? new Date(o.actAt).toISOString() : null }; }),
        inbox: M.filter(m => m.to === me).sort((x, y) => y.t - x.t).slice(0, 60).map(m => ({ id: m.id, from: (P[m.from] || {}).nick || m.from, kind: m.kind, body: m.body, created: new Date(m.t).toISOString(), read: m.read })), unread: M.filter(m => m.to === me && !m.read).length,
        sent: M.filter(m => m.from === me && m.kind !== 'friend').sort((x, y) => y.t - x.t).slice(0, 80).map(m => ({ id: m.id, to: (P[m.to] || {}).nick || m.to, kind: m.kind, body: m.body, created: new Date(m.t).toISOString(), read: m.read })) };
    }
  } else if (fn === 'atco_weekly' || fn === 'atco_weekly_claim') {
    const p = byTok(a.p_token); if (!p) throw new Error('BAD_TOKEN');
    const W = wkWeek(), D = p.days || {}, sum = f => W.days.reduce((x, k) => x + ((D[k] || {})[f] || 0), 0), st = () => ({ week: W.id, left: W.left, pts: sum('p'), days: W.days.filter(k => (D[k] || {}).p > 0).length, ok: sum('c'), mins: Math.floor(sum('s') / 60), done: ((p.wk || {})[W.id] || []).slice() });
    if (fn === 'atco_weekly') out = st();
    else { const S = st(), need = { pts: [S.pts, 500], days: [S.days, 4], ok: [S.ok, 150], time: [S.mins, 45] }[a.p_task]; if (!need) throw new Error('BAD_TASK'); if (need[0] < need[1]) throw new Error('NOT_DONE');
      p.wk = p.wk || {}; const L = p.wk[W.id] = p.wk[W.id] || [], nw = L.indexOf(a.p_task) < 0;
      if (nw) { L.push(a.p_task); const m = p.mods.bonus = p.mods.bonus || { p: 0, c: 0, w: 0, s: 0, g: 0, v: 0 }; m.p += 50; const k = dcDay(), d = D[k] = D[k] || { p: 0, c: 0, w: 0, s: 0 }; d.p += 50; p.days = D; }
      out = { new: nw, state: st() }; }
  } else if (fn === 'atco_avatars') {
    out = {}; (a.p_nicks || []).forEach(n => { const p = P[String(n).toLowerCase()]; if (p) out[p.nick] = { a: p.avatar || '', e: p.emoji || '' }; });
  } else if (fn === 'atco_ranking') {
    const ym = dcDay().slice(0, 7);
    out = Object.keys(P).map(k => ({ nick: P[k].nick, mods: P[k].mods, lg: P[k].lg || 1, emo: P[k].emoji || '', av: !!P[k].avatar, mp: Object.keys(P[k].days || {}).filter(d => d.slice(0, 7) === ym).reduce((x, d) => x + P[k].days[d].p, 0), dc: (P[k].dc && P[k].dc.day === dcDay()) ? P[k].dc : null }));
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
  if (GQ.M[m]) return GQ.st && GQ.st.q && GQ.st.q.typed ? 2 : 1;   // MOD 07 – 12: písaná odpoveď za dva body
  const hard = m === 'aircraft' ? F.acAns === 'type' : m === 'airport' ? F.apAns === 'type' : m === 'callsign' ? F.csAns === 'type' :
    m === 'waypoint' ? F.wpDiff === 'hard' : m === 'heading' ? F.hgDiff === 'hard' : m === 'coord' ? F.coAns === 'type' :
    (m === 'daily' || m === 'exam') ? F.dAns === 'type' : false;
  return hard ? 2 : 1;
}
/* počítadlá správne / zle vedie každý modul po svojom — tu sa len sleduje ich prírastok */
function rkSample(now) {
  const c = state.correct || 0, w = state.wrong || 0;
  if (c >= RK.lastC && w >= RK.lastW && (c > RK.lastC || w > RK.lastW) && state.mode !== 'conquer' && state.mode !== 'rank' && state.mode !== 'profile' && state.mode !== 'about' && state.mode !== 'home') {
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
  const m = state.mode, playing = m === 'conquer' ? !!(DQ.room && DQ.S && DQ.S.phase !== 'lobby' && DQ.S.phase !== 'end') : (m !== 'home' && m !== 'rank' && m !== 'profile' && m !== 'about');
  if (RK.acct && playing && !hidden && now - RK.lastAns < 45000 && rkOwnsClock(now)) rkAdd(m, { s: 1 });
  if (RK.n % 10 === 0) rkPendSave();
  if (RK.n % 30 === 0) rkFlush();
}
setInterval(() => rkTick(Date.now(), document.hidden), 1000);
document.addEventListener('visibilitychange', () => { if (document.hidden) { rkPendSave(); rkFlush(); } });

/* ---------- účet ---------- */
/* sila hesla: 0 = krátke, 1 = slabé, 2 = dobré, 3 = silné. Nový účet potrebuje aspoň 2: osem znakov, písmeno aj číslicu. */
function rkPassScore(p) {
  p = p || '';
  if (p.length < 8 || !/[A-Za-zÀ-ž]/.test(p) || !/\d/.test(p)) return p.length < 6 ? 0 : 1;
  return p.length >= 12 || (/[^0-9A-Za-zÀ-ž]/.test(p) && /[a-zà-ž]/.test(p) && /[A-ZÀ-Ž]/.test(p)) ? 3 : 2;
}
async function rkAuth(kind, nick, pass) {
  nick = (nick || '').trim().replace(/\s+/g, ' ');
  if (!/^[0-9A-Za-zÀ-ž _.\-]{3,16}$/.test(nick)) { RK.err = RK_ERR.BAD_NICK; return false; }
  if ((pass || '').length < 6) { RK.err = RK_ERR.BAD_PASS; return false; }
  if (kind === 'new' && rkPassScore(pass) < 2) { RK.err = RK_ERR.WEAK_PASS; return false; }
  try {
    const r = await rkRpc(kind === 'new' ? 'atco_register' : 'atco_login', { p_nick: nick, p_pass: pass });
    RK.acct = { nick: r.nick, token: r.token }; lsSet(RK_ACCT, RK.acct); RK.err = '';
    RK.pend = lsGet(rkPendKey(), {});
    RK.me = undefined; SOC.known = null; pfLoadMe().then(() => socTick(true)); PS.ok = null; psPull();
    return true;
  } catch (e) { RK.err = rkErrText(e); return false; }
}
function rkLogout() { psPush(true); rkPendSave(); rkFlush(); RK.acct = null; lsSet(RK_ACCT, null); RK.pend = {}; RK.me = null; RK.pfTab = 'over'; SOC.friends = []; SOC.inbox = []; SOC.unread = 0; SOC.known = null; rkHeadBtn(); }
async function rkLoad() {
  RK.loading = true;
  await rkFlush();
  try { RK.rows = await rkRpc('atco_ranking', {}); RK.loadErr = ''; rkLevelCheck(); } catch (e) { RK.loadErr = rkErrText(e); }
  RK.loading = false;
  if (state.mode === 'rank') renderRank(document.getElementById('qcard'));
  if (state.mode === 'profile') renderProfile(document.getElementById('qcard'));
  if (state.mode === 'home') homeHelloFill();
  rkHeadBtn(); achCheck(); wkLoad();
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
  const nw = RK.authTab === 'new';
  return `<div class="au">
      <div class="au-side"><small>ÚČET ZADARMO</small><h3>Hraj o body, nie len pre seba.</h3>
        <ul><li><i>🏆</i><span><b>Rebríček a ligy</b>každá správna odpoveď sa počíta</span></li><li><i>📈</i><span><b>58 úrovní</b>od Uchádzača po Kráľa neba</span></li><li><i>⚔</i><span><b>Priatelia a Dobyvateľ</b>pozvánky, chat, boosty</span></li><li><i>☁</i><span><b>Pokrok všade</b>telefón aj počítač</span></li></ul></div>
      <div class="au-form" data-tab="${nw ? 'new' : 'in'}">
        <div class="au-tabs"><button data-au="in" class="${nw ? '' : 'on'}">PRIHLÁSIŤ SA</button><button data-au="new" class="${nw ? 'on' : ''}">NOVÝ ÚČET</button></div>
        <label>PREZÝVKA<input type="text" id="rk-nick" placeholder="tvoja prezývka" maxlength="16" autocomplete="username" spellcheck="false" value="${dqEsc(RK.authNick || '')}"></label>
        <label>HESLO<span class="au-pw"><input type="password" id="rk-pass" placeholder="heslo" autocomplete="${nw ? 'new-password' : 'current-password'}"><button type="button" id="rk-eye" title="Ukázať heslo">👁</button></span></label>
        <div class="rk-pw au-meter" id="rk-pw"><i></i><span>Aspoň 8 znakov, písmeno aj číslica. Prezývka 3 – 16 znakov, musí byť jedinečná. E-mail netreba.</span></div>
        ${RK.err ? `<div class="rk-err">${dqEsc(RK.err)}</div>` : ''}
        <button class="btn au-go" id="rk-go"><span class="t-in">PRIHLÁSIŤ SA ▶</span><span class="t-new">VYTVORIŤ ÚČET ▶</span></button>
        <p class="au-sw"><span class="t-in">Ešte nemáš účet? <a href="#" data-au="new">Vytvor si ho</a> — trvá to desať sekúnd.</span><span class="t-new">Už účet máš? <a href="#" data-au="in">Prihlás sa</a>.</span></p>
      </div>
    </div>`;
}
function rkBindAccount(after) {
  const go = async kind => {
    const n = document.getElementById('rk-nick').value, p = document.getElementById('rk-pass').value, bg0 = document.getElementById('rk-go');
    RK.authNick = n.trim();   // po chybe ostane prezývka vyplnená
    if (bg0) { if (bg0.disabled) return; bg0.disabled = true; bg0.classList.add('busy'); }
    const ok = await rkAuth(kind, n, p);
    if (ok) RK.authNick = '';
    const card0 = document.getElementById('qcard'); if (card0) card0._outKey = null;
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
  /* nový formulár: záložky PRIHLÁSIŤ SA / NOVÝ ÚČET; sila hesla sa ukazuje len pri novom účte */
  const fm = document.querySelector('.au-form'), bg = document.getElementById('rk-go'), eye = document.getElementById('rk-eye');
  const kindNow = () => fm && fm.dataset.tab === 'new' ? 'new' : 'in';
  if (fm) fm.parentNode.querySelectorAll('[data-au]').forEach(x => { x.onclick = e => { e.preventDefault(); RK.authTab = x.dataset.au; fm.dataset.tab = RK.authTab; fm.querySelectorAll('.au-tabs button').forEach(t => t.classList.toggle('on', t.dataset.au === RK.authTab)); const er = fm.querySelector('.rk-err'); if (er) er.remove(); document.getElementById('rk-nick').focus(); }; });
  if (bg) bg.onclick = () => go(kindNow());
  if (eye) eye.onclick = () => { const p = document.getElementById('rk-pass'); p.type = p.type === 'password' ? 'text' : 'password'; eye.classList.toggle('on', p.type === 'text'); };
  const nk = document.getElementById('rk-nick'); if (nk && fm) nk.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('rk-pass').focus(); });
  if (bo) bo.onclick = () => { rkLogout(); after(); };
  const pw = document.getElementById('rk-pass');
  if (pw) pw.addEventListener('keydown', e => { if (e.key === 'Enter') go(fm ? kindNow() : 'in'); });
  if (pw) pw.addEventListener('input', () => { const m = document.getElementById('rk-pw'), sc = rkPassScore(pw.value); if (m) { m.dataset.s = pw.value ? sc : ''; m.querySelector('span').textContent = !pw.value ? 'Aspoň 8 znakov, písmeno aj číslica. Prezývka 3 – 16 znakov, musí byť jedinečná. E-mail netreba.' : ['Heslo je krátke.', 'Slabé heslo — treba 8 znakov, písmeno aj číslicu.', 'Dobré heslo.', 'Silné heslo.'][sc]; } });
}
/* ============================================================
   PROFIL, NASTAVENIA, PRIATELIA A SPRÁVY (v4.8)
   Všetko ide cez funkcie atco_* z doplnku supabase-doplnok-v48.sql.
   Kým doplnok v databáze nie je, účet a body fungujú ďalej a tieto
   časti ukážu, že čakajú na databázu.
   ============================================================ */
/* ============================================================
   v4.10 — POKROK V ÚČTE, OPRAVY OTÁZOK Z DATABÁZY, INŠTRUKTOR
   ============================================================ */
/* --- pokrok v účte: opakovanie a chyby sa ukladajú aj na server a pri prihlásení na inom zariadení sa spoja --- */
const PS = { dirty: 0, at: null, busy: false, ok: null };
const PS_ATK = 'atcoTrainerV2.progAt';
function psPack() { let ap = null; try { ap = JSON.parse(localStorage.getItem(AP_STORE) || 'null'); } catch (e) {} return { v: 1, ap: ap || {}, wk: lsGet(WK_KEY, {}) }; }
/* spojenie dvoch stavov: pri každej otázke vyhráva ten záznam, ktorý má neskorší termín opakovania (bol precvičený neskôr) */
function psMerge(srv) {
  if (!srv || !srv.ap) return false;
  const A = srv.ap, sr = A.sr || {}, mi = A.mistakes || {}, ok = A.ok || {}; let ch = false;
  Object.keys(sr).forEach(id => { const L = state.sr[id], R = sr[id]; if (!L || (R.due || 0) > (L.due || 0)) { state.sr[id] = R; if (mi[id] > 0) state.mistakes[id] = mi[id]; else delete state.mistakes[id]; ch = true; } });
  Object.keys(mi).forEach(id => { if (!sr[id] && !state.sr[id] && (state.mistakes[id] || 0) < mi[id]) { state.mistakes[id] = mi[id]; ch = true; } });
  Object.keys(ok).forEach(id => { if ((state.apOk[id] || 0) < ok[id]) { state.apOk[id] = ok[id]; ch = true; } });
  Object.keys(A.last || {}).forEach(m => { if ((state.last[m] || 0) < A.last[m]) { state.last[m] = A.last[m]; ch = true; } });
  if ((A.dailyDone || 0) > (state.dailyDone || 0)) { state.dailyDone = A.dailyDone; ch = true; }
  const W = lsGet(WK_KEY, {}), SW = srv.wk || {}; let wch = false;
  Object.keys(SW).forEach(id => { if (!W[id] || (SW[id].t || 0) > (W[id].t || 0)) { W[id] = SW[id]; wch = true; } });
  if (wch) lsSet(WK_KEY, W);
  return ch || wch;
}
async function psPull() {
  if (!RK.acct || PS.busy) return;
  PS.busy = true;
  try {
    const r = await rkRpc('atco_progress_get', { p_token: RK.acct.token }); PS.ok = true;
    const k = PS_ATK + ':' + RK.acct.nick.toLowerCase(), seen = lsGet(k, '');
    if (r && r.data && r.at !== seen) {
      const ch = psMerge(r.data); lsSet(k, r.at);
      if (ch) { try { localStorage.setItem(AP_STORE, JSON.stringify({ mistakes: Object.keys(state.mistakes).filter(apIsMine).reduce((m, x) => { m[x] = state.mistakes[x]; return m; }, {}), ok: state.apOk, sr: state.sr, last: state.last, dailyDone: state.dailyDone })); } catch (e) {} renderWeak(); if (state.mode === 'home' || state.mode === 'profile') renderQuestion(); }
      PS.dirty = Date.now();           // po spojení sa výsledok pošle späť, aby mali obe zariadenia to isté
    } else if (!r || !r.data) PS.dirty = Date.now();
  } catch (e) { PS.ok = false; }
  PS.busy = false;
}
async function psPush(force) {
  if (!RK.acct || PS.busy || !PS.dirty || PS.ok === false || (!force && Date.now() - PS.dirty < 8000)) return;
  PS.busy = true; const d0 = PS.dirty;
  try { const r = await rkRpc('atco_progress_set', { p_token: RK.acct.token, p_data: psPack() }); if (r && r.at) lsSet(PS_ATK + ':' + RK.acct.nick.toLowerCase(), r.at); if (PS.dirty === d0) PS.dirty = 0; PS.at = Date.now(); } catch (e) {}
  PS.busy = false;
}
setInterval(() => psPush(), 40000);
document.addEventListener('visibilitychange', () => { if (document.hidden) psPush(true); else if (RK.acct && Date.now() - (PS.pullT || 0) > 60000) { PS.pullT = Date.now(); psPull(); } });

/* --- opravy otázok z databázy (tabuľka atco_qfix): skryť, nahradiť alebo pridať otázku bez novej verzie stránky.
       Použije sa zoznam uložený pri poslednej návšteve; nový zoznam sa stiahne na pozadí a platí od ďalšieho načítania stránky. --- */
const QF_KEY = 'atcoTrainerV2.qfix';
function qfixApply(L) {
  const norm = t => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim(); let n = 0;
  (Array.isArray(L) ? L : []).forEach(f => {
    const B = DQ_BANK[f.s]; if (!B || !f.q) return;
    const i = B.findIndex(x => norm(x.q) === norm(f.q)), w = (f.w || []).map(x => String(x || '').trim()).filter(Boolean), full = f.a && String(f.a).trim() && w.length === 3;
    if (f.h) { if (i >= 0) { B.splice(i, 1); n++; } return; }
    if (!full) return;
    const q = { q: String(f.n || f.q).trim(), a: String(f.a).trim(), w };
    if (i >= 0) B[i] = q; else B.push(q);
    n++;
  });
  return n;
}
function qfixLoad() { rkRpc('atco_qfix_list', {}).then(L => { if (Array.isArray(L)) lsSet(QF_KEY, L); }).catch(() => {}); }

/* --- stránka inštruktora: len pre účty, ktorým je v databáze nastavená rola „instructor“ --- */
async function insLoad() { RK.insBusy = true; try { RK.ins = await rkRpc('atco_instructor', { p_token: RK.acct.token }); RK.insErr = ''; } catch (e) { RK.ins = null; RK.insErr = e && e.message === 'FORBIDDEN' ? 'Táto stránka je len pre inštruktora.' : socErr(e); } RK.insBusy = false; if (state.mode === 'profile' && RK.pfTab === 'ins') renderProfile(document.getElementById('qcard')); }
function insHTML() {
  if (RK.insErr) return `<div class="rk-err">${dqEsc(RK.insErr)}</div>`;
  if (!RK.ins) return '<div class="rk-empty">Načítavam prehľad…</div>';
  const pct = (c, w) => (c + w) ? Math.round(c / (c + w) * 100) : null, key = d => String(d).slice(0, 10);
  const D = []; for (let i = 13; i >= 0; i--) { const t = new Date(Date.now() - i * 86400000); D.push(t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0')); }
  const today = D[13], MO = RK_MODS.filter(x => x[0] !== 'conquer' && x[0] !== 'daily' && x[0] !== 'exam');
  const rows = RK.ins.map(p => {
    const M = p.mods || {}, T = { p: 0, c: 0, w: 0, s: 0 }; RK_MODS.forEach(x => { const a = M[x[0]] || {}; T.p += a.p || 0; T.c += a.c || 0; T.w += a.w || 0; T.s += a.s || 0; });
    const by = {}; (p.days || []).forEach(d => { by[key(d.d)] = d.p || 0; });
    const w1 = D.slice(7).reduce((a, k) => a + (by[k] || 0), 0), dcs = (p.dc || []), dct = dcs.find(c => key(c.d) === today);
    const acc = MO.map(x => { const a = M[x[0]] || {}; return [x[1].split(' · ')[0], pct(a.c || 0, a.w || 0), (a.c || 0) + (a.w || 0)]; }), weak = acc.filter(a => a[1] !== null && a[2] >= 20).sort((a, b) => a[1] - b[1])[0];
    return { p, T, by, w1, dct, dcN: dcs.length, acc, weak };
  }).sort((a, b) => b.w1 - a.w1 || b.T.p - a.T.p);
  const mx = Math.max(1, ...rows.map(r => Math.max(...D.map(k => r.by[k] || 0))));
  const active = rows.filter(r => r.w1 > 0).length;
  return `<div class="pf-kpis"><div><small>HRÁČI</small><b>${rows.length}</b><span>účtov spolu</span></div><div><small>AKTÍVNI</small><b>${active}</b><span>za posledných 7 dní</span></div>
      <div><small>DENNÁ VÝZVA DNES</small><b>${rows.filter(r => r.dct).length}</b><span>dokončilo</span></div><div><small>BODY ZA 7 DNÍ</small><b>${rows.reduce((a, r) => a + r.w1, 0)}</b><span>spolu všetci</span></div></div>
    <div class="rk-tbl ins"><table><thead><tr><th>HRÁČ</th><th>ÚR.</th><th>BODY</th><th>7 DNÍ</th><th>AKTIVITA · 14 DNÍ</th><th>ÚSPEŠ.</th>${MO.map(x => `<th>${x[1].split(' · ')[0].replace('MOD ', 'M')}</th>`).join('')}<th>VÝZVA DNES</th><th>NAJSLABŠIE</th><th>NAPOSLEDY</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td class="rk-nick"><i class="lg-dot" style="background:${LGC[r.p.lg || 1]}"></i>${dqEsc(r.p.nick)}</td><td>${rkLevel(r.T.p).n}</td><td class="rk-pts">${r.T.p}</td><td><b>${r.w1}</b></td>
        <td><span class="ins-sp">${D.map(k => `<i style="height:${Math.max(8, Math.round((r.by[k] || 0) / mx * 100))}%" class="${r.by[k] ? 'on' : ''}" title="${k}: ${r.by[k] || 0}"></i>`).join('')}</span></td>
        <td>${pct(r.T.c, r.T.w) === null ? '—' : pct(r.T.c, r.T.w) + ' %'}</td>${r.acc.map(a => `<td class="${a[1] === null ? '' : a[1] < 60 ? 'bad' : a[1] >= 85 ? 'good' : ''}">${a[1] === null ? '—' : a[1]}</td>`).join('')}
        <td>${r.dct ? r.dct.g + ' / ' + r.dct.t : '—'}<small>${r.dcN} z 14 dní</small></td><td>${r.weak ? r.weak[0] + ' · ' + r.weak[1] + ' %' : '—'}</td><td>${pfAgo(r.p.seen)}</td></tr>`).join('')}
    </tbody></table></div>
    <div class="rk-note">Zoradené podľa bodov za posledných 7 dní. Stĺpce M01 – M06 sú úspešnosť v percentách (červená pod 60, zelená od 85). „Najslabšie“ je modul s najnižšou úspešnosťou pri aspoň 20 odpovediach. Konkrétne chybné otázky hráčov server neukladá.</div>`;
}
const BG_KEY = 'atcoTrainerV2.bg';
const BG_THEMES = [['', 'ZELENÁ', '#0f8f55'], ['blue', 'MODRÁ', '#2b6fd6'], ['violet', 'FIALOVÁ', '#7a4fd0'], ['amber', 'ORANŽOVÁ', '#c9781a'], ['mono', 'SIVÁ', '#6b7280']];
function bgApply(id) { if (id == null) id = lsGet(BG_KEY, ''); document.documentElement.dataset.bg = id || ''; }
bgApply();
const SOC = { friends: [], inbox: [], unread: 0, ok: null, err: '', known: null, busy: false };
function socNeedsSql(e) { return /PGRST202|schema cache|Could not find the function|does not exist/i.test((e && e.message) || ''); }
function socErr(e) { return socNeedsSql(e) ? 'Táto časť čaká na doplnok databázy (supabase-doplnok-v48.sql).' : (RK_ERR[e && e.message] || 'Nepodarilo sa spojiť so serverom. Skús to o chvíľu.'); }
/* čo práve robím — vidia to len potvrdení priatelia */
function socActivity() {
  const m = state.mode, N = { home: 'Na úvode', daily: 'Denný tréning', exam: 'Skúška', rank: 'Rebríček', profile: 'Profil', aircraft: 'MOD 01 · Lietadlá', airport: 'MOD 02 · Letiská', callsign: 'MOD 03 · Volačky', waypoint: 'MOD 04 · Body FRA', heading: 'MOD 05 · Kurzy', coord: 'MOD 06 · Koordinácia' };
  if (m === 'conquer') return DQ.room && !DQ.demo && DQ.S ? (DQ.S.phase === 'lobby' ? 'Dobyvateľ · miestnosť ' + DQ.room : DQ.S.phase === 'end' ? 'Dobyvateľ · dohrané' : 'Dobyvateľ · hrá') : 'Dobyvateľ';
  return N[m] || '';
}
async function socTick(force) {
  if (!RK.acct || SOC.busy || (document.hidden && !force)) return;
  SOC.busy = true;
  try {
    const r = await rkRpc('atco_social', { p_token: RK.acct.token, p_activity: socActivity() });
    SOC.ok = true; SOC.err = ''; SOC.friends = (r && r.friends) || []; SOC.inbox = (r && r.inbox) || []; SOC.unread = (r && r.unread) || 0; SOC.sent = r && Array.isArray(r.sent) ? r.sent : null;
    /* nové neprečítané správy od posledného načítania → oznam vpravo hore (pri prvom načítaní len čerstvé pozvánky) */
    const first = !SOC.known; if (first) SOC.known = {};
    SOC.inbox.forEach(m => {
      if (SOC.known[m.id]) return; SOC.known[m.id] = 1;
      const fresh = Date.now() - new Date(m.created).getTime() < (m.kind === 'invite' ? 180000 : 60000);
      if (!m.read && fresh && (!first || m.kind === 'invite')) socToast(m);
    });
  } catch (e) { SOC.ok = false; SOC.err = socErr(e); if (e && e.message === 'BAD_TOKEN') { RK.acct = null; lsSet(RK_ACCT, null); } }
  SOC.busy = false;
  rkHeadBtn();
  /* otvorený profil sa prekreslí, len keď hráč práve nepíše */
  const ae = document.activeElement, typing = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT');
  if (state.mode === 'profile' && RK.pfTab === 'inbox' && RK.pfChat && document.getElementById('pf-chat-log')) chatRefresh();   // otvorený chat sa len doplní, aby písanie neprerušil
  else if (state.mode === 'profile' && !typing && (RK.pfTab === 'friends' || RK.pfTab === 'inbox')) renderProfile(document.getElementById('qcard'));
  if (state.mode === 'conquer' && DQ.S && DQ.S.phase === 'lobby' && !typing) dqShow();
}
setInterval(() => socTick(), 25000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) socTick(); });
async function socCall(fn, args, okMsg) {
  try { await rkRpc(fn, Object.assign({ p_token: RK.acct.token }, args)); RK.pfMsg = okMsg || ''; RK.pfErr = ''; }
  catch (e) { RK.pfErr = socErr(e); RK.pfMsg = ''; }
  await socTick(true);
  if (state.mode === 'profile') renderProfile(document.getElementById('qcard'));
}
function socJoin(code) {
  code = String(code || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
  if (code.length !== 4) return;
  const go = () => { if (DQ.room) dqLeave(''); startMode('conquer'); dqJoin(code); };
  if (DQ.room && DQ.S && DQ.S.phase !== 'lobby' && DQ.S.phase !== 'end') rkConfirm('Opustiť rozohranú hru?', 'Si v hre. Ak sa pripojíš do miestnosti ' + code + ', z tejto odídeš.', 'ÁNO, PRIPOJIŤ', go); else go();
}
/* oznam vpravo hore: pozvánka, žiadosť o priateľstvo alebo správa */
function socToast(m) {
  let box = document.getElementById('soc-toasts');
  if (!box) { box = document.createElement('div'); box.id = 'soc-toasts'; document.body.appendChild(box); }
  const el = document.createElement('div'); el.className = 'soc-toast k-' + m.kind;
  const from = dqEsc(m.from);
  el.innerHTML = m.kind === 'invite' ? `<small>POZVÁNKA DO HRY</small><b>${from} ťa pozýva do Dobyvateľa</b><span>miestnosť <strong>${dqEsc(m.body)}</strong></span><div><button class="btn" data-st="join">PRIPOJIŤ SA ▶</button><button class="btn ghost" data-st="x">NESKÔR</button></div>`
    : m.kind === 'friend' ? `<small>ŽIADOSŤ O PRIATEĽSTVO</small><b>${from} si ťa chce pridať</b><div><button class="btn" data-st="yes">PRIJAŤ</button><button class="btn ghost" data-st="x">NESKÔR</button></div>`
    : `<small>SPRÁVA</small><b>${from}</b><span>${dqEsc(String(m.body).slice(0, 110))}</span><div><button class="btn" data-st="open">OTVORIŤ</button><button class="btn ghost" data-st="x">ZAVRIEŤ</button></div>`;
  el.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-st]'); if (!b) return;
    el.remove();
    if (b.dataset.st === 'join') { rkRpc('atco_msg_read', { p_token: RK.acct.token, p_id: m.id }).catch(() => {}); socJoin(m.body); }
    else if (b.dataset.st === 'yes') socCall('atco_friend_answer', { p_nick: m.from, p_ok: true }, m.from + ' je teraz tvoj priateľ.');
    else if (b.dataset.st === 'open') { RK.pfTab = 'inbox'; RK.pfChat = m.from; startMode('profile'); }
  });
  box.appendChild(el);
  setTimeout(() => el.remove(), m.kind === 'invite' ? 30000 : 14000);
}
const PF_EMO = ['✈️', '🛩️', '🚁', '🚀', '🛸', '🪂', '🎧', '📡', '🗼', '🛰️', '🧭', '🗺️', '☁️', '⛈️', '🌪️', '🌙', '⭐', '🔥', '🦅', '🦉', '🐺', '🦊', '🐻', '🐧', '😎', '🤓', '🫡', '🎯', '🏆', '⚡', '🍀', '👑'];
function pfAvatar(av, nick, cls, emo) { return av ? `<span class="pf-av ${cls || ''}"><img src="${dqEsc(av)}" alt=""></span>` : emo ? `<span class="pf-av ${cls || ''}"><u>${dqEsc(emo)}</u></span>` : `<span class="pf-av ${cls || ''}"><b>${dqEsc(String(nick || '?').trim().charAt(0).toUpperCase())}</b></span>`; }
/* ---------- SPRÁVY ako chat (v4.12): zoznam rozhovorov, po kliknutí celý rozhovor s bublinami ---------- */
const CHAT_SENTK = 'atcoTrainerV2.chatSent', CHAT_HIDEK = 'atcoTrainerV2.chatHide';
function chatKey() { return RK.acct ? RK.acct.nick.toLowerCase() : ''; }
/* odoslané správy: zo servera (doplnok v52); kým ho databáza nemá, aspoň z tohto zariadenia */
function chatSent() { return SOC.sent || (lsGet(CHAT_SENTK, {})[chatKey()] || []); }
function chatSentAdd(to, kind, body) { const A = lsGet(CHAT_SENTK, {}), k = chatKey(); A[k] = (A[k] || []).concat([{ id: 'L' + Date.now(), to, kind, body, created: new Date().toISOString(), read: false }]).slice(-200); lsSet(CHAT_SENTK, A); }
function chatThreads() {
  const T = {}, hide = (lsGet(CHAT_HIDEK, {})[chatKey()] || {});
  const add = (nick, o) => { if (new Date(o.t).getTime() <= (hide[nick] || 0)) return; (T[nick] = T[nick] || []).push(o); };
  SOC.inbox.forEach(m => { if (m.kind !== 'friend') add(m.from, { id: m.id, mine: false, kind: m.kind, body: m.body, t: m.created, read: m.read }); });
  chatSent().forEach(m => add(m.to, { id: m.id, mine: true, kind: m.kind, body: m.body, t: m.created, read: m.read }));
  Object.keys(T).forEach(n => T[n].sort((a, b) => new Date(a.t) - new Date(b.t)));
  return T;
}
function chatTime(t) { const d = new Date(t), p = n => String(n).padStart(2, '0'), today = new Date().toDateString() === d.toDateString(); return (today ? '' : d.getDate() + '. ' + (d.getMonth() + 1) + '. ') + p(d.getHours()) + ':' + p(d.getMinutes()); }
function chatLogHTML(nick) {
  const L = chatThreads()[nick] || [];
  if (!L.length) return '<div class="ch-empty">Zatiaľ žiadne správy. Napíš prvú.</div>';
  let day = '';
  return L.map(m => { const d = new Date(m.t).toDateString(), sep = d !== day ? `<div class="ch-day">${d === new Date().toDateString() ? 'DNES' : new Date(m.t).getDate() + '. ' + (new Date(m.t).getMonth() + 1) + '. ' + new Date(m.t).getFullYear()}</div>` : ''; day = d;
    const inner = m.kind === 'invite' ? `<small>POZVÁNKA DO DOBYVATEĽA</small><b>miestnosť ${dqEsc(m.body)}</b>${m.mine ? '' : `<button class="btn" data-join="${dqEsc(m.body)}">PRIPOJIŤ SA ▶</button>`}` : dqEsc(m.body);
    return `${sep}<div class="ch-b${m.mine ? ' me' : ''}${m.kind === 'invite' ? ' inv' : ''}"><div>${inner}</div><i>${chatTime(m.t)}${m.mine && m.read ? ' · prečítané' : ''}</i></div>`; }).join('');
}
function chatMarkRead(nick) {
  const U = SOC.inbox.filter(m => m.from === nick && m.kind !== 'friend' && !m.read); if (!U.length) return;
  U.forEach(m => { m.read = true; rkRpc('atco_msg_read', { p_token: RK.acct.token, p_id: m.id }).catch(() => {}); });
  SOC.unread = Math.max(0, SOC.unread - U.length); rkHeadBtn();
  const bd = document.querySelector('[data-tab="inbox"] i'); if (bd) { if (SOC.unread) bd.textContent = SOC.unread; else bd.remove(); }
}
function chatRefresh() {
  const e = document.getElementById('pf-chat-log'); if (!e || !RK.pfChat) return;
  const h = chatLogHTML(RK.pfChat);
  if (e.dataset.sig !== String(h.length) + h.slice(-80)) { const bottom = e.scrollHeight - e.scrollTop - e.clientHeight < 60; e.innerHTML = h; e.dataset.sig = String(h.length) + h.slice(-80); if (bottom) e.scrollTop = e.scrollHeight; chatBind(e); }
  chatMarkRead(RK.pfChat);
}
function chatBind(root) { root.querySelectorAll('[data-join]').forEach(b => { b.onclick = () => socJoin(b.dataset.join); }); }
async function chatSend() {
  const i = document.getElementById('pf-chat-txt'), to = RK.pfChat, t = i ? i.value.trim() : ''; if (!t || !to) return;
  i.value = ''; i.focus();
  try { await rkRpc('atco_msg_send', { p_token: RK.acct.token, p_nick: to, p_kind: 'msg', p_body: t }); chatSentAdd(to, 'msg', t); RK.pfErr = ''; }
  catch (e) { RK.pfErr = socErr(e); i.value = t; const er = document.getElementById('pf-chat-err'); if (er) { er.textContent = RK.pfErr; er.style.display = ''; } return; }
  const er = document.getElementById('pf-chat-err'); if (er) er.style.display = 'none';
  await socTick(true); chatRefresh(); const e = document.getElementById('pf-chat-log'); if (e) e.scrollTop = e.scrollHeight;
}
/* kým je rozhovor otvorený, pýta sa na nové správy častejšie */
setInterval(() => { if (state.mode === 'profile' && RK.pfTab === 'inbox' && RK.pfChat && RK.acct && !document.hidden) socTick(true); }, 7000);
function pfAgo(t) { const s = Math.max(0, (Date.now() - new Date(t).getTime()) / 1000); return s < 90 ? 'práve teraz' : s < 3600 ? 'pred ' + Math.round(s / 60) + ' min' : s < 86400 ? 'pred ' + Math.round(s / 3600) + ' h' : 'pred ' + Math.round(s / 86400) + ' d'; }
async function pfLoadMe() {
  if (!RK.acct) { RK.me = null; return; }
  try { RK.me = await rkRpc('atco_me', { p_token: RK.acct.token }); RK.meErr = ''; if (RK.me) AV.m[RK.acct.nick] = { a: RK.me.avatar || '', e: RK.me.emoji || '' }; if (RK.me && RK.me.bg != null && RK.me.bg !== lsGet(BG_KEY, '')) { lsSet(BG_KEY, RK.me.bg); bgApply(RK.me.bg); } }
  catch (e) { RK.me = null; RK.meErr = socErr(e); }
  rkHeadBtn();
}
/* tlačidlá vpravo hore: schránka s počtom neprečítaných a účet (neprihlásený → PRIHLÁSIŤ) */
function rkHeadBtn() {
  const b = document.getElementById('acct-btn'); if (!b) return;
  const av = RK.acct && RK.me && RK.me.avatar;
  const meR = RK.acct ? (RK.rows || []).find(r => r.nick === RK.acct.nick) : null, lvN = RK.acct ? (meR ? rkLevel(rkTotal(meR)).n : dqMyLv()) : 0;
  b.innerHTML = RK.acct ? (av ? `<img src="${dqEsc(av)}" alt="">` : `<u>${RK.me && RK.me.emoji ? dqEsc(RK.me.emoji) : dqEsc(RK.acct.nick.charAt(0).toUpperCase())}</u>`) + `<span>${dqEsc(RK.acct.nick)}</span><em>LVL ${lvN}</em>` : 'PRIHLÁSIŤ';
  b.title = RK.acct ? 'Môj profil' : 'Prihlásiť sa alebo vytvoriť účet'; b.style.setProperty('--lg', LGC[(meR && meR.lg) || 1]);
  b.classList.toggle('in', !!RK.acct); b.classList.toggle('on', state.mode === 'profile');
  const ab = document.getElementById('about-btn'); if (ab) ab.classList.toggle('on', state.mode === 'about');
  /* úvod musí vždy ukazovať to isté čo hlavička: prihlásený vidí seba, neprihlásený ponuku registrácie */
  if (state.mode === 'home') { const hh = document.getElementById('home-hello'); if (hh && hh.classList.contains('out') === !!RK.acct) homeHelloFill(); }
  const ib = document.getElementById('inbox-btn');
  if (ib) { ib.style.display = RK.acct ? '' : 'none'; ib.innerHTML = '✉' + (SOC.unread ? `<i>${SOC.unread > 9 ? '9+' : SOC.unread}</i>` : ''); ib.classList.toggle('has', SOC.unread > 0); }
}
/* PROFIL — záložky: prehľad, štatistiky, priatelia, správy, nastavenia */
function renderProfile(card) {
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = 'profil';
  rkHeadBtn();
  const again = () => { RK.me = undefined; SOC.known = null; renderProfile(card); rkLoad(); pfLoadMe().then(() => socTick(true)).then(() => { if (state.mode === 'profile') renderProfile(card); }); };
  if (!RK.acct) {
    /* prihlasovací formulár sa neprekresľuje, kým sa nič nezmenilo — inak by načítanie rebríčka na pozadí zmazalo, čo človek práve píše (v5.4.2) */
    const outKey = 'out|' + (RK.err || '') + '|' + (RK.loadErr || '');
    if (card._outKey === outKey && card.querySelector('.au')) return;
    const fa = document.activeElement; if (fa && card.contains(fa) && (fa.id === 'rk-nick' || fa.id === 'rk-pass') && card.querySelector('.au')) return;   // kým píšeš, formulár sa neprekreslí
    card._outKey = outKey; card._pfHtml = null;
    card.innerHTML = `<div class="rk pf">
        ${SB_ON ? '' : '<div class="rk-warn"><strong>SKÚŠOBNÝ REŽIM</strong> — účty sú zatiaľ len v tomto prehliadači.</div>'}
        ${rkAccountHTML()}
        <h3 class="pf-h">VZHĽAD <em>— uložený v tomto zariadení</em></h3>${pfLookHTML()}
        <div class="pf-ver">ATCO Trainer v${APP_VERSION} · BETA</div>
      </div>`;
    rkBindAccount(again); pfBind(card);
    return;
  }
  if (RK.me === undefined) { RK.me = null; pfLoadMe().then(() => socTick(true)).then(() => { if (state.mode === 'profile') renderProfile(card); }); }
  const tab = RK.pfTab || 'over';
  if (Date.now() - (RK.daysT || 0) > 15000) { RK.daysT = Date.now(); rkRpc('atco_my_days', { p_token: RK.acct.token }).then(d => { RK.days = d || []; if (state.mode === 'profile' && (RK.pfTab || 'over') === 'over') renderProfile(card); }).catch(() => {}); }
  const rowsAll = (RK.rows || []).map(r => { const M = r.mods || {}, o = { nick: r.nick, p: 0 }; RK_MODS.forEach(x => { o.p += (M[x[0]] || {}).p || 0; }); return o; }).sort((a, b) => b.p - a.p || a.nick.localeCompare(b.nick));
  const pos = rowsAll.findIndex(o => o.nick === RK.acct.nick), mine = ((RK.rows || []).find(r => r.nick === RK.acct.nick) || {}).mods || {};
  const g = m => Object.assign({ p: 0, c: 0, w: 0, s: 0, g: 0, v: 0 }, mine[m] || {}), T = { p: 0, c: 0, w: 0, s: 0 };
  RK_MODS.forEach(x => { const a = g(x[0]); 'pcws'.split('').forEach(f => { T[f] += a[f]; }); });
  const pct = (c, w) => (c + w) ? Math.round(c / (c + w) * 100) + ' %' : '—', cq = g('conquer'), ex = g('exam');
  const pend = Object.keys(RK.pend || {}).reduce((a, m) => a + ((RK.pend[m] || {}).p || 0), 0);
  const frOk = SOC.friends.filter(f => f.st === 'ok'), frIn = SOC.friends.filter(f => f.st === 'in'), frOut = SOC.friends.filter(f => f.st === 'out'), onl = frOk.filter(f => f.online).length;
  const tabs = [['over', 'PREHĽAD'], ['stats', 'ŠTATISTIKY'], ['friends', 'PRIATELIA' + (frIn.length ? ` <i>${frIn.length}</i>` : onl ? ` <u>${onl}</u>` : '')], ['inbox', 'SPRÁVY' + (SOC.unread ? ` <i>${SOC.unread}</i>` : '')], ['set', 'NASTAVENIA']].concat(RK.me && RK.me.role === 'instructor' ? [['ins', 'INŠTRUKTOR']] : []);
  const ahead = pos > 0 ? rowsAll[pos - 1] : null;
  let body = '';
  if (tab === 'over') {
    const best = RK_MODS.map(x => [x[1], g(x[0])]).filter(x => x[1].c + x[1].w >= 10).sort((a, b) => b[1].c / (b[1].c + b[1].w) - a[1].c / (a[1].c + a[1].w))[0];
    const top = RK_MODS.map(x => [x[1], g(x[0]).p]).sort((a, b) => b[1] - a[1])[0];
    let due = 0, weak = Object.keys(state.mistakes || {}).filter(k => state.mistakes[k] > 0).length; ['aircraft', 'airport', 'callsign', 'waypoint', 'coord'].forEach(m => { due += modProgress(m).due; });
    const { ACH, got, streak, week, lgN, lgPos, meRow, terr, nfo } = achCompute();
    body = `<div class="pf-trio">
        <div class="t-fire${streak ? ' on' : ''}"><i>🔥</i><b>${streak}</b><span>${streak === 1 ? 'deň v rade' : streak >= 2 && streak <= 4 ? 'dni v rade' : 'dní v rade'}</span></div>
        <div><i>📈</i><b>${nfo(week)}</b><span>bodov za 7 dní</span></div>
        <div style="--c:${LGC[lgN]}" data-go2="rank"><i>🏆</i><b>${lgPos ? lgPos + '.' : '—'}</b><span>v lige ${LG[lgN]} · ${nfo(meRow ? meRow.mp || 0 : 0)} b. tento mesiac</span></div>
        <div data-go2="rank"><i>🗺</i><b>${terr.length}</b><span>${terr.length ? terr.map(x => x[1]).join(', ') : 'území na mape'}</span></div>
      </div>
      ${pend ? `<div class="rk-note">Na odoslanie čaká ešte ${pend} bodov z tohto zariadenia — pripíšu sa do pol minúty.</div>` : ''}
      ${(() => { if (!RK.days) return '';
        const by = {}; RK.days.forEach(d => { by[String(d.d).slice(0, 10)] = d; });
        const D = []; for (let i = 13; i >= 0; i--) { const t = new Date(Date.now() - i * 86400000), k = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); D.push({ k, p: (by[k] || {}).p || 0, wd: 'NPUSŠPS'.charAt(t.getDay()), dd: t.getDate() }); }
        const mx = Math.max(1, ...D.map(d => d.p)), w1 = D.slice(7).reduce((a, d) => a + d.p, 0), w0 = D.slice(0, 7).reduce((a, d) => a + d.p, 0), days1 = D.slice(7).filter(d => d.p > 0).length;
        const msg = !w1 && !w0 ? 'Zatiaľ žiadna aktivita — začni dnešným tréningom.' : !w0 ? 'Tento týždeň si začal — ' + w1 + ' bodov.' : w1 > w0 ? 'Tento týždeň sa ti darí viac: +' + Math.round((w1 - w0) / w0 * 100) + ' % oproti minulému.' : w1 === w0 ? 'Tento týždeň rovnako ako minulý.' : 'Tento týždeň menej než minulý: −' + Math.round((w0 - w1) / w0 * 100) + ' %.';
        return `<div class="pf-act"><div class="pf-act-t"><h3>AKTIVITA · 14 DNÍ</h3><span>${msg}</span></div>
          <div class="pf-bars">${D.map((d, i) => `<div class="${i >= 7 ? 'w1' : 'w0'}${i === 13 ? ' today' : ''}" title="${d.k}: ${d.p} bodov"><u>${d.p || ''}</u><i style="height:${Math.max(3, Math.round(d.p / mx * 100))}%"></i><small>${d.wd}<br>${d.dd}</small></div>`).join('')}</div>
          <div class="pf-act-f"><span>minulý týždeň <b>${w0}</b></span><span>tento týždeň <b>${w1}</b> · ${days1} z 7 dní</span></div></div>`; })()}
      ${wkTasksHTML()}
      <div class="pf-ach"><div class="pf-ach-h"><h3>ÚSPECHY</h3><span><b>${got}</b> / ${ACH.length}</span><i><em style="width:${Math.round(got / ACH.length * 100)}%"></em></i></div>
        <p class="pf-ach-n">Odznaky za míľniky. <b>Farebné</b> už máš, <b>sivé so zámkom</b> ešte nie — pri každom je napísané, čo treba spraviť a ako ďaleko si. Počítajú sa z tvojich bodov, odpovedí, času a hier uložených v účte; body, ktoré ešte čakajú na odoslanie, pribudnú do pol minúty.</p>
        <div class="pf-ach-g">${ACH.slice().sort((x, y) => (y[3] >= y[4]) - (x[3] >= x[4]) || y[3] / y[4] - x[3] / x[4]).map(x => { const ok = x[3] >= x[4]; return `<div class="${ok ? 'ok' : 'lock'}"><i>${x[0]}</i><b>${x[1]}</b><span>${x[2]}</span>${ok ? '<u>✓ ZÍSKANÉ</u>' : `<s><em style="width:${Math.min(100, Math.round(x[3] / x[4] * 100))}%"></em></s><small>🔒 ${x[5] != null && x[5] !== '' ? x[5] : nfo(Math.min(x[3], x[4])) + ' z ' + nfo(x[4])}</small>`}</div>`; }).join('')}</div></div>
      <div class="pf-cards">
        <div class="pf-card"><h3>DNES</h3><div class="pf-kv"><span>Na opakovanie</span><b>${due}</b><span>Moje chyby</span><b>${weak}</b></div><button class="btn" data-go2="daily">SPUSTIŤ TRÉNING ▶</button></div>
        <div class="pf-card"><h3>DOBYVATEĽ</h3><div class="pf-kv"><span>Hry</span><b>${cq.g}</b><span>Výhry</span><b>${cq.v}${cq.g ? ' · ' + Math.round(cq.v / cq.g * 100) + ' %' : ''}</b><span>Body</span><b>${cq.p}</b></div><button class="btn ghost" data-go2="conquer">HRAŤ ▶</button></div>
        <div class="pf-card"><h3>SKÚŠKY</h3><div class="pf-kv"><span>Body</span><b>${ex.p}</b><span>Úspešnosť</span><b>${pct(ex.c, ex.w)}</b></div><button class="btn ghost" data-go2="exam">NA SKÚŠKU ▶</button></div>
        <div class="pf-card"><h3>NAJ</h3><div class="pf-kv"><span>Najviac bodov</span><b>${top && top[1] ? top[0] : '—'}</b><span>Najlepšia úspešnosť</span><b>${best ? best[0] : '—'}</b><span>Priatelia online</span><b>${onl} / ${frOk.length}</b></div><button class="btn ghost" data-tab="friends">PRIATELIA ▶</button></div>
      </div>`;
  } else if (tab === 'stats') {
    const mxP = Math.max(1, ...RK_MODS.map(x => g(x[0]).p)), sub = RK_SUBJ.map(x => [x[1], g(x[0])]), anySub = sub.some(x => x[1].c + x[1].w > 0), mods = ['aircraft', 'airport', 'callsign', 'waypoint', 'coord'];
    const nfs = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '), acc = a => (a.c + a.w) ? Math.round(a.c / (a.c + a.w) * 100) : null;
    const played = RK_MODS.map(x => [x[1], g(x[0]), x[0]]).filter(x => x[1].c + x[1].w >= 10), bestM = played.slice().sort((x, y) => acc(y[1]) - acc(x[1]))[0], worstM = played.length > 1 ? played.slice().sort((x, y) => acc(x[1]) - acc(y[1]))[0] : null;
    const ring = (p, col) => `<i class="sx-ring" style="--p:${p == null ? 0 : p};--c:${col}"><b>${p == null ? '—' : p + '<small>%</small>'}</b></i>`;
    body = `${bestM ? `<div class="sx-top"><div class="good"><small>NAJSILNEJŠÍ MODUL</small><b>${bestM[0]}</b><span>${acc(bestM[1])} % správne</span></div>${worstM && worstM !== bestM ? `<div class="bad"><small>NAJVIAC TREBA TRÉNOVAŤ</small><b>${worstM[0]}</b><span>${acc(worstM[1])} % správne</span>${['aircraft', 'airport', 'callsign', 'waypoint', 'heading', 'coord'].indexOf(worstM[2]) >= 0 ? `<button class="btn" data-go2="${worstM[2]}">TRÉNOVAŤ ▶</button>` : ''}</div>` : ''}</div>` : ''}
      <h3 class="pf-h">MODULY A HRY</h3>
      <div class="sx-grid">${RK_MODS.map(x => { const a = g(x[0]), p = acc(a), none = !a.p && !a.c && !a.w; return `<div class="sx-card${none ? ' none' : ''}">${ring(p, p == null ? '#c9d3ce' : p >= 85 ? '#12c274' : p >= 65 ? '#ffbe0b' : '#e5584a')}<div><b>${x[1]}</b><strong>${nfs(a.p)} <small>b.</small></strong><span>${none ? 'zatiaľ nič' : x[0] === 'bonus' ? 'odmeny za úlohy' : `${nfs(a.c)} ✓ · ${nfs(a.w)} ✗ · ${rkTime(a.s)}`}</span><s><em style="width:${Math.round(a.p / mxP * 100)}%"></em></s></div></div>`; }).join('')}</div>
      <h3 class="pf-h">OKRUHY TEÓRIE <em>— z otázok v Dobyvateľovi</em></h3>
      ${anySub ? `<div class="sx-bars">${sub.map(x => { const n = x[1].c + x[1].w, p = n ? Math.round(x[1].c / n * 100) : 0; return `<div class="${n ? '' : 'none'}"><b>${x[0]}</b><s><em style="width:${p}%;background:${p >= 85 ? '#12c274' : p >= 65 ? '#ffbe0b' : '#e5584a'}"></em></s><span>${n ? p + ' % · ' + x[1].c + ' z ' + n : '—'}</span></div>`; }).join('')}</div>`
        : '<div class="rk-empty">Zatiaľ nič — okruhy sa počítajú z otázok v Dobyvateľovi, v hre aspoň dvoch ľudí.</div>'}
      <h3 class="pf-h">POKROK V UČENÍ <em>— ${PS.ok === false ? 'uložený len v tomto zariadení' : 'uložený v účte, na každom zariadení rovnaký'}</em></h3>
      <div class="sx-grid">${mods.map(m => { const p = modProgress(m), pc = p.total ? Math.round(p.done / p.total * 100) : 0; return `<div class="sx-card">${ring(pc, '#3a86ff')}<div><b>${MOD_NAME[m]}</b><strong>${p.done} <small>z ${p.total} naučených</small></strong><span>${p.due} na opakovanie · ${p.weak} chýb</span><p><button class="btn ghost" data-go2="${m}">OTVORIŤ ▶</button></p></div></div>`; }).join('')}</div>`;
  } else if (tab === 'friends') {
    const inRoom = DQ.room && DQ.host && !DQ.demo && DQ.S && DQ.S.phase === 'lobby';
    const lvOf = n => { const r = (RK.rows || []).find(x => x.nick === n); return r ? lvTag(rkLevel(rkTotal(r)).n, false, r.lg) : ''; }, ptsOf = n => { const r = (RK.rows || []).find(x => x.nick === n); return r ? rkTotal(r) : null; };
    const row = f => { const rm = /miestnosť ([A-Z]{4})/.exec(f.activity || ''), pts = ptsOf(f.nick);
      return `<div class="fx-card${f.online ? ' on' : ''}"><div class="fx-top">${avFace(f.nick, '', 'big')}${f.online ? '<u title="online"></u>' : ''}</div><b>${dqEsc(f.nick)}${lvOf(f.nick)}</b>
        <span>${f.online ? dqEsc(f.activity || 'online') : 'naposledy ' + (f.seen ? pfAgo(f.seen) : '—')}${pts != null ? ' · ' + String(pts).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' b.' : ''}</span>
        <div class="fx-b">${rm ? `<button class="btn" data-join="${rm[1]}">PRIPOJIŤ SA ▶</button>` : ''}${inRoom ? `<button class="btn" data-inv="${dqEsc(f.nick)}">POZVAŤ</button>` : ''}<button class="btn ghost" data-msgto="${dqEsc(f.nick)}">💬 SPRÁVA</button><button class="pf-x" data-frdel="${dqEsc(f.nick)}" title="Odobrať z priateľov">✕</button></div></div>`; };
    avNeed(SOC.friends.map(f => f.nick));
    const on = frOk.filter(f => f.online), off = frOk.filter(f => !f.online);
    body = `${SOC.ok === false ? `<div class="rk-err">${dqEsc(SOC.err)}</div>` : ''}
      <div class="fx-add"><i>🤝</i><div><b>Pridaj si kolegu</b><span>Napíš jeho prezývku. Keď žiadosť prijme, uvidíte sa online a môžete sa pozývať do hry.</span></div><div class="pf-add"><input type="text" id="pf-fnick" maxlength="16" placeholder="prezývka kolegu" autocomplete="off" spellcheck="false"><button class="btn" id="pf-fadd">PRIDAŤ ▶</button></div></div>
      ${frIn.length ? `<h3 class="pf-h">ŽIADOSTI <em>— chcú si ťa pridať</em></h3><div class="fx-grid">${frIn.map(f => `<div class="fx-card req"><div class="fx-top">${avFace(f.nick, '', 'big')}</div><b>${dqEsc(f.nick)}${lvOf(f.nick)}</b><span>žiada o priateľstvo</span><div class="fx-b"><button class="btn" data-fryes="${dqEsc(f.nick)}">PRIJAŤ</button><button class="btn ghost" data-frno="${dqEsc(f.nick)}">ODMIETNUŤ</button></div></div>`).join('')}</div>` : ''}
      ${on.length ? `<h3 class="pf-h">ONLINE <em>— ${on.length}</em></h3><div class="fx-grid">${on.map(row).join('')}</div>` : ''}
      <h3 class="pf-h">${on.length ? 'OSTATNÍ' : 'PRIATELIA'} <em>— ${on.length ? off.length : frOk.length}</em></h3>
      ${frOk.length ? (off.length ? `<div class="fx-grid">${off.map(row).join('')}</div>` : '') : '<div class="rk-empty">Zatiaľ nemáš priateľov. Keď si niekoho pridáš a on žiadosť prijme, uvidíš tu, či je online a čo práve hrá.</div>'}
      ${frOut.length ? `<h3 class="pf-h">ODOSLANÉ ŽIADOSTI</h3><div class="fx-grid">${frOut.map(f => `<div class="fx-card dim"><div class="fx-top">${avFace(f.nick, '', 'big')}</div><b>${dqEsc(f.nick)}</b><span>čaká na potvrdenie</span><div class="fx-b"><button class="btn ghost" data-frdel="${dqEsc(f.nick)}">ZRUŠIŤ</button></div></div>`).join('')}</div>` : ''}
      <div class="rk-note">Čo práve robíš, vidia len potvrdení priatelia. Zoznam sa obnovuje každých 25 sekúnd.</div>`;
  } else if (tab === 'ins') {
    if (!RK.ins && !RK.insBusy && !RK.insErr) insLoad();
    body = insHTML();
  } else if (tab === 'inbox') {
    const T = chatThreads(), fr = n => SOC.friends.find(f => f.nick === n), notes = SOC.inbox.filter(m => m.kind === 'friend');
    if (RK.pfChat && !T[RK.pfChat] && !frOk.some(f => f.nick === RK.pfChat)) RK.pfChat = null;
    if (RK.pfChat) {
      const n = RK.pfChat, f = fr(n), can = frOk.some(x => x.nick === n);
      body = `<div class="ch">
          <div class="ch-top"><button class="btn ghost" id="pf-chat-back">◀ SPRÁVY</button>${avFace(n, '', '')}<div><b>${dqEsc(n)}</b><span>${f && f.online ? '<i></i>' + dqEsc(f.activity || 'online') : f && f.seen ? 'naposledy ' + pfAgo(f.seen) : ''}</span></div>
            ${can && DQ.room && DQ.host && DQ.S && DQ.S.phase === 'lobby' ? `<button class="btn ghost" data-inv="${dqEsc(n)}">POZVAŤ DO HRY</button>` : ''}<button class="pf-x" id="pf-chat-del" title="Vymazať rozhovor">🗑</button></div>
          <div class="ch-log" id="pf-chat-log">${chatLogHTML(n)}</div>
          <div class="rk-err" id="pf-chat-err" style="display:none"></div>
          ${can ? `<div class="ch-in"><input type="text" id="pf-chat-txt" maxlength="300" placeholder="napíš správu…" autocomplete="off"><button class="btn" id="pf-chat-send">POSLAŤ ➤</button></div>` : '<div class="rk-note">Už nie ste priatelia — písať sa dá len priateľom.</div>'}
        </div>`;
    } else {
      const names = Object.keys(T).sort((x, y) => new Date(T[y][T[y].length - 1].t) - new Date(T[x][T[x].length - 1].t)), rest = frOk.filter(f => !T[f.nick]);
      const row = (n, L) => { const last = L && L[L.length - 1], un = L ? L.filter(m => !m.mine && !m.read).length : 0, f = fr(n);
        return `<button class="ch-row${un ? ' new' : ''}" data-chat="${dqEsc(n)}">${avFace(n, '', '')}${f && f.online ? '<u title="online"></u>' : ''}<div><b>${dqEsc(n)}</b><span>${last ? (last.mine ? 'Ty: ' : '') + (last.kind === 'invite' ? '🎮 pozvánka do hry · ' + dqEsc(last.body) : dqEsc(String(last.body).slice(0, 80))) : 'napíš prvú správu'}</span></div><small>${last ? pfAgo(last.t) : ''}</small>${un ? `<em>${un}</em>` : '<i>›</i>'}</button>`; };
      body = `${SOC.ok === false ? `<div class="rk-err">${dqEsc(SOC.err)}</div>` : ''}
        ${notes.length ? `<h3 class="pf-h">OZNAMY</h3>${notes.map(m => `<div class="pf-msg k-friend${m.read ? '' : ' new'}"><div><small>ŽIADOSŤ O PRIATEĽSTVO · ${pfAgo(m.created)}</small><b>${dqEsc(m.from)}</b><span>si ťa chce pridať medzi priateľov</span></div><div class="pf-fr-b">${frIn.some(f => f.nick === m.from) ? `<button class="btn" data-fryes="${dqEsc(m.from)}">PRIJAŤ</button>` : ''}<button class="pf-x" data-mdel="${m.id}" title="Vymazať">✕</button></div></div>`).join('')}` : ''}
        <h3 class="pf-h">ROZHOVORY <em>— klikni a otvorí sa chat</em></h3>
        <div class="ch-list">${names.map(n => row(n, T[n])).join('')}${rest.map(f => row(f.nick, null)).join('')}</div>
        ${!names.length && !rest.length ? '<div class="rk-empty">Zatiaľ tu nič nie je. Správy sa dajú posielať len priateľom — pridaj si niekoho v záložke PRIATELIA.</div>' : ''}
        ${SOC.sent ? '' : '<div class="rk-note">Tvoje odoslané správy sa zatiaľ pamätajú len v tomto zariadení. Po spustení doplnku databázy v52 ich uvidíš všade.</div>'}`;
    }
  } else {
    const me = RK.me || {};
    body = `${RK.meErr ? `<div class="rk-err">${dqEsc(RK.meErr)}</div>` : ''}
      <div class="st">
        <section class="st-card wide st-id"><h3><i>🪪</i>AKO ŤA VIDIA OSTATNÍ</h3>
          <div class="st-prev"><div class="st-prev-row">${pfAvatar(me.avatar, RK.acct.nick, '', me.emoji)}<b>${dqEsc(RK.acct.nick)}</b>${lvTag(rkLevel(T.p).n, true, ((RK.rows || []).find(x => x.nick === RK.acct.nick) || {}).lg)}<strong>${T.p} b.</strong></div><small>Takto vyzeráš v rebríčku, na mape území a u priateľov.</small></div>
          <div class="st-2">
            <div><h4>FOTKA</h4><div class="st-photo">${pfAvatar(me.avatar, RK.acct.nick, 'big', me.emoji)}<div><label class="btn pf-file"><span>📷 ${me.avatar ? 'ZMENIŤ FOTKU' : 'NAHRAŤ FOTKU'}</span><input type="file" id="pf-avfile" accept="image/*"></label>${me.avatar ? '<button class="btn ghost" id="pf-avdel">ODSTRÁNIŤ</button>' : ''}</div></div><small>Najlepšie štvorcová. Zmenší sa na 96 × 96 px.</small></div>
            <div><h4>EMOJI <em>— keď nemáš fotku</em></h4><div class="pf-emo">${PF_EMO.map(e => `<button data-emo="${e}" class="${me.emoji === e ? 'on' : ''}">${e}</button>`).join('')}${me.emoji ? '<button data-emo="" class="x" title="Bez emoji">✕</button>' : ''}</div></div>
          </div></section>
        <section class="st-card"><h3><i>🔑</i>PRIHLASOVACIE ÚDAJE</h3>
          <div class="st-f"><label for="pf-nnick">PREZÝVKA</label><div class="pf-form"><input type="text" id="pf-nnick" maxlength="16" placeholder="nová prezývka" value="${dqEsc(RK.acct.nick)}" autocomplete="off" spellcheck="false"><input type="password" id="pf-npass" placeholder="heslo na potvrdenie" autocomplete="current-password"><button class="btn" id="pf-nsave">ZMENIŤ</button></div><small>Jedinečná, 3 – 16 znakov. Body aj priatelia ti ostanú.</small></div>
          <div class="st-f"><label for="pf-pold">HESLO</label><div class="pf-form"><input type="password" id="pf-pold" placeholder="terajšie heslo" autocomplete="current-password"><input type="password" id="pf-pnew" placeholder="nové heslo" autocomplete="new-password"><button class="btn" id="pf-psave">ZMENIŤ</button></div><div class="rk-pw" id="pf-pw"><i></i><span>Aspoň 8 znakov, písmeno aj číslica. Po zmene sa ostatné zariadenia odhlásia.</span></div></div>
          <div class="st-f"><label for="pf-mail">E-MAIL <em>— nepovinný</em></label><div class="pf-form"><input type="email" id="pf-mail" maxlength="120" placeholder="tvoj@email.sk" value="${dqEsc(me.email || '')}" autocomplete="email"><button class="btn" id="pf-msave">ULOŽIŤ</button></div><small>Nikto ho nevidí. Zatiaľ sa len uloží; obnova hesla e-mailom príde neskôr.</small></div></section>
        <section class="st-card"><h3><i>🎨</i>VZHĽAD</h3>${pfLookHTML()}</section>
        <section class="st-card wide danger"><h3><i>⚠</i>ÚČET</h3><div class="st-danger"><div><b>Odhlásiť sa</b><small>Body ostanú uložené, prihlásiš sa znova prezývkou a heslom.</small></div><button class="btn ghost" id="rk-out">ODHLÁSIŤ SA</button><div><b>Vynulovať skóre</b><small>Zmaže body, odpovede, čas aj hry. Nedá sa vrátiť späť — stránka sa ešte raz opýta.</small></div><button class="rk-reset" id="rk-reset">VYNULOVAŤ</button></div></section>
      </div>`;
  }
  const html = `<div class="rk pf">
      ${(() => { const L = rkLevel(T.p), r = (RK.rows || []).find(x => x.nick === RK.acct.nick), lg = r && r.lg ? r.lg : 1, np = DQ_PERK.find(x => x[0] > L.n), nf = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return `<div class="pfx" style="--lg:${LGC[lg]}">
          <div class="pfx-top">
            <div class="pfx-av">${pfAvatar(RK.me && RK.me.avatar, RK.acct.nick, 'big', RK.me && RK.me.emoji)}<em>LVL ${L.n}</em></div>
            <div class="pfx-id"><h2>${dqEsc(RK.acct.nick)}</h2>
              <p><span class="pfx-lg">LIGA ${LG[lg]}</span>${RK.me && RK.me.created ? `<span>členom od ${new Date(RK.me.created).toLocaleDateString('sk-SK')}</span>` : ''}</p>
              <div class="pfx-xp" data-lvopen="${T.p}" title="Zobraziť všetky úrovne"><div><b>${dqEsc(L.name)}</b><span>${L.next ? 'ďalšia: ' + dqEsc(L.nextName) + ' · chýba ' + nf(L.next - T.p) + ' b.' : 'najvyššia úroveň'}</span></div><i><em style="width:${L.next ? Math.max(2, Math.round(L.pct)) : 100}%"></em></i>${np ? `<small>🎁 ďalší boost v Dobyvateľovi: <b>${np[2]}</b> od LVL ${np[0]}</small>` : ''}</div></div>
            <button class="pfx-ref" id="pf-refresh" title="Obnoviť údaje">${RK.loading ? '…' : '↻'}</button>
          </div>
          <div class="pfx-kpis">
            <div><b>${nf(T.p)}</b><span>bodov</span></div>
            <div><b>${pos >= 0 ? pos + 1 + '.' : '—'}</b><span>${ahead ? 'miesto · na ' + pos + '. chýba ' + nf(ahead.p - T.p + 1) : pos === 0 ? 'miesto · si na čele' : 'miesto z ' + (rowsAll.length || '—')}</span></div>
            <div><b>${pct(T.c, T.w)}</b><span>úspešnosť z ${nf(T.c + T.w)}</span></div>
            <div><b>${rkTime(T.s)}</b><span>čas tréningu</span></div>
          </div></div>`; })()}
      <div class="pf-tabs">${tabs.map(t => `<button class="${tab === t[0] ? 'on' : ''}" data-tab="${t[0]}">${t[1]}</button>`).join('')}</div>
      ${RK.loadErr ? `<div class="rk-err">${dqEsc(RK.loadErr)}</div>` : ''}${RK.err ? `<div class="rk-err">${dqEsc(RK.err)}</div>` : ''}
      ${RK.pfErr ? `<div class="rk-err">${dqEsc(RK.pfErr)}</div>` : ''}${RK.pfMsg ? `<div class="pf-ok">${dqEsc(RK.pfMsg)}</div>` : ''}
      <div class="pf-body" data-t="${tab}">${body}</div>
      <div class="pf-ver">ATCO Trainer v${APP_VERSION} · BETA</div>
    </div>`;
  /* plynulé prepínanie (v4.16): rovnaký obsah sa neprekresľuje vôbec; pri zmene údajov na tej istej záložke sa obsah vymení bez animácie, animuje sa len prechod na inú záložku */
  const key = tab + '|' + (RK.pfChat || '');
  if (card._pfHtml === html && card.querySelector('.pf-body')) { RK.pfErr = ''; RK.pfMsg = ''; return; }
  const keepY = window.scrollY, hOld = card.offsetHeight;
  card.style.minHeight = hOld + 'px';
  card.innerHTML = html; card._pfHtml = html;
  if (RK.pfKey === key) { const b = card.querySelector('.pf-body'); if (b) b.classList.add('still'); }
  RK.pfKey = key;
  requestAnimationFrame(() => { card.style.minHeight = ''; });
  if (Math.abs(window.scrollY - keepY) > 2) window.scrollTo(0, keepY);
  RK.pfErr = ''; RK.pfMsg = '';
  rkBindAccount(again); pfBind(card);
  document.getElementById('pf-refresh').onclick = again;
  if (tab === 'inbox') {
    SOC.inbox.filter(m => m.kind === 'friend' && !m.read).forEach(m => { m.read = true; SOC.unread = Math.max(0, SOC.unread - 1); rkRpc('atco_msg_read', { p_token: RK.acct.token, p_id: m.id }).catch(() => {}); });
    if (RK.pfChat) chatMarkRead(RK.pfChat);
    rkHeadBtn();
  }
}
function pfLookHTML() {
  const L = dqLook(), bg = lsGet(BG_KEY, '');
  return `<div class="dq-look"><strong>FARBA POZADIA</strong>
      <div class="dq-look-row">${BG_THEMES.map(t => `<button class="pf-bg${bg === t[0] ? ' on' : ''}" data-bg="${t[0]}" style="--c:${t[2]}">${t[1]}</button>`).join('')}</div>
      <strong style="margin-top:14px">FARBA A LIETADLO V DOBYVATEĽOVI</strong>
      <div class="dq-look-row">${DQ_PAL.map((c, ci) => `<button class="dq-sw${L.col === ci ? ' on' : ''}" data-pfcol="${ci}" style="background:${c}"></button>`).join('')}</div>
      <div class="dq-look-row">${DQ_ICO.map((ic, ii) => `<button class="dq-ic${L.ico === ii ? ' on' : ''}" data-pfico="${ii}">${ic}</button>`).join('')}</div>
      <div class="dq-look-row"><button class="rk-chip${dqLow() ? '' : ' on'}" id="pf-low">ANIMÁCIE: ${dqLow() ? 'MENEJ' : 'PLNÉ'}</button><button class="rk-chip${SND.on ? ' on' : ''}" id="pf-snd">ZVUKY: ${SND.on ? 'ZAPNUTÉ' : 'VYPNUTÉ'}</button><small>Farbu v hre dostaneš, ak ju v miestnosti nemá nikto pred tebou.</small></div>
    </div>`;
}
/* fotka sa zmenší v prehliadači na štvorec 96 × 96 px a uloží ako krátky text */
function pfReadAvatar(file) {
  return new Promise((res, rej) => {
    const im = new Image(), url = URL.createObjectURL(file);
    im.onload = () => { try { const c = document.createElement('canvas'); c.width = c.height = 96; const k = Math.min(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, (im.width - k) / 2, (im.height - k) / 2, k, k, 0, 0, 96, 96); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.82)); } catch (e) { rej(e); } };
    im.onerror = () => rej(new Error('BAD_AVATAR')); im.src = url;
  });
}
function pfBind(card) {
  const $ = id => document.getElementById(id), re = () => renderProfile(card);
  const saveLook = ch => { lsSet(DQ_LOOKK, Object.assign(dqLook(), ch)); re(); };
  card.querySelectorAll('[data-pfcol]').forEach(b => { b.onclick = () => saveLook({ col: +b.dataset.pfcol }); });
  card.querySelectorAll('[data-pfico]').forEach(b => { b.onclick = () => saveLook({ ico: +b.dataset.pfico }); });
  card.querySelectorAll('[data-bg]').forEach(b => { b.onclick = () => { lsSet(BG_KEY, b.dataset.bg); bgApply(b.dataset.bg); if (RK.acct) rkRpc('atco_set_profile', { p_token: RK.acct.token, p_email: null, p_avatar: null, p_bg: b.dataset.bg }).then(() => { if (RK.me) RK.me.bg = b.dataset.bg; }).catch(() => {}); re(); }; });
  if ($('pf-low')) $('pf-low').onclick = () => { DQ.low = !dqLow(); lsSet(DQ_LOWK, DQ.low ? 1 : 0); re(); };
  card.querySelectorAll('[data-tab]').forEach(b => { b.onclick = () => { RK.pfTab = b.dataset.tab; if (b.dataset.tab === 'ins') { RK.ins = null; RK.insErr = ''; } re(); if (b.dataset.tab === 'friends' || b.dataset.tab === 'inbox') socTick(true); }; });
  card.querySelectorAll('[data-go2]').forEach(b => { b.onclick = () => startMode(b.dataset.go2); });
  if (!RK.acct) return;
  card.querySelectorAll('[data-join]').forEach(b => { b.onclick = () => socJoin(b.dataset.join); });
  card.querySelectorAll('[data-fryes]').forEach(b => { b.onclick = () => socCall('atco_friend_answer', { p_nick: b.dataset.fryes, p_ok: true }, b.dataset.fryes + ' je teraz tvoj priateľ.'); });
  card.querySelectorAll('[data-frno]').forEach(b => { b.onclick = () => socCall('atco_friend_answer', { p_nick: b.dataset.frno, p_ok: false }); });
  card.querySelectorAll('[data-frdel]').forEach(b => { b.onclick = () => rkConfirm('Odobrať z priateľov?', dqEsc(b.dataset.frdel) + ' zmizne z tvojho zoznamu a ty z jeho.', 'ÁNO, ODOBRAŤ', () => socCall('atco_friend_remove', { p_nick: b.dataset.frdel })); });
  card.querySelectorAll('[data-inv]').forEach(b => { b.onclick = () => socCall('atco_msg_send', { p_nick: b.dataset.inv, p_kind: 'invite', p_body: DQ.room }, 'Pozvánka pre ' + b.dataset.inv + ' je odoslaná.'); });
  card.querySelectorAll('[data-msgto]').forEach(b => { b.onclick = () => { RK.pfChat = b.dataset.msgto; RK.pfTab = 'inbox'; re(); }; });
  card.querySelectorAll('[data-mdel]').forEach(b => { b.onclick = () => socCall('atco_msg_delete', { p_id: +b.dataset.mdel }); });
  if ($('pf-mclear')) $('pf-mclear').onclick = () => rkConfirm('Vymazať všetky správy?', 'Schránka sa vyprázdni. Nedá sa to vrátiť späť.', 'ÁNO, VYMAZAŤ', () => socCall('atco_msg_delete', { p_id: null }));
  const addF = () => { const v = ($('pf-fnick').value || '').trim(); if (v) socCall('atco_friend_add', { p_nick: v }, 'Žiadosť pre ' + v + ' je odoslaná.'); };
  if ($('pf-fadd')) { $('pf-fadd').onclick = addF; $('pf-fnick').addEventListener('keydown', e => { if (e.key === 'Enter') addF(); }); }
  card.querySelectorAll('[data-chat]').forEach(b => { b.onclick = () => { RK.pfChat = b.dataset.chat; RK.pfErr = ''; RK.pfMsg = ''; re(); }; });
  if ($('pf-chat-back')) $('pf-chat-back').onclick = () => { RK.pfChat = null; re(); };
  if ($('pf-chat-log')) { const e = $('pf-chat-log'); e.scrollTop = e.scrollHeight; chatBind(e); }
  if ($('pf-chat-send')) { $('pf-chat-send').onclick = chatSend; $('pf-chat-txt').addEventListener('keydown', e => { if (e.key === 'Enter') chatSend(); }); if (window.matchMedia('(hover:hover)').matches) $('pf-chat-txt').focus(); }
  if ($('pf-chat-del')) $('pf-chat-del').onclick = () => rkConfirm('Vymazať rozhovor?', 'Rozhovor s hráčom ' + dqEsc(RK.pfChat) + ' zmizne z tvojho zoznamu. Nedá sa to vrátiť späť.', 'ÁNO, VYMAZAŤ', async () => {
    const n = RK.pfChat, H = lsGet(CHAT_HIDEK, {}), k = chatKey(); (H[k] = H[k] || {})[n] = Date.now(); lsSet(CHAT_HIDEK, H);
    const A = lsGet(CHAT_SENTK, {}); if (A[k]) { A[k] = A[k].filter(m => m.to !== n); lsSet(CHAT_SENTK, A); }
    for (const m of SOC.inbox.filter(x => x.from === n && x.kind !== 'friend')) { try { await rkRpc('atco_msg_delete', { p_token: RK.acct.token, p_id: m.id }); } catch (e) {} }
    RK.pfChat = null; await socTick(true); re();
  });
  /* nastavenia účtu */
  const call = async (fn, args, ok, after) => { try { const r = await rkRpc(fn, Object.assign({ p_token: RK.acct.token }, args)); RK.pfErr = ''; RK.pfMsg = ok; if (after) after(r); } catch (e) { RK.pfErr = socErr(e); RK.pfMsg = ''; } await pfLoadMe(); re(); };
  if ($('pf-avfile')) $('pf-avfile').onchange = async () => { const f = $('pf-avfile').files[0]; if (!f) return; try { const d = await pfReadAvatar(f); await call('atco_set_profile', { p_email: null, p_avatar: d, p_bg: null }, 'Fotka je uložená.'); } catch (e) { RK.pfErr = 'Obrázok sa nepodarilo načítať.'; re(); } };
  card.querySelectorAll('[data-emo]').forEach(b => { b.onclick = () => call('atco_set_emoji', { p_emoji: b.dataset.emo }, b.dataset.emo ? 'Emoji je uložené.' : 'Emoji je zrušené.'); });
  if ($('pf-avdel')) $('pf-avdel').onclick = () => call('atco_set_profile', { p_email: null, p_avatar: '', p_bg: null }, 'Fotka je odstránená.');
  if ($('pf-msave')) $('pf-msave').onclick = () => call('atco_set_profile', { p_email: $('pf-mail').value || '', p_avatar: null, p_bg: null }, 'E-mail je uložený.');
  if ($('pf-nsave')) $('pf-nsave').onclick = () => {
    const n = ($('pf-nnick').value || '').trim().replace(/\s+/g, ' ');
    if (!/^[0-9A-Za-zÀ-ž _.\-]{3,16}$/.test(n)) { RK.pfErr = RK_ERR.BAD_NICK; return re(); }
    if (n === RK.acct.nick) { RK.pfErr = 'To je tvoja terajšia prezývka.'; return re(); }
    call('atco_rename', { p_pass: $('pf-npass').value, p_nick: n }, 'Prezývka je zmenená.', r => { const old = rkPendKey(); RK.acct = { nick: r.nick, token: r.token }; lsSet(RK_ACCT, RK.acct); try { localStorage.removeItem(old); } catch (e) {} rkPendSave(); rkLoad(); });
  };
  if ($('pf-pnew')) $('pf-pnew').addEventListener('input', () => { const sc = rkPassScore($('pf-pnew').value), m = $('pf-pw'); m.dataset.s = $('pf-pnew').value ? sc : ''; m.querySelector('span').textContent = !$('pf-pnew').value ? 'Aspoň 8 znakov, písmeno aj číslica. Po zmene sa ostatné zariadenia odhlásia.' : ['Heslo je krátke.', 'Slabé heslo — treba 8 znakov, písmeno aj číslicu.', 'Dobré heslo.', 'Silné heslo.'][sc]; });
  if ($('pf-psave')) $('pf-psave').onclick = () => {
    if (rkPassScore($('pf-pnew').value) < 2) { RK.pfErr = RK_ERR.WEAK_PASS; return re(); }
    call('atco_change_pass', { p_old: $('pf-pold').value, p_new: $('pf-pnew').value }, 'Heslo je zmenené.', r => { RK.acct = { nick: r.nick, token: r.token }; lsSet(RK_ACCT, RK.acct); });
  };
}
/* ---------- MAPA v rebríčku (v4.11): deväť oblastí Slovenska = deväť modulov; oblasť drží ten, kto má v module najviac bodov ---------- */
/* [modul, mesto, lon, lat, popis hore/dole, lon a lat miesta, kam ide popis mimo mapy] */
const RKM = [   // [modul, mesto, lon, lat, 'up'|'dn' (kam vedie štítok), lon a lat konca čiary so štítkom] — jedna oblasť na každý zdroj bodov (moduly, hry, denné úlohy)
  ['daily', 'Trnava', 17.59, 48.37, 'up', 16.10, 50.02], ['theory', 'Piešťany', 17.83, 48.59, 'up', 16.95, 51.65], ['aircraft', 'Trenčín', 18.04, 48.89, 'up', 17.80, 50.02], ['heading', 'Žilina', 18.74, 49.22, 'up', 18.65, 51.65],
  ['metar', 'Liptovský Mikuláš', 19.61, 49.08, 'up', 19.50, 50.02], ['exam', 'Poprad', 20.30, 49.06, 'up', 20.35, 51.65], ['conquer', 'Prešov', 21.24, 49.00, 'up', 21.25, 50.02], ['bonus', 'Humenné', 21.91, 48.93, 'up', 22.20, 51.65],
  ['airport', 'Bratislava', 17.11, 48.15, 'dn', 16.30, 47.45], ['coord', 'Nitra', 18.09, 48.31, 'dn', 17.15, 45.9], ['wake', 'Levice', 18.60, 48.21, 'dn', 18.00, 47.45], ['waypoint', 'Banská Bystrica', 19.15, 48.74, 'dn', 18.85, 45.9],
  ['phrase', 'Lučenec', 19.67, 48.33, 'dn', 19.70, 47.45], ['calc', 'Rožňava', 20.53, 48.66, 'dn', 20.55, 45.9], ['callsign', 'Košice', 21.26, 48.72, 'dn', 21.40, 47.45], ['abbr', 'Michalovce', 21.92, 48.76, 'dn', 22.25, 45.9]];
const RKM_COL = ['#e63946', '#3a86ff', '#ffbe0b', '#2dc653', '#b45cff', '#ff8c2b', '#1fd6d6', '#ff7ab6', '#8d99ae'];
/* náznak hraníc susedov: od trojmedzí smerom, ktorým hranica naozaj pokračuje [lon, lat → lon, lat] */
const RKM_NB = [[16.940, 48.617, 16.05, 48.79], [18.851, 49.517, 18.60, 49.84], [22.566, 49.088, 22.74, 49.56], [22.155, 48.397, 22.88, 48.06], [17.161, 48.007, 17.06, 47.62]];
const RKM_ST = [['ČESKO', 17.25, 49.36], ['POĽSKO', 20.55, 49.66], ['UKRAJINA', 23.05, 48.72], ['MAĎARSKO', 19.85, 47.78], ['RAKÚSKO', 16.22, 48.22]];
function rkAvNicks() {
  const R = RK.rows || [], top = R.filter(r => r.av).sort((a, b) => rkTotal(b) - rkTotal(a)).slice(0, 60).map(r => r.nick);
  if (RK.acct) top.unshift(RK.acct.nick);
  return top;
}
function rkmOwners() {
  return RKM.map(x => { const L = (RK.rows || []).map(r => ({ r, p: ((r.mods || {})[x[0]] || {}).p || 0 })).filter(o => o.p > 0).sort((a, b) => b.p - a.p || a.r.nick.localeCompare(b.r.nick)); return { top: L[0] || null, second: L[1] || null, n: L.length, L }; });
}
function rkmCells() {
  if (RKM.cells) return RKM.cells;
  const S = RKM.map(x => [projX(x[2]), projY(x[3])]), W = MAP_PROJ.w, H = MAP_PROJ.h;
  return RKM.cells = S.map((a, i) => {
    let P = [[-80, -80], [W + 80, -80], [W + 80, H + 80], [-80, H + 80]];
    S.forEach((b, j) => {
      if (j === i || !P.length) return;
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, nx = b[0] - a[0], ny = b[1] - a[1], f = p => (p[0] - mx) * nx + (p[1] - my) * ny, Q = [];
      P.forEach((p, k) => { const q = P[(k + 1) % P.length], fp = f(p), fq = f(q); if (fp <= 0) Q.push(p); if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) { const t = fp / (fp - fq); Q.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); } });
      P = Q;
    });
    return 'M' + P.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z';
  });
}
function rkmPlace() {
  const w = document.getElementById('rkm-wrap'); if (!w) return;
  const R = w.getBoundingClientRect();
  w.querySelectorAll('.rkm-pt').forEach(c => { const l = w.querySelector('.rkm-lab[data-m="' + c.dataset.m + '"]'), r = c.getBoundingClientRect(); if (l) { l.style.left = (r.left + r.width / 2 - R.left).toFixed(1) + 'px'; l.style.top = (r.top + r.height / 2 - R.top).toFixed(1) + 'px'; l.classList.add('set'); } });
}
window.addEventListener('resize', () => { if (state.mode === 'rank' && RK.view === 'map') rkmPlace(); });
function renderRankMap(card) {
  const O = rkmOwners(), cells = rkmCells(), W = MAP_PROJ.w, H = MAP_PROJ.h;
  const fir = smoothClosedPath(FIR_OUTLINE.map(([lo, la]) => [projX(lo), projY(la)]));
  /* farby: každý držiteľ má jednu, rozdielnu od ostatných; kto drží najviac oblastí, je prvý */
  const cnt = {}; O.forEach(o => { if (o.top) cnt[o.top.r.nick] = (cnt[o.top.r.nick] || 0) + 1; });
  const kings = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a] || a.localeCompare(b)), colOf = n => RKM_COL[kings.indexOf(n) % RKM_COL.length];
  /* tabuľka: hore ten, kto drží najviac oblastí; v rámci hráča od najväčších bodov, voľné oblasti na konci */
  const ord = RKM.map((x, i) => i).sort((a, b) => { const A = O[a].top, B = O[b].top; if (!A || !B) return (A ? 0 : 1) - (B ? 0 : 1) || a - b; return kings.indexOf(A.r.nick) - kings.indexOf(B.r.nick) || B.p - A.p || a - b; });
  const name = m => (RK_MODS.find(x => x[0] === m) || ['', m])[1], me = RK.acct ? RK.acct.nick : '';
  const lv = r => rkLevel(rkTotal(r));
  const nf = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  card.innerHTML = `<div class="rk">
      <div class="rk-head"><div><h2>REBRÍČEK</h2><p>Mapa území: kto má v module najviac bodov, drží jeho oblasť. <a href="#" data-hp="rank">Ako sa počítajú ❓</a></p></div><button class="btn ghost" id="rk-refresh">${RK.loading ? 'NAČÍTAVAM…' : '↻ OBNOVIŤ'}</button></div>
      <div class="rk-chips main">${rkTabsHTML('map')}</div>
      ${RK.loadErr ? `<div class="rk-err">${dqEsc(RK.loadErr)}</div>` : ''}
      ${kings.length ? `<div class="rkm-kings">${kings.slice(0, 5).map((n, i) => { const r = RK.rows.find(x => x.nick === n); return `<div style="--c:${colOf(n)}" class="${n === me ? 'me' : ''}">${i === 0 ? '<i>👑</i>' : ''}${avFace(n, r.emo, 'sm')}<b>${dqEsc(n)}</b><span>${cnt[n]} ${cnt[n] === 1 ? 'oblasť' : cnt[n] < 5 ? 'oblasti' : 'oblastí'}</span></div>`; }).join('')}</div>` : ''}
      <div class="rkm-wrap" id="rkm-wrap">
        <div class="rkm-tilt"><svg class="rkm-svg" viewBox="-200 -150 ${W + 400} ${(H + 300).toFixed(0)}" aria-label="Mapa území">
          <defs><clipPath id="rkm-clip"><path d="${fir}"/></clipPath>
            <linearGradient id="rkm-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16382b"/><stop offset="1" stop-color="#0b1f17"/></linearGradient></defs>
          <rect x="-200" y="-150" width="${W + 400}" height="${(H + 300).toFixed(0)}" rx="30" fill="url(#rkm-sea)"/>
          ${RKM_NB.map(b => `<line class="rkm-nb" x1="${projX(b[0]).toFixed(1)}" y1="${projY(b[1]).toFixed(1)}" x2="${projX(b[2]).toFixed(1)}" y2="${projY(b[3]).toFixed(1)}"/>`).join('')}
          ${RKM_ST.map(t => `<text class="rkm-st" x="${projX(t[1]).toFixed(1)}" y="${projY(t[2]).toFixed(1)}">${t[0]}</text>`).join('')}
          <path d="${fir}" class="rkm-depth" transform="translate(0,22)"/><path d="${fir}" class="rkm-depth d2" transform="translate(0,11)"/>
          <g clip-path="url(#rkm-clip)">${RKM.map((x, i) => `<path class="rkm-c${O[i].top ? '' : ' free'}${O[i].top && O[i].top.r.nick === me ? ' me' : ''}" data-m="${x[0]}" d="${cells[i]}" style="--c:${O[i].top ? colOf(O[i].top.r.nick) : '#51655b'}"><title>${name(x[0])} · ${x[1]}</title></path>`).join('')}</g>
          <path d="${fir}" class="rkm-out"/>
          ${RKM.map((x, i) => `<line class="rkm-ld" style="--c:${O[i].top ? colOf(O[i].top.r.nick) : '#7d9087'}" x1="${projX(x[2]).toFixed(1)}" y1="${projY(x[3]).toFixed(1)}" x2="${projX(x[5]).toFixed(1)}" y2="${projY(x[6]).toFixed(1)}"/><circle class="rkm-an" data-m="${x[0]}" cx="${projX(x[5]).toFixed(1)}" cy="${projY(x[6]).toFixed(1)}" r="2"/>`).join('')}
          ${RKM.map(x => `<circle class="rkm-pt" data-m="${x[0]}" cx="${projX(x[2]).toFixed(1)}" cy="${projY(x[3]).toFixed(1)}" r="6"/>`).join('')}
        </svg></div>
        ${RKM.map((x, i) => { const o = O[i].top; return `<button class="rkm-lab ${x[4]}${o ? '' : ' free'}${o && o.r.nick === me ? ' me' : ''}" data-m="${x[0]}" style="--c:${o ? colOf(o.r.nick) : '#7d9087'}"><small>${name(x[0])}</small>${o ? `<span>${avFace(o.r.nick, o.r.emo, 'sm')}<b>${dqEsc(o.r.nick)}</b></span><i>LVL ${lv(o.r).n} · ${nf(o.p)} b.</i>` : '<span><b>VOĽNÉ</b></span><i>získaj prvý bod</i>'}</button>`; }).join('')}
      </div>
      <div class="rk-note"><b>Ako to funguje:</b> každá oblasť patrí jednému modulu. Drží ju hráč, ktorý má v tom module <b>najviac bodov zo všetkých</b>. Klikni na oblasť a rozbalí sa, kto je druhý, tretí, štvrtý a kde si ty.</div>
      <div class="rk-tbl rkm-tbl"><table><thead><tr><th>OBLASŤ</th><th>MODUL</th><th>DRŽÍ</th><th>BODY</th><th>ÚROVEŇ</th></tr></thead><tbody>${ord.map(i => { const x = RKM[i], o = O[i].top, L = O[i].L, open = RK.mapOpen === x[0], myI = L.findIndex(q => q.r.nick === me);
        const line = (q, k, cls) => `<div class="rkm-ln ${cls || ''}${q.r.nick === me ? ' me' : ''}"><b>${k + 1}.</b>${avFace(q.r.nick, q.r.emo, 'sm')}<span>${dqEsc(q.r.nick)}</span>${lvTag(lv(q.r).n, true, q.r.lg)}<strong>${nf(q.p)} b.</strong><small>${k ? 'na 1. miesto chýba ' + nf(L[0].p - q.p + 1) + ' b.' : 'drží oblasť'}</small></div>`;
        const more = !open ? '' : `<tr class="rkm-more"><td colspan="5"><div class="rkm-exp" style="--c:${o ? colOf(o.r.nick) : '#7d9087'}">
            ${L.length > 1 ? L.slice(1, 4).map((q, k) => line(q, k + 1)).join('') : `<div class="rkm-ln none">${o ? 'Nikto ďalší tu zatiaľ body nemá.' : 'Oblasť je voľná — kto získa prvý bod v tomto module, drží ju.'}</div>`}
            ${!me ? '<div class="rkm-ln you none">Prihlás sa a uvidíš tu svoje miesto.</div>' : myI < 0 ? `<div class="rkm-ln you none"><b>TY</b>${avFace(me, '', 'sm')}<span>${dqEsc(me)}</span><small>v tomto module zatiaľ nemáš body${o ? ' · na 1. miesto treba ' + nf(o.p + 1) + ' b.' : ''}</small></div>` : myI > 3 ? `<div class="rkm-dots">⋮</div>${line(L[myI], myI, 'you')}` : ''}
            <div class="rkm-go"><button class="btn ghost" data-full="${x[0]}">CELÉ PORADIE · ${name(x[0])} ▸</button></div></div></td></tr>`;
        return `<tr class="${o && o.r.nick === me ? 'me' : ''}${open ? ' open' : ''}" data-m="${x[0]}"><td><i class="lg-dot" style="background:${o ? colOf(o.r.nick) : '#7d9087'}"></i>${x[1]}</td><td>${name(x[0])}</td><td class="rk-nick">${o ? avFace(o.r.nick, o.r.emo, 'sm') + dqEsc(o.r.nick) : '— voľné —'}</td><td class="rk-pts">${o ? nf(o.p) : '—'}</td><td class="rkm-lv">${o ? lvTag(lv(o.r).n, true, o.r.lg) : ''}<u>${open ? '▴' : '▾'}</u></td></tr>${more}`; }).join('')}</tbody></table></div>
    </div>`;
  document.getElementById('rk-refresh').onclick = () => { renderRankMap(card); rkLoad(); };
  card.querySelectorAll('.rk-chip').forEach(b => { b.onclick = () => { RK.view = b.dataset.v; renderRank(card); }; });
  /* klik na oblasť (na mape, na popise aj v tabuľke) rozbalí poradie pod riadkom — nikam neodskočí */
  card.querySelectorAll('.rkm-lab, .rkm-c, .rkm-tbl tr[data-m]').forEach(b => { b.addEventListener('click', () => { const tbl = b.matches('tr'); RK.mapOpen = RK.mapOpen === b.dataset.m && tbl ? null : b.dataset.m; const y = window.scrollY; renderRankMap(card); window.scrollTo(0, y); if (!tbl) { const r = card.querySelector('.rkm-tbl tr.open'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }); });
  card.querySelectorAll('[data-full]').forEach(b => { b.onclick = e => { e.stopPropagation(); RK.view = b.dataset.full; renderRank(card); window.scrollTo(0, 0); }; });
  card.querySelectorAll('.rkm-lab, .rkm-c').forEach(b => { const on = v => card.querySelectorAll('[data-m="' + b.dataset.m + '"]').forEach(e => e.classList.toggle('hov', v)); b.addEventListener('mouseenter', () => on(true)); b.addEventListener('mouseleave', () => on(false)); });
  rkmPlace(); requestAnimationFrame(rkmPlace); setTimeout(rkmPlace, 350);
}
function rkTabsHTML(on) { return [['all', '∑ CELKOVO'], ['map', '🗺 MAPA'], ['dc', '📅 DENNÁ VÝZVA'], ['league', '🏆 LIGA']].map(x => `<button class="rk-chip${on === x[0] ? ' on' : ''}" data-v="${x[0]}">${x[1]}</button>`).join(''); }
/* úplné pravidlá bodovania — rozbaľovacia tabuľka na stránke O stránke */
function rkRulesHTML(pts) {
  return `<details class="rk-rules"><summary>PRAVIDLÁ BODOVANIA — všetko, z čoho sa body, úspešnosť a čas počítajú</summary>
        <table><tbody>
          <tr><th>Cvičenie v module (MOD 01 – 06)</th><td>správna odpoveď <b>+1</b>, v HARDCORE (písanie z hlavy) <b>+2</b>; nesprávna a preskočená 0</td></tr>
          <tr><th>Denný tréning</th><td>rovnako ako cvičenie: <b>+1</b>, pri písaní <b>+2</b></td></tr>
          <tr><th>Denná výzva</th><td>20 otázok, každý deň rovnaké pre všetkých; jeden pokus denne<br>správna <b>+3</b> (pri písaní <b>+6</b>), nesprávna alebo preskočená <b>−2</b>; bonus za 80 % = počet otázok, za 90 % dvojnásobok, za 100 % trojnásobok; menej než 0 sa nepripíše; body až po dokončení skúšky</td></tr>
          <tr><th>Dobyvateľ</th><td><b>500 × miesto × výkon × hráči × dĺžka × okruhy</b>, najmenej 5<br>miesto: 1. = 1 · 2. = 0,5 · 3. = 0,25 · 4. = 0,12 · 5. = 0,06 · 6. = 0,03<br>výkon: 0,5 až 1 podľa bodov oproti víťazovi<br>hráči: len počítače 0,1 · 2 ľudia 0,6 · 3 = 0,8 · 4 = 1 · 5 = 1,15 · 6 = 1,3 (každý počítač +0,03)<br>dĺžka: (kolá obsadzovania + súbojov) / 10, od 0,4 do 1,6<br>okruhy: 0,6 pri jednej sade až 1 pri všetkých</td></tr>
          <tr><th>Hry a výhry</th><td>počítajú sa len hry Dobyvateľa, v ktorých hrali aspoň dvaja ľudia</td></tr>
          <tr><th>Úspešnosť</th><td>správne odpovede ÷ všetky odpovede; v Dobyvateľovi len z hier aspoň dvoch ľudí</td></tr>
          <tr><th>Okruhy teórie</th><td>správne a všetky odpovede na otázky daného okruhu v Dobyvateľovi (aspoň dvaja ľudia); poradie podľa počtu správnych</td></tr>
          <tr><th>Čas tréningu</th><td>sekunda sa pripíše, len keď je otvorené cvičenie alebo bežiaca hra, okno je viditeľné a posledná odpoveď bola pred menej než 45 sekundami; dve otvorené karty sa nepočítajú dvakrát</td></tr>
          <tr><th>Úrovne</th><td><a href="#" data-lvopen="${pts || 0}">Zobraziť všetky úrovne ▸</a><br>58 úrovní podľa všetkých bodov, ktoré si kedy získal: začiatok (Uchádzač, Feasťák, výcvik), veže od Boleráza po Bratislavu podľa veľkosti mesta, approach, ACC Bratislava, zahraničné strediská a vrchol. Posledná je pri 100 000 bodoch. Číslo úrovne je pri mene v rebríčku. V Dobyvateľovi dávajú malé boosty (každý raz za hru, hostiteľ ich vie vypnúť): ${DQ_PERK.map(x => 'od úrovne ' + x[0] + ' ' + x[2]).join(' · ')}.</td></tr>
          <tr><th>Mapa</th><td>Slovensko je rozdelené na deväť oblastí okolo miest; každá patrí jednému modulu. Oblasť drží hráč, ktorý má v danom module najviac bodov zo všetkých. Kto ho predbehne, oblasť mu vezme.</td></tr>
          <tr><th>Ligy</th><td>päť líg: Bronz, Striebro, Zlato, Platina, Diamant; každý začína v Bronze. Počítajú sa body za kalendárny mesiac zo všetkých činností. Na konci mesiaca prví traja z každej ligy postupujú, poslední traja zostupujú (ak v lige hralo aspoň šesť ľudí) a kto za mesiac nezískal ani bod, klesne o ligu. Celkové body sa nenulujú.</td></tr>
          <tr><th>Poradie</th><td>podľa bodov vo zvolenom pohľade; pri zhode viac správnych odpovedí, potom abeceda</td></tr>
          <tr><th>Odosielanie</th><td>body sa posielajú každých 30 sekúnd a pri opustení stránky; bez internetu počkajú v zariadení</td></tr>
        </tbody></table></details>`;
}
function renderRank(card) {
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = 'liga';
  const hasLg = (RK.rows || []).some(r => r.lg != null);
  avNeed(rkAvNicks());
  if (RK.view === 'map') return renderRankMap(card);
  if (RK.view === 'league' || RK.view === 'dc') {
    const meR = RK.acct ? (RK.rows || []).find(r => r.nick === RK.acct.nick) : null, sel = RK.lgSel || (meR && meR.lg) || 1;
    const now = new Date(), left = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
    const L = (RK.rows || []).filter(r => (r.lg || 1) === sel).map(r => ({ n: r.nick, p: r.mp || 0, lv: rkLevel(rkTotal(r)).n, emo: r.emo })).sort((a, b) => b.p - a.p || a.n.localeCompare(b.n)), act = L.filter(o => o.p > 0).length;
    const zone = (o, i) => o.p > 0 && i < 3 && sel < 5 ? ['up', '▲ postup'] : o.p === 0 && sel > 1 ? ['dn', '▼ bez bodov'] : o.p > 0 && act >= 6 && i >= act - 3 && sel > 1 ? ['dn', '▼ zostup'] : ['', ''];
    card.innerHTML = `<div class="rk">
        <div class="rk-head"><div><h2>REBRÍČEK</h2><p>Mesačné ligy, denná výzva a celkové poradie. <a href="#" data-hp="rank">Ako sa počítajú ❓</a></p></div><button class="btn ghost" id="rk-refresh">${RK.loading ? 'NAČÍTAVAM…' : '↻ OBNOVIŤ'}</button></div>
        ${RK.acct ? '' : '<div class="rk-acct in"><span>Nie si prihlásený — body sa ti nepočítajú a v lige ťa nevidno.</span><div class="rk-acct-b"><button class="btn" id="rk-toprof">PRIHLÁSIŤ SA ▶</button></div></div>'}
        <div class="rk-chips main">${rkTabsHTML(RK.view)}</div>
        ${RK.loadErr ? `<div class="rk-err">${dqEsc(RK.loadErr)}</div>` : ''}
        ${RK.view === 'dc' ? `<div class="rk-note">Dnešných 20 otázok je pre všetkých rovnakých. Poradie je podľa počtu správnych, pri zhode podľa času. Každý má jeden pokus denne.</div>${hasLg || !RK.rows ? dcTopHTML() : '<div class="rk-empty">Denné poradie čaká na doplnok databázy (supabase-doplnok-v49.sql). Výzvu hrať môžeš, body sa počítajú.</div>'}<div class="pf-acts"><button class="btn" id="rk-godc">ÍSŤ NA DENNÚ VÝZVU ▶</button></div>`
        : !hasLg && RK.rows ? '<div class="rk-empty">Ligy čakajú na doplnok databázy (supabase-doplnok-v49.sql). Celkové poradie funguje ďalej.</div>'
        : `<div class="lg-head" style="--c:${LGC[sel]}"><div class="lg-badge"><b>${sel}</b></div><div><strong>LIGA ${LG[sel]}</strong><span>${meR && (meR.lg || 1) === sel ? 'Tvoja liga. ' : ''}Do konca mesiaca ${left === 0 ? 'ostáva dnešok' : left === 1 ? 'ostáva 1 deň' : 'ostáva ' + left + ' dní'}.</span></div></div>
          <div class="lg-steps">${[1, 2, 3, 4, 5].map(n => `<button class="${n === sel ? 'on' : ''}${meR && (meR.lg || 1) === n ? ' me' : ''}" data-lg="${n}" style="--c:${LGC[n]}">${LG[n]}<small>${(RK.rows || []).filter(r => (r.lg || 1) === n).length}</small></button>`).join('')}</div>
          <div class="rk-note"><b>Ako to funguje:</b> počítajú sa body získané <b>tento mesiac</b> zo všetkého — cvičenie, denná výzva aj Dobyvateľ. Na konci mesiaca <b class="lg-up">prví traja postupujú</b> o ligu vyššie${sel > 1 ? ', <b class="lg-dn">poslední traja zostupujú</b> (ak ich v lige hralo aspoň šesť) a kto nezískal ani bod, klesne tiež' : ''}. Každý mesiac sa začína od nuly.</div>
          ${L.length ? `<div class="rk-tbl"><table><thead><tr><th>#</th><th>HRÁČ</th><th>BODY TENTO MESIAC</th><th></th></tr></thead><tbody>${L.map((o, i) => { const z = zone(o, i); return `<tr class="${RK.acct && o.n === RK.acct.nick ? 'me' : ''} ${z[0] ? 'z-' + z[0] : ''}"><td class="rk-pos">${i + 1}</td><td class="rk-nick">${avFace(o.n, o.emo, 'sm')}${dqEsc(o.n)}${lvTag(o.lv, true, sel)}</td><td class="rk-pts">${o.p}</td><td class="lg-z">${z[1]}</td></tr>`; }).join('')}</tbody></table></div>` : `<div class="rk-empty">${RK.rows ? 'V tejto lige zatiaľ nikto nie je.' : 'Načítavam…'}</div>`}`}
      </div>`;
    const tp = document.getElementById('rk-toprof'); if (tp) tp.onclick = () => startMode('profile');
    const gd = document.getElementById('rk-godc'); if (gd) gd.onclick = () => startMode('exam');
    document.getElementById('rk-refresh').onclick = () => { renderRank(card); rkLoad(); };
    card.querySelectorAll('.rk-chip').forEach(b => { b.onclick = () => { RK.view = b.dataset.v; renderRank(card); }; });
    card.querySelectorAll('[data-lg]').forEach(b => { b.onclick = () => { RK.lgSel = +b.dataset.lg; renderRank(card); }; });
    return;
  }
  const v = RK.view, rows = (RK.rows || []).map(r => {
    const M = r.mods || {}, o = { nick: r.nick, p: 0, c: 0, w: 0, s: 0, g: 0, v: 0 };
    (v === 'all' ? RK_MODS.map(x => x[0]) : [v]).forEach(m => { const x = M[m]; if (x) 'pcwsgv'.split('').forEach(f => { o[f] += x[f] || 0; }); });
    o.M = M; o.lg = r.lg; o.lv = rkLevel(rkTotal(r)).n; o.emo = r.emo;
    return o;
  }).filter(o => v === 'all' || o.p || o.c || o.w || o.s || o.g).sort((a, b) => b.p - a.p || b.c - a.c || a.nick.localeCompare(b.nick));
  const meI = RK.acct ? rows.findIndex(o => o.nick === RK.acct.nick) : -1, me = rows[meI];
  const acc = o => (o.c + o.w) ? Math.round(o.c / (o.c + o.w) * 100) + ' %' : '—';
  const cq = v === 'conquer', sj = v.indexOf('q_') === 0;
  const head = sj ? ['#', 'HRÁČ', 'SPRÁVNE', 'ODPOVEDE', 'ÚSPEŠNOSŤ'] : cq ? ['#', 'HRÁČ', 'BODY', 'HRY', 'VÝHRY', 'ODPOVEDE', 'ÚSPEŠNOSŤ', 'ČAS'] : v === 'all' ? ['#', 'HRÁČ', 'BODY', 'ODPOVEDE', 'ÚSPEŠNOSŤ', 'ČAS', 'HRY', 'VÝHRY'] : ['#', 'HRÁČ', 'BODY', 'ODPOVEDE', 'ÚSPEŠNOSŤ', 'ČAS'];
  const line = (o, i) => {
    const d = o.M.conquer || {};
    const cells = sj ? [o.c, o.c + o.w, acc(o)] : cq ? [o.p, o.g, o.v, o.c + o.w, acc(o), rkTime(o.s)] : v === 'all' ? [o.p, o.c + o.w, acc(o), rkTime(o.s), d.g || 0, d.v || 0] : [o.p, o.c + o.w, acc(o), rkTime(o.s)];
    return `<tr class="${i === meI ? 'me' : ''}"><td class="rk-pos">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td class="rk-nick">${o.lg ? `<i class="lg-dot" style="background:${LGC[o.lg]}" title="liga ${LG[o.lg]}"></i>` : ''}${avFace(o.nick, o.emo, 'sm')}${dqEsc(o.nick)}${lvTag(o.lv, true, o.lg)}</td>${cells.map((c, k) => `<td${k === 0 ? ' class="rk-pts"' : ''}>${c}</td>`).join('')}</tr>`;
  };
  let mine = '';
  if (me) {
    const all = (RK.rows.find(r => r.nick === RK.acct.nick) || {}).mods || {};
    const mx = Math.max(1, ...RK_MODS.map(x => (all[x[0]] || {}).s || 0));
    mine = `<div class="rk-me">
        <div class="rk-me-top"><div><b>${meI + 1}.</b><span>z ${rows.length} hráčov</span></div><div><b>${me.p}</b><span>bodov</span></div><div><b>${rkTime(me.s)}</b><span>čas tréningu</span></div><div><b>${acc(me)}</b><span>úspešnosť z ${me.c + me.w} odpovedí</span></div><div><b>${(all.conquer || {}).g || 0}</b><span>hier Dobyvateľa</span></div></div>
      </div>`;
  }
  card.innerHTML = `
    <div class="rk">
      <div class="rk-head"><div><h2>REBRÍČEK</h2><p>Body za správne odpovede, skúšky a Dobyvateľa. <a href="#" data-hp="rank">Ako sa počítajú ❓</a></p></div><button class="btn ghost" id="rk-refresh">${RK.loading ? 'NAČÍTAVAM…' : '↻ OBNOVIŤ'}</button></div>
      ${SB_ON ? '' : '<div class="rk-warn"><strong>SKÚŠOBNÝ REŽIM</strong> — rebríček ešte nie je pripojený na databázu. Účty a body sú zatiaľ len v tomto prehliadači a kolegovia ich nevidia.</div>'}
      ${RK.acct ? '' : '<div class="rk-acct in"><span>Nie si prihlásený — body sa ti nepočítajú a v rebríčku ťa nevidno.</span><div class="rk-acct-b"><button class="btn" id="rk-toprof">PRIHLÁSIŤ SA ▶</button></div></div>'}
      ${mine}
      <div class="rk-chips main">${rkTabsHTML('all')}</div>
      <label class="rk-pick"><span>ZOBRAZIŤ PORADIE V</span><select id="rk-sel"><option value="all"${v === 'all' ? ' selected' : ''}>Celkovo — všetky body</option><optgroup label="Moduly a hry">${RK_MODS.map(x => `<option value="${x[0]}"${v === x[0] ? ' selected' : ''}>${x[1]}</option>`).join('')}</optgroup><optgroup label="Okruhy teórie v Dobyvateľovi">${RK_SUBJ.map(x => `<option value="${x[0]}"${v === x[0] ? ' selected' : ''}>${x[1]}</option>`).join('')}</optgroup></select></label>
      ${sj ? '<div class="rk-note">Počítajú sa odpovede na otázky z tohto okruhu v Dobyvateľovi, v hre aspoň dvoch ľudí. Poradie je podľa počtu správnych odpovedí.</div>' : ''}
      ${RK.loadErr ? `<div class="rk-err">${dqEsc(RK.loadErr)}</div>` : ''}
      ${rows.length ? `<div class="rk-tbl rk-main"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(line).join('')}</tbody></table></div>`
        : `<div class="rk-empty">${RK.rows ? 'Zatiaľ tu nikto nemá body. Buď prvý.' : 'Načítavam rebríček…'}</div>`}
    </div>`;
  const tp = document.getElementById('rk-toprof'); if (tp) tp.onclick = () => startMode('profile');
  document.getElementById('rk-refresh').onclick = () => { renderRank(card); rkLoad(); };
  card.querySelectorAll('.rk-chip').forEach(b => { b.onclick = () => { RK.view = b.dataset.v; renderRank(card); }; });
  const sel = document.getElementById('rk-sel'); if (sel) sel.onchange = () => { RK.view = sel.value; renderRank(card); };
}
