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
function dqEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
/* číslo verzie — zvyšuje sa pri každej úprave, vidno ho v hlavičke, na úvode aj v Dobyvateľovi */
const APP_VERSION = '4.2';
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
        <div class="pf-box"><h3>DOBYVATEĽ</h3><div class="pf-kv"><span>Odohrané hry</span><b>${cq.g}</b><span>Výhry</span><b>${cq.v}</b><span>Podiel výhier</span><b>${cq.g ? Math.round(cq.v / cq.g * 100) + ' %' : '—'}</b><span>Body do rebríčka</span><b>${cq.p}</b><span>Úspešnosť odpovedí</span><b>${pct(cq.c, cq.w)}</b></div><small>Počítajú sa len hry aspoň dvoch ľudí.</small></div>
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
      <div class="rk-head"><div><h2>REBRÍČEK</h2><p>Bod za každú správnu odpoveď, v HARDCORE dva. K tomu body z Dobyvateľa. Úspešnosť je podiel správnych zo všetkých odpovedí. Čas beží len vtedy, keď odpovedáš — po 45 sekundách bez odpovede sa zastaví.</p></div><button class="btn ghost" id="rk-refresh">${RK.loading ? 'NAČÍTAVAM…' : '↻ OBNOVIŤ'}</button></div>
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
