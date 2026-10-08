/* ============================================================
   RENDER QUESTION
   ============================================================ */
function renderQuestion() {
  const q = state.current;
  const card = document.getElementById('qcard');
  card.dataset.mode = state.mode;
  document.body.classList.toggle('on-home', state.mode === 'home');
  /* MOD 02 s mapou (aj ŠTÚDIUM): mapa vľavo, text vpravo — všetko na jednej obrazovke */
  const apm = state.filters.apMode;
  const com = state.filters.coMode;
  const split = state.mode === 'waypoint' || (state.mode === 'coord' && (com === 'study' || (!!q && (com === 'cop' || com === 'level' || com === 'scen')))) || state.mode === 'heading' || (state.mode === 'airport' && (apm === 'study' || (!!q && (apm === 'map' || apm === 'click'))));
  card.classList.toggle('split', split);
  document.querySelector('.app').classList.toggle('wide', split);
  fsSync();
  /* súťažné stránky — Dobyvateľ a rebríček */
  const comp = state.mode === 'conquer' || state.mode === 'rank' || state.mode === 'profile';
  rkHeadBtn();
  document.body.classList.toggle('on-comp', comp);
  if (state.mode !== 'conquer') dqHideStage();
  if (comp) {
    document.querySelector('.controls').style.display = 'none';
    document.getElementById('mode-label').textContent = state.mode === 'conquer' ? 'DOBYVATEĽ' : state.mode === 'profile' ? 'PROFIL' : 'REBRÍČEK';
    if (state.mode === 'conquer') { DQ.sig = ''; dqRender(card); } else if (state.mode === 'profile') { renderProfile(card); rkLoad(); } else { renderRank(card); rkLoad(); }
    return;
  }
  /* MOD 05 — hra na kurzy má vlastnú kartu a vlastnú slučku */
  if (state.mode === 'heading') { document.querySelector('.controls').style.display = ''; renderHeadingGame(card); return; }
  /* na úvode nie je čo nastavovať ani preskakovať */
  document.querySelector('.controls').style.display = state.mode === 'home' ? 'none' : '';
  if (state.mode === 'home') { document.getElementById('mode-label').textContent = 'ÚVOD'; renderHome(card); return; }
  document.body.classList.toggle('exam-on', state.mode === 'exam' && !!state.exam && !!q);
  if (state.mode === 'exam' && !state.exam) { renderExamStart(card); return; }
  if (state.mode === 'exam' && !q) { renderExamResult(card); return; }
  /* MOD 06 — doplňovačka a štúdium nemajú frontu otázok */
  if (state.mode === 'coord' && com === 'fill') { renderCoFill(card); return; }
  if (state.mode === 'coord' && com === 'study') { renderCoStudy(card); return; }
  document.getElementById('qnum').textContent = state.index + 1;
  document.getElementById('qtotal').textContent = state.total;
  document.getElementById('mode-label').textContent =
    state.mode === 'home' ? 'ÚVOD' : state.mode === 'daily' ? 'DNEŠNÝ TRÉNING' : state.mode === 'exam' ? 'SKÚŠKA' :
    state.mode === 'aircraft' ? 'AIRCRAFT TYPE' :
    state.mode === 'airport' ? 'AIRPORTS / ICAO' :
    state.mode === 'callsign' ? 'CALLSIGNS' : state.mode === 'coord' ? 'KOORDINÁCIA / FREKVENCIE' : 'FRA BODY / MAPA';
  state.hintsUsed = 0;

  /* MOD 03 ZOZNAM — čítanie a zakrývanie, bez otázok */
  if (state.mode === 'callsign' && state.filters.csMode === 'list') {
    renderCsList(card);
    return;
  }
  /* MOD 02 ŠTÚDIUM — oblasti ICAO na mape, bez otázok */
  if (state.mode === 'airport' && state.filters.apMode === 'study') {
    renderAirportStudy(card);
    return;
  }
  // STUDY / EXPLORE mode for waypoints — no question, just an interactive map
  if (state.mode === 'waypoint' && state.filters.wpMode === 'study') {
    renderWaypointStudy(card);
    return;
  }
  /* SLEPÁ MAPA — tiež bez fronty otázok: celý výber naraz. */
  if (state.mode === 'waypoint' && state.filters.wpMode === 'blind') {
    renderWaypointBlind(card);
    return;
  }

  if (!q) {
    if (state.mode === 'daily' && state.total) { state.dailyDone = dayNow(); apSaveProgress(); }
    const pct = Math.round((state.correct / Math.max(1,state.total)) * 100);
    card.innerHTML = `
      <div class="session-done">
        <h2>SESSION COMPLETE</h2>
        <p>Správne: ${state.correct} / ${state.total} · Najlepší streak: ${state.bestStreak}</p>
        <div class="score-big">${pct}%</div>
        <p style="margin-top:18px"><button class="btn" id="restart-btn">RESTART ▶</button></p>
      </div>`;
    document.getElementById('restart-btn').onclick = () => startMode(state.mode);
    return;
  }

  let body = '';
  let placeholder = '';

  /* MOD 02 — klik do mapy má vlastnú kartu bez inputu */
  if (q.click) { renderClickQuestion(q, card); return; }
  if (q.type === 'acpair') { renderAcPair(q, card); return; }
  if (q.type === 'coord' && q.sub === 'scen') { renderCoScen(q, card); return; }
  if (q.type === 'coord' && q.sub === 'click') { renderCoClick(q, card); return; }
  if (q.type === 'coord') { const cb = coBody(q); body = cb.body; placeholder = cb.placeholder; }
  /* MOD 03 — kartičky */
  if (q.type === 'callsign' && state.filters.csMode === 'cards') { renderCsCard(q, card); return; }

  if (q.type === 'aircraft') {
    const a = q.data;
    body = `
      <div class="qmeta">IDENT TYPE <span class="sep">·</span> ENTER ICAO TYPE DESIGNATOR <em style="color:var(--text-faint);font-style:normal">(e.g. B738)</em> OR COMMON NAME</div>
      <div class="aircraft-display">
        <div class="aircraft-photo" id="ac-photo">
          <div class="photo-loading">LOADING IMAGERY...</div>
        </div>
        <div class="aircraft-info-side">
          <div class="ac-target">
            <small>QUICK RECOGNITION DATA</small>
            ▼ UNKNOWN TRAFFIC
          </div>
          <div class="ac-row">
            <div class="ac-chip"><strong>WTC</strong>${a.wake}</div>
            <div class="ac-chip"><strong>ENG</strong>${a.enginesCount}</div>
            <div class="ac-chip"><strong>CRS</strong>${a.cruise}</div>
          </div>
          <div class="ac-row">
            <div class="ac-chip"><strong>ROLE</strong>${a.role}</div>
          </div>
        </div>
      </div>`;
    placeholder = 'TYPE DESIGNATOR OR NAME...';
  }

  if (q.type === 'airport') {
    /* režim MAPA: tá istá otázka, ale nad ňou svieti poloha letiska */
    const onMap = state.mode === 'airport' && state.filters.apMode === 'map';
    const map = onMap ? airportMapHTML(q.data) : '';
    const tag = onMap ? 'MAPA <span class="sep">·</span> ' : '';
    if (q.subtype === 'icao-to-city') {
      body = `<div class="qmeta">AIRPORT ID <span class="sep">·</span> ${tag}ICAO → CITY</div>
              ${map}
              <div class="big-prompt${onMap ? ' small' : ''}">${q.data.icao}</div>
              <div class="prompt-hint">— ${onMap ? 'KTORÉ MESTO SVIETI NA MAPE?' : 'WHICH CITY?'} —</div>`;
      placeholder = 'CITY NAME...';
    } else {
      body = `<div class="qmeta">AIRPORT ID <span class="sep">·</span> ${tag}CITY → ICAO</div>
              ${map}
              <div class="big-prompt small">${q.data.city}</div>
              <div class="prompt-hint">— ${apCityNote(q.data) || 'ICAO KÓD?'} —</div>`;
      placeholder = 'ICAO CODE (4 LETTERS)...';
    }
  }

  if (q.type === 'prefix') {
    const st = q.data;
    if (q.subtype === 'code-to-state') {
      body = `<div class="qmeta">ICAO PREFIX <span class="sep">·</span> KÓD → ŠTÁT</div>
              <div class="big-prompt">${st.p}</div>
              <div class="prompt-hint">— KTORÝ ŠTÁT MÁ TENTO PREFIX? —</div>`;
      placeholder = 'ŠTÁT...';
    } else {
      body = `<div class="qmeta">ICAO PREFIX <span class="sep">·</span> ŠTÁT → KÓD</div>
              <div class="big-prompt small">${pxAsk(st)}</div>
              <div class="prompt-hint">— PRVÉ DVE PÍSMENÁ INDIKÁTORA? —</div>`;
      placeholder = 'PREFIX (2 PÍSMENÁ)...';
    }
  }

  if (q.type === 'callsign') {
    if (q.subtype === 'icao-to-call') {
      body = `<div class="qmeta">OPERATOR CALL <span class="sep">·</span> ICAO → TELEPHONY</div>
              <div class="big-prompt">${q.data.icao}</div>
              <div class="prompt-hint">— RADIO CALLSIGN? —</div>`;
      placeholder = 'CALLSIGN (e.g. SPEEDBIRD)...';
    } else {
      body = `<div class="qmeta">OPERATOR CALL <span class="sep">·</span> TELEPHONY → ICAO</div>
              <div class="big-prompt small">"${q.data.call}"</div>
              <div class="prompt-hint">— ICAO 3-LETTER OPERATOR CODE? —</div>`;
      placeholder = 'ICAO 3-LETTER CODE...';
    }
  }

  if (q.type === 'waypoint') {
    if (q.subtype === 'name') renderWaypointNameQuestion(q, card);
    else renderWaypointQuestion(q, card);
    return;
  }

  /* MOD 02 — výber z možností namiesto písania */
  if (wantsChoice(q)) {
    renderChoiceQuestion(q, card, body);
    return;
  }

  card.innerHTML = `
    ${body}
    <div class="hint-row empty" id="hint-row">
      <span class="hint-label">HINT</span>
      <span class="hint-text">— press [?] for a hint —</span>
      <button class="btn-hint" id="btn-hint">? HINT</button>
    </div>
    <div class="input-row">
      <input type="text" id="answer" placeholder="${placeholder}" autocomplete="off" autocapitalize="characters" spellcheck="false">
      <button class="btn" id="submit-btn">SUBMIT ▶</button>
    </div>
    <div class="feedback" id="feedback"></div>
  `;

  if (q.type === 'aircraft') loadAircraftPhoto(q.data);
  apRetryBadge(q);

  const input = document.getElementById('answer');
  input.focus();
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitAnswer();
  });
  document.getElementById('submit-btn').onclick = submitAnswer;
  document.getElementById('btn-hint').onclick = useHint;
}
