/* ── QUESTIONS DATABASE ── */
const QUESTIONS = [
  {
    category: "VARIABLES",
    prize: 100,
    text: "¿Cuál es el mejor nombre para una variable que almacena la <strong>edad de un usuario</strong>?",
    options: ["x", "n", "edadUsuario", "tmp"],
    correct: 2
  },
  {
    category: "CONVENCIONES",
    prize: 200,
    text: "¿Qué error existe en este código?",
    code: `let user_name;\nlet edadUsuario;`,
    options: [
      "No hay ningún error",
      "Mezcla de convenciones de nombres",
      "Las variables no están inicializadas",
      "El tipo de dato es incorrecto"
    ],
    correct: 1
  },
  {
    category: "CLARIDAD",
    prize: 300,
    text: "¿Cuál nombre de función es más claro y describe mejor su propósito?",
    options: ["calcTtl", "calc", "calcularTotal", "ct"],
    correct: 2
  },
  {
    category: "BOOLEANOS",
    prize: 500,
    text: "¿Cuál variable booleana está <strong>correctamente nombrada</strong> según las convenciones estándar?",
    options: ["active", "usuario", "isActive", "data"],
    correct: 2
  },
  {
    category: "CLASES",
    prize: 1000,
    text: "¿Cuál es la convención correcta para nombrar una <strong>clase</strong> en la mayoría de lenguajes orientados a objetos?",
    options: ["usuario_perfil", "usuarioPerfil", "USUARIO_PERFIL", "UsuarioPerfil"],
    correct: 3
  },
  {
    category: "FUNCIONES",
    prize: 2000,
    text: "¿Cuál es el error en este nombre de función?",
    code: `function d(u) {\n  return u.name;\n}`,
    options: [
      "Falta el punto y coma",
      "El nombre 'd' no describe qué hace la función",
      "El parámetro debería ser un array",
      "No hay error, es válido"
    ],
    correct: 1
  },
  {
    category: "CONSTANTES",
    prize: 4000,
    text: "¿Cómo se deben nombrar las <strong>constantes globales</strong> según la convención más extendida?",
    options: ["miConstante", "MiConstante", "MI_CONSTANTE", "miconstante"],
    correct: 2
  },
  {
    category: "ABREVIACIONES",
    prize: 8000,
    text: "¿Cuál de estas variables tiene un nombre que puede generar confusión en un equipo de desarrollo?",
    options: ["calcularDescuento", "totalProductos", "usrNm", "obtenerPrecio"],
    correct: 2
  },
  {
    category: "PREFIJOS",
    prize: 16000,
    text: "Selecciona el nombre <strong>más descriptivo</strong> para una función que comprueba si un usuario tiene permisos de administrador:",
    options: ["permiso()", "check()", "verificar()", "hasAdminPermissions()"],
    correct: 3
  },
  {
    category: "BUENAS PRÁCTICAS",
    prize: 32000,
    text: "¿Cuál fragmento de código sigue <strong>mejor</strong> las convenciones de nomenclatura?",
    code: `// Opción A\nconst d = new Date();\nconst u = getUser();\n\n// Opción B\nconst currentDate = new Date();\nconst currentUser = getUser();`,
    options: [
      "Opción A — es más corta",
      "Opción B — los nombres son descriptivos",
      "Ambas son igualmente válidas",
      "Ninguna sigue las convenciones"
    ],
    correct: 1
  }
];

const PRIZES = [100,200,300,500,1000,2000,4000,8000,16000,32000];
const LABELS = ['A','B','C','D'];

/* ── GAME STATE ── */
let state = {
  current: 0,
  score: 0,
  timer: 30,
  timerInterval: null,
  answered: false,
  ll50Used: false,
  llSkipUsed: false,
  llHintUsed: false,
  hiddenOptions: []
};

/* ── STARS ── */
(function initStars() {
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + .2,
      a: Math.random(),
      speed: Math.random() * .004 + .001,
      color: Math.random() > .6 ? '#cc44ff' : Math.random() > .5 ? '#00aaff' : '#ffffff'
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.speed;
      const alpha = (Math.sin(s.a) + 1) / 2 * .8 + .1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createStars(); });
  resize(); createStars(); draw();
})();

/* ── BUILD PRIZE LADDER ── */
function buildLadder() {
  const el = document.getElementById('prize-ladder');
  el.innerHTML = PRIZES.map((p, i) => `
    <div class="ladder-item" id="ladder-${i}">
      <span class="ladder-num">${i + 1}</span>
      <span class="ladder-pts">💰 ${p.toLocaleString()}</span>
    </div>`).join('');
}

function updateLadder() {
  PRIZES.forEach((_, i) => {
    const el = document.getElementById(`ladder-${i}`);
    el.className = 'ladder-item';
    if (i < state.current) el.classList.add('done');
    if (i === state.current) el.classList.add('active');
  });
}

/* ── RENDER QUESTION ── */
function renderQuestion() {
  const q = QUESTIONS[state.current];
  const total = QUESTIONS.length;

  document.getElementById('q-badge').textContent = `PREGUNTA ${state.current + 1} / ${total}`;
  document.getElementById('q-category').textContent = q.category;
  document.getElementById('q-prize').textContent = `💰 ${q.prize.toLocaleString()} pts`;

  // Question text + optional code
  let html = q.text;
  if (q.code) {
    const highlighted = q.code
      .replace(/\b(let|const|function|return|new)\b/g, '<span class="kw">$1</span>')
      .replace(/\/\/.*/g, m => `<span class="str">${m}</span>`);
    html += `<div class="code-block">${highlighted}</div>`;
  }
  document.getElementById('question-text').innerHTML = html;

  // Options
  const grid = document.getElementById('options-grid');
  grid.innerHTML = q.options.map((opt, i) => `
    <button class="option-btn" id="opt-${i}" onclick="selectOption(${i})">
      <span class="option-label">${LABELS[i]}</span>
      <span>${opt}</span>
    </button>`).join('');

  // Update HUD
  const pct = (state.current / total) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('score-display').textContent = `⭐ ${state.score.toLocaleString()} pts`;

  state.answered = false;
  state.hiddenOptions = [];
  startTimer();
  updateLadder();
}

/* ── TIMER ── */
function startTimer() {
  clearInterval(state.timerInterval);
  state.timer = 30;
  updateTimerDisplay();
  state.timerInterval = setInterval(() => {
    state.timer--;
    updateTimerDisplay();
    if (state.timer <= 0) {
      clearInterval(state.timerInterval);
      timeUp();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('timer-display');
  el.textContent = state.timer;
  el.className = 'hud-timer' + (state.timer <= 10 ? ' urgent' : '');
}

function timeUp() {
  if (state.answered) return;
  state.answered = true;
  disableOptions();
  showFeedback('⏱️ ¡Tiempo agotado!', 'bad');
  highlightCorrect();
  setTimeout(() => redirectResult(false), 1800);
}

/* ── SELECT OPTION ── */
function selectOption(idx) {
  if (state.answered) return;
  state.answered = true;
  clearInterval(state.timerInterval);

  const q = QUESTIONS[state.current];
  const isCorrect = idx === q.correct;

  document.getElementById(`opt-${idx}`).classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) highlightCorrect();

  disableOptions();

  if (isCorrect) {
    state.score += q.prize;
    spawnParticles(true);
    showFeedback('✅ ¡Correcto!', 'good');
  } else {
    spawnParticles(false);
    showFeedback('❌ Incorrecto', 'bad');
  }

  setTimeout(() => {
    hideFeedback();
    redirectResult(isCorrect);
  }, 1600);
}

function highlightCorrect() {
  const q = QUESTIONS[state.current];
  document.getElementById(`opt-${q.correct}`).classList.add('correct');
}

function disableOptions() {
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
}

/* ── REDIRECT ── */
function redirectResult(correct) {
  localStorage.setItem('codemaster_score', state.score);
  localStorage.setItem('codemaster_current', state.current);
  localStorage.setItem('codemaster_total', QUESTIONS.length);
  localStorage.setItem('codemaster_correct', correct ? '1' : '0');
  window.location.href = `resultado.html?estado=${correct ? 'bien' : 'mal'}`;
}

/* ── LIFELINES ── */
function useLifeline50() {
  if (state.ll50Used || state.answered) return;
  state.ll50Used = true;
  document.getElementById('ll-50').disabled = true;

  const q = QUESTIONS[state.current];
  const wrong = [];
  for (let i = 0; i < 4; i++) if (i !== q.correct) wrong.push(i);
  // Hide 2 wrong
  const toHide = wrong.sort(() => Math.random() - .5).slice(0, 2);
  toHide.forEach(i => {
    const btn = document.getElementById(`opt-${i}`);
    btn.style.opacity = '.15';
    btn.disabled = true;
    state.hiddenOptions.push(i);
  });
}

function useLifelineSkip() {
  if (state.llSkipUsed || state.answered) return;
  state.llSkipUsed = true;
  document.getElementById('ll-skip').disabled = true;
  clearInterval(state.timerInterval);
  state.answered = true;
  showFeedback('⏭️ Saltando...', 'good');
  setTimeout(() => { hideFeedback(); advanceGame(false, true); }, 900);
}

function useLifelineHint() {
  if (state.llHintUsed || state.answered) return;
  state.llHintUsed = true;
  document.getElementById('ll-hint').disabled = true;
  const q = QUESTIONS[state.current];
  const hints = [
    "Piensa en nombres descriptivos y completos.",
    "Las convenciones facilitan el trabajo en equipo.",
    "Los prefijos is/has/can ayudan en booleanos.",
    "Un buen nombre evita la necesidad de comentarios.",
    "SCREAMING_SNAKE_CASE se usa para constantes."
  ];
  const hint = hints[state.current % hints.length];
  showFeedback(`💡 ${hint}`, 'good');
  setTimeout(hideFeedback, 2400);
}

/* ── ADVANCE ── */
function advanceGame(isCorrect, skipped = false) {
  if (!skipped && isCorrect) state.score += QUESTIONS[state.current].prize;

  state.current++;
  if (state.current >= QUESTIONS.length) {
    showFinish();
  } else {
    // Re-render (used when jumping back from resultado.html re-integration)
    renderQuestion();
  }
}

/* ── FINISH SCREEN ── */
function showFinish() {
  document.getElementById('question-card').style.display = 'none';
  document.getElementById('hud').style.display = 'none';
  document.getElementById('lifelines').style.display = 'none';
  document.getElementById('prize-ladder').style.display = 'none';

  const card = document.getElementById('finish-card');
  card.style.display = 'block';

  const pct = Math.round((state.score / PRIZES.reduce((a,b) => a+b, 0)) * 100);
  document.getElementById('finish-score').textContent = `${state.score.toLocaleString()} pts`;

  let icon = '🏆', msg = '';
  if (pct >= 80) { icon = '🏆'; msg = '¡Eres un experto en nomenclatura! Excelente dominio de las buenas prácticas.'; }
  else if (pct >= 50) { icon = '🎯'; msg = 'Buen trabajo. Continúa practicando para perfeccionar tus habilidades.'; }
  else { icon = '📚'; msg = 'Necesitas repasar las convenciones de nomenclatura. ¡No te rindas!'; }

  document.getElementById('finish-icon').textContent = icon;
  document.getElementById('finish-msg').textContent = msg;
  spawnParticles(pct >= 50);
}

function restartGame() {
  state = { current:0, score:0, timer:30, timerInterval:null, answered:false, ll50Used:false, llSkipUsed:false, llHintUsed:false, hiddenOptions:[] };
  ['ll-50','ll-skip','ll-hint'].forEach(id => document.getElementById(id).disabled = false);

  document.getElementById('finish-card').style.display = 'none';
  document.getElementById('question-card').style.display = '';
  document.getElementById('hud').style.display = '';
  document.getElementById('lifelines').style.display = '';
  document.getElementById('prize-ladder').style.display = '';

  renderQuestion();
}

/* ── FEEDBACK TOAST ── */
function showFeedback(msg, type) {
  const el = document.getElementById('feedback-toast');
  el.textContent = msg;
  el.className = `feedback-toast ${type} show`;
}
function hideFeedback() {
  document.getElementById('feedback-toast').className = 'feedback-toast';
}

/* ── PARTICLES ── */
function spawnParticles(good) {
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 10 + 5;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 160 + 60;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${window.innerWidth/2}px; top:${window.innerHeight/2}px;
      background:${good ? (Math.random()>.5?'#00e676':'#00aaff') : (Math.random()>.5?'#ff1744':'#ff6d00')};
      --dx:${Math.cos(angle)*dist}px; --dy:${Math.sin(angle)*dist}px;
      opacity:.9;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

/* ── CHECK IF RETURNING FROM resultado.html ── */
function checkReturn() {
  const savedCurrent = parseInt(localStorage.getItem('codemaster_current') ?? -1);
  const savedScore   = parseInt(localStorage.getItem('codemaster_score') ?? 0);
  const wasCorrect   = localStorage.getItem('codemaster_correct') === '1';

  if (savedCurrent >= 0 && savedCurrent < QUESTIONS.length) {
    state.current = savedCurrent + 1;
    state.score = savedScore + (wasCorrect ? QUESTIONS[savedCurrent].prize : 0);
    localStorage.removeItem('codemaster_current');
    localStorage.removeItem('codemaster_score');
    localStorage.removeItem('codemaster_correct');
    localStorage.removeItem('codemaster_total');
  }

  if (state.current >= QUESTIONS.length) {
    showFinish();
  } else {
    renderQuestion();
  }
}

/* ── INIT ── */
buildLadder();
checkReturn();