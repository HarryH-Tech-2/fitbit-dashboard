import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { WorkoutRecord } from '../../types/workout';

interface Props {
  workouts: WorkoutRecord[];
}

function getWeekLabel(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getWeekKey(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`;
}

export function FrequencyChart({ workouts }: Props) {
  const weeks = new Map<string, { label: string; count: number }>();

  // Show last 8 weeks
  for (let i = 0; i < 8; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const key = getWeekKey(d);
    if (!weeks.has(key)) {
      weeks.set(key, { label: getWeekLabel(d), count: 0 });
    }
  }

  for (const w of workouts.filter(w => w.completed)) {
    const d = new Date(w.startedAt);
    const key = getWeekKey(d);
    const entry = weeks.get(key);
    if (entry) entry.count++;
  }

  const data = Array.from(weeks.values()).reverse();

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Workouts / Week</h3>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data}>
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} width={20} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Workouts" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
