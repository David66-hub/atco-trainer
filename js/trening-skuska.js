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
function examSecs() { const F = state.filters; return F.exN * (F.dAns === 'type' ? 20 : 12); }
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
  const P = poolAll(), N = state.filters.exN, src = {};
  ['aircraft', 'airport', 'callsign', 'coord'].forEach(m => { src[m] = shuffle(P[m]); });
  const list = [], used = {};
  for (let g = 0; list.length < N && g < 1000; g++) {
    const q = src[['callsign', 'airport', 'coord', 'aircraft'][g % 4]].shift();
    if (q && !used[q.id]) { used[q.id] = 1; list.push(q); }
  }
  return shuffle(list);
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
  if (state.current && lbl) lbl.textContent = 'SKÚŠKA · ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
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
  document.getElementById('qtotal').textContent = F.exN + ' otázok';
  document.getElementById('mode-label').textContent = 'SKÚŠKA';
  card.innerHTML = `
    <div class="home-hero">
      <div class="home-kicker">SKÚŠKA</div>
      <h1>${F.exN} otázok, čas ${examClock(examSecs())}, žiadne nápovede.</h1>
      <p>Otázky sú namiešané z typov lietadiel, letísk, volacích znakov a koordinácie. Počas skúšky <strong>nevidíš, či si odpovedal správne</strong> — výsledok a zoznam chýb sa ukážu až na konci. Na otázku je v priemere ${F.dAns === 'type' ? 20 : 12} sekúnd a na úspech treba <strong>${EXAM_PASS} %</strong>.</p>
      <div class="exam-rules"><strong>BODY DO REBRÍČKA</strong>
        <span>správna odpoveď <b>+${F.dAns === 'type' ? 6 : 3}</b></span><span>nesprávna alebo preskočená <b>−2</b></span>
        <span>bonus za ${EXAM_PASS} % <b>+${F.exN}</b></span><span>za 90 % <b>+${F.exN * 2}</b></span><span>za 100 % <b>+${F.exN * 3}</b></span>
        <em>V bežnom cvičení je správna odpoveď za 1 bod (pri písaní za 2). Body zo skúšky sa pripíšu až po jej dokončení${RK.acct ? '' : ' — a len prihláseným (tlačidlo PRIHLÁSIŤ vpravo hore)'}. Počet otázok a obtiažnosť si nastav v tabuľke dole.</em></div>
      <p><button class="btn" id="exam-go" style="padding:16px 34px;font-size:15px">SPUSTIŤ SKÚŠKU ▶</button></p>
    </div>`;
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
    E.recs.forEach(r => { srUpdate(r.q.id, r.ok); if (!r.ok) state.mistakes[r.q.id] = (state.mistakes[r.q.id] || 0) + 1; });
    apSaveProgress(); renderWeak();
    E.sc = examPoints(good, wrong.length, total, E.typed);
    if (RK.acct) { rkAdd('exam', { c: good, w: wrong.length, p: E.sc.pts }); rkPendSave(); rkFlush(); }
  }
  document.getElementById('qnum').textContent = E.recs.length;
  document.getElementById('qtotal').textContent = total;
  document.getElementById('mode-label').textContent = 'SKÚŠKA · VÝSLEDOK';
  const byMod = {};
  E.recs.forEach(r => { const m = modOfId(r.q.id); (byMod[m] = byMod[m] || [0, 0])[r.ok ? 0 : 1]++; });
  card.innerHTML = `
    <div class="session-done" style="padding-bottom:10px">
      <h2>${E.timeout ? 'ČAS VYPRŠAL' : 'SKÚŠKA DOKONČENÁ'} · <span class="${pct >= EXAM_PASS ? 'exam-ok' : 'exam-no'}">${pct >= EXAM_PASS ? 'PREŠIEL SI' : 'NEPREŠIEL SI'}</span></h2>
      <div class="score-big">${pct}%</div>
      <p>${good} z ${total} správne · čas ${Math.floor(E.secs / 60)}:${String(E.secs % 60).padStart(2, '0')}${E.recs.length < total ? ' · nezodpovedané: ' + (total - E.recs.length) : ''} · hranica ${EXAM_PASS} %</p>
      <div class="exam-rules res"><strong>${RK.acct ? 'DO REBRÍČKA +' + E.sc.pts + ' BODOV' : 'BODY: ' + E.sc.pts + ' — NEPRIPÍSANÉ, NIE SI PRIHLÁSENÝ'}</strong>
        <span>${good} správnych × ${E.sc.per} <b>+${E.sc.plus}</b></span><span>${wrong.length} nesprávnych × 2 <b>−${E.sc.minus}</b></span><span>bonus za ${pct} % <b>+${E.sc.bonus}</b></span></div>
    </div>
    <div class="home-tips">${Object.keys(byMod).map(m => `<div><strong>${MOD_NAME[m]}</strong>${byMod[m][0]} správne, ${byMod[m][1]} zle</div>`).join('')}</div>
    <div class="home-h">${wrong.length ? 'CHYBY (' + wrong.length + ')' : 'BEZ CHYBY'}</div>
    <div class="exam-list">${wrong.map(r => `<div><span>${examAsk(r.q)}</span><s>${String(r.shown || '—').replace(/</g, '&lt;')}</s><b>${examAnswerOf(r.q)}</b></div>`).join('')}</div>
    <div class="blind-actions" style="justify-content:center;margin-top:20px">
      ${wrong.length ? '<button class="btn" id="exam-fix">PRECVIČIŤ CHYBY ▶</button>' : ''}
      <button class="btn ghost" id="exam-again">NOVÁ SKÚŠKA</button>
    </div>`;
  const fix = document.getElementById('exam-fix');
  if (fix) fix.onclick = () => startCustom(wrong.map(r => r.q), 'daily');
  document.getElementById('exam-again').onclick = () => startMode('exam');
}

/* ---------- ÚVOD: prehľad pokroku a vyhľadávanie ---------- */
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
        <div><strong>SKÚŠKA</strong><span>Na čas, bez nápovedí, výsledok až na konci.</span></div>
        <button class="btn ghost" data-go="exam">OTVORIŤ ▶</button>
      </div>
    </div>
    <div class="home-dash comp">
      <div class="home-cta gold">
        <div><strong>DOBYVATEĽ</strong><span>Vedomostný súboj o Slovensko naživo — 2 až 3 hráči.</span></div>
        <button class="btn ghost" data-go="conquer">HRAŤ ▶</button>
      </div>
      <div class="home-cta gold">
        <div><strong>REBRÍČEK</strong><span>Body, úspešnosť a čas tréningu všetkých kolegov.</span></div>
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

/* ---------- NAHLÁSIŤ CHYBU: otvorí WhatsApp s predvyplnenou správou ---------- */
function reportBug() {
  const q = state.current, F = state.filters;
  const where = state.mode === 'home' ? 'Úvod' : (document.getElementById('mode-label').textContent || state.mode);
  const lines = ['ATCO Trainer — nahlásenie chyby', 'Kde: ' + where];
  if (q && q.id) lines.push('Otázka: ' + labelForId(q.id) + ' [' + q.id + ']');
  lines.push('Čo je zle: ');
  window.open('https://wa.me/?text=' + encodeURIComponent(lines.join('\n')), '_blank');
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
