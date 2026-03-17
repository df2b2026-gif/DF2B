import { useCallback } from 'react';

export function useHaptics() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightTap = useCallback(() => {
    vibrate(10);
  }, [vibrate]);

  const mediumTap = useCallback(() => {
    vibrate(20);
  }, [vibrate]);

  const heavyTap = useCallback(() => {
    vibrate(30);
  }, [vibrate]);

  const success = useCallback(() => {
    vibrate([10, 50, 10]);
  }, [vibrate]);

  const error = useCallback(() => {
    vibrate([30, 50, 30]);
  }, [vibrate]);

  const breathInhale = useCallback(() => {
    // Gentle rising vibration
    vibrate([50, 100, 150, 200, 250]);
  }, [vibrate]);

  const breathExhale = useCallback(() => {
    // Gentle falling vibration
    vibrate([250, 200, 150, 100, 50]);
  }, [vibrate]);

  const sosPattern = useCallback(() => {
    // Heartbeat-like pattern
    vibrate([100, 100, 100, 400, 100, 100, 100]);
  }, [vibrate]);

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    success,
    error,
    breathInhale,
    breathExhale,
    sosPattern,
  };
}
