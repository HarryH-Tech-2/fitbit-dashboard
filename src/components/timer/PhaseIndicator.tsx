import { phaseColorClass } from '../../lib/timer-phases';
import type { Phase } from '../../types/timer';

interface Props {
  phase: Phase | null;
}

export function PhaseIndicator({ phase }: Props) {
  if (!phase) {
    return (
      <span className="text-sm font-medium uppercase tracking-wider text-slate-400">
        Ready
      </span>
    );
  }

  return (
    <span className={`text-sm font-bold uppercase tracking-wider ${phaseColorClass(phase.type)}`}>
      {phase.label}
    </span>
  );
}
