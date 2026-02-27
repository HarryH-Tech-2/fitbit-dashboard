import { Heart } from 'lucide-react';

interface Props {
  bpm: number | null;
  connected: boolean;
  dangerThreshold?: number;
}

export function HeartRateDisplay({ bpm, connected, dangerThreshold = 175 }: Props) {
  if (!connected || bpm === null) return null;

  const isDanger = bpm >= dangerThreshold;

  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1 transition-colors ${isDanger ? 'bg-red-950/60 animate-danger-pulse' : ''}`}>
      <Heart
        size={20}
        className={`animate-pulse-hr ${isDanger ? 'text-red-400' : 'text-interval'}`}
        fill="currentColor"
      />
      <span className={`text-2xl font-bold tabular-nums ${isDanger ? 'text-red-300' : ''}`}>{bpm}</span>
      <span className="text-xs text-slate-400">BPM</span>
    </div>
  );
}
