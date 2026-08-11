/* ═══════════════════════════════════════════════
   EducFinance — ponto de entrada
   ═══════════════════════════════════════════════ */

import './styles/main.css';
import Lenis from 'lenis';

import { $, prefersReduced } from './js/utils.js';
import {
  initLoader, initCursor, initMagnetic, initNav,
  initReveal, initSplit, initCounters, initMarquee, initTilt
} from './js/ui.js';
import { initHeroScene } from './js/scene-hero.js';
import { initStackScene } from './js/scene-stack.js';
import { initCompound } from './js/compound.js';
import { initBudget } from './js/budget.js';
import { initFx, initMitos, initGlossario } from './js/sections.js';
import { initQuiz } from './js/quiz.js';

/* ── scroll suave ── */
let lenis = null;
if (!prefersReduced()) {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6
  });
  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

/* ── boot ── */
const loader = initLoader();

initSplit();          // precisa rodar antes da animação do título
initMitos();
initGlossario();      // geram DOM — antes do initReveal/initTilt

initNav(lenis);
initReveal();
initCounters();
initMarquee(lenis);
initCursor();
initMagnetic();
initTilt();

initCompound();
initBudget();
initFx();
initQuiz();

/* ── cenas 3D (assíncronas por peso) ── */
let sceneReady = false;
const markScene = () => { sceneReady = true; };

requestAnimationFrame(() => {
  initHeroScene($('#heroCanvas'), markScene);
  initStackScene($('#stackCanvas'));
});

/* ── libera o loader quando tudo estiver de pé ── */
const release = () => setTimeout(() => loader.done(), sceneReady ? 180 : 500);
if (document.readyState === 'complete') release();
else addEventListener('load', release);

// rede de segurança: nunca deixa o loader preso
setTimeout(() => loader.done(), 4500);

/* ── recalcula alturas quando as fontes chegam ── */
document.fonts?.ready.then(() => {
  lenis?.resize();
  dispatchEvent(new Event('resize'));
});
