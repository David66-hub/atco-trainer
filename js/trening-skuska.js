/* ============================================================
   OPAKOVANIE CEZ DNI · DNEŠNÝ TRÉNING · SKÚŠKA · PREHĽAD · HĽADANIE
   ------------------------------------------------------------
   Každá otázka má „priečinok" (0–5) a deň, kedy má prísť znova.
   Správna odpoveď ju posunie o priečinok ďalej (1, 3, 7, 14, 30 dní),
   nesprávna ju vráti na začiatok a príde hneď zajtra. Z toho sa
   skladá DNEŠNÝ TRÉNING naprieč všetkými modulmi.
   ============================================================ */
const SR_DAYS = [1, 3, 7, 14, 30];
function dayNow() { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }
function srUpdate(id, ok) {
  const r = state.sr[id] || { b: 0, due: 0 };
  if (ok) { r.due = dayNow() + SR_DAYS[Math.min(r.b, SR_DAYS.length - 1)]; r.b = Math.min(r.b + 1, SR_DAYS.length); }
  else { r.b = 0; r.due = dayNow() + 1; }
  state.sr[id] = r;
}
function modOfId(id) {
  const p = id.substring(0, 3);
  return { AC_: 'aircraft', AP_: 'airport', PX_: 'airport', CS_: 'callsign', WP_: 'waypoint', CO_: 'coord' }[p] || '';
}
const MOD_NAME = { aircraft: 'MOD 01 · Typy lietadiel', airport: 'MOD 02 · Letiská', callsign: 'MOD 03 · Volacie znaky', waypoint: 'MOD 04 · Body FRA', heading: 'MOD 05 · Hra na kurzy', coord: 'MOD 06 · Koordinácia' };

/* dočasne prepne filtre, zavolá staviteľa otázok a vráti všetko späť */
function withFilters(tmp, fn) {
  const F = state.filters, old = {}, keep = { ids: state.apAllIds, a: state.apNote, c: state.csNote, o: state.coNote };
  Object.keys(tmp).forEach(k => { old[k] = F[k]; F[k] = tmp[k]; });
  try { return fn(); }
  finally { Object.keys(old).forEach(k => { F[k] = old[k]; }); state.apAllIds = keep.ids; state.apNote = keep.a; state.csNote = keep.c; state.coNote = keep.o; }
}
/* všetky otázky všetkých modulov — základ pre tréning, skúšku a prehľad */
let POOL = null;
function poolAll() {
  if (POOL) return POOL;
  const P = {};
  P.aircraft = withFilters({ wake: 'all', acMode: 'id' }, buildAircraftQuestions);
  P.airport = withFilters({ airportCat: 'all', apMode: 'quiz', apWeak: false }, buildAirportQuestions)
    .concat(withFilters({ apMode: 'prefix', apPx: 'doc', apWeak: false }, buildAirportQuestions));
  /* z volačiek len tie zo simulátora — zvyšných 950 by tréning zahltilo */
  P.callsign = withFilters({ callsignCat: 'top', csLetter: 'all', csKind: 'all', csPack: 0, csDir: 'both', csWeak: false, csOrder: 'rand', csOnce: false }, buildCallsignQuestions);
  P.waypoint = withFilters({ wpMode: 'quiz', wpBorder: 'all', wpGrp: 'all' }, buildWaypointQuestions);
  P.coord = [];
  ['cop', 'freq', 'vert', 'level'].forEach(m => { P.coord = P.coord.concat(withFilters({ coMode: m, coNb: 'all', coWeak: false }, buildCoordQuestions)); });
  P.coord = P.coord.filter(q => q.sub !== 'click');
  return (POOL = P);
}
function poolById() {
  const P = poolAll(), by = {};
  Object.keys(P).forEach(m => P[m].forEach(q => { if (!by[q.id]) by[q.id] = q; }));
  return by;
}
function modProgress(m) {
  const P = poolAll()[m] || [], seen = {}, today = dayNow();
  let total = 0, done = 0, weak = 0, due = 0;
  P.forEach(q => {
    if (seen[q.id]) return; seen[q.id] = 1; total++;
    const r = state.sr[q.id];
    if (r && r.b >= 2) done++;
    if (r && r.due <= today) due++;
    if (state.mistakes[q.id] > 0) weak++;
  });
  return { total, done, weak, due };
}
/* v tréningu a skúške rozhoduje jedna spoločná obtiažnosť, inak nastavenie modulu */
function wantsChoice(q) {
  const F = state.filters;
  if (state.mode === 'daily' || state.mode === 'exam') return F.dAns === 'choice' && q.type !== 'waypoint';
  return (q.type === 'coord' && F.coAns === 'choice') || (q.type === 'aircraft' && F.acAns === 'choice') ||
    ((q.type === 'airport' || q.type === 'prefix') && F.apAns === 'choice') || (q.type === 'callsign' && F.csAns === 'choice');
}

/* ---------- DNEŠNÝ TRÉNING ---------- */
function buildDaily() {
  const P = poolAll(), by = poolById(), today = dayNow(), N = state.filters.dCount;
  if (state.drill) {   // precvičenie chýb: len to, čo mám zle, najčastejšie chyby prvé
    const L = Object.keys(state.mistakes).filter(id => by[id] && state.mistakes[id] > 0).sort((a, b) => state.mistakes[b] - state.mistakes[a]).slice(0, 40).map(id => by[id]);
    state.dailyInfo = { due: 0, weak: L.length, fresh: 0 };
    if (L.length) return shuffle(L);
    state.drill = false;
  }
  const due = Object.keys(state.sr).filter(id => by[id] && state.sr[id].due <= today).sort((a, b) => state.sr[a].due - state.sr[b].due).map(id => by[id]);
  const weak = Object.keys(state.mistakes).filter(id => by[id] && state.mistakes[id] > 0 && due.indexOf(by[id]) < 0).map(id => by[id]);
  /* najviac 70 % tvorí opakovanie, zvyšok je nová látka — inak by si sa nikdy nepohol ďalej */
  let list = due.concat(shuffle(weak)).slice(0, Math.ceil(N * 0.7));
  const fresh = {};
  ['callsign', 'airport', 'coord', 'waypoint', 'aircraft'].forEach(m => {
    let f = shuffle(P[m].filter(q => !state.sr[q.id] && list.indexOf(q) < 0));
    if (m === 'callsign') f.sort((a, b) => (b.data.freq || 1) - (a.data.freq || 1));   // najčastejšie volačky ako prvé
    fresh[m] = f;
  });
  const used = {}; list.forEach(q => { used[q.id] = 1; });
  for (let guard = 0; list.length < N && guard < 400; guard++) {
    const m = ['callsign', 'airport', 'coord', 'waypoint', 'aircraft'][guard % 5], q = fresh[m].shift();
    if (q && !used[q.id]) { used[q.id] = 1; list.push(q); }
  }
  state.dailyInfo = { due: due.length, weak: weak.length, fresh: list.length - Math.min(list.length, due.length + weak.length) };
  return shuffle(list);
}
function startCustom(list, mode) {
  examStop();
  if (typeof hgStop === 'function') hgStop();
  state.mode = mode || 'daily';
  state.queue = shuffle(list); state.index = 0; state.total = state.queue.length;
  state.correct = 0; state.wrong = 0; state.streak = 0; state.bestStreak = 0;
  state.current = state.queue[0] || null;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.mode === state.mode));
  renderFilters(); renderStats(); renderQuestion();
  window.scrollTo(0, 0);
}

/* ---------- SKÚŠKA: na čas, bez nápovedí, vyhodnotenie až na konci ---------- */
/* Skúška od v4.1: čas je daný počtom otázok (12 s na otázku, pri písaní 20 s), hranica úspechu 80 %.
   Body do rebríčka sa pripíšu až po dokončení: správna +3 (pri písaní +6), nesprávna alebo preskočená −2,
   bonus za 80 % = počet otázok, za 90 % dvojnásobok, za 100 % trojnásobok. Menej ako 0 sa nepripíše. */
const EXAM_PASS = 80;
/* DENNÁ VÝZVA (v4.9): každý deň tých istých 20 otázok pre všetkých (losuje ich dátum), pravidlá a body ako pri skúške.
   Každý má jeden pokus denne (v5.1.2). */
const DC_N = 20, DC_KEY = 'atcoTrainerV2.dailyDone';
function dcDay() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function dcRand(seed) { let h = 1779033703 ^ seed.length; for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
/* dnešná výzva: jeden pokus na deň. Záznam vzniká už pri štarte (started), po dokončení dostane výsledok;
   ak hráč dokončil výzvu na inom zariadení, povie to rebríček (r.dc). */
function dcDone() {
  const d = lsGet(DC_KEY, null); if (d && d.day === dcDay()) return d;
  const r = RK.acct ? (RK.rows || []).find(x => x.nick === RK.acct.nick) : null;
  return r && r.dc ? { day: dcDay(), pts: r.dc.p, pct: Math.round(r.dc.g / Math.max(1, r.dc.t) * 100), good: r.dc.g, total: r.dc.t } : null;
}
function dcTopHTML() {
  const L = (RK.rows || []).filter(r => r.dc).map(r => ({ n: r.nick, g: r.dc.g, t: r.dc.t, s: r.dc.s, p: r.dc.p })).sort((a, b) => b.g / b.t - a.g / a.t || a.s - b.s);
  if (!L.length) return '<div class="rk-empty">Dnes ešte výzvu nikto nedokončil — buď prvý.</div>';
  return `<div class="rk-tbl"><table><thead><tr><th>#</th><th>HRÁČ</th><th>SPRÁVNE</th><th>ČAS</th><th>BODY</th></tr></thead><tbody>${L.slice(0, 15).map((o, i) => `<tr class="${RK.acct && o.n === RK.acct.nick ? 'me' : ''}"><td class="rk-pos">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td class="rk-nick">${dqEsc(o.n)}</td><td class="rk-pts">${o.g} / ${o.t}</td><td>${examClock(o.s)}</td><td>+${o.p}</td></tr>`).join('')}</tbody></table></div>`;
}
function examSecs() { const F = state.filters; return DC_N * (F.dAns === 'type' ? 20 : 12); }
function examClock(sec) { return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
function examPoints(good, bad, total, typed) {
  const per = typed ? 6 : 3, pct = Math.round(good / Math.max(1, total) * 100);
  const bonus = pct >= 100 ? total * 3 : pct >= 90 ? total * 2 : pct >= EXAM_PASS ? total : 0;
  return { per, plus: good * per, minus: bad * 2, bonus, pct, pts: Math.max(0, good * per - bad * 2) + bonus };
}
function examStop() {
  if (state.exam && state.exam.iv) clearInterval(state.exam.iv);
  state.exam = null;
  document.body.classList.remove('exam-on');
}
function examBuild() {
  const P = poolAll(), R = dcRand('dc' + dcDay()), src = {};
  const sh = a => { a = a.slice().sort((x, y) => x.id < y.id ? -1 : x.id > y.id ? 1 : 0); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  ['aircraft', 'airport', 'callsign', 'coord'].forEach(m => { src[m] = sh(P[m]); });
  const list = [], used = {};
  for (let g = 0; list.length < DC_N && g < 1000; g++) {
    const q = src[['callsign', 'airport', 'coord', 'aircraft'][g % 4]].shift();
    if (q && !used[q.id]) { used[q.id] = 1; list.push(q); }
  }
  return list;
}
function examStart() {
  if (dcDone()) return renderExamStart(document.getElementById('qcard'));   // dnes už bola — druhý pokus nie je
  lsSet(DC_KEY, { day: dcDay(), started: 1 });
  examStop();
  state.queue = examBuild(); state.index = 0; state.total = state.queue.length;
  state.correct = 0; state.wrong = 0; state.streak = 0; state.bestStreak = 0;
  state.current = state.queue[0] || null;
  state.exam = { recs: [], t0: Date.now(), limit: examSecs() * 1000, typed: state.filters.dAns === 'type', applied: false, iv: 0 };
  state.exam.iv = setInterval(examTick, 250);
  renderStats(); renderQuestion(); examTick();
  window.scrollTo(0, 0);
}
function examTick() {
  const E = state.exam;
  if (!E || state.mode !== 'exam') return;
  const left = Math.max(0, E.limit - (Date.now() - E.t0)), s = Math.ceil(left / 1000);
  const lbl = document.getElementById('mode-label');
  if (state.current && lbl) lbl.textContent = 'VÝZVA · ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  if (left <= 0 && state.current) { E.timeout = true; state.index = state.queue.length; state.current = null; renderQuestion(); }
}
function examRecord(q, ok, shown) {
  state.exam.recs.push({ q, ok, shown });
  nextQuestion();
}
function examAnswerOf(q) { return q.type === 'aircraft' ? q.data.icao + ' — ' + q.data.name : String(q.correct || q.accept[0]); }
function examAsk(q) {
  if (q.type === 'aircraft') return 'Typ lietadla (fotka)';
  if (q.type === 'airport') return q.subtype === 'icao-to-city' ? q.data.icao + ' → mesto' : q.data.city + ' → kód';
  if (q.type === 'prefix') return q.subtype === 'code-to-state' ? q.data.p + ' → štát' : pxAsk(q.data) + ' → prefix';
  if (q.type === 'callsign') return q.subtype === 'icao-to-call' ? q.data.icao + ' → volačka' : '„' + q.data.call + '“ → kód';
  return q.label || q.id;
}
function renderExamStart(card) {
  const F = state.filters;
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = DC_N + ' otázok';
  document.getElementById('mode-label').textContent = 'DENNÁ VÝZVA';
  const done = dcDone();
  card.innerHTML = `
    <div class="home-hero">
      <div class="home-kicker">DENNÁ VÝZVA · ${new Date().toLocaleDateString('sk-SK')}</div>
      <h1>${DC_N} otázok, čas ${examClock(examSecs())}, každý deň nové.</h1>
      <p>Dnes majú všetci <strong>tých istých ${DC_N} otázok</strong>. Výsledok uvidíš až na konci, na úspech treba ${EXAM_PASS} %. Máš <strong>jeden pokus denne</strong>. <a href="#" data-hp="exam">Ako to funguje ❓</a></p>
      ${done ? `<div class="dc-fin"><i>${done.pts != null ? '✓' : '⏳'}</i><div><b>${done.pts != null ? 'Dnešnú výzvu máš hotovú' : 'Dnešnú výzvu si už začal'}</b><span>${done.pts != null ? `<strong>${done.pct} %</strong>${done.good != null ? ' · ' + done.good + ' z ' + (done.total || DC_N) + ' správne' : ''} · <strong>+${done.pts}</strong> bodov` : 'Pokus je len jeden — nedokončená výzva sa nedá spustiť znova.'}</span><small>Nová výzva príde o <u id="dc-left"></u>.</small></div></div>`
      : `<div class="exam-rules"><strong>BODY DO REBRÍČKA</strong>
        <span>správna odpoveď <b>+${F.dAns === 'type' ? 6 : 3}</b></span><span>nesprávna alebo preskočená <b>−2</b></span>
        <span>bonus za ${EXAM_PASS} % <b>+${DC_N}</b></span><span>za 90 % <b>+${DC_N * 2}</b></span><span>za 100 % <b>+${DC_N * 3}</b></span>
        <em>Máš <b>jeden pokus denne</b> — keď výzvu spustíš, treba ju dokončiť. Body sa pripíšu po dokončení${RK.acct ? '' : ' — a len prihláseným (tlačidlo PRIHLÁSIŤ vpravo hore)'}. Obtiažnosť si nastav v tabuľke dole; pri písaní je bodov dvakrát toľko.</em></div>
      <p><button class="btn" id="exam-go" style="padding:16px 34px;font-size:15px">SPUSTIŤ VÝZVU ▶</button></p>`}
      ${done ? '<p><button class="btn ghost" data-dcgo="daily">ÍSŤ NA DNEŠNÝ TRÉNING ▶</button> <button class="btn ghost" data-dcgo="rank">REBRÍČEK ▶</button></p>' : ''}
    </div>
    <div class="home-h">DNEŠNÉ PORADIE</div>${dcTopHTML()}`;
  if (!RK.rows && !RK.loading) rkLoad();
  const go = document.getElementById('exam-go'); if (go) go.onclick = examStart;
  card.querySelectorAll('[data-dcgo]').forEach(b => { b.onclick = () => { if (b.dataset.dcgo === 'rank') RK.view = 'dc'; startMode(b.dataset.dcgo); }; });
  const lf = document.getElementById('dc-left'); if (lf) { const n = new Date(), m = Math.round((new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1) - n) / 60000); lf.textContent = Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; }
}
function renderExamResult(card) {
  const E = state.exam;
  clearInterval(E.iv);
  const total = state.queue.length, good = E.recs.filter(r => r.ok).length, wrong = E.recs.filter(r => !r.ok);
  const pct = Math.round(good / Math.max(1, total) * 100), secs = Math.round(Math.min(E.limit, Date.now() - E.t0) / 1000);
  if (!E.applied) {
    /* až teraz sa výsledky zapíšu do opakovania a slabých miest */
    E.applied = true; E.secs = secs;
    E.recs.forEach(r => { srUpdate(r.q.id, r.ok); if (!r.ok) { state.mistakes[r.q.id] = (state.mistakes[r.q.id] || 0) + 1; wkLog(r.q, r.shown); } });
    apSaveProgress(); renderWeak();
    E.sc = examPoints(good, wrong.length, total, E.typed);
    const rec = lsGet(DC_KEY, null);
    E.first = !rec || rec.day !== dcDay() || rec.pts == null;
    if (E.first) {
      lsSet(DC_KEY, { day: dcDay(), pts: E.sc.pts, pct, good, total });
      if (RK.acct) {
        rkAdd('exam', { c: good, w: wrong.length, p: E.sc.pts }); rkPendSave();
        rkFlush().then(() => rkRpc('atco_daily_submit', { p_token: RK.acct.token, p_good: good, p_total: total, p_secs: secs, p_pts: E.sc.pts })).catch(() => {}).then(() => rkLoad());
      }
    }
  }
  document.getElementById('qnum').textContent = E.recs.length;
  document.getElementById('qtotal').textContent = total;
  document.getElementById('mode-label').textContent = 'DENNÁ VÝZVA · VÝSLEDOK';
  const byMod = {};
  E.recs.forEach(r => { const m = modOfId(r.q.id); (byMod[m] = byMod[m] || [0, 0])[r.ok ? 0 : 1]++; });
  card.innerHTML = `
    <div class="session-done" style="padding-bottom:10px">
      <h2>${E.timeout ? 'ČAS VYPRŠAL' : 'VÝZVA DOKONČENÁ'} · <span class="${pct >= EXAM_PASS ? 'exam-ok' : 'exam-no'}">${pct >= EXAM_PASS ? 'PREŠIEL SI' : 'NEPREŠIEL SI'}</span></h2>
      <div class="score-big">${pct}%</div>
      <p>${good} z ${total} správne · čas ${Math.floor(E.secs / 60)}:${String(E.secs % 60).padStart(2, '0')}${E.recs.length < total ? ' · nezodpovedané: ' + (total - E.recs.length) : ''} · hranica ${EXAM_PASS} %</p>
      <div class="exam-rules res"><strong>${!E.first ? 'TRÉNINGOVÝ POKUS — BODY SA NEPOČÍTAJÚ (' + E.sc.pts + ')' : RK.acct ? 'DO REBRÍČKA +' + E.sc.pts + ' BODOV' : 'BODY: ' + E.sc.pts + ' — NEPRIPÍSANÉ, NIE SI PRIHLÁSENÝ'}</strong>
        <span>${good} správnych × ${E.sc.per} <b>+${E.sc.plus}</b></span><span>${wrong.length} nesprávnych × 2 <b>−${E.sc.minus}</b></span><span>bonus za ${pct} % <b>+${E.sc.bonus}</b></span></div>
    </div>
    <div class="home-tips">${Object.keys(byMod).map(m => `<div><strong>${MOD_NAME[m]}</strong>${byMod[m][0]} správne, ${byMod[m][1]} zle</div>`).join('')}</div>
    <div class="home-h">${wrong.length ? 'CHYBY (' + wrong.length + ')' : 'BEZ CHYBY'}</div>
    <div class="exam-list">${wrong.map(r => `<div><span>${examAsk(r.q)}</span><s>${String(r.shown || '—').replace(/</g, '&lt;')}</s><b>${examAnswerOf(r.q)}</b></div>`).join('')}</div>
    <div class="blind-actions" style="justify-content:center;margin-top:20px">
      ${wrong.length ? '<button class="btn" id="exam-fix">PRECVIČIŤ CHYBY ▶</button>' : ''}
      <button class="btn ghost" id="exam-again">SPÄŤ NA VÝZVU</button>
    </div>`;
  const fix = document.getElementById('exam-fix');
  if (fix) fix.onclick = () => startCustom(wrong.map(r => r.q), 'daily');
  document.getElementById('exam-again').onclick = () => startMode('exam');
}

/* ---------- ÚVOD: prehľad pokroku a vyhľadávanie ---------- */
/* ============================================================
   v5.0 — úspechy (jeden výpočet), oznam o novom úspechu, týždenné úlohy, zvuky a oslavy
   ============================================================ */
function achCompute() {
  const mine = ((RK.rows || []).find(r => r.nick === RK.acct.nick) || {}).mods || {}, g = m => Object.assign({ p: 0, c: 0, w: 0, s: 0, g: 0, v: 0 }, mine[m] || {}), T = { p: 0, c: 0, w: 0, s: 0 };
  RK_MODS.forEach(x => { const a = g(x[0]); 'pcws'.split('').forEach(f => { T[f] += a[f]; }); });
  const cq = g('conquer'), ex = g('exam'), frOk = SOC.friends.filter(f => f.st === 'ok');
    const dayK = t => t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'), dby = {}; (RK.days || []).forEach(d => { dby[String(d.d).slice(0, 10)] = d.p || 0; });
    let streak = 0; for (let i = dby[dayK(new Date())] ? 0 : 1; i < 28; i++) { if (dby[dayK(new Date(Date.now() - i * 86400000))]) streak++; else break; }
    let week = 0; for (let i = 0; i < 7; i++) week += dby[dayK(new Date(Date.now() - i * 86400000))] || 0;
    const meRow = (RK.rows || []).find(x => x.nick === RK.acct.nick), lgN = meRow && meRow.lg ? meRow.lg : 1, inLg = (RK.rows || []).filter(x => (x.lg || 1) === lgN).sort((x, y) => (y.mp || 0) - (x.mp || 0) || x.nick.localeCompare(y.nick)), lgPos = inLg.findIndex(x => x.nick === RK.acct.nick) + 1;
    const terr = rkmOwners().map((o, i) => o.top && o.top.r.nick === RK.acct.nick ? RKM[i] : null).filter(Boolean), terrBig = rkmOwners().filter(o => o.top && o.top.r.nick === RK.acct.nick && o.top.p >= 100).length, myBest = Math.max(0, ...RK_MODS.map(x => g(x[0]).p)), nfo = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const mods6 = ['aircraft', 'airport', 'callsign', 'waypoint', 'heading', 'coord'].filter(m => g(m).p > 0).length, ans = T.c + T.w, accN = ans ? Math.round(T.c / ans * 100) : 0;
    /* úspechy: [ikona, názov, čo treba spraviť, koľko mám, koľko treba, vlastný text stavu] — počítajú sa z bodov, hier, času a ligy, ktoré už účet má */
    const ACH = [['🎯', 'Prvá stovka', 'Získaj spolu 100 bodov', T.p, 100], ['💯', 'Tisícka', 'Získaj spolu 1 000 bodov', T.p, 1000], ['🚀', 'Desaťtisíc', 'Získaj spolu 10 000 bodov', T.p, 10000],
      ['⚔', 'Prvý boj', 'Dohraj jednu hru Dobyvateľa s iným človekom', cq.g, 1, cq.g ? '' : 'zatiaľ žiadna hra'], ['👑', 'Prvá výhra', 'Vyhraj hru Dobyvateľa', cq.v, 1, cq.v ? '' : 'zatiaľ žiadna výhra'], ['🏅', 'Päť výhier', 'Vyhraj päť hier Dobyvateľa', cq.v, 5],
      ['📅', 'Denná výzva', 'Dokonči jednu dennú výzvu (všetkých 20 otázok)', ex.c + ex.w >= 20 ? 1 : 0, 1, 'ešte si žiadnu nedokončil'], ['🔥', 'Týždeň v kuse', 'Získaj body 7 dní po sebe', streak, 7],
      ['🧠', 'Ostrostrelec', 'Maj úspešnosť aspoň 90 % pri najmenej 200 odpovediach', ans >= 200 ? accN : 0, 90, ans < 200 ? 'máš ' + ans + ' z 200 odpovedí' : 'máš ' + accN + ' %, treba 90 %'],
      ['⏱', 'Hodina', 'Trénuj spolu 1 hodinu', Math.floor(T.s / 60), 60, Math.floor(T.s / 60) + ' z 60 minút'], ['🕙', 'Desať hodín', 'Trénuj spolu 10 hodín', Math.floor(T.s / 3600), 10, Math.floor(T.s / 3600) + ' z 10 hodín'],
      ['🧩', 'Všestranný', 'Získaj body vo všetkých šiestich moduloch MOD 01 – 06', mods6, 6, mods6 + ' zo 6 modulov'], ['🗺', 'Dobyvateľ územia', 'Drž oblasť na mape: maj v module najviac bodov zo všetkých a aspoň 100', terrBig, 1, terr.length ? 'oblasť držíš, ale treba v nej aspoň 100 bodov' : 'zatiaľ nedržíš žiadnu oblasť'],
      ['🤝', 'Parťák', 'Pridaj si priateľa a nech ťa potvrdí', frOk.length, 1, 'zatiaľ žiadny priateľ'], ['🥈', 'Striebro', 'Postúp z ligy Bronz do ligy Striebro (prví traja na konci mesiaca)', lgN >= 2 ? 1 : 0, 1, 'si v lige ' + LG[lgN]],
      ['🛫', 'Na veži', 'Dosiahni LVL 6 — Stážista OJT TWR (1 500 bodov)', rkLevel(T.p).n >= 6 ? 1 : 0, 1, 'si LVL ' + rkLevel(T.p).n + ', treba LVL 6']];
    const got = ACH.filter(x => x[3] >= x[4]).length;
  return { ACH, got, streak, week, lgN, lgPos, meRow, terr, nfo: nfo };
}
/* nový úspech → oznam vpravo hore, konfety a zvuk; pri prvom načítaní sa len zapamätá, čo už hráč má */
function achCheck() {
  if (!RK.acct || !RK.rows || !RK.rows.some(r => r.nick === RK.acct.nick) || SOC.ok !== true || !RK.days) return;   // až keď sú načítaní priatelia aj aktivita — inak by sa „nový“ úspech hlásil omylom
  const k = 'atcoTrainerV2.ach:' + RK.acct.nick.toLowerCase(), had = lsGet(k, null), A = achCompute().ACH.filter(x => x[3] >= x[4]), names = A.map(x => x[1]);
  if (had) A.filter(x => had.indexOf(x[1]) < 0).slice(0, 3).forEach((x, i) => setTimeout(() => fxToast('NOVÝ ÚSPECH', x[0] + ' ' + x[1], x[2]), i * 900));
  if (!had || names.some(n => had.indexOf(n) < 0)) lsSet(k, names.concat((had || []).filter(n => names.indexOf(n) < 0)));
}
function fxToast(small, title, text) {
  let box = document.getElementById('soc-toasts'); if (!box) { box = document.createElement('div'); box.id = 'soc-toasts'; document.body.appendChild(box); }
  const el = document.createElement('div'); el.className = 'soc-toast k-level k-ach';
  el.innerHTML = `<small>${dqEsc(small)}</small><b>${dqEsc(title)}</b><span>${dqEsc(text)}</span>`;
  el.onclick = () => el.remove(); box.appendChild(el); setTimeout(() => el.remove(), 9000);
  fxConfetti(26); sndPlay('win');
}
function fxConfetti(n) {
  if (typeof dqLow === 'function' && dqLow()) return;
  const w = document.createElement('div'); w.className = 'fx-conf';
  w.innerHTML = Array.from({ length: n || 20 }, (x, i) => `<i style="left:${Math.round(Math.random() * 100)}%;background:${['#19d488', '#3a86ff', '#ffbe0b', '#e63946', '#b45cff'][i % 5]};animation-delay:${(Math.random() * 0.35).toFixed(2)}s;--r:${Math.round(Math.random() * 360)}deg;--x:${Math.round(Math.random() * 120 - 60)}px"></i>`).join('');
  document.body.appendChild(w); setTimeout(() => w.remove(), 2300);
}
/* zvuky: krátke tóny cez WebAudio, dajú sa vypnúť v profile (VZHĽAD) */
const SND = { on: (() => { try { return localStorage.getItem('atcoTrainerV2.snd') !== '0'; } catch (e) { return true; } })(), ctx: null };   // lsGet tu ešte neexistuje (je v neskoršom súbore)
function sndPlay(kind) {
  if (!SND.on) return;
  try {
    const C = SND.ctx || (SND.ctx = new (window.AudioContext || window.webkitAudioContext)()); if (C.state === 'suspended') C.resume();
    const N = kind === 'ok' ? [[660, 0, 0.09], [990, 0.08, 0.14]] : kind === 'no' ? [[196, 0, 0.2]] : [[523, 0, 0.1], [659, 0.09, 0.1], [784, 0.18, 0.1], [1047, 0.27, 0.22]];
    N.forEach(x => { const o = C.createOscillator(), g = C.createGain(), t = C.currentTime + x[1]; o.type = kind === 'no' ? 'triangle' : 'sine'; o.frequency.value = x[0]; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(kind === 'no' ? 0.09 : 0.07, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + x[2]); o.connect(g); g.connect(C.destination); o.start(t); o.stop(t + x[2] + 0.02); });
  } catch (e) {}
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('#pf-snd'); if (!b) return; SND.on = !SND.on; lsSet('atcoTrainerV2.snd', SND.on ? 1 : 0); b.classList.toggle('on', SND.on); b.textContent = 'ZVUKY: ' + (SND.on ? 'ZAPNUTÉ' : 'VYPNUTÉ'); if (SND.on) sndPlay('ok'); });
/* počítadlá v paneli: správna → tón, zlá → tón, každá piata v sérii → malá oslava; pás postupu sa riadi číslom otázky */
(function () {
  const num = id => { const e = document.getElementById(id); return e ? parseInt(e.textContent, 10) : NaN; }, last = { c: 0, w: 0, s: 0 };
  const watch = (id, fn) => { const e = document.getElementById(id); if (e) new MutationObserver(fn).observe(e, { childList: true, characterData: true, subtree: true }); };
  watch('stat-correct', () => { const v = num('stat-correct'); if (v === last.c + 1) sndPlay('ok'); last.c = isNaN(v) ? 0 : v; });
  watch('stat-wrong', () => { const v = num('stat-wrong'); if (v === last.w + 1) sndPlay('no'); last.w = isNaN(v) ? 0 : v; });
  watch('stat-streak', () => { const v = num('stat-streak'); if (v > last.s && v > 0 && v % 5 === 0) { fxConfetti(14); setTimeout(() => sndPlay('win'), 160); } last.s = isNaN(v) ? 0 : v; });
  const pg = () => { const p = document.getElementById('pg'); if (!p) return; const n = num('qnum'), t = num('qtotal'), ok = isFinite(n) && isFinite(t) && t > 0 && getComputedStyle(document.getElementById('qcount')).display !== 'none'; p.classList.toggle('on', !!ok); if (ok) p.firstElementChild.style.width = Math.max(0, Math.min(100, (n - 1) / t * 100)).toFixed(1) + '%'; };
  watch('qnum', pg); watch('qtotal', pg); watch('mode-label', pg);
})();
/* ---------- týždenné úlohy: počítajú sa z aktivity od pondelka; za každú splnenú +50 bodov ---------- */
function wkWeek() { const d = new Date(), wd = (d.getDay() + 6) % 7, m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - wd), k = t => t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); return { id: k(m), days: Array.from({ length: wd + 1 }, (x, i) => k(new Date(m.getFullYear(), m.getMonth(), m.getDate() + i))), left: 6 - wd }; }
const WKS = { data: null, t: 0, off: false };
/* stav úloh zo servera (doplnok v53); kým ho databáza nemá, počíta sa z aktivity v tomto zariadení */
function wkLoad(force) {
  if (!RK.acct || WKS.off || (!force && Date.now() - WKS.t < 60000)) return Promise.resolve();
  WKS.t = Date.now();
  return rkRpc('atco_weekly', { p_token: RK.acct.token }).then(d => { WKS.data = d; wkPaint(); }).catch(e => { if (/atco_weekly|PGRST202|schema cache/i.test(String(e && e.message))) WKS.off = true; });
}
function wkPaint() { const w = document.getElementById('wkt'), slot = document.getElementById('home-wkt'); if (w) w.outerHTML = wkTasksHTML(); else if (slot && state.mode === 'home') slot.innerHTML = wkTasksHTML(); }
function wkTasks() {
  if (!RK.acct) return null;
  const mk = (W, v, done) => ({ W, done, srv: !!WKS.data, list: [['pts', '⭐', 'Získaj 500 bodov', v.pts, 500], ['days', '📆', 'Buď aktívny 4 dni', v.days, 4], ['ok', '✅', 'Odpovedz správne 150-krát', v.ok, 150], ['time', '⏱', 'Trénuj 45 minút', v.mins, 45]] });
  if (WKS.data) { const d = WKS.data, done = {}; (d.done || []).forEach(t => { done[t] = 1; }); return mk({ id: d.week, left: d.left }, d, done); }
  if (!RK.days) return null;
  const W = wkWeek(), by = {}; RK.days.forEach(d => { by[String(d.d).slice(0, 10)] = d; });
  const sum = f => W.days.reduce((a, k) => a + ((by[k] || {})[f] || 0), 0);
  const st = lsGet('atcoTrainerV2.wk:' + RK.acct.nick.toLowerCase(), {});
  return mk(W, { pts: sum('p'), days: W.days.filter(k => (by[k] || {}).p > 0).length, ok: sum('c'), mins: Math.floor(sum('s') / 60) }, st.week === W.id ? st.done || {} : {});
}
function wkTasksHTML() {
  const X = wkTasks(); if (!X) return '';
  const nf = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `<div class="wkt" id="wkt"><div class="wkt-h"><h3>ÚLOHY TÝŽDŇA</h3><span>${X.W.left === 0 ? 'končia dnes' : X.W.left === 1 ? 'ešte 1 deň' : 'ešte ' + X.W.left + ' ' + (X.W.left < 5 ? 'dni' : 'dní')} · za každú <b>+50 bodov</b></span></div>
      <div class="wkt-g">${X.list.map(t => { const ok = t[3] >= t[4], got = X.done[t[0]]; return `<div class="${got ? 'got' : ok ? 'ok' : ''}"><i>${t[1]}</i><div><b>${t[2]}</b><s><em style="width:${Math.min(100, Math.round(t[3] / t[4] * 100))}%"></em></s><small>${nf(Math.min(t[3], t[4]))} z ${nf(t[4])}</small></div>${got ? '<u>✓ +50</u>' : ok ? `<button class="btn" data-wkclaim="${t[0]}">VZIAŤ +50</button>` : ''}</div>`; }).join('')}</div></div>`;
}
document.addEventListener('click', async e => {
  const b = e.target.closest && e.target.closest('[data-wkclaim]'); if (!b || !RK.acct || b.disabled) return;
  const X = wkTasks(), t = X && X.list.find(x => x[0] === b.dataset.wkclaim); if (!t || t[3] < t[4] || X.done[t[0]]) return;
  b.disabled = true;
  if (X.srv) {
    try { const r = await rkRpc('atco_weekly_claim', { p_token: RK.acct.token, p_task: t[0] }); WKS.data = r.state; if (r.new) fxToast('ÚLOHA TÝŽDŇA SPLNENÁ', '+50 bodov', t[2]); rkLoad(); }
    catch (er) { b.disabled = false; return; }
  } else {
    X.done[t[0]] = 1; lsSet('atcoTrainerV2.wk:' + RK.acct.nick.toLowerCase(), { week: X.W.id, done: X.done });
    rkAdd('daily', { p: 50 }); rkPendSave(); rkFlush().then(() => rkLoad());
    fxToast('ÚLOHA TÝŽDŇA SPLNENÁ', '+50 bodov', t[2]);
  }
  wkPaint();
});
/* ============================================================
   v5.2 — MOD 07 až 12 na jednom spoločnom jadre (GQ): Teória, Rozstupy za turbulenciou,
   METAR, Frazeológia, Počty z hlavy, Skratky. Každý modul len vyrába otázky
   { id?, cat, big?, prompt, sub?, opts[], ans, exp?, img? }; o zobrazenie, body a chyby sa stará jadro.
   Zdroje: ICAO Doc 4444 (rozstupy), Annex 3 (METAR), Annex 10 zv. II a Doc 9432 (frazeológia), Doc 8400 (skratky).
   ============================================================ */
const GQ = { st: null, M: {
  theory: { tag: 'MOD 07', name: 'TEÓRIA', subs: [['all', 'VŠETKY OKRUHY'], ['atm', 'ATM'], ['nav', 'NAVIGÁCIA'], ['met', 'METEOROLÓGIA'], ['eqps', 'ZARIADENIA'], ['hum', 'ĽUDSKÉ FAKTORY'], ['acft', 'LIETADLÁ'], ['pen', 'PRAC. PROSTREDIE'], ['law', 'LETECKÉ PRÁVO'], ['hist', 'HISTÓRIA'], ['gen', 'VŠEOBECNÝ PREHĽAD']], gen: gqTheory, pool: true },
  wake: { tag: 'MOD 08', name: 'ROZSTUPY ZA TURBULENCIOU', subs: [['dist', 'RADAROVÝ ROZSTUP (NM)'], ['time', 'ČASOVÝ ROZSTUP PRI PRISTÁTÍ'], ['cat', 'KATEGÓRIA TYPU']], gen: gqWake },
  metar: { tag: 'MOD 09', name: 'METAR', subs: [['read', 'ČÍTANIE SPRÁVY'], ['code', 'ČO ZNAMENÁ KÓD']], gen: gqMetar },
  phrase: { tag: 'MOD 10', name: 'FRAZEOLÓGIA', subs: [['word', 'ŠTANDARDNÉ SLOVÁ'], ['abc', 'HLÁSKOVANIE'], ['num', 'ČÍSLA'], ['rb', 'ČO SA POTVRDZUJE']], gen: gqPhrase, pool: true },
  calc: { tag: 'MOD 11', name: 'POČTY Z HLAVY', subs: [['all', 'VŠETKO'], ['tl', 'PREVODNÁ HLADINA'], ['td', 'ČAS A VZDIALENOSŤ'], ['des', 'KLESANIE'], ['unit', 'JEDNOTKY A ODHADY']], gen: gqCalc },
  abbr: { tag: 'MOD 12', name: 'SKRATKY', subs: [['a2m', 'SKRATKA → VÝZNAM'], ['m2a', 'VÝZNAM → SKRATKA'], ['q', 'Q-KÓDY'], ['px', 'PREFIXY ŠTÁTOV'], ['reg', 'REGISTRAČNÉ ZNAČKY']], gen: gqAbbr, pool: true } } };
const GQ_SUBK = 'atcoTrainerV2.gqSub', GQ_WK = 'atcoTrainerV2.gqWeak', GQ_ANSK = 'atcoTrainerV2.gqAns';
function gqR(a) { return a[Math.floor(Math.random() * a.length)]; }
function gqInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function gqHash(t) { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
/* z správnej odpovede a zoznamu ostatných spraví štyri možnosti */
function gqMk(cat, prompt, right, others, extra) {
  const seen = {}; seen[right] = 1; const W = shuffle(others.filter(x => { if (x == null || seen[x]) return false; seen[x] = 1; return true; })).slice(0, 3), opts = shuffle([right].concat(W));
  return Object.assign({ cat, prompt, opts, ans: opts.indexOf(right) }, extra || {});
}
function gqNum(cat, prompt, val, unit, steps, extra) {
  const f = v => String(v).replace('.', ',') + (unit ? ' ' + unit : ''), o = []; shuffle(steps).forEach(d => { const v = +(val + d).toFixed(2); if ((v > 0 || unit === '°C') && v !== val) o.push(f(v)); });
  return gqMk(cat, prompt, f(val), o, Object.assign({ num: { val, unit: unit || '', tol: 0 } }, extra));
}
/* porovnanie písanej odpovede: bez diakritiky, medzier a interpunkcie, veľkými písmenami */
function gqNorm(t) { return String(t == null ? '' : t).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9+\-\/]/g, ''); }
function gqParse(t) { const m = String(t).replace(/\s/g, '').replace(',', '.').replace('−', '-').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : NaN; }
/* ---------- MOD 07 · TEÓRIA: okruhy z banky + otázky s fotkou ---------- */
const GQ_SETN = { atm: 'ATM', nav: 'NAVIGÁCIA', met: 'METEOROLÓGIA', eqps: 'ZARIADENIA A SYSTÉMY', hum: 'ĽUDSKÉ FAKTORY', acft: 'LIETADLÁ', pen: 'PRACOVNÉ PROSTREDIE', law: 'LETECKÉ PRÁVO', hist: 'HISTÓRIA LETECTVA', gen: 'VŠEOBECNÝ PREHĽAD' };
function gqTheory(sub, weak) {
  let sets = (sub === 'all' ? Object.keys(GQ_SETN) : [sub]).filter(k => DQ_BANK[k] && DQ_BANK[k].length); if (!sets.length) sets = ['gen'];
  if (weak && weak.length) { const id = gqR(weak), p = id.split(':'), c = (DQ_BANK[p[1]] || []).find(x => gqHash(x.q) === p[2]); if (c) return gqMk('OKRUH · ' + GQ_SETN[p[1]], c.q, c.a, c.w, { id }); }
  /* veľký okruh padá častejšie než malý */
  const tot = sets.reduce((a, k) => a + DQ_BANK[k].length, 0); let r = Math.random() * tot, k = sets[0]; for (const x of sets) { if ((r -= DQ_BANK[x].length) < 0) { k = x; break; } }
  const X = GQ_X.filter(x => x.s === k);
  if (X.length && Math.random() < Math.min(0.45, X.length * 4 / DQ_BANK[k].length + 0.12)) return gqFromX(gqR(X));
  const IQ = DQ_IMGQ[k];
  if (IQ && Math.random() < IQ.p) { const g = gqR(IQ.g), it = gqR(g.it); return gqMk('OKRUH · ' + GQ_SETN[k], g.q, it[1], g.it.map(x => x[1]), { img: it[0], id: 'th:' + k + ':i' + gqHash(it[0]) }); }
  const c = gqR(DQ_BANK[k]);
  return gqMk('OKRUH · ' + GQ_SETN[k], c.q, c.a, c.w, Object.assign({ id: 'th:' + k + ':' + gqHash(c.q) }, gqAuto(c)));
}
/* ============================================================
   v5.3 — PESTRÉ OTÁZKY: písacie (t), číselné (n) a s výberom (a + w), s vysvetlením (e).
   Námety sú z učebných materiálov, znenie je vlastné a každý údaj je overený vo verejnom predpise:
   ICAO Doc 4444, Annex 2/3/10/11/14, nariadenie (EÚ) 923/2012 (SERA) a 2015/340.
   s = okruh, q = otázka, t = uznané písané odpovede (prvá sa ukáže ako správna), n = číslo, u = jednotka, tol = tolerancia
   ============================================================ */
const GQ_X = [
  /* ATM — spojenie, pravidlá, rozstupy */
  { s: 'atm', q: 'Akú príponu má vo volacom znaku oblastné stredisko riadenia?', t: ['CONTROL'], w: ['RADAR', 'CENTRE', 'AREA'], e: 'Názov miesta + CONTROL, napr. „Bratislava Control“.' },
  { s: 'atm', q: 'Akú príponu má vo volacom znaku približovacie stanovište riadenia?', t: ['APPROACH'], w: ['ARRIVAL', 'RADAR', 'DIRECTOR'], e: 'Názov miesta + APPROACH. ARRIVAL a DEPARTURE sú radarové stanovištia príletov a odletov.' },
  { s: 'atm', q: 'Akú príponu má vo volacom znaku letisková riadiaca veža?', t: ['TOWER'], w: ['GROUND', 'AIRPORT', 'CONTROL'], e: 'Názov miesta + TOWER.' },
  { s: 'atm', q: 'Akú príponu má stanovište, ktoré riadi pohyby na zemi?', t: ['GROUND'], w: ['APRON', 'TAXI', 'TOWER'], e: 'GROUND riadi rolovanie po prevádzkovej ploche; APRON je riadenie na odbavovacej ploche.' },
  { s: 'atm', q: 'Akú príponu má stanovište, ktoré vydáva odletové povolenia?', t: ['DELIVERY'], w: ['CLEARANCE', 'GROUND', 'DEPARTURE'], e: 'Clearance delivery — vo volacom znaku len DELIVERY.' },
  { s: 'atm', q: 'Akú príponu má vo volacom znaku letová informačná služba?', t: ['INFORMATION'], w: ['RADIO', 'FIS', 'ADVISORY'], e: 'Napr. „Bratislava Information“.' },
  { s: 'atm', q: 'Akú príponu má letecká stanica (napr. AFIS)?', t: ['RADIO'], w: ['INFORMATION', 'TOWER', 'AFIS'], e: 'Letecká stanica bez služby riadenia používa príponu RADIO.' },
  { s: 'atm', q: 'Ktorým slovom sa začína tiesňová správa?', t: ['MAYDAY'], w: ['PAN PAN', 'EMERGENCY', 'SOS'], e: 'MAYDAY (najlepšie trikrát) — hrozí vážne a bezprostredné nebezpečenstvo a treba okamžitú pomoc.' },
  { s: 'atm', q: 'Ktorým signálom sa začína naliehavostná správa?', t: ['PAN PAN', 'PANPAN', 'PAN'], w: ['MAYDAY', 'URGENT', 'ALERT'], e: 'PAN PAN — stav týkajúci sa bezpečnosti, ktorý nevyžaduje okamžitú pomoc.' },
  { s: 'atm', q: 'Koľko slov za minútu má byť najvyššia rýchlosť reči pri vysielaní?', n: 100, u: 'slov/min', tol: 0, w: [60, 80, 120, 150], e: 'ICAO Annex 10 zv. II: rýchlosť reči nemá presiahnuť 100 slov za minútu.' },
  { s: 'atm', q: 'Koľko sekúnd smie najviac trvať skúšobné vysielanie?', n: 10, u: 's', tol: 0, w: [5, 15, 20, 30], e: 'Skúšobné vysielanie nemá presiahnuť 10 sekúnd.' },
  { s: 'atm', q: 'Ktorý stupeň čitateľnosti znamená „čitateľné, ale s ťažkosťami“?', n: 3, u: '', tol: 0, w: [1, 2, 4, 5], e: 'Stupnica 1 – 5: 1 nečitateľné, 2 občas, 3 s ťažkosťami, 4 čitateľné, 5 dokonale čitateľné.' },
  { s: 'atm', q: 'Ktorá kategória správ má v leteckej pohyblivej službe najvyššiu prednosť?', a: 'Tiesňové správy', w: ['Meteorologické správy', 'Správy o pravidelnosti letov', 'Správy o bezpečnosti letu'], e: 'Poradie: tieseň, naliehavosť, zameriavanie, bezpečnosť letu, meteorologické správy, pravidelnosť letov.' },
  { s: 'atm', q: 'Nad zastavaným územím nesmie let VFR klesnúť pod koľko stôp nad najvyššou prekážkou?', n: 1000, u: 'ft', tol: 0, w: [500, 1500, 2000], e: 'SERA.5005(f): 300 m (1 000 ft) nad najvyššou prekážkou v okruhu 600 m od lietadla.' },
  { s: 'atm', q: 'V akom okruhu od lietadla (v metroch) sa pri tejto výške nad zastavaným územím berie najvyššia prekážka?', n: 600, u: 'm', tol: 0, w: [150, 300, 1000, 1500], e: 'SERA.5005(f): okruh 600 m od lietadla.' },
  { s: 'atm', q: 'Mimo zastavaného územia nesmie let VFR klesnúť pod koľko stôp nad zemou alebo vodou?', n: 500, u: 'ft', tol: 0, w: [300, 1000, 1500], e: 'SERA.5005(f): 150 m (500 ft).' },
  { s: 'atm', q: 'Akú najmenšiu vodorovnú vzdialenosť od oblakov treba dodržať za VMC v riadenom priestore?', n: 1500, u: 'm', tol: 0, w: [300, 1000, 5000], e: 'SERA.5001: 1 500 m vodorovne a 300 m (1 000 ft) zvislo.' },
  { s: 'atm', q: 'Na aké najmenšie minimum možno znížiť radarový rozstup 5 NM, ak to výkon prehľadového systému dovoľuje?', n: 3, u: 'NM', tol: 0, w: [2, 2.5, 4], e: 'Doc 4444, 8.7.3.2: základné minimum je 5 NM, možno ho znížiť najviac na 3 NM (a na konečnom priblížení za podmienok na 2,5 NM).' },
  { s: 'atm', q: 'Od ktorej letovej hladiny sa začína priestor RVSM?', n: 290, u: 'FL', tol: 0, w: [245, 285, 300, 410], e: 'RVSM platí medzi FL 290 a FL 410 vrátane; rozstup je tam 1 000 ft namiesto 2 000 ft.' },
  { s: 'atm', q: 'Koľko minút je rozstup za turbulenciou pre LIGHT alebo MEDIUM, ktoré vzlieta za HEAVY z toho istého miesta dráhy?', n: 2, u: 'min', tol: 0, w: [1, 3, 4], e: 'Doc 4444, 5.8.3.1: za HEAVY 2 minúty; pri vzlete z medziľahlej časti dráhy 3 minúty.' },
  { s: 'atm', q: 'A koľko minút, ak druhé lietadlo vzlieta z medziľahlej časti tej istej dráhy za HEAVY?', n: 3, u: 'min', tol: 0, w: [2, 4, 5], e: 'Doc 4444, 5.8.3.3: vzlet z medziľahlej časti dráhy — za HEAVY 3 minúty, za SUPER 4 minúty.' },
  { s: 'atm', q: 'Pod akou výškou základne oblačnosti (ft) sa v CTR nepovolí vzlet ani pristátie zvláštneho letu VFR?', n: 600, u: 'ft', tol: 0, w: [300, 500, 1000, 1500], e: 'SERA.5010: dohľadnosť pri zemi pod 1 500 m alebo základňa oblačnosti pod 180 m (600 ft).' },
  /* METEOROLÓGIA */
  { s: 'met', q: 'O koľko °C klesá teplota na každých 100 m výšky podľa štandardnej atmosféry ISA?', n: 0.65, u: '°C', tol: 0.01, w: [0.5, 1, 0.3, 2], e: 'ISA: 0,65 °C na 100 m, čo sú zhruba 2 °C na 1 000 ft, až po tropopauzu vo výške 11 km.' },
  { s: 'met', q: 'Aká je teplota v tropopauze podľa ISA?', n: -56.5, u: '°C', tol: 0.5, w: [-44.5, -65, -273, -15], e: '15 °C na hladine mora − 11 km × 6,5 °C = −56,5 °C. Nad tým sa teplota v ISA už nemení.' },
  { s: 'met', q: 'Aká je hustota vzduchu na hladine mora podľa ISA (kg/m³)?', n: 1.225, u: 'kg/m³', tol: 0.006, w: [1.013, 0.9, 1.5, 1.293], e: 'ISA na hladine mora: 1013,25 hPa, 15 °C a 1,225 kg/m³.' },
  { s: 'met', q: 'Do akej dohľadnosti (v metroch) sa v správach uvádza dymno (BR)?', n: 5000, u: 'm', tol: 0, w: [1000, 3000, 8000, 10000], e: 'Dymno (BR) je pri dohľadnosti od 1 000 do 5 000 m; pod 1 000 m je to hmla (FG).' },
  { s: 'met', q: 'Ako sa skrátene zapisuje oblak cumulonimbus?', t: ['CB'], w: ['CU', 'CN', 'TCU'], e: 'CB — jediný oblak spolu s TCU, ktorého druh sa v správe METAR uvádza.' },
  { s: 'met', q: 'Ako sa skrátene zapisuje vežovitý cumulus?', t: ['TCU'], w: ['CB', 'CU', 'ACC'], e: 'TCU = towering cumulus.' },
  { s: 'met', q: 'Ako sa skrátene zapisuje oblak stratus?', t: ['ST'], w: ['SC', 'AS', 'CS'], e: 'ST stratus, SC stratocumulus, AS altostratus, CS cirrostratus.' },
  { s: 'met', q: 'Ako sa skrátene zapisuje oblak nimbostratus?', t: ['NS'], w: ['NB', 'ST', 'CB'], e: 'NS — vrstevnatý oblak s trvalými zrážkami.' },
  { s: 'met', q: 'Ako sa skrátene zapisuje oblak cirrus?', t: ['CI'], w: ['CS', 'CC', 'CR'], e: 'CI cirrus, CS cirrostratus, CC cirrocumulus — všetko vysoká oblačnosť.' },
  { s: 'met', q: 'Voči ktorému severu je udaný smer vetra v správe METAR?', a: 'Voči zemepisnému', w: ['Voči magnetickému', 'Voči kompasovému', 'Voči sieťovému'], e: 'V správach a predpovediach je smer vetra zemepisný. Magnetický je vietor, ktorý hlási veža alebo ATIS na vzlet a pristátie.' },
  { s: 'met', q: 'Voči ktorému severu je udaný vietor, ktorý veža hlási na vzlet a pristátie?', a: 'Voči magnetickému', w: ['Voči zemepisnému', 'Voči kompasovému', 'Podľa želania pilota'], e: 'Dráhy sú označené magnetickým smerom, preto je aj vietor na vzlet a pristátie magnetický.' },
  { s: 'met', q: 'Koľko osmín oblohy najmenej zakrýva oblačnosť označená BKN?', n: 5, u: 'osmín', tol: 0, w: [3, 4, 6, 7], e: 'FEW 1 – 2, SCT 3 – 4, BKN 5 – 7, OVC 8 osmín.' },
  /* ZARIADENIA */
  { s: 'eqps', q: 'V ktorom frekvenčnom pásme (skratka) pracuje letecké hlasové spojenie 118 – 137 MHz?', t: ['VHF', 'VKV'], w: ['HF', 'UHF', 'MF'], e: 'VHF je 30 – 300 MHz; šíri sa priamou vlnou, dosah je daný priamou viditeľnosťou.' },
  { s: 'eqps', q: 'V ktorom frekvenčnom pásme (skratka) pracujú DME a sekundárny radar?', t: ['UHF'], w: ['VHF', 'SHF', 'HF'], e: 'UHF je 300 MHz – 3 GHz; SSR používa 1030 a 1090 MHz, DME 960 – 1215 MHz.' },
  { s: 'eqps', q: 'Ktoré pásmo (skratka) sa používa na diaľkové spojenie nad oceánmi?', t: ['HF', 'KV'], w: ['VHF', 'UHF', 'LF'], e: 'HF (3 – 30 MHz) sa odráža od ionosféry, preto dosiahne tisíce kilometrov.' },
  { s: 'eqps', q: 'Aká modulácia (skratka) sa používa v leteckom hlasovom spojení VHF?', t: ['AM'], w: ['FM', 'PM', 'SSB'], e: 'Amplitúdová modulácia: keď vysielajú dve stanice naraz, je to počuť ako piskot — pri FM by silnejšia slabšiu úplne prekryla.' },
  { s: 'eqps', q: 'Ako sa volá časť ILS, ktorá dáva smerové vedenie na os dráhy?', t: ['LOCALIZER', 'LOCALISER', 'LLZ', 'LOC'], w: ['GLIDE PATH', 'MARKER', 'DME'], e: 'Localizer (LLZ) vedie smerovo, glide path (GP) zvislo.' },
  { s: 'eqps', q: 'Ako sa volá časť ILS, ktorá dáva vedenie po zostupovej rovine?', t: ['GLIDE PATH', 'GLIDEPATH', 'GP', 'GLIDE SLOPE', 'GLIDESLOPE', 'GS'], w: ['LOCALIZER', 'MARKER', 'VOR'], e: 'Glide path (GP), bežne s uhlom 3°.' },
  { s: 'eqps', q: 'Aká je najnižšia výška rozhodnutia pri priblížení ILS kategórie I?', n: 200, u: 'ft', tol: 0, w: [100, 150, 250, 300], e: 'CAT I: DH nie nižšia než 200 ft a RVR aspoň 550 m.' },
  { s: 'eqps', q: 'Aká najmenšia dráhová dohľadnosť (RVR) stačí na priblíženie ILS kategórie I?', n: 550, u: 'm', tol: 0, w: [300, 400, 800, 1000], e: 'CAT I: RVR najmenej 550 m (alebo dohľadnosť 800 m).' },
  { s: 'eqps', q: 'Aká je najnižšia výška rozhodnutia pri priblížení ILS kategórie II?', n: 100, u: 'ft', tol: 0, w: [50, 150, 200], e: 'CAT II: DH pod 200 ft, ale nie nižšia než 100 ft, RVR aspoň 300 m.' },
  { s: 'eqps', q: 'Ktorý indikátor priority majú v sieti AFTN tiesňové správy?', t: ['SS'], w: ['DD', 'FF', 'GG'], e: 'SS tieseň, DD naliehavosť, FF bezpečnosť letu, GG meteorologické a ostatné, KK administratívne.' },
  { s: 'eqps', q: 'Ktorý indikátor priority majú v sieti AFTN správy o bezpečnosti letu (napr. letové plány)?', t: ['FF'], w: ['SS', 'DD', 'GG'], e: 'FF — správy týkajúce sa bezpečnosti letu.' },
  { s: 'eqps', q: 'Ako sa volá európsky družicový navigačný systém?', t: ['GALILEO'], w: ['GLONASS', 'EGNOS', 'BeiDou'], e: 'GPS je americký, GLONASS ruský, Galileo európsky, BeiDou čínsky. EGNOS je európsky rozširujúci systém (SBAS).' },
  { s: 'eqps', q: 'Ako sa volá ruský družicový navigačný systém?', t: ['GLONASS'], w: ['Galileo', 'BeiDou', 'GPS'], e: 'GLONASS — ruský náprotivok amerického GPS.' },
  { s: 'eqps', q: 'V akom súradnicovom systéme sa v letectve udávajú polohy?', t: ['WGS-84', 'WGS84', 'WGS 84'], w: ['S-JTSK', 'ETRS-89', 'UTM'], e: 'World Geodetic System 1984 — spoločný systém pre letecké údaje aj GNSS.' },
  { s: 'eqps', q: 'Na akej frekvencii (MHz) vysiela lietadlo správy ADS-B typu Extended Squitter?', n: 1090, u: 'MHz', tol: 0, w: [1030, 978, 121.5, 406], e: '1090 MHz — tá istá frekvencia, na ktorej odpovedá odpovedač SSR.' },
  { s: 'eqps', q: 'Aký bol kanálový odstup (kHz) v pásme VHF pred zavedením 8,33 kHz?', n: 25, u: 'kHz', tol: 0, w: [12.5, 50, 100], e: 'Z 25 kHz na 8,33 kHz — z jedného kanála vznikli tri.' },
  { s: 'eqps', q: 'Čo znamená písmeno S v skratke CNS?', t: ['SURVEILLANCE', 'PREHLAD', 'PREHLADOVE SYSTEMY'], w: ['Systems', 'Safety', 'Service'], e: 'Communication, Navigation, Surveillance — spojenie, navigácia, prehľad.' },
  /* NAVIGÁCIA */
  { s: 'nav', q: 'Ako sa volá najkratšia spojnica dvoch bodov na povrchu Zeme (časť hlavnej kružnice)?', t: ['ORTODROMA', 'ORTHODROME'], w: ['Loxodróma', 'Izogóna', 'Rovnobežka'], e: 'Ortodróma pretína poludníky pod meniacim sa uhlom; loxodróma pod stále rovnakým.' },
  { s: 'nav', q: 'Ako sa volá čiara, ktorá pretína všetky poludníky pod rovnakým uhlom?', t: ['LOXODROMA', 'LOXODROME'], w: ['Ortodróma', 'Izobara', 'Hlavná kružnica'], e: 'Loxodróma — let stálym kurzom, ale nie najkratšou cestou.' },
  { s: 'nav', q: 'Koľko námorných míľ má obvod Zeme po rovníku?', n: 21600, u: 'NM', tol: 100, w: [10800, 24000, 40000], e: '360° × 60 NM = 21 600 NM (asi 40 000 km).' },
  { s: 'nav', q: 'O koľko minút sa posunie miestny čas na každý 1° zemepisnej dĺžky?', n: 4, u: 'min', tol: 0, w: [1, 2, 15, 60], e: 'Zem sa otočí o 15° za hodinu, teda o 1° za 4 minúty.' },
  { s: 'nav', q: 'Koľko družíc najmenej potrebuje prijímač GNSS na určenie polohy v priestore a času?', n: 4, u: '', tol: 0, w: [2, 3, 5, 6], e: 'Štyri neznáme (tri súradnice a čas) = štyri družice. Piata umožní RAIM, šiesta vylúčenie chybnej družice.' },
  { s: 'nav', q: 'Koľko radiálov má VOR?', n: 360, u: '', tol: 0, w: [180, 90, 36], e: 'Radiál je magnetické zameranie OD stanice, po jednom na každý stupeň.' },
  /* LIETADLÁ */
  { s: 'acft', q: 'Ktorá sila pôsobí proti ťahu?', t: ['ODPOR'], w: ['Vztlak', 'Tiaž', 'Trenie kolies'], e: 'Štyri sily: vztlak proti tiaži, ťah proti odporu. V ustálenom vodorovnom lete sú v rovnováhe.' },
  { s: 'acft', q: 'Ktorá sila pôsobí proti tiaži?', t: ['VZTLAK'], w: ['Ťah', 'Odpor', 'Odstredivá sila'], e: 'Vztlak vzniká obtekaním krídla; v ustálenom vodorovnom lete sa rovná tiaži.' },
  { s: 'acft', q: 'Ktorá riadiaca plocha ovláda klopenie (nos hore – dole)?', t: ['VYSKOVKA', 'VYSKOVE KORMIDLO', 'ELEVATOR'], w: ['Krídelká', 'Smerovka', 'Klapky'], e: 'Výškovka → klopenie okolo priečnej osi. Krídelká → klonenie, smerovka → zatáčanie.' },
  { s: 'acft', q: 'Ktoré riadiace plochy ovládajú klonenie (náklon na krídlo)?', t: ['KRIDELKA', 'KRIDIELKA', 'AILERONS', 'AILERON'], w: ['Výškovka', 'Smerovka', 'Sloty'], e: 'Krídelká → klonenie okolo pozdĺžnej osi.' },
  { s: 'acft', q: 'Ktorá riadiaca plocha ovláda zatáčanie okolo zvislej osi?', t: ['SMEROVKA', 'SMEROVE KORMIDLO', 'RUDDER'], w: ['Výškovka', 'Krídelká', 'Spojlery'], e: 'Smerovka → zatáčanie okolo zvislej osi.' },
  { s: 'acft', q: 'Ako sa označuje rýchlosť rozhodnutia pri vzlete?', t: ['V1'], w: ['VR', 'V2', 'VS'], e: 'V1 rozhodnutie, VR rotácia, V2 bezpečná rýchlosť vzletu.' },
  { s: 'acft', q: 'Ako sa označuje rýchlosť, pri ktorej pilot začína dvíhať nos lietadla?', t: ['VR'], w: ['V1', 'V2', 'VLOF'], e: 'VR = rotation speed.' },
  { s: 'acft', q: 'Ako sa označuje bezpečná rýchlosť vzletu?', t: ['V2'], w: ['V1', 'VR', 'VNE'], e: 'V2 — rýchlosť, ktorou lietadlo bezpečne stúpa aj po vysadení motora.' },
  { s: 'acft', q: 'Akú farbu má polohové svetlo na konci ľavého krídla?', t: ['CERVENA', 'CERVENU', 'CERVENE', 'RED'], w: ['Zelenú', 'Bielu', 'Žltú'], e: 'Vľavo červené, vpravo zelené, vzadu biele — ako na lodi.' },
  { s: 'acft', q: 'Akú farbu má polohové svetlo na konci pravého krídla?', t: ['ZELENA', 'ZELENU', 'ZELENE', 'GREEN'], w: ['Červenú', 'Bielu', 'Modrú'], e: 'Vpravo zelené. Ak vidíš červené vľavo a zelené vpravo, lietadlo letí oproti tebe.' },
  { s: 'acft', q: 'Aká je rýchlosť zvuku na hladine mora v ISA (m/s)?', n: 340, u: 'm/s', tol: 2, w: [300, 320, 360, 400], e: '340,3 m/s, čo je asi 661 kt. S výškou (teplotou) klesá.' },
  { s: 'acft', q: 'Koľko uzlov je približne Mach 1 na hladine mora v ISA?', n: 661, u: 'kt', tol: 6, w: [540, 600, 720, 760], e: '340 m/s ≈ 661 kt. Vo FL 360 je to už len asi 573 kt.' },
  /* ĽUDSKÉ FAKTORY */
  { s: 'hum', q: 'Čo znamená písmeno L v strede modelu SHELL?', t: ['LIVEWARE', 'CLOVEK', 'LUDIA'], w: ['Learning', 'Logic', 'Limits'], e: 'Software, Hardware, Environment, Liveware — a v strede znova Liveware, teda človek.' },
  { s: 'hum', q: 'Čo znamená písmeno H v modeli SHELL?', t: ['HARDWARE', 'TECHNIKA'], w: ['Human', 'Hazard', 'Health'], e: 'Hardware — stroje, zariadenia, pracovisko.' },
  { s: 'hum', q: 'Čo znamená písmeno E v modeli SHELL?', t: ['ENVIRONMENT', 'PROSTREDIE'], w: ['Error', 'Equipment', 'Experience'], e: 'Environment — prostredie, v ktorom človek pracuje.' },
  { s: 'hum', q: 'Koľko položiek má zoznam najčastejších príčin ľudských chýb známy ako „Dirty Dozen“?', n: 12, u: '', tol: 0, w: [6, 10, 20], e: 'Dozen = tucet. Patrí tam napríklad únava, stres, tlak, rozptýlenie či nedostatok komunikácie.' },
  { s: 'hum', q: 'Ako sa bežne hovorí Reasonovmu modelu vzniku nehôd?', a: 'Model švajčiarskeho syra', w: ['Model ľadovca', 'Dominový model', 'Model motýlika'], e: 'Diery v jednotlivých vrstvách ochrany sa musia zoradiť za sebou, aby nehoda prešla.' },
  /* PRÁVO A PROSTREDIE */
  { s: 'pen', q: 'V ktorom roku nadobudol Chicagský dohovor platnosť a vznikla ICAO?', n: 1947, u: '', tol: 0, w: [1944, 1945, 1919, 1958], e: 'Podpísaný bol 7. decembra 1944, platnosť nadobudol 4. apríla 1947.' },
  { s: 'pen', q: 'Z ktorého roku je Parížsky dohovor, ktorý ako prvý uznal zvrchovanosť štátu nad jeho vzdušným priestorom?', n: 1919, u: '', tol: 0, w: [1903, 1929, 1944], e: 'Parížsky dohovor 1919; Chicagský dohovor 1944 ho nahradil.' },
  { s: 'pen', q: 'Koľko tried vzdušného priestoru ATS pozná ICAO?', n: 7, u: '', tol: 0, w: [5, 6, 8], e: 'Triedy A až G.' },
  { s: 'pen', q: 'V ktorej triede vzdušného priestoru sú povolené len lety IFR?', t: ['A'], w: ['B', 'C', 'G'], e: 'Trieda A: len IFR, všetkým sa zaisťujú rozstupy.' },
  { s: 'pen', q: 'Ktorý Annex ICAO upravuje prevádzku lietadiel?', n: 6, u: '', tol: 0, w: [2, 8, 11, 14], e: 'Annex 6 — Operation of Aircraft.' },
  { s: 'pen', q: 'Ktorý Annex ICAO upravuje letovú spôsobilosť lietadiel?', n: 8, u: '', tol: 0, w: [6, 7, 16], e: 'Annex 8 — Airworthiness of Aircraft.' },
  { s: 'pen', q: 'Ktorý Annex ICAO upravuje riadenie bezpečnosti?', n: 19, u: '', tol: 0, w: [13, 17, 18], e: 'Annex 19 — Safety Management, najnovšia príloha (2013).' },
  { s: 'pen', q: 'Ktorý Annex ICAO upravuje prepravu nebezpečného tovaru?', n: 18, u: '', tol: 0, w: [9, 16, 17], e: 'Annex 18 — The Safe Transport of Dangerous Goods by Air.' },
  { s: 'pen', q: 'Akú najnižšiu úroveň jazykovej spôsobilosti (podľa stupnice ICAO) musí mať riadiaci letovej prevádzky?', n: 4, u: '', tol: 0, w: [3, 5, 6], e: 'Úroveň 4 — prevádzková. Stupnica má šesť úrovní.' },
  { s: 'pen', q: 'Akú triedu zdravotnej spôsobilosti potrebuje riadiaci letovej prevádzky?', n: 3, u: '', tol: 0, w: [1, 2, 4], e: 'Trieda 3; piloti majú triedu 1 alebo 2.' },
  { s: 'pen', q: 'Ktoré nariadenie EÚ upravuje preukazy riadiacich letovej prevádzky?', t: ['2015/340', '340/2015'], w: ['923/2012', '549/2004', '2017/373'], e: '(EÚ) 2015/340 — preukazy ATCO. 923/2012 je SERA, 2017/373 požiadavky na poskytovateľov.' },
  { s: 'pen', q: 'Akú farbu majú okrajové svetlá rolovacej dráhy?', t: ['MODRA', 'MODRU', 'MODRE', 'BLUE'], w: ['Zelenú', 'Bielu', 'Žltú'], e: 'Okraje rolovacej dráhy modré, jej os zelená.' },
  { s: 'pen', q: 'Akú farbu majú osové svetlá rolovacej dráhy?', t: ['ZELENA', 'ZELENU', 'ZELENE', 'GREEN'], w: ['Modrú', 'Bielu', 'Červenú'], e: 'Os rolovacej dráhy zelená, okraje modré.' },
  { s: 'pen', q: 'Akú farbu majú prahové svetlá dráhy pri pohľade z priblíženia?', t: ['ZELENA', 'ZELENU', 'ZELENE', 'GREEN'], w: ['Červenú', 'Bielu', 'Žltú'], e: 'Prah zelený, koniec dráhy červený.' },
  { s: 'pen', q: 'Akú farbu majú koncové svetlá dráhy?', t: ['CERVENA', 'CERVENU', 'CERVENE', 'RED'], w: ['Zelenú', 'Bielu', 'Modrú'], e: 'Koniec dráhy je červený.' },
  { s: 'pen', q: 'Akú farbu má značenie na rolovacích dráhach?', t: ['ZLTA', 'ZLTU', 'ZLTE', 'YELLOW'], w: ['Bielu', 'Červenú', 'Modrú'], e: 'Rolovacie dráhy žlté, vzletové a pristávacie dráhy biele.' },
  { s: 'pen', q: 'Z ktorého roku sú prvé nariadenia Jednotného európskeho neba (SES)?', n: 2004, u: '', tol: 0, w: [1999, 2009, 2012], e: 'Nariadenia (ES) 549 až 552/2004.' }
];
/* stará otázka z banky: ak je správna odpoveď krátky kód alebo číslo s jednotkou (a nesprávne sú rovnakého druhu), dá sa aj písať */
function gqAuto(c) {
  const a = String(c.a).trim(), num = /^(-?\d[\d ]*(?:[,.]\d+)?)\s*([^\d\s][^\d]{0,10})?$/;
  const m = a.match(num);
  if (m && c.w.every(w => num.test(String(w).trim()))) { const v = parseFloat(m[1].replace(/ /g, '').replace(',', '.')); if (isFinite(v)) return { num: { val: v, unit: (m[2] || '').trim(), tol: 0 } }; }
  const code = /^[A-Z0-9][A-Z0-9\-\/\. ]{0,9}$/;
  if (code.test(a) && /[A-Z]/.test(a) && c.w.every(w => code.test(String(w).trim()))) return { text: [a].concat(/^FL ?\d+$/.test(a) ? [a.replace(/\D/g, '')] : []) };
  return {};
}
/* GQ_X2:BEGIN — ďalšie pestré otázky po predmetoch; tento blok prepisuje skript vloz-pestre.py */
const GQ_X2 = [];
/* GQ_X2:END */
GQ_X2.forEach(x => GQ_X.push(x));
/* z položky banky spraví otázku pre jadro */
function gqFromX(x) {
  const cat = 'OKRUH · ' + GQ_SETN[x.s], f = v => String(v).replace('.', ',') + (x.u ? ' ' + x.u : ''), id = 'th:' + x.s + ':x' + gqHash(x.q);
  if (x.n != null) return gqMk(cat, x.q, f(x.n), x.w.map(f), { num: { val: x.n, unit: x.u || '', tol: x.tol || 0 }, exp: x.e, id });
  if (x.t) return gqMk(cat, x.q, gqShow(x), x.w, { text: x.t, exp: x.e, id });
  return gqMk(cat, x.q, x.a, x.w, { exp: x.e, id });
}
/* ako sa písaná odpoveď ukáže ako správna: s diakritikou tam, kde ju uznané tvary nemajú */
const GQ_NICE = { ODPOR: 'Odpor', VZTLAK: 'Vztlak', VYSKOVKA: 'Výškovka', KRIDELKA: 'Krídelká', SMEROVKA: 'Smerovka', CERVENA: 'Červená', ZELENA: 'Zelená', MODRA: 'Modrá', ZLTA: 'Žltá', ORTODROMA: 'Ortodróma', LOXODROMA: 'Loxodróma', LIVEWARE: 'Liveware (človek)', HARDWARE: 'Hardware (technika)', ENVIRONMENT: 'Environment (prostredie)', SURVEILLANCE: 'Surveillance (prehľad)', LOCALIZER: 'Localizer (LLZ)', 'GLIDE PATH': 'Glide path (GP)', GALILEO: 'Galileo' };
function gqShow(x) { return x.show || GQ_NICE[x.t[0]] || x.t[0]; }
/* tie isté otázky aj v Dobyvateľovi: číselné ako tipovacie (kto je bližšie), ostatné do okruhov */
function gqFeedGame() {
  if (GQ.fed) return; GQ.fed = true;
  GQ_X.forEach(x => { if (x.n != null) DQ_NUM.push([x.s, x.q, x.n, x.u || '']); else if (DQ_BANK[x.s]) DQ_BANK[x.s].push({ q: x.q, a: x.t ? gqShow(x) : x.a, w: x.w }); });
}
/* ---------- MOD 08 · ROZSTUPY ZA TURBULENCIOU (ICAO Doc 4444) ---------- */
const GQ_WN = { J: 'SUPER', H: 'HEAVY', M: 'MEDIUM', L: 'LIGHT' };
const GQ_WD = { J: { H: 5, M: 7, L: 8 }, H: { H: 4, M: 5, L: 6 }, M: { L: 5 } };          // radarový rozstup v NM: vedúce → nasledujúce
const GQ_WT = { J: { H: 2, M: 3, L: 4 }, H: { M: 2, L: 3 }, M: { L: 3 } };                 // minúty pri pristátí
function gqWake(sub) {
  const by = {}; AIRCRAFT.forEach(a => { if (GQ_WN[a.wake] && !/rotor/i.test(a.wingspan || '')) (by[a.wake] = by[a.wake] || []).push(a); });   // len lietadlá s pevným krídlom
  if (sub === 'cat') { const a = gqR(AIRCRAFT.filter(x => GQ_WN[x.wake])); return gqMk('KATEGÓRIA TURBULENCIE', 'Do ktorej kategórie turbulencie v brázde patrí ' + a.name + '?', GQ_WN[a.wake], ['SUPER', 'HEAVY', 'MEDIUM', 'LIGHT'], { big: a.icao, exp: a.name + ' má MTOW ' + a.mtow + '. LIGHT je do 7 000 kg, MEDIUM nad 7 000 kg a pod 136 000 kg, HEAVY od 136 000 kg, SUPER je Airbus A380.' }); }
  const T = sub === 'time' ? GQ_WT : GQ_WD, unit = sub === 'time' ? 'min' : 'NM', none = 'bez osobitného minima';
  const pairs = []; 'JHML'.split('').forEach(a => 'JHML'.split('').forEach(b => { if (by[a] && by[b] && !(a === 'J' && b === 'J')) pairs.push([a, b]); }));
  const hit = pairs.filter(p => T[p[0]] && T[p[0]][p[1]]), miss = pairs.filter(p => !(T[p[0]] && T[p[0]][p[1]])), p = Math.random() < 0.72 ? gqR(hit) : gqR(miss);
  const A = gqR(by[p[0]]), B = gqR(by[p[1]]), v = T[p[0]] && T[p[0]][p[1]], right = v ? v + ' ' + unit : none;
  const all = sub === 'time' ? ['2 min', '3 min', '4 min', none] : ['4 NM', '5 NM', '6 NM', '7 NM', '8 NM', none];
  return gqMk(sub === 'time' ? 'ČASOVÝ ROZSTUP · PRISTÁTIE' : 'RADAROVÝ ROZSTUP', sub === 'time' ? 'Aký najmenší časový rozstup za turbulenciou platí pre druhé lietadlo pri pristátí?' : 'Aký najmenší radarový rozstup za turbulenciou v brázde platí?', right, all,
    { num: v ? { val: v, unit, tol: 0 } : null, big: A.icao + '  →  ' + B.icao, sub: 'Vpredu ' + A.name + ', za ním ' + B.name + '.', exp: A.icao + ' je ' + GQ_WN[p[0]] + ', ' + B.icao + ' je ' + GQ_WN[p[1]] + '. ' + (v ? GQ_WN[p[1]] + ' za ' + GQ_WN[p[0]] + ' = ' + v + ' ' + unit + '.' : 'Pre túto dvojicu ICAO osobitné minimum neurčuje — platí bežný rozstup.') + ' Podľa ICAO Doc 4444; miestne postupy (napr. RECAT-EU) sa môžu líšiť.' });
}
/* ---------- MOD 09 · METAR ---------- */
const GQ_WX = [['RA', 'dážď'], ['-RA', 'slabý dážď'], ['+RA', 'silný dážď'], ['SHRA', 'prehánky dažďa'], ['-SHRA', 'slabé prehánky dažďa'], ['TSRA', 'búrka s dažďom'], ['SN', 'sneženie'], ['-SN', 'slabé sneženie'], ['+SN', 'silné sneženie'], ['DZ', 'mrholenie'], ['FG', 'hmla'], ['FZFG', 'mrznúca hmla'], ['BR', 'dymno'], ['HZ', 'zákal'], ['GR', 'krúpy'], ['FZRA', 'mrznúci dážď'], ['VCSH', 'prehánky v okolí letiska'], ['TS', 'búrka bez zrážok']];
const GQ_MC = GQ_WX.concat([['NSC', 'žiadna význačná oblačnosť'], ['CAVOK', 'dohľadnosť 10 km a viac, žiadna oblačnosť pod 5 000 ft, žiadne význačné počasie'], ['NOSIG', 'v najbližších dvoch hodinách sa nečaká význačná zmena'], ['BECMG', 'postupná zmena podmienok'], ['TEMPO', 'dočasné zmeny podmienok'], ['VRB', 'vietor premenlivého smeru'], ['FEW', 'oblačnosť 1 až 2 osminy'], ['SCT', 'oblačnosť 3 až 4 osminy'], ['BKN', 'oblačnosť 5 až 7 osmín'], ['OVC', 'oblačnosť 8 osmín — zamračené'], ['CB', 'oblak cumulonimbus'], ['TCU', 'vežovitý cumulus'], ['VV', 'vertikálna dohľadnosť (obloha zakrytá)'], ['AUTO', 'správa zostavená automaticky, bez pozorovateľa'], ['COR', 'opravená správa'], ['SPECI', 'mimoriadna správa mimo pravidelného času'], ['G', 'nárazy vetra'], ['Q', 'tlak QNH v hPa'], ['R31/0600', 'dráhová dohľadnosť RVR pre dráhu 31 je 600 m'], ['M02', 'teplota mínus 2 °C']]);
function gqMetar(sub) {
  if (sub === 'code') { const x = gqR(GQ_MC);
    if (Math.random() < 0.4 && /^[+\-A-Z]+$/.test(x[0])) return gqMk('METAR · KÓDY', 'Ako sa v správe METAR zapíše: ' + x[1] + '?', x[0], GQ_MC.filter(y => /^[+\-A-Z]+$/.test(y[0])).map(y => y[0]), { text: [x[0]] });
    return gqMk('METAR · KÓDY', 'Čo znamená tento kód v správe METAR?', x[1], GQ_MC.map(y => y[1]), { big: x[0] }); }
  const p2 = n => String(n).padStart(2, '0'), p3 = n => String(n).padStart(3, '0'), tC = n => (n < 0 ? 'M' : '') + p2(Math.abs(n));
  const st = gqR(['LZIB', 'LZKZ', 'LZTT', 'LZPP', 'LZSL', 'LZZI', 'LOWW', 'LKPR', 'LHBP', 'EPKK']), dd = gqInt(1, 28), hh = gqInt(0, 23), mm = gqR([0, 30]);
  const wk = Math.random(), dir = 10 * gqInt(1, 36), spd = gqInt(3, 24), gust = Math.random() < 0.3 ? spd + gqInt(10, 18) : 0;
  const wind = wk < 0.08 ? '00000KT' : wk < 0.16 ? 'VRB' + p2(gqInt(1, 4)) + 'KT' : p3(dir) + p2(spd) + (gust ? 'G' + gust : '') + 'KT', calm = wk < 0.08, vrb = wk >= 0.08 && wk < 0.16;
  const cavok = Math.random() < 0.18, vis = cavok ? 9999 : gqR([9999, 9999, 8000, 6000, 4000, 2500, 1200, 800, 300]);
  const wx = cavok ? null : vis >= 9999 ? (Math.random() < 0.3 ? gqR(['-RA', '-SHRA', 'VCSH']) : null) : vis >= 5000 ? gqR(['-RA', 'RA', 'HZ', '-SHRA', null]) : vis >= 1000 ? gqR(['BR', 'RA', '+RA', '-SN', 'SN', 'TSRA', 'SHRA', 'DZ']) : gqR(['FG', 'FZFG', '+SN', 'FG']);
  const h1 = gqR(vis < 1000 ? [1, 2, 3] : vis < 5000 ? [4, 6, 8, 12] : [15, 20, 25, 35, 45]), a1 = gqR(vis < 3000 ? ['BKN', 'OVC'] : ['FEW', 'SCT', 'BKN']), two = Math.random() < 0.45, h2 = h1 + gqR([10, 15, 25, 40]), a2 = gqR(['SCT', 'BKN', 'OVC']);
  const cb = wx === 'TSRA', cld = cavok ? '' : Math.random() < 0.12 && vis >= 9999 && !wx ? 'NSC' : a1 + p3(h1) + (cb ? 'CB' : '') + (two ? ' ' + a2 + p3(h2) : ''), nsc = cld === 'NSC';
  /* aby správa dávala zmysel: sneh a námraza pri mraze, búrka v teple, pri zrážkach a nízkej dohľadnosti rosný bod blízko teploty */
  const cold = wx && /SN|FZ/.test(wx), t = cold ? gqInt(-9, 1) : wx === 'TSRA' ? gqInt(14, 29) : gqInt(1, 29), wet = vis < 5000 || (wx && wx !== 'HZ'), td = t - gqInt(vis < 1500 ? 0 : 1, vis < 1500 ? 1 : wet ? 3 : 12), q = gqInt(986, 1034);
  const M = ['METAR', st, p2(dd) + p2(hh) + p2(mm) + 'Z', wind, cavok ? 'CAVOK' : String(vis).padStart(4, '0'), wx, cld, tC(t) + '/' + tC(td), 'Q' + String(q).padStart(4, '0'), Math.random() < 0.5 ? 'NOSIG' : ''].filter(Boolean).join(' ');
  const OK = { FEW: '1 až 2 osminy', SCT: '3 až 4 osminy', BKN: '5 až 7 osmín', OVC: '8 osmín' }, Q = [];
  Q.push(() => gqMk('METAR · ČAS', 'Kedy bola správa vydaná?', dd + '. deň v mesiaci, ' + p2(hh) + ':' + p2(mm) + ' UTC', [hh + '. deň v mesiaci, ' + p2(dd) + ':' + p2(mm) + ' UTC', dd + '. deň v mesiaci, ' + p2(hh) + ':' + p2(mm) + ' miestneho času', p2(dd) + ':' + p2(hh) + ' UTC, platnosť ' + (mm || 30) + ' minút'], { exp: 'Skupina ' + p2(dd) + p2(hh) + p2(mm) + 'Z: prvé dve číslice sú deň, ďalšie štyri čas, Z znamená UTC.' }));
  if (!calm && !vrb) { Q.push(() => gqNum('METAR · VIETOR', 'Z akého smeru fúka vietor?', dir, '°', [-180, 180, 90, -90, 20, -20, 100, -100].filter(d => dir + d > 0 && dir + d <= 360), { exp: 'Skupina ' + wind + ': prvé tri číslice sú smer, odkiaľ vietor fúka (' + p3(dir) + '°), ďalšie dve rýchlosť (' + spd + ' kt).' }));
    Q.push(() => gqNum('METAR · VIETOR', 'Aká je priemerná rýchlosť vetra?', spd, 'kt', [dir / 10 - spd, gust ? gust - spd : 9, 5, -2, 3, 12].filter(d => d), { exp: 'Skupina ' + wind + ': rýchlosť sú dve číslice za smerom, teda ' + spd + ' kt' + (gust ? '; G' + gust + ' sú nárazy.' : '.') })); }
  if (gust) Q.push(() => gqNum('METAR · VIETOR', 'Aké silné sú nárazy vetra?', gust, 'kt', [spd - gust, -5, 5, 10, dir / 10 - gust].filter(d => d), { exp: 'Písmeno G (gust) a číslo za ním: nárazy ' + gust + ' kt pri priemernom vetre ' + spd + ' kt.' }));
  if (calm) Q.push(() => gqMk('METAR · VIETOR', 'Čo znamená skupina 00000KT?', 'bezvetrie', ['vietor zo severu 0 kt v nárazoch', 'údaj o vetre chýba', 'vietor premenlivého smeru'], { exp: 'Päť núl = smer 000 a rýchlosť 00, teda bezvetrie (calm).' }));
  if (vrb) Q.push(() => gqMk('METAR · VIETOR', 'Čo hovorí skupina ' + wind + '?', 'vietor premenlivého smeru, ' + +wind.slice(3, 5) + ' kt', ['vietor z východu, ' + +wind.slice(3, 5) + ' kt', 'nárazy ' + +wind.slice(3, 5) + ' kt', 'bezvetrie'], { exp: 'VRB = variable, smer sa nedá určiť; číslo je rýchlosť v uzloch.' }));
  Q.push(() => cavok ? gqMk('METAR · DOHĽADNOSŤ', 'Aká je dohľadnosť?', '10 km alebo viac', ['presne 9 999 m', 'nemeria sa', 'menej než 5 km'], { exp: 'CAVOK nahrádza dohľadnosť, počasie aj oblačnosť: dohľadnosť 10 km a viac, žiadna oblačnosť pod 5 000 ft (alebo pod najvyššou MSA), žiadny CB ani TCU a žiadne význačné počasie.' })
    : gqMk('METAR · DOHĽADNOSŤ', 'Aká je prevládajúca dohľadnosť?', vis >= 9999 ? '10 km alebo viac' : vis >= 5000 ? vis / 1000 + ' km' : vis + ' m', ['10 km alebo viac', '8 km', '6 km', '4 000 m'.replace(' ', ''), '2500 m', '1200 m', '800 m', '300 m', '9 999 ft'].filter(x => x !== '4000 m' || vis !== 4000), { exp: 'Štvorciferná skupina ' + String(vis).padStart(4, '0') + ' je dohľadnosť v metroch; 9999 znamená 10 km a viac.' }));
  if (wx) Q.push(() => { const m = GQ_WX.find(x => x[0] === wx); return gqMk('METAR · POČASIE', 'Aké počasie hlási skupina ' + wx + '?', m[1], GQ_WX.map(x => x[1]), { exp: wx + ' = ' + m[1] + '. Znamienko − je slabá, + silná intenzita; bez znamienka mierna.' }); });
  if (!cavok && !nsc) { Q.push(() => gqNum('METAR · OBLAČNOSŤ', 'V akej výške nad letiskom je základňa najnižšej vrstvy oblačnosti?', h1 * 100, 'ft', [h1 * 900, -h1 * 90, 500, 1000, (two ? h2 - h1 : 15) * 100, -h1 * 50].filter(d => d), { exp: 'Skupina ' + a1 + p3(h1) + ': tri číslice sú výška základne v stovkách stôp, teda ' + h1 * 100 + ' ft.' }));
    Q.push(() => gqMk('METAR · OBLAČNOSŤ', 'Koľko oblohy zakrýva vrstva ' + a1 + p3(h1) + (cb ? 'CB' : '') + '?', OK[a1], Object.keys(OK).map(k => OK[k]), { exp: 'FEW 1–2 osminy, SCT 3–4, BKN 5–7, OVC 8 osmín.' })); }
  Q.push(() => gqNum('METAR · TEPLOTA', 'Aká je teplota vzduchu?', t, '°C', [td - t, -t * 2, 10, -10, 5].filter(d => d && t + d !== t), { exp: 'Skupina ' + tC(t) + '/' + tC(td) + ': pred lomkou teplota, za ňou rosný bod; M znamená mínus.' }));
  if (td !== t) Q.push(() => gqNum('METAR · TEPLOTA', 'Aký je rosný bod?', td, '°C', [t - td, -td * 2, 10, -10, 3].filter(d => d), { exp: 'Skupina ' + tC(t) + '/' + tC(td) + ': rosný bod je druhé číslo, teda ' + td + ' °C.' }));
  Q.push(() => gqNum('METAR · TLAK', 'Aký je tlak QNH?', q, 'hPa', [10, -10, 100, -100, 5, -5], { exp: 'Q a štyri číslice: QNH ' + q + ' hPa.' }));
  const o = gqR(Q)(); o.big = M; o.mono = true; return o;
}
/* ---------- MOD 10 · FRAZEOLÓGIA (ICAO Annex 10 zv. II, Doc 9432) ---------- */
const GQ_PW = [['ACKNOWLEDGE', 'Potvrďte, že ste správu prijali a porozumeli jej'], ['AFFIRM', 'Áno'], ['APPROVED', 'Navrhovaný úkon je povolený'], ['BREAK', 'Oddeľujem časti jednej správy'], ['BREAK BREAK', 'Oddeľujem správy pre rôzne lietadlá v hustej prevádzke'], ['CANCEL', 'Zrušte skôr vydané povolenie'], ['CHECK', 'Skontrolujte systém alebo postup'], ['CLEARED', 'Povolené pokračovať za stanovených podmienok'], ['CONFIRM', 'Žiadam overenie povolenia, pokynu alebo informácie'], ['CONTACT', 'Nadviažte rádiové spojenie s …'], ['CORRECT', 'Je to tak, správne'], ['CORRECTION', 'Vo vysielaní bola chyba, správne znenie je …'], ['DISREGARD', 'Nevšímajte si to, akoby správa nebola vyslaná'], ['HOW DO YOU READ', 'Aká je čitateľnosť môjho vysielania?'], ['I SAY AGAIN', 'Opakujem pre zrozumiteľnosť alebo dôraz'], ['MAINTAIN', 'Pokračujte podľa stanovených podmienok, udržujte'], ['MONITOR', 'Počúvajte na frekvencii …'], ['NEGATIVE', 'Nie, povolenie nie je vydané alebo to nie je správne'], ['READ BACK', 'Zopakujte mi celú správu alebo jej časť presne tak, ako ste ju prijali'], ['RECLEARED', 'Posledné povolenie sa mení, toto nové ho nahrádza'], ['REPORT', 'Odovzdajte mi túto informáciu'], ['REQUEST', 'Chcel by som vedieť alebo dostať …'], ['ROGER', 'Prijal som celé vaše posledné vysielanie'], ['SAY AGAIN', 'Zopakujte všetko alebo časť posledného vysielania'], ['SPEAK SLOWER', 'Hovorte pomalšie'], ['STANDBY', 'Čakajte, zavolám vás'], ['UNABLE', 'Nemôžem vyhovieť vašej žiadosti, pokynu alebo povoleniu'], ['WILCO', 'Rozumiem vašej správe a budem podľa nej postupovať'], ['WORDS TWICE', 'Spojenie je ťažké, každé slovo vysielajte dvakrát'], ['MAYDAY', 'Tieseň — hrozí vážne a bezprostredné nebezpečenstvo'], ['PAN PAN', 'Naliehavosť — stav vyžaduje pomoc, ale nie okamžitú']];
const GQ_ABC = 'Alfa Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliett Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey X-ray Yankee Zulu'.split(' ');
const GQ_PN = [['Ako sa podľa ICAO vyslovuje číslica 9?', 'NIN-er', ['NAJN', 'NINE-ah', 'NOVE']], ['Ako sa podľa ICAO vyslovuje číslica 3?', 'TREE', ['THREE-er', 'TRI', 'TRE-ah']], ['Ako sa podľa ICAO vyslovuje číslica 5?', 'FIFE', ['FAJF', 'FIVE-er', 'FIV']], ['Ako sa podľa ICAO vyslovuje číslica 4?', 'FOW-er', ['FOR', 'FOUR-ah', 'FAU']], ['Ako sa podľa ICAO vyslovuje slovo „thousand“?', 'TOU-SAND', ['THOU-zend', 'TAU-ZN', 'TOUS']], ['Ako sa podľa ICAO vyslovuje desatinná čiarka?', 'DAY-SEE-MAL', ['POINT', 'COMMA', 'DOT']],
  ['Ako sa vysiela FL 100?', 'flight level one hundred', ['flight level one zero zero', 'level ten thousand', 'flight level ten']], ['Ako sa vysiela FL 180?', 'flight level one eight zero', ['flight level one hundred eighty', 'flight level eighteen', 'level one eight thousand']], ['Ako sa vysiela výška 2 500 ft?', 'two thousand five hundred feet', ['two five zero zero feet', 'twenty-five hundred feet', 'two point five thousand feet']], ['Ako sa vysiela kurz 080?', 'heading zero eight zero', ['heading eighty', 'heading eight zero', 'heading zero eighty degrees']],
  ['Ako sa vysiela frekvencia 121,500 MHz?', 'one two one decimal five', ['one twenty-one point five', 'one two one five zero zero', 'one two one comma five']], ['Ako sa vysiela frekvencia 118,105 MHz?', 'one one eight decimal one zero five', ['one one eight decimal one', 'one eighteen one oh five', 'one one eight point one zero five']], ['Ako sa vysiela kód odpovedača 7000?', 'squawk seven thousand', ['squawk seven zero zero zero', 'squawk seventy hundred', 'code seven triple zero']], ['Ako sa vysiela kód odpovedača 2301?', 'squawk two three zero one', ['squawk twenty-three zero one', 'squawk two thousand three hundred one', 'squawk two three oh one']],
  ['Ako sa vysiela QNH 998?', 'QNH niner niner eight', ['QNH nine hundred ninety-eight', 'QNH nine nine eight hectopascals point', 'QNH ninety-nine eight']], ['Ako sa vysiela dráha 27L?', 'runway two seven left', ['runway twenty-seven left', 'runway two seven lima', 'runway two hundred seventy left']], ['Ako sa vysiela vietor 240° / 15 kt?', 'wind two four zero degrees one five knots', ['wind two forty at fifteen', 'wind two four zero one five', 'wind south-west fifteen knots']],
  ['Čo znamená čitateľnosť 5?', 'dokonale čitateľné', ['nečitateľné', 'čitateľné s ťažkosťami', 'čitateľné občas']], ['Čo znamená čitateľnosť 1?', 'nečitateľné', ['dokonale čitateľné', 'čitateľné', 'čitateľné s ťažkosťami']], ['Čo znamená čitateľnosť 3?', 'čitateľné, ale s ťažkosťami', ['čitateľné občas', 'čitateľné', 'nečitateľné']]];
const GQ_RB = [['nastavenie výškomera (QNH)', 1], ['pridelený kód odpovedača SSR', 1], ['pokyn na zmenu hladiny', 1], ['pridelený kurz', 1], ['pokyn na rýchlosť', 1], ['dráhu v používaní', 1], ['povolenie na vzlet', 1], ['povolenie na pristátie', 1], ['pokyn vyčkať pred dráhou', 1], ['povolenie križovať dráhu', 1], ['traťové povolenie', 1], ['prevodnú hladinu', 1], ['novo pridelenú frekvenciu', 1], ['informáciu o vetre', 0], ['informáciu o okolitej prevádzke', 0], ['informáciu o stave počasia na letisku', 0], ['pozdrav pri odovzdaní spojenia', 0]];
function gqPhrase(sub, weak) {
  if (sub === 'abc') { const i = gqInt(0, 25), L = String.fromCharCode(65 + i); return Math.random() < 0.5 ? gqMk('HLÁSKOVACIA ABECEDA', 'Ako sa hláskuje toto písmeno?', GQ_ABC[i], GQ_ABC.filter(w => w[0] === L || Math.random() < 0.3), { big: L, text: [GQ_ABC[i]].concat({ A: ['ALPHA'], J: ['JULIET'], X: ['XRAY'] }[L] || []) }) : gqMk('HLÁSKOVACIA ABECEDA', 'Ktoré písmeno je to?', L, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), { big: GQ_ABC[i] }); }
  if (sub === 'num') { const x = gqR(GQ_PN); return gqMk('ČÍSLA V SPOJENÍ', x[0], x[1], x[2], { exp: 'Podľa ICAO Annex 10 zv. II: číslice sa vysielajú jednotlivo; celé stovky a tisíce pri výškach, hladinách, dohľadnosti a kódoch slovami HUN-dred a TOU-SAND.' }); }
  if (sub === 'rb') { const x = gqR(GQ_RB), o = ['ÁNO — treba to zopakovať', 'NIE — stačí potvrdiť príjem']; return { cat: 'SPÄTNÉ ČÍTANIE', prompt: 'Musí pilot spätne prečítať (read back) ' + x[0] + '?', opts: o, ans: x[1] ? 0 : 1, exp: 'Spätne sa čítajú: traťové povolenia, povolenia a pokyny týkajúce sa dráhy (vstup, vzlet, pristátie, vyčkávanie, križovanie), dráha v používaní, nastavenie výškomera, kódy SSR, nová frekvencia, hladiny, kurzy, rýchlosti a prevodná hladina. Ostatné stačí potvrdiť.' }; }
  if (weak && weak.length) { const id = gqR(weak), x = GQ_PW.find(y => 'ph:' + y[0] === id); if (x) return gqMk('ŠTANDARDNÉ SLOVÁ', 'Čo znamená toto slovo v rádiovom spojení?', x[1], GQ_PW.map(y => y[1]), { big: x[0], id }); }
  const x = gqR(GQ_PW);
  return Math.random() < 0.6 ? gqMk('ŠTANDARDNÉ SLOVÁ', 'Čo znamená toto slovo v rádiovom spojení?', x[1], GQ_PW.map(y => y[1]), { big: x[0], id: 'ph:' + x[0] }) : gqMk('ŠTANDARDNÉ SLOVÁ', 'Ktorým slovom to povieš?', x[0], GQ_PW.map(y => y[0]), { sub: '„' + x[1] + '“', id: 'ph:' + x[0], text: [x[0]].concat(x[0] === 'PAN PAN' ? ['PAN'] : x[0] === 'AFFIRM' ? ['AFFIRMATIVE'] : []) });
}
/* ---------- MOD 11 · POČTY Z HLAVY ---------- */
function gqCalc(sub) {
  const k = sub === 'all' ? gqR(['tl', 'td', 'td', 'des', 'unit', 'unit']) : sub;
  if (k === 'tl') { const q = gqInt(975, 1040), need = 10000 + (1013 - q) * 27 + 1000, fl = Math.ceil(need / 1000) * 10;
    return gqMk('PREVODNÁ HLADINA', 'QNH je ' + q + ' hPa a prevodná výška (TA) je 10 000 ft. Aká je prevodná hladina?', 'FL ' + fl, ['FL ' + (fl - 10), 'FL ' + (fl + 10), 'FL ' + (fl + 20), 'FL 100'], { num: { val: fl, unit: 'FL', tol: 0 }, exp: 'TL musí byť aspoň 1 000 ft nad TA. Rozdiel tlaku ' + (1013 - q) + ' hPa × 27 ft = ' + (1013 - q) * 27 + ' ft; výška 10 000 ft má pri štandardnom tlaku ' + (10000 + (1013 - q) * 27) + ' ft, plus 1 000 ft = ' + need + ' ft → najbližšia vyššia použiteľná hladina je FL ' + fl + '. Je to odhad pravidlom 27 ft na 1 hPa; záväzná je tabuľka v AIP.' }); }
  if (k === 'td') { const gs = gqR([120, 180, 240, 300, 360, 420, 480]), pm = gs / 60;
    if (Math.random() < 0.5) { const t = gqR([2, 3, 4, 5, 6, 10]); return gqNum('ČAS A VZDIALENOSŤ', 'Lietadlo letí GS ' + gs + ' kt. Koľko NM preletí za ' + t + ' min?', pm * t, 'NM', [pm, -pm, 2 * pm, t, -t, 5].filter(d => d), { exp: gs + ' kt je ' + pm + ' NM za minútu; × ' + t + ' min = ' + pm * t + ' NM.' }); }
    const d = pm * gqR([3, 5, 6, 8, 10, 12]); return gqNum('ČAS A VZDIALENOSŤ', 'Lietadlo letí GS ' + gs + ' kt. Za koľko minút preletí ' + d + ' NM?', d / pm, 'min', [1, -1, 2, -2, 3, 5], { exp: gs + ' kt je ' + pm + ' NM za minútu; ' + d + ' NM ÷ ' + pm + ' = ' + d / pm + ' min.' }); }
  if (k === 'des') { if (Math.random() < 0.5) { const gs = gqR([120, 140, 160, 180, 200, 240]); return gqNum('KLESANIE', 'Aké klesanie treba na 3° zostupovej rovine pri GS ' + gs + ' kt?', gs * 5, 'ft/min', [100, -100, 200, -200, gs * 5, -gs * 2], { exp: 'Na 3° platí: klesanie ≈ GS × 5. ' + gs + ' × 5 = ' + gs * 5 + ' ft/min.' }); }
    const from = gqR([60, 90, 120, 150, 180, 240, 300]), to = gqR([3000, 4000, 5000]), d = Math.round((from * 100 - to) / 300); return gqNum('KLESANIE', 'Lietadlo je vo FL ' + String(from).padStart(3, '0') + ' a má klesnúť na ' + to + ' ft po 3° rovine. Koľko NM na to približne potrebuje?', d, 'NM', [5, -5, 10, -10, Math.round(d / 2), d].filter(x => x), { exp: 'Na 3° klesá lietadlo asi 300 ft na 1 NM. Rozdiel ' + (from * 100 - to) + ' ft ÷ 300 ≈ ' + d + ' NM.' }); }
  const o = gqCalcU(); if (o.num && /JEDNOTKY/.test(o.cat)) o.num.tol = Math.max(1, Math.abs(o.num.val) * 0.02); return o;
}
function gqCalcU() {
  const u = gqInt(0, 5);
  if (u === 0) { const n = gqR([5, 10, 20, 30, 50, 100]); return gqNum('JEDNOTKY', 'Koľko kilometrov je ' + n + ' NM?', +(n * 1.852).toFixed(1), 'km', [n * 0.15, -n * 0.2, n * 0.3, -n * 0.85, n].map(x => +x.toFixed(1)), { exp: '1 NM = 1,852 km. ' + n + ' × 1,852 = ' + String((n * 1.852).toFixed(1)).replace('.', ',') + ' km.' }); }
  if (u === 1) { const n = gqR([1000, 2000, 3000, 5000, 10000]); return gqNum('JEDNOTKY', 'Koľko metrov je približne ' + n + ' ft?', Math.round(n * 0.3048), 'm', [n * 0.03, -n * 0.03, n * 0.1, -n * 0.1, n * 0.7].map(Math.round), { exp: '1 ft = 0,3048 m (zhruba tretina metra). ' + n + ' ft ≈ ' + Math.round(n * 0.3048) + ' m.' }); }
  if (u === 2) { const n = gqR([100, 120, 150, 200, 250, 300]); return gqNum('JEDNOTKY', 'Koľko km/h je približne ' + n + ' kt?', Math.round(n * 1.852), 'km/h', [20, -20, 40, -40, n, -Math.round(n * 0.8)], { exp: '1 kt = 1,852 km/h. ' + n + ' × 1,852 ≈ ' + Math.round(n * 1.852) + ' km/h.' }); }
  if (u === 3) { const h = 5 * gqInt(1, 72), r = (h + 180 - 1) % 360 + 1; return gqMk('KURZY', 'Aký je opačný kurz ku kurzu ' + String(h).padStart(3, '0') + '°?', String(r).padStart(3, '0') + '°', [r + 10, r - 10, r + 20, r - 20, r + 90, r - 90].map(x => String((x + 359) % 360 + 1).padStart(3, '0') + '°'), { exp: 'Opačný kurz = kurz ± 180°. ' + h + ' ' + (h > 180 ? '− 180' : '+ 180') + ' = ' + r + '.' }); }
  if (u === 4) { const t = gqInt(8, 28), td = t - gqInt(2, 12); return gqNum('ODHADY', 'Teplota je ' + t + ' °C a rosný bod ' + td + ' °C. V akej výške je približne základňa kopovitej oblačnosti?', (t - td) * 400, 'ft', [400, -400, 800, -800, (t - td) * 100, 1200], { exp: 'Rozdiel teploty a rosného bodu × 400 ft. (' + t + ' − ' + td + ') × 400 = ' + (t - td) * 400 + ' ft.' }); }
  const off = gqInt(1, 6), dist = gqR([30, 60, 90, 120]); return gqNum('ODHADY', 'Lietadlo je po ' + dist + ' NM letu o ' + off * dist / 60 + ' NM mimo trate. O koľko stupňov sa odchýlilo?', off, '°', [1, -1, 2, -2, 3, 5], { exp: 'Pravidlo 1 v 60: 1° odchýlky = 1 NM mimo trate po 60 NM. ' + off * dist / 60 + ' NM ÷ ' + dist + ' NM × 60 = ' + off + '°.' });
}
/* ---------- MOD 12 · SKRATKY (ICAO Doc 8400) ---------- */
const GQ_AB = [['ACC', 'oblastné stredisko riadenia'], ['APP', 'približovacie stanovište riadenia'], ['TWR', 'letisková riadiaca veža'], ['ATC', 'riadenie letovej prevádzky'], ['ATS', 'letové prevádzkové služby'], ['ATM', 'manažment letovej prevádzky'], ['ATFM', 'riadenie toku letovej prevádzky'], ['ASM', 'manažment vzdušného priestoru'], ['FIS', 'letová informačná služba'], ['AFIS', 'letisková letová informačná služba'], ['ALRS', 'pohotovostná služba'], ['SAR', 'pátranie a záchrana'], ['FIR', 'letová informačná oblasť'], ['UIR', 'horná letová informačná oblasť'], ['CTR', 'riadený okrsok letiska'], ['TMA', 'koncová riadená oblasť'], ['CTA', 'riadená oblasť'], ['TRA', 'dočasne rezervovaný priestor'], ['TSA', 'dočasne vyhradený priestor'], ['FUA', 'pružné využívanie vzdušného priestoru'], ['FRA', 'priestor voľných tratí'], ['RVSM', 'znížené minimum vertikálneho rozstupu'],
  ['IFR', 'pravidlá letu podľa prístrojov'], ['VFR', 'pravidlá letu za viditeľnosti'], ['IMC', 'meteorologické podmienky na let podľa prístrojov'], ['VMC', 'meteorologické podmienky na let za viditeľnosti'], ['SID', 'štandardný prístrojový odlet'], ['STAR', 'štandardný prístrojový prílet'], ['FL', 'letová hladina'], ['TA', 'prevodná nadmorská výška'], ['TL', 'prevodná hladina'], ['MSA', 'minimálna sektorová nadmorská výška'], ['DA', 'nadmorská výška rozhodnutia'], ['MDA', 'minimálna nadmorská výška pre klesanie'], ['RVR', 'dráhová dohľadnosť'],
  ['ILS', 'systém na presné priblíženie podľa prístrojov'], ['VOR', 'VKV všesmerový rádiomaják'], ['DME', 'merač vzdialenosti'], ['NDB', 'nesmerový rádiomaják'], ['GNSS', 'globálny navigačný družicový systém'], ['RNAV', 'priestorová navigácia'], ['PSR', 'primárny prehľadový radar'], ['SSR', 'sekundárny prehľadový radar'], ['ADS-B', 'automatický závislý prehľad — vysielanie'], ['MLAT', 'multilaterácia'], ['CPDLC', 'dátové spojenie riadiaci – pilot'], ['ACAS', 'palubný protizrážkový systém'], ['STCA', 'krátkodobé varovanie pred konfliktom'], ['MSAW', 'varovanie pred minimálnou bezpečnou výškou'], ['ELT', 'núdzový polohový maják'], ['SELCAL', 'systém výberového volania'],
  ['AIP', 'letecká informačná príručka'], ['NOTAM', 'oznámenie pre letecký personál o zmene alebo nebezpečenstve'], ['AIRAC', 'pravidelný systém zmien leteckých informácií'], ['AIC', 'letecký obežník'], ['ATIS', 'automatická informačná služba koncovej oblasti'], ['VOLMET', 'meteorologické informácie pre lietadlá za letu'], ['SIGMET', 'informácia o význačnom počasí na trati'], ['TAF', 'letisková predpoveď'], ['METAR', 'pravidelná letisková meteorologická správa'],
  ['ETA', 'predpokladaný čas príletu'], ['ETD', 'predpokladaný čas odletu'], ['EOBT', 'predpokladaný čas začatia pohybu z miesta státia'], ['CTOT', 'vypočítaný čas vzletu'], ['FPL', 'podaný letový plán'], ['UTC', 'koordinovaný svetový čas'], ['RWY', 'dráha'], ['TWY', 'rolovacia dráha'], ['THR', 'prah dráhy'], ['TORA', 'použiteľná dĺžka rozjazdu'], ['LDA', 'použiteľná dĺžka pristátia'], ['PAPI', 'svetelná sústava indikácie zostupovej roviny'], ['LVP', 'postupy za nízkej dohľadnosti'], ['MTOW', 'maximálna vzletová hmotnosť'], ['TAS', 'pravá vzdušná rýchlosť'], ['IAS', 'indikovaná vzdušná rýchlosť'], ['GS', 'rýchlosť voči zemi'],
  ['ANSP', 'poskytovateľ letových navigačných služieb'], ['ICAO', 'Medzinárodná organizácia civilného letectva'], ['EASA', 'Agentúra Európskej únie pre bezpečnosť letectva'], ['CNS', 'komunikácia, navigácia a prehľad'], ['AIS', 'letecká informačná služba'], ['MET', 'meteorologická služba']];
const GQ_QC = [['QNH', 'tlak prepočítaný na hladinu mora — výškomer ukazuje nadmorskú výšku'], ['QFE', 'tlak na úrovni letiska — výškomer na zemi ukazuje nulu'], ['QNE', 'štandardné nastavenie 1013,25 hPa — výškomer ukazuje letovú hladinu'], ['QDM', 'magnetický kurz k stanici'], ['QDR', 'magnetické zameranie od stanice'], ['QTE', 'zemepisné zameranie od stanice'], ['QUJ', 'zemepisný kurz k stanici'], ['QFU', 'magnetický smer dráhy'], ['QSY', 'prelaďte na inú frekvenciu']];
const GQ_REG = [['Slovensko', 'OM'], ['Česko', 'OK'], ['Rakúsko', 'OE'], ['Maďarsko', 'HA'], ['Poľsko', 'SP'], ['Ukrajina', 'UR'], ['Nemecko', 'D'], ['Švajčiarsko', 'HB'], ['Taliansko', 'I'], ['Francúzsko', 'F'], ['Spojené kráľovstvo', 'G'], ['Írsko', 'EI'], ['Holandsko', 'PH'], ['Belgicko', 'OO'], ['Španielsko', 'EC'], ['Portugalsko', 'CS'], ['Švédsko', 'SE'], ['Nórsko', 'LN'], ['Dánsko', 'OY'], ['Fínsko', 'OH'], ['Rumunsko', 'YR'], ['Bulharsko', 'LZ'], ['Chorvátsko', '9A'], ['Slovinsko', 'S5'], ['Srbsko', 'YU'], ['Grécko', 'SX'], ['Turecko', 'TC'], ['Malta', '9H'], ['Spojené štáty americké', 'N'], ['Kanada', 'C'], ['Spojené arabské emiráty', 'A6'], ['Katar', 'A7']];
function gqAbbr(sub, weak) {
  if (sub === 'px') {   // prefixy ICAO kódov letísk podľa štátu
    const P = []; ICAO_STATES.forEach(x => { if (!P.some(y => y.name === x.name)) P.push(x); }); const x = gqR(P);
    return Math.random() < 0.65 ? gqMk('PREFIXY ŠTÁTOV', 'Ktorým prefixom sa začínajú ICAO kódy letísk tohto štátu?', x.p, P.map(y => y.p), { big: x.name, text: ICAO_STATES.filter(y => y.name === x.name).map(y => y.p) })
      : gqMk('PREFIXY ŠTÁTOV', 'Ktorému štátu patrí tento prefix ICAO kódov letísk?', x.name, P.filter(y => y.p !== x.p).map(y => y.name), { big: x.p });
  }
  if (sub === 'reg') { const x = gqR(GQ_REG); return Math.random() < 0.65 ? gqMk('REGISTRAČNÉ ZNAČKY', 'Akou značkou sa začína registrácia lietadiel tohto štátu?', x[1], GQ_REG.map(y => y[1]), { big: x[0], text: [x[1]] }) : gqMk('REGISTRAČNÉ ZNAČKY', 'Ktorému štátu patrí táto registračná značka?', x[0], GQ_REG.map(y => y[0]), { big: x[1] + '-…' }); }
  const L = sub === 'q' ? GQ_QC : GQ_AB, cat = sub === 'q' ? 'Q-KÓDY' : 'SKRATKY';
  let x = gqR(L); if (weak && weak.length) { const id = gqR(weak), y = L.find(z => 'ab:' + z[0] === id); if (y) x = y; }
  return sub === 'm2a' ? gqMk(cat, 'Ktorá skratka to je?', x[0], L.map(y => y[0]), { sub: '„' + x[1] + '“', id: 'ab:' + x[0], text: [x[0]] }) : gqMk(cat, 'Čo znamená táto skratka?', x[1], L.map(y => y[1]), { big: x[0], id: 'ab:' + x[0] });
}
/* ---------- jadro: stav, vykreslenie, odpoveď ---------- */
function gqState() {
  const M = GQ.M[state.mode];
  if (!GQ.st || GQ.st.mode !== state.mode) { const sv = lsGet(GQ_SUBK, {})[state.mode]; const av = lsGet(GQ_ANSK, 'mix'); GQ.st = { mode: state.mode, sub: M.subs.some(x => x[0] === sv) ? sv : M.subs[0][0], q: null, picked: -1, n: 0, weak: false, last: '', ans: ['mix', 'choice', 'type'].indexOf(av) >= 0 ? av : 'mix' }; }
  return GQ.st;
}
function gqWeakIds(mode) { const W = lsGet(GQ_WK, {}), pre = { theory: 'th:', phrase: 'ph:', abbr: 'ab:' }[mode]; return pre ? Object.keys(W).filter(k => k.indexOf(pre) === 0 && W[k] > 0) : []; }
function gqNext() {
  const S = gqState(), M = GQ.M[S.mode]; let q = null, weak = S.weak ? gqWeakIds(S.mode).filter(id => S.mode !== 'theory' || S.sub === 'all' || id.indexOf('th:' + S.sub + ':') === 0) : null;
  if (S.weak && !weak.length) S.weak = false;
  for (let i = 0; i < 12; i++) { q = M.gen(S.sub, S.weak ? weak : null); const key = (q.big || '') + q.prompt + (q.sub || '') + (q.img || ''); if (q.opts.length >= 2 && q.ans >= 0 && key !== S.last) { S.last = key; break; } }
  /* dá sa otázka písať? podľa nastavenia ODPOVEĎ sa z nej stane písacia (text alebo číslo) */
  const can = !!(q.text || q.num);
  q.typed = can && (q.only === 'type' || S.ans === 'type' || (S.ans === 'mix' && Math.random() < 0.5)) ? (q.num ? 'num' : 'text') : '';
  S.q = q; S.picked = -1; S.t = null; S.given = '';
}
function renderGQ(card) {
  const S = gqState(), M = GQ.M[S.mode]; if (!S.q) gqNext();
  const q = S.q, done = S.picked >= 0, ok = done && S.picked === q.ans;
  if (q.typed && !done && document.activeElement && document.activeElement.id === 'gq-txt') return;   // počas písania neprekresľuj
  document.getElementById('qnum').textContent = S.n + 1; document.getElementById('qtotal').textContent = '∞';
  document.getElementById('mode-label').textContent = M.tag + ' · ' + M.name;
  card.innerHTML = `<div class="gq${done ? ' done' : ''}">
      <div class="gq-cat">${dqEsc(q.cat)}${S.weak ? ' · <b>LEN MOJE CHYBY</b>' : ''}</div>
      ${q.img ? `<div class="gq-img" data-img="${dqEsc(q.img)}">${DQ.imgU && DQ.imgU[q.img] ? `<img src="${dqEsc(DQ.imgU[q.img])}" alt="">` : '<span>načítavam fotku…</span>'}</div>` : ''}
      ${q.big ? `<div class="gq-big${q.mono ? ' mono' : ''}">${dqEsc(q.big)}</div>` : ''}
      <h2 class="gq-q">${dqEsc(q.prompt)}</h2>${q.sub ? `<p class="gq-sub">${dqEsc(q.sub)}</p>` : ''}
      ${q.typed ? (done ? `<div class="gq-typed ${ok ? 'ok' : 'no'}"><small>TVOJA ODPOVEĎ</small><b>${dqEsc(S.given || '—')}</b></div>`
        : `<div class="gq-in"><input type="text" id="gq-txt" ${q.typed === 'num' ? 'inputmode="decimal"' : ''} placeholder="${q.typed === 'num' ? 'napíš číslo' + (q.num.unit ? ' (' + dqEsc(q.num.unit) + ')' : '') : 'napíš odpoveď'}" autocomplete="off" autocapitalize="characters" spellcheck="false">${q.typed === 'num' && q.num.unit ? `<u>${dqEsc(q.num.unit)}</u>` : ''}<button class="btn" id="gq-send">POTVRDIŤ ▶</button></div>`)
      : `<div class="gq-opts n${q.opts.length}">${q.opts.map((o, i) => `<button class="choice-btn${done ? (i === q.ans ? ' ok' : i === S.picked ? ' no' : ' gone') : ''}" data-gq="${i}" ${done ? 'disabled' : ''}>${dqEsc(o)}</button>`).join('')}</div>`}
      ${done ? `<div class="gq-exp ${ok ? 'ok' : 'no'}"><b>${ok ? '✓ Správne' + (q.typed ? ' · píšeš z hlavy, 2 body' : '') : '✗ Nesprávne — správne je: ' + dqEsc(q.opts[q.ans])}${!ok && q.typed === 'num' && isFinite(S.diff) ? ' · bol si vedľa o ' + String(+S.diff.toFixed(2)).replace('.', ',') + (q.num.unit && q.num.unit !== 'FL' ? ' ' + dqEsc(q.num.unit) : '') : ''}</b>${q.exp ? `<span>${dqEsc(q.exp)}</span>` : ''}</div><div class="gq-act"><button class="btn" id="gq-next">ĎALŠIA OTÁZKA ▶</button><small>alebo Enter</small></div>` : q.typed ? '<p class="gq-hint">Napíš odpoveď a stlač Enter. ' + (q.typed === 'num' ? 'Píš len číslo.' : 'Na veľkosti písmen ani diakritike nezáleží.') + '</p>' : '<p class="gq-hint">Klikni na odpoveď alebo stlač 1 – ' + q.opts.length + '.</p>'}
    </div>`;
  card.querySelectorAll('[data-gq]').forEach(b => { b.onclick = () => gqPick(+b.dataset.gq); });
  const nx = document.getElementById('gq-next'); if (nx) nx.onclick = gqGo;
  const ti = document.getElementById('gq-txt'), ts = document.getElementById('gq-send');
  if (ti) { const send = () => { const v = ti.value.trim(); if (!v) { ti.focus(); return; } ti.blur(); gqType(v); }; ts.onclick = send; ti.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); send(); } }); if (window.matchMedia('(hover:hover)').matches) ti.focus(); }
  const im = card.querySelector('.gq-img'); if (im && !im.querySelector('img')) dqPhoto(im.dataset.img).then(src => { if (im.isConnected && !im.querySelector('img')) im.innerHTML = src ? `<img src="${dqEsc(src)}" alt="">` : '<span>Fotku sa nepodarilo načítať.</span>'; });
}
function gqPick(i) {
  const S = GQ.st; if (!S || !S.q || S.picked >= 0 || !GQ.M[state.mode]) return;
  const q = S.q, ok = i === q.ans; S.picked = i === -2 ? q.opts.length + 9 : i;
  if (ok) { state.correct++; state.streak++; if (state.streak > state.bestStreak) state.bestStreak = state.streak; } else { state.wrong++; state.streak = 0; }
  if (q.id) { const W = lsGet(GQ_WK, {}); if (ok) { if (W[q.id]) { W[q.id]--; if (W[q.id] <= 0) delete W[q.id]; } } else W[q.id] = Math.min(5, (W[q.id] || 0) + 1); lsSet(GQ_WK, W); }
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  renderStats(); rkSample(); renderGQ(document.getElementById('qcard')); renderFilters();
  clearTimeout(S.t); if (ok && !q.exp) S.t = setTimeout(() => { if (GQ.st === S && S.picked >= 0) gqGo(); }, 850);
}
/* písaná odpoveď: text sa porovná s uznanými tvarmi, číslo s toleranciou */
function gqType(v) {
  const S = GQ.st; if (!S || !S.q || S.picked >= 0) return; const q = S.q; let ok;
  if (q.typed === 'num') { const n = gqParse(v); S.diff = Math.abs(n - q.num.val); ok = isFinite(n) && S.diff <= (q.num.tol || 0) + 1e-9; }
  else { const g = gqNorm(v); ok = (q.text || []).some(t => gqNorm(t) === g); }
  S.given = v; gqPick(ok ? q.ans : -2);
}
function gqGo() { const S = GQ.st; if (!S || !GQ.M[state.mode]) return; clearTimeout(S.t); S.n++; gqNext(); renderGQ(document.getElementById('qcard')); }
function gqFilters(el) {
  const S = gqState(), M = GQ.M[S.mode], W = M.pool ? gqWeakIds(S.mode).length : 0;
  el.innerHTML = `<div class="f-row"><span class="f-lab">${S.mode === 'theory' ? 'OKRUH' : 'REŽIM'}</span><div class="f-opts">${M.subs.map(x => `<button class="filter-chip${S.sub === x[0] ? ' on' : ''}" data-gqsub="${x[0]}">${x[1]}</button>`).join('')}</div></div>
    <div class="f-row"><span class="f-lab">ODPOVEĎ</span><div class="f-opts">${[['mix', 'MIX — výber aj písanie'], ['choice', 'LEN VÝBER'], ['type', 'PÍSANIE, kde sa dá (2 body)']].map(x => `<button class="filter-chip${S.ans === x[0] ? ' on' : ''}" data-gqans="${x[0]}">${x[1]}</button>`).join('')}</div></div>
    ${M.pool ? `<div class="f-row"><span class="f-lab">OPAKOVANIE</span><div class="f-opts"><button class="filter-chip${S.weak ? ' on' : ''}" data-gqweak="1" ${W ? '' : 'disabled'}>LEN MOJE CHYBY (${W})</button><button class="filter-chip" data-gqclear="1" ${W ? '' : 'disabled'}>VYMAZAŤ CHYBY</button></div></div>` : ''}`;
  el.querySelectorAll('[data-gqsub]').forEach(b => { b.onclick = () => { S.sub = b.dataset.gqsub; const A = lsGet(GQ_SUBK, {}); A[S.mode] = S.sub; lsSet(GQ_SUBK, A); S.weak = false; gqNext(); renderGQ(document.getElementById('qcard')); gqFilters(el); }; });
  el.querySelectorAll('[data-gqans]').forEach(b => { b.onclick = () => { S.ans = b.dataset.gqans; lsSet(GQ_ANSK, S.ans); gqNext(); renderGQ(document.getElementById('qcard')); gqFilters(el); }; });
  el.querySelectorAll('[data-gqweak]').forEach(b => { b.onclick = () => { S.weak = !S.weak; gqNext(); renderGQ(document.getElementById('qcard')); gqFilters(el); }; });
  el.querySelectorAll('[data-gqclear]').forEach(b => { b.onclick = () => { const A = lsGet(GQ_WK, {}), pre = { theory: 'th:', phrase: 'ph:', abbr: 'ab:' }[S.mode]; Object.keys(A).forEach(k => { if (k.indexOf(pre) === 0) delete A[k]; }); lsSet(GQ_WK, A); S.weak = false; gqFilters(el); renderGQ(document.getElementById('qcard')); }; });
}
document.addEventListener('keydown', e => {
  if (!GQ.M[state.mode] || !GQ.st || !GQ.st.q || e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target && e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
  if (document.getElementById('hp-wrap') || document.getElementById('mods-wrap') || document.getElementById('lv-wrap') || document.getElementById('wkl-wrap')) return;
  if (GQ.st.picked >= 0) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); gqGo(); } return; }
  if (GQ.st.q.typed) return;
  const n = parseInt(e.key, 10); if (n >= 1 && n <= GQ.st.q.opts.length) { e.preventDefault(); gqPick(n - 1); }
});
/* privítanie na úvode (v4.11): neprihlásenému ponúkne registráciu, prihlásenému ukáže, kde je a čo ho dnes čaká */
function homeHelloHTML() {
  if (!RK.acct) return `<div class="home-hello out" id="home-hello"><div class="hh-wave">👋</div><div class="hh-main"><h2>Vitaj v ATCO Traineri</h2>
      <p>Cvičiť môžeš hneď, aj bez účtu. Keď sa <b>zaregistruješ</b> — stačí prezývka a heslo — začnú sa ti počítať body, uvidíš sa v rebríčku, postupuješ v úrovniach a pokrok máš na každom zariadení.</p>
      <div class="hh-acts"><button class="btn" data-go="profile">ZAREGISTROVAŤ SA ▶</button><button class="btn ghost" data-go="profile">MÁM ÚČET</button><button class="btn ghost" data-go="about">❓ O STRÁNKE</button></div></div></div>`;
  const r = (RK.rows || []).find(x => x.nick === RK.acct.nick), tot = r ? rkTotal(r) : 0, L = rkLevel(tot);
  const hr = new Date().getHours(), hi = hr < 5 ? 'Ešte hore' : hr < 10 ? 'Dobré ráno' : hr < 18 ? 'Ahoj' : 'Dobrý večer';
  const lg = r ? (r.lg || 1) : 0, inLg = lg ? RK.rows.filter(x => (x.lg || 1) === lg).sort((a, b) => (b.mp || 0) - (a.mp || 0) || a.nick.localeCompare(b.nick)) : [], pos = lg ? inLg.findIndex(x => x.nick === RK.acct.nick) + 1 : 0;
  const on = (SOC.friends || []).filter(f => f.online).length, fr = (SOC.friends || []).filter(f => f.st === 'ok').length, dc = dcDone();
  const nf = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `<div class="home-hello" id="home-hello">
      <div class="hh-top">${avFace(RK.acct.nick, RK.me && RK.me.emoji, 'big')}<div class="hh-main"><h2>${hi}, ${dqEsc(RK.acct.nick)} 👋</h2>
        <p>${dc ? 'Dennú výzvu máš za sebou. ' : 'Dnešná denná výzva na teba ešte čaká. '}${!r ? 'Načítavam tvoje body…' : L.next ? `Do úrovne <b>${dqEsc(L.nextName)}</b> ti chýba <b>${nf(L.next - tot)} b.</b>` : 'Si na najvyššej úrovni.'}</p></div></div>
      <div class="hh-tiles">
        <button class="hh-t lv" data-lvopen="${tot}"><small>ÚROVEŇ ${L.n}</small><b>${dqEsc(L.name)}</b><i><em style="width:${L.pct == null ? 100 : Math.max(3, Math.round(L.pct))}%"></em></i><span>${nf(tot)} bodov spolu</span></button>
        <button class="hh-t" data-go="rank" style="--c:${LGC[lg || 1]}"><small>LIGA · TENTO MESIAC</small><b>${lg ? LG[lg] : '—'}</b><span>${lg ? pos + '. z ' + inLg.length + ' · ' + nf(r.mp || 0) + ' b.' : 'načítavam…'}</span></button>
        <button class="hh-t" data-go="exam"><small>DENNÁ VÝZVA</small><b>${dc ? '✓ HOTOVO' : 'ČAKÁ'}</b><span>${dc ? 'zajtra príde nová' : '20 otázok, jeden pokus denne'}</span></button>
        <button class="hh-t" data-pft="friends"><small>PRIATELIA</small><b>${on ? on + ' online' : fr ? fr : '—'}</b><span>${on ? 'pozvi ich do Dobyvateľa' : fr ? 'teraz nikto nie je online' : 'pridaj si kolegov'}</span></button>
        ${SOC.unread ? `<button class="hh-t new" data-pft="inbox"><small>SPRÁVY</small><b>${SOC.unread} ${SOC.unread === 1 ? 'nová' : SOC.unread < 5 ? 'nové' : 'nových'}</b><span>otvoriť schránku</span></button>` : ''}
      </div></div>`;
}
function homeHelloBind() {
  const h = document.getElementById('home-hello'); if (!h) return;
  h.querySelectorAll('[data-go]').forEach(b => { b.onclick = () => { startMode(b.dataset.go); window.scrollTo(0, 0); }; });
  h.querySelectorAll('[data-pft]').forEach(b => { b.onclick = () => { RK.pfTab = b.dataset.pft; startMode('profile'); window.scrollTo(0, 0); }; });
  if (RK.acct) avNeed([RK.acct.nick]);
  if (RK.acct && Date.now() - (RK.daysT || 0) > 60000) { RK.daysT = Date.now(); rkRpc('atco_my_days', { p_token: RK.acct.token }).then(d => { RK.days = d || []; wkPaint(); }).catch(() => {}); }
  wkLoad();
}
function homeHelloFill() { const h = document.getElementById('home-hello'); if (h) { h.outerHTML = homeHelloHTML(); homeHelloBind(); } }

/* ---------- O STRÁNKE (v4.11): všetko o trenažéri na jednom mieste ---------- */
/* podrobný návod — pôvodne na úvode, od v5.0 na stránke O stránke */
function homeGuideHTML() {
  return `    <div class="home-steps">
      <div><b>1</b><span><strong>Vyber modul</strong> hore v lište (MOD 01 až MOD 06).</span></div>
      <div><b>2</b><span><strong>Nastav si ho</strong> v tabuľke pod otázkou — režim, obtiažnosť a čo sa má skúšať.</span></div>
      <div><b>3</b><span><strong>Odpovedaj.</strong> Čo pokazíš, vráti sa ti neskôr v tom istom cvičení.</span></div>
    </div>
    <details class="home-more"><summary>PODROBNÝ NÁVOD — obrazovka, nastavenia, ako sa učiť</summary>
    <div class="home-h">KDE ČO NA OBRAZOVKE JE</div>
    <div class="home-tips">
      <div><strong>Lišta hore</strong>MODULY otvorí okno so všetkými cvičeniami, vedľa sú DENNÁ VÝZVA, DOBYVATEĽ a REBRÍČEK. Na úvod sa vrátiš kliknutím na ATCO TRAINER.</div>
      <div><strong>Hlavička panelu</strong>Vľavo názov modulu a číslo otázky (napr. 12 / 200). Vpravo CORRECT, WRONG a STREAK — koľko máš správne, zle a koľko správnych za sebou.</div>
      <div><strong>Otázka (stred)</strong>Fotka, kód alebo mapa a pod tým políčko na odpoveď alebo tlačidlá s možnosťami. Po odpovedi sa hneď ukáže, či to bolo správne, a všetko podstatné k danej veci.</div>
      <div><strong>ČO TU ROBÍŠ</strong>Zelený rámček pod otázkou. Jednou-dvoma vetami povie, čo sa v práve zvolenom režime robí. Zmení sa vždy, keď prepneš režim.</div>
      <div><strong>Tabuľka nastavení</strong>Hneď pod tým. Vľavo názov riadku (REŽIM, OBTIAŽNOSŤ, REGION…), vpravo voľby. Zelená voľba je zapnutá. Kliknutím na inú sa cvičenie spustí odznova s novým nastavením.</div>
      <div><strong>SKIP a RESET</strong>Vpravo dole pod tabuľkou. SKIP preskočí otázku (ráta sa ako chyba), RESET spustí cvičenie od začiatku a vynuluje počítadlá.</div>
      <div><strong>WEAK SPOTS (slabé miesta)</strong>Úplne dole. Zbierajú sa tu veci, ktoré si pokazil trikrát a viac — presne tie si treba zopakovať.</div>
      <div><strong>ZVLÁDNUTÉ</strong>V riadku OPAKOVANIE. Počíta otázky, ktoré si zodpovedal správne dvakrát po sebe, z celkového počtu v danom výbere.</div>
    </div>
    <div class="home-h">AKO SI ČO NASTAVIŤ</div>
    <div class="home-tips">
      <div><strong>1. Najprv REŽIM</strong>Prvý riadok tabuľky. Určuje, čo budeš robiť: kvíz, mapu, kartičky, doplňovačku alebo len študijné prezeranie. Ostatné riadky sa podľa neho menia.</div>
      <div><strong>2. Potom OBTIAŽNOSŤ</strong>ĽAHKÁ = vyberáš z možností alebo máš nápovede. HARDCORE = píšeš z hlavy a nič ti nepomáha. Odporúčanie: ľahká, kým nemáš aspoň 80 % správne.</div>
      <div><strong>3. Zmenši si výber</strong>Riadky ako REGION, SEKTOR, SUSED, PÍSMENO alebo BALÍČEK obmedzia, z čoho sa skúša. Malý výber sa naučíš rýchlo; veľký ťa len zahltí.</div>
      <div><strong>4. Sleduj OPAKOVANIE</strong>Keď máš pár chýb, zapni LEN SLABÉ MIESTA. Pôjdu len otázky, ktoré si pokazil, a po správnej odpovedi zo zoznamu vypadnú.</div>
      <div><strong>Nevieš, čo tlačidlo robí?</strong>Podrž nad ním myš. Ukáže sa krátke vysvetlenie — funguje to na každom tlačidle na stránke.</div>
      <div><strong>Chceš začať úplne odznova?</strong>V riadku OPAKOVANIE je VYMAZAŤ POKROK. Zmaže slabé miesta a počítadlo ZVLÁDNUTÉ pre daný modul.</div>
    </div>
    <div class="home-h">AKO SA S TÝM UČIŤ</div>
    <div class="home-tips">
      <div><strong>Radšej 10 minút denne</strong>než dve hodiny raz za týždeň. Krátke opakovanie každý deň drží v hlave oveľa dlhšie.</div>
      <div><strong>Po malých kúskoch</strong>Jeden sektor, jeden sused, jeden balíček 20 volačiek. Až keď ho vieš, pridaj ďalší.</div>
      <div><strong>Najprv pozeraj, potom sa skúšaj</strong>Skoro každý modul má ŠTÚDIUM alebo ZOZNAM. Prejdi si ho pred kvízom, nech nehádaš naslepo.</div>
      <div><strong>Hovor si to nahlas</strong>Hlavne volačky a kurzy. Na frekvencii ich budeš hovoriť, nie písať.</div>
    </div>
    </details>
    <details class="home-more"><summary>ČO PLATÍ VŠADE — obtiažnosť, opakovanie, klávesnica</summary>
    <div class="home-h">ČO PLATÍ VŠADE</div>
    <div class="home-tips">
      <div><strong>ĽAHKÁ a HARDCORE</strong>Každý modul má dve obtiažnosti. Začni ľahkou (výber z možností), potom prejdi na hardcore (písanie z hlavy).</div>
      <div><strong>Opakovanie chýb</strong>Pokazená otázka sa vráti neskôr. Prepínač LEN SLABÉ MIESTA pustí iba to, čo ti nejde.</div>
      <div><strong>Pokrok sa ukladá</strong>Prihláseným do účtu — na inom počítači alebo telefóne pokračuješ tam, kde si skončil. Bez prihlásenia len v tomto zariadení.</div>
      <div><strong>Nápovede</strong>Tlačidlo HINT napovedá po krokoch. Keď podržíš myš nad ktorýmkoľvek tlačidlom, ukáže sa, čo robí.</div>
      <div><strong>Celá obrazovka</strong>Zelené tlačidlo vpravo hore v paneli. Hodí sa pri mapách; späť klávesom Esc.</div>
      <div><strong>Klávesnica</strong>Enter odošle odpoveď a ďalším Enterom (alebo medzerníkom) ideš ďalej. Pri výbere z možností stačí stlačiť číslo 1 až 6. SKIP otázku preskočí, RESET začne cvičenie odznova.</div>
      <div><strong>Opakovanie cez dni</strong>Čo zodpovieš správne, príde znova o 1, 3, 7, 14 a 30 dní. Čo pokazíš, príde hneď zajtra. Stará sa o to DNEŠNÝ TRÉNING.</div>
      <div><strong>Telefón aj notebook</strong>Funguje na oboch. Fotky lietadiel a prevádzkovateľov sa sťahujú z Wikipédie, takže potrebujú internet.</div>
      <div><strong>Je to pomôcka, nie predpis</strong>Údaje sú prepísané z výcvikových podkladov a máp. Ak sa niečo líši od platnej dokumentácie, platí dokumentácia.</div>
    </div>
    </details>`;
}
function renderAbout(card) {
  const hk = m => Object.keys(HELP).find(k => k === m || k.indexOf(m + '.') === 0);
  const mods = MODS_LIST.map(x => `<div class="ab-mod"><div class="ab-ill">${typeof modG === 'function' ? modG(x[0]) : ''}</div><div><small>${x[1]}</small><b>${x[2]}</b><span>${x[3]}</span><p>${hk(x[0]) ? `<button class="btn ghost" data-hp="${hk(x[0])}">❓ VZOR</button>` : ''}<button class="btn" data-go="${x[0]}">OTVORIŤ ▶</button></p></div></div>`).join('');
  const n = Object.keys(DQ_BANK).reduce((a, k) => a + DQ_BANK[k].length, 0);
  const sec = (ico, col, title, body) => `<section class="ab-sec" style="--c:${col}"><h3><i>${ico}</i>${title}</h3>${body}</section>`;
  card.innerHTML = `<div class="ab">
      <div class="ab-hero"><div><small>O STRÁNKE</small><h2>ATCO Trainer</h2><p>Trenažér na veci, ktoré musí riadiaci letovej prevádzky vedieť naspamäť. Tu je všetko o tom, čo tu nájdeš, ako to funguje a čo sa deje s tvojimi údajmi.</p></div><div class="ab-ver">v${APP_VERSION}<span>BETA</span></div></div>
      <div class="ab-jump">${[['ab-co', 'Čo to je'], ['ab-mods', 'Moduly a vzory'], ['ab-ucenie', 'Ako sa učiť'], ['ab-sutaz', 'Body, úrovne, ligy'], ['ab-dq', 'Dobyvateľ'], ['ab-ucet', 'Účet a profil'], ['ab-udaje', 'Údaje'], ['ab-kontakt', 'Kontakt']].map(x => `<a href="#${x[0]}" data-jump="${x[0]}">${x[1]}</a>`).join('')}</div>
      <div id="ab-co">${sec('✈', '#12c274', 'ČO TO JE A AKO TO VZNIKLO', `<p>Vo výcviku riadiaceho je veľa vecí, ktoré sa nedajú odvodiť — treba ich jednoducho vedieť: typy lietadiel a ich označenia, letiská, volačky dopravcov, body na mape, frekvencie, hladiny na koordinačných bodoch. ATCO Trainer vznikol ako pomôcka na presne toto. Spravil ho <b>Denzy</b> počas vlastného výcviku — najprv pre seba, potom pre kolegov z kurzu.</p>
        <p>Skúša ťa počítač, hneď ukáže správnu odpoveď a to, čo pokazíš, ti vracia, kým to nesedí. K tomu pribudli okruhy teórie (${n} otázok), denná výzva, rebríček a hra Dobyvateľ, aby sa dalo učiť aj spolu.</p>
        <p class="ab-warn">Je to <b>pomôcka na učenie</b>, nie oficiálny zdroj a nie nástroj na prevádzku. Keď sa niečo líši od dokumentácie, platí dokumentácia — a budem rád, keď mi chybu nahlásiš.</p>`)}</div>
      <div id="ab-mods">${sec('🧩', '#3a86ff', 'ČO TU NÁJDEŠ — MODULY A VZORY', `<p>Každý modul má tlačidlo <b>❓ VZOR</b>: krátke okno s obrázkami, ktoré ukáže, čo sa v ňom robí. To isté tlačidlo nájdeš aj priamo v module.</p><div class="ab-mods">${mods}</div>
        <div class="ab-row"><div><b>DENNÁ VÝZVA</b><span>20 otázok dňa, pre všetkých rovnaké. Jeden pokus denne.</span><p><button class="btn ghost" data-hp="exam">❓ VZOR</button><button class="btn" data-go="exam">OTVORIŤ ▶</button></p></div>
          <div><b>DOBYVATEĽ</b><span>Hra o slovenský vzdušný priestor pre 2 až 6 hráčov.</span><p><button class="btn ghost" data-hp="conquer">❓ VZOR</button><button class="btn" data-go="conquer">OTVORIŤ ▶</button></p></div>
          <div><b>REBRÍČEK</b><span>Ligy, mapa území, denné aj celkové poradie.</span><p><button class="btn ghost" data-hp="rank">❓ VZOR</button><button class="btn" data-go="rank">OTVORIŤ ▶</button></p></div></div>`)}</div>
      <div id="ab-ucenie">${sec('🧠', '#b45cff', 'AKO SA TU UČIŤ', `<div class="ab-steps"><div><b>1</b><span><strong>Vyber modul</strong> cez MODULY hore v lište a nastav si v tabuľke pod otázkou, čo sa má skúšať.</span></div><div><b>2</b><span><strong>Začni ľahkou obťažnosťou</strong> (výber z možností), potom prejdi na písanie z hlavy — to je to, čo budeš potrebovať.</span></div><div><b>3</b><span><strong>Chyby sa vracajú.</strong> Čo pokazíš, príde znova v tom istom cvičení a zapíše sa do MOJE CHYBY, kde si to pozrieš aj so správnou odpoveďou.</span></div><div><b>4</b><span><strong>Dnešný tréning</strong> ti každý deň namieša to, čo je čas zopakovať — krátko, ale pravidelne.</span></div></div>
        <p>Na úvode je aj vyhľadávanie: napíš kód, volačku, bod alebo frekvenciu a trenažér ukáže, čo o tom vie.</p>
        <div class="ab-guide">${homeGuideHTML()}</div>`)}</div>
      <div id="ab-sutaz">${sec('🏆', '#e0a800', 'BODY, ÚROVNE, LIGY A MAPA', `<div class="ab-grid"><div><b>Body</b><span>Správna odpoveď v cvičení +1, pri písaní z hlavy +2. Denná výzva a Dobyvateľ dávajú viac. Počítajú sa len prihláseným.</span></div>
          <div><b>Úrovne</b><span>58 úrovní — od Uchádzača cez veže a approach po ACC a zahraničné strediská — podľa všetkých bodov, ktoré si kedy získal. <a href="#" data-lvopen="0">Zobraziť všetky ▸</a></span></div>
          <div><b>Ligy</b><span>Päť líg od Bronzu po Diamant. Počítajú sa body za kalendárny mesiac; prví traja postupujú, poslední traja zostupujú.</span></div>
          <div><b>Mapa území</b><span>Slovensko je rozdelené na deväť oblastí, každá patrí jednému modulu. Drží ju ten, kto má v module najviac bodov.</span></div></div>
        ${rkRulesHTML(RK.acct && RK.rows ? rkTotal(RK.rows.find(r => r.nick === RK.acct.nick)) : 0)}
        <p><button class="btn ghost" data-hp="rank">❓ AKO SA POČÍTAJÚ BODY</button><button class="btn" data-go="rank">OTVORIŤ REBRÍČEK ▶</button></p>`)}</div>
      <div id="ab-dq">${sec('⚔', '#e63946', 'DOBYVATEĽ', `<p>Vedomostná hra naživo na mape skutočných priestorov. Každý začína na svojom letisku; kto odpovie správne a najrýchlejšie, berie priestor. Potom prídu súboje o priestory susedov. Vyhráva ten, kto má na konci najviac bodov.</p>
        <div class="ab-grid"><div><b>Ako začať</b><span>Jeden vytvorí miestnosť a pošle ostatným kód zo štyroch písmen. Dá sa hrať aj sám proti počítaču.</span></div><div><b>Žolíky</b><span>Raz za hru 50:50, +10 sekúnd a dvojité body za dobytý priestor.</span></div>
          <div><b>Boosty za úrovne</b><span>${DQ_PERK.map(x => 'od úrovne ' + x[0] + ' ' + x[2]).join(' · ')}. Každý raz za hru; hostiteľ ich vie vypnúť.</span></div><div><b>Otázky</b><span>Z modulov a z deviatich okruhov teórie, niektoré s fotkou. Hostiteľ vie nahrať aj vlastné.</span></div></div>
        <p><button class="btn ghost" id="ab-demo">▶ UKÁZAŤ VZOR HRY</button><button class="btn" data-go="conquer">OTVORIŤ DOBYVATEĽA ▶</button></p>`)}</div>
      <div id="ab-ucet">${sec('👤', '#1fd6d6', 'ÚČET, REGISTRÁCIA A PROFIL', `<div class="ab-grid"><div><b>Registrácia</b><span>Stačí <b>prezývka a heslo</b> (aspoň 8 znakov, písmeno aj číslica). E-mail netreba. Prezývka musí byť jedinečná.</span></div>
          <div><b>Čo ti účet dá</b><span>Body a miesto v rebríčku, úrovne a ligy, priateľov a pozvánky do hry, pokrok v učení na každom zariadení.</span></div>
          <div><b>Profil</b><span>Prehľad, štatistiky po moduloch, graf aktivity, priatelia a správy. V nastaveniach fotka, emoji, pozadie, zmena mena a hesla.</span></div>
          <div><b>Bez účtu</b><span>Všetko cvičenie funguje aj tak. Pokrok ostáva len v tomto prehliadači a body sa nepočítajú.</span></div></div>
        <p><button class="btn ghost" data-hp="profile">❓ VZOR PROFILU</button><button class="btn" data-go="profile">${RK.acct ? 'OTVORIŤ PROFIL ▶' : 'ZAREGISTROVAŤ SA ▶'}</button></p>`)}</div>
      <div id="ab-udaje">${sec('🔒', '#2dc653', 'ČO SA DEJE S ÚDAJMI', `<ul class="ab-list"><li><b>Čo sa ukladá pri účte:</b> prezývka, heslo (len ako zašifrovaný odtlačok — prečítať sa nedá), body a štatistiky, pokrok v učení, priatelia a správy. Dobrovoľne e-mail, fotka a emoji.</li>
          <li><b>Čo vidia ostatní:</b> prezývku, body, úroveň, ligu, fotku alebo emoji. Priatelia navyše to, či si online a čo práve hráš. E-mail nevidí nikto.</li>
          <li><b>Kde to je:</b> v databáze služby Supabase. Bez účtu ostáva všetko len v tvojom prehliadači.</li>
          <li><b>Čo stránka nerobí:</b> žiadne reklamy a žiadne sledovacie nástroje. Fotky lietadiel a obrázky v otázkach sa načítavajú z Wikipédie.</li>
          <li><b>Zmazanie:</b> štatistiky si vynuluješ sám v nastaveniach profilu. Ak chceš zmazať celý účet, napíš mi.</li></ul>`)}</div>
      <div id="ab-kontakt">${sec('✉', '#ff8c2b', 'KONTAKT A CHYBY', `<p>Našiel si chybu v otázke, niečo nefunguje alebo máš nápad? Napíš — každá oprava pomôže aj ostatným.</p>
        <p><a class="btn" href="mailto:davidsvec24.76@gmail.com?subject=ATCO%20Trainer">✉ davidsvec24.76@gmail.com</a><button class="btn ghost" id="ab-bug">⚑ NAHLÁSIŤ CHYBU</button></p>
        <p class="ab-src">Hranice priestorov a údaje o letiskách vychádzajú z verejne dostupných leteckých publikácií. Fotky: Wikipedia / Wikimedia Commons, podľa licencií uvedených pri jednotlivých obrázkoch.</p>`)}</div>
    </div>`;
  card.querySelectorAll('[data-go]').forEach(b => { b.onclick = () => { startMode(b.dataset.go); window.scrollTo(0, 0); }; });
  card.querySelectorAll('[data-jump]').forEach(a => { a.onclick = e => { e.preventDefault(); const t = document.getElementById(a.dataset.jump); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }; });
  const d = document.getElementById('ab-demo'); if (d) d.onclick = () => { startMode('conquer'); dqDemo(); };
  const g = document.getElementById('ab-bug'); if (g) g.onclick = reportBug;
}
function homeDashHTML() {
  const by = poolById(), today = dayNow();
  const due = Object.keys(state.sr).filter(id => by[id] && state.sr[id].due <= today).length;
  const weak = Object.keys(state.mistakes).filter(id => state.mistakes[id] > 0).length;
  const done = state.dailyDone === today;
  return `<div class="home-dash">
      <div class="home-cta">
        <div><strong>DNEŠNÝ TRÉNING</strong><span>${done ? '✓ Dnes už máš hotovo — môžeš si dať ďalšie kolo.' : due || weak ? `Na opakovanie čaká ${due} otázok a ${weak} slabých miest.` : 'Namieša ti otázky zo všetkých modulov. Začni tu.'}</span></div>
        <button class="btn" data-go="daily">SPUSTIŤ ▶</button>
      </div>
      <div class="home-cta alt">
        <div><strong>DENNÁ VÝZVA</strong><span>${dcDone() && dcDone().pts == null ? 'Dnešnú si už začal — pokus je len jeden' : dcDone() ? '✓ Dnešná je hotová' + (dcDone().good != null ? ' — ' + dcDone().good + ' z ' + (dcDone().total || DC_N) + ' správne' : '') + '. Zajtra príde nová.' : '20 otázok dňa, rovnaké pre všetkých. Jeden pokus denne.'}</span></div>
        <button class="btn ghost" data-go="exam">${dcDone() ? 'POZRIEŤ ▶' : 'OTVORIŤ ▶'}</button>
      </div>
    </div>
    <div class="home-dash comp">
      <div class="home-cta gold">
        <div><strong>DOBYVATEĽ</strong><span>Vedomostný súboj o Slovensko naživo — 2 až 6 hráčov alebo sám proti počítaču.</span></div>
        <button class="btn ghost" data-go="conquer">HRAŤ ▶</button>
      </div>
      <div class="home-cta gold">
        <div><strong>REBRÍČEK</strong><span>Mesačné ligy, mapa území, denná výzva a celkové poradie.</span></div>
        <button class="btn ghost" data-go="rank">POZRIEŤ ▶</button>
      </div>
    </div>
    <div class="home-search">
      <input type="text" id="home-q" placeholder="Hľadaj čokoľvek: BAW, LOWW, MEBAN, B738, 134,475, Speedbird…" autocomplete="off" spellcheck="false">
      <div id="home-res"></div>
    </div>`;
}
function homeProgHTML(m) {
  if (m === 'heading') return '<div class="home-prog"><span>Hra — pokrok sa tu neeviduje.</span></div>';
  const p = modProgress(m), pct = Math.round(p.done / Math.max(1, p.total) * 100);
  const last = state.last[m] ? (dayNow() - state.last[m] === 0 ? 'dnes' : dayNow() - state.last[m] === 1 ? 'včera' : 'pred ' + (dayNow() - state.last[m]) + ' dňami') : 'ešte nikdy';
  return `<div class="home-prog"><div class="home-bar"><i style="width:${pct}%"></i></div>
      <span>zvládnuté <b>${p.done} / ${p.total}</b> · slabé miesta <b>${p.weak}</b> · dnes na opakovanie <b>${p.due}</b> · naposledy ${last}</span></div>`;
}
function searchAll(text) {
  const n = normalize(text);
  if (n.length < 2) return '';
  const hit = s => normalize(String(s || '')).indexOf(n) >= 0, out = [];
  const card = (tag, title, body) => `<div><em>${tag}</em><strong>${title}</strong>${body}</div>`;
  AIRCRAFT.filter(a => hit(a.icao) || hit(a.name)).slice(0, 6).forEach(a => out.push(card('MOD 01 · LIETADLO', a.icao + ' — ' + a.name, `WTC ${a.wake} · ${a.engines} · cruise ${a.cruise} · ${a.role}`)));
  AIRPORTS.filter(a => hit(a.icao) || hit(a.city) || hit(a.name)).slice(0, 8).forEach(a => out.push(card('MOD 02 · LETISKO', a.icao + ' — ' + a.city, `${a.name} · ${a.country}`)));
  pxAll().filter(s => normalize(s.p) === n || hit(pxShort(s))).slice(0, 4).forEach(s => out.push(card('MOD 02 · PREFIX', s.p + ' — ' + pxShort(s), 'Oblasť ' + s.p.charAt(0) + ': ' + icaoAreaName(s.p.charAt(0)))));
  CALLSIGNS.filter(c => hit(c.icao) || hit(c.call) || hit(c.airline)).sort((a, b) => b.freq - a.freq).slice(0, 10).forEach(c => out.push(card('MOD 03 · VOLAČKA', c.icao + ' — "' + c.call + '"', (c.airline ? c.airline + ' · ' + c.country : 'prevádzkovateľ neuvedený') + (c.sim ? ' · na simulátore ' + c.freq + '×' : ''))));
  WAYPOINTS.filter(w => hit(w.name)).slice(0, 6).forEach(w => {
    const nb = CO_COP[w.name];
    const rules = nb ? CO_TABLES.filter(t => t.rows.some(r => r[2] === w.name)).map(t => t.rows.filter(r => r[2] === w.name).map(r => `<li>${t.id} · ${r[0] || ''} ${r[1] || ''} → <b>${r[3]}</b>${r[4] ? ' (' + r[4] + ')' : ''}</li>`).join('')).join('') : '';
    out.push(card('MOD 04 · BOD', w.name, `sektor ${SECTOR_NAMES[w.sec]} · ${fmtLat(w.lat)} ${fmtLon(w.lon)}` + (nb ? `<br>koordinačný bod — ${CO_NB[nb].short}<ul>${rules}</ul>` : '')));
  });
  CO_UNITS.filter(u => hit(u.n) || hit(u.f) || hit(u.alt)).slice(0, 8).forEach(u => out.push(card('MOD 06 · STANOVIŠTE', u.n + (u.f ? ' — ' + u.f + ' MHz' : ''), u.lim + ' · ' + CO_NB[u.g].name)));
  return out.length ? `<div class="home-tips search">${out.join('')}</div>` : '<div class="weak-empty" style="padding:10px 2px">— nič som nenašiel —</div>';
}

/* ---------- NAHLÁSIŤ CHYBU: otvorí e-mail s predvyplnenou správou ---------- */
function reportBug() {
  const q = state.current, F = state.filters;
  const where = state.mode === 'home' ? 'Úvod' : (document.getElementById('mode-label').textContent || state.mode);
  const lines = ['ATCO Trainer — nahlásenie chyby', 'Kde: ' + where];
  if (q && q.id) lines.push('Otázka: ' + labelForId(q.id) + ' [' + q.id + ']');
  lines.push('Čo je zle: ');
  lines.push('', 'Verzia: ' + APP_VERSION);
  window.location.href = 'mailto:davidsvec24.76@gmail.com?subject=' + encodeURIComponent('ATCO Trainer — chyba') + '&body=' + encodeURIComponent(lines.join('\n'));
}

/* ---------- klávesy: 1–6 vyberie možnosť, medzerník ide na ďalšiu otázku ---------- */
document.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA');
  if (typing) return;
  if (/^[1-6]$/.test(e.key)) {
    const dqo = document.body.classList.contains('dq-live') ? document.querySelector('#dq-stage .dq-opts') : null;
    const b = dqo ? dqo.querySelector('.choice-btn[data-c="' + (+e.key - 1) + '"]:not(:disabled)') : document.querySelectorAll('#qcard .choice-btn:not(:disabled), #qcard .cmp-card:not(.done), #dq-stage .choice-btn:not(:disabled)')[+e.key - 1];
    if (b) { e.preventDefault(); b.click(); }
  } else if (e.key === ' ') {
    const nb = document.getElementById('next-btn');
    if (nb) { e.preventDefault(); nb.click(); }
  }
});
