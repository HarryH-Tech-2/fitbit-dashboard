import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { FitbitDailyHR } from '../../types/fitbit';

interface Props {
  dailyHR: FitbitDailyHR[];
}

export function RestingHRChart({ dailyHR }: Props) {
  const data = dailyHR
    .filter(d => d.restingHeartRate != null)
    .map(d => ({
      date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      rhr: d.restingHeartRate,
    }));

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Resting Heart Rate</h3>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            interval={Math.max(0, Math.floor(data.length / 6) - 1)}
          />
          <YAxis
            domain={['dataMin - 3', 'dataMax + 3']}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            width={30}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value) => [`${value} bpm`, 'Resting HR']}
          />
          <Line
            type="monotone"
            dataKey="rhr"
            stroke="#2dd4bf"
            strokeWidth={2}
            dot={false}
            name="Resting HR"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
