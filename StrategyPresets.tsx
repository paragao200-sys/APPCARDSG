import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Trash2, ChevronRight, Bookmark } from 'lucide-react';
import { usePresets } from '../../hooks/usePresets';
import { Strategy } from '../../types';
import { cn } from '../../lib/utils';

interface StrategyPresetsProps {
  currentBanca: string;
  currentMeta: string;
  currentStopLoss: string;
  currentStrategy: Strategy;
  onSelect: (preset: { banca: string, meta: string, stopLoss: string, strategy: Strategy }) => void;
}

export function StrategyPresets({ 
  currentBanca, 
  currentMeta, 
  currentStopLoss, 
  currentStrategy,
  onSelect 
}: StrategyPresetsProps) {
  const { presets, savePreset, deletePreset } = usePresets();
  const [isSaving, setIsSaving] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const handleSave = async () => {
    if (!newPresetName.trim()) return;
    try {
      await savePreset(newPresetName, currentBanca, currentMeta, currentStopLoss, currentStrategy);
      setNewPresetName('');
      setIsSaving(false);
    } catch (error) {
      console.error("Failed to save preset:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-hacker font-black uppercase text-white/40 flex items-center gap-2">
          <Bookmark size={10} className="text-bet-blue" /> Seus Presets
        </h3>
        {!isSaving ? (
          <button 
            onClick={() => setIsSaving(true)}
            className="flex items-center gap-2 px-3 py-1 bg-bet-blue/10 hover:bg-bet-blue/20 text-bet-blue rounded-lg text-[9px] font-black uppercase transition-all border border-bet-blue/20"
          >
            <Save size={10} /> Salvar Atual
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input 
              autoFocus
              placeholder="Nome do preset..."
              value={newPresetName}
              onChange={e => setNewPresetName(e.target.value)}
              className="bg-black/40 border border-white/10 px-3 py-1 rounded-lg text-[9px] text-white outline-none focus:border-bet-blue/40 w-32"
            />
            <button onClick={handleSave} className="text-bet-tie hover:text-white transition-colors"><Save size={14}/></button>
            <button onClick={() => setIsSaving(false)} className="text-bet-red/60 hover:text-white transition-colors text-[9px] font-black uppercase">Cancelar</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
        <AnimatePresence initial={false}>
          {presets.length === 0 ? (
            <div className="text-center py-8 glass-panel rounded-2xl border-white/5 opacity-50">
              <p className="text-[10px] font-bold text-white/40 uppercase">Nenhum preset salvo</p>
            </div>
          ) : (
            presets.map((preset, i) => (
              <motion.div
                key={preset.id || `preset-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="group relative glass-panel p-4 rounded-2xl border-white/10 hover:border-bet-blue/30 transition-all cursor-pointer overflow-hidden"
                onClick={() => onSelect({
                  banca: preset.banca,
                  meta: preset.meta,
                  stopLoss: preset.stopLoss,
                  strategy: preset.strategy
                })}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-white group-hover:text-bet-blue transition-colors uppercase truncate max-w-[150px]">
                      {preset.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] font-bold text-white/40 uppercase">B: R${preset.banca}</span>
                      <span className="text-[8px] font-bold text-white/40 uppercase">•</span>
                      <span className="text-[8px] font-bold text-white/40 uppercase">M: {preset.meta}%</span>
                      <span className={cn(
                        "text-[8px] font-black uppercase px-1 rounded",
                        preset.strategy === 'CONSERVATIVE' ? "text-bet-blue bg-bet-blue/10" : "text-bet-red bg-bet-red/10"
                      )}>
                        {preset.strategy === 'CONSERVATIVE' ? 'C' : 'A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (preset.id) deletePreset(preset.id);
                      }}
                      className="p-2 text-white/20 hover:text-bet-red transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-bet-blue transition-all group-hover:translate-x-1" />
                  </div>
                </div>
                
                {/* Visual marker */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  preset.strategy === 'CONSERVATIVE' ? "bg-bet-blue" : "bg-bet-red"
                )} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
