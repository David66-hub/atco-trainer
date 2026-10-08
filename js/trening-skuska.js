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
   Do rebríčka sa počíta len prvý pokus dňa; ďalšie sú tréning. */
const DC_N = 20, DC_KEY = 'atcoTrainerV2.dailyDone';
function dcDay() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function dcRand(seed) { let h = 1779033703 ^ seed.length; for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
function dcDone() { const d = lsGet(DC_KEY, null); return d && d.day === dcDay() ? d : null; }
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
      <p>Dnes majú všetci <strong>tých istých ${DC_N} otázok</strong>. Výsledok uvidíš až na konci, na úspech treba ${EXAM_PASS} %. Do rebríčka sa počíta <strong>prvý pokus dňa</strong>. <a href="#" data-hp="exam">Ako to funguje ❓</a></p>
      ${done ? `<div class="dc-done">Dnešnú výzvu máš splnenú: <b>${done.pct} %</b> · <b>+${done.pts}</b> bodov. Ďalší pokus je už len tréning bez bodov.</div>` : ''}
      <div class="exam-rules"><strong>BODY DO REBRÍČKA</strong>
        <span>správna odpoveď <b>+${F.dAns === 'type' ? 6 : 3}</b></span><span>nesprávna alebo preskočená <b>−2</b></span>
        <span>bonus za ${EXAM_PASS} % <b>+${DC_N}</b></span><span>za 90 % <b>+${DC_N * 2}</b></span><span>za 100 % <b>+${DC_N * 3}</b></span>
        <em>V bežnom cvičení je správna odpoveď za 1 bod (pri písaní za 2). Body sa pripíšu až po dokončení${RK.acct ? '' : ' — a len prihláseným (tlačidlo PRIHLÁSIŤ vpravo hore)'}. Obtiažnosť si nastav v tabuľke dole; pri písaní je bodov dvakrát toľko.</em></div>
      <p><button class="btn" id="exam-go" style="padding:16px 34px;font-size:15px">${done ? 'SKÚSIŤ ZNOVA (TRÉNING) ▶' : 'SPUSTIŤ VÝZVU ▶'}</button></p>
    </div>
    <div class="home-h">DNEŠNÉ PORADIE</div>${dcTopHTML()}`;
  if (!RK.rows && !RK.loading) rkLoad();
  document.getElementById('exam-go').onclick = examStart;
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
    E.first = !dcDone();
    if (E.first) {
      lsSet(DC_KEY, { day: dcDay(), pts: E.sc.pts, pct });
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
        <button class="hh-t" data-go="exam"><small>DENNÁ VÝZVA</small><b>${dc ? '✓ HOTOVO' : 'ČAKÁ'}</b><span>${dc ? 'zajtra príde nová' : '20 otázok, prvý pokus sa počíta'}</span></button>
        <button class="hh-t" data-pft="friends"><small>PRIATELIA</small><b>${on ? on + ' online' : fr ? fr : '—'}</b><span>${on ? 'pozvi ich do Dobyvateľa' : fr ? 'teraz nikto nie je online' : 'pridaj si kolegov'}</span></button>
        ${SOC.unread ? `<button class="hh-t new" data-pft="inbox"><small>SPRÁVY</small><b>${SOC.unread} ${SOC.unread === 1 ? 'nová' : SOC.unread < 5 ? 'nové' : 'nových'}</b><span>otvoriť schránku</span></button>` : ''}
      </div></div>`;
}
function homeHelloBind() {
  const h = document.getElementById('home-hello'); if (!h) return;
  h.querySelectorAll('[data-go]').forEach(b => { b.onclick = () => { startMode(b.dataset.go); window.scrollTo(0, 0); }; });
  h.querySelectorAll('[data-pft]').forEach(b => { b.onclick = () => { RK.pfTab = b.dataset.pft; startMode('profile'); window.scrollTo(0, 0); }; });
  if (RK.acct) avNeed([RK.acct.nick]);
}
function homeHelloFill() { const h = document.getElementById('home-hello'); if (h) { h.outerHTML = homeHelloHTML(); homeHelloBind(); } }

/* ---------- O STRÁNKE (v4.11): všetko o trenažéri na jednom mieste ---------- */
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
        <div class="ab-row"><div><b>DENNÁ VÝZVA</b><span>20 otázok dňa, pre všetkých rovnaké. Do rebríčka sa počíta prvý pokus.</span><p><button class="btn ghost" data-hp="exam">❓ VZOR</button><button class="btn" data-go="exam">OTVORIŤ ▶</button></p></div>
          <div><b>DOBYVATEĽ</b><span>Hra o slovenský vzdušný priestor pre 2 až 6 hráčov.</span><p><button class="btn ghost" data-hp="conquer">❓ VZOR</button><button class="btn" data-go="conquer">OTVORIŤ ▶</button></p></div>
          <div><b>REBRÍČEK</b><span>Ligy, mapa území, denné aj celkové poradie.</span><p><button class="btn ghost" data-hp="rank">❓ VZOR</button><button class="btn" data-go="rank">OTVORIŤ ▶</button></p></div></div>`)}</div>
      <div id="ab-ucenie">${sec('🧠', '#b45cff', 'AKO SA TU UČIŤ', `<div class="ab-steps"><div><b>1</b><span><strong>Vyber modul</strong> cez MODULY hore v lište a nastav si v tabuľke pod otázkou, čo sa má skúšať.</span></div><div><b>2</b><span><strong>Začni ľahkou obťažnosťou</strong> (výber z možností), potom prejdi na písanie z hlavy — to je to, čo budeš potrebovať.</span></div><div><b>3</b><span><strong>Chyby sa vracajú.</strong> Čo pokazíš, príde znova v tom istom cvičení a zapíše sa do MOJE CHYBY, kde si to pozrieš aj so správnou odpoveďou.</span></div><div><b>4</b><span><strong>Dnešný tréning</strong> ti každý deň namieša to, čo je čas zopakovať — krátko, ale pravidelne.</span></div></div>
        <p>Na úvode je aj vyhľadávanie: napíš kód, volačku, bod alebo frekvenciu a trenažér ukáže, čo o tom vie.</p>`)}</div>
      <div id="ab-sutaz">${sec('🏆', '#e0a800', 'BODY, ÚROVNE, LIGY A MAPA', `<div class="ab-grid"><div><b>Body</b><span>Správna odpoveď v cvičení +1, pri písaní z hlavy +2. Denná výzva a Dobyvateľ dávajú viac. Počítajú sa len prihláseným.</span></div>
          <div><b>Úrovne</b><span>Dvanásť úrovní od Uchádzača po Supervízora podľa všetkých bodov, ktoré si kedy získal. <a href="#" data-lvopen="0">Zobraziť všetky ▸</a></span></div>
          <div><b>Ligy</b><span>Päť líg od Bronzu po Diamant. Počítajú sa body za kalendárny mesiac; prví traja postupujú, poslední traja zostupujú.</span></div>
          <div><b>Mapa území</b><span>Slovensko je rozdelené na deväť oblastí, každá patrí jednému modulu. Drží ju ten, kto má v module najviac bodov.</span></div></div>
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
        <div><strong>DENNÁ VÝZVA</strong><span>${dcDone() ? '✓ Dnešná je hotová' + (dcDone().good != null ? ' — ' + dcDone().good + ' z ' + (dcDone().total || DC_N) + ' správne' : '') + '. Zajtra príde nová.' : '20 otázok dňa, rovnaké pre všetkých. Do rebríčka ide prvý pokus.'}</span></div>
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
