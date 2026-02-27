import { phaseColor } from '../../lib/timer-phases';
import type { Phase } from '../../types/timer';

interface Props {
  phases: Phase[];
  currentPhaseIndex: number;
  phaseProgress: number;
}

export function IntervalProgress({ phases, currentPhaseIndex, phaseProgress }: Props) {
  return (
    <div className="flex gap-1.5 w-full max-w-xs">
      {phases.map((phase, i) => {
        let fill: number;
        if (i < currentPhaseIndex) fill = 1;
        else if (i === currentPhaseIndex) fill = phaseProgress;
        else fill = 0;

        return (
          <div
            key={i}
            className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden"
          >
            <div
              className="h-full rounded-full transition-[width] duration-200"
              style={{
                width: `${fill * 100}%`,
                backgroundColor: phaseColor(phase.type),
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
