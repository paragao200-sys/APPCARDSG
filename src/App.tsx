import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import { 
  ShieldCheck, 
  Zap, 
  Activity, 
  Volume2, 
  VolumeX, 
  Bell,
  Monitor,
  RotateCcw,
  Sparkles,
  Club,
  Spade,
  Heart,
  Diamond,
  Timer,
  ChevronDown,
  Target,
  Trophy,
  Cpu,
  Clock,
  LogOut,
  Table,
  Play,
  Dices
} from 'lucide-react';
import { cn } from './lib/utils';

// Types
import { 
  GameState, 
  Strategy, 
  SignalColor, 
  WinRecord, 
  Notification as PushNotification 
} from './types';

// Components
import { 
  BackgroundParticles, 
  SnowEffect, 
  FireEffect, 
  CyberCore,
  PremiumFog
} from './components/layout/BackgroundEffects';
import { IconButton } from './components/ui/IconButton';
import { SpreadsheetModal } from './components/modals/SpreadsheetModal';
import { AdminModal } from './components/modals/AdminModal';
import { LiveFeed } from './components/features/LiveFeed';
import { FootballStudioStats } from './components/features/FootballStudioStats';

// Hooks
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { useAudioSynth } from './hooks/useAudioSynth';

import { Tooltip, TooltipProvider } from './components/ui/Tooltip';

type AppStage = 'AUTH' | 'GAME_SELECT' | 'MAIN_APP';
type GameType = 'BACCARAT' | 'BACBO' | 'FOOTBALL_STUDIO';

const gameThemes = {
  BACCARAT: {
    bg: 'bg-baccarat-blue',
    radial: 'bg-[radial-gradient(circle_at_50%_20%,rgba(65,105,225,0.15)_0%,transparent_50%)]',
    primary: 'text-baccarat-player',
    secondary: 'text-baccarat-banker',
    accent: 'text-green-500',
    historyType: 'BEAD_PLATE',
    animation: 'cards',
    btnClass: 'hover:bg-baccarat-player',
    glow: 'shadow-[0_0_40px_rgba(65,105,225,0.3)]',
    signalColors: {
      BLUE: 'bg-baccarat-player',
      RED: 'bg-baccarat-banker',
      TIE: 'bg-green-500'
    }
  },
  BACBO: {
    bg: 'bg-bacbo-bg',
    radial: 'bg-[radial-gradient(circle_at_50%_20%,rgba(212,175,55,0.1)_0%,transparent_50%)]',
    primary: 'text-bacbo-gold',
    secondary: 'text-white',
    accent: 'text-orange-500',
    historyType: 'DICE',
    animation: 'shake',
    btnClass: 'hover:bg-bacbo-gold hover:text-black',
    glow: 'shadow-[0_0_40px_rgba(212,175,55,0.2)]',
    signalColors: {
      BLUE: 'bg-blue-500',
      RED: 'bg-red-500',
      TIE: 'bg-orange-500'
    }
  },
  FOOTBALL_STUDIO: {
    bg: 'bg-football-bg',
    radial: 'bg-[radial-gradient(circle_at_50%_20%,rgba(0,255,0,0.05)_0%,transparent_50%)]',
    primary: 'text-white',
    secondary: 'text-bet-red',
    accent: 'text-football-tie',
    historyType: 'TIMELINE',
    animation: 'glow',
    btnClass: 'hover:bg-green-600',
    glow: 'shadow-[0_0_40px_rgba(0,255,0,0.15)]',
    signalColors: {
      BLUE: 'bg-bet-blue',
      RED: 'bg-bet-red',
      TIE: 'bg-football-tie'
    }
  }
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginView, setIsLoginView] = useState(true);
  const [stage, setStage] = useState<AppStage>('AUTH');
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [strategy, setStrategy] = useState<Strategy>('CONSERVATIVE');
  const [targetColor, setTargetColor] = useState<SignalColor | null>(null);
  const [targetCard, setTargetCard] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confidence, setConfidence] = useState(94.2);
  const [assertiveness, setAssertiveness] = useState("24/1");

  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [signalIntensity, setSignalIntensity] = useState(1);
  const [activeNotifications, setActiveNotifications] = useState<PushNotification[]>([]);
  const [showSpreadsheet, setShowSpreadsheet] = useState(false);
  const [showAudioUnlock, setShowAudioUnlock] = useState(false);

  // Management States
  const [banca, setBanca] = useState('100');
  const [meta, setMeta] = useState('10');
  const [stopLoss, setStopLoss] = useState('20');
  const [lastSignalMinute, setLastSignalMinute] = useState<number | null>(null);
  const [isProfessionalMode, setIsProfessionalMode] = useState(false);
  const [liveAssertiveness, setLiveAssertiveness] = useState(94.2);

  // Admin States
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminAuthKey, setAdminAuthKey] = useState('');

  // Live Assertiveness Oscillation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveAssertiveness(prev => {
        const oscillation = (Math.random() * 2 - 1) * 0.5;
        const newValue = Math.min(Math.max(88.5, prev + oscillation), 96.1);
        return parseFloat(newValue.toFixed(1));
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const timersRef = useRef<(NodeJS.Timeout | number)[]>([]);
  const notifIdRef = useRef(0);

  // Custom Hooks
  const { recentResults } = useFirebaseSync();
  const { playSound, audioContext } = useAudioSynth(isMuted);

  const addNotification = useCallback((text: string, type: 'warning' | 'alert' | 'success') => {
    const id = Date.now() + Math.random(); // Improved unique ID
    setActiveNotifications(prev => [...prev, { id, text, type }]);
    playSound('NOTIFICATION');
    
    const cleanupTimer = setTimeout(() => {
      setActiveNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
    timersRef.current.push(cleanupTimer);
  }, [playSound]);

  const wins = useMemo<WinRecord[]>(() => {
    const names = ['RAFAEL', 'MARIA', 'ANA', 'JOAO', 'PEDRO', 'CARLOS', 'BRUNA', 'Felipe', 'Gustavo', 'Lucas', 'JULIA', 'REBECA', 'PAULO', 'DANIEL', 'MARCOS', 'THIAGO', 'BRUNO', 'RODRIGO', 'ALICE', 'BEATRIZ'];
    const surNames = ['S', 'P', 'D', 'M', 'Silva', 'Santos', 'Oliveira'];
    
    return Array.from({ length: 40 }).map((_, i) => ({
      id: `win-${i}-${Math.random()}`, // Guaranteed unique ID
      user: `@${names[i % names.length]}_${surNames[Math.floor(Math.random() * surNames.length)]}`.toUpperCase(),
      amount: `R$ ${(Math.random() * (7000 - 20) + 20).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      type: Math.random() > 0.05 ? 'GREEN' : 'GALE WIN'
    }));
  }, []);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(err => console.error('Auth check error:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (gameState === 'ANALYZING' && progress % 20 === 0) playSound('ANALYZING');
    if (gameState === 'SIGNAL_FOUND') playSound('SIGNAL_FOUND');
    if (gameState === 'WAITING') playSound('WAITING');
  }, [gameState, progress, playSound]);

  useEffect(() => {
    const resumeAudio = () => {
      if (audioContext?.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('Audio Context Resumed Automatically');
        });
      }
    };
    window.addEventListener('click', resumeAudio, { once: true });
    window.addEventListener('touchstart', resumeAudio, { once: true });
    return () => {
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('touchstart', resumeAudio);
    };
  }, [audioContext]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    audioContext?.resume();
    setAuthError('');
    const res = await fetch(isLoginView ? '/api/login' : '/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data);
      setStage('GAME_SELECT');
    } else {
      const data = await res.json();
      setAuthError(data.error || 'Falha na autenticação.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
    setGameState('IDLE');
  };

  const handleBackToMenu = () => {
    playSound('CLICK');
    timersRef.current.forEach(timer => {
      clearTimeout(timer as any);
      clearInterval(timer as any);
    });
    timersRef.current = [];
    setGameState('IDLE');
    setStage('GAME_SELECT');
  };

  const runTimeline = useCallback(() => {
    setGameState('ANALYZING');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
    timersRef.current.push(interval);

    setTimeout(() => {
      const minute = new Date().getMinutes();
      let color: SignalColor;
      
      if (strategy === 'AGGRESSIVE') {
        // Gale 1 specific logic:
        // Neutros (0) -> Vermelho
        // Ímpares -> Vermelho
        // Pares -> Azul
        if (minute % 10 === 0) {
          color = 'RED';
        } else if (minute % 2 !== 0) {
          color = 'RED';
        } else {
          color = 'BLUE';
        }
      } else {
        // Sem Gale (CONSERVATIVE): Don't touch, keep existing logic
        color = Math.random() > 0.5 ? 'BLUE' : 'RED';
      }
      
      setTargetColor(color);
      setTargetCard(['J', 'Q', 'K', 'A'][Math.floor(Math.random() * 4)]);
      setConfidence(parseFloat((90 + Math.random() * 8).toFixed(1)));
      setAssertiveness(`${20 + Math.floor(Math.random() * 10)}/1`);
      setLastSignalMinute(minute);
      setGameState('SIGNAL_FOUND');
      setSignalIntensity(2.5);
      
      const intensityFade = setInterval(() => setSignalIntensity(p => Math.max(1, p - 0.05)), 100);
      timersRef.current.push(intensityFade);

      setTimeout(() => {
        setGameState('WAITING');
        setTimeout(() => setGameState('IDLE'), 10000);
      }, 25000);
    }, 4000);
  }, [strategy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.15)_0%,transparent_60%),radial-gradient(circle_at_50%_50%,rgba(0,136,255,0.1)_0%,transparent_70%)] animate-pulse" />
        <div className="relative z-10">
          <div className="relative w-24 h-24 mb-10 mx-auto">
            <div className="absolute inset-0 border-2 border-bet-blue/20 rounded-full" />
            <div className="absolute inset-0 border-t-2 border-bet-blue rounded-full animate-spin" />
            <div className="absolute inset-4 border border-bet-blue/10 rounded-full animate-reverse-spin" />
            <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-bet-blue/40 animate-pulse" size={32} />
          </div>
          <h2 className="text-xl font-display font-black text-white italic uppercase tracking-[0.4em] mb-4 drop-shadow-[0_0_20px_rgba(0,136,255,0.4)]">Sincronizando <span className="text-bet-blue">Rede Neural</span></h2>
          <div className="flex flex-col gap-2">
            <div className="flex gap-1 justify-center">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-8 h-1 bg-bet-blue/20 rounded-full overflow-hidden"
                >
                  <motion.div 
                    animate={{ x: [-32, 32] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-1/2 h-full bg-bet-blue"
                  />
                </motion.div>
              ))}
            </div>
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] mt-2">Connecting to live cloud datastreams...</p>
          </div>
        </div>
      </div>
    );
  }

  const dailyMetaAmount = (Number(banca) || 0) * (Number(meta) || 0) / 100;
  const stakeRecomendada = (Number(banca) || 0) * (Number(meta) === 10 ? 0.1 : 0.05);

  // Ripple Effect Handler
  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) { ripple.remove(); }

    button.appendChild(circle);
  };

  const handleGameSelect = (game: GameType) => {
    playSound('CLICK');
    setLoading(true);
    setTimeout(() => {
      setSelectedGame(game);
      setStage('MAIN_APP');
      setLoading(false);
    }, 1500);
  };

  const currentTheme = selectedGame ? gameThemes[selectedGame] : null;

  return (
    <TooltipProvider>
    <AnimatePresence mode="wait">
      {/* Global Red/Blue Deep Background */}
      <div className="fixed inset-0 z-[-3] bg-black" />
      
      {/* Invisible Admin Trigger */}
      <button 
        onClick={() => setIsAdminModalOpen(true)}
        className="fixed top-0 right-0 w-12 h-12 z-[1000] opacity-0 cursor-default"
        aria-label="Admin Access"
      />
      <div className="fixed inset-0 z-[-3] opacity-40 bg-[radial-gradient(circle_at_5%_5%,rgba(255,0,0,0.2)_0%,transparent_40%),radial-gradient(circle_at_95%_95%,rgba(0,136,255,0.2)_0%,transparent_40%)]" />

      {/* Brand Background Image - Global */}
      <div className="fixed inset-0 z-[-2] pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.45]">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ 
            scale: [1, 1.02, 1],
            opacity: [1, 0.8, 1, 0.9, 1],
            filter: ["hue-rotate(0deg)", "hue-rotate(10deg)", "hue-rotate(0deg)"]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            times: [0, 0.95, 0.96, 0.98, 1], // Glitch effect at the end of the loop
            ease: "linear"
          }}
          src="/login_bg.jpg"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
      </div>

      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-30">
        <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}>
          <BackgroundParticles intensity={signalIntensity} />
          <PremiumFog intensity={0.4} />
          {gameState === 'SIGNAL_FOUND' && (
            targetColor === 'BLUE' ? <SnowEffect intensity={signalIntensity} /> : <FireEffect intensity={signalIntensity} />
          )}
        </Canvas>
      </div>

      {user && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-black/60 backdrop-blur-md border-b border-white/5 py-1 px-4 hidden md:flex items-center justify-center gap-8">
          <FinancialStat label="Banca" value={`R$ ${Number(banca).toFixed(2)}`} color="text-bet-blue" />
          <FinancialStat label={`Meta (${meta}%)`} value={`R$ ${dailyMetaAmount.toFixed(2)}`} color="text-bet-tie" />
          <FinancialStat label="Stake" value={`R$ ${stakeRecomendada.toFixed(2)}`} color="text-bet-red" />
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {activeNotifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className={cn(
                "px-4 py-3 rounded-xl border flex items-center gap-3 backdrop-blur-xl shadow-2xl min-w-[200px]",
                n.type === 'warning' && "bg-amber-500/10 border-amber-500/30 text-amber-500",
                n.type === 'alert' && "bg-bet-red/10 border-bet-red/30 text-bet-red",
                n.type === 'success' && "bg-bet-blue/10 border-bet-blue/30 text-bet-blue"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full animate-pulse", n.type === 'warning' && "bg-amber-500", n.type === 'alert' && "bg-bet-red", n.type === 'success' && "bg-bet-blue")} />
              <span className="text-[10px] font-black uppercase tracking-widest">{n.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <SpreadsheetModal 
        isOpen={showSpreadsheet} onClose={() => setShowSpreadsheet(false)}
        banca={banca} setBanca={setBanca} meta={meta} setMeta={setMeta} stopLoss={stopLoss} setStopLoss={setStopLoss}
        strategy={strategy} setStrategy={setStrategy}
      />

      <AdminModal 
        isOpen={isAdminModalOpen} 
        onClose={() => {
          setIsAdminModalOpen(false);
          setAdminAuthKey('');
        }}
        isAuthenticated={isAdminAuthenticated}
        onAuthenticate={(key) => {
          if (key === 'Speedcardsg' || key === 'SPEEDSG!@#$%^&*') {
            setIsAdminAuthenticated(true);
            playSound('SUCCESS');
          } else {
            playSound('ALERT');
          }
        }}
      />

      {stage === 'AUTH' && !user && (
        <AuthScreen key="auth" isLoginView={isLoginView} setIsLoginView={setIsLoginView} password={password} setPassword={setPassword} authError={authError} handleAuth={handleAuth} />
      )}

      {stage === 'GAME_SELECT' && (
        <GameSelection key="game-select" onSelect={handleGameSelect} />
      )}

      {stage === 'MAIN_APP' && user && selectedGame && (
        <motion.div 
          key="main-app"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(
            "min-h-screen flex flex-col items-center w-full max-w-[1920px] mx-auto px-4 md:px-16 py-4 relative transition-colors duration-700",
            isProfessionalMode 
              ? "bg-[radial-gradient(circle_at_50%_50%,#1a1a1a_0%,#0d0d0d_100%)] noise-texture" 
              : (currentTheme?.bg || "bg-black")
          )}
        >
            {/* IA Scanner Line */}
            <div className="scanner-line fixed inset-0 h-[110vh]" style={{ '--scanner-color': isProfessionalMode ? '#50C878' : (targetColor === 'BLUE' ? '#0088FF' : '#FF0000') } as any} />
            
            {/* Ambient Red Glow */}
            <div className="fixed inset-0 pointer-events-none z-[-1] bg-[radial-gradient(circle_at_50%_120%,rgba(255,0,0,0.15)_0%,transparent_60%)]" />

            {/* Atmospheric Flare - Optimized with CSS Gradient instead of Blur Filter */}
            {gameState === 'SIGNAL_FOUND' && (
              <motion.div 
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={cn(
                  "fixed inset-0 pointer-events-none z-0",
                  targetColor === 'BLUE' 
                    ? `bg-[radial-gradient(circle_at_50%_50%,rgba(0,136,255,0.08)_0%,transparent_70%)]` 
                    : `bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.08)_0%,transparent_70%)]`,
                  selectedGame === 'FOOTBALL_STUDIO' && "animate-glow-green"
                )}
              />
            )}

           <WinsTicker wins={wins} />

           <header className="w-full flex items-center justify-between mb-8 px-2 relative z-10 transition-all duration-700">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 glass-panel rounded-2xl flex items-center justify-center transition-all duration-500",
                  isProfessionalMode ? "text-prof-emerald shadow-[inset_0_0_15px_rgba(80,200,120,0.2)] border-prof-emerald/20" : "text-bet-blue ring-2 ring-bet-blue/20"
                )}>
                  {selectedGame === 'BACCARAT' && <Spade className="fill-current w-6 h-6" />}
                  {selectedGame === 'BACBO' && <Dices className="fill-current w-6 h-6" />}
                  {selectedGame === 'FOOTBALL_STUDIO' && <Zap className="fill-current w-6 h-6" />}
                </div>
                <div>
                  <h1 className="font-display font-black text-2xl tracking-tighter leading-none italic text-white flex flex-col md:flex-row md:items-center md:gap-2">
                    SPEED CARDS 
                    <span className={cn(
                      "transition-colors duration-500",
                      isProfessionalMode ? "text-prof-emerald" : "text-bet-blue"
                    )}>
                      {selectedGame === 'BACCARAT' ? 'SPEED BACCARAT BRASILEIRO' : selectedGame?.replace('_', ' ')}
                    </span>
                  </h1>
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-bet-tie uppercase tracking-widest"><span className="w-1 h-1 rounded-full bg-bet-tie animate-ping" /> Sincronizado</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Assertiveness Bar */}
                <Tooltip content="Precisão em tempo real calculada pela rede neural baseada no histórico recente">
                  <div className="hidden lg:flex flex-col gap-1.5 mr-6 w-48 transition-all duration-700 cursor-help">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black italic text-white/40 uppercase tracking-widest">IA Accuracy</span>
                      <span className="text-[14px] font-mono font-bold text-prof-emerald tracking-tighter shadow-sm">{liveAssertiveness}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        animate={{ 
                          width: `${liveAssertiveness}%`,
                          boxShadow: `0 0 15px rgba(80, 200, 120, ${liveAssertiveness / 100})`
                        }}
                        className="h-full bg-gradient-to-r from-prof-emerald/40 to-prof-emerald rounded-full"
                      />
                    </div>
                  </div>
                </Tooltip>

                {/* Theme Toggle */}
                <Tooltip content={isProfessionalMode ? "Mudar para interface original simplificada" : "Interface avançada com telemetria detalhada"}>
                  <button 
                    onClick={() => setIsProfessionalMode(!isProfessionalMode)}
                    className={cn(
                      "px-4 py-2 rounded-xl border flex items-center gap-2 transition-all group",
                      isProfessionalMode 
                        ? "bg-prof-emerald/10 border-prof-emerald/20 text-prof-emerald" 
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    )}
                  >
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Modo {isProfessionalMode ? 'PRO' : 'Original'}</span>
                  </button>
                </Tooltip>

                <IconButton icon={isMuted ? <VolumeX /> : <Volume2 />} onClick={() => setIsMuted(!isMuted)} />
                <IconButton icon={<Table />} onClick={() => setShowSpreadsheet(true)} />
                <IconButton icon={<Bell />} />
                <IconButton icon={<LogOut />} onClick={handleBackToMenu} title="Voltar ao Menu" />
              </div>
           </header>

           <div className="w-full relative z-10 flex flex-col gap-4">
              <FootballStudioStats results={recentResults} gameState={gameState} />
              
              <div className="flex flex-col items-center justify-center w-full relative group/terminal">
                 {/* Atmospheric Glow */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-bet-blue/5 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 group-hover/terminal:bg-bet-blue/10" />
                 
                 <div className="w-full lg:max-w-4xl flex flex-col items-center gap-4 relative z-10">
                    <div className="w-full opacity-40 hover:opacity-100 transition-all duration-500 scale-[0.98] hover:scale-100">
                       <LiveFeed results={recentResults} />
                    </div>
                    <MainDisplay 
                      gameState={gameState} progress={progress} 
                      targetColor={targetColor} targetCard={targetCard} 
                      confidence={confidence} assertiveness={assertiveness}
                      strategy={strategy} lastSignalMinute={lastSignalMinute}
                      onStart={runTimeline}
                      selectedGame={selectedGame}
                      currentTheme={currentTheme}
                      isProfessionalMode={isProfessionalMode}
                      createRipple={createRipple}
                      runTimeline={runTimeline}
                      playSound={playSound}
                    />
                    
                    <div className="w-full flex gap-6 mt-2 max-w-2xl px-4">
                       <StrategyButton 
                         active={strategy === 'CONSERVATIVE'} 
                         onClick={() => setStrategy('CONSERVATIVE')} 
                         label="SEM GALE" icon={<ShieldCheck size={20}/>} 
                         theme={currentTheme}
                         isProfessionalMode={isProfessionalMode}
                         createRipple={createRipple}
                       />
                       <StrategyButton 
                         active={strategy === 'AGGRESSIVE'} 
                         onClick={() => setStrategy('AGGRESSIVE')} 
                         label="ATÉ GALE 1" icon={<Zap size={20}/>} 
                         theme={currentTheme}
                         shake={selectedGame === 'BACBO' && gameState === 'SIGNAL_FOUND'}
                         isProfessionalMode={isProfessionalMode}
                         createRipple={createRipple}
                       />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full max-w-7xl mx-auto">
                 <div className="lg:col-span-12">
                    <SignalLogs selectedGame={selectedGame} currentTheme={currentTheme} isProfessionalMode={isProfessionalMode} />
                 </div>
                 <div className="lg:col-span-12">
                    <StrategyBoard selectedGame={selectedGame} currentTheme={currentTheme} isProfessionalMode={isProfessionalMode} />
                 </div>
              </div>


           </div>
        </motion.div>
      )}
    </AnimatePresence>
    </TooltipProvider>
  );
}

function FinancialStat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[8px] font-bold text-white/30 uppercase">{label}:</span>
      <span className={cn("text-[10px] font-black", color)}>{value}</span>
    </div>
  );
}

function WinsTicker({ wins }: { wins: WinRecord[] }) {
  return (
    <div className="w-full overflow-hidden whitespace-nowrap bg-black/40 py-3 border-b border-white/5 mb-6 rounded-xl relative z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
      <motion.div animate={{ x: [0, -2000] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="flex gap-12 items-center">
        {[...wins, ...wins, ...wins].map((win, i) => (
          <div key={`ticker-win-${win.id}-${i}`} className="flex items-center gap-3 text-[11px] font-black group transition-all">
            <span className="text-white/40 tracking-tighter">{win.user}</span>
            <span className={cn(
              "px-2 py-0.5 rounded italic text-[9px] shadow-[0_0_10px_currentColor]",
              win.type === 'GREEN' ? "bg-[#00FF57]/20 text-[#00FF57] border border-[#00FF57]/40" : "bg-amber-400/20 text-amber-400 border border-amber-400/40",
            )}>
              {win.type}
            </span>
            <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{win.amount}</span>
            <span className="text-white/10 opacity-50">/</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function MainDisplay({ gameState, progress, targetColor, targetCard, confidence, assertiveness, strategy, lastSignalMinute, onStart, selectedGame, currentTheme, isProfessionalMode, createRipple, runTimeline, playSound }: any) {
  return (
    <>
      <AnimatePresence>
        {gameState !== 'ANALYZING' && (
          <Tooltip side="left" content="Forçar nova análise da rede neural para buscar padrões">
            <motion.button
              key="floating-request"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e: any) => {
                createRipple(e);
                if (playSound) playSound('SCAN');
                runTimeline();
              }}
              className={cn(
                "fixed bottom-8 right-8 z-[80] group flex items-center gap-3 glass-panel pl-6 pr-4 py-3 rounded-full border-white/10 hover:border-bet-blue/30 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.5)]",
                isProfessionalMode && "hover:border-prof-emerald/30"
              )}
            >
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black uppercase text-white/30 tracking-widest leading-none">Analisar Novamente</span>
                <span className="text-[11px] font-display font-black uppercase text-white tracking-tight">Solicitar Entrada</span>
              </div>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                isProfessionalMode ? "bg-prof-emerald text-black" : "bg-bet-blue text-white"
              )}>
                <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              </div>
            </motion.button>
          </Tooltip>
        )}
      </AnimatePresence>

      <div className={cn(
      "w-full relative glass-panel rounded-[20px] overflow-hidden flex flex-col items-center p-8 min-h-[400px] md:min-h-[480px] border border-white/10 group transition-all duration-1000",
      isProfessionalMode 
        ? "bg-prof-graphite/40 border-white/5 backdrop-blur-2xl"
        : (selectedGame === 'BACCARAT' ? "bg-baccarat-blue" :
           selectedGame === 'BACBO' ? "bg-bacbo-bg" :
           "bg-football-bg"),
      targetColor === 'BLUE' ? "shadow-[0_0_50px_rgba(0,136,255,0.2)]" : 
      targetColor === 'RED' ? "shadow-[0_0_50px_rgba(255,0,0,0.2)]" : 
      "shadow-[0_0_50px_rgba(255,215,0,0.2)]"
    )}>
      {/* Decorative Game Pattern Background */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 gap-12 p-8">
          {[...Array(24)].map((_, i) => {
            let Icon = Spade;
            if (selectedGame === 'BACCARAT') {
              const icons = [Spade, Heart, Club, Diamond];
              Icon = icons[i % icons.length];
            } else if (selectedGame === 'BACBO') {
              Icon = Dices;
            } else {
              Icon = Trophy;
            }
            
            return (
              <motion.div
                key={`decorative-pattern-icon-${i}`}
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  y: [0, 10, 0]
                }}
                transition={{ 
                  duration: 5 + Math.random() * 5, 
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
                className="flex items-center justify-center"
              >
                <Icon size={64} className="text-white" />
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 pt-8">
        <AnimatePresence mode="wait">
          {(gameState === 'IDLE' || gameState === 'WAITING' && progress === 0) && (
            <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-2 flex items-center gap-2 px-3 py-1 rounded-full bg-bet-blue/10 border border-bet-blue/20"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-bet-blue animate-pulse" />
                <span className="text-[9px] font-black text-bet-blue uppercase tracking-widest">Bot Ativo • Sincronizado</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-32 h-32 bg-gradient-to-br from-bet-blue to-[#004488] rounded-full flex items-center justify-center mb-4 cursor-pointer shadow-[0_0_50px_rgba(0,136,255,0.4)] border-4 border-white/20 relative group/btn" 
                onClick={onStart}
              >
                <div className="absolute inset-0 rounded-full animate-ping bg-bet-blue/30 opacity-0 group-hover/btn:opacity-100" />
                <Play className="text-white fill-current ml-2 transition-transform group-hover/btn:scale-110" size={56} />
                
                {/* Micro-glow ornaments */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-bet-blue/20 rounded-full blur-md animate-pulse" />
                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-bet-blue/20 rounded-full blur-md animate-pulse delay-700" />
              </motion.div>
              
              <h2 className="text-5xl md:text-6xl font-display font-black uppercase italic mb-6 tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all">
                TERMINAL <span className="text-bet-blue">PRONTO</span>
              </h2>
              
              <div className="px-10 py-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm relative overflow-hidden group/inject">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/inject:translate-x-full transition-transform duration-1000" />
                <span className="text-white/40 text-[11px] uppercase font-black tracking-[0.6em] animate-pulse relative z-10 transition-colors group-hover/inject:text-white/60">Injete para Continuar</span>
              </div>
            </motion.div>
          )}

          {gameState === 'ANALYZING' && (
            <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center w-full relative">
               {isProfessionalMode && (
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none mix-blend-overlay" />
               )}
               
               <div className="w-full max-w-lg aspect-[1.8/1] bg-black/60 rounded-[32px] overflow-hidden mb-4 border-2 border-bet-blue/30 relative shadow-[0_0_60px_rgba(0,209,255,0.1)]">
                  <div className="absolute inset-0 bg-gradient-to-b from-bet-blue/10 to-transparent pointer-events-none" />
                  
                  {isProfessionalMode && (
                    <div className="absolute inset-0 animate-matrix opacity-20 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(80,200,120,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(80,200,120,0.1) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  )}

                  <Canvas camera={{ position: [0, 0, 4] }}>
                    <CyberCore />
                  </Canvas>
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={cn(
                      "absolute inset-x-0 bottom-0 py-4 bg-black/80 text-center font-black text-[14px] tracking-[0.8em] border-t flex items-center justify-center gap-3",
                      isProfessionalMode ? "text-prof-emerald border-prof-emerald/20" : "text-bet-blue border-bet-blue/20"
                    )}
                  >
                    <Cpu size={16} className="animate-spin-slow" /> {isProfessionalMode ? "AI DEEP ANALYSIS..." : "SCANNING FOR SIGNALS..."}
                  </motion.div>
               </div>
               <div className="w-full max-w-sm flex flex-col items-center gap-4">
                  <div className={cn(
                    "w-full h-2 rounded-full overflow-hidden border",
                    isProfessionalMode ? "bg-prof-black border-prof-emerald/30 shadow-[inset_0_0_10px_rgba(80,200,120,0.1)]" : "bg-white/5 border-white/10 shadow-inner"
                  )}>
                    <motion.div 
                      className={cn(
                        "h-full",
                        isProfessionalMode ? "bg-prof-emerald shadow-[0_0_15px_rgba(80,200,120,0.8)]" : "bg-gradient-to-r from-bet-blue to-white shadow-[0_0_15px_rgba(0,209,255,0.8)]"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className={cn(
                    "font-black uppercase text-[12px] tracking-[0.4em] italic drop-shadow-glow",
                    isProfessionalMode ? "text-prof-emerald font-mono" : "text-bet-blue"
                  )}>
                    PROCESSO EM {progress}%
                  </span>
               </div>
            </motion.div>
          )}

          {gameState === 'SIGNAL_FOUND' && (
            <motion.div key="signal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center w-full">
               <div className="relative mb-12">
                 <div className="absolute -inset-16 pointer-events-none opacity-20">
                    <motion.div animate={{ rotate: -15, x: -20 }} className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-44 border-2 border-white/20 rounded-2xl bg-white/5 backdrop-blur-sm" />
                    <motion.div animate={{ rotate: 15, x: 20 }} className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-44 border-2 border-white/20 rounded-2xl bg-white/5 backdrop-blur-sm" />
                 </div>

                  <Tooltip content={targetColor === 'TIE' ? "Probabilidade de empate detectada" : `Entrada confirmada para ${targetColor === 'BLUE' ? 'PLAYER' : 'BANKER'}`}>
                    <motion.div 
                      animate={{ 
                        y: [0, -10, 0],
                        boxShadow: targetColor === 'BLUE' 
                          ? (selectedGame === 'BACCARAT' ? ["0 0 40px rgba(65,105,225,0.4)", "0 0 80px rgba(65,105,225,0.6)", "0 0 40px rgba(65,105,225,0.4)"] : ["0 0 40px rgba(0,136,255,0.4)", "0 0 80px rgba(0,136,255,0.6)", "0 0 40px rgba(0,136,255,0.4)"])
                          : (selectedGame === 'BACCARAT' ? ["0 0 40px rgba(150,0,24,0.4)", "0 0 80px rgba(150,0,24,0.6)", "0 0 40px rgba(150,0,24,0.4)"] : ["0 0 40px rgba(255,0,0,0.4)", "0 0 80px rgba(255,0,0,0.6)", "0 0 40px rgba(255,0,0,0.4)"])
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className={cn(
                        "w-[280px] md:w-[360px] aspect-square rounded-[60px] flex flex-col items-center justify-center relative shadow-[0_0_60px_rgba(0,0,0,0.8)] border-[6px] border-white/20 overflow-hidden animate-signal-pulse animate-border-pulse cursor-help",
                        isProfessionalMode && "border-white/5",
                        selectedGame === 'BACCARAT' 
                          ? (targetColor === 'BLUE' ? "bg-gradient-to-br from-[#4169E1] to-[#001a33]" : "bg-gradient-to-br from-[#960018] to-[#3d000a]")
                          : (targetColor === 'BLUE' ? "bg-gradient-to-br from-[#0088FF] to-[#011a68]" : "bg-gradient-to-br from-[#FF0000] to-[#600000]")
                      )}
                      style={{
                        "--pulse-color": targetColor === 'BLUE' ? (isProfessionalMode ? '#50C878' : '#0088FF') : targetColor === 'RED' ? '#FF0000' : (isProfessionalMode ? '#D4AF37' : '#FFD700')
                      } as any}
                    >
                       <div className="absolute inset-0 bg-white/5 animate-pulse mix-blend-overlay" />
                       <div className={cn(
                         "absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2)_0%,transparent_70%)]",
                         isProfessionalMode && (targetColor === 'BLUE' ? "shadow-[inset_0_0_50px_rgba(80,200,120,0.4)]" : targetColor === 'RED' ? "shadow-[inset_0_0_50px_rgba(255,0,0,0.4)]" : "shadow-[inset_0_0_50px_rgba(212,175,55,0.4)]")
                       )} />
                       
                       {/* Game Specific Watermark */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-black text-white/[0.03] pointer-events-none select-none uppercase -rotate-12 italic tracking-tighter">
                         {selectedGame === 'BACCARAT' ? 'BACCARAT' : selectedGame === 'BACBO' ? 'BACBO' : 'FOOTBALL'}
                       </div>
  
                      <motion.h3 
                         animate={{ 
                           scale: [0.98, 1.02, 0.98],
                           x: selectedGame === 'BACCARAT' && gameState === 'SIGNAL_FOUND' ? [0, 5, -5, 0] : 0
                         }}
                         transition={{ duration: 1.5, repeat: Infinity }}
                         className={cn(
                           "text-6xl md:text-7xl font-black text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] italic uppercase tracking-tighter relative z-10 text-center px-4",
                           isProfessionalMode ? "font-mono" : "font-display"
                         )}
                       >
                         {targetColor === 'BLUE' ? (selectedGame === 'BACCARAT' ? 'PLAYER' : selectedGame === 'FOOTBALL_STUDIO' ? 'HOME' : 'PLAYER') : 
                          targetColor === 'RED' ? (selectedGame === 'BACCARAT' ? 'BANKER' : selectedGame === 'FOOTBALL_STUDIO' ? 'AWAY' : 'BANKER') : 'EMPATE'}
                       </motion.h3>
                       
                       <div className="flex gap-10 mt-10 text-white/40 relative z-10">
                         <motion.div 
                           initial={selectedGame === 'BACCARAT' ? { x: -50, opacity: 0 } : {}}
                           animate={selectedGame === 'BACCARAT' ? { x: 0, opacity: 1 } : { rotate: [0, 10, 0] }} 
                           transition={{ duration: 2, repeat: Infinity }}
                         >
                           {selectedGame === 'BACBO' ? <Dices size={44} /> : <Spade size={44} fill="currentColor" strokeWidth={0} />} 
                         </motion.div>
                         <motion.div 
                           initial={selectedGame === 'BACCARAT' ? { x: 50, opacity: 0 } : {}}
                           animate={selectedGame === 'BACCARAT' ? { x: 0, opacity: 1 } : { rotate: [0, -10, 0] }} 
                           transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                         >
                           {selectedGame === 'BACBO' ? <Dices size={44} /> : <Heart size={44} fill="currentColor" strokeWidth={0} />}
                         </motion.div>
                       </div>
                    </motion.div>
                  </Tooltip>
               </div>
               
               <div className="w-full max-w-md grid grid-cols-2 gap-6 mt-4">
                 <Tooltip content="Valor da carta alvo detectado pelo scanner de IA para esta rodada">
                   <div className={cn(
                     "p-10 rounded-[20px] flex flex-col items-center justify-center gap-2 border transition-all shadow-2xl relative overflow-hidden group/box hover:scale-[1.05] cursor-help",
                     isProfessionalMode 
                      ? "bg-prof-black border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" 
                      : "bg-gradient-to-br from-white/[0.05] to-transparent border-white/5 hover:border-white/10"
                   )}>
                      <div className="absolute top-2 right-4 opacity-5 group-hover/box:opacity-10 transition-opacity">
                         <Spade size={40} />
                      </div>
                      <span className={cn(
                        "text-[10px] text-white/30 uppercase font-black tracking-[0.4em] mb-1",
                        isProfessionalMode && "font-mono"
                      )}>Carta Alvo</span>
                      <span className={cn(
                        "text-6xl font-black text-white italic transition-transform group-hover/box:rotate-3",
                        isProfessionalMode ? "font-mono" : "font-display drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                      )}>{targetCard}</span>
                      <div className={cn(
                        "absolute bottom-0 left-0 right-0 h-1 transition-all",
                        isProfessionalMode ? "bg-prof-emerald/20 group-hover:bg-prof-emerald/40" : "bg-white/5 group-hover:bg-white/20"
                      )} />
                   </div>
                 </Tooltip>
                 <Tooltip content="O minuto exato da rodada em que o sinal foi validado pela rede neural">
                   <div className={cn(
                     "p-10 rounded-[20px] flex flex-col items-center justify-center gap-2 border transition-all shadow-2xl relative overflow-hidden group/box hover:scale-[1.05] cursor-help",
                     isProfessionalMode 
                      ? "bg-prof-black border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" 
                      : "bg-gradient-to-br from-white/[0.05] to-transparent border-white/5 hover:border-white/10"
                   )}>
                      <div className="absolute top-2 right-4 opacity-5 group-hover/box:opacity-10 transition-opacity">
                         <Clock size={40} />
                      </div>
                      <span className={cn(
                        "text-[10px] text-white/30 uppercase font-black tracking-[0.4em] mb-1",
                        isProfessionalMode && "font-mono"
                      )}>Minuto</span>
                      <span className={cn(
                        "text-6xl font-black text-white italic transition-transform group-hover/box:-rotate-3 text-center",
                        isProfessionalMode ? "font-mono" : "font-display drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                      )}>{String(lastSignalMinute).padStart(2, '0')}</span>
                      <div className={cn(
                        "absolute bottom-0 left-0 right-0 h-1 transition-all",
                        isProfessionalMode ? "bg-prof-emerald/20 group-hover:bg-prof-emerald/40" : "bg-white/5 group-hover:bg-white/20"
                      )} />
                   </div>
                 </Tooltip>
               </div>

               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-12 w-full flex flex-col items-center gap-10"
               >
                 <div className="px-10 py-3 bg-bet-tie/5 border-2 border-bet-tie/20 rounded-full shadow-[0_0_30px_rgba(255,215,0,0.1)] relative group/warn overflow-hidden hover:bg-bet-tie/10 transition-colors cursor-default">
                    <div className="absolute inset-0 bg-bet-tie/[0.02] transform -skew-x-12" />
                    <span className="text-[14px] font-black text-bet-tie uppercase tracking-[0.5em] italic relative z-10 drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]">
                      {strategy === 'AGGRESSIVE' ? 'PRÓXIMO ALVO: GALE 1 HABILITADO' : 'SINAL DE ALTA FIDELIDADE: SEM GALE'}
                    </span>
                 </div>

                 <div className="flex gap-20 md:gap-32 items-center">
                    <Tooltip content="Percentual de confiança da rede neural na validade deste padrão específico">
                      <div className="text-center group/stat relative cursor-help">
                         <div className="absolute -inset-8 bg-bet-tie/5 rounded-full blur-2xl opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                         <div className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 group-hover/stat:text-white/50 transition-colors">Confiança</div>
                         <div className={cn(
                           "text-6xl font-black italic transition-transform group-hover/stat:scale-110",
                           isProfessionalMode ? "font-mono text-prof-emerald" : "font-display text-bet-tie drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                         )}>{confidence}%</div>
                      </div>
                    </Tooltip>
                    <div className="w-px h-20 bg-white/10" />
                    <Tooltip content="Métrica histórica de acertos vs erros para este algoritmo específico nas últimas rodadas">
                      <div className="text-center group/stat relative cursor-help">
                         <div className="absolute -inset-8 bg-white/5 rounded-full blur-2xl opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                         <div className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 group-hover/stat:text-white/50 transition-colors">Assertividade</div>
                         <div className={cn(
                            "text-6xl font-black text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-transform group-hover/stat:scale-110",
                            isProfessionalMode ? "font-mono" : "font-display"
                          )}>{assertiveness}</div>
                      </div>
                    </Tooltip>
                 </div>
               </motion.div>
            </motion.div>
          )}

          {gameState === 'WAITING' && progress > 0 && (
            <motion.div key="waiting" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="flex flex-col items-center">
               <div className="w-20 h-20 rounded-full border-4 border-bet-tie/20 border-t-bet-tie animate-spin mb-6 shadow-[0_0_30px_rgba(0,255,133,0.2)]" />
               <h2 className="text-4xl font-black text-bet-tie uppercase italic tracking-tighter drop-shadow-[0_0_15px_rgba(0,255,133,0.4)]">Aguardando Green</h2>
               <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-4">Sincronizando Resposta da API...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
}

function StrategyButton({ active, onClick, label, icon, theme, shake, isProfessionalMode, createRipple }: any) {
  const isGale = label === "ATÉ GALE 1";
  const description = isGale ? "Agressivo" : "Conservador";
  const tooltipContent = isGale 
    ? "Estratégia agressiva: Permite cobrir perdas na rodada seguinte com uma aposta maior." 
    : "Estratégia segura: Aposta fixa apenas na sinalização principal sem proteções extras.";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    onClick();
  };
  
  return (
    <Tooltip content={tooltipContent}>
      <button onClick={handleClick} className={cn(
        "flex-1 px-4 py-3 rounded-[20px] flex flex-col items-center justify-center gap-1 font-black transition-all relative overflow-hidden group hover:scale-[1.02] cursor-help", 
        shake && "animate-shake",
        isProfessionalMode 
          ? (active 
              ? "bg-prof-emerald shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] text-prof-black" 
              : "bg-prof-black border border-prof-emerald/20 text-prof-emerald/60 hover:text-prof-emerald shadow-[inset_0_0_15px_rgba(80,200,120,0.05)]")
          : (active 
              ? (isGale ? "bg-bet-red shadow-[0_0_30px_rgba(255,0,0,0.4)] hover:bg-[#CC0000]" : "bg-bet-blue shadow-[0_0_30px_rgba(0,136,255,0.4)] hover:bg-[#0066CC]")
              : "bg-white/5 text-white/30 hover:bg-white/10 border border-white/5"),
        active && theme?.btnClass
      )}>
        {active && <motion.div layoutId="strat-active" className="absolute inset-0 bg-white/10" />}
        <div className={cn("relative z-10 flex items-center gap-2 text-[12px] uppercase tracking-widest", isProfessionalMode && "font-mono")}>
          {icon} {label}
        </div>
        <span className={cn(
          "relative z-10 text-[9px] uppercase tracking-[0.2em] font-bold opacity-60",
          isProfessionalMode ? "font-mono" : "italic"
        )}>
          {description}
        </span>
      </button>
    </Tooltip>
  );
}

function SignalLogs({ selectedGame, currentTheme, isProfessionalMode }: any) {
  const historicalAlerts = [
    { time: '13:54', type: 'TIE', label: 'EMPATE', val1: 4, val2: 4, confirmed: true },
    { time: '13:52', type: 'RED', label: 'CASA', val1: 2, val2: 1, confirmed: true },
    { time: '13:48', type: 'BLUE', label: 'FORA', val1: 3, val2: 5, confirmed: true },
    { time: '13:45', type: 'TIE', label: 'EMPATE', val1: 6, val2: 6, confirmed: true },
    { time: '13:43', type: 'RED', label: 'CASA', val1: 1, val2: 0, confirmed: true },
    { time: '13:40', type: 'BLUE', label: 'FORA', val1: 2, val2: 2, confirmed: true },
    { time: '13:36', type: 'TIE', label: 'EMPATE', val1: 3, val2: 3, confirmed: true },
    { time: '13:21', type: 'TIE', label: 'EMPATE', val1: 4, val2: 4, confirmed: true },
  ];

  const renderHistoryItem = (alert: any, i: number) => {
    if (selectedGame === 'BACCARAT') {
      return (
        <div className={cn(
          "w-full aspect-square rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all hover:scale-110",
          alert.type === 'RED' ? "bg-baccarat-banker border-white/20 text-white" :
          alert.type === 'BLUE' ? "bg-baccarat-player border-white/20 text-white" :
          "bg-green-500 border-white/20 text-white",
          isProfessionalMode && (alert.type === 'TIE' ? "bg-prof-emerald shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]" : "shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]")
        )}>
          {alert.type === 'RED' ? 'B' : alert.type === 'BLUE' ? 'P' : 'T'}
        </div>
      );
    }

    if (selectedGame === 'BACBO') {
      return (
        <div className={cn(
          "w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all hover:scale-105",
          isProfessionalMode 
            ? "bg-prof-black border-prof-emerald/20 shadow-[inset_0_0_15px_rgba(80,200,120,0.05)]"
            : (alert.type === 'RED' ? "bg-red-500/20 border-red-500/30" :
               alert.type === 'BLUE' ? "bg-blue-500/20 border-blue-500/30" :
               "bg-orange-500/20 border-orange-500/30 shadow-[inset_0_0_15px_rgba(249,115,22,0.1)]")
        )}>
          <Dices size={10} className={cn(alert.type === 'TIE' ? (isProfessionalMode ? "text-prof-gold" : "text-orange-500") : "text-white/40")} />
          <span className={cn("text-[9px] font-bold text-white", isProfessionalMode && "font-mono")}>{alert.val1 + alert.val2}</span>
        </div>
      );
    }

    return (
      <div className={cn(
        "w-full py-2 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all hover:scale-105",
        isProfessionalMode 
          ? "bg-prof-black border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]"
          : (alert.type === 'RED' ? "bg-red-950/20 border-red-500/20" :
             alert.type === 'BLUE' ? "bg-blue-950/20 border-blue-500/20" :
             "bg-yellow-950/20 border-yellow-500/20")
      )}>
        <span className="text-[7px] font-bold text-white/40">{alert.time}</span>
        <div className="flex items-center gap-1">
          <span className={cn("text-[10px] font-black text-white", isProfessionalMode && "font-mono")}>{alert.val1}x{alert.val2}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "w-full glass-panel rounded-[20px] p-8 relative overflow-hidden group transition-all",
      isProfessionalMode 
        ? "bg-prof-graphite border-white/5 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]"
        : (selectedGame === 'BACCARAT' ? "bg-black/60 shadow-[0_0_40px_rgba(0,136,255,0.1)] border-white/5" : 
           selectedGame === 'BACBO' ? "bg-black/60 shadow-[0_0_40px_rgba(255,0,0,0.1)] border-white/5" : 
           "bg-black/60 shadow-[0_0_40px_rgba(255,215,0,0.1)] border-white/5")
    )}>
      <div className="absolute top-0 right-0 p-8 opacity-10">
        {selectedGame === 'BACCARAT' ? <Spade size={80} /> : selectedGame === 'BACBO' ? <Dices size={80} /> : <Trophy size={80} />}
      </div>
      
      <div className="flex flex-col gap-8 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-black text-white uppercase tracking-[0.3em] italic">
              {selectedGame === 'BACCARAT' ? 'BEAD PLATE HISTORY' : selectedGame === 'BACBO' ? 'DICE ANALYZER' : 'MATCH TIMELINE'}
            </h3>
            <div className="text-[10px] text-white/40 mt-1 font-bold uppercase tracking-widest">Base de Dados Histórica • Sinais Confirmados</div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", currentTheme?.accent.replace('text-', 'bg-') || "bg-bet-tie")} />
                <span className="text-[10px] font-bold text-white/60">SISTEMA v4.0 ACTIVE</span>
             </div>
          </div>
        </div>

        <div className={cn(
          "grid gap-3",
          selectedGame === 'BACCARAT' ? "grid-cols-6 md:grid-cols-10 lg:grid-cols-12" : 
          selectedGame === 'BACBO' ? "grid-cols-4 md:grid-cols-6 lg:grid-cols-8" : 
          "grid-cols-1"
        )}>
          {historicalAlerts.map((alert, i) => (
            <motion.div 
              key={`history-alert-${alert.time}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              {renderHistoryItem(alert, i)}
            </motion.div>
          ))}
          
          {/* Active Placeholder */}
          <div className="flex flex-col items-center gap-2 opacity-30 animate-pulse">
             <div className="w-full aspect-square rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center">
                <Target size={12} className="text-white/40" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyBoard({ selectedGame, isProfessionalMode }: any) {
  const [probableTimes, setProbableTimes] = React.useState<any[]>([]);

  React.useEffect(() => {
    const generateTimes = () => {
      const times = [];
      const now = new Date();
      const labels = ['EMPATE', 'RED', 'EMPATE', 'BLUE', 'EMPATE'];
      const colors = ['GOLD', 'RED', 'GOLD', 'BLUE', 'GOLD'];
      
      for (let i = 0; i < 5; i++) {
        const offset = (i * 5 + Math.floor(Math.random() * 5) + 3);
        const future = new Date(now.getTime() + offset * 60000);
        const hours = future.getHours().toString().padStart(2, '0');
        const minutes = future.getMinutes().toString().padStart(2, '0');
        const confidenceValue = Math.floor(Math.random() * 12) + 85;
        
        times.push({
          time: `${hours}:${minutes}`,
          label: labels[i % labels.length],
          color: colors[i % colors.length],
          confidence: `${confidenceValue}%`
        });
      }
      setProbableTimes(times);
    };

    generateTimes();
    const interval = setInterval(generateTimes, 300000); // 5 minutes refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[14px] font-black text-white/40 uppercase tracking-[0.3em] italic">PRÓXIMOS HORÁRIOS</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bet-tie/10 border border-bet-tie/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
           <Timer size={14} className="text-bet-tie" />
           <span className="text-[10px] font-black text-bet-tie uppercase">PREVISÃO</span>
        </div>
      </div>

      <div className={cn(
        "w-full glass-panel rounded-[32px] p-6 md:p-8 border border-white/5 relative overflow-hidden",
        isProfessionalMode ? "bg-prof-graphite shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]" : "bg-black/40 shadow-2xl"
      )}>
        <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
          <Timer size={120} className="text-white" />
        </div>

              <div className="flex flex-col gap-2 relative z-10">
                {probableTimes.map((pt, i) => (
                  <Tooltip key={`prob-time-tooltip-${i}`} content={`Probabilidade de ${pt.label} detectada para às ${pt.time}`}>
                    <motion.div 
                      key={`prob-time-row-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.03)" }}
                      className="flex items-center justify-between p-4 md:p-5 rounded-[24px] bg-white/[0.02] border border-white/5 transition-all group cursor-help"
                    >
                      <div className="flex items-center gap-4 md:gap-8">
                        <span className="text-xl md:text-2xl font-mono font-black text-white/90 group-hover:text-white">
                          {pt.time}
                        </span>
                        
                        <div className={cn(
                          "px-3 md:px-5 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] shadow-lg",
                          pt.color === 'BLUE' ? "bg-bet-blue/20 text-bet-blue border border-bet-blue/40 shadow-[0_0_20px_rgba(0,136,255,0.2)]" :
                          pt.color === 'RED' ? "bg-bet-red/20 text-bet-red border border-bet-red/40 shadow-[0_0_20px_rgba(255,0,0,0.2)]" :
                          "bg-bet-tie/20 text-bet-tie border border-bet-tie/40 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                        )}>
                          {pt.label}
                        </div>
                      </div>
        
                      <div className="flex items-center gap-4 md:gap-8">
                        <div className="w-16 md:w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: pt.confidence }}
                            transition={{ duration: 2, delay: i * 0.15 }}
                            className={cn(
                              "h-full rounded-full shadow-[0_0_10px_currentColor]",
                              pt.color === 'BLUE' ? "bg-bet-blue text-bet-blue" :
                              pt.color === 'RED' ? "bg-bet-red text-bet-red" :
                              "bg-bet-tie text-bet-tie"
                            )}
                          />
                        </div>
                        
                        <div className="flex flex-col items-end min-w-[40px]">
                           <span className={cn(
                             "text-lg md:text-xl font-display font-black italic",
                             pt.color === 'BLUE' ? "text-bet-blue/70" :
                             pt.color === 'RED' ? "text-bet-red/70" :
                             "text-bet-tie/70"
                           )}>
                             {pt.confidence}
                           </span>
                        </div>
                      </div>
                    </motion.div>
                  </Tooltip>
                ))}
              </div>
      </div>
    </div>
  );
}

function AuthScreen({ isLoginView, setIsLoginView, password, setPassword, authError, handleAuth }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-4 relative bg-black overflow-hidden"
    >
      {/* Dynamic Hacker Background */}
      <div className="absolute inset-0 z-[1]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,136,255,0.1)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-20">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <BackgroundParticles intensity={1} />
          </Canvas>
        </div>
        
        {/* Lightning Strikes */}
        <LightningStrike />
        
        {/* Matrix Rain Column Simulation */}
        <div className="absolute inset-0 flex justify-around opacity-10 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`matrix-${i}`}
              animate={{ y: ["-100%", "100%"] }}
              transition={{ 
                duration: 2 + Math.random() * 3, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 2
              }}
              className="w-px h-64 bg-gradient-to-b from-transparent via-bet-blue to-transparent"
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="glass-panel rounded-[40px] p-10 relative flex flex-col items-center border-t border-white/20 shadow-[0_0_100px_rgba(0,136,255,0.2)]"
        >
          {/* Scanning Line */}
          <motion.div 
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-bet-blue/40 z-20 pointer-events-none shadow-[0_0_15px_#0088FF]"
          />

          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-24 h-24 bg-bet-blue rounded-[30px] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(0,136,255,0.5)] border-2 border-white/20 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <Target className="text-white relative z-10 group-hover:scale-110 transition-transform" size={48} />
            <motion.div 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-white/20"
            />
          </motion.div>

          <div className="text-center mb-10">
            <motion.h1 
              animate={{ textShadow: ["0 0 10px #0088FF", "0 0 30px #0088FF", "0 0 10px #0088FF"] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl font-display font-black italic tracking-tighter"
            >
              SPEED CARDS <span className="text-bet-blue">HACKER</span>
            </motion.h1>
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-[0.4em] mt-2 italic">Neural Network Core v4.0</p>
          </div>
          
          <form onSubmit={handleAuth} className="w-full space-y-6">
            <div className="relative group">
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="TOKEN DE ACESSO" 
                className="w-full bg-black/60 border-2 border-white/10 p-6 rounded-2xl text-center font-display font-black tracking-[0.3em] outline-none focus:border-bet-blue focus:shadow-[0_0_30px_rgba(0,136,255,0.2)] transition-all placeholder:text-white/10" 
              />
              <div className="absolute inset-0 rounded-2xl border border-bet-blue/0 group-focus-within:border-bet-blue/50 pointer-events-none transition-all" />
            </div>

            {authError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-bet-red text-center text-[11px] font-black uppercase bg-bet-red/10 py-3 rounded-xl border border-bet-red/20 flex items-center justify-center gap-2"
              >
                <Zap size={14} className="animate-pulse" />
                {authError}
              </motion.div>
            )}

            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0,136,255,0.6)" }}
              whileTap={{ scale: 0.98 }}
              onClick={(e: any) => {
                const button = e.currentTarget;
                const circle = document.createElement("span");
                const diameter = Math.max(button.clientWidth, button.clientHeight);
                const radius = diameter / 2;
                const rect = button.getBoundingClientRect();

                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${e.clientX - rect.left - radius}px`;
                circle.style.top = `${e.clientY - rect.top - radius}px`;
                circle.classList.add("ripple");

                const ripple = button.getElementsByClassName("ripple")[0];
                if (ripple) ripple.remove();

                button.appendChild(circle);
              }}
              className="w-full bg-bet-blue py-6 rounded-2xl font-display font-black uppercase italic tracking-[0.2em] text-xl text-white shadow-2xl relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                ENTRAR NO TERMINAL <Cpu size={24} />
              </span>
            </motion.button>
          </form>
          
          <motion.a 
            href="https://t.me/SpeeddadosfreeE" 
            target="_blank" 
            rel="noreferrer" 
            whileHover={{ x: 5, color: "#00D1FF" }}
            className="mt-10 text-[11px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            Obter Acesso Vitalício <LogOut size={12} className="rotate-180" />
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
}

function GameSelection({ onSelect }: { onSelect: (game: GameType) => void }) {
  const games = [
    { 
      id: 'BACCARAT' as GameType, 
      name: 'SPEED BACCARAT BRASILEIRO', 
      icon: <Spade className="text-white" size={48} />,
      desc: 'Neural Predictor v4.0',
      color: 'bg-gradient-to-br from-bet-blue to-blue-900',
      glow: 'shadow-[0_0_40px_rgba(0,136,255,0.3)]'
    },
    { 
      id: 'BACBO' as GameType, 
      name: 'BAC BO', 
      icon: <Cpu className="text-white" size={48} />,
      desc: 'Neural Predictor v4.0',
      color: 'bg-gradient-to-br from-bet-red to-red-900',
      glow: 'shadow-[0_0_40px_rgba(255,0,0,0.3)]'
    },
    { 
      id: 'FOOTBALL_STUDIO' as GameType, 
      name: 'FOOTBALL STUDIO', 
      icon: <Trophy className="text-white" size={48} />,
      desc: 'Neural Predictor v4.0',
      color: 'bg-gradient-to-br from-bet-tie to-amber-900',
      glow: 'shadow-[0_0_40px_rgba(255,215,0,0.3)]'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
      transition={{ duration: 0.6, ease: "circOut" }}
      className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-black overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,136,255,0.1)_0%,transparent_50%)]" />
      
      <div className="w-full max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-4xl md:text-6xl font-display font-black italic tracking-tighter mb-4"
          >
            SELECIONE O <span className="text-bet-blue">TERMINAL</span>
          </motion.h1>
          <div className="h-1 w-32 bg-bet-blue mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 50, rotateX: 20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ 
                delay: i * 0.15,
                duration: 0.8,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.05,
                y: -15,
                rotateY: 2,
                transition: { type: "spring", stiffness: 300, damping: 15 }
              }}
              onClick={() => onSelect(game.id)}
              className={cn(
                "glass-panel rounded-[20px] p-10 flex flex-col items-center text-center cursor-pointer border border-white/5 hover:border-white/20 transition-all group relative overflow-hidden shadow-2xl animate-float",
                game.glow,
                game.id === 'BACCARAT' && "hover:shadow-[inset_0_0_30px_rgba(0,136,255,0.2)]",
                game.id === 'BACBO' && "hover:shadow-[inset_0_0_30px_rgba(255,0,0,0.2)]",
                game.id === 'FOOTBALL_STUDIO' && "hover:shadow-[inset_0_0_30px_rgba(255,215,0,0.2)]"
              )}
              style={{ animationDelay: `${i * 0.5}s` }}
            >
              <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-white")} />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.02] to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className={cn(
                "w-24 h-24 rounded-2xl flex items-center justify-center mb-10 relative z-10 transition-transform group-hover:scale-110",
                game.color,
                game.id === 'BACCARAT' && "shadow-[0_10px_30px_rgba(0,136,255,0.5)]",
                game.id === 'BACBO' && "shadow-[0_10px_30px_rgba(255,0,0,0.5)]",
                game.id === 'FOOTBALL_STUDIO' && "shadow-[0_10px_30px_rgba(255,215,0,0.5)]"
              )}>
                {game.icon}
                <div className="absolute inset-0 rounded-3xl animate-pulse bg-white/10" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-2 border border-white/5 rounded-full"
                />
              </div>

              <h2 className="text-3xl font-display font-black italic tracking-tighter text-white mb-2 relative z-10">
                {game.name}
              </h2>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8 relative z-10 italic">
                {game.desc}
              </p>

              <div className="w-full h-px bg-white/5 mb-8 relative z-10" />

              <motion.div 
                whileHover={{ scale: 1.05 }}
                onClick={(e: any) => {
                  const button = e.currentTarget;
                  const circle = document.createElement("span");
                  const diameter = Math.max(button.clientWidth, button.clientHeight);
                  const radius = diameter / 2;
                  const rect = button.getBoundingClientRect();

                  circle.style.width = circle.style.height = `${diameter}px`;
                  circle.style.left = `${e.clientX - rect.left - radius}px`;
                  circle.style.top = `${e.clientY - rect.top - radius}px`;
                  circle.classList.add("ripple");

                  const ripple = button.getElementsByClassName("ripple")[0];
                  if (ripple) ripple.remove();

                  button.appendChild(circle);
                  onSelect(game.id);
                }}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-bet-blue group-hover:text-white transition-all text-[11px] font-black uppercase tracking-widest relative z-10 shine-effect cursor-pointer overflow-hidden"
              >
                Ativar Terminal
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
           <motion.div 
             animate={{ opacity: [0.3, 0.6, 0.3] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="flex items-center justify-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.5em]"
           >
             <Activity size={12} /> Sincronizando com Evolution Gaming Live
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function LightningStrike() {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const trigger = () => {
      if (Math.random() > 0.7) {
        setVisible(true);
        setTimeout(() => setVisible(false), 50 + Math.random() * 100);
      }
      setTimeout(trigger, 2000 + Math.random() * 5000);
    };
    const timeout = setTimeout(trigger, 3000);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0.3, 1, 0] }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-0 bg-bet-blue/10 pointer-events-none"
    >
      <div className="absolute top-0 left-1/4 w-1 h-full bg-bet-blue shadow-[0_0_50px_#0088FF] blur-sm transform -skew-x-12" />
      <div className="absolute top-0 right-1/3 w-1 h-full bg-bet-blue shadow-[0_0_50px_#0088FF] blur-sm transform skew-x-12" />
    </motion.div>
  );
}
