# EducFinance

Site interativo de educação financeira para adolescentes e jovens. Sem banco de dados — é tudo front-end.

## Rodar

```bash
npm install     # só na primeira vez
npm run dev     # abre em http://localhost:5173
```

## Gerar a versão final (pra entregar ou publicar)

```bash
npm run build     # gera a pasta dist/
npm run preview   # testa a versão final
```

A pasta `dist/` pode ser jogada em qualquer hospedagem estática (Vercel, Netlify, GitHub Pages).

## As cédulas 3D

As notas que flutuam no topo e as que se empilham na seção "Onde guardar" usam as
imagens reais da 2ª família do real, uma textura por cédula.

- Folha original: `assets/familia-real.webp` (não vai pro site)
- Recortes usados: `public/notas/2.png`, `5.png`, `10.png`, `20.png`, `50.png`, `100.png`, `200.png`

Trocou a folha original? Rode:

```bash
npm run notas
```

O script acha cada cédula sozinho (pela largura, que muda de valor pra valor) e
regrava os recortes.

## Onde mexer

| Quero mudar | Arquivo |
|---|---|
| Textos das seções | `index.html` |
| Mitos, quiz e glossário | `src/data/content.js` |
| Cores, fontes, tamanhos | `src/styles/main.css` (variáveis no topo) |
| Cédulas 3D do topo | `src/js/scene-hero.js` |
| Cédulas empilhadas | `src/js/scene-stack.js` |
| Recorte das cédulas | `scripts/fatiar-notas.mjs` |
| Gráfico de juros | `src/js/compound.js` |
| Regra 50·30·20 | `src/js/budget.js` |
| Conversor de dólar | `src/js/sections.js` |
| Perguntas do quiz | `src/js/quiz.js` + `src/data/content.js` |

## Feito com

Vite · Three.js (3D) · Lenis (scroll suave) · Canvas 2D (gráfico) — o resto é JavaScript puro.
