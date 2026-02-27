import { useCallback } from 'react';

export function useVibration() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const shortBuzz = useCallback(() => vibrate(200), [vibrate]);
  const longBuzz = useCallback(() => vibrate([200, 100, 200]), [vibrate]);

  return { vibrate, shortBuzz, longBuzz };
}
