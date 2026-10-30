export type Categoria = 'Técnico' | 'Tático' | 'Físico' | 'Finalização';
export type Midia = { tipo: 'imagem' | 'video'; url: string };
export type Exercicio = {
  id: string;
  titulo: string;
  categoria: Categoria;
  duracaoMin: number;
  objetivo: string;
  descricao: string;
  midias: Midia[];
  pranchetaId?: string;
  criadoEm?: number;
};

export type Atleta = { id: string; nome: string; posicao: string; numero: number };

export type Sessao = { data: string; turma: string; exercicios: string[] };

// Prancheta tática. Firestore não aceita array dentro de array, por isso tudo é objeto.
export type Pt = { x: number; y: number };
export type Posicoes = Record<string, Pt>;
export type Seta = { x1: number; y1: number; x2: number; y2: number };
export type Quadro = { p: Posicoes; setas: Seta[] };
export type Prancheta = { id: string; titulo: string; quadros: Quadro[]; criadoEm?: number };
