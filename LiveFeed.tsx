
import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { GameResult } from '../../types';

export function LiveFeed({ results }: { results: GameResult[] }) {
  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-4 border-y border-white/5 z-10 my-2">
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-12 custom-scrollbar no-scrollbar scroll-smooth">
        {results.slice(0, 40).map((res, i) => (
          <motion.div
            key={res.id || `live-res-${i}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, type: "spring", stiffness: 200 }}
            className="flex-shrink-0 flex flex-col items-center gap-3 group"
          >
            {/* The Neon Circle */}
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center relative transition-all duration-700",
              "border-[3px] border-white/20 hover:scale-110 cursor-pointer",
              res.color === 'RED' ? "bg-gradient-to-br from-[#FF0000] to-[#880000] shadow-[0_0_30px_rgba(255,0,0,0.6)]" :
              res.color === 'BLUE' ? "bg-gradient-to-br from-[#0088FF] to-[#004488] shadow-[0_0_30px_rgba(0,136,255,0.6)]" :
              "bg-gradient-to-br from-[#FFD700] to-[#FF9900] shadow-[0_0_50px_rgba(255,215,0,0.8)] border-[#FFD700]/50"
            )}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-white/30" />
              <motion.span 
                animate={res.color === 'TIE' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className={cn(
                  "text-[22px] font-display font-black italic drop-shadow-[0_2px_12px_rgba(0,0,0,1)] z-10",
                  res.color === 'TIE' ? "text-white text-shadow-[0_0_15px_#FFD700]" : "text-white"
                )}
              >
                {res.value}
              </motion.span>
              
              {/* Pulsing Ring for active or TIE */}
              {(i === 0 || res.color === 'TIE') && (
                <motion.div 
                  animate={res.color === 'TIE' ? { scale: [1, 1.8], opacity: [0.6, 0] } : { scale: [1, 1.4], opacity: [0.4, 0] }}
                  transition={{ duration: res.color === 'TIE' ? 1 : 1.5, repeat: Infinity }}
                  className={cn(
                    "absolute -inset-1 rounded-full blur-md",
                    res.color === 'RED' ? "bg-bet-red" : res.color === 'BLUE' ? "bg-bet-blue" : "bg-[#FFD700] shadow-[0_0_30px_#FFD700]"
                  )}
                />
              )}

              {/* Special Tie Aura */}
              {res.color === 'TIE' && (
                <>
                  <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ 
                      rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                    className="absolute -inset-3 border-2 border-dashed border-[#FFD700]/60 rounded-full"
                  />
                  <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="absolute inset-0 bg-[#FFD700]/10 rounded-full"
                  />
                </>
              )}
            </div>

            {/* Universal Label Structure */}
            <div className="flex flex-col items-center gap-1 transition-all group-hover:translate-y-0.5">
              <span className="text-[9px] font-mono font-black text-white/30 tracking-[0.2em] uppercase">
                {res.time}
              </span>
              <span className={cn(
                "text-[10px] font-black uppercase italic tracking-[0.05em] transition-all",
                "drop-shadow-[0_0_6px_currentColor]",
                res.color === 'RED' ? "text-[#FF0000]" : 
                res.color === 'BLUE' ? "text-[#0088FF]" : 
                "text-[#FFD700]"
              )}>
                {res.color === 'RED' ? 'CASA' : res.color === 'BLUE' ? 'VISITANTE' : 'TIE 11X'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* 4K Cinematic Scroll Track */}
      <div className="absolute bottom-3 left-[15%] right-[15%] h-0.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          animate={{ x: ['-20%', '120%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="h-full w-1/4 bg-white/15 blur-[0.5px] rounded-full"
        />
      </div>
    </div>
  );
}
