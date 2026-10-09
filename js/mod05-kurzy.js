/* ============================================================
   MOD 05 — HRA NA KURZY
   ------------------------------------------------------------
   Jedno lietadlo letí nad mapou Slovenska. Kurz sa zadáva číslom
   po 5° (245, 250, 255…) a cieľom je preletieť bránkou alebo nad
   zadaným miestom. Po zásahu sa hneď objaví ďalší cieľ.
   Lietadlo začne točiť hneď po Enteri, bez oneskorenia.
   Poloha je v súradniciach mapy (viewBox 1000 × 534, 1 px ≈ 0,44 km).
   ============================================================ */
const HG_SPEED = { easy: 20, hard: 40 };              // px za sekundu (ĽAHKÁ / HARDCORE)
const HG_TURN  = 90;                                 // ° za sekundu — skoro hneď, ale zatáčku ešte vidno
const HG_DELAY = 0;                                  // bez oneskorenia: lietadlo točí hneď po Enteri
const HG_GATE  = { easy: 30, hard: 16 };              // polomer bránky v px
const HS_TOL   = { easy: 5, hard: 0 };                // statický režim: o koľko stupňov smieš byť vedľa
const HG_POINT_R = 14;                               // do akej vzdialenosti sa ráta prelet miesta
const HG = { raf: 0, run: false, built: false };

function hgNorm(h) { h = ((h % 360) + 360) % 360; return h === 0 ? 360 : h; }
function hgPad(h) { return String(Math.round(hgNorm(h))).padStart(3, '0'); }
function hgBearing(x1, y1, x2, y2) { return hgNorm(Math.atan2(x2 - x1, -(y2 - y1)) * 180 / Math.PI); }
/* najkratší rozdiel kurzov, -180…180 (kladný = doprava) */
function hgDiff(from, to) { return ((to - from + 540) % 360) - 180; }

let HG_POLY = null;
function hgInside(x, y) {
  if (!HG_POLY) HG_POLY = FIR_OUTLINE.map(p => [projX(p[0]), projY(p[1])]);
  let c = false;
  for (let i = 0, j = HG_POLY.length - 1; i < HG_POLY.length; j = i++) {
    const a = HG_POLY[i], b = HG_POLY[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
/* miesta, nad ktoré sa lieta: slovenské letiská z MOD 02, resp. body FRA z MOD 04 */
function hgPlaces() {
  if (state.filters.hgKind === 'fra')
    return WAYPOINTS.map(w => ({ name: w.name, x: projX(w.lon), y: projY(w.lat) }));
  return AIRPORTS.filter(a => a.cat === 'sk' && AP_POS[a.icao])
    .map(a => ({ name: a.city.toUpperCase(), x: projX(AP_POS[a.icao][1]), y: projY(AP_POS[a.icao][0]) }));
}

function hgNewTarget() {
  const F = state.filters;
  let t = null;
  if (F.hgKind === 'gate') {
    for (let i = 0; i < 400 && !t; i++) {
      const x = 60 + Math.random() * 880, y = 40 + Math.random() * 450;
      const d = Math.hypot(x - HG.x, y - HG.y);
      if (hgInside(x, y) && d > 170 && d < 520) t = { x, y, r: HG_GATE[F.hgDiff], name: 'BRÁNKA ' + (HG.hits + 1) };
    }
    if (!t) t = { x: 500, y: 267, r: HG_GATE[F.hgDiff], name: 'BRÁNKA ' + (HG.hits + 1) };
    /* stĺpiky bránky stoja kolmo na smer, z ktorého k nej lietadlo teraz letí */
    t.ang = hgBearing(HG.x, HG.y, t.x, t.y) + 90;
  } else {
    const all = hgPlaces().filter(p => (!HG.target || p.name !== HG.target.name) && Math.hypot(p.x - HG.x, p.y - HG.y) > 110);
    const p = all[Math.floor(Math.random() * all.length)];
    t = { x: p.x, y: p.y, r: HG_POINT_R, name: p.name };
  }
  HG.target = t;
  HG.hintUsed = false;
  hgDrawTarget();
}

function hgReset() {
  cancelAnimationFrame(HG.raf);
  Object.assign(HG, { raf: 0, run: false, x: 500, y: 250, hdg: 90, set: 90, delay: 0, trail: [], cmds: 0, hits: 0, t: 0, out: false, target: null, last: 0 });
  state.correct = 0; state.wrong = 0; state.streak = 0; state.bestStreak = 0;
}
function hgStop() { cancelAnimationFrame(HG.raf); HG.raf = 0; HG.run = false; HG.built = false; }

/* ružica okolo lietadla: sever je hore, čiarka každých 10°, číslo každých 30° */
function hgRoseSVG() {
  let rose = '';
  for (let a = 0; a < 360; a += 10) {
    const r1 = a % 30 === 0 ? 52 : 57, s = Math.sin(a * Math.PI / 180), c = -Math.cos(a * Math.PI / 180);
    rose += `<line x1="${(r1 * s).toFixed(1)}" y1="${(r1 * c).toFixed(1)}" x2="${(62 * s).toFixed(1)}" y2="${(62 * c).toFixed(1)}"></line>`;
    if (a % 30 === 0) rose += `<text x="${(74 * s).toFixed(1)}" y="${(74 * c + 3).toFixed(1)}">${hgPad(a)}</text>`;
  }
  return rose;
}

/* ------------------------------------------------------------
   STATICKÝ REŽIM
   Lietadlo stojí na mieste, niekde na Slovensku je bod. Napíšeš
   kurz, ktorý na bod vedie; lietadlo sa naň natočí a ukáže sa,
   či to sedí. Kurzy sú len násobky 5 (230, 235…), nikdy 232.
   ĽAHKÁ: uzná sa aj susedný kurz (±5°). HARDCORE: len presný kurz.
   ------------------------------------------------------------ */
const HS = {};
/* Správny kurz je VŽDY násobok 5: najprv sa vyžrebuje kurz (005…360),
   potom vzdialenosť, a bod sa položí presne v tom smere od lietadla. */
function hsNew() {
  for (let i = 0; i < 2000; i++) {
    const ax = 60 + Math.random() * 880, ay = 40 + Math.random() * 450;
    if (!hgInside(ax, ay)) continue;
    const brg = 5 * (1 + Math.floor(Math.random() * 72)), d = 160 + Math.random() * 380, a = brg * Math.PI / 180;
    const tx = ax + Math.sin(a) * d, ty = ay - Math.cos(a) * d;
    if (tx < 30 || ty < 25 || tx > 970 || ty > 510 || !hgInside(tx, ty)) continue;
    Object.assign(HS, { ax, ay, tx, ty, brg, done: false });
    return;
  }
  Object.assign(HS, { ax: 300, ay: 300, tx: 600, ty: 300, brg: 90, done: false });
}
function hsRender(card) {
  const F = state.filters, P = MAP_PROJ, hard = F.hgDiff === 'hard';
  hsNew();
  document.getElementById('qnum').textContent = state.correct + state.wrong + 1;
  document.getElementById('qtotal').textContent = '∞';
  card.innerHTML = `
    <div class="qmeta">HRA NA KURZY <span class="sep">·</span> STATICKÝ REŽIM <span class="sep">·</span> ${hard ? 'HARDCORE' : 'ĽAHKÁ'}</div>
    <div class="map-wrap"><svg viewBox="0 0 ${P.w} ${P.h.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" id="map-svg">
      <rect x="0" y="0" width="${P.w}" height="${P.h.toFixed(0)}" fill="#fbfdfc"></rect>
      <path d="${mapBaseParts().firPath}" fill="#eef6f0" stroke="var(--border-bright)" stroke-width="1.5"></path>
      ${mapBaseParts().cities}
      <g id="hs-lines"></g>
      <circle class="hg-zone" cx="${HS.tx.toFixed(1)}" cy="${HS.ty.toFixed(1)}" r="13"></circle>
      <circle class="hg-post" cx="${HS.tx.toFixed(1)}" cy="${HS.ty.toFixed(1)}" r="6"></circle>
      <g id="hg-ac" transform="translate(${HS.ax.toFixed(1)},${HS.ay.toFixed(1)})">
        <g class="hg-rose" style="${F.hgRose === 'on' ? '' : 'display:none'}"><circle r="62"></circle>${hgRoseSVG()}</g>
        <g id="hg-rot" style="transition:transform 0.35s ease"><path class="hg-plane" d="M0,-12 L8,10 L0,5 L-8,10 Z"></path></g>
      </g>
    </svg></div>
    <div class="hg-task"><span>ÚLOHA</span><strong>Aký kurz vedie od lietadla na oranžový bod?</strong></div>
    <div class="input-row">
      <input type="text" id="hg-in" inputmode="numeric" maxlength="3" placeholder="KURZ PO 5° (napr. 045)" autocomplete="off">
      <button class="btn" id="hg-go">POTVRDIŤ ▶</button>
    </div>
    <div class="hg-msg" id="hg-msg">${hard ? 'HARDCORE: napíš kurz po 5°. Uzná sa len presný kurz.' : 'Napíš kurz po 5°. Uzná sa aj kurz o 5° vedľa.'}</div>
    <div class="hg-hdgs" id="hs-res" style="display:none">
      <div><span>TVOJ KURZ</span><b id="hs-you" class="set">—</b></div>
      <div><span>SPRÁVNY KURZ</span><b id="hs-true">—</b></div>
    </div>
    <div class="hg-btns"><button class="btn" id="hs-next" style="display:none">ĎALŠÍ ▶</button></div>
  `;
  HG.built = true;
  const inp = document.getElementById('hg-in');
  inp.focus();
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (HS.done) hsRender(card); else hsAnswer(); } });
  document.getElementById('hg-go').onclick = hsAnswer;
  document.getElementById('hs-next').onclick = () => hsRender(card);
}
function hsAnswer() {
  if (HS.done) return;
  const F = state.filters, hard = F.hgDiff === 'hard';
  const inp = document.getElementById('hg-in'), raw = inp.value.trim(), n = Number(raw);
  if (!raw) return;
  if (/^\d{1,2}$/.test(raw)) { hgMsg(`Kurz píš trojciferne: ${raw.padStart(3, '0')}, nie ${Number(raw)}. Doplň nuly vpredu.`, 'no'); return; }
  if (!/^\d{3}$/.test(raw) || n > 360 || n < 1) { hgMsg(`„${raw}“ nie je kurz. Zadaj trojciferné číslo 001 až 360.`, 'no'); inp.value = ''; return; }
  if (n % 5 !== 0) { hgMsg(`${hgPad(n)} nie je po 5°. Skús ${hgPad(Math.floor(n / 5) * 5)} alebo ${hgPad(Math.ceil(n / 5) * 5)}.`, 'no'); inp.value = ''; return; }
  const you = hgNorm(n), err = Math.abs(hgDiff(you, HS.brg)), ok = err <= HS_TOL[F.hgDiff] + 0.5;
  HS.done = true;
  if (ok) { state.correct++; state.streak++; if (state.streak > state.bestStreak) state.bestStreak = state.streak; }
  else { state.wrong++; state.streak = 0; }
  renderStats();
  /* lietadlo sa natočí na zadaný kurz; plná čiara = tvoj kurz, prerušovaná = správny */
  document.getElementById('hg-rot').setAttribute('transform', `rotate(${you})`);
  const L = 1200, a = you * Math.PI / 180;
  document.getElementById('hs-lines').innerHTML =
    `<line class="hs-true" x1="${HS.ax.toFixed(1)}" y1="${HS.ay.toFixed(1)}" x2="${HS.tx.toFixed(1)}" y2="${HS.ty.toFixed(1)}"></line>
     <line class="hs-you ${ok ? 'ok' : 'no'}" x1="${HS.ax.toFixed(1)}" y1="${HS.ay.toFixed(1)}" x2="${(HS.ax + Math.sin(a) * L).toFixed(1)}" y2="${(HS.ay - Math.cos(a) * L).toFixed(1)}"></line>`;
  document.getElementById('hs-res').style.display = '';
  document.getElementById('hs-you').textContent = hgPad(you);
  document.getElementById('hs-true').textContent = hgPad(HS.brg);
  const e = Math.round(err);
  hgMsg(ok ? `✓ SPRÁVNE — ${e === 0 ? 'presne na bod' : 'vedľa len o ' + e + '°'}. Enter = ďalší.`
           : `✗ ZLE — si vedľa o ${e}°. Správny kurz je ${hgPad(HS.brg)}. Enter = ďalší.`, ok ? 'ok' : 'no');
  inp.value = '';
  document.getElementById('hs-next').style.display = '';
  document.getElementById('hg-go').disabled = true;
}

function renderHeadingGame(card) {
  const F = state.filters;
  hgReset();
  document.getElementById('mode-label').textContent = 'HRA NA KURZY';
  if (F.hgMode === 'calc') { hcRender(card); return; }
  if (F.hgMode === 'static') { hsRender(card); return; }
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = F.hgKind === 'gate' ? 'bránky' : F.hgKind === 'fra' ? 'body FRA' : 'miesta';
  document.getElementById('mode-label').textContent = 'HRA NA KURZY';
  const P = MAP_PROJ;

  /* miesta na mape: v režime bránok len orientačné mestá, inak všetky ciele */
  let places = '';
  if (F.hgKind === 'gate') places = mapBaseParts().cities;
  else places = hgPlaces().map(p => `<g class="hg-pl" data-n="${p.name}">
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4"></circle>
      ${F.hgNames === 'on' ? `<text x="${(p.x + 7).toFixed(1)}" y="${(p.y - 6).toFixed(1)}">${p.name}</text>` : ''}
    </g>`).join('');
  const rose = hgRoseSVG();

  card.innerHTML = `
    <div class="qmeta">HRA NA KURZY <span class="sep">·</span> POHYBLIVÝ REŽIM <span class="sep">·</span> ${F.hgKind === 'gate' ? 'BRÁNKY' : F.hgKind === 'fra' ? 'BODY FRA' : 'MIESTA'} <span class="sep">·</span> ${F.hgDiff === 'hard' ? 'HARDCORE' : 'ĽAHKÁ'}</div>
    <div class="map-wrap"><svg viewBox="0 0 ${P.w} ${P.h.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" id="map-svg">
      <rect x="0" y="0" width="${P.w}" height="${P.h.toFixed(0)}" fill="#fbfdfc"></rect>
      <path d="${mapBaseParts().firPath}" fill="#eef6f0" stroke="var(--border-bright)" stroke-width="1.5"></path>
      ${places}
      <g id="hg-tgt"></g>
      <polyline id="hg-trail" class="hg-trail" points=""></polyline>
      <g id="hg-ac">
        <g class="hg-rose" style="${F.hgRose === 'on' ? '' : 'display:none'}"><circle r="62"></circle>${rose}</g>
        <line id="hg-setv" class="hg-setv" x1="0" y1="0" x2="0" y2="-62"></line>
        <g id="hg-rot"><line class="hg-vec" x1="0" y1="0" x2="0" y2="-46"></line><path class="hg-plane" d="M0,-12 L8,10 L0,5 L-8,10 Z"></path></g>
      </g>
    </svg></div>
    <div class="hg-task"><span>CIEĽ</span><strong id="hg-name">—</strong></div>
    <div class="hg-hdgs">
      <div><span>LETÍ KURZOM</span><b id="hg-cur">090</b></div>
      <div><span>ZADANÝ KURZ</span><b id="hg-set" class="set">090</b></div>
    </div>
    <div class="input-row">
      <input type="text" id="hg-in" inputmode="numeric" maxlength="3" placeholder="KURZ PO 5° (napr. 045)" autocomplete="off">
      <button class="btn" id="hg-go">TOČ ▶</button>
    </div>
    <div class="hg-msg" id="hg-msg">Napíš kurz a stlač Enter — lietadlo vyštartuje.</div>
    <div class="hg-stats">
      <div><span>ZÁSAHY</span><b id="hg-hits">0</b></div>
      <div><span>POVELY</span><b id="hg-cmds">0</b></div>
      <div><span>POVELY / ZÁSAH</span><b id="hg-avg">—</b></div>
      <div><span>ČAS</span><b id="hg-time">0:00</b></div>
    </div>
    <div class="hg-btns">
      <button class="btn ghost" id="hg-pause">⏸ PAUZA</button>
      <button class="btn-hint" id="hg-hint">? SMER NA CIEĽ</button>
    </div>
  `;
  HG.built = true;
  hgNewTarget();
  hgPaint();
  const inp = document.getElementById('hg-in');
  inp.focus();
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') hgCommand(); });
  document.getElementById('hg-go').onclick = hgCommand;
  document.getElementById('hg-pause').onclick = () => { if (HG.run) hgPause(); else hgRun(); inp.focus(); };
  document.getElementById('hg-hint').onclick = () => {
    HG.hintUsed = true;
    const b = Math.round(hgBearing(HG.x, HG.y, HG.target.x, HG.target.y) / 5) * 5;
    hgMsg(`Smer na cieľ je teraz približne ${hgPad(b)}°.`, 'hint');
    inp.focus();
  };
}

function hgMsg(t, cls) {
  const el = document.getElementById('hg-msg');
  if (el) { el.textContent = t; el.className = 'hg-msg ' + (cls || ''); }
}
function hgCommand() {
  const inp = document.getElementById('hg-in');
  const raw = inp.value.trim();
  inp.value = '';
  if (!raw) { if (!HG.run) hgRun(); return; }
  const n = Number(raw);
  if (/^\d{1,2}$/.test(raw)) { hgMsg(`Kurz píš trojciferne: ${raw.padStart(3, '0')}, nie ${Number(raw)}. Doplň nuly vpredu.`, 'no'); return; }
  if (!/^\d{3}$/.test(raw) || n > 360 || n < 5) { hgMsg(`„${raw}“ nie je kurz. Zadaj trojciferné číslo 005 až 360.`, 'no'); return; }
  if (n % 5 !== 0) { hgMsg(`${hgPad(n)} nie je po 5°. Skús ${hgPad(Math.floor(n / 5) * 5)} alebo ${hgPad(Math.ceil(n / 5) * 5)}.`, 'no'); return; }
  HG.set = hgNorm(n);
  HG.delay = HG_DELAY;
  HG.cmds++;
  const d = hgDiff(HG.hdg, HG.set);
  hgMsg(Math.abs(d) < 1 ? `Kurz ${hgPad(HG.set)} — letíš ním.` : `Točím ${d > 0 ? 'doprava' : 'doľava'} na kurz ${hgPad(HG.set)} (o ${Math.abs(Math.round(d))}°).`, 'ok');
  if (!HG.run) hgRun();
}
function hgRun() {
  if (HG.run || !HG.built) return;
  HG.run = true; HG.last = 0;
  const b = document.getElementById('hg-pause'); if (b) b.textContent = '⏸ PAUZA';
  HG.raf = requestAnimationFrame(hgTick);
}
function hgPause() {
  HG.run = false; cancelAnimationFrame(HG.raf);
  const b = document.getElementById('hg-pause'); if (b) b.textContent = '▶ POKRAČOVAŤ';
}
function hgTick(ts) {
  if (!HG.run) return;
  /* panel zmizol (iný modul) — slučka sa sama zastaví */
  if (!document.getElementById('hg-ac')) { hgStop(); return; }
  const dt = HG.last ? Math.min(0.1, (ts - HG.last) / 1000) : 0;
  HG.last = ts;
  hgStep(dt);
  hgPaint();
  HG.raf = requestAnimationFrame(hgTick);
}
function hgStep(dt) {
  HG.t += dt;
  /* zatáčka: najprv oneskorenie, potom plynulo kratšou stranou */
  if (HG.delay > 0) HG.delay -= dt;
  else {
    const d = hgDiff(HG.hdg, HG.set), step = HG_TURN * dt;
    HG.hdg = Math.abs(d) <= step ? HG.set : hgNorm(HG.hdg + Math.sign(d) * step);
  }
  const v = HG_SPEED[state.filters.hgDiff] * dt, a = HG.hdg * Math.PI / 180;
  HG.x += Math.sin(a) * v; HG.y -= Math.cos(a) * v;
  if (!HG.trail.length || Math.hypot(HG.x - HG.trail[HG.trail.length - 1][0], HG.y - HG.trail[HG.trail.length - 1][1]) > 6) {
    HG.trail.push([HG.x, HG.y]);
    if (HG.trail.length > 140) HG.trail.shift();
  }
  /* zásah */
  const T = HG.target;
  if (T && Math.hypot(HG.x - T.x, HG.y - T.y) <= T.r) {
    HG.hits++; state.correct++; state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
    hgMsg(`✓ ${T.name} — zásah. Ďalší cieľ je na mape.`, 'ok');
    hgNewTarget();
    renderStats();
  }
  /* vyletel z mapy: počíta sa ako chyba a lietadlo sa samo otočí späť */
  const P = MAP_PROJ, outside = HG.x < 0 || HG.y < 0 || HG.x > P.w || HG.y > P.h;
  if (outside && !HG.out) {
    HG.out = true; state.wrong++; state.streak = 0;
    HG.set = Math.round(hgBearing(HG.x, HG.y, P.w / 2, P.h / 2) / 5) * 5; HG.delay = 0;
    hgMsg(`✗ Vyletel si z mapy — otáčam späť na kurz ${hgPad(HG.set)}.`, 'no');
    renderStats();
  }
  if (!outside) HG.out = false;
}
function hgPaint() {
  const ac = document.getElementById('hg-ac');
  if (!ac) return;
  ac.setAttribute('transform', `translate(${HG.x.toFixed(1)},${HG.y.toFixed(1)})`);
  document.getElementById('hg-rot').setAttribute('transform', `rotate(${HG.hdg.toFixed(1)})`);
  const sv = document.getElementById('hg-setv');
  sv.setAttribute('transform', `rotate(${HG.set})`);
  sv.style.display = Math.abs(hgDiff(HG.hdg, HG.set)) < 1 ? 'none' : '';
  document.getElementById('hg-trail').setAttribute('points', HG.trail.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '));
  document.getElementById('hg-cur').textContent = hgPad(HG.hdg);
  document.getElementById('hg-set').textContent = hgPad(HG.set);
  document.getElementById('hg-hits').textContent = HG.hits;
  document.getElementById('hg-cmds').textContent = HG.cmds;
  document.getElementById('hg-avg').textContent = HG.hits ? (HG.cmds / HG.hits).toFixed(1) : '—';
  const s = Math.floor(HG.t);
  document.getElementById('hg-time').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
function hgDrawTarget() {
  const g = document.getElementById('hg-tgt'), T = HG.target, F = state.filters;
  if (!g || !T) return;
  document.getElementById('hg-name').textContent = F.hgKind === 'gate' ? T.name : 'PRELEŤ NAD: ' + T.name;
  document.querySelectorAll('.hg-pl.on').forEach(el => el.classList.remove('on'));
  if (F.hgKind === 'gate') {
    const a = T.ang * Math.PI / 180, dx = Math.sin(a) * T.r, dy = -Math.cos(a) * T.r;
    g.innerHTML = `<circle class="hg-zone" cx="${T.x.toFixed(1)}" cy="${T.y.toFixed(1)}" r="${T.r}"></circle>
      <line class="hg-gate" x1="${(T.x - dx).toFixed(1)}" y1="${(T.y - dy).toFixed(1)}" x2="${(T.x + dx).toFixed(1)}" y2="${(T.y + dy).toFixed(1)}"></line>
      <circle class="hg-post" cx="${(T.x - dx).toFixed(1)}" cy="${(T.y - dy).toFixed(1)}" r="5"></circle>
      <circle class="hg-post" cx="${(T.x + dx).toFixed(1)}" cy="${(T.y + dy).toFixed(1)}" r="5"></circle>`;
  } else if (F.hgNames === 'on') {
    /* s názvami na mape sa cieľ zvýrazní; bez názvov ho musíš nájsť sám */
    g.innerHTML = `<circle class="hg-zone" cx="${T.x.toFixed(1)}" cy="${T.y.toFixed(1)}" r="${T.r}"></circle>`;
    const el = [...document.querySelectorAll('.hg-pl')].find(x => x.dataset.n === T.name);
    if (el) el.classList.add('on');
  } else g.innerHTML = '';
}
