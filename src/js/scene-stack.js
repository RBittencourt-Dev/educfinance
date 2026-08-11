/* Cena 3D da seção "onde guardar" — maços de cédulas que crescem com o scroll */

import {
  Scene, PerspectiveCamera, WebGLRenderer, Group,
  BoxGeometry, MeshStandardMaterial, Mesh, Color,
  DirectionalLight, AmbientLight, PMREMGenerator, ACESFilmicToneMapping
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { clamp, lerp, prefersReduced } from './utils.js';
import { NOTAS, notaPlaceholder, bordaCor, corDoPapel } from './note-texture.js';
import { carregarCedulas } from './slice-notes.js';

/* três maços: hoje, com o tempo, com o rendimento */
const COLUNAS = [
  { x: -2.9, count: 6,  nota: 10  },
  { x:  0.0, count: 12, nota: 50  },
  { x:  2.9, count: 20, nota: 100 }
];

/* cédulas quase encostadas, como num maço de verdade */
const ESPESSURA = 0.07;
const ESP = 0.075;

export function initStackScene(canvas) {
  if (!canvas) return null;

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    canvas.style.display = 'none';
    return null;
  }

  const reduced = prefersReduced();
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, 0.1, 100);

  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;

  const key = new DirectionalLight(0xffffff, 2.6);
  key.position.set(3, 8, 5);
  scene.add(key);
  // luz de preenchimento neutra: verde demais desbotava a cor das cédulas
  const fill = new DirectionalLight(0xffffff, 0.9);
  fill.position.set(-5, 1, 3);
  scene.add(fill);
  const rim = new DirectionalLight(0xD9F26B, 0.28);
  rim.position.set(-3, 0, -4);
  scene.add(rim);
  scene.add(new AmbientLight(0xffffff, 0.6));

  const group = new Group();
  group.position.y = -1.1;
  scene.add(group);

  const geo = new BoxGeometry(2.2, ESPESSURA, 1.05);

  const cedulas = [];
  const total = COLUNAS.reduce((s, c) => s + c.count, 0);
  let posto = 0;

  const facesPorValor = new Map();
  const bordasPorValor = new Map();

  COLUNAS.forEach((col) => {
    const dados = NOTAS.find((n) => n.v === col.nota) || NOTAS[0];
    const face = new MeshStandardMaterial({
      map: notaPlaceholder(dados), roughness: 0.85, metalness: 0
    });
    // lateral na cor do papel daquela nota — o maço é visto de lado
    const borda = new MeshStandardMaterial({
      color: new Color(dados.paper).lerp(new Color(bordaCor), 0.45),
      roughness: 0.95, metalness: 0
    });
    facesPorValor.set(col.nota, face);
    bordasPorValor.set(col.nota, borda);
    // ordem das faces do BoxGeometry: +x, -x, +y (topo), -y (base), +z, -z
    const mats = [borda, borda, face, face, borda, borda];

    for (let i = 0; i < col.count; i++) {
      const m = new Mesh(geo, mats);
      m.position.set(
        col.x + (Math.random() - 0.5) * 0.09,
        i * ESP,
        (Math.random() - 0.5) * 0.09
      );
      m.rotation.y = (Math.random() - 0.5) * 0.14;
      m.userData = {
        y: i * ESP,
        x: m.position.x,
        z: m.position.z,
        order: posto / total,
        valor: col.nota,
        zf: 1 // corrige a profundidade quando a foto real tem outra proporção
      };
      group.add(m);
      cedulas.push(m);
      posto++;
    }
  });

  /* troca pelas fotos reais das cédulas */
  carregarCedulas().then((mapa) => {
    if (!mapa) return;
    const BASE = 2.2 / 1.05; // proporção da caixa antes do ajuste
    facesPorValor.forEach((mat, valor) => {
      const foto = mapa.get(valor);
      if (!foto) return;
      mat.map = foto.tex;
      mat.needsUpdate = true;

      // tinge a lateral com o tom de papel tirado da própria cédula
      const cor = corDoPapel(foto.tex.image);
      if (cor != null) bordasPorValor.get(valor)?.color.setHex(cor);

      cedulas.forEach((c) => {
        if (c.userData.valor === valor) c.userData.zf = BASE / foto.aspect;
      });
    });
  });

  /* ── progresso do scroll dentro da seção ── */
  const host = canvas.closest('section') || canvas.parentElement;
  let progress = reduced ? 1 : 0;
  const readProgress = () => {
    const r = host.getBoundingClientRect();
    progress = clamp((innerHeight * 0.9 - r.top) / (innerHeight * 0.85), 0, 1);
  };
  addEventListener('scroll', readProgress, { passive: true });
  readProgress();

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(r.width, 1), h = Math.max(r.height, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // um pouco mais alta que antes: mostra mais a face da nota de cima
    camera.position.set(0, 2.9, w / h < 1 ? 13 : 10.5);
    camera.lookAt(0, 0.3, 0);
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener('resize', resize);

  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(canvas);

  let shown = 0;
  let t = 0, last = performance.now();

  const render = (now) => {
    requestAnimationFrame(render);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || document.hidden) return;
    t += dt;

    shown = lerp(shown, progress, 0.09);

    cedulas.forEach((c) => {
      const d = c.userData;
      // cada cédula cai quando o scroll passa da sua vez na fila
      const local = clamp((shown - d.order * 0.8) / 0.2, 0, 1);
      const e = 1 - Math.pow(1 - local, 4);
      // a cédula cai de cima e assenta na pilha (sem crescer — parece maço)
      c.position.y = d.y + (1 - e) * 6;
      c.position.x = d.x;
      c.position.z = d.z;
      c.scale.set(1, 1, d.zf);
      c.visible = local > 0.001;
    });

    if (!reduced) group.rotation.y = Math.sin(t * 0.2) * 0.4;
    renderer.render(scene, camera);
  };
  requestAnimationFrame(render);

  return { renderer };
}
