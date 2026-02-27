import type { Phase, TimerSettings } from '../types/timer';

export function buildPhases(settings: TimerSettings): Phase[] {
  const phases: Phase[] = [];

  phases.push({
    type: 'warmup',
    durationSec: settings.warmupSec,
    label: 'Warm Up',
  });

  for (let i = 1; i <= settings.intervalCount; i++) {
    phases.push({
      type: 'interval',
      durationSec: settings.intervalSec,
      label: `Interval ${i}`,
      intervalNumber: i,
    });

    if (i < settings.intervalCount) {
      phases.push({
        type: 'recovery',
        durationSec: settings.recoverySec,
        label: `Recovery ${i}`,
        intervalNumber: i,
      });
    }
  }

  phases.push({
    type: 'cooldown',
    durationSec: settings.cooldownSec,
    label: 'Cool Down',
  });

  return phases;
}

export function totalDuration(phases: Phase[]): number {
  return phases.reduce((sum, p) => sum + p.durationSec, 0);
}

export function phaseColor(type: Phase['type']): string {
  switch (type) {
    case 'warmup': return 'var(--color-warmup)';
    case 'interval': return 'var(--color-interval)';
    case 'recovery': return 'var(--color-recovery)';
    case 'cooldown': return 'var(--color-cooldown)';
  }
}

export function phaseColorClass(type: Phase['type']): string {
  switch (type) {
    case 'warmup': return 'text-warmup';
    case 'interval': return 'text-interval';
    case 'recovery': return 'text-recovery';
    case 'cooldown': return 'text-cooldown';
  }
}
