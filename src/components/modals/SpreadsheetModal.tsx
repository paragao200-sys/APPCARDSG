
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Table, X, DollarSign, TrendingUp, AlertTriangle, Target, Bookmark } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StrategyPresets } from '../features/StrategyPresets';
import { Strategy } from '../../types';

export function SpreadsheetModal({ 
  isOpen, 
  onClose,
  banca, setBanca,
  meta, setMeta,
  stopLoss, setStopLoss,
  strategy, setStrategy
}: { 
  isOpen: boolean, 
  onClose: () => void,
  banca: string, setBanca: (v: string) => void,
  meta: string, setMeta: (v: string) => void,
  stopLoss: string, setStopLoss: (v: string) => void,
  strategy: Strategy, setStrategy: (v: Strategy) => void
}) {
  const [projectionPeriod, setProjectionPeriod] = useState<7 | 15 | 30>(7);

  if (!isOpen) return null;

  const currentBanca = Number(banca) || 0;
  const currentMeta = Number(meta) || 0;

  const handleRipple = (e: React.MouseEvent<HTMLElement>, callback?: () => void) => {
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
    if (callback) callback();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-2xl glass-panel rounded-[20px] overflow-hidden shadow-[0_0_100px_rgba(0,136,255,0.15)] border-white/10"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-bet-blue/20 rounded-xl flex items-center justify-center text-bet-blue">
                <Table size={20} />
              </div>
              <div>
                <h2 className="font-display font-black text-xl uppercase tracking-tight">Planilha Inteligente</h2>
                <p className="text-[10px] font-hacker font-bold text-white/40 uppercase tracking-widest">Gestão Profissional</p>
              </div>
            </div>
            <button 
              onClick={(e) => handleRipple(e, onClose)} 
              className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors relative overflow-hidden"
            >
              <X size={20} className="text-white/40" />
            </button>
          </div>

          <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-hacker font-black uppercase text-white/40 flex items-center gap-2">
                  <DollarSign size={10} className="text-bet-blue" /> Banca Inicial
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-xs">R$</span>
                  <input 
                    type="number" value={banca} onChange={e => setBanca(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 p-4 pl-10 rounded-xl text-lg font-display font-black text-bet-blue outline-none focus:border-bet-blue/40"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-hacker font-black uppercase text-white/40 flex items-center gap-2">
                  <TrendingUp size={10} className="text-bet-tie" /> Perfil de Meta
                </label>
                <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                  <button 
                    onClick={() => setMeta('5')}
                    className={cn(
                      "flex-1 py-3 rounded-lg text-[10px] font-black transition-all",
                      meta === '5' ? "bg-bet-blue/20 text-bet-blue border border-bet-blue/30" : "text-white/40 hover:text-white"
                    )}
                  >
                    CONSERVADOR (5%)
                  </button>
                  <button 
                    onClick={() => setMeta('10')}
                    className={cn(
                      "flex-1 py-3 rounded-lg text-[10px] font-black transition-all",
                      meta === '10' ? "bg-bet-red/20 text-bet-red border border-bet-red/30" : "text-white/40 hover:text-white"
                    )}
                  >
                    AGRESSIVO (10%)
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-hacker font-black uppercase text-white/40 flex items-center gap-2">
                  <TrendingUp size={10} className="text-bet-tie" /> Meta Diária (%)
                </label>
                <input 
                  type="number" value={meta} onChange={e => setMeta(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-lg font-display font-black text-bet-tie outline-none focus:border-bet-tie/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-hacker font-black uppercase text-white/40 flex items-center gap-2">
                  <AlertTriangle size={10} className="text-bet-red" /> Stop Loss (%)
                </label>
                <input 
                  type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-lg font-display font-black text-bet-red outline-none focus:border-bet-red/40"
                />
              </div>
            </div>

            <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-display font-black uppercase text-white/60">Projeção de Metas Batidas</h3>
                <div className="flex bg-white/5 rounded-lg p-1">
                  {[7, 15, 30].map(p => (
                    <button 
                      key={p} 
                      onClick={() => setProjectionPeriod(p as any)}
                      className={cn(
                        "px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all",
                        projectionPeriod === p ? "bg-bet-blue text-white shadow-lg" : "text-white/40 hover:text-white"
                      )}
                    >
                      {p} Dias
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {Array.from({ length: projectionPeriod }).map((_, i) => (
                  <div key={`proj-day-${i}`} className="glass-panel p-3 rounded-xl border-white/5 text-center">
                    <div className="text-[8px] font-hacker font-bold text-white/40 uppercase mb-1">Dia {i + 1}</div>
                    <div className="text-[10px] font-display font-black text-white">
                      R$ {(currentBanca * Math.pow(1 + currentMeta/100, i + 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel p-5 rounded-2xl border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-display font-black text-bet-blue uppercase">Stake: Conservador</div>
                  <div className="px-2 py-0.5 bg-bet-blue/10 rounded text-[8px] font-black text-bet-blue uppercase">5% Unid.</div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[9px] text-white/40 font-bold">Unidade Base</span>
                    <span className="text-xl font-display font-black text-white">R$ {(currentBanca * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[9px] text-white/40 font-bold">Operação Direta</span>
                    <span className="text-xl font-display font-black text-bet-blue">R$ {(currentBanca * 0.05).toFixed(2)}</span>
                  </div>
                  <p className="text-[8px] text-white/20 italic leading-relaxed uppercase">Gestão conservadora focada em blindagem de patrimônio e crescimento sustentável.</p>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-display font-black text-bet-red uppercase">Stake: Agressivo</div>
                  <div className="px-2 py-0.5 bg-bet-red/10 rounded text-[8px] font-black text-bet-red uppercase">10% Unid.</div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[9px] text-white/40 font-bold">Unidade Base</span>
                    <span className="text-xl font-display font-black text-white">R$ {(currentBanca * 0.10).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[9px] text-white/40 font-bold">Operação Direta</span>
                    <span className="text-xl font-display font-black text-bet-red">R$ {(currentBanca * 0.10).toFixed(2)}</span>
                  </div>
                  <p className="text-[8px] text-white/20 italic leading-relaxed uppercase">Foco em alavancagem rápida. Alto risco e exposição. Recomendado para bancas menores.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6">
              <StrategyPresets 
                currentBanca={banca}
                currentMeta={meta}
                currentStopLoss={stopLoss}
                currentStrategy={strategy}
                onSelect={(p) => {
                  setBanca(p.banca);
                  setMeta(p.meta);
                  setStopLoss(p.stopLoss);
                  setStrategy(p.strategy);
                }}
              />
            </div>
          </div>

          <div className="p-6 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 glass-panel p-3 rounded-xl border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 bg-bet-tie/20 rounded-lg flex items-center justify-center text-bet-tie">
                <Target size={16} />
              </div>
              <div>
                <div className="text-[8px] font-hacker font-black text-white/40 uppercase">Lucro Esperado Hoje</div>
                <div className="text-sm font-display font-black text-bet-tie">R$ {(currentBanca * currentMeta/100).toFixed(2)}</div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-bet-blue/20 hover:bg-bet-blue/30 text-bet-blue rounded-xl text-[10px] font-display font-black uppercase tracking-widest transition-all border border-bet-blue/30 shadow-lg shadow-bet-blue/10 min-w-[200px]"
            >
              Fechar Gerenciador
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
