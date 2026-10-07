/* ============================================================
   DOBYVATEĽ — 2 až 4 hráči, VFR mapa Slovenska rozdelená na skutočné
   priestory (letiská, CTR, TMA, TRA/TSA, LZR, trieda G EAST/WEST).
   Hranice sú z verejnej VFR mapy LPS SR (DQ_MAP). Hru riadi prehliadač
   hostiteľa: posiela všetkým stav, ostatní posielajú len svoje ťahy.
   ============================================================ */
const DQ_COL = ['#e63946', '#2dc653', '#3a86ff', '#ffbe0b'];   // červený, zelený, modrý, žltý hráč
const DQ_STYLE = 'a';   // vzhľad mapy: a = čistá čierna, b = čierna s typmi, c = radar
const DQ_CAT = { AD: ['LETISKO', '#ffffff'], CTR: ['CTR', '#8fb8ff'], TMA: ['TMA', '#c3d6ff'], TRA: ['TRA', '#d9c2f5'], TSA: ['TSA', '#c7a6ee'],
  R: ['LZR', '#f7b3b3'], P: ['LZP', '#f08a8a'], D: ['LZD', '#f5c9a0'], G: ['TRIEDA G', '#dfe8e2'] };
const DQ_QS = [['ac', 'MOD 01', 'TYPY LIETADIEL'], ['ap', 'MOD 02', 'LETISKÁ'], ['px', 'MOD 02', 'PREFIXY ŠTÁTOV'], ['cs', 'MOD 03', 'VOLAČKY'], ['hd', 'MOD 05', 'KURZY'], ['co', 'MOD 06', 'FREKVENCIE']];
const DQ_OPT = { max: [2, 3, 4], time: [10, 15, 20, 30], claim: [4, 6, 8, 10, 12], war: [0, 2, 3, 4, 6] };
const DQ_FIX = { startrev: 4000, startpick: 25000, claimrev: 4000, pick: 25000, warpick: 30000, duelintro: 2800, duelrev: 5000 };
const DQ = { id: null, room: null, host: false, S: null, net: null, H: null, my: null, k: -1, qT0: 0, deadline: 0, sig: '', sb: null, err: '', lastState: 0, loop: null, bar: null, reported: null, guest: '', prev: null };
try { DQ.id = sessionStorage.getItem('atcoDqId'); if (!DQ.id) { DQ.id = Math.random().toString(36).slice(2, 10); sessionStorage.setItem('atcoDqId', DQ.id); } } catch (e) { DQ.id = Math.random().toString(36).slice(2, 10); }
function dqDur(phase) { return (phase === 'startq' || phase === 'claimq' || phase === 'duelq') ? DQ.S.cfg.time * 1000 : (DQ_FIX[phase] || 0); }
function dqAsking(S) { return S.phase === 'startq' || S.phase === 'claimq' || S.phase === 'duelq'; }
function dqPicking(S) { return S.phase === 'startpick' || S.phase === 'pick' || S.phase === 'warpick'; }
function dqPad(n) { n = ((n - 1) % 360 + 360) % 360 + 1; return String(n).padStart(3, '0'); }

/* otázky do hry: len také, ktoré sa dajú položiť textom a majú jednu správnu odpoveď */
function dqGenQ(mods) {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const mk = (mod, prompt, sub, right, pool) => {
    const o = [right]; let g = 0;
    while (o.length < 4 && g++ < 600) { const x = pick(pool); if (x && o.indexOf(x) < 0) o.push(x); }
    const opts = shuffle(o);
    return { mod, prompt, sub, opts, ans: opts.indexOf(right) };
  };
  const once = (arr, f) => { const c = {}; arr.forEach(x => { c[f(x)] = (c[f(x)] || 0) + 1; }); return arr.filter(x => c[f(x)] === 1); };
  const K = {
    ac: () => { const a = pick(AIRCRAFT); return Math.random() < 0.5 ? mk('MOD 01 · TYPY', a.icao, 'Ktorý typ lietadla má toto ICAO označenie?', a.name, AIRCRAFT.map(x => x.name))
      : mk('MOD 01 · TYPY', a.name, 'Aké je ICAO označenie tohto typu?', a.icao, AIRCRAFT.map(x => x.icao)); },
    ap: () => { const a = pick(AIRPORTS); return Math.random() < 0.5 ? mk('MOD 02 · LETISKÁ', a.icao, 'V ktorom meste je toto letisko?', a.city, AIRPORTS.filter(x => x.cat === a.cat).map(x => x.city))
      : mk('MOD 02 · LETISKÁ', a.city, 'Ktorý ICAO kód patrí letisku v tomto meste?', a.icao, AIRPORTS.filter(x => x.city !== a.city && x.cat === a.cat).map(x => x.icao)); },
    px: () => { const P = once(ICAO_STATES, s => s.name), a = pick(P); return mk('MOD 02 · PREFIXY', a.name, 'Ktorým prefixom sa začínajú ICAO kódy letísk tohto štátu?', a.p, ICAO_STATES.filter(s => s.name !== a.name).map(s => s.p)); },
    cs: () => { const P = CALLSIGNS.filter(c => c.sim && CS_BY_ICAO[c.icao].length === 1 && CS_BY_CALL[c.call].length === 1), a = pick(P);
      return Math.random() < 0.5 ? mk('MOD 03 · VOLAČKY', a.icao, 'Akú volačku má tento kód prevádzkovateľa?', a.call, P.map(x => x.call))
        : mk('MOD 03 · VOLAČKY', '„' + a.call + '“', 'Ktorý kód prevádzkovateľa patrí k tejto volačke?', a.icao, P.map(x => x.icao)); },
    hd: () => {
      const h = 5 * (1 + Math.floor(Math.random() * 72));
      if (Math.random() < 0.4) { const r = h + 180; return mk('MOD 05 · KURZY', dqPad(h) + '°', 'Aký je opačný kurz?', dqPad(r), [r + 10, r - 10, r + 20, r - 20, r + 90, r - 90].map(dqPad)); }
      const by = 10 * (1 + Math.floor(Math.random() * 17)), right = Math.random() < 0.5, r = h + (right ? by : -by);
      return mk('MOD 05 · KURZY', dqPad(h) + '° · ' + (right ? 'doprava' : 'doľava') + ' o ' + by + '°', 'Aký bude nový kurz po zatáčke?', dqPad(r), [h + (right ? -by : by), r + 10, r - 10, r + 20, r - 20, r + 100, r - 100].map(dqPad));
    },
    co: () => { const P = once(CO_UNITS.filter(u => u.f && !u.alt), u => u.n), a = pick(P); return mk('MOD 06 · FREKVENCIE', a.n, 'Na akej frekvencii pracuje toto stanovište?', a.f, CO_UNITS.filter(u => u.f && u.f !== a.alt).map(u => u.f)); },
  };
  const ks = (mods || []).filter(m => K[m]), use = ks.length ? ks : Object.keys(K), H = DQ.H;
  for (let i = 0; i < 40; i++) {
    const q = K[pick(use)]();
    if (q.opts.length === 4 && q.ans >= 0 && !(H && H.used[q.prompt + q.sub])) { if (H) H.used[q.prompt + q.sub] = 1; return q; }
  }
  return K[pick(use)]();
}

/* ---------- spojenie ---------- */
function dqLoadSb() {
  if (DQ.sb) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload = () => { try { DQ.sb = window.supabase.createClient(SB_URL, SB_KEY); res(); } catch (e) { rej(e); } };
    s.onerror = () => rej(new Error('NET'));
    document.head.appendChild(s);
  });
}
async function dqNet(code, onMsg) {
  if (SB_ON) {
    await dqLoadSb();
    const ch = DQ.sb.channel('atco-dq-' + code, { config: { broadcast: { self: false } } });
    ch.on('broadcast', { event: 'm' }, p => onMsg(p.payload));
    await new Promise((res, rej) => { ch.subscribe(st => { if (st === 'SUBSCRIBED') res(); else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') rej(new Error('NET')); }); });
    return { send: m => ch.send({ type: 'broadcast', event: 'm', payload: m }), close: () => DQ.sb.removeChannel(ch) };
  }
  const bc = new BroadcastChannel('atco-dq-' + code);
  bc.onmessage = e => onMsg(e.data);
  return { send: m => bc.postMessage(m), close: () => bc.close() };
}
function dqNick() { return RK.acct ? RK.acct.nick : (DQ.guest || '').trim().slice(0, 16); }
function dqSend(m) { m.id = DQ.id; if (DQ.host) dqHostMsg(m); else if (DQ.net) DQ.net.send(m); }
function dqMe() { return DQ.S ? DQ.S.players.findIndex(p => p.id === DQ.id) : -1; }
function dqLeave(msg) {
  if (DQ.net) { try { DQ.net.send({ t: DQ.host ? 'bye' : 'leave', id: DQ.id }); DQ.net.close(); } catch (e) {} }
  if (DQ.H) { clearTimeout(DQ.H.timer); DQ.H.bots.forEach(clearTimeout); }
  clearInterval(DQ.loop);
  DQ.room = null; DQ.host = false; DQ.S = null; DQ.net = null; DQ.H = null; DQ.sig = ''; DQ.k = -1; DQ.prev = null; DQ.err = msg || '';
  dqShow();
}
function dqShow() { if (state.mode === 'conquer') { DQ.sig = ''; dqRender(document.getElementById('qcard')); } }
async function dqCreate() {
  if (!dqNick()) { DQ.err = 'Najprv si napíš prezývku.'; return dqShow(); }
  const L = 'ABCDEFGHJKLMNPRSTUVXYZ'; let code = '';
  for (let i = 0; i < 4; i++) code += L.charAt(Math.floor(Math.random() * L.length));
  try { DQ.net = await dqNet(code, dqHostMsg); } catch (e) { DQ.err = 'Nepodarilo sa otvoriť miestnosť — skontroluj pripojenie.'; return dqShow(); }
  DQ.room = code; DQ.host = true; DQ.err = '';
  DQ.H = { ans: -1, got: {}, deadline: 0, timer: null, seen: {}, used: {}, bots: [], next: null };
  DQ.S = { gid: '', k: 0, phase: 'lobby', players: [{ id: DQ.id, nick: dqNick(), bot: false, on: true, bonus: 0 }], cfg: { max: 3, time: 15, claim: 8, war: 3, mods: DQ_QS.map(x => x[0]) },
    own: [], round: 0, wr: 0, wq: [], q: null, rev: null, picks: [], allowed: [], chooser: -1, duel: null, answered: [], dur: 0, tot: 0 };
  clearInterval(DQ.loop); DQ.loop = setInterval(dqHostLoop, 2000);
  dqCast();
}
async function dqJoin(code) {
  code = (code || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (!dqNick()) { DQ.err = 'Najprv si napíš prezývku.'; return dqShow(); }
  if (code.length !== 4) { DQ.err = 'Kód miestnosti má štyri písmená.'; return dqShow(); }
  try { DQ.net = await dqNet(code, dqClientMsg); } catch (e) { DQ.err = 'Nepodarilo sa pripojiť — skontroluj pripojenie.'; return dqShow(); }
  DQ.room = code; DQ.host = false; DQ.S = null; DQ.err = ''; DQ.lastState = Date.now(); DQ.joinAt = Date.now();
  const hello = () => DQ.net && DQ.net.send({ t: 'join', id: DQ.id, nick: dqNick() });
  hello();
  clearInterval(DQ.loop);
  DQ.loop = setInterval(() => {
    if (!DQ.room) return;
    if (dqMe() < 0) { if (Date.now() - DQ.joinAt > 7000) return dqLeave('Miestnosť s kódom ' + code + ' nie je otvorená.'); hello(); }
    else DQ.net.send({ t: 'ping', id: DQ.id });
    if (Date.now() - DQ.lastState > 12000 && dqMe() >= 0) dqLeave('Spojenie s hostiteľom sa stratilo.');
  }, 1500);
  dqShow();
}
function dqClientMsg(m) {
  if (!m || DQ.host) return;
  if (m.t === 'state') dqApply(m.S);
  else if (m.t === 'bye') dqLeave('Hostiteľ ukončil miestnosť.');
  else if (m.t === 'no' && m.to === DQ.id) dqLeave(m.why);
}
function dqApply(S) {
  DQ.S = S; DQ.lastState = Date.now();
  if (S.k !== DQ.k) { DQ.k = S.k; DQ.qT0 = Date.now(); DQ.my = null; }
  DQ.deadline = Date.now() + (S.dur || 0);
  if (S.phase === 'end' && DQ.reported !== S.gid) {
    DQ.reported = S.gid;
    const me = dqMe(), place = S.rank.indexOf(me);
    if (me >= 0 && S.league[me] != null && S.humans >= 2) { rkAdd('conquer', { p: S.league[me], g: 1, v: place === 0 ? 1 : 0 }); lsSet(RK_PEND, RK.pend); rkFlush(); }
  }
  const sig = JSON.stringify(Object.assign({}, S, { dur: 0 })) + JSON.stringify(DQ.my);
  if (sig !== DQ.sig && state.mode === 'conquer') { DQ.sig = sig; dqRender(document.getElementById('qcard')); }
}

/* ---------- hostiteľ: pravidlá hry ---------- */
function dqCast() { const S = DQ.S, H = DQ.H; S.dur = Math.max(0, H.deadline - Date.now()); if (DQ.net) DQ.net.send({ t: 'state', S }); dqApply(S); }
function dqPhase(phase, fn) {
  const S = DQ.S, H = DQ.H;
  S.phase = phase; S.k++; S.tot = dqDur(phase); H.next = fn; H.deadline = Date.now() + S.tot;
  clearTimeout(H.timer); H.timer = setTimeout(fn, S.tot);
  dqCast();
}
function dqHostLoop() {
  const S = DQ.S, H = DQ.H, now = Date.now();
  if (!S) return;
  S.players.forEach(p => { if (!p.bot && p.id !== DQ.id) p.on = now - (H.seen[p.id] || 0) < 9000; });
  if (S.phase === 'lobby') S.players = S.players.filter(p => p.on);
  else if (S.phase !== 'end') { dqNudge(); dqAllIn(); }
  dqCast();
}
function dqHostMsg(m) {
  const S = DQ.S, H = DQ.H;
  if (!m || !S || !DQ.host) return;
  if (m.id) H.seen[m.id] = Date.now();
  const pi = S.players.findIndex(p => p.id === m.id);
  if (m.t === 'join') {
    if (pi >= 0) { S.players[pi].on = true; return dqCast(); }
    if (S.phase !== 'lobby') return DQ.net.send({ t: 'no', to: m.id, why: 'Hra v tejto miestnosti už beží.' });
    if (S.players.length >= S.cfg.max) return DQ.net.send({ t: 'no', to: m.id, why: 'Miestnosť je plná.' });
    let nick = String(m.nick || 'HRÁČ').slice(0, 16), n = 2;
    while (S.players.some(p => p.nick === nick)) nick = String(m.nick).slice(0, 14) + ' ' + n++;
    S.players.push({ id: m.id, nick, bot: false, on: true, bonus: 0 });
    return dqCast();
  }
  if (pi < 0) return;
  if (m.t === 'leave') { if (S.phase === 'lobby') S.players.splice(pi, 1); else { S.players[pi].on = false; H.seen[m.id] = 0; dqNudge(); dqAllIn(); } return dqCast(); }
  if (pi === 0 && S.phase === 'lobby') {
    if (m.t === 'bot' && S.players.length < S.cfg.max) {
      const n = S.players.filter(p => p.bot).length + 1;
      S.players.push({ id: 'bot' + n + Date.now(), nick: 'POČÍTAČ ' + n, bot: true, on: true, bonus: 0 });
      return dqCast();
    }
    if (m.t === 'kick' && m.who > 0) { S.players.splice(m.who, 1); return dqCast(); }
    if (m.t === 'cfg') {
      if (m.key === 'mods') { const i = S.cfg.mods.indexOf(m.val); if (i < 0) S.cfg.mods.push(m.val); else if (S.cfg.mods.length > 1) S.cfg.mods.splice(i, 1); }
      else if (DQ_OPT[m.key] && DQ_OPT[m.key].indexOf(m.val) >= 0 && (m.key !== 'max' || m.val >= S.players.length)) S.cfg[m.key] = m.val;
      return dqCast();
    }
    if (m.t === 'start' && S.players.length >= 2) return dqStart();
  }
  if (m.t === 'again' && pi === 0 && S.phase === 'end') { S.phase = 'lobby'; S.k++; S.players = S.players.filter(p => p.on); S.players.forEach(p => { p.bonus = 0; }); return dqCast(); }
  if (m.t === 'ans' && m.k === S.k && dqAsking(S) && S.q.who.indexOf(pi) >= 0 && !H.got[pi]) {
    H.got[pi] = { c: m.c, ms: Math.max(0, Math.min(S.tot, +m.ms || 0)) };
    S.answered = Object.keys(H.got).map(Number);
    dqCast(); return dqAllIn();
  }
  if (m.t === 'pick' && m.k === S.k && dqPicking(S) && pi === S.chooser && S.allowed.indexOf(m.terr) >= 0) return dqChoose(m.terr);
}
function dqStart() {
  const S = DQ.S, H = DQ.H;
  S.gid = DQ.room + Date.now();
  S.own = DQ_MAP.t.map(() => -1);
  S.players.forEach(p => { p.bonus = 0; });
  S.humans = S.players.filter(p => !p.bot).length;
  S.round = 0; S.wr = 0; S.wq = []; S.duel = null; S.rank = null; S.league = null; H.used = {};
  dqAsk('startq', S.players.map((p, i) => i), dqStartRev);
}
/* štart: správni vyberajú domovské letisko prví (podľa rýchlosti), ostatní po nich */
function dqStartRev() {
  const S = DQ.S, H = DQ.H, res = dqRes(), all = Object.keys(res).map(Number);
  S.picks = all.filter(pi => res[pi].ok).sort((a, b) => res[a].ms - res[b].ms).concat(shuffle(all.filter(pi => !res[pi].ok)));
  S.rev = { ans: H.ans, res };
  dqPhase('startrev', dqStartPick);
}
function dqStartPick() {
  const S = DQ.S, H = DQ.H;
  if (!S.picks.length) return dqClaimQ();
  S.chooser = S.picks[0]; S.allowed = dqFree().filter(t => DQ_MAP.t[t].c === 'AD'); S.q = null; S.rev = null; H.nudged = false;
  dqPhase('startpick', dqAuto);
  dqNudge();
}
function dqAsk(phase, who, next) {
  const S = DQ.S, H = DQ.H, q = dqGenQ(S.cfg.mods);
  H.ans = q.ans; H.got = {}; S.answered = []; S.rev = null;
  S.q = { mod: q.mod, prompt: q.prompt, sub: q.sub, opts: q.opts, who };
  dqPhase(phase, next);
  const k = S.k, T = S.tot;
  who.forEach(pi => {
    const p = S.players[pi];
    if (!p.bot) return;
    const ms = Math.min(T - 600, 2200 + Math.random() * 6000), c = Math.random() < 0.6 ? q.ans : (q.ans + 1 + Math.floor(Math.random() * 3)) % 4;
    H.bots.push(setTimeout(() => { if (DQ.S && DQ.S.k === k) dqHostMsg({ t: 'ans', id: p.id, k, c, ms }); }, ms));
  });
}
/* keď odpovedali všetci, na ktorých sa čaká, netreba čakať do konca času */
function dqAllIn() {
  const S = DQ.S, H = DQ.H;
  if (!dqAsking(S)) return;
  if (S.q.who.every(pi => H.got[pi] || (!S.players[pi].bot && !S.players[pi].on))) { clearTimeout(H.timer); const f = H.next; H.timer = setTimeout(f, 350); }
}
/* na rade je počítač alebo odpojený hráč — vyberie sa zaňho */
function dqNudge() {
  const S = DQ.S, H = DQ.H;
  if (!dqPicking(S)) return;
  const p = S.players[S.chooser], k = S.k;
  if (p && (p.bot || !p.on) && !H.nudged) { H.nudged = true; H.bots.push(setTimeout(() => { if (DQ.S && DQ.S.k === k) dqAuto(); }, p.bot ? 1500 : 600)); }
}
/* počítač (a vypršaný čas) berie to najcennejšie, čo môže */
function dqAuto() {
  const S = DQ.S;
  if (!S.allowed.length) return;
  const best = Math.max.apply(null, S.allowed.map(t => DQ_MAP.t[t].v)), top = S.allowed.filter(t => DQ_MAP.t[t].v === best);
  dqChoose(top[Math.floor(Math.random() * top.length)]);
}
function dqRes() {
  const S = DQ.S, H = DQ.H, res = {};
  S.q.who.forEach(pi => { const g = H.got[pi]; res[pi] = g ? { c: g.c, ms: Math.round(g.ms), ok: g.c === H.ans } : { c: -1, ms: 0, ok: false }; });
  return res;
}
function dqFree() { return DQ.S.own.map((o, i) => o < 0 ? i : -1).filter(i => i >= 0); }
function dqScore(S, i) { let s = S.players[i].bonus || 0; S.own.forEach((o, t) => { if (o === i) s += DQ_MAP.t[t].v; }); return s; }
function dqClaimQ() {
  const S = DQ.S;
  if (!dqFree().length || S.round >= S.cfg.claim) return dqWarRound();
  S.round++; S.duel = null;
  dqAsk('claimq', S.players.map((p, i) => i), dqClaimRev);
}
/* správni si vyberajú podľa rýchlosti; najrýchlejší má dva výbery */
function dqClaimRev() {
  const S = DQ.S, H = DQ.H, res = dqRes();
  const ok = Object.keys(res).map(Number).filter(pi => res[pi].ok).sort((a, b) => res[a].ms - res[b].ms);
  S.picks = (ok.length ? [ok[0]].concat(ok) : []).slice(0, dqFree().length);
  S.rev = { ans: H.ans, res };
  dqPhase('claimrev', dqPickNext);
}
function dqPickNext() {
  const S = DQ.S, H = DQ.H, free = dqFree();
  if (!S.picks.length || !free.length) { S.picks = []; return dqClaimQ(); }
  const pi = S.picks[0];
  let al = free.filter(t => DQ_MAP.t[t].j.some(a => S.own[a] === pi));
  if (!al.length) al = free;
  S.chooser = pi; S.allowed = al; H.nudged = false;
  dqPhase('pick', dqAuto);
  dqNudge();
}
function dqChoose(terr) {
  const S = DQ.S;
  if (S.phase === 'startpick') { S.own[terr] = S.chooser; S.picks.shift(); S.allowed = []; return dqStartPick(); }
  if (S.phase === 'pick') { S.own[terr] = S.chooser; S.picks.shift(); S.allowed = []; return dqPickNext(); }
  S.duel = { a: S.chooser, d: S.own[terr], t: terr }; S.allowed = []; S.q = null; S.rev = null;
  dqPhase('duelintro', () => dqAsk('duelq', S.duel.d >= 0 ? [S.duel.a, S.duel.d] : [S.duel.a], dqDuelRev));
}
/* kolo súbojov: každý hráč útočí raz, začína ten s najmenším počtom bodov */
function dqWarRound() {
  const S = DQ.S;
  S.q = null; S.rev = null; S.picks = []; S.duel = null;
  if (S.wr >= S.cfg.war) return dqEnd();
  S.wr++;
  S.wq = S.players.map((p, i) => i).sort((a, b) => dqScore(S, a) - dqScore(S, b));
  dqWarPick();
}
function dqWarPick() {
  const S = DQ.S, H = DQ.H;
  if (!S.wq.length) return dqWarRound();
  const a = S.wq[0], other = S.own.map((o, i) => o !== a ? i : -1).filter(i => i >= 0);
  let al = other.filter(t => DQ_MAP.t[t].j.some(x => S.own[x] === a));
  if (!al.length) al = other;
  if (!al.length) { S.wq.shift(); return dqWarPick(); }
  S.chooser = a; S.allowed = al; S.duel = null; S.q = null; S.rev = null; H.nudged = false;
  dqPhase('warpick', dqAuto);
  dqNudge();
}
function dqDuelRev() {
  const S = DQ.S, H = DQ.H, res = dqRes(), D = S.duel, ra = res[D.a], rd = D.d >= 0 ? res[D.d] : null;
  const win = ra.ok && (!rd || !rd.ok || ra.ms < rd.ms);
  if (!win && rd && rd.ok) S.players[D.d].bonus += 100;
  S.rev = { ans: H.ans, res, win, what: win ? 'took' : (rd && rd.ok ? 'held' : 'miss') };
  dqPhase('duelrev', () => { if (win) S.own[D.t] = D.a; S.wq.shift(); dqWarPick(); });
}
function dqEnd() {
  const S = DQ.S, H = DQ.H;
  clearTimeout(H.timer);
  S.rank = S.players.map((p, i) => i).sort((a, b) => dqScore(S, b) - dqScore(S, a));
  const pts = [30, 15, 8, 4]; if (S.players.length === 2) pts[1] = 10;
  S.league = S.players.map((p, i) => pts[S.rank.indexOf(i)]);
  S.phase = 'end'; S.k++; S.q = null; S.duel = null; S.allowed = []; S.tot = 0; H.deadline = 0;
  dqCast();
}

/* ---------- kreslenie ---------- */
function dqTerrInfo(t, S) {
  const o = DQ_MAP.t[t], own = S && S.own[t] >= 0 ? S.players[S.own[t]] : null;
  const lim = o.lo || o.up ? ' · ' + (o.lo || '?') + ' – ' + (o.up || '?') : '';
  return `<b>${dqEsc(o.k)}</b><span>${dqEsc(o.c === 'AD' ? 'letisko ' + o.n : o.n)}${o.cl ? ' · trieda ' + dqEsc(o.cl) : ''}${dqEsc(lim)}</span><em>${o.v} b.</em>${own ? `<i style="background:${DQ_COL[S.own[t]]}"></i><small>${dqEsc(own.nick)}</small>` : '<small>voľné</small>'}`;
}
function dqRulesHTML() {
  return `<div class="dq-rules">
      <div><b>1</b><strong>ŠTART A OBSADZOVANIE</strong><span>Hra sa začína úvodnou otázkou — podľa nej si hráči postupne vyberú domovské letisko. Potom v každom kole dostanú všetci tú istú otázku: kto odpovie správne, vyberie si voľný priestor susediaci s tým, čo už má. Najrýchlejší vyberá prvý a berie si dva.</span></div>
      <div><b>2</b><strong>SÚBOJE</strong><span>V každom kole zaútočí každý hráč raz na susedný priestor. Ak je voľný, stačí odpovedať správne. Ak patrí súperovi, odpovedáte obaja — útočník vyhrá, len ak je správne a rýchlejšie.</span></div>
      <div><b>3</b><strong>BODY</strong><span>Letisko 500, CTR 400, TMA 300, TRA/TSA 200, LZR 150, časť triedy G 100. Za ubránený priestor +100. Vyhráva ten, kto má po poslednom kole najviac bodov.</span></div>
    </div>`;
}
function dqCfgHTML(S) {
  const c = S.cfg, host = DQ.host;
  const row = (lab, key, arr, fmt) => `<div class="dq-cfg-row"><span>${lab}</span><div>${arr.map(v => `<button class="rk-chip${c[key] === v ? ' on' : ''}" data-cfg="${key}" data-val="${v}" ${host ? '' : 'disabled'}>${fmt(v)}</button>`).join('')}</div></div>`;
  return `<div class="dq-cfg">
      <div class="dq-cfg-t">NASTAVENIE HRY${host ? '' : ' <em>— mení ho len hostiteľ</em>'}</div>
      ${row('HRÁČI', 'max', DQ_OPT.max, v => v)}
      ${row('ČAS NA OTÁZKU', 'time', DQ_OPT.time, v => v + ' s')}
      ${row('KOLÁ OBSADZOVANIA', 'claim', DQ_OPT.claim, v => v)}
      ${row('KOLÁ SÚBOJOV', 'war', DQ_OPT.war, v => v || 'BEZ')}
      <div class="dq-cfg-row"><span>OTÁZKY Z</span><div>${DQ_QS.map(x => `<button class="rk-chip${c.mods.indexOf(x[0]) >= 0 ? ' on' : ''}" data-cfg="mods" data-val="${x[0]}" ${host ? '' : 'disabled'}>${x[1]} · ${x[2]}</button>`).join('')}</div></div>
    </div>`;
}
function dqMapSVG(S, me) {
  const M = DQ_MAP, mine = dqPicking(S) && S.chooser === me, v = DQ.view || dqBaseView(), now = Date.now();
  const fx = (DQ.fx || []).filter(f => now - f.t0 < 1600);
  let h = `<svg class="dq-map dq-s-${DQ_STYLE}" id="dq-svg" viewBox="${v.x} ${v.y} ${v.w} ${v.h}" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="dq-clip"><path d="${M.border}"/></clipPath>
    ${M.t.map((o, i) => o.c === 'G' ? `<clipPath id="dq-g${i}"><path d="${o.cp}"/></clipPath>` : '').join('')}
    <pattern id="dq-hB" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#2a0d10"/><line x1="0" y1="0" x2="0" y2="7" stroke="#7a2229" stroke-width="2.2"/></pattern>
    <pattern id="dq-hC" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#0a1a13"/><line x1="0" y1="0" x2="0" y2="7" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.6"/></pattern></defs>
    <g clip-path="url(#dq-clip)">`;
  M.t.forEach((o, i) => {
    const f = fx.find(x => x.t === i), ow = f ? f.was : S.own[i], can = S.allowed.indexOf(i) >= 0, tgt = S.duel && S.duel.t === i, d = o.c === 'G' ? M.g[o.s] : o.d;
    h += `<path d="${d}"${o.c === 'G' ? ` clip-path="url(#dq-g${i})"` : ''} data-t="${i}" class="dq-cell c-${o.c}${ow >= 0 ? ' own' : ''}${can ? ' can' : ''}${can && mine ? ' click' : ''}${tgt ? ' tgt' : ''}"${ow >= 0 ? ` style="--pc:${DQ_COL[ow]}"` : ''}/>`;
    if (f) {
      /* kruh v novej farbe rastie z bodu kliknutia a je orezaný tvarom priestoru */
      const nums = (o.c === 'G' ? o.cp : o.d).match(/-?\d+\.?\d*/g).map(Number); let R = 0;
      for (let n = 0; n + 1 < nums.length; n += 2) R = Math.max(R, Math.hypot(nums[n] - f.x, nums[n + 1] - f.y));
      const c = `<circle class="dq-spread" cx="${f.x}" cy="${f.y}" r="${(R + 3).toFixed(1)}" fill="${f.col}" clip-path="url(#dq-fx${i})" style="animation-delay:-${now - f.t0}ms"/>`;
      h += `<clipPath id="dq-fx${i}"><path d="${d}"/></clipPath>` + (o.c === 'G' ? `<g clip-path="url(#dq-g${i})">${c}</g>` : c);
    }
  });
  h += `</g><path d="${M.border}" class="dq-out"/>`;
  M.t.forEach((o, i) => {
    const ow = S.own[i] >= 0 ? ' own' : '';
    if (o.c === 'AD') h += `<text class="dq-lab ad${ow}" x="${o.x}" y="${o.y + 2.3}">${o.b}</text>`;
    else if (o.c === 'G') h += `<text class="dq-lab g${ow}" x="${o.x}" y="${o.y}" font-size="${Math.max(6, Math.min(13, 1.8 * o.r / ((o.k.length + 4) * 0.62))).toFixed(1)}">${o.k}<tspan class="p" dx="5">${o.v}</tspan></text>`;
    else if (o.r >= 6.5) {
      const fs = Math.max(4.6, Math.min(11, o.r * 0.42)), three = o.r >= 11;
      h += `<text class="dq-lab${ow}" x="${o.x}" y="${o.y}" font-size="${fs.toFixed(1)}"><tspan x="${o.x}" dy="${three ? '-0.75em' : '-0.15em'}" class="t">${o.a}</tspan><tspan x="${o.x}" dy="1.05em">${o.b}</tspan>${three ? `<tspan x="${o.x}" dy="1.1em" class="p">${o.v}</tspan>` : ''}</text>`;
    }
  });
  /* útok: šípka od útočníkovho priestoru k cieľu a značka na cieli */
  if (S.duel && (S.phase === 'duelintro' || S.phase === 'duelq' || S.phase === 'duelrev')) {
    const T = M.t[S.duel.t], from = T.j.map(j => M.t[j]).filter((o, n) => S.own[T.j[n]] === S.duel.a).sort((a, b) => Math.hypot(a.x - T.x, a.y - T.y) - Math.hypot(b.x - T.x, b.y - T.y))[0], col = DQ_COL[S.duel.a];
    if (from) h += `<line class="dq-atk bg" x1="${from.x}" y1="${from.y}" x2="${T.x}" y2="${T.y}"/><line class="dq-atk" style="--pc:${col}" x1="${from.x}" y1="${from.y}" x2="${T.x}" y2="${T.y}"/>`;
    h += `<g transform="translate(${T.x},${T.y})"><g class="dq-swords" style="--pc:${col}"><circle r="15"/><text y="5.5">⚔</text></g></g>`;
  }
  return h + '</svg>';
}
function dqLegendHTML() {
  return `<div class="dq-legend"><span>BODY ZA PRIESTOR:</span><span>◯ LETISKO <b>500</b></span><span>CTR <b>400</b></span><span>TMA <b>300</b></span><span>TRA / TSA <b>200</b></span><span>LZR <b>150</b></span><span>G WEST / EAST (každá časť) <b>100</b></span><span class="k">žlté číslo na mape = body · farba = hráč, ktorému priestor patrí</span></div>`;
}
function dqBaseView() { return { x: -8, y: -8, w: DQ_MAP.w + 16, h: Math.round(DQ_MAP.h) + 16 }; }
/* priblíženie mapy: f < 1 približuje; bod (cx, cy) v súradniciach mapy ostane na mieste */
function dqZoom(f, cx, cy) {
  const B = dqBaseView(), v = DQ.view || B;
  const nw = Math.max(B.w / 6, Math.min(B.w, v.w * f)), nh = nw * B.h / B.w;
  if (cx == null) { cx = v.x + v.w / 2; cy = v.y + v.h / 2; }
  let x = cx - (cx - v.x) * nw / v.w, y = cy - (cy - v.y) * nh / v.h;
  x = Math.max(B.x, Math.min(B.x + B.w - nw, x)); y = Math.max(B.y, Math.min(B.y + B.h - nh, y));
  DQ.view = nw >= B.w - 0.5 ? null : { x, y, w: nw, h: nh };
  dqViewApply();
}
function dqViewApply() { const s = document.getElementById('dq-svg'), v = DQ.view || dqBaseView(); if (s) s.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`); }
function dqChipsHTML(S, me) {
  return S.players.map((p, i) => {
    const active = (dqPicking(S) && S.chooser === i) || (S.duel && (S.duel.a === i || S.duel.d === i) && S.phase !== 'warpick');
    return `<div class="dq-chip${active ? ' act' : ''}${p.on ? '' : ' off'}" style="--c:${DQ_COL[i]}"><i></i><span>${dqEsc(p.nick)}${i === me ? ' <em>ty</em>' : ''}${p.on ? '' : ' <em>odpojený</em>'}</span><small>${S.own.filter(o => o === i).length}</small><b>${dqScore(S, i)}</b></div>`;
  }).join('');
}
/* vyskakovacie okno s otázkou — prekryje mapu len počas otázky a jej vyhodnotenia */
function dqPopHTML(S, me, stage, ctx) {
  const q = S.q, R = S.rev, can = q.who.indexOf(me) >= 0, my = DQ.my;
  const sec = ms => (ms / 1000).toFixed(1).replace('.', ',') + ' s';
  let h = `<div class="dq-pop${R ? ' rev' : ''}">
      <div class="dq-pop-top"><span>${dqEsc(q.mod)}</span><span class="dq-pop-stage">${stage}</span><span class="dq-pop-time" id="dq-sec">${R ? '' : Math.ceil(S.tot / 1000)}</span></div>
      <div class="dq-timer"><i class="dq-bar-i"></i></div>
      ${ctx ? `<div class="dq-pop-ctx">${ctx}</div>` : ''}
      <div class="dq-pop-q">${dqEsc(q.prompt)}</div>
      <div class="dq-pop-s">${dqEsc(q.sub)}</div>
      <div class="dq-opts">`;
  q.opts.forEach((o, i) => {
    const cls = R ? (i === R.ans ? ' ok' : (my && my.c === i ? ' no' : '')) : (my && my.c === i ? ' sel' : '');
    const who = R ? q.who.filter(pi => R.res[pi].c === i).map(pi => `<i style="background:${DQ_COL[pi]}"></i>`).join('') : '';
    h += `<button class="choice-btn${cls}" data-c="${i}" ${R || my || !can ? 'disabled' : ''}><kbd>${i + 1}</kbd><span>${dqEsc(o)}</span>${who ? `<span class="dq-who">${who}</span>` : ''}</button>`;
  });
  h += '</div><div class="dq-pop-foot">';
  if (R) h += q.who.map(pi => { const r = R.res[pi]; return `<span class="${r.ok ? 'ok' : 'no'}"><i style="background:${DQ_COL[pi]}"></i>${dqEsc(S.players[pi].nick)} ${r.c < 0 ? '— bez odpovede' : r.ok ? '✓ ' + sec(r.ms) : '✗'}</span>`; }).join('');
  else h += q.who.map(pi => `<span class="${S.answered.indexOf(pi) >= 0 ? 'in' : ''}"><i style="background:${DQ_COL[pi]}"></i>${dqEsc(S.players[pi].nick)} ${S.answered.indexOf(pi) >= 0 ? '✓' : '…'}</span>`).join('')
    + `<em>${!can ? 'Pozeráš sa — odpovedá ' + q.who.map(pi => dqEsc(S.players[pi].nick)).join(' a ') + '.' : my ? 'Odpoveď je zapísaná.' : 'Klikni alebo stlač 1–4. Rozhoduje aj rýchlosť.'}</em>`;
  return h + '</div></div>';
}
function dqStageEl() {
  let el = document.getElementById('dq-stage');
  if (!el) { el = document.createElement('div'); el.id = 'dq-stage'; el.style.display = 'none'; document.body.appendChild(el); }
  return el;
}
function dqHideStage() { const el = document.getElementById('dq-stage'); if (el) el.style.display = 'none'; document.body.classList.remove('dq-live'); clearInterval(DQ.bar); }
function dqRender(card) {
  const S = DQ.S, M = DQ_MAP;
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = DQ.room ? 'miestnosť ' + DQ.room : 'hra';
  card.classList.remove('dq-on');
  clearInterval(DQ.bar);
  const live = !!(DQ.room && S && S.phase !== 'lobby');
  if (!live) dqHideStage();
  if (!DQ.room) {
    card.innerHTML = `<div class="dq-home">
        <h2>DOBYVATEĽ</h2>
        <p class="dq-lead">Vedomostný súboj o slovenský vzdušný priestor pre 2 až 4 hráčov naživo. Hrá sa na mape cez celú obrazovku, rozdelenej na ${M.t.length} skutočných priestorov — letiská, CTR, TMA, TRA/TSA, LZR a triedu G EAST a WEST. Otázky sú z modulov trenažéra a hostiteľ si vyberie, z ktorých.</p>
        ${dqRulesHTML()}
        ${DQ.err ? `<div class="rk-err">${dqEsc(DQ.err)}</div>` : ''}
        <div class="dq-start">
          <div class="dq-box"><strong>HRÁŠ AKO</strong>${RK.acct ? `<div class="dq-as">${dqEsc(RK.acct.nick)}</div><span>Body za hru sa ti pripíšu do rebríčka.</span>` : `<input type="text" id="dq-nick" maxlength="16" placeholder="tvoja prezývka" value="${dqEsc(DQ.guest)}" autocomplete="off" spellcheck="false"><span>Si neprihlásený — zahrať si môžeš, body do rebríčka sa ale počítajú len prihláseným (karta REBRÍČEK).</span>`}</div>
          <div class="dq-box"><strong>NOVÁ HRA</strong><button class="btn" id="dq-create">VYTVORIŤ MIESTNOSŤ ▶</button><span>Dostaneš kód zo štyroch písmen, ktorý pošleš kolegom. V miestnosti nastavíš čas, počet kôl aj otázky.</span></div>
          <div class="dq-box"><strong>MÁM KÓD</strong><div class="dq-row"><input type="text" id="dq-code" maxlength="4" placeholder="KÓD" autocomplete="off" spellcheck="false"><button class="btn ghost" id="dq-join">PRIPOJIŤ SA</button></div><span>Napíš kód, ktorý ti poslal hostiteľ.</span></div>
        </div>
        ${SB_ON ? '' : '<div class="rk-warn"><strong>SKÚŠOBNÝ REŽIM</strong> — hra ešte nie je pripojená na server. Proti počítaču funguje hneď; s druhým hráčom zatiaľ len v dvoch kartách toho istého prehliadača.</div>'}
        <div class="dq-src">Hranice priestorov: VFR Manual, LPS SR, š. p. — platné od ${M.eff}. Pomôcka na učenie, nie na navigáciu.</div>
      </div>`;
    const ni = document.getElementById('dq-nick'); if (ni) ni.oninput = () => { DQ.guest = ni.value; };
    document.getElementById('dq-create').onclick = dqCreate;
    const ci = document.getElementById('dq-code'), jn = () => dqJoin(ci.value);
    document.getElementById('dq-join').onclick = jn;
    ci.addEventListener('keydown', e => { if (e.key === 'Enter') jn(); });
    return;
  }
  if (!S) { card.innerHTML = `<div class="dq-home"><h2>DOBYVATEĽ</h2><p class="dq-lead">Pripájam sa do miestnosti <strong>${DQ.room}</strong>…</p><button class="btn ghost" id="dq-leave">ZRUŠIŤ</button></div>`; document.getElementById('dq-leave').onclick = () => dqLeave(''); return; }
  const me = dqMe(), nm = i => dqEsc(S.players[i] ? S.players[i].nick : '?');
  if (S.phase === 'lobby') {
    DQ.prev = null; DQ.view = null;
    const slots = []; for (let i = S.players.length; i < S.cfg.max; i++) slots.push('<div class="dq-pl empty"><span>voľné miesto…</span></div>');
    card.innerHTML = `<div class="dq-home">
        <h2>DOBYVATEĽ — MIESTNOSŤ</h2>
        <div class="dq-lobby-grid">
          <div>
            <div class="dq-code"><span>KÓD MIESTNOSTI</span><b>${DQ.room}</b><small>${DQ.host ? 'Pošli ho kolegom. Otvoria kartu DOBYVATEĽ, napíšu kód a dajú PRIPOJIŤ SA.' : 'Si v miestnosti. Hru spustí hostiteľ.'}</small></div>
            <div class="dq-lobby">${S.players.map((p, i) => `<div class="dq-pl"><i style="background:${DQ_COL[i]}"></i><span>${dqEsc(p.nick)}${i === 0 ? ' <em>hostiteľ</em>' : ''}${i === me ? ' <em>(ty)</em>' : ''}</span>${DQ.host && i > 0 ? `<button class="dq-x" data-kick="${i}" title="Odobrať">✕</button>` : ''}</div>`).join('')}${slots.join('')}</div>
            <div class="dq-acts">
              ${DQ.host ? `<button class="btn" id="dq-go" ${S.players.length < 2 ? 'disabled' : ''}>ŠTART ▶</button><button class="btn ghost" id="dq-bot" ${S.players.length >= S.cfg.max ? 'disabled' : ''}>+ POČÍTAČ</button>` : ''}
              <button class="btn ghost" id="dq-leave">ODÍSŤ</button>
            </div>
            ${DQ.host && S.players.length < 2 ? '<div class="dq-note">Na štart treba aspoň dvoch hráčov. Ak nikto nie je poruke, pridaj počítač.</div>' : ''}
            ${S.players.filter(p => !p.bot).length < 2 ? '<div class="dq-note">Body do rebríčka sa dávajú len za hru aspoň dvoch ľudí — hra proti počítaču je tréning.</div>' : ''}
          </div>
          ${dqCfgHTML(S)}
        </div>
        ${dqRulesHTML()}
      </div>`;
    const go = document.getElementById('dq-go'), bot = document.getElementById('dq-bot');
    if (go) go.onclick = () => dqSend({ t: 'start' });
    if (bot) bot.onclick = () => dqSend({ t: 'bot' });
    card.querySelectorAll('[data-kick]').forEach(b => { b.onclick = () => dqSend({ t: 'kick', who: +b.dataset.kick }); });
    card.querySelectorAll('[data-cfg]').forEach(b => { b.onclick = () => dqSend({ t: 'cfg', key: b.dataset.cfg, val: b.dataset.cfg === 'mods' ? b.dataset.val : +b.dataset.val }); });
    document.getElementById('dq-leave').onclick = () => dqLeave('');
    return;
  }
  /* ---- hra beží: mapa cez celú obrazovku, otázka ako okno nad ňou ---- */
  card.innerHTML = '<div class="dq-home"><h2>DOBYVATEĽ</h2><p class="dq-lead">Hra beží na celej obrazovke.</p></div>';
  const st = dqStageEl(), $ = id => document.getElementById(id);
  st.style.display = ''; document.body.classList.add('dq-live');
  const quit = () => { if (DQ.S && DQ.S.phase === 'end' || confirm('Naozaj odísť z rozohranej hry?')) dqLeave(''); };
  /* kostra sa stavia raz za hru — pri každej zmene sa prekresľuje len to, čo sa zmenilo, aby nič neblikalo */
  if (st.dataset.gid !== S.gid || !$('dq-maph')) {
    st.dataset.gid = S.gid;
    st.innerHTML = `
      <div class="dq-top">
        <div class="dq-brand"><b>DOBYVATEĽ</b><span>miestnosť ${DQ.room}</span></div>
        <div class="dq-players" id="dq-chips"></div>
        <div class="dq-tools"><button id="dq-zi" title="Priblížiť">+</button><button id="dq-zo" title="Oddialiť">−</button><button id="dq-zr" title="Celá mapa">⤢</button><button id="dq-leave" class="x">ODÍSŤ</button></div>
      </div>
      <div class="dq-status" id="dq-status"><b id="dq-st-a"></b><span id="dq-st-b"></span><button class="dq-btn" id="dq-unpeek" style="display:none">VÝSLEDKY</button><div class="dq-timer"><i class="dq-bar-i" id="dq-sbar"></i></div></div>
      <div class="dq-mapwrap"><div id="dq-maph"></div><div id="dq-toast"></div><div id="dq-poph"></div></div>
      <div class="dq-bottom"><div class="dq-info" id="dq-info"><small>Ukáž na priestor a uvidíš jeho kód, hranice a body. Mapu priblížiš dvojitým ťuknutím alebo podržaním na mieste (aj kolieskom či + −), ťahaním ju posunieš.</small></div>${dqLegendHTML()}</div>`;
    $('dq-zi').onclick = () => dqZoom(0.7);
    $('dq-zo').onclick = () => dqZoom(1 / 0.7);
    $('dq-zr').onclick = () => { DQ.view = null; dqViewApply(); };
    $('dq-leave').onclick = quit;
    $('dq-unpeek').onclick = () => { DQ.peek = null; dqShow(); };
    DQ.mapSig = ''; DQ.popSig = ''; DQ.popK = -1; DQ.toastK = -1; DQ.prev = null; DQ.fx = []; DQ.view = null;
  }
  const now = Date.now(), chooser = S.chooser, mineTurn = chooser === me;
  const toast = (txt, col) => { $('dq-toast').innerHTML = `<div class="dq-toast-in" style="--pc:${col}">${txt}</div>`; };
  /* čo sa zmenilo na mape od posledného stavu → animácia a oznam */
  if (DQ.prev) S.own.forEach((o, t) => {
    if (o === DQ.prev[t] || o < 0) return;
    const ck = DQ.click && DQ.click.t === t && now - DQ.click.at < 4000 ? DQ.click : M.t[t];
    DQ.fx.push({ t, col: DQ_COL[o], was: DQ.prev[t], x: +ck.x.toFixed(1), y: +ck.y.toFixed(1), t0: now });
    const was = DQ.prev[t], k = dqEsc(M.t[t].k);
    toast(was >= 0 ? `⚔ <b>${nm(o)}</b> dobyl <b>${k}</b> hráčovi ${nm(was)} <em>+${M.t[t].v}</em>` : `<b>${nm(o)}</b> obsadil <b>${k}</b> <em>+${M.t[t].v}</em>`, DQ_COL[o]);
  });
  DQ.fx = DQ.fx.filter(f => now - f.t0 < 1600);
  clearTimeout(DQ.fxT); if (DQ.fx.length) DQ.fxT = setTimeout(dqShow, 1700);
  DQ.prev = S.own.slice();
  let pop = '', banner = '', stage = '', myTurn = false;
  if (S.phase === 'startq' || S.phase === 'startrev') {
    stage = 'ŠTART · DOMOVSKÉ LETISKÁ';
    banner = S.phase === 'startq' ? 'Úvodná otázka: kto odpovie správne a najrýchlejšie, vyberá si domovské letisko ako prvý.' : 'Poradie výberu letiska: ' + S.picks.map(nm).join(', ') + '.';
    pop = dqPopHTML(S, me, stage, banner);
  } else if (S.phase === 'startpick') {
    stage = 'ŠTART · DOMOVSKÉ LETISKÁ'; myTurn = mineTurn;
    banner = mineTurn ? '✈ Vyber si domovské letisko — klikni na jeden zo svietiacich kruhov. Odtiaľ budeš dobýjať.' : 'Domovské letisko si vyberá ' + nm(chooser) + '…';
  } else if (S.phase === 'claimq' || S.phase === 'claimrev') {
    stage = `OBSADZOVANIE · KOLO ${S.round} / ${S.cfg.claim}`;
    const uniq = S.picks.filter((p, i) => S.picks.indexOf(p) === i);
    banner = S.phase === 'claimq' ? 'Kto odpovie správne, vyberie si priestor. Najrýchlejší vyberá prvý a berie dva.' : (uniq.length ? 'Vyberajú: ' + uniq.map((p, i) => nm(p) + (i === 0 && S.picks.filter(x => x === p).length > 1 ? ' (2×)' : '')).join(', ') + '.' : 'Nikto neodpovedal správne.');
    pop = dqPopHTML(S, me, stage, S.phase === 'claimrev' ? banner : '');
  } else if (S.phase === 'pick') {
    stage = `OBSADZOVANIE · KOLO ${S.round} / ${S.cfg.claim}`; myTurn = mineTurn;
    banner = mineTurn ? '👆 Si na rade — klikni na jeden zo svietiacich priestorov.' : 'Vyberá ' + nm(chooser) + '…';
  } else if (S.phase === 'warpick') {
    stage = `SÚBOJE · KOLO ${S.wr} / ${S.cfg.war}`; myTurn = mineTurn;
    banner = mineTurn ? '⚔ Útočíš — klikni na svietiaci priestor, ktorý chceš dobyť.' : 'Útočí ' + nm(chooser) + ' a vyberá cieľ…';
  } else if (S.phase === 'duelintro' || S.phase === 'duelq' || S.phase === 'duelrev') {
    const D = S.duel, tn = dqEsc(M.t[D.t].k);
    stage = `SÚBOJE · KOLO ${S.wr} / ${S.cfg.war}`;
    banner = D.d >= 0 ? `⚔ ${nm(D.a)} útočí na ${tn} hráča ${nm(D.d)}` : `⚔ ${nm(D.a)} dobýja voľný priestor ${tn}`;
    if (S.phase === 'duelintro' && DQ.toastK !== S.k) { DQ.toastK = S.k; toast(D.d >= 0 ? `⚔ <b>${nm(D.a)}</b> útočí na <b>${tn}</b> hráča ${nm(D.d)}` : `⚔ <b>${nm(D.a)}</b> dobýja voľný priestor <b>${tn}</b>`, DQ_COL[D.a]); }
    if (S.rev) banner = S.rev.what === 'took' ? `${nm(D.a)} získava ${tn} (+${M.t[D.t].v} b.)` : S.rev.what === 'held' ? `${nm(D.d)} ubránil ${tn} (+100 b.)` : `Útok na ${tn} sa nepodaril`;
    if (S.phase !== 'duelintro') pop = dqPopHTML(S, me, stage, banner);
  } else if (S.phase === 'end') {
    stage = 'KONIEC HRY'; banner = `Vyhráva ${nm(S.rank[0])}.`;
    pop = DQ.peek === S.gid ? '' : `<div class="dq-pop end">
        <div class="dq-pop-top"><span>DOBYVATEĽ</span><span class="dq-pop-stage">KONIEC HRY</span><span></span></div>
        <div class="dq-pop-q">🏆 ${nm(S.rank[0])}</div>
        <div class="dq-pop-s">víťaz partie</div>
        <div class="dq-endlist">${S.rank.map((pi, r) => `<div class="${pi === me ? 'me' : ''}"><b>${r + 1}.</b><i style="background:${DQ_COL[pi]}"></i><span>${nm(pi)}</span><small>${S.own.filter(o => o === pi).length} priestorov</small><strong>${dqScore(S, pi)}</strong>${S.humans >= 2 && !S.players[pi].bot ? `<em>+${S.league[pi]} do rebríčka</em>` : ''}</div>`).join('')}</div>
        <div class="dq-pop-foot"><em>${S.humans < 2 ? 'Hra proti počítaču sa do rebríčka nepočíta.' : (RK.acct ? 'Body sú pripísané v rebríčku.' : 'Nie si prihlásený, body do rebríčka sa ti nepripísali.')}</em></div>
        <div class="dq-endacts">${DQ.host ? '<button class="dq-btn pri" id="dq-again">ĎALŠIA HRA ▶</button>' : ''}<button class="dq-btn" id="dq-peek">POZRIEŤ MAPU</button><button class="dq-btn" id="dq-leave2">ODÍSŤ</button></div>
      </div>`;
  }
  $('dq-chips').innerHTML = dqChipsHTML(S, me);
  $('dq-status').classList.toggle('me', myTurn);
  $('dq-st-a').textContent = stage; $('dq-st-b').innerHTML = banner;
  $('dq-unpeek').style.display = S.phase === 'end' && !pop ? '' : 'none';
  /* mapa — len keď sa na nej niečo zmenilo */
  const mapSig = JSON.stringify([S.own, S.allowed, S.duel, S.phase.indexOf('duel') === 0 ? S.phase : '', mineTurn && dqPicking(S), DQ.zoomed || 0, DQ.fx.map(f => f.t + ':' + f.t0)]);
  const info = $('dq-info'), canPick = mineTurn && dqPicking(S);
  if (mapSig !== DQ.mapSig) {
    DQ.mapSig = mapSig;
    $('dq-maph').innerHTML = dqMapSVG(S, me);
    const svg = $('dq-svg');
    st.querySelectorAll('.dq-cell').forEach(c => {
      const t = +c.dataset.t;
      c.onpointerenter = () => { info.innerHTML = dqTerrInfo(t, DQ.S); };
      c.onclick = e => {
        const Z = DQ.S; if (DQ.dragged || !Z) return;
        info.innerHTML = dqTerrInfo(t, Z);
        if (Z.chooser === dqMe() && dqPicking(Z) && Z.allowed.indexOf(t) >= 0) {
          const m = svg.getScreenCTM(); if (m && e.clientX) DQ.click = { t, x: (e.clientX - m.e) / m.a, y: (e.clientY - m.f) / m.d, at: Date.now() };
          dqSend({ t: 'pick', k: Z.k, terr: t });
        }
      };
    });
    /* priblíženie a posun mapy */
    const pt = e => { const m = svg.getScreenCTM(); return m ? { x: (e.clientX - m.e) / m.a, y: (e.clientY - m.f) / m.d } : null; };
    svg.addEventListener('wheel', e => { e.preventDefault(); const p = pt(e); dqZoom(e.deltaY < 0 ? 0.8 : 1.25, p && p.x, p && p.y); }, { passive: false });
    let drag = null;
    const zoomAt = e => { const p = pt(e); DQ.dragged = true; if (DQ.view && DQ.view.w < dqBaseView().w / 3.2) { DQ.view = null; dqViewApply(); } else dqZoom(0.45, p && p.x, p && p.y); };
    svg.onpointerdown = e => {
      DQ.dragged = false; clearTimeout(DQ.hold);
      DQ.hold = setTimeout(() => { if (!DQ.dragged) { drag = null; zoomAt(e); } }, 520);
      if (DQ.view) drag = { x: e.clientX, y: e.clientY, v: Object.assign({}, DQ.view) };
    };
    svg.addEventListener('pointerup', e => {
      clearTimeout(DQ.hold);
      const now2 = Date.now(), L = DQ.tap;
      if (L && now2 - L.t < 320 && Math.abs(L.x - e.clientX) + Math.abs(L.y - e.clientY) < 30 && !DQ.dragged) { DQ.tap = null; zoomAt(e); }
      else DQ.tap = { t: now2, x: e.clientX, y: e.clientY };
    });
    svg.onpointermove = e => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y, B = dqBaseView();
      if (Math.abs(dx) + Math.abs(dy) > 6) { DQ.dragged = true; clearTimeout(DQ.hold); }
      if (!DQ.dragged) return;
      const k = Math.max(drag.v.w / svg.clientWidth, drag.v.h / svg.clientHeight);
      DQ.view = { w: drag.v.w, h: drag.v.h, x: Math.max(B.x, Math.min(B.x + B.w - drag.v.w, drag.v.x - dx * k)), y: Math.max(B.y, Math.min(B.y + B.h - drag.v.h, drag.v.y - dy * k)) };
      dqViewApply();
    };
    svg.onpointerup = svg.onpointerleave = () => { clearTimeout(DQ.hold); drag = null; setTimeout(() => { DQ.dragged = false; }, 0); };
    if (S.duel) info.innerHTML = dqTerrInfo(S.duel.t, S);
  }
  /* okno s otázkou — animácia príchodu len pri novej otázke, nie pri každej zmene */
  const popSig = pop ? S.k + '|' + JSON.stringify(DQ.my) + '|' + S.answered.join(',') + '|' + (S.rev ? 1 : 0) : '';
  if (popSig !== DQ.popSig) {
    DQ.popSig = popSig;
    const ph = $('dq-poph');
    ph.className = pop ? 'dq-pop-wrap' + (DQ.popK === S.k ? ' still' : '') : '';
    ph.innerHTML = pop;
    if (pop) DQ.popK = S.k;
    ph.querySelectorAll('.dq-opts .choice-btn').forEach(b => { b.onclick = () => {
      const Z = DQ.S;
      if (DQ.my || b.disabled || !Z) return;
      DQ.my = { c: +b.dataset.c };
      dqSend({ t: 'ans', k: Z.k, c: DQ.my.c, ms: Date.now() - DQ.qT0 });
      dqShow();
    }; });
    const l2 = $('dq-leave2'); if (l2) l2.onclick = quit;
    const again = $('dq-again'); if (again) again.onclick = () => dqSend({ t: 'again' });
    const peek = $('dq-peek'); if (peek) peek.onclick = () => { DQ.peek = DQ.S.gid; dqShow(); };
  }
  const tot = S.tot || 0;
  const up = () => {
    const left = Math.max(0, DQ.deadline - Date.now()), f = tot ? Math.min(1, left / tot) : 0, secEl = $('dq-sec');
    st.querySelectorAll('.dq-bar-i').forEach(b => { b.style.width = (f * 100) + '%'; b.classList.toggle('low', f < 0.3); });
    if (secEl && DQ.S && !DQ.S.rev) { secEl.textContent = Math.ceil(left / 1000); secEl.classList.toggle('low', f < 0.3); }
  };
  up(); if (tot && S.phase !== 'end') DQ.bar = setInterval(up, 100);
}
