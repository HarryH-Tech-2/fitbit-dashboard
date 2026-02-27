import { Activity, Clock, Flame, Heart, Footprints } from 'lucide-react';
import type { FitbitActivity } from '../../types/fitbit';

interface Props {
  activity: FitbitActivity;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function FitbitActivityCard({ activity }: Props) {
  const date = new Date(`${activity.startDate}T${activity.startTime}`);
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
    <div className="rounded-xl bg-slate-900 p-4 border-l-2 border-teal-500/50">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Activity size={14} className="text-teal-400" />
            <span className="text-sm font-medium">{activity.activityName}</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{dateStr} · {timeStr}</div>
        </div>
        <span className="rounded bg-teal-900/40 px-1.5 py-0.5 text-[10px] text-teal-400">Fitbit</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <div className="flex items-center gap-1 text-slate-300">
          <Clock size={14} />
          {formatDuration(activity.activeDurationMs)}
        </div>
        {activity.averageHeartRate != null && (
          <div className="flex items-center gap-1 text-slate-300">
            <Heart size={14} className="text-interval" />
            {activity.averageHeartRate} avg
          </div>
        )}
        {activity.calories > 0 && (
          <div className="flex items-center gap-1 text-slate-300">
            <Flame size={14} className="text-warmup" />
            {activity.calories} cal
          </div>
        )}
        {activity.steps != null && activity.steps > 0 && (
          <div className="flex items-center gap-1 text-slate-300">
            <Footprints size={14} className="text-cooldown" />
            {activity.steps.toLocaleString()}
          </div>
        )}
        {activity.distance != null && activity.distance > 0 && (
          <div className="text-slate-400 text-xs">
            {activity.distance.toFixed(2)} {activity.distanceUnit ?? 'km'}
          </div>
        )}
      </div>
    </div>
  );
}
