import { useCallback, useRef } from 'react';
import { playBeep, playSound, preloadSounds, unlockAudio, type SoundName } from '../lib/audio-manager';

export function useAudio() {
  const enabledRef = useRef(true);

  const unlock = useCallback(async () => {
    await unlockAudio();
    await preloadSounds();
  }, []);

  const play = useCallback((name: SoundName) => {
    if (!enabledRef.current) return;
    playSound(name);
  }, []);

  const beep = useCallback((frequency?: number, duration?: number) => {
    if (!enabledRef.current) return;
    playBeep(frequency, duration);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  return { unlock, play, beep, setEnabled };
}
