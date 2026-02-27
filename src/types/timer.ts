export type PhaseType = 'warmup' | 'interval' | 'recovery' | 'cooldown';

export interface Phase {
  type: PhaseType;
  durationSec: number;
  label: string;
  /** 1-based interval number (only for interval/recovery phases) */
  intervalNumber?: number;
}

export interface TimerState {
  status: 'idle' | 'running' | 'paused' | 'finished';
  currentPhaseIndex: number;
  elapsedInPhase: number;
  totalElapsed: number;
  phases: Phase[];
}

export interface TimerSettings {
  warmupSec: number;
  intervalSec: number;
  recoverySec: number;
  cooldownSec: number;
  intervalCount: number;
}

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  warmupSec: 600,
  intervalSec: 240,
  recoverySec: 180,
  cooldownSec: 300,
  intervalCount: 4,
};
