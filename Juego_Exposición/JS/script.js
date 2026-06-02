/* ── READ STATE ── */
const params    = new URLSearchParams(window.location.search);
const estado    = params.get('estado') ?? 'bien';
const isGood    = estado === 'bien';
const score     = parseInt(localStorage.getItem('codemaster_score') ?? 0);
const current   = parseInt(localStorage.getItem('codemaster_current') ?? 0);
const total     = parseInt(localStorage.getItem('codemaster_total') ?? 10);

/* ── THEME ── */
const root = document.documentElement;
if (isGood) {
  root.style.setProperty('--accent-a', '#00e676');
  root.style.setProperty('--accent-b', '#00aaff');
  root.style.setProperty('--glow-col', 'rgba(0,230,118,.3)');
} else {
  root.style.setProperty('--accent-a', '#ff4444');
  root.style.setProperty('--accent-b', '#ff8800');
  root.style.setProperty('--glow-col', 'rgba(255,40,40,.3)');
}

/* ── POPULATE ── */
document.getElementById('result-icon').textContent    = isGood ? '🎉' : '😅';
document.getElementById('result-label').textContent   = isGood ? 'RESPUESTA CORRECTA' : 'RESPUESTA INCORRECTA';
document.getElementById('result-message').textContent = isGood
  ? '¡Lo has hecho muy bien, vamos a la próxima!'
  : 'Cometiste un error, suerte en la próxima';
document.getElementById('result-sub').textContent = isGood
  ? 'Excelente dominio de las convenciones de nomenclatura. Sigue así y llegarás al tope del escalafón.'
  : 'No te desanimes. Cada error es una oportunidad de aprender buenas prácticas de programación.';
document.getElementById('score-text').textContent = `${score.toLocaleString()} pts`;

const nextQ = current + 1;
const isLast = nextQ >= total;
const btnEl  = document.getElementById('action-btn');
document.getElementById('btn-icon').textContent = isLast ? '🏆' : '▶';
document.getElementById('btn-text').textContent = isLast ? 'Ver resultados finales' : (isGood ? 'Continuar →' : 'Intentar siguiente →');
btnEl.className = `action-btn ${isGood ? 'success' : 'fail'}`;
btnEl.href = 'index.html';

const progressLabel = document.getElementById('progress-label');
progressLabel.textContent = `PREGUNTA ${nextQ} DE ${total}`;
setTimeout(() => {
  document.getElementById('progress-fill').style.width = `${(nextQ / total) * 100}%`;
}, 100);

/* ── RING (success only) ── */
if (isGood) document.getElementById('ring').classList.add('active');

/* ── SHAKE (fail only) ── */
if (!isGood) {
  setTimeout(() => document.getElementById('result-card').classList.add('shake'), 400);
}

/* ── BLOB ── */
const blob = document.getElementById('blob');
blob.style.background = isGood
  ? 'radial-gradient(circle, #00e676, #0066ff)'
  : 'radial-gradient(circle, #ff1744, #6a1b9a)';
blob.style.top  = `${window.innerHeight * .1}px`;
blob.style.left = `${window.innerWidth * .2}px`;
setTimeout(() => blob.classList.add('show'), 100);

/* ── PARTICLES ── */
function spawnParticles() {
  const colors = isGood
    ? ['#00e676','#00aaff','#ffd700','#cc44ff']
    : ['#ff1744','#ff6d00','#9c27b0','#ff4444'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size  = Math.random() * 12 + 5;
    const angle = Math.random() * Math.PI * 2;
    const dist  = Math.random() * 240 + 80;
    const dur   = (Math.random() * 0.6 + 0.7).toFixed(2);
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${window.innerWidth/2}px;
      top:${window.innerHeight/2}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      --dx:${Math.cos(angle)*dist}px;
      --dy:${Math.sin(angle)*dist}px;
      --dur:${dur}s;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), dur * 1000 + 100);
  }
}
setTimeout(spawnParticles, 300);
if (isGood) setTimeout(spawnParticles, 800);

/* ── STAR/SPARK BG CANVAS ── */
(function() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = Array.from({ length: 140 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.3 + .2,
      a: Math.random() * Math.PI * 2,
      speed: Math.random() * .005 + .001,
      color: isGood
        ? (Math.random() > .5 ? '#00e676' : '#00aaff')
        : (Math.random() > .5 ? '#ff4444' : '#cc44ff')
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.a += s.speed;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = (Math.sin(s.a) + 1) / 2 * .7 + .1;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createStars(); });
  resize(); createStars(); draw();
})();