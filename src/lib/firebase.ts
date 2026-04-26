<<<<<<< HEAD
export const firebaseConfig = {
  apiKey: "AIzaSyB1NHlX4AFBZLkGsU9f_ABJjTcmrU0W7yg",
  authDomain: "ia-sem-gale.firebaseapp.com",
  projectId: "ia-sem-gale",
  storageBucket: "ia-sem-gale.firebasestorage.app",
  messagingSenderId: "123717217586",
  appId: "1:123717217586:web:ed5f6874f030f48299fb2b",
  measurementId: "G-50PK14N6P4"
};
=======
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const { firestoreDatabaseId, ...appConfig } = firebaseConfig as any;

// Inicializa o App com as configurações do JSON
const app = initializeApp(appConfig);

// Correção: Se o firestoreDatabaseId não existir ou for inválido, usa o padrão
// Isso evita erros de conexão que deixam a tela preta
export const db = firestoreDatabaseId 
  ? getFirestore(app, firestoreDatabaseId) 
  : getFirestore(app);

export const auth = getAuth(app);
>>>>>>> 2da9b7fe285f8d4c387b0b8692528170282123a5
