import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X, RefreshCw, Activity, Terminal, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RestrictedAccessPanelProps {
  onUnlock: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function RestrictedAccessPanel({ onUnlock, isOpen, onClose }: RestrictedAccessPanelProps) {
  const [masterKey, setMasterKey] = useState('1^JLAjw307BJ');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const generateKey = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '1^';
      for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setMasterKey(result);
      setIsGenerating(false);
      addLog(`[SYSTEM]: New master key generated: ${result}`);
    }, 800);
  };

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    setLogs(prev => [...prev, `[${time}] ${message}`]);
  };

  const startSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncSuccess(false);
    setLogs([]);
    
    const sequence = [
      "INITIATING HARD RESET PROTOCOL...",
      "Hashing new cryptographic master key...",
      "Invalidating previous session clusters...",
      "Forced log-off command sent to all active nodes.",
      "Previous key invalidated. New encrypted token deployed to all nodes.",
      "SYNCHRONIZATION COMPLETE. NODE ACCESS RESTORED."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        addLog(sequence[i].startsWith('[') ? sequence[i] : (i === 0 ? sequence[i] : `[SYSTEM]: ${sequence[i]}`));
        i++;
      } else {
        clearInterval(interval);
        setIsSyncing(false);
        setSyncSuccess(true);
        setTimeout(() => {
          onUnlock();
        }, 1500);
      }
    }, 600);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl bg-[#050505] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)]"
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Shield className="text-blue-500" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-2">
                PAINEL DE <span className="text-blue-500">ACESSO RESTRITO</span>
              </h2>
              <p className="text-[10px] font-mono font-bold text-white/40 tracking-[0.2em] uppercase">
                SPEED CARDS HACKER V4.0.1
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Section: Key Generator */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
              <Activity size={12} className="text-blue-500" />
              <span>_ GERADOR DE CHAVES</span>
            </div>
            
            <div className="p-6 rounded-2xl bg-black border border-white/5 flex flex-col gap-6">
              <div className="py-4 px-6 rounded-xl bg-white/[0.02] border border-white/5 text-center relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                <span className="text-3xl font-mono font-black text-white tracking-[0.2em]">
                  {isGenerating ? '********' : masterKey}
                </span>
              </div>
              
              <button 
                onClick={generateKey}
                disabled={isGenerating}
                className="w-full h-14 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center gap-3 text-xs font-black text-white uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
              >
                <RefreshCw className={cn("text-white/40", isGenerating && "animate-spin")} size={16} />
                Gerar Nova Chave Mestra
              </button>
            </div>
          </div>

          {/* Section: Global Distribution */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
              <Terminal size={12} className="text-blue-400" />
              <span>_ DISTRIBUIÇÃO GLOBAL</span>
            </div>

            <div className="p-6 rounded-2xl bg-black border border-white/5 flex flex-col gap-4">
              <div className="flex items-start gap-4 p-4 rounded-xl">
                 <div className="flex flex-col gap-1 text-center w-full">
                    <p className="text-[10px] font-black text-red-500/80 uppercase tracking-widest leading-relaxed">
                       ATENÇÃO: A SINCRONIZAÇÃO BLOQUEARÁ PERMANENTEMENTE A SENHA ANTERIOR.
                    </p>
                 </div>
              </div>

              {syncSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20"
                >
                  <CheckCircle2 size={16} className="text-green-500" />
                  <div>
                    <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest">UPDATE SUCCESS</h4>
                    <p className="text-[9px] font-medium text-green-500/60 font-mono">Database nodes synchronized globally.</p>
                  </div>
                </motion.div>
              )}

              <div 
                ref={scrollRef}
                className="h-32 rounded-xl bg-black/40 border border-white/5 p-4 font-mono text-[9px] text-white/40 overflow-y-auto no-scrollbar scroll-smooth"
              >
                {logs.length === 0 ? (
                  <p className="opacity-20 italic">Waiting for connection...</p>
                ) : (
                  logs.map((log, i) => (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i} 
                      className="mb-1 last:mb-0 last:text-blue-400"
                    >
                      {log}
                    </motion.p>
                  ))
                )}
              </div>

              <button 
                onClick={startSync}
                disabled={isSyncing}
                className="w-full h-16 rounded-xl bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 text-sm font-black text-white uppercase tracking-widest hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
              >
                <Activity className={cn(isSyncing && "animate-pulse")} size={20} />
                Sincronizar Nova Chave Global
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-white/5 bg-black/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Direct Link Encrypted</span>
          </div>
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Network Secure</span>
        </div>
      </motion.div>
    </div>
  );
}
