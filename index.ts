
export type GameState = 'IDLE' | 'WAITING' | 'ANALYZING' | 'SIGNAL_FOUND';
export type Strategy = 'CONSERVATIVE' | 'AGGRESSIVE';
export type SignalColor = 'BLUE' | 'RED';
export type NotificationType = 'warning' | 'alert' | 'success';

export interface WinRecord {
  id: string;
  user: string;
  amount: string;
  type: 'GREEN' | 'GALE WIN';
}

export interface GameResult {
  id: string;
  color: 'RED' | 'BLUE' | 'TIE';
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
