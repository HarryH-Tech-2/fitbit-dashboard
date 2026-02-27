import { CheckCircle, Clock, Heart, Trash2, XCircle } from 'lucide-react';
import type { WorkoutRecord } from '../../types/workout';
import { formatTime } from '../../lib/utils';

interface Props {
  workout: WorkoutRecord;
  onDelete: (id: string) => void;
}

export function WorkoutCard({ workout, onDelete }: Props) {
  const date = new Date(workout.startedAt);
  const dateStr = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-medium">{dateStr}</div>
          <div className="text-xs text-slate-400">{timeStr}</div>
        </div>
        <div className="flex items-center gap-2">
          {workout.completed ? (
            <CheckCircle size={16} className="text-zone-target" />
          ) : (
            <XCircle size={16} className="text-slate-500" />
          )}
          <button
            onClick={() => onDelete(workout.id)}
            className="p-1 text-slate-600 hover:text-interval transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-slate-300">
          <Clock size={14} />
          {formatTime(workout.durationSec)}
        </div>
        {workout.avgHR !== null && (
          <div className="flex items-center gap-1 text-slate-300">
            <Heart size={14} className="text-interval" />
            {Math.round(workout.avgHR)} avg
          </div>
        )}
        <div className="text-slate-400">
          {workout.intervals.length} intervals
        </div>
      </div>
    </div>
  );
}
