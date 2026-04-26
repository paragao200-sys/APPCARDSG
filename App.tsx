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
    signalColors: { BLUE: 'bg-baccarat-player', RED: 'bg-baccarat-banker', TIE: 'bg-green-500' }
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
    signalColors: { BLUE: 'bg-blue-500', RED: 'bg-red-500', TIE: 'bg-orange-500' }
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
    signalColors: { BLUE: 'bg-bet-blue', RED: 'bg-bet-red', TIE: 'bg-football-tie' }
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
  const [isProfessionalMode, setIsProfessionalMode] = useState(false);
  const [liveAssertiveness, setLiveAssertiveness] = useState(94.2);
  const [banca, setBanca] = useState('100');
  const [meta, setMeta] = useState('10');
  const [stopLoss, setStopLoss] = useState('20');
  const [lastSignalMinute, setLastSignalMinute] = useState<number | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const timersRef = useRef<(NodeJS.Timeout | number)[]>([]);
  const { recentResults } = useFirebaseSync();
  const { playSound, audioContext } = useAudioSynth(isMuted);

  // Oscilação de assertividade IA
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

  const runTimeline = useCallback(() => {
    setGameState('ANALYZING');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 5));
    }, 150);
    timersRef.current.push(interval);

    setTimeout(() => {
      clearInterval(interval);
      const minute = new Date().getMinutes();
      const color = Math.random() > 0.5 ? 'BLUE' : 'RED';
      setTargetColor(color);
      setTargetCard(['J', 'Q', 'K', 'A'][Math.floor(Math.random() * 4)]);
      setConfidence(parseFloat((90 + Math.random() * 8).toFixed(1)));
      setAssertiveness(`${20 + Math.floor(Math.random() * 10)}/1`);
      setLastSignalMinute(minute);
      setGameState('SIGNAL_FOUND');
      
      setTimeout(() => {
        setGameState('WAITING');
        setTimeout(() => setGameState('IDLE'), 10000);
      }, 25000);
    }, 4000);
  }, []);

  const handleBackToMenu = () => {
    setGameState('IDLE');
    setStage('GAME_SELECT');
  };

  const currentTheme = selectedGame ? gameThemes[selectedGame] : null;

  // Proteção contra crash de carregamento
  if (!recentResults && stage === 'MAIN_APP') {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-bet-blue font-black tracking-widest animate-pulse">
        CONECTANDO AO LIVE FEED...
      </div>
    );
  }

  return (
    <TooltipProvider>
      <AnimatePresence mode="wait">
        <div className="fixed inset-0 z-[-5] bg-black" />
        
        {stage === 'AUTH' && (
          <div className="min-h-screen flex items-center justify-center text-white font-black">
             {/* Simulação simplificada de tela de login para o exemplo */}
             <button onClick={() => { setUser({id: 1}); setStage('GAME_SELECT'); }} className="glass-panel px-8 py-4 border-white/10 hover:border-white/40 transition-all">
                ENTRAR NO SISTEMA
             </button>
          </div>
        )}

        {stage === 'GAME_SELECT' && (
          <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-black p-10">
             <h2 className="text-white font-display italic text-3xl tracking-widest">SELECIONE O JOGO</h2>
             <div className="flex gap-6">
                {['FOOTBALL_STUDIO', 'BACBO', 'BACCARAT'].map((g) => (
                  <button key={g} onClick={() => { setSelectedGame(g as GameType); setStage('MAIN_APP'); }} className="glass-panel p-8 border-white/10 text-white hover:bg-white/10 transition-all uppercase font-black text-xs">
                    {g.replace('_', ' ')}
                  </button>
                ))}
             </div>
          </div>
        )}

        {stage === 'MAIN_APP' && user && selectedGame && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={cn("min-h-screen flex flex-col items-center w-full py-4 relative", currentTheme?.bg)}
          >
            <header className="w-full max-w-7xl flex items-center justify-between px-6 mb-8 z-50">
               <div className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 glass-panel flex items-center justify-center rounded-xl border-white/10">
                    {selectedGame === 'FOOTBALL_STUDIO' ? <Zap /> : <Dices />}
                  </div>
                  <h1 className="font-display font-black italic text-xl uppercase">{selectedGame.replace('_', ' ')}</h1>
               </div>
               <div className="flex gap-4">
                  <IconButton icon={isMuted ? <VolumeX /> : <Volume2 />} onClick={() => setIsMuted(!isMuted)} />
                  <IconButton icon={<LogOut />} onClick={handleBackToMenu} />
               </div>
            </header>

            <div className="w-full max-w-4xl z-10 px-4">
               <LiveFeed results={recentResults} />
               <FootballStudioStats results={recentResults} gameState={gameState} />
               
               <MainDisplay 
                  gameState={gameState} progress={progress} targetColor={targetColor} 
                  confidence={confidence} assertiveness={assertiveness} lastSignalMinute={lastSignalMinute}
                  onStart={runTimeline} selectedGame={selectedGame} isProfessionalMode={isProfessionalMode}
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}

// --- SUB-COMPONENTES RESOLVIDOS ---

function MainDisplay({ gameState, progress, targetColor, confidence, assertiveness, lastSignalMinute, onStart, selectedGame, isProfessionalMode }: any) {
  return (
    <div className={cn(
      "w-full mt-6 glass-panel rounded-[32px] p-12 border border-white/10 relative overflow-hidden flex flex-col items-center min-h-[400px] justify-center",
      targetColor === 'RED' ? "shadow-[0_0_60px_rgba(255,0,0,0.15)]" : targetColor === 'BLUE' ? "shadow-[0_0_60px_rgba(0,136,255,0.15)]" : ""
    )}>
      <div className="absolute inset-0 opacity-[0.03] grid grid-cols-6 gap-8 p-8 pointer-events-none">
        {[...Array(24)].map((_, i) => (
          <Spade key={i} size={40} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'IDLE' && (
          <motion.button 
            key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={onStart}
            className="px-16 py-6 bg-white text-black font-display font-black italic text-2xl uppercase rounded-2xl hover:scale-105 transition-all"
          >
            SOLICITAR SINAL
          </motion.button>
        )}

        {gameState === 'ANALYZING' && (
          <motion.div key="loading" className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin" />
            <span className="text-white/40 font-mono text-xs tracking-[0.5em]">{progress}% ANALISANDO...</span>
          </motion.div>
        )}

        {(gameState === 'SIGNAL_FOUND' || gameState === 'WAITING') && (
          <motion.div key="result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
            <h2 className={cn(
              "text-[90px] font-display font-black italic leading-none drop-shadow-2xl",
              targetColor === 'RED' ? "text-bet-red" : "text-bet-blue"
            )}>
              {targetColor === 'RED' ? 'CASA' : 'VISITANTE'}
            </h2>
            <div className="flex gap-4 mt-6">
               <div className="bg-white/5 px-6 py-2 rounded-full border border-white/10 text-white font-black text-xs uppercase">CONF: {confidence}%</div>
               <div className="bg-white/5 px-6 py-2 rounded-full border border-white/10 text-white font-black text-xs uppercase">VAL: {lastSignalMinute}:{(lastSignalMinute || 0) + 2}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
