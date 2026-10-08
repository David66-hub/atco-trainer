/* ============================================================
   MOD 01 — POROVNANIE DVOCH PODOBNÝCH TYPOV
   Dve fotky vedľa seba, úloha: na ktorej je daný typ. Po odpovedi
   tabuľka rozdielov a pomôcky, podľa čoho ich rozoznať.
   ============================================================ */
const AC_PAIRS = [['B738','A320'],['B38M','A20N'],['B752','B763'],['B772','B788'],['B788','A359'],['A333','A359'],['A343','A346'],['B744','B748'],['A388','B748'],['E190','BCS3'],['CRJ9','E145'],['CRJ2','E145'],['AT76','DH8D'],['SF34','AT45'],['F100','CRJ9'],['F70','E170'],['C172','P28A'],['C152','C172'],['DA40','SR22'],['DA42','PA34'],['PC12','TBM9'],['C208','PC12'],['BE20','B190'],['C56X','C68A'],['GLF6','GLEX'],['GLF5','CL60'],['C510','HDJT'],['CL35','C750'],['IL76','C17'],['A124','C17'],['C130','AN12'],['C27J','AN26'],['A400','C130'],['EC35','EC45'],['AS50','B407'],['H60','MI8'],['R44','AS50'],['F16','L39'],['MD11','A306'],['A321','B739'],['A318','B737'],['SU95','E195'],['LJ45','PRM1'],['F2TH','FA7X'],['E55P','PC24']];
function acByIcao(i) { return AIRCRAFT.find(a => a.icao === i); }
function buildAcPairQuestions() {
  const w = state.filters.wake, list = [];
  AC_PAIRS.forEach(p => {
    const a = acByIcao(p[0]), b = acByIcao(p[1]);
    if (!a || !b || a.wiki === b.wiki) return;                    // rovnaký článok = rovnaká fotka
    if (w !== 'all' && a.wake !== w && b.wake !== w) return;
    const flip = Math.random() < 0.5, ask = Math.random() < 0.5 ? a : b;
    list.push({ type: 'acpair', id: 'AC_CMP_' + a.icao + '_' + b.icao, pair: flip ? [b, a] : [a, b], ask, accept: [ask.icao] });
  });
  return shuffle(list);
}
function acPhotoInto(box, ac) {
  const set = src => { box.innerHTML = `<img src="${src}" alt="" onerror="this.parentElement.innerHTML='<div class=&quot;photo-loading&quot;>IMAGERY UNAVAILABLE</div>'">`; };
  if (photoCache[ac.icao]) { set(photoCache[ac.icao]); return; }
  fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + ac.wiki, { headers: { 'Accept': 'application/json' } })
    .then(r => r.ok ? r.json() : null)
    .then(d => { const src = d && ((d.originalimage && d.originalimage.source) || (d.thumbnail && d.thumbnail.source)); if (!src) throw 0; photoCache[ac.icao] = src; if (box.isConnected) set(src); })
    .catch(() => { if (box.isConnected) box.innerHTML = '<div class="photo-loading">IMAGERY UNAVAILABLE</div>'; });
}
function renderAcPair(q, card) {
  const easy = state.filters.acAns !== 'type';
  card.innerHTML = `
    <div class="qmeta">IDENT TYPE <span class="sep">·</span> POROVNANIE DVOCH PODOBNÝCH TYPOV</div>
    <div class="hg-task"><span>ÚLOHA</span><strong>Na ktorej fotke je ${q.ask.icao} — ${q.ask.name}?</strong>
      <small>Klikni na správnu fotku, alebo stlač kláves 1 (ľavá) či 2 (pravá). Tieto dva typy sa na prvý pohľad podobajú — po odpovedi uvidíš tabuľku rozdielov.</small>
      ${easy ? `<small class="cmp-clue"><b>POMÔCKA:</b> ${q.ask.hints[1] || q.ask.hints[0]}</small>` : ''}</div>
    <div class="cmp-grid">${q.pair.map((a, i) => `<button class="cmp-card" data-i="${i}"><div class="aircraft-photo"><div class="photo-loading">LOADING IMAGERY...</div></div><span class="cmp-n">FOTKA ${i + 1}</span><span class="cmp-name"></span></button>`).join('')}</div>
    <div class="feedback" id="feedback"></div>`;
  apRetryBadge(q);
  const cards = card.querySelectorAll('.cmp-card');
  cards.forEach((c, i) => {
    acPhotoInto(c.querySelector('.aircraft-photo'), q.pair[i]);
    c.onclick = () => {
      if (c.classList.contains('done')) return;
      const ok = q.pair[i] === q.ask;
      cards.forEach((x, k) => { x.classList.add('done'); x.classList.add(q.pair[k] === q.ask ? 'ok' : 'other'); x.querySelector('.cmp-name').textContent = q.pair[k].icao + ' — ' + q.pair[k].name; });
      if (!ok) c.classList.add('no');
      apFinish(q, ok, ok ? '' : q.pair[i].icao);
    };
  });
}
function acPairReveal(q) {
  const a = q.pair[0], b = q.pair[1], row = (l, k) => `<tr><td>${l}</td><td>${a[k]}</td><td>${b[k]}</td></tr>`;
  return `<div class="reveal"><div class="reveal-title">${a.icao} vs ${b.icao}</div><div class="reveal-sub">AKO ICH ROZOZNAŤ</div>
    <table class="co-table"><thead><tr><th></th><th>${a.icao} — ${a.name}</th><th>${b.icao} — ${b.name}</th></tr></thead><tbody>
      <tr><td>Rozpoznávací znak</td><td>${a.hints[0]}<br>${a.hints[1] || ''}</td><td>${b.hints[0]}<br>${b.hints[1] || ''}</td></tr>
      ${row('Turbulencia v úplave', 'wake')}${row('Motory', 'engines')}${row('Dĺžka', 'length')}${row('Rozpätie', 'wingspan')}${row('MTOW', 'mtow')}${row('Cestovná rýchlosť', 'cruise')}${row('Dostup', 'ceiling')}${row('Kto s ním lieta', 'operators')}
    </tbody></table></div>`;
}

/* ============================================================
   MOD 05 — POČTY S KURZOM
   Tri typy úloh, ktoré sa na frekvencii robia z hlavy: opačný kurz,
   zatáčka o X stupňov a ktorým smerom je zatáčka kratšia. Každá
   úloha povie presne, čo treba spraviť, a po odpovedi ukáže výpočet.
   ============================================================ */
const HC = {};
function hcNew() {
  const F = state.filters, easy = F.hgDiff !== 'hard', step = easy ? 10 : 5;
  const rnd = (n) => Math.floor(Math.random() * n);
  const kinds = F.hcKind === 'all' ? ['recip', 'turn', 'short'] : [F.hcKind];
  const kind = kinds[rnd(kinds.length)], from = hgNorm(step * (1 + rnd(360 / step)));
  const o = { kind, from, done: false };
  if (kind === 'recip') { o.ans = hgNorm(from + 180); }
  else if (kind === 'turn') { o.amt = easy ? 10 * (1 + rnd(9)) : 5 * (1 + rnd(35)); o.dir = Math.random() < 0.5 ? 'R' : 'L'; o.ans = hgNorm(from + (o.dir === 'R' ? o.amt : -o.amt)); }
  else { let d; do { d = (easy ? 10 * (1 + rnd(17)) : 5 * (1 + rnd(35))) * (Math.random() < 0.5 ? 1 : -1); } while (Math.abs(d) === 180); o.to = hgNorm(from + d); o.ans = d > 0 ? 'R' : 'L'; o.amt = Math.abs(d); }
  Object.keys(HC).forEach(k => delete HC[k]);
  Object.assign(HC, o);
}
function hcCompass(showAns) {
  let ticks = '';
  for (let a = 0; a < 360; a += 10) {
    const big = a % 30 === 0, s = Math.sin(a * Math.PI / 180), c = -Math.cos(a * Math.PI / 180);
    ticks += `<line x1="${(150 + (big ? 108 : 114) * s).toFixed(1)}" y1="${(150 + (big ? 108 : 114) * c).toFixed(1)}" x2="${(150 + 122 * s).toFixed(1)}" y2="${(150 + 122 * c).toFixed(1)}"></line>`;
    if (big) ticks += `<text x="${(150 + 136 * s).toFixed(1)}" y="${(150 + 136 * c + 4).toFixed(1)}">${hgPad(a)}</text>`;
  }
  const arrow = (h, cls) => `<g transform="rotate(${h} 150 150)" class="${cls}"><line x1="150" y1="150" x2="150" y2="52"></line><path d="M150,40 L158,58 L142,58 Z"></path></g>`;
  let extra = '';
  if (HC.kind === 'short') extra += arrow(HC.to, 'hc-to');
  if (showAns && HC.kind !== 'short') extra += arrow(HC.ans, 'hc-to');
  return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" id="map-svg" class="hc-svg">
    <circle cx="150" cy="150" r="122" class="hc-ring"></circle><g class="hc-ticks">${ticks}</g>
    ${extra}${arrow(HC.from, 'hc-from')}<circle cx="150" cy="150" r="5" class="hc-hub"></circle></svg>`;
}
function hcTexts() {
  const f = hgPad(HC.from);
  if (HC.kind === 'recip') return { title: `Aký je opačný kurz ku kurzu ${f}?`, todo: 'Napíš kurz, ktorým by lietadlo letelo presne opačným smerom, a stlač Enter.',
    rule: 'Opačný kurz = kurz ± 180. Ak je kurz 180 alebo menej, 180 pripočítaj. Ak je viac než 180, 180 odpočítaj.',
    calc: HC.from <= 180 ? `${f} + 180 = ${hgPad(HC.ans)}` : `${f} − 180 = ${hgPad(HC.ans)}` };
  if (HC.kind === 'turn') {
    const raw = HC.from + (HC.dir === 'R' ? HC.amt : -HC.amt), dirT = HC.dir === 'R' ? 'DOPRAVA' : 'DOĽAVA';
    let calc = `${f} ${HC.dir === 'R' ? '+' : '−'} ${HC.amt} = ${raw}`;
    if (raw > 360) calc += ` → je to nad 360, odpočítaj 360 → ${hgPad(HC.ans)}`;
    else if (raw <= 0) calc += ` → je to pod 001, pripočítaj 360 → ${hgPad(HC.ans)}`;
    else calc += ` → ${hgPad(HC.ans)}`;
    return { title: `Letíš kurzom ${f}. Otoč o ${HC.amt}° ${dirT}. Aký je nový kurz?`, todo: 'Napíš nový kurz po zatáčke a stlač Enter.',
      rule: 'Doprava kurz rastie (pripočítaj), doľava klesá (odpočítaj). Ak vyjde viac než 360, odpočítaj 360. Ak vyjde 0 alebo menej, pripočítaj 360.', calc };
  }
  const t = hgPad(HC.to);
  return { title: `Letíš kurzom ${f} a potrebuješ kurz ${t}. Ktorým smerom je zatáčka kratšia?`, todo: 'Klikni na DOĽAVA alebo DOPRAVA (klávesy 1 a 2). Zelená šípka je tvoj kurz, oranžová je nový.',
    rule: 'Od nového kurzu odpočítaj svoj. Ak vyjde 1 až 179, toč doprava. Ak vyjde viac než 180, je kratšie doľava (360 mínus výsledok). Pri zápornom čísle najprv pripočítaj 360.',
    calc: `Z ${f} na ${t} je to ${HC.amt}° ${HC.ans === 'R' ? 'doprava' : 'doľava'} — opačným smerom by to bolo ${360 - HC.amt}°.` };
}
function hcRender(card) {
  const F = state.filters, easy = F.hgDiff !== 'hard';
  hcNew();
  const T = hcTexts();
  document.getElementById('qnum').textContent = state.correct + state.wrong + 1;
  document.getElementById('qtotal').textContent = '∞';
  card.innerHTML = `
    <div class="qmeta">HRA NA KURZY <span class="sep">·</span> POČTY S KURZOM <span class="sep">·</span> ${easy ? 'ĽAHKÁ' : 'HARDCORE'}</div>
    <div class="map-wrap hc-wrap">${hcCompass(false)}</div>
    <div class="hg-task"><span>ÚLOHA</span><strong>${T.title}</strong><small><b>ČO MÁŠ SPRAVIŤ:</b> ${T.todo}</small></div>
    ${easy ? `<div class="hc-rule"><b>AKO NA TO</b>${T.rule}</div>` : ''}
    ${HC.kind === 'short'
      ? `<div class="choice-grid"><button class="choice-btn" data-d="L">◀ DOĽAVA</button><button class="choice-btn" data-d="R">DOPRAVA ▶</button></div>`
      : `<div class="input-row"><input type="text" id="hg-in" inputmode="numeric" maxlength="3" placeholder="KURZ (napr. 065)" autocomplete="off"><button class="btn" id="hg-go">POTVRDIŤ ▶</button></div>`}
    <div class="hg-msg" id="hg-msg">${easy ? 'ĽAHKÁ: kurzy sú po 10° a pravidlo máš hore.' : 'HARDCORE: kurzy po 5°, zatáčky až do 175° a bez pravidla.'}</div>
    <div class="hg-btns"><button class="btn" id="hs-next" style="display:none">ĎALŠIA ÚLOHA ▶</button></div>`;
  HG.built = true;
  const inp = document.getElementById('hg-in');
  if (inp) { inp.focus(); inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (HC.done) hcRender(card); else hcAnswer(inp.value.trim()); } }); document.getElementById('hg-go').onclick = () => hcAnswer(inp.value.trim()); }
  card.querySelectorAll('[data-d]').forEach(b => { b.onclick = () => hcAnswer(b.dataset.d); });
  document.getElementById('hs-next').onclick = () => hcRender(card);
}
function hcAnswer(val) {
  if (HC.done || !val) return;
  let ok;
  if (HC.kind === 'short') ok = val === HC.ans;
  else {
    const n = Number(val);
    if (!/^\d{1,3}$/.test(val) || n > 360) { hgMsg(`„${val}“ nie je kurz. Zadaj číslo 001 až 360.`, 'no'); return; }
    ok = hgNorm(n) === HC.ans;
  }
  HC.done = true;
  if (ok) { state.correct++; state.streak++; if (state.streak > state.bestStreak) state.bestStreak = state.streak; } else { state.wrong++; state.streak = 0; }
  renderStats();
  const T = hcTexts(), right = HC.kind === 'short' ? (HC.ans === 'R' ? 'DOPRAVA' : 'DOĽAVA') : hgPad(HC.ans);
  document.querySelector('.hc-wrap').innerHTML = hcCompass(true);
  document.querySelectorAll('#qcard [data-d]').forEach(b => { b.disabled = true; if (b.dataset.d === HC.ans) b.classList.add('ok'); else if (b.dataset.d === val) b.classList.add('no'); });
  const go = document.getElementById('hg-go'); if (go) go.disabled = true;
  hgMsg((ok ? '✓ SPRÁVNE — ' : `✗ ZLE — správne je ${right}. `) + 'Výpočet: ' + T.calc + '  (Enter alebo medzerník = ďalšia úloha)', ok ? 'ok' : 'no');
  const nx = document.getElementById('hs-next'); nx.style.display = ''; nx.id = 'next-btn'; nx.onclick = () => hcRender(document.getElementById('qcard'));
}

/* ============================================================
   MOD 06 — SCENÁR
   Jeden let od začiatku do odovzdania: bod → hladina → podmienka →
   stanovište a frekvencia. Stanovište sa určuje z tabuľky vertikálnych
   hraníc podľa hladiny, v ktorej let hranicu preletí.
   ============================================================ */
function coLimRange(lim) {
  const v = p => { p = p.trim(); if (/^GND/i.test(p)) return 0; const n = parseInt(p.replace(/\D/g, ''), 10); return /^FL/i.test(p) ? n : n / 100; };
  const ab = lim.split('–'); return [v(ab[0]), v(ab[1])];
}
function coScenFlight(t, r) {
  /* hladina letu: daná v tabuľke, alebo bežná cestovná v správnom smere */
  let fl = null, m = r[3].match(/^(?:descending |climbing )?FL(\d+)$/);
  if (m) fl = +m[1];
  else if (/^eastbound/.test(r[3])) fl = [330, 350, 370, 390][Math.floor(Math.random() * 4)];
  else if (/^westbound/.test(r[3])) fl = [320, 340, 360, 380][Math.floor(Math.random() * 4)];
  let unit = null;
  if (t.to === 'BA') unit = CO_UNITS.find(u => u.n === 'BRATISLAVA ACC');
  else if (fl !== null) {
    const fit = CO_UNITS.filter(u => u.g === t.to && u.f).filter(u => { const g = coLimRange(u.lim); return fl > g[0] && fl < g[1]; });
    if (fit.length === 1) unit = fit[0];        // na hranici dvoch stanovíšť sa krok s frekvenciou vynechá
  }
  const sim = CALLSIGNS.filter(c => c.sim && c.freq >= 5), cs = sim[Math.floor(Math.random() * sim.length)];
  return { fl, unit, call: cs.icao + (100 + Math.floor(Math.random() * 899)), csName: cs.call };
}
function coScenSteps(q) {
  const t = q.t, r = q.r, S = q.sc, steps = [];
  const tableCops = t.rows.map(x => x[2]).filter((v, i, a) => a.indexOf(v) === i);
  const sameKey = t.rows.filter(x => coScenario(t, x) === coScenario(t, r));
  steps.push({ k: 'BOD', ask: 'Cez ktorý koordinačný bod (COP) tento let pôjde?', correct: r[2], accept: sameKey.map(x => x[2]),
    pool: tableCops.filter(c => c !== r[2] && c !== 'ALL').concat(Object.keys(CO_COP).filter(c => tableCops.indexOf(c) < 0)), ph: 'BOD (5 PÍSMEN)...' });
  const allLv = [], allCond = [];
  CO_TABLES.forEach(x => x.rows.forEach(y => { if (allLv.indexOf(y[3]) < 0) allLv.push(y[3]); if (y[4] && allCond.indexOf(y[4]) < 0) allCond.push(y[4]); }));
  steps.push({ k: 'HLADINA', ask: `Aká je Level Allocation na bode ${r[2]}?`, correct: r[3], accept: coLvlAccept(r[3]),
    pool: t.rows.map(x => x[3]).concat(allLv).filter((v, i, a) => v !== r[3] && a.indexOf(v) === i), ph: 'HLADINA (napr. FL250 / eastbound)...' });
  if (r[4]) steps.push({ k: 'PODMIENKA', ask: 'Aká je Special Condition?', correct: r[4], accept: coLvlAccept(r[4]), pool: allCond.filter(v => v !== r[4]).concat(['— žiadna —']), ph: 'PODMIENKA...' });
  if (S.unit) {
    const lab = u => u.n + ' — ' + u.f + ' MHz', g = S.unit.g;
    steps.push({ k: 'FREKVENCIA', ask: t.to === 'BA' ? 'Let prichádza k nám. Na akom stanovišti a frekvencii sa ohlási?' : `Let preletí hranicu v FL${S.fl}. Podľa vertikálnych hraníc: ktorému stanovišťu a na akej frekvencii ho odovzdáš?`,
      correct: lab(S.unit), accept: coFreqAccept(S.unit).concat([S.unit.n, lab(S.unit)]),
      pool: CO_UNITS.filter(u => u.f && u !== S.unit).sort((a, b) => (a.g === g ? 0 : 1) - (b.g === g ? 0 : 1)).map(lab), ph: 'FREKVENCIA (napr. 125,450)...' });
  }
  return steps;
}
function renderCoScen(q, card) {
  if (!q.sc) q.sc = coScenFlight(q.t, q.r);
  const X = state.scen && state.scen.q === q ? state.scen : (state.scen = { q, i: 0, res: [], steps: coScenSteps(q) });
  const t = q.t, r = q.r, S = q.sc, easy = state.filters.coAns !== 'type', st = X.steps[X.i], done = X.i >= X.steps.length;
  const dir = t.from === 'BA' ? 'out' : 'in', showCop = X.i >= 1 && r[2] !== 'ALL';
  /* lietadlo letí k bodu až po tom, čo je bod určený — inak by ho prezradilo */
  let plane = '';
  if (showCop) {
    const c = coXY(r[2]), dx = c[0] - 500, dy = c[1] - 267, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    const a = dir === 'out' ? [c[0] - ux * 170, c[1] - uy * 170] : [c[0] + ux * 120, c[1] + uy * 120];
    const ang = Math.atan2(c[1] - a[1], c[0] - a[0]) * 180 / Math.PI + 90;
    plane = `<g><path class="hg-plane" d="M0,-12 L8,10 L0,5 L-8,10 Z" transform="rotate(${ang.toFixed(1)})"></path>
      <animateMotion dur="7s" repeatCount="indefinite" path="M ${a[0].toFixed(1)},${a[1].toFixed(1)} L ${c[0].toFixed(1)},${c[1].toFixed(1)}"></animateMotion></g>`;
  }
  const map = coMapSVG({ lit: showCop ? r[2] : null, litName: true }).replace('</svg>', plane + '</svg>');
  const stepper = X.steps.map((s, i) => {
    const res = X.res[i], cls = i === X.i ? 'now' : res ? (res.ok ? 'ok' : 'no') : '';
    return `<div class="sc-step ${cls}"><b>${i + 1}</b><span>${s.k}</span>${res ? `<em>${res.ok ? '✓' : '✗'} ${s.correct}</em>` : ''}</div>`;
  }).join('');
  let ask = '';
  if (!done) {
    const opts = shuffle([st.correct].concat(st.pool.filter(v => st.accept.indexOf(v) < 0).slice(0, 5)));
    ask = `<div class="hg-task"><span>KROK ${X.i + 1} Z ${X.steps.length}</span><strong>${st.ask}</strong></div>` + (easy
      ? `<div class="choice-grid">${opts.map(o => `<button class="choice-btn" data-o="${o.replace(/"/g, '&quot;')}">${o}</button>`).join('')}</div>`
      : `<div class="input-row"><input type="text" id="answer" placeholder="${st.ph}" autocomplete="off" spellcheck="false"><button class="btn" id="submit-btn">POTVRDIŤ ▶</button></div>`);
  } else {
    const good = X.res.filter(x => x.ok).length;
    ask = `<div class="feedback show ${good === X.steps.length ? 'ok' : 'no'}" id="feedback"><div class="feedback-banner"><span>${good === X.steps.length ? '✓ <strong>CELÝ SCENÁR SPRÁVNE</strong>' : `✗ <strong>${good} Z ${X.steps.length} KROKOV SPRÁVNE</strong>`}</span><button class="btn" id="next-btn">NEXT ▶</button></div>${coReveal(q)}</div>`;
  }
  card.innerHTML = `
    <div class="qmeta">KOORDINÁCIA <span class="sep">·</span> SCENÁR</div>
    <div class="map-wrap">${map}</div>
    <div class="co-sc"><div class="co-sc-title">${S.call} „${S.csName} ${S.call.slice(3)}“ · ${t.title.replace('Flights from ', '').replace(' to ', ' → ')}</div>
      <div class="co-sc-row"><span>ATS-ROUTE</span><strong>${r[0] || '—'}</strong></div><div class="co-sc-row"><span>LET</span><strong>${r[1] || 'prelet (ostatné lety)'}</strong></div></div>
    <div class="sc-steps">${stepper}</div>${ask}`;
  apRetryBadge(q);
  const answer = (val) => {
    const n = normalize(val); if (!n) return;
    const ok = st.accept.some(a => normalize(a) === n) || normalize(st.correct) === n;
    X.res[X.i] = { ok, val }; X.i++;
    if (ok) { state.correct++; state.streak++; if (state.streak > state.bestStreak) state.bestStreak = state.streak; } else { state.wrong++; state.streak = 0; }
    renderStats();
    if (X.i >= X.steps.length) {
      const all = X.res.every(x => x.ok);
      if (!all) { state.mistakes[q.id] = (state.mistakes[q.id] || 0) + 1; wkLog(q, X.res.map(x => x.val).join(' · ')); }
      renderWeak(); apAfterAnswer(q, all);
    }
    renderCoScen(q, card);
  };
  card.querySelectorAll('[data-o]').forEach(b => { b.onclick = () => answer(b.dataset.o); });
  const inp = document.getElementById('answer');
  if (inp) { inp.focus(); inp.addEventListener('keydown', e => { if (e.key === 'Enter') answer(inp.value); }); document.getElementById('submit-btn').onclick = () => answer(inp.value); }
  const nb = document.getElementById('next-btn');
  if (nb) { nb.onclick = nextQuestion; setTimeout(() => { nb.focus(); document.addEventListener('keydown', onEnterNext, { once: true }); }, 50); }
}

/* ============================================================
   UKÁZAŤ VZOR — krátka ukážka na aktuálnej otázke
   Zvýrazní zadanie, sama odpovie správne a ukáže, čo nasleduje.
   Stav sa pred ukážkou uloží a po nej vráti, takže ukážka sa
   nezapočíta do skóre, slabých miest ani opakovania.
   ============================================================ */
const DEMO = { on: false, stop: false };
function demoSleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function demoSay(el, text, ms) {
  if (DEMO.stop) throw 'stop';
  document.querySelectorAll('.demo-hl').forEach(x => x.classList.remove('demo-hl'));
  const b = document.getElementById('demo-bubble');
  if (el && el.getBoundingClientRect().width) {
    el.classList.add('demo-hl');
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    await demoSleep(250);
    const r = el.getBoundingClientRect();
    b.textContent = text; b.style.display = 'block';
    let top = r.bottom + 10; if (top + b.offsetHeight > window.innerHeight - 50) top = Math.max(8, r.top - b.offsetHeight - 10);
    b.style.top = top + 'px';
    b.style.left = Math.max(8, Math.min(r.left, window.innerWidth - b.offsetWidth - 8)) + 'px';
  } else { b.textContent = text; b.style.display = 'block'; b.style.top = '40%'; b.style.left = Math.max(8, (window.innerWidth - b.offsetWidth) / 2) + 'px'; }
  await demoSleep(ms || 2300);
  if (DEMO.stop) throw 'stop';
}
async function demoType(inp, text) {
  inp.focus();
  for (const ch of String(text)) { if (DEMO.stop) throw 'stop'; inp.value += ch; await demoSleep(110); }
  await demoSleep(400);
}
function demoCorrectBtn(q) {
  const bs = Array.prototype.slice.call(document.querySelectorAll('#qcard .choice-btn:not(:disabled)'));
  if (!q) return bs[0];
  const want = q.type === 'aircraft' ? q.data.icao + ' — ' + q.data.name : null;
  return bs.find(b => b.textContent === want || (q.correct && b.textContent === q.correct) || (q.accept && q.accept.indexOf(b.textContent) >= 0)) || bs[0];
}
async function demoRun() {
  if (DEMO.on) { DEMO.stop = true; return; }
  const btn = document.getElementById('btn-demo'), card = document.getElementById('qcard'), $ = s => card.querySelector(s);
  const snap = { c: state.correct, w: state.wrong, s: state.streak, b: state.bestStreak, i: state.index, t: state.total, q: state.queue.slice(),
    m: JSON.stringify(state.mistakes), o: JSON.stringify(state.apOk), sr: JSON.stringify(state.sr), l: JSON.stringify(state.last), dd: state.dailyDone,
    blind: state.blind ? JSON.stringify(state.blind) : null, fill: state.coFill ? JSON.stringify(state.coFill) : null };
  DEMO.on = true; DEMO.stop = false;
  document.body.classList.add('demo-on');
  btn.innerHTML = '■<span> UKONČIŤ VZOR</span>';
  const q = state.current, F = state.filters;
  const END = 'Toľko vzor. Otázka sa teraz vráti do pôvodného stavu a ideš ty.';
  try {
    if (state.mode === 'home') {
      await demoSay($('.home-cta'), 'DNEŠNÝ TRÉNING ti sám namieša otázky zo všetkých modulov. Stačí kliknúť na SPUSTIŤ.');
      await demoSay($('.home-search input'), 'Sem napíš akýkoľvek kód alebo názov a trenažér ukáže všetko, čo o ňom vie.');
      await demoSay(document.querySelector('.tabs'), 'Moduly otvoríš tlačidlom MODULY tu hore. V každom module ti toto tlačidlo ukáže vzorovú odpoveď.');
    } else if (state.mode === 'exam' && !state.exam) {
      await demoSay($('#exam-go'), 'Skúška sa spustí týmto tlačidlom. Odpovede sa vyhodnotia až na konci.');
    } else if (state.mode === 'heading' && F.hgMode === 'static') {
      await demoSay($('.map-wrap'), 'Lietadlo (čierna šípka) stojí. Oranžový bod je cieľ. Odhadni kurz, ktorý od lietadla vedie na bod: hore je 360, vpravo 090, dole 180, vľavo 270.', 3600);
      await demoSay($('#hg-in'), 'Kurz napíš sem — vždy po 5° — a potvrď Enterom. Píšem správny kurz.');
      await demoType($('#hg-in'), hgPad(HS.brg)); hsAnswer();
      await demoSay($('#hs-res'), 'Lietadlo sa natočilo na zadaný kurz. Vidíš svoj kurz, správny kurz a o koľko si bol vedľa.');
      await demoSay($('#hs-next'), 'Ďalšia úloha: toto tlačidlo alebo Enter.');
    } else if (state.mode === 'heading' && F.hgMode === 'calc') {
      await demoSay($('.hg-task'), 'Tu je úloha a pod ňou presne napísané, čo máš spraviť.', 3000);
      if ($('.hc-rule')) await demoSay($('.hc-rule'), 'V ľahkej verzii je tu pravidlo, ako sa to počíta.', 3000);
      await demoSay($('.hc-wrap'), 'Zelená šípka na ružici je kurz, z ktorého vychádzaš.');
      if ($('#hg-in')) { await demoSay($('#hg-in'), 'Výsledok napíš sem. Píšem správny.'); await demoType($('#hg-in'), hgPad(HC.ans)); hcAnswer($('#hg-in').value); }
      else { const b = $('[data-d="' + HC.ans + '"]'); await demoSay(b, 'Správna je táto strana — klikám.'); b.click(); }
      await demoSay($('#hg-msg'), 'Po odpovedi vidíš celý výpočet krok za krokom.', 3200);
    } else if (state.mode === 'heading') {
      await demoSay($('.hg-task'), 'Toto je cieľ, cez ktorý má lietadlo preletieť. Na mape je oranžový.');
      await demoSay($('#hg-in'), 'Napíšeš kurz po 5° a Enter — lietadlo hneď zatočí. Píšem kurz na cieľ.');
      await demoType($('#hg-in'), hgPad(Math.round(hgBearing(HG.x, HG.y, HG.target.x, HG.target.y) / 5) * 5)); hgCommand();
      await demoSay($('.map-wrap'), 'Lietadlo letí. Kurz môžeš kedykoľvek zmeniť novým číslom. Prelet cieľom je zásah.', 4200);
    } else if ($('#cs-show')) {
      await demoSay($('.big-prompt'), 'Kartička: povedz si odpoveď nahlas alebo v duchu. Nič nepíšeš.');
      await demoSay($('#cs-show'), 'Potom ju odkry — týmto tlačidlom alebo medzerníkom.'); csCardShow();
      await demoSay($('#cs-acts'), 'A ohodnoť sa sám: 1 = vedel som, 2 = nevedel som. Čo nevieš, vráti sa neskôr.', 3200);
    } else if ($('.cmp-card')) {
      await demoSay($('.hg-task'), 'Úloha hovorí, ktorý typ máš nájsť. Obe lietadlá sú si podobné.', 3000);
      const i = q.pair.indexOf(q.ask), c = card.querySelectorAll('.cmp-card')[i];
      await demoSay(c, 'Správna je táto fotka — klikám na ňu (alebo kláves ' + (i + 1) + ').'); c.click();
      await demoSay($('.co-table'), 'Po odpovedi vidíš tabuľku rozdielov — podľa čoho tie dva typy rozoznať.', 3200);
    } else if (q && q.type === 'coord' && q.sub === 'scen') {
      await demoSay($('.co-sc'), 'Scenár: jeden let — volačka, smer, trať a typ letu.', 3000);
      await demoSay($('.sc-steps'), 'Ideš krok za krokom: bod, hladina, prípadne podmienka a frekvencia.', 3000);
      for (let k = 0; k < 6 && state.scen && state.scen.i < state.scen.steps.length; k++) {
        const st = state.scen.steps[state.scen.i];
        const b = Array.prototype.slice.call(card.querySelectorAll('[data-o]')).find(x => x.dataset.o === st.correct), inp = $('#answer');
        if (b) { await demoSay(b, 'Krok ' + (state.scen.i + 1) + ' — správna odpoveď, klikám.', 1900); b.click(); }
        else if (inp) { await demoSay(inp, 'Krok ' + (state.scen.i + 1) + ' — píšem správnu odpoveď.', 1600); await demoType(inp, st.accept[st.accept.length > 1 ? 1 : 0]); $('#submit-btn').click(); }
      }
      await demoSay($('#feedback'), 'Na konci vidíš, koľko krokov bolo správne, a príslušnú tabuľku z dohody.', 3000);
    } else if ($('.choice-btn')) {
      await demoSay($('.aircraft-photo') || $('.co-sc') || $('.map-wrap') || $('.big-prompt'), 'Toto je otázka. Pozri si ju v pokoji — čas tu nebeží.');
      await demoSay($('.choice-grid'), 'Vyber jednu z možností — kliknutím alebo klávesom s číslom, ktoré je v rohu.');
      const b = demoCorrectBtn(q); await demoSay(b, 'Správna je táto. Klikám.', 1800); b.click();
      await demoSay($('.feedback-banner'), 'Hneď vidíš, či to bolo správne.', 1900);
      if ($('.reveal')) await demoSay($('.reveal'), 'Pod tým je všetko podstatné k danej veci — oplatí sa to vždy prečítať.', 2800);
      await demoSay($('#next-btn'), 'Na ďalšiu otázku ideš tlačidlom NEXT, Enterom alebo medzerníkom.');
    } else if (q && q.click) {
      await demoSay($('.mp-name'), 'Dostaneš kód alebo mesto a máš ukázať, kde letisko leží.');
      const m = airportMapXY(q.data), svg = document.getElementById('map-svg'), pt = svg.createSVGPoint(); pt.x = m.x; pt.y = m.y;
      const sp = pt.matrixTransform(svg.getScreenCTM());
      await demoSay($('.map-wrap'), 'Klikneš do mapy na miesto, kde si myslíš, že je. Klikám na správne miesto.');
      svg.dispatchEvent(new MouseEvent('click', { clientX: sp.x, clientY: sp.y, bubbles: true }));
      await demoSay($('.feedback-banner'), 'Ukáže sa, o koľko kilometrov si bol vedľa.', 2600);
    } else if (q && ((q.type === 'coord' && q.sub === 'click') || (q.type === 'waypoint' && q.subtype !== 'name'))) {
      const name = q.cop || q.data.name;
      await demoSay($('.mp-name'), 'Toto je bod, ktorý hľadáš.');
      await demoSay($('.map-wrap'), 'Na mape sú krúžky. Klikneš na ten, ktorý je podľa teba správny. Klikám na správny.');
      card.querySelector('.wp-hit[data-name="' + name + '"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await demoSay($('.feedback-banner'), 'Správny bod ostane zelený a ostatné sa pomenujú, aby si si odniesol aj okolie.', 3000);
    } else if ($('#answer')) {
      await demoSay($('.aircraft-photo') || $('.map-wrap') || $('.big-prompt'), 'Toto je otázka. V HARDCORE verzii odpoveď píšeš z hlavy.');
      if ($('#btn-hint')) await demoSay($('#btn-hint'), 'Keď nevieš, HINT ti napovie — po krokoch, od najmenšej nápovede.');
      await demoSay($('#answer'), 'Odpoveď napíš sem a potvrď Enterom. Píšem správnu.', 1900);
      await demoType($('#answer'), q.accept[0]);
      if (q.type === 'waypoint') submitWaypointName(); else submitAnswer();
      await demoSay($('.feedback-banner'), 'Hneď vidíš výsledok a pod ním podrobnosti.', 2600);
      await demoSay($('#next-btn'), 'Ďalšia otázka: NEXT alebo Enter.');
    } else if ($('.blind-grid')) {
      await demoSay($('.map-wrap'), 'Na mape sú body bez mien, len s číslami.');
      await demoSay($('.blind-grid'), 'Ku každému číslu napíš názov bodu. Nemusíš vyplniť všetky.', 2800);
      await demoSay($('#blind-check'), 'VYHODNOTIŤ ukáže, čo máš dobre; zvyšok doplní červeným.', 2800);
    } else if ($('.co-fill')) {
      await demoSay($('.co-fill'), 'Tabuľka je ako v dohode, ale COP, hladina a podmienka sú prázdne. Doplň ich.', 3200);
      await demoSay($('#co-check'), 'VYHODNOTIŤ ukáže správne políčka zeleno a nesprávne doplní červeným.', 2800);
    } else {
      await demoSay($('.map-wrap') || $('.cs-list') || card, 'Tento režim je na prezeranie — nič sa tu neskúša. Klikaj na body alebo políčka a čítaj.', 3400);
      await demoSay(document.getElementById('btn-set'), 'Režim a ďalšie nastavenia zmeníš cez tlačidlo NASTAVENIA.');
    }
    await demoSay(null, END, 2200);
  } catch (e) { /* ukončené používateľom alebo otázka medzitým zmizla */ }
  /* návrat do stavu pred ukážkou */
  document.querySelectorAll('.demo-hl').forEach(x => x.classList.remove('demo-hl'));
  document.getElementById('demo-bubble').style.display = 'none';
  document.body.classList.remove('demo-on');
  state.correct = snap.c; state.wrong = snap.w; state.streak = snap.s; state.bestStreak = snap.b;
  state.queue = snap.q; state.index = snap.i; state.total = snap.t; state.current = state.queue[snap.i] || null;
  state.mistakes = JSON.parse(snap.m); state.apOk = JSON.parse(snap.o); state.sr = JSON.parse(snap.sr); state.last = JSON.parse(snap.l); state.dailyDone = snap.dd;
  state.blind = snap.blind ? JSON.parse(snap.blind) : null; state.coFill = snap.fill ? JSON.parse(snap.fill) : null; state.scen = null;
  if (typeof hgStop === 'function') hgStop();
  apSaveProgress(); renderStats(); renderWeak(); renderQuestion();
  DEMO.on = false; DEMO.stop = false;
  btn.innerHTML = '▶<span> VZOR</span>';
}
