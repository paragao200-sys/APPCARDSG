import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Key, 
  Cpu, 
  RefreshCcw, 
  X,
  Lock,
  Unlock,
  Terminal,
  Zap,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onAuthenticate: (key: string) => void;
}

export const AdminModal = ({ isOpen, onClose, isAuthenticated, onAuthenticate }: AdminModalProps) => {
  const [authKey, setAuthKey] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const generateSecurePassword = () => {
    setIsGenerating(true);
    setLogs([]); // Reset logs on new generation
    const length = Math.floor(Math.random() * (16 - 12 + 1)) + 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01233456789!@#$%^&*()_+";
    
    let iterations = 0;
    const maxIterations = 20;
    
    const interval = setInterval(() => {
      let tempPass = "";
      for (let i = 0; i < length; i++) {
        tempPass += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      setGeneratedPassword(tempPass);
      iterations++;
      
      if (iterations >= maxIterations) {
        clearInterval(interval);
        
        // Final password with guaranteed types
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const nums = "0123456789";
        const specials = "!@#$%^&*";
        
        let finalPass = "";
        finalPass += upper[Math.floor(Math.random() * upper.length)];
        finalPass += lower[Math.floor(Math.random() * lower.length)];
        finalPass += nums[Math.floor(Math.random() * nums.length)];
        finalPass += specials[Math.floor(Math.random() * specials.length)];
        
        for (let i = 4; i < length; i++) {
          finalPass += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        // Shuffle
        finalPass = finalPass.split('').sort(() => Math.random() - 0.5).join('');
        setGeneratedPassword(finalPass);
        setIsGenerating(false);
      }
    }, 50);
  };

  const handleGlobalSync = async () => {
    if (!generatedPassword || isSyncing) return;
    
    setIsSyncing(true);
    setSyncSuccess(false);
    setSyncProgress(0);
    
    // Start progress animation
    const intervalProgress = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 90) {
          clearInterval(intervalProgress);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const response = await fetch('/api/admin/sync-global-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: generatedPassword })
      });

      if (response.ok) {
        setSyncProgress(100);
        setLogs([
          `[${new Date().toLocaleTimeString()}] INITIATING HARD RESET PROTOCOL...`,
          `[SYSTEM]: Hashing new cryptographic master key...`,
          `[SYSTEM]: Invalidating previous session clusters...`,
          `[SYSTEM]: Forced log-off command sent to all active nodes.`,
          `[SYSTEM]: Previous key invalidated. New encrypted token deployed to all nodes.`,
          `[AUDIT]: Network nodes synchronized successfully.`
        ]);
        setTimeout(() => {
          setIsSyncing(false);
          setSyncSuccess(true);
        }, 500);
      } else {
        throw new Error('Failed to sync');
      }
    } catch (error) {
      console.error('Sync Error:', error);
      setIsSyncing(false);
      setSyncProgress(0);
      clearInterval(intervalProgress);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-black border border-[#0084FF]/20 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,132,255,0.15)]"
          >
            {/* Glitch Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0084FF]/10 flex items-center justify-center text-[#0084FF] border border-[#0084FF]/30">
                  <ShieldAlert size={20} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-black text-white italic tracking-tighter uppercase">Painel de <span className="text-[#0084FF]">Acesso Restrito</span></h2>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Speed Cards Hacker v4.0.1</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 text-white/40 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-6">
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                    <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest leading-relaxed">
                      Este terminal requer autorização nível 4. Insira a chave de criptografia para desbloquear as ferramentas de gerenciamento.
                    </p>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0084FF]/50">
                        <Key size={18} />
                      </div>
                      <input 
                        type="password"
                        value={authKey}
                        onChange={(e) => setAuthKey(e.target.value)}
                        placeholder="ENTER ACCESS KEY"
                        className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-mono text-sm tracking-widest focus:outline-none focus:border-[#0084FF]/50 transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && onAuthenticate(authKey)}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => onAuthenticate(authKey)}
                    className="w-full py-4 bg-[#0084FF] text-black font-black uppercase text-sm tracking-[0.3em] rounded-xl shadow-[0_0_30px_rgba(0,132,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                  >
                    <Unlock size={18} className="group-hover:rotate-12 transition-transform" />
                    AUTENTICAR SISTEMA
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-8"
                >
                  {/* Password Generator Section */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Terminal size={12} className="text-[#0084FF]" /> Gerador de Chaves
                      </span>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-6">
                      <div className="h-16 flex items-center justify-center bg-black border border-[#0084FF]/20 rounded-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#0084FF]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className={cn(
                          "text-2xl font-mono text-white tracking-[0.2em] font-bold z-10",
                          isGenerating && "animate-glitch text-[#0084FF]"
                        )}>
                          {generatedPassword || "••••••••••••"}
                        </span>
                      </div>
                      
                      <button 
                        onClick={generateSecurePassword}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCcw size={14} className={cn(isGenerating && "animate-spin")} />
                        Gerar Nova Chave Mestra
                      </button>
                    </div>
                  </div>

                  {/* Sync Section */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Zap size={12} className="text-[#0084FF]" /> Distribuição Global
                    </span>
                    
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-mono text-[#FF3131] uppercase tracking-widest text-center animate-pulse">
                          Atenção: A sincronização bloqueará permanentemente a senha anterior.
                        </p>
                      </div>

                      {isSyncing && (
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-mono text-white/40 uppercase animate-pulse">Sincronizando Datastream...</span>
                            <span className="text-[11px] font-mono text-[#0084FF]">{Math.floor(syncProgress)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              animate={{ width: `${syncProgress}%` }}
                              className="h-full bg-[#0084FF] shadow-[0_0_15px_#0084FF]"
                            />
                          </div>
                        </div>
                      )}

                      {syncSuccess && (
                        <div className="flex flex-col gap-4">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
                          >
                            <Cpu size={20} className="animate-bounce" />
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-widest">Update Success</p>
                              <p className="text-[9px] font-mono opacity-60">Database nodes synchronized globally.</p>
                            </div>
                          </motion.div>

                          {logs.length > 0 && (
                            <div className="p-4 rounded-xl bg-black border border-white/5 font-mono text-[10px] text-white/40 flex flex-col gap-1 overflow-y-auto max-h-32">
                              {logs.map((log, i) => (
                                <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                >
                                  {log}
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <button 
                        disabled={!generatedPassword || isSyncing}
                        onClick={handleGlobalSync}
                        className={cn(
                          "w-full py-4 rounded-xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-3",
                          !generatedPassword || isSyncing
                            ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                            : "bg-[#0084FF] text-black shadow-[0_0_30px_rgba(0,132,255,0.6)] hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,132,255,0.8)]"
                        )}
                      >
                        <Activity size={18} className={cn(isSyncing && "animate-pulse")} />
                        Sincronizar Nova Chave Global
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Modal Footer Decorative */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-center items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Direct-Link encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0084FF] animate-ping" />
                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Network Secure</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
