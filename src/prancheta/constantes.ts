import type { Posicoes } from '../types';

// Espaço lógico do campo: 100 x 140. O Skia escala isso para a largura da tela.
export const LARGURA = 100;
export const ALTURA = 140;

export type Peca = { id: string; rotulo: string; cor: string; raio: number };

export const PECAS: Peca[] = [
  ...[1, 2, 3, 4, 5].map((n) => ({ id: `a${n}`, rotulo: String(n), cor: '#2563eb', raio: 4 })),
  ...[1, 2, 3].map((n) => ({ id: `b${n}`, rotulo: String(n), cor: '#dc2626', raio: 4 })),
  { id: 'bola', rotulo: '', cor: '#ffffff', raio: 2.2 },
];
export const IDS = PECAS.map((p) => p.id);

export const POS_INICIAL: Posicoes = {
  a1: { x: 50, y: 120 }, a2: { x: 25, y: 100 }, a3: { x: 75, y: 100 },
  a4: { x: 38, y: 80 }, a5: { x: 62, y: 80 },
  b1: { x: 30, y: 40 }, b2: { x: 50, y: 34 }, b3: { x: 70, y: 40 },
  bola: { x: 50, y: 60 },
};

export const copiarPos = (p: Posicoes): Posicoes => {
  const o: Posicoes = {};
  for (const id of IDS) o[id] = { x: p[id]?.x ?? 50, y: p[id]?.y ?? 70 };
  return o;
};
