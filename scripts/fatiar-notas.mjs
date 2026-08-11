/* Corta a folha com a família do real em uma imagem por cédula.

   Uso:  node scripts/fatiar-notas.mjs
   Lê:   public/notas/familia-real.webp
   Gera: public/notas/2.png, 5.png, 10.png, 20.png, 50.png, 100.png, 200.png

   A detecção é por conteúdo (procura as faixas com tinta), então continua
   funcionando se a folha for trocada por outra parecida. */

import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ENTRADA = 'assets/familia-real.webp';
const SAIDA = 'public/notas';
const ORDEM = [2, 5, 10, 20, 50, 100, 200];

/** Pixel conta como tinta se não for transparente nem quase-branco. */
const temTinta = (d, i, canais) => {
  if (canais === 4 && d[i + 3] < 24) return false;
  return !(d[i] > 240 && d[i + 1] > 240 && d[i + 2] > 240);
};

/** Mediana de uma janela, pra tirar o ruído das bordas arredondadas. */
function mediana(arr, i, raio) {
  const j = [];
  for (let k = i - raio; k <= i + raio; k++) {
    if (k >= 0 && k < arr.length && arr[k] >= 0) j.push(arr[k]);
  }
  if (!j.length) return -1;
  j.sort((a, b) => a - b);
  return j[j.length >> 1];
}

/**
 * As cédulas se tocam verticalmente, então não dá pra separar por linha branca.
 * Mas cada valor tem uma largura diferente — a borda direita forma degraus.
 * É neles que a gente corta.
 */
function faixasPorDegrau(direita, primeira, ultima, alturaMinima) {
  const out = [];
  let inicio = primeira;
  let ref = null;

  for (let y = primeira; y <= ultima; y++) {
    if (ref === null && y - inicio >= 3) ref = mediana(direita, y, 2);
    if (ref === null) continue;

    const atual = mediana(direita, y, 2);
    if (Math.abs(atual - ref) <= 5) continue;

    // só corta se o degrau se mantiver por algumas linhas (evita ruído)
    let firme = true;
    for (let k = 1; k <= 4 && y + k <= ultima; k++) {
      if (Math.abs(mediana(direita, y + k, 2) - ref) <= 5) { firme = false; break; }
    }
    if (!firme || y - inicio < alturaMinima) continue;

    out.push([inicio, y - 1]);
    inicio = y;
    ref = null;
  }

  out.push([inicio, ultima]);
  return out;
}

const img = sharp(ENTRADA).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

console.log(`folha: ${W}x${H}, ${C} canais`);

/* bordas esquerda e direita de cada linha */
const esquerda = new Array(H).fill(-1);
const direita = new Array(H).fill(-1);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (temTinta(data, (y * W + x) * C, C)) {
      if (esquerda[y] < 0) esquerda[y] = x;
      direita[y] = x;
    }
  }
}

let primeira = 0;
while (primeira < H && direita[primeira] < 0) primeira++;
let ultima = H - 1;
while (ultima > primeira && direita[ultima] < 0) ultima--;

const alturaMedia = (ultima - primeira + 1) / ORDEM.length;
const bandas = faixasPorDegrau(direita, primeira, ultima, Math.round(alturaMedia * 0.6));
console.log(`faixas encontradas: ${bandas.length}`);

if (bandas.length !== ORDEM.length) {
  console.warn(`aviso: esperava ${ORDEM.length} cédulas, achei ${bandas.length}`);
}

await mkdir(SAIDA, { recursive: true });

const manifesto = [];

for (let b = 0; b < bandas.length; b++) {
  const [y0, y1] = bandas[b];
  const altura = y1 - y0 + 1;

  /* extensão horizontal dentro da faixa */
  const porColuna = new Array(W).fill(0);
  for (let x = 0; x < W; x++) {
    let n = 0;
    for (let y = y0; y <= y1; y++) if (temTinta(data, (y * W + x) * C, C)) n++;
    porColuna[x] = n;
  }
  let x0 = 0, x1 = W - 1;
  while (x0 < W && porColuna[x0] < altura * 0.5) x0++;
  while (x1 > x0 && porColuna[x1] < altura * 0.5) x1--;

  const largura = x1 - x0 + 1;
  const valor = ORDEM[b] ?? `extra-${b}`;
  const destino = path.join(SAIDA, `${valor}.png`);

  await sharp(ENTRADA)
    .extract({ left: x0, top: y0, width: largura, height: altura })
    .png()
    .toFile(destino);

  const aspect = +(largura / altura).toFixed(4);
  manifesto.push({ v: valor, w: largura, h: altura, aspect });
  console.log(`R$ ${String(valor).padStart(3)} → ${largura}x${altura} (proporção ${aspect})  ${destino}`);
}

await writeFile(path.join(SAIDA, 'notas.json'), JSON.stringify(manifesto, null, 2) + '\n');
console.log('\nmanifesto salvo em public/notas/notas.json');
