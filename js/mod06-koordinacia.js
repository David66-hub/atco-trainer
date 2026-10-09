/* ============================================================
   MOD 06 — KOORDINÁCIA A FREKVENCIE
   ------------------------------------------------------------
   Obsah je prepísaný z výcvikovej dohody o koordinácii (ACS,
   fáza B): Appendix 1 of Annex B (sektorizácia a frekvencie),
   Annex D (koordinačné body a hladiny) a Annex E. Texty hladín
   a podmienok sú ponechané v angličtine presne ako v tabuľkách.
   Pri dvoch frekvenciách má dokument na strane 40/41 inú hodnotu
   než v tabuľke Annex E (str. 59) — pole `alt`; uznajú sa obe.
   ============================================================ */
const CO_NB = {
  BA: { name: 'BRATISLAVA ACC, ŠTEFÁNIK APP/TWR, KOŠICE APP/TWR', short: 'Bratislava', color: '#0a9d5c' },
  WA: { name: 'WARSAW ACC, KRAKOW APP', short: 'Warsaw / Krakow', color: '#3b82c4' },
  LV: { name: 'L\'VIV ACC', short: 'L\'viv', color: '#8e5bc4' },
  BU: { name: 'BUDAPEST ACC, BUDAPEST APP', short: 'Budapest', color: '#c2603a' },
  WI: { name: 'WIEN ACC, WIEN APP', short: 'Wien', color: '#b06a00' },
  PR: { name: 'PRAHA ACC, BRNO APP', short: 'Praha / Brno', color: '#c62f6a' },
};
const CO_NB_ALT = { WA: ['Warsaw', 'Krakow', 'Varšava', 'Krakov', 'Poľsko'], LV: ['Lviv', 'Ľviv', 'Ľvov', 'Ukrajina'], BU: ['Budapešť', 'Maďarsko'], WI: ['Viedeň', 'Rakúsko', 'Vienna'], PR: ['Praha', 'Brno', 'Česko'] };

/* sektorizácia: g = skupina, n = stanovište, lim = vertikálne hranice, f = frekvencia v MHz */
const CO_UNITS = [
  { g: 'BA', n: 'BRATISLAVA ACC', lim: '8 000 ft AMSL – FL660', f: '134,475' },
  { g: 'BA', n: 'ŠTEFÁNIK APP',   lim: '1 500 ft AMSL – FL125', f: '134,930' },
  { g: 'BA', n: 'ŠTEFÁNIK TWR',   lim: 'GND – 5 000 ft AMSL',   f: '118,305' },
  { g: 'BA', n: 'KOŠICE APP',     lim: '1 000 ft AGL – FL125',  f: '129,355' },
  { g: 'BA', n: 'KOŠICE TWR',     lim: 'GND – 5 000 ft AMSL',   f: '120,405' },
  { g: 'BA', n: 'BRATISLAVA FIC', lim: 'GND – 8 000 ft AMSL',   f: '124,300' },
  { g: 'WA', n: 'WARSAW ACC',     lim: 'FL285 – FL660',         f: '125,450' },
  { g: 'WA', n: 'KRAKOW APP',     lim: 'FL095 – FL285',         f: '121,075' },
  { g: 'WA', n: 'WARSAW FIC',     lim: 'GND – FL095',           f: '' },
  { g: 'LV', n: 'L\'VIV UPPER',   lim: 'FL335 – FL660',         f: '135,600' },
  { g: 'LV', n: 'L\'VIV LOWER',   lim: '5 000 ft – FL335',      f: '118,675', alt: '118,625' },
  { g: 'LV', n: 'L\'VIV FIC',     lim: 'GND – 5 000 ft AMSL',   f: '' },
  { g: 'BU', n: 'BUDAPEST UPPER', lim: 'FL335 – FL660',         f: '135,205' },
  { g: 'BU', n: 'BUDAPEST LOWER', lim: 'FL195 – FL335',         f: '133,200', ch: '133,205' },
  { g: 'BU', n: 'BUDAPEST APP',   lim: '1 500 ft – FL195',      f: '122,975', ch: '122,980' },
  { g: 'BU', n: 'BUDAPEST FIC',   lim: 'GND – 9 500 ft AMSL',   f: '' },
  { g: 'WI', n: 'WIEN UPPER',     lim: 'FL345 – FL660',         f: '133,985', alt: '132,160' },
  { g: 'WI', n: 'WIEN LOWER',     lim: 'FL245 – FL345',         f: '134,440' },
  { g: 'WI', n: 'WIEN APP',       lim: '4 500 ft – FL245',      f: '125,175' },
  { g: 'WI', n: 'WIEN FIC',       lim: 'GND – 4 500 ft AMSL',   f: '' },
  { g: 'PR', n: 'PRAHA UPPER',    lim: 'FL345 – FL660',         f: '134,590' },
  { g: 'PR', n: 'PRAHA LOWER',    lim: 'FL125 – FL345',         f: '127,125' },
  { g: 'PR', n: 'BRNO APP',       lim: '1 500 ft – FL125',      f: '127,350' },
  { g: 'PR', n: 'PRAHA FIC',      lim: 'GND – FL095',           f: '' },
];

/* Annex D.2 — riadok = [ATS-Route, let, COP, Level Allocation, Special Conditions] */
const CO_TABLES = [
  { id: 'D.2.1', from: 'BA', to: 'WA', title: 'Flights from BRATISLAVA ACC to WARSAW ACC, KRAKOW APP', rows: [
    ['R/UR23, L/UL853', 'DEST EPKK', 'MEBAN', 'descending FL250', 'FL280 or below'],
    ['R/UR23, L/UL853', 'other flights', 'MEBAN', 'eastbound FLs', ''],
    ['B/UB7', 'DEST EPKK', 'LENOV', 'descending FL260', 'FL280 or below'],
    ['B/UB7', 'other flights', 'LENOV', 'westbound FLs', ''],
    ['Z/UZ500, M/UM173', '', 'PODAN', 'eastbound FLs', ''] ] },
  { id: 'D.2.2', from: 'WA', to: 'BA', title: 'Flights from WARSAW ACC, KRAKOW APP to BRATISLAVA ACC', rows: [
    ['L/UL853', 'DEP EPKK', 'BABKO', 'climbing FL240', ''],
    ['L/UL853', 'other flights', 'BABKO', 'westbound FLs', ''],
    ['M/UM66', 'DEP EPKK', 'BABKO', 'climbing FL240', ''],
    ['M/UM66', 'other flights', 'BABKO', 'eastbound FLs', ''],
    ['U/UR23', '', 'MEBAN', 'westbound FLs', ''],
    ['B/UB7', '', 'LENOV', 'eastbound FLs', ''],
    ['B/UB7', 'DEP EPKK', 'LENOV', 'climbing FL250', ''],
    ['Z/UZ500, M/UM173', '', 'PODAN', 'westbound FLs', ''] ] },
  { id: 'D.2.3', from: 'BA', to: 'LV', title: 'Flights from BRATISLAVA ACC to L\'VIV ACC', rows: [
    ['P/UP27, A42', 'DEST UKLU', 'MALBE', 'descending FL110', 'FL280 or below'],
    ['P/UP27, A42', 'other flights', 'MALBE', 'eastbound FLs', ''] ] },
  { id: 'D.2.4', from: 'LV', to: 'BA', title: 'Flights from L\'VIV ACC to BRATISLAVA ACC', rows: [
    ['P/UP27, A42', '', 'MALBE', 'westbound FLs', ''] ] },
  { id: 'D.2.5', from: 'BA', to: 'BU', title: 'Flights from BRATISLAVA ACC to BUDAPEST ACC, BUDAPEST APP', rows: [
    ['L/UL140, L/UL616', '', 'ALAMU', 'eastbound FLs', ''],
    ['L/UL140', 'DEP LOWW', 'ALAMU', 'climbing FL290/210A', ''],
    ['', 'DEP LZIB', 'ERGOM', 'FL210', ''],
    ['L/UL175', 'DEST LHBP', 'ERGOM', 'descending FL190', 'FL210 or below'],
    ['M/UM748', 'DEST LHBP', 'ERGOM', 'descending FL190', 'FL210 or below'],
    ['M/UM748', 'other flights', 'ERGOM', 'eastbound FLs', ''],
    ['M/UM66', 'DEST LHBP', 'DEMOP', 'descending FL230', 'FL250 or below'],
    ['M/UM66', 'other flights', 'DEMOP', 'eastbound FLs', ''],
    ['Z/UZ500', 'DEST LHBP', 'DEMOP', 'descending FL230', 'FL250 or below'],
    ['Z/UZ500', 'other flights', 'DEMOP', 'westbound FLs', ''],
    ['B/UB7, M/UM173', '', 'KEKED', 'eastbound FLs', ''] ] },
  { id: 'D.2.6', from: 'BU', to: 'BA', title: 'Flights from BUDAPEST ACC, BUDAPEST APP to BRATISLAVA ACC', rows: [
    ['M/UM748', 'DEP LHBP', 'ERGOM', 'climbing FL180', ''],
    ['M/UM748', 'other flights', 'ERGOM', 'westbound FLs', ''],
    ['UL602', '', 'PATAK', 'westbound FLs', ''],
    ['UL617', '', 'AMRAX', 'westbound FLs', ''],
    ['L/UL853', 'DEP LHBP', 'LITKU', 'climbing FL180', ''],
    ['L/UL853', 'other flights', 'LITKU', 'westbound FLs', ''],
    ['Z/UZ500', '', 'DEMOP', 'eastbound FLs', ''],
    ['B/UB7, M/UM173', '', 'KEKED', 'westbound FLs', ''] ] },
  { id: 'D.2.7', from: 'BA', to: 'WI', title: 'Flights from BRATISLAVA ACC to WIEN ACC, WIEN APP', rows: [
    ['R/UR23', 'DEST LOWW', 'MAREG', 'descending FL160', 'FL170 or below'],
    ['R/UR23', 'other flights', 'MAREG', 'westbound FLs', ''],
    ['P/UP182', 'DEST LOWW', 'REKLU', 'descending FL180', ''],
    ['', 'DEST LOWS, LOWL, LOWG, LOWK', 'ALL', 'max FL300 maintaining FL', ''],
    ['', 'DEST LOWI, EDDM, EDMx', 'ALL', 'max FL340 maintaining FL', ''] ] },
  { id: 'D.2.8', from: 'WI', to: 'BA', title: 'Flights from WIEN ACC, WIEN APP to BRATISLAVA ACC', rows: [
    ['R/UR23, L/UL140, L/UL175', 'other flights', 'MAREG', 'eastbound FLs', ''],
    ['M/UM985, L/UL175', 'DEP LOWW', 'ABLOM', 'climbing FL150', ''],
    ['M/UM985, L/UL175', 'other flights', 'ABLOM', 'eastbound FLs', ''] ] },
  { id: 'D.2.9', from: 'BA', to: 'PR', title: 'Flights from BRATISLAVA ACC to PRAHA ACC, BRNO APP', rows: [
    ['M/UM748', 'DEST LKTB', 'ODNEM', 'descending FL130', ''],
    ['M/UM748', 'other flights', 'ODNEM', 'westbound FLs', ''],
    ['UL602', '', 'LALES', 'westbound FLs', ''],
    ['P/UP27, UL624', '', 'MAKAL', 'westbound FLs', ''],
    ['UL617', '', 'BILNA', 'westbound FLs', ''],
    ['', 'DEP LHCC', 'MAVOR', 'any even FL', 'default FL340, subject to REV'],
    ['', 'DEP LZIB', 'ODNEM', 'maximum FL160, in climbing FL130A', ''],
    ['', 'DEST LKAA', 'MAKAL', 'maximum FL340', 'maximum FL280 when ADEP is LZBB (AWY P27)'],
    ['', 'DEST LKAA', 'MAVOR', 'maximum FL300 when ADEP is LHCC', ''] ] },
  { id: 'D.2.10', from: 'PR', to: 'BA', title: 'Flights from PRAHA ACC, BRNO APP to BRATISLAVA ACC', rows: [
    ['M/UM748', 'DEP LKTB', 'ODNEM', 'climbing FL120', ''],
    ['M/UM748', 'other flights', 'ODNEM', 'eastbound FLs', ''],
    ['', 'DEST LZIB', 'ODNEM', 'descending FL170 when cruising above to cross ODNEM FL210B', 'LZIB'],
    ['L/UL616', '', 'VALPI', 'eastbound FLs', ''],
    ['P/UP27, UL624', '', 'MAKAL', 'eastbound FLs', ''],
    ['UL617', '', 'BILNA', 'eastbound FLs', ''] ] },
];
const CO_GENERAL = [
  ['D.1.1 Reference Location', 'Co-ordination of flights shall normally take place by reference to the coordination point (COP) for the relevant route.'],
  ['D.1.2 Flight Level', 'Flights are considered to be maintaining the co-ordinated flight level at the transfer of control point unless climb or descent conditions have been clearly stated.'],
  ['D.1.3 Accepting ATS Unit Conditions', 'If the accepting unit cannot accept a flight offered, it shall clearly indicate its inability and specify the conditions under which the flight will be accepted.'],
  ['D.1.4 Approval Request', 'For any proposed deviation (COP, route or level) the transferring unit shall initiate an Approval Request.'],
  ['E.1 Transfer of Control', 'The transfer of control takes place at the AoR-boundary.'],
  ['E.2 Transfer of Communications', 'Shall take place not later than transfer of control.'],
];

/* koordinačný bod → sused, s ktorým sa na ňom koordinuje */
const CO_COP = {};
CO_TABLES.forEach(t => { const nb = t.from === 'BA' ? t.to : t.from; t.nb = nb; t.rows.forEach(r => { if (r[2] !== 'ALL') CO_COP[r[2]] = nb; }); });
function coWp(name) { return WAYPOINTS.find(w => w.name === name); }
function coXY(name) { const w = coWp(name); return [projX(w.lon), projY(w.lat)]; }
function coNbOk(nb) { const f = state.filters.coNb; return f === 'all' || f === nb; }

/* uznané zápisy hraníc: „FL285 – FL660", „285-660", „8000 ft AMSL – FL660", „8000 660"… */
function coLimAccept(lim) {
  const part = p => {
    p = p.trim();
    if (/^GND/i.test(p)) return ['gnd', '0', 'sfc', 'zem'];
    const n = p.replace(/[^0-9]/g, '');
    if (/^FL/i.test(p)) return ['fl' + n, n];
    const tail = /AGL/i.test(p) ? 'agl' : /AMSL/i.test(p) ? 'amsl' : '';
    return [n + 'ft' + tail, n + 'ft', n + tail, n].filter((v, i, a) => a.indexOf(v) === i);
  };
  const ab = lim.split('–'), out = [];
  part(ab[0]).forEach(a => part(ab[1]).forEach(b => out.push(a + ' ' + b)));
  return out;
}
/* uznané zápisy hladiny: celý text, alebo len čísla hladín („FL250", „250", „160 130A") */
function coLvlAccept(txt) {
  const out = [txt];
  const fl = txt.match(/FL\d+(?:\/\d+)?[AB]?/g) || [];
  if (fl.length) { out.push(fl.join(' ')); out.push(fl.join(' ').replace(/FL/g, '')); }
  const w = txt.split(' ')[0];
  if (/^(eastbound|westbound)/.test(txt)) { out.push(w); out.push(w.replace('bound', '')); }
  if (/^(descending|climbing)/.test(txt) && fl.length === 1) { out.push(w + ' ' + fl[0].replace('FL', '')); }
  return out;
}
function coFreqAccept(u) { const a = [u.f, u.f.replace(',', '.')]; if (u.alt) a.push(u.alt, u.alt.replace(',', '.')); if (u.ch) a.push(u.ch, u.ch.replace(',', '.')); return a; }   // ch = názov toho istého kanála v rastri 8,33 kHz (tak ho uvádza AIP)
function coScenario(t, r) { return t.id + '|' + r[0] + '|' + r[1]; }

function buildCoordQuestions() {
  const F = state.filters, m = F.coMode;
  let list = [];
  const Q = (sub, id, o) => list.push(Object.assign({ type: 'coord', sub, id: 'CO_' + id, exact: true }, o));
  if (m === 'cop') {
    Object.keys(CO_COP).filter(c => coNbOk(CO_COP[c])).forEach(c => {
      const nb = CO_COP[c];
      Q('p2n', 'P2N_' + c, { cop: c, nb, correct: CO_NB[nb].short, exact: false,
        pool: Object.keys(CO_NB).filter(k => k !== 'BA' && k !== nb).map(k => CO_NB[k].short),
        accept: [CO_NB[nb].short].concat(CO_NB_ALT[nb]), label: c + '→sused' });
      Q('click', 'CLK_' + c, { cop: c, nb, accept: [c], label: c + '→mapa' });
    });
  } else if (m === 'freq') {
    const us = CO_UNITS.filter(u => u.f), all = us.map(u => u.f);
    us.filter(u => coNbOk(u.g)).forEach(u => {
      const near = all.filter(f => f !== u.f && f !== u.alt && f !== u.ch).sort((a, b) => Math.abs(parseFloat(a.replace(',', '.')) - parseFloat(u.f.replace(',', '.'))) - Math.abs(parseFloat(b.replace(',', '.')) - parseFloat(u.f.replace(',', '.'))));
      Q('u2f', 'U2F_' + u.n, { unit: u, correct: u.f + ' MHz', pool: near.map(f => f + ' MHz'), accept: coFreqAccept(u), label: u.n + '→' + u.f });
      Q('f2u', 'F2U_' + u.n, { unit: u, correct: u.n, exact: false,
        pool: us.filter(x => x.n !== u.n).sort((a, b) => (a.g === u.g ? 0 : 1) - (b.g === u.g ? 0 : 1)).map(x => x.n), accept: [u.n], label: u.f + '→' + u.n });
    });
  } else if (m === 'vert') {
    CO_UNITS.filter(u => coNbOk(u.g)).forEach(u => {
      const pool = CO_UNITS.filter(x => x.lim !== u.lim).sort((a, b) => (a.g === u.g ? 0 : 1) - (b.g === u.g ? 0 : 1)).map(x => x.lim).filter((v, i, a) => a.indexOf(v) === i);
      Q('u2v', 'U2V_' + u.n, { unit: u, correct: u.lim, pool, accept: coLimAccept(u.lim), label: u.n + '→hranice' });
    });
  } else if (m === 'level') {
    const allLv = [], allCond = [];
    CO_TABLES.forEach(t => t.rows.forEach(r => { if (allLv.indexOf(r[3]) < 0) allLv.push(r[3]); if (r[4] && allCond.indexOf(r[4]) < 0) allCond.push(r[4]); }));
    const seen = {};
    CO_TABLES.filter(t => coNbOk(t.nb)).forEach(t => t.rows.forEach((r, i) => {
      const key = coScenario(t, r), same = t.rows.filter(x => coScenario(t, x) === key);
      const tableCops = t.rows.map(x => x[2]).filter((v, k, a) => a.indexOf(v) === k);
      if (!seen[key]) {
        seen[key] = 1;
        const ok = same.map(x => x[2]);
        Q('cop', 'COP_' + t.id + '_' + i, { t, r, correct: r[2], exact: false, accept: ok,
          pool: tableCops.filter(c => ok.indexOf(c) < 0).concat(Object.keys(CO_COP).filter(c => tableCops.indexOf(c) < 0)), label: t.id + ' ' + (r[1] || r[0]) + '→COP' });
      }
      const lvlOk = t.rows.filter(x => coScenario(t, x) === key && x[2] === r[2]).map(x => x[3]);
      const tableLv = t.rows.map(x => x[3]).filter(v => lvlOk.indexOf(v) < 0);
      Q('lvl', 'LVL_' + t.id + '_' + i, { t, r, correct: r[3], accept: coLvlAccept(r[3]),
        pool: tableLv.concat(allLv.filter(v => lvlOk.indexOf(v) < 0)).filter((v, k, a) => a.indexOf(v) === k), label: t.id + ' ' + r[2] + ' ' + (r[1] || r[0]) + '→FL' });
      if (r[4]) Q('cond', 'CND_' + t.id + '_' + i, { t, r, correct: r[4], accept: coLvlAccept(r[4]),
        pool: allCond.filter(v => v !== r[4]).concat(['— žiadna —']), label: t.id + ' ' + r[2] + '→podmienka' });
    }));
  }
  if (m === 'scen') CO_TABLES.filter(t => coNbOk(t.nb)).forEach(t => t.rows.forEach((r, i) => {
    if (r[2] !== 'ALL') Q('scen', 'SCN_' + t.id + '_' + i, { t, r, accept: [r[2]], label: t.id + ' scenár · ' + (r[1] || r[0]) });
  }));
  state.apAllIds = list.map(q => q.id);
  state.coNote = '';
  if (F.coWeak) {
    const weak = list.filter(q => state.mistakes[q.id] > 0);
    if (weak.length) list = weak;
    else { F.coWeak = false; state.coNote = 'V tomto výbere nemáš žiadne slabé miesta — idú všetky otázky.'; }
  }
  list.forEach(q => { CO_LABEL[q.id] = q.label; });
  return shuffle(list);
}
const CO_LABEL = {};

/* ---------- mapa: Slovensko + koordinačné body ---------- */
function coMapSVG(o) {
  o = o || {};
  const P = MAP_PROJ;
  let dots = '', extra = '';
  const names = o.all ? WAYPOINTS.map(w => w.name) : Object.keys(CO_COP);
  names.forEach(c => {
    const w = coWp(c), x = projX(w.lon), y = projY(w.lat), nb = CO_COP[c];
    /* bežne zelené, aby ich bolo na mape dobre vidno; v štúdiu podľa suseda */
    const fill = o.color && nb ? CO_NB[nb].color : '#0a9d5c';
    dots += `<circle class="co-dot${o.click ? ' wp-hit' : ''}" data-name="${c}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${o.color ? 6 : 6.5}" style="fill:${fill}"></circle>`;
    if (o.click) dots += `<circle class="wp-hit" data-name="${c}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="14" fill="transparent"></circle>`;
    if (o.labels && nb) dots += `<text class="co-lbl" x="${(x + 9).toFixed(1)}" y="${(y - 7).toFixed(1)}">${c}</text>`;
  });
  if (o.lit) {
    const xy = coXY(o.lit);
    /* šípka smeru letu: von z FIR = od stredu k bodu, dnu = opačne */
    if (o.dir) {
      const dx = xy[0] - 500, dy = xy[1] - 267, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      const a = [xy[0] - ux * 95, xy[1] - uy * 95], b = [xy[0] - ux * 26, xy[1] - uy * 26];
      const from = o.dir === 'out' ? a : b, to = o.dir === 'out' ? b : a;
      const ang = Math.atan2(to[1] - from[1], to[0] - from[0]) * 180 / Math.PI;
      extra += `<line class="co-arrow" x1="${from[0].toFixed(1)}" y1="${from[1].toFixed(1)}" x2="${to[0].toFixed(1)}" y2="${to[1].toFixed(1)}"></line>
        <path class="co-arrow-h" d="M0,0 L-13,-6 L-13,6 Z" transform="translate(${to[0].toFixed(1)},${to[1].toFixed(1)}) rotate(${ang.toFixed(1)})"></path>`;
    }
    extra += litPoint(xy[0], xy[1]);
    if (o.litName) extra += `<text class="co-lbl big" x="${(xy[0] + 14).toFixed(1)}" y="${(xy[1] - 14).toFixed(1)}">${o.lit}</text>`;
  }
  return `<svg viewBox="0 0 ${P.w} ${P.h.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" id="map-svg">
    <rect x="0" y="0" width="${P.w}" height="${P.h.toFixed(0)}" fill="#fbfdfc"></rect>
    <path d="${mapBaseParts().firPath}" fill="#eef6f0" stroke="var(--border-bright)" stroke-width="1.5"></path>
    ${mapBaseParts().cities}${dots}${extra}
  </svg>`;
}
function coScenarioHTML(q, upTo) {
  const t = q.t, r = q.r, row = (l, v) => `<div class="co-sc-row"><span>${l}</span><strong>${v}</strong></div>`;
  return `<div class="co-sc">
      <div class="co-sc-title">${t.id} · ${t.title}</div>
      ${row('ATS-ROUTE', r[0] || '—')}${row('LET', r[1] || 'všetky lety na trati')}
      ${upTo >= 1 ? row('COP', r[2]) : ''}${upTo >= 2 ? row('LEVEL ALLOCATION', r[3]) : ''}
    </div>`;
}

/* otázka: vráti { body, placeholder } pre spoločnú kartu s inputom alebo výberom */
function coBody(q) {
  const meta = t => `<div class="qmeta">KOORDINÁCIA <span class="sep">·</span> ${t}</div>`;
  if (q.sub === 'p2n') return { placeholder: 'SUSED (napr. BUDAPEST)...', body: meta('KOORDINAČNÝ BOD → SUSED') +
    `<div class="map-wrap">${coMapSVG({ lit: q.cop })}</div><div class="big-prompt">${q.cop}</div><div class="prompt-hint">— S KÝM SA NA TOMTO BODE KOORDINUJE? —</div>` };
  if (q.sub === 'u2f') return { placeholder: 'FREKVENCIA (napr. 134,475)...', body: meta('STANOVIŠTE → FREKVENCIA') +
    `<div class="big-prompt small">${q.unit.n}</div><div class="prompt-hint">— ${q.unit.lim} · AKÁ FREKVENCIA? —</div>` };
  if (q.sub === 'f2u') return { placeholder: 'STANOVIŠTE (napr. WIEN APP)...', body: meta('FREKVENCIA → STANOVIŠTE') +
    `<div class="big-prompt">${q.unit.f}</div><div class="prompt-hint">— MHz · KTORÉ STANOVIŠTE? —</div>` };
  if (q.sub === 'u2v') return { placeholder: 'OD – DO (napr. FL285 – FL660)...', body: meta('STANOVIŠTE → VERTIKÁLNE HRANICE') +
    `<div class="big-prompt small">${q.unit.n}</div><div class="prompt-hint">— ${q.unit.f ? q.unit.f + ' MHz · ' : ''}OD AKEJ PO AKÚ VÝŠKU? —</div>` };
  const dir = q.t.from === 'BA' ? 'out' : 'in';
  if (q.sub === 'cop') return { placeholder: 'KOORDINAČNÝ BOD (5 PÍSMEN)...', body: meta('HLADINY NA BODOCH · KTORÝ BOD?') +
    `<div class="map-wrap">${coMapSVG({})}</div>${coScenarioHTML(q, 0)}<div class="prompt-hint">— CEZ KTORÝ KOORDINAČNÝ BOD (COP)? —</div>` };
  if (q.sub === 'lvl') return { placeholder: 'HLADINA (napr. FL250 alebo eastbound)...', body: meta('HLADINY NA BODOCH · AKÁ HLADINA?') +
    `<div class="map-wrap">${coMapSVG({ lit: q.r[2] === 'ALL' ? null : q.r[2], dir, litName: true })}</div>${coScenarioHTML(q, 1)}<div class="prompt-hint">— AKÁ JE LEVEL ALLOCATION NA TOMTO BODE? —</div>` };
  return { placeholder: 'PODMIENKA (napr. FL280)...', body: meta('HLADINY NA BODOCH · AKÁ PODMIENKA?') +
    `<div class="map-wrap">${coMapSVG({ lit: q.r[2] === 'ALL' ? null : q.r[2], dir, litName: true })}</div>${coScenarioHTML(q, 2)}<div class="prompt-hint">— AKÁ JE SPECIAL CONDITION? —</div>` };
}
function coHints(q) {
  const c = String(q.correct || q.accept[0]);
  const h = [];
  if (q.sub === 'p2n') { const w = coWp(q.cop); h.push('Oblasť hranice: ' + ({ SEVER: 'sever (Poľsko)', ZAPAD: 'západ (Česko / Rakúsko)', VYCHOD: 'východ (Ukrajina)', JUH: 'juh (Maďarsko)', STRED: 'vnútro FIR' }[w.grp] || '—')); }
  if (q.sub === 'u2f' || q.sub === 'u2v' || q.sub === 'f2u') h.push('Skupina: ' + CO_NB[q.unit.g].name);
  if (q.t) h.push('Smer: ' + (q.t.from === 'BA' ? 'z Bratislavy von' : 'do Bratislavy') + ' · sused: ' + CO_NB[q.t.nb].short);
  h.push(`Odpoveď začína na „${c.substring(0, Math.min(4, Math.max(1, c.length - 2)))}“.`);
  h.push(`Odpoveď má ${c.length} znakov.`);
  return h;
}
/* rez vzdušným priestorom skupiny — najvyššie stanovište hore */
function coStackHTML(g, mark) {
  const top = u => { const b = u.lim.split('–')[1]; return /FL/.test(b) ? parseInt(b.replace(/\D/g, ''), 10) * 100 : parseInt(b.replace(/\D/g, ''), 10); };
  return `<div class="co-stack">${CO_UNITS.filter(u => u.g === g).slice().sort((a, b) => top(b) - top(a)).map(u =>
    `<div class="co-band${u.n === mark ? ' on' : ''}"><strong>${u.n}</strong><span>${u.lim}</span><em>${u.f ? u.f + ' MHz' + (u.alt ? ' (v Annex E: ' + u.alt + ')' : '') + (u.ch ? ' (kanál 8,33 kHz: ' + u.ch + ')' : '') : '—'}</em></div>`).join('')}</div>`;
}
function coTableHTML(t, hi) {
  return `<table class="co-table"><thead><tr><th colspan="2">ATS-Route</th><th>COP</th><th>Level Allocation</th><th>Special Conditions</th></tr></thead><tbody>${
    t.rows.map(r => `<tr class="${r === hi ? 'on' : ''}"><td>${r[0] || ''}</td><td>${r[1] || ''}</td><td><strong>${r[2]}</strong></td><td>${r[3]}</td><td>${r[4] || ''}</td></tr>`).join('')}</tbody></table>`;
}
function coReveal(q) {
  if (q.unit) {
    const u = q.unit;
    return `<div class="reveal"><div class="reveal-title">${u.n}${u.f ? ' — ' + u.f + ' MHz' : ''}</div>
      <div class="reveal-sub">${CO_NB[u.g].name} · ${u.lim}</div>${coStackHTML(u.g, u.n)}
      ${u.alt ? `<div class="reveal-ops"><strong>POZOR — DOKUMENT MÁ DVE HODNOTY</strong>V Appendix 1 je ${u.f}, v tabuľke Annex E je ${u.alt}. Trenažér uzná obe; over si, ktorá platí.</div>` : ''}</div>`;
  }
  if (q.t) return `<div class="reveal"><div class="reveal-title">${q.r[2]} — ${q.r[3]}</div>
      <div class="reveal-sub">${q.t.id} · ${q.t.title}${q.r[4] ? ' · ' + q.r[4] : ''}</div>${coTableHTML(q.t, q.r)}</div>`;
  const nb = q.nb, ts = CO_TABLES.filter(t => t.nb === nb && t.rows.some(r => r[2] === q.cop));
  return `<div class="reveal"><div class="reveal-title">${q.cop} — ${CO_NB[nb].short}</div>
      <div class="reveal-sub">KOORDINAČNÝ BOD · ${CO_NB[nb].name}</div>
      ${ts.map(t => `<div class="co-tcap">${t.id} · ${t.title}</div>` + coTableHTML({ rows: t.rows.filter(r => r[2] === q.cop) })).join('')}${coStackHTML(nb)}</div>`;
}

/* klik na koordinačný bod */
function renderCoClick(q, card) {
  const hard = state.filters.coAns === 'type';
  card.innerHTML = `
    <div class="qmeta">KOORDINÁCIA <span class="sep">·</span> KLIKNI NA BOD</div>
    <div class="map-prompt"><span class="mp-label">KDE LEŽÍ KOORDINAČNÝ BOD?</span><div class="mp-name">${q.cop}</div>
      <div class="mp-sub">${hard ? 'HARDCORE · na mape sú všetky body z MOD 04' : 'ĽAHKÁ · na mape je len 21 koordinačných bodov'}</div></div>
    <div class="map-wrap">${coMapSVG({ click: true, all: hard })}</div>
    <div class="feedback" id="feedback"></div>`;
  apRetryBadge(q);
  const svg = document.getElementById('map-svg');
  svg.querySelectorAll('.wp-hit').forEach(el => el.addEventListener('click', () => {
    if (svg.dataset.done) return;
    svg.dataset.done = '1';
    const picked = el.dataset.name, ok = picked === q.cop, xy = coXY(q.cop);
    svg.querySelectorAll('.wp-hit').forEach(x => { x.style.pointerEvents = 'none'; });
    svgAdd(svg, 'circle', { cx: xy[0], cy: xy[1], r: 8, class: 'wp-dot ' + (ok ? 'reveal-correct' : 'wrong') });
    apMapMark(svg, xy[0], xy[1], MAP_PROJ.w, q.cop + ' · ' + CO_NB[q.nb].short, ok);
    if (!ok) { const p = coXY(picked); svgAdd(svg, 'path', { d: `M ${p[0]-6},${p[1]-6} L ${p[0]+6},${p[1]+6} M ${p[0]-6},${p[1]+6} L ${p[0]+6},${p[1]-6}`, class: 'ap-x' }); }
    apFinish(q, ok, ok ? '' : picked);
  }));
}

/* ---------- DOPLŇOVAČKA: tabuľka ako v dokumente, políčka prázdne ---------- */
function coCellOk(val, correct, kind) {
  const n = s => normalize(s);
  if (!correct) return !val.trim() || n(val) === n('— žiadna —');
  const acc = kind === 'lim' ? coLimAccept(correct) : kind === 'freq' ? [correct, correct.replace(',', '.')] : kind === 'cop' ? [correct] : coLvlAccept(correct);
  return acc.some(a => n(a) === n(val));
}
function renderCoFill(card) {
  const F = state.filters, easy = F.coAns !== 'type', id = F.coTable;
  const isFreq = id === 'FREQ', t = CO_TABLES.find(x => x.id === id);
  const C = state.coFill || (state.coFill = { id, vals: {}, checked: false });
  if (C.id !== id) { C.id = id; C.vals = {}; C.checked = false; }
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = isFreq ? 'frekvencie' : id;
  const distinct = k => { const a = []; CO_TABLES.forEach(x => x.rows.forEach(r => { if (a.indexOf(r[k]) < 0) a.push(r[k]); })); return a.sort(); };
  const optsFor = { cop: distinct(2), lvl: distinct(3), cond: ['— žiadna —'].concat(distinct(4).filter(Boolean)),
    lim: CO_UNITS.map(u => u.lim).filter((v, i, a) => a.indexOf(v) === i).sort(), freq: CO_UNITS.filter(u => u.f).map(u => u.f).sort() };
  let cells = 0, good = 0;
  const cell = (key, correct, kind, altOk) => {
    const v = C.vals[key] || '';
    const ok = C.checked && (coCellOk(v, correct, kind) || (altOk && coCellOk(v, altOk, kind)));
    cells++; if (ok) good++;
    const cls = C.checked ? (ok ? 'ok' : 'fixed') : '';
    const shown = correct || '—';
    if (C.checked) return `<td class="co-in ${cls}">${ok ? shown : `<b>${shown}</b>` + (v && v !== '— žiadna —' ? `<s>${v.replace(/</g, '&lt;')}</s>` : '')}</td>`;
    if (easy) return `<td class="co-in"><select data-k="${key}"><option value=""></option>${optsFor[kind].map(o => `<option ${v === o ? 'selected' : ''}>${o}</option>`).join('')}</select></td>`;
    return `<td class="co-in"><input data-k="${key}" value="${v.replace(/"/g, '&quot;')}" autocomplete="off" spellcheck="false"></td>`;
  };
  let table;
  if (isFreq) {
    table = `<table class="co-table"><thead><tr><th>Sector</th><th>Vertical limits</th><th>Freq. (MHz)</th></tr></thead><tbody>${
      CO_UNITS.map((u, i) => `<tr><td><strong>${u.n}</strong></td>${cell('l' + i, u.lim, 'lim')}${u.f ? cell('f' + i, u.f, 'freq', u.alt) : '<td class="co-na">—</td>'}</tr>`).join('')}</tbody></table>`;
  } else {
    table = `<table class="co-table"><thead><tr><th colspan="2">ATS-Route</th><th>COP</th><th>Level Allocation</th><th>Special Conditions</th></tr></thead><tbody>${
      t.rows.map((r, i) => `<tr><td>${r[0] || ''}</td><td>${r[1] || ''}</td>${cell('c' + i, r[2], 'cop')}${cell('v' + i, r[3], 'lvl')}${cell('s' + i, r[4], 'cond')}</tr>`).join('')}</tbody></table>`;
  }
  card.innerHTML = `
    <div class="qmeta">KOORDINÁCIA <span class="sep">·</span> DOPLŇOVAČKA <span class="sep">·</span> ${isFreq ? 'APPENDIX 1 — SECTORISATION' : t.id}</div>
    <div class="map-prompt"><span class="mp-label">${isFreq ? 'Doplň vertikálne hranice a frekvencie' : t.title}</span>
      <div class="mp-sub">${C.checked ? `${good} z ${cells} políčok správne — nesprávne sú doplnené červeným` : (easy ? 'ĽAHKÁ: vyber z ponuky' : 'HARDCORE: píš presne; pri hladine stačí aj „FL250" alebo „eastbound"') + ' · prázdna podmienka = nechaj prázdne'}</div></div>
    <div class="co-fill">${table}</div>
    <div class="blind-actions"><button class="btn" id="co-check" ${C.checked ? 'disabled' : ''}>VYHODNOTIŤ</button><button class="btn ghost" id="co-clear">${C.checked ? 'SKÚSIŤ ZNOVA' : 'VYMAZAŤ'}</button></div>`;
  card.querySelectorAll('[data-k]').forEach(el => { const f = () => { C.vals[el.dataset.k] = el.value; }; el.oninput = f; el.onchange = f; });
  document.getElementById('co-check').onclick = () => { C.checked = true; renderQuestion(); state.correct += 0; };
  document.getElementById('co-clear').onclick = () => { state.coFill = null; renderQuestion(); };
  if (C.checked) { state.correct = good; state.wrong = cells - good; renderStats(); }
}

/* ---------- ŠTÚDIUM: mapa bodov podľa suseda + všetky tabuľky ---------- */
function renderCoStudy(card) {
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = Object.keys(CO_COP).length + ' bodov';
  const nbs = ['WA', 'LV', 'BU', 'WI', 'PR'].filter(coNbOk);
  card.innerHTML = `
    <div class="qmeta">KOORDINÁCIA <span class="sep">·</span> ŠTUDIJNÝ REŽIM</div>
    <div class="map-wrap">${coMapSVG({ color: true, labels: true })}</div>
    <div class="map-legend" style="justify-content:flex-start">${['WA', 'LV', 'BU', 'WI', 'PR'].map(k => `<span><i class="co-sw" style="background:${CO_NB[k].color}"></i>${CO_NB[k].short}</span>`).join('')}</div>
    <div class="co-tcap">FREKVENCIE A VERTIKÁLNE HRANICE</div>
    <div class="co-stacks">${['BA'].concat(nbs).map(g => `<div><div class="co-stack-h" style="border-color:${CO_NB[g].color}">${CO_NB[g].name}</div>${coStackHTML(g)}</div>`).join('')}</div>
    ${CO_TABLES.filter(t => coNbOk(t.nb)).map(t => `<div class="co-tcap">${t.id} · ${t.title}</div>${coTableHTML(t)}`).join('')}
    <div class="co-tcap">VŠEOBECNÉ PRAVIDLÁ (ANNEX D.1, ANNEX E)</div>
    <div class="co-gen">${CO_GENERAL.map(g => `<div><strong>${g[0]}</strong>${g[1]}</div>`).join('')}</div>`;
}
