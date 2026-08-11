/* Carrega as cédulas já recortadas em public/notas/{valor}.png

   Os recortes são gerados pelo script:  npm run notas
   (ele fatia assets/familia-real.webp em uma imagem por cédula) */

import { TextureLoader, SRGBColorSpace } from 'three';

export const VALORES = [2, 5, 10, 20, 50, 100, 200];

const loader = new TextureLoader();
let cache = null;

function carregarUma(v) {
  return new Promise((resolve) => {
    loader.load(
      `notas/${v}.png`,
      (tex) => {
        tex.colorSpace = SRGBColorSpace;
        tex.anisotropy = 8;
        const im = tex.image;
        resolve([v, { tex, aspect: (im.width || 2) / (im.height || 1) }]);
      },
      undefined,
      () => resolve(null) // sem a imagem, segue com a cor de base
    );
  });
}

/**
 * Map valor → { tex, aspect } com cada cédula em sua própria textura.
 * Devolve null se nenhuma imagem for encontrada.
 */
export function carregarCedulas() {
  if (cache) return cache;
  cache = Promise.all(VALORES.map(carregarUma)).then((res) => {
    const mapa = new Map(res.filter(Boolean));
    return mapa.size ? mapa : null;
  });
  return cache;
}
