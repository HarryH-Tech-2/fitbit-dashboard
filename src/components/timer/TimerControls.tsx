import { Pause, Play, RotateCcw, Square } from 'lucide-react';

interface Props {
  status: 'idle' | 'running' | 'paused' | 'finished';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onFinish?: () => void;
}

export function TimerControls({ status, onStart, onPause, onResume, onReset, onFinish }: Props) {
  if (status === 'idle') {
    return (
      <button
        onClick={onStart}
        className="flex items-center gap-2 rounded-full bg-interval px-8 py-4 text-lg font-bold text-white active:scale-95 transition-transform"
      >
        <Play size={24} fill="currentColor" />
        Start Workout
      </button>
    );
  }

  if (status === 'finished') {
    return (
      <button
        onClick={onReset}
        className="flex items-center gap-2 rounded-full bg-slate-700 px-8 py-4 text-lg font-bold text-white active:scale-95 transition-transform"
      >
        <RotateCcw size={24} />
        New Workout
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {status === 'running' ? (
        <button
          onClick={onPause}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 text-white active:scale-95 transition-transform"
        >
          <Pause size={28} fill="currentColor" />
        </button>
      ) : (
        <button
          onClick={onResume}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-interval text-white active:scale-95 transition-transform"
        >
          <Play size={28} fill="currentColor" />
        </button>
      )}
      <button
        onClick={() => {
          onFinish?.();
          onReset();
        }}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-slate-400 active:scale-95 transition-transform"
      >
        <Square size={20} fill="currentColor" />
      </button>
    </div>
  );
}
