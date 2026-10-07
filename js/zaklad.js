/* ============================================================
   STATE
   ============================================================ */
const state = {
  mode: 'home',
  queue: [], current: null, index: 0, total: 0,
  correct: 0, wrong: 0, streak: 0, bestStreak: 0,
  mistakes: {},
  filters: { dAns: 'choice', dCount: 25, exN: 30, exMin: 10, acMode: 'id', hcKind: 'all', coMode: 'cop', coAns: 'choice', coNb: 'all', coTable: 'D.2.1', coWeak: false, hgMode: 'static', hgDiff: 'easy', hgKind: 'gate', hgNames: 'on', hgRose: 'off', wake: 'all', airportCat: 'all', apMode: 'quiz', apAns: 'choice', acAns: 'choice', apPx: 'doc', apWeak: false, callsignCat: 'all', wpDiff: 'easy', csLetter: 'all', csOrder: 'freq', csMode: 'quiz', csAns: 'choice', csDir: 'both', csKind: 'all', csPack: 0, csWeak: false, wpGrp: 'all', wpMode: 'quiz', wpBorder: 'all' },
  hintsUsed: 0,
  apOk: {},       // MOD 02: koľkokrát po sebe správne (ukladá sa)
  sr: {},         // opakovanie cez dni: id → { b: priečinok, due: deň }
  last: {},       // kedy sa modul naposledy cvičil
  dailyDone: 0, exam: null,
};

/* ============================================================
   HELPERS - shuffle, normalize, levenshtein, matching
   ============================================================ */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function normalize(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]/g, '').trim();
}
function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({length:m+1}, () => new Array(n+1).fill(0));
  for (let i=0;i<=m;i++) dp[i][0]=i;
  for (let j=0;j<=n;j++) dp[0][j]=j;
  for (let i=1;i<=m;i++) for (let j=1;j<=n;j++) {
    const cost = a[i-1]===b[j-1]?0:1;
    dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
  }
  return dp[m][n];
}
function matches(userInput, candidates) {
  const u = normalize(userInput);
  if (!u) return false;
  for (const c of candidates) {
    const n = normalize(c);
    if (!n) continue;
    if (u === n) return true;
    const tol = n.length >= 10 ? 2 : (n.length >= 5 ? 1 : 0);
    if (lev(u, n) <= tol) return true;
  }
  return false;
}
