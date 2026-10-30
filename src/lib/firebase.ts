import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cfg = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const faltando = Object.entries(cfg).filter(([, v]) => !v).map(([k]) => k);
if (faltando.length) {
  throw new Error(
    `Firebase não configurado (faltando: ${faltando.join(', ')}). ` +
      'Preencha o arquivo .env com as chaves do app Web do Firebase e reinicie com: npx expo start -c',
  );
}

const app = getApps().length ? getApp() : initializeApp(cfg);

let auth: Auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch (e) {
  // fast refresh: já inicializado. Qualquer outro erro deve aparecer.
  if ((e as { code?: string }).code !== 'auth/already-initialized') throw e;
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
