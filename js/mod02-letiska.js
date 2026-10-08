/* ============================================================
   MOD 02 — MAPA EURÓPY A OBLASTI ICAO (Doc 7910)
   ------------------------------------------------------------
   Podklad je slepá mapa Európy ako obrázok. Poloha letísk sa na
   ňu prepočítava kónickou projekciou nafitovanou na 22 bodov
   pobrežia (stredná chyba ~2 px z 866). Oblasti sa nefarbia ručne:
   po načítaní sa každý štát vyleje farbou zo „semienka" vnútri
   svojich hraníc, takže farba vždy presne sedí na čiary mapy.
   ============================================================ */
const EU_W = 866, EU_H = 704;
const EU_PROJ = { n:0.799165, lon0:14.846091, s:18.234493, G:95.760890, xc:372.4429, yc:-418.1905 };
function euXY(lat, lon) {
  const th = EU_PROJ.n * (lon - EU_PROJ.lon0) * Math.PI / 180;
  const rho = EU_PROJ.s * (EU_PROJ.G - lat);
  return [EU_PROJ.xc + rho * Math.sin(th), EU_PROJ.yc + rho * Math.cos(th)];
}
function euOnMap(lat, lon) {
  const [x, y] = euXY(lat, lon);
  return x > 10 && x < EU_W - 10 && y > 10 && y < EU_H - 10;
}

/* poloha letísk [lat, lon] — len tie, ktoré sa zmestia na mapu Európy */
const AP_POS = {
  LZIB:[48.170,17.213], LZKZ:[48.663,21.241], LZTT:[49.074,20.241], LZSL:[48.638,19.134], LZZI:[49.231,18.614],
  LZPP:[48.625,17.828], LZNI:[48.279,18.133], LZLU:[48.339,19.736], LZSK:[49.334,21.570], LZPE:[48.766,18.587],
  LZMC:[48.402,17.118], LZTN:[48.865,17.992], LZTR:[48.467,17.517], LZSE:[48.657,17.332], LZJS:[48.970,19.580],
  LZSV:[48.941,20.534], LZDB:[48.997,18.192], LZOC:[48.598,19.262],
  LKPR:[50.101,14.260], LKTB:[49.151,16.694], LKMT:[49.696,18.111], LKKV:[50.203,12.915], LKPD:[50.013,15.739],
  LOWW:[48.110,16.570], LOWS:[47.793,13.004], LOWG:[46.991,15.440], LOWL:[48.233,14.188], LOWI:[47.260,11.344], LOWK:[46.643,14.338],
  LHBP:[47.437,19.256], LHDC:[47.489,21.615], LHPP:[45.991,18.241], LHSM:[46.686,17.159], LHMC:[48.137,20.791],
  EPWA:[52.166,20.967], EPKK:[50.078,19.785], EPKT:[50.474,19.080], EPGD:[54.378,18.466], EPPO:[52.421,16.826], EPWR:[51.103,16.886], EPLB:[51.240,22.714],
  UKLL:[49.813,23.956], UKBB:[50.345,30.895], UKOO:[46.427,30.677],
  EDDF:[50.033,8.571], EDDM:[48.354,11.786], EDDB:[52.362,13.501], EDDL:[51.289,6.767], EDDH:[53.630,9.988], EDDK:[50.866,7.143], EDDS:[48.690,9.222], EDDN:[49.499,11.078],
  EHAM:[52.309,4.764], EGLL:[51.470,-0.454], EGKK:[51.148,-0.190], EGSS:[51.885,0.235], EGCC:[53.354,-2.275], EGGD:[51.383,-2.719], EIDW:[53.421,-6.270],
  LFPG:[49.010,2.548], LFMN:[43.658,7.216], LIRF:[41.800,12.239], LIMC:[45.630,8.723], LIPZ:[45.505,12.352], LIRN:[40.886,14.291],
  LEMD:[40.472,-3.561], LEBL:[41.297,2.078], LEPA:[39.552,2.739], LPPT:[38.774,-9.134], LSZH:[47.458,8.548], LSGG:[46.238,6.109],
  EBBR:[50.901,4.484], EKCH:[55.618,12.656], ESSA:[59.652,17.919], ENGM:[60.194,11.100], EFHK:[60.317,24.963],
  LGAV:[37.936,23.944], LROP:[44.571,26.085], LTBA:[40.977,28.821], LTFM:[41.262,28.742], LTFJ:[40.898,29.309],
  /* rozšírenie 2026-10 */
  LKCS:[48.946,14.428], LKKU:[49.029,17.440], LKVO:[50.217,14.396], LOAN:[47.843,16.260], LHUD:[46.247,20.091], LHPR:[47.624,17.814],
  LHNY:[47.984,21.692], LHPA:[47.364,17.501], EPRZ:[50.110,22.019], EPMO:[52.451,20.652], EPSC:[53.585,14.902], EPLL:[51.722,19.398],
  EPBY:[53.097,17.978], UKLU:[48.634,22.263], UKKK:[50.402,30.450], UKHH:[49.925,36.290], UKLI:[48.884,24.686], UKDD:[48.357,35.100],
  EDDV:[52.461,9.685], EDDP:[51.424,12.236], EDDW:[53.047,8.787], EDDC:[51.133,13.767], EHRD:[51.957,4.437], EHEH:[51.450,5.375],
  EBCI:[50.459,4.454], ELLX:[49.627,6.204], EGPH:[55.950,-3.373], EGPF:[55.872,-4.433], EGBB:[52.454,-1.748], EGGW:[51.875,-0.368],
  EGLC:[51.505,0.055], EINN:[52.702,-8.925], LFPO:[48.723,2.379], LFLL:[45.726,5.091], LFML:[43.436,5.215], LFBO:[43.629,1.364],
  LFSB:[47.590,7.529], LIML:[45.445,9.277], LIME:[45.674,9.704], LIPE:[44.535,11.289], LICC:[37.467,15.066], LIRA:[41.799,12.595],
  LEMG:[36.675,-4.499], LEAL:[38.282,-0.558], LEZL:[37.418,-5.893], LEVC:[39.489,-0.482], LEIB:[38.873,1.373], LPPR:[41.248,-8.681],
  LPFR:[37.014,-7.966], LGTS:[40.520,22.971], LGIR:[35.340,25.180], LGRP:[36.405,28.086], LBSF:[42.695,23.406], LBBG:[42.570,27.515],
  LBWN:[43.232,27.825], LYBE:[44.818,20.309], LDZA:[45.743,16.069], LDSP:[43.539,16.298], LDDU:[42.561,18.268], LJLJ:[46.224,14.458],
  LQSA:[43.825,18.331], LWSK:[41.962,21.621], LATI:[41.415,19.721], LYPG:[42.359,19.252], BKPR:[42.573,21.036], LUKK:[46.928,28.931],
  LRCL:[46.785,23.686], LRTR:[45.810,21.338], LCLK:[34.875,33.625], LMML:[35.857,14.478], LLBG:[32.011,34.887], LTAI:[36.899,30.800],
  LTAC:[40.128,32.995], LTBJ:[38.292,27.157], EVRA:[56.924,23.971], EYVI:[54.634,25.286], EETN:[59.413,24.833], ENBR:[60.294,5.218],
  ESGG:[57.663,12.280], EKBI:[55.740,9.152], BIKF:[63.985,-22.606], UMMS:[53.882,28.031], UUEE:[55.973,37.415], UUDD:[55.409,37.906],
  ULLI:[59.800,30.263], GMMN:[33.368,-7.590], DAAG:[36.691,3.215], DTTA:[36.851,10.227],
};
/* Pri otázke „mesto → kód" sa ukazuje len názov mesta. Názov letiska sa
   pridá iba vtedy, keď má mesto v zozname viac letísk (Istanbul, New
   York, Tokio) — inak by sa nedalo vedieť, ktoré sa myslí. */
function apCityNote(ap) {
  return AIRPORTS.filter(a => a.city === ap.city).length > 1 ? ap.name : '';
}
function airportOnMap(ap) {
  const p = AP_POS[ap.icao];
  return !!p && (ap.cat === 'sk' || euOnMap(p[0], p[1]));
}

/* 1. písmeno indikátora = oblasť AFS (ICAO Doc 7910) */
const ICAO_AREAS = {
  E: { name:'Severná Európa', color:[190,228,201], note:'Britské ostrovy, Benelux, Nemecko, Škandinávia, Poľsko a Pobaltie.' },
  L: { name:'Južná a stredná Európa', color:[248,221,170], note:'Od Portugalska po Turecko — patrí sem aj Slovensko (LZ), Česko (LK), Rakúsko (LO) a Maďarsko (LH), ale aj Cyprus (LC) a Izrael (LL).' },
  B: { name:'Island, Grónsko a Kosovo', color:[196,214,243], note:'BI Island, BG Grónsko, BK Kosovo.' },
  U: { name:'Rusko a štáty bývalého ZSSR', color:[226,201,236], note:'Okrem Pobaltia (EE, EV, EY) a Moldavska (LU). Ukrajina UK, Bielorusko UM, Rusko UU / UL / UR / UW…' },
  O: { name:'Blízky a Stredný východ', color:[244,198,198], note:'OS Sýria, OL Libanon, OJ Jordánsko, OR Irak, OI Irán, OE Saudská Arábia, OM SAE, OT Katar.' },
  G: { name:'Západná Afrika a Maroko', color:[205,233,238], note:'GM Maroko, GC Kanárske ostrovy.' },
  D: { name:'Severozápadná Afrika', color:[232,228,178], note:'DA Alžírsko, DT Tunisko.' },
};
const ICAO_AREAS_FAR = [
  ['H', 'Severovýchodná Afrika — HL Líbya, HE Egypt'],
  ['K', 'USA (kontinentálne) — KJFK, KLAX'], ['C', 'Kanada — CYYZ'], ['Z', 'Čína — ZBAA'],
  ['R', 'Japonsko, Kórea, Filipíny — RJTT, RKSI'], ['V', 'Južná Ázia — VHHH Hong Kong, VIDP Dillí, VTBS Bangkok'], ['W', 'Juhovýchodná Ázia — WSSS Singapur'],
  ['Y', 'Austrália — YSSY Sydney'], ['F', 'Južná a stredná Afrika — FAOR Johannesburg'], ['S', 'Južná Amerika — SBGR São Paulo'], ['M', 'Mexiko a Stredná Amerika — MMMX'],
];

/* 2. písmeno = štát. seeds = body [lat, lon] vnútri štátu, odkiaľ sa
   vyleje farba; prvý je zároveň miesto pre menovku. */
/* doc:true = kód je na mape v prezentácii (resp. v jej príklade UKKK) */
const ICAO_STATES = [
  { p:'EG', doc:true, name:'Spojené kráľovstvo', seeds:[[52.6,-1.4],[54.6,-6.7],[57.0,-4.2]] },
  { p:'EI', doc:true, name:'Írsko', seeds:[[53.2,-8.0]] },
  { p:'EB', doc:true, name:'Belgicko', seeds:[[50.6,4.6]] },
  { p:'EH', doc:true, name:'Holandsko', seeds:[[52.3,5.7]] },
  { p:'EL', doc:true, name:'Luxembursko', seeds:[[49.75,6.1]] },
  { p:'ED', doc:true, name:'Nemecko (ET = vojenské)', seeds:[[51.0,10.0]] },
  { p:'EK', doc:true, name:'Dánsko', seeds:[[56.1,9.2],[55.5,11.9],[55.3,10.4]] },
  { p:'EN', doc:true, name:'Nórsko', seeds:[[61.0,9.0],[69.6,24.5],[68.3,16.0],[70.3,28.5]] },
  { p:'ES', doc:true, name:'Švédsko', seeds:[[62.0,15.0]] },
  { p:'EF', doc:true, name:'Fínsko', seeds:[[63.0,26.5]] },
  { p:'EE', doc:true, name:'Estónsko', seeds:[[58.8,25.6]] },
  { p:'EV', doc:true, name:'Lotyšsko', seeds:[[56.9,25.6]] },
  { p:'EY', doc:true, name:'Litva', seeds:[[55.4,24.0]] },
  { p:'EP', doc:true, name:'Poľsko', seeds:[[52.2,19.4]] },
  { p:'LP', doc:true, name:'Portugalsko', seeds:[[39.6,-8.1]] },
  { p:'LE', doc:true, name:'Španielsko', seeds:[[40.0,-3.5]] },
  { p:'LF', doc:true, name:'Francúzsko', seeds:[[46.7,2.5],[42.15,9.1]] },
  { p:'LS', doc:true, name:'Švajčiarsko', seeds:[[46.8,8.1]] },
  { p:'LI', doc:true, name:'Taliansko', seeds:[[43.0,12.3],[37.6,14.2],[40.1,9.1]] },
  { p:'LO', doc:true, name:'Rakúsko', seeds:[[47.5,14.6]] },
  { p:'LK', doc:true, name:'Česko', seeds:[[49.7,15.3]] },
  { p:'LZ', doc:true, name:'Slovensko', seeds:[[48.7,19.5]] },
  { p:'LH', doc:true, name:'Maďarsko', seeds:[[47.0,19.4]] },
  { p:'LJ', doc:true, name:'Slovinsko', seeds:[[46.05,14.8]] },
  { p:'LD', doc:true, name:'Chorvátsko', seeds:[[45.6,16.6]] },
  { p:'LQ', doc:true, name:'Bosna a Hercegovina', seeds:[[44.2,17.8]] },
  { p:'LY', doc:true, name:'Srbsko a Čierna Hora', seeds:[[44.0,20.9],[42.8,19.2]] },
  { p:'LW', doc:true, name:'Severné Macedónsko', seeds:[[41.6,21.7]] },
  { p:'LA', name:'Albánsko', seeds:[[41.0,20.0]] },
  { p:'LG', doc:true, name:'Grécko', seeds:[[39.5,22.0],[37.5,22.3],[35.2,24.9]] },
  { p:'LB', doc:true, name:'Bulharsko', seeds:[[42.7,25.3]] },
  { p:'LR', doc:true, name:'Rumunsko', seeds:[[46.0,25.0]] },
  { p:'LU', name:'Moldavsko', seeds:[[47.2,28.5]] },
  { p:'LT', doc:true, name:'Turecko', seeds:[[39.0,34.0],[41.3,27.3]] },
  { p:'LC', doc:true, name:'Cyprus', seeds:[[35.0,33.2]] },
  { p:'BI', doc:true, name:'Island', seeds:[[64.9,-18.5]] },
  { p:'BK', name:'Kosovo', seeds:[[42.6,20.9]] },
  { p:'UK', doc:true, name:'Ukrajina', seeds:[[49.0,32.0],[45.2,34.3]] },
  { p:'UM', name:'Bielorusko (+ Kaliningrad)', seeds:[[53.5,28.0],[54.7,21.4]] },
  { p:'U*', name:'Rusko (UU Moskva, UL Petrohrad, UR juh…)', seeds:[[56.0,38.0]] },
  { p:'UG', name:'Gruzínsko', seeds:[[42.0,43.6]] },
  { p:'UD', name:'Arménsko', seeds:[[40.3,44.8]] },
  { p:'UB', name:'Azerbajdžan', seeds:[[40.3,47.8]] },
  { p:'UA', name:'Kazachstan', seeds:[[48.5,52.5]] },
  { p:'LL', doc:true, name:'Izrael', seeds:[[31.9,34.95]] },
  { p:'OS', doc:true, name:'Sýria', seeds:[[35.0,38.5]] },
  { p:'OL', name:'Libanon', seeds:[[33.9,35.9]] },
  { p:'OJ', doc:true, name:'Jordánsko', seeds:[[32.0,37.0]] },
  { p:'OR', name:'Irak', seeds:[[34.5,43.0]] },
  { p:'OI', name:'Irán', seeds:[[36.5,48.5]] },
  { p:'GM', doc:true, name:'Maroko', seeds:[[34.3,-5.0]] },
  { p:'DA', doc:true, name:'Alžírsko', seeds:[[35.4,3.0]] },
  { p:'DT', doc:true, name:'Tunisko', seeds:[[35.8,9.6]] },
];
/* otvorené more — vyleje sa ako prvé, aby semienko štátu, ktoré by
   omylom padlo do vody, nezafarbilo celé more */
const EU_SEA_SEEDS = [[50,-15],[56,3],[57,19.6],[62,19.8],[38,5],[34,25],[43,15],[40,12],[43,35],[46,36.7],[42,50.5],[72,35],[67,5],[45.5,-4],[66,-10]];

const EU = { plain:'', colored:'', ready:false, hit:{}, stateAt:null };
(function euPrepare() {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = EU_W; c.height = EU_H;
    const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, EU_W, EU_H);
    g.drawImage(img, 0, 0);
    g.fillRect(228, 584, 38, 36);                    // vodoznak v Stredozemnom mori
    const im = g.getImageData(0, 0, EU_W, EU_H), d = im.data;
    const own = new Uint8Array(EU_W * EU_H);         // 0 voľné · 1 čiara · 2 vyplnené · 3 lem čiary
    for (let i = 0; i < own.length; i++) {
      const x = i % EU_W, y = (i / EU_W) | 0;
      /* okraj obrázka je tiež hrádza — čiary nedochádzajú presne po kraj
         a farba by popri ňom obtiekla z mora do pevniny */
      if (x < 2 || y < 2 || x > EU_W - 3 || y > EU_H - 3 || d[i*4] + d[i*4+1] + d[i*4+2] < 700) own[i] = 1;
    }
    /* Hranice majú miestami pixelové medzery. Čiara sa preto na čas
       vylievania rozšíri o 1 px (lem); po vyliatí sa lem dofarbí,
       takže farba aj tak siaha až po čiaru. */
    for (let y = 1; y < EU_H - 1; y++) for (let x = 1; x < EU_W - 1; x++) {
      const i = y * EU_W + x;
      if (own[i] !== 0) continue;
      if (own[i-1] === 1 || own[i+1] === 1 || own[i-EU_W] === 1 || own[i+EU_W] === 1 ||
          own[i-EU_W-1] === 1 || own[i-EU_W+1] === 1 || own[i+EU_W-1] === 1 || own[i+EU_W+1] === 1) own[i] = 3;
    }
    /* semienko môže padnúť presne na čiaru — vezmi najbližší voľný pixel */
    const freeNear = (x, y) => {
      for (let r = 0; r <= 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        const X = x + dx, Y = y + dy;
        if (X >= 0 && Y >= 0 && X < EU_W && Y < EU_H && own[Y * EU_W + X] === 0) return Y * EU_W + X;
      }
      return -1;
    };
    EU.stateAt = new Uint8Array(EU_W * EU_H);         // ktorému štátu pixel patrí (index + 1)
    const flood = (lat, lon, rgb, tag) => {
      const [fx, fy] = euXY(lat, lon);
      const start = freeNear(Math.round(fx), Math.round(fy));
      if (start < 0) return 0;
      const stack = [start], done = []; own[start] = 2;
      const paint = i => { d[i*4] = rgb[0]; d[i*4+1] = rgb[1]; d[i*4+2] = rgb[2]; if (tag) EU.stateAt[i] = tag; };
      while (stack.length) {
        const i = stack.pop(); done.push(i); paint(i);
        const x = i % EU_W;
        if (x > 0 && own[i-1] === 0) { own[i-1] = 2; stack.push(i-1); }
        if (x < EU_W-1 && own[i+1] === 0) { own[i+1] = 2; stack.push(i+1); }
        if (i >= EU_W && own[i-EU_W] === 0) { own[i-EU_W] = 2; stack.push(i-EU_W); }
        if (i < own.length-EU_W && own[i+EU_W] === 0) { own[i+EU_W] = 2; stack.push(i+EU_W); }
      }
      /* dofarbi lem (bez ďalšieho šírenia) */
      done.forEach(i => [i-1, i+1, i-EU_W, i+EU_W].forEach(j => {
        if (j >= 0 && j < own.length && own[j] === 3) { own[j] = 2; paint(j); }
      }));
      return done.length;
    };
    EU_SEA_SEEDS.forEach(s => flood(s[0], s[1], [226, 238, 246]));
    g.putImageData(im, 0, 0);
    EU.plain = c.toDataURL('image/png');
    ICAO_STATES.forEach((st, k) => {
      const col = ICAO_AREAS[st.p.charAt(0)].color;
      EU.hit[st.p] = st.seeds.reduce((n, s) => n + flood(s[0], s[1], col, k + 1), 0);
    });
    g.putImageData(im, 0, 0);
    EU.colored = c.toDataURL('image/png');
    EU.ready = true;
    /* mapa, ktorá sa stihla vykresliť skôr, dostane obrázok dodatočne */
    document.querySelectorAll('image[data-eu]').forEach(el => el.setAttribute('href', EU[el.dataset.eu]));
    /* menovky štátov závisia od toho, čo sa na mape naozaj vylialo */
    if (state.mode === 'airport' && state.filters.apMode === 'study') renderQuestion();
  };
  img.src = EU_IMG_SRC;
})();

/* Výrez mapy pre kvíz: len časť, kde ležia letiská zo zoznamu (bez
   prázdneho Atlantiku a Ruska) — na rovnakej ploche je všetko väčšie. */
let EU_CROP_CACHE = null;
function euCrop() {
  if (EU_CROP_CACHE) return EU_CROP_CACHE;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  AIRPORTS.filter(a => a.cat !== 'sk' && airportOnMap(a)).forEach(a => {
    const p = AP_POS[a.icao], xy = euXY(p[0], p[1]);
    x0 = Math.min(x0, xy[0]); x1 = Math.max(x1, xy[0]); y0 = Math.min(y0, xy[1]); y1 = Math.max(y1, xy[1]);
  });
  const pad = 42;
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(EU_W, x1 + pad); y1 = Math.min(EU_H, y1 + pad);
  return (EU_CROP_CACHE = { x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0) });
}
function euMapSVG(kind, inner, crop) {
  const c = crop ? euCrop() : { x: 0, y: 0, w: EU_W, h: EU_H };
  return `<svg viewBox="${c.x} ${c.y} ${c.w} ${c.h}" xmlns="http://www.w3.org/2000/svg" id="map-svg">
    <rect x="0" y="0" width="${EU_W}" height="${EU_H}" fill="#fbfdfc"></rect>
    <image data-eu="${kind}" href="${EU[kind]}" x="0" y="0" width="${EU_W}" height="${EU_H}"></image>
    ${inner}
  </svg>`;
}

/* rozsvietený bod — rovnaký nitkový kríž a pulz ako v MOD 04 */
function litPoint(x, y) {
  const X = x.toFixed(1), Y = y.toFixed(1);
  return `<path class="wp-cross" d="M ${(x-32).toFixed(1)},${Y} h 17 M ${(x+15).toFixed(1)},${Y} h 17 M ${X},${(y-32).toFixed(1)} v 17 M ${X},${(y+15).toFixed(1)} v 17"></path>
    <circle class="wp-ring" cx="${X}" cy="${Y}" r="12"></circle>
    <circle class="wp-ring" cx="${X}" cy="${Y}" r="12">
      <animate attributeName="r" values="11;27" dur="2s" repeatCount="indefinite"></animate>
      <animate attributeName="opacity" values="0.9;0" dur="2s" repeatCount="indefinite"></animate>
    </circle>
    <circle id="tgt-dot" class="wp-dot tgt" cx="${X}" cy="${Y}" r="6"></circle>`;
}

/* Slovenské letiská sú na mape Európy na pár pixeloch pri sebe,
   preto majú vlastnú mapu Slovenska (rovnaký obrys ako MOD 04). */
function airportMapXY(ap) {
  const p = AP_POS[ap.icao];
  if (ap.cat === 'sk') return { sk: true, x: projX(p[1]), y: projY(p[0]), w: MAP_PROJ.w };
  const [x, y] = euXY(p[0], p[1]);
  const c = euCrop();
  return { sk: false, x, y, w: c.x + c.w };
}
function airportMapHTML(ap) {
  const m = airportMapXY(ap);
  if (!m.sk) return `<div class="map-wrap">${euMapSVG('plain', litPoint(m.x, m.y), true)}</div>`;
  const P = MAP_PROJ;
  return `<div class="map-wrap"><svg viewBox="0 0 ${P.w} ${P.h.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" id="map-svg">
    <rect x="0" y="0" width="${P.w}" height="${P.h.toFixed(0)}" fill="#fbfdfc"></rect>
    <path d="${mapBaseParts().firPath}" fill="#eef6f0" stroke="var(--border-bright)" stroke-width="1.5"></path>
    ${litPoint(m.x, m.y)}
  </svg></div>`;
}
/* ---------- ŠTÚDIUM: oblasti ICAO na mape ---------- */
function airportStudyDetail(st) {
  const L = st.p.charAt(0);
  const pref = st.p.replace('*', '');
  const ex = AIRPORTS.filter(a => a.icao.startsWith(pref)).slice(0, 10);
  return `
    <div class="reveal-title">${st.p} — ${st.name}</div>
    <div class="reveal-sub">ICAO LOCATION INDICATOR · DOC 7910 · ${st.doc ? 'KÓD JE V PREZENTÁCII' : 'DOPLNENÉ Z DOC 7910 (V PREZENTÁCII NIE JE)'}</div>
    <div class="reveal-grid">
      <div class="item"><span class="item-label">1. PÍSMENO — OBLASŤ</span><span class="item-val"><strong>${L}</strong> ${icaoAreaName(L)}</span></div>
      <div class="item"><span class="item-label">2. PÍSMENO — ŠTÁT</span><span class="item-val"><strong>${st.p.charAt(1) === '*' ? '…' : st.p.charAt(1)}</strong> ${st.name}</span></div>
    </div>
    <div class="reveal-ops"><strong>LETISKÁ Z MOD 02</strong>${ex.length ? ex.map(a => `${a.icao} ${a.city}`).join(' · ') : '— v zozname zatiaľ žiadne —'}</div>`;
}
function renderAirportStudy(card) {
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = ICAO_STATES.filter(st => !EU.ready || EU.hit[st.p] > 0).length + ' štátov';
  /* štát, ktorý slepá mapa nemá ohraničený (napr. Kosovo), menovku nedostane */
  const labels = ICAO_STATES.filter(st => !EU.ready || EU.hit[st.p] > 0).map(st => {
    const [x, y] = euXY(st.seeds[0][0], st.seeds[0][1]);
    return `<text class="ap-st" data-p="${st.p}" x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}">${st.p}</text>`;
  }).join('');
  const rgb = a => `rgb(${a.color.join(',')})`;
  const legend = Object.keys(ICAO_AREAS).map(k =>
    `<div class="ap-area"><span class="ap-sw" style="background:${rgb(ICAO_AREAS[k])}">${k}</span>
       <span><strong>${ICAO_AREAS[k].name}</strong><br>${ICAO_AREAS[k].note}</span></div>`).join('');
  const far = ICAO_AREAS_FAR.map(f => `<span class="ac-chip"><strong>${f[0]}</strong>${f[1]}</span>`).join('');

  card.innerHTML = `
    <div class="qmeta">ICAO LOCATION INDICATORS <span class="sep">·</span> DOC 7910 <span class="sep">·</span> ŠTUDIJNÝ REŽIM</div>
    <div class="map-prompt"><span class="mp-label">PRVÉ PÍSMENO = OBLASŤ · DRUHÉ PÍSMENO = ŠTÁT</span></div>
    <div class="map-wrap">${euMapSVG('colored', labels)}</div>
    <div class="study-tip">Klikni na dvojpísmenový kód na mape pre detail štátu.</div>
    <div class="study-detail empty" id="study-detail">— klikni na kód štátu na mape —</div>
    <div class="ap-struct">
      <div class="ap-struct-code"><span>L</span><span>Z</span><span>I</span><span>B</span></div>
      <div class="ap-struct-txt">
        <div><strong>1. písmeno</strong> — oblasť (oblasť AFS): celý svet je rozdelený do oblastí a každá má jedno písmeno</div>
        <div><strong>2. písmeno</strong> — štát (alebo časť oblasti)</div>
        <div><strong>3. písmeno</strong> — stanica leteckej pevnej služby</div>
        <div><strong>4. písmeno</strong> — spresnenie sídla stanice</div>
        <div class="ap-struct-ex">Pri adresovaní správ AFS sa indikátor rozširuje na osem znakov (stanovište, počítač) — napr. LZKZZTZX, LZBBZQZX.</div>
      </div>
    </div>
    <div class="ap-areas">${legend}</div>
    <div class="reveal-ops" style="border-top:none;padding-top:0"><strong>OBLASTI MIMO MAPY (letiská z MOD 02)</strong><div class="ac-row" style="margin-top:6px">${far}</div></div>
  `;
  const svg = document.getElementById('map-svg');
  svg.querySelectorAll('.ap-st').forEach(el => {
    el.addEventListener('click', () => {
      svg.querySelectorAll('.ap-st.sel').forEach(x => x.classList.remove('sel'));
      el.classList.add('sel');
      const det = document.getElementById('study-detail');
      det.className = 'study-detail';
      det.innerHTML = airportStudyDetail(ICAO_STATES.find(s => s.p === el.dataset.p));
    });
  });
}

/* ============================================================
   MOD 02 — ROZŠÍRENIA
   prefixy štátov · výber z možností · klik do mapy · rozklad kódu ·
   opakovanie chýb · uložený pokrok
   ------------------------------------------------------------
   Zdroj pravidla aj kódov: prezentácia „3.6 Zobrazovanie dát"
   (ICAO Doc 7910). Štát s doc:true je na mape kódov v prezentácii;
   ostatné sú doplnené z Doc 7910 a v kvíze sa dajú vypnúť.
   ============================================================ */

/* kódy z prezentácie, ktoré na slepej mape nemajú vlastnú plochu */
const ICAO_STATES_EXTRA = [
  { p:'ET', name:'Nemecko', ask:'Nemecko — vojenské letiská', doc:true, pos:[51.0,10.0] },
  { p:'LM', name:'Malta', doc:true, pos:[35.9,14.45] },
  { p:'LN', name:'Monako', doc:true, pos:[43.73,7.42] },
  { p:'GC', name:'Kanárske ostrovy', doc:true },
  { p:'HL', name:'Líbya', doc:true },
  { p:'HE', name:'Egypt', doc:true },
  { p:'BG', name:'Grónsko' },
];
/* štáty mimo mapy — len pre rozklad kódu pri letiskách z MOD 02 */
const ICAO_STATES_FAR = {
  OM:'Spojené arabské emiráty', OT:'Katar', OE:'Saudská Arábia', VH:'Hongkong', WS:'Singapur',
  RJ:'Japonsko', RK:'Južná Kórea', ZB:'Čína', CY:'Kanada',
  OK:'Kuvajt', OB:'Bahrajn', VI:'India', VA:'India', VT:'Thajsko', ZS:'Čína', ZG:'Čína',
  YS:'Austrália', FA:'Južná Afrika', SB:'Brazília', MM:'Mexiko', UU:'Rusko', UL:'Rusko',
};
/* ďalšie uznané názvy pri písaní */
const PX_ALT = {
  EG:['Veľká Británia','Británia','UK','Anglicko'], EH:['Nizozemsko'], LK:['Česká republika','Čechy'],
  LZ:['Slovenská republika'], LY:['Srbsko','Čierna Hora'], LQ:['Bosna'], LW:['Macedónsko'],
  LT:['Turecko','Türkiye'], UM:['Bielorusko'], LO:['Rakúsko'], GC:['Kanáre','Kanárske ostrovy'],
};
function pxAll()      { return ICAO_STATES.concat(ICAO_STATES_EXTRA).filter(st => st.p.indexOf('*') < 0); }
function pxPool()     { return pxAll().filter(st => state.filters.apPx === 'all' || st.doc); }
function pxShort(st)  { return st.name.split(' (')[0]; }
function pxAsk(st)    { return st.ask || (st.p === 'ED' ? 'Nemecko — civilné letiská' : pxShort(st)); }
function pxAccept(st) { return [pxShort(st)].concat(PX_ALT[st.p] || []); }
function pxPos(st)    { return st.seeds ? st.seeds[0] : st.pos; }
function icaoAreaName(L) {
  if (ICAO_AREAS[L]) return ICAO_AREAS[L].name;
  const far = ICAO_AREAS_FAR.find(f => f[0] === L);
  return far ? far[1].split(' — ')[0] : '—';
}

function buildPrefixQuestions() {
  const list = [];
  pxPool().forEach(st => {
    list.push({ type:'prefix', subtype:'code-to-state', id:'PX_C2S_' + st.p, data:st, accept:pxAccept(st) });
    list.push({ type:'prefix', subtype:'state-to-code', id:'PX_S2C_' + st.p, data:st, accept:[st.p] });
  });
  return list;
}

/* ---------- rozklad indikátora (pri každej odpovedi) ---------- */
function icaoBreakdownHTML(ap) {
  const icao = ap.icao, L = icao.charAt(0), p2 = icao.substring(0, 2);
  const chip = (code, cls, txt) => `<div class="ap-bk"><span class="ap-bk-c ${cls}">${code}</span><span>${txt}</span></div>`;
  let rows;
  if (L === 'K') {
    /* USA sú výnimka: K je celá oblasť aj štát, zvyšok je kód letiska */
    rows = chip('K', 'a', `<strong>oblasť aj štát</strong> — ${icaoAreaName('K')}`) +
           chip(icao.substring(1), 'c', `<strong>letisko</strong> — ${ap.city} (${ap.name})`);
  } else {
    const st = pxAll().find(s => s.p === p2);
    const stName = st ? pxShort(st) : (ICAO_STATES_FAR[p2] || (L === 'U' ? 'Rusko' : L === 'C' ? 'Kanada' : L === 'Z' ? 'Čína' : '—'));
    rows = chip(L, 'a', `<strong>1. písmeno — oblasť</strong> · ${icaoAreaName(L)}`) +
           chip(icao.charAt(1), 'b', `<strong>2. písmeno — štát</strong> · ${stName}`) +
           chip(icao.substring(2), 'c', `<strong>3. a 4. písmeno — stanica a spresnenie jej sídla</strong> · ${ap.city}`);
  }
  return `<div class="reveal-ops"><strong>ROZKLAD INDIKÁTORA (DOC 7910)</strong><div class="ap-bks">${rows}</div></div>`;
}

/* ---------- pokrok: uloženie, opakovanie chýb ---------- */
const AP_STORE = 'atcoTrainerV2.mod02';   // názov kľúča ostal, ukladá sa doň MOD 02 aj MOD 03
function apIsMod02(id) { return id.indexOf('AP_') === 0 || id.indexOf('PX_') === 0; }
function apIsMod03(id) { return id.indexOf('CS_') === 0; }
function apIsMod06(id) { return id.indexOf('CO_') === 0; }
function apIsMine(id) { return apIsMod02(id) || apIsMod03(id) || apIsMod06(id) || id.indexOf('AC_') === 0 || id.indexOf('WP_') === 0; }
function apSaveProgress() {
  try {
    const m = {};
    Object.keys(state.mistakes).filter(apIsMine).forEach(k => { m[k] = state.mistakes[k]; });
    localStorage.setItem(AP_STORE, JSON.stringify({ mistakes: m, ok: state.apOk, sr: state.sr, last: state.last, dailyDone: state.dailyDone }));
    if (typeof PS !== 'undefined') PS.dirty = Date.now();
  } catch (e) { /* súkromné okno alebo plné úložisko — trenažér beží ďalej bez ukladania */ }
}
function apLoadProgress() {
  try {
    const d = JSON.parse(localStorage.getItem(AP_STORE) || 'null');
    if (!d) return;
    Object.assign(state.mistakes, d.mistakes || {});
    state.apOk = d.ok || {};
    state.sr = d.sr || {}; state.last = d.last || {}; state.dailyDone = d.dailyDone || 0;
  } catch (e) {}
}
function apClearProgress(mine) {
  Object.keys(state.mistakes).filter(mine).forEach(k => { delete state.mistakes[k]; });
  Object.keys(state.sr).filter(mine).forEach(k => { delete state.sr[k]; });
  Object.keys(state.apOk).filter(mine).forEach(k => { delete state.apOk[k]; });
  apSaveProgress();
  renderWeak();
}
/* zvládnuté = dvakrát po sebe správne */
function apProgressText() {
  const ids = state.apAllIds || [];
  return `ZVLÁDNUTÉ ${ids.filter(id => (state.apOk[id] || 0) >= 2).length} / ${ids.length}`;
}
function apRenderProgress() {
  const el = document.getElementById('ap-progress');
  if (el) el.textContent = apProgressText();
}
function apRetryBadge(q) {
  if (!q || !q.retry) return;
  const m = document.querySelector('#qcard .qmeta');
  if (m) m.insertAdjacentHTML('beforeend', ' <span class="ap-retry">↻ OPAKOVANIE CHYBY</span>');
}

/* Spoločný krok po každej odpovedi v MOD 02 a MOD 03.
   Chyba sa vráti až neskôr v tom istom cvičení — hneď po sebe by si
   odpoveď len opísal z pamäti. */
function apAfterAnswer(q, ok) {
  srUpdate(q.id, ok);
  if (modOfId(q.id)) state.last[modOfId(q.id)] = dayNow();
  if (ok) {
    state.apOk[q.id] = (state.apOk[q.id] || 0) + 1;
    if (state.mistakes[q.id] > 0) {
      state.mistakes[q.id]--;
      if (!state.mistakes[q.id]) delete state.mistakes[q.id];
      renderWeak();
    }
  } else {
    state.apOk[q.id] = 0;
    const r = q.retry || 0;
    if (r < 2) {
      /* vráti sa až v druhej polovici toho, čo ešte zostáva (najmenej
         o 12 otázok), na náhodnom mieste; pri krátkom zvyšku na konci */
      const left = state.queue.length - state.index - 1;
      const from = state.index + 1 + Math.min(left, Math.max(12, Math.floor(left / 2)));
      const pos = from + Math.floor(Math.random() * (state.queue.length - from + 1));
      state.queue.splice(pos, 0, Object.assign({}, q, { retry: r + 1 }));
      state.total = state.queue.length;
      document.getElementById('qtotal').textContent = state.total;
    }
  }
  apSaveProgress();
  apRenderProgress();
  if (!q.click) apMapReveal(q, ok);
}

/* po odpovedi: pulz zhasne a bod dostane menovku */
function apMapMark(svg, x, y, w, text, ok) {
  const right = x > w - 150;
  const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  lbl.setAttribute('class', 'ap-label ' + (ok ? 'ok' : 'no'));
  lbl.setAttribute('x', (x + (right ? -11 : 11)).toFixed(1));
  lbl.setAttribute('y', (y - 10).toFixed(1));
  lbl.setAttribute('text-anchor', right ? 'end' : 'start');
  lbl.textContent = text;
  svg.appendChild(lbl);
}
function apMapReveal(q, ok) {
  const svg = document.getElementById('map-svg');
  if (!svg || q.type !== 'airport') return;
  if (state.mode !== 'airport' || state.filters.apMode !== 'map') return;
  svg.querySelectorAll('.wp-ring').forEach(r => r.remove());
  const dot = svg.querySelector('#tgt-dot');
  if (dot) { dot.classList.remove('tgt'); dot.classList.add(ok ? 'reveal-correct' : 'wrong'); }
  const m = airportMapXY(q.data);
  apMapMark(svg, m.x, m.y, m.w, q.data.icao + ' · ' + q.data.city, ok);
}

/* vyhodnotenie pre výber z možností a klik do mapy — to isté, čo
   robí submitAnswer() pri písaní, len odpoveď neprichádza z inputu */
function apFinish(q, ok, shown) {
  if (state.mode === 'exam' && state.exam) { examRecord(q, ok, shown || (ok ? examAnswerOf(q) : '')); return; }
  if (ok) {
    state.correct++; state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  } else {
    state.wrong++; state.streak = 0;
    state.mistakes[q.id] = (state.mistakes[q.id] || 0) + 1;
    wkLog(q, shown);
  }
  renderStats(); renderWeak();
  const hb = document.getElementById('btn-hint'); if (hb) hb.disabled = true;
  apAfterAnswer(q, ok);

  const fb = document.getElementById('feedback');
  fb.className = 'feedback show ' + (ok ? 'ok' : 'no');
  fb.innerHTML = `
    <div class="feedback-banner">
      <span>${ok ? `✓ <strong>CORRECT</strong>${shown ? ' · ' + shown : ''}`
                 : `✗ <strong>WRONG</strong> · YOUR ANSWER: <span class="answer">${shown}</span>`}</span>
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

/* ---------- VÝBER Z MOŽNOSTÍ ---------- */
/* Nesprávne možnosti sú zámerne podobné: pri kóde letiská z toho istého
   štátu (LOWW / LOWS / LOWL), pri meste mestá tej istej krajiny. */
function choiceSet(q) {
  let correct, cands;
  if (q.type === 'coord') {
    /* možnosti sú pripravené pri stavbe otázky a zoradené od najpodobnejších */
    correct = q.correct;
    cands = q.pool.map((v, i) => ({ v, t: i }));
  } else if (q.type === 'aircraft') {
    /* podobné = rovnaká kategória turbulencie a počet motorov, potom aspoň kategória */
    const a = q.data, lbl = x => x.icao + ' — ' + x.name;
    correct = lbl(a);
    cands = AIRCRAFT.filter(x => x.icao !== a.icao).map(x => ({ v: lbl(x), t: (x.wake === a.wake ? 0 : 2) + (x.enginesCount === a.enginesCount ? 0 : 1) }));
  } else if (q.type === 'callsign') {
    /* podobné = susedia v abecede: rovnaké prvé dve písmená kódu, potom rovnaké prvé */
    const cs = q.data, i2c = q.subtype === 'icao-to-call';
    const tier = c => c.icao.substring(0,2) === cs.icao.substring(0,2) ? 0 : c.icao.charAt(0) === cs.icao.charAt(0) ? 1 : 2;
    correct = i2c ? cs.call : cs.icao;
    cands = CALLSIGNS.filter(c => q.accept.indexOf(i2c ? c.call : c.icao) < 0 && c.call !== cs.call && c.icao !== cs.icao)
      .map(c => ({ v: i2c ? c.call : c.icao, t: tier(c) }));
  } else if (q.type === 'airport') {
    const ap = q.data, rest = AIRPORTS.filter(a => a.city !== ap.city);
    if (q.subtype === 'icao-to-city') {
      correct = ap.city;
      cands = rest.map(a => ({ v: a.city, t: a.country === ap.country ? 0 : a.cat === ap.cat ? 1 : 2 }));
    } else {
      correct = ap.icao;
      cands = rest.map(a => ({ v: a.icao, t: a.icao.substring(0,2) === ap.icao.substring(0,2) ? 0 : a.icao.charAt(0) === ap.icao.charAt(0) ? 1 : 2 }));
    }
  } else {
    const st = q.data, rest = pxPool().filter(s => s.p !== st.p && pxShort(s) !== pxShort(st));
    const tier = s => s.p.charAt(0) === st.p.charAt(0) ? 0 : 1;
    if (q.subtype === 'code-to-state') { correct = pxShort(st); cands = rest.map(s => ({ v: pxShort(s), t: tier(s) })); }
    else { correct = st.p; cands = rest.map(s => ({ v: s.p, t: tier(s) })); }
  }
  const seen = {}; seen[correct] = 1;
  const uniq = shuffle(cands).filter(c => !seen[c.v] && (seen[c.v] = 1)).sort((a, b) => a.t - b.t);
  /* MOD 06 má šesť možností — hodnoty sú si podobné a štyri by sa dali uhádnuť */
  return { correct, opts: shuffle([correct].concat(uniq.slice(0, q.type === 'coord' ? 5 : 3).map(c => c.v))) };
}
function renderChoiceQuestion(q, card, body) {
  const set = choiceSet(q);
  card.innerHTML = `
    ${body}
    <div class="hint-row empty" id="hint-row">
      <span class="hint-label">HINT</span>
      <span class="hint-text">— press [?] for a hint —</span>
      <button class="btn-hint" id="btn-hint">? HINT</button>
    </div>
    <div class="choice-grid">${set.opts.map((o, i) => `<button class="choice-btn" data-i="${i}">${o}</button>`).join('')}</div>
    <div class="feedback" id="feedback"></div>
  `;
  apRetryBadge(q);
  if (q.type === 'aircraft') loadAircraftPhoto(q.data);
  document.getElementById('btn-hint').onclick = useHint;
  const btns = card.querySelectorAll('.choice-btn');
  btns.forEach(b => {
    b.onclick = () => {
      const picked = set.opts[+b.dataset.i], ok = picked === set.correct;
      btns.forEach(x => {
        x.disabled = true;
        if (set.opts[+x.dataset.i] === set.correct) x.classList.add('ok');
      });
      if (!ok) b.classList.add('no');
      apFinish(q, ok, ok ? '' : picked.toUpperCase());
    };
  });
}

/* ---------- KLIK DO MAPY ---------- */
const EU_KM_PX = 6.1;     // mapa Európy: 1 px ≈ 6,1 km
const SK_KM_PX = 0.44;    // mapa Slovenska: 1 px ≈ 0,44 km
/* tolerancia kliku v km: ĽAHKÁ / HARDCORE */
const CLICK_KM_ALL = { easy: { eu: 100, sk: 15 }, hard: { eu: 50, sk: 8 } };
const CLICK_KM = { get eu() { return CLICK_KM_ALL[state.filters.apAns === 'type' ? 'hard' : 'easy'].eu; }, get sk() { return CLICK_KM_ALL[state.filters.apAns === 'type' ? 'hard' : 'easy'].sk; } };
function svgPoint(svg, e) {
  const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  return [p.x, p.y];
}
function skMapSVG(inner) {
  const P = MAP_PROJ;
  return `<svg viewBox="0 0 ${P.w} ${P.h.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" id="map-svg">
    <rect x="0" y="0" width="${P.w}" height="${P.h.toFixed(0)}" fill="#fbfdfc"></rect>
    <path d="${mapBaseParts().firPath}" fill="#eef6f0" stroke="var(--border-bright)" stroke-width="1.5"></path>
    ${inner}
  </svg>`;
}
function svgAdd(svg, tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
  svg.appendChild(el);
  return el;
}
function renderClickQuestion(q, card) {
  const sk = q.data.cat === 'sk';
  card.innerHTML = `
    <div class="qmeta">AIRPORT ID <span class="sep">·</span> NÁJDI NA MAPE</div>
    <div class="map-prompt">
      <span class="mp-label">KLIKNI, KDE LETISKO LEŽÍ</span>
      <div class="mp-name">${q.subtype === 'icao-to-city' ? q.data.icao : q.data.city}</div>
      <div class="mp-sub">uzná sa klik do ${sk ? CLICK_KM.sk : CLICK_KM.eu} km od letiska${q.subtype === 'city-to-icao' && apCityNote(q.data) ? ' · ' + apCityNote(q.data) : ''}</div>
    </div>
    <div class="map-wrap click">${sk ? skMapSVG('') : euMapSVG('plain', '', true)}</div>
    <div class="feedback" id="feedback"></div>
  `;
  apRetryBadge(q);
  const svg = document.getElementById('map-svg');
  svg.addEventListener('click', e => {
    if (svg.dataset.done) return;
    svg.dataset.done = '1';
    svg.parentElement.classList.remove('click');
    const xy = svgPoint(svg, e);
    apClickEval(q, xy[0], xy[1], svg, sk);
  });
}
function apClickEval(q, x, y, svg, sk) {
  const m = airportMapXY(q.data);
  const km = Math.hypot(x - m.x, y - m.y) * (sk ? SK_KM_PX : EU_KM_PX);
  const ok = km <= (sk ? CLICK_KM.sk : CLICK_KM.eu);
  svgAdd(svg, 'line', { x1: x, y1: y, x2: m.x, y2: m.y, class: 'ap-miss' });
  svgAdd(svg, 'path', { d: `M ${x-5},${y-5} L ${x+5},${y+5} M ${x-5},${y+5} L ${x+5},${y-5}`, class: 'ap-x' });
  svgAdd(svg, 'circle', { cx: m.x, cy: m.y, r: 6, class: 'wp-dot ' + (ok ? 'reveal-correct' : 'wrong') });
  apMapMark(svg, m.x, m.y, m.w, q.data.icao + ' · ' + q.data.city, ok);
  const dist = '≈ ' + Math.round(km) + ' km od letiska';
  apFinish(q, ok, ok ? dist : dist.toUpperCase());
}
