import type { TimerSettings as TimerSettingsType } from '../../types/timer';

interface Props {
  settings: TimerSettingsType;
  onChange: (settings: TimerSettingsType) => void;
}

function DurationInput({ label, valueSec, onChange }: { label: string; valueSec: number; onChange: (sec: number) => void }) {
  const mins = Math.floor(valueSec / 60);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={mins}
          onChange={(e) => {
            const m = parseInt(e.target.value);
            if (m >= 0 && m <= 60) onChange(m * 60);
          }}
          className="w-16 rounded-lg bg-slate-800 px-3 py-2 text-sm text-white text-center outline-none focus:ring-1 focus:ring-slate-600"
          min={0}
          max={60}
        />
        <span className="text-xs text-slate-400">min</span>
      </div>
    </div>
  );
}

export function TimerSettingsComponent({ settings, onChange }: Props) {
  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Timer Durations</h3>
      <div className="space-y-3">
        <DurationInput
          label="Warm Up"
          valueSec={settings.warmupSec}
          onChange={(sec) => onChange({ ...settings, warmupSec: sec })}
        />
        <DurationInput
          label="Interval"
          valueSec={settings.intervalSec}
          onChange={(sec) => onChange({ ...settings, intervalSec: sec })}
        />
        <DurationInput
          label="Recovery"
          valueSec={settings.recoverySec}
          onChange={(sec) => onChange({ ...settings, recoverySec: sec })}
        />
        <DurationInput
          label="Cool Down"
          valueSec={settings.cooldownSec}
          onChange={(sec) => onChange({ ...settings, cooldownSec: sec })}
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Intervals</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={settings.intervalCount}
              onChange={(e) => {
                const n = parseInt(e.target.value);
                if (n >= 1 && n <= 10) onChange({ ...settings, intervalCount: n });
              }}
              className="w-16 rounded-lg bg-slate-800 px-3 py-2 text-sm text-white text-center outline-none focus:ring-1 focus:ring-slate-600"
              min={1}
              max={10}
            />
            <span className="text-xs text-slate-400">×</span>
          </div>
        </div>
      </div>
    </div>
  );
}
