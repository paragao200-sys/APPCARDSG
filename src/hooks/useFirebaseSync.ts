
import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { GameResult } from '../types';

export function useFirebaseSync() {
  const [recentResults, setRecentResults] = useState<GameResult[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    let unsubscribe: (() => void) | undefined;
    let interval: NodeJS.Timeout | undefined;

    const setup = async () => {
      try {
        if (!auth.currentUser) {
          try {
            await signInAnonymously(auth);
          } catch (authErr: any) {
            if (authErr.code === 'auth/admin-restricted-operation') {
              console.warn("Anonymous Auth is disabled in Firebase Console. Proceeding without explicit auth state.");
            } else {
              throw authErr;
            }
          }
        }

        const resultsRef = collection(db, 'live_results');
        const q = query(resultsRef, orderBy('timestamp', 'desc'), limit(50));

        unsubscribe = onSnapshot(q, async (snapshot) => {
          const results = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as GameResult[];
          
          if (results.length > 0) {
            setRecentResults(results);
          } else {
            // Initial data seeding if empty - Universal Pattern
            const patternColors: ('RED' | 'BLUE' | 'TIE')[] = [
              'RED', 'BLUE', 'RED', 'TIE', 'TIE', 'RED', 'BLUE', 'RED', 'BLUE', 'RED', 
              'RED', 'BLUE', 'RED', 'TIE', 'RED', 'BLUE', 'BLUE', 'RED', 'BLUE', 'TIE'
            ];
            const patternValues = [5, 13, 7, 10, 10, 8, 8, 9, 7, 6, 12, 13, 7, 10, 8, 13, 7, 12, 6, 10];
            
            // Seed sequentially to avoid flooding
            for (let i = 0; i < patternColors.length; i++) {
              const color = patternColors[i];
              const timestamp = Date.now() - ((patternColors.length - i) * 60000);
              const item = {
                color: color,
                value: patternValues[i] || 8,
                time: new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                timestamp
              };
              await addDoc(resultsRef, item);
            }
          }
        });

        // Universal Maintenance - Less random, more pattern-based
        interval = setInterval(async () => {
          const snapshot = await getDocs(q);
          const docs = snapshot.docs;
          const lastDoc = docs[0];
          const lastTimestamp = lastDoc?.data().timestamp || 0;
          
          if (Date.now() - lastTimestamp > 15000) {
            // Scripted pattern generation for universal look
            const patternLength = 20;
            const nextIndex = (docs.length) % patternLength;
            const colors: ('RED' | 'BLUE' | 'TIE')[] = [
              'RED', 'BLUE', 'RED', 'RED', 'BLUE', 'TIE', 'BLUE', 'RED', 'BLUE', 'RED',
              'RED', 'RED', 'BLUE', 'BLUE', 'TIE', 'RED', 'BLUE', 'RED', 'BLUE', 'TIE'
            ];
            const values = [5, 13, 7, 12, 6, 10, 7, 8, 8, 9, 13, 11, 4, 14, 1, 9, 13, 7, 8, 10];
            
            const newColor = colors[nextIndex];
            const newValue = values[nextIndex];
            const now = Date.now();
            
            await addDoc(resultsRef, {
              color: newColor,
              value: newValue,
              time: new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              timestamp: now
            });
          }
        }, 4000);

      } catch (err) {
        console.error("Firebase sync setup failed:", err);
      }
    };

    setup();

    return () => {
      if (unsubscribe) unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, []);

  return { recentResults };
}
