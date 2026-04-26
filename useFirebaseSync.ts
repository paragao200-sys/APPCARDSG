import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  addDoc,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { GameResult } from '../types';

export function useFirebaseSync() {
  // Inicializamos como null para ativar a tela de "Conectando" no App.tsx
  const [recentResults, setRecentResults] = useState<GameResult[] | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    let unsubscribe: () => void;

    const setup = async () => {
      try {
        // 1. Autenticação Anônima para garantir permissão de leitura
        if (!auth.currentUser) {
          try {
            await signInAnonymously(auth);
          } catch (authErr) {
            console.warn("Auth anônima não disponível, tentando acesso público.");
          }
        }

        // 2. Configuração da Query (Ordenado por tempo, limite de 50)
        const resultsRef = collection(db, 'live_results');
        const q = query(resultsRef, orderBy('timestamp', 'desc'), limit(50));

        // 3. Listener em tempo real (O "Coração" do App)
        unsubscribe = onSnapshot(q, (snapshot) => {
          const results = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              color: data.color,
              value: data.value,
              time: data.time,
              timestamp: data.timestamp
            };
          }) as GameResult[];
          
          if (results.length > 0) {
            setRecentResults(results);
          } else {
            // Se o banco estiver vazio, retorna array vazio mas não null
            setRecentResults([]);
            console.log("Aguardando dados da telemetria...");
          }
        }, (error) => {
          console.error("Erro no Snapshot do Firebase:", error);
          // Em caso de erro de permissão, libera a tela com array vazio para não travar
          setRecentResults([]);
        });

      } catch (err) {
        console.error("Falha crítica no setup do Firebase:", err);
        setRecentResults([]);
      }
    };

    setup();

    // Limpeza de memória ao fechar o app
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { recentResults };
}
