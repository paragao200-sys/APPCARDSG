
import { useCallback, useRef } from 'react';

export function useAudioSynth(isMuted: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: 'ANALYZING' | 'SIGNAL_FOUND' | 'WAITING' | 'NOTIFICATION' | 'CLICK' | 'SUCCESS' | 'ALERT') => {
    if (isMuted) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      switch (type) {
        case 'CLICK':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        case 'SUCCESS':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.1); // C6
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case 'ALERT':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case 'ANALYZING':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
          
        case 'SIGNAL_FOUND':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1760, now + 0.05);
          gain2.gain.setValueAtTime(0.1, now + 0.05);
          gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc2.start(now + 0.05);
          osc2.stop(now + 0.2);
          break;

        case 'WAITING':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;

        case 'NOTIFICATION':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(660, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
      }
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }, [isMuted]);

  return { playSound, audioContext: audioContextRef.current };
}
