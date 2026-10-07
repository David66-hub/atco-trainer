/* ============================================================
   QUESTION BUILDERS
   ============================================================ */
function buildAircraftQuestions() {
  if (state.filters.acMode === 'cmp') return buildAcPairQuestions();
  let pool = AIRCRAFT;
  if (state.filters.wake !== 'all') pool = pool.filter(a => a.wake === state.filters.wake);
  return shuffle(pool).map(a => ({ type: 'aircraft', id: 'AC_' + a.icao, data: a, accept: a.accept }));
}
function buildAirportQuestions() {
  const F = state.filters, m = F.apMode;
  let list = [];
  if (m === 'prefix') {
    list = buildPrefixQuestions();
  } else {
    let pool = AIRPORTS;
    if (F.airportCat !== 'all') pool = pool.filter(a => a.cat === F.airportCat);
    /* v režimoch s mapou len letiská, ktoré sa dajú na mape ukázať */
    if (m === 'map' || m === 'click') pool = pool.filter(airportOnMap);
    pool.forEach(ap => {
      if (m === 'click') {
        list.push({ type: 'airport', subtype: 'icao-to-city', click: true, id: 'AP_KI_' + ap.icao, data: ap, accept: [ap.icao] });
        list.push({ type: 'airport', subtype: 'city-to-icao', click: true, id: 'AP_KC_' + ap.icao, data: ap, accept: [ap.icao] });
        return;
      }
      list.push({ type: 'airport', subtype: 'icao-to-city', id: 'AP_I2C_' + ap.icao, data: ap,
        accept: [ap.city] });
      list.push({ type: 'airport', subtype: 'city-to-icao', id: 'AP_C2I_' + ap.icao, data: ap,
        accept: [ap.icao] });
    });
  }
  state.apAllIds = list.map(q => q.id);
  state.apNote = '';
  /* LEN SLABÉ MIESTA: otázky, ktoré máš zapísané ako chybu */
  if (F.apWeak) {
    const weak = list.filter(q => state.mistakes[q.id] > 0);
    if (weak.length) list = weak;
    else { F.apWeak = false; state.apNote = 'V tomto výbere nemáš žiadne slabé miesta — idú všetky otázky.'; }
  }
  return shuffle(list);
}
function buildCallsignQuestions() {
  const F = state.filters, pool = csPool();
  /* jedna otázka na kód a jedna na volačku — duplicity z dokumentu
     sa zlúčia a uzná sa ktorákoľvek platná odpoveď */
  let list = [];
  const seen = {};
  pool.forEach(cs => {
    if (F.csDir !== 'c2i' && !seen['I' + cs.icao]) {
      seen['I' + cs.icao] = 1;
      const g = CS_BY_ICAO[cs.icao];
      list.push({ type: 'callsign', subtype: 'icao-to-call', id: 'CS_I2C_' + cs.icao, data: cs, group: g,
        accept: g.map(c => c.call) });
    }
    if (F.csDir !== 'i2c' && !seen['C' + cs.call]) {
      seen['C' + cs.call] = 1;
      const g = CS_BY_CALL[cs.call];
      list.push({ type: 'callsign', subtype: 'call-to-icao', id: 'CS_C2I_' + cs.icao, data: cs, group: g,
        accept: g.map(c => c.icao) });
    }
  });
  state.apAllIds = list.map(q => q.id);
  state.csNote = '';
  if (F.csWeak) {
    const weak = list.filter(q => state.mistakes[q.id] > 0);
    if (weak.length) list = weak;
    else { F.csWeak = false; state.csNote = 'V tomto výbere nemáš žiadne slabé miesta — idú všetky otázky.'; }
  }
  /* každá volačka len RAZ za cvičenie: pri oboch smeroch sa vyberie jeden
     (prednosť má ten, ktorý ešte nevieš) */
  const today = dayNow();
  const known = q => { const r = state.sr[q.id]; return !!(r && r.b > 0 && r.due > today && !(state.mistakes[q.id] > 0)); };
  const byCs = {}, doneCs = {};
  list.forEach(q => { const k = q.data.icao + '|' + q.data.call; (byCs[k] = byCs[k] || []).push(q); if (known(q)) doneCs[k] = 1; });
  /* stačí jeden správne zodpovedaný smer a volačka sa berie ako hotová */
  const done = q => !!doneCs[q.data.icao + '|' + q.data.call];
  if (F.csOnce !== false) list = Object.keys(byCs).map(k => {
    const g = shuffle(byCs[k]);
    return g.find(q => !known(q)) || g[0];
  });
  /* čo si už zodpovedal správne (a ešte neprišiel čas na opakovanie), ide až na koniec */
  const order = l => F.csOrder !== 'freq' ? shuffle(l) : (() => {
    /* frekvencia zo simulátora dáva len PREDNOSŤ v poradí — nič sa neopakuje */
    l.forEach(q => { q.w = Math.max.apply(null, q.group.map(c => c.freq)); });
    const inSim = q => q.group.some(c => c.sim);
    return csWeightedOrder(l.filter(inSim)).concat(shuffle(l.filter(q => !inSim(q))));
  })();
  return order(list.filter(q => !done(q))).concat(order(list.filter(done)));
}
/* Volačiek je vyše tisíc a mnohé sa líšia jediným písmenom
   (BEXJET / BEEJET). Tolerancia preklepov preto nesmie uznať odpoveď,
   ktorá je presne INÁ volačka alebo iný kód z dokumentu. */
function callsignClash(val, q) {
  if (q.type !== 'callsign') return false;
  const u = normalize(val);
  if (q.accept.some(a => normalize(a) === u)) return false;
  const map = q.subtype === 'icao-to-call' ? CS_BY_CALL : CS_BY_ICAO;
  return Object.keys(map).some(k => normalize(k) === u);
}

/* ============================================================
   MOD 04 — HRANIČNÉ BODY A SLEPÁ MAPA
   ------------------------------------------------------------
   „Hraničný bod" sa počíta GEOMETRICKY a nie z poľa `type`:
   písmená E/X (Entry/Exit) sú v dátach vyplnené len pri 10 bodoch
   a len na severe a východe — západ a juh ich nemajú vôbec. Filter
   postavený na nich by dal krivý a neúplný výber. Vzdialenosť od
   obrysu FIR je úplná a overiteľná: 42 bodov leží do 2 NM od
   hranice a ďalej je zreteľná medzera.
   ============================================================ */

const WP_BORDER_NM = 2;

/* najkratšia vzdialenosť bodu od HRANY obrysu (nie od vrcholu) */
function wpDistToBoundary(p) {
  const O = FIR_OUTLINE;
  const k = Math.cos(p.lat * Math.PI / 180);
  let best = Infinity;
  for (let i = 0; i < O.length; i++) {
    const a = O[i], b = O[(i + 1) % O.length];
    const ax = (a[0] - p.lon) * 60 * k, ay = (a[1] - p.lat) * 60;
    const bx = (b[0] - p.lon) * 60 * k, by = (b[1] - p.lat) * 60;
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    let t = L ? -((ax * dx + ay * dy) / L) : 0;
    t = Math.max(0, Math.min(1, t));
    best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return best;
}

/* výsledok sa počíta raz a drží na bode — mapa sa prekresľuje často */
function wpIsBorder(w) {
  if (w._bd === undefined) w._bd = wpDistToBoundary(w);
  return w._bd <= WP_BORDER_NM;
}

/* Poloha bodu POZDĹŽ hranice, meraná ako prejdená dĺžka obrysu.
   Triedenie podľa azimutu od stredu tu nestačí: FIR je pretiahnutý
   a členitý, takže pri zálivoch dva susedné body dostanú veľmi
   odlišný uhol a číslovanie preskakuje (KEKED → KENIN a pod.). */
function wpArcPos(p) {
  const O = FIR_OUTLINE;
  const k = Math.cos(p.lat * Math.PI / 180);
  let cum = 0, best = Infinity, bestPos = 0;
  for (let i = 0; i < O.length; i++) {
    const a = O[i], b = O[(i + 1) % O.length];
    const ax = (a[0] - p.lon) * 60 * k, ay = (a[1] - p.lat) * 60;
    const bx = (b[0] - p.lon) * 60 * k, by = (b[1] - p.lat) * 60;
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    const segLen = Math.sqrt(L2);
    let t = L2 ? -((ax * dx + ay * dy) / L2) : 0;
    t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(ax + t * dx, ay + t * dy);
    if (d < best) { best = d; bestPos = cum + t * segLen; }
    cum += segLen;
  }
  return { pos: bestPos, total: cum };
}

/* ============================================================
   SLEPÁ MAPA — všetky body naraz, ku každému políčko.
   Cieľom je prejsť hranicu ako celok, nie hádať bod po bode.
   ============================================================ */
function blindPool() {
  const pool = filterBySector(WAYPOINTS).slice();
  if (!pool.length) return pool;
  pool.forEach(w => { if (w._arc === undefined) w._arc = wpArcPos(w).pos; });
  pool.sort((a, b) => a._arc - b._arc);
  if (pool.length < 3) return pool;

  const total = wpArcPos(pool[0]).total;
  /* Medzery medzi susednými bodmi po obvode, vrátane tej cez koniec. */
  const gap = i => (i === pool.length - 1)
    ? (total - pool[i]._arc + pool[0]._arc)
    : (pool[i + 1]._arc - pool[i]._arc);
  let maxI = 0, maxG = 0, steps = [];
  for (let i = 0; i < pool.length; i++) { const g = gap(i); steps.push(g); if (g > maxG) { maxG = g; maxI = i; } }
  const median = steps.slice().sort((a, b) => a - b)[Math.floor(steps.length / 2)];

  /* Sektorový filter vyberá body, ktoré na hranici NIE SÚ súvislé
     (EAST leží v dvoch úsekoch, CENTRAL v troch). Číslovanie preto
     začne za najväčšou medzerou — tá potom padne medzi posledné a prvé
     číslo namiesto doprostred radu. Pri súvislom výbere sa začína na
     severe. Prah 3,5× mediánu: pri 2,5× sa pravidlo zaplo aj pre celú
     FIR a číslovanie začínalo na juhovýchode. */
  let startIdx;
  if (maxG > median * 3.5) startIdx = (maxI + 1) % pool.length;
  else { startIdx = 0; for (let i = 1; i < pool.length; i++) if (pool[i].lat > pool[startIdx].lat) startIdx = i; }
  return pool.slice(startIdx).concat(pool.slice(0, startIdx));
}

function buildBlindSVG(points, answers, checked) {
  const P = MAP_PROJ;
  const { firPath, cities } = mapBaseParts();
  const placed = [];
  const collides = (lx, ly) => placed.some(p => Math.abs(p.x - lx) < 22 && Math.abs(p.y - ly) < 9);
  const out = [];
  points.forEach((c, i) => {
    const x = projX(c.lon), y = projY(c.lat);
    const n = i + 1;
    let cls = 'blind-dot';
    if (checked) cls += (answers[i] || '').trim().toUpperCase() === c.name ? ' ok' : ' no';
    out.push(`<circle class="${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"></circle>`);
    const tries = [[x+9,y-6],[x+9,y+12],[x-9,y-6],[x-9,y+12],[x,y-12],[x,y+17]];
    let ch = tries[0];
    for (const t of tries) { if (!collides(t[0], t[1])) { ch = t; break; } }
    placed.push({ x: ch[0], y: ch[1] });
    out.push(`<text class="blind-num" x="${ch[0].toFixed(1)}" y="${ch[1].toFixed(1)}">${n}</text>`);
    if (checked)
      out.push(`<text class="blind-ans" x="${ch[0].toFixed(1)}" y="${(ch[1]+10).toFixed(1)}">${c.name}</text>`);
  });
  return `<svg viewBox="0 0 ${P.w} ${P.h.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" id="map-svg">
    <rect x="0" y="0" width="${P.w}" height="${P.h.toFixed(0)}" fill="#fbfdfc"></rect>
    <path d="${firPath}" fill="#eef6f0" stroke="var(--border-bright)" stroke-width="1.5"></path>
    ${cities}${out.join('')}
  </svg>`;
}

function blindCountLabel(filled, total) {
  return `vyplnené ${filled} z ${total} — vyhodnotiť môžeš kedykoľvek, zvyšok sa doplní`;
}

function renderWaypointBlind(card) {
  const pool = blindPool();
  const B = state.blind || (state.blind = { answers: [], checked: false });
  if (B.answers.length !== pool.length) { B.answers = pool.map(() => ''); B.checked = false; }
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = pool.length + ' bodov';

  const filled = B.answers.filter(a => a.trim()).length;
  const score = B.checked
    ? pool.reduce((n, w, i) => n + ((B.answers[i] || '').trim().toUpperCase() === w.name ? 1 : 0), 0)
    : 0;

  const inputs = pool.map((w, i) => {
    const v = (B.answers[i] || '').trim();
    const ok = B.checked && v.toUpperCase() === w.name;
    /* Po vyhodnotení sa do políčka doplní SPRÁVNY názov — aj tam, kde
       ostalo prázdne, aj tam, kde bola chyba. Pôvodná odpoveď zostane
       vedľa prečiarknutá, inak by si videl len riešenie a nie svoju chybu. */
    const shown = B.checked ? (ok ? v : w.name) : v;
    const cls = B.checked ? (ok ? 'blind-in ok' : 'blind-in fixed') : 'blind-in';
    const was = (B.checked && !ok && v) ? `<span class="blind-was">${v.toUpperCase().replace(/</g,'&lt;')}</span>` : '';
    return `<div class="blind-cell">
      <span class="blind-n">${i + 1}</span>
      <input class="${cls}" data-bi="${i}" value="${shown.replace(/"/g,'&quot;')}"
             ${B.checked ? 'disabled' : ''} placeholder="${state.filters.wpDiff === 'hard' ? '' : w.name.charAt(0) + '····'}" autocomplete="off" spellcheck="false" maxlength="10">
      ${was}
    </div>`;
  }).join('');

  card.innerHTML = `
    <div class="qmeta">FRA SIGNIFICANT POINTS <span class="sep">·</span> SLEPÁ MAPA — POMENUJ KAŽDÝ BOD</div>
    <div class="map-prompt"><span class="mp-label">${
      B.checked ? `${score} z ${pool.length} správne — zvyšok je nižšie doplnený červeným`
                : blindCountLabel(filled, pool.length)
    }</span></div>
    <div class="map-wrap">${buildBlindSVG(pool, B.answers, B.checked)}</div>
    <div class="blind-grid">${inputs}</div>
    <div class="blind-actions">
      <button class="btn" id="blind-check" ${B.checked || !pool.length ? 'disabled' : ''}>VYHODNOTIŤ</button>
      <button class="btn ghost" id="blind-reset">${B.checked ? 'SKÚSIŤ ZNOVA' : 'VYMAZAŤ'}</button>
    </div>`;

  card.querySelectorAll('[data-bi]').forEach(inp => {
    inp.oninput = () => { B.answers[+inp.dataset.bi] = inp.value; blindRefreshCount(pool.length); };
    inp.onkeydown = e => {
      if (e.key !== 'Enter') return;
      const next = card.querySelector(`[data-bi="${+inp.dataset.bi + 1}"]`);
      if (next) next.focus(); else { const c = document.getElementById('blind-check'); if (c) c.focus(); }
    };
  });
  const chk = document.getElementById('blind-check');
  if (chk) chk.onclick = () => { B.checked = true; renderQuestion(); };
  const rst = document.getElementById('blind-reset');
  if (rst) rst.onclick = () => { state.blind = { answers: pool.map(() => ''), checked: false }; renderQuestion(); };
}

/* Prepočet počítadla bez prekreslenia celej karty — inak by input
   pri každom písmene stratil kurzor. */
function blindRefreshCount(total) {
  const B = state.blind; if (!B) return;
  const filled = B.answers.filter(a => a.trim()).length;
  const lbl = document.querySelector('#qcard .mp-label');
  if (lbl) lbl.textContent = blindCountLabel(filled, total);
}

function filterBySector(pool) {
  /* Filter hraničných bodov je ZÁMERNE tu, a nie v jednotlivých
     režimoch — takto platí naraz pre všetky cvičenia MOD 04. */
  if (state.filters.wpBorder === 'border') pool = pool.filter(wpIsBorder);
  const g = state.filters.wpGrp;
  if (g === 'all' || !g) return pool;
  if (g === 'NAV') return pool.filter(w => w.kind === 'nav');
  // W / C / E sector codes
  return pool.filter(w => w.sec === g);
}
function buildWaypointQuestions() {
  const pool = filterBySector(WAYPOINTS);
  /* 'find' = meno je zadanie a hľadá sa bod, 'name' = bod je zadanie a píše sa meno */
  const sub = state.filters.wpMode === 'name' ? 'name' : 'find';
  return shuffle(pool).map(w => ({ type: 'waypoint', subtype: sub, id: 'WP_' + w.name, data: w, accept: [w.name] }));
}
function buildQueue() {
  switch(state.mode) {
    case 'home':     return [];   // úvod nemá otázky
    case 'conquer':  return [];   // hra a rebríček majú vlastné stránky
    case 'rank':     return [];
    case 'daily':    return buildDaily();
    case 'exam':     return [];   // skúšku spúšťa až tlačidlo
    case 'aircraft': return buildAircraftQuestions();
    case 'airport':  return buildAirportQuestions();
    case 'callsign': return buildCallsignQuestions();
    case 'waypoint': return buildWaypointQuestions();
    case 'heading':  return [];   // MOD 05 nemá otázky, beží ako hra
    case 'coord':    return (state.filters.coMode === 'fill' || state.filters.coMode === 'study') ? [] : buildCoordQuestions();
  }
}

/* Pick the candidate dots shown for a given target.
   EASY = target + 4 nearest neighbours (5 total).
   HARD = every point currently in the filtered pool. */
function waypointCandidates(target) {
  if (state.filters.wpDiff === 'hard') {
    return filterBySector(WAYPOINTS);
  }
  // easy: nearest 4 by projected distance + target (distractors from full map = realistic)
  const others = WAYPOINTS.filter(w => w.name !== target.name).map(w => {
    const dx = projX(w.lon) - projX(target.lon);
    const dy = projY(w.lat) - projY(target.lat);
    return { w, d: dx*dx + dy*dy };
  }).sort((a,b) => a.d - b.d).slice(0, 4).map(o => o.w);
  return shuffle([target, ...others]);
}

/* ============================================================
   HINT GENERATORS - progressive hints for each question type
   ============================================================ */
function generateHints(q) {
  if (q.type === 'acpair') return [];
  if (q.type === 'coord') return coHints(q);
  if (q.type === 'aircraft') return q.data.hints.slice();
  if (q.type === 'airport') {
    const ap = q.data;
    if (q.subtype === 'icao-to-city') {
      return [
        `Krajina: ${ap.country}`,
        `${ap.hint}`,
        `Začína na "${ap.city.charAt(0)}", ${ap.city.length} písmen.`,
        `Letisko: ${ap.name}`,
      ];
    } else {
      const firstLetter = ap.icao.charAt(0);
      const regionMap = { L: 'južná/stredná Európa', E: 'severná/západná Európa', K: 'USA', U: 'CIS/Ukrajina', O: 'Stredný východ' };
      const region = regionMap[firstLetter] || '';
      return [
        `Krajina: ${ap.country}${region ? ' (' + region + ')' : ''}`,
        `${ap.hint}`,
        `Začína na "${ap.icao.substring(0,2)}".`,
        `Posledné dve: "${ap.icao.substring(2,4)}".`,
      ];
    }
  }
  if (q.type === 'prefix') {
    const st = q.data, L = st.p.charAt(0), nm = pxShort(st);
    if (q.subtype === 'code-to-state') return [
      `1. písmeno ${L} = oblasť: ${icaoAreaName(L)}`,
      `Štát začína na „${nm.charAt(0)}“, ${nm.length} znakov.`,
    ];
    return [
      `Oblasť: ${icaoAreaName(L)}`,
      `Prvé písmeno prefixu: ${L}`,
    ];
  }
  if (q.type === 'callsign') {
    /* Nápovedy idú od najslabšej po najsilnejšiu: krajina → tvar slova →
       prevádzkovateľ → obrázok. Pri volačkách bez údajov z Wikipédie
       ostávajú len nápovedy z písmen. */
    const cs = q.data, out = [];
    const flat = cs.call.replace(/\s/g, '');
    if (cs.country) out.push(`Krajina prevádzkovateľa: ${cs.country}${cs.type ? ' · typ: ' + cs.type : ''}`);
    if (q.subtype === 'icao-to-call') {
      const words = cs.call.split(' ').length;
      out.push(`Volačka má ${words === 1 ? 'jedno slovo' : words + ' slová'}, spolu ${flat.length} písmen.`);
      out.push(cs.logical
        ? `Písmená kódu ${cs.icao} sú vo volačke schované v tomto poradí.`
        : `Kód ${cs.icao} sa vo volačke nenachádza — volačka je iné slovo.`);
      out.push(`Volačka začína na „${cs.call.charAt(0)}“.`);
      if (cs.hint) out.push(cs.hint);
      if (cs.airline) out.push(`Prevádzkovateľ: ${cs.airline}`);
      if (flat.length > 4) out.push(`Prvé tri písmená: „${flat.substring(0, 3)}“.`);
    } else {
      out.push(cs.logical
        ? 'Kód poskladáš z písmen volačky — idú v nej za sebou v tom istom poradí.'
        : 'Kód sa z volačky vyčítať nedá — vychádza z mena prevádzkovateľa.');
      if (cs.hint) out.push(cs.hint);
      if (cs.airline) out.push(`Prevádzkovateľ: ${cs.airline}`);
      out.push(`Kód začína na „${cs.icao.charAt(0)}“.`);
      out.push(`Kód končí na „${cs.icao.charAt(2)}“.`);
    }
    const photo = csPhotoSlot(cs);
    if (photo) out.push('Obrázok prevádzkovateľa:' + photo);
    return out;
  }
  if (q.type === 'waypoint' && q.subtype === 'name') {
    const w = q.data;
    const typeFull = { A:'Príletový', D:'Odletový', E:'Vstupný', I:'Vnútorný', X:'Výstupný' };
    const typeList = (w.type||'').split('').filter(c=>typeFull[c]).map(c=>typeFull[c]).join(', ') || '—';
    const near = nearestPoints(w, 1)[0];
    return [
      `Sektor: ${SECTOR_NAMES[w.sec] || '—'}`,
      `Typ bodu: ${typeList}`,
      `Najbližší bod: ${near ? near.name : '—'}`,
      `Začína na „${w.name.charAt(0)}“, ${w.name.length} písmen.`,
    ];
  }
  return [];
}

/* ============================================================
   PHOTO LOADER - Wikipedia REST API summary endpoint
   Returns the infobox thumbnail (CORS-enabled, stable)
   ============================================================ */
const photoCache = {};
async function loadAircraftPhoto(ac) {
  const box = document.getElementById('ac-photo');
  if (!box) return;
  const setImg = (src) => {
    box.innerHTML = `
      <img src="${src}" alt="aircraft" onerror="this.parentElement.innerHTML='<div class=&quot;photo-loading&quot;>IMAGERY UNAVAILABLE</div>'">
      <div class="photo-corner"><span>▲ INBOUND TRAFFIC</span><span>VIS REC</span></div>
    `;
  };
  if (photoCache[ac.icao]) { setImg(photoCache[ac.icao]); return; }
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${ac.wiki}`;
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error('http ' + r.status);
    const d = await r.json();
    const src = (d.originalimage && d.originalimage.source) || (d.thumbnail && d.thumbnail.source);
    if (!src) throw new Error('no image in summary');
    photoCache[ac.icao] = src;
    setImg(src);
  } catch (e) {
    box.innerHTML = `<div class="photo-loading">IMAGERY UNAVAILABLE<br><span style="font-size:9px;color:var(--text-faint)">${ac.wiki}</span></div>`;
  }
}
