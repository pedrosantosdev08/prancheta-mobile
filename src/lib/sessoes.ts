import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Sessao } from '../types';

// Um documento por dia (id = AAAA-MM-DD)
const ref = (uid: string, data: string) => doc(db, 'users', uid, 'sessoes', data);

export const ouvirSessao = (uid: string, data: string, cb: (s: Sessao) => void) =>
  onSnapshot(ref(uid, data), (s) =>
    cb(s.exists() ? (s.data() as Sessao) : { data, turma: '', exercicios: [] }),
  );

export const salvarSessao = (uid: string, s: Sessao) => setDoc(ref(uid, s.data), s);
