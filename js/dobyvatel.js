if (!DQ_BANK.law) DQ_BANK.law = [];   // okruh LETECKÉ PRÁVO (v5.4) — plní sa z pestrých otázok
/* doplnok okruhu VŠEOBECNÝ PREHĽAD (v5.2) */
DQ_BANK.gen.push(...[['Aký je IATA kód letiska Praha?', 'PRG', ['PRA', 'PRH', 'LKP']], ['Aký je IATA kód letiska Budapešť?', 'BUD', ['BUP', 'BDP', 'HBP']], ['Aký je IATA kód letiska Varšava Chopin?', 'WAW', ['WAR', 'WSW', 'VAR']], ['Aký je IATA kód letiska Frankfurt nad Mohanom?', 'FRA', ['FRK', 'FFM', 'FKF']], ['Aký je IATA kód letiska Mníchov?', 'MUC', ['MUN', 'MNH', 'MCH']],
  ['Aký je IATA kód letiska Londýn Heathrow?', 'LHR', ['LON', 'LGW', 'HTR']], ['Aký je IATA kód letiska Paríž Charles de Gaulle?', 'CDG', ['PAR', 'ORY', 'PCG']], ['Aký je IATA kód letiska Amsterdam Schiphol?', 'AMS', ['SCH', 'AMD', 'ASP']], ['Aký je IATA kód letiska Istanbul?', 'IST', ['ISL', 'IBL', 'TUR']], ['Aký je IATA kód letiska Dubaj?', 'DXB', ['DUB', 'DBI', 'UAE']], ['Aký je IATA kód letiska New York John F. Kennedy?', 'JFK', ['NYC', 'NYK', 'KEN']], ['Aký je IATA kód letiska Košice?', 'KSC', ['KOS', 'KZI', 'KCE']],
  ['Z ktorej krajiny je letecká spoločnosť KLM?', 'Holandsko', ['Belgicko', 'Dánsko', 'Nemecko']], ['Z ktorej krajiny je letecká spoločnosť Qantas?', 'Austrália', ['Nový Zéland', 'Kanada', 'Juhoafrická republika']], ['Z ktorej krajiny je letecká spoločnosť Emirates?', 'Spojené arabské emiráty', ['Katar', 'Saudská Arábia', 'Omán']], ['Z ktorej krajiny je letecká spoločnosť LOT?', 'Poľsko', ['Litva', 'Lotyšsko', 'Česko']], ['Z ktorej krajiny je letecká spoločnosť TAP?', 'Portugalsko', ['Španielsko', 'Brazília', 'Taliansko']], ['Z ktorej krajiny je letecká spoločnosť Finnair?', 'Fínsko', ['Švédsko', 'Nórsko', 'Estónsko']],
  ['Do ktorej aliancie patrí Lufthansa?', 'Star Alliance', ['oneworld', 'SkyTeam', 'do žiadnej']], ['Do ktorej aliancie patrí British Airways?', 'oneworld', ['Star Alliance', 'SkyTeam', 'do žiadnej']], ['Do ktorej aliancie patrí Air France?', 'SkyTeam', ['Star Alliance', 'oneworld', 'do žiadnej']],
  ['Čo upravujú pravidlá ETOPS?', 'Lety dvojmotorových lietadiel ďaleko od vhodného letiska', ['Najvyššiu vzletovú hmotnosť', 'Odpočinok posádok', 'Hlukové limity letísk']], ['Akú farbu má letový zapisovač, ktorému sa hovorí čierna skrinka?', 'Oranžovú', ['Čiernu', 'Žltú', 'Červenú']], ['Čo je codeshare?', 'Let jedného dopravcu predávaný aj pod číslom iného dopravcu', ['Spoločný kód odpovedača dvoch lietadiel', 'Zdieľanie frekvencie dvoma stanovišťami', 'Spoločná registrácia lietadiel']],
  ['Ktorý výrobca vyrába motory radu Trent?', 'Rolls-Royce', ['General Electric', 'Pratt & Whitney', 'Safran']], ['Kto tvorí spoločný podnik CFM International?', 'GE a Safran', ['Rolls-Royce a MTU', 'Pratt & Whitney a IHI', 'Airbus a Boeing']], ['Čo znamená skratka UTC?', 'Koordinovaný svetový čas', ['Jednotný traťový kód', 'Horná riadená oblasť', 'Univerzálny typový certifikát']], ['Ktorý jazyk je spoločný pre medzinárodné rádiové spojenie v letectve?', 'Angličtina', ['Francúzština', 'Španielčina', 'Nemčina']],
  ['V ktorom meste sídli IATA?', 'Montreal', ['Ženeva', 'Brusel', 'Londýn']], ['V ktorom meste sídli EASA?', 'Kolín nad Rýnom', ['Brusel', 'Paríž', 'Viedeň']], ['Ktoré slovenské letisko s medzinárodnou dopravou leží najvyššie?', 'Poprad-Tatry', ['Žilina', 'Sliač', 'Košice']], ['Dráha má označenie 31. Aký je približne jej magnetický smer?', '310°', ['031°', '130°', '013°']],
  ['Ktorému štátu patrí registračná značka OM?', 'Slovensko', ['Česko', 'Rakúsko', 'Maďarsko']], ['Ktorému štátu patrí registračná značka OK?', 'Česko', ['Slovensko', 'Poľsko', 'Rakúsko']], ['Ktorému štátu patrí registračná značka OE?', 'Rakúsko', ['Estónsko', 'Česko', 'Švajčiarsko']], ['Ktorému štátu patrí registračná značka HA?', 'Maďarsko', ['Chorvátsko', 'Holandsko', 'Rumunsko']], ['Ktorému štátu patrí registračná značka SP?', 'Poľsko', ['Španielsko', 'Portugalsko', 'Slovinsko']], ['Ktorému štátu patrí registračná značka D?', 'Nemecko', ['Dánsko', 'Holandsko', 'Belgicko']], ['Ktorému štátu patrí registračná značka G?', 'Spojené kráľovstvo', ['Nemecko', 'Grécko', 'Gruzínsko']], ['Ktorému štátu patrí registračná značka N?', 'Spojené štáty americké', ['Nórsko', 'Holandsko', 'Nový Zéland']]
].map(x => ({ q: x[0], a: x[1], w: x[2] })));
let DQ_MAP = DQ_MAPS.l;   // s = malá (2 hráči), m = stredná (3–4), l = veľká (5–6); prepína sa podľa hry
/* ============================================================
   DOBYVATEĽ — 2 až 4 hráči, VFR mapa Slovenska rozdelená na skutočné
   priestory (letiská, CTR, TMA, TRA/TSA, LZR, trieda G EAST/WEST).
   Hranice sú z verejnej VFR mapy LPS SR (DQ_MAP). Hru riadi prehliadač
   hostiteľa: posiela všetkým stav, ostatní posielajú len svoje ťahy.
   ============================================================ */
const DQ_COL = ['#e63946', '#2dc653', '#3a86ff', '#ffbe0b', '#b45cff', '#1fd6d6'];   // červený, zelený, modrý, žltý, fialový, tyrkysový hráč
const DQ_STYLE = 'a';   // vzhľad mapy: a = čistá čierna, b = čierna s typmi, c = radar
const DQ_CAT = { AD: ['LETISKO', '#ffffff'], CTR: ['CTR', '#8fb8ff'], TMA: ['TMA', '#c3d6ff'], TRA: ['TRA', '#d9c2f5'], TSA: ['TSA', '#c7a6ee'],
  R: ['LZR', '#f7b3b3'], P: ['LZP', '#f08a8a'], D: ['LZD', '#f5c9a0'], G: ['TRIEDA G', '#dfe8e2'] };
const DQ_QS = [['ac', 'MOD 01', 'TYPY LIETADIEL'], ['ap', 'MOD 02', 'LETISKÁ'], ['px', 'MOD 02', 'PREFIXY ŠTÁTOV'], ['cs', 'MOD 03', 'VOLAČKY'], ['hd', 'MOD 05', 'KURZY'], ['co', 'MOD 06', 'FREKVENCIE'], ['atm', 'OKRUH', 'ATM'], ['nav', 'OKRUH', 'NAVIGÁCIA'], ['met', 'OKRUH', 'METEOROLÓGIA'], ['eqps', 'OKRUH', 'ZARIADENIA'], ['hum', 'OKRUH', 'ĽUDSKÉ FAKTORY'], ['acft', 'OKRUH', 'LIETADLÁ'], ['pen', 'OKRUH', 'PRAC. PROSTREDIE'], ['law', 'OKRUH', 'LETECKÉ PRÁVO'], ['hist', 'OKRUH', 'HISTÓRIA LETECTVA'], ['gen', 'OKRUH', 'VŠEOBECNÝ PREHĽAD']];
const DQ_OPT = { map: ['auto', 's', 'm', 'l'], max: [2, 3, 4, 5, 6], time: [10, 15, 20, 30], claim: [3, 5, 8, 10, 12], war: [0, 3, 5, 8, 10], pm: [0, 1], lv: [0, 1], fast: [0, 1], jk: [0, 1], pk: [0, 1] };
const DQ_FIX = { rest: 4200, count: 3700, tierev: 8500, startrev: 8500, startpick: 25000, claimrev: 4500, pick: 25000, warpick: 30000, modpick: 25000, duelintro: 3000, duelrev: 5500 };
const DQ_FXMS = 2400;   // ako dlho sa priestor vyfarbuje
const DQ = { id: null, room: null, host: false, S: null, net: null, H: null, my: null, k: -1, qT0: 0, deadline: 0, sig: '', sb: null, err: '', lastState: 0, loop: null, bar: null, reported: null, guest: '', prev: null };
try { DQ.id = sessionStorage.getItem('atcoDqId'); if (!DQ.id) { DQ.id = Math.random().toString(36).slice(2, 10); sessionStorage.setItem('atcoDqId', DQ.id); } } catch (e) { DQ.id = Math.random().toString(36).slice(2, 10); }
/* ---------- vlastné otázky: nahráva ich hostiteľ zo súboru (.txt, .csv, .xlsx, .docx) ----------
   Tvar tabuľky / riadku:  Otázka; správna odpoveď; zlá; zlá; zlá
   Tvar bloku v texte:     otázka na prvom riadku, pod ňou odpovede (správna označená * alebo prvá),
                           bloky oddelené prázdnym riadkom.
   Otázky ostávajú v prehliadači hostiteľa; ostatným hráčom ich posiela hra sama. */
/* ---------- v4.0: vzhľad hráča, animácie a efekty ---------- */
const DQ_PAL = ['#e63946', '#2dc653', '#3a86ff', '#ffbe0b', '#b45cff', '#1fd6d6', '#ff7ab6', '#ff8c2b'];   // farby na výber
const DQ_ICO = ['✈', '🛩', '🚁', '🚀', '🛸', '🪂', '🎈', '🛰'];                                              // ikonka hráča
const DQ_EMO = ['👍', '😂', '😱', '😭'];                                                                     // rýchle reakcie
const DQ_JKN = { h: '½ 50:50', t: '⏱ +10 s', d: '×2 BODY', s: '⏱ +5 s', a: '×1,2 BODY', b: '×1,3 BODY' };
/* boosty za úroveň (v4.11): pribudnú k žolíkom, každý raz za hru; hostiteľ ich vie vypnúť. [od úrovne, žolík, názov, popis] */
const DQ_PERK = [[6, 's', '⏱ +5 s', 'päť sekúnd navyše pre všetkých'], [16, 'a', '×1,2 BODY', 'pri dobytí o pätinu bodov viac'], [28, 'h', 'DRUHÉ 50:50', 'ešte jedno 50:50'], [35, 'b', '×1,3 BODY', 'pri dobytí o 30 % bodov viac'], [40, 't', 'DRUHÝCH +10 s', 'ešte raz desať sekúnd navyše']];
const DQ_MUL = { d: 2, a: 1.2, b: 1.3 };
function dqMulTxt(m) { return '×' + String(m === true ? 2 : m).replace('.', ','); }
function dqMyLv() { if (!RK.acct) return 1; const r = (RK.rows || []).find(x => x.nick === RK.acct.nick); return r ? rkLevel(rkTotal(r)).n : (lsGet('atcoTrainerV2.lvSeen:' + RK.acct.nick.toLowerCase(), 1) || 1); }
function dqMeta() { return Object.assign(dqLook(), { lv: dqMyLv(), acc: RK.acct ? 1 : 0 }); }
function dqJkFor(p, cfg) { if (!cfg.jk) return null; const J = { h: 1, t: 1, d: 1 }; if (cfg.pk && !cfg.demo && !p.bot) DQ_PERK.forEach(x => { if ((p.lv || 1) >= x[0]) J[x[1]] = (J[x[1]] || 0) + 1; }); return J; }
/* profilovky a emoji hráčov (v4.11) — načítajú sa zvlášť, len pre prezývky, ktoré práve vidno */
function avNeed(nicks) {
  const L = [...new Set((nicks || []).filter(n => n && !(n in AV.m)))].slice(0, 40);
  if (!L.length || AV.busy) return;
  AV.busy = true; L.forEach(n => { AV.m[n] = null; });
  rkRpc('atco_avatars', { p_nicks: L }).then(R => { Object.keys(R || {}).forEach(n => { AV.m[n] = R[n]; }); }).catch(() => {}).then(() => {
    AV.busy = false;
    if (state.mode === 'rank') renderRank(document.getElementById('qcard'));
    else if (state.mode === 'home') { const e = document.getElementById('home-hello'); if (e) e.outerHTML = homeHelloHTML(); }
    else if (state.mode === 'conquer' && DQ.room && DQ.S) { const c = document.getElementById('dq-chips'), me = DQ.S.players.findIndex(p => p.id === DQ.id); if (c && DQ.S.phase !== 'lobby') c.innerHTML = dqChipsHTML(DQ.S, me); }
  });
}
function avFace(nick, emo, cls) { const o = AV.m[nick], a = o && o.a, e = (o && o.e) || emo; return `<span class="pf-av ${cls || ''}">${a ? `<img src="${dqEsc(a)}" alt="">` : e ? `<u>${dqEsc(e)}</u>` : `<b>${dqEsc(String(nick || '?').trim().charAt(0).toUpperCase())}</b>`}</span>`; }
function dqFace(S, i) { const p = S.players[i], o = p && p.acc && AV.m[p.nick], a = o && o.a; return a ? `<i class="av"><img src="${dqEsc(a)}" alt=""></i>` : `<i>${dqI(i)}</i>`; }
/* otázky s fotkou z Wikipédie (v4.11): [heslo na en.wikipedia, správna odpoveď]; p = ako často v danom okruhu padnú */
const DQ_IMGQ = {
  met: { p: 0.07, g: [
    { q: 'Aký oblak alebo jav je na fotke?', it: [['Cumulonimbus_cloud', 'Cumulonimbus (Cb)'], ['Cumulus_cloud', 'Cumulus (Cu)'], ['Cirrus_cloud', 'Cirrus (Ci)'], ['Stratus_cloud', 'Stratus (St)'], ['Altocumulus_cloud', 'Altocumulus (Ac)'], ['Lenticular_cloud', 'Šošovkovitý oblak (lenticularis)'], ['Mammatus_cloud', 'Mammatus'], ['Cirrocumulus_cloud', 'Cirrocumulus (Cc)'], ['Funnel_cloud', 'Lievikovitý oblak (tuba)'], ['Shelf_cloud', 'Húľavový val (arcus)'], ['Contrail', 'Kondenzačná stopa']] },
    { q: 'Aký jav je na fotke?', it: [['Thunderstorm', 'Búrka'], ['Fog', 'Hmla'], ['Rime_ice', 'Námraza'], ['Tornado', 'Tornádo'], ['Virga', 'Virga — zrážky, ktoré nedopadnú na zem'], ['Microburst', 'Downburst — prudký prepad studeného vzduchu'], ['Mammatus_cloud', 'Mammatus'], ['Contrail', 'Kondenzačná stopa']] },
    { q: 'Aký meteorologický prístroj je na fotke?', it: [['Weather_radar', 'Meteorologický radar'], ['Radiosonde', 'Rádiosonda'], ['Anemometer', 'Anemometer'], ['Ceilometer', 'Ceilometer'], ['Windsock', 'Veterný rukáv']] }] },
  eqps: { p: 0.09, g: [
    { q: 'Aký prístroj alebo zariadenie je na fotke?', it: [['Attitude_indicator', 'Umelý horizont'], ['Altimeter', 'Výškomer'], ['Airspeed_indicator', 'Rýchlomer'], ['Heading_indicator', 'Smerový zotrvačník'], ['Variometer', 'Variometer'], ['Turn_and_slip_indicator', 'Zatáčkomer s priečnym sklonomerom'], ['Pitot_tube', 'Pitotova trubica'], ['VHF_omnidirectional_range', 'Pozemná stanica VOR'], ['Precision_approach_path_indicator', 'PAPI'], ['Flight_recorder', 'Letový zapisovač'], ['Primary_flight_display', 'Primárny letový displej (PFD)'], ['Head-up_display', 'Priehľadový displej (HUD)'], ['Flight_progress_strip', 'Letový prúžok (strip)'], ['Jet_bridge', 'Nástupný most'], ['Winglet', 'Winglet'], ['Thrust_reversal', 'Obracač ťahu'], ['Turboprop', 'Turbovrtuľový motor']] }] },
  acft: { p: 0.07, g: [
    { q: 'Ktorá časť lietadla je na fotke?', it: [['Leading-edge_slat', 'Slot na nábežnej hrane'], ['Spoiler_(aeronautics)', 'Spojler (rušič vztlaku)'], ['Landing_gear', 'Hlavný podvozok'], ['Auxiliary_power_unit', 'Pomocná energetická jednotka (APU)'], ['Propeller_(aeronautics)', 'Vrtuľa'], ['Jet_engine', 'Prúdový motor'], ['Winglet', 'Winglet'], ['Pitot_tube', 'Pitotova trubica']] },
    { q: 'Aký druh lietadla je na fotke?', it: [['Glider_(sailplane)', 'Klzák (vetroň)'], ['Airship', 'Vzducholoď'], ['Hot_air_balloon', 'Teplovzdušný balón'], ['Autogyro', 'Vírnik'], ['Flying_boat', 'Lietajúci čln'], ['Biplane', 'Dvojplošník']] }] },
  pen: { p: 0.08, g: [
    { q: 'Čo je na fotke?', it: [['Approach_lighting_system', 'Približovacia svetelná sústava'], ['Precision_approach_path_indicator', 'PAPI'], ['Windsock', 'Veterný rukáv'], ['Jet_bridge', 'Nástupný most'], ['Airport_apron', 'Odbavovacia plocha'], ['Secondary_surveillance_radar', 'Anténa sekundárneho radaru'], ['Airport_surveillance_radar', 'Letiskový prehľadový radar'], ['Radar_display', 'Radarová obrazovka'], ['Aeronautical_chart', 'Letecká mapa'], ['Flight_progress_strip', 'Letový prúžok (strip)']] }] },
  hist: { p: 0.2, g: [
    { q: 'Ktoré slávne lietadlo je na fotke?', it: [['Wright_Flyer', 'Wright Flyer'], ['Blériot_XI', 'Blériot XI'], ['Spirit_of_St._Louis', 'Spirit of St. Louis'], ['Douglas_DC-3', 'Douglas DC-3'], ['De_Havilland_Comet', 'de Havilland Comet'], ['Concorde', 'Concorde'], ['Tupolev_Tu-144', 'Tupolev Tu-144'], ['Lockheed_SR-71_Blackbird', 'Lockheed SR-71 Blackbird'], ['Bell_X-1', 'Bell X-1'], ['LZ_129_Hindenburg', 'LZ 129 Hindenburg'], ['Messerschmitt_Me_262', 'Messerschmitt Me 262'], ['Antonov_An-225_Mriya', 'Antonov An-225 Mrija'], ['Junkers_Ju_52', 'Junkers Ju 52'], ['Supermarine_Spitfire', 'Supermarine Spitfire'], ['Boeing_707', 'Boeing 707'], ['Hughes_H-4_Hercules', 'Hughes H-4 Hercules'], ['Ford_Trimotor', 'Ford Trimotor'], ['Fokker_Dr.I', 'Fokker Dr.I'], ['Sopwith_Camel', 'Sopwith Camel'], ['Boeing_B-17_Flying_Fortress', 'Boeing B-17 Flying Fortress'], ['North_American_X-15', 'North American X-15'], ['Lockheed_Constellation', 'Lockheed Constellation'], ['Dornier_Do_X', 'Dornier Do X']] }] },
  gen: { p: 0.25, g: [
    { q: 'Kto je na fotke?', it: [['Charles_Lindbergh', 'Charles Lindbergh'], ['Amelia_Earhart', 'Amelia Earhartová'], ['Yuri_Gagarin', 'Jurij Gagarin'], ['Milan_Rastislav_Štefánik', 'Milan Rastislav Štefánik'], ['Louis_Blériot', 'Louis Blériot'], ['Chuck_Yeager', 'Chuck Yeager'], ['Neil_Armstrong', 'Neil Armstrong'], ['Otto_Lilienthal', 'Otto Lilienthal'], ['Howard_Hughes', 'Howard Hughes'], ['Igor_Sikorsky', 'Igor Sikorskij'], ['Ferdinand_von_Zeppelin', 'Ferdinand von Zeppelin'], ['Štefan_Banič', 'Štefan Banič'], ['Bessie_Coleman', 'Bessie Colemanová'], ['Frank_Whittle', 'Frank Whittle']] }] },
};
const DQ_LOOKK = 'atcoTrainerV2.dqLook', DQ_LOWK = 'atcoTrainerV2.dqLow';
function dqC(i) { const p = DQ.S && DQ.S.players[i]; return p && DQ_PAL[p.col] ? DQ_PAL[p.col] : DQ_PAL[((i % DQ_PAL.length) + DQ_PAL.length) % DQ_PAL.length]; }
function dqI(i) { const p = DQ.S && DQ.S.players[i]; return p && DQ_ICO[p.ico] ? DQ_ICO[p.ico] : DQ_ICO[0]; }
function dqLook() { const L = lsGet(DQ_LOOKK, null) || {}; return { col: DQ_PAL[L.col] ? L.col : -1, ico: DQ_ICO[L.ico] ? L.ico : 0 }; }
function dqFreeCol(S, want) { const used = S.players.map(p => p.col); if (DQ_PAL[want] && used.indexOf(want) < 0) return want; for (let c = 0; c < DQ_PAL.length; c++) if (used.indexOf(c) < 0) return c; return 0; }
/* „menej animácií“: vlastná voľba hráča; kým si nevyberie, platí nastavenie systému */
function dqLow() {
  if (DQ.low == null) { const v = lsGet(DQ_LOWK, null); if (v == null) { try { DQ.low = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { DQ.low = false; } } else DQ.low = !!v; }
  return DQ.low;
}
function dqLowApply() {
  const st = document.getElementById('dq-stage'), b = document.getElementById('dq-fxb'), low = dqLow();
  if (st) st.classList.toggle('dq-low', low);
  if (b) { b.classList.toggle('off', low); b.title = low ? 'Animácie: menej — klikni pre plné' : 'Animácie: plné — klikni pre menej'; }
}
/* vrstva efektov nad mapou: má rovnaký výrez ako mapa, ale neprekresľuje sa s ňou */
function dqFxSvg() {
  const L = document.getElementById('dq-fxl'); if (!L) return null;
  let e = document.getElementById('dq-fxs');
  if (!e) { const v = DQ.view || dqBaseView(); L.innerHTML = `<svg id="dq-fxs" class="dq-fxs" viewBox="${v.x} ${v.y} ${v.w} ${v.h}" preserveAspectRatio="xMidYMid meet"></svg>`; e = document.getElementById('dq-fxs'); }
  return e;
}
function dqFxAdd(html, ms) {
  const e = dqFxSvg(); if (!e) return null;
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.innerHTML = html; e.appendChild(g);
  if (ms) setTimeout(() => g.remove(), ms);
  return g;
}
function dqScr(x, y) { const e = document.getElementById('dq-svg'), m = e && e.getScreenCTM(); return m ? { x: x * m.a + m.e, y: y * m.d + m.f } : null; }
function dqChipPos(i) { const c = document.querySelectorAll('#dq-chips .dq-chip')[i]; if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
/* nápis, ktorý vyskočí na mieste „from“ a odletí do „to“ (alebo len vystúpi nahor a zhasne) */
function dqFloat(html, from, to, cls, ms) {
  const st = document.getElementById('dq-stage'); if (!st || !from) return;
  const el = document.createElement('div'); el.className = 'dq-float ' + (cls || ''); el.innerHTML = html; el.style.left = from.x + 'px'; el.style.top = from.y + 'px'; st.appendChild(el);
  const dx = to ? to.x - from.x : 0, dy = to ? to.y - from.y : -50; ms = ms || 1300;
  if (el.animate) el.animate([{ transform: 'translate(-50%,-50%) scale(0.5)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 1, offset: 0.15 }, { transform: 'translate(-50%,-50%) scale(1.1)', opacity: 1, offset: 0.55 },
    { transform: `translate(calc(-50% + ${dx.toFixed(0)}px), calc(-50% + ${dy.toFixed(0)}px)) scale(0.7)`, opacity: 0 }], { duration: ms, easing: 'cubic-bezier(0.3,0,0.2,1)', fill: 'forwards' });
  setTimeout(() => el.remove(), ms + 60);
}
/* odkiaľ útočník letí: jeho priestor susediaci s cieľom (inak jeho najbližší) */
function dqOrigin(S, a, t) {
  const M = DQ_MAP, T = M.t[t]; let best = null, bd = 1e12;
  S.own.forEach((o, i) => { if (o !== a || i === t) return; const d = Math.hypot(M.t[i].x - T.x, M.t[i].y - T.y) - (T.j.indexOf(i) >= 0 ? 1e5 : 0); if (d < bd) { bd = d; best = M.t[i]; } });
  return best ? { x: best.x, y: best.y, r: best.r || 6 } : { x: T.x - 70, y: T.y - 45, r: 6 };
}
/* lietadlo letí po oblúku z A do B a kreslí za sebou trať; back = z cieľa sa odrazí a vráti sa */
function dqFly(A, B, col, ms, back) {
  const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, bend = Math.min(46, L * 0.3);
  const cx = (A.x + B.x) / 2 - dy / L * bend, cy = (A.y + B.y) / 2 + dx / L * bend - bend * 0.35;
  const d = `M${A.x.toFixed(1)},${A.y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${B.x.toFixed(1)},${B.y.toFixed(1)}`;
  const g = dqFxAdd(`<path class="dq-track" d="${d}" pathLength="1" style="--pc:${col};animation-duration:${ms}ms"/><g class="dq-plane" style="--pc:${col}"><g transform="scale(1.35)"><path d="M1,0 L-5,-12 L-8,-12 L-4.5,0 L-8,12 L-5,12 Z"/><path d="M11,0 L-7,-3.2 L-9,-7 L-11,-7 L-9.5,0 L-11,7 L-9,7 L-7,3.2 Z"/></g></g>`, ms * (back ? 1.8 : 1) + 600);
  if (!g) return;
  const path = g.querySelector('.dq-track'), pl = g.querySelector('.dq-plane'), len = path.getTotalLength(), t0 = performance.now();
  let ang = Math.atan2(cy - A.y, cx - A.x) * 180 / Math.PI;
  const step = now => {
    if (!pl.isConnected) return;
    let k = (now - t0) / ms, rev = false;
    if (k > 1) { if (!back) { pl.style.opacity = 0; path.style.opacity = 0; return; } k = 1 - (k - 1) / 0.8; rev = true; if (k < 0) { pl.style.opacity = 0; path.style.opacity = 0; return; } }
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, p = path.getPointAtLength(len * e), q = path.getPointAtLength(len * Math.min(1, Math.max(0, e + (rev ? -0.02 : 0.02))));
    if (Math.hypot(q.x - p.x, q.y - p.y) > 0.05) ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
    pl.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
/* radarový lúč: raz obehne mapu a priestory, ktoré sa dajú vybrať, sa rozsvietia ako odozvy */
function dqSweep(S) {
  const B = dqBaseView(), cx = B.x + B.w / 2, cy = B.y + B.h / 2, R = Math.hypot(B.w, B.h) / 2 + 10, ms = 1500, a = 55 * Math.PI / 180;
  let h = `<g class="dq-sweep" style="transform-origin:${cx}px ${cy}px;animation-duration:${ms}ms"><path d="M${cx},${cy} L${cx + R},${cy} A${R},${R} 0 0 0 ${(cx + R * Math.cos(-a)).toFixed(1)},${(cy + R * Math.sin(-a)).toFixed(1)} Z"/><line x1="${cx}" y1="${cy}" x2="${cx + R}" y2="${cy}"/></g>`;
  S.allowed.forEach(t => { const o = DQ_MAP.t[t]; let an = Math.atan2(o.y - cy, o.x - cx); if (an < 0) an += 2 * Math.PI; h += `<circle class="dq-blip" cx="${o.x}" cy="${o.y}" r="${Math.max(7, (o.r || 6) * 0.8).toFixed(1)}" style="animation-delay:${Math.round(an / (2 * Math.PI) * ms)}ms"/>`; });
  dqFxAdd(h, ms + 1300);
}
/* kamera: plynulý presun výrezu mapy; ručné priblíženie hráča má vždy prednosť */
function dqCamStop() { DQ.camAuto = false; cancelAnimationFrame(DQ.camR); }
function dqCamTo(to, ms) {
  cancelAnimationFrame(DQ.camR);
  const B = dqBaseView(), a = DQ.view || B, b = to || B, t0 = performance.now();
  DQ.camAuto = true;
  const step = now => {
    const k = Math.min(1, (now - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    DQ.view = k >= 1 && !to ? null : { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, w: a.w + (b.w - a.w) * e, h: a.h + (b.h - a.h) * e };
    if (k >= 1 && !to) DQ.camAuto = false;
    dqViewApply();
    if (k < 1) DQ.camR = requestAnimationFrame(step);
  };
  DQ.camR = requestAnimationFrame(step);
}
function dqCamBox(pts) {
  const B = dqBaseView(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  pts.forEach(p => { const r = p.r || 6; x0 = Math.min(x0, p.x - r); y0 = Math.min(y0, p.y - r); x1 = Math.max(x1, p.x + r); y1 = Math.max(y1, p.y + r); });
  const w = Math.min(B.w, Math.max((x1 - x0) * 1.7, (y1 - y0) * 1.7 * B.w / B.h, B.w / 1.9)), h = w * B.h / B.w;
  if (w >= B.w - 1) return null;
  return { w, h, x: Math.max(B.x, Math.min(B.x + B.w - w, (x0 + x1) / 2 - w / 2)), y: Math.max(B.y, Math.min(B.y + B.h - h, (y0 + y1) / 2 - h / 2)) };
}
/* napätie pri vyhodnotení: najprv je vidno, kto čo zvolil, správna odpoveď sa ukáže až o chvíľu */
function dqSus(S) { return !!(S && S.rev && S.q && !dqLow() && DQ.susK === S.gid + S.k && Date.now() - DQ.susT0 < DQ.susMs); }
/* výsledok súboja na mape — odohrá sa, keď sa zavrie okno s vyhodnotením */
function dqResultFx(S, P) {
  if (dqLow()) return;
  const M = DQ_MAP, T = M.t[P.t], wrap = document.querySelector('.dq-mapwrap'), col = dqC(P.a), R = (T.r || 6);
  if (P.what === 'held') {
    dqFly(T, P.from, col, 900);
    dqFxAdd(`<g transform="translate(${T.x},${T.y})"><g class="dq-shield" style="--pc:${dqC(P.d)}"><circle r="${Math.max(14, R + 6).toFixed(1)}"/><text y="6">🛡</text></g></g>`, 1700);
    dqFloat('+100', dqScr(T.x, T.y), dqChipPos(P.d), 'pts', 1400);
  } else if (P.what === 'miss') {
    dqFxAdd(`<g transform="translate(${T.x},${T.y})"><text class="dq-puff" y="8">✗</text></g>`, 1200);
    if (P.d >= 0) dqFly(T, P.from, col, 900);
  } else if (P.what === 'hit' || P.what === 'out') {
    if (wrap) { wrap.classList.remove('dq-shake'); void wrap.offsetWidth; wrap.classList.add('dq-shake'); setTimeout(() => wrap.classList.remove('dq-shake'), 700); }
    dqFxAdd(`<circle class="dq-boom" cx="${T.x}" cy="${T.y}" r="${(R + 8).toFixed(1)}"/><circle class="dq-boom b2" cx="${T.x}" cy="${T.y}" r="${(R + 16).toFixed(1)}"/>`, 1600);
    const c = dqChipPos(P.d); if (c) dqFloat('💔', { x: c.x, y: c.y + 30 }, { x: c.x, y: c.y + 80 }, 'big', 1600);
    if (P.x2) dqFloat(dqMulTxt(P.x2) + ' · +' + Math.round(T.v * (P.x2 - 1)), dqScr(T.x, T.y), dqChipPos(P.a), 'pts', 1500);
  } else if (P.what === 'took' && P.x2) setTimeout(() => dqFloat(dqMulTxt(P.x2) + ' · +' + Math.round(T.v * (P.x2 - 1)), dqScr(T.x, T.y), dqChipPos(P.a), 'pts', 1400), 350);
  setTimeout(() => { if (DQ.camAuto && DQ.view && DQ.S && !dqDuelOn(DQ.S)) dqCamTo(null, 700); }, 1100);
}
/* séria správnych odpovedí (len otázky s možnosťami): každá tretia v rade dáva +50 bodov; zároveň sa vedú štatistiky na koniec hry */
/* bonus s poznačeným zdrojom (def = obrana, fire = séria, x2 = žolík) — na záverečný rozpis bodov */
function dqBon(pi, k, v) { const p = DQ.S.players[pi]; p.bonus += v; p.bd = p.bd || {}; p.bd[k] = (p.bd[k] || 0) + v; }
function dqTally(res) {
  const S = DQ.S, fire = [];
  Object.keys(res).map(Number).forEach(pi => {
    const p = S.players[pi], r = res[pi], T = S.stat && S.stat[pi];
    p.st = r.ok ? (p.st || 0) + 1 : 0;
    if (T) { T.n++; if (r.ok) { T.c++; if (!T.fast || r.ms < T.fast) T.fast = r.ms; } if (p.st > T.mx) T.mx = p.st; }
    if (r.ok && p.st % 3 === 0) { dqBon(pi, 'fire', 50); fire.push(pi); }
  });
  return fire;
}
const DQ_LASTK = 'atcoTrainerV2.dqLast', DQ_REPK = 'atcoTrainerV2.dqRep';
/* Nahlásená otázka sa uloží v prehliadači a pošle do databázy; keď sa to nepodarí, skúsi sa to pri ďalšom hlásení znova. */
function dqRepText(x) { return x.img ? '[fotka] ' + x.img : x.q; }
function dqReportQ(it) {
  const Q = lsGet(DQ_REPK, []);
  if (Q.some(r => r.q === it.q)) return;
  Q.push({ set: it.key || it.mod || '', q: String(it.q).slice(0, 400), a: String(it.a == null ? '' : it.a).slice(0, 300), nick: dqNick() });
  lsSet(DQ_REPK, Q.slice(-300));
  dqRepFlush();
}
async function dqRepFlush() {
  const Q = lsGet(DQ_REPK, []);
  for (const r of Q) {
    if (r.sent) continue;
    try { await rkRpc('atco_qreport', { p_token: RK.acct ? RK.acct.token : null, p_nick: r.nick || '', p_set: r.set, p_question: r.q, p_answer: r.a }); r.sent = 1; } catch (e) { break; }
  }
  lsSet(DQ_REPK, Q);
}
/* moje vyhodnotené odpovede v tejto partii — na prehľad chýb po hre */
function dqLogAns(S, r) {
  if (DQ.logG !== S.gid) { DQ.logG = S.gid; DQ.log = []; }
  const q = S.q, R = S.rev;
  DQ.log.push({ mod: q.mod, key: q.key, q: q.prompt, sub: q.sub && q.sub !== 'Vyber správnu odpoveď.' && !q.num ? q.sub : '', img: q.img, num: q.num, unit: q.unit, opts: q.opts.slice(), ans: R.ans, mine: q.num ? r.v : r.c, ok: q.num ? r.err === 0 : !!r.ok });
}
function dqWrong(S) { return S && DQ.logG === S.gid ? DQ.log.filter(x => !x.ok) : []; }
function dqErrsHTML(S) {
  const W = dqWrong(S), sent = lsGet(DQ_REPK, []);
  return `<div class="dq-pop errs"><div class="dq-pop-top"><span>DOBYVATEĽ</span><span class="dq-pop-stage">MOJE CHYBY · ${W.length}</span><span></span></div>
      <div class="dq-errlist">${W.map((x, i) => {
        const right = x.num ? dqNumFmt(x.ans, x.unit) : x.opts[x.ans], mine = x.num ? (x.mine === null ? 'bez odpovede' : dqNumFmt(x.mine, x.unit)) : (x.mine >= 0 ? x.opts[x.mine] : 'bez odpovede');
        const done = sent.some(r => r.q === dqRepText(x));
        return `<div class="dq-err"><small>${dqEsc(x.mod)}</small><b>${x.img ? '📷 ' + dqEsc(x.sub || 'Fotka lietadla — aký je to typ?') : dqEsc(x.q)}${x.sub && !x.img ? `<u>${dqEsc(x.sub)}</u>` : ''}</b><span class="ok">✓ ${dqEsc(right)}</span><span class="no">✗ ${dqEsc(mine)}</span><button class="dq-rep" data-rep="${i}" ${done ? 'disabled' : ''}>${done ? '✓ NAHLÁSENÉ' : '⚑ NAHLÁSIŤ OTÁZKU'}</button></div>`;
      }).join('')}</div>
      <div class="dq-endacts">${W.some(x => !x.num) ? '<button class="dq-btn pri" id="dq-drill">PRECVIČIŤ ZNOVA ▶</button>' : ''}<button class="dq-btn" id="dq-errback">SPÄŤ NA VÝSLEDKY</button></div></div>`;
}
/* precvičenie chýb: otázka, ktorú znova pokazím, sa vráti na koniec radu */
function dqDrillSet() { const d = DQ.drill, x = d.list[0]; d.pick = null; if (x) { const right = x.opts[x.ans]; d.opts = shuffle(x.opts.slice()); d.ans = d.opts.indexOf(right); } }
function dqDrillStart() { const W = dqWrong(DQ.S).filter(x => !x.num); if (!W.length) return; DQ.drill = { list: shuffle(W.slice()), n: W.length, pick: null }; dqDrillSet(); DQ.endV = 'drill'; DQ.ui++; dqShow(); }
function dqDrillPick(i) { const d = DQ.drill; if (!d || d.pick !== null || !d.list.length) return; d.pick = i; DQ.ui++; dqShow(); }
function dqDrillNext() { const d = DQ.drill; if (!d || d.pick === null) return; const x = d.list.shift(); if (d.pick !== d.ans) d.list.push(x); dqDrillSet(); DQ.ui++; dqShow(); }
function dqDrillHTML() {
  const d = DQ.drill, x = d.list[0], top = `<div class="dq-pop-top"><span>${x ? dqEsc(x.mod) : 'DOBYVATEĽ'}</span><span class="dq-pop-stage">PRECVIČENIE CHÝB</span><span>${x ? 'ostáva ' + d.list.length : ''}</span></div>`;
  if (!x) return `<div class="dq-pop errs">${top}<div class="dq-pop-q">✓ HOTOVO</div><div class="dq-pop-s">Všetkých ${d.n} otázok si teraz zodpovedal správne.</div><div class="dq-endacts"><button class="dq-btn pri" id="dq-errback">SPÄŤ NA VÝSLEDKY</button></div></div>`;
  return `<div class="dq-pop errs">${top}
      ${x.img ? `<div class="dq-pop-img" data-img="${dqEsc(x.img)}">${DQ.imgU && DQ.imgU[x.img] ? `<img src="${dqEsc(DQ.imgU[x.img])}" alt="">` : '<span>načítavam fotku…</span>'}</div>` : `<div class="dq-pop-q${x.q.length > 60 ? ' xl' : x.q.length > 26 ? ' long' : ''}">${dqEsc(x.q)}</div>`}
      ${x.sub ? `<div class="dq-pop-s">${dqEsc(x.sub)}</div>` : ''}
      <div class="dq-dropts">${d.opts.map((o, i) => `<button class="choice-btn${d.pick === null ? '' : i === d.ans ? ' ok' : i === d.pick ? ' no' : ''}" data-dr="${i}" ${d.pick === null ? '' : 'disabled'}><kbd>${i + 1}</kbd><span>${dqEsc(o)}</span></button>`).join('')}</div>
      <div class="dq-endacts">${d.pick === null ? '' : `<button class="dq-btn pri" id="dq-drnext">${d.pick === d.ans ? 'ĎALŠIA ▶' : 'ĎALŠIA ▶ (táto príde ešte raz)'}</button>`}<button class="dq-btn" id="dq-errback">KONIEC</button></div></div>`;
}
function dqRejoin() {
  const L = lsGet(DQ_LASTK, null);
  if (!L) return;
  DQ.id = L.id; try { sessionStorage.setItem('atcoDqId', L.id); } catch (e) {}
  if (!RK.acct && L.nick) DQ.guest = L.nick;
  dqJoin(L.room);
}
const DQC_KEY = 'atcoTrainerV2.dqCustom';
let DQ_CUSTOM = lsGet(DQC_KEY, []);          // [{ name, qs: [{ q, a, w: [..] }] }]
const DQC = { msg: '', err: false };
function dqcAll() { return DQ_CUSTOM.reduce((a, s) => a.concat(s.qs.map(q => Object.assign({ set: s.name }, q))), []); }
function dqcClean(x) { return String(x == null ? '' : x).replace(/\s+/g, ' ').trim().slice(0, 220); }
function dqcFromRows(rows) {
  const out = [];
  rows.forEach(r => {
    const c = r.map(dqcClean);
    while (c.length && !c[c.length - 1]) c.pop();
    if (c.length < 3 || !c[0] || !c[1]) return;
    if (/^(ot[aá]zka|question|#|č\.?)$/i.test(c[0]) || /spr[aá]vn|correct/i.test(c[1])) return;      // hlavička
    const w = c.slice(2).filter((x, i, a) => x && x !== c[1] && a.indexOf(x) === i);
    if (w.length) out.push({ q: c[0], a: c[1], w });
  });
  return out;
}
function dqcFromText(lines) {
  const rows = [], out = []; let block = [];
  const flush = () => {
    if (block.length >= 3) {
      const q = dqcClean(block[0]); let a = null; const w = [];
      block.slice(1).forEach(l => {
        const star = /^\s*[*+✓]/.test(l) || /[*✓]\s*$/.test(l);
        const t = dqcClean(l.replace(/^\s*[*+✓]\s*/, '').replace(/\s*[*✓]\s*$/, '').replace(/^\s*(?:[-–•]|\(?[a-dA-D1-6][).:])\s+/, ''));
        if (!t) return;
        if (star && a === null) a = t; else w.push(t);
      });
      if (a === null) a = w.shift();
      const ww = w.filter((x, i, arr) => x !== a && arr.indexOf(x) === i);
      if (q && a && ww.length) out.push({ q, a, w: ww });
    }
    block = [];
  };
  lines.forEach(raw => {
    const l = String(raw).replace(/\r/g, '');
    if (/^\s*#/.test(l)) return;
    if (!l.trim()) return flush();
    /* riadok s oddeľovačmi je celá otázka len vtedy, keď ním blok začína — v odpovediach bloku môžu byť bodkočiarky */
    const sep = block.length ? null : ['\t', ';', '|'].find(s => l.split(s).length >= 3);
    if (sep) rows.push(l.split(sep)); else block.push(l);
  });
  flush();
  return dqcFromRows(rows).concat(out);
}
function dqcCsv(text) {
  const first = text.split('\n')[0] || '', sep = [';', '\t', ','].find(s => first.split(s).length >= 3) || ';', rows = [];
  let row = [], cur = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += ch; }
    else if (ch === '"') inQ = true;
    else if (ch === sep) { row.push(cur); cur = ''; }
    else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (ch !== '\r') cur += ch;
  }
  row.push(cur); rows.push(row);
  return rows;
}
/* .xlsx a .docx sú ZIP archívy s XML vnútri — rozbalia sa priamo v prehliadači */
async function dqcZip(buf, want) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf), td = new TextDecoder(), out = {};
  let e = buf.byteLength - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('ZIP');
  let p = dv.getUint32(e + 16, true);
  for (let n = dv.getUint16(e + 10, true); n > 0 && dv.getUint32(p, true) === 0x02014b50; n--) {
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lho = dv.getUint32(p + 42, true);
    const name = td.decode(u8.subarray(p + 46, p + 46 + nl));
    p += 46 + nl + xl + cl;
    if (!want(name)) continue;
    const st = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true), data = u8.subarray(st, st + csize);
    out[name] = td.decode(method === 0 ? data : await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  }
  return out;
}
async function dqcXlsx(buf) {
  const z = await dqcZip(buf, n => n === 'xl/sharedStrings.xml' || /^xl\/worksheets\/sheet\d+\.xml$/.test(n)), X = s => new DOMParser().parseFromString(s, 'application/xml');
  const shared = z['xl/sharedStrings.xml'] ? [...X(z['xl/sharedStrings.xml']).getElementsByTagName('si')].map(si => [...si.getElementsByTagName('t')].filter(t => t.parentNode.nodeName !== 'rPh').map(t => t.textContent).join('')) : [];
  const rows = [];
  Object.keys(z).filter(n => n !== 'xl/sharedStrings.xml').sort().forEach(n => {
    [...X(z[n]).getElementsByTagName('row')].forEach(r => {
      const row = [];
      [...r.getElementsByTagName('c')].forEach(c => {
        const ref = (c.getAttribute('r') || '').replace(/\d+/g, ''); let col = 0;
        for (let i = 0; i < ref.length; i++) col = col * 26 + ref.charCodeAt(i) - 64;
        const v = c.getElementsByTagName('v')[0], t = c.getAttribute('t');
        row[Math.max(0, col - 1)] = t === 's' ? shared[+(v ? v.textContent : -1)] || '' : t === 'inlineStr' ? [...c.getElementsByTagName('t')].map(x => x.textContent).join('') : (v ? v.textContent : '');
      });
      rows.push(Array.from(row, x => x == null ? '' : x));
    });
  });
  return dqcFromRows(rows);
}
async function dqcDocx(buf) {
  const z = await dqcZip(buf, n => n === 'word/document.xml');
  if (!z['word/document.xml']) throw new Error('DOCX');
  const doc = new DOMParser().parseFromString(z['word/document.xml'], 'application/xml'), body = doc.getElementsByTagName('w:body')[0], rows = [], lines = [];
  const ptext = p => { let s = ''; (function walk(n) { [...n.childNodes].forEach(c => { if (c.nodeName === 'w:t') s += c.textContent; else if (c.nodeName === 'w:tab') s += '\t'; else if (c.nodeName === 'w:br' || c.nodeName === 'w:cr') s += '\n'; else walk(c); }); })(p); return s; };
  [...(body ? body.childNodes : [])].forEach(n => {
    if (n.nodeName === 'w:p') ptext(n).split('\n').forEach(l => lines.push(l));
    else if (n.nodeName === 'w:tbl') { lines.push(''); [...n.getElementsByTagName('w:tr')].forEach(tr => rows.push([...tr.getElementsByTagName('w:tc')].map(tc => [...tc.getElementsByTagName('w:p')].map(ptext).join(' ')))); }
  });
  return dqcFromRows(rows).concat(dqcFromText(lines));
}
async function dqcLoadFiles(files) {
  let added = 0; const bad = [];
  for (const f of files) {
    try {
      const ext = (f.name.split('.').pop() || '').toLowerCase(), buf = await f.arrayBuffer();
      let qs;
      if (ext === 'xlsx') qs = await dqcXlsx(buf);
      else if (ext === 'docx') qs = await dqcDocx(buf);
      else if (ext === 'xls' || ext === 'doc') { bad.push(f.name + ' (starý formát — ulož ako .' + ext + 'x)'); continue; }
      else {
        let text = new TextDecoder('utf-8').decode(buf);
        if (text.indexOf('�') >= 0) text = new TextDecoder('windows-1250').decode(buf);     // Excel na Windowse ukladá CSV v tomto kódovaní
        text = text.replace(/^﻿/, '');
        qs = ext === 'csv' ? dqcFromRows(dqcCsv(text)) : dqcFromText(text.split('\n'));
      }
      qs = qs.slice(0, 2000);
      if (!qs.length) { bad.push(f.name + ' (nenašla sa žiadna otázka)'); continue; }
      DQ_CUSTOM = DQ_CUSTOM.filter(s => s.name !== f.name).concat([{ name: f.name, qs }]);
      added += qs.length;
    } catch (e) { bad.push(f.name + ' (nedá sa prečítať)'); }
  }
  lsSet(DQC_KEY, DQ_CUSTOM);
  DQC.msg = (added ? 'Načítaných ' + added + ' otázok. ' : '') + (bad.length ? 'Nepodarilo sa: ' + bad.join(', ') + '. Pozri vzor súboru.' : '');
  DQC.err = !added;
  dqcSync(added > 0);
}
/* po zmene vlastných otázok upraviť nastavenie miestnosti a poslať ho hráčom */
function dqcSync(turnOn) {
  const S = DQ.S;
  if (!S || !DQ.host || S.phase !== 'lobby') return dqShow();
  const n = dqcAll().length, i = S.cfg.mods.indexOf('cu');
  S.cfg.cuN = n;
  if (!n && i >= 0) { S.cfg.mods.splice(i, 1); if (!S.cfg.mods.length) S.cfg.mods = DQ_QS.map(x => x[0]); }
  if (n && turnOn && i < 0) S.cfg.mods.push('cu');
  dqCast(); dqShow();
}
function dqcSample() {
  const t = ['# VZOR — vlastné otázky pre Dobyvateľa', '# Riadky začínajúce mriežkou sa preskakujú.', '#',
    '# 1. spôsob: jeden riadok = jedna otázka, časti oddelené bodkočiarkou:', '#    Otázka; správna odpoveď; zlá odpoveď; zlá odpoveď; zlá odpoveď',
    'Ktoré letisko má ICAO kód LZKZ?; Košice; Bratislava; Poprad; Piešťany', 'Aký ICAO kód má letisko Sliač?; LZSL; LZZI; LZTT; LZPP', '',
    '# 2. spôsob: otázka na prvom riadku, odpovede pod ňou, správna označená hviezdičkou.', '#    Medzi otázkami je prázdny riadok.',
    'Ktorý prefix majú ICAO kódy slovenských letísk?', '* LZ', 'LK', 'LO', 'LH', '',
    '# V Exceli a vo Worde stačí tabuľka s rovnakými stĺpcami:', '#    Otázka | Správna | Zlá 1 | Zlá 2 | Zlá 3', ''].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + t], { type: 'text/plain;charset=utf-8' })); a.download = 'vlastne-otazky-vzor.txt';
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function dqcRowHTML(S) {
  const on = S.cfg.mods.indexOf('cu') >= 0, n = DQ.host ? dqcAll().length : (S.cfg.cuN || 0);
  if (!DQ.host) return n ? `<div class="dq-cfg-row"><span>VLASTNÉ OTÁZKY</span><div><button class="rk-chip${on ? ' on' : ''}" disabled>VLASTNÉ · ${n} otázok</button></div></div>` : '';
  return `<div class="dq-cfg-row dqc"><span>VLASTNÉ OTÁZKY</span><div>
      ${n ? `<button class="rk-chip${on ? ' on' : ''}" data-cfg="mods" data-val="cu">VLASTNÉ · ${n} otázok</button>` : ''}
      <label class="rk-chip dqc-up">+ NAHRAŤ SÚBOR<input type="file" id="dqc-file" accept=".txt,.csv,.xlsx,.docx" multiple hidden></label>
      <button class="rk-chip" id="dqc-sample">↓ VZOR SÚBORU</button>
      ${DQ_CUSTOM.map((s, i) => `<span class="dqc-set">${dqEsc(s.name)} <b>${s.qs.length}</b><button data-dqc-del="${i}" title="Odstrániť">✕</button></span>`).join('')}
      <small class="dqc-hint">Textový súbor (.txt), Excel (.xlsx), Word (.docx) alebo .csv. V tabuľke stĺpce <b>Otázka | Správna | Zlá | Zlá | Zlá</b>, v texte to isté oddelené bodkočiarkou. Otázky ostanú uložené v tomto prehliadači.</small>
      ${DQC.msg ? `<small class="dqc-msg${DQC.err ? ' err' : ''}">${dqEsc(DQC.msg)}</small>` : ''}
    </div></div>`;
}
/* ---------- tipovacie (číselné) otázky: odpoveď sa píše, vyhráva najbližší tip ----------
   Použitie: úvodná otázka o poradie výberu domovského letiska a rozstrel, keď v súboji odpovedia obaja správne.
   Údaje sú z okruhov ATM a Navigácia (rovnaký zdroj ako DQ_BANK). */
const DQ_NUM = [
  ['atm', 'Aký SSR kód označuje všeobecnú núdzu?', 7700, ''], ['atm', 'Aký SSR kód sa používa pri strate spojenia?', 7600, ''], ['atm', 'Aký SSR kód označuje protiprávne zasahovanie?', 7500, ''],
  ['atm', 'Aká je štandardná tiesňová frekvencia VHF?', 121.5, 'MHz'], ['atm', 'Aký je štandardný tlak (v celých hPa)?', 1013, 'hPa'],
  ['atm', 'Aký je vertikálny rozstup v priestore RVSM do FL 410 vrátane?', 1000, 'ft'], ['atm', 'Aký je vertikálny rozstup nad FL 410?', 2000, 'ft'],
  ['atm', 'Aký je všeobecný radarový rozstup?', 5, 'NM'], ['atm', 'Aký radarový rozstup možno použiť na konečnom priblížení pri splnení všetkých podmienok?', 2.5, 'NM'],
  ['atm', 'Aká je tolerancia pri overovaní tlakovej nadmorskej výšky mimo RVSM (±)?', 300, 'ft'], ['atm', 'Aká je tolerancia pri overovaní tlakovej nadmorskej výšky v RVSM (±)?', 200, 'ft'],
  ['atm', 'Koľko kilometrov je 1 NM?', 1.852, 'km'], ['atm', 'Aká je maximálna rýchlosť pod 10 000 ft v triedach D, E, F a G?', 250, 'kt IAS'],
  ['atm', 'O koľko najmenej musí byť TL nad TA?', 1000, 'ft'], ['atm', 'Aký je základný časový rozstup pre HEAVY za SUPER pri prílete?', 2, 'min'], ['atm', 'Aký je základný časový rozstup pre LIGHT za SUPER pri prílete?', 4, 'min'],
  ['atm', 'Aký je všeobecný pozdĺžny časový rozstup na rovnakej trati a hladine?', 15, 'min'], ['atm', 'Aké časové minimum platí, ak je predné lietadlo na rovnakej trati a hladine o 40 kt rýchlejšie?', 3, 'min'],
  ['atm', 'Aké vzdialenostné minimum (DME/GNSS) platí, ak predné lietadlo letí o 20 kt rýchlejšie?', 10, 'NM'],
  ['atm', 'Koľko sekúnd pred CPA sa približne vydáva TA?', 48, 's'], ['atm', 'Koľko sekúnd pred CPA sa približne vydáva RA?', 35, 's'],
  ['atm', 'Koľko minút pred EOBT sa najneskôr bežne podáva FPL?', 60, 'min'], ['atm', 'Koľko hodín pred EOBT sa najneskôr podáva FPL pre let podliehajúci ATFM?', 3, 'h'],
  ['atm', 'Pri akej zmene času preletu bodu sa odchýlka hlási ATS? (viac ako … minúty)', 2, 'min'],
  ['atm', 'Ktorý ICAO Doc obsahuje indikátory miesta?', 7910, ''], ['atm', 'Ktorý ICAO Doc obsahuje designátory typov lietadiel?', 8643, ''], ['atm', 'Ktorý ICAO Doc obsahuje skratky a kódy?', 8400, ''],
  ['atm', 'QNH je 980 hPa a TA je 10 000 ft. Aká je prevodná hladina? (FL)', 120, ''], ['atm', 'QNH je 1030 hPa a TA je 10 000 ft. Aká je prevodná hladina? (FL)', 110, ''],
  ['atm', 'Od akej vzdialenosti od prahu dráhy sa na konečnom priblížení už nemá uplatňovať úprava rýchlosti?', 4, 'NM'], ['atm', 'Po koľkých minútach bez očakávanej správy od lietadla sa vyhlasuje INCERFA?', 30, 'min'], ['atm', 'Koľkým stopám približne zodpovedá 1 hPa?', 27, 'ft'], ['atm', 'Koľkým metrom približne zodpovedá 1 hPa?', 8, 'm'], ['atm', 'Aká je prevodná nadmorská výška (TA) na Slovensku?', 10000, 'ft'], ['atm', 'Aké je vzdialenostné minimum pre LIGHT za SUPER?', 8, 'NM'], ['atm', 'Aké je vzdialenostné minimum pre LIGHT za HEAVY?', 6, 'NM'], ['atm', 'Aké je vzdialenostné minimum pre HEAVY za HEAVY?', 4, 'NM'], ['atm', 'Od akej maximálnej vzletovej hmotnosti patrí lietadlo do kategórie HEAVY? (v tonách)', 136, 't'], ['atm', 'Do akej maximálnej vzletovej hmotnosti patrí lietadlo do kategórie LIGHT? (v tonách)', 7, 't'], ['atm', 'Koľko sekúnd by malo najviac trvať jedno vysielanie ATIS?', 30, 's'], ['atm', 'Koľko hodín pred EOBT možno letový plán podať najskôr?', 120, 'h'], ['atm', 'Aká je minimálna letová dohľadnosť pre VMC vo FL 100 a vyššie?', 8, 'km'], ['atm', 'Aká je minimálna dohľadnosť pre zvláštny let VFR lietadla?', 1500, 'm'], ['atm', 'Aký kód odpovedača nastaví let VFR, ktorému ATS nepridelilo iný kód?', 7000, ''], ['atm', 'Aké je základné pozdĺžne vzdialenostné minimum pri použití DME alebo GNSS?', 20, 'NM'], ['atm', 'Aký je strop pre lety VFR? (FL)', 195, ''],
  ['met', 'Aká je teplota na hladine mora podľa ISA?', 15, '°C'], ['met', 'V akej výške je tropopauza podľa ISA?', 11, 'km'], ['met', 'O koľko °C klesá teplota na 1 000 ft podľa ISA?', 2, '°C'],
  ['met', 'Koľko percent vzduchu tvorí kyslík?', 21, '%'], ['met', 'Koľko percent vzduchu tvorí dusík?', 78, '%'], ['met', 'V akej výške je tlak približne polovičný oproti hladine mora?', 5500, 'm'],
  ['met', 'Od akej dohľadnosti platí CAVOK?', 10, 'km'], ['met', 'Pod akou dohľadnosťou hovoríme o hmle?', 1000, 'm'], ['met', 'O koľko uzlov musia nárazy prevýšiť priemerný vietor, aby boli v METAR-e?', 10, 'kt'],
  ['met', 'Na koľko hodín platí predpoveď TREND?', 2, 'h'], ['met', 'Aká je najdlhšia platnosť bežného SIGMET-u?', 4, 'h'], ['met', 'Aká je minimálna rýchlosť dýzového prúdenia podľa WMO?', 60, 'kt'],
  ['met', 'Do akej letovej hladiny platí predpoveď GAMET?', 100, 'FL'], ['met', 'V akej výške nad zemou sa meria prízemný vietor?', 10, 'm'], ['met', 'Pod akou dohľadnosťou alebo RVR sa do METAR-u zaraďuje RVR?', 1500, 'm'],
  ['met', 'V akej výške obiehajú geostacionárne družice?', 36000, 'km'], ['met', 'V akej výške je podľa ISA nulová izoterma?', 7500, 'ft'], ['met', 'Koľko osmín je najviac pri označení BKN?', 7, ''],
  ['eqps', 'Na akej frekvencii vysiela dotazovač SSR?', 1030, 'MHz'], ['eqps', 'Na akej frekvencii odpovedá palubný odpovedač?', 1090, 'MHz'], ['eqps', 'Koľko kódov módu A je k dispozícii?', 4096, ''],
  ['eqps', 'Koľko bitov má adresa lietadla Mode S?', 24, ''], ['eqps', 'V akých krokoch prenáša mód C výšku?', 100, 'ft'], ['eqps', 'S akým rozlíšením môže prenášať výšku Mode S?', 25, 'ft'],
  ['eqps', 'Aký kanálový odstup sa zaviedol v Európe na VHF?', 8.33, 'kHz'], ['eqps', 'Koľko znakov má adresa AFTN?', 8, ''], ['eqps', 'Koľko dní sa podľa ICAO najmenej archivujú telekomunikačné záznamy?', 30, 'dní'],
  ['eqps', 'Do koľkých sekúnd sa má nadviazať spojenie pri priamom prístupe (DA)?', 2, 's'], ['eqps', 'Do koľkých sekúnd sa má nadviazať spojenie pri nepriamom prístupe (IDA)?', 15, 's'], ['eqps', 'Akú vlnovú dĺžku má signál s frekvenciou 100 MHz?', 3, 'm'],
  ['eqps', 'Akej vzdialenosti cieľa zodpovedá 1 µs medzi vyslaním a príjmom radarového impulzu?', 150, 'm'], ['eqps', 'Na akej frekvencii pracuje UAT?', 978, 'MHz'], ['eqps', 'Koľko prijímačov treba najmenej na 3D polohu multilateráciou?', 4, ''],
  ['eqps', 'Aký je odstup impulzov P1 a P3 pri móde A?', 8, 'µs'], ['eqps', 'Aký je odstup impulzov P1 a P3 pri móde C?', 21, 'µs'], ['eqps', 'Koľko adresátov môže mať najviac jedna správa AFTN?', 21, ''],
  ['hum', 'Koľko obetí si vyžiadala zrážka na Tenerife v roku 1977?', 583, ''], ['hum', 'Koľko položiek približne udrží krátkodobá pamäť?', 7, ''], ['hum', 'Koľko percent informácie odovzdávame samotnými slovami?', 7, '%'],
  ['hum', 'Koľko percent pôsobenia v komunikácii sa pripisuje tónu hlasu?', 38, '%'], ['hum', 'Koľko percent pôsobenia v komunikácii sa pripisuje reči tela?', 55, '%'], ['hum', 'Po koľko centimetrov siaha intímna zóna?', 45, 'cm'],
  ['hum', 'Po koľko centimetrov siaha osobná zóna?', 120, 'cm'], ['hum', 'Pri akej teplote začína podľa učebných textov klesať výkonnosť?', 22, '°C'], ['hum', 'Nad akou teplotou klesá výkonnosť prudko?', 26, '°C'],
  ['hum', 'V akej najmenšej vzdialenosti má byť monitor od očí?', 40, 'cm'], ['hum', 'Aká má byť najmenšia intenzita osvetlenia pracoviska s monitorom?', 300, 'lx'], ['hum', 'Koľko minút trvá úplná adaptácia zraku na tmu?', 30, 'min'],
  ['hum', 'V ktorom roku navrhol E. Edwards model SHELL?', 1972, ''], ['hum', 'Koľko minút sa odporúča učiť sa v kuse najviac?', 90, 'min'], ['hum', 'Koľko percent nočného spánku tvorí približne REM spánok?', 20, '%'],
  ['acft', 'Do akej hmotnosti patrí lietadlo do kategórie LIGHT?', 7000, 'kg'], ['acft', 'Od akej hmotnosti patrí lietadlo do kategórie HEAVY?', 136000, 'kg'], ['acft', 'Aká je horná hranica VAT kategórie B?', 120, 'kt'],
  ['acft', 'Aká je horná hranica VAT kategórie C?', 140, 'kt'], ['acft', 'Aká je horná hranica VAT kategórie D?', 165, 'kt'], ['acft', 'Aký je násobok zaťaženia v ustálenej zatáčke s náklonom 60°?', 2, ''],
  ['acft', 'O koľko percent vzrastie pádová rýchlosť v zatáčke s náklonom 60°?', 41, '%'], ['acft', 'Akú najvyššiu výšku v kabíne udržiava pretlakovanie?', 8000, 'ft'], ['acft', 'Na akej frekvencii vysiela ELT pre družicový systém?', 406, 'MHz'],
  ['acft', 'Aké radarové minimum platí pre MEDIUM za HEAVY?', 5, 'NM'], ['acft', 'Aké radarové minimum platí pre LIGHT za HEAVY?', 6, 'NM'], ['acft', 'Aké radarové minimum platí pre LIGHT za A380?', 8, 'NM'],
  ['acft', 'Koľko kategórií má schéma RECAT-EU?', 6, ''], ['acft', 'Pri akej rýchlosti stúpania je dosiahnutý praktický dostup?', 100, 'ft/min'], ['acft', 'Koľko percent hlásenej zadnej zložky vetra sa zahŕňa do výpočtu vzletu?', 150, '%'],
  ['acft', 'Na koľko minút vyčkávania musí stačiť konečná záloha paliva prúdového lietadla?', 30, 'min'],
  ['pen', 'Do akej výšky siaha na Slovensku neriadený priestor triedy G?', 8000, 'ft'], ['pen', 'Koľko hasičských kategórií letísk pozná Annex 14?', 10, ''], ['pen', 'Do koľkých minút má hasičská služba zasiahnuť na ktorejkoľvek dráhe?', 3, 'min'],
  ['pen', 'Koľko svetiel má sústava PAPI?', 4, ''], ['pen', 'Na akú vertikálnu rýchlosť sa má najviac znížiť stúpanie pred dosiahnutím hladiny?', 1500, 'ft/min'], ['pen', 'Pod akou MTOW sú lety oslobodené od traťových odplát?', 2, 't'],
  ['pen', 'Koľko typov postupov NADP sa rozlišuje?', 2, ''], ['pen', 'Ktorý Annex ICAO sa zaoberá ochranou životného prostredia?', 16, ''], ['pen', 'Ktorý Annex ICAO upravuje letiská?', 14, ''], ['pen', 'Ktorý Annex ICAO upravuje pátranie a záchranu?', 12, ''],
  ['nav', 'Koľko segmentov má koncept GPS?', 3, ''], ['nav', 'Aká je minimálna požadovaná konfigurácia GPS (počet satelitov)?', 24, ''], ['nav', 'Koľko družíc najmenej prijíma GNSS prijímač na výpočet polohy?', 4, ''],
  ['nav', 'Aký je približný dosah VOR?', 200, 'NM'], ['nav', 'Aká je maximálna celková chyba systému VOR (±)?', 5, '°'], ['nav', 'Kde sa začína frekvenčné pásmo VOR?', 108, 'MHz'], ['nav', 'Kde sa končí frekvenčné pásmo VOR?', 117.975, 'MHz'],
  ['nav', 'Aký uhol má správna zostupová rovina ILS?', 3, '°'], ['nav', 'Pri akom uhle je prvý falošný glide slope lúč ILS?', 6, '°'],
  ['nav', 'Lietadlo má TAS 240 kt a GS 210 kt. Aká silná je zložka protivetra?', 30, 'kt'],
  /* v4.2 — ďalšie číselné otázky do rozstrelov */
   ['atm', 'Aká je minimálna letová dohľadnosť pre VMC pod FL 100 v riadenom priestore?', 5, 'km'], ['atm', 'Koľko stôp nad najvyššou prekážkou letí IFR najmenej mimo horského terénu?', 1000, 'ft'],
  ['atm', 'Koľko stôp nad najvyššou prekážkou letí IFR najmenej v horskom teréne?', 2000, 'ft'],  ['atm', 'Do akého uhla od roviny súmernosti predbiehaného lietadla ide o predbiehanie? (menej ako …)', 70, '°'],
   ['atm', 'Koľko minút pred vstupom do riadeného priestoru sa najneskôr podáva letový plán za letu?', 10, 'min'], 
  ['atm', 'Aké je radarové minimum pre LIGHT za MEDIUM?', 5, 'NM'], ['atm', 'Pod akou základňou oblačnosti už ATC nepovolí zvláštny let VFR?', 600, 'ft'], ['atm', 'O koľko stupňov sa musia najmenej rozbiehať radiály VOR pri priečnom rozstupe?', 15, '°'],
  ['atm', 'O koľko stupňov sa musia najmenej rozbiehať trate pri priečnom rozstupe pomocou NDB?', 30, '°'], ['atm', 'Koľko NM od zariadenia musí byť aspoň jedno lietadlo pri priečnom rozstupe pomocou VOR?', 15, 'NM'], ['atm', 'Aké minimum platí medzi dvoma odletmi, ak sa trate hneď po vzlete rozbiehajú najmenej o 45°?', 1, 'min'],
  ['atm', 'Do koľkých minút letu od vyčkávacieho priestoru musí mať iné lietadlo vertikálny rozstup?', 5, 'min'], ['atm', 'Ako blízko k hranici svojho priestoru smie riadiaci vektorovať pri 5 NM minime?', 2.5, 'NM'], ['atm', 'Koľko dní má cyklus AIRAC?', 28, 'dní'],
  ['atm', 'Koľko príloh (Annexov) má Chicagsky dohovor?', 19, ''], ['atm', 'V ktorom roku bol podpísaný Chicagsky dohovor?', 1944, ''], ['atm', 'Ktorý Annex ICAO obsahuje pravidlá lietania?', 2, ''],
  ['atm', 'Ktorý Annex ICAO upravuje letové prevádzkové služby?', 11, ''], ['atm', 'Ktorý Annex ICAO upravuje letecké telekomunikácie?', 10, ''], ['atm', 'Ktorý Annex ICAO upravuje leteckú informačnú službu?', 15, ''],
  ['atm', 'Ktorý Annex ICAO upravuje vyšetrovanie leteckých nehôd?', 13, ''], ['atm', 'Ktorý Annex ICAO upravuje ochranu pred protiprávnymi činmi (security)?', 17, ''], ['atm', 'Ktorý Annex ICAO upravuje spôsobilosť leteckého personálu?', 1, ''],
  ['atm', 'Koľko písmen má indikátor miesta ICAO?', 4, ''], ['met', 'Ktorý Annex ICAO upravuje meteorologickú službu?', 3, ''], ['met', 'Koľko osmín oblohy je najmenej pokrytých pri BKN?', 5, ''],
  ['met', 'Koľko osmín oblohy je pokrytých pri OVC?', 8, ''], ['met', 'Koľko osmín oblohy je najviac pokrytých pri SCT?', 4, ''], ['met', 'Koľko osmín oblohy je najviac pokrytých pri FEW?', 2, ''],
  ['met', 'Pod akou výškou nesmie byť pri CAVOK žiadna oblačnosť?', 5000, 'ft'], ['met', 'Ktorej výške približne zodpovedá tlaková hladina 500 hPa?', 18000, 'ft'], ['met', 'Ktorej výške približne zodpovedá tlaková hladina 850 hPa?', 5000, 'ft'],
  ['met', 'Ktorej výške približne zodpovedá tlaková hladina 700 hPa?', 10000, 'ft'], ['met', 'Ktorej výške približne zodpovedá tlaková hladina 300 hPa?', 30000, 'ft'], ['met', 'Za koľko minút sa priemeruje vietor v správe METAR?', 10, 'min'],
  ['met', 'Za koľko minút sa priemeruje vietor hlásený pre vzlet a pristátie?', 2, 'min'], ['met', 'O koľko °C klesá teplota na 100 m pri suchej adiabate?', 1, '°C'], ['met', 'Koľkým uzlom približne zodpovedá vietor 1 m/s?', 2, 'kt'],
  ['met', 'Teplota je 20 °C a rosný bod 12 °C. V akej výške je približne základňa kopovitej oblačnosti?', 3200, 'ft'], ['eqps', 'Kde sa končí letecké komunikačné pásmo VHF?', 137, 'MHz'], ['eqps', 'Koľko bitov má kód módu A?', 12, ''],
  ['eqps', 'Aká je najvyššia číslica, ktorá sa môže vyskytnúť v kóde odpovedača?', 7, ''], ['eqps', 'Akú vlnovú dĺžku má frekvencia 300 MHz?', 1, 'm'], ['eqps', 'Akú vlnovú dĺžku má frekvencia 3 GHz?', 10, 'cm'],
  ['eqps', 'Aká je približne rýchlosť šírenia rádiových vĺn?', 300000, 'km/s'], ['nav', 'Koľko NM je jeden stupeň zemepisnej šírky?', 60, 'NM'], ['nav', 'Koľko metrov je 1 NM?', 1852, 'm'],
  ['nav', 'Koľko stôp je približne 1 NM?', 6076, 'ft'], ['nav', 'Lietadlo letí GS 240 kt. Koľko NM preletí za 1 minútu?', 4, 'NM'], ['nav', 'Lietadlo letí GS 420 kt. Koľko NM preletí za 3 minúty?', 21, 'NM'],
  ['nav', 'Lietadlo letí GS 180 kt. Za koľko minút preletí 60 NM?', 20, 'min'], ['nav', 'O koľko stupňov sa Zem otočí za jednu hodinu?', 15, '°'], ['nav', 'Koľko stupňov za sekundu je štandardná zatáčka?', 3, '°/s'],
  ['nav', 'Koľko minút trvá zatáčka o 360° štandardnou rýchlosťou?', 2, 'min'], ['nav', 'Koľko minút trvá jeden okruh štandardného vyčkávania do 14 000 ft za bezvetria?', 4, 'min'], ['nav', 'Koľko družíc treba najmenej na funkciu RAIM (odhalenie chyby)?', 5, ''],
  ['nav', 'Koľko družíc treba najmenej na odhalenie a vylúčenie chybnej družice (FDE)?', 6, ''], ['nav', 'Pravidlo 1 v 60: o koľko NM je lietadlo mimo trate po 60 NM pri odchýlke 1°?', 1, 'NM'], ['nav', 'Koľko stôp na 1 NM približne klesá lietadlo na 3° zostupovej rovine?', 300, 'ft'],
  ['nav', 'Na akej frekvencii pracujú návestidlá (markery) ILS?', 75, 'MHz'], ['nav', 'Magnetický kurz je 180°, deklinácia 6° E. Aký je zemepisný kurz?', 186, '°'], ['nav', 'Lietadlo stúpa 1 500 ft/min z 3 000 ft na FL 120. Koľko minút to trvá?', 6, 'min'],
  ['hum', 'Koľko minút trvá približne jeden spánkový cyklus?', 90, 'min'], ['acft', 'Od akej rýchlosti VAT sa začína kategória E?', 166, 'kt'], ['acft', 'Koľko motorov má Boeing 747?', 4, ''],
  ['acft', 'Koľko motorov má ATR 72?', 2, ''], ['acft', 'Aký je násobok zaťaženia v ustálenej zatáčke s náklonom 45°?', 1.41, ''], ['acft', 'Na akej frekvencii VHF vysiela núdzový maják ELT?', 121.5, 'MHz'],
  ['acft', 'Koľko kilogramov je približne 1 libra (lb)?', 0.454, 'kg'], ['acft', 'Koľko stôp je približne 1 meter?', 3.28, 'ft'], ['acft', 'Koľko litrov je približne 1 americký galón?', 3.785, 'l'],
  ['pen', 'Koľko období núdze rozlišuje pohotovostná služba?', 3, ''], ['pen', 'Aký je bežný uhol zostupu, ktorý ukazuje PAPI?', 3, '°'], ['pen', 'Koľko písmen má kód letiska IATA?', 3, ''],
  ['pen', 'Koľko písmen má ICAO označenie prevádzkovateľa?', 3, ''],
];
/* Pamäť položených otázok: hostiteľ si pamätá posledných 1 500 otázok aj medzi hrami,
   takže sa otázka nezopakuje, kým je z čoho vyberať. Ukladá sa len krátky odtlačok textu. */
const DQ_SEENK = 'atcoTrainerV2.dqSeen';
function dqHash(t) { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function dqSeenLoad() { if (!DQ.seen) { DQ.seenL = lsGet(DQ_SEENK, []); if (!Array.isArray(DQ.seenL)) DQ.seenL = []; DQ.seen = {}; DQ.seenL.forEach(x => { DQ.seen[x] = 1; }); } }
function dqSeenHas(key) { dqSeenLoad(); return !!DQ.seen[dqHash(key)]; }
function dqSeenAdd(key) {
  dqSeenLoad(); const h = dqHash(key);
  if (DQ.seen[h]) return;
  DQ.seen[h] = 1; DQ.seenL.push(h);
  if (DQ.seenL.length > 1500) DQ.seenL.splice(0, DQ.seenL.length - 1500).forEach(x => { delete DQ.seen[x]; });
  lsSet(DQ_SEENK, DQ.seenL);
}
/* výber s váhami: arr = [[položka, váha], …] */
function dqWPick(arr) { let t = arr.reduce((a, x) => a + x[1], 0), r = Math.random() * t; for (const x of arr) { r -= x[1]; if (r <= 0) return x[0]; } return arr[arr.length - 1][0]; }
function dqGenNum(mods) {
  const pick = a => a[Math.floor(Math.random() * a.length)], M = mods || [], H = DQ.H;
  /* jednotka je vždy napísaná v otázke aj pri políčku — aby bolo jasné, či sa píšu kg, NM, minúty… */
  const fin = q => Object.assign(q, { num: true, prompt: q.prompt + (q.unit ? ' [' + q.unit + ']' : ''), sub: (q.unit ? 'Napíš číslo v jednotkách: ' + q.unit + '.' : 'Napíš číslo.') + ' Vyhráva najbližší tip.' });
  const kinds = [];
  const bank = DQ_NUM.filter(x => M.indexOf(x[0]) >= 0);
  if (bank.length) kinds.push([() => { const x = pick(bank); return { mod: dqSetName(x[0]), key: x[0], prompt: x[1], ans: x[2], unit: x[3] }; }, 84]);
  if (M.indexOf('co') >= 0) kinds.push([() => { const c = {}; CO_UNITS.forEach(u => { c[u.n] = (c[u.n] || 0) + 1; }); const u = pick(CO_UNITS.filter(x => x.f && !x.alt && c[x.n] === 1)); return { mod: 'MOD 06 · FREKVENCIE', prompt: u.n + ' — na akej frekvencii pracuje?', ans: +u.f.replace(',', '.'), unit: 'MHz' }; }, 7]);
  if (M.indexOf('hd') >= 0) kinds.push([() => { const h = 5 * (1 + Math.floor(Math.random() * 72)); return { mod: 'MOD 05 · KURZY', prompt: 'Aký je opačný kurz ku ' + dqPad(h) + '°?', ans: +dqPad(h + 180), unit: '°' }; }, 9]);
  /* okruhy bez vlastných číselných otázok (napr. len typy lietadiel) → berie sa z celej banky, nie len z frekvencií a kurzov */
  if (!bank.length) kinds.push([() => { const x = pick(DQ_NUM); return { mod: dqSetName(x[0]), key: x[0], prompt: x[1], ans: x[2], unit: x[3] }; }, 84]);
  for (let i = 0; i < 60; i++) {
    const q = dqWPick(kinds)(), key = '#' + q.prompt;
    /* prvých 40 pokusov: otázka nesmie byť ani v pamäti z minulých hier; potom stačí, že nebola v tejto hre */
    if (!(H && H.used[key]) && (i >= 40 || !H || !dqSeenHas(key))) { if (H) { H.used[key] = 1; dqSeenAdd(key); } return fin(q); }
  }
  return fin(dqWPick(kinds)());
}
/* rýchla hra skracuje všetky pevné fázy okrem odpočtu; pri otázke najvyššej obťažnosti je na odpoveď 60 % času */
function dqDur(phase) {
  const S = DQ.S;
  if (phase === 'startq' || phase === 'claimq' || phase === 'duelq' || phase === 'tieq') return Math.max(6000, Math.round(S.cfg.time * 1000 * (S.q && S.q.lvl === 4 ? 0.6 : 1)));
  const f = DQ_FIX[phase] || 0;
  return S.cfg.fast && phase !== 'count' ? Math.round(f * 0.6) : f;
}
/* ---------- obťažnosť otázok ----------
   Úroveň otázky z okruhov sa odhaduje z jej podoby: výpočty a presné čísla sú ťažké, významy skratiek a názvy ľahké.
   Je to odhad, nie meranie — slúži na to, aby za cennejší priestor padala náročnejšia otázka. */
const DQ_LVN = ['', 'ĽAHKÁ', 'STREDNÁ', 'ŤAŽKÁ', 'MEGA ŤAŽKÁ'];
const DQ_GENLV = { px: 1, hd: 1, ap: 2, ac: 2, co: 3, cs: 3 };
function dqQLevel(c) {
  if (c.l) return c.l;
  /* číselná možnosť = začína číslom (aj „asi 5 NM“, „do 2 s“); „Annex 3“ či „FL 180“ sa za číslo nepočíta */
  const isNum = x => /^(asi |približne |najmenej |najviac |okolo |do |od |o |nad |pod |po |za |v roku )?[\d+\-−]/i.test(x);
  const q = c.q, all = [c.a].concat(c.w), nums = all.filter(isNum).length;
  let n = 0;
  if (/^(Čo znamená|Akú skratku|Akú farbu|Ako sa (nazýva|označuje|volá)|Akým písmenom|Aký indikátor|Aké je označenie|Do ktorej (skupiny|kategórie))/.test(q)) n--;
  if (/^Čo je [^,]{1,22}\?$/.test(q)) n--;
  if (c.a.length <= 7 && !isNum(c.a)) n--;
  if (nums >= 3) n++;
  if (nums >= 3 && /\d/.test(q)) n++;
  if (q.length > 78) n++;
  if (/^(Prečo|Čím sa líši|Ako (vplýva|sa mení|ovplyvn|sa zmení)|Od čoho|Čo sa stane|Kedy)/.test(q)) n++;
  return (c.l = n <= -1 ? 1 : n === 0 ? 2 : 3);
}
function dqLvlFor(t) { const v = DQ_MAP.t[t].v; return v >= 500 ? 4 : v >= 400 ? 3 : v >= 200 ? 2 : 1; }
function dqSetName(k) { const x = DQ_QS.find(y => y[0] === k); return x ? x[1] + ' · ' + x[2] : 'VLASTNÉ OTÁZKY'; }
function dqAsking(S) { return S.phase === 'startq' || S.phase === 'claimq' || S.phase === 'duelq' || S.phase === 'tieq'; }
function dqPicking(S) { return S.phase === 'startpick' || S.phase === 'pick' || S.phase === 'warpick'; }
function dqPad(n) { n = ((n - 1) % 360 + 360) % 360 + 1; return String(n).padStart(3, '0'); }

/* otázky do hry: len také, ktoré sa dajú položiť textom a majú jednu správnu odpoveď */
function dqGenQ(mods, lvl) {
  const pick = a => a[Math.floor(Math.random() * a.length)], want = lvl ? Math.min(3, lvl) : 0;
  const mk = (mod, prompt, sub, right, pool) => {
    const o = [right]; let g = 0;
    while (o.length < 4 && g++ < 600) { const x = pick(pool); if (x && o.indexOf(x) < 0) o.push(x); }
    const opts = shuffle(o);
    return { mod, prompt, sub, opts, ans: opts.indexOf(right) };
  };
  const once = (arr, f) => { const c = {}; arr.forEach(x => { c[f(x)] = (c[f(x)] || 0) + 1; }); return arr.filter(x => c[f(x)] === 1); };
  const K = {
    ac: () => { const a = pick(AIRCRAFT); if (a.wiki && Math.random() < 0.4) return Object.assign(mk('MOD 01 · TYPY', '', 'Aké je ICAO označenie lietadla na fotke?', a.icao, AIRCRAFT.map(x => x.icao)), { img: a.wiki }); return Math.random() < 0.5 ? mk('MOD 01 · TYPY', a.icao, 'Ktorý typ lietadla má toto ICAO označenie?', a.name, AIRCRAFT.map(x => x.name))
      : mk('MOD 01 · TYPY', a.name, 'Aké je ICAO označenie tohto typu?', a.icao, AIRCRAFT.map(x => x.icao)); },
    ap: () => { const a = pick(AIRPORTS); return Math.random() < 0.5 ? mk('MOD 02 · LETISKÁ', a.icao, 'V ktorom meste je toto letisko?', a.city, AIRPORTS.filter(x => x.cat === a.cat).map(x => x.city))
      : mk('MOD 02 · LETISKÁ', a.city, 'Ktorý ICAO kód patrí letisku v tomto meste?', a.icao, AIRPORTS.filter(x => x.city !== a.city && x.cat === a.cat).map(x => x.icao)); },
    px: () => { const P = once(ICAO_STATES, s => s.name), a = pick(P); return mk('MOD 02 · PREFIXY', a.name, 'Ktorým prefixom sa začínajú ICAO kódy letísk tohto štátu?', a.p, ICAO_STATES.filter(s => s.name !== a.name).map(s => s.p)); },
    cs: () => { const P = CALLSIGNS.filter(c => c.sim && CS_BY_ICAO[c.icao].length === 1 && CS_BY_CALL[c.call].length === 1), a = pick(P);
      return Math.random() < 0.5 ? mk('MOD 03 · VOLAČKY', a.icao, 'Akú volačku má tento kód prevádzkovateľa?', a.call, P.map(x => x.call))
        : mk('MOD 03 · VOLAČKY', '„' + a.call + '“', 'Ktorý kód prevádzkovateľa patrí k tejto volačke?', a.icao, P.map(x => x.icao)); },
    hd: () => {
      const h = 5 * (1 + Math.floor(Math.random() * 72));
      if (Math.random() < 0.4) { const r = h + 180; return mk('MOD 05 · KURZY', dqPad(h) + '°', 'Aký je opačný kurz?', dqPad(r), [r + 10, r - 10, r + 20, r - 20, r + 90, r - 90].map(dqPad)); }
      const by = 10 * (1 + Math.floor(Math.random() * 17)), right = Math.random() < 0.5, r = h + (right ? by : -by);
      return mk('MOD 05 · KURZY', dqPad(h) + '° · ' + (right ? 'doprava' : 'doľava') + ' o ' + by + '°', 'Aký bude nový kurz po zatáčke?', dqPad(r), [h + (right ? -by : by), r + 10, r - 10, r + 20, r - 20, r + 100, r - 100].map(dqPad));
    },
    co: () => { const P = once(CO_UNITS.filter(u => u.f && !u.alt), u => u.n), a = pick(P); return mk('MOD 06 · FREKVENCIE', a.n, 'Na akej frekvencii (MHz) pracuje toto stanovište?', a.f, CO_UNITS.filter(u => u.f && u.f !== a.alt).map(u => u.f)); },
  };
  const bank = (k, name) => () => {
    const IQ = DQ_IMGQ[k];
    if (IQ && Math.random() < IQ.p) { const g = pick(IQ.g), it = pick(g.it), opts = shuffle([it[1]].concat(shuffle(g.it.filter(x => x[1] !== it[1]).map(x => x[1])).slice(0, 3))); return { mod: name, prompt: '', sub: g.q, opts, ans: opts.indexOf(it[1]), img: it[0] }; }
    let P = DQ_BANK[k]; if (want) { const L = P.filter(c => dqQLevel(c) === want); if (L.length >= 8) P = L; } const c = pick(P), opts = shuffle([c.a].concat(c.w)); return { mod: name, prompt: c.q, sub: 'Vyber správnu odpoveď.', opts, ans: opts.indexOf(c.a) }; };
  K.atm = bank('atm', 'OKRUH · ATM'); K.nav = bank('nav', 'OKRUH · NAVIGÁCIA');
  K.met = bank('met', 'OKRUH · METEOROLÓGIA'); K.eqps = bank('eqps', 'OKRUH · ZARIADENIA A SYSTÉMY'); K.hum = bank('hum', 'OKRUH · ĽUDSKÉ FAKTORY');
  K.acft = bank('acft', 'OKRUH · LIETADLÁ'); K.pen = bank('pen', 'OKRUH · PRACOVNÉ PROSTREDIE');
  if (DQ_BANK.law && DQ_BANK.law.length) K.law = bank('law', 'OKRUH · LETECKÉ PRÁVO');
  K.hist = bank('hist', 'OKRUH · HISTÓRIA LETECTVA'); K.gen = bank('gen', 'OKRUH · VŠEOBECNÝ PREHĽAD');
  const CU = dqcAll();
  if (CU.length) K.cu = () => { const c = pick(CU), opts = shuffle([c.a].concat(shuffle(c.w).slice(0, 3))); return { mod: 'VLASTNÉ OTÁZKY', prompt: c.q, sub: 'Vyber správnu odpoveď.', opts, ans: opts.indexOf(c.a) }; };
  const ks = (mods || []).filter(m => K[m]), all = ks.length ? ks : Object.keys(K).filter(m => m !== 'cu'), H = DQ.H;
  /* moduly trenažéra majú pevnú úroveň; okruhy a vlastné otázky sa hodia na každú (okruhy si vyberú otázky danej úrovne) */
  const fit = want ? all.filter(m => DQ_BANK[m] || m === 'cu' || DQ_GENLV[m] === want) : all, use = fit.length ? fit : all;
  const fin = (q, m) => {
    q.key = m; q.lvl = lvl || 0;
    return q;
  };
  /* veľká sada padá častejšie než malá — inak by sa 20 frekvencií točilo rovnako často ako 430 otázok z meteorológie */
  const WT = { ac: Math.min(300, AIRCRAFT.length * 2), ap: Math.min(300, AIRPORTS.length * 2), px: 70, cs: 220, hd: 60, co: 40 };
  const W = use.map(m => [m, DQ_BANK[m] ? DQ_BANK[m].length : m === 'cu' ? Math.max(60, CU.length) : WT[m] || 60]);
  for (let i = 0; i < 80; i++) {
    const m = dqWPick(W), q = K[m]();
    const key = (q.img || '') + q.prompt + q.sub;
    if (q.opts.length >= 2 && q.ans >= 0 && !(H && H.used[key]) && (i >= 50 || !H || !dqSeenHas(key))) { if (H) { H.used[key] = 1; dqSeenAdd(key); } return fin(q, m); }
  }
  const m = dqWPick(W); return fin(K[m](), m);
}

/* ---------- spojenie ---------- */
function dqLoadSb() {
  if (DQ.sb) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload = () => { try { DQ.sb = window.supabase.createClient(SB_URL, SB_KEY); res(); } catch (e) { rej(e); } };
    s.onerror = () => rej(new Error('NET'));
    document.head.appendChild(s);
  });
}
/* ---------- výpadky: obnova kanála, čakanie na hostiteľa, návrat hostiteľa (v4.1) ---------- */
const DQ_HOSTK = 'atcoTrainerV2.dqHost';
/* kanál spadol (uspatý telefón, výpadok siete) → otvorí sa nanovo; najviac raz za 10 sekúnd */
async function dqReNet() {
  if (!DQ.room || DQ.reNet) return;
  DQ.reNet = true; DQ.reNetT = Date.now();
  const old = DQ.net, room = DQ.room;
  try { if (old) await old.close(); } catch (e) {}
  DQ.net = { send() {}, close() {}, ok: () => false };
  try {
    const n = await dqNet(room, DQ.host ? dqHostMsg : dqClientMsg);
    if (DQ.room !== room) { try { n.close(); } catch (e) {} }
    else { DQ.net = n; if (DQ.host) dqCast(); else n.send(Object.assign({ t: 'join', id: DQ.id, nick: dqNick() }, dqMeta())); }
  } catch (e) {}
  DQ.reNet = false;
}
function dqNetCheck() { if (DQ.room && DQ.net && DQ.net.ok && !DQ.net.ok() && Date.now() - (DQ.reNetT || 0) > 10000) dqReNet(); }
/* pás „čakám na hostiteľa“ — hráč z hry nevypadne, kým sa hostiteľ do troch minút vráti */
function dqWaitBar(gap) {
  let el = document.getElementById('dq-wait');
  if (!gap) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'dq-wait'; document.body.appendChild(el); }
  el.innerHTML = '<b>HOSTITEĽ JE MIMO HRY</b><span>Čakám, kým sa vráti — hra bude pokračovať tam, kde skončila. Odpojím sa o ' + Math.max(0, Math.ceil((180000 - gap) / 1000)) + ' s.</span>';
}
/* obrazovka telefónu počas hry nezhasína (kde to prehliadač dovolí) */
function dqWake(on) {
  try {
    if (on) { if (!DQ.wl && navigator.wakeLock && !document.hidden) navigator.wakeLock.request('screen').then(l => { DQ.wl = l; l.addEventListener('release', () => { DQ.wl = null; }); }).catch(() => {}); }
    else if (DQ.wl) { DQ.wl.release(); DQ.wl = null; }
  } catch (e) {}
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !DQ.room) return;
  DQ.lastState = Date.now();            // po návrate do okna dostane spojenie čas, aby sa spamätalo
  dqWake(true); dqNetCheck();
  if (DQ.host && DQ.S) dqCast();
});
/* hostiteľ si priebežne ukladá stav hry, aby ju vedel po obnovení stránky obnoviť */
function dqHostSave() {
  const S = DQ.S, H = DQ.H, now = Date.now();
  if (!DQ.host || !S || !H || DQ.demo) return;
  if (H.savK === S.k && now - (H.savT || 0) < 1500) return;
  H.savK = S.k; H.savT = now;
  lsSet(DQ_HOSTK, { room: DQ.room, id: DQ.id, t: now, S, ans: H.ans, got: H.got, used: H.used, pq: H.pq || null });
}
function dqBotAns(pi) {
  const S = DQ.S, H = DQ.H, p = S.players[pi], k = S.k, ms = Math.min(S.tot - 600, 1500 + Math.random() * 4000);
  let m;
  if (S.q.num) { const dec = (String(H.ans).split('.')[1] || '').length, off = Math.random() < 0.3 ? 0 : (Math.random() * 2 - 1) * 0.2 * Math.max(1, Math.abs(H.ans)); m = { t: 'ans', id: p.id, k, v: +(H.ans + off).toFixed(dec), ms }; }
  else m = { t: 'ans', id: p.id, k, c: Math.random() < 0.6 ? H.ans : (H.ans + 1 + Math.floor(Math.random() * (S.q.opts.length - 1))) % S.q.opts.length, ms };
  H.bots.push(setTimeout(() => { if (DQ.S && DQ.S.k === k) dqHostMsg(m); }, ms));
}
function dqDuelGo() { const S = DQ.S, D = S.duel; dqPhase('duelintro', () => dqAskSoon('duelq', D.d >= 0 ? [D.a, D.d] : [D.a], dqDuelRev, false, false, { mods: D.m ? [D.m] : S.cfg.mods, lvl: D.lvl })); }
function dqTieGo() { const S = DQ.S, D = S.duel; dqAskSoon('tieq', [D.a, D.d], dqTieRev, false, true, { mods: D.m ? [D.m] : S.cfg.mods }); }
/* obnovená hra pokračuje od fázy, v ktorej sa prerušila; čo má nasledovať, sa určí z fázy (funkcie sa uložiť nedajú) */
function dqResumePhase() {
  const S = DQ.S, H = DQ.H, D = S.duel, ph = S.phase, NEXT = { startq: dqStartRev, claimq: dqClaimRev, duelq: dqDuelRev, tieq: dqTieRev };
  const who = p => p === 'duelq' ? (D.d >= 0 ? [D.a, D.d] : [D.a]) : p === 'tieq' ? [D.a, D.d] : dqLive(S);
  const hold = (fn, ms) => { S.tot = Math.max(ms || S.tot || 0, 4000); H.next = fn; H.deadline = Date.now() + S.tot; clearTimeout(H.timer); H.timer = setTimeout(fn, S.tot); dqCast(); };
  if (ph === 'lobby' || ph === 'end') return dqCast();
  if (NEXT[ph] && S.q) { hold(NEXT[ph], dqDur(ph)); S.q.who.forEach(pi => { if (S.players[pi].bot && !H.got[pi]) dqBotAns(pi); }); return; }
  if (ph === 'startrev') return hold(dqStartPick);
  if (ph === 'claimrev') return hold(dqPickNext);
  if ((ph === 'duelrev' || ph === 'tierev') && D && S.rev) return hold(S.rev.what === 'tie' || S.rev.what === 'again' ? dqTieGo : () => dqDuelDone(!!S.rev.win));
  if (dqPicking(S) && S.allowed.length) { H.nudged = false; hold(dqAuto, dqDur(ph)); return dqNudge(); }
  if (ph === 'modpick' && D) { H.modGo = dqDuelGo; hold(dqModAuto, dqDur(ph)); const p = S.players[D.a], k = S.k; if (p.bot || !p.on) H.bots.push(setTimeout(() => { if (DQ.S && DQ.S.k === k) dqModAuto(); }, 1300)); return; }
  if (ph === 'duelintro' && D) return dqDuelGo();
  if (ph === 'rest' || ph === 'count') {
    const c = S.cnt;
    if (c === 'war') return hold(dqWarRound);
    if (c === 'end') return hold(dqEnd);
    if (NEXT[c] && (D || c === 'startq' || c === 'claimq')) {
      const mods = D && D.m ? [D.m] : S.cfg.mods;
      if (!H.pq) { H.pq = c === 'startq' || c === 'tieq' ? dqGenNum(mods) : dqGenQ(mods, D && c === 'duelq' ? D.lvl : 0); S.pre = H.pq.img || ''; }
      return dqPhase('count', () => dqAsk(c, who(c), NEXT[c]));
    }
  }
  /* neznámy stav: pokračuje sa ďalším ťahom tej časti hry, ktorá práve bežala */
  if (S.wr > 0) { S.duel = null; return dqWarPick(); }
  return dqClaimQ();
}
async function dqHostResume() {
  const L = lsGet(DQ_HOSTK, null);
  if (!L || !L.S || !L.room) return;
  DQ.id = L.id; try { sessionStorage.setItem('atcoDqId', L.id); } catch (e) {}
  try { DQ.net = await dqNet(L.room, dqHostMsg); } catch (e) { DQ.err = 'Miestnosť sa nepodarilo obnoviť — skontroluj pripojenie a skús to znova.'; return dqShow(); }
  const S = L.S, now = Date.now(), seen = {};
  S.players.forEach(p => { if (!p.bot) { seen[p.id] = now; p.on = true; } });
  DQ.room = L.room; DQ.host = true; DQ.err = ''; DQ.S = S;
  if (S.map && DQ_MAPS[S.map]) DQ_MAP = DQ_MAPS[S.map];
  DQ.H = { ans: L.ans, got: L.got || {}, deadline: 0, timer: null, seen, used: L.used || {}, bots: [], next: null, pq: L.pq || null };
  /* moja vlastná odpoveď na práve bežiacu otázku ostáva zapísaná */
  const g = S.q && !S.rev && dqAsking(S) ? DQ.H.got[dqMe()] : null;
  DQ.k = S.k; DQ.qT0 = now; DQ.my = g ? (S.q.num ? { v: g.v } : { c: g.c }) : null; DQ.sig = ''; DQ.prev = null;
  clearInterval(DQ.loop); DQ.loop = setInterval(dqHostLoop, 2000);
  try { dqResumePhase(); } catch (e) { DQ.err = 'Hru sa nepodarilo obnoviť.'; lsSet(DQ_HOSTK, null); return dqLeave(DQ.err); }
  dqShow();
}
async function dqNet(code, onMsg) {
  if (SB_ON) {
    await dqLoadSb();
    const ch = DQ.sb.channel('atco-dq-' + code, { config: { broadcast: { self: false } } });
    ch.on('broadcast', { event: 'm' }, p => onMsg(p.payload));
    await new Promise((res, rej) => { ch.subscribe(st => { if (st === 'SUBSCRIBED') res(); else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') rej(new Error('NET')); }); });
    return { send: m => ch.send({ type: 'broadcast', event: 'm', payload: m }), close: () => DQ.sb.removeChannel(ch), ok: () => ch.state === 'joined' || ch.state === 'joining' };
  }
  const bc = new BroadcastChannel('atco-dq-' + code);
  bc.onmessage = e => onMsg(e.data);
  return { send: m => bc.postMessage(m), close: () => bc.close(), ok: () => true };
}
function dqNick() { return RK.acct ? RK.acct.nick : (DQ.guest || '').trim().slice(0, 16); }
function dqSend(m) { m.id = DQ.id; if (DQ.host) dqHostMsg(m); else if (DQ.net) DQ.net.send(m); }
function dqMe() { return DQ.S ? DQ.S.players.findIndex(p => p.id === DQ.id) : -1; }
function dqLeave(msg, keep) {
  if (!keep) lsSet(DQ_LASTK, null);
  if (DQ.host && !keep && !DQ.demo) lsSet(DQ_HOSTK, null);      // hostiteľ odišiel sám → miestnosť sa neobnovuje
  dqWaitBar(0); dqWake(false); DQ.demo = false; DQ.demoHold = null;
  if (DQ.net) { try { DQ.net.send({ t: DQ.host ? 'bye' : 'leave', id: DQ.id }); DQ.net.close(); } catch (e) {} }
  if (DQ.H) { clearTimeout(DQ.H.timer); DQ.H.bots.forEach(clearTimeout); }
  clearInterval(DQ.loop);
  DQ.room = null; DQ.host = false; DQ.S = null; DQ.net = null; DQ.H = null; DQ.sig = ''; DQ.k = -1; DQ.prev = null; DQ.err = msg || '';
  dqShow();
}
function dqShow() { if (state.mode === 'conquer') { DQ.sig = ''; dqRender(document.getElementById('qcard')); } }
async function dqCreate() {
  if (!dqNick()) { DQ.err = 'Najprv si napíš prezývku.'; return dqShow(); }
  const L = 'ABCDEFGHJKLMNPRSTUVXYZ'; let code = '';
  for (let i = 0; i < 4; i++) code += L.charAt(Math.floor(Math.random() * L.length));
  try { DQ.net = await dqNet(code, dqHostMsg); } catch (e) { DQ.err = 'Nepodarilo sa otvoriť miestnosť — skontroluj pripojenie.'; return dqShow(); }
  DQ.room = code; DQ.host = true; DQ.err = '';
  DQ.H = { ans: -1, got: {}, deadline: 0, timer: null, seen: {}, used: {}, bots: [], next: null };
  DQ.S = { gid: '', k: 0, phase: 'lobby', players: [{ id: DQ.id, nick: dqNick(), bot: false, on: true, bonus: 0 }], cfg: { map: 'auto', max: 4, time: 15, claim: 5, war: 5, pm: 0, lv: 1, fast: 0, jk: 1, pk: 1, mods: DQ_QS.map(x => x[0]), cuN: dqcAll().length },
    own: [], round: 0, wr: 0, wq: [], q: null, rev: null, picks: [], allowed: [], chooser: -1, duel: null, answered: [], dur: 0, tot: 0 };
  { const L = dqMeta(); DQ.S.players[0].col = DQ_PAL[L.col] ? L.col : 0; DQ.S.players[0].ico = L.ico; DQ.S.players[0].lv = L.lv; DQ.S.players[0].acc = L.acc; }
  clearInterval(DQ.loop); DQ.loop = setInterval(dqHostLoop, 2000);
  dqCast();
}
async function dqJoin(code) {
  code = (code || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (!dqNick()) { DQ.err = 'Najprv si napíš prezývku.'; return dqShow(); }
  if (code.length !== 4) { DQ.err = 'Kód miestnosti má štyri písmená.'; return dqShow(); }
  try { DQ.net = await dqNet(code, dqClientMsg); } catch (e) { DQ.err = 'Nepodarilo sa pripojiť — skontroluj pripojenie.'; return dqShow(); }
  DQ.room = code; DQ.host = false; DQ.S = null; DQ.err = ''; DQ.lastState = Date.now(); DQ.joinAt = Date.now();
  const hello = () => DQ.net && DQ.net.send(Object.assign({ t: 'join', id: DQ.id, nick: dqNick() }, dqMeta()));
  hello();
  clearInterval(DQ.loop);
  DQ.loop = setInterval(() => {
    if (!DQ.room) return;
    if (dqMe() < 0) { if (Date.now() - DQ.joinAt > 7000) return dqLeave('Miestnosť s kódom ' + code + ' nie je otvorená.'); hello(); }
    else { try { DQ.net.send({ t: 'ping', id: DQ.id }); } catch (e) {} }
    const gap = Date.now() - DQ.lastState;
    if (dqMe() >= 0) {
      dqWaitBar(gap > 7000 ? gap : 0);
      if (gap > 180000) return dqLeave('Hostiteľ sa do troch minút nevrátil. Ak hru obnoví, môžeš sa do nej vrátiť.', true);
      if (gap > 9000 && Date.now() - (DQ.reNetT || 0) > 15000) dqReNet(); else dqNetCheck();
    }
  }, 1500);
  dqShow();
}
function dqClientMsg(m) {
  if (!m || DQ.host) return;
  if (m.t === 'state') dqApply(m.S);
  else if (m.t === 'bye') dqLeave('Hostiteľ ukončil miestnosť.');
  else if (m.t === 'no' && m.to === DQ.id) dqLeave(m.why);
}
function dqApply(S) {
  DQ.S = S; DQ.lastState = Date.now();
  if (!DQ.host) dqWaitBar(0);
  if (S.k !== DQ.k) { DQ.k = S.k; DQ.qT0 = Date.now(); DQ.my = null; DQ.sel = -1; if (S.phase !== 'lobby' && S.phase !== 'end') RK.lastAns = Date.now(); }
  /* úspešnosť aj z Dobyvateľa: každá moja vyhodnotená odpoveď v hre aspoň dvoch ľudí */
  if (S.rev && S.q && DQ.revK !== S.gid + S.k) {
    DQ.revK = S.gid + S.k; const r = S.rev.res[dqMe()];
    if (r) {
      dqLogAns(S, r);
      if (S.humans >= 2) { rkAdd('conquer', r.ok ? { c: 1 } : { w: 1 }); if (DQ_BANK[S.q.key] && !S.q.num) rkAdd('q_' + S.q.key, r.ok ? { c: 1 } : { w: 1 }); rkPendSave(); }
    }
  }
  /* kde som hral naposledy — aby sa dalo po výpadku alebo obnovení stránky vrátiť do rozohranej hry */
  if (!DQ.host && dqMe() >= 0) {
    if (S.phase === 'end' || S.phase === 'lobby') { if (DQ.lastSave) { DQ.lastSave = 0; lsSet(DQ_LASTK, null); } }
    else if (Date.now() - (DQ.lastSave || 0) > 4000) { DQ.lastSave = Date.now(); lsSet(DQ_LASTK, { room: DQ.room, id: DQ.id, nick: dqNick(), t: Date.now() }); }
  }
  if (S.map && DQ_MAPS[S.map] && DQ_MAP !== DQ_MAPS[S.map]) { DQ_MAP = DQ_MAPS[S.map]; DQ.mapSig = ''; DQ.view = null; DQ.prev = null; DQ.fx = []; }
  DQ.deadline = Date.now() + (S.dur || 0);
  if (S.phase === 'end' && DQ.reported !== S.gid) {
    DQ.reported = S.gid;
    const me = dqMe(), place = S.rank.indexOf(me);
    const lgMe = me >= 0 ? dqLeaguePts(S, me).pts : 0;   // počíta si ich každý sám z konca hry, nie z čísla od hostiteľa (ten mohol mať starú verziu)
    if (me >= 0 && lgMe > 0 && !S.cfg.demo) { rkAdd('conquer', S.humans >= 2 ? { p: lgMe, g: 1, v: place === 0 ? 1 : 0 } : { p: lgMe }); rkPendSave(); rkFlush(); }
  }
  const sig = JSON.stringify(Object.assign({}, S, { dur: 0 })) + JSON.stringify(DQ.my);
  if (sig !== DQ.sig && state.mode === 'conquer') { DQ.sig = sig; dqRender(document.getElementById('qcard')); }
}

/* ---------- hostiteľ: pravidlá hry ---------- */
function dqCast() { const S = DQ.S, H = DQ.H; S.dur = Math.max(0, H.deadline - Date.now()); if (DQ.net) { try { DQ.net.send({ t: 'state', S }); } catch (e) {} } dqApply(S); dqHostSave(); }
/* ---------- UKÁŽKA HRY (v4.4) ----------
   Beží ako bežná hra proti dvom počítačom, len bez siete a bez bodov. Keď príde fáza, ktorú hráč ešte nevidel,
   hra sa zastaví (časovač hostiteľa sa nespustí) a tréner dole vysvetlí, čo sa deje; pokračuje sa tlačidlom. */
function dqCoachInfo(S, me) {
  const ph = S.phase, D = S.duel, mine = S.chooser === me, c = S.cnt;
  if (ph === 'rest') {
    if (c === 'war') return ['war', 'Obsadzovanie sa skončilo — idú súboje', 'Voľné priestory, ktoré ostali, sa rozdelili medzi hráčov v pomere bodov (nikomu sa podiel nezmenil o viac než 3 %). Teraz prídu SÚBOJE: v každom kole je každý hráč raz na rade a môže zaútočiť na suseda.', true];
    if (c === 'end') return ['fin', 'Hra sa končí', 'Odohrali sa všetky kolá súbojov. Nasleduje vyhodnotenie.', false];
    return ['rest', 'Krátka prestávka', 'Pozri sa na mapu, čo sa zmenilo. Ďalšia otázka príde o chvíľu.', false];
  }
  if (ph === 'count') return ['cnt', 'Priprav sa', 'Pred každou otázkou je odpočet 3 – 2 – 1.', false];
  if (ph === 'startq') return ['startq', 'Štart: tipovacia otázka', 'Hra sa začína otázkou, na ktorú sa odpovedá číslom. Napíš tip (jednotka je vždy uvedená v otázke aj pri políčku) a potvrď. Kto je najbližšie k správnemu číslu, vyberá si domovské letisko ako prvý.', true];
  if (ph === 'startrev') return ['startrev', 'Vyhodnotenie tipov', 'Tipy všetkých hráčov priletia na číselnú os a správna hodnota sa odkryje posledná. Podľa presnosti sa určí poradie, v akom si hráči vyberajú letisko.', true];
  if (ph === 'startpick') return mine ? ['startpick', 'Vyber si domovské letisko', 'Klikni na jeden zo sivých kruhov na mape. Domovské letisko má tri životy (tri červené bodky na krúžku) a rozširuješ sa z neho ďalej. Keď oň prídeš, vypadávaš z hry.', true] : ['sp2', 'Letisko si vyberá súper', 'Každý hráč má jedno domovské letisko.', false];
  if (ph === 'claimq') return ['claimq', 'Obsadzovanie', 'Všetci dostanú tú istú otázku so štyrmi možnosťami. Kto odpovie správne, vyberie si voľný priestor; najrýchlejší zo správnych vyberá prvý a berie si dva. Pod otázkou sú ŽOLÍKY — 50:50 skryje dve nesprávne odpovede, +10 s pridá čas. Každý sa dá použiť raz za hru.', true];
  if (ph === 'claimrev') return ['claimrev', 'Kto odpovedal správne', 'Najprv vidno, kto čo zvolil (farebné bodky pri odpovediach), a o chvíľu sa rozsvieti správna odpoveď. Tri správne odpovede za sebou sú séria 🔥 a dávajú +50 bodov.', true];
  if (ph === 'pick') return mine ? ['pick', 'Vyber si priestor', 'Sivé priestory si môžeš zobrať — musia susediť s tým, čo už máš. Žlté číslo je počet bodov: letisko 500, CTR 400, TMA 300, TRA/TSA 200, LZR 150, časť triedy G 100. Radarový lúč ti ukáže, čo je na výber. Na telefóne vyber priestor zo zoznamu dole a potvrď.', true] : ['pick2', 'Vyberá súper', 'Aj súper, ktorý odpovedal správne, si berie priestor.', false];
  if (ph === 'warpick') return mine ? ['warpick', 'Si na rade — útoč', 'Súperove priestory označené mečmi ⚔ môžeš napadnúť, sivé voľné priestory obsadiť. Čím cennejší priestor, tým ťažšia otázka. Útok na domovské letisko súpera mu pri výhre uberie život; pri treťom vypadáva a jeho priestory berieš ty.', true] : ['wp2', 'Na rade je súper', 'Ak zaútočí na tvoj priestor, budete odpovedať obaja.', false];
  if (ph === 'modpick') return D && D.a === me ? ['modpick', 'Vyber okruh otázky', 'Ako útočník si volíš, z ktorého okruhu otázka padne. Výber môžeš meniť, platí až po POTVRDIŤ. NÁHODNE nechá okruh na žreb. (Túto voľbu zapína hostiteľ v nastavení hry.)', true] : ['mp2', 'Súper vyberá okruh', 'Útočník si volí, z čoho otázka bude.', false];
  if (ph === 'duelintro') return ['duelintro', 'Útok', 'Lietadlo útočníka letí na cieľ a kamera sa presunie na miesto deja. Hore vidíš, kto na koho útočí, o ktorý priestor ide a za koľko bodov.', false];
  if (ph === 'duelq') return D && D.d >= 0
    ? ['duelq', 'Súboj', 'Na tú istú otázku odpovedá útočník aj obranca. Rýchlosť nerozhoduje: útočník správne a obranca zle = dobyté · obranca správne a útočník zle = ubránené a +100 bodov obrancovi · obaja zle = nič sa nemení · obaja správne = rozstrel. Útočník môže použiť žolík ×2 BODY.', true]
    : ['duelq0', 'Obsadenie voľného priestoru', 'Voľný priestor získaš, ak odpovieš správne. Súper tu neodpovedá.', true];
  if (ph === 'duelrev') return ['duelrev', 'Výsledok súboja', 'Farebný pás hore v okne hovorí, ako to dopadlo. Keď sa okno zavrie, výsledok sa odohrá na mape: dobytý priestor sa prefarbí a body priletia do skóre, pri ubránení sa ukáže štít.', true];
  if (ph === 'tieq') return ['tieq', 'Rozstrel', 'Obaja ste odpovedali správne, takže rozhodne tipovacia otázka — vyhráva presnejší tip. Rozstrely sú najviac tri a sú očíslované; v treťom pri rovnakom tipe vyhráva rýchlejší.', true];
  if (ph === 'tierev') return ['tierev', 'Výsledok rozstrelu', 'Kto bol bližšie k správnemu číslu, vyhráva súboj.', false];
  if (ph === 'end') return ['end', 'Koniec hry', 'Stupne víťazov, ROZPIS BODOV (z čoho kto body má) a ocenenia. MOJE CHYBY ukážu otázky, ktoré si pokazil, a dajú sa hneď precvičiť. V skutočnej hre idú body do rebríčka: čím viac ľudí, kôl a okruhov, tým viac — vzorová hra štyroch ľudí dáva víťazovi 500.', false];
  return null;
}
function dqDemo() {
  if (DQ.room) return;
  DQ.net = { send() {}, close() {}, ok: () => true };
  DQ.room = 'UKÁŽKA'; DQ.host = true; DQ.err = ''; DQ.demo = true; DQ.demoSeen = {}; DQ.demoHold = null;
  DQ.H = { ans: -1, got: {}, deadline: 0, timer: null, seen: {}, used: {}, bots: [], next: null };
  const L = dqLook();
  DQ.S = { gid: '', k: 0, phase: 'lobby', players: [{ id: DQ.id, nick: dqNick() || 'TY', bot: false, on: true, bonus: 0, col: DQ_PAL[L.col] ? L.col : 0, ico: L.ico }],
    cfg: { demo: 1, map: 's', max: 3, time: 30, claim: 2, war: 2, pm: 1, lv: 1, fast: 0, jk: 1, mods: ['atm', 'nav', 'met', 'ap', 'px'], cuN: 0 },
    own: [], round: 0, wr: 0, wq: [], q: null, rev: null, picks: [], allowed: [], chooser: -1, duel: null, answered: [], dur: 0, tot: 0 };
  [1, 2].forEach(n => DQ.S.players.push({ id: 'bot' + n + Date.now(), nick: 'POČÍTAČ ' + n, bot: true, on: true, bonus: 0, col: dqFreeCol(DQ.S, -1), ico: n }));
  clearInterval(DQ.loop); DQ.loop = setInterval(dqHostLoop, 2000);
  dqStart();
}
/* hráč si prečítal vysvetlenie → fáza sa rozbehne (vyhodnotenia a prestávky už len krátko) */
function dqDemoGo() {
  const S = DQ.S, H = DQ.H, hd = DQ.demoHold;
  if (!hd || !S || !H) return;
  DQ.demoHold = null;
  S.tot = S.rev || S.phase === 'rest' ? 1600 : hd.tot; H.deadline = Date.now() + S.tot;
  clearTimeout(H.timer); H.timer = setTimeout(H.next, S.tot);
  dqCast(); dqAllIn();
  if (hd.auto) H.bots.push(setTimeout(hd.auto, 900));
}
function dqPhase(phase, fn) {
  const S = DQ.S, H = DQ.H;
  S.phase = phase; S.k++; S.tot = dqDur(phase); H.next = fn; H.deadline = Date.now() + S.tot;
  clearTimeout(H.timer);
  if (DQ.demo) {
    const ci = dqCoachInfo(S, 0);
    if (ci && ci[3] && !DQ.demoSeen[ci[0]]) { DQ.demoSeen[ci[0]] = 1; DQ.demoHold = { tot: S.tot }; S.tot = 0; H.deadline = 0; return dqCast(); }
  }
  H.timer = setTimeout(fn, S.tot);
  dqCast();
}
function dqHostLoop() {
  const S = DQ.S, H = DQ.H, now = Date.now();
  if (!S) return;
  dqNetCheck();
  S.players.forEach(p => { if (!p.bot && p.id !== DQ.id) p.on = now - (H.seen[p.id] || 0) < 9000; });
  if (S.phase === 'lobby') S.players = S.players.filter(p => p.on);
  else if (S.phase !== 'end') { dqNudge(); dqAllIn(); }
  dqCast();
}
function dqHostMsg(m) {
  const S = DQ.S, H = DQ.H;
  if (!m || !S || !DQ.host) return;
  if (m.id) H.seen[m.id] = Date.now();
  const pi = S.players.findIndex(p => p.id === m.id);
  if (m.t === 'join') {
    if (pi >= 0) { S.players[pi].on = true; if (S.phase === 'lobby' && m.lv) { S.players[pi].lv = Math.max(1, Math.min(LV.length, +m.lv || 1)); S.players[pi].acc = m.acc ? 1 : 0; } return dqCast(); }
    if (S.phase !== 'lobby') return DQ.net.send({ t: 'no', to: m.id, why: 'Hra v tejto miestnosti už beží.' });
    if (S.players.length >= S.cfg.max) return DQ.net.send({ t: 'no', to: m.id, why: 'Miestnosť je plná.' });
    let nick = String(m.nick || 'HRÁČ').slice(0, 16), n = 2;
    while (S.players.some(p => p.nick === nick)) nick = String(m.nick).slice(0, 14) + ' ' + n++;
    S.players.push({ id: m.id, nick, bot: false, on: true, bonus: 0, col: dqFreeCol(S, +m.col), ico: DQ_ICO[+m.ico] ? +m.ico : 0, lv: Math.max(1, Math.min(LV.length, +m.lv || 1)), acc: m.acc ? 1 : 0 });
    return dqCast();
  }
  if (pi < 0) return;
  if (m.t === 'leave') { if (S.phase === 'lobby') S.players.splice(pi, 1); else { S.players[pi].on = false; H.seen[m.id] = 0; dqNudge(); dqAllIn(); } return dqCast(); }
  /* farba a ikonka hráča — mení sa len v miestnosti pred štartom; farba nesmie byť obsadená */
  if (m.t === 'look' && S.phase === 'lobby') {
    const p = S.players[pi];
    if (DQ_ICO[+m.ico]) p.ico = +m.ico;
    if (DQ_PAL[+m.col] && !S.players.some((x, j) => j !== pi && x.col === +m.col)) p.col = +m.col;
    return dqCast();
  }
  /* rýchla reakcia: najviac raz za 1,5 sekundy */
  if (m.t === 'emo' && S.phase !== 'lobby' && DQ_EMO[+m.e]) {
    const now = Date.now(); H.emoT = H.emoT || {};
    if (now - (H.emoT[pi] || 0) < 1500) return;
    H.emoT[pi] = now; S.emo = { p: pi, e: +m.e, n: (S.emo ? S.emo.n : 0) + 1 };
    return dqCast();
  }
  /* žolíky — každý raz za hru: h = 50:50, t = +10 sekúnd pre všetkých, d = dvojité body za dobytý priestor (len útočník) */
  if (m.t === 'jk' && m.k === S.k && dqAsking(S) && S.q.who.indexOf(pi) >= 0 && !H.got[pi]) {
    const J = S.players[pi].jk;
    if (!J || !J[m.j]) return;
    if (m.j === 'h') { if (S.q.num || (S.q.hid && S.q.hid[pi])) return; S.q.hid = S.q.hid || {}; S.q.hid[pi] = shuffle(S.q.opts.map((o, i) => i).filter(i => i !== H.ans)).slice(0, 2); }
    else if (m.j === 't' || m.j === 's') { const add = m.j === 't' ? 10000 : 5000; H.deadline += add; S.tot += add; clearTimeout(H.timer); H.timer = setTimeout(H.next, Math.max(0, H.deadline - Date.now())); }
    else if (DQ_MUL[m.j]) { if (S.phase !== 'duelq' || !S.duel || S.duel.a !== pi || S.duel.x2) return; S.duel.x2 = DQ_MUL[m.j]; }   // v jednom súboji len jeden násobič
    else return;
    J[m.j]--; S.jkN = { p: pi, j: m.j, n: (S.jkN ? S.jkN.n : 0) + 1 };
    return dqCast();
  }
  if (pi === 0 && S.phase === 'lobby') {
    if (m.t === 'bot' && S.players.length < S.cfg.max) {
      const n = S.players.filter(p => p.bot).length + 1;
      S.players.push({ id: 'bot' + n + Date.now(), nick: 'POČÍTAČ ' + n, bot: true, on: true, bonus: 0, col: dqFreeCol(S, -1), ico: 1 + n % (DQ_ICO.length - 1) });
      return dqCast();
    }
    if (m.t === 'kick' && m.who > 0) { S.players.splice(m.who, 1); return dqCast(); }
    if (m.t === 'cfg') {
      if (m.key === 'mods' && m.val === 'cu' && !dqcAll().length) return;
      if (m.key === 'mods') { const i = S.cfg.mods.indexOf(m.val); if (i < 0) S.cfg.mods.push(m.val); else if (S.cfg.mods.length > 1) S.cfg.mods.splice(i, 1); }
      else if (DQ_OPT[m.key] && DQ_OPT[m.key].indexOf(m.val) >= 0 && (m.key !== 'max' || m.val >= S.players.length)) { S.cfg[m.key] = m.val; if (m.key === 'fast' && m.val) { S.cfg.claim = 3; S.cfg.war = 3; S.cfg.time = 10; } }
      else if (m.key === 'map' && DQ_OPT.map.indexOf(String(m.val)) >= 0) S.cfg.map = String(m.val);
      return dqCast();
    }
    if (m.t === 'start' && S.players.length >= 2) return dqStart();
  }
  if (m.t === 'again' && pi === 0 && S.phase === 'end') { S.phase = 'lobby'; S.k++; S.players = S.players.filter(p => p.on); S.players.forEach(p => { p.bonus = 0; p.out = false; }); return dqCast(); }
  if (m.t === 'ans' && m.k === S.k && dqAsking(S) && S.q.who.indexOf(pi) >= 0 && !H.got[pi]) {
    H.got[pi] = { c: m.c, v: typeof m.v === 'number' && isFinite(m.v) ? m.v : null, ms: Math.max(0, Math.min(S.tot, +m.ms || 0)) };
    S.answered = Object.keys(H.got).map(Number);
    dqCast(); return dqAllIn();
  }
  if (m.t === 'modsel' && m.k === S.k && S.phase === 'modpick' && S.duel && pi === S.duel.a && (m.m === '*' || S.cfg.mods.indexOf(m.m) >= 0)) { S.duel.ms = m.m; return dqCast(); }
  if (m.t === 'mod' && m.k === S.k && S.phase === 'modpick' && S.duel && pi === S.duel.a && S.duel.ms) return dqModAuto();
  if (m.t === 'pick' && m.k === S.k && dqPicking(S) && pi === S.chooser && S.allowed.indexOf(m.terr) >= 0) return dqChoose(m.terr);
}
/* mapa podľa počtu hráčov: 2 → malá, 3–4 → stredná, 5–6 → veľká (hostiteľ ju môže zvoliť aj ručne) */
function dqMapFor(S) { const m = S.cfg.map; if (m && m !== 'auto' && DQ_MAPS[m]) return m; const n = S.players.length; return n <= 2 ? 's' : n <= 4 ? 'm' : 'l'; }
function dqLive(S) { return S.players.map((p, i) => p.out ? -1 : i).filter(i => i >= 0); }
function dqStart() {
  const S = DQ.S, H = DQ.H;
  S.gid = DQ.room + Date.now();
  S.map = dqMapFor(S); DQ_MAP = DQ_MAPS[S.map];
  S.own = DQ_MAP.t.map(() => -1);
  S.base = S.players.map(() => -1); S.lives = S.players.map(() => 3);
  S.players.forEach(p => { p.bonus = 0; p.out = false; p.st = 0; if (DQ.host && p.id === DQ.id) p.lv = dqMyLv(); p.jk = dqJkFor(p, S.cfg); });
  S.stat = S.players.map(() => ({ c: 0, n: 0, mx: 0, fast: 0, at: 0, aw: 0, df: 0, dw: 0, fr: 0 })); S.players.forEach(p => { p.bd = {}; }); S.emo = null; S.jkN = null;
  S.humans = S.players.filter(p => !p.bot).length;
  S.round = 0; S.wr = 0; S.wq = []; S.duel = null; S.rank = null; S.league = null; S.outs = []; S.dist = 0; S.left = 0; H.used = {};
  dqAskSoon('startq', dqLive(S), dqStartRev, false, true);
}
/* štart: tipovacia otázka — kto je najbližšie, vyberá si domovské letisko prvý */
function dqStartRev() {
  const S = DQ.S, H = DQ.H, R = dqNumRes();
  S.picks = R.order.slice();
  S.rev = { num: true, ans: H.ans, unit: S.q.unit, res: R.res, order: R.order };
  dqPhase('startrev', dqStartPick);
}
function dqStartPick() {
  const S = DQ.S, H = DQ.H;
  if (!S.picks.length) return dqClaimQ();
  S.chooser = S.picks[0]; S.allowed = dqFree().filter(t => DQ_MAP.t[t].c === 'AD'); S.q = null; S.rev = null; H.nudged = false;
  dqPhase('startpick', dqAuto);
  dqNudge();
}
/* pred otázkou: krátka pauza (aby bolo vidno, čo sa stalo na mape) a odpočet 3 – 2 – 1 – GO */
function dqAskSoon(phase, who, next, rest, num, opt) {
  const S = DQ.S, H = DQ.H, mods = (opt && opt.mods) || S.cfg.mods;
  H.pq = num ? dqGenNum(mods) : dqGenQ(mods, opt && opt.lvl); S.pre = H.pq.img || ''; S.cnt = phase; S.q = null; S.rev = null; S.allowed = [];
  const go = () => dqPhase('count', () => dqAsk(phase, who, next));
  if (rest) dqPhase('rest', go); else go();
}
function dqAsk(phase, who, next) {
  const S = DQ.S, H = DQ.H, q = H.pq || dqGenQ(S.cfg.mods);
  H.pq = null; S.pre = '';
  H.ans = q.ans; H.got = {}; S.answered = []; S.rev = null;
  S.q = { mod: q.mod, key: q.key || '', lvl: q.lvl || 0, prompt: q.prompt, sub: q.sub, opts: q.opts || [], img: q.img || '', num: !!q.num, unit: q.unit || '', who };
  dqPhase(phase, next);
  const k = S.k, T = S.tot;
  who.forEach(pi => {
    const p = S.players[pi];
    if (!p.bot) return;
    const ms = Math.min(T - 600, 2200 + Math.random() * 6000);
    let m;
    if (q.num) {      // počítač tipuje: niekedy presne, inak s odchýlkou do ~20 %
      const dec = (String(q.ans).split('.')[1] || '').length, off = Math.random() < 0.3 ? 0 : (Math.random() * 2 - 1) * 0.2 * Math.max(1, Math.abs(q.ans));
      m = { t: 'ans', id: p.id, k, v: +(q.ans + off).toFixed(dec), ms };
    } else m = { t: 'ans', id: p.id, k, c: Math.random() < 0.6 ? q.ans : (q.ans + 1 + Math.floor(Math.random() * (q.opts.length - 1))) % q.opts.length, ms };
    H.bots.push(setTimeout(() => { if (DQ.S && DQ.S.k === k) dqHostMsg(m); }, ms));
  });
}
/* keď odpovedali všetci, na ktorých sa čaká, netreba čakať do konca času */
function dqAllIn() {
  const S = DQ.S, H = DQ.H;
  if (!dqAsking(S) || DQ.demoHold) return;
  if (S.q.who.every(pi => H.got[pi] || (!S.players[pi].bot && !S.players[pi].on))) { clearTimeout(H.timer); const f = H.next; H.timer = setTimeout(f, 350); }
}
/* na rade je počítač alebo odpojený hráč — vyberie sa zaňho */
function dqNudge() {
  const S = DQ.S, H = DQ.H;
  if (!dqPicking(S)) return;
  const p = S.players[S.chooser], k = S.k;
  if (p && (p.bot || !p.on) && !H.nudged) { H.nudged = true; H.bots.push(setTimeout(() => { if (DQ.S && DQ.S.k === k) dqAuto(); }, p.bot ? 1500 : 600)); }
}
/* počítač (a vypršaný čas) berie to najcennejšie, čo môže */
function dqAuto() {
  const S = DQ.S;
  if (DQ.demoHold) { DQ.demoHold.auto = dqAuto; return; }
  if (!S.allowed.length) return;
  const best = Math.max.apply(null, S.allowed.map(t => DQ_MAP.t[t].v)), top = S.allowed.filter(t => DQ_MAP.t[t].v === best);
  dqChoose(top[Math.floor(Math.random() * top.length)]);
}
function dqRes() {
  const S = DQ.S, H = DQ.H, res = {};
  S.q.who.forEach(pi => { const g = H.got[pi]; res[pi] = g ? { c: g.c, ms: Math.round(g.ms), ok: g.c === H.ans } : { c: -1, ms: 0, ok: false }; });
  return res;
}
/* tipovacia otázka: poradie podľa vzdialenosti od správneho čísla, pri zhode podľa času; kto neodpovedal, je posledný */
function dqNumRes() {
  const S = DQ.S, H = DQ.H, res = {};
  S.q.who.forEach(pi => { const g = H.got[pi], has = g && typeof g.v === 'number' && isFinite(g.v); res[pi] = has ? { v: g.v, ms: Math.round(g.ms), err: +Math.abs(g.v - H.ans).toFixed(6) } : { v: null, ms: 0, err: -1 }; });
  const yes = S.q.who.filter(pi => res[pi].v !== null).sort((a, b) => res[a].err - res[b].err || res[a].ms - res[b].ms);
  const order = yes.concat(shuffle(S.q.who.filter(pi => res[pi].v === null)));
  order.forEach((pi, n) => { res[pi].ok = n === 0 && res[pi].v !== null; });
  return { res, order };
}
/* Po obsadzovacích kolách sa zvyšné voľné priestory rozdelia v pomere bodov: kto mal 40 % bodov, má potom 37 až 43 %.
   Prideľuje sa len priestor susediaci s tým, čo hráč už má. Postup: v každom kroku sa urobí to pridelenie, po ktorom
   sú podiely najbližšie pôvodným; platí posledný stav, v ktorom sa žiadny podiel bodov nepohol o viac než DQ_FAIR
   (3 percentuálne body) a poradie hráčov ostalo rovnaké. Čo sa takto rozdeliť nedá, ostane voľné.
   Odmerané simuláciou (v4.1): rozdelí sa 58 – 75 % voľných priestorov; pri pôvodnej hranici 1,2 % to bolo len 9 – 43 %. */
const DQ_FAIR = 0.03;
function dqFairSplit(own0, live, T) {
  let own = own0.slice();
  const sum = a => a.reduce((x, y) => x + y, 0);
  const pts = () => live.map(p => own.reduce((s, o, t) => s + (o === p ? T[t].v : 0), 0)), cnt = () => live.map(p => own.filter(o => o === p).length);
  const s0 = pts(), c0 = cnt(), S0 = sum(s0), C0 = sum(c0);
  if (!S0 || live.length < 2) return { own: own0.slice(), n: 0 };
  const fair = () => {
    const s = pts(), c = cnt(), S = sum(s), C = sum(c); let d = 0, gapOk = true;
    live.forEach((p, k) => { d = Math.max(d, Math.abs(s[k] / S - s0[k] / S0), 0.5 * Math.abs(c[k] / C - c0[k] / C0)); });
    live.forEach((p, a) => live.forEach((q, b) => { if (s0[a] > s0[b] && s[a] <= s[b]) gapOk = false; }));
    return { d, gapOk };
  };
  let best = own.slice(), bestN = 0, n = 0;
  for (let guard = 0; guard < 300; guard++) {
    let cand = null, cd = 1e9;
    own.forEach((o, t) => {
      if (o >= 0) return;
      live.forEach(p => { if (!T[t].j.some(a => own[a] === p)) return; own[t] = p; const f = fair(); own[t] = -1; if (f.d < cd - 1e-12) { cd = f.d; cand = [t, p]; } });
    });
    if (!cand) break;
    own[cand[0]] = cand[1]; n++;
    const f = fair();
    if (f.d <= DQ_FAIR && f.gapOk) { best = own.slice(); bestN = n; }
  }
  return { own: best, n: bestN };
}
function dqFree() { return DQ.S.own.map((o, i) => o < 0 ? i : -1).filter(i => i >= 0); }
function dqScore(S, i) { let s = S.players[i].bonus || 0; S.own.forEach((o, t) => { if (o === i) s += DQ_MAP.t[t].v; }); return s; }
function dqClaimQ() {
  const S = DQ.S;
  S.duel = null;
  if (!dqFree().length || S.round >= S.cfg.claim) {
    const split = dqFairSplit(S.own, dqLive(S), DQ_MAP.t);
    S.own = split.own; S.dist = split.n; S.left = dqFree().length;
    S.cnt = S.cfg.war ? 'war' : 'end'; S.q = null; S.rev = null; S.allowed = []; return dqPhase('rest', dqWarRound);
  }
  S.round++;
  dqAskSoon('claimq', dqLive(S), dqClaimRev, true, false);
}
/* správni si vyberajú podľa rýchlosti; najrýchlejší má dva výbery */
function dqClaimRev() {
  const S = DQ.S, H = DQ.H, res = dqRes();
  const ok = Object.keys(res).map(Number).filter(pi => res[pi].ok).sort((a, b) => res[a].ms - res[b].ms);
  S.picks = (ok.length ? [ok[0]].concat(ok) : []).slice(0, dqFree().length);
  S.rev = { ans: H.ans, res, fire: dqTally(res) };
  dqPhase('claimrev', dqPickNext);
}
function dqPickNext() {
  const S = DQ.S, H = DQ.H, free = dqFree();
  if (!S.picks.length || !free.length) { S.picks = []; return dqClaimQ(); }
  const pi = S.picks[0];
  let al = free.filter(t => DQ_MAP.t[t].j.some(a => S.own[a] === pi));
  /* hráč nemá voľného suseda → smie si vybrať ktorýkoľvek voľný priestor okrem letiska (letisko len ak nič iné neostalo) */
  if (!al.length) { al = free.filter(t => DQ_MAP.t[t].c !== 'AD'); if (!al.length) al = free; }
  S.chooser = pi; S.allowed = al; H.nudged = false;
  dqPhase('pick', dqAuto);
  dqNudge();
}
function dqChoose(terr) {
  const S = DQ.S;
  if (S.phase === 'startpick') { S.own[terr] = S.chooser; S.base[S.chooser] = terr; S.picks.shift(); S.allowed = []; return dqStartPick(); }
  if (S.phase === 'pick') { S.own[terr] = S.chooser; S.picks.shift(); S.allowed = []; return dqPickNext(); }
  const d = S.own[terr];
  S.duel = { a: S.chooser, d, t: terr, base: d >= 0 && S.base[d] === terr, lvl: S.cfg.lv ? dqLvlFor(terr) : 0 }; S.allowed = []; S.q = null; S.rev = null;
  const H = DQ.H, D = S.duel;
  const go = () => dqPhase('duelintro', () => dqAskSoon('duelq', d >= 0 ? [D.a, d] : [D.a], dqDuelRev, false, false, { mods: D.m ? [D.m] : S.cfg.mods, lvl: D.lvl }));
  /* útočník si môže zvoliť okruh otázky (ak to hostiteľ zapol a je z čoho vyberať) */
  if (!S.cfg.pm || S.cfg.mods.length < 2) return go();
  H.modGo = go;
  dqPhase('modpick', dqModAuto);
  const p = S.players[D.a], k = S.k;
  if (p.bot || !p.on) H.bots.push(setTimeout(() => { if (DQ.S && DQ.S.k === k) dqModAuto(); }, 1300));
}
function dqModAuto() {
  const S = DQ.S, H = DQ.H;
  if (!S || S.phase !== 'modpick') return;
  if (DQ.demoHold) { DQ.demoHold.auto = dqModAuto; return; }
  clearTimeout(H.timer);
  /* platí to, čo má útočník práve označené; bez výberu alebo pri NÁHODNE sa žrebuje */
  const ms = S.duel.ms;
  S.duel.m = ms && ms !== '*' && S.cfg.mods.indexOf(ms) >= 0 ? ms : S.cfg.mods[Math.floor(Math.random() * S.cfg.mods.length)];
  S.duel.rnd = !ms || ms === '*';
  H.modGo();
}
/* kolo súbojov: každý hráč je raz na rade, začína ten s najmenším počtom bodov */
function dqWarRound() {
  const S = DQ.S;
  S.q = null; S.rev = null; S.picks = []; S.duel = null;
  if (S.wr >= S.cfg.war || dqLive(S).length < 2) { if (!S.wr && dqLive(S).length > 1) return dqEnd(); S.cnt = 'end'; S.allowed = []; return dqPhase('rest', dqEnd); }
  S.wr++;
  S.wq = dqLive(S).sort((a, b) => dqScore(S, a) - dqScore(S, b));
  dqWarPick();
}
function dqWarPick() {
  const S = DQ.S, H = DQ.H;
  S.wq = S.wq.filter(i => !S.players[i].out);
  if (!S.wq.length || dqLive(S).length < 2) return dqWarRound();
  /* útočiť sa dá len na susedný priestor súpera; susedný voľný priestor sa dá obsadiť */
  const a = S.wq[0];
  let al = S.own.map((o, i) => o !== a && DQ_MAP.t[i].j.some(x => S.own[x] === a) ? i : -1).filter(i => i >= 0);
  if (!al.length) { al = dqFree().filter(t => DQ_MAP.t[t].c !== 'AD'); if (!al.length) al = dqFree(); }
  if (!al.length) { S.wq.shift(); return dqWarPick(); }
  S.chooser = a; S.allowed = al; S.duel = null; S.q = null; S.rev = null; H.nudged = false;
  dqPhase('warpick', dqAuto);
  dqNudge();
}
/* čo znamená výhra útočníka: obyčajný priestor = získa ho; základňa = uberie život, pri poslednom berie všetko */
function dqWinKind() { const S = DQ.S, D = S.duel; return !D.base ? 'took' : (S.lives[D.d] - 1 <= 0 ? 'out' : 'hit'); }
/* Súboj ako v Dobyvateľovi: rýchlosť nerozhoduje. Útočník správne a obranca zle → útočník vyhral.
   Obranca správne a útočník zle → ubránené. Obaja zle → nič sa nemení. Obaja správne → rozstrel tipovacou otázkou. */
function dqDuelRev() {
  const S = DQ.S, H = DQ.H, res = dqRes(), D = S.duel, ra = res[D.a], rd = D.d >= 0 ? res[D.d] : null;
  const tie = !!(rd && ra.ok && rd.ok), win = ra.ok && !tie;
  if (tie) D.tn = 1;
  if (rd && rd.ok && !ra.ok) dqBon(D.d, 'def', 100);
  S.rev = { ans: H.ans, res, win, what: tie ? 'tie' : win ? dqWinKind() : (rd && rd.ok ? 'held' : 'miss') };
  S.rev.fire = dqTally(res);
  dqPhase('duelrev', tie ? () => dqAskSoon('tieq', [D.a, D.d], dqTieRev, false, true, { mods: D.m ? [D.m] : S.cfg.mods }) : () => dqDuelDone(win));
}
function dqTieRev() {
  const S = DQ.S, H = DQ.H, R = dqNumRes(), D = S.duel;
  const ra = R.res[D.a], rd = R.res[D.d];
  /* rozstrel má najviac tri kolá: v 1. a 2. pri rovnako presných tipoch čas nerozhoduje a ide sa ďalej, v 3. rozhodne rýchlosť */
  D.tn = D.tn || 1;
  if (ra.v !== null && rd.v !== null && ra.err === rd.err && D.tn < 3) {
    D.tn++;
    ra.ok = rd.ok = false;
    S.rev = { num: true, ans: H.ans, unit: S.q.unit, res: R.res, order: R.order, win: false, what: 'again' };
    return dqPhase('tierev', () => dqAskSoon('tieq', [D.a, D.d], dqTieRev, false, true, { mods: D.m ? [D.m] : S.cfg.mods }));
  }
  const win = R.order[0] === D.a && R.res[D.a].v !== null, held = !win && R.res[D.d].v !== null;
  if (held) dqBon(D.d, 'def', 100);
  S.rev = { num: true, ans: H.ans, unit: S.q.unit, res: R.res, order: R.order, win, what: win ? dqWinKind() : held ? 'held' : 'miss' };
  dqPhase('tierev', () => dqDuelDone(win));
}
/* zmena na mape sa urobí až po zavretí okna s vyhodnotením, aby ju bolo vidno */
function dqDuelDone(win) {
  const S = DQ.S, D = S.duel;
  if (S.stat && S.stat[D.a]) { const A = S.stat[D.a], Df = D.d >= 0 ? S.stat[D.d] : null; if (Df) { A.at++; Df.df++; if (win) A.aw++; else Df.dw++; } else if (win) A.fr++; }
  if (win) {
    if (D.x2) dqBon(D.a, 'x2', Math.round(DQ_MAP.t[D.t].v * ((D.x2 === true ? 2 : D.x2) - 1)));      // násobič: ×2 = hodnota priestoru ešte raz, ×1,2 a ×1,3 = jej časť
    if (!D.base) S.own[D.t] = D.a;
    else if (--S.lives[D.d] <= 0) { S.own = S.own.map(o => o === D.d ? D.a : o); S.players[D.d].out = true; S.base[D.d] = -1; S.outs.push(D.d); }
  }
  S.wq.shift();
  dqWarPick();
}
/* ---------- body do rebríčka za hru (v4.4) ----------
   body = 500 × miesto × výkon × hráči × dĺžka × okruhy, najmenej 5.
   miesto: 1. = 1 · 2. = 0,5 · 3. = 0,25 · 4. = 0,12 · 5. = 0,06 · 6. = 0,03
   výkon:  0,5 + 0,5 × (moje body v hre / body víťaza) — tesné druhé miesto je viac než vzdialené
   hráči:  podľa počtu ľudí: 1 (len proti počítačom) = 0,1 · 2 = 0,6 · 3 = 0,8 · 4 = 1 · 5 = 1,15 · 6 = 1,3; každý počítač +0,03
   dĺžka:  (kolá obsadzovania + kolá súbojov) / 10, najmenej 0,4 a najviac 1,6
   okruhy: 0,6 + 0,4 × (zapnuté sady / všetky sady)
   Vzorová hra — štyria ľudia, 5 + 5 kôl, všetky okruhy — dáva víťazovi 500 bodov. */
const DQ_LG = { base: 500, place: [1, 0.5, 0.25, 0.12, 0.06, 0.03], humans: [0, 0.1, 0.6, 0.8, 1, 1.15, 1.3] };
function dqLeagueF(S) {
  const all = S.players.length, h = S.players.filter(p => !p.bot).length, R = (S.cfg.claim || 0) + (S.cfg.war || 0), m = S.cfg.mods.length;
  return { h, bots: all - h, R, m, pl: +(DQ_LG.humans[Math.min(6, h)] + 0.03 * (all - h)).toFixed(2), len: +Math.max(0.4, Math.min(1.6, R / 10)).toFixed(2), top: +(0.6 + 0.4 * Math.min(1, m / DQ_QS.length)).toFixed(2) };
}
function dqLeaguePts(S, pi) {
  const F = dqLeagueF(S), r = S.rank ? S.rank.indexOf(pi) : 0, top = Math.max(1, ...S.players.map((p, i) => dqScore(S, i)));
  const place = DQ_LG.place[r] || 0.03, perf = +(0.5 + 0.5 * dqScore(S, pi) / top).toFixed(2);
  return { F, place, perf, pts: S.cfg.demo ? 0 : Math.max(5, Math.round(DQ_LG.base * place * perf * F.pl * F.len * F.top)) };
}
function dqEnd() {
  const S = DQ.S, H = DQ.H;
  clearTimeout(H.timer);
  /* vyradení sú za tými, čo dohrali; medzi nimi je vyššie ten, kto vypadol neskôr */
  S.rank = S.players.map((p, i) => i).sort((a, b) => (S.players[a].out ? 1 : 0) - (S.players[b].out ? 1 : 0) || (S.players[a].out ? S.outs.indexOf(b) - S.outs.indexOf(a) : dqScore(S, b) - dqScore(S, a)));
  S.league = S.players.map((p, i) => dqLeaguePts(S, i).pts);
  S.phase = 'end'; S.k++; S.q = null; S.duel = null; S.allowed = []; S.tot = 0; H.deadline = 0;
  dqCast();
}

/* ---------- kreslenie ---------- */
function dqTerrInfo(t, S) {
  const o = DQ_MAP.t[t], own = S && S.own[t] >= 0 ? S.players[S.own[t]] : null;
  const lim = o.lo || o.up ? ' · ' + (o.lo || '?') + ' – ' + (o.up || '?') : '';
  return `<b>${dqEsc(o.k)}</b><span>${dqEsc(o.c === 'AD' ? 'letisko ' + o.n : o.n)}${o.cl ? ' · trieda ' + dqEsc(o.cl) : ''}${dqEsc(lim)}</span><em>${o.v} b.</em>${own ? `<i style="background:${dqC(S.own[t])}"></i><small>${dqEsc(own.nick)}</small>` : '<small>voľné</small>'}`;
}
/* ---------- ukážka hry (v4.16): prehrávač piatich scén na skutočnej mape, farby a pohyb ako v hre ---------- */
function dqReelPlan() {
  if (DQ.reel) return DQ.reel;
  const T = DQ_MAPS.s.t, nb = i => Array.isArray(T[i].j) ? T[i].j : [], own = T.map(() => -1), at = T.map(() => 0);
  const ad = T.map((o, i) => o.c === 'AD' ? i : -1).filter(i => i >= 0), bases = [ad.find(i => /BRATISLAVA/.test(T[i].n)), ad.find(i => /KOŠICE/.test(T[i].n)), ad.find(i => /POPRAD/.test(T[i].n))].map((b, k) => b == null ? ad[k] : b);
  bases.forEach((b, p) => { own[b] = p; at[b] = 0.6 + p * 0.45; });
  let t = 2.6;
  for (let k = 0; k < T.length * 2 && own.indexOf(-1) >= 0; k++) {
    const p = k % 3, mine = own.map((o, i) => o === p ? i : -1).filter(i => i >= 0);
    let c = []; mine.forEach(i => nb(i).forEach(j => { if (own[j] < 0 && T[j].c !== 'AD' && c.indexOf(j) < 0) c.push(j); }));
    if (!c.length) c = own.map((o, i) => o < 0 && T[i].c !== 'AD' ? i : -1).filter(i => i >= 0);
    if (!c.length) c = own.map((o, i) => o < 0 ? i : -1).filter(i => i >= 0);
    if (!c.length) break;
    own[c[0]] = p; at[c[0]] = t; t += 0.42;
  }
  /* súboj: prvý priestor hráča 2, ktorý susedí s hráčom 1 */
  let duel = -1; for (let i = 0; i < T.length; i++) if (own[i] === 1 && T[i].c !== 'AD' && nb(i).some(j => own[j] === 0) && (duel < 0 || +T[i].v > +T[duel].v)) duel = i;
  return DQ.reel = { own, at, duel, bases };
}
const RL = { s: 0, t: [], dur: [4600, 6200, 5800, 6400, 5000, 7600], col: ['#e63946', '#3a86ff', '#ffbe0b'], nick: ['DENZY', 'MAJA', 'TOMÁŠ'], ico: ['✈', '🚁', '🚀'],
  tab: ['ŠTART', 'OTÁZKA', 'OBSADZOVANIE', 'SÚBOJ', 'VÝSLEDKY', 'REBRÍČEK'],
  cap: ['Každý hráč začína na jednom letisku.', 'Všetci dostanú tú istú otázku. Rozhoduje správnosť a rýchlosť.', 'Kto otázku vyhrá, berie si priestor pri svojom území.', 'Keď je mapa plná, útočíš na susedov — kto prehrá, o priestor príde.', 'Vyhráva, kto má na konci najviac bodov.', 'Body z hry ti pribudnú v rebríčku — a prví traja v lige na konci mesiaca postupujú.'] };
function dqReelHTML() {
  const M = DQ_MAPS.s, T = M.t, P = dqReelPlan(), d = o => o.c === 'G' ? o.cp : o.d;
  const dt = P.duel >= 0 ? T[P.duel] : null;
  return `<div class="rl" id="dq-rl" data-s="0">
      <div class="rl-tabs">${RL.tab.map((t, i) => `<button data-rl="${i}"><i><em></em></i><span><b>${i + 1}</b>${t}</span></button>`).join('')}</div>
      <div class="rl-stage">
        <svg class="rl-map" viewBox="0 0 ${M.w} ${M.h}" aria-hidden="true"><defs><clipPath id="rl-clip"><path d="${M.border}"/></clipPath></defs><path d="${M.border}" class="rl-land"/>
          <g class="rl-terr" clip-path="url(#rl-clip)">${T.map((o, i) => o.c === 'G' && d(o) ? `<path data-t="${i}" d="${d(o)}"/>` : '').join('')}${T.map((o, i) => o.c !== 'G' && o.c !== 'AD' && d(o) ? `<path data-t="${i}" d="${d(o)}"/>` : '').join('')}</g>
          ${dt ? `<circle class="rl-ring" cx="${dt.x}" cy="${dt.y}" r="46"/><circle class="rl-ring r2" cx="${dt.x}" cy="${dt.y}" r="46"/>` : ''}
          ${P.bases.map((b, p) => `<g class="rl-base" data-b="${p}" transform="translate(${T[b].x},${T[b].y})"><circle r="30" fill="${RL.col[p]}" opacity="0.28"/><circle r="17" fill="${RL.col[p]}" stroke="#fff" stroke-width="4"/><text y="7" text-anchor="middle" font-size="19">${RL.ico[p]}</text></g>`).join('')}
          <path d="${M.border}" class="rl-edge"/></svg>
        <div class="rl-hud">${RL.nick.map((n, p) => `<span style="--c:${RL.col[p]}"><i>${RL.ico[p]}</i>${n}<b data-sc="${p}">0</b></span>`).join('')}</div>
        <div class="rl-q"><div class="rl-qtop"><small>OKRUH · METEOROLÓGIA</small><u>15</u></div><div class="rl-bar"><i></i></div><b>Ktorý oblak prináša búrky?</b>
          <div class="rl-opts"><span>Cirrus</span><span class="ok">Cumulonimbus</span><span>Stratus</span><span>Altocumulus</span></div>
          <div class="rl-who"><em style="--c:${RL.col[0]}">✈ 2,1 s ✓</em><em style="--c:${RL.col[1]}">🚁 3,4 s ✓</em><em style="--c:${RL.col[2]}" class="no">🚀 ✗</em></div></div>
        <div class="rl-vs"><small>SÚBOJ O ${dt ? dqEsc(String(dt.k || dt.n).toUpperCase()) : 'PRIESTOR'} · ${dt ? dt.v : 300} b.</small><div><span style="--c:${RL.col[0]}"><i>✈</i>DENZY</span><u>⚔</u><span style="--c:${RL.col[1]}"><i>🚁</i>MAJA</span></div><em>útočník odpovedal rýchlejšie</em></div>
        <div class="rl-plus" ${dt ? `style="left:${(dt.x / M.w * 100).toFixed(1)}%;top:${(dt.y / M.h * 100).toFixed(1)}%"` : ''}>+${dt ? dt.v : 300}</div>
        <div class="rl-end"><div class="rl-pod"><span class="p2"><i></i><b>2</b></span><span class="p1"><i></i><b>1</b></span><span class="p3"><i></i><b>3</b></span></div><em id="dq-rl-win"></em></div>
        <div class="rl-conf">${Array.from({ length: 18 }, (x, i) => `<i style="--x:${(i * 37) % 100}%;--c:${['#e63946', '#3a86ff', '#ffbe0b', '#3fe39a', '#ff7ab6'][i % 5]};--dl:${(i % 6) * 0.12}s;--r:${(i * 53) % 360}deg"></i>`).join('')}</div>
        <div class="rl-rank"><div class="rl-rk-h"><small>REBRÍČEK · LIGA BRONZ</small><b id="dq-rl-add">+412</b></div>
          <div class="rl-rk-l">${[['MAJA', '🚁', 1840, '#3a86ff'], ['PYTY', '🛸', 1620, '#b45cff'], ['TOMÁŠ', '🚀', 1510, '#ffbe0b'], ['DENZY', '✈', 1390, '#e63946'], ['EVA', '🎈', 1180, '#1fd6d6']].map((r, i) => `<div class="rl-rk-r${r[0] === 'DENZY' ? ' me' : ''}" data-rk="${r[0]}" data-p="${r[2]}" style="--i:${i};--c:${r[3]}"><u></u><i>${r[1]}</i><span>${r[0]}</span><em>LVL ${[9, 8, 8, 7, 6][i]}</em><b>${String(r[2]).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}</b></div>`).join('')}</div>
          <div class="rl-rk-up"><i>▲</i><span><b>POSTUP DO LIGY STRIEBRO</b>prví traja v lige idú na konci mesiaca vyššie</span></div></div>
        <div class="rl-cap"><b id="dq-rl-n">1</b><span id="dq-rl-cap">${RL.cap[0]}</span></div>
      </div>
    </div>`;
}
function rlStop() { RL.t.forEach(clearTimeout); RL.t = []; }
function rlGo(s) {
  const root = document.getElementById('dq-rl'); rlStop(); if (!root) return;
  const P = dqReelPlan(), T = DQ_MAPS.s.t, M = DQ_MAPS.s, own = T.map(() => -1), GREY = '#0a0c0b';
  const order = T.map((o, i) => i).filter(i => P.own[i] >= 0 && P.bases.indexOf(i) < 0).sort((x, y) => P.at[x] - P.at[y]);
  const later = (ms, fn) => RL.t.push(setTimeout(() => { if (document.getElementById('dq-rl') === root) fn(); }, ms));
  const paint = () => {
    root.querySelectorAll('[data-t]').forEach(p => { const o = own[+p.dataset.t]; p.style.fill = o >= 0 ? RL.col[o] : GREY; });
    root.querySelectorAll('[data-b]').forEach(g => { g.classList.toggle('on', own[P.bases[+g.dataset.b]] >= 0); });
    root.querySelectorAll('[data-sc]').forEach(b => { const p = +b.dataset.sc; b.textContent = String(own.reduce((a, o, i) => a + (o === p ? +T[i].v || 0 : 0), 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); });
  };
  RL.s = s; root.dataset.s = s; root.classList.remove('won', 'rk-up', 'rk-add'); root.style.setProperty('--d', RL.dur[s] + 'ms');
  root.querySelectorAll('[data-rl]').forEach((b, i) => { b.classList.remove('on'); b.classList.toggle('done', i < s); });
  void root.offsetWidth; root.querySelectorAll('[data-rl]')[s].classList.add('on');
  document.getElementById('dq-rl-cap').textContent = RL.cap[s]; document.getElementById('dq-rl-n').textContent = s + 1;
  if (s === 0) { paint(); P.bases.forEach((b, p) => later(600 + p * 900, () => { own[b] = p; paint(); })); }
  else {
    P.bases.forEach((b, p) => { own[b] = p; });
    if (s === 2) { paint(); order.forEach((t, k) => later(500 + k * ((RL.dur[2] - 1600) / order.length), () => { own[t] = P.own[t]; paint();
      const st = root.querySelector('.rl-stage'), f = document.createElement('div'); f.className = 'rl-pop'; f.textContent = '+' + T[t].v; f.style.cssText = `left:${(4 + T[t].x / M.w * 92).toFixed(1)}%;top:${(13 + T[t].y / M.h * 74).toFixed(1)}%;--c:${RL.col[P.own[t]]}`; st.appendChild(f); setTimeout(() => f.remove(), 1000);
      const h = root.querySelector('[data-sc="' + P.own[t] + '"]'); if (h) { h.parentNode.classList.remove('bump'); void h.offsetWidth; h.parentNode.classList.add('bump'); } })); }
    else if (s >= 3) { order.forEach(t => { own[t] = P.own[t]; }); if (s >= 4 && P.duel >= 0) own[P.duel] = 0; paint();
      if (s === 5) {   // rebríček: body pribudnú, riadok vystúpi hore, príde postup v lige
        const rows = [...root.querySelectorAll('.rl-rk-r')], me = root.querySelector('.rl-rk-r.me'), nf = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        const place = () => rows.slice().sort((a, b) => +b.dataset.now - +a.dataset.now).forEach((r, i) => { r.style.setProperty('--i', i); r.querySelector('u').textContent = i + 1; r.classList.toggle('top', i < 3); });
        rows.forEach(r => { r.dataset.now = r.dataset.p; r.querySelector('b').textContent = nf(+r.dataset.p); }); place(); root.classList.remove('rk-up', 'rk-add');
        later(900, () => { root.classList.add('rk-add'); const from = +me.dataset.p, add = 412, t0 = Date.now(); const tick = () => { const k = Math.min(1, (Date.now() - t0) / 1500), v = Math.round(from + add * (1 - Math.pow(1 - k, 3))); me.dataset.now = v; me.querySelector('b').textContent = nf(v); place(); if (k < 1 && document.getElementById('dq-rl') === root && RL.s === 5) RL.t.push(setTimeout(tick, 40)); }; tick(); });
        later(3900, () => root.classList.add('rk-up'));
      }
      if (s === 4) {   // stupne víťazov podľa skutočného stavu mapy v ukážke
        const sc = [0, 1, 2].map(p => own.reduce((a, o, i) => a + (o === p ? +T[i].v || 0 : 0), 0)), rk = [0, 1, 2].sort((x, y) => sc[y] - sc[x]);
        ['.p1', '.p2', '.p3'].forEach((c, k) => { const e = root.querySelector('.rl-pod ' + c); e.style.setProperty('--c', RL.col[rk[k]]); e.querySelector('i').textContent = RL.ico[rk[k]]; });
        document.getElementById('dq-rl-win').textContent = RL.nick[rk[0]] + ' vyhráva · body idú do rebríčka';
      } if (s === 3 && P.duel >= 0) later(3700, () => { own[P.duel] = 0; paint(); root.classList.add('won'); }); }
    else paint();
  }
  later(RL.dur[s], () => rlGo((s + 1) % RL.tab.length));
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-rl]'); if (b) rlGo(+b.dataset.rl); });
function dqRulesHTML() {
  return `<div class="dqh-steps">
      <div style="--c:#3a86ff"><i>🛫</i><b>ŠTART</b><span>Tipni číslo a vyber si letisko.</span></div>
      <div style="--c:#12c274"><i>⚡</i><b>OBSADZUJ</b><span>Správna a rýchla odpoveď = nový priestor.</span></div>
      <div style="--c:#e63946"><i>⚔</i><b>ÚTOČ</b><span>Zober susedom, čo majú. Pri zhode rozstrel.</span></div>
      <div style="--c:#e0a800"><i>🏆</i><b>VYHRAJ</b><span>Letisko 500 b., CTR 400, TMA 300, G 100.</span></div>
      <button class="hp-open big" data-hp="conquer">❓ PRAVIDLÁ V OBRÁZKOCH</button>
    </div>`;
}
/* úplný návod — rozbaľovacie kapitoly pod pravidlami */
function dqGuideHTML() {
  const sec = (t, body, open) => `<details class="dq-g"${open ? ' open' : ''}><summary>${t}</summary><div>${body}</div></details>`;
  const sets = DQ_QS.map(x => `<li><b>${x[1]} · ${x[2]}</b> — ${DQ_BANK[x[0]] ? DQ_BANK[x[0]].length + ' otázok' : ({ ac: 'typ lietadla podľa fotky, označenia a kategórie', ap: 'kódy a názvy letísk', px: 'prefixy štátov v kódoch ICAO', cs: 'volacie znaky dopravcov', hd: 'opačné kurzy a zatáčky', co: 'frekvencie susedných stanovíšť' })[x[0]]}</li>`).join('');
  return `<div class="dq-guide">
      <h3>MANUÁL K HRE</h3>
      ${sec('Hra v skratke', `<p>Dobyvateľ je súboj o mapu Slovenska. Mapa je rozdelená na skutočné priestory a každý má hodnotu v bodoch. Kto má na konci najviac bodov, vyhráva.</p>
        <ol>
          <li><b>Štart.</b> Tipovacia otázka (píše sa číslo). Kto je najbližšie, vyberá si domovské letisko ako prvý.</li>
          <li><b>Obsadzovanie.</b> Niekoľko kôl otázok so štyrmi možnosťami. Kto odpovie správne, berie si voľný susedný priestor; najrýchlejší dva.</li>
          <li><b>Rozdelenie.</b> Zvyšné voľné priestory sa rozdelia v pomere bodov.</li>
          <li><b>Súboje.</b> Hráči sa striedajú a útočia na susedov. Odpovedá útočník aj obranca; pri zhode rozhodne rozstrel.</li>
          <li><b>Koniec.</b> Stupne víťazov, rozpis bodov a tvoje chyby na precvičenie. Body do rebríčka závisia od umiestnenia, počtu hráčov, dĺžky hry a počtu okruhov (kapitola 5).</li>
        </ol>
        <p>Najrýchlejšie to pochopíš na úvode karty tlačidlom <b>▶ UKÁZAŤ VZOR HRY</b> — odohráš krátku hru proti počítaču a pri každom kroku ti hra povie, čo sa deje. Podrobnosti sú v kapitolách nižšie.</p>`, true)}
      ${sec('1 · Ako začať', `<ol>
        <li><b>Prezývka.</b> Ak si prihlásený (tlačidlo vpravo hore), hráš pod svojím účtom a body sa ti počítajú. Inak napíš prezývku a hráš ako hosť bez bodov.</li>
        <li><b>Hostiteľ</b> dá VYTVORIŤ MIESTNOSŤ. Dostane kód zo štyroch písmen a pošle ho ostatným.</li>
        <li><b>Ostatní</b> napíšu kód do poľa MÁM KÓD a dajú PRIPOJIŤ SA.</li>
        <li>Hostiteľ nastaví hru (kapitola 6), prípadne pridá počítač tlačidlom + POČÍTAČ, a dá ŠTART. Treba aspoň dvoch hráčov, najviac ich je šesť.</li>
      </ol>`)}
      ${sec('2 · Štart a domovské letisko', `<p>Hra sa začína <b>tipovacou otázkou</b>: napíšeš číslo a kto je najbližšie, vyberá si domovské letisko prvý. Jednotka (kg, NM, min…) je vždy uvedená v otázke aj pri políčku.</p>
        <p>Domovské letisko má <b>tri životy</b> — sú to tri červené bodky na jeho krúžku. Z neho sa rozširuješ ďalej.</p>`)}
      ${sec('3 · Obsadzovanie', `<p>V každom kole dostanú všetci tú istú otázku so štyrmi možnosťami. Kto odpovie správne, vyberie si voľný priestor <b>susediaci</b> s tým, čo už má. Najrýchlejší zo správnych vyberá prvý a berie si dva priestory.</p>
        <p>Po poslednom kole sa zvyšné voľné priestory rozdelia v pomere bodov: podiel žiadneho hráča sa nezmení o viac než 3 % a poradie ostane rovnaké. Každý dostáva len priestory susediace s tým, čo už má. Čo sa takto rozdeliť nedá, ostane voľné a dá sa získať v súbojoch.</p>`)}
      ${sec('4 · Súboje', `<p>V každom kole je každý hráč raz na rade, začína ten, kto má najmenej bodov. Na rade môžeš:</p>
        <ul><li><b>zaútočiť</b> na susedný priestor súpera (je označený mečmi), alebo</li><li><b>obsadiť</b> susedný voľný priestor — vtedy odpovedáš sám.</li></ul>
        <p>Pri útoku odpovedá útočník aj obranca na tú istú otázku. <b>Rýchlosť nerozhoduje:</b></p>
        <ul><li>útočník správne, obranca zle → priestor je dobytý,</li><li>obranca správne, útočník zle → ubránené, obranca dostane +100 bodov,</li><li>obaja zle → nič sa nemení,</li><li>obaja správne → <b>rozstrel</b> tipovacou otázkou, vyhráva presnejší tip. Rozstrely sú najviac tri a sú očíslované: ak v prvom alebo druhom tipnete rovnako presne, ide sa na ďalší; v treťom pri rovnakom tipe vyhráva rýchlejší.</li></ul>
        <p><b>Útok na domovské letisko</b> mu pri výhre uberie jeden život. Pri treťom zásahu hráč vypadáva a všetky jeho priestory berie útočník.</p>`)}
      ${sec('5 · Body a víťaz', `<p>Letisko 500 · CTR 400 · TMA 300 · TRA/TSA 200 · LZR 150 · časť triedy G 100 · ubránenie +100 · každá tretia správna odpoveď v rade +50.</p>
        <p>Vyhráva hráč s najviac bodmi po poslednom kole súbojov, alebo ten, kto ostane na mape sám. Na konci hry je tabuľka, z čoho kto body získal.</p>
        <p><b>Body do rebríčka</b> sa počítajú zo šiestich vecí: <b>500 × miesto × výkon × hráči × dĺžka × okruhy</b> (najmenej 5).</p>
        <ul><li><b>miesto:</b> 1. = 1 · 2. = 0,5 · 3. = 0,25 · 4. = 0,12 · 5. = 0,06 · 6. = 0,03,</li>
          <li><b>výkon:</b> 0,5 až 1 podľa toho, koľko bodov máš oproti víťazovi — tesné druhé miesto je viac než vzdialené,</li>
          <li><b>hráči:</b> len proti počítačom 0,1 · dvaja ľudia 0,6 · traja 0,8 · štyria 1 · piati 1,15 · šiesti 1,3 (každý počítač navyše +0,03),</li>
          <li><b>dĺžka:</b> kolá obsadzovania + kolá súbojov, delené desiatimi (0,4 až 1,6) — rýchla hra 3 + 3 dáva 0,6,</li>
          <li><b>okruhy:</b> 0,6 pri jednej sade až 1 pri všetkých.</li></ul>
        <p>Príklady pre víťaza: štyria ľudia, 5 + 5 kôl, všetky okruhy = <b>500</b> · šiesti ľudia, 10 + 10 kôl = <b>1 040</b> · dvaja ľudia v rýchlej hre = <b>180</b> · sám proti dvom počítačom = <b>80</b>. Výhry a počet hier sa v profile počítajú len z hier aspoň dvoch ľudí.</p>`)}
      ${sec('6 · Nastavenia hry (hostiteľ)', `<ul>
        <li><b>HRÁČI</b> — koľko miest má miestnosť (2 až 6).</li>
        <li><b>MAPA</b> — malá (${DQ_MAPS.s.t.length} priestorov), stredná (${DQ_MAPS.m.t.length}) alebo veľká (${DQ_MAPS.l.t.length}); pri voľbe PODĽA POČTU HRÁČOV sa vyberie sama.</li>
        <li><b>ČAS NA OTÁZKU</b> — 10, 15, 20 alebo 30 sekúnd.</li>
        <li><b>KOLÁ OBSADZOVANIA</b> a <b>KOLÁ SÚBOJOV</b> — dĺžka oboch častí hry; súboje sa dajú aj vypnúť.</li>
        <li><b>TEMPO · RÝCHLA HRA</b> — 3 kolá obsadzovania, 3 kolá súbojov, 10 sekúnd na otázku a kratšie prestávky. Vhodné na prestávku.</li>
        <li><b>OBŤAŽNOSŤ PODĽA ÚZEMIA</b> — čím cennejší priestor, tým ťažšia otázka pri útoku: do 150 b. ľahká, TMA a TRA/TSA stredná, CTR ťažká, letisko z najťažších a s kratším časom. Úroveň otázky je odhad podľa jej podoby.</li>
        <li><b>ÚTOČNÍK VOLÍ OKRUH</b> — útočník si pred otázkou vyberie okruh (25 sekúnd, výber sa dá meniť, potvrdzuje sa tlačidlom). Tlačidlo NÁHODNE nechá okruh na žreb.</li>
        <li><b>ŽOLÍKY</b> — či má každý hráč tri žolíky (kapitola 12).</li>
        <li><b>OTÁZKY Z</b> — z ktorých modulov a okruhov sa otázky berú.</li>
        <li><b>VLASTNÉ OTÁZKY</b> — hostiteľ môže nahrať vlastný súbor (.txt, .csv, .xlsx, .docx): otázka, správna odpoveď a tri nesprávne.</li>
      </ul>`)}
      ${sec('7 · Z čoho sú otázky', `<ul>${sets}</ul>`)}
      ${sec('8 · Ovládanie mapy', `<ul>
        <li><b>Počítač:</b> na priestor stačí kliknúť. Ukázaním myšou uvidíš dole jeho kód, hranice, body a majiteľa.</li>
        <li><b>Telefón:</b> ťukni na priestor alebo ho vyber zo zoznamu dole a potvrď tlačidlom.</li>
        <li><b>Priblíženie:</b> dvojité ťuknutie, podržanie prsta, koliesko myši alebo tlačidlá + a −; ťahaním sa mapa posúva, ⤢ ju vráti celú.</li>
        <li>Sivé priestory a priestory s mečmi sú tie, ktoré si práve môžeš vybrať.</li>
      </ul>`)}
      ${sec('9 · Po hre: chyby a hlásenie otázok', `<p>Na konci partie nájdeš tlačidlo <b>MOJE CHYBY</b>: zoznam otázok, ktoré si pokazil, so správnou odpoveďou. <b>PRECVIČIŤ ZNOVA</b> ti ich dáva dookola, kým každú nezodpovieš správne.</p>
        <p>Ak je otázka alebo odpoveď chybná, daj <b>⚑ NAHLÁSIŤ OTÁZKU</b> — pri vyhodnotení otázky alebo v zozname chýb. Hlásenie sa uloží autorovi stránky.</p>`)}
      ${sec('10 · Rebríček', `<p>V karte REBRÍČEK je celkové poradie, poradie v Dobyvateľovi (body, hry, výhry) a <b>OKRUHY TEÓRIE</b> — koľko otázok z každého predmetu si v Dobyvateľovi zodpovedal a s akou úspešnosťou. Hra proti počítaču sa nepočíta.</p>`)}
      ${sec('11 · Keď vypadne spojenie', `<p><b>Hráč:</b> ak ti spadne internet alebo obnovíš stránku, na úvode karty DOBYVATEĽ sa ukáže <b>VRÁTIŤ SA DO HRY</b>. Kým si preč, tvoje ťahy robí hra za teba. Vrátiť sa dá do 20 minút.</p>
        <p><b>Hostiteľ:</b> hra beží v jeho prehliadači. Keď mu zhasne telefón alebo obnoví stránku, ostatní uvidia pás <b>HOSTITEĽ JE MIMO HRY</b> a hra na neho tri minúty počká. Hostiteľ na úvode karty DOBYVATEĽ nájde <b>OBNOVIŤ HRU</b> — hra pokračuje od fázy, v ktorej sa prerušila (rozbehnutá otázka dostane čas nanovo). Obnoviť sa dá do 30 minút.</p>
        <p>Počas hry stránka drží obrazovku telefónu zapnutú, ak to prehliadač dovolí. Hostiteľ by aj tak nemal prepínať do inej aplikácie — telefón vtedy stránku uspí a hra všetkým stojí.</p>
        <p>Ak hostiteľ odíde tlačidlom ODÍSŤ, miestnosť sa končí všetkým.</p>`)}
      ${sec('12 · Žolíky, série a reakcie', `<p><b>Žolíky</b> má každý hráč tri a každý sa dá použiť raz za hru. Sú pod otázkou, kým neodpovieš:</p>
        <ul><li><b>½ 50:50</b> — zmiznú ti dve nesprávne odpovede (len otázky s možnosťami),</li><li><b>⏱ +10 s</b> — desať sekúnd navyše; čas sa predĺži všetkým, ktorí práve odpovedajú,</li><li><b>×2 BODY</b> — len keď útočíš: ak útok vyhráš, hodnota priestoru sa ti pripíše ešte raz.</li></ul>
        <p>Ostatní vidia, že si žolíka použil. Hostiteľ môže žolíky vypnúť v nastavení hry.</p>
        <p><b>Séria:</b> pri otázkach s možnosťami sa počítajú správne odpovede za sebou. Od troch v rade máš pri mene plamienok 🔥 a za každú tretiu dostaneš +50 bodov. Nesprávna odpoveď sériu vynuluje.</p>
        <p><b>Reakcie:</b> tlačidlom 😀 hore vpravo pošleš ostatným jeden zo štyroch smajlíkov.</p>`)}
      ${sec('13 · Vzhľad a animácie', `<p>V miestnosti pred štartom si vyberieš <b>farbu</b> a <b>lietadlo</b>; farbu, ktorú už niekto má, si zvoliť nedá. Voľba sa pamätá aj nabudúce.</p>
        <p>Počas hry sa kamera sama presunie na miesto súboja a potom späť. Keď si mapu priblížiš alebo posunieš sám, kamera ti do toho nezasahuje, kým nedáš ⤢.</p>
        <p>Pri vyhodnotení otázky je najprv vidno, kto čo zvolil, a správna odpoveď sa ukáže až o chvíľu. Pri tipovacej otázke tipy priletia na číselnú os a správna hodnota sa odkryje posledná.</p>
        <p><b>Menej animácií:</b> tlačidlo ✨ počas hry (alebo ANIMÁCIE v miestnosti) vypne lety, otrasy, kameru aj čakanie pri vyhodnotení. Hodí sa na slabší telefón.</p>`)}
    </div>`;
}
function dqCfgHTML(S) {
  const c = S.cfg, host = DQ.host;
  const row = (lab, key, arr, fmt) => `<div class="dq-cfg-row"><span>${lab}</span><div>${arr.map(v => `<button class="rk-chip${c[key] === v ? ' on' : ''}" data-cfg="${key}" data-val="${v}" ${host ? '' : 'disabled'}>${fmt(v)}</button>`).join('')}</div></div>`;
  return `<div class="dq-cfg">
      <div class="dq-cfg-t">NASTAVENIE HRY${host ? '' : ' <em>— mení ho len hostiteľ</em>'}</div>
      ${row('HRÁČI', 'max', DQ_OPT.max, v => v)}
      ${row('MAPA', 'map', DQ_OPT.map, v => ({ auto: 'PODĽA POČTU HRÁČOV', s: 'MALÁ · ' + DQ_MAPS.s.t.length, m: 'STREDNÁ · ' + DQ_MAPS.m.t.length, l: 'VEĽKÁ · ' + DQ_MAPS.l.t.length })[v])}
      ${row('ČAS NA OTÁZKU', 'time', DQ_OPT.time, v => v + ' s')}
      ${row('KOLÁ OBSADZOVANIA', 'claim', DQ_OPT.claim, v => v)}
      ${row('KOLÁ SÚBOJOV', 'war', DQ_OPT.war, v => v || 'BEZ')}
      ${row('TEMPO', 'fast', DQ_OPT.fast, v => v ? 'RÝCHLA HRA · ASI 5 MIN' : 'BEŽNÉ')}
      ${row('OBŤAŽNOSŤ PODĽA ÚZEMIA', 'lv', DQ_OPT.lv, v => v ? 'ÁNO' : 'NIE')}
      ${row('ÚTOČNÍK VOLÍ OKRUH', 'pm', DQ_OPT.pm, v => v ? 'ÁNO' : 'NIE')}
      ${row('ŽOLÍKY', 'jk', DQ_OPT.jk, v => v ? 'ÁNO' : 'NIE')}
      ${c.jk ? row('BOOSTY ZA ÚROVNE', 'pk', DQ_OPT.pk, v => v ? 'ÁNO' : 'NIE') : ''}
      <div class="dq-cfg-row"><span>OTÁZKY Z</span><div>${DQ_QS.map(x => `<button class="rk-chip${c.mods.indexOf(x[0]) >= 0 ? ' on' : ''}" data-cfg="mods" data-val="${x[0]}" ${host ? '' : 'disabled'}>${x[1]} · ${x[2]}</button>`).join('')}</div></div>
      ${dqcRowHTML(S)}
      <div class="dq-cfg-hint">${c.fast ? 'Rýchla hra: 3 kolá obsadzovania, 3 kolá súbojov, 10 s na otázku a kratšie prestávky. ' : ''}${c.lv ? 'Obťažnosť: pri útoku na priestor do 150 b. je otázka ľahká, pri TMA a TRA/TSA stredná, pri CTR ťažká a pri letisku z najťažších, s kratším časom na odpoveď. ' : ''}${c.pm ? 'Útočník si pred otázkou vyberie okruh, z ktorého padne. ' : ''}${c.jk ? 'Žolíky: každý hráč má raz za hru 50:50, +10 sekúnd a dvojité body. ' + (c.pk ? 'Boosty za úrovne: prihlásení hráči dostanú k žolíkom malé výhody podľa svojej úrovne — ' + DQ_PERK.map(x => 'od ' + x[0] + '. ' + x[2]).join(', ') + '. Každý raz za hru.' : '') : ''}</div>
    </div>`;
}
function dqMapSVG(S, me) {
  const M = DQ_MAP, mine = dqPicking(S) && S.chooser === me, v = DQ.view || dqBaseView(), now = Date.now();
  const fx = (DQ.fx || []).filter(f => now - f.t0 < DQ_FXMS);
  let h = `<svg class="dq-map dq-s-${DQ_STYLE}" id="dq-svg" viewBox="${v.x} ${v.y} ${v.w} ${v.h}" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="dq-clip"><path d="${M.border}"/></clipPath>
    ${M.t.map((o, i) => o.c === 'G' ? `<clipPath id="dq-g${i}"><path d="${o.cp}"/></clipPath>` : '').join('')}
    <pattern id="dq-hB" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#2a0d10"/><line x1="0" y1="0" x2="0" y2="7" stroke="#7a2229" stroke-width="2.2"/></pattern>
    <pattern id="dq-hC" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#0a1a13"/><line x1="0" y1="0" x2="0" y2="7" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.6"/></pattern></defs>
    <g clip-path="url(#dq-clip)">`;
  M.t.forEach((o, i) => {
    const f = fx.find(x => x.t === i), ow = f ? f.was : S.own[i], can = S.allowed.indexOf(i) >= 0, tgt = S.duel && S.duel.t === i, d = o.c === 'G' ? M.g[o.s] : o.d;
    h += `<path d="${d}"${o.c === 'G' ? ` clip-path="url(#dq-g${i})"` : ''} data-t="${i}" class="dq-cell c-${o.c}${ow >= 0 ? ' own' : ''}${can ? ' can' : ''}${can && mine ? ' click' : ''}${tgt ? ' tgt' : ''}${DQ.sel === i && mine ? ' sel' : ''}"${ow >= 0 ? ` style="--pc:${dqC(ow)}"` : ''}/>`;
    (o.sl || []).forEach(l => { h += `<path d="M${l[0]},${l[1]}L${l[2]},${l[3]}" clip-path="url(#dq-g${i})" class="dq-gline"/>`; });
    if (f) {
      /* kruh v novej farbe rastie z bodu kliknutia a je orezaný tvarom priestoru */
      const nums = (o.c === 'G' ? o.cp : o.d).match(/-?\d+\.?\d*/g).map(Number); let R = 0;
      for (let n = 0; n + 1 < nums.length; n += 2) R = Math.max(R, Math.hypot(nums[n] - f.x, nums[n + 1] - f.y));
      const circ = (fill, dl) => `<circle class="dq-spread" cx="${f.x}" cy="${f.y}" r="${(R + 3).toFixed(1)}" fill="${fill}" clip-path="url(#dq-fx${i})" style="animation-delay:${f.t0 + dl - now}ms"/>`;
      const c = (f.grey ? circ('#4a4a55', 0) : '') + circ(f.col, f.grey ? 450 : 0);
      h += `<clipPath id="dq-fx${i}"><path d="${d}"/></clipPath>` + (o.c === 'G' ? `<g clip-path="url(#dq-g${i})">${c}</g>` : c);
    }
  });
  h += `</g><path d="${M.border}" class="dq-out"/>`;
  M.t.forEach((o, i) => {
    const ow = S.own[i] >= 0 ? ' own' : '';
    if (o.c === 'AD') h += `<text class="dq-lab ad${ow}" x="${o.x}" y="${o.y + 2.3}">${o.b}</text>`;
    else if (o.c === 'G') { const fs = Math.max(5.5, Math.min(13, o.r * 0.3)); h += `<text class="dq-lab g${ow}" x="${o.x}" y="${o.y}" font-size="${fs.toFixed(1)}"><tspan x="${o.x}" dy="-0.25em">${o.k}</tspan><tspan x="${o.x}" dy="1.15em" class="p">${o.v}</tspan></text>`; }
    else if (o.r >= 6.5) {
      const fs = Math.max(4.6, Math.min(11, o.r * 0.42)), three = o.r >= 11;
      h += `<text class="dq-lab${ow}" x="${o.x}" y="${o.y}" font-size="${fs.toFixed(1)}"><tspan x="${o.x}" dy="${three ? '-0.75em' : '-0.15em'}" class="t">${o.a}</tspan><tspan x="${o.x}" dy="1.05em">${o.b}</tspan>${three ? `<tspan x="${o.x}" dy="1.1em" class="p">${o.v}</tspan>` : ''}</text>`;
    }
  });
  /* domovské letiská: zlatý krúžok a životy */
  (S.base || []).forEach((t, pi) => {
    if (t < 0 || !M.t[t] || S.players[pi].out) return;
    const o = M.t[t], R = o.r + 3.4, L = Math.max(0, S.lives[pi]);
    h += `<circle class="dq-basering" cx="${o.x}" cy="${o.y}" r="${R.toFixed(1)}"/>`;
    for (let n = 0; n < L; n++) { const a = (-90 + (n - (L - 1) / 2) * 36) * Math.PI / 180; h += `<circle class="dq-life" cx="${(o.x + Math.cos(a) * R).toFixed(1)}" cy="${(o.y + Math.sin(a) * R).toFixed(1)}" r="2.7"/>`; }
  });
  /* meče: malé na súperových priestoroch, na ktoré sa dá zaútočiť, veľké na tom, o ktorý sa práve bojuje */
  const sword = (o, cls, col) => {
    /* malý meč nesmie zakryť popisok: pri letisku ide vedľa krúžku, inak nad popisok */
    let dx = 0, dy = 0;
    if (cls === 'sm') { if (o.c === 'AD') { dx = 10; dy = -10; } else if (o.c === 'G') dy = -(Math.max(5.5, Math.min(13, o.r * 0.3)) * 1.2 + 11); else { const fs = Math.max(4.6, Math.min(11, o.r * 0.42)); dy = -(fs * (o.r >= 11 ? 2.3 : 1.5) + 10); } }
    return `<g transform="translate(${(o.x + dx).toFixed(1)},${(o.y + dy).toFixed(1)})"><g class="dq-swords ${cls}" style="--pc:${col}"><circle r="${cls === 'big' ? 19 : 8.5}"/><text y="${cls === 'big' ? 7 : 3.4}">⚔</text></g></g>`;
  };
  if (S.phase === 'warpick') S.allowed.forEach(t => { if (S.own[t] >= 0) h += sword(M.t[t], 'sm', dqC(S.chooser)); });
  if (dqDuelOn(S)) h += sword(M.t[S.duel.t], 'big', dqC(S.duel.a));
  return h + '</svg>';
}
function dqLegendHTML() {
  return `<div class="dq-legend"><span>BODY ZA PRIESTOR:</span><span>◯ LETISKO <b>500</b></span><span>CTR <b>400</b></span><span>TMA <b>300</b></span><span>TRA / TSA <b>200</b></span><span>LZR <b>150</b></span><span>G WEST / EAST (každá časť) <b>100</b></span><span class="k">žlté číslo na mape = body · farba = hráč, ktorému priestor patrí · ⚔ = dá sa zaútočiť</span></div>`;
}
function dqBaseView() { return { x: -8, y: -8, w: DQ_MAP.w + 16, h: Math.round(DQ_MAP.h) + 16 }; }
/* priblíženie mapy: f < 1 približuje; bod (cx, cy) v súradniciach mapy ostane na mieste */
function dqZoom(f, cx, cy) {
  dqCamStop();
  const B = dqBaseView(), v = DQ.view || B;
  const nw = Math.max(B.w / 6, Math.min(B.w, v.w * f)), nh = nw * B.h / B.w;
  if (cx == null) { cx = v.x + v.w / 2; cy = v.y + v.h / 2; }
  let x = cx - (cx - v.x) * nw / v.w, y = cy - (cy - v.y) * nh / v.h;
  x = Math.max(B.x, Math.min(B.x + B.w - nw, x)); y = Math.max(B.y, Math.min(B.y + B.h - nh, y));
  DQ.view = nw >= B.w - 0.5 ? null : { x, y, w: nw, h: nh };
  dqViewApply();
}
function dqViewApply() { const v = DQ.view || dqBaseView(), vb = `${v.x} ${v.y} ${v.w} ${v.h}`; ['dq-svg', 'dq-fxs'].forEach(id => { const e = document.getElementById(id); if (e) e.setAttribute('viewBox', vb); }); }
function dqChipsHTML(S, me) {
  return S.players.map((p, i) => {
    const active = (dqPicking(S) && S.chooser === i) || (S.duel && (S.duel.a === i || S.duel.d === i) && S.phase !== 'warpick');
    return `<div class="dq-chip${active ? ' act' : ''}${p.on ? '' : ' off'}" style="--c:${dqC(i)}">${dqFace(S, i)}<span>${dqEsc(p.nick)}${i === me ? ' <em>ty</em>' : ''}${p.on ? '' : ' <em>odpojený</em>'}</span>${p.st >= 3 && !p.out ? `<s title="séria správnych odpovedí">🔥${p.st}</s>` : ''}${S.base && S.base[i] >= 0 && !p.out ? `<u>${'♥'.repeat(Math.max(0, S.lives[i]))}</u>` : ''}<small>${S.own.filter(o => o === i).length}</small><b>${dqScore(S, i)}</b></div>`.replace('class="dq-chip', p.out ? 'class="dq-chip out' : 'class="dq-chip');
  }).join('');
}
/* fotka k otázke z Wikipédie (rovnaký zdroj ako MOD 01); načíta sa už počas odpočtu */
function dqPhoto(wiki) {
  DQ.imgP = DQ.imgP || {}; DQ.imgU = DQ.imgU || {};
  if (DQ.imgP[wiki]) return DQ.imgP[wiki];
  return DQ.imgP[wiki] = fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + wiki, { headers: { Accept: 'application/json' } })
    .then(r => r.ok ? r.json() : Promise.reject()).then(d => {
      const src = (d.thumbnail && d.thumbnail.source) || (d.originalimage && d.originalimage.source);
      if (!src) throw 0;
      return new Promise(res => { const im = new Image(); im.onload = () => { DQ.imgU[wiki] = src; res(src); }; im.onerror = () => res(''); im.src = src; });
    }).catch(() => '');
}
function dqStageName(S) {
  const p = S.phase === 'rest' || S.phase === 'count' ? (S.cnt || '') : S.phase;
  if (p.indexOf('start') === 0) return 'ŠTART · DOMOVSKÉ LETISKÁ';
  if (p === 'end') return 'KONIEC HRY';
  if (p === 'war') return 'SÚBOJE';
  if (p.indexOf('claim') === 0 || p === 'pick') return `OBSADZOVANIE · KOLO ${S.round} / ${S.cfg.claim}`;
  return `SÚBOJE · KOLO ${S.wr} / ${S.cfg.war}`;
}
function dqDuelOn(S) { return !!S.duel && ['modpick', 'duelintro', 'count', 'duelq', 'duelrev', 'tieq', 'tierev'].indexOf(S.phase) >= 0; }
function dqNumFmt(v, unit) { return v === null || v === undefined ? '—' : String(v).replace('.', ',') + (unit ? ' ' + unit : ''); }
/* text výsledku súboja — do pásu hore aj do okna */
function dqRevText(S, nm) {
  const D = S.duel, R = S.rev, tn = dqEsc(DQ_MAP.t[D.t].k), a = nm(D.a), d = D.d >= 0 ? nm(D.d) : '';
  if (R.what === 'tie') return `Obaja odpovedali správne — rozhodne tipovacia otázka.`;
  if (R.what === 'again') return `Rovnako presné tipy — nasleduje rozstrel ${D.tn} / 3${D.tn === 3 ? ', v ňom rozhodne aj čas' : ''}.`;
  if (R.what === 'took') return `${a} získava ${tn} (+${Math.round(DQ_MAP.t[D.t].v * (D.x2 === true ? 2 : D.x2 || 1))} b.${D.x2 ? ' · žolík ' + dqMulTxt(D.x2) : ''})`;
  if (R.what === 'hit') return `${a} zasiahol domovské letisko ${tn} — hráčovi ${d} ostáva ${S.lives[D.d] - 1} ${S.lives[D.d] - 1 === 1 ? 'život' : 'životy'}`;
  if (R.what === 'out') return `${a} dobyl domovské letisko ${tn} — ${d} vypadáva a všetky jeho priestory berie ${a}`;
  if (R.what === 'held') return `${d} ubránil ${tn} (+100 b.)`;
  return D.d >= 0 ? `Obaja odpovedali nesprávne — ${tn} ostáva hráčovi ${d}` : `${tn} sa získať nepodarilo`;
}
/* terč: sivá šípka v strede je správna odpoveď, farebné šípky sú tipy hráčov — čím bližšie k stredu, tým presnejší tip */
function dqDartsSVG(S) {
  const R = S.rev, who = R.order, errs = who.map(pi => R.res[pi].err).filter(e => e >= 0), mx = Math.max.apply(null, errs.concat([0]));
  const dart = (x, y, col, delay, ang, cls) => {
    const fx = Math.cos(ang) * 150, fy = Math.sin(ang) * 150;
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><g class="dq-dart ${cls}" style="--fx:${fx.toFixed(0)}px;--fy:${fy.toFixed(0)}px;animation-delay:${delay.toFixed(2)}s"><g transform="rotate(${(ang * 180 / Math.PI).toFixed(1)})"><line x1="0" y1="0" x2="26" y2="0" stroke="${col}" stroke-width="4" stroke-linecap="round"/><path d="M26,0 L36,-7 L32,0 L36,7 Z" fill="${col}"/><circle r="4.6" fill="${col}" stroke="#fff" stroke-width="1.6"/></g></g></g>`;
  };
  let h = `<svg class="dq-darts" viewBox="-150 -118 300 236"><circle r="104" fill="#0d0d10" stroke="#fff" stroke-opacity="0.25" stroke-width="2"/>`;
  [[100, '#1b1b20'], [76, '#26262d'], [52, '#1b1b20'], [28, '#26262d'], [9, '#ffd34d']].forEach(r => { h += `<circle r="${r[0]}" fill="${r[1]}" stroke="#fff" stroke-opacity="0.35" stroke-width="1"/>`; });
  h += dart(0, 0, '#9aa0a8', 0.3, -Math.PI / 2, 'ans');
  who.forEach((pi, n) => {
    const r = R.res[pi];
    if (r.v === null) return;
    const ang = -Math.PI / 2 + (n + 0.5) * 2 * Math.PI / Math.max(3, who.length) + 0.5, rad = mx > 0 ? 7 + 90 * Math.sqrt(r.err / mx) : 7;
    h += dart(Math.cos(ang) * rad, Math.sin(ang) * rad, dqC(pi), 1.1 + n * 0.55, ang, r.ok ? 'best' : '');
  });
  return h + '</svg>';
}
/* vyskakovacie okno s otázkou — prekryje mapu len počas otázky a jej vyhodnotenia */
function dqPopHTML(S, me, stage, ctx) {
  const q = S.q, R = S.rev, can = q.who.indexOf(me) >= 0, my = DQ.my, nm = i => dqEsc(S.players[i] ? S.players[i].nick : '?');
  const sec = ms => (ms / 1000).toFixed(1).replace('.', ',') + ' s';
  const sus = dqSus(S), hid = (q.hid && q.hid[me]) || [], J = S.players[me] && S.players[me].jk;
  /* číslo rozstrelu: pri vyhodnotení „ešte raz“ je D.tn už o jedno ďalej */
  const tieOn = (S.phase === 'tieq' || S.phase === 'tierev') && S.duel, tieN = tieOn ? Math.max(1, (S.duel.tn || 1) - (R && R.what === 'again' ? 1 : 0)) : 0;
  if (tieOn) stage = 'ROZSTREL ' + tieN + ' / 3' + (tieN === 3 ? ' · NA ČAS' : '');
  let rib = '';
  if (R) {
    const mine = R.res[me], D = S.duel, k = D ? dqEsc(DQ_MAP.t[D.t].k) : '';
    if ((S.phase === 'duelrev' || S.phase === 'tierev') && D && (me === D.a || me === D.d)) {
      const W = R.what, att = me === D.a;
      rib = W === 'tie' ? ['tie', 'OBAJA SPRÁVNE — ROZSTREL'] : W === 'again' ? ['tie', 'ROVNAKÝ TIP — EŠTE JEDNO KOLO'] : att ? (R.win ? ['win', W === 'out' ? '⚔ DOBYL SI DOMOVSKÉ LETISKO — BERIEŠ VŠETKO' : W === 'hit' ? '⚔ ZÁSAH DO DOMOVSKÉHO LETISKA' : '⚔ DOBYL SI ' + k] : ['lose', 'ÚTOK SA NEPODARIL'])
        : (R.win ? ['lose', W === 'out' ? 'PRIŠIEL SI O DOMOVSKÉ LETISKO — VYPADÁVAŠ' : W === 'hit' ? 'STRÁCAŠ ŽIVOT' : 'PRIŠIEL SI O ' + k] : (W === 'held' ? ['win', '🛡 UBRÁNIL SI ' + k] : ['tie', 'NIKTO NEUHÁDOL — ' + k + ' TI OSTÁVA']));
    } else if (mine && R.num) rib = mine.v === null ? ['lose', '⏱ BEZ ODPOVEDE'] : R.order[0] === me ? ['win', '🎯 NAJBLIŽŠIE — ' + dqNumFmt(mine.v, R.unit)] : ['tie', 'TVOJ TIP ' + dqNumFmt(mine.v, R.unit) + ' · ' + (R.order.indexOf(me) + 1) + '. V PORADÍ'];
    else if (mine) rib = mine.ok ? ['win', '✓ SPRÁVNE'] : ['lose', mine.c < 0 ? '⏱ BEZ ODPOVEDE' : '✗ NESPRÁVNE'];
  }
  if (sus) rib = ['tie', 'VYHODNOCUJEM…'];
  let h = `<div class="dq-pop${R ? ' rev' : ''}${q.num ? ' num' : ''}${rib ? ' r-' + rib[0] : ''}${sus ? ' sus' : ''}">
      ${rib ? `<div class="dq-rib ${rib[0]}">${rib[1]}</div>` : ''}
      <div class="dq-pop-top"><span>${dqEsc(q.mod)}${q.lvl ? ` <i class="dq-lvl l${q.lvl}">${DQ_LVN[q.lvl]}</i>` : ''}</span><span class="dq-pop-stage">${stage}</span><span class="dq-pop-time" id="dq-sec">${R ? '' : Math.ceil(S.tot / 1000)}</span></div>
      <div class="dq-timer"><i class="dq-bar-i"></i></div>
      ${ctx ? `<div class="dq-pop-ctx">${ctx}</div>` : ''}
      ${q.img ? `<div class="dq-pop-img" data-img="${dqEsc(q.img)}">${DQ.imgU && DQ.imgU[q.img] ? `<img src="${dqEsc(DQ.imgU[q.img])}" alt="">` : '<span>načítavam fotku…</span>'}</div>` : `<div class="dq-pop-q${q.prompt.length > 60 ? ' xl' : q.prompt.length > 26 ? ' long' : ''}">${dqEsc(q.prompt)}</div>`}
      <div class="dq-pop-s">${dqEsc(q.sub)}</div>`;
  if (q.num && R) {
    /* vyhodnotenie tipovacej otázky: terč a tabuľka */
    const el = dqLow() ? 99 : (Date.now() - (DQ.susT0 || 0)) / 1000, rows = sus ? R.order.slice().sort((a, b) => a - b) : R.order;
    h += `<div class="dq-numrev">${dqAxisSVG(S, el)}<div class="dq-numtab"><div class="dq-numans">Správna odpoveď <b>${sus ? '?' : dqNumFmt(R.ans, R.unit)}</b></div>
        ${rows.map((pi, n) => { const r = R.res[pi]; return `<div class="dq-numrow${!sus && n === 0 && r.v !== null && R.what !== 'again' ? ' best' : ''}"><b>${sus || r.v === null ? '–' : n + 1 + '.'}</b><i style="background:${dqC(pi)}"></i><span>${nm(pi)}</span><strong>${dqNumFmt(r.v, R.unit)}</strong><small>${r.v === null ? 'bez odpovede' : sus ? '…' : (r.err === 0 ? 'presne' : 'vedľa o ' + dqNumFmt(+r.err.toFixed(3))) + ' · ' + sec(r.ms)}</small></div>`; }).join('')}
        <div class="dq-numnote">${S.phase === 'tierev' ? (tieN === 3 ? 'Tretí rozstrel: vyhráva najbližší tip, pri rovnako presných tipoch rýchlejší.' : 'Vyhráva najbližší tip. Pri rovnako presných tipoch nasleduje ďalší rozstrel (najviac tri, v treťom rozhodne čas).') : 'Poradie je podľa presnosti tipu, pri rovnakom tipe podľa času.'}</div></div></div>`;
  } else if (q.num) {
    h += can ? (my ? `<div class="dq-numbox done">Tvoj tip: <b>${dqNumFmt(my.v, q.unit)}</b></div>`
      : `<div class="dq-numbox"><input type="text" id="dq-numin" inputmode="decimal" autocomplete="off" placeholder="${q.unit ? 'číslo v ' + dqEsc(q.unit) : 'napíš číslo'}" maxlength="12">${q.unit ? `<span class="dq-unit">${dqEsc(q.unit)}</span>` : ''}<button class="dq-btn pri" id="dq-numok">POTVRDIŤ ▶</button></div>`)
      : '';
  } else {
    h += '<div class="dq-opts">';
    q.opts.forEach((o, i) => {
      const gone = !R && hid.indexOf(i) >= 0;
      const cls = (R ? (sus ? (R.res[me] && R.res[me].c === i ? ' sel' : '') : (i === R.ans ? ' ok' : (R.res[me] && R.res[me].c === i ? ' no' : ''))) : (my && my.c === i ? ' sel' : '')) + (gone ? ' gone' : '');
      const who = R ? q.who.filter(pi => R.res[pi].c === i).map(pi => `<i style="background:${dqC(pi)}"></i>`).join('') : '';
      h += `<button class="choice-btn${cls}" data-c="${i}" ${R || my || !can || gone ? 'disabled' : ''}><kbd>${i + 1}</kbd><span>${dqEsc(o)}</span>${who ? `<span class="dq-who">${who}</span>` : ''}</button>`;
    });
    h += '</div>';
  }
  /* žolíky — kým som neodpovedal */
  if (J && !R && can && !my) {
    const att = S.phase === 'duelq' && S.duel && S.duel.a === me;
    const jb = (k, lbl, tip, on, lock) => J[k] == null ? '' : `<button data-jk="${k}" class="${on ? 'on' : ''}${'sab'.indexOf(k) >= 0 ? ' pk' : ''}" ${J[k] > 0 && !lock ? '' : 'disabled'} title="${tip}">${lbl}${J[k] > 1 ? ` <i>${J[k]}×</i>` : ''}</button>`;
    const mx = att && S.duel.x2 ? (S.duel.x2 === true ? 2 : S.duel.x2) : 0;
    h += `<div class="dq-jk"><span>ŽOLÍKY</span>${q.num ? '' : jb('h', '½ 50:50', 'Zmiznú dve nesprávne odpovede', false, hid.length > 0)}${jb('t', '⏱ +10 s', 'Desať sekúnd navyše pre všetkých')}${jb('s', '⏱ +5 s', 'Boost za úroveň: päť sekúnd navyše pre všetkých')}${att ? jb('d', '×2 BODY', 'Pri výhre dostaneš hodnotu priestoru ešte raz', mx === 2, mx && mx !== 2) + jb('a', '×1,2 BODY', 'Boost za úroveň: pri výhre o pätinu bodov viac', mx === 1.2, mx && mx !== 1.2) + jb('b', '×1,3 BODY', 'Boost za úroveň: pri výhre o 30 % bodov viac', mx === 1.3, mx && mx !== 1.3) : ''}</div>`;
  }
  h += '<div class="dq-pop-foot">';
  if (R && !q.num) h += q.who.map(pi => { const r = R.res[pi]; return `<span class="${sus ? '' : r.ok ? 'ok' : 'no'}"><i style="background:${dqC(pi)}"></i>${nm(pi)} ${r.c < 0 ? '— bez odpovede' : sus ? '…' : r.ok ? '✓ ' + sec(r.ms) : '✗'}</span>`; }).join('');
  else if (!R) h += q.who.map(pi => `<span class="${S.answered.indexOf(pi) >= 0 ? 'in' : ''}"><i style="background:${dqC(pi)}"></i>${nm(pi)} ${S.answered.indexOf(pi) >= 0 ? '✓' : '…'}</span>`).join('')
    + `<em>${!can ? 'Pozeráš sa — odpovedá ' + q.who.map(nm).join(' a ') + '.' : my ? 'Odpoveď je zapísaná.' : q.num ? 'Napíš číslo a potvrď Enterom. Vyhráva najbližší tip.' : 'Klikni alebo stlač 1–4.'}</em>`;
  if (R) h += `<button class="dq-rep" id="dq-rep" ${DQ.repK === S.gid + S.k ? 'disabled' : ''}>${DQ.repK === S.gid + S.k ? '✓ NAHLÁSENÉ' : '⚑ NAHLÁSIŤ OTÁZKU'}</button>`;
  return h + '</div></div>';
}
/* číselná os: tipy hráčov priletia jeden po druhom, správna hodnota sa odkryje posledná; el = koľko sekúnd už vyhodnotenie beží */
function dqAxisSVG(S, el) {
  const R = S.rev, who = R.order.filter(pi => R.res[pi].v !== null).sort((a, b) => a - b), vals = who.map(pi => R.res[pi].v).concat([R.ans]);
  let lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
  if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.12, X = v => (24 + 252 * (v - (lo - pad)) / (hi - lo + 2 * pad)).toFixed(1), dl = d => `animation-delay:${(d - el).toFixed(2)}s`;
  const ad = 0.4 + who.length * 0.5 + 0.4, best = R.what !== 'again' && R.order.length && R.res[R.order[0]].v !== null ? R.order[0] : -1;
  let h = `<svg class="dq-axis" viewBox="0 0 300 172"><line class="ax" x1="12" y1="108" x2="288" y2="108"/>`;
  for (let n = 0; n <= 10; n++) h += `<line class="tk" x1="${(24 + 25.2 * n).toFixed(1)}" y1="104" x2="${(24 + 25.2 * n).toFixed(1)}" y2="112"/>`;
  who.forEach((pi, n) => {
    const r = R.res[pi], x = X(r.v), y = 80 - (n % 3) * 25;
    h += `<g class="dq-tip" style="--pc:${dqC(pi)};${dl(0.4 + n * 0.5)}"><line x1="${x}" y1="108" x2="${x}" y2="${y + 5}"/><circle cx="${x}" cy="108" r="5"/><text x="${x}" y="${y}">${dqEsc(dqNumFmt(r.v))}</text><text class="n" x="${x}" y="${y - 11}">${dqI(pi)}</text>${pi === best ? `<circle class="halo" cx="${x}" cy="108" r="10" style="${dl(ad + 0.5)}"/>` : ''}</g>`;
  });
  const ax = X(R.ans);
  h += `<g class="dq-axans" style="${dl(ad)}"><path d="M${ax},113 l-7,13 h14 Z"/><text x="${ax}" y="143">${dqEsc(dqNumFmt(R.ans, R.unit))}</text><text class="n" x="${ax}" y="156">SPRÁVNE</text></g>`;
  return h + '</svg>';
}
/* koniec hry: stupne víťazov, zvyšok poradia a ocenenia */
function dqPodiumHTML(S, me) {
  const nm = i => dqEsc(S.players[i] ? S.players[i].nick : '?'), top = S.rank.slice(0, 3), ord = top.length === 3 ? [1, 0, 2] : top.length === 2 ? [1, 0] : [0];
  const lg = pi => !S.cfg.demo && !S.players[pi].bot && dqLeaguePts(S, pi).pts ? `<em>+${dqLeaguePts(S, pi).pts} do rebríčka</em>` : '';
  let h = `<div class="dq-podium">${ord.map(r => { const pi = top[r]; return `<div class="p${r + 1}${pi === me ? ' me' : ''}" style="--c:${dqC(pi)};animation-delay:${(1.0 - r * 0.35).toFixed(2)}s">${dqFace(S, pi)}<span>${nm(pi)}</span><strong>${dqScore(S, pi)}</strong><small>${S.own.filter(o => o === pi).length} priestorov</small>${lg(pi)}<b>${r + 1}</b></div>`; }).join('')}</div>`;
  if (S.rank.length > 3) h += `<div class="dq-endlist">${S.rank.slice(3).map((pi, r) => `<div class="${pi === me ? 'me' : ''}" style="animation-delay:${(1.3 + r * 0.15).toFixed(2)}s"><b>${r + 4}.</b><i style="background:${dqC(pi)}"></i><span>${nm(pi)}</span><small>${S.own.filter(o => o === pi).length} priestorov</small><strong>${dqScore(S, pi)}</strong>${lg(pi)}</div>`).join('')}</div>`;
  const aw = [], St = S.stat || [];
  const best = (val, ok) => { let bi = -1; St.forEach((T, i) => { if (ok(T) && (bi < 0 || val(T) > val(St[bi]))) bi = i; }); return bi; };
  let i = best(T => T.c, T => T.c > 0); if (i >= 0) aw.push(['🎯', 'NAJLEPŠÍ STRELEC', nm(i), St[i].c + ' správnych z ' + St[i].n]);
  i = best(T => T.mx, T => T.mx >= 2); if (i >= 0) aw.push(['🔥', 'NAJDLHŠIA SÉRIA', nm(i), St[i].mx + ' správnych v rade']);
  i = best(T => -T.fast, T => T.fast > 0); if (i >= 0) aw.push(['⚡', 'NAJRÝCHLEJŠIA ODPOVEĎ', nm(i), (St[i].fast / 1000).toFixed(1).replace('.', ',') + ' s']);
  /* môj najúspešnejší okruh — z mojich odpovedí v tejto partii (aspoň dve otázky z okruhu) */
  if (DQ.logG === S.gid && DQ.log) {
    const G = {}; DQ.log.filter(x => !x.num).forEach(x => { const g = G[x.mod] = G[x.mod] || { c: 0, n: 0 }; g.n++; if (x.ok) g.c++; });
    const ks = Object.keys(G).filter(k => G[k].n >= 2 && G[k].c > 0).sort((a, b) => G[b].c / G[b].n - G[a].c / G[a].n || G[b].n - G[a].n);
    if (ks.length) aw.push(['📚', 'TVOJ NAJLEPŠÍ OKRUH', dqEsc(ks[0]), G[ks[0]].c + ' z ' + G[ks[0]].n + ' správne']);
  }
  if (me >= 0 && !S.cfg.demo && !S.players[me].bot) {
    const L = dqLeaguePts(S, me), f = x => String(x).replace('.', ',');
    h += `<div class="dq-lgcalc"><strong>BODY DO REBRÍČKA · +${L.pts}</strong><div><span>základ <b>500</b></span><span>× miesto <b>${f(L.place)}</b></span><span>× výkon <b>${f(L.perf)}</b></span><span>× hráči <b>${f(L.F.pl)}</b></span><span>× dĺžka <b>${f(L.F.len)}</b></span><span>× okruhy <b>${f(L.F.top)}</b></span></div>
      <small>${L.F.h} ${L.F.h === 1 ? 'človek' : L.F.h < 5 ? 'ľudia' : 'ľudí'}${L.F.bots ? ' a ' + L.F.bots + ' počítač' + (L.F.bots === 1 ? '' : L.F.bots < 5 ? 'e' : 'ov') : ''} · ${L.F.R} kôl · ${L.F.m} z ${DQ_QS.length} sád otázok · výkon = tvoje body oproti víťazovi. ${L.F.h < 2 ? 'Proti počítačom je bodov málo — s kolegami ich je mnohonásobne viac.' : 'Viac ľudí, viac kôl a viac okruhov = viac bodov.'}</small></div>`;
  }
  /* rozpis bodov: z čoho kto body má */
  const CN = { AD: ['letisko', 'letiská', 'letísk'], CTR: ['CTR', 'CTR', 'CTR'], TMA: ['TMA', 'TMA', 'TMA'], TRA: ['TRA', 'TRA', 'TRA'], TSA: ['TSA', 'TSA', 'TSA'], R: ['LZR', 'LZR', 'LZR'], P: ['LZP', 'LZP', 'LZP'], D: ['LZD', 'LZD', 'LZD'], G: ['časť G', 'časti G', 'častí G'] };
  h += `<div class="dq-ptab"><strong>ROZPIS BODOV</strong><div class="rk-tbl"><table><thead><tr><th>HRÁČ</th><th>ZA PRIESTORY</th><th>OBRANA</th><th>SÉRIE</th><th>NÁSOBIČE</th><th>SPOLU</th><th>ÚTOKY</th><th>OBRANY</th></tr></thead><tbody>${S.rank.map(pi => {
    const p = S.players[pi], bd = p.bd || {}, T = St[pi] || {}, cnt = {}; let terr = 0;
    S.own.forEach((o, t) => { if (o === pi) { terr += DQ_MAP.t[t].v; const c = DQ_MAP.t[t].c; cnt[c] = (cnt[c] || 0) + 1; } });
    const det = Object.keys(CN).filter(c => cnt[c]).map(c => cnt[c] + ' ' + CN[c][cnt[c] === 1 ? 0 : cnt[c] < 5 ? 1 : 2]).join(' · ');
    return `<tr class="${pi === me ? 'me' : ''}"><td class="rk-nick"><i style="background:${dqC(pi)}"></i>${nm(pi)}${p.out ? ' <em>vyradený</em>' : ''}<small>${det || 'bez priestorov'}</small></td><td>${terr}</td><td>${bd.def || 0}</td><td>${bd.fire || 0}</td><td>${bd.x2 || 0}</td><td class="rk-pts">${dqScore(S, pi)}</td><td>${T.at ? (T.aw || 0) + ' / ' + T.at : '—'}${T.fr ? `<small>+${T.fr} voľných</small>` : ''}</td><td>${T.df ? (T.dw || 0) + ' / ' + T.df : '—'}</td></tr>`;
  }).join('')}</tbody></table></div><small>OBRANA = +100 za každé ubránenie správnou odpoveďou · SÉRIE = +50 za každú tretiu správnu odpoveď v rade · ÚTOKY a OBRANY = vyhrané / všetky.</small></div>`;
  if (aw.length) h += `<div class="dq-awards">${aw.map(a => `<div><i>${a[0]}</i><small>${a[1]}</small><b>${a[2]}</b><span>${a[3]}</span></div>`).join('')}</div>`;
  return h;
}
function dqStageEl() {
  let el = document.getElementById('dq-stage');
  if (!el) { el = document.createElement('div'); el.id = 'dq-stage'; el.style.display = 'none'; document.body.appendChild(el); }
  return el;
}
function dqHideStage() { const el = document.getElementById('dq-stage'); cancelAnimationFrame(DQ.camR); if (el) { el.style.display = 'none'; el.classList.remove('dq-hurry'); } document.body.classList.remove('dq-live'); clearInterval(DQ.bar); }
/* dotykové zariadenie alebo úzke okno: priestor sa najprv označí (ťuknutím alebo zo zoznamu) a až potom potvrdí */
function dqCoarse() { try { return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 820; } catch (e) { return false; } }
function dqFocus(t) { dqCamStop(); const o = DQ_MAP.t[t], B = dqBaseView(), w = B.w / 2.6, h = w * B.h / B.w; DQ.view = { w, h, x: Math.max(B.x, Math.min(B.x + B.w - w, o.x - w / 2)), y: Math.max(B.y, Math.min(B.y + B.h - h, o.y - h / 2)) }; dqViewApply(); }
function dqPickerHTML(S) {
  const al = S.allowed.slice().sort((a, b) => DQ_MAP.t[b].v - DQ_MAP.t[a].v || DQ_MAP.t[a].k.localeCompare(DQ_MAP.t[b].k)), sel = al.indexOf(DQ.sel) >= 0 ? DQ.sel : -1;
  return `<div class="dq-pk-row">${al.map(t => { const o = DQ_MAP.t[t], en = S.own[t] >= 0; return `<button class="dq-pk${t === sel ? ' on' : ''}" data-pk="${t}"${en ? ` style="--pc:${dqC(S.own[t])}"` : ''}>${en ? '⚔ ' : ''}${dqEsc(o.k)} <b>${o.v}</b></button>`; }).join('')}</div>
    <button class="dq-pk-ok" id="dq-pkok" ${sel < 0 ? 'disabled' : ''}>${sel < 0 ? 'Ťukni na priestor na mape alebo v zozname' : 'POTVRDIŤ: ' + dqEsc(DQ_MAP.t[sel].k) + ' ▶'}</button>`;
}
function dqAnswer(c, v) {
  const Z = DQ.S;
  if (DQ.my || !Z || !dqAsking(Z) || Z.q.who.indexOf(dqMe()) < 0) return;
  if (Z.q.num) { if (typeof v !== 'number' || !isFinite(v)) return; DQ.my = { v }; dqSend({ t: 'ans', k: Z.k, v, ms: Date.now() - DQ.qT0 }); return dqShow(); }
  if (typeof c !== 'number' || c < 0) return;
  DQ.my = { c };
  dqSend({ t: 'ans', k: Z.k, c, ms: Date.now() - DQ.qT0 });
  dqShow();
}
/* udalosti sa viažu raz na pevné obaly — prekreslenie vnútra tak nemôže „zjesť“ kliknutie */
function dqBindStage(st) {
  const $ = id => document.getElementById(id), ph = $('dq-poph'), mh = $('dq-maph'), info = $('dq-info');
  const quit = () => { if ((DQ.S && DQ.S.phase === 'end') || confirm('Naozaj odísť z rozohranej hry?')) dqLeave(''); };
  $('dq-zi').onclick = () => dqZoom(0.7);
  $('dq-zo').onclick = () => dqZoom(1 / 0.7);
  $('dq-zr').onclick = () => { dqCamStop(); DQ.view = null; dqViewApply(); };
  $('dq-leave').onclick = quit;
  $('dq-unpeek').onclick = () => { DQ.peek = null; dqShow(); };
  $('dq-coach').addEventListener('click', e => { const b = e.target.closest && e.target.closest('button'); if (!b) return; if (b.dataset.co === 'go') dqDemoGo(); else if (b.dataset.co === 'quit') dqLeave(''); });
  $('dq-emob').onclick = () => $('dq-emop').classList.toggle('on');
  $('dq-emop').onclick = e => { const b = e.target.closest && e.target.closest('button'); if (b) { dqSend({ t: 'emo', e: +b.dataset.e }); $('dq-emop').classList.remove('on'); } };
  $('dq-fxb').onclick = () => { DQ.low = !dqLow(); lsSet(DQ_LOWK, DQ.low ? 1 : 0); dqLowApply(); dqShow(); };
  const press = e => { const b = e.target.closest && e.target.closest('.dq-opts .choice-btn'); if (b && !b.disabled) { e.preventDefault(); dqAnswer(+b.dataset.c); } };
  const numGo = () => { const i = $('dq-numin'); if (!i) return; const v = parseFloat(i.value.replace(/\s/g, '').replace(',', '.')); if (isFinite(v)) dqAnswer(-1, v); else { i.value = ''; i.focus(); } };
  ph.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'dq-numin') { e.preventDefault(); numGo(); } });
  /* myš sa môže pustiť aj mimo mapy (napr. nad oknom s otázkou) — posun mapy sa vtedy musí skončiť */
  window.addEventListener('pointerup', () => { clearTimeout(hold); drag = null; });
  /* myšou sa odpovedá hneď pri stlačení; prstom až pri ťuknutí — položenie prsta môže byť začiatok posúvania */
  ph.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') press(e); });
  ph.addEventListener('click', e => {
    press(e);
    const id = e.target.closest && (e.target.closest('button') || {}).id;
    if (id === 'dq-numok') numGo();
    else if (id === 'dq-leave2') quit();
    else if (id === 'dq-again') dqSend({ t: 'again' });
    else if (id === 'dq-peek') { DQ.peek = DQ.S.gid; dqShow(); }
    else if (id === 'dq-rep') { const Z = DQ.S; if (Z && Z.q && Z.rev) { dqReportQ({ key: Z.q.key, mod: Z.q.mod, q: dqRepText({ img: Z.q.img, q: Z.q.prompt }), a: Z.q.num ? Z.rev.ans : Z.q.opts[Z.rev.ans] }); DQ.repK = Z.gid + Z.k; dqShow(); } }
    else if (id === 'dq-errs') { DQ.endV = 'errs'; DQ.ui++; dqShow(); }
    else if (id === 'dq-errback') { DQ.endV = ''; DQ.drill = null; DQ.ui++; dqShow(); }
    else if (id === 'dq-drill') dqDrillStart();
    else if (id === 'dq-drnext') dqDrillNext();
    else if (id === 'dq-modok') { if (DQ.S) dqSend({ t: 'mod', k: DQ.S.k }); }
    else {
      const b = e.target.closest && e.target.closest('[data-mod],[data-rep],[data-dr],[data-jk]'), Z = DQ.S;
      if (!b || b.disabled || !Z) return;
      if (b.dataset.jk) dqSend({ t: 'jk', k: Z.k, j: b.dataset.jk });
      else if (b.dataset.mod) dqSend({ t: 'modsel', k: Z.k, m: b.dataset.mod });
      else if (b.dataset.dr != null) dqDrillPick(+b.dataset.dr);
      else if (b.dataset.rep != null) { const x = dqWrong(Z)[+b.dataset.rep]; if (x) { dqReportQ({ key: x.key, mod: x.mod, q: dqRepText(x), a: x.num ? x.ans : x.opts[x.ans] }); DQ.ui++; dqShow(); } }
    }
  });
  $('dq-picker').addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button'), Z = DQ.S;
    if (!b || !Z) return;
    if (b.dataset.pk != null) { DQ.sel = +b.dataset.pk; dqFocus(DQ.sel); dqShow(); }
    else if (b.id === 'dq-pkok' && DQ.sel >= 0 && Z.allowed.indexOf(DQ.sel) >= 0) { const o = DQ_MAP.t[DQ.sel]; DQ.click = { t: DQ.sel, x: o.x, y: o.y, at: Date.now() }; const t = DQ.sel; DQ.sel = -1; DQ.view = null; dqSend({ t: 'pick', k: Z.k, terr: t }); }
  });
  const svg = () => $('dq-svg');
  const pt = e => { const s = svg(), m = s && s.getScreenCTM(); return m ? { x: (e.clientX - m.e) / m.a, y: (e.clientY - m.f) / m.d } : null; };
  const cellAt = e => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.classList && el.classList.contains('dq-cell') ? +el.dataset.t : -1; };
  const zoomAt = e => { const p = pt(e); DQ.dragged = true; if (DQ.view && DQ.view.w < dqBaseView().w / 3.2) { DQ.view = null; dqViewApply(); } else dqZoom(0.45, p && p.x, p && p.y); };
  let drag = null, hold = 0, tap = null;
  mh.addEventListener('pointerover', e => { const t = e.target.classList && e.target.classList.contains('dq-cell') ? +e.target.dataset.t : -1; if (t >= 0 && DQ.S) info.innerHTML = dqTerrInfo(t, DQ.S); });
  /* trackpad posiela desiatky drobných udalostí za sekundu — priblíženie preto ide podľa veľkosti pohybu, nie po skokoch */
  mh.addEventListener('wheel', e => { e.preventDefault(); const p = pt(e), d = Math.max(-60, Math.min(60, e.deltaY)); dqZoom(Math.exp(d * (e.ctrlKey ? 0.012 : 0.0035)), p && p.x, p && p.y); }, { passive: false });
  mh.addEventListener('pointerdown', e => {
    DQ.dragged = false; clearTimeout(hold);
    hold = setTimeout(() => { if (!DQ.dragged) { drag = null; zoomAt(e); } }, 520);
    if (DQ.view) drag = { x: e.clientX, y: e.clientY, v: Object.assign({}, DQ.view) };
  });
  mh.addEventListener('pointermove', e => {
    if (!drag) return;
    if (e.pointerType === 'mouse' && !(e.buttons & 1)) { drag = null; return; }      // tlačidlo už nie je stlačené → mapa sa nesmie hýbať
    const s = svg(), dx = e.clientX - drag.x, dy = e.clientY - drag.y, B = dqBaseView();
    if (Math.abs(dx) + Math.abs(dy) > 6) { DQ.dragged = true; clearTimeout(hold); dqCamStop(); }
    if (!DQ.dragged || !s) return;
    const k = Math.max(drag.v.w / s.clientWidth, drag.v.h / s.clientHeight);
    DQ.view = { w: drag.v.w, h: drag.v.h, x: Math.max(B.x, Math.min(B.x + B.w - drag.v.w, drag.v.x - dx * k)), y: Math.max(B.y, Math.min(B.y + B.h - drag.v.h, drag.v.y - dy * k)) };
    dqViewApply();
  });
  const end = () => { clearTimeout(hold); drag = null; };
  mh.addEventListener('pointerleave', end); mh.addEventListener('pointercancel', end);
  mh.addEventListener('pointerup', e => {
    const moved = DQ.dragged, now = Date.now(); end(); DQ.dragged = false;
    if (moved) return;
    if (tap && now - tap.t < 320 && Math.abs(tap.x - e.clientX) + Math.abs(tap.y - e.clientY) < 30) { tap = null; DQ.dragged = false; const p = pt(e); if (DQ.view && DQ.view.w < dqBaseView().w / 3.2) { DQ.view = null; dqViewApply(); } else dqZoom(0.45, p && p.x, p && p.y); return; }
    tap = { t: now, x: e.clientX, y: e.clientY };
    let t = cellAt(e); const Z = DQ.S;
    if (!Z) return;
    const myPick = Z.chooser === dqMe() && dqPicking(Z), coarse = dqCoarse();
    /* drobné priestory sa prstom ťažko trafia: berie sa najbližší povolený do 46 px (myšou do 12 px) */
    if (myPick && Z.allowed.indexOf(t) < 0) {
      const s = svg(), m = s && s.getScreenCTM(); let bd = coarse ? 46 : 12, bt = -1;
      if (m) Z.allowed.forEach(a => { const o = DQ_MAP.t[a], d = Math.hypot(o.x * m.a + m.e - e.clientX, o.y * m.d + m.f - e.clientY); if (d < bd) { bd = d; bt = a; } });
      if (bt >= 0) t = bt;
    }
    if (t < 0) return;
    info.innerHTML = dqTerrInfo(t, Z);
    if (myPick && Z.allowed.indexOf(t) >= 0) {
      const p = pt(e); if (p) DQ.click = { t, x: p.x, y: p.y, at: now };
      if (coarse) { DQ.sel = t; dqShow(); } else dqSend({ t: 'pick', k: Z.k, terr: t });
    }
  });
}
function dqRender(card) {
  const S = DQ.S, M = DQ_MAP;
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = DQ.room ? 'miestnosť ' + DQ.room : 'hra';
  card.classList.remove('dq-on');
  clearInterval(DQ.bar);
  const live = !!(DQ.room && S && S.phase !== 'lobby');
  if (!live) dqHideStage();
  if (!DQ.room) {
    const L0 = lsGet(DQ_LASTK, null), back = L0 && L0.room && Date.now() - L0.t < 20 * 60000 ? L0 : null;
    const H0 = lsGet(DQ_HOSTK, null), hback = H0 && H0.S && H0.room && H0.S.phase !== 'end' && Date.now() - H0.t < 30 * 60000 ? H0 : null;
    card.innerHTML = `<div class="dq-home dqh">
        <section class="dqh-hero">
          <div class="dqh-copy"><small><i></i>HRA NAŽIVO · 2 – 6 HRÁČOV</small><h2>DOBYVATEĽ</h2>
            <p>Odpovedz rýchlejšie než ostatní a ober ich o slovenské nebo.</p>
            <div class="dqh-pills"><span>🗺 skutočné priestory</span><span>⏱ 10 – 20 minút</span><span>❓ ${Object.keys(DQ_BANK).reduce((x, k) => x + DQ_BANK[k].length, 0)} otázok</span><span>🏆 body do rebríčka</span></div></div>
          <button class="dqh-demo" id="dq-demo"><i>▶</i><span><b>NEVIEŠ, AKO SA TO HRÁ?</b><em>Pusti si vzor hry proti počítaču — 5 minút, bez kódu a bez prihlásenia.</em></span><u>UKÁZAŤ VZOR HRY</u></button>
        </section>
        ${DQ.err ? `<div class="rk-err">${dqEsc(DQ.err)}</div>` : ''}
        ${back ? `<div class="dq-back"><div><strong>ROZOHRANÁ HRA · ${dqEsc(back.room)}</strong><span>Vypadol si z hry. Ak ešte beží, môžeš sa do nej vrátiť — tvoje priestory na teba čakajú.</span></div><button class="btn" id="dq-rejoin">VRÁTIŤ SA DO HRY ▶</button><button class="btn ghost" id="dq-forget">ZAHODIŤ</button></div>` : ''}
        ${hback ? `<div class="dq-back"><div><strong>TVOJA MIESTNOSŤ · ${dqEsc(hback.room)}</strong><span>Bol si hostiteľ a ${hback.S.phase === 'lobby' ? 'miestnosť čakala na štart' : 'hra bola rozohraná'}. Môžeš ju obnoviť — pokračuje tam, kde skončila, a hráči, ktorí ostali na stránke, sa pripoja sami.</span></div><button class="btn" id="dq-hresume">OBNOVIŤ HRU ▶</button><button class="btn ghost" id="dq-hforget">ZAHODIŤ</button></div>` : ''}
        <section class="dqh-play">
          <div class="dqh-card who"><small><b>1</b>HRÁŠ AKO</small>${RK.acct ? `<div class="dqh-me">${avFace(RK.acct.nick, RK.me && RK.me.emoji, '')}<strong>${dqEsc(RK.acct.nick)}</strong></div><span>Body z hry sa ti pripíšu do rebríčka.</span>` : `<input type="text" id="dq-nick" maxlength="16" placeholder="tvoja prezývka" value="${dqEsc(DQ.guest)}" autocomplete="off" spellcheck="false"><span>Hrať môžeš aj bez účtu. Body do rebríčka majú len prihlásení.</span>`}</div>
          <div class="dqh-card new"><small><b>2</b>NOVÁ HRA</small><strong>Založ miestnosť</strong><span>Dostaneš kód zo štyroch písmen a pošleš ho kolegom. Dá sa hrať aj proti počítaču.</span><button class="btn" id="dq-create">VYTVORIŤ MIESTNOSŤ ▶</button></div>
          <div class="dqh-card code"><small><b>2</b>MÁM KÓD</small><strong>Pripoj sa ku kolegom</strong><span>Napíš kód, ktorý ti poslal hostiteľ.</span><div class="dqh-join"><input type="text" id="dq-code" maxlength="4" placeholder="KÓD" autocomplete="off" spellcheck="false"><button class="btn" id="dq-join">PRIPOJIŤ ▶</button></div></div>
        </section>
        ${SB_ON ? '' : '<div class="rk-warn"><strong>SKÚŠOBNÝ REŽIM</strong> — hra ešte nie je pripojená na server. Proti počítaču funguje hneď; s druhým hráčom zatiaľ len v dvoch kartách toho istého prehliadača.</div>'}
        <section class="dqh-how"><div class="dqh-h"><h3>AKO TO VYZERÁ</h3><span>ukážka beží sama — kliknutím preskočíš na scénu</span></div>
          ${dqReelHTML()}
          ${dqRulesHTML()}
        </section>
        ${dqGuideHTML()}
        <div class="dq-src">Hranice priestorov: VFR Manual, LPS SR, š. p. — platné od ${M.eff}. Pomôcka na učenie, nie na navigáciu.</div>
      </div>`;
    rlGo(0);
    const ni = document.getElementById('dq-nick'); if (ni) ni.oninput = () => { DQ.guest = ni.value; };
    document.getElementById('dq-create').onclick = dqCreate;
    document.getElementById('dq-demo').onclick = dqDemo;
    const rj = document.getElementById('dq-rejoin'), fg = document.getElementById('dq-forget');
    if (rj) rj.onclick = dqRejoin;
    if (fg) fg.onclick = () => { lsSet(DQ_LASTK, null); dqShow(); };
    const hr = document.getElementById('dq-hresume'), hf = document.getElementById('dq-hforget');
    if (hr) hr.onclick = dqHostResume;
    if (hf) hf.onclick = () => { lsSet(DQ_HOSTK, null); dqShow(); };
    const ci = document.getElementById('dq-code'), jn = () => dqJoin(ci.value);
    document.getElementById('dq-join').onclick = jn;
    ci.addEventListener('keydown', e => { if (e.key === 'Enter') jn(); });
    return;
  }
  if (!S) { card.innerHTML = `<div class="dq-home"><h2>DOBYVATEĽ</h2><p class="dq-lead">Pripájam sa do miestnosti <strong>${DQ.room}</strong>…</p><button class="btn ghost" id="dq-leave">ZRUŠIŤ</button></div>`; document.getElementById('dq-leave').onclick = () => dqLeave(''); return; }
  const me = dqMe(), nm = i => dqEsc(S.players[i] ? S.players[i].nick : '?');
  if (S.phase === 'lobby') {
    DQ.prev = null; DQ.view = null;
    const slots = []; for (let i = S.players.length; i < S.cfg.max; i++) slots.push('<div class="dq-pl empty"><span>voľné miesto…</span></div>');
    card.innerHTML = `<div class="dq-home">
        <h2>DOBYVATEĽ — MIESTNOSŤ</h2>
        <div class="dq-lobby-grid">
          <div>
            <div class="dq-code"><span>KÓD MIESTNOSTI</span><b>${DQ.room}</b><small>${DQ.host ? 'Pošli ho kolegom. Otvoria kartu DOBYVATEĽ, napíšu kód a dajú PRIPOJIŤ SA.' : 'Si v miestnosti. Hru spustí hostiteľ.'}</small></div>
            ${RK.acct && DQ.host ? (() => { const fr = SOC.friends.filter(f => f.st === 'ok'); DQ.invited = DQ.invited && DQ.invRoom === DQ.room ? DQ.invited : {}; DQ.invRoom = DQ.room;
              return `<div class="dq-inv"><strong>POZVAŤ PRIATEĽOV</strong>${fr.length ? `<div>${fr.map(f => `<button class="rk-chip${f.online ? ' on' : ''}" data-dqinv="${dqEsc(f.nick)}" ${DQ.invited[f.nick] ? 'disabled' : ''}>${f.online ? '● ' : ''}${dqEsc(f.nick)}${DQ.invited[f.nick] ? ' ✓' : ''}</button>`).join('')}</div><small>Zelení sú práve online. Pozvánka im vyskočí vpravo hore a ostane v správach.</small>` : '<small>Zatiaľ nemáš priateľov — pridaj si ich v profile (vpravo hore → PRIATELIA) a nabudúce ich pozveš jedným klikom.</small>'}</div>`; })() : ''}
            <div class="dq-lobby">${S.players.map((p, i) => `<div class="dq-pl"><i style="background:${dqC(i)}">${dqI(i)}</i><span>${dqEsc(p.nick)}${i === 0 ? ' <em>hostiteľ</em>' : ''}${i === me ? ' <em>(ty)</em>' : ''}</span>${DQ.host && i > 0 ? `<button class="dq-x" data-kick="${i}" title="Odobrať">✕</button>` : ''}</div>`).join('')}${slots.join('')}</div>
            ${me >= 0 ? `<div class="dq-look"><strong>TVOJA FARBA A LIETADLO</strong>
              <div class="dq-look-row">${DQ_PAL.map((c, ci) => { const taken = S.players.some((p, j) => j !== me && p.col === ci); return `<button class="dq-sw${S.players[me].col === ci ? ' on' : ''}" data-col="${ci}" style="background:${c}" ${taken ? 'disabled title="farbu už má iný hráč"' : ''}></button>`; }).join('')}</div>
              <div class="dq-look-row">${DQ_ICO.map((ic, ii) => `<button class="dq-ic${S.players[me].ico === ii ? ' on' : ''}" data-ico="${ii}">${ic}</button>`).join('')}</div>
              <div class="dq-look-row"><button class="rk-chip${dqLow() ? '' : ' on'}" id="dq-lowt">ANIMÁCIE: ${dqLow() ? 'MENEJ' : 'PLNÉ'}</button><small>Na slabšom telefóne prepni na MENEJ. Dá sa to zmeniť aj počas hry tlačidlom ✨.</small></div>
            </div>` : ''}
            <div class="dq-acts">
              ${DQ.host ? `<button class="btn" id="dq-go" ${S.players.length < 2 ? 'disabled' : ''}>ŠTART ▶</button><button class="btn ghost" id="dq-bot" ${S.players.length >= S.cfg.max ? 'disabled' : ''}>+ POČÍTAČ</button>` : ''}
              <button class="btn ghost" id="dq-leave">ODÍSŤ</button>
            </div>
            ${DQ.host && S.players.length < 2 ? '<div class="dq-note">Na štart treba aspoň dvoch hráčov. Ak nikto nie je poruke, pridaj počítač.</div>' : ''}
            ${(() => { const F = dqLeagueF(S); return `<div class="dq-note">Výhra v tejto hre dá do rebríčka asi <b>${Math.max(5, Math.round(500 * F.pl * F.len * F.top))} bodov</b> (hráči × ${String(F.pl).replace('.', ',')} · dĺžka × ${String(F.len).replace('.', ',')} · okruhy × ${String(F.top).replace('.', ',')}). ${F.h < 2 ? 'Proti počítačom je bodov málo — pozvi kolegov.' : 'Viac ľudí, viac kôl a viac okruhov = viac bodov.'}</div>`; })()}
          </div>
          ${dqCfgHTML(S)}
        </div>
        ${dqRulesHTML()}
        ${dqGuideHTML()}
      </div>`;
    const go = document.getElementById('dq-go'), bot = document.getElementById('dq-bot');
    if (go) go.onclick = () => dqSend({ t: 'start' });
    if (bot) bot.onclick = () => dqSend({ t: 'bot' });
    card.querySelectorAll('[data-kick]').forEach(b => { b.onclick = () => dqSend({ t: 'kick', who: +b.dataset.kick }); });
    card.querySelectorAll('[data-dqinv]').forEach(b => { b.onclick = () => { const n = b.dataset.dqinv; DQ.invited[n] = 1; b.disabled = true; b.textContent = n + ' ✓'; rkRpc('atco_msg_send', { p_token: RK.acct.token, p_nick: n, p_kind: 'invite', p_body: DQ.room }).catch(e => { DQ.invited[n] = 0; DQ.err = socErr(e); dqShow(); }); }; });
    card.querySelectorAll('[data-cfg]').forEach(b => { b.onclick = () => dqSend({ t: 'cfg', key: b.dataset.cfg, val: b.dataset.cfg === 'mods' || b.dataset.cfg === 'map' ? b.dataset.val : +b.dataset.val }); });
    const look = ch => { const L = Object.assign(dqLook(), ch); lsSet(DQ_LOOKK, L); dqSend({ t: 'look', col: L.col, ico: L.ico }); };
    card.querySelectorAll('[data-col]').forEach(b => { b.onclick = () => look({ col: +b.dataset.col }); });
    card.querySelectorAll('[data-ico]').forEach(b => { b.onclick = () => look({ ico: +b.dataset.ico }); });
    const lt = document.getElementById('dq-lowt'); if (lt) lt.onclick = () => { DQ.low = !dqLow(); lsSet(DQ_LOWK, DQ.low ? 1 : 0); dqShow(); };
    const cf = document.getElementById('dqc-file'), cs = document.getElementById('dqc-sample');
    if (cf) cf.onchange = () => { if (cf.files.length) dqcLoadFiles([...cf.files]); };
    if (cs) cs.onclick = dqcSample;
    card.querySelectorAll('[data-dqc-del]').forEach(b => { b.onclick = () => { DQ_CUSTOM.splice(+b.dataset.dqcDel, 1); lsSet(DQC_KEY, DQ_CUSTOM); DQC.msg = ''; dqcSync(false); }; });
    document.getElementById('dq-leave').onclick = () => dqLeave('');
    return;
  }
  /* ---- hra beží: mapa cez celú obrazovku, otázka ako okno nad ňou ---- */
  card.innerHTML = '<div class="dq-home"><h2>DOBYVATEĽ</h2><p class="dq-lead">Hra beží na celej obrazovke.</p></div>';
  const st = dqStageEl(), $ = id => document.getElementById(id);
  st.style.display = ''; document.body.classList.add('dq-live'); dqWake(true);
  /* kostra sa stavia raz za hru — pri každej zmene sa prekresľuje len to, čo sa zmenilo, aby nič neblikalo */
  if (st.dataset.gid !== S.gid || !$('dq-maph')) {
    st.dataset.gid = S.gid;
    st.innerHTML = `
      <div class="dq-top">
        <div class="dq-brand"><b>DOBYVATEĽ</b><span>miestnosť ${DQ.room} · v${APP_VERSION}</span></div>
        <div class="dq-players" id="dq-chips"></div>
        <div class="dq-tools"><button id="dq-emob" title="Poslať reakciu">😀</button><button id="dq-fxb" title="Animácie">✨</button><button data-hp="game" title="Čo sa práve deje a pravidlá">?</button><div id="dq-emop">${DQ_EMO.map((e, i) => `<button data-e="${i}">${e}</button>`).join('')}</div><button id="dq-zi" title="Priblížiť">+</button><button id="dq-zo" title="Oddialiť">−</button><button id="dq-zr" title="Celá mapa">⤢</button><button id="dq-leave" class="x">ODÍSŤ</button></div>
      </div>
      <div class="dq-status" id="dq-status"><b id="dq-st-a"></b><span id="dq-st-b"></span><button class="dq-btn" id="dq-unpeek" style="display:none">VÝSLEDKY</button><div class="dq-timer"><i class="dq-bar-i" id="dq-sbar"></i></div></div>
      <div class="dq-mapwrap"><div id="dq-maph"></div><div id="dq-fxl"></div><div id="dq-toast"></div><div id="dq-poph"></div></div>
      <div id="dq-picker"></div>
      <div id="dq-coach"></div>
      <div class="dq-bottom"><div class="dq-info" id="dq-info"><small>Ukáž na priestor a uvidíš jeho kód, hranice a body. Mapu priblížiš dvojitým ťuknutím alebo podržaním na mieste (aj kolieskom či + −), ťahaním ju posunieš.</small></div>${dqLegendHTML()}</div>`;
    dqBindStage(st);
    DQ.mapSig = ''; DQ.popSig = ''; DQ.pkSig = ''; DQ.sel = -1; DQ.popK = -1; DQ.toastK = -1; DQ.prev = null; DQ.prevOut = null; DQ.fx = []; DQ.view = null; DQ.peek = null; DQ.endV = ''; DQ.drill = null; DQ.ui = 0;
    DQ.coSig = null; DQ.pend = null; DQ.emoN = S.emo ? S.emo.n : 0; DQ.jkN = S.jkN ? S.jkN.n : 0; DQ.camAuto = false; DQ.camK = ''; DQ.flyK = ''; DQ.sweepK = -1; DQ.fireK = ''; cancelAnimationFrame(DQ.camR);
    dqLowApply();
  }
  const now = Date.now(), chooser = S.chooser, mineTurn = chooser === me;
  const toast = (txt, col, cls) => { $('dq-toast').innerHTML = `<div class="dq-toast-in ${cls || ''}" style="--pc:${col}">${txt}</div>`; };
  /* čo sa zmenilo na mape od posledného stavu → vyfarbenie a oznam */
  const bulk = DQ.prev ? S.own.filter((o, t) => o !== DQ.prev[t] && o >= 0).length > 2 : false;
  /* výsledok súboja sa na mape odohrá až po zavretí okna s vyhodnotením */
  const inRev = S.phase === 'duelrev' || S.phase === 'tierev';
  if (S.duel && S.rev && inRev && S.rev.what !== 'tie' && S.rev.what !== 'again') DQ.pend = { what: S.rev.what, a: S.duel.a, d: S.duel.d, t: S.duel.t, x2: S.duel.x2 === true ? 2 : (S.duel.x2 || 0), from: dqOrigin(S, S.duel.a, S.duel.t) };
  const Pd = DQ.pend && !inRev ? DQ.pend : null, wave = Pd && Pd.what === 'out' && !dqLow() ? M.t[Pd.t] : null;
  if (DQ.prev) S.own.forEach((o, t) => {
    if (o === DQ.prev[t] || o < 0) return;
    const ck = DQ.click && DQ.click.t === t && now - DQ.click.at < 4000 ? DQ.click : M.t[t], was = DQ.prev[t], k = dqEsc(M.t[t].k);
    /* vyradený hráč: jeho priestory najprv zošednú a potom sa prefarbia, vlna ide od dobytého letiska */
    const dl = wave ? Math.round(Math.min(1500, Math.hypot(M.t[t].x - wave.x, M.t[t].y - wave.y) * 4)) : 0;
    DQ.fx.push({ t, col: dqC(o), was, x: +ck.x.toFixed(1), y: +ck.y.toFixed(1), t0: now + dl, grey: !!wave });
    if (bulk) return;
    if (!dqLow()) dqFloat('+' + M.t[t].v, dqScr(M.t[t].x, M.t[t].y), dqChipPos(o), 'pts', 1400);
    if (was >= 0) toast(`<small>${was === me ? 'PRIŠIEL SI O PRIESTOR' : o === me ? 'DOBYL SI PRIESTOR' : 'DOBYTÉ'}</small><b>⚔ ${nm(o)} → ${k}</b><em>+${M.t[t].v}</em>`, dqC(o), was === me ? 'lose' : o === me ? 'win' : '');
    else toast(`<small>${M.t[t].c === 'AD' && S.phase.indexOf('start') === 0 ? 'DOMOVSKÉ LETISKO' : 'OBSADENÉ'}</small><b>${nm(o)} → ${k}</b><em>+${M.t[t].v}</em>`, dqC(o), o === me ? 'win' : '');
  });
  if (bulk && S.phase === 'rest' && S.dist) toast(`<small>ROZDELENIE ZVYŠNÝCH PRIESTOROV</small><b>${S.dist} priestorov v pomere bodov</b>`, '#ffd34d', '');
  const outNow = S.players.map(p => !!p.out);
  if (DQ.prevOut) outNow.forEach((o, i) => { if (o && !DQ.prevOut[i]) toast(`<small>DOMOVSKÉ LETISKO PADLO</small><b>${nm(i)} vypadáva</b>`, dqC(i), i === me ? 'lose' : ''); });
  DQ.prevOut = outNow;
  DQ.fx = DQ.fx.filter(f => now - f.t0 < DQ_FXMS);
  clearTimeout(DQ.fxT); if (DQ.fx.length) DQ.fxT = setTimeout(dqShow, Math.max.apply(null, DQ.fx.map(f => f.t0)) - now + DQ_FXMS + 100);
  DQ.prev = S.own.slice();
  if (Pd) { DQ.pend = null; dqResultFx(S, Pd); }
  /* súboj sa začína: kamera sa presunie na miesto deja a útočníkovo lietadlo vyletí na cieľ */
  if (S.duel && (S.phase === 'modpick' || S.phase === 'duelintro')) {
    const id = S.gid + '|' + S.wr + '|' + S.duel.a + '|' + S.duel.t + '|' + (S.wq || []).length, T = M.t[S.duel.t], A = dqOrigin(S, S.duel.a, S.duel.t);
    if (DQ.camK !== id) { DQ.camK = id; if (!dqLow() && (!DQ.view || DQ.camAuto)) { const b = dqCamBox([A, T]); if (b) dqCamTo(b, 700); } }
    if (S.phase === 'duelintro' && DQ.flyK !== id) {
      DQ.flyK = id;
      if (!dqLow()) { const ms = Math.max(700, Math.min(1500, (S.tot || 3000) - 900)); dqFly(A, T, dqC(S.duel.a), ms); dqFxAdd(`<circle class="dq-ping" cx="${T.x}" cy="${T.y}" r="${((T.r || 6) + 9).toFixed(1)}" style="--pc:${dqC(S.duel.a)};animation-delay:${ms}ms"/>`, ms + 950); }
    }
  }
  /* výber priestoru: radarový lúč ukáže, čo sa dá vybrať */
  if (dqPicking(S) && DQ.sweepK !== S.k) { DQ.sweepK = S.k; if (!dqLow()) { if (DQ.camAuto && DQ.view) dqCamTo(null, 500); dqSweep(S); } }
  /* reakcie a žolíky ostatných hráčov */
  if (S.emo && S.emo.n !== DQ.emoN) { DQ.emoN = S.emo.n; const c = dqChipPos(S.emo.p); if (c) dqFloat(DQ_EMO[S.emo.e], { x: c.x, y: c.y + 40 }, { x: c.x, y: c.y + 110 }, 'emo', 2000); }
  if (S.jkN && S.jkN.n !== DQ.jkN) { DQ.jkN = S.jkN.n; const c = dqChipPos(S.jkN.p); if (c) dqFloat('ŽOLÍK ' + DQ_JKN[S.jkN.j], { x: c.x, y: c.y + 30 }, { x: c.x, y: c.y + 64 }, 'tag', 1900); }
  /* vyhodnotenie s napätím: prvú chvíľu je vidno len to, kto čo zvolil */
  if (S.rev && S.q && DQ.susK !== S.gid + S.k) {
    DQ.susK = S.gid + S.k; DQ.susT0 = now;
    const nT = S.q.num ? S.rev.order.filter(pi => S.rev.res[pi].v !== null).length : 0;
    DQ.susMs = Math.min(S.q.num ? 1500 + nT * 500 : 900, (S.tot || 4000) * 0.6);
    clearTimeout(DQ.susT); if (!dqLow()) DQ.susT = setTimeout(dqShow, DQ.susMs + 30);
  }
  const sus = dqSus(S);
  if (S.rev && S.rev.fire && S.rev.fire.length && !sus && DQ.fireK !== S.gid + S.k) { DQ.fireK = S.gid + S.k; S.rev.fire.forEach(pi => { const c = dqChipPos(pi); if (c) dqFloat('🔥 SÉRIA · +50', { x: c.x, y: c.y + 30 }, { x: c.x, y: c.y + 64 }, 'tag', 2100); }); }
  let pop = '', banner = '', myTurn = false;
  const stage = dqStageName(S);
  if (S.phase === 'rest') {
    const dist = S.dist ? ` Zvyšné priestory (${S.dist}) boli rozdelené v pomere bodov — podiel žiadneho hráča sa nezmenil o viac než 3 % a poradie ostalo rovnaké.${S.left ? ' ' + S.left + ' ostalo voľných, lebo sa nedali rozdeliť spravodlivo.' : ''}` : (S.left && S.round >= S.cfg.claim ? ` Voľných ostalo ${S.left} priestorov — spravodlivo sa rozdeliť nedali.` : '');
    banner = S.cnt === 'end' ? 'Hra sa skončila — vyhodnocujem…' + dist : S.cnt === 'war' ? 'Obsadzovanie sa skončilo — začínajú súboje.' + dist : 'Ďalšia otázka o chvíľu…';
  } else if (S.phase === 'count') {
    banner = S.cnt === 'tieq' ? `Rozstrel ${(S.duel && S.duel.tn) || 1} / 3: kto tipne číslo presnejšie?${S.duel && S.duel.tn === 3 ? ' Pri rovnakom tipe rozhodne čas.' : ''}` : S.cnt === 'startq' ? 'Tipovacia otázka o poradie výberu domovského letiska.' : S.cnt === 'duelq' && S.duel ? (S.duel.d >= 0 ? `⚔ ${nm(S.duel.a)} útočí na ${dqEsc(M.t[S.duel.t].k)} hráča ${nm(S.duel.d)}` : `${nm(S.duel.a)} obsadzuje voľný priestor ${dqEsc(M.t[S.duel.t].k)}`) : 'Priprav sa na otázku.';
    pop = `<div class="dq-pop count"><div class="dq-pop-top"><span>${stage}</span><span></span><span></span></div><div class="dq-count" id="dq-count"></div><div class="dq-pop-s">${banner}</div></div>`;
    if (S.pre) dqPhoto(S.pre);
  } else if (S.phase === 'startq' || S.phase === 'startrev') {
    banner = S.phase === 'startq' ? 'Tipovacia otázka: kto je najbližšie k správnemu číslu, vyberá si domovské letisko ako prvý.' : sus ? 'Vyhodnocujem tipy…' : 'Poradie výberu letiska: ' + S.picks.map(nm).join(', ') + '.';
    pop = dqPopHTML(S, me, stage, banner);
  } else if (S.phase === 'startpick') {
    myTurn = mineTurn;
    banner = mineTurn ? '✈ Vyber si domovské letisko — klikni na jeden zo sivých kruhov. Odtiaľ budeš dobýjať.' : 'Domovské letisko si vyberá ' + nm(chooser) + '…';
  } else if (S.phase === 'claimq' || S.phase === 'claimrev') {
    const uniq = S.picks.filter((p, i) => S.picks.indexOf(p) === i);
    banner = S.phase === 'claimq' ? 'Kto odpovie správne, vyberie si priestor. Najrýchlejší vyberá prvý a berie dva.' : sus ? 'Kto odpovedal správne?' : (uniq.length ? 'Vyberajú: ' + uniq.map((p, i) => nm(p) + (i === 0 && S.picks.filter(x => x === p).length > 1 ? ' (2×)' : '')).join(', ') + '.' : 'Nikto neodpovedal správne.');
    pop = dqPopHTML(S, me, stage, S.phase === 'claimrev' ? banner : '');
  } else if (S.phase === 'pick') {
    myTurn = mineTurn;
    banner = mineTurn ? (dqCoarse() ? '👆 Si na rade — ťukni na sivý priestor alebo ho vyber zo zoznamu dole a potvrď.' : '👆 Si na rade — klikni na jeden zo sivých priestorov.') : 'Vyberá ' + nm(chooser) + '…';
  } else if (S.phase === 'warpick') {
    myTurn = mineTurn;
    banner = mineTurn ? '⚔ Si na rade — zaútoč na súperov priestor s mečmi, alebo obsaď sivý voľný priestor.' : 'Na rade je ' + nm(chooser) + ' — vyberá, kam zaútočí…';
  } else if (S.phase === 'modpick') {
    const D = S.duel, tn = dqEsc(M.t[D.t].k), mine = D.a === me;
    banner = mine ? 'Vyber okruh, z ktorého padne otázka.' : nm(D.a) + ' vyberá okruh otázky…';
    pop = `<div class="dq-pop modpick"><div class="dq-pop-top"><span>${stage}</span><span class="dq-pop-stage">VÝBER OKRUHU</span><span class="dq-pop-time" id="dq-sec">${Math.ceil(S.tot / 1000)}</span></div>
        <div class="dq-timer"><i class="dq-bar-i"></i></div>
        <div class="dq-pop-ctx">${D.d >= 0 ? `⚔ ${nm(D.a)} útočí na ${tn} hráča ${nm(D.d)}` : `${nm(D.a)} obsadzuje ${tn}`} · ${M.t[D.t].v} b.${D.lvl ? ` · otázka: ${DQ_LVN[D.lvl]}` : ''}</div>
        ${mine ? `<div class="dq-pop-s">Z ktorého okruhu má byť otázka? Výber môžeš meniť, kým ho nepotvrdíš.</div><div class="dq-modgrid"><button class="dq-modbtn rnd${D.ms === '*' ? ' on' : ''}" data-mod="*">🎲 NÁHODNE</button>${S.cfg.mods.map(m => `<button class="dq-modbtn${D.ms === m ? ' on' : ''}" data-mod="${dqEsc(m)}">${dqEsc(dqSetName(m))}</button>`).join('')}</div><div class="dq-endacts"><button class="dq-btn pri" id="dq-modok" ${D.ms ? '' : 'disabled'}>POTVRDIŤ ▶</button></div><div class="dq-numnote">Keď čas vyprší, platí označený okruh; bez výberu sa žrebuje.</div>` : `<div class="dq-pop-q long">${nm(D.a)} vyberá okruh…</div>`}
      </div>`;
  } else if (S.phase === 'duelintro' || S.phase === 'duelq' || S.phase === 'duelrev' || S.phase === 'tieq' || S.phase === 'tierev') {
    const D = S.duel, tn = dqEsc(M.t[D.t].k);
    banner = D.d >= 0 ? `⚔ ${nm(D.a)} útočí na ${tn} hráča ${nm(D.d)}` : `${nm(D.a)} obsadzuje voľný priestor ${tn}`;
    if (S.phase === 'duelintro' && DQ.toastK !== S.k) { DQ.toastK = S.k; toast(`<small>${D.d >= 0 ? 'ÚTOK' : 'VOĽNÝ PRIESTOR'}${D.lvl ? ' · OTÁZKA ' + DQ_LVN[D.lvl] : ''}</small><div class="dq-vs"><span style="--c:${dqC(D.a)}"><i>${dqI(D.a)}</i>${nm(D.a)}</span><u>${D.d >= 0 ? 'VS' : '→'}</u>${D.d >= 0 ? `<span style="--c:${dqC(D.d)}"><i>${dqI(D.d)}</i>${nm(D.d)}</span>` : `<span class="free"><i>◯</i>${tn}</span>`}</div><em>${tn} · ${M.t[D.t].v} b.${D.m && S.cfg.pm ? ' · ' + dqEsc(dqSetName(D.m)) : ''}</em>`, dqC(D.a), 'vs' + (D.d === me ? ' lose' : '')); }
    if (S.phase === 'tieq') banner = `Rozstrel ${D.tn || 1} / 3 o ${tn}: ${nm(D.a)} proti ${nm(D.d)} — vyhráva presnejší tip${(D.tn || 1) === 3 ? ', pri rovnakom rýchlejší' : ''}.`;
    if (D.x2 && !S.rev) banner += ' · žolík ' + dqMulTxt(D.x2);
    if (S.rev) banner = sus ? 'Vyhodnocujem…' : dqRevText(S, nm);
    if (S.phase !== 'duelintro') pop = dqPopHTML(S, me, stage, banner);
  } else if (S.phase === 'end') {
    const place = S.rank.indexOf(me), won = place === 0;
    banner = `Vyhráva ${nm(S.rank[0])}.`;
    const conf = won ? `<div class="dq-confetti">${Array.from({ length: 46 }, (x, i) => `<i style="left:${(i * 37 % 100)}%;background:${['#ffd34d', '#3fe39a', '#3a86ff', '#e63946', '#ffffff'][i % 5]};animation-delay:${(i * 0.137 % 3).toFixed(2)}s;animation-duration:${(2.6 + i % 5 * 0.45).toFixed(2)}s"></i>`).join('')}</div>` : '';
    const nW = dqWrong(S).length;
    pop = DQ.peek === S.gid ? '' : DQ.endV === 'errs' ? dqErrsHTML(S) : DQ.endV === 'drill' && DQ.drill ? dqDrillHTML() : `<div class="dq-pop end ${place < 0 ? '' : won ? 'won' : 'lost'}">${conf}
        <div class="dq-pop-top"><span>DOBYVATEĽ</span><span class="dq-pop-stage">KONIEC HRY</span><span></span></div>
        <div class="dq-pop-q">${place < 0 ? '🏆 ' + nm(S.rank[0]) : won ? '🏆 VYHRAL SI!' : place + 1 + '. MIESTO'}</div>
        <div class="dq-pop-s">${won ? 'Slovenský vzdušný priestor je tvoj.' : 'Víťazom partie je ' + nm(S.rank[0]) + '.'}</div>
        ${dqPodiumHTML(S, me)}
        <div class="dq-pop-foot"><em>${S.cfg.demo ? 'Ukážka sa do rebríčka nepočíta.' : (RK.acct ? 'Body sú pripísané v rebríčku.' : 'Nie si prihlásený, body do rebríčka sa ti nepripísali.')}</em></div>
        <div class="dq-endacts">${DQ.demo ? '' : DQ.host ? '<button class="dq-btn pri" id="dq-again">ĎALŠIA HRA ▶</button>' : ''}${nW ? `<button class="dq-btn" id="dq-errs">MOJE CHYBY · ${nW}</button>` : ''}<button class="dq-btn" id="dq-peek">POZRIEŤ MAPU</button><button class="dq-btn" id="dq-leave2">ODÍSŤ</button></div>
      </div>`;
  }
  { /* tréner v ukážke hry */
    const co = $('dq-coach'), ci = DQ.demo ? dqCoachInfo(S, me) : null, cs = ci ? ci[0] + (DQ.demoHold ? '|h' : '') : '';
    st.classList.toggle('demo', !!DQ.demo);
    if (co && cs !== DQ.coSig) {
      DQ.coSig = cs;
      co.innerHTML = ci ? `<div class="dq-coach-in${DQ.demoHold ? ' hold' : ''}"><small>UKÁŽKA HRY${DQ.demoHold ? ' · HRA ČAKÁ NA TEBA' : ''}</small><b>${ci[1]}</b><p>${ci[2]}</p><div>${DQ.demoHold ? '<button class="dq-btn pri" data-co="go">ROZUMIEM, POKRAČUJ ▶</button>' : ''}<button class="dq-btn" data-co="quit">UKONČIŤ UKÁŽKU</button></div></div>` : '';
    }
  }
  avNeed(S.players.filter(p => p.acc && !p.bot).map(p => p.nick));
  $('dq-chips').innerHTML = dqChipsHTML(S, me);
  $('dq-status').classList.toggle('me', myTurn);
  $('dq-st-a').textContent = stage; $('dq-st-b').innerHTML = banner;
  $('dq-unpeek').style.display = S.phase === 'end' && !pop ? '' : 'none';
  /* zoznam na výber priestoru — len na dotykových zariadeniach, keď som na rade */
  const pkOn = myTurn && dqPicking(S) && dqCoarse(), pkSig = pkOn ? S.k + '|' + DQ.sel : '';
  if (pkSig !== DQ.pkSig) { DQ.pkSig = pkSig; const pk = $('dq-picker'); pk.className = pkOn ? 'on' : ''; pk.innerHTML = pkOn ? dqPickerHTML(S) : ''; }
  /* mapa — len keď sa na nej niečo zmenilo */
  const mapSig = JSON.stringify([S.map, S.own, S.allowed, S.base, S.lives, dqDuelOn(S) ? S.duel : 0, S.phase === 'warpick' ? S.chooser : -1, mineTurn && dqPicking(S), mineTurn && dqPicking(S) ? DQ.sel : -1, DQ.fx.map(f => f.t + ':' + f.t0)]);
  if (mapSig !== DQ.mapSig) {
    DQ.mapSig = mapSig;
    $('dq-maph').innerHTML = dqMapSVG(S, me);
    if (S.duel) $('dq-info').innerHTML = dqTerrInfo(S.duel.t, S);
  }
  /* okno s otázkou — príchod sa animuje len pri novom okne, odchod plynulo zhasne */
  const popSig = pop ? S.k + '|' + JSON.stringify(DQ.my) + '|' + S.answered.join(',') + '|' + (S.rev ? 1 : 0) + '|' + (DQ.repK === S.gid + S.k ? 'r' : '') + '|' + (DQ.ui || 0) + '|' + (S.phase === 'modpick' && S.duel ? S.duel.ms || '' : '') + '|' + (sus ? 's' : '') + '|' + (S.q ? JSON.stringify([S.q.hid && S.q.hid[me], S.tot]) : '') + (S.duel && S.duel.x2 ? 'x' : '') + JSON.stringify((S.players[me] && S.players[me].jk) || 0) : '';
  if (popSig !== DQ.popSig) {
    DQ.popSig = popSig;
    const ph = $('dq-poph');
    clearTimeout(DQ.popT);
    if (pop) {
      ph.className = 'dq-pop-wrap' + (DQ.popK === S.k ? ' still' : '');
      const oldIn = $('dq-numin'), keepV = oldIn ? oldIn.value : '', hadFocus = oldIn && document.activeElement === oldIn;
      /* okno sa pri každej zmene (niekto iný odpovedal, tvoj výber, fotka) nakreslí nanovo — posun v ňom a pole s číslom si pamätáme, aby sa nič nescrolluje späť hore */
      const oldPop = ph.querySelector('.dq-pop'), keepTop = oldPop && DQ.popK === S.k ? oldPop.scrollTop : 0;
      ph.innerHTML = pop;
      const newPop = ph.querySelector('.dq-pop'); if (newPop && keepTop) newPop.scrollTop = keepTop;
      const newIn = $('dq-numin'); if (newIn) { newIn.value = keepV; if (hadFocus || DQ.popK !== S.k) newIn.focus({ preventScroll: true }); }
      DQ.popK = S.k;
      const ib = ph.querySelector('.dq-pop-img');
      if (ib && !ib.querySelector('img')) dqPhoto(ib.dataset.img).then(src => { if (ib.isConnected && !ib.querySelector('img')) ib.innerHTML = src ? `<img src="${dqEsc(src)}" alt="">` : '<span>Fotku sa nepodarilo načítať — skús tipnúť.</span>'; });
    } else if (ph.innerHTML) {
      ph.classList.add('out');
      DQ.popT = setTimeout(() => { ph.className = ''; ph.innerHTML = ''; }, 340);
    }
  }
  /* časovač beží ako jedna plynulá animácia, nie po krokoch */
  const tot = S.tot || 0, left0 = Math.max(0, DQ.deadline - Date.now());
  st.querySelectorAll('.dq-bar-i').forEach(b => {
    const bk = S.k + ':' + (S.tot || 0);      // pri žolíku +10 s sa pás rozbehne nanovo
    if (b.dataset.k === bk) return;
    b.dataset.k = bk; b.style.animation = 'none';
    if (tot && S.phase !== 'end' && !S.rev) { void b.offsetWidth; b.style.animation = `dqBar ${tot}ms linear ${-(tot - left0)}ms both, dqBarC ${tot}ms linear ${-(tot - left0)}ms both`; }
    else b.style.transform = 'scaleX(0)';
  });
  const up = () => {
    const Z = DQ.S; if (!Z) return;
    const left = Math.max(0, DQ.deadline - Date.now()), secEl = $('dq-sec'), cn = $('dq-count'), iAm = dqMe();
    /* posledné tri sekundy: okraj obrazovky pulzuje — len keď sa čaká na mňa */
    const act = (dqAsking(Z) && !Z.rev && Z.q && Z.q.who.indexOf(iAm) >= 0 && !DQ.my) || (dqPicking(Z) && Z.chooser === iAm) || (Z.phase === 'modpick' && Z.duel && Z.duel.a === iAm);
    st.classList.toggle('dq-hurry', !!act && left > 0 && left < 3000);
    if (secEl && !Z.rev) { const v = String(Math.ceil(left / 1000)); if (secEl.textContent !== v) secEl.textContent = v; secEl.classList.toggle('low', left < (Z.tot || 0) * 0.3); }
    if (cn) { const v = left > 2700 ? '3' : left > 1800 ? '2' : left > 900 ? '1' : 'GO!'; if (cn.dataset.v !== v) { cn.dataset.v = v; cn.innerHTML = `<b class="${v === 'GO!' ? 'go' : ''}">${v}</b>`; } }
  };
  up(); if (tot && S.phase !== 'end') DQ.bar = setInterval(up, 100);
}
