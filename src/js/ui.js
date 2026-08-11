/* Camada de interface: loader, cursor, nav, reveals, contadores, marquee, tilt */

import { $, $$, clamp, lerp, easeOutExpo, prefersReduced, isTouch, money, moneyCompact, onView } from './utils.js';

/* ─────────────────────────── loader ─────────────────────────── */
export function initLoader() {
  const el = $('#loader');
  const bar = $('#loaderBar');
  const pct = $('#loaderPct');
  if (!el) return { done: () => {} };

  let value = 0;
  let finished = false;
  let raf;

  const tick = () => {
    // sobe sozinho até 92% enquanto os assets carregam
    const target = finished ? 100 : 92;
    value = lerp(value, target, finished ? 0.24 : 0.035);
    const shown = Math.min(100, Math.round(value));
    bar.style.width = shown + '%';
    pct.textContent = shown + '%';

    if (finished && shown >= 100) {
      cancelAnimationFrame(raf);
      el.classList.add('is-done');
      document.body.classList.add('is-ready');
      setTimeout(() => el.remove(), 800);
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    done: () => { finished = true; }
  };
}

/* ─────────────────────────── cursor ─────────────────────────── */
export function initCursor() {
  if (isTouch() || prefersReduced()) return;
  const el = $('#cursor');
  if (!el) return;
  const dot = $('.cursor__dot', el);
  const ring = $('.cursor__ring', el);

  let mx = innerWidth / 2, my = innerHeight / 2;
  let dx = mx, dy = my, rx = mx, ry = my;

  addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  const loop = () => {
    dx = lerp(dx, mx, 0.55);
    dy = lerp(dy, my, 0.55);
    rx = lerp(rx, mx, 0.16);
    ry = lerp(ry, my, 0.16);
    dot.style.transform  = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  const hot = 'a, button, input, [data-tilt], .myth, .gl__head, summary';
  addEventListener('mouseover', (e) => {
    if (e.target.closest(hot)) el.classList.add('is-hot');
  }, { passive: true });
  addEventListener('mouseout', (e) => {
    if (e.target.closest(hot)) el.classList.remove('is-hot');
  }, { passive: true });
}

/* ─────────────────────── botões magnéticos ──────────────────── */
export function initMagnetic() {
  if (isTouch() || prefersReduced()) return;

  $$('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.32;
    let raf, tx = 0, ty = 0, cx = 0, cy = 0, active = false;

    const render = () => {
      cx = lerp(cx, tx, 0.18);
      cy = lerp(cy, ty, 0.18);
      el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      if (active || Math.abs(cx) > 0.1 || Math.abs(cy) > 0.1) {
        raf = requestAnimationFrame(render);
      } else {
        el.style.transform = '';
        raf = null;
      }
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(render); };

    el.addEventListener('mouseenter', () => { active = true; start(); });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
    });
    el.addEventListener('mouseleave', () => { active = false; tx = 0; ty = 0; start(); });
  });
}

/* ───────────────────────── nav + menu ───────────────────────── */
export function initNav(lenis) {
  const nav = $('#nav');
  const toggle = $('#navToggle');
  const menu = $('#menu');
  let lastY = 0;

  // faixas de seções escuras, pra inverter a cor da nav
  let darkRanges = [];
  const measure = () => {
    darkRanges = $$('.section--dark, .section--night, .final, .footer').map((s) => {
      const r = s.getBoundingClientRect();
      const top = r.top + scrollY;
      return [top, top + r.height];
    });
  };
  measure();
  addEventListener('resize', measure);
  setTimeout(measure, 1200); // depois das fontes assentarem

  const onScroll = (y) => {
    nav.classList.toggle('is-stuck', y > 40);

    // esconde ao descer, mostra ao subir
    if (y > 220 && y > lastY + 4) nav.classList.add('is-hidden');
    else if (y < lastY - 4) nav.classList.remove('is-hidden');
    lastY = y;

    const probe = y + 34;
    nav.classList.toggle('on-dark', darkRanges.some(([a, b]) => probe > a && probe < b));

    const max = document.documentElement.scrollHeight - innerHeight;
    const bar = $('#progressBar');
    if (bar) bar.style.width = `${clamp(y / Math.max(max, 1), 0, 1) * 100}%`;
  };

  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);

  // menu mobile
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  toggle?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
  });

  // âncoras internas via lenis
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.35 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ──────────────────── reveal ao entrar na tela ──────────────── */
export function initReveal() {
  const items = $$('[data-reveal]');
  if (prefersReduced()) { items.forEach((i) => i.classList.add('is-in')); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      // escalona irmãos próximos pra dar ritmo
      const group = e.target.parentElement;
      const idx = group ? [...group.children].filter((c) => c.hasAttribute('data-reveal')).indexOf(e.target) : 0;
      e.target.style.transitionDelay = `${Math.min(idx, 6) * 0.07}s`;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  items.forEach((i) => io.observe(i));

  // linha animada nos passos
  $$('#steps li').forEach((li) => onView(li, () => li.classList.add('is-in'), { threshold: 0.4 }));
}

/* ─────────────── títulos: quebra em linhas animadas ─────────── */
export function initSplit() {
  $$('[data-split]').forEach((el) => {
    const inner = document.createElement('span');
    inner.innerHTML = el.innerHTML;
    el.innerHTML = '';
    el.appendChild(inner);
  });
}

/* ─────────────────────── contadores ─────────────────────────── */
export function initCounters() {
  $$('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const compact = el.dataset.format === 'compact';

    const render = (v) => {
      if (compact) el.textContent = moneyCompact(v);
      else if (prefix.includes('R$')) el.textContent = money(v);
      else el.textContent = prefix + Math.round(v).toLocaleString('pt-BR') + suffix;
    };
    render(0);

    onView(el, () => {
      if (prefersReduced()) { render(target); return; }
      const dur = 1500;
      const t0 = performance.now();
      const step = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        render(target * easeOutExpo(p));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
  });
}

/* ───────────────── marquee com velocidade de scroll ─────────── */
export function initMarquee(lenis) {
  const wrap = $('#marquee');
  if (!wrap) return;
  const track = $('.marquee__track', wrap);
  track.innerHTML += track.innerHTML; // duplica pra loop contínuo

  let x = 0;
  let vel = 0;
  const base = 0.55;

  if (lenis) lenis.on('scroll', ({ velocity }) => { vel = velocity; });

  // o período do loop inclui o gap entre o último item e a cópia
  const gap = parseFloat(getComputedStyle(track).columnGap || '0') || 0;
  const period = () => (track.scrollWidth + gap) / 2;

  const loop = () => {
    const boost = clamp(vel * 0.35, -18, 18);
    x -= base + Math.abs(boost) * 0.6;
    const h = period();
    if (h && x <= -h) x += h;
    track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${clamp(-vel * 0.14, -7, 7).toFixed(2)}deg)`;
    vel *= 0.9;
    requestAnimationFrame(loop);
  };
  if (!prefersReduced()) requestAnimationFrame(loop);
}

/* ───────────────────────── tilt 3D ──────────────────────────── */
export function initTilt() {
  if (isTouch() || prefersReduced()) return;

  $$('[data-tilt]').forEach((el) => {
    let raf = null;
    let tX = 0, tY = 0, cX = 0, cY = 0, tZ = 0, cZ = 0;

    const render = () => {
      cX = lerp(cX, tX, 0.12);
      cY = lerp(cY, tY, 0.12);
      cZ = lerp(cZ, tZ, 0.12);
      el.style.transform =
        `perspective(900px) rotateX(${cX.toFixed(2)}deg) rotateY(${cY.toFixed(2)}deg) translateZ(${cZ.toFixed(2)}px)`;
      if (Math.abs(cX - tX) > 0.01 || Math.abs(cY - tY) > 0.01 || Math.abs(cZ - tZ) > 0.05) {
        raf = requestAnimationFrame(render);
      } else { raf = null; }
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(render); };

    el.addEventListener('mousemove', (e) => {
      // impede que transições CSS de transform briguem com o rAF do tilt
      if (!el.dataset.tiltOn) { el.style.transitionProperty = 'background, border-color, color'; el.dataset.tiltOn = '1'; }
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tY = px * 7;
      tX = -py * 7;
      tZ = 8;
      start();
    });
    el.addEventListener('mouseleave', () => { tX = 0; tY = 0; tZ = 0; start(); });
  });
}
