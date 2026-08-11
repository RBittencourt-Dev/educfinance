/* Simulador de juros compostos + gráfico desenhado à mão no canvas */

import { $, clamp, lerp, money, moneyCompact, prefersReduced, onView } from './utils.js';

const COL = {
  yield:   '#D9F26B',
  deposit: 'rgba(240, 236, 227, 0.30)',
  line:    '#D9F26B',
  grid:    'rgba(240, 236, 227, 0.10)',
  text:    'rgba(240, 236, 227, 0.45)'
};

/** Série mensal de aportes com juros compostos. */
function series(monthly, years, annualPct) {
  const i = Math.pow(1 + annualPct / 100, 1 / 12) - 1;
  const n = years * 12;
  const out = [];
  let total = 0;
  for (let m = 0; m <= n; m++) {
    if (m > 0) total = total * (1 + i) + monthly;
    out.push({ m, deposited: monthly * m, total });
  }
  return out;
}

export function initCompound() {
  const canvas = $('#compoundChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const inAporte = $('#cAporte');
  const inAnos = $('#cAnos');
  const inTaxa = $('#cTaxa');

  const outAporte = $('#cAporteOut');
  const outAnos = $('#cAnosOut');
  const outTaxa = $('#cTaxaOut');
  const outDep = $('#cAportado');
  const outJur = $('#cJuros');
  const outTot = $('#cTotal');

  let data = [];
  let W = 0, H = 0;
  let reveal = prefersReduced() ? 1 : 0;   // 0→1 desenha da esquerda pra direita
  let revealing = false;
  let hover = null;                        // índice sob o mouse
  let animMax = 1;                         // escala vertical suavizada

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = Math.max(r.width, 1);
    H = Math.max(r.height, 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const pad = { t: 26, r: 10, b: 32, l: 10 };

  function compute() {
    const monthly = +inAporte.value;
    const years = +inAnos.value;
    const rate = +inTaxa.value;

    outAporte.textContent = money(monthly);
    outAnos.textContent = years === 1 ? '1 ano' : `${years} anos`;
    outTaxa.textContent = `${rate.toString().replace('.', ',')}%`;

    data = series(monthly, years, rate);
    const last = data[data.length - 1];
    outDep.textContent = money(last.deposited);
    outJur.textContent = money(last.total - last.deposited);
    outTot.textContent = money(last.total);
  }

  function draw() {
    if (!W || !data.length) return;
    ctx.clearRect(0, 0, W, H);

    const last = data[data.length - 1];
    const target = Math.max(last.total, 1);
    animMax = lerp(animMax, target, 0.14);
    const max = animMax;

    const x0 = pad.l, x1 = W - pad.r;
    const y0 = H - pad.b, y1 = pad.t;

    const X = (i) => x0 + (i / (data.length - 1)) * (x1 - x0);
    const Y = (v) => y0 - (v / max) * (y0 - y1);

    /* grade + rótulos de valor */
    ctx.font = '400 10px "JetBrains Mono", monospace';
    ctx.fillStyle = COL.text;
    ctx.textBaseline = 'bottom';
    for (let k = 0; k <= 4; k++) {
      const v = (max / 4) * k;
      const y = Y(v);
      ctx.strokeStyle = COL.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, Math.round(y) + 0.5);
      ctx.lineTo(x1, Math.round(y) + 0.5);
      ctx.stroke();
      if (k > 0) {
        ctx.textAlign = 'left';
        ctx.fillText(moneyCompact(v), x0 + 2, y - 4);
      }
    }

    /* recorte da animação de entrada */
    const cut = x0 + (x1 - x0) * reveal;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y1 - 10, Math.max(cut - x0, 0), y0 - y1 + 20);
    ctx.clip();

    /* área do total (juros) */
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    data.forEach((d, i) => ctx.lineTo(X(i), Y(d.total)));
    ctx.lineTo(X(data.length - 1), Y(0));
    ctx.closePath();
    ctx.fillStyle = COL.yield;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;

    /* área do que foi depositado, por cima */
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    data.forEach((d, i) => ctx.lineTo(X(i), Y(d.deposited)));
    ctx.lineTo(X(data.length - 1), Y(0));
    ctx.closePath();
    ctx.fillStyle = '#0E100D';
    ctx.fill();
    ctx.fillStyle = COL.deposit;
    ctx.fill();

    /* linha do total */
    ctx.beginPath();
    data.forEach((d, i) => (i ? ctx.lineTo(X(i), Y(d.total)) : ctx.moveTo(X(i), Y(d.total))));
    ctx.strokeStyle = COL.line;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.restore();

    /* rótulos de anos */
    const years = +inAnos.value;
    const stepY = years <= 10 ? 2 : years <= 24 ? 5 : 10;
    ctx.fillStyle = COL.text;
    ctx.textBaseline = 'top';
    for (let y = 0; y <= years; y += stepY) {
      const i = y * 12;
      if (i >= data.length) break;
      const px = X(i);
      ctx.textAlign = y === 0 ? 'left' : px > x1 - 30 ? 'right' : 'center';
      ctx.fillText(y === 0 ? 'hoje' : `${y}a`, px, y0 + 10);
    }

    /* hover */
    if (hover != null && data[hover] && reveal > 0.99) {
      const d = data[hover];
      const px = X(hover), py = Y(d.total);

      ctx.strokeStyle = 'rgba(240,236,227,0.3)';
      ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(px, y1 - 6); ctx.lineTo(px, y0); ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = COL.line; ctx.fill();
      ctx.strokeStyle = '#0E100D'; ctx.lineWidth = 2; ctx.stroke();

      const yr = Math.floor(d.m / 12);
      const lines = [
        `ano ${yr}`,
        `total ${money(d.total)}`,
        `juros ${money(d.total - d.deposited)}`
      ];
      ctx.font = '400 11px "JetBrains Mono", monospace';
      const wBox = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 20;
      const hBox = lines.length * 16 + 14;
      let bx = px + 12;
      if (bx + wBox > x1) bx = px - 12 - wBox;
      let by = clamp(py - hBox - 12, y1 - 6, y0 - hBox);

      ctx.fillStyle = 'rgba(14,16,13,0.94)';
      ctx.strokeStyle = 'rgba(240,236,227,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, wBox, hBox, 4);
      ctx.fill(); ctx.stroke();

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      lines.forEach((l, i) => {
        ctx.fillStyle = i === 0 ? COL.text : i === 2 ? COL.line : 'rgba(240,236,227,0.9)';
        ctx.fillText(l, bx + 10, by + 9 + i * 16);
      });
    }
  }

  /* ── loop ── */
  let raf;
  const loop = () => {
    if (revealing && reveal < 1) reveal = Math.min(1, reveal + 0.016);
    draw();
    raf = requestAnimationFrame(loop);
  };

  /* ── eventos ── */
  const update = () => { compute(); };
  [inAporte, inAnos, inTaxa].forEach((el) => {
    el.addEventListener('input', update);
  });

  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const t = clamp((x - pad.l) / (W - pad.l - pad.r), 0, 1);
    hover = Math.round(t * (data.length - 1));
  });
  canvas.addEventListener('mouseleave', () => { hover = null; });

  addEventListener('resize', () => { resize(); });

  resize();
  compute();
  animMax = data[data.length - 1].total || 1;
  onView(canvas, () => { revealing = true; }, { threshold: 0.25 });
  raf = requestAnimationFrame(loop);
}
