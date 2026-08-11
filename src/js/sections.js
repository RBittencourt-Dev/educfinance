/* Blocos de conteúdo: conversor de dólar, cartões de mito e glossário */

import { $, dollars } from './utils.js';
import { MITOS, GLOSSARIO } from '../data/content.js';

/* ─────────────────── conversor real → dólar ─────────────────── */
export function initFx() {
  const valor = $('#fxValor');
  const cot = $('#fxCotacao');
  const out = $('#fxResult');
  if (!valor || !cot || !out) return;

  const render = () => {
    const v = Math.max(0, +valor.value || 0);
    const c = Math.max(0.01, +cot.value || 0.01);
    out.textContent = dollars(v / c);
  };
  valor.addEventListener('input', render);
  cot.addEventListener('input', render);
  render();
}

/* ──────────────────── cartões mito × verdade ────────────────── */
export function initMitos() {
  const root = $('#myths');
  if (!root) return;

  root.innerHTML = MITOS.map((m, i) => `
    <div class="myth" data-reveal role="button" tabindex="0"
         aria-label="Cartão ${i + 1}: ${m.q}. Ative para ver a resposta.">
      <div class="myth__inner">
        <div class="myth__face myth__face--front">
          <p class="myth__q">${m.q}</p>
          <span class="myth__hint">clique pra virar →</span>
        </div>
        <div class="myth__face myth__face--back">
          <span class="myth__verdict">${m.verdict}</span>
          <p class="myth__a">${m.a}</p>
        </div>
      </div>
    </div>
  `).join('');

  root.addEventListener('click', (e) => {
    const card = e.target.closest('.myth');
    if (card) card.classList.toggle('is-flipped');
  });
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.myth');
    if (!card) return;
    e.preventDefault();
    card.classList.toggle('is-flipped');
  });
}

/* ────────────────────────── glossário ───────────────────────── */
export function initGlossario() {
  const root = $('#glossary');
  if (!root) return;

  root.innerHTML = GLOSSARIO.map((g, i) => `
    <div class="gl">
      <button class="gl__head" aria-expanded="false" aria-controls="gl-${i}">
        <span class="gl__term">${g.t}</span>
        <span class="gl__sign" aria-hidden="true"></span>
      </button>
      <div class="gl__body" id="gl-${i}" role="region">
        <div><p>${g.d}</p></div>
      </div>
    </div>
  `).join('');

  root.addEventListener('click', (e) => {
    const head = e.target.closest('.gl__head');
    if (!head) return;
    const item = head.parentElement;
    const open = item.classList.toggle('is-open');
    head.setAttribute('aria-expanded', String(open));

    // deixa só um aberto por vez
    if (open) {
      root.querySelectorAll('.gl.is-open').forEach((el) => {
        if (el === item) return;
        el.classList.remove('is-open');
        el.querySelector('.gl__head').setAttribute('aria-expanded', 'false');
      });
    }
  });
}
