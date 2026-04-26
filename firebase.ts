
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const { firestoreDatabaseId, ...appConfig } = firebaseConfig as any;

const app = initializeApp(appConfig);
export const db = getFirestore(app, firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
