import { phaseColor } from '../../lib/timer-phases';
import type { PhaseType } from '../../types/timer';

interface Props {
  progress: number;
  phaseType: PhaseType | null;
  danger?: boolean;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function CountdownRing({
  progress,
  phaseType,
  danger = false,
  size = 280,
  strokeWidth = 8,
  children,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const color = danger ? '#ef4444' : phaseType ? phaseColor(phaseType) : '#64748b';

  return (
    <div
      className={`relative flex items-center justify-center ${danger ? 'animate-danger-ring' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-200"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
