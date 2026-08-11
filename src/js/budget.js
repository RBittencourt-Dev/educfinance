/* Regra 50 · 30 · 20 — rosca interativa */

import { $, $$, money } from './utils.js';

const SLICES = [
  { key: 'need', pct: 0.5, label: 'essenciais', out: '#bNeed' },
  { key: 'want', pct: 0.3, label: 'vontades',   out: '#bWant' },
  { key: 'save', pct: 0.2, label: 'futuro',     out: '#bSave' }
];

export function initBudget() {
  const input = $('#bRenda');
  const donut = $('#donut');
  if (!input || !donut) return;

  const R = 76;
  const C = 2 * Math.PI * R;
  const focusVal = $('#donutFocus');
  const focusLbl = $('#donutFocusLbl');
  const box = document.querySelector('.budget');
  const legend = $$('.budget__legend li');

  // desenha os arcos uma vez
  let offset = 0;
  SLICES.forEach((s) => {
    const el = donut.querySelector(`.donut__seg--${s.key}`);
    const len = C * s.pct;
    // pequeno respiro entre fatias
    el.style.strokeDasharray = `${Math.max(len - 3, 0)} ${C}`;
    el.style.strokeDashoffset = `${-offset}`;
    offset += len;
  });

  function render() {
    const v = Math.max(0, +input.value || 0);
    SLICES.forEach((s) => {
      const el = $(s.out);
      if (el) el.textContent = money(v * s.pct);
    });
  }

  input.addEventListener('input', render);

  // atalhos de valor
  $$('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      $$('.chip').forEach((c) => c.classList.remove('is-on'));
      chip.classList.add('is-on');
      input.value = chip.dataset.renda;
      render();
    });
  });
  input.addEventListener('input', () => {
    $$('.chip').forEach((c) => c.classList.toggle('is-on', c.dataset.renda === input.value));
  });

  // foco ao passar por cima da legenda
  const setFocus = (key) => {
    const s = SLICES.find((x) => x.key === key);
    box.classList.toggle('is-focusing', !!s);
    legend.forEach((li) => li.classList.toggle('is-active', li.dataset.slice === key));
    SLICES.forEach((x) => {
      const el = donut.querySelector(`.donut__seg--${x.key}`);
      el.style.strokeWidth = !s ? '' : x.key === key ? '28' : '13';
    });
    focusVal.textContent = s ? `${s.pct * 100}%` : '50%';
    focusLbl.textContent = s ? s.label : 'essenciais';
  };

  legend.forEach((li) => {
    li.addEventListener('mouseenter', () => setFocus(li.dataset.slice));
    li.addEventListener('focusin', () => setFocus(li.dataset.slice));
    li.addEventListener('mouseleave', () => setFocus(null));
    li.addEventListener('focusout', () => setFocus(null));
  });

  render();
}
