import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { StrategyPreset, Strategy } from '../types';

export function usePresets() {
  const [presets, setPresets] = useState<StrategyPreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setPresets([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'presets'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribeSnap = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StrategyPreset[];
        setPresets(data);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching presets:", error);
        setLoading(false);
      });

      return () => unsubscribeSnap();
    });

    return () => unsubscribeAuth();
  }, []);

  const savePreset = async (name: string, banca: string, meta: string, stopLoss: string, strategy: Strategy) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const newPreset = {
      name,
      banca,
      meta,
      stopLoss,
      strategy,
      userId: user.uid,
      createdAt: Date.now()
    };

    await addDoc(collection(db, 'presets'), newPreset);
  };

  const deletePreset = async (id: string) => {
    await deleteDoc(doc(db, 'presets', id));
  };

  return { presets, loading, savePreset, deletePreset };
}
