import { useEffect, useState } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';

function App() {
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Tenta login anônimo
    signInAnonymously(auth)
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro no login:", error);
        setHasError(true);
        setLoading(false);
      });

    // 2. Monitora estado
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setHasError(true);
      }
    }, (error) => {
      console.error("Erro de permissão:", error);
      setHasError(true);
    });

    return () => unsubscribe();
  }, []);

  const handleReset = async () => {
    try {
      await signOut(auth);
      window.location.reload(); // Recarrega para tentar novo login anônimo
    } catch (e) {
      window.location.reload();
    }
  };

  // TELA DE ERRO CORRIGIDA
  if (hasError) {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2 style={{ color: '#ff4444' }}>Acesso Interrompido</h2>
        <p>Sua sessão foi bloqueada ou expirou.</p>
        <button 
          onClick={handleReset}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Tentar Reconectar
        </button>
      </div>
    );
  }

  // TELA DE LOADING
  if (loading) return <div style={{backgroundColor: '#000', height: '100vh'}} />;

  // CONTEÚDO ORIGINAL (Aqui você insere seu componente principal de sinais)
  return (
    <div className="app-content">
      <h1 style={{color: 'white', textAlign: 'center'}}>Sistema Speed Dados Online</h1>
      {/* Insira aqui o componente que carrega seus sinais, ex: <SignalDashboard /> */}
    </div>
  );
}

export default App;