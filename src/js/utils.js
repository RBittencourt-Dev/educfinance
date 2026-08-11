/* Utilitários compartilhados */

export const $  = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

export const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
export const lerp  = (a, b, t) => a + (b - a) * t;

/** Curva de saída suave — usada nos contadores e câmeras. */
export const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = () =>
  window.matchMedia('(hover: none), (pointer: coarse)').matches;

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 0
});
const brlCents = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2
});
const usd = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
});

export const money = (v) => brl.format(Math.round(v));
export const moneyCents = (v) => brlCents.format(v);
export const dollars = (v) => usd.format(v).replace('US$', 'US$ ').replace(/\s+/g, ' ');

/** R$ 1,2 mi / R$ 340 mil — para números grandes em destaque. */
export function moneyCompact(v) {
  if (v >= 1e6) {
    const n = v / 1e6;
    return `R$ ${n.toFixed(n < 10 ? 1 : 0).replace('.', ',')} mi`;
  }
  if (v >= 1000) return `R$ ${Math.round(v / 1000)} mil`;
  return money(v);
}

/** Roda o callback quando o elemento entra na viewport (uma vez ou sempre). */
export function onView(el, cb, { once = true, threshold = 0.2, margin = '0px 0px -8% 0px' } = {}) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) {
        if (!once) cb(false, e);
        return;
      }
      cb(true, e);
      if (once) io.unobserve(e.target);
    });
  }, { threshold, rootMargin: margin });
  io.observe(el);
  return io;
}
