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

document.querySelectorAll('.tab').forEach(t => { t.onclick = () => startMode(t.dataset.mode); });
document.getElementById('acct-btn').onclick = () => startMode('profile');
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
  state.streak = 0;
  renderStats(); renderWeak();
  nextQuestion();
};
document.getElementById('btn-reset').onclick = () => startMode(state.mode);
