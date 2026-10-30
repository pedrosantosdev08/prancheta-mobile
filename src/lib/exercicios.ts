import { collection, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Exercicio, Midia } from '../types';

// Toda a comunicação com o Firebase fica aqui, para facilitar trocar o SDK depois.
const col = (uid: string) => collection(db, 'users', uid, 'exercicios');

export const ouvirTodos = (uid: string, cb: (l: Exercicio[]) => void) =>
  onSnapshot(query(col(uid), orderBy('criadoEm', 'desc')), (s) =>
    cb(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Exercicio)),
  );

export const ouvirUm = (uid: string, id: string, cb: (e: Exercicio | null) => void) =>
  onSnapshot(doc(db, 'users', uid, 'exercicios', id), (s) =>
    cb(s.exists() ? ({ id: s.id, ...s.data() } as Exercicio) : null),
  );

export type Escolhida = { uri: string; tipo: 'imagem' | 'video' };

export async function criarExercicio(
  uid: string,
  dados: Omit<Exercicio, 'id' | 'midias' | 'criadoEm'>,
  escolhidas: Escolhida[],
) {
  const d = doc(col(uid));
  const midias: Midia[] = [];
  for (const [i, m] of escolhidas.entries()) {
    const blob = await (await fetch(m.uri)).blob();
    const r = ref(storage, `users/${uid}/exercicios/${d.id}/${Date.now()}-${i}`);
    await uploadBytes(r, blob, { contentType: blob.type });
    midias.push({ tipo: m.tipo, url: await getDownloadURL(r) });
  }
  await setDoc(d, { ...dados, midias, criadoEm: Date.now() });
}

export const vincularPrancheta = (uid: string, id: string, pranchetaId: string) =>
  updateDoc(doc(db, 'users', uid, 'exercicios', id), { pranchetaId });
