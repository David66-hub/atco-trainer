/* ============================================================
   REVEAL - full info panel after submit
   ============================================================ */
function renderReveal(q) {
  if (q.type === 'acpair') return acPairReveal(q);
  if (q.type === 'coord') return coReveal(q);
  if (q.type === 'prefix') return `<div class="reveal">${airportStudyDetail(q.data)}</div>`;
  let header = '', grid = '', extra = '';

  if (q.type === 'aircraft') {
    const a = q.data;
    header = `
      <div class="reveal-title">${a.icao} — ${a.name}</div>
      <div class="reveal-sub">${a.mfr.toUpperCase()} <span style="color:var(--text-faint)">·</span> ${a.role.toUpperCase()}</div>
    `;
    grid = `
      <div class="item"><span class="item-label">WAKE TURB</span><span class="item-val"><strong>${a.wake}</strong></span></div>
      <div class="item"><span class="item-label">ENGINES</span><span class="item-val">${a.engines}</span></div>
      <div class="item"><span class="item-label">CRUISE</span><span class="item-val"><strong>${a.cruise}</strong></span></div>
      <div class="item"><span class="item-label">MMO / VMO</span><span class="item-val">${a.mmo}</span></div>
      <div class="item"><span class="item-label">VNE</span><span class="item-val">${a.vne}</span></div>
      <div class="item"><span class="item-label">STALL (clean)</span><span class="item-val">${a.stall}</span></div>
      <div class="item"><span class="item-label">CEILING</span><span class="item-val"><strong>${a.ceiling}</strong></span></div>
      <div class="item"><span class="item-label">MTOW</span><span class="item-val">${a.mtow}</span></div>
      <div class="item"><span class="item-label">LENGTH</span><span class="item-val">${a.length}</span></div>
      <div class="item"><span class="item-label">WINGSPAN</span><span class="item-val">${a.wingspan}</span></div>
      <div class="item"><span class="item-label">RANGE</span><span class="item-val">${a.range}</span></div>
      <div class="item"><span class="item-label">CAPACITY</span><span class="item-val">${a.pax}</span></div>
    `;
    extra = `<div class="reveal-ops"><strong>OPERATORS</strong>${a.operators}</div>`;
  }

  if (q.type === 'airport') {
    const ap = q.data;
    header = `
      <div class="reveal-title">${ap.icao} — ${ap.city}</div>
      <div class="reveal-sub">${ap.name.toUpperCase()} <span style="color:var(--text-faint)">·</span> ${ap.country}</div>
    `;
    grid = `
      <div class="item"><span class="item-label">ICAO</span><span class="item-val"><strong>${ap.icao}</strong></span></div>
      <div class="item"><span class="item-label">CITY</span><span class="item-val">${ap.city}</span></div>
      <div class="item"><span class="item-label">COUNTRY</span><span class="item-val">${ap.country}</span></div>
      <div class="item"><span class="item-label">FACILITY</span><span class="item-val">${ap.name}</span></div>
    `;
    if (ap.region || ap.hint) extra = `<div class="reveal-ops"><strong>NOTE</strong>${ap.region ? ap.region + ' — ' : ''}${ap.hint || ''}</div>`;
    extra += icaoBreakdownHTML(ap);
  }

  if (q.type === 'callsign') {
    const cs = q.data;
    header = `
      <div class="reveal-title">${cs.icao} — "${cs.call}"</div>
      <div class="reveal-sub">${cs.airline
        ? `${cs.airline.toUpperCase()} <span style="color:var(--text-faint)">·</span> ${cs.country}${cs.type ? ' · ' + cs.type.toUpperCase() : ''}`
        : 'VOLACIA ZNAČKA PODĽA DOKUMENTU'}</div>
    `;
    grid = `
      <div class="item"><span class="item-label">ICAO 3LTR</span><span class="item-val"><strong>${cs.icao}</strong></span></div>
      <div class="item"><span class="item-label">CALLSIGN</span><span class="item-val"><strong>"${csHighlight(cs)}"</strong></span></div>
      <div class="item"><span class="item-label">NA SIMULÁTORE</span><span class="item-val">${cs.sim ? `<strong>${cs.freq}×</strong> v tabuľke` : 'nie je v tabuľke (váha 1)'}</span></div>
      <div class="item"><span class="item-label">POMÔCKA</span><span class="item-val">${cs.logical ? 'písmená kódu sú vo volačke (podčiarknuté)' : 'kód sa z volačky nedá vyčítať — treba ho vedieť'}</span></div>
    `;
    if (cs.airline) grid += `
      <div class="item"><span class="item-label">AIRLINE</span><span class="item-val">${cs.airline}</span></div>
      <div class="item"><span class="item-label">COUNTRY</span><span class="item-val">${cs.country}</span></div>
      ${cs.type ? `<div class="item"><span class="item-label">TYPE</span><span class="item-val">${cs.type}</span></div>` : ''}
    `;
    extra = csPhotoSlot(cs);
    if (cs.hint) extra += `<div class="reveal-ops"><strong>NOTE</strong>${cs.hint}</div>`;
    /* duplicity z dokumentu — nech je vidieť, že platí viac odpovedí */
    if (q.group && q.group.length > 1) {
      extra += q.subtype === 'icao-to-call'
        ? `<div class="reveal-ops"><strong>V DOKUMENTE MÁ TENTO KÓD VIAC VOLAČIEK</strong>${q.group.map(c => '"' + c.call + '"').join(' · ')}</div>`
        : `<div class="reveal-ops"><strong>TÚTO VOLAČKU MAJÚ V DOKUMENTE VIACERÉ KÓDY</strong>${q.group.map(c => c.icao).join(' · ')}</div>`;
    }
  }

  return `<div class="reveal">${header}<div class="reveal-grid">${grid}</div>${extra}</div>`;
}

/* ============================================================
   SUBMIT FLOW
   ============================================================ */
function submitAnswer() {
  const input = document.getElementById('answer');
  if (!input || input.disabled) return;
  const val = input.value;
  if (!val.trim()) return;

  const q = state.current;
  /* q.exact: čísla (frekvencie, hladiny) sa neposudzujú s toleranciou preklepov */
  const ok = q.exact ? q.accept.some(a => normalize(a) === normalize(val)) : (matches(val, q.accept) && !callsignClash(val, q));
  const fb = document.getElementById('feedback');
  if (state.mode === 'exam' && state.exam) { examRecord(q, ok, val.toUpperCase()); return; }

  if (ok) {
    state.correct++;
    state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  } else {
    state.wrong++;
    state.streak = 0;
    state.mistakes[q.id] = (state.mistakes[q.id] || 0) + 1;
    wkLog(q, val);
  }
  renderStats();
  renderWeak();

  input.disabled = true;
  if (q.type === 'coord' || q.type === 'aircraft' || q.type === 'airport' || q.type === 'prefix' || q.type === 'callsign') apAfterAnswer(q, ok);
  const sb = document.getElementById('submit-btn');
  sb.disabled = true; sb.style.opacity = '0.4';
  const hb = document.getElementById('btn-hint'); if (hb) hb.disabled = true;

  let bannerText;
  if (ok) bannerText = `✓ <strong>CORRECT</strong>`;
  else bannerText = `✗ <strong>WRONG</strong> · YOUR ANSWER: <span class="answer">${val.toUpperCase()}</span>`;

  fb.className = 'feedback show ' + (ok ? 'ok' : 'no');
  fb.innerHTML = `
    <div class="feedback-banner">
      <span>${bannerText}</span>
      <button class="btn" id="next-btn">NEXT ▶</button>
    </div>
    ${renderReveal(q)}
  `;

  setTimeout(() => {
    const nb = document.getElementById('next-btn');
    if (nb) { nb.focus(); nb.onclick = nextQuestion; }
    document.addEventListener('keydown', onEnterNext, { once: true });
  }, 50);
}

function onEnterNext(e) {
  if (e.key === 'Enter') { e.preventDefault(); nextQuestion(); }
}

function nextQuestion() {
  state.index++;
  state.current = state.queue[state.index] || null;
  renderQuestion();
}

/* lišta modulov na telefóne: aktívna karta do stredu a stmavený okraj tam, kde lišta pokračuje */
/* ---------- OKNO MODULOV (v4.9): všetky cvičenia na jednom mieste, v lište ostávajú len štyri tlačidlá ---------- */
const MODS_LIST = [['daily', 'DNES', 'Dnešný tréning', 'Namiešané otázky zo všetkých modulov podľa toho, čo máš opakovať.', 'calendar'],
  ['aircraft', 'MOD 01', 'Typy lietadiel', 'Spoznaj lietadlo podľa fotky.', 'photo'], ['airport', 'MOD 02', 'Letiská a ICAO kódy', 'Kódy, mestá, mapa a prefixy štátov.', 'map'],
  ['callsign', 'MOD 03', 'Volacie znaky', 'Kód prevádzkovateľa ↔ volačka.', 'cards'], ['waypoint', 'MOD 04', 'Body FRA na mape', 'Význačné body FIR Bratislava.', 'blind'],
  ['heading', 'MOD 05', 'Hra na kurzy', 'Navádzaj lietadlo kurzami.', 'compass'], ['coord', 'MOD 06', 'Koordinácia', 'Body, hladiny a frekvencie susedov.', 'radio']];
function modsClose() { const w = document.getElementById('mods-wrap'); if (w) { w.classList.add('out'); setTimeout(() => w.remove(), 180); } document.removeEventListener('keydown', modsKey, true); }
function modsKey(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); modsClose(); } }
function modsOpen() {
  if (document.getElementById('mods-wrap')) return modsClose();
  const w = document.createElement('div'); w.id = 'mods-wrap';
  w.innerHTML = `<div class="mods" role="dialog" aria-label="Moduly">
      <div class="mods-top"><div><small>CVIČENIE</small><b>Vyber si modul</b></div><button data-m="x" title="Zavrieť">✕</button></div>
      <div class="mods-grid">${MODS_LIST.map((m, i) => { let pr = null; try { if (m[0] !== 'daily' && m[0] !== 'heading') pr = modProgress(m[0]); } catch (e) {}
        return `<button class="mods-card${m[0] === 'daily' ? ' wide' : ''}${state.mode === m[0] ? ' on' : ''}" data-m="${m[0]}" style="animation-delay:${(i * 0.045).toFixed(2)}s">
          ${hpG(m[4])}<div><small>${m[1]}</small><b>${m[2]}</b><span>${m[3]}</span>${pr && pr.total ? `<i><em style="width:${Math.round(pr.done / pr.total * 100)}%"></em></i><u>naučené ${pr.done} / ${pr.total}${pr.due ? ' · dnes na opakovanie ' + pr.due : ''}</u>` : ''}</div></button>`; }).join('')}</div>
    </div>`;
  w.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-m]'); if (e.target === w || (b && b.dataset.m === 'x')) return modsClose(); if (b) { modsClose(); startMode(b.dataset.m); window.scrollTo(0, 0); } });
  document.body.appendChild(w);
  document.addEventListener('keydown', modsKey, true);
}
function navSync() {
  const m = state.mode, it = MODS_LIST.find(x => x[0] === m), b = document.getElementById('nav-mods'), l = document.getElementById('nav-mods-l');
  if (b) b.classList.toggle('active', !!it);
  if (l) l.textContent = it ? it[1] + ' · ' + it[2].toUpperCase() + ' ▾' : 'MODULY ▾';
  const h = document.getElementById('brand-home'); if (h) h.classList.toggle('on', m === 'home');
}
function tabsSync(keep) {
  navSync();
  const T = document.querySelector('.tabs'); if (!T) return;
  if (!keep) { const a = T.querySelector('.tab.active'); if (a && T.scrollWidth > T.clientWidth + 4) T.scrollLeft = Math.max(0, a.offsetLeft - T.offsetLeft - (T.clientWidth - a.offsetWidth) / 2); }
  const more = T.scrollWidth > T.clientWidth + 4;
  T.classList.toggle('more-r', more && T.scrollLeft + T.clientWidth < T.scrollWidth - 6);
  T.classList.toggle('more-l', more && T.scrollLeft > 6);
}
document.querySelector('.tabs').addEventListener('scroll', () => tabsSync(true), { passive: true });
window.addEventListener('resize', () => tabsSync(true));
/* ---------- LUPA NA MAPÁCH (v4.8) ----------
   Každá mapa v otázke dostane tlačidlá 🔍+ / 🔍− / ⤢. Priblížená mapa sa posúva ťahaním; na dotykovej obrazovke
   funguje aj štipnutie dvoma prstami, na trackpade ctrl + koliesko. Klik po ťahaní sa nepočíta ako odpoveď. */
function mzAttach() {
  document.querySelectorAll('#qcard .map-wrap').forEach(wrap => {
    const svg = wrap.querySelector('svg'); if (!svg || svg.dataset.mz || !svg.viewBox || !svg.viewBox.baseVal || !svg.viewBox.baseVal.width) return;
    svg.dataset.mz = '1';
    const b0 = svg.viewBox.baseVal, B = { x: b0.x, y: b0.y, w: b0.width, h: b0.height }; let V = Object.assign({}, B), drag = null, moved = false; const pts = {};
    const apply = () => { svg.setAttribute('viewBox', `${V.x.toFixed(2)} ${V.y.toFixed(2)} ${V.w.toFixed(2)} ${V.h.toFixed(2)}`); wrap.classList.toggle('mz-in', V.w < B.w - 0.5); };
    const clamp = () => { V.w = Math.max(B.w / 8, Math.min(B.w, V.w)); V.h = V.w * B.h / B.w; V.x = Math.max(B.x, Math.min(B.x + B.w - V.w, V.x)); V.y = Math.max(B.y, Math.min(B.y + B.h - V.h, V.y)); };
    const zoom = (f, cx, cy) => { if (cx == null) { cx = V.x + V.w / 2; cy = V.y + V.h / 2; } const nw = Math.max(B.w / 8, Math.min(B.w, V.w * f)); V.x = cx - (cx - V.x) * nw / V.w; V.y = cy - (cy - V.y) * nw / V.w; V.w = nw; clamp(); apply(); };
    const at = e => { const m = svg.getScreenCTM(); return m ? { x: (e.clientX - m.e) / m.a, y: (e.clientY - m.f) / m.d } : null; };
    const bar = document.createElement('div'); bar.className = 'mz-bar';
    bar.innerHTML = '<button data-mz="in" title="Priblížiť">🔍+</button><button data-mz="out" title="Oddialiť">🔍−</button><button data-mz="all" title="Celá mapa">⤢</button>';
    bar.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; e.stopPropagation(); if (b.dataset.mz === 'in') zoom(0.6); else if (b.dataset.mz === 'out') zoom(1 / 0.6); else { V = Object.assign({}, B); apply(); } });
    wrap.appendChild(bar);
    svg.addEventListener('wheel', e => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); const p = at(e); zoom(Math.exp(Math.max(-60, Math.min(60, e.deltaY)) * 0.012), p && p.x, p && p.y); }, { passive: false });
    svg.addEventListener('pointerdown', e => { pts[e.pointerId] = { x: e.clientX, y: e.clientY }; moved = false; if (Object.keys(pts).length === 1 && V.w < B.w - 0.5) drag = { x: e.clientX, y: e.clientY, v: Object.assign({}, V) }; });
    svg.addEventListener('pointermove', e => {
      if (!pts[e.pointerId]) return;
      const ids = Object.keys(pts);
      if (ids.length === 2) {
        const o = pts[ids[0] === String(e.pointerId) ? ids[1] : ids[0]], d0 = Math.hypot(pts[e.pointerId].x - o.x, pts[e.pointerId].y - o.y), d1 = Math.hypot(e.clientX - o.x, e.clientY - o.y);
        pts[e.pointerId] = { x: e.clientX, y: e.clientY };
        if (d0 > 8 && d1 > 8) { moved = true; drag = null; const m = svg.getScreenCTM(); if (m) zoom(d0 / d1, ((e.clientX + o.x) / 2 - m.e) / m.a, ((e.clientY + o.y) / 2 - m.f) / m.d); }
        return;
      }
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y, m = svg.getScreenCTM();
      if (Math.abs(dx) + Math.abs(dy) > 7) moved = true;
      if (!moved || !m) return;
      V.x = drag.v.x - dx / m.a; V.y = drag.v.y - dy / m.d; clamp(); apply();
    });
    const up = e => { delete pts[e.pointerId]; drag = null; };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up); svg.addEventListener('pointerleave', up);
    svg.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  });
}
new MutationObserver(() => mzAttach()).observe(document.getElementById('qcard'), { childList: true, subtree: true });
function startMode(mode) {
  rkSample();
  examStop();
  if (typeof hgStop === 'function') hgStop();   // hra z MOD 05 nesmie bežať na pozadí
  state.mode = mode;
  state.queue = buildQueue();
  state.index = 0;
  state.total = state.queue.length;
  state.correct = 0; state.wrong = 0;
  state.streak = 0; state.bestStreak = 0;
  state.current = state.queue[0] || null;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });
  renderFilters();
  renderStats();
  renderQuestion();
  tabsSync();
}

/* CLOCK */
function tickClock() {
  const d = new Date();
  const h = String(d.getUTCHours()).padStart(2,'0');
  const m = String(d.getUTCMinutes()).padStart(2,'0');
  const s = String(d.getUTCSeconds()).padStart(2,'0');
  document.getElementById('clock').textContent = `${h}:${m}:${s} UTC`;
}
setInterval(tickClock, 1000); tickClock();

document.querySelectorAll('.tab[data-mode]').forEach(t => { t.onclick = () => startMode(t.dataset.mode); });
document.getElementById('brand-home').onclick = () => { startMode('home'); window.scrollTo(0, 0); };
document.getElementById('nav-mods').onclick = () => modsOpen();
document.getElementById('acct-btn').onclick = () => { if (state.mode === 'profile' && RK.pfTab !== 'over') RK.pfTab = 'over'; startMode('profile'); };
document.getElementById('inbox-btn').onclick = () => { RK.pfTab = 'inbox'; startMode('profile'); socTick(true); };
if (RK.acct) { pfLoadMe(); socTick(true); }
rkHeadBtn();
document.getElementById('btn-skip').onclick = () => {
  if (state.mode === 'exam') { if (state.exam && state.current) examRecord(state.current, false, '— preskočené —'); return; }
  if (state.mode === 'heading' && state.filters.hgMode === 'static') { hsRender(document.getElementById('qcard')); return; }
  if (state.mode === 'heading' && state.filters.hgMode === 'calc') { hcRender(document.getElementById('qcard')); return; }
  if (state.mode === 'heading') { hgNewTarget(); hgMsg('Cieľ preskočený — nový je na mape.', 'hint'); document.getElementById('hg-in').focus(); return; }
  if (state.mode === 'airport' && state.filters.apMode === 'study') return;
  if (state.mode === 'callsign' && state.filters.csMode === 'list') return;
  if (state.mode === 'coord' && (state.filters.coMode === 'fill' || state.filters.coMode === 'study')) return;
  if (state.mode === 'waypoint' && (state.filters.wpMode === 'study' || state.filters.wpMode === 'blind')) return; // no skipping in study / blind map
  if (!state.current) return;
  state.mistakes[state.current.id] = (state.mistakes[state.current.id] || 0) + 1;
  wkLog(state.current, '— preskočené —');
  state.streak = 0;
  renderStats(); renderWeak();
  nextQuestion();
};
document.getElementById('btn-reset').onclick = () => startMode(state.mode);
