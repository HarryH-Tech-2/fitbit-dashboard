import { Trophy, X } from 'lucide-react';
import type { WorkoutRecord } from '../../types/workout';
import { formatTime } from '../../lib/utils';

interface Props {
  workout: WorkoutRecord | null;
  onClose: () => void;
  onSyncFitbit?: () => void;
  fitbitConnected?: boolean;
}

export function WorkoutSummaryModal({ workout, onClose, onSyncFitbit, fitbitConnected }: Props) {
  if (!workout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={24} className="text-warmup" />
            <h2 className="text-xl font-bold">Workout Complete!</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl bg-slate-800 p-3">
            <div className="text-xs text-slate-400 mb-1">Duration</div>
            <div className="text-lg font-bold">{formatTime(workout.durationSec)}</div>
          </div>
          <div className="rounded-xl bg-slate-800 p-3">
            <div className="text-xs text-slate-400 mb-1">Intervals</div>
            <div className="text-lg font-bold">{workout.intervals.length} / {workout.phases.filter(p => p.type === 'interval').length}</div>
          </div>
          {workout.avgHR !== null && (
            <div className="rounded-xl bg-slate-800 p-3">
              <div className="text-xs text-slate-400 mb-1">Avg HR</div>
              <div className="text-lg font-bold">{Math.round(workout.avgHR)} BPM</div>
            </div>
          )}
          {workout.maxHR !== null && (
            <div className="rounded-xl bg-slate-800 p-3">
              <div className="text-xs text-slate-400 mb-1">Max HR</div>
              <div className="text-lg font-bold">{workout.maxHR} BPM</div>
            </div>
          )}
        </div>

        {workout.intervals.length > 0 && workout.intervals[0].avgHR !== null && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-2">Interval Breakdown</h3>
            <div className="space-y-2">
              {workout.intervals.map((iv) => (
                <div key={iv.intervalNumber} className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2">
                  <span className="text-sm">Interval {iv.intervalNumber}</span>
                  <div className="flex items-center gap-3 text-sm">
                    {iv.avgHR !== null && <span>Avg {Math.round(iv.avgHR)}</span>}
                    {iv.maxHR !== null && <span className="text-slate-400">Max {iv.maxHR}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {fitbitConnected && onSyncFitbit && (
            <button
              onClick={onSyncFitbit}
              className="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white active:scale-95 transition-transform"
            >
              Sync HR from Fitbit
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-800 py-3 text-sm font-bold text-white active:scale-95 transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
