let DQ_MAP = DQ_MAPS.l;   // s = malá (2 hráči), m = stredná (3–4), l = veľká (5–6); prepína sa podľa hry
/* ============================================================
   DOBYVATEĽ — 2 až 4 hráči, VFR mapa Slovenska rozdelená na skutočné
   priestory (letiská, CTR, TMA, TRA/TSA, LZR, trieda G EAST/WEST).
   Hranice sú z verejnej VFR mapy LPS SR (DQ_MAP). Hru riadi prehliadač
   hostiteľa: posiela všetkým stav, ostatní posielajú len svoje ťahy.
   ============================================================ */
const DQ_COL = ['#e63946', '#2dc653', '#3a86ff', '#ffbe0b', '#b45cff', '#1fd6d6'];   // červený, zelený, modrý, žltý, fialový, tyrkysový hráč
const DQ_STYLE = 'a';   // vzhľad mapy: a = čistá čierna, b = čierna s typmi, c = radar
const DQ_CAT = { AD: ['LETISKO', '#ffffff'], CTR: ['CTR', '#8fb8ff'], TMA: ['TMA', '#c3d6ff'], TRA: ['TRA', '#d9c2f5'], TSA: ['TSA', '#c7a6ee'],
  R: ['LZR', '#f7b3b3'], P: ['LZP', '#f08a8a'], D: ['LZD', '#f5c9a0'], G: ['TRIEDA G', '#dfe8e2'] };
const DQ_QS = [['ac', 'MOD 01', 'TYPY LIETADIEL'], ['ap', 'MOD 02', 'LETISKÁ'], ['px', 'MOD 02', 'PREFIXY ŠTÁTOV'], ['cs', 'MOD 03', 'VOLAČKY'], ['hd', 'MOD 05', 'KURZY'], ['co', 'MOD 06', 'FREKVENCIE'], ['atm', 'OKRUH', 'ATM'], ['nav', 'OKRUH', 'NAVIGÁCIA'], ['met', 'OKRUH', 'METEOROLÓGIA'], ['eqps', 'OKRUH', 'ZARIADENIA'], ['hum', 'OKRUH', 'ĽUDSKÉ FAKTORY'], ['acft', 'OKRUH', 'LIETADLÁ'], ['pen', 'OKRUH', 'PRAC. PROSTREDIE']];
const DQ_OPT = { map: ['auto', 's', 'm', 'l'], max: [2, 3, 4, 5, 6], time: [10, 15, 20, 30], claim: [3, 5, 8, 10, 12], war: [0, 3, 5, 8, 10], pm: [0, 1], lv: [0, 1], fast: [0, 1] };
const DQ_FIX = { rest: 4200, count: 3700, tierev: 8500, startrev: 8500, startpick: 25000, claimrev: 4500, pick: 25000, warpick: 30000, modpick: 12000, duelintro: 3000, duelrev: 5500 };
const DQ_FXMS = 2400;   // ako dlho sa priestor vyfarbuje
const DQ = { id: null, room: null, host: false, S: null, net: null, H: null, my: null, k: -1, qT0: 0, deadline: 0, sig: '', sb: null, err: '', lastState: 0, loop: null, bar: null, reported: null, guest: '', prev: null };
try { DQ.id = sessionStorage.getItem('atcoDqId'); if (!DQ.id) { DQ.id = Math.random().toString(36).slice(2, 10); sessionStorage.setItem('atcoDqId', DQ.id); } } catch (e) { DQ.id = Math.random().toString(36).slice(2, 10); }
/* ---------- vlastné otázky: nahráva ich hostiteľ zo súboru (.txt, .csv, .xlsx, .docx) ----------
   Tvar tabuľky / riadku:  Otázka; správna odpoveď; zlá; zlá; zlá
   Tvar bloku v texte:     otázka na prvom riadku, pod ňou odpovede (správna označená * alebo prvá),
                           bloky oddelené prázdnym riadkom.
   Otázky ostávajú v prehliadači hostiteľa; ostatným hráčom ich posiela hra sama. */
const DQ_LASTK = 'atcoTrainerV2.dqLast', DQ_REPK = 'atcoTrainerV2.dqRep';
/* Nahlásená otázka sa uloží v prehliadači a pošle do databázy; keď sa to nepodarí, skúsi sa to pri ďalšom hlásení znova. */
function dqRepText(x) { return x.img ? '[fotka] ' + x.img : x.q; }
function dqReportQ(it) {
  const Q = lsGet(DQ_REPK, []);
  if (Q.some(r => r.q === it.q)) return;
  Q.push({ set: it.key || it.mod || '', q: String(it.q).slice(0, 400), a: String(it.a == null ? '' : it.a).slice(0, 300), nick: dqNick() });
  lsSet(DQ_REPK, Q.slice(-300));
  dqRepFlush();
}
async function dqRepFlush() {
  const Q = lsGet(DQ_REPK, []);
  for (const r of Q) {
    if (r.sent) continue;
    try { await rkRpc('atco_qreport', { p_token: RK.acct ? RK.acct.token : null, p_nick: r.nick || '', p_set: r.set, p_question: r.q, p_answer: r.a }); r.sent = 1; } catch (e) { break; }
  }
  lsSet(DQ_REPK, Q);
}
/* moje vyhodnotené odpovede v tejto partii — na prehľad chýb po hre */
function dqLogAns(S, r) {
  if (DQ.logG !== S.gid) { DQ.logG = S.gid; DQ.log = []; }
  const q = S.q, R = S.rev;
  DQ.log.push({ mod: q.mod, key: q.key, q: q.prompt, sub: q.sub && q.sub !== 'Vyber správnu odpoveď.' && !q.num ? q.sub : '', img: q.img, num: q.num, unit: q.unit, opts: q.opts.slice(), ans: R.ans, mine: q.num ? r.v : r.c, ok: q.num ? r.err === 0 : !!r.ok });
}
function dqWrong(S) { return S && DQ.logG === S.gid ? DQ.log.filter(x => !x.ok) : []; }
function dqErrsHTML(S) {
  const W = dqWrong(S), sent = lsGet(DQ_REPK, []);
  return `<div class="dq-pop errs"><div class="dq-pop-top"><span>DOBYVATEĽ</span><span class="dq-pop-stage">MOJE CHYBY · ${W.length}</span><span></span></div>
      <div class="dq-errlist">${W.map((x, i) => {
        const right = x.num ? dqNumFmt(x.ans, x.unit) : x.opts[x.ans], mine = x.num ? (x.mine === null ? 'bez odpovede' : dqNumFmt(x.mine, x.unit)) : (x.mine >= 0 ? x.opts[x.mine] : 'bez odpovede');
        const done = sent.some(r => r.q === dqRepText(x));
        return `<div class="dq-err"><small>${dqEsc(x.mod)}</small><b>${x.img ? 'Fotka lietadla — aký je to typ?' : dqEsc(x.q)}${x.sub ? `<u>${dqEsc(x.sub)}</u>` : ''}</b><span class="ok">✓ ${dqEsc(right)}</span><span class="no">✗ ${dqEsc(mine)}</span><button class="dq-rep" data-rep="${i}" ${done ? 'disabled' : ''}>${done ? '✓ NAHLÁSENÉ' : '⚑ NAHLÁSIŤ OTÁZKU'}</button></div>`;
      }).join('')}</div>
      <div class="dq-endacts">${W.some(x => !x.num) ? '<button class="dq-btn pri" id="dq-drill">PRECVIČIŤ ZNOVA ▶</button>' : ''}<button class="dq-btn" id="dq-errback">SPÄŤ NA VÝSLEDKY</button></div></div>`;
}
/* precvičenie chýb: otázka, ktorú znova pokazím, sa vráti na koniec radu */
function dqDrillSet() { const d = DQ.drill, x = d.list[0]; d.pick = null; if (x) { const right = x.opts[x.ans]; d.opts = shuffle(x.opts.slice()); d.ans = d.opts.indexOf(right); } }
function dqDrillStart() { const W = dqWrong(DQ.S).filter(x => !x.num); if (!W.length) return; DQ.drill = { list: shuffle(W.slice()), n: W.length, pick: null }; dqDrillSet(); DQ.endV = 'drill'; DQ.ui++; dqShow(); }
function dqDrillPick(i) { const d = DQ.drill; if (!d || d.pick !== null || !d.list.length) return; d.pick = i; DQ.ui++; dqShow(); }
function dqDrillNext() { const d = DQ.drill; if (!d || d.pick === null) return; const x = d.list.shift(); if (d.pick !== d.ans) d.list.push(x); dqDrillSet(); DQ.ui++; dqShow(); }
function dqDrillHTML() {
  const d = DQ.drill, x = d.list[0], top = `<div class="dq-pop-top"><span>${x ? dqEsc(x.mod) : 'DOBYVATEĽ'}</span><span class="dq-pop-stage">PRECVIČENIE CHÝB</span><span>${x ? 'ostáva ' + d.list.length : ''}</span></div>`;
  if (!x) return `<div class="dq-pop errs">${top}<div class="dq-pop-q">✓ HOTOVO</div><div class="dq-pop-s">Všetkých ${d.n} otázok si teraz zodpovedal správne.</div><div class="dq-endacts"><button class="dq-btn pri" id="dq-errback">SPÄŤ NA VÝSLEDKY</button></div></div>`;
  return `<div class="dq-pop errs">${top}
      ${x.img ? `<div class="dq-pop-img" data-img="${dqEsc(x.img)}">${DQ.imgU && DQ.imgU[x.img] ? `<img src="${dqEsc(DQ.imgU[x.img])}" alt="">` : '<span>načítavam fotku…</span>'}</div>` : `<div class="dq-pop-q${x.q.length > 60 ? ' xl' : x.q.length > 26 ? ' long' : ''}">${dqEsc(x.q)}</div>`}
      ${x.sub ? `<div class="dq-pop-s">${dqEsc(x.sub)}</div>` : ''}
      <div class="dq-dropts">${d.opts.map((o, i) => `<button class="choice-btn${d.pick === null ? '' : i === d.ans ? ' ok' : i === d.pick ? ' no' : ''}" data-dr="${i}" ${d.pick === null ? '' : 'disabled'}><kbd>${i + 1}</kbd><span>${dqEsc(o)}</span></button>`).join('')}</div>
      <div class="dq-endacts">${d.pick === null ? '' : `<button class="dq-btn pri" id="dq-drnext">${d.pick === d.ans ? 'ĎALŠIA ▶' : 'ĎALŠIA ▶ (táto príde ešte raz)'}</button>`}<button class="dq-btn" id="dq-errback">KONIEC</button></div></div>`;
}
function dqRejoin() {
  const L = lsGet(DQ_LASTK, null);
  if (!L) return;
  DQ.id = L.id; try { sessionStorage.setItem('atcoDqId', L.id); } catch (e) {}
  if (!RK.acct && L.nick) DQ.guest = L.nick;
  dqJoin(L.room);
}
const DQC_KEY = 'atcoTrainerV2.dqCustom';
let DQ_CUSTOM = lsGet(DQC_KEY, []);          // [{ name, qs: [{ q, a, w: [..] }] }]
const DQC = { msg: '', err: false };
function dqcAll() { return DQ_CUSTOM.reduce((a, s) => a.concat(s.qs.map(q => Object.assign({ set: s.name }, q))), []); }
function dqcClean(x) { return String(x == null ? '' : x).replace(/\s+/g, ' ').trim().slice(0, 220); }
function dqcFromRows(rows) {
  const out = [];
  rows.forEach(r => {
    const c = r.map(dqcClean);
    while (c.length && !c[c.length - 1]) c.pop();
    if (c.length < 3 || !c[0] || !c[1]) return;
    if (/^(ot[aá]zka|question|#|č\.?)$/i.test(c[0]) || /spr[aá]vn|correct/i.test(c[1])) return;      // hlavička
    const w = c.slice(2).filter((x, i, a) => x && x !== c[1] && a.indexOf(x) === i);
    if (w.length) out.push({ q: c[0], a: c[1], w });
  });
  return out;
}
function dqcFromText(lines) {
  const rows = [], out = []; let block = [];
  const flush = () => {
    if (block.length >= 3) {
      const q = dqcClean(block[0]); let a = null; const w = [];
      block.slice(1).forEach(l => {
        const star = /^\s*[*+✓]/.test(l) || /[*✓]\s*$/.test(l);
        const t = dqcClean(l.replace(/^\s*[*+✓]\s*/, '').replace(/\s*[*✓]\s*$/, '').replace(/^\s*(?:[-–•]|\(?[a-dA-D1-6][).:])\s+/, ''));
        if (!t) return;
        if (star && a === null) a = t; else w.push(t);
      });
      if (a === null) a = w.shift();
      const ww = w.filter((x, i, arr) => x !== a && arr.indexOf(x) === i);
      if (q && a && ww.length) out.push({ q, a, w: ww });
    }
    block = [];
  };
  lines.forEach(raw => {
    const l = String(raw).replace(/\r/g, '');
    if (/^\s*#/.test(l)) return;
    if (!l.trim()) return flush();
    /* riadok s oddeľovačmi je celá otázka len vtedy, keď ním blok začína — v odpovediach bloku môžu byť bodkočiarky */
    const sep = block.length ? null : ['\t', ';', '|'].find(s => l.split(s).length >= 3);
    if (sep) rows.push(l.split(sep)); else block.push(l);
  });
  flush();
  return dqcFromRows(rows).concat(out);
}
function dqcCsv(text) {
  const first = text.split('\n')[0] || '', sep = [';', '\t', ','].find(s => first.split(s).length >= 3) || ';', rows = [];
  let row = [], cur = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += ch; }
    else if (ch === '"') inQ = true;
    else if (ch === sep) { row.push(cur); cur = ''; }
    else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (ch !== '\r') cur += ch;
  }
  row.push(cur); rows.push(row);
  return rows;
}
/* .xlsx a .docx sú ZIP archívy s XML vnútri — rozbalia sa priamo v prehliadači */
async function dqcZip(buf, want) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf), td = new TextDecoder(), out = {};
  let e = buf.byteLength - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('ZIP');
  let p = dv.getUint32(e + 16, true);
  for (let n = dv.getUint16(e + 10, true); n > 0 && dv.getUint32(p, true) === 0x02014b50; n--) {
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lho = dv.getUint32(p + 42, true);
    const name = td.decode(u8.subarray(p + 46, p + 46 + nl));
    p += 46 + nl + xl + cl;
    if (!want(name)) continue;
    const st = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true), data = u8.subarray(st, st + csize);
    out[name] = td.decode(method === 0 ? data : await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  }
  return out;
}
async function dqcXlsx(buf) {
  const z = await dqcZip(buf, n => n === 'xl/sharedStrings.xml' || /^xl\/worksheets\/sheet\d+\.xml$/.test(n)), X = s => new DOMParser().parseFromString(s, 'application/xml');
  const shared = z['xl/sharedStrings.xml'] ? [...X(z['xl/sharedStrings.xml']).getElementsByTagName('si')].map(si => [...si.getElementsByTagName('t')].filter(t => t.parentNode.nodeName !== 'rPh').map(t => t.textContent).join('')) : [];
  const rows = [];
  Object.keys(z).filter(n => n !== 'xl/sharedStrings.xml').sort().forEach(n => {
    [...X(z[n]).getElementsByTagName('row')].forEach(r => {
      const row = [];
      [...r.getElementsByTagName('c')].forEach(c => {
        const ref = (c.getAttribute('r') || '').replace(/\d+/g, ''); let col = 0;
        for (let i = 0; i < ref.length; i++) col = col * 26 + ref.charCodeAt(i) - 64;
        const v = c.getElementsByTagName('v')[0], t = c.getAttribute('t');
        row[Math.max(0, col - 1)] = t === 's' ? shared[+(v ? v.textContent : -1)] || '' : t === 'inlineStr' ? [...c.getElementsByTagName('t')].map(x => x.textContent).join('') : (v ? v.textContent : '');
      });
      rows.push(Array.from(row, x => x == null ? '' : x));
    });
  });
  return dqcFromRows(rows);
}
async function dqcDocx(buf) {
  const z = await dqcZip(buf, n => n === 'word/document.xml');
  if (!z['word/document.xml']) throw new Error('DOCX');
  const doc = new DOMParser().parseFromString(z['word/document.xml'], 'application/xml'), body = doc.getElementsByTagName('w:body')[0], rows = [], lines = [];
  const ptext = p => { let s = ''; (function walk(n) { [...n.childNodes].forEach(c => { if (c.nodeName === 'w:t') s += c.textContent; else if (c.nodeName === 'w:tab') s += '\t'; else if (c.nodeName === 'w:br' || c.nodeName === 'w:cr') s += '\n'; else walk(c); }); })(p); return s; };
  [...(body ? body.childNodes : [])].forEach(n => {
    if (n.nodeName === 'w:p') ptext(n).split('\n').forEach(l => lines.push(l));
    else if (n.nodeName === 'w:tbl') { lines.push(''); [...n.getElementsByTagName('w:tr')].forEach(tr => rows.push([...tr.getElementsByTagName('w:tc')].map(tc => [...tc.getElementsByTagName('w:p')].map(ptext).join(' ')))); }
  });
  return dqcFromRows(rows).concat(dqcFromText(lines));
}
async function dqcLoadFiles(files) {
  let added = 0; const bad = [];
  for (const f of files) {
    try {
      const ext = (f.name.split('.').pop() || '').toLowerCase(), buf = await f.arrayBuffer();
      let qs;
      if (ext === 'xlsx') qs = await dqcXlsx(buf);
      else if (ext === 'docx') qs = await dqcDocx(buf);
      else if (ext === 'xls' || ext === 'doc') { bad.push(f.name + ' (starý formát — ulož ako .' + ext + 'x)'); continue; }
      else {
        let text = new TextDecoder('utf-8').decode(buf);
        if (text.indexOf('�') >= 0) text = new TextDecoder('windows-1250').decode(buf);     // Excel na Windowse ukladá CSV v tomto kódovaní
        text = text.replace(/^﻿/, '');
        qs = ext === 'csv' ? dqcFromRows(dqcCsv(text)) : dqcFromText(text.split('\n'));
      }
      qs = qs.slice(0, 2000);
      if (!qs.length) { bad.push(f.name + ' (nenašla sa žiadna otázka)'); continue; }
      DQ_CUSTOM = DQ_CUSTOM.filter(s => s.name !== f.name).concat([{ name: f.name, qs }]);
      added += qs.length;
    } catch (e) { bad.push(f.name + ' (nedá sa prečítať)'); }
  }
  lsSet(DQC_KEY, DQ_CUSTOM);
  DQC.msg = (added ? 'Načítaných ' + added + ' otázok. ' : '') + (bad.length ? 'Nepodarilo sa: ' + bad.join(', ') + '. Pozri vzor súboru.' : '');
  DQC.err = !added;
  dqcSync(added > 0);
}
/* po zmene vlastných otázok upraviť nastavenie miestnosti a poslať ho hráčom */
function dqcSync(turnOn) {
  const S = DQ.S;
  if (!S || !DQ.host || S.phase !== 'lobby') return dqShow();
  const n = dqcAll().length, i = S.cfg.mods.indexOf('cu');
  S.cfg.cuN = n;
  if (!n && i >= 0) { S.cfg.mods.splice(i, 1); if (!S.cfg.mods.length) S.cfg.mods = DQ_QS.map(x => x[0]); }
  if (n && turnOn && i < 0) S.cfg.mods.push('cu');
  dqCast(); dqShow();
}
function dqcSample() {
  const t = ['# VZOR — vlastné otázky pre Dobyvateľa', '# Riadky začínajúce mriežkou sa preskakujú.', '#',
    '# 1. spôsob: jeden riadok = jedna otázka, časti oddelené bodkočiarkou:', '#    Otázka; správna odpoveď; zlá odpoveď; zlá odpoveď; zlá odpoveď',
    'Ktoré letisko má ICAO kód LZKZ?; Košice; Bratislava; Poprad; Piešťany', 'Aký ICAO kód má letisko Sliač?; LZSL; LZZI; LZTT; LZPP', '',
    '# 2. spôsob: otázka na prvom riadku, odpovede pod ňou, správna označená hviezdičkou.', '#    Medzi otázkami je prázdny riadok.',
    'Ktorý prefix majú ICAO kódy slovenských letísk?', '* LZ', 'LK', 'LO', 'LH', '',
    '# V Exceli a vo Worde stačí tabuľka s rovnakými stĺpcami:', '#    Otázka | Správna | Zlá 1 | Zlá 2 | Zlá 3', ''].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + t], { type: 'text/plain;charset=utf-8' })); a.download = 'vlastne-otazky-vzor.txt';
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function dqcRowHTML(S) {
  const on = S.cfg.mods.indexOf('cu') >= 0, n = DQ.host ? dqcAll().length : (S.cfg.cuN || 0);
  if (!DQ.host) return n ? `<div class="dq-cfg-row"><span>VLASTNÉ OTÁZKY</span><div><button class="rk-chip${on ? ' on' : ''}" disabled>VLASTNÉ · ${n} otázok</button></div></div>` : '';
  return `<div class="dq-cfg-row dqc"><span>VLASTNÉ OTÁZKY</span><div>
      ${n ? `<button class="rk-chip${on ? ' on' : ''}" data-cfg="mods" data-val="cu">VLASTNÉ · ${n} otázok</button>` : ''}
      <label class="rk-chip dqc-up">+ NAHRAŤ SÚBOR<input type="file" id="dqc-file" accept=".txt,.csv,.xlsx,.docx" multiple hidden></label>
      <button class="rk-chip" id="dqc-sample">↓ VZOR SÚBORU</button>
      ${DQ_CUSTOM.map((s, i) => `<span class="dqc-set">${dqEsc(s.name)} <b>${s.qs.length}</b><button data-dqc-del="${i}" title="Odstrániť">✕</button></span>`).join('')}
      <small class="dqc-hint">Textový súbor (.txt), Excel (.xlsx), Word (.docx) alebo .csv. V tabuľke stĺpce <b>Otázka | Správna | Zlá | Zlá | Zlá</b>, v texte to isté oddelené bodkočiarkou. Otázky ostanú uložené v tomto prehliadači.</small>
      ${DQC.msg ? `<small class="dqc-msg${DQC.err ? ' err' : ''}">${dqEsc(DQC.msg)}</small>` : ''}
    </div></div>`;
}
/* ---------- tipovacie (číselné) otázky: odpoveď sa píše, vyhráva najbližší tip ----------
   Použitie: úvodná otázka o poradie výberu domovského letiska a rozstrel, keď v súboji odpovedia obaja správne.
   Údaje sú z okruhov ATM a Navigácia (rovnaký zdroj ako DQ_BANK). */
const DQ_NUM = [
  ['atm', 'Aký SSR kód označuje všeobecnú núdzu?', 7700, ''], ['atm', 'Aký SSR kód sa používa pri strate spojenia?', 7600, ''], ['atm', 'Aký SSR kód označuje protiprávne zasahovanie?', 7500, ''],
  ['atm', 'Aká je štandardná tiesňová frekvencia VHF?', 121.5, 'MHz'], ['atm', 'Aký je štandardný tlak (v celých hPa)?', 1013, 'hPa'],
  ['atm', 'Aký je vertikálny rozstup v priestore RVSM do FL 410 vrátane?', 1000, 'ft'], ['atm', 'Aký je vertikálny rozstup nad FL 410?', 2000, 'ft'],
  ['atm', 'Aký je všeobecný radarový rozstup?', 5, 'NM'], ['atm', 'Aký radarový rozstup možno použiť na konečnom priblížení pri splnení všetkých podmienok?', 2.5, 'NM'],
  ['atm', 'Aká je tolerancia pri overovaní tlakovej nadmorskej výšky mimo RVSM (±)?', 300, 'ft'], ['atm', 'Aká je tolerancia pri overovaní tlakovej nadmorskej výšky v RVSM (±)?', 200, 'ft'],
  ['atm', 'Koľko kilometrov je 1 NM?', 1.852, 'km'], ['atm', 'Aká je maximálna rýchlosť pod 10 000 ft v triedach D, E, F a G?', 250, 'kt IAS'],
  ['atm', 'O koľko najmenej musí byť TL nad TA?', 1000, 'ft'], ['atm', 'Aký je základný časový rozstup pre HEAVY za SUPER pri prílete?', 2, 'min'], ['atm', 'Aký je základný časový rozstup pre LIGHT za SUPER pri prílete?', 4, 'min'],
  ['atm', 'Aký je všeobecný pozdĺžny časový rozstup na rovnakej trati a hladine?', 15, 'min'], ['atm', 'Aké časové minimum platí, ak je predné lietadlo na rovnakej trati a hladine o 40 kt rýchlejšie?', 3, 'min'],
  ['atm', 'Aké vzdialenostné minimum (DME/GNSS) platí, ak predné lietadlo letí o 20 kt rýchlejšie?', 10, 'NM'],
  ['atm', 'Koľko sekúnd pred CPA sa približne vydáva TA?', 48, 's'], ['atm', 'Koľko sekúnd pred CPA sa približne vydáva RA?', 35, 's'],
  ['atm', 'Koľko minút pred EOBT sa najneskôr bežne podáva FPL?', 60, 'min'], ['atm', 'Koľko hodín pred EOBT sa najneskôr podáva FPL pre let podliehajúci ATFM?', 3, 'h'],
  ['atm', 'Pri akej zmene času preletu bodu sa odchýlka hlási ATS? (viac ako … minúty)', 2, 'min'],
  ['atm', 'Ktorý ICAO Doc obsahuje indikátory miesta?', 7910, ''], ['atm', 'Ktorý ICAO Doc obsahuje designátory typov lietadiel?', 8643, ''], ['atm', 'Ktorý ICAO Doc obsahuje skratky a kódy?', 8400, ''],
  ['atm', 'QNH je 980 hPa a TA je 10 000 ft. Aká je prevodná hladina? (FL)', 120, ''], ['atm', 'QNH je 1030 hPa a TA je 10 000 ft. Aká je prevodná hladina? (FL)', 110, ''],
  ['atm', 'Od akej vzdialenosti od prahu dráhy sa na konečnom priblížení už nemá uplatňovať úprava rýchlosti?', 4, 'NM'], ['atm', 'Po koľkých minútach bez očakávanej správy od lietadla sa vyhlasuje INCERFA?', 30, 'min'], ['atm', 'Koľkým stopám približne zodpovedá 1 hPa?', 27, 'ft'], ['atm', 'Koľkým metrom približne zodpovedá 1 hPa?', 8, 'm'], ['atm', 'Aká je prevodná nadmorská výška (TA) na Slovensku?', 10000, 'ft'], ['atm', 'Aké je vzdialenostné minimum pre LIGHT za SUPER?', 8, 'NM'], ['atm', 'Aké je vzdialenostné minimum pre LIGHT za HEAVY?', 6, 'NM'], ['atm', 'Aké je vzdialenostné minimum pre HEAVY za HEAVY?', 4, 'NM'], ['atm', 'Od akej maximálnej vzletovej hmotnosti patrí lietadlo do kategórie HEAVY? (v tonách)', 136, 't'], ['atm', 'Do akej maximálnej vzletovej hmotnosti patrí lietadlo do kategórie LIGHT? (v tonách)', 7, 't'], ['atm', 'Koľko sekúnd by malo najviac trvať jedno vysielanie ATIS?', 30, 's'], ['atm', 'Koľko hodín pred EOBT možno letový plán podať najskôr?', 120, 'h'], ['atm', 'Aká je minimálna letová dohľadnosť pre VMC vo FL 100 a vyššie?', 8, 'km'], ['atm', 'Aká je minimálna dohľadnosť pre zvláštny let VFR lietadla?', 1500, 'm'], ['atm', 'Aký kód odpovedača nastaví let VFR, ktorému ATS nepridelilo iný kód?', 7000, ''], ['atm', 'Aké je základné pozdĺžne vzdialenostné minimum pri použití DME alebo GNSS?', 20, 'NM'], ['atm', 'Aký je strop pre lety VFR? (FL)', 195, ''],
  ['met', 'Aká je teplota na hladine mora podľa ISA?', 15, '°C'], ['met', 'V akej výške je tropopauza podľa ISA?', 11, 'km'], ['met', 'O koľko °C klesá teplota na 1 000 ft podľa ISA?', 2, '°C'],
  ['met', 'Koľko percent vzduchu tvorí kyslík?', 21, '%'], ['met', 'Koľko percent vzduchu tvorí dusík?', 78, '%'], ['met', 'V akej výške je tlak približne polovičný oproti hladine mora?', 5500, 'm'],
  ['met', 'Od akej dohľadnosti platí CAVOK?', 10, 'km'], ['met', 'Pod akou dohľadnosťou hovoríme o hmle?', 1000, 'm'], ['met', 'O koľko uzlov musia nárazy prevýšiť priemerný vietor, aby boli v METAR-e?', 10, 'kt'],
  ['met', 'Na koľko hodín platí predpoveď TREND?', 2, 'h'], ['met', 'Aká je najdlhšia platnosť bežného SIGMET-u?', 4, 'h'], ['met', 'Aká je minimálna rýchlosť dýzového prúdenia podľa WMO?', 60, 'kt'],
  ['met', 'Do akej letovej hladiny platí predpoveď GAMET?', 100, 'FL'], ['met', 'V akej výške nad zemou sa meria prízemný vietor?', 10, 'm'], ['met', 'Pod akou dohľadnosťou alebo RVR sa do METAR-u zaraďuje RVR?', 1500, 'm'],
  ['met', 'V akej výške obiehajú geostacionárne družice?', 36000, 'km'], ['met', 'V akej výške je podľa ISA nulová izoterma?', 7500, 'ft'], ['met', 'Koľko osmín je najviac pri označení BKN?', 7, ''],
  ['eqps', 'Na akej frekvencii vysiela dotazovač SSR?', 1030, 'MHz'], ['eqps', 'Na akej frekvencii odpovedá palubný odpovedač?', 1090, 'MHz'], ['eqps', 'Koľko kódov módu A je k dispozícii?', 4096, ''],
  ['eqps', 'Koľko bitov má adresa lietadla Mode S?', 24, ''], ['eqps', 'V akých krokoch prenáša mód C výšku?', 100, 'ft'], ['eqps', 'S akým rozlíšením môže prenášať výšku Mode S?', 25, 'ft'],
  ['eqps', 'Aký kanálový odstup sa zaviedol v Európe na VHF?', 8.33, 'kHz'], ['eqps', 'Koľko znakov má adresa AFTN?', 8, ''], ['eqps', 'Koľko dní sa podľa ICAO najmenej archivujú telekomunikačné záznamy?', 30, 'dní'],
  ['eqps', 'Do koľkých sekúnd sa má nadviazať spojenie pri priamom prístupe (DA)?', 2, 's'], ['eqps', 'Do koľkých sekúnd sa má nadviazať spojenie pri nepriamom prístupe (IDA)?', 15, 's'], ['eqps', 'Akú vlnovú dĺžku má signál s frekvenciou 100 MHz?', 3, 'm'],
  ['eqps', 'Akej vzdialenosti cieľa zodpovedá 1 µs medzi vyslaním a príjmom radarového impulzu?', 150, 'm'], ['eqps', 'Na akej frekvencii pracuje UAT?', 978, 'MHz'], ['eqps', 'Koľko prijímačov treba najmenej na 3D polohu multilateráciou?', 4, ''],
  ['eqps', 'Aký je odstup impulzov P1 a P3 pri móde A?', 8, 'µs'], ['eqps', 'Aký je odstup impulzov P1 a P3 pri móde C?', 21, 'µs'], ['eqps', 'Koľko adresátov môže mať najviac jedna správa AFTN?', 21, ''],
  ['hum', 'Koľko obetí si vyžiadala zrážka na Tenerife v roku 1977?', 583, ''], ['hum', 'Koľko položiek približne udrží krátkodobá pamäť?', 7, ''], ['hum', 'Koľko percent informácie odovzdávame samotnými slovami?', 7, '%'],
  ['hum', 'Koľko percent pôsobenia v komunikácii sa pripisuje tónu hlasu?', 38, '%'], ['hum', 'Koľko percent pôsobenia v komunikácii sa pripisuje reči tela?', 55, '%'], ['hum', 'Po koľko centimetrov siaha intímna zóna?', 45, 'cm'],
  ['hum', 'Po koľko centimetrov siaha osobná zóna?', 120, 'cm'], ['hum', 'Pri akej teplote začína podľa učebných textov klesať výkonnosť?', 22, '°C'], ['hum', 'Nad akou teplotou klesá výkonnosť prudko?', 26, '°C'],
  ['hum', 'V akej najmenšej vzdialenosti má byť monitor od očí?', 40, 'cm'], ['hum', 'Aká má byť najmenšia intenzita osvetlenia pracoviska s monitorom?', 300, 'lx'], ['hum', 'Koľko minút trvá úplná adaptácia zraku na tmu?', 30, 'min'],
  ['hum', 'V ktorom roku navrhol E. Edwards model SHELL?', 1972, ''], ['hum', 'Koľko minút sa odporúča učiť sa v kuse najviac?', 90, 'min'], ['hum', 'Koľko percent nočného spánku tvorí približne REM spánok?', 20, '%'],
  ['acft', 'Do akej hmotnosti patrí lietadlo do kategórie LIGHT?', 7000, 'kg'], ['acft', 'Od akej hmotnosti patrí lietadlo do kategórie HEAVY?', 136000, 'kg'], ['acft', 'Aká je horná hranica VAT kategórie B?', 120, 'kt'],
  ['acft', 'Aká je horná hranica VAT kategórie C?', 140, 'kt'], ['acft', 'Aká je horná hranica VAT kategórie D?', 165, 'kt'], ['acft', 'Aký je násobok zaťaženia v ustálenej zatáčke s náklonom 60°?', 2, ''],
  ['acft', 'O koľko percent vzrastie pádová rýchlosť v zatáčke s náklonom 60°?', 41, '%'], ['acft', 'Akú najvyššiu výšku v kabíne udržiava pretlakovanie?', 8000, 'ft'], ['acft', 'Na akej frekvencii vysiela ELT pre družicový systém?', 406, 'MHz'],
  ['acft', 'Aké radarové minimum platí pre MEDIUM za HEAVY?', 5, 'NM'], ['acft', 'Aké radarové minimum platí pre LIGHT za HEAVY?', 6, 'NM'], ['acft', 'Aké radarové minimum platí pre LIGHT za A380?', 8, 'NM'],
  ['acft', 'Koľko kategórií má schéma RECAT-EU?', 6, ''], ['acft', 'Pri akej rýchlosti stúpania je dosiahnutý praktický dostup?', 100, 'ft/min'], ['acft', 'Koľko percent hlásenej zadnej zložky vetra sa zahŕňa do výpočtu vzletu?', 150, '%'],
  ['acft', 'Na koľko minút vyčkávania musí stačiť konečná záloha paliva prúdového lietadla?', 30, 'min'],
  ['pen', 'Do akej výšky siaha na Slovensku neriadený priestor triedy G?', 8000, 'ft'], ['pen', 'Koľko hasičských kategórií letísk pozná Annex 14?', 10, ''], ['pen', 'Do koľkých minút má hasičská služba zasiahnuť na ktorejkoľvek dráhe?', 3, 'min'],
  ['pen', 'Koľko svetiel má sústava PAPI?', 4, ''], ['pen', 'Na akú vertikálnu rýchlosť sa má najviac znížiť stúpanie pred dosiahnutím hladiny?', 1500, 'ft/min'], ['pen', 'Pod akou MTOW sú lety oslobodené od traťových odplát?', 2, 't'],
  ['pen', 'Koľko typov postupov NADP sa rozlišuje?', 2, ''], ['pen', 'Ktorý Annex ICAO sa zaoberá ochranou životného prostredia?', 16, ''], ['pen', 'Ktorý Annex ICAO upravuje letiská?', 14, ''], ['pen', 'Ktorý Annex ICAO upravuje pátranie a záchranu?', 12, ''],
  ['nav', 'Koľko segmentov má koncept GPS?', 3, ''], ['nav', 'Aká je minimálna požadovaná konfigurácia GPS (počet satelitov)?', 24, ''], ['nav', 'Koľko družíc najmenej prijíma GNSS prijímač na výpočet polohy?', 4, ''],
  ['nav', 'Aký je približný dosah VOR?', 200, 'NM'], ['nav', 'Aká je maximálna celková chyba systému VOR (±)?', 5, '°'], ['nav', 'Kde sa začína frekvenčné pásmo VOR?', 108, 'MHz'], ['nav', 'Kde sa končí frekvenčné pásmo VOR?', 117.975, 'MHz'],
  ['nav', 'Aký uhol má správna zostupová rovina ILS?', 3, '°'], ['nav', 'Pri akom uhle je prvý falošný glide slope lúč ILS?', 6, '°'],
  ['nav', 'Lietadlo má TAS 240 kt a GS 210 kt. Aká silná je zložka protivetra?', 30, 'kt'],
];
function dqGenNum(mods) {
  const pick = a => a[Math.floor(Math.random() * a.length)], M = mods || [], H = DQ.H, sub = 'Napíš číslo. Vyhráva najbližší tip, pri zhode rýchlejší.';
  const kinds = [];
  const bank = DQ_NUM.filter(x => M.indexOf(x[0]) >= 0);
  if (bank.length) kinds.push(() => { const x = pick(bank); return { mod: dqSetName(x[0]), key: x[0], prompt: x[1], ans: x[2], unit: x[3] }; });
  if (M.indexOf('co') >= 0) kinds.push(() => { const c = {}; CO_UNITS.forEach(u => { c[u.n] = (c[u.n] || 0) + 1; }); const u = pick(CO_UNITS.filter(x => x.f && !x.alt && c[x.n] === 1)); return { mod: 'MOD 06 · FREKVENCIE', prompt: u.n + ' — na akej frekvencii pracuje?', ans: +u.f.replace(',', '.'), unit: 'MHz' }; });
  if (M.indexOf('hd') >= 0) kinds.push(() => { const h = 5 * (1 + Math.floor(Math.random() * 72)); return { mod: 'MOD 05 · KURZY', prompt: 'Aký je opačný kurz ku ' + dqPad(h) + '°?', ans: +dqPad(h + 180), unit: '°' }; });
  if (!kinds.length) kinds.push(() => { const x = pick(DQ_NUM); return { mod: dqSetName(x[0]), key: x[0], prompt: x[1], ans: x[2], unit: x[3] }; });
  for (let i = 0; i < 30; i++) {
    const q = pick(kinds)();
    if (!(H && H.used['#' + q.prompt])) { if (H) H.used['#' + q.prompt] = 1; return Object.assign(q, { num: true, sub }); }
  }
  return Object.assign(pick(kinds)(), { num: true, sub });
}
/* rýchla hra skracuje všetky pevné fázy okrem odpočtu; pri otázke najvyššej obťažnosti je na odpoveď 60 % času */
function dqDur(phase) {
  const S = DQ.S;
  if (phase === 'startq' || phase === 'claimq' || phase === 'duelq' || phase === 'tieq') return Math.max(6000, Math.round(S.cfg.time * 1000 * (S.q && S.q.lvl === 4 ? 0.6 : 1)));
  const f = DQ_FIX[phase] || 0;
  return S.cfg.fast && phase !== 'count' ? Math.round(f * 0.6) : f;
}
/* ---------- obťažnosť otázok ----------
   Úroveň otázky z okruhov sa odhaduje z jej podoby: výpočty a presné čísla sú ťažké, významy skratiek a názvy ľahké.
   Je to odhad, nie meranie — slúži na to, aby za cennejší priestor padala náročnejšia otázka. */
const DQ_LVN = ['', 'ĽAHKÁ', 'STREDNÁ', 'ŤAŽKÁ', 'MEGA ŤAŽKÁ'];
const DQ_GENLV = { px: 1, hd: 1, ap: 2, ac: 2, co: 3, cs: 3 };
function dqQLevel(c) {
  if (c.l) return c.l;
  /* číselná možnosť = začína číslom (aj „asi 5 NM“, „do 2 s“); „Annex 3“ či „FL 180“ sa za číslo nepočíta */
  const isNum = x => /^(asi |približne |najmenej |najviac |okolo |do |od |o |nad |pod |po |za |v roku )?[\d+\-−]/i.test(x);
  const q = c.q, all = [c.a].concat(c.w), nums = all.filter(isNum).length;
  let n = 0;
  if (/^(Čo znamená|Akú skratku|Akú farbu|Ako sa (nazýva|označuje|volá)|Akým písmenom|Aký indikátor|Aké je označenie|Do ktorej (skupiny|kategórie))/.test(q)) n--;
  if (/^Čo je [^,]{1,22}\?$/.test(q)) n--;
  if (c.a.length <= 7 && !isNum(c.a)) n--;
  if (nums >= 3) n++;
  if (nums >= 3 && /\d/.test(q)) n++;
  if (q.length > 78) n++;
  if (/^(Prečo|Čím sa líši|Ako (vplýva|sa mení|ovplyvn|sa zmení)|Od čoho|Čo sa stane|Kedy)/.test(q)) n++;
  return (c.l = n <= -1 ? 1 : n === 0 ? 2 : 3);
}
function dqLvlFor(t) { const v = DQ_MAP.t[t].v; return v >= 500 ? 4 : v >= 400 ? 3 : v >= 200 ? 2 : 1; }
function dqSetName(k) { const x = DQ_QS.find(y => y[0] === k); return x ? x[1] + ' · ' + x[2] : 'VLASTNÉ OTÁZKY'; }
function dqAsking(S) { return S.phase === 'startq' || S.phase === 'claimq' || S.phase === 'duelq' || S.phase === 'tieq'; }
function dqPicking(S) { return S.phase === 'startpick' || S.phase === 'pick' || S.phase === 'warpick'; }
function dqPad(n) { n = ((n - 1) % 360 + 360) % 360 + 1; return String(n).padStart(3, '0'); }

/* otázky do hry: len také, ktoré sa dajú položiť textom a majú jednu správnu odpoveď */
function dqGenQ(mods, lvl) {
  const pick = a => a[Math.floor(Math.random() * a.length)], want = lvl ? Math.min(3, lvl) : 0;
  const mk = (mod, prompt, sub, right, pool) => {
    const o = [right]; let g = 0;
    while (o.length < 4 && g++ < 600) { const x = pick(pool); if (x && o.indexOf(x) < 0) o.push(x); }
    const opts = shuffle(o);
    return { mod, prompt, sub, opts, ans: opts.indexOf(right) };
  };
  const once = (arr, f) => { const c = {}; arr.forEach(x => { c[f(x)] = (c[f(x)] || 0) + 1; }); return arr.filter(x => c[f(x)] === 1); };
  const K = {
    ac: () => { const a = pick(AIRCRAFT); if (a.wiki && Math.random() < 0.4) return Object.assign(mk('MOD 01 · TYPY', '', 'Aké je ICAO označenie lietadla na fotke?', a.icao, AIRCRAFT.map(x => x.icao)), { img: a.wiki }); return Math.random() < 0.5 ? mk('MOD 01 · TYPY', a.icao, 'Ktorý typ lietadla má toto ICAO označenie?', a.name, AIRCRAFT.map(x => x.name))
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
  const bank = (k, name) => () => { let P = DQ_BANK[k]; if (want) { const L = P.filter(c => dqQLevel(c) === want); if (L.length >= 8) P = L; } const c = pick(P), opts = shuffle([c.a].concat(c.w)); return { mod: name, prompt: c.q, sub: 'Vyber správnu odpoveď.', opts, ans: opts.indexOf(c.a) }; };
  K.atm = bank('atm', 'OKRUH · ATM'); K.nav = bank('nav', 'OKRUH · NAVIGÁCIA');
  K.met = bank('met', 'OKRUH · METEOROLÓGIA'); K.eqps = bank('eqps', 'OKRUH · ZARIADENIA A SYSTÉMY'); K.hum = bank('hum', 'OKRUH · ĽUDSKÉ FAKTORY');
  K.acft = bank('acft', 'OKRUH · LIETADLÁ'); K.pen = bank('pen', 'OKRUH · PRACOVNÉ PROSTREDIE');
  const CU = dqcAll();
  if (CU.length) K.cu = () => { const c = pick(CU), opts = shuffle([c.a].concat(shuffle(c.w).slice(0, 3))); return { mod: 'VLASTNÉ OTÁZKY', prompt: c.q, sub: 'Vyber správnu odpoveď.', opts, ans: opts.indexOf(c.a) }; };
  const ks = (mods || []).filter(m => K[m]), all = ks.length ? ks : Object.keys(K).filter(m => m !== 'cu'), H = DQ.H;
  /* moduly trenažéra majú pevnú úroveň; okruhy a vlastné otázky sa hodia na každú (okruhy si vyberú otázky danej úrovne) */
  const fit = want ? all.filter(m => DQ_BANK[m] || m === 'cu' || DQ_GENLV[m] === want) : all, use = fit.length ? fit : all;
  const fin = (q, m) => {
    q.key = m; q.lvl = lvl || 0;
    if (lvl === 1 && q.opts.length > 3) { const a = q.opts[q.ans], drop = pick(q.opts.map((o, i) => i).filter(i => i !== q.ans)); q.opts = q.opts.filter((o, i) => i !== drop); q.ans = q.opts.indexOf(a); }
    return q;
  };
  for (let i = 0; i < 40; i++) {
    const m = pick(use), q = K[m]();
    const key = (q.img || '') + q.prompt + q.sub;
    if (q.opts.length >= 2 && q.ans >= 0 && !(H && H.used[key])) { if (H) H.used[key] = 1; return fin(q, m); }
  }
  const m = pick(use); return fin(K[m](), m);
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
function dqLeave(msg, keep) {
  if (!keep) lsSet(DQ_LASTK, null);
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
  DQ.S = { gid: '', k: 0, phase: 'lobby', players: [{ id: DQ.id, nick: dqNick(), bot: false, on: true, bonus: 0 }], cfg: { map: 'auto', max: 4, time: 15, claim: 5, war: 5, pm: 0, lv: 1, fast: 0, mods: DQ_QS.map(x => x[0]), cuN: dqcAll().length },
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
    if (Date.now() - DQ.lastState > 12000 && dqMe() >= 0) dqLeave('Spojenie s hostiteľom sa stratilo. Ak hra ešte beží, môžeš sa do nej vrátiť.', true);
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
  if (S.k !== DQ.k) { DQ.k = S.k; DQ.qT0 = Date.now(); DQ.my = null; DQ.sel = -1; if (S.phase !== 'lobby' && S.phase !== 'end') RK.lastAns = Date.now(); }
  /* úspešnosť aj z Dobyvateľa: každá moja vyhodnotená odpoveď v hre aspoň dvoch ľudí */
  if (S.rev && S.q && DQ.revK !== S.gid + S.k) {
    DQ.revK = S.gid + S.k; const r = S.rev.res[dqMe()];
    if (r) {
      dqLogAns(S, r);
      if (S.humans >= 2) { rkAdd('conquer', r.ok ? { c: 1 } : { w: 1 }); if (DQ_BANK[S.q.key] && !S.q.num) rkAdd('q_' + S.q.key, r.ok ? { c: 1 } : { w: 1 }); rkPendSave(); }
    }
  }
  /* kde som hral naposledy — aby sa dalo po výpadku alebo obnovení stránky vrátiť do rozohranej hry */
  if (!DQ.host && dqMe() >= 0) {
    if (S.phase === 'end' || S.phase === 'lobby') { if (DQ.lastSave) { DQ.lastSave = 0; lsSet(DQ_LASTK, null); } }
    else if (Date.now() - (DQ.lastSave || 0) > 4000) { DQ.lastSave = Date.now(); lsSet(DQ_LASTK, { room: DQ.room, id: DQ.id, nick: dqNick(), t: Date.now() }); }
  }
  if (S.map && DQ_MAPS[S.map] && DQ_MAP !== DQ_MAPS[S.map]) { DQ_MAP = DQ_MAPS[S.map]; DQ.mapSig = ''; DQ.view = null; DQ.prev = null; DQ.fx = []; }
  DQ.deadline = Date.now() + (S.dur || 0);
  if (S.phase === 'end' && DQ.reported !== S.gid) {
    DQ.reported = S.gid;
    const me = dqMe(), place = S.rank.indexOf(me);
    if (me >= 0 && S.league[me] != null && S.humans >= 2) { rkAdd('conquer', { p: S.league[me], g: 1, v: place === 0 ? 1 : 0 }); rkPendSave(); rkFlush(); }
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
      if (m.key === 'mods' && m.val === 'cu' && !dqcAll().length) return;
      if (m.key === 'mods') { const i = S.cfg.mods.indexOf(m.val); if (i < 0) S.cfg.mods.push(m.val); else if (S.cfg.mods.length > 1) S.cfg.mods.splice(i, 1); }
      else if (DQ_OPT[m.key] && DQ_OPT[m.key].indexOf(m.val) >= 0 && (m.key !== 'max' || m.val >= S.players.length)) { S.cfg[m.key] = m.val; if (m.key === 'fast' && m.val) { S.cfg.claim = 3; S.cfg.war = 3; S.cfg.time = 10; } }
      else if (m.key === 'map' && DQ_OPT.map.indexOf(String(m.val)) >= 0) S.cfg.map = String(m.val);
      return dqCast();
    }
    if (m.t === 'start' && S.players.length >= 2) return dqStart();
  }
  if (m.t === 'again' && pi === 0 && S.phase === 'end') { S.phase = 'lobby'; S.k++; S.players = S.players.filter(p => p.on); S.players.forEach(p => { p.bonus = 0; p.out = false; }); return dqCast(); }
  if (m.t === 'ans' && m.k === S.k && dqAsking(S) && S.q.who.indexOf(pi) >= 0 && !H.got[pi]) {
    H.got[pi] = { c: m.c, v: typeof m.v === 'number' && isFinite(m.v) ? m.v : null, ms: Math.max(0, Math.min(S.tot, +m.ms || 0)) };
    S.answered = Object.keys(H.got).map(Number);
    dqCast(); return dqAllIn();
  }
  if (m.t === 'mod' && m.k === S.k && S.phase === 'modpick' && S.duel && pi === S.duel.a && S.cfg.mods.indexOf(m.m) >= 0) { S.duel.m = m.m; clearTimeout(H.timer); return H.modGo(); }
  if (m.t === 'pick' && m.k === S.k && dqPicking(S) && pi === S.chooser && S.allowed.indexOf(m.terr) >= 0) return dqChoose(m.terr);
}
/* mapa podľa počtu hráčov: 2 → malá, 3–4 → stredná, 5–6 → veľká (hostiteľ ju môže zvoliť aj ručne) */
function dqMapFor(S) { const m = S.cfg.map; if (m && m !== 'auto' && DQ_MAPS[m]) return m; const n = S.players.length; return n <= 2 ? 's' : n <= 4 ? 'm' : 'l'; }
function dqLive(S) { return S.players.map((p, i) => p.out ? -1 : i).filter(i => i >= 0); }
function dqStart() {
  const S = DQ.S, H = DQ.H;
  S.gid = DQ.room + Date.now();
  S.map = dqMapFor(S); DQ_MAP = DQ_MAPS[S.map];
  S.own = DQ_MAP.t.map(() => -1);
  S.base = S.players.map(() => -1); S.lives = S.players.map(() => 3);
  S.players.forEach(p => { p.bonus = 0; p.out = false; });
  S.humans = S.players.filter(p => !p.bot).length;
  S.round = 0; S.wr = 0; S.wq = []; S.duel = null; S.rank = null; S.league = null; S.outs = []; S.dist = 0; S.left = 0; H.used = {};
  dqAskSoon('startq', dqLive(S), dqStartRev, false, true);
}
/* štart: tipovacia otázka — kto je najbližšie, vyberá si domovské letisko prvý */
function dqStartRev() {
  const S = DQ.S, H = DQ.H, R = dqNumRes();
  S.picks = R.order.slice();
  S.rev = { num: true, ans: H.ans, unit: S.q.unit, res: R.res, order: R.order };
  dqPhase('startrev', dqStartPick);
}
function dqStartPick() {
  const S = DQ.S, H = DQ.H;
  if (!S.picks.length) return dqClaimQ();
  S.chooser = S.picks[0]; S.allowed = dqFree().filter(t => DQ_MAP.t[t].c === 'AD'); S.q = null; S.rev = null; H.nudged = false;
  dqPhase('startpick', dqAuto);
  dqNudge();
}
/* pred otázkou: krátka pauza (aby bolo vidno, čo sa stalo na mape) a odpočet 3 – 2 – 1 – GO */
function dqAskSoon(phase, who, next, rest, num, opt) {
  const S = DQ.S, H = DQ.H, mods = (opt && opt.mods) || S.cfg.mods;
  H.pq = num ? dqGenNum(mods) : dqGenQ(mods, opt && opt.lvl); S.pre = H.pq.img || ''; S.cnt = phase; S.q = null; S.rev = null; S.allowed = [];
  const go = () => dqPhase('count', () => dqAsk(phase, who, next));
  if (rest) dqPhase('rest', go); else go();
}
function dqAsk(phase, who, next) {
  const S = DQ.S, H = DQ.H, q = H.pq || dqGenQ(S.cfg.mods);
  H.pq = null; S.pre = '';
  H.ans = q.ans; H.got = {}; S.answered = []; S.rev = null;
  S.q = { mod: q.mod, key: q.key || '', lvl: q.lvl || 0, prompt: q.prompt, sub: q.sub, opts: q.opts || [], img: q.img || '', num: !!q.num, unit: q.unit || '', who };
  dqPhase(phase, next);
  const k = S.k, T = S.tot;
  who.forEach(pi => {
    const p = S.players[pi];
    if (!p.bot) return;
    const ms = Math.min(T - 600, 2200 + Math.random() * 6000);
    let m;
    if (q.num) {      // počítač tipuje: niekedy presne, inak s odchýlkou do ~20 %
      const dec = (String(q.ans).split('.')[1] || '').length, off = Math.random() < 0.3 ? 0 : (Math.random() * 2 - 1) * 0.2 * Math.max(1, Math.abs(q.ans));
      m = { t: 'ans', id: p.id, k, v: +(q.ans + off).toFixed(dec), ms };
    } else m = { t: 'ans', id: p.id, k, c: Math.random() < 0.6 ? q.ans : (q.ans + 1 + Math.floor(Math.random() * (q.opts.length - 1))) % q.opts.length, ms };
    H.bots.push(setTimeout(() => { if (DQ.S && DQ.S.k === k) dqHostMsg(m); }, ms));
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
/* tipovacia otázka: poradie podľa vzdialenosti od správneho čísla, pri zhode podľa času; kto neodpovedal, je posledný */
function dqNumRes() {
  const S = DQ.S, H = DQ.H, res = {};
  S.q.who.forEach(pi => { const g = H.got[pi], has = g && typeof g.v === 'number' && isFinite(g.v); res[pi] = has ? { v: g.v, ms: Math.round(g.ms), err: +Math.abs(g.v - H.ans).toFixed(6) } : { v: null, ms: 0, err: -1 }; });
  const yes = S.q.who.filter(pi => res[pi].v !== null).sort((a, b) => res[a].err - res[b].err || res[a].ms - res[b].ms);
  const order = yes.concat(shuffle(S.q.who.filter(pi => res[pi].v === null)));
  order.forEach((pi, n) => { res[pi].ok = n === 0 && res[pi].v !== null; });
  return { res, order };
}
/* Po obsadzovacích kolách sa zvyšné voľné priestory rozdelia tak, aby sa podiely hráčov nezmenili:
   kto mal 40 % bodov, má 40 % aj potom. Prideľuje sa len priestor susediaci s tým, čo hráč už má.
   Postup: v každom kroku sa urobí to pridelenie, po ktorom sú podiely najbližšie pôvodným; platí posledný stav,
   v ktorom sa žiadny podiel bodov nepohol o viac než DQ_FAIR a žiadny rozdiel medzi dvoma hráčmi sa nezmenšil.
   Čo sa takto rozdeliť nedá, ostane voľné. */
const DQ_FAIR = 0.012;
function dqFairSplit(own0, live, T) {
  let own = own0.slice();
  const sum = a => a.reduce((x, y) => x + y, 0);
  const pts = () => live.map(p => own.reduce((s, o, t) => s + (o === p ? T[t].v : 0), 0)), cnt = () => live.map(p => own.filter(o => o === p).length);
  const s0 = pts(), c0 = cnt(), S0 = sum(s0), C0 = sum(c0);
  if (!S0 || live.length < 2) return { own: own0.slice(), n: 0 };
  const fair = () => {
    const s = pts(), c = cnt(), S = sum(s), C = sum(c); let d = 0, gapOk = true;
    live.forEach((p, k) => { d = Math.max(d, Math.abs(s[k] / S - s0[k] / S0), 0.5 * Math.abs(c[k] / C - c0[k] / C0)); });
    live.forEach((p, a) => live.forEach((q, b) => { if (s0[a] > s0[b] && (s[a] - s[b]) / S < (s0[a] - s0[b]) / S0 - 0.004) gapOk = false; }));
    return { d, gapOk };
  };
  let best = own.slice(), bestN = 0, n = 0;
  for (let guard = 0; guard < 300; guard++) {
    let cand = null, cd = 1e9;
    own.forEach((o, t) => {
      if (o >= 0) return;
      live.forEach(p => { if (!T[t].j.some(a => own[a] === p)) return; own[t] = p; const f = fair(); own[t] = -1; if (f.d < cd - 1e-12) { cd = f.d; cand = [t, p]; } });
    });
    if (!cand) break;
    own[cand[0]] = cand[1]; n++;
    const f = fair();
    if (f.d <= DQ_FAIR && f.gapOk) { best = own.slice(); bestN = n; }
  }
  return { own: best, n: bestN };
}
function dqFree() { return DQ.S.own.map((o, i) => o < 0 ? i : -1).filter(i => i >= 0); }
function dqScore(S, i) { let s = S.players[i].bonus || 0; S.own.forEach((o, t) => { if (o === i) s += DQ_MAP.t[t].v; }); return s; }
function dqClaimQ() {
  const S = DQ.S;
  S.duel = null;
  if (!dqFree().length || S.round >= S.cfg.claim) {
    const split = dqFairSplit(S.own, dqLive(S), DQ_MAP.t);
    S.own = split.own; S.dist = split.n; S.left = dqFree().length;
    S.cnt = S.cfg.war ? 'war' : 'end'; S.q = null; S.rev = null; S.allowed = []; return dqPhase('rest', dqWarRound);
  }
  S.round++;
  dqAskSoon('claimq', dqLive(S), dqClaimRev, true, false);
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
  if (S.phase === 'startpick') { S.own[terr] = S.chooser; S.base[S.chooser] = terr; S.picks.shift(); S.allowed = []; return dqStartPick(); }
  if (S.phase === 'pick') { S.own[terr] = S.chooser; S.picks.shift(); S.allowed = []; return dqPickNext(); }
  const d = S.own[terr];
  S.duel = { a: S.chooser, d, t: terr, base: d >= 0 && S.base[d] === terr, lvl: S.cfg.lv ? dqLvlFor(terr) : 0 }; S.allowed = []; S.q = null; S.rev = null;
  const H = DQ.H, D = S.duel;
  const go = () => dqPhase('duelintro', () => dqAskSoon('duelq', d >= 0 ? [D.a, d] : [D.a], dqDuelRev, false, false, { mods: D.m ? [D.m] : S.cfg.mods, lvl: D.lvl }));
  /* útočník si môže zvoliť okruh otázky (ak to hostiteľ zapol a je z čoho vyberať) */
  if (!S.cfg.pm || S.cfg.mods.length < 2) return go();
  H.modGo = go;
  dqPhase('modpick', dqModAuto);
  const p = S.players[D.a], k = S.k;
  if (p.bot || !p.on) H.bots.push(setTimeout(() => { if (DQ.S && DQ.S.k === k) dqModAuto(); }, 1300));
}
function dqModAuto() {
  const S = DQ.S, H = DQ.H;
  if (!S || S.phase !== 'modpick') return;
  clearTimeout(H.timer);
  S.duel.m = S.cfg.mods[Math.floor(Math.random() * S.cfg.mods.length)];
  H.modGo();
}
/* kolo súbojov: každý hráč je raz na rade, začína ten s najmenším počtom bodov */
function dqWarRound() {
  const S = DQ.S;
  S.q = null; S.rev = null; S.picks = []; S.duel = null;
  if (S.wr >= S.cfg.war || dqLive(S).length < 2) { if (!S.wr && dqLive(S).length > 1) return dqEnd(); S.cnt = 'end'; S.allowed = []; return dqPhase('rest', dqEnd); }
  S.wr++;
  S.wq = dqLive(S).sort((a, b) => dqScore(S, a) - dqScore(S, b));
  dqWarPick();
}
function dqWarPick() {
  const S = DQ.S, H = DQ.H;
  S.wq = S.wq.filter(i => !S.players[i].out);
  if (!S.wq.length || dqLive(S).length < 2) return dqWarRound();
  /* útočiť sa dá len na susedný priestor súpera; susedný voľný priestor sa dá obsadiť */
  const a = S.wq[0];
  let al = S.own.map((o, i) => o !== a && DQ_MAP.t[i].j.some(x => S.own[x] === a) ? i : -1).filter(i => i >= 0);
  if (!al.length) al = dqFree();
  if (!al.length) { S.wq.shift(); return dqWarPick(); }
  S.chooser = a; S.allowed = al; S.duel = null; S.q = null; S.rev = null; H.nudged = false;
  dqPhase('warpick', dqAuto);
  dqNudge();
}
/* čo znamená výhra útočníka: obyčajný priestor = získa ho; základňa = uberie život, pri poslednom berie všetko */
function dqWinKind() { const S = DQ.S, D = S.duel; return !D.base ? 'took' : (S.lives[D.d] - 1 <= 0 ? 'out' : 'hit'); }
/* Súboj ako v Dobyvateľovi: rýchlosť nerozhoduje. Útočník správne a obranca zle → útočník vyhral.
   Obranca správne a útočník zle → ubránené. Obaja zle → nič sa nemení. Obaja správne → rozstrel tipovacou otázkou. */
function dqDuelRev() {
  const S = DQ.S, H = DQ.H, res = dqRes(), D = S.duel, ra = res[D.a], rd = D.d >= 0 ? res[D.d] : null;
  const tie = !!(rd && ra.ok && rd.ok), win = ra.ok && !tie;
  if (rd && rd.ok && !ra.ok) S.players[D.d].bonus += 100;
  S.rev = { ans: H.ans, res, win, what: tie ? 'tie' : win ? dqWinKind() : (rd && rd.ok ? 'held' : 'miss') };
  dqPhase('duelrev', tie ? () => dqAskSoon('tieq', [D.a, D.d], dqTieRev, false, true, { mods: D.m ? [D.m] : S.cfg.mods }) : () => dqDuelDone(win));
}
function dqTieRev() {
  const S = DQ.S, H = DQ.H, R = dqNumRes(), D = S.duel;
  const win = R.order[0] === D.a && R.res[D.a].v !== null, held = !win && R.res[D.d].v !== null;
  if (held) S.players[D.d].bonus += 100;
  S.rev = { num: true, ans: H.ans, unit: S.q.unit, res: R.res, order: R.order, win, what: win ? dqWinKind() : held ? 'held' : 'miss' };
  dqPhase('tierev', () => dqDuelDone(win));
}
/* zmena na mape sa urobí až po zavretí okna s vyhodnotením, aby ju bolo vidno */
function dqDuelDone(win) {
  const S = DQ.S, D = S.duel;
  if (win) {
    if (!D.base) S.own[D.t] = D.a;
    else if (--S.lives[D.d] <= 0) { S.own = S.own.map(o => o === D.d ? D.a : o); S.players[D.d].out = true; S.base[D.d] = -1; S.outs.push(D.d); }
  }
  S.wq.shift();
  dqWarPick();
}
function dqEnd() {
  const S = DQ.S, H = DQ.H;
  clearTimeout(H.timer);
  /* vyradení sú za tými, čo dohrali; medzi nimi je vyššie ten, kto vypadol neskôr */
  S.rank = S.players.map((p, i) => i).sort((a, b) => (S.players[a].out ? 1 : 0) - (S.players[b].out ? 1 : 0) || (S.players[a].out ? S.outs.indexOf(b) - S.outs.indexOf(a) : dqScore(S, b) - dqScore(S, a)));
  const pts = [30, 15, 8, 4, 2, 1]; if (S.players.length === 2) pts[1] = 10;
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
      <div><b>1</b><strong>ŠTART A OBSADZOVANIE</strong><span>Hra sa začína tipovacou otázkou (píše sa číslo) — kto je najbližšie, vyberá si domovské letisko prvý. Domovské letisko má tri životy. Potom v každom kole dostanú všetci tú istú otázku: kto odpovie správne, vyberie si voľný priestor susediaci s tým, čo už má. Najrýchlejší vyberá prvý a berie si dva.</span></div>
      <div><b>2</b><strong>SÚBOJE</strong><span>V každom kole je každý hráč raz na rade: zaútočí na susedný priestor súpera (označený mečmi), alebo obsadí susedný voľný priestor. Pri útoku odpovedáte obaja a rýchlosť nerozhoduje: útočník správne a obranca zle = dobyté; obranca správne = ubránené; obaja zle = nič sa nemení; obaja správne = rozstrel tipovacou otázkou, vyhráva presnejší. Čím cennejší priestor, tým ťažšia otázka (dá sa vypnúť v nastavení hry).</span></div>
      <div><b>3</b><strong>BODY A DOMOVSKÉ LETISKO</strong><span>Letisko 500, CTR 400, TMA 300, TRA/TSA 200, LZR 150, časť triedy G 100, ubránenie +100. Každý vyhraný útok na domovské letisko mu uberie život; pri treťom hráč vypadáva a všetko, čo mal, berie útočník. Vyhráva ten, kto má na konci najviac bodov.</span></div>
    </div>`;
}
function dqCfgHTML(S) {
  const c = S.cfg, host = DQ.host;
  const row = (lab, key, arr, fmt) => `<div class="dq-cfg-row"><span>${lab}</span><div>${arr.map(v => `<button class="rk-chip${c[key] === v ? ' on' : ''}" data-cfg="${key}" data-val="${v}" ${host ? '' : 'disabled'}>${fmt(v)}</button>`).join('')}</div></div>`;
  return `<div class="dq-cfg">
      <div class="dq-cfg-t">NASTAVENIE HRY${host ? '' : ' <em>— mení ho len hostiteľ</em>'}</div>
      ${row('HRÁČI', 'max', DQ_OPT.max, v => v)}
      ${row('MAPA', 'map', DQ_OPT.map, v => ({ auto: 'PODĽA POČTU HRÁČOV', s: 'MALÁ · ' + DQ_MAPS.s.t.length, m: 'STREDNÁ · ' + DQ_MAPS.m.t.length, l: 'VEĽKÁ · ' + DQ_MAPS.l.t.length })[v])}
      ${row('ČAS NA OTÁZKU', 'time', DQ_OPT.time, v => v + ' s')}
      ${row('KOLÁ OBSADZOVANIA', 'claim', DQ_OPT.claim, v => v)}
      ${row('KOLÁ SÚBOJOV', 'war', DQ_OPT.war, v => v || 'BEZ')}
      ${row('TEMPO', 'fast', DQ_OPT.fast, v => v ? 'RÝCHLA HRA · ASI 5 MIN' : 'BEŽNÉ')}
      ${row('OBŤAŽNOSŤ PODĽA ÚZEMIA', 'lv', DQ_OPT.lv, v => v ? 'ÁNO' : 'NIE')}
      ${row('ÚTOČNÍK VOLÍ OKRUH', 'pm', DQ_OPT.pm, v => v ? 'ÁNO' : 'NIE')}
      <div class="dq-cfg-row"><span>OTÁZKY Z</span><div>${DQ_QS.map(x => `<button class="rk-chip${c.mods.indexOf(x[0]) >= 0 ? ' on' : ''}" data-cfg="mods" data-val="${x[0]}" ${host ? '' : 'disabled'}>${x[1]} · ${x[2]}</button>`).join('')}</div></div>
      ${dqcRowHTML(S)}
      <div class="dq-cfg-hint">${c.fast ? 'Rýchla hra: 3 kolá obsadzovania, 3 kolá súbojov, 10 s na otázku a kratšie prestávky. ' : ''}${c.lv ? 'Obťažnosť: pri útoku na priestor do 150 b. je otázka ľahká a má tri možnosti, pri CTR ťažká, pri letisku z najťažších a na odpoveď je menej času. ' : ''}${c.pm ? 'Útočník si pred otázkou vyberie okruh, z ktorého padne.' : ''}</div>
    </div>`;
}
function dqMapSVG(S, me) {
  const M = DQ_MAP, mine = dqPicking(S) && S.chooser === me, v = DQ.view || dqBaseView(), now = Date.now();
  const fx = (DQ.fx || []).filter(f => now - f.t0 < DQ_FXMS);
  let h = `<svg class="dq-map dq-s-${DQ_STYLE}" id="dq-svg" viewBox="${v.x} ${v.y} ${v.w} ${v.h}" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="dq-clip"><path d="${M.border}"/></clipPath>
    ${M.t.map((o, i) => o.c === 'G' ? `<clipPath id="dq-g${i}"><path d="${o.cp}"/></clipPath>` : '').join('')}
    <pattern id="dq-hB" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#2a0d10"/><line x1="0" y1="0" x2="0" y2="7" stroke="#7a2229" stroke-width="2.2"/></pattern>
    <pattern id="dq-hC" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#0a1a13"/><line x1="0" y1="0" x2="0" y2="7" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.6"/></pattern></defs>
    <g clip-path="url(#dq-clip)">`;
  M.t.forEach((o, i) => {
    const f = fx.find(x => x.t === i), ow = f ? f.was : S.own[i], can = S.allowed.indexOf(i) >= 0, tgt = S.duel && S.duel.t === i, d = o.c === 'G' ? M.g[o.s] : o.d;
    h += `<path d="${d}"${o.c === 'G' ? ` clip-path="url(#dq-g${i})"` : ''} data-t="${i}" class="dq-cell c-${o.c}${ow >= 0 ? ' own' : ''}${can ? ' can' : ''}${can && mine ? ' click' : ''}${tgt ? ' tgt' : ''}${DQ.sel === i && mine ? ' sel' : ''}"${ow >= 0 ? ` style="--pc:${DQ_COL[ow]}"` : ''}/>`;
    (o.sl || []).forEach(l => { h += `<path d="M${l[0]},${l[1]}L${l[2]},${l[3]}" clip-path="url(#dq-g${i})" class="dq-gline"/>`; });
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
    else if (o.c === 'G') { const fs = Math.max(5.5, Math.min(13, o.r * 0.3)); h += `<text class="dq-lab g${ow}" x="${o.x}" y="${o.y}" font-size="${fs.toFixed(1)}"><tspan x="${o.x}" dy="-0.25em">${o.k}</tspan><tspan x="${o.x}" dy="1.15em" class="p">${o.v}</tspan></text>`; }
    else if (o.r >= 6.5) {
      const fs = Math.max(4.6, Math.min(11, o.r * 0.42)), three = o.r >= 11;
      h += `<text class="dq-lab${ow}" x="${o.x}" y="${o.y}" font-size="${fs.toFixed(1)}"><tspan x="${o.x}" dy="${three ? '-0.75em' : '-0.15em'}" class="t">${o.a}</tspan><tspan x="${o.x}" dy="1.05em">${o.b}</tspan>${three ? `<tspan x="${o.x}" dy="1.1em" class="p">${o.v}</tspan>` : ''}</text>`;
    }
  });
  /* domovské letiská: zlatý krúžok a životy */
  (S.base || []).forEach((t, pi) => {
    if (t < 0 || !M.t[t] || S.players[pi].out) return;
    const o = M.t[t], R = o.r + 3.4, L = Math.max(0, S.lives[pi]);
    h += `<circle class="dq-basering" cx="${o.x}" cy="${o.y}" r="${R.toFixed(1)}"/>`;
    for (let n = 0; n < L; n++) { const a = (-90 + (n - (L - 1) / 2) * 36) * Math.PI / 180; h += `<circle class="dq-life" cx="${(o.x + Math.cos(a) * R).toFixed(1)}" cy="${(o.y + Math.sin(a) * R).toFixed(1)}" r="2.7"/>`; }
  });
  /* meče: malé na súperových priestoroch, na ktoré sa dá zaútočiť, veľké na tom, o ktorý sa práve bojuje */
  const sword = (o, cls, col) => {
    /* malý meč nesmie zakryť popisok: pri letisku ide vedľa krúžku, inak nad popisok */
    let dx = 0, dy = 0;
    if (cls === 'sm') { if (o.c === 'AD') { dx = 10; dy = -10; } else if (o.c === 'G') dy = -(Math.max(5.5, Math.min(13, o.r * 0.3)) * 1.2 + 11); else { const fs = Math.max(4.6, Math.min(11, o.r * 0.42)); dy = -(fs * (o.r >= 11 ? 2.3 : 1.5) + 10); } }
    return `<g transform="translate(${(o.x + dx).toFixed(1)},${(o.y + dy).toFixed(1)})"><g class="dq-swords ${cls}" style="--pc:${col}"><circle r="${cls === 'big' ? 19 : 8.5}"/><text y="${cls === 'big' ? 7 : 3.4}">⚔</text></g></g>`;
  };
  if (S.phase === 'warpick') S.allowed.forEach(t => { if (S.own[t] >= 0) h += sword(M.t[t], 'sm', DQ_COL[S.chooser]); });
  if (dqDuelOn(S)) h += sword(M.t[S.duel.t], 'big', DQ_COL[S.duel.a]);
  return h + '</svg>';
}
function dqLegendHTML() {
  return `<div class="dq-legend"><span>BODY ZA PRIESTOR:</span><span>◯ LETISKO <b>500</b></span><span>CTR <b>400</b></span><span>TMA <b>300</b></span><span>TRA / TSA <b>200</b></span><span>LZR <b>150</b></span><span>G WEST / EAST (každá časť) <b>100</b></span><span class="k">žlté číslo na mape = body · farba = hráč, ktorému priestor patrí · ⚔ = dá sa zaútočiť</span></div>`;
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
    return `<div class="dq-chip${active ? ' act' : ''}${p.on ? '' : ' off'}" style="--c:${DQ_COL[i]}"><i></i><span>${dqEsc(p.nick)}${i === me ? ' <em>ty</em>' : ''}${p.on ? '' : ' <em>odpojený</em>'}</span>${S.base && S.base[i] >= 0 && !p.out ? `<u>${'♥'.repeat(Math.max(0, S.lives[i]))}</u>` : ''}<small>${S.own.filter(o => o === i).length}</small><b>${dqScore(S, i)}</b></div>`.replace('class="dq-chip', p.out ? 'class="dq-chip out' : 'class="dq-chip');
  }).join('');
}
/* fotka k otázke z Wikipédie (rovnaký zdroj ako MOD 01); načíta sa už počas odpočtu */
function dqPhoto(wiki) {
  DQ.imgP = DQ.imgP || {}; DQ.imgU = DQ.imgU || {};
  if (DQ.imgP[wiki]) return DQ.imgP[wiki];
  return DQ.imgP[wiki] = fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + wiki, { headers: { Accept: 'application/json' } })
    .then(r => r.ok ? r.json() : Promise.reject()).then(d => {
      const src = (d.thumbnail && d.thumbnail.source) || (d.originalimage && d.originalimage.source);
      if (!src) throw 0;
      return new Promise(res => { const im = new Image(); im.onload = () => { DQ.imgU[wiki] = src; res(src); }; im.onerror = () => res(''); im.src = src; });
    }).catch(() => '');
}
function dqStageName(S) {
  const p = S.phase === 'rest' || S.phase === 'count' ? (S.cnt || '') : S.phase;
  if (p.indexOf('start') === 0) return 'ŠTART · DOMOVSKÉ LETISKÁ';
  if (p === 'end') return 'KONIEC HRY';
  if (p === 'war') return 'SÚBOJE';
  if (p.indexOf('claim') === 0 || p === 'pick') return `OBSADZOVANIE · KOLO ${S.round} / ${S.cfg.claim}`;
  return `SÚBOJE · KOLO ${S.wr} / ${S.cfg.war}`;
}
function dqDuelOn(S) { return !!S.duel && ['modpick', 'duelintro', 'count', 'duelq', 'duelrev', 'tieq', 'tierev'].indexOf(S.phase) >= 0; }
function dqNumFmt(v, unit) { return v === null || v === undefined ? '—' : String(v).replace('.', ',') + (unit ? ' ' + unit : ''); }
/* text výsledku súboja — do pásu hore aj do okna */
function dqRevText(S, nm) {
  const D = S.duel, R = S.rev, tn = dqEsc(DQ_MAP.t[D.t].k), a = nm(D.a), d = D.d >= 0 ? nm(D.d) : '';
  if (R.what === 'tie') return `Obaja odpovedali správne — rozhodne tipovacia otázka.`;
  if (R.what === 'took') return `${a} získava ${tn} (+${DQ_MAP.t[D.t].v} b.)`;
  if (R.what === 'hit') return `${a} zasiahol domovské letisko ${tn} — hráčovi ${d} ostáva ${S.lives[D.d] - 1} ${S.lives[D.d] - 1 === 1 ? 'život' : 'životy'}`;
  if (R.what === 'out') return `${a} dobyl domovské letisko ${tn} — ${d} vypadáva a všetky jeho priestory berie ${a}`;
  if (R.what === 'held') return `${d} ubránil ${tn} (+100 b.)`;
  return D.d >= 0 ? `Obaja odpovedali nesprávne — ${tn} ostáva hráčovi ${d}` : `${tn} sa získať nepodarilo`;
}
/* terč: sivá šípka v strede je správna odpoveď, farebné šípky sú tipy hráčov — čím bližšie k stredu, tým presnejší tip */
function dqDartsSVG(S) {
  const R = S.rev, who = R.order, errs = who.map(pi => R.res[pi].err).filter(e => e >= 0), mx = Math.max.apply(null, errs.concat([0]));
  const dart = (x, y, col, delay, ang, cls) => {
    const fx = Math.cos(ang) * 150, fy = Math.sin(ang) * 150;
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><g class="dq-dart ${cls}" style="--fx:${fx.toFixed(0)}px;--fy:${fy.toFixed(0)}px;animation-delay:${delay.toFixed(2)}s"><g transform="rotate(${(ang * 180 / Math.PI).toFixed(1)})"><line x1="0" y1="0" x2="26" y2="0" stroke="${col}" stroke-width="4" stroke-linecap="round"/><path d="M26,0 L36,-7 L32,0 L36,7 Z" fill="${col}"/><circle r="4.6" fill="${col}" stroke="#fff" stroke-width="1.6"/></g></g></g>`;
  };
  let h = `<svg class="dq-darts" viewBox="-150 -118 300 236"><circle r="104" fill="#0d0d10" stroke="#fff" stroke-opacity="0.25" stroke-width="2"/>`;
  [[100, '#1b1b20'], [76, '#26262d'], [52, '#1b1b20'], [28, '#26262d'], [9, '#ffd34d']].forEach(r => { h += `<circle r="${r[0]}" fill="${r[1]}" stroke="#fff" stroke-opacity="0.35" stroke-width="1"/>`; });
  h += dart(0, 0, '#9aa0a8', 0.3, -Math.PI / 2, 'ans');
  who.forEach((pi, n) => {
    const r = R.res[pi];
    if (r.v === null) return;
    const ang = -Math.PI / 2 + (n + 0.5) * 2 * Math.PI / Math.max(3, who.length) + 0.5, rad = mx > 0 ? 7 + 90 * Math.sqrt(r.err / mx) : 7;
    h += dart(Math.cos(ang) * rad, Math.sin(ang) * rad, DQ_COL[pi], 1.1 + n * 0.55, ang, r.ok ? 'best' : '');
  });
  return h + '</svg>';
}
/* vyskakovacie okno s otázkou — prekryje mapu len počas otázky a jej vyhodnotenia */
function dqPopHTML(S, me, stage, ctx) {
  const q = S.q, R = S.rev, can = q.who.indexOf(me) >= 0, my = DQ.my, nm = i => dqEsc(S.players[i] ? S.players[i].nick : '?');
  const sec = ms => (ms / 1000).toFixed(1).replace('.', ',') + ' s';
  let rib = '';
  if (R) {
    const mine = R.res[me], D = S.duel, k = D ? dqEsc(DQ_MAP.t[D.t].k) : '';
    if ((S.phase === 'duelrev' || S.phase === 'tierev') && D && (me === D.a || me === D.d)) {
      const W = R.what, att = me === D.a;
      rib = W === 'tie' ? ['tie', 'OBAJA SPRÁVNE — ROZSTREL'] : att ? (R.win ? ['win', W === 'out' ? '⚔ DOBYL SI DOMOVSKÉ LETISKO — BERIEŠ VŠETKO' : W === 'hit' ? '⚔ ZÁSAH DO DOMOVSKÉHO LETISKA' : '⚔ DOBYL SI ' + k] : ['lose', 'ÚTOK SA NEPODARIL'])
        : (R.win ? ['lose', W === 'out' ? 'PRIŠIEL SI O DOMOVSKÉ LETISKO — VYPADÁVAŠ' : W === 'hit' ? 'STRÁCAŠ ŽIVOT' : 'PRIŠIEL SI O ' + k] : (W === 'held' ? ['win', '🛡 UBRÁNIL SI ' + k] : ['tie', 'NIKTO NEUHÁDOL — ' + k + ' TI OSTÁVA']));
    } else if (mine && R.num) rib = mine.v === null ? ['lose', '⏱ BEZ ODPOVEDE'] : R.order[0] === me ? ['win', '🎯 NAJBLIŽŠIE — ' + dqNumFmt(mine.v, R.unit)] : ['tie', 'TVOJ TIP ' + dqNumFmt(mine.v, R.unit) + ' · ' + (R.order.indexOf(me) + 1) + '. V PORADÍ'];
    else if (mine) rib = mine.ok ? ['win', '✓ SPRÁVNE'] : ['lose', mine.c < 0 ? '⏱ BEZ ODPOVEDE' : '✗ NESPRÁVNE'];
  }
  let h = `<div class="dq-pop${R ? ' rev' : ''}${q.num ? ' num' : ''}${rib ? ' r-' + rib[0] : ''}">
      ${rib ? `<div class="dq-rib ${rib[0]}">${rib[1]}</div>` : ''}
      <div class="dq-pop-top"><span>${dqEsc(q.mod)}${q.lvl ? ` <i class="dq-lvl l${q.lvl}">${DQ_LVN[q.lvl]}</i>` : ''}</span><span class="dq-pop-stage">${stage}</span><span class="dq-pop-time" id="dq-sec">${R ? '' : Math.ceil(S.tot / 1000)}</span></div>
      <div class="dq-timer"><i class="dq-bar-i"></i></div>
      ${ctx ? `<div class="dq-pop-ctx">${ctx}</div>` : ''}
      ${q.img ? `<div class="dq-pop-img" data-img="${dqEsc(q.img)}">${DQ.imgU && DQ.imgU[q.img] ? `<img src="${dqEsc(DQ.imgU[q.img])}" alt="">` : '<span>načítavam fotku…</span>'}</div>` : `<div class="dq-pop-q${q.prompt.length > 60 ? ' xl' : q.prompt.length > 26 ? ' long' : ''}">${dqEsc(q.prompt)}</div>`}
      <div class="dq-pop-s">${dqEsc(q.sub)}</div>`;
  if (q.num && R) {
    /* vyhodnotenie tipovacej otázky: terč a tabuľka */
    h += `<div class="dq-numrev">${dqDartsSVG(S)}<div class="dq-numtab"><div class="dq-numans">Správna odpoveď <b>${dqNumFmt(R.ans, R.unit)}</b></div>
        ${R.order.map((pi, n) => { const r = R.res[pi]; return `<div class="dq-numrow${n === 0 && r.v !== null ? ' best' : ''}"><b>${r.v === null ? '–' : n + 1 + '.'}</b><i style="background:${DQ_COL[pi]}"></i><span>${nm(pi)}</span><strong>${dqNumFmt(r.v, R.unit)}</strong><small>${r.v === null ? 'bez odpovede' : (r.err === 0 ? 'presne' : 'vedľa o ' + dqNumFmt(+r.err.toFixed(3))) + ' · ' + sec(r.ms)}</small></div>`; }).join('')}
        <div class="dq-numnote">Vyhráva najbližší tip. Pri rovnakom tipe rozhoduje čas.</div></div></div>`;
  } else if (q.num) {
    h += can ? (my ? `<div class="dq-numbox done">Tvoj tip: <b>${dqNumFmt(my.v, q.unit)}</b></div>`
      : `<div class="dq-numbox"><input type="text" id="dq-numin" inputmode="decimal" autocomplete="off" placeholder="napíš číslo" maxlength="12">${q.unit ? `<span>${dqEsc(q.unit)}</span>` : ''}<button class="dq-btn pri" id="dq-numok">POTVRDIŤ ▶</button></div>`)
      : '';
  } else {
    h += '<div class="dq-opts">';
    q.opts.forEach((o, i) => {
      const cls = R ? (i === R.ans ? ' ok' : (R.res[me] && R.res[me].c === i ? ' no' : '')) : (my && my.c === i ? ' sel' : '');
      const who = R ? q.who.filter(pi => R.res[pi].c === i).map(pi => `<i style="background:${DQ_COL[pi]}"></i>`).join('') : '';
      h += `<button class="choice-btn${cls}" data-c="${i}" ${R || my || !can ? 'disabled' : ''}><kbd>${i + 1}</kbd><span>${dqEsc(o)}</span>${who ? `<span class="dq-who">${who}</span>` : ''}</button>`;
    });
    h += '</div>';
  }
  h += '<div class="dq-pop-foot">';
  if (R && !q.num) h += q.who.map(pi => { const r = R.res[pi]; return `<span class="${r.ok ? 'ok' : 'no'}"><i style="background:${DQ_COL[pi]}"></i>${nm(pi)} ${r.c < 0 ? '— bez odpovede' : r.ok ? '✓ ' + sec(r.ms) : '✗'}</span>`; }).join('');
  else if (!R) h += q.who.map(pi => `<span class="${S.answered.indexOf(pi) >= 0 ? 'in' : ''}"><i style="background:${DQ_COL[pi]}"></i>${nm(pi)} ${S.answered.indexOf(pi) >= 0 ? '✓' : '…'}</span>`).join('')
    + `<em>${!can ? 'Pozeráš sa — odpovedá ' + q.who.map(nm).join(' a ') + '.' : my ? 'Odpoveď je zapísaná.' : q.num ? 'Napíš číslo a potvrď Enterom. Vyhráva najbližší tip.' : 'Klikni alebo stlač 1–4.'}</em>`;
  if (R) h += `<button class="dq-rep" id="dq-rep" ${DQ.repK === S.gid + S.k ? 'disabled' : ''}>${DQ.repK === S.gid + S.k ? '✓ NAHLÁSENÉ' : '⚑ NAHLÁSIŤ OTÁZKU'}</button>`;
  return h + '</div></div>';
}
function dqStageEl() {
  let el = document.getElementById('dq-stage');
  if (!el) { el = document.createElement('div'); el.id = 'dq-stage'; el.style.display = 'none'; document.body.appendChild(el); }
  return el;
}
function dqHideStage() { const el = document.getElementById('dq-stage'); if (el) el.style.display = 'none'; document.body.classList.remove('dq-live'); clearInterval(DQ.bar); }
/* dotykové zariadenie alebo úzke okno: priestor sa najprv označí (ťuknutím alebo zo zoznamu) a až potom potvrdí */
function dqCoarse() { try { return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 820; } catch (e) { return false; } }
function dqFocus(t) { const o = DQ_MAP.t[t], B = dqBaseView(), w = B.w / 2.6, h = w * B.h / B.w; DQ.view = { w, h, x: Math.max(B.x, Math.min(B.x + B.w - w, o.x - w / 2)), y: Math.max(B.y, Math.min(B.y + B.h - h, o.y - h / 2)) }; dqViewApply(); }
function dqPickerHTML(S) {
  const al = S.allowed.slice().sort((a, b) => DQ_MAP.t[b].v - DQ_MAP.t[a].v || DQ_MAP.t[a].k.localeCompare(DQ_MAP.t[b].k)), sel = al.indexOf(DQ.sel) >= 0 ? DQ.sel : -1;
  return `<div class="dq-pk-row">${al.map(t => { const o = DQ_MAP.t[t], en = S.own[t] >= 0; return `<button class="dq-pk${t === sel ? ' on' : ''}" data-pk="${t}"${en ? ` style="--pc:${DQ_COL[S.own[t]]}"` : ''}>${en ? '⚔ ' : ''}${dqEsc(o.k)} <b>${o.v}</b></button>`; }).join('')}</div>
    <button class="dq-pk-ok" id="dq-pkok" ${sel < 0 ? 'disabled' : ''}>${sel < 0 ? 'Ťukni na priestor na mape alebo v zozname' : 'POTVRDIŤ: ' + dqEsc(DQ_MAP.t[sel].k) + ' ▶'}</button>`;
}
function dqAnswer(c, v) {
  const Z = DQ.S;
  if (DQ.my || !Z || !dqAsking(Z) || Z.q.who.indexOf(dqMe()) < 0) return;
  if (Z.q.num) { if (typeof v !== 'number' || !isFinite(v)) return; DQ.my = { v }; dqSend({ t: 'ans', k: Z.k, v, ms: Date.now() - DQ.qT0 }); return dqShow(); }
  if (typeof c !== 'number' || c < 0) return;
  DQ.my = { c };
  dqSend({ t: 'ans', k: Z.k, c, ms: Date.now() - DQ.qT0 });
  dqShow();
}
/* udalosti sa viažu raz na pevné obaly — prekreslenie vnútra tak nemôže „zjesť“ kliknutie */
function dqBindStage(st) {
  const $ = id => document.getElementById(id), ph = $('dq-poph'), mh = $('dq-maph'), info = $('dq-info');
  const quit = () => { if ((DQ.S && DQ.S.phase === 'end') || confirm('Naozaj odísť z rozohranej hry?')) dqLeave(''); };
  $('dq-zi').onclick = () => dqZoom(0.7);
  $('dq-zo').onclick = () => dqZoom(1 / 0.7);
  $('dq-zr').onclick = () => { DQ.view = null; dqViewApply(); };
  $('dq-leave').onclick = quit;
  $('dq-unpeek').onclick = () => { DQ.peek = null; dqShow(); };
  const press = e => { const b = e.target.closest && e.target.closest('.dq-opts .choice-btn'); if (b && !b.disabled) { e.preventDefault(); dqAnswer(+b.dataset.c); } };
  const numGo = () => { const i = $('dq-numin'); if (!i) return; const v = parseFloat(i.value.replace(/\s/g, '').replace(',', '.')); if (isFinite(v)) dqAnswer(-1, v); else { i.value = ''; i.focus(); } };
  ph.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'dq-numin') { e.preventDefault(); numGo(); } });
  /* myš sa môže pustiť aj mimo mapy (napr. nad oknom s otázkou) — posun mapy sa vtedy musí skončiť */
  window.addEventListener('pointerup', () => { clearTimeout(hold); drag = null; });
  ph.addEventListener('pointerdown', press);
  ph.addEventListener('click', e => {
    press(e);
    const id = e.target.closest && (e.target.closest('button') || {}).id;
    if (id === 'dq-numok') numGo();
    else if (id === 'dq-leave2') quit();
    else if (id === 'dq-again') dqSend({ t: 'again' });
    else if (id === 'dq-peek') { DQ.peek = DQ.S.gid; dqShow(); }
    else if (id === 'dq-rep') { const Z = DQ.S; if (Z && Z.q && Z.rev) { dqReportQ({ key: Z.q.key, mod: Z.q.mod, q: dqRepText({ img: Z.q.img, q: Z.q.prompt }), a: Z.q.num ? Z.rev.ans : Z.q.opts[Z.rev.ans] }); DQ.repK = Z.gid + Z.k; dqShow(); } }
    else if (id === 'dq-errs') { DQ.endV = 'errs'; DQ.ui++; dqShow(); }
    else if (id === 'dq-errback') { DQ.endV = ''; DQ.drill = null; DQ.ui++; dqShow(); }
    else if (id === 'dq-drill') dqDrillStart();
    else if (id === 'dq-drnext') dqDrillNext();
    else {
      const b = e.target.closest && e.target.closest('[data-mod],[data-rep],[data-dr]'), Z = DQ.S;
      if (!b || b.disabled || !Z) return;
      if (b.dataset.mod) dqSend({ t: 'mod', k: Z.k, m: b.dataset.mod });
      else if (b.dataset.dr != null) dqDrillPick(+b.dataset.dr);
      else if (b.dataset.rep != null) { const x = dqWrong(Z)[+b.dataset.rep]; if (x) { dqReportQ({ key: x.key, mod: x.mod, q: dqRepText(x), a: x.num ? x.ans : x.opts[x.ans] }); DQ.ui++; dqShow(); } }
    }
  });
  $('dq-picker').addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button'), Z = DQ.S;
    if (!b || !Z) return;
    if (b.dataset.pk != null) { DQ.sel = +b.dataset.pk; dqFocus(DQ.sel); dqShow(); }
    else if (b.id === 'dq-pkok' && DQ.sel >= 0 && Z.allowed.indexOf(DQ.sel) >= 0) { const o = DQ_MAP.t[DQ.sel]; DQ.click = { t: DQ.sel, x: o.x, y: o.y, at: Date.now() }; const t = DQ.sel; DQ.sel = -1; DQ.view = null; dqSend({ t: 'pick', k: Z.k, terr: t }); }
  });
  const svg = () => $('dq-svg');
  const pt = e => { const s = svg(), m = s && s.getScreenCTM(); return m ? { x: (e.clientX - m.e) / m.a, y: (e.clientY - m.f) / m.d } : null; };
  const cellAt = e => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.classList && el.classList.contains('dq-cell') ? +el.dataset.t : -1; };
  const zoomAt = e => { const p = pt(e); DQ.dragged = true; if (DQ.view && DQ.view.w < dqBaseView().w / 3.2) { DQ.view = null; dqViewApply(); } else dqZoom(0.45, p && p.x, p && p.y); };
  let drag = null, hold = 0, tap = null;
  mh.addEventListener('pointerover', e => { const t = e.target.classList && e.target.classList.contains('dq-cell') ? +e.target.dataset.t : -1; if (t >= 0 && DQ.S) info.innerHTML = dqTerrInfo(t, DQ.S); });
  /* trackpad posiela desiatky drobných udalostí za sekundu — priblíženie preto ide podľa veľkosti pohybu, nie po skokoch */
  mh.addEventListener('wheel', e => { e.preventDefault(); const p = pt(e), d = Math.max(-60, Math.min(60, e.deltaY)); dqZoom(Math.exp(d * (e.ctrlKey ? 0.012 : 0.0035)), p && p.x, p && p.y); }, { passive: false });
  mh.addEventListener('pointerdown', e => {
    DQ.dragged = false; clearTimeout(hold);
    hold = setTimeout(() => { if (!DQ.dragged) { drag = null; zoomAt(e); } }, 520);
    if (DQ.view) drag = { x: e.clientX, y: e.clientY, v: Object.assign({}, DQ.view) };
  });
  mh.addEventListener('pointermove', e => {
    if (!drag) return;
    if (e.pointerType === 'mouse' && !(e.buttons & 1)) { drag = null; return; }      // tlačidlo už nie je stlačené → mapa sa nesmie hýbať
    const s = svg(), dx = e.clientX - drag.x, dy = e.clientY - drag.y, B = dqBaseView();
    if (Math.abs(dx) + Math.abs(dy) > 6) { DQ.dragged = true; clearTimeout(hold); }
    if (!DQ.dragged || !s) return;
    const k = Math.max(drag.v.w / s.clientWidth, drag.v.h / s.clientHeight);
    DQ.view = { w: drag.v.w, h: drag.v.h, x: Math.max(B.x, Math.min(B.x + B.w - drag.v.w, drag.v.x - dx * k)), y: Math.max(B.y, Math.min(B.y + B.h - drag.v.h, drag.v.y - dy * k)) };
    dqViewApply();
  });
  const end = () => { clearTimeout(hold); drag = null; };
  mh.addEventListener('pointerleave', end); mh.addEventListener('pointercancel', end);
  mh.addEventListener('pointerup', e => {
    const moved = DQ.dragged, now = Date.now(); end(); DQ.dragged = false;
    if (moved) return;
    if (tap && now - tap.t < 320 && Math.abs(tap.x - e.clientX) + Math.abs(tap.y - e.clientY) < 30) { tap = null; DQ.dragged = false; const p = pt(e); if (DQ.view && DQ.view.w < dqBaseView().w / 3.2) { DQ.view = null; dqViewApply(); } else dqZoom(0.45, p && p.x, p && p.y); return; }
    tap = { t: now, x: e.clientX, y: e.clientY };
    let t = cellAt(e); const Z = DQ.S;
    if (!Z) return;
    const myPick = Z.chooser === dqMe() && dqPicking(Z), coarse = dqCoarse();
    /* drobné priestory sa prstom ťažko trafia: berie sa najbližší povolený do 46 px (myšou do 12 px) */
    if (myPick && Z.allowed.indexOf(t) < 0) {
      const s = svg(), m = s && s.getScreenCTM(); let bd = coarse ? 46 : 12, bt = -1;
      if (m) Z.allowed.forEach(a => { const o = DQ_MAP.t[a], d = Math.hypot(o.x * m.a + m.e - e.clientX, o.y * m.d + m.f - e.clientY); if (d < bd) { bd = d; bt = a; } });
      if (bt >= 0) t = bt;
    }
    if (t < 0) return;
    info.innerHTML = dqTerrInfo(t, Z);
    if (myPick && Z.allowed.indexOf(t) >= 0) {
      const p = pt(e); if (p) DQ.click = { t, x: p.x, y: p.y, at: now };
      if (coarse) { DQ.sel = t; dqShow(); } else dqSend({ t: 'pick', k: Z.k, terr: t });
    }
  });
}
function dqRender(card) {
  const S = DQ.S, M = DQ_MAP;
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = DQ.room ? 'miestnosť ' + DQ.room : 'hra';
  card.classList.remove('dq-on');
  clearInterval(DQ.bar);
  const live = !!(DQ.room && S && S.phase !== 'lobby');
  if (!live) dqHideStage();
  if (!DQ.room) {
    const L0 = lsGet(DQ_LASTK, null), back = L0 && L0.room && Date.now() - L0.t < 20 * 60000 ? L0 : null;
    card.innerHTML = `<div class="dq-home">
        <h2>DOBYVATEĽ</h2>
        <p class="dq-lead">Vedomostný súboj o slovenský vzdušný priestor pre 2 až 6 hráčov naživo. Hrá sa na mape cez celú obrazovku rozdelenej na skutočné priestory — letiská, CTR, TMA, TRA/TSA, LZR a triedu G. Mapa sa prispôsobí počtu hráčov: malá má ${DQ_MAPS.s.t.length} priestorov, stredná ${DQ_MAPS.m.t.length} a veľká ${DQ_MAPS.l.t.length}. Otázky sú z modulov trenažéra a zo siedmich okruhov teórie (ATM, navigácia, meteorológia, zariadenia, ľudské faktory, lietadlá, pracovné prostredie); hostiteľ si vyberie, z ktorých.</p>
        ${dqRulesHTML()}
        ${DQ.err ? `<div class="rk-err">${dqEsc(DQ.err)}</div>` : ''}
        ${back ? `<div class="dq-back"><div><strong>ROZOHRANÁ HRA · ${dqEsc(back.room)}</strong><span>Vypadol si z hry. Ak ešte beží, môžeš sa do nej vrátiť — tvoje priestory na teba čakajú.</span></div><button class="btn" id="dq-rejoin">VRÁTIŤ SA DO HRY ▶</button><button class="btn ghost" id="dq-forget">ZAHODIŤ</button></div>` : ''}
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
    const rj = document.getElementById('dq-rejoin'), fg = document.getElementById('dq-forget');
    if (rj) rj.onclick = dqRejoin;
    if (fg) fg.onclick = () => { lsSet(DQ_LASTK, null); dqShow(); };
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
    card.querySelectorAll('[data-cfg]').forEach(b => { b.onclick = () => dqSend({ t: 'cfg', key: b.dataset.cfg, val: b.dataset.cfg === 'mods' || b.dataset.cfg === 'map' ? b.dataset.val : +b.dataset.val }); });
    const cf = document.getElementById('dqc-file'), cs = document.getElementById('dqc-sample');
    if (cf) cf.onchange = () => { if (cf.files.length) dqcLoadFiles([...cf.files]); };
    if (cs) cs.onclick = dqcSample;
    card.querySelectorAll('[data-dqc-del]').forEach(b => { b.onclick = () => { DQ_CUSTOM.splice(+b.dataset.dqcDel, 1); lsSet(DQC_KEY, DQ_CUSTOM); DQC.msg = ''; dqcSync(false); }; });
    document.getElementById('dq-leave').onclick = () => dqLeave('');
    return;
  }
  /* ---- hra beží: mapa cez celú obrazovku, otázka ako okno nad ňou ---- */
  card.innerHTML = '<div class="dq-home"><h2>DOBYVATEĽ</h2><p class="dq-lead">Hra beží na celej obrazovke.</p></div>';
  const st = dqStageEl(), $ = id => document.getElementById(id);
  st.style.display = ''; document.body.classList.add('dq-live');
  /* kostra sa stavia raz za hru — pri každej zmene sa prekresľuje len to, čo sa zmenilo, aby nič neblikalo */
  if (st.dataset.gid !== S.gid || !$('dq-maph')) {
    st.dataset.gid = S.gid;
    st.innerHTML = `
      <div class="dq-top">
        <div class="dq-brand"><b>DOBYVATEĽ</b><span>miestnosť ${DQ.room} · v${APP_VERSION}</span></div>
        <div class="dq-players" id="dq-chips"></div>
        <div class="dq-tools"><button id="dq-zi" title="Priblížiť">+</button><button id="dq-zo" title="Oddialiť">−</button><button id="dq-zr" title="Celá mapa">⤢</button><button id="dq-leave" class="x">ODÍSŤ</button></div>
      </div>
      <div class="dq-status" id="dq-status"><b id="dq-st-a"></b><span id="dq-st-b"></span><button class="dq-btn" id="dq-unpeek" style="display:none">VÝSLEDKY</button><div class="dq-timer"><i class="dq-bar-i" id="dq-sbar"></i></div></div>
      <div class="dq-mapwrap"><div id="dq-maph"></div><div id="dq-toast"></div><div id="dq-poph"></div></div>
      <div id="dq-picker"></div>
      <div class="dq-bottom"><div class="dq-info" id="dq-info"><small>Ukáž na priestor a uvidíš jeho kód, hranice a body. Mapu priblížiš dvojitým ťuknutím alebo podržaním na mieste (aj kolieskom či + −), ťahaním ju posunieš.</small></div>${dqLegendHTML()}</div>`;
    dqBindStage(st);
    DQ.mapSig = ''; DQ.popSig = ''; DQ.pkSig = ''; DQ.sel = -1; DQ.popK = -1; DQ.toastK = -1; DQ.prev = null; DQ.prevOut = null; DQ.fx = []; DQ.view = null; DQ.peek = null; DQ.endV = ''; DQ.drill = null; DQ.ui = 0;
  }
  const now = Date.now(), chooser = S.chooser, mineTurn = chooser === me;
  const toast = (txt, col, cls) => { $('dq-toast').innerHTML = `<div class="dq-toast-in ${cls || ''}" style="--pc:${col}">${txt}</div>`; };
  /* čo sa zmenilo na mape od posledného stavu → vyfarbenie a oznam */
  const bulk = DQ.prev ? S.own.filter((o, t) => o !== DQ.prev[t] && o >= 0).length > 2 : false;
  if (DQ.prev) S.own.forEach((o, t) => {
    if (o === DQ.prev[t] || o < 0) return;
    const ck = DQ.click && DQ.click.t === t && now - DQ.click.at < 4000 ? DQ.click : M.t[t], was = DQ.prev[t], k = dqEsc(M.t[t].k);
    DQ.fx.push({ t, col: DQ_COL[o], was, x: +ck.x.toFixed(1), y: +ck.y.toFixed(1), t0: now });
    if (bulk) return;
    if (was >= 0) toast(`<small>${was === me ? 'PRIŠIEL SI O PRIESTOR' : o === me ? 'DOBYL SI PRIESTOR' : 'DOBYTÉ'}</small><b>⚔ ${nm(o)} → ${k}</b><em>+${M.t[t].v}</em>`, DQ_COL[o], was === me ? 'lose' : o === me ? 'win' : '');
    else toast(`<small>${M.t[t].c === 'AD' && S.phase.indexOf('start') === 0 ? 'DOMOVSKÉ LETISKO' : 'OBSADENÉ'}</small><b>${nm(o)} → ${k}</b><em>+${M.t[t].v}</em>`, DQ_COL[o], o === me ? 'win' : '');
  });
  if (bulk && S.phase === 'rest' && S.dist) toast(`<small>ROZDELENIE ZVYŠNÝCH PRIESTOROV</small><b>${S.dist} priestorov v pomere bodov</b>`, '#ffd34d', '');
  const outNow = S.players.map(p => !!p.out);
  if (DQ.prevOut) outNow.forEach((o, i) => { if (o && !DQ.prevOut[i]) toast(`<small>DOMOVSKÉ LETISKO PADLO</small><b>${nm(i)} vypadáva</b>`, DQ_COL[i], i === me ? 'lose' : ''); });
  DQ.prevOut = outNow;
  DQ.fx = DQ.fx.filter(f => now - f.t0 < DQ_FXMS);
  clearTimeout(DQ.fxT); if (DQ.fx.length) DQ.fxT = setTimeout(dqShow, DQ_FXMS + 100);
  DQ.prev = S.own.slice();
  let pop = '', banner = '', myTurn = false;
  const stage = dqStageName(S);
  if (S.phase === 'rest') {
    const dist = S.dist ? ` Zvyšné priestory (${S.dist}) boli rozdelené v pomere bodov — podiely hráčov sa nezmenili.${S.left ? ' ' + S.left + ' ostalo voľných, lebo sa nedali rozdeliť spravodlivo.' : ''}` : (S.left && S.round >= S.cfg.claim ? ` Voľných ostalo ${S.left} priestorov — spravodlivo sa rozdeliť nedali.` : '');
    banner = S.cnt === 'end' ? 'Hra sa skončila — vyhodnocujem…' + dist : S.cnt === 'war' ? 'Obsadzovanie sa skončilo — začínajú súboje.' + dist : 'Ďalšia otázka o chvíľu…';
  } else if (S.phase === 'count') {
    banner = S.cnt === 'tieq' ? 'Obaja odpovedali správne — rozstrel: kto tipne číslo presnejšie?' : S.cnt === 'startq' ? 'Tipovacia otázka o poradie výberu domovského letiska.' : S.cnt === 'duelq' && S.duel ? (S.duel.d >= 0 ? `⚔ ${nm(S.duel.a)} útočí na ${dqEsc(M.t[S.duel.t].k)} hráča ${nm(S.duel.d)}` : `${nm(S.duel.a)} obsadzuje voľný priestor ${dqEsc(M.t[S.duel.t].k)}`) : 'Priprav sa na otázku.';
    pop = `<div class="dq-pop count"><div class="dq-pop-top"><span>${stage}</span><span></span><span></span></div><div class="dq-count" id="dq-count"></div><div class="dq-pop-s">${banner}</div></div>`;
    if (S.pre) dqPhoto(S.pre);
  } else if (S.phase === 'startq' || S.phase === 'startrev') {
    banner = S.phase === 'startq' ? 'Tipovacia otázka: kto je najbližšie k správnemu číslu, vyberá si domovské letisko ako prvý.' : 'Poradie výberu letiska: ' + S.picks.map(nm).join(', ') + '.';
    pop = dqPopHTML(S, me, stage, banner);
  } else if (S.phase === 'startpick') {
    myTurn = mineTurn;
    banner = mineTurn ? '✈ Vyber si domovské letisko — klikni na jeden zo sivých kruhov. Odtiaľ budeš dobýjať.' : 'Domovské letisko si vyberá ' + nm(chooser) + '…';
  } else if (S.phase === 'claimq' || S.phase === 'claimrev') {
    const uniq = S.picks.filter((p, i) => S.picks.indexOf(p) === i);
    banner = S.phase === 'claimq' ? 'Kto odpovie správne, vyberie si priestor. Najrýchlejší vyberá prvý a berie dva.' : (uniq.length ? 'Vyberajú: ' + uniq.map((p, i) => nm(p) + (i === 0 && S.picks.filter(x => x === p).length > 1 ? ' (2×)' : '')).join(', ') + '.' : 'Nikto neodpovedal správne.');
    pop = dqPopHTML(S, me, stage, S.phase === 'claimrev' ? banner : '');
  } else if (S.phase === 'pick') {
    myTurn = mineTurn;
    banner = mineTurn ? (dqCoarse() ? '👆 Si na rade — ťukni na sivý priestor alebo ho vyber zo zoznamu dole a potvrď.' : '👆 Si na rade — klikni na jeden zo sivých priestorov.') : 'Vyberá ' + nm(chooser) + '…';
  } else if (S.phase === 'warpick') {
    myTurn = mineTurn;
    banner = mineTurn ? '⚔ Si na rade — zaútoč na súperov priestor s mečmi, alebo obsaď sivý voľný priestor.' : 'Na rade je ' + nm(chooser) + ' — vyberá, kam zaútočí…';
  } else if (S.phase === 'modpick') {
    const D = S.duel, tn = dqEsc(M.t[D.t].k), mine = D.a === me;
    banner = mine ? 'Vyber okruh, z ktorého padne otázka.' : nm(D.a) + ' vyberá okruh otázky…';
    pop = `<div class="dq-pop modpick"><div class="dq-pop-top"><span>${stage}</span><span class="dq-pop-stage">VÝBER OKRUHU</span><span class="dq-pop-time" id="dq-sec">${Math.ceil(S.tot / 1000)}</span></div>
        <div class="dq-timer"><i class="dq-bar-i"></i></div>
        <div class="dq-pop-ctx">${D.d >= 0 ? `⚔ ${nm(D.a)} útočí na ${tn} hráča ${nm(D.d)}` : `${nm(D.a)} obsadzuje ${tn}`} · ${M.t[D.t].v} b.${D.lvl ? ` · otázka: ${DQ_LVN[D.lvl]}` : ''}</div>
        ${mine ? `<div class="dq-pop-s">Z ktorého okruhu má byť otázka?</div><div class="dq-modgrid">${S.cfg.mods.map(m => `<button class="dq-modbtn" data-mod="${dqEsc(m)}">${dqEsc(dqSetName(m))}</button>`).join('')}</div>` : `<div class="dq-pop-q long">${nm(D.a)} vyberá okruh…</div>`}
      </div>`;
  } else if (S.phase === 'duelintro' || S.phase === 'duelq' || S.phase === 'duelrev' || S.phase === 'tieq' || S.phase === 'tierev') {
    const D = S.duel, tn = dqEsc(M.t[D.t].k);
    banner = D.d >= 0 ? `⚔ ${nm(D.a)} útočí na ${tn} hráča ${nm(D.d)}` : `${nm(D.a)} obsadzuje voľný priestor ${tn}`;
    if (S.phase === 'duelintro' && DQ.toastK !== S.k) { DQ.toastK = S.k; toast(D.d >= 0 ? `<small>ÚTOK${D.lvl ? ' · OTÁZKA ' + DQ_LVN[D.lvl] : ''}</small><b>⚔ ${nm(D.a)} → ${tn}</b><em>bráni ${nm(D.d)}</em>` : `<small>VOĽNÝ PRIESTOR</small><b>${nm(D.a)} → ${tn}</b>`, DQ_COL[D.a], D.d === me ? 'lose' : ''); }
    if (S.phase === 'tieq') banner = `Rozstrel o ${tn}: ${nm(D.a)} proti ${nm(D.d)} — vyhráva presnejší tip.`;
    if (S.rev) banner = dqRevText(S, nm);
    if (S.phase !== 'duelintro') pop = dqPopHTML(S, me, stage, banner);
  } else if (S.phase === 'end') {
    const place = S.rank.indexOf(me), won = place === 0;
    banner = `Vyhráva ${nm(S.rank[0])}.`;
    const conf = won ? `<div class="dq-confetti">${Array.from({ length: 46 }, (x, i) => `<i style="left:${(i * 37 % 100)}%;background:${['#ffd34d', '#3fe39a', '#3a86ff', '#e63946', '#ffffff'][i % 5]};animation-delay:${(i * 0.137 % 3).toFixed(2)}s;animation-duration:${(2.6 + i % 5 * 0.45).toFixed(2)}s"></i>`).join('')}</div>` : '';
    const nW = dqWrong(S).length;
    pop = DQ.peek === S.gid ? '' : DQ.endV === 'errs' ? dqErrsHTML(S) : DQ.endV === 'drill' && DQ.drill ? dqDrillHTML() : `<div class="dq-pop end ${place < 0 ? '' : won ? 'won' : 'lost'}">${conf}
        <div class="dq-pop-top"><span>DOBYVATEĽ</span><span class="dq-pop-stage">KONIEC HRY</span><span></span></div>
        <div class="dq-pop-q">${place < 0 ? '🏆 ' + nm(S.rank[0]) : won ? '🏆 VYHRAL SI!' : place + 1 + '. MIESTO'}</div>
        <div class="dq-pop-s">${won ? 'Slovenský vzdušný priestor je tvoj.' : 'Víťazom partie je ' + nm(S.rank[0]) + '.'}</div>
        <div class="dq-endlist">${S.rank.map((pi, r) => `<div class="${pi === me ? 'me' : ''}" style="animation-delay:${(0.25 + r * 0.18).toFixed(2)}s"><b>${r + 1}.</b><i style="background:${DQ_COL[pi]}"></i><span>${nm(pi)}</span><small>${S.own.filter(o => o === pi).length} priestorov</small><strong>${dqScore(S, pi)}</strong>${S.humans >= 2 && !S.players[pi].bot ? `<em>+${S.league[pi]} do rebríčka</em>` : ''}</div>`).join('')}</div>
        <div class="dq-pop-foot"><em>${S.humans < 2 ? 'Hra proti počítaču sa do rebríčka nepočíta.' : (RK.acct ? 'Body sú pripísané v rebríčku.' : 'Nie si prihlásený, body do rebríčka sa ti nepripísali.')}</em></div>
        <div class="dq-endacts">${DQ.host ? '<button class="dq-btn pri" id="dq-again">ĎALŠIA HRA ▶</button>' : ''}${nW ? `<button class="dq-btn" id="dq-errs">MOJE CHYBY · ${nW}</button>` : ''}<button class="dq-btn" id="dq-peek">POZRIEŤ MAPU</button><button class="dq-btn" id="dq-leave2">ODÍSŤ</button></div>
      </div>`;
  }
  $('dq-chips').innerHTML = dqChipsHTML(S, me);
  $('dq-status').classList.toggle('me', myTurn);
  $('dq-st-a').textContent = stage; $('dq-st-b').innerHTML = banner;
  $('dq-unpeek').style.display = S.phase === 'end' && !pop ? '' : 'none';
  /* zoznam na výber priestoru — len na dotykových zariadeniach, keď som na rade */
  const pkOn = myTurn && dqPicking(S) && dqCoarse(), pkSig = pkOn ? S.k + '|' + DQ.sel : '';
  if (pkSig !== DQ.pkSig) { DQ.pkSig = pkSig; const pk = $('dq-picker'); pk.className = pkOn ? 'on' : ''; pk.innerHTML = pkOn ? dqPickerHTML(S) : ''; }
  /* mapa — len keď sa na nej niečo zmenilo */
  const mapSig = JSON.stringify([S.map, S.own, S.allowed, S.base, S.lives, dqDuelOn(S) ? S.duel : 0, S.phase === 'warpick' ? S.chooser : -1, mineTurn && dqPicking(S), mineTurn && dqPicking(S) ? DQ.sel : -1, DQ.fx.map(f => f.t + ':' + f.t0)]);
  if (mapSig !== DQ.mapSig) {
    DQ.mapSig = mapSig;
    $('dq-maph').innerHTML = dqMapSVG(S, me);
    if (S.duel) $('dq-info').innerHTML = dqTerrInfo(S.duel.t, S);
  }
  /* okno s otázkou — príchod sa animuje len pri novom okne, odchod plynulo zhasne */
  const popSig = pop ? S.k + '|' + JSON.stringify(DQ.my) + '|' + S.answered.join(',') + '|' + (S.rev ? 1 : 0) + '|' + (DQ.repK === S.gid + S.k ? 'r' : '') + '|' + (DQ.ui || 0) : '';
  if (popSig !== DQ.popSig) {
    DQ.popSig = popSig;
    const ph = $('dq-poph');
    clearTimeout(DQ.popT);
    if (pop) {
      ph.className = 'dq-pop-wrap' + (DQ.popK === S.k ? ' still' : '');
      const oldIn = $('dq-numin'), keepV = oldIn ? oldIn.value : '', hadFocus = oldIn && document.activeElement === oldIn;
      ph.innerHTML = pop;
      const newIn = $('dq-numin'); if (newIn) { newIn.value = keepV; if (hadFocus || DQ.popK !== S.k) newIn.focus(); }
      DQ.popK = S.k;
      const ib = ph.querySelector('.dq-pop-img');
      if (ib && !ib.querySelector('img')) dqPhoto(ib.dataset.img).then(src => { if (ib.isConnected && !ib.querySelector('img')) ib.innerHTML = src ? `<img src="${dqEsc(src)}" alt="">` : '<span>Fotku sa nepodarilo načítať — skús tipnúť.</span>'; });
    } else if (ph.innerHTML) {
      ph.classList.add('out');
      DQ.popT = setTimeout(() => { ph.className = ''; ph.innerHTML = ''; }, 340);
    }
  }
  /* časovač beží ako jedna plynulá animácia, nie po krokoch */
  const tot = S.tot || 0, left0 = Math.max(0, DQ.deadline - Date.now());
  st.querySelectorAll('.dq-bar-i').forEach(b => {
    if (b.dataset.k === String(S.k)) return;
    b.dataset.k = S.k; b.style.animation = 'none';
    if (tot && S.phase !== 'end' && !S.rev) { void b.offsetWidth; b.style.animation = `dqBar ${tot}ms linear ${-(tot - left0)}ms both, dqBarC ${tot}ms linear ${-(tot - left0)}ms both`; }
    else b.style.transform = 'scaleX(0)';
  });
  const up = () => {
    const Z = DQ.S; if (!Z) return;
    const left = Math.max(0, DQ.deadline - Date.now()), secEl = $('dq-sec'), cn = $('dq-count');
    if (secEl && !Z.rev) { const v = String(Math.ceil(left / 1000)); if (secEl.textContent !== v) secEl.textContent = v; secEl.classList.toggle('low', left < (Z.tot || 0) * 0.3); }
    if (cn) { const v = left > 2700 ? '3' : left > 1800 ? '2' : left > 900 ? '1' : 'GO!'; if (cn.dataset.v !== v) { cn.dataset.v = v; cn.innerHTML = `<b class="${v === 'GO!' ? 'go' : ''}">${v}</b>`; } }
  };
  up(); if (tot && S.phase !== 'end') DQ.bar = setInterval(up, 100);
}
