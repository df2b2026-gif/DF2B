import { useState, useEffect, useCallback, useRef } from 'react';
import { useHaptics } from './useHaptics';

export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'holdAfterExhale' | 'idle';

interface UseBreathingProps {
  inhale: number;
  hold: number;
  exhale: number;
  holdAfterExhale: number;
  enabled?: boolean;
}

export function useBreathing({
  inhale,
  hold,
  exhale,
  holdAfterExhale,
  enabled = true,
}: UseBreathingProps) {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { breathInhale, breathExhale } = useHaptics();

  const start = useCallback(() => {
    setIsActive(true);
    setPhase('inhale');
    setProgress(0);
    breathInhale();
  }, [breathInhale]);

  const stop = useCallback(() => {
    setIsActive(false);
    setPhase('idle');
    setProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setCycleCount(0);
  }, [stop]);

  useEffect(() => {
    if (!isActive || !enabled) return;

    let currentPhase: BreathPhase = 'inhale';
    let phaseStartTime = Date.now();
    let currentPhaseDuration = inhale * 1000;

    const updateBreathing = () => {
      const now = Date.now();
      const elapsed = now - phaseStartTime;
      const phaseProgress = Math.min(elapsed / currentPhaseDuration, 1);
      
      setProgress(phaseProgress);

      if (elapsed >= currentPhaseDuration) {
        // Move to next phase
        switch (currentPhase) {
          case 'inhale':
            if (hold > 0) {
              currentPhase = 'hold';
              currentPhaseDuration = hold * 1000;
            } else {
              currentPhase = 'exhale';
              currentPhaseDuration = exhale * 1000;
              breathExhale();
            }
            break;
          case 'hold':
            currentPhase = 'exhale';
            currentPhaseDuration = exhale * 1000;
            breathExhale();
            break;
          case 'exhale':
            if (holdAfterExhale > 0) {
              currentPhase = 'holdAfterExhale';
              currentPhaseDuration = holdAfterExhale * 1000;
            } else {
              currentPhase = 'inhale';
              currentPhaseDuration = inhale * 1000;
              setCycleCount(prev => prev + 1);
              breathInhale();
            }
            break;
          case 'holdAfterExhale':
            currentPhase = 'inhale';
            currentPhaseDuration = inhale * 1000;
            setCycleCount(prev => prev + 1);
            breathInhale();
            break;
        }
        phaseStartTime = now;
        setPhase(currentPhase);
      }
    };

    intervalRef.current = setInterval(updateBreathing, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, enabled, inhale, hold, exhale, holdAfterExhale, breathInhale, breathExhale]);

  const getPhaseText = useCallback(() => {
    switch (phase) {
      case 'inhale':
        return 'Вдих...';
      case 'hold':
        return 'Затримка...';
      case 'exhale':
        return 'Видих...';
      case 'holdAfterExhale':
        return 'Пауза...';
      default:
        return 'Готовий?';
    }
  }, [phase]);

  const getPhaseColor = useCallback(() => {
    switch (phase) {
      case 'inhale':
        return '#D4A574';
      case 'hold':
        return '#C9A227';
      case 'exhale':
        return '#7A9B76';
      case 'holdAfterExhale':
        return '#8B7355';
      default:
        return '#6B6558';
    }
  }, [phase]);

  return {
    phase,
    progress,
    cycleCount,
    isActive,
    start,
    stop,
    reset,
    getPhaseText,
    getPhaseColor,
  };
}
