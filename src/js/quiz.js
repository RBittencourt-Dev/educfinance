/* Quiz de 8 perguntas com feedback explicativo */

import { $ } from './utils.js';
import { QUIZ } from '../data/content.js';

const LETRAS = ['A', 'B', 'C', 'D'];

const VEREDITOS = [
  { min: 0.9, t: 'Pronto pra começar.', m: 'Agora é escolher um valor pequeno e fazer o primeiro investimento essa semana.' },
  { min: 0.7, t: 'Boa base.',           m: 'Você já pegou o principal. Dá uma revisada nas seções 01 e 03.' },
  { min: 0.4, t: 'No caminho.',         m: 'Algumas coisas ainda estão emboladas — normal. Vale reler do começo com calma.' },
  { min: 0,   t: 'Tudo bem começar do zero.', m: 'Volta ao topo e lê sem pressa. Em uns minutos você já sabe o essencial.' }
];

export function initQuiz() {
  const stage = $('#quizStage');
  const bar = $('#quizBar');
  if (!stage) return;

  let idx = 0;
  let score = 0;
  let locked = false;

  const setBar = (p) => { if (bar) bar.style.width = `${p * 100}%`; };

  function swap(html) {
    stage.style.opacity = '0';
    stage.style.transform = 'translateY(10px)';
    setTimeout(() => {
      stage.innerHTML = html;
      stage.style.opacity = '1';
      stage.style.transform = 'none';
    }, 220);
  }

  function intro() {
    idx = 0; score = 0; locked = false;
    setBar(0);
    swap(`
      <div class="quiz__result">
        <p class="q__meta">${QUIZ.length} perguntas</p>
        <h3 class="quiz__verdict">Será que você aprendeu?</h3>
        <p class="quiz__msg">Cada resposta vem com explicação. Errar aqui é de graça.</p>
        <button class="btn btn--solid" id="quizStart">Bora</button>
      </div>
    `);
    setTimeout(() => $('#quizStart')?.addEventListener('click', question), 240);
  }

  function question() {
    locked = false;
    const q = QUIZ[idx];
    setBar(idx / QUIZ.length);
    swap(`
      <p class="q__meta">pergunta ${String(idx + 1).padStart(2, '0')} / ${String(QUIZ.length).padStart(2, '0')}</p>
      <h3 class="q__text">${q.q}</h3>
      <div class="q__opts">
        ${q.opts.map((o, i) => `
          <button class="q__opt" data-i="${i}"><em>${LETRAS[i]}</em><span>${o}</span></button>
        `).join('')}
      </div>
      <div id="qFb"></div>
    `);
    setTimeout(() => {
      stage.querySelectorAll('.q__opt').forEach((b) =>
        b.addEventListener('click', () => answer(+b.dataset.i))
      );
    }, 240);
  }

  function answer(picked) {
    if (locked) return;
    locked = true;
    const q = QUIZ[idx];
    const ok = picked === q.right;
    if (ok) score++;

    stage.querySelectorAll('.q__opt').forEach((b) => {
      const i = +b.dataset.i;
      b.disabled = true;
      if (i === q.right) b.classList.add('is-right');
      else if (i === picked) b.classList.add('is-wrong');
    });

    const last = idx === QUIZ.length - 1;
    const fb = $('#qFb');
    fb.innerHTML = `
      <div class="q__fb">
        <p><b>${ok ? 'Isso aí.' : 'Quase.'}</b> ${q.fb}</p>
        <button class="btn btn--ghost" id="qNext">${last ? 'Ver resultado' : 'Próxima'}</button>
      </div>
    `;
    setBar((idx + 1) / QUIZ.length);
    $('#qNext').addEventListener('click', () => {
      if (last) return result();
      idx++;
      question();
    });
    $('#qNext').focus({ preventScroll: true });
  }

  function result() {
    const ratio = score / QUIZ.length;
    const v = VEREDITOS.find((x) => ratio >= x.min);
    setBar(1);
    swap(`
      <div class="quiz__result">
        <p class="q__meta">resultado</p>
        <p class="quiz__score">${score}<small>/${QUIZ.length}</small></p>
        <h3 class="quiz__verdict">${v.t}</h3>
        <p class="quiz__msg">${v.m}</p>
        <button class="btn btn--ghost" id="quizAgain">Refazer</button>
      </div>
    `);
    setTimeout(() => $('#quizAgain')?.addEventListener('click', intro), 240);
  }

  intro();
}
