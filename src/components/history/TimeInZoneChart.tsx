import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { WorkoutRecord } from '../../types/workout';
import type { HRZoneConfig } from '../../types/heartrate';
import { getZone } from '../../lib/heart-rate-zones';

interface Props {
  workouts: WorkoutRecord[];
  zoneConfig: HRZoneConfig;
}

export function TimeInZoneChart({ workouts, zoneConfig }: Props) {
  const data = workouts
    .filter(w => w.completed && w.allReadings.length > 0)
    .slice(-10)
    .reverse()
    .map(w => {
      let below = 0, target = 0, above = 0;
      for (const r of w.allReadings) {
        const zone = getZone(r.bpm, zoneConfig);
        if (zone === 'below') below++;
        else if (zone === 'target') target++;
        else above++;
      }
      const total = below + target + above || 1;
      return {
        date: new Date(w.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        below: Math.round((below / total) * 100),
        target: Math.round((target / total) * 100),
        above: Math.round((above / total) * 100),
      };
    });

  if (data.length === 0) {
    return <div className="text-sm text-slate-500 text-center py-4">No zone data yet</div>;
  }

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Time in Zone (%)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={30} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Bar dataKey="below" stackId="a" fill="#3b82f6" name="Below" />
          <Bar dataKey="target" stackId="a" fill="#22c55e" name="Target" />
          <Bar dataKey="above" stackId="a" fill="#ef4444" name="Above" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
