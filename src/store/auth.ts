import { create } from 'zustand';
import {
  User, createUserWithEmailAndPassword, onAuthStateChanged,
  signInWithEmailAndPassword, signOut as fbSignOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

type S = {
  user: User | null;
  ready: boolean;
  init: () => () => void;
  signIn: (e: string, s: string) => Promise<void>;
  signUp: (e: string, s: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuth = create<S>((set) => ({
  user: null,
  ready: false,
  init: () => onAuthStateChanged(auth, (user) => set({ user, ready: true })),
  signIn: async (e, s) => { await signInWithEmailAndPassword(auth, e, s); },
  signUp: async (e, s) => { await createUserWithEmailAndPassword(auth, e, s); },
  signOut: () => fbSignOut(auth),
}));
