import { useCallback, useEffect, useRef, useState } from 'react';

export function useWakeLock() {
  const [active, setActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setActive(true);
      wakeLockRef.current.addEventListener('release', () => setActive(false));
    } catch {
      // Wake lock request failed (e.g. low battery)
    }
  }, []);

  const release = useCallback(async () => {
    await wakeLockRef.current?.release();
    wakeLockRef.current = null;
    setActive(false);
  }, []);

  // Re-acquire on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && active && !wakeLockRef.current) {
        request();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [active, request]);

  return { active, request, release };
}
