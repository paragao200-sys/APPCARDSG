import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

// Extrai as configurações com segurança
const { firestoreDatabaseId, ...appConfig } = firebaseConfigData as any;

// Inicializa o App
const app = initializeApp(appConfig);

// Proteção contra Tela Preta: Se o ID do banco falhar, usa o padrão
export const db = firestoreDatabaseId 
  ? getFirestore(app, firestoreDatabaseId) 
  : getFirestore(app);

export const auth = getAuth(app);
