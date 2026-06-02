/* ============================================================
   NOMENCLATURA EN CÓDIGO — script.js
   ============================================================ */

(function () {
  'use strict';

  // ── Estado ────────────────────────────────────────────────
  const TOTAL = 8;
  let current = 0;
  let direction = 'right';

  // ── Referencias al DOM ────────────────────────────────────
  const diapositivas     = document.querySelectorAll('.diapositiva');
  const enlacesNav       = document.querySelectorAll('.enlace-navegacion');
  const btnPrev          = document.getElementById('btn-prev');
  const btnNext          = document.getElementById('btn-next');
  const btnHelp          = document.getElementById('btn-help');
  const modalOverlay     = document.getElementById('modal-overlay');
  const modalClose       = document.getElementById('modal-close');
  const counterCur       = document.getElementById('current-slide');
  const counterTotal     = document.getElementById('total-slides');

  // Barra de progreso
  const barraProgreso = document.createElement('div');
  barraProgreso.className = 'barra-progreso';
  document.body.appendChild(barraProgreso);

  counterTotal.textContent = TOTAL;

  // ── Funciones de navegación ───────────────────────────────
  function irA(index, dir) {
    if (index < 0 || index >= TOTAL) return;
    direction = dir || (index > current ? 'right' : 'left');

    diapositivas[current].classList.remove('activa', 'yendo-izquierda');
    diapositivas[index].classList.remove('yendo-izquierda');

    if (direction === 'left') {
      diapositivas[index].classList.add('yendo-izquierda');
    }

    diapositivas[index].classList.add('activa');
    current = index;
    actualizar();
  }

  function siguiente() { irA(current + 1, 'right'); }
  function anterior()  { irA(current - 1, 'left');  }

  function actualizar() {
    // Contador
    counterCur.textContent = current + 1;

    // Barra de progreso
    barraProgreso.style.width = ((current + 1) / TOTAL * 100) + '%';

    // Enlaces de navegación
    enlacesNav.forEach((enlace, i) => {
      enlace.classList.toggle('activo', i === current);
    });

    // Flechas
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === TOTAL - 1;
  }

  // ── Botones de temas en la portada ────────────────────────
  document.querySelectorAll('.boton-tema[data-goto]').forEach(boton => {
    boton.addEventListener('click', () => {
      const idx = parseInt(boton.dataset.goto, 10);
      irA(idx, 'right');
    });
  });

  // ── Enlaces de navegación ─────────────────────────────────
  enlacesNav.forEach((enlace, i) => {
    enlace.addEventListener('click', e => {
      e.preventDefault();
      irA(i);
    });
  });

  // ── Botones de flecha ─────────────────────────────────────
  btnPrev.addEventListener('click', anterior);
  btnNext.addEventListener('click', siguiente);

  // ── Teclado ───────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (modalOverlay.classList.contains('open')) {
      if (e.key === 'Escape') cerrarModal();
      return;
    }
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        siguiente();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        anterior();
        break;
      case 'Home':
        e.preventDefault();
        irA(0);
        break;
      case 'End':
        e.preventDefault();
        irA(TOTAL - 1);
        break;
    }
  });

  // ── Toque / deslizamiento ─────────────────────────────────
  let inicioTactilX = 0;
  let inicioTactilY = 0;

  document.addEventListener('touchstart', e => {
    inicioTactilX = e.touches[0].clientX;
    inicioTactilY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - inicioTactilX;
    const dy = e.changedTouches[0].clientY - inicioTactilY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) siguiente();
      else anterior();
    }
  }, { passive: true });

  // ── Modal de ayuda ────────────────────────────────────────
  function abrirModal()  { modalOverlay.classList.add('open');    }
  function cerrarModal() { modalOverlay.classList.remove('open'); }

  btnHelp.addEventListener('click', abrirModal);
  modalClose.addEventListener('click', cerrarModal);
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) cerrarModal();
  });

  // ── Inicio ────────────────────────────────────────────────
  actualizar();
})();