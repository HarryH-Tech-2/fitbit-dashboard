import { useCallback, useEffect, useRef, useState } from 'react';
import type { Phase, TimerSettings, TimerState } from '../types/timer';
import { DEFAULT_TIMER_SETTINGS } from '../types/timer';
import { buildPhases } from '../lib/timer-phases';

export interface UseTimerReturn {
  state: TimerState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  currentPhase: Phase | null;
  remainingInPhase: number;
  progress: number;
  totalRemaining: number;
  totalProgress: number;
}

export function useTimer(
  settings: TimerSettings = DEFAULT_TIMER_SETTINGS,
  onPhaseChange?: (phase: Phase, prevPhase: Phase | null) => void,
  onFinish?: () => void,
): UseTimerReturn {
  const [phases] = useState(() => buildPhases(settings));
  const [state, setState] = useState<TimerState>({
    status: 'idle',
    currentPhaseIndex: 0,
    elapsedInPhase: 0,
    totalElapsed: 0,
    phases,
  });

  const phaseStartTimeRef = useRef<number>(0);
  const phaseElapsedBeforePauseRef = useRef<number>(0);
  const totalStartTimeRef = useRef<number>(0);
  const totalElapsedBeforePauseRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const currentPhaseIndexRef = useRef(0);
  const onPhaseChangeRef = useRef(onPhaseChange);
  const onFinishRef = useRef(onFinish);

  onPhaseChangeRef.current = onPhaseChange;
  onFinishRef.current = onFinish;

  const totalDuration = phases.reduce((s, p) => s + p.durationSec, 0);

  const tick = useCallback(() => {
    const now = Date.now() / 1000;
    const phaseElapsed = phaseElapsedBeforePauseRef.current + (now - phaseStartTimeRef.current);
    const totalElapsed = totalElapsedBeforePauseRef.current + (now - totalStartTimeRef.current);
    const currentIdx = currentPhaseIndexRef.current;
    const currentPhase = phases[currentIdx];

    if (phaseElapsed >= currentPhase.durationSec) {
      const nextIdx = currentIdx + 1;
      if (nextIdx >= phases.length) {
        setState(prev => ({
          ...prev,
          status: 'finished',
          elapsedInPhase: currentPhase.durationSec,
          totalElapsed: totalDuration,
        }));
        onFinishRef.current?.();
        return;
      }

      const overflow = phaseElapsed - currentPhase.durationSec;
      currentPhaseIndexRef.current = nextIdx;
      phaseStartTimeRef.current = now;
      phaseElapsedBeforePauseRef.current = overflow;

      onPhaseChangeRef.current?.(phases[nextIdx], currentPhase);

      setState(prev => ({
        ...prev,
        currentPhaseIndex: nextIdx,
        elapsedInPhase: overflow,
        totalElapsed,
      }));
    } else {
      setState(prev => ({
        ...prev,
        elapsedInPhase: phaseElapsed,
        totalElapsed,
      }));
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [phases, totalDuration]);

  const start = useCallback(() => {
    const now = Date.now() / 1000;
    phaseStartTimeRef.current = now;
    phaseElapsedBeforePauseRef.current = 0;
    totalStartTimeRef.current = now;
    totalElapsedBeforePauseRef.current = 0;
    currentPhaseIndexRef.current = 0;

    setState({
      status: 'running',
      currentPhaseIndex: 0,
      elapsedInPhase: 0,
      totalElapsed: 0,
      phases,
    });

    onPhaseChangeRef.current?.(phases[0], null);
    rafRef.current = requestAnimationFrame(tick);
  }, [phases, tick]);

  const pause = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const now = Date.now() / 1000;
    phaseElapsedBeforePauseRef.current += now - phaseStartTimeRef.current;
    totalElapsedBeforePauseRef.current += now - totalStartTimeRef.current;
    setState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const resume = useCallback(() => {
    const now = Date.now() / 1000;
    phaseStartTimeRef.current = now;
    totalStartTimeRef.current = now;
    setState(prev => ({ ...prev, status: 'running' }));
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    currentPhaseIndexRef.current = 0;
    phaseElapsedBeforePauseRef.current = 0;
    totalElapsedBeforePauseRef.current = 0;
    setState({
      status: 'idle',
      currentPhaseIndex: 0,
      elapsedInPhase: 0,
      totalElapsed: 0,
      phases,
    });
  }, [phases]);

  // Handle visibility change to correct for background tab throttling
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && state.status === 'running') {
        // RAF will auto-correct on next tick since we use wall-clock
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state.status]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const currentPhase = state.status !== 'idle' ? phases[state.currentPhaseIndex] : null;
  const remainingInPhase = currentPhase
    ? Math.max(0, currentPhase.durationSec - state.elapsedInPhase)
    : phases[0]?.durationSec ?? 0;
  const progress = currentPhase
    ? Math.min(1, state.elapsedInPhase / currentPhase.durationSec)
    : 0;
  const totalRemaining = Math.max(0, totalDuration - state.totalElapsed);
  const totalProgress = totalDuration > 0 ? Math.min(1, state.totalElapsed / totalDuration) : 0;

  return {
    state,
    start,
    pause,
    resume,
    reset,
    currentPhase,
    remainingInPhase,
    progress,
    totalRemaining,
    totalProgress,
  };
}
