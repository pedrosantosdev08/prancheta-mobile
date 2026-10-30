import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import type { Atleta } from '../types';

const col = (uid: string) => collection(db, 'users', uid, 'atletas');

export const ouvirAtletas = (uid: string, cb: (l: Atleta[]) => void) =>
  onSnapshot(query(col(uid), orderBy('numero', 'asc')), (s) =>
    cb(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Atleta)),
  );

export const criarAtleta = (uid: string, a: Omit<Atleta, 'id'>) => addDoc(col(uid), a);
export const excluirAtleta = (uid: string, id: string) => deleteDoc(doc(db, 'users', uid, 'atletas', id));
