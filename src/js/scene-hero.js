/* Cena 3D do topo — cédulas de real flutuando e ondulando como papel */

import {
  Scene, PerspectiveCamera, WebGLRenderer, Group,
  PlaneGeometry, MeshStandardMaterial, Mesh, DoubleSide,
  DirectionalLight, AmbientLight,
  PMREMGenerator, ACESFilmicToneMapping, MathUtils
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { clamp, lerp, prefersReduced } from './utils.js';
import { NOTAS, notaPlaceholder } from './note-texture.js';
import { carregarCedulas } from './slice-notes.js';

/* posição x, y, z e escala de cada cédula — pensadas pra emoldurar o título */
const SPOTS = [
  [-5.6,  2.4, -2.2, 1.00],
  [ 5.3,  2.8, -1.6, 1.10],
  [-3.2,  4.4, -3.6, 0.72],
  [ 3.2,  4.6, -3.0, 0.80],
  [ 6.9,  0.1, -3.4, 0.88],
  [-6.8,  0.4, -2.8, 0.76],
  [ 0.9,  3.6, -4.6, 0.60],
  [-1.7,  5.0, -5.0, 0.55],
  [ 4.4, -2.1, -4.4, 0.66],
  [-4.8, -2.4, -4.8, 0.62],
  [ 7.8,  3.8, -5.6, 0.48],
  [-7.6,  3.4, -5.8, 0.46],
  // camada mais ao fundo, pra dar volume sem atrapalhar a leitura do título
  [ 8.9,  1.7, -6.2, 0.44],
  [-8.7,  2.0, -6.4, 0.42],
  [ 6.3,  5.5, -6.8, 0.40],
  [-6.1,  5.7, -7.0, 0.38],
  [ 2.4,  6.3, -7.2, 0.34],
  [-2.2,  6.5, -7.4, 0.33]
];

export function initHeroScene(canvas, onReady) {
  if (!canvas) { onReady?.(); return null; }

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    canvas.style.display = 'none';
    onReady?.();
    return null;
  }

  const reduced = prefersReduced();
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 13);

  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;

  const key = new DirectionalLight(0xffffff, 2.3);
  key.position.set(4, 7, 6);
  scene.add(key);
  const rim = new DirectionalLight(0xfff0d8, 1.2);
  rim.position.set(-6, -2, 4);
  scene.add(rim);
  scene.add(new AmbientLight(0xffffff, 0.7));

  const group = new Group();
  scene.add(group);

  /* cor de base: aparece no primeiro quadro, antes da foto entrar */
  const texturas = NOTAS.map(notaPlaceholder);
  const ASPECTO = 2.1; // proporção base da malha

  const notas = [];

  SPOTS.forEach(([x, y, z, scale], i) => {
    const geo = new PlaneGeometry(ASPECTO, 1.0, 20, 10);
    const mat = new MeshStandardMaterial({
      map: texturas[i % texturas.length],
      side: DoubleSide,
      roughness: 0.82,
      metalness: 0.02
    });
    const mesh = new Mesh(geo, mat);

    mesh.position.set(x, y, z);
    mesh.scale.setScalar(scale);
    mesh.rotation.set(
      MathUtils.degToRad(-30 + Math.random() * 60),
      MathUtils.degToRad(-40 + Math.random() * 80),
      MathUtils.degToRad(-35 + Math.random() * 70)
    );

    mesh.userData = {
      base: mesh.position.clone(),
      basePos: Float32Array.from(geo.attributes.position.array),
      spinY: (0.06 + Math.random() * 0.14) * (Math.random() > 0.5 ? 1 : -1),
      spinZ: (0.03 + Math.random() * 0.07) * (Math.random() > 0.5 ? 1 : -1),
      float: 0.16 + Math.random() * 0.32,
      phase: Math.random() * Math.PI * 2,
      depth: 0.4 + scale * 0.6,
      escala: scale,
      valor: NOTAS[i % NOTAS.length].v
    };

    group.add(mesh);
    notas.push(mesh);
  });

  /* troca pelas fotos reais das cédulas assim que forem recortadas */
  carregarCedulas().then((mapa) => {
    if (!mapa) return;
    notas.forEach((n) => {
      const foto = mapa.get(n.userData.valor);
      if (!foto) return;
      n.material.map = foto.tex;
      n.material.needsUpdate = true;
      // ajusta a largura pra respeitar a proporção real daquela nota
      n.scale.x = n.userData.escala * (foto.aspect / ASPECTO);
    });
  });

  /* ── entrada ── */
  let intro = reduced ? 1 : 0;

  /* ── mouse ── */
  let mx = 0, my = 0, cmx = 0, cmy = 0;
  addEventListener('mousemove', (e) => {
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  /* ── scroll ── */
  let scrollN = 0;
  const readScroll = () => { scrollN = clamp(scrollY / Math.max(innerHeight, 1), 0, 1.6); };
  addEventListener('scroll', readScroll, { passive: true });
  readScroll();

  /* ── resize ── */
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(r.width, 1), h = Math.max(r.height, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.9 ? 18 : 13;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener('resize', resize);

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(canvas);

  let t = 0, last = performance.now();

  /** Ondula a malha da cédula como uma folha de papel ao vento. */
  function ondular(mesh, time) {
    const pos = mesh.geometry.attributes.position;
    const base = mesh.userData.basePos;
    const ph = mesh.userData.phase;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      // amplitude cresce da esquerda pra direita, como uma bandeira
      const grip = 0.35 + (x + 1.05) / 2.1;
      const z = Math.sin(x * 2.4 + time * 1.7 + ph) * 0.10 * grip
              + Math.cos(y * 3.1 + time * 1.15 + ph) * 0.045;
      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  }

  const render = (now) => {
    requestAnimationFrame(render);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || document.hidden) return;
    t += dt;

    intro = Math.min(1, intro + dt * 0.55);
    const ease = 1 - Math.pow(1 - intro, 3);

    cmx = lerp(cmx, mx, 0.045);
    cmy = lerp(cmy, my, 0.045);

    notas.forEach((n, i) => {
      const d = n.userData;

      if (!reduced) {
        n.rotation.y += d.spinY * dt;
        n.rotation.z += d.spinZ * dt;
        ondular(n, t);
      }

      const bob = Math.sin(t * 0.6 + d.phase) * d.float;
      const dropIn = (1 - ease) * (5 + i * 0.6);

      n.position.x = d.base.x + cmx * 1.5 * d.depth;
      n.position.y = d.base.y + bob - cmy * 1.0 * d.depth + dropIn - scrollN * 5.5 * d.depth;
    });

    group.rotation.y = cmx * 0.09;
    group.rotation.x = cmy * 0.05;

    canvas.style.opacity = String(clamp(1 - scrollN * 1.15, 0, 1) * ease);

    renderer.render(scene, camera);
  };
  requestAnimationFrame(render);

  onReady?.();
  return { renderer, scene, camera };
}
