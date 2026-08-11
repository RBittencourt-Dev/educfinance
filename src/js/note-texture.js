/* Cor de base de cada cédula.

   As texturas de verdade são as imagens recortadas em public/notas/ —
   ver slice-notes.js. O que fica aqui é só a cor que aparece no primeiro
   quadro, enquanto a imagem carrega, e a cor da lateral do maço. */

import { CanvasTexture, SRGBColorSpace } from 'three';

/** Tom dominante de cada valor da 2ª família do real. */
export const NOTAS = [
  { v: 2,   paper: '#BFD6E8' },
  { v: 5,   paper: '#D5C6E0' },
  { v: 10,  paper: '#E4B9A6' },
  { v: 20,  paper: '#EAD79A' },
  { v: 50,  paper: '#E2C9A4' },
  { v: 100, paper: '#AFD8D5' },
  { v: 200, paper: '#C9D2D4' }
];

/** Gradiente minúsculo — custo quase zero, some assim que a foto entra. */
export function notaPlaceholder({ paper }) {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 4;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 8, 4);
  grad.addColorStop(0, paper);
  grad.addColorStop(0.5, '#FBF8F2');
  grad.addColorStop(1, paper);
  g.fillStyle = grad;
  g.fillRect(0, 0, 8, 4);

  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/** Cor da lateral/borda da cédula empilhada, antes da imagem carregar. */
export const bordaCor = 0xF5F1E7;

/**
 * Tom do papel de uma cédula, tirado da própria imagem.
 *
 * A média simples ficaria escura demais (a gravura puxa pro cinza), então
 * a gente usa só os pixels mais claros — que é o que aparece na lateral
 * de um maço de verdade.
 */
export function corDoPapel(image) {
  try {
    const c = document.createElement('canvas');
    c.width = 24;
    c.height = 12;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(image, 0, 0, 24, 12);
    const d = g.getImageData(0, 0, 24, 12).data;

    const pixels = [];
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 24) continue;
      const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
      pixels.push([lum, d[i], d[i + 1], d[i + 2]]);
    }
    if (!pixels.length) return null;

    pixels.sort((a, b) => b[0] - a[0]);
    const corte = Math.max(1, Math.round(pixels.length * 0.4)); // 40% mais claros
    let r = 0, gg = 0, b = 0;
    for (let i = 0; i < corte; i++) { r += pixels[i][1]; gg += pixels[i][2]; b += pixels[i][3]; }

    return (Math.round(r / corte) << 16) | (Math.round(gg / corte) << 8) | Math.round(b / corte);
  } catch {
    return null; // canvas bloqueado — segue com a cor padrão
  }
}
