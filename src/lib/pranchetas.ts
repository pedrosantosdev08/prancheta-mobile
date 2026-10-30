import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { POS_INICIAL, copiarPos } from '../prancheta/constantes';
import type { Prancheta, Quadro } from '../types';

const col = (uid: string) => collection(db, 'users', uid, 'pranchetas');

export const quadroInicial = (): Quadro => ({ p: copiarPos(POS_INICIAL), setas: [] });

export const ouvirPranchetas = (uid: string, cb: (l: Prancheta[]) => void) =>
  onSnapshot(query(col(uid), orderBy('criadoEm', 'desc')), (s) =>
    cb(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Prancheta)),
  );

export async function criarPrancheta(uid: string, titulo: string) {
  const d = await addDoc(col(uid), { titulo, quadros: [quadroInicial()], criadoEm: Date.now() });
  return d.id;
}

export async function carregarPrancheta(uid: string, id: string) {
  const s = await getDoc(doc(db, 'users', uid, 'pranchetas', id));
  return s.exists() ? ({ id: s.id, ...s.data() } as Prancheta) : null;
}

export const salvarPrancheta = (uid: string, id: string, dados: { titulo: string; quadros: Quadro[] }) =>
  updateDoc(doc(db, 'users', uid, 'pranchetas', id), dados);

export const excluirPrancheta = (uid: string, id: string) => deleteDoc(doc(db, 'users', uid, 'pranchetas', id));
