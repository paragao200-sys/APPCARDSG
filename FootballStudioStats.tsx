import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, LayoutGrid } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GameResult } from '../../types';

interface StatsProps {
  results: GameResult[];
  gameState: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** How many rounds without a TIE before we start alerting. */
const TIE_ALERT_START = 9;

/** How many rounds without a TIE before we stop alerting (give up). */
const TIE_ALERT_END = 16;

/** Target gap used to calculate "rounds remaining" estimate. */
const TIE_TARGET_GAP = 13;

/** Total grid slots displayed. */
const GRID_SLOTS = 90;

/** Number of rows shown in the row-stats sidebar. */
const ROW_COUNT = 6;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Distributes a total across three rounded values so they always sum
 * to exactly 100, avoiding rounding drift.
 */
function distributePercents(
  a: number,
  b: number,
  c: number,
  total: number
): [number, number, number] {
  if (total === 0) return [0, 0, 100];
  const pA = Math.round((a / total) * 100);
  const pB = Math.round((b / total) * 100);
  const pC = Math.max(0, 100 - pA - pB); // absorbs rounding error
  return [pA, pB, pC];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FootballStudioStats({ results, gameState }: StatsProps) {
  // --- Tie history ------------------------------------------------------------
  const tieResults = useMemo(
    () =>
      [...results]
        .filter((r) => r.color === 'TIE')
        .sort((a, b) => b.timestamp - a.timestamp),
    [results]
  );

  /** Index of the most recent TIE in the results array (0 = latest). */
  const roundsSinceLastTie = useMemo(() => {
    const idx = results.findIndex((r) => r.color === 'TIE');
    return idx === -1 ? 99 : idx;
  }, [results]);

  /**
   * Estimated rounds until next TIE.
   * Derived from TIE_TARGET_GAP minus rounds already elapsed — never negative.
   */
  const roundsUntilNextTie = useMemo(
    () => Math.max(0, TIE_TARGET_GAP - roundsSinceLastTie),
    [roundsSinceLastTie]
  );

  const isTiePossible =
    roundsSinceLastTie >= TIE_ALERT_START &&
    roundsSinceLastTie <= TIE_ALERT_END;

  // --- Overall proportion bar -------------------------------------------------
  const { pBlue, pTie, pRed } = useMemo(() => {
    const total = results.length;
    const blue = results.filter((r) => r.color === 'BLUE').length;
    const tie = results.filter((r) => r.color === 'TIE').length;
    const red = results.filter((r) => r.color === 'RED').length;
    const [pb, pt, pr] = distributePercents(blue, tie, red, total);
    return { pBlue: pb, pTie: pt, pRed: pr };
  }, [results]);

  // --- Grid slots (90 cells, latest first) -----------------------------------
  const gridSlots = useMemo<(GameResult | null)[]>(() => {
    const filled = results.slice(0, GRID_SLOTS);
    const empty = Array<null>(Math.max(0, GRID_SLOTS - filled.length)).fill(null);
    return [...filled, ...empty];
  }, [results]);

  // --- Row stats (real data, one row = 15 results) ----------------------------
  const rowStats = useMemo(() => {
    return Array.from({ length: ROW_COUNT }, (_, rowIndex) => {
      const start = rowIndex * 15;
      const chunk = results.slice(start, start + 15);
      const total = chunk.length || 1;
      const red = chunk.filter((r) => r.color === 'RED').length;
      const blue = chunk.filter((r) => r.color === 'BLUE').length;
      const tie = chunk.filter((r) => r.color === 'TIE').length;
      const [pr, pb, pt] = distributePercents(red, blue, tie, total);
      return { pr, pb, pt };
    });
  }, [results]);

  // --- Render -----------------------------------------------------------------
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">

      {/* --- Alerta de Empate ----------------------------------------------- */}
      <div className="lg:col-span-4 glass-panel rounded-2xl p-4 border-white/5 bg-black/40 h-[280px] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="text-bet-tie font-black text-sm uppercase">Alerta de Empate</span>
          <div className="w-4 h-4 rounded-full bg-bet-tie/20 flex items-center justify-center text-bet-tie">
            <Info size={10} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isTiePossible ? (
            <motion.div
              key="alert-on"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                  boxShadow: [
                    '0 0 20px rgba(255,215,0,0.3)',
                    '0 0 40px rgba(255,215,0,0.6)',
                    '0 0 20px rgba(255,215,0,0.3)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-[#FFD700] to-[#886600] rounded-full flex items-center justify-center text-black font-black mb-4 border-4 border-white/30"
              >
                <div className="text-4xl font-black italic">
                  11x
                </div>
              </motion.div>

              <h3 className="text-2xl font-black text-bet-tie uppercase tracking-tighter italic drop-shadow-[0_0_10px_rgba(0,255,133,0.5)]">
                Possível Empate
              </h3>

              <div className="mt-2 flex flex-col items-center gap-1">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">
                  Entrada em até{' '}
                  <span className="text-bet-tie text-xs">{roundsUntilNextTie}</span>{' '}
                  rodadas
                </p>
                <div className="flex gap-1 mt-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-bet-tie"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="alert-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-4 border border-white/10">
                <Info size={32} />
              </div>
              <h3 className="text-sm font-black text-white/20 uppercase">
                Monitorando Padrões
              </h3>
              <p className="text-[8px] text-white/10 uppercase mt-2">
                Último empate há {roundsSinceLastTie === 99 ? '—' : roundsSinceLastTie} rodadas
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tie history dots */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-1 justify-between px-2">
          {tieResults.slice(0, 6).map((tie, i) => (
            <div
              key={`tie-dot-${tie.id ?? i}-${i}`}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-bet-tie shadow-[0_0_8px_#FFD700] group-hover:scale-125 transition-transform" />
              <span className="text-[7px] font-mono text-white/20 font-bold">
                {tie.time.split(':').slice(1).join(':')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Possíveis Formações no Gráfico --------------------------------- */}
      <div className="lg:col-span-8 glass-panel rounded-2xl p-4 border-white/5 bg-black/40 h-[280px] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-bet-tie font-black text-sm uppercase">
              Possíveis Formações no Gráfico
            </span>
            <LayoutGrid size={14} className="text-bet-tie" />
          </div>
          <Info size={14} className="text-white/20" />
        </div>

        {/* Proportion Bar — always sums to 100% */}
        <div className="w-full h-4 rounded-full overflow-hidden flex mb-6 border border-white/5 bg-white/5">
          <div
            className="bg-bet-blue h-full flex items-center justify-center text-[8px] font-black text-white transition-all duration-500"
            style={{ width: `${pBlue}%` }}
          >
            {pBlue > 5 ? `${pBlue}%` : ''}
          </div>
          <div
            className="bg-bet-tie h-full flex items-center justify-center text-[8px] font-black text-black transition-all duration-500"
            style={{ width: `${pTie}%` }}
          >
            {pTie > 5 ? `${pTie}%` : ''}
          </div>
          <div
            className="bg-bet-red h-full flex items-center justify-center text-[8px] font-black text-white transition-all duration-500"
            style={{ width: `${pRed}%` }}
          >
            {pRed > 5 ? `${pRed}%` : ''}
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1 overflow-hidden flex gap-6">
          <div className="flex-1 grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1 content-start overflow-y-auto pr-1">
            {gridSlots.map((res, i) => {
              const uniqueKey = res?.id
                ? `grid-item-${res.id}-${i}`
                : `grid-item-empty-${i}`;
              return (
                <motion.div
                  key={uniqueKey}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    'aspect-square rounded-[6px] flex items-center justify-center text-[8px] font-black text-white border border-white/20 transition-transform hover:scale-110',
                    res?.color === 'BLUE'
                      ? 'bg-gradient-to-br from-[#0088FF] to-[#002244] shadow-[0_0_20px_rgba(0,136,255,0.6)] saturate-150'
                      : res?.color === 'RED'
                      ? 'bg-gradient-to-br from-[#FF0000] to-[#660000] shadow-[0_0_20px_rgba(255,0,0,0.6)] saturate-150'
                      : res?.color === 'TIE'
                      ? 'bg-gradient-to-br from-[#FFD700] to-[#886600] text-black shadow-[0_0_25px_rgba(255,215,0,0.8)] saturate-200'
                      : 'bg-white/5'
                  )}
                >
                  {res?.color === 'BLUE'
                    ? 'V'
                    : res?.color === 'RED'
                    ? 'C'
                    : res?.color === 'TIE'
                    ? 'T'
                    : ''}
                </motion.div>
              );
            })}
          </div>

          {/* Row stats — calculated from real data, 15 results per row */}
          <div className="w-24 flex flex-col justify-between py-1 gap-1">
            {rowStats.map(({ pr, pb, pt }, rowIndex) => (
              <div
                key={`row-stat-${rowIndex}`}
                className="flex items-center gap-1.5 justify-end"
              >
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-bet-red" />
                  <span className="text-[7px] font-black text-white/40">{pr}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-bet-blue" />
                  <span className="text-[7px] font-black text-white/40">{pb}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-bet-tie" />
                  <span className="text-[7px] font-black text-white/40">{pt}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
