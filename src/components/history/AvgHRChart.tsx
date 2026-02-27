import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { WorkoutRecord } from '../../types/workout';

interface Props {
  workouts: WorkoutRecord[];
}

export function AvgHRChart({ workouts }: Props) {
  const data = workouts
    .filter(w => w.completed && w.intervals.some(iv => iv.avgHR !== null))
    .slice(-20)
    .reverse()
    .flatMap(w =>
      w.intervals
        .filter(iv => iv.avgHR !== null)
        .map(iv => ({
          name: `#${w.startedAt}-${iv.intervalNumber}`,
          label: `Int ${iv.intervalNumber}`,
          avgHR: Math.round(iv.avgHR!),
          date: new Date(w.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        })),
    );

  if (data.length === 0) {
    return <div className="text-sm text-slate-500 text-center py-4">No HR data yet</div>;
  }

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Avg HR per Interval</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 10, fill: '#94a3b8' }} width={35} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Line type="monotone" dataKey="avgHR" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
