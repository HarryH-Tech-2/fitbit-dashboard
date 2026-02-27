import { Heart } from 'lucide-react';

interface Props {
  bpm: number | null;
  connected: boolean;
}

export function HeartRateDisplay({ bpm, connected }: Props) {
  if (!connected || bpm === null) return null;

  return (
    <div className="flex items-center gap-2">
      <Heart size={20} className="text-interval animate-pulse-hr" fill="currentColor" />
      <span className="text-2xl font-bold tabular-nums">{bpm}</span>
      <span className="text-xs text-slate-400">BPM</span>
    </div>
  );
}
