<<<<<<< HEAD

export type GameState = 'IDLE' | 'WAITING' | 'ANALYZING' | 'SIGNAL_FOUND';
export type Strategy = 'CONSERVATIVE' | 'AGGRESSIVE';
export type SignalColor = 'BLUE' | 'RED';
=======
export type GameState = 'IDLE' | 'WAITING' | 'ANALYZING' | 'SIGNAL_FOUND';
export type Strategy = 'CONSERVATIVE' | 'AGGRESSIVE';

// CORREÇÃO: Agora o SignalColor aceita os 3 estados, 
// garantindo que o App saiba renderizar o 'TIE' (Empate).
export type SignalColor = 'BLUE' | 'RED' | 'TIE';

>>>>>>> 2da9b7fe285f8d4c387b0b8692528170282123a5
export type NotificationType = 'warning' | 'alert' | 'success';

export interface WinRecord {
  id: string;
  user: string;
  amount: string;
  type: 'GREEN' | 'GALE WIN';
}

export interface GameResult {
  id: string;
<<<<<<< HEAD
  color: 'RED' | 'BLUE' | 'TIE';
=======
  color: SignalColor; // Referenciando o tipo unificado acima
>>>>>>> 2da9b7fe285f8d4c387b0b8692528170282123a5
  value: number;
  time: string;
  timestamp: number;
}

export interface Notification {
  id: number;
  text: string;
  type: NotificationType;
}

export interface StrategyPreset {
  id?: string;
  name: string;
  banca: string;
  meta: string;
  stopLoss: string;
  strategy: Strategy;
  userId: string;
  createdAt: number;
}
