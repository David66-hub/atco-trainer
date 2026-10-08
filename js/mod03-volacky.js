/* ============================================================
   MOD 03 — ROZŠÍRENIA
   balíčky po 20 · kartičky · zoznam · výber z možností · smer ·
   delenie na „kód vo volačke" a „bez súvisu" · opakovanie chýb
   ------------------------------------------------------------
   Vyše tisíc volačiek sa naraz naučiť nedá. Preto sa dajú krájať
   na malé balíčky a oddeliť tie, kde kód vidno priamo vo volačke
   (RYR → RYANAIR), od tých, ktoré treba naozaj vedieť naspamäť
   (BAW → SPEEDBIRD).
   ============================================================ */
/* Obrázok prevádzkovateľa: úvodný obrázok jeho článku na Wikipédii
   (väčšinou logo, niekedy lietadlo). Načíta sa až keď ho treba; ak
   článok alebo obrázok neexistuje, rámček jednoducho zmizne. */
const csPhotoCache = {};
function csPhotoSlot(cs) {
  const src = (CS_BY_ICAO[cs.icao] || [cs]).find(c => c.wiki);
  if (!src) return '';
  /* prázdny obrázok hneď zlyhá a tým spustí načítanie do svojho rámčeka */
  return `<div class="cs-photo"><img src="data:," alt="" style="display:none" onerror="csLoadPhoto(this.parentNode,'${cs.icao}')"></div>`;
}
function csLoadPhoto(box, icao) {
  const cs = (CS_BY_ICAO[icao] || []).find(c => c.wiki);
  if (!cs) { box.remove(); return; }
  const show = url => {
    if (!url) { box.remove(); return; }
    box.innerHTML = `<img src="${url}" alt="" onerror="this.parentNode.remove()">
      <span><strong>${cs.airline}</strong>${cs.country}<br><span class="cs-src">OBRÁZOK: WIKIPÉDIA</span></span>`;
  };
  if (icao in csPhotoCache) { show(csPhotoCache[icao]); return; }
  fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(cs.wiki.replace(/ /g, '_')), { headers: { 'Accept': 'application/json' } })
    .then(r => r.ok ? r.json() : null)
    .then(d => { csPhotoCache[icao] = (d && d.thumbnail && d.thumbnail.source) || ''; show(csPhotoCache[icao]); })
    .catch(() => { box.remove(); });
}

const CS_PACK = 20;
/* písmená kódu idú vo volačke v rovnakom poradí za sebou */
function csLogical(cs) {
  const f = cs.call.replace(/[^A-Z]/g, '');
  let i = 0;
  for (let k = 0; k < f.length && i < 3; k++) if (f.charAt(k) === cs.icao.charAt(i)) i++;
  return i === 3;
}
CALLSIGNS.forEach(cs => { cs.logical = csLogical(cs); });

/* Ako často sa prevádzkovateľ objavil na simulátore (počet lietadiel).
   Čím vyššie číslo, tým dôležitejšie je volačku vedieť: v cvičení príde
   skôr a tie najčastejšie aj viackrát. Kto v tabuľke nie je, má váhu 1.
   V tabuľke bolo aj 56 kódov, ktoré v dokumente s volačkami nie sú
   (väčšinou registračné značky) — tie tu chýbajú, lebo nemajú volačku. */
const CS_FREQ = { AUA:132, WZZ:100, RYR:93, AFL:64, TVS:60, AUI:53, THY:43, SAS:41, DLH:36, BAW:32, LOT:32, BER:31, FIN:30, EZY:28, ENT:26, IBK:25, KLM:25, NAX:24, UAE:24, ABG:23, CSA:23, GWI:21, KTK:19, QTR:19, AFR:17, BMS:17, BUC:17, ABW:16, AEE:16, ABP:14, BCS:14, JTG:14, RCH:14, AAR:13, CAL:13, ETD:12, LLP:12, PBD:12, AOJ:11, EXS:11, BEL:10, RRR:10, SBI:9, AAB:8, ASL:8, AZA:8, FDB:8, NJE:8, NWS:8, AIC:7, BTI:7, CCA:7, EWG:7, KKK:7, NVR:7, SDM:7, SXS:7, TRA:7, VKG:7, ACA:6, BGH:6, CAI:6, CFG:6, DTR:6, LDM:6, MLD:6, PRI:6, SVR:6, TVQ:6, AXY:5, EAT:5, PGT:5, VIM:5, ADR:4, AZI:4, BRU:4, DWT:4, ELY:4, FRF:4, GZP:4, LLC:4, OHY:4, QGA:4, TVP:4, UAL:4, AAL:3, ADN:3, AHO:3, AMQ:3, AYY:3, BAF:3, BPS:3, BRK:3, CCC:3, CLX:3, EIN:3, EVA:3, JSY:3, LZB:3, MON:3, MSA:3, PLF:3, QQE:3, RLX:3, ROT:3, SCW:3, TAY:3, THA:3, TWI:3, ABF:2, AUL:2, BLX:2, CMB:2, DCS:2, ELJ:2, ETI:2, FTL:2, GAF:2, GLP:2, GMI:2, HVN:2, JAI:2, JBC:2, JEI:2, JSH:2, KAR:2, LLM:2, MAR:2, MJF:2, MLM:2, MOZ:2, OMA:2, RJA:2, ROF:2, SIA:2, SOO:2, SVA:2, TIE:2, TTJ:2, TVF:2, TYA:2, UTA:2, VLG:2, VMP:2, AIZ:1, AZE:1, BOH:1, BOX:1, CKS:1, CPA:1, CTM:1, CVK:1, DFC:1, FNY:1, GDK:1, GFA:1, GIA:1, GLJ:1, IRA:1, JAR:1, JDI:1, KAL:1, KRP:1, LXG:1, MAS:1, MGX:1, MHV:1, MLT:1, MMD:1, MNB:1, NFA:1, PNC:1, QFA:1, RSY:1, SQF:1, SSG:1, SVW:1, SXD:1, TCX:1, TFL:1, TWG:1, TYW:1, UKN:1, ULC:1, UPS:1, VJT:1, VPC:1 };
CALLSIGNS.forEach(cs => { cs.freq = CS_FREQ[cs.icao] || 1; cs.sim = cs.icao in CS_FREQ; });
function csInCat(c, cat) { return cat === 'all' || (cat === 'top' ? c.sim : c.cat === cat); }
/* Vážené žrebovanie poradia: každá otázka dostane kľúč náhoda^(1/váha)
   a radí sa od najväčšieho. Váha 132 teda takmer vždy predbehne váhu 2,
   ale poradie nie je zakaždým rovnaké. */
function csWeightedOrder(list) {
  return list.map(q => ({ q, k: Math.pow(Math.random(), 1 / q.w) })).sort((a, b) => b.k - a.k).map(x => x.q);
}
function csHighlight(cs) {
  if (!cs.logical) return cs.call;
  let i = 0;
  return cs.call.split('').map(ch => (i < 3 && ch === cs.icao.charAt(i)) ? (i++, `<u>${ch}</u>`) : ch).join('');
}
/* výber podľa kategórie, písmena a typu — ešte pred krájaním na balíčky */
function csSelection() {
  const F = state.filters;
  let pool = CALLSIGNS;
  if (F.callsignCat !== 'all') pool = pool.filter(c => csInCat(c, F.callsignCat));
  if (F.csLetter !== 'all') pool = pool.filter(c => c.icao.charAt(0) === F.csLetter);
  if (F.csKind === 'logical') pool = pool.filter(c => c.logical);
  if (F.csKind === 'hard') pool = pool.filter(c => !c.logical);
  /* podľa dôležitosti: najčastejšie sú hore, takže balíček 1 = 20 najpoužívanejších */
  if (F.csOrder === 'freq') pool = pool.slice().sort((a, b) => b.freq - a.freq);
  return pool;
}
function csPool() {
  const F = state.filters, sel = csSelection();
  if (F.csPack > Math.ceil(sel.length / CS_PACK)) F.csPack = 0;
  return F.csPack ? sel.slice((F.csPack - 1) * CS_PACK, F.csPack * CS_PACK) : sel;
}

/* ---------- KARTIČKY: odpoveď si povieš sám a ohodnotíš sa ---------- */
function renderCsCard(q, card) {
  const i2c = q.subtype === 'icao-to-call';
  card.innerHTML = `
    <div class="qmeta">OPERATOR CALL <span class="sep">·</span> KARTIČKY <span class="sep">·</span> ${i2c ? 'ICAO → TELEPHONY' : 'TELEPHONY → ICAO'}</div>
    <div class="big-prompt${i2c ? '' : ' small'}">${i2c ? q.data.icao : '"' + q.data.call + '"'}</div>
    <div class="cs-back" id="cs-back">?</div>
    <div class="cs-acts" id="cs-acts"><button class="btn" id="cs-show">UKÁŽ ODPOVEĎ <span class="cs-key">medzerník</span></button></div>
    <div class="prompt-hint" style="margin-top:14px">— povedz si odpoveď nahlas, až potom ju odkry —</div>
  `;
  apRetryBadge(q);
  document.getElementById('cs-show').onclick = csCardShow;
}
function csCardShow() {
  const q = state.current, back = document.getElementById('cs-back');
  if (!q || !back || back.dataset.open) return;
  back.dataset.open = '1';
  const i2c = q.subtype === 'icao-to-call', cs = q.data;
  back.innerHTML = (i2c ? q.group.map(c => '"' + csHighlight(c) + '"').join(' / ') : q.group.map(c => c.icao).join(' / ')) +
    (cs.airline ? `<small>${cs.airline} · ${cs.country}</small>` : '') +
    (cs.sim ? `<small>na simulátore ${cs.freq}×</small>` : '') +
    (cs.logical ? '' : '<small class="hard">kód sa z volačky nedá vyčítať — treba ho vedieť</small>') +
    csPhotoSlot(cs);
  back.classList.add('open');
  document.getElementById('cs-acts').innerHTML = `
    <button class="btn" id="cs-yes">✓ VEDEL SOM <span class="cs-key">1</span></button>
    <button class="btn ghost" id="cs-no">✗ NEVEDEL SOM <span class="cs-key">2</span></button>`;
  document.getElementById('cs-yes').onclick = () => csCardRate(true);
  document.getElementById('cs-no').onclick = () => csCardRate(false);
}
function csCardRate(ok) {
  const q = state.current;
  if (!q) return;
  if (ok) {
    state.correct++; state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  } else {
    state.wrong++; state.streak = 0;
    state.mistakes[q.id] = (state.mistakes[q.id] || 0) + 1;
    wkLog(q, '— nevedel som —');
  }
  renderStats(); renderWeak();
  apAfterAnswer(q, ok);
  nextQuestion();
}
document.addEventListener('keydown', e => {
  if (state.mode !== 'callsign' || state.filters.csMode !== 'cards' || !state.current) return;
  if (document.getElementById('cs-show')) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); csCardShow(); }
  } else if (document.getElementById('cs-yes')) {
    if (e.key === '1') csCardRate(true);
    if (e.key === '2') csCardRate(false);
  }
});

/* ---------- ZOZNAM: prečítať, zakryť stĺpec, odkrývať klikom ---------- */
function renderCsList(card) {
  const sel = csPool(), hide = state.csHide || 'none';
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = sel.length + ' volačiek';
  const cells = sel.map(cs => `<div class="cs-cell${cs.logical ? '' : ' hard'}">
      <span class="cs-i${hide === 'icao' ? ' hid' : ''}">${cs.icao}</span>
      <span class="cs-c${hide === 'call' ? ' hid' : ''}">${csHighlight(cs)}</span>
      ${cs.sim ? `<span class="cs-f" data-tipx="1">${cs.freq}×</span>` : ''}
      ${hide === 'none' && cs.airline ? `<span class="cs-a">${cs.airline}</span>` : ''}
    </div>`).join('');
  const b = (v, t) => `<button class="filter-chip ${hide === v ? 'on' : ''}" data-cshide="${v}">${t}</button>`;
  card.innerHTML = `
    <div class="qmeta">OPERATOR CALL <span class="sep">·</span> ZOZNAM NA UČENIE</div>
    <div class="cs-list-bar">${b('none', 'UKÁZAŤ VŠETKO')}${b('call', 'ZAKRYŤ VOLAČKY')}${b('icao', 'ZAKRYŤ KÓDY')}</div>
    <div class="study-tip" style="text-align:left;margin:8px 0 12px">Zakryté políčko odkryješ kliknutím. Oranžový pruh = kód sa z volačky nedá vyčítať. Podčiarknuté písmená = kód ukrytý vo volačke. Číslo s × = koľkokrát sa prevádzkovateľ objavil na simulátore.</div>
    <div class="cs-list">${cells || '<span class="weak-empty">— vo výbere nie je žiadna volačka —</span>'}</div>
  `;
  card.querySelectorAll('[data-cshide]').forEach(x => { x.onclick = () => { state.csHide = x.dataset.cshide; renderQuestion(); }; });
  card.querySelector('.cs-list').addEventListener('click', e => {
    const t = e.target.closest('.hid');
    if (t) t.classList.remove('hid');
  });
}
