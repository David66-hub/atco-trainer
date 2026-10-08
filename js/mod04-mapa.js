/* ============================================================
   MAP / WAYPOINT QUESTION RENDERER
   ============================================================ */
/* shared map base: border path + city anchors (used by quiz & study renderers) */
function mapBaseParts() {
  const firPath = smoothClosedPath(FIR_OUTLINE.map(([lo,la]) => [projX(lo), projY(la)]));
  const cities = WP_CITIES.map(c => {
    const x = projX(c.lon), y = projY(c.lat);
    return `<g>
      <path class="wp-city" d="M ${x},${y-6} L ${x+5},${y} L ${x},${y+6} L ${x-5},${y} Z"></path>
      <text class="wp-anchor-label" x="${x+9}" y="${y+3}">${c.name}</text>
    </g>`;
  }).join('');
  return { firPath, cities };
}

function buildMapSVG(target, candidates, opts) {
  opts = opts || {};
  const P = MAP_PROJ;
  const { firPath, cities } = mapBaseParts();

  // dots
  let dots = candidates.map(c => {
    const x = projX(c.lon).toFixed(1), y = projY(c.lat).toFixed(1);
    const isNav = c.kind === 'nav';
    if (isNav) {
      // navaid = hexagon marker to show it's a facility, not a fix
      const r = 7;
      const hex = [];
      for (let i=0;i<6;i++){ const a=Math.PI/6 + i*Math.PI/3; hex.push(`${(+x+r*Math.cos(a)).toFixed(1)},${(+y+r*Math.sin(a)).toFixed(1)}`); }
      return `<polygon class="wp-dot nav cand wp-hit" data-name="${c.name}" points="${hex.join(' ')}"></polygon>
              <circle class="wp-hit" data-name="${c.name}" cx="${x}" cy="${y}" r="16" fill="transparent"></circle>`;
    }
    return `<circle class="wp-dot cand wp-hit" data-name="${c.name}" cx="${x}" cy="${y}" r="6"></circle>
            <circle class="wp-hit" data-name="${c.name}" cx="${x}" cy="${y}" r="16" fill="transparent"></circle>`;
  }).join('');

  return `<svg viewBox="0 0 ${P.w} ${P.h.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" id="map-svg">
    <rect x="0" y="0" width="${P.w}" height="${P.h.toFixed(0)}" fill="#fbfdfc"></rect>
    <path d="${firPath}" fill="#eef6f0" stroke="var(--border-bright)" stroke-width="1.5"></path>
    ${cities}
    ${dots}
  </svg>`;
}

/* Catmull-Rom spline through points -> smooth closed SVG path (cubic Béziers).
   Makes the hand-placed border vertices render as soft curves, not straight chords. */
function smoothClosedPath(pts, k) {
  k = (k == null) ? 0.5 : k; // tension
  const n = pts.length;
  if (n < 3) return 'M ' + pts.map(p => p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L ') + ' Z';
  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) * k / 3;
    const c1y = p1[1] + (p2[1] - p0[1]) * k / 3;
    const c2x = p2[0] - (p3[0] - p1[0]) * k / 3;
    const c2y = p2[1] - (p3[1] - p1[1]) * k / 3;
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + ' Z';
}

/* ============================================================
   STUDY / EXPLORE MODE — free interactive map, no scoring
   ============================================================ */
function buildStudySVG(points, selName) {
  const P = MAP_PROJ;
  const { firPath, cities } = mapBaseParts();

  // collision-nudged label placement so names don't pile up
  const placed = [];
  const collides = (lx, ly) => placed.some(p => Math.abs(p.x - lx) < 30 && Math.abs(p.y - ly) < 9);

  const dots = [], labels = [];
  points.forEach(c => {
    const x = projX(c.lon), y = projY(c.lat);
    const xs = x.toFixed(1), ys = y.toFixed(1);
    const sCls = 's-' + (c.sec || 'W');
    const selCls = (c.name === selName) ? ' s-sel' : '';
    if (c.kind === 'nav') {
      const r = 7, hex = [];
      for (let i=0;i<6;i++){ const a=Math.PI/6 + i*Math.PI/3; hex.push(`${(x+r*Math.cos(a)).toFixed(1)},${(y+r*Math.sin(a)).toFixed(1)}`); }
      dots.push(`<polygon class="wp-dot ${sCls}${selCls} wp-hit" data-name="${c.name}" points="${hex.join(' ')}"></polygon>`);
    } else {
      dots.push(`<circle class="wp-dot ${sCls}${selCls} wp-hit" data-name="${c.name}" cx="${xs}" cy="${ys}" r="5"></circle>`);
    }
    dots.push(`<circle class="wp-hit" data-name="${c.name}" cx="${xs}" cy="${ys}" r="14" fill="transparent"></circle>`);
    // place label
    const tries = [[x+8,y-5,'start'],[x+8,y+11,'start'],[x-8,y-5,'end'],[x-8,y+11,'end'],[x,y-11,'middle'],[x,y+16,'middle']];
    let ch = tries[0];
    for (const t of tries) { if (!collides(t[0], t[1])) { ch = t; break; } }
    placed.push({ x: ch[0], y: ch[1] });
    labels.push(`<text class="wp-label-study" x="${ch[0].toFixed(1)}" y="${ch[1].toFixed(1)}" text-anchor="${ch[2]}">${c.name}</text>`);
  });

  return `<svg viewBox="0 0 ${P.w} ${P.h.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" id="map-svg">
    <rect x="0" y="0" width="${P.w}" height="${P.h.toFixed(0)}" fill="#fbfdfc"></rect>
    <path d="${firPath}" fill="#eef6f0" stroke="var(--border-bright)" stroke-width="1.5"></path>
    ${cities}
    ${dots.join('')}
    ${labels.join('')}
  </svg>`;
}

function studyDetailHTML(w) {
  const typeFull = { A:'Arrival Connection', D:'Departure Connection', E:'Horizontal Entry', I:'Intermediate', X:'Horizontal Exit' };
  const typeList = (w.type||'').split('').filter(c=>typeFull[c]).map(c=>typeFull[c]).join(', ') || '—';
  const sub = w.kind==='nav' ? (w.nav||'NAVIGAČNÉ ZARIADENIE') : 'FRA SIGNIFICANT POINT';
  return `
    <div class="reveal-title">${w.name}</div>
    <div class="reveal-sub">${sub}</div>
    <div class="reveal-grid">
      <div class="item"><span class="item-label">TYP BODU</span><span class="item-val"><strong>${w.type||'—'}</strong> ${typeList}</span></div>
      <div class="item"><span class="item-label">SEKTOR</span><span class="item-val"><strong>${SECTOR_NAMES[w.sec]||'—'}</strong></span></div>
      <div class="item"><span class="item-label">LAT</span><span class="item-val">${fmtLat(w.lat)}</span></div>
      <div class="item"><span class="item-label">LON</span><span class="item-val">${fmtLon(w.lon)}</span></div>
    </div>`;
}

function onStudyPick(name, svg) {
  const w = WAYPOINTS.find(p => p.name === name);
  if (!w) return;
  svg.querySelectorAll('.wp-dot.s-sel').forEach(el => el.classList.remove('s-sel'));
  const dot = svg.querySelector('.wp-dot[data-name="'+name+'"]');
  if (dot) dot.classList.add('s-sel');
  const det = document.getElementById('study-detail');
  det.className = 'study-detail';
  det.innerHTML = studyDetailHTML(w);
}

function renderWaypointStudy(card) {
  const pool = filterBySector(WAYPOINTS);
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = pool.length + ' bodov';

  card.innerHTML = `
    <div class="qmeta">FRA SIGNIFICANT POINTS <span class="sep">·</span> ŠTUDIJNÝ REŽIM — PRESKÚMAJ MAPU</div>
    <div class="map-prompt">
      <span class="mp-label">VŠETKY BODY · FAREBNE PODĽA SEKTORA</span>
    </div>
    <div class="map-wrap">${buildStudySVG(pool)}</div>
    <div class="map-legend">
      <span class="lg-sw">WEST</span>
      <span class="lg-sc">CENTRAL</span>
      <span class="lg-se">EAST</span>
      <span class="lg-city">mesto / letisko</span>
    </div>
    <div class="study-tip">Klikni na ktorýkoľvek bod pre detail. Filtrom SEKTOR dole vyčistíš mapu na jeden sektor.</div>
    <div class="study-detail empty" id="study-detail">— klikni na bod na mape —</div>
  `;

  const svg = document.getElementById('map-svg');
  svg.querySelectorAll('.wp-hit').forEach(el => {
    el.addEventListener('click', () => onStudyPick(el.dataset.name, svg));
  });
}

function renderWaypointQuestion(q, card) {
  const target = q.data;
  const cands = waypointCandidates(target);
  const diffLabel = state.filters.wpDiff === 'hard' ? 'HARDCORE · všetky body' : 'ĽAHKÁ · 5 kandidátov';
  const typeNames = { A:'Arrival', D:'Departure', E:'Entry', I:'Intermediate', X:'Exit' };
  const tags = (target.type || '').split('').filter(c=>typeNames[c]).map(c => `<span class="tg" title="${typeNames[c]}">${c}</span>`).join('');
  const kindTxt = target.kind === 'nav'
    ? `<span class="tg" style="background:#fff4e0;border-color:var(--amber);color:var(--amber)">NAV</span> ${target.nav || 'navigačné zariadenie'}`
    : 'FRA significant point';

  card.innerHTML = `
    <div class="qmeta">FRA SIGNIFICANT POINT <span class="sep">·</span> NÁJDI BOD NA MAPE</div>
    <div class="map-prompt">
      <span class="mp-label">KDE LEŽÍ BOD?</span>
      <div class="mp-name">${target.name}</div>
      <div class="mp-sub">${kindTxt} ${tags ? '<span class="sep">·</span> ' + tags : ''}</div>
    </div>
    <div class="map-difficulty">${diffLabel} — klikni na správny ${target.kind==='nav'?'symbol':'krúžok'}</div>
    <div class="map-wrap">${buildMapSVG(target, cands)}</div>
    <div class="map-legend">
      <span class="lg-pt">FRA bod (kandidát)</span>
      <span class="lg-nav">navigačné zariadenie (VOR/NDB)</span>
      <span class="lg-city">mesto / letisko</span>
      <span class="lg-other">ostatní kandidáti (po odpovedi)</span>
    </div>
    <div class="feedback" id="feedback"></div>
  `;

  // wire clicks
  const svg = document.getElementById('map-svg');
  svg.querySelectorAll('.wp-hit').forEach(el => {
    el.addEventListener('click', () => onWaypointPick(el.dataset.name, target, svg, cands));
  });
}

function revealOtherPoints(svg, target, cands, pickedName) {
  const NS = 'http://www.w3.org/2000/svg';
  // Only the OTHER candidates that were on screen for guessing (≈4 in easy mode).
  // The correct one (green) and the wrong pick (red) are already coloured/labelled.
  const others = cands.filter(c => c.name !== target.name && c.name !== pickedName);

  // collision-aware label placement: track occupied boxes (incl. the correct label)
  const placed = [{ x: projX(target.lon)+9, y: projY(target.lat)-8 }];
  const collides = (lx, ly) => placed.some(p => Math.abs(p.x - lx) < 34 && Math.abs(p.y - ly) < 11);

  others.forEach(w => {
    const x = projX(w.lon), y = projY(w.lat);
    // recolour the candidate dot to black so it's clearly "one of the others"
    const d = svg.querySelector('.wp-dot[data-name="'+w.name+'"]');
    if (d) { d.classList.remove('cand'); d.classList.remove('nav'); d.classList.add('other'); }

    // try several offsets so labels stay readable and don't overlap each other
    const tries = [
      [x+9, y-6, 'start'], [x+9, y+12, 'start'],
      [x-9, y-6, 'end'],   [x-9, y+12, 'end'],
      [x, y-12, 'middle'], [x, y+18, 'middle'],
    ];
    let chosen = tries[0];
    for (const t of tries) { if (!collides(t[0], t[1])) { chosen = t; break; } }
    placed.push({ x: chosen[0], y: chosen[1] });

    const t = document.createElementNS(NS,'text');
    t.setAttribute('class','wp-label-other');
    t.setAttribute('x', chosen[0].toFixed(1));
    t.setAttribute('y', chosen[1].toFixed(1));
    t.setAttribute('text-anchor', chosen[2]);
    t.textContent = w.name;
    svg.appendChild(t);
  });
}

function onWaypointPick(pickedName, target, svg, cands) {
  // lock further clicks
  svg.querySelectorAll('.wp-hit').forEach(el => { el.style.pointerEvents = 'none'; el.style.cursor = 'default'; });
  const ok = pickedName === target.name;
  const q = state.current;

  // colour the picked dot
  const pickedDot = svg.querySelector('.wp-dot[data-name="'+pickedName+'"]');
  if (pickedDot) { pickedDot.classList.remove('cand'); pickedDot.classList.add(ok ? 'correct' : 'wrong'); }
  // always highlight correct one + label it
  const correctDot = svg.querySelector('.wp-dot[data-name="'+target.name+'"]');
  if (correctDot) {
    correctDot.classList.remove('cand');
    correctDot.classList.add('reveal-correct');
    const cx = correctDot.getAttribute('cx') || (projX(target.lon).toFixed(1));
    const cy = correctDot.getAttribute('cy') || (projY(target.lat).toFixed(1));
    const lbl = document.createElementNS('http://www.w3.org/2000/svg','text');
    lbl.setAttribute('class','wp-label-reveal');
    lbl.setAttribute('x', (+cx + 9)); lbl.setAttribute('y', (+cy - 8));
    lbl.textContent = target.name;
    svg.appendChild(lbl);
  }
  // reveal every other FRA point in black so the user learns the rest of the map
  revealOtherPoints(svg, target, cands, pickedName);

  // scoring (reuse global counters)
  if (ok) {
    state.correct++; state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  } else {
    state.wrong++; state.streak = 0;
    state.mistakes[q.id] = (state.mistakes[q.id] || 0) + 1;
    wkLog(q, pickedName);
  }
  renderStats(); renderWeak();
  apAfterAnswer(q, ok);

  const fb = document.getElementById('feedback');
  let banner = ok ? `✓ <strong>SPRÁVNE</strong>` : `✗ <strong>ZLE</strong> · klikol si: <span class="answer">${pickedName}</span>`;
  fb.className = 'feedback show ' + (ok ? 'ok' : 'no');
  fb.innerHTML = `
    <div class="feedback-banner">
      <span>${banner}</span>
      <button class="btn" id="next-btn">ĎALŠÍ ▶</button>
    </div>
    ${waypointRevealHTML(target)}
  `;
  setTimeout(() => {
    const nb = document.getElementById('next-btn');
    if (nb) { nb.focus(); nb.onclick = nextQuestion; }
    document.addEventListener('keydown', onEnterNext, { once: true });
  }, 50);
}

/* Plný informačný panel o bode — používa ho hľadanie aj pomenovanie. */
function waypointRevealHTML(w) {
  const typeFull = { A:'Arrival Connection', D:'Departure Connection', E:'Horizontal Entry', I:'Intermediate', X:'Horizontal Exit' };
  const typeList = (w.type||'').split('').filter(c=>typeFull[c]).map(c=>typeFull[c]).join(', ') || '—';
  const grpName = { SEVER:'Sever (PL / Warszawa FIR)', ZAPAD:'Západ (CZ-AT / Praha FIR)', VYCHOD:'Východ (UA / Lviv FIR)', JUH:'Juh (HU / Budapest FIR)', STRED:'Vnútro FIR', NAV:'Navigačné zariadenie' };
  const secTxt = w.sec ? `<strong>${SECTOR_NAMES[w.sec]}</strong>` : '—';
  return `
    <div class="reveal">
      <div class="reveal-title">${w.name}</div>
      <div class="reveal-sub">${w.kind==='nav' ? (w.nav||'NAVIGAČNÉ ZARIADENIE') : 'FRA SIGNIFICANT POINT'}</div>
      <div class="reveal-grid">
        <div class="item"><span class="item-label">TYP BODU</span><span class="item-val"><strong>${w.type||'—'}</strong> ${typeList}</span></div>
        <div class="item"><span class="item-label">SEKTOR</span><span class="item-val">${secTxt}</span></div>
        <div class="item"><span class="item-label">OBLASŤ</span><span class="item-val">${grpName[w.grp]||w.grp}</span></div>
        <div class="item"><span class="item-label">LAT</span><span class="item-val">${fmtLat(w.lat)}</span></div>
        <div class="item"><span class="item-label">LON</span><span class="item-val">${fmtLon(w.lon)}</span></div>
      </div>
    </div>`;
}

/* ============================================================
   MOD 04 — POMENUJ BOD (obrátený kvíz)
   Mapa rozsvieti jeden bod a meno sa píše z hlavy. Opak
   hľadania, kde meno dostaneš a klikáš do mapy.
   ============================================================ */

/* n najbližších bodov k cieľu — merané v projekcii, nie na guli,
   takže to zodpovedá tomu, čo je blízko na obrazovke. */
function nearestPoints(target, n) {
  return WAYPOINTS
    .filter(w => w.name !== target.name)
    .map(w => {
      const dx = projX(w.lon) - projX(target.lon);
      const dy = projY(w.lat) - projY(target.lat);
      return { w, d: dx*dx + dy*dy };
    })
    .sort((a,b) => a.d - b.d)
    .slice(0, n)
    .map(o => o.w);
}

/* Okolie rozsvieteného bodu.
   ĽAHKÁ    = 6 najbližších bodov aj s menami — orientuješ sa podľa toho, čo už vieš
   HARDCORE = celý filtrovaný výber, bez mien */
function nameContext(target) {
  if (state.filters.wpDiff === 'hard') {
    return filterBySector(WAYPOINTS).filter(w => w.name !== target.name);
  }
  return nearestPoints(target, 6);
}

/* Rozmiestňovač menoviek — rovnaký vzor ako v študijnom režime:
   skús šesť pozícií okolo bodu a vezmi prvú, ktorá do ničoho nenarazí. */
function labelPlacer() {
  const placed = [];
  return {
    push(x, y) {
      const tries = [
        [x+8, y-5, 'start'], [x+8, y+11, 'start'],
        [x-8, y-5, 'end'],   [x-8, y+11, 'end'],
        [x, y-11, 'middle'], [x, y+16, 'middle'],
      ];
      let ch = tries[0];
      for (const t of tries) {
        if (!placed.some(pp => Math.abs(pp.x - t[0]) < 32 && Math.abs(pp.y - t[1]) < 10)) { ch = t; break; }
      }
      placed.push({ x: ch[0], y: ch[1] });
      return ch;
    },
    block(x, y) { placed.push({ x, y }); },
  };
}

function hexPoints(x, y, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) { const a = Math.PI/6 + i*Math.PI/3; pts.push(`${(x+r*Math.cos(a)).toFixed(1)},${(y+r*Math.sin(a)).toFixed(1)}`); }
  return pts.join(' ');
}

function buildNameSVG(target, context, showLabels) {
  const P = MAP_PROJ;
  const { firPath, cities } = mapBaseParts();
  const tx = projX(target.lon), ty = projY(target.lat);

  const place = labelPlacer();
  place.block(tx + 9, ty - 8); // miesto pre menovku cieľa po odpovedi

  const dots = [], labels = [];
  context.forEach(c => {
    const x = projX(c.lon), y = projY(c.lat);
    dots.push(c.kind === 'nav'
      ? `<polygon class="wp-dot ctx" data-name="${c.name}" points="${hexPoints(x, y, 5)}"></polygon>`
      : `<circle class="wp-dot ctx" data-name="${c.name}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4"></circle>`);
    if (showLabels) {
      const ch = place.push(x, y);
      labels.push(`<text class="wp-label-ctx" x="${ch[0].toFixed(1)}" y="${ch[1].toFixed(1)}" text-anchor="${ch[2]}">${c.name}</text>`);
    }
  });

  /* rozsvietený cieľ: nitkový kríž, stály prstenec a jeden pulzujúci.
     Pulz je cez SMIL, nie cez CSS — animácia polomeru cez CSS vo Firefoxe
     nefunguje, SMIL áno vo všetkých troch prehliadačoch. */
  const cross = `<path class="wp-cross" d="M ${(tx-32).toFixed(1)},${ty.toFixed(1)} h 17 M ${(tx+15).toFixed(1)},${ty.toFixed(1)} h 17
                    M ${tx.toFixed(1)},${(ty-32).toFixed(1)} v 17 M ${tx.toFixed(1)},${(ty+15).toFixed(1)} v 17"></path>`;
  const rings = `
    <circle class="wp-ring" cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="12"></circle>
    <circle class="wp-ring" cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="12">
      <animate attributeName="r" values="11;27" dur="2s" repeatCount="indefinite"></animate>
      <animate attributeName="opacity" values="0.9;0" dur="2s" repeatCount="indefinite"></animate>
    </circle>`;
  const tgt = target.kind === 'nav'
    ? `<polygon id="tgt-dot" class="wp-dot tgt" points="${hexPoints(tx, ty, 8)}"></polygon>`
    : `<circle id="tgt-dot" class="wp-dot tgt" cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="7"></circle>`;

  return `<svg viewBox="0 0 ${P.w} ${P.h.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" id="map-svg">
    <rect x="0" y="0" width="${P.w}" height="${P.h.toFixed(0)}" fill="#fbfdfc"></rect>
    <path d="${firPath}" fill="#eef6f0" stroke="var(--border-bright)" stroke-width="1.5"></path>
    ${cities}
    ${dots.join('')}
    ${labels.join('')}
    ${cross}
    ${rings}
    ${tgt}
  </svg>`;
}

function renderWaypointNameQuestion(q, card) {
  const target = q.data;
  const hard = state.filters.wpDiff === 'hard';
  const context = nameContext(target);
  const typeNames = { A:'Arrival', D:'Departure', E:'Entry', I:'Intermediate', X:'Exit' };
  /* v hardcore režime nedostaneš ani typ bodu — len polohu */
  const tags = hard ? '' : (target.type || '').split('').filter(c=>typeNames[c])
    .map(c => `<span class="tg" title="${typeNames[c]}">${c}</span>`).join('');
  const kindTxt = hard ? 'len poloha'
    : (target.kind === 'nav'
        ? `<span class="tg" style="background:#fff4e0;border-color:var(--amber);color:var(--amber)">NAV</span> navigačné zariadenie`
        : 'FRA significant point');
  const diffLabel = hard
    ? 'HARDCORE · celý sektor na mape, bez mien'
    : 'ĽAHKÁ · šesť najbližších bodov s menami';

  card.innerHTML = `
    <div class="qmeta">FRA SIGNIFICANT POINT <span class="sep">·</span> POMENUJ ROZSVIETENÝ BOD</div>
    <div class="map-prompt">
      <span class="mp-label">KTORÝ BOD SVIETI?</span>
      <div class="mp-sub">${kindTxt}${tags ? ' <span class="sep">·</span> ' + tags : ''}</div>
    </div>
    <div class="map-difficulty">${diffLabel}</div>
    <div class="map-wrap">${buildNameSVG(target, context, !hard)}</div>
    <div class="map-legend">
      <span class="lg-lit">bod, na ktorý sa pýtam</span>
      <span class="lg-ctx">okolité body</span>
      <span class="lg-city">mesto / letisko</span>
    </div>
    <div class="hint-row empty" id="hint-row">
      <span class="hint-label">HINT</span>
      <span class="hint-text">— stlač [?] pre nápovedu —</span>
      <button class="btn-hint" id="btn-hint">? HINT</button>
    </div>
    <div class="input-row">
      <input type="text" id="answer" placeholder="${target.kind === 'nav' ? 'NÁZOV ZARIADENIA...' : 'NÁZOV BODU (5 PÍSMEN)...'}" autocomplete="off" autocapitalize="characters" spellcheck="false">
      <button class="btn" id="submit-btn">SUBMIT ▶</button>
    </div>
    <div class="feedback" id="feedback"></div>
  `;

  const input = document.getElementById('answer');
  input.focus();
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submitWaypointName(); });
  document.getElementById('submit-btn').onclick = submitWaypointName;
  document.getElementById('btn-hint').onclick = useHint;
}

/* Po odpovedi domenuj okolie, aby si si odniesol aj susedov.
   V ľahkej sú menovky už na mape — len stmavnú. V hardcore je na mape
   celý sektor, tak sa dokreslí len šesť najbližších. */
function labelNeighbours(svg, target) {
  const existing = svg.querySelectorAll('.wp-label-ctx');
  if (existing.length) {
    existing.forEach(el => el.setAttribute('class', 'wp-label-other'));
    return;
  }
  const NS = 'http://www.w3.org/2000/svg';
  const place = labelPlacer();
  place.block(projX(target.lon) + 9, projY(target.lat) - 8);
  nearestPoints(target, 6).forEach(w => {
    const x = projX(w.lon), y = projY(w.lat);
    const ch = place.push(x, y);
    const t = document.createElementNS(NS,'text');
    t.setAttribute('class','wp-label-other');
    t.setAttribute('x', ch[0].toFixed(1));
    t.setAttribute('y', ch[1].toFixed(1));
    t.setAttribute('text-anchor', ch[2]);
    t.textContent = w.name;
    svg.appendChild(t);
  });
}

function submitWaypointName() {
  const input = document.getElementById('answer');
  if (!input || input.disabled) return;
  const val = input.value.trim();
  if (!val) return;

  const q = state.current, target = q.data;
  /* Tolerancia preklepov sa tu zámerne nepoužíva: názvy bodov sa líšia
     aj jedným písmenom (KELEL / KEFIR) a v prevádzke musia sedieť presne. */
  const ok = normalize(val) === normalize(target.name);
  /* ak si napísal iný skutočný bod, oplatí sa to povedať nahlas */
  const other = ok ? null : WAYPOINTS.find(w => normalize(w.name) === normalize(val));

  if (ok) {
    state.correct++; state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  } else {
    state.wrong++; state.streak = 0;
    state.mistakes[q.id] = (state.mistakes[q.id] || 0) + 1;
    wkLog(q, val);
  }
  renderStats(); renderWeak();
  apAfterAnswer(q, ok);

  input.disabled = true;
  const sb = document.getElementById('submit-btn');
  if (sb) { sb.disabled = true; sb.style.opacity = '0.4'; }
  const hb = document.getElementById('btn-hint'); if (hb) hb.disabled = true;

  /* mapa: pulz zhasne, bod sa prefarbí a dostane menovku */
  const svg = document.getElementById('map-svg');
  if (svg) {
    svg.querySelectorAll('.wp-ring').forEach(r => r.remove());
    const dot = svg.querySelector('#tgt-dot');
    if (dot) { dot.classList.remove('tgt'); dot.classList.add(ok ? 'reveal-correct' : 'wrong'); }
    const NS = 'http://www.w3.org/2000/svg';
    const lbl = document.createElementNS(NS,'text');
    lbl.setAttribute('class', ok ? 'wp-label-reveal' : 'wp-label-wrong');
    lbl.setAttribute('x', (projX(target.lon) + 10).toFixed(1));
    lbl.setAttribute('y', (projY(target.lat) - 9).toFixed(1));
    lbl.textContent = target.name;
    svg.appendChild(lbl);
    labelNeighbours(svg, target);
  }

  const typed = val.toUpperCase().replace(/</g, '&lt;');
  let banner;
  if (ok) banner = `✓ <strong>SPRÁVNE</strong>`;
  else if (other) banner = `✗ <strong>ZLE</strong> · ${other.name} je iný bod — tento je ${target.name}.`;
  else banner = `✗ <strong>ZLE</strong> · napísal si: <span class="answer">${typed}</span> — správne: <span class="answer">${target.name}</span>`;

  const fb = document.getElementById('feedback');
  fb.className = 'feedback show ' + (ok ? 'ok' : 'no');
  fb.innerHTML = `
    <div class="feedback-banner">
      <span>${banner}</span>
      <button class="btn" id="next-btn">ĎALŠÍ ▶</button>
    </div>
    ${waypointRevealHTML(target)}
  `;

  setTimeout(() => {
    const nb = document.getElementById('next-btn');
    if (nb) { nb.focus(); nb.onclick = nextQuestion; }
    document.addEventListener('keydown', onEnterNext, { once: true });
  }, 50);
}

function fmtLat(d){ const h=d>=0?'N':'S'; d=Math.abs(d); const deg=Math.floor(d); const m=Math.floor((d-deg)*60); const s=Math.round(((d-deg)*60-m)*60); return `${deg}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"${h}`; }
function fmtLon(d){ const h=d>=0?'E':'W'; d=Math.abs(d); const deg=Math.floor(d); const m=Math.floor((d-deg)*60); const s=Math.round(((d-deg)*60-m)*60); return `${String(deg).padStart(3,'0')}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"${h}`; }

function useHint() {
  const q = state.current;
  const hints = generateHints(q);
  if (state.hintsUsed >= hints.length) return;
  const row = document.getElementById('hint-row');
  const txt = row.querySelector('.hint-text');
  row.classList.remove('empty');
  txt.innerHTML = `<strong style="color:var(--amber)">[${state.hintsUsed + 1}/${hints.length}]</strong> ${hints[state.hintsUsed]}`;
  state.hintsUsed++;
  const btn = document.getElementById('btn-hint');
  if (state.hintsUsed >= hints.length) {
    btn.disabled = true;
    btn.textContent = 'NO MORE HINTS';
  } else {
    btn.textContent = `? HINT (${hints.length - state.hintsUsed} LEFT)`;
  }
}

function renderStats() {
  document.getElementById('stat-correct').textContent = state.correct;
  document.getElementById('stat-wrong').textContent = state.wrong;
  document.getElementById('stat-streak').textContent = state.streak;
}

/* Zlé pokusy: počet je v state.mistakes (riadi opakovanie), posledná moja odpoveď a správna odpoveď v zázname WK. */
const WK_KEY = 'atcoTrainerV2.wrongLog';
function wkLog(q, mine) {
  if (!q || !q.id) return;
  const L = lsGet(WK_KEY, {});
  let right = '', ask = '';
  try { right = examAnswerOf(q); } catch (e) {}
  try { ask = examAsk(q); } catch (e) {}
  L[q.id] = { mine: String(mine == null || mine === '' ? '— bez odpovede —' : mine).slice(0, 120), right: String(right || '').slice(0, 160), ask: String(ask || '').slice(0, 160), t: Date.now() };
  const ks = Object.keys(L);
  if (ks.length > 400) ks.sort((a, b) => L[a].t - L[b].t).slice(0, ks.length - 400).forEach(k => { delete L[k]; });
  lsSet(WK_KEY, L);
}
function wkOpen(id) {
  const L = lsGet(WK_KEY, {}), r = L[id] || {}, n = state.mistakes[id] || 0;
  let right = r.right, ask = r.ask;
  if (!right || !ask) { try { const q = poolById()[id]; if (q) { right = right || examAnswerOf(q); ask = ask || examAsk(q); } } catch (e) {} }
  wkClose();
  const w = document.createElement('div'); w.id = 'wk-wrap';
  w.innerHTML = `<div class="hp wk" role="dialog">
      <div class="hp-top"><span>MOJA CHYBA${n ? ' · POKAZENÉ ' + n + '×' : ''}</span><button data-wk="x" title="Zavrieť">✕</button></div>
      <div class="wk-ask">${dqEsc(ask || labelForId(id))}</div>
      <div class="wk-row no"><em>TVOJA ODPOVEĎ</em><b>${dqEsc(r.mine || 'neuložená — chyba je staršia než táto verzia')}</b></div>
      <div class="wk-row ok"><em>SPRÁVNE</em><b>${dqEsc(right || labelForId(id))}</b></div>
      <div class="hp-act"><button class="btn ghost" data-wk="del">UŽ TO VIEM — VYMAZAŤ</button><button class="btn" data-wk="x">ZAVRIEŤ</button></div>
    </div>`;
  w.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-wk]');
    if (e.target === w || (b && b.dataset.wk === 'x')) return wkClose();
    if (b && b.dataset.wk === 'del') { delete state.mistakes[id]; const M = lsGet(WK_KEY, {}); delete M[id]; lsSet(WK_KEY, M); try { apSaveProgress(); } catch (e2) {} renderWeak(); wkClose(); }
  });
  document.body.appendChild(w);
}
function wkClose() { const w = document.getElementById('wk-wrap'); if (w) w.remove(); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') wkClose(); });
function wkItems() { return Object.entries(state.mistakes).filter(([_, n]) => n >= 1).sort((a, b) => b[1] - a[1]); }
/* dole pod cvičením už nie je zoznam všetkých chýb — len jeden pás s počtom a dvoma tlačidlami (v4.20) */
function renderWeak() {
  const el = document.getElementById('weak-list'), sec = document.getElementById('weak-sec'), items = wkItems(), by = poolById(), can = items.filter(x => by[x[0]]).length;
  if (sec) sec.classList.toggle('none', !items.length);
  if (!items.length) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="wk-bar"><i>${items.length}</i><div><b>${items.length === 1 ? 'chyba čaká' : items.length < 5 ? 'chyby čakajú' : 'chýb čaká'} na zopakovanie</b><span>Čo si pokazil, sa tu zbiera. Po správnej odpovedi zo zoznamu vypadne.</span></div>
      ${can ? '<button class="btn" id="wk-drill">PRECVIČIŤ CHYBY ▶</button>' : ''}<button class="btn ghost" id="wk-show">ZOBRAZIŤ</button></div>`;
  const d = document.getElementById('wk-drill'); if (d) d.onclick = wkDrill;
  document.getElementById('wk-show').onclick = wkListOpen;
}
/* precvičenie chýb: denný tréning zložený len z vecí, ktoré mám zle */
function wkDrill() { const w = document.getElementById('wkl-wrap'); if (w) w.remove(); state.drill = true; startMode('daily'); window.scrollTo(0, 0); }
function wkListOpen() {
  const old = document.getElementById('wkl-wrap'); if (old) old.remove();
  const items = wkItems(), by = poolById(), G = {}, NAME = { aircraft: 'MOD 01 · LIETADLÁ', airport: 'MOD 02 · LETISKÁ', callsign: 'MOD 03 · VOLAČKY', waypoint: 'MOD 04 · BODY', coord: 'MOD 06 · KOORDINÁCIA', other: 'OSTATNÉ' };
  const PA = poolAll(), modOf = {}; Object.keys(PA).forEach(m => PA[m].forEach(q => { if (!modOf[q.id]) modOf[q.id] = m; }));
  items.forEach(x => { const m = NAME[modOf[x[0]]] ? modOf[x[0]] : 'other'; (G[m] = G[m] || []).push(x); });
  const w = document.createElement('div'); w.id = 'wkl-wrap';
  w.innerHTML = `<div class="hp wkl" role="dialog" aria-label="Moje chyby">
      <div class="hp-top"><span>MOJE CHYBY · ${items.length}</span><button data-wkl="x" title="Zavrieť">✕</button></div>
      <p class="wkl-n">Klikni na chybu a uvidíš, čo si odpovedal a čo je správne. Číslo je, koľkokrát si ju pokazil.</p>
      <div class="wkl-list">${Object.keys(NAME).filter(m => G[m]).map(m => `<h4>${NAME[m]} <em>${G[m].length}</em></h4><div>${G[m].slice(0, 80).map(([id, n]) => `<button class="weak-item" data-wkid="${dqEsc(id)}">${labelForId(id)}${n > 1 ? ` <b>×${n}</b>` : ''}</button>`).join('')}${G[m].length > 80 ? `<span class="weak-empty">a ďalších ${G[m].length - 80}</span>` : ''}</div>`).join('')}</div>
      <div class="hp-act"><button class="btn ghost" data-wkl="x">ZAVRIEŤ</button>${items.some(x => by[x[0]]) ? '<button class="btn" data-wkl="go">PRECVIČIŤ CHYBY ▶</button>' : ''}</div>
    </div>`;
  w.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-wkl],[data-wkid]'); if (e.target === w || (t && t.dataset.wkl === 'x')) return w.remove(); if (!t) return; if (t.dataset.wkl === 'go') return wkDrill(); if (t.dataset.wkid) wkOpen(t.dataset.wkid); });
  document.body.appendChild(w);
}

function labelForId(id) {
  if (id.indexOf('AC_CMP_') === 0) return id.slice(7).replace('_', ' vs ');
  if (id.indexOf('CO_') === 0) return CO_LABEL[id] || id.slice(3);
  if (id.indexOf('AP_K') === 0) {
    const ap = AIRPORTS.find(a => a.icao === id.slice(6));
    return ap ? `${id.charAt(4) === 'I' ? ap.icao : ap.city}→mapa` : id;
  }
  if (id.indexOf('PX_') === 0) {
    const st = pxAll().find(x => x.p === id.slice(7));
    if (!st) return id;
    return id.indexOf('PX_C2S_') === 0 ? `${st.p}→${pxShort(st)}` : id.indexOf('PX_S2C_') === 0 ? `${pxShort(st)}→${st.p}` : `${st.p}→mapa`;
  }
  if (id.startsWith('AC_')) {
    const ac = AIRCRAFT.find(a => 'AC_' + a.icao === id);
    return ac ? ac.icao : id;
  }
  if (id.startsWith('AP_I2C_')) {
    const ic = id.slice(7);
    const ap = AIRPORTS.find(a => a.icao === ic);
    return ap ? `${ap.icao}→${ap.city}` : id;
  }
  if (id.startsWith('AP_C2I_')) {
    const ic = id.slice(7);
    const ap = AIRPORTS.find(a => a.icao === ic);
    return ap ? `${ap.city}→${ap.icao}` : id;
  }
  if (id.startsWith('CS_I2C_')) {
    const ic = id.slice(7);
    const cs = CALLSIGNS.find(c => c.icao === ic);
    return cs ? `${cs.icao}→${cs.call}` : id;
  }
  if (id.startsWith('CS_C2I_')) {
    const ic = id.slice(7);
    const cs = CALLSIGNS.find(c => c.icao === ic);
    return cs ? `"${cs.call}"→${cs.icao}` : id;
  }
  return id;
}

function renderFilters() {
  const el = document.getElementById('filters');
  if (state.mode === 'home' || state.mode === 'conquer' || state.mode === 'rank' || state.mode === 'profile' || state.mode === 'about') { el.innerHTML = ''; return; }
  if (state.mode === 'aircraft') {
    const cmp = state.filters.acMode === 'cmp';
    el.innerHTML = `
      <span style="font-size:10px;letter-spacing:0.15em;color:var(--text-faint);align-self:center;margin-right:6px">REŽIM:</span>
      <button class="filter-chip ${!cmp?'on':''}" data-acmode="id">URČ TYP Z FOTKY</button>
      <button class="filter-chip ${cmp?'on':''}" data-acmode="cmp">POROVNAJ DVA PODOBNÉ</button>
      <span style="font-size:10px;letter-spacing:0.15em;color:var(--text-faint);align-self:center;margin-right:6px">OBTIAŽNOSŤ:</span>
      <button class="filter-chip ${state.filters.acAns==='choice'?'on':''}" data-acans="choice">${cmp ? 'ĽAHKÁ (s pomôckou)' : 'ĽAHKÁ (výber zo 4 možností)'}</button>
      <button class="filter-chip ${state.filters.acAns==='type'?'on':''}" data-acans="type">${cmp ? 'HARDCORE (bez pomôcky)' : 'HARDCORE (písanie)'}</button>
      <span style="font-size:10px;letter-spacing:0.15em;color:var(--text-faint);align-self:center;margin-right:6px">TURBULENCIA V ÚPLAVE:</span>
      <button class="filter-chip ${state.filters.wake==='all'?'on':''}" data-wake="all">ALL</button>
      <button class="filter-chip ${state.filters.wake==='L'?'on':''}" data-wake="L">LIGHT</button>
      <button class="filter-chip ${state.filters.wake==='M'?'on':''}" data-wake="M">MEDIUM</button>
      <button class="filter-chip ${state.filters.wake==='H'?'on':''}" data-wake="H">HEAVY</button>
      <button class="filter-chip ${state.filters.wake==='J'?'on':''}" data-wake="J">SUPER</button>
    `;
    el.querySelectorAll('[data-wake]').forEach(b => {
      b.onclick = () => { state.filters.wake = b.dataset.wake; startMode(state.mode); };
    });
    el.querySelectorAll('[data-acmode]').forEach(b => {
      b.onclick = () => { state.filters.acMode = b.dataset.acmode; startMode(state.mode); };
    });
    el.querySelectorAll('[data-acans]').forEach(b => {
      b.onclick = () => { state.filters.acAns = b.dataset.acans; startMode(state.mode); };
    });
  } else if (state.mode === 'airport') {
    const F = state.filters, apm = F.apMode, c = F.airportCat;
    const lab = (t, first) => `<span style="font-size:10px;letter-spacing:0.15em;color:var(--text-faint);align-self:center;margin:${first ? '0 6px 0 0' : '0 6px'}">${t}</span>`;
    const chip = (on, attr, val, txt) => `<button class="filter-chip ${on ? 'on' : ''}" data-${attr}="${val}">${txt}</button>`;
    let h = lab('REŽIM:', true) +
      chip(apm==='quiz', 'apmode', 'quiz', 'KVÍZ') + chip(apm==='map', 'apmode', 'map', 'MAPA') +
      chip(apm==='click', 'apmode', 'click', 'NÁJDI NA MAPE') + chip(apm==='prefix', 'apmode', 'prefix', 'PREFIXY ŠTÁTOV') +
      chip(apm==='study', 'apmode', 'study', 'ŠTÚDIUM');
    if (apm !== 'study') {
      const ck = apm === 'click';
      h += '<span class="filter-break"></span>' + lab('OBTIAŽNOSŤ:', true) +
        chip(F.apAns==='choice', 'apans', 'choice', ck ? 'ĽAHKÁ (uzná sa do 100 km)' : 'ĽAHKÁ (výber zo 4 možností)') +
        chip(F.apAns==='type', 'apans', 'type', ck ? 'HARDCORE (uzná sa do 50 km)' : 'HARDCORE (písanie)');
    }
    if (apm === 'quiz' || apm === 'map' || apm === 'click') {
      const eu = apm !== 'quiz';
      h += '<span class="filter-break"></span>' + lab('REGION:', true) +
        chip(c==='all', 'apcat', 'all', 'ALL') + chip(c==='sk', 'apcat', 'sk', 'SK LETISKÁ') +
        chip(c==='neigh', 'apcat', 'neigh', 'SUSEDNÉ ŠTÁTY') + chip(c==='other', 'apcat', 'other', eu ? 'OSTATNÁ EURÓPA' : 'OSTATNÉ');
    }
    if (apm === 'prefix') {
      h += '<span class="filter-break"></span>' + lab('KÓDY:', true) +
        chip(F.apPx==='doc', 'appx', 'doc', 'Z PREZENTÁCIE') + chip(F.apPx==='all', 'appx', 'all', 'VŠETKY (aj doplnené z Doc 7910)');
    }
    if (apm !== 'study') {
      const weakN = (state.apAllIds || []).filter(id => state.mistakes[id] > 0).length;
      h += '<span class="filter-break"></span>' + lab('OPAKOVANIE:', true) +
        chip(F.apWeak, 'apweak', '1', `LEN SLABÉ MIESTA (${weakN})`) +
        `<span class="ap-progress" id="ap-progress">${apProgressText()}</span>` +
        chip(false, 'apclear', '1', 'VYMAZAŤ POKROK');
      if (state.apNote) h += `<span class="ap-note">${state.apNote}</span>`;
    }
    el.innerHTML = h;
    const on = (attr, fn) => el.querySelectorAll('[data-' + attr + ']').forEach(b => { b.onclick = () => fn(b.dataset[attr]); });
    on('apmode',  v => { F.apMode = v; startMode(state.mode); });
    on('apans',   v => { F.apAns = v; startMode(state.mode); });
    on('apcat',   v => { F.airportCat = v; startMode(state.mode); });
    on('appx',    v => { F.apPx = v; startMode(state.mode); });
    on('apweak',  () => { F.apWeak = !F.apWeak; startMode(state.mode); });
    on('apclear', () => {
      if (!confirm('Vymazať uložený pokrok a slabé miesta MOD 02?')) return;
      apClearProgress(apIsMod02); F.apWeak = false; startMode(state.mode);
    });
  } else if (state.mode === 'callsign') {
    const F = state.filters, cat = F.callsignCat, L = F.csLetter, m = F.csMode;
    const lab = (t) => `<span style="font-size:10px;letter-spacing:0.15em;color:var(--text-faint);align-self:center;margin:0 6px 0 0">${t}</span>`;
    const chip = (on, attr, val, txt) => `<button class="filter-chip ${on ? 'on' : ''}" data-${attr}="${val}">${txt}</button>`;
    const br = '<span class="filter-break"></span>';
    /* písmená sa ponúkajú len tie, ktoré vo zvolenej kategórii naozaj sú */
    const inCat = CALLSIGNS.filter(c => csInCat(c, cat));
    const letters = [...new Set(inCat.map(c => c.icao.charAt(0)))].sort();
    const sel = csSelection(), packs = Math.ceil(sel.length / CS_PACK);
    const byL = inCat.filter(c => L === 'all' || c.icao.charAt(0) === L);
    let h = lab('REŽIM:') + chip(m==='quiz', 'csmode', 'quiz', 'KVÍZ') + chip(m==='cards', 'csmode', 'cards', 'KARTIČKY') + chip(m==='list', 'csmode', 'list', 'ZOZNAM');
    if (m === 'quiz') h += br + lab('OBTIAŽNOSŤ:') + chip(F.csAns==='choice', 'csans', 'choice', 'ĽAHKÁ (výber zo 4 možností)') + chip(F.csAns==='type', 'csans', 'type', 'HARDCORE (písanie)');
    if (m !== 'list') h += br + lab('SMER:') + chip(F.csDir==='both', 'csdir', 'both', 'OBOJE') + chip(F.csDir==='i2c', 'csdir', 'i2c', 'KÓD → VOLAČKA') + chip(F.csDir==='c2i', 'csdir', 'c2i', 'VOLAČKA → KÓD');
    h += br + lab('VÝBER:') + chip(cat==='all', 'cscat', 'all', `VŠETKY (${CALLSIGNS.length})`) + chip(cat==='top', 'cscat', 'top', `NAJPOUŽÍVANEJŠIE NA SIMULÁTORE (${CALLSIGNS.filter(c => c.sim).length})`) + chip(cat==='sk', 'cscat', 'sk', 'CEZ SLOVENSKO') + chip(cat==='other', 'cscat', 'other', 'OSTATNÉ');
    h += br + lab('PORADIE:') + chip(F.csOrder==='freq', 'csorder', 'freq', 'NAJPOUŽÍVANEJŠIE AKO PRVÉ') + chip(F.csOrder==='rand', 'csorder', 'rand', 'NÁHODNE');
    h += br + lab('TYP:') + chip(F.csKind==='all', 'cskind', 'all', `VŠETKY (${byL.length})`) +
      chip(F.csKind==='hard', 'cskind', 'hard', `BEZ SÚVISU — TREBA VEDIEŤ (${byL.filter(c => !c.logical).length})`) +
      chip(F.csKind==='logical', 'cskind', 'logical', `KÓD VO VOLAČKE (${byL.filter(c => c.logical).length})`);
    h += br + lab('PÍSMENO:') + chip(L==='all', 'csl', 'all', 'VŠETKY') + letters.map(x => chip(L===x, 'csl', x, x)).join('');
    if (packs > 1) {
      let opts = `<option value="0">celý výber (${sel.length})</option>`;
      for (let p = 1; p <= packs; p++) {
        const part = sel.slice((p - 1) * CS_PACK, p * CS_PACK);
        opts += `<option value="${p}" ${F.csPack === p ? 'selected' : ''}>${p} / ${packs} · ${part[0].icao}–${part[part.length-1].icao} (${part.length})</option>`;
      }
      h += br + lab('BALÍČEK PO ' + CS_PACK + ':') + `<select class="cs-pack" id="cs-pack">${opts}</select>` +
        (F.csPack ? chip(false, 'cspk', 'prev', '◀') + chip(false, 'cspk', 'next', 'ĎALŠÍ BALÍČEK ▶') : '');
    }
    if (m !== 'list') {
      const weakN = (state.apAllIds || []).filter(id => state.mistakes[id] > 0).length;
      h += br + lab('OPAKOVANIE:') + chip(F.csWeak, 'csweak', '1', `LEN SLABÉ MIESTA (${weakN})`) +
        `<span class="ap-progress" id="ap-progress">${apProgressText()}</span>` + chip(false, 'csclear', '1', 'VYMAZAŤ POKROK');
      if (state.csNote) h += `<span class="ap-note">${state.csNote}</span>`;
    }
    el.innerHTML = h;
    const on = (attr, fn) => el.querySelectorAll('[data-' + attr + ']').forEach(b => { b.onclick = () => fn(b.dataset[attr]); });
    const go = () => startMode(state.mode);
    on('csmode', v => { F.csMode = v; go(); });
    on('csans',  v => { F.csAns = v; go(); });
    on('csdir',  v => { F.csDir = v; go(); });
    /* zmena výberu zmení aj hranice balíčkov, takže sa začína od celku */
    on('cscat',  v => { F.callsignCat = v; F.csLetter = 'all'; F.csPack = 0; go(); });
    on('cskind', v => { F.csKind = v; F.csPack = 0; go(); });
    on('csorder', v => { F.csOrder = v; F.csPack = 0; go(); });
    on('csl',    v => { F.csLetter = v; F.csPack = 0; go(); });
    on('cspk',   v => { F.csPack = v === 'next' ? (F.csPack % packs) + 1 : (F.csPack > 1 ? F.csPack - 1 : packs); go(); });
    on('csweak', () => { F.csWeak = !F.csWeak; go(); });
    on('csclear', () => {
      if (!confirm('Vymazať uložený pokrok a slabé miesta MOD 03?')) return;
      apClearProgress(apIsMod03); F.csWeak = false; go();
    });
    const pk = document.getElementById('cs-pack');
    if (pk) pk.onchange = () => { F.csPack = +pk.value; go(); };
  } else if (state.mode === 'waypoint') {
    const hard = state.filters.wpDiff === 'hard';
    const wpm = state.filters.wpMode;
    const g = state.filters.wpGrp;
    const modeToggle = `
      <span style="font-size:10px;letter-spacing:0.15em;color:var(--text-faint);align-self:center;margin-right:6px">REŽIM:</span>
      <button class="filter-chip ${wpm==='quiz'?'on':''}" data-wpmode="quiz">NÁJDI BOD</button>
      <button class="filter-chip ${wpm==='name'?'on':''}" data-wpmode="name">POMENUJ BOD</button>
      <button class="filter-chip ${wpm==='blind'?'on':''}" data-wpmode="blind">SLEPÁ MAPA</button>
      <button class="filter-chip ${wpm==='study'?'on':''}" data-wpmode="study">ŠTÚDIUM</button>`;
    /* obtiažnosť znamená v každom režime niečo iné: pri hľadaní počet
       kandidátov, pri pomenovaní to, koľko okolia dostaneš pomenovaného */
    const diffLabels = wpm === 'name'
      ? ['ĽAHKÁ (susedia s menami)', 'HARDCORE (celý sektor, bez mien)']
      : wpm === 'blind' ? ['ĽAHKÁ (prvé písmeno ako nápoveda)', 'HARDCORE (bez nápovede)']
      : ['ĽAHKÁ (5 bodov)', 'HARDCORE (všetky)'];
    const difficulty = (wpm === 'study') ? '' : `
      <span style="font-size:10px;letter-spacing:0.15em;color:var(--text-faint);align-self:center;margin:0 6px">OBTIAŽNOSŤ:</span>
      <button class="filter-chip ${!hard?'on':''}" data-wpdiff="easy">${diffLabels[0]}</button>
      <button class="filter-chip ${hard?'on':''}" data-wpdiff="hard">${diffLabels[1]}</button>`;
    const borderPins = `
      <span style="font-size:10px;letter-spacing:0.15em;color:var(--text-faint);align-self:center;margin:0 6px">BODY:</span>
      <button class="filter-chip ${state.filters.wpBorder!=='border'?'on':''}" data-wpb="all">VŠETKY</button>
      <button class="filter-chip ${state.filters.wpBorder==='border'?'on':''}" data-wpb="border">IBA HRANIČNÉ</button>`;
    const sectorPins = `
      <span style="font-size:10px;letter-spacing:0.15em;color:var(--text-faint);align-self:center;margin:0 6px">SEKTOR:</span>
      <button class="filter-chip ${g==='all'?'on':''}" data-wpgrp="all">CELÁ FIR</button>
      <button class="filter-chip ${g==='W'?'on':''}" data-wpgrp="W">WEST</button>
      <button class="filter-chip ${g==='C'?'on':''}" data-wpgrp="C">CENTRAL</button>
      <button class="filter-chip ${g==='E'?'on':''}" data-wpgrp="E">EAST</button>
      <button class="filter-chip ${g==='NAV'?'on':''}" data-wpgrp="NAV">NAVAIDY</button>`;
    el.innerHTML = modeToggle + difficulty + borderPins + sectorPins;
    /* zmena výberu bodov zahodí rozpracovanú slepú mapu — čísla by už nesedeli */
    el.querySelectorAll('[data-wpb]').forEach(b => {
      b.onclick = () => { state.filters.wpBorder = b.dataset.wpb; state.blind = null; startMode(state.mode); };
    });
    el.querySelectorAll('[data-wpmode]').forEach(b => {
      b.onclick = () => { state.filters.wpMode = b.dataset.wpmode; state.blind = null; startMode(state.mode); };
    });
    el.querySelectorAll('[data-wpdiff]').forEach(b => {
      b.onclick = () => { state.filters.wpDiff = b.dataset.wpdiff; startMode(state.mode); };
    });
    el.querySelectorAll('[data-wpgrp]').forEach(b => {
      b.onclick = () => { state.filters.wpGrp = b.dataset.wpgrp; state.blind = null; startMode(state.mode); };
    });
  } else if (state.mode === 'daily' || state.mode === 'exam') {
    const F = state.filters, ex = state.mode === 'exam';
    const lab = (t) => `<span style="font-size:10px;letter-spacing:0.15em;color:var(--text-faint);align-self:center;margin:0 6px 0 0">${t}</span>`;
    const chip = (on, attr, val, txt) => `<button class="filter-chip ${on ? 'on' : ''}" data-${attr}="${val}">${txt}</button>`;
    const br = '<span class="filter-break"></span>';
    let h = lab('OBTIAŽNOSŤ:') + chip(F.dAns==='choice', 'dans', 'choice', 'ĽAHKÁ (výber z možností)') + chip(F.dAns==='type', 'dans', 'type', 'HARDCORE (písanie)');
    if (ex) {
      h += br + lab('ČAS: ' + examClock(examSecs()) + ' — ' + (F.dAns === 'type' ? '20' : '12') + ' s na otázku');
    } else {
      h += br + lab('POČET OTÁZOK:') + [15, 25, 40].map(n => chip(F.dCount===n, 'dcount', n, n)).join('');
      const I = state.dailyInfo;
      if (I) h += br + lab('ZLOŽENIE:') + `<span class="ap-progress">na opakovanie ${I.due} · slabé miesta ${I.weak} · nová látka ${I.fresh}</span>`;
    }
    el.innerHTML = h;
    const on = (attr, fn) => el.querySelectorAll('[data-' + attr + ']').forEach(b => { b.onclick = () => { fn(b.dataset[attr]); startMode(state.mode); }; });
    on('dans', v => { F.dAns = v; F.wpDiff = v === 'choice' ? 'easy' : 'hard'; });
    on('exn', v => { F.exN = +v; }); on('exmin', v => { F.exMin = +v; }); on('dcount', v => { F.dCount = +v; });
  } else if (state.mode === 'coord') {
    const F = state.filters, m = F.coMode;
    const lab = (t) => `<span style="font-size:10px;letter-spacing:0.15em;color:var(--text-faint);align-self:center;margin:0 6px 0 0">${t}</span>`;
    const chip = (on, attr, val, txt) => `<button class="filter-chip ${on ? 'on' : ''}" data-${attr}="${val}">${txt}</button>`;
    const br = '<span class="filter-break"></span>';
    let h = lab('REŽIM:') + chip(m==='cop', 'comode', 'cop', 'BODY NA MAPE') + chip(m==='freq', 'comode', 'freq', 'FREKVENCIE') +
      chip(m==='vert', 'comode', 'vert', 'VERTIKÁLNE HRANICE') + chip(m==='level', 'comode', 'level', 'HLADINY NA BODOCH') +
      chip(m==='scen', 'comode', 'scen', 'SCENÁR') + chip(m==='fill', 'comode', 'fill', 'DOPLŇOVAČKA') + chip(m==='study', 'comode', 'study', 'ŠTÚDIUM');
    if (m !== 'study') h += br + lab('OBTIAŽNOSŤ:') +
      chip(F.coAns==='choice', 'coans', 'choice', m === 'fill' ? 'ĽAHKÁ (výber z ponuky)' : 'ĽAHKÁ (výber zo 6 možností)') +
      chip(F.coAns==='type', 'coans', 'type', 'HARDCORE (písanie)');
    if (m === 'fill') {
      h += br + lab('TABUĽKA:') + chip(F.coTable==='FREQ', 'cotable', 'FREQ', 'FREKVENCIE') +
        CO_TABLES.map(t => chip(F.coTable===t.id, 'cotable', t.id, t.id + ' ' + CO_NB[t.from].short.split(' ')[0] + ' → ' + CO_NB[t.to].short.split(' ')[0])).join('');
    } else {
      h += br + lab('SUSED:') + chip(F.coNb==='all', 'conb', 'all', 'VŠETCI') +
        (m === 'freq' || m === 'vert' ? chip(F.coNb==='BA', 'conb', 'BA', 'Bratislava') : '') +
        ['WA', 'LV', 'BU', 'WI', 'PR'].map(k => chip(F.coNb===k, 'conb', k, CO_NB[k].short)).join('');
    }
    if (m !== 'study' && m !== 'fill') {
      const weakN = (state.apAllIds || []).filter(id => state.mistakes[id] > 0).length;
      h += br + lab('OPAKOVANIE:') + chip(F.coWeak, 'coweak', '1', `LEN SLABÉ MIESTA (${weakN})`) +
        `<span class="ap-progress" id="ap-progress">${apProgressText()}</span>` + chip(false, 'coclear', '1', 'VYMAZAŤ POKROK');
      if (state.coNote) h += `<span class="ap-note">${state.coNote}</span>`;
    }
    el.innerHTML = h;
    const on = (attr, fn) => el.querySelectorAll('[data-' + attr + ']').forEach(b => { b.onclick = () => fn(b.dataset[attr]); });
    const go = () => startMode(state.mode);
    on('comode', v => { F.coMode = v; if (F.coNb === 'BA' && v !== 'freq' && v !== 'vert') F.coNb = 'all'; go(); });
    on('coans', v => { F.coAns = v; state.coFill = null; go(); });
    on('conb', v => { F.coNb = v; go(); });
    on('cotable', v => { F.coTable = v; state.coFill = null; go(); });
    on('coweak', () => { F.coWeak = !F.coWeak; go(); });
    on('coclear', () => { if (!confirm('Vymazať uložený pokrok a slabé miesta MOD 06?')) return; apClearProgress(apIsMod06); F.coWeak = false; go(); });
  } else if (state.mode === 'heading') {
    const F = state.filters;
    const lab = (t) => `<span style="font-size:10px;letter-spacing:0.15em;color:var(--text-faint);align-self:center;margin:0 6px 0 0">${t}</span>`;
    const chip = (on, attr, val, txt) => `<button class="filter-chip ${on ? 'on' : ''}" data-${attr}="${val}">${txt}</button>`;
    const br = '<span class="filter-break"></span>';
    const mv = F.hgMode === 'move';
    const cl = F.hgMode === 'calc';
    let h = lab('REŽIM:') + chip(F.hgMode==='static', 'hgmode', 'static', 'STATICKÝ') + chip(mv, 'hgmode', 'move', 'POHYBLIVÝ') + chip(cl, 'hgmode', 'calc', 'POČTY S KURZOM');
    h += br + lab('OBTIAŽNOSŤ:') + chip(F.hgDiff==='easy', 'hgdiff', 'easy', cl ? 'ĽAHKÁ (po 10°, s pravidlom)' : mv ? 'ĽAHKÁ (pomalšie, široká bránka)' : 'ĽAHKÁ (uzná aj o 5° vedľa)') +
      chip(F.hgDiff==='hard', 'hgdiff', 'hard', cl ? 'HARDCORE (po 5°, bez pravidla)' : mv ? 'HARDCORE (rýchlo, úzka bránka)' : 'HARDCORE (len presný kurz)');
    if (cl) h += br + lab('TYP ÚLOHY:') + chip(F.hcKind==='all', 'hckind', 'all', 'VŠETKY') + chip(F.hcKind==='recip', 'hckind', 'recip', 'OPAČNÝ KURZ') + chip(F.hcKind==='turn', 'hckind', 'turn', 'ZATÁČKA O X°') + chip(F.hcKind==='short', 'hckind', 'short', 'KRATŠIA ZATÁČKA');
    if (mv) {
      h += br + lab('CIEĽ:') + chip(F.hgKind==='gate', 'hgkind', 'gate', 'BRÁNKY') + chip(F.hgKind==='city', 'hgkind', 'city', 'MIESTA') + chip(F.hgKind==='fra', 'hgkind', 'fra', 'BODY FRA');
      if (F.hgKind !== 'gate') h += br + lab('NÁZVY NA MAPE:') + chip(F.hgNames==='on', 'hgnames', 'on', 'ZAPNUTÉ') + chip(F.hgNames==='off', 'hgnames', 'off', 'VYPNUTÉ (ťažšie)');
    }
    if (!cl) h += br + lab('RUŽICA:') + chip(F.hgRose==='off', 'hgrose', 'off', 'VYPNUTÁ') + chip(F.hgRose==='on', 'hgrose', 'on', 'ZAPNUTÁ (pomôcka)');
    el.innerHTML = h;
    ['hgmode', 'hgdiff', 'hgkind', 'hgnames', 'hgrose', 'hckind'].forEach(attr => {
      const key = { hckind: 'hcKind', hgmode: 'hgMode', hgdiff: 'hgDiff', hgkind: 'hgKind', hgnames: 'hgNames', hgrose: 'hgRose' }[attr];
      el.querySelectorAll('[data-' + attr + ']').forEach(b => { b.onclick = () => { F[key] = b.dataset[attr]; startMode(state.mode); }; });
    });
  }
  renderModeHelp();
  layoutFilters();
}

/* Filtre sa skladajú ako rad štítkov a tlačidiel; tu sa preskupia do
   tabuľky: v ľavom stĺpci názov riadku, v pravom jeho voľby. Presúvajú
   sa existujúce prvky, takže ich ovládanie ostáva funkčné. */
function layoutFilters() {
  const el = document.getElementById('filters');
  const nodes = Array.prototype.slice.call(el.children);
  const table = document.createElement('div');
  table.className = 'f-table';
  let help = null, opts = null;
  nodes.forEach(n => {
    if (n.classList.contains('mode-help')) { help = n; return; }
    if (n.classList.contains('filter-break')) return;
    const isLabel = n.tagName === 'SPAN' && !n.className && /:\s*$/.test(n.textContent);
    if (isLabel || !opts) {
      const row = document.createElement('div'); row.className = 'f-row';
      const lab = document.createElement('div'); lab.className = 'f-lab';
      lab.textContent = isLabel ? n.textContent.replace(/:\s*$/, '') : '';
      opts = document.createElement('div'); opts.className = 'f-opts';
      row.appendChild(lab); row.appendChild(opts); table.appendChild(row);
      if (isLabel) return;
    }
    opts.appendChild(n);
  });
  el.innerHTML = '';
  if (help) el.appendChild(help);
  if (table.children.length) el.appendChild(table);
}
