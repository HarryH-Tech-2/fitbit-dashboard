import { useState } from 'react';
import type { HRZoneConfig } from '../../types/heartrate';
import { maxHRFromAge } from '../../lib/heart-rate-zones';

interface Props {
  config: HRZoneConfig;
  onChange: (config: HRZoneConfig) => void;
}

export function MaxHRSetting({ config, onChange }: Props) {
  const [mode, setMode] = useState<'age' | 'manual'>('manual');
  const [age, setAge] = useState('');

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Heart Rate Zones</h3>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMode('age')}
          className={`flex-1 rounded-lg py-2 text-xs font-medium ${mode === 'age' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          From Age
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 rounded-lg py-2 text-xs font-medium ${mode === 'manual' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          Manual
        </button>
      </div>

      {mode === 'age' ? (
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-300">Age:</label>
          <input
            type="number"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              const a = parseInt(e.target.value);
              if (a > 0 && a < 120) {
                onChange({ ...config, maxHR: maxHRFromAge(a) });
              }
            }}
            className="w-20 rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-slate-600"
            placeholder="30"
            min={1}
            max={120}
          />
          <span className="text-sm text-slate-400">= Max HR {config.maxHR}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-300">Max HR:</label>
          <input
            type="number"
            value={config.maxHR}
            onChange={(e) => {
              const hr = parseInt(e.target.value);
              if (hr > 0 && hr < 250) {
                onChange({ ...config, maxHR: hr });
              }
            }}
            className="w-20 rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-slate-600"
            min={100}
            max={250}
          />
          <span className="text-sm text-slate-400">BPM</span>
        </div>
      )}

      <div className="mt-3 text-xs text-slate-500">
        Target zone: {Math.round(config.maxHR * config.targetLow)}–{Math.round(config.maxHR * config.targetHigh)} BPM ({Math.round(config.targetLow * 100)}–{Math.round(config.targetHigh * 100)}%)
      </div>
    </div>
  );
}
