/* ============================================================
   FRA SIGNIFICANT POINTS - FIR BRATISLAVA (MOD 04)
   Coords from official FRA significant points chart (LPS SR).
   type letters: A=Arrival, D=Departure, E=Entry, I=Intermediate, X=Exit
   kind: 'pt'=waypoint, 'nav'=navaid (VOR/DME, NDB)
   grp: SEVER(PL) ZAPAD(CZ/AT) VYCHOD(UA) JUH(HU) STRED(vnutro) NAV
   ============================================================ */
const WAYPOINTS = [
  { name:'REVMA', lat:49.49722, lon:18.70028, type:'I', kind:'pt', grp:'SEVER' },
  { name:'SKARY', lat:49.44472, lon:18.97667, type:'EXI', kind:'pt', grp:'SEVER' },
  { name:'BILNA', lat:49.39361, lon:18.44722, type:'I', kind:'pt', grp:'SEVER' },
  { name:'BABKO', lat:49.61167, lon:19.46944, type:'EXDI', kind:'pt', grp:'SEVER' },
  { name:'MEBAN', lat:49.455, lon:19.64667, type:'XAI', kind:'pt', grp:'SEVER' },
  { name:'ORTYN', lat:49.31028, lon:19.23222, type:'I', kind:'pt', grp:'SEVER' },
  { name:'SUPAK', lat:49.30361, lon:19.79972, type:'XI', kind:'pt', grp:'SEVER' },
  { name:'KELEL', lat:49.31361, lon:20.17528, type:'EXI', kind:'pt', grp:'SEVER' },
  { name:'REGTO', lat:49.40361, lon:20.66472, type:'EDI', kind:'pt', grp:'SEVER' },
  { name:'PODAN', lat:49.41278, lon:21.43917, type:'I', kind:'pt', grp:'SEVER' },
  { name:'LENOV', lat:49.33639, lon:21.01028, type:'EXAI', kind:'pt', grp:'SEVER' },
  { name:'KEFIR', lat:49.35194, lon:21.92361, type:'I', kind:'pt', grp:'SEVER' },
  { name:'PEPIK', lat:48.78278, lon:17.07917, type:'I', kind:'pt', grp:'ZAPAD' },
  { name:'ODNEM', lat:48.85333, lon:17.16778, type:'I', kind:'pt', grp:'ZAPAD' },
  { name:'MAVOR', lat:48.82139, lon:17.5375, type:'I', kind:'pt', grp:'ZAPAD' },
  { name:'TUTPI', lat:48.71583, lon:17.38611, type:'A', kind:'pt', grp:'ZAPAD' },
  { name:'LALES', lat:48.86528, lon:17.70944, type:'I', kind:'pt', grp:'ZAPAD' },
  { name:'ETIPA', lat:48.7125, lon:17.55444, type:'I', kind:'pt', grp:'ZAPAD' },
  { name:'BERVA', lat:48.6175, lon:17.54111, type:'ADI', kind:'pt', grp:'ZAPAD' },
  { name:'TOVKA', lat:48.27028, lon:16.92639, type:'I', kind:'pt', grp:'ZAPAD' },
  { name:'MAREG', lat:48.19056, lon:16.96917, type:'I', kind:'pt', grp:'ZAPAD' },
  { name:'ABLOM', lat:48.0675, lon:17.08778, type:'I', kind:'pt', grp:'ZAPAD' },
  { name:'ROMIS', lat:49.12722, lon:18.11083, type:'I', kind:'pt', grp:'ZAPAD' },
  { name:'VALPI', lat:49.02472, lon:17.95028, type:'I', kind:'pt', grp:'ZAPAD' },
  { name:'MAKAL', lat:49.24611, lon:18.16583, type:'I', kind:'pt', grp:'ZAPAD' },
  { name:'SAGAN', lat:49.15319, lon:18.356, type:'I', kind:'pt', grp:'ZAPAD' },
  { name:'XENAK', lat:48.11944, lon:17.29972, type:'I', kind:'pt', grp:'ZAPAD' },
  { name:'GAWOR', lat:49.14222, lon:22.28139, type:'I', kind:'pt', grp:'VYCHOD' },
  { name:'LADOB', lat:48.95028, lon:22.44861, type:'E', kind:'pt', grp:'VYCHOD' },
  { name:'MALBE', lat:48.82389, lon:22.375, type:'EX', kind:'pt', grp:'VYCHOD' },
  { name:'LASOT', lat:48.63472, lon:22.24583, type:'EX', kind:'pt', grp:'VYCHOD' },
  { name:'HATIP', lat:48.74389, lon:21.72222, type:'ADI', kind:'pt', grp:'VYCHOD' },
  { name:'ROBTU', lat:48.89417, lon:21.815, type:'I', kind:'pt', grp:'VYCHOD' },
  { name:'KENIN', lat:48.36167, lon:21.92722, type:'I', kind:'pt', grp:'VYCHOD' },
  { name:'KEKED', lat:48.52306, lon:21.29139, type:'ADI', kind:'pt', grp:'VYCHOD' },
  { name:'EXIDA', lat:48.6675, lon:21.09111, type:'I', kind:'pt', grp:'VYCHOD' },
  { name:'DUFES', lat:48.95639, lon:21.31889, type:'I', kind:'pt', grp:'VYCHOD' },
  { name:'KOJOT', lat:48.975, lon:21.1425, type:'I', kind:'pt', grp:'VYCHOD' },
  { name:'RAZEC', lat:49.11806, lon:21.09028, type:'I', kind:'pt', grp:'VYCHOD' },
  { name:'PATAK', lat:48.07306, lon:19.12722, type:'AI', kind:'pt', grp:'JUH' },
  { name:'AMRAX', lat:48.09139, lon:19.36611, type:'I', kind:'pt', grp:'JUH' },
  { name:'BADOV', lat:48.02111, lon:18.81583, type:'D', kind:'pt', grp:'JUH' },
  { name:'EDEMU', lat:48.17444, lon:19.80806, type:'AI', kind:'pt', grp:'JUH' },
  { name:'WESTE', lat:48.12306, lon:19.49556, type:'I', kind:'pt', grp:'JUH' },
  { name:'DEMOP', lat:48.17472, lon:20.05694, type:'I', kind:'pt', grp:'JUH' },
  { name:'BALAP', lat:48.06806, lon:19.25, type:'I', kind:'pt', grp:'JUH' },
  { name:'ERGOM', lat:47.80833, lon:18.73306, type:'I', kind:'pt', grp:'JUH' },
  { name:'ALAMU', lat:47.73694, lon:18.33, type:'I', kind:'pt', grp:'JUH' },
  { name:'ANEXA', lat:47.85472, lon:18.48611, type:'A', kind:'pt', grp:'JUH' },
  { name:'XOMBA', lat:47.75667, lon:18.06194, type:'I', kind:'pt', grp:'JUH' },
  { name:'VEDER', lat:47.84639, lon:17.98056, type:'D', kind:'pt', grp:'JUH' },
  { name:'VAMOG', lat:47.78722, lon:17.6625, type:'I', kind:'pt', grp:'JUH' },
  { name:'TABIN', lat:48.01528, lon:18.08444, type:'AD', kind:'pt', grp:'JUH' },
  { name:'ARFOX', lat:47.97444, lon:18.57417, type:'A', kind:'pt', grp:'JUH' },
  { name:'LITKU', lat:48.23056, lon:19.59861, type:'I', kind:'pt', grp:'JUH' },
  { name:'VADEX', lat:49.25083, lon:18.88472, type:'DI', kind:'pt', grp:'STRED' },
  { name:'RUTKI', lat:49.17333, lon:18.94, type:'DI', kind:'pt', grp:'STRED' },
  { name:'MOCON', lat:49.15361, lon:19.21528, type:'ADI', kind:'pt', grp:'STRED' },
  { name:'UMARY', lat:49.10111, lon:19.62083, type:'ADI', kind:'pt', grp:'STRED' },
  { name:'REDSI', lat:49.23333, lon:19.63944, type:'I', kind:'pt', grp:'STRED' },
  { name:'KOPAT', lat:49.10639, lon:18.65444, type:'ADI', kind:'pt', grp:'STRED' },
  { name:'BABNI', lat:48.96472, lon:18.25333, type:'I', kind:'pt', grp:'STRED' },
  { name:'VAPUS', lat:48.89833, lon:18.34917, type:'I', kind:'pt', grp:'STRED' },
  { name:'TEKLA', lat:48.97944, lon:18.74528, type:'I', kind:'pt', grp:'STRED' },
  { name:'NIDOK', lat:48.87333, lon:18.82083, type:'ADI', kind:'pt', grp:'STRED' },
  { name:'KREMI', lat:48.78389, lon:18.88389, type:'I', kind:'pt', grp:'STRED' },
  { name:'ULPUK', lat:48.77667, lon:19.62444, type:'I', kind:'pt', grp:'STRED' },
  { name:'TIVON', lat:48.66083, lon:19.52861, type:'ADI', kind:'pt', grp:'STRED' },
  { name:'TEPNI', lat:48.69694, lon:19.85333, type:'I', kind:'pt', grp:'STRED' },
  { name:'NEPAK', lat:48.61028, lon:20.52917, type:'I', kind:'pt', grp:'STRED' },
  { name:'ETNIK', lat:48.56944, lon:20.70722, type:'I', kind:'pt', grp:'STRED' },
  { name:'TAKOS', lat:48.5825, lon:20.26667, type:'AD', kind:'pt', grp:'STRED' },
  { name:'MOMEP', lat:48.68694, lon:18.57111, type:'ADI', kind:'pt', grp:'STRED' },
  { name:'KALIF', lat:48.50583, lon:19.57194, type:'DI', kind:'pt', grp:'STRED' },
  { name:'KUFIK', lat:48.53333, lon:18.005, type:'DI', kind:'pt', grp:'STRED' },
  { name:'UPIVA', lat:48.57861, lon:18.81694, type:'I', kind:'pt', grp:'STRED' },
  { name:'TURIS', lat:48.36222, lon:18.51167, type:'AD', kind:'pt', grp:'STRED' },
  { name:'ABITU', lat:48.33333, lon:18.32472, type:'A', kind:'pt', grp:'STRED' },
  { name:'TEKVI', lat:48.19111, lon:18.54944, type:'I', kind:'pt', grp:'STRED' },
  { name:'LEKMO', lat:48.99167, lon:20.19944, type:'I', kind:'pt', grp:'STRED' },
  { name:'ABULI', lat:48.48417, lon:20.48667, type:'I', kind:'pt', grp:'STRED' },
  { name:'PITOK', lat:48.32472, lon:20.37167, type:'I', kind:'pt', grp:'STRED' },
  /* Body z mapy AIP ENR 6.1, ktoré v pôvodnom zozname chýbali. Súradnice sú
     z tabuľky na mape; typ bodu (A/D/E/I/X) mapa neuvádza, preto je prázdny. */
  { name:'ADAMA', lat:47.98778, lon:17.34139, type:'', kind:'pt', grp:'JUH', src:'ENR 6.1' },
  { name:'EPEDA', lat:48.87361, lon:19.95722, type:'', kind:'pt', grp:'STRED', src:'ENR 6.1' },
  { name:'EVULA', lat:48.66250, lon:21.69306, type:'', kind:'pt', grp:'VYCHOD', src:'ENR 6.1' },
  { name:'GUPLU', lat:48.71861, lon:17.23917, type:'', kind:'pt', grp:'ZAPAD', src:'ENR 6.1' },
  { name:'KOXER', lat:48.12750, lon:17.04833, type:'', kind:'pt', grp:'ZAPAD', src:'ENR 6.1' },
  { name:'LEDRI', lat:48.09083, lon:17.18278, type:'', kind:'pt', grp:'ZAPAD', src:'ENR 6.1' },
  { name:'LIPTY', lat:49.23556, lon:19.33167, type:'', kind:'pt', grp:'STRED', src:'ENR 6.1' },
  { name:'LOLKA', lat:49.22000, lon:20.10000, type:'', kind:'pt', grp:'SEVER', src:'ENR 6.1' },
  { name:'MARKA', lat:48.88944, lon:20.67722, type:'', kind:'pt', grp:'STRED', src:'ENR 6.1' },
  { name:'ORLAN', lat:49.28639, lon:20.88722, type:'', kind:'pt', grp:'SEVER', src:'ENR 6.1' },
  { name:'REKLU', lat:48.58750, lon:16.93778, type:'', kind:'pt', grp:'ZAPAD', src:'ENR 6.1' },
  { name:'SOMID', lat:48.50528, lon:17.71722, type:'', kind:'pt', grp:'STRED', src:'ENR 6.1' },
  { name:'TOKAJ', lat:48.65583, lon:21.83278, type:'', kind:'pt', grp:'VYCHOD', src:'ENR 6.1' },
  { name:'UDREL', lat:49.01028, lon:20.83611, type:'', kind:'pt', grp:'STRED', src:'ENR 6.1' },
  { name:'TATRY', lat:49.06472, lon:20.35, type:'ADI', kind:'nav', grp:'NAV', nav:'VOR/DME 112.1 (PPD)' },
  { name:'NITRA', lat:48.29056, lon:18.05056, type:'ADI', kind:'nav', grp:'NAV', nav:'VOR/DME 116.5 (NIT)' },
  { name:'SLIAC', lat:48.45333, lon:19.11583, type:'ADI', kind:'nav', grp:'NAV', nav:'VOR/DME 114.0 (SLC)' },
  { name:'STEFANIK N', lat:48.22389, lon:17.29028, type:'A', kind:'nav', grp:'NAV', nav:'NDB 391 (OKR)' },
  { name:'JANOVCE', lat:48.17861, lon:17.54472, type:'D', kind:'nav', grp:'NAV', nav:'VOR/DME 110.8 (JAN)' },
  { name:'KOSICE', lat:48.68306, lon:21.24806, type:'AD', kind:'nav', grp:'NAV', nav:'VOR/DME 108.2 (KSC)' },
];
// total points: 102 (82 FRA significant points z ENR 4.4 + 14 bodov z mapy ENR 6.1 + 6 navaids)

/* City / airport anchors (always visible reference points) */
const WP_CITIES = [
  { name:'BRATISLAVA', lat:48.1486, lon:17.1077 },
  { name:'ŽILINA',     lat:49.2231, lon:18.7394 },
  { name:'POPRAD',     lat:49.0614, lon:20.2419 },
  { name:'KOŠICE',     lat:48.7164, lon:21.2611 },
];

/* Projection bounds. Height is computed so longitude/latitude don't get
   stretched — uses cos(latMid) correction (equirectangular). */
const MAP_PROJ = (function(){
  const latMin=47.60, latMax=49.70, lonMin=16.75, lonMax=22.70, w=1000;
  const cosLat = Math.cos(((latMin+latMax)/2) * Math.PI/180);
  const h = w * ((latMax-latMin)/(lonMax-lonMin)) / cosLat;
  return { latMin, latMax, lonMin, lonMax, w, h };
})();
function projX(lon){ return ( (lon - MAP_PROJ.lonMin) / (MAP_PROJ.lonMax - MAP_PROJ.lonMin) ) * MAP_PROJ.w; }
function projY(lat){ return ( 1 - (lat - MAP_PROJ.latMin) / (MAP_PROJ.latMax - MAP_PROJ.latMin) ) * MAP_PROJ.h; }

/* Slovak national border ≈ Bratislava FIR boundary. Real geographic data
   (GeoJSON of Slovakia), simplified via Douglas-Peucker to 161 vertices.
   [lon, lat], rendered as a smooth closed curve. */
const FIR_OUTLINE = [
  [19.4464,49.6138],[19.371,49.5673],[19.3632,49.5361],[19.261,49.5313],[19.2328,49.51],[19.2262,49.4557],[19.1849,49.4341],[19.1973,49.4144],
  [19.1504,49.4038],[19.0725,49.4176],[18.9778,49.3949],[18.9735,49.5027],[18.942,49.5196],[18.8134,49.5164],[18.7548,49.4884],[18.547,49.5007],
  [18.549,49.469],[18.4783,49.4087],[18.4076,49.398],[18.4138,49.3676],[18.3774,49.3278],[18.1892,49.2893],[18.1453,49.2467],[18.1549,49.2189],
  [18.0924,49.0577],[18.0251,49.0221],[17.9173,49.0163],[17.8864,48.9275],[17.7814,48.9243],[17.6997,48.8593],[17.5301,48.8146],[17.4463,48.8453],
  [17.3605,48.8146],[17.2032,48.8769],[17.105,48.8259],[16.9643,48.6656],[16.9401,48.6167],[16.9519,48.5421],[16.8585,48.4565],[16.8338,48.38],
  [16.9437,48.2704],[16.9849,48.1679],[17.059,48.1441],[17.0865,48.0964],[17.0782,48.0303],[17.3296,47.9954],[17.4542,47.8853],[17.7105,47.7565],
  [18.306,47.7319],[18.4584,47.7652],[18.6424,47.7587],[18.7413,47.8132],[18.8525,47.8187],[18.7633,47.8731],[18.7729,47.9587],[18.7523,47.9761],
  [18.8113,47.9899],[18.821,48.0404],[18.9844,48.0551],[19.0091,48.0762],[19.2467,48.0533],[19.3098,48.0882],[19.4417,48.0992],[19.4637,48.0817],
  [19.5282,48.2045],[19.6312,48.2485],[19.6944,48.2032],[19.8001,48.1949],[19.7905,48.1569],[19.8523,48.1775],[19.9155,48.1468],[19.899,48.1239],
  [19.938,48.1317],[19.9742,48.1661],[20.0734,48.1801],[20.1333,48.2254],[20.1367,48.255],[20.3249,48.273],[20.4102,48.3662],[20.4159,48.4186],
  [20.5074,48.4893],[20.505,48.5321],[20.5448,48.5441],[20.8507,48.5816],[20.8672,48.5516],[20.9166,48.5602],[20.9825,48.5175],[21.0665,48.5256],
  [21.1195,48.4912],[21.2211,48.5374],[21.3054,48.5218],[21.3221,48.5621],[21.4154,48.5591],[21.4403,48.5851],[21.5136,48.5512],[21.5428,48.5084],
  [21.6135,48.5093],[21.6657,48.3923],[21.7241,48.3517],[21.8346,48.3343],[21.8353,48.364],[22.0228,48.3932],[22.1368,48.38],[22.1677,48.5781],
  [22.3478,48.6867],[22.3918,48.8694],[22.4253,48.8858],[22.4306,48.9322],[22.4848,48.9923],[22.5471,49.0077],[22.5646,49.0881],[22.4193,49.0993],
  [22.369,49.1457],[22.2249,49.1527],[22.2279,49.1842],[22.0623,49.2113],[22.031,49.2253],[22.035,49.2768],[21.9645,49.3484],[21.9039,49.3491],
  [21.8414,49.3914],[21.7887,49.3552],[21.7234,49.4119],[21.6593,49.4157],[21.631,49.446],[21.4338,49.4122],[21.2737,49.46],[21.2093,49.4028],
  [21.1235,49.4357],[21.0454,49.4187],[21.1028,49.3758],[20.9246,49.2968],[20.8616,49.3485],[20.7975,49.3433],[20.8132,49.3584],[20.7595,49.3728],
  [20.7407,49.4155],[20.6182,49.4172],[20.5748,49.3761],[20.4318,49.4179],[20.4334,49.396],[20.3234,49.403],[20.3147,49.3435],[20.2224,49.3507],
  [20.158,49.3041],[20.1504,49.319],[20.1007,49.2494],[20.0867,49.1757],[19.9219,49.2356],[19.8848,49.203],[19.7949,49.199],[19.7597,49.2065],
  [19.793,49.268],[19.8233,49.2766],[19.7937,49.297],[19.7906,49.4102],[19.7188,49.3876],[19.6308,49.4081],[19.6408,49.4568],[19.5813,49.4554],
  [19.5298,49.5726],
];

/* Bratislava CTA sector boundaries (West / Central / East).
   Approximated from the official FRA chart — straight polylines north→south
   as [lat, lon]. Easy to nudge: tweak these to move dividers. */
const SECTOR_LINES = {
  // WEST | CENTRAL  (≈ lon 18.9, slight eastward tilt going south)
  wc: [[49.40, 18.90],[48.80, 18.93],[48.30, 18.98],[47.70, 19.03]],
  // CENTRAL | EAST  (≈ lon 20.0)
  ce: [[49.40, 20.00],[48.80, 20.00],[48.30, 20.04],[48.00, 20.08]],
};
function lonOnLine(line, lat){
  if (lat >= line[0][0]) return line[0][1];
  if (lat <= line[line.length-1][0]) return line[line.length-1][1];
  for (let i=0;i<line.length-1;i++){
    const [la1,lo1] = line[i], [la2,lo2] = line[i+1];
    if (lat <= la1 && lat >= la2){
      const t = (lat - la1) / (la2 - la1);
      return lo1 + t * (lo2 - lo1);
    }
  }
  return line[line.length-1][1];
}
function sectorOf(lat, lon){
  if (lon < lonOnLine(SECTOR_LINES.wc, lat)) return 'W';
  if (lon < lonOnLine(SECTOR_LINES.ce, lat)) return 'C';
  return 'E';
}
const SECTOR_NAMES = { W:'WEST', C:'CENTRAL', E:'EAST' };
const SECTOR_LONG  = { W:'Bratislava CTA — Sector WEST', C:'Bratislava CTA — Sector CENTRAL', E:'Bratislava CTA — Sector EAST' };
WAYPOINTS.forEach(w => { w.sec = sectorOf(w.lat, w.lon); });


/* slepá mapa Európy (PNG 866×704) — podklad pre MOD 02 */
