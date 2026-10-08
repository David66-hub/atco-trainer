/* ============================================================
   POZADIE — rozmazaný radar
   Otáčajúci sa lúč, kruhy dosahu a ciele, ktoré sa pomaly hýbu a
   rozsvietia sa, keď cez ne lúč prejde. Kreslí sa v polovičnom
   rozlíšení a CSS ho rozmaže, takže nezaťažuje a neruší text.
   Pri vypnutých animáciách v systéme sa nakreslí len jeden obraz.
   ============================================================ */
(function radarBackground() {
  const c = document.createElement('canvas');
  c.id = 'radar-bg';
  document.body.insertBefore(c, document.body.firstChild);
  const g = c.getContext('2d');
  if (!g) return;
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, cx = 0, cy = 0, R = 0, ang = 0, last = 0;
  const TAU = Math.PI * 2, blips = [];
  function spawn(b) {
    const a = Math.random() * TAU, r = R * (0.12 + Math.random() * 0.82);
    b.x = cx + Math.cos(a) * r; b.y = cy + Math.sin(a) * r;
    b.h = Math.random() * TAU; b.v = 3 + Math.random() * 6; b.lit = Math.random() * 0.6; b.tr = []; b.acc = 0;
    return b;
  }
  function size() {
    W = c.width = Math.max(240, Math.ceil(window.innerWidth / 3));
    H = c.height = Math.max(180, Math.ceil(window.innerHeight / 3));
    cx = W * 0.5; cy = H * 0.52; R = Math.hypot(W, H) * 0.58;
    if (!blips.length) for (let i = 0; i < 16; i++) blips.push(spawn({}));
  }
  function draw(dt) {
    const bg = g.createRadialGradient(cx, cy, 0, cx, cy, R);
    bg.addColorStop(0, '#0d2a20'); bg.addColorStop(0.6, '#081a14'); bg.addColorStop(1, '#040d0a');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    /* kruhy dosahu a osi */
    g.lineWidth = 1;
    for (let i = 1; i <= 6; i++) {
      g.strokeStyle = 'rgba(90,220,160,' + (i % 2 ? 0.10 : 0.16) + ')';
      g.beginPath(); g.arc(cx, cy, R * i / 6, 0, TAU); g.stroke();
    }
    g.strokeStyle = 'rgba(90,220,160,0.08)';
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 6;
      g.beginPath(); g.moveTo(cx - Math.cos(a) * R, cy - Math.sin(a) * R); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke();
    }
    /* lúč: žiara, ktorá sa ťahá za čelom lúča */
    if (g.createConicGradient) {
      const sw = g.createConicGradient(ang, cx, cy);
      sw.addColorStop(0, 'rgba(70,235,160,0)'); sw.addColorStop(0.78, 'rgba(70,235,160,0)');
      sw.addColorStop(0.97, 'rgba(70,235,160,0.20)'); sw.addColorStop(1, 'rgba(150,255,205,0.42)');
      g.fillStyle = sw; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill();
    }
    g.strokeStyle = 'rgba(170,255,215,0.55)'; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); g.stroke();
    /* ciele */
    blips.forEach(b => {
      b.x += Math.cos(b.h) * b.v * dt; b.y += Math.sin(b.h) * b.v * dt;
      b.acc += dt;
      if (b.acc > 1.1) { b.acc = 0; b.tr.push([b.x, b.y]); if (b.tr.length > 5) b.tr.shift(); }
      const d = Math.hypot(b.x - cx, b.y - cy);
      if (d > R * 1.02) { spawn(b); return; }
      /* lúč práve prešiel cez cieľ → rozsvieti sa a pomaly hasne */
      const ba = (Math.atan2(b.y - cy, b.x - cx) + TAU) % TAU;
      const diff = (ang - ba + TAU) % TAU;
      if (diff < 0.09) b.lit = 1;
      b.lit = Math.max(0.12, b.lit - dt * 0.24);
      b.tr.forEach((p, i) => { g.fillStyle = 'rgba(120,255,190,' + (b.lit * 0.25 * (i + 1) / b.tr.length) + ')'; g.fillRect(p[0] - 1, p[1] - 1, 2, 2); });
      g.fillStyle = 'rgba(190,255,225,' + b.lit + ')';
      g.fillRect(b.x - 2, b.y - 2, 4, 4);
      g.strokeStyle = 'rgba(150,255,205,' + (b.lit * 0.55) + ')'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x + Math.cos(b.h) * 9, b.y + Math.sin(b.h) * 9); g.stroke();
    });
  }
  /* pozadie je len kulisa: 20 obrázkov za sekundu stačí a nechá výkon na samotnú stránku; počas hry a keď kartu nevidno, stojí */
  function frame(ts) {
    if (!still) requestAnimationFrame(frame);
    if (document.hidden || document.body.classList.contains('dq-live') || document.body.classList.contains('fs-on')) { last = 0; return; }
    if (last && ts - last < 48) return;
    const dt = last ? Math.min(0.12, (ts - last) / 1000) : 0;
    last = ts;
    ang = (ang + dt * 0.75) % TAU;
    draw(dt);
  }
  size();
  window.addEventListener('resize', () => { size(); if (still) draw(0); });
  if (still) { ang = 0.9; draw(0); } else requestAnimationFrame(frame);
  /* keď je karta skrytá, prehliadač slučku sám pozastaví — nakresli aspoň prvý obraz */
  draw(0);
})();

apLoadProgress();
renderWeak();
startMode('home');
