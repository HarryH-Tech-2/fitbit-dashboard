import { Bell, BellOff, Smartphone } from 'lucide-react';

interface Props {
  audioEnabled: boolean;
  vibrationEnabled: boolean;
  onAudioToggle: (enabled: boolean) => void;
  onVibrationToggle: (enabled: boolean) => void;
}

function Toggle({ enabled, onToggle, label, icon: Icon }: {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  label: string;
  icon: typeof Bell;
}) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className="flex items-center justify-between w-full py-2"
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className={enabled ? 'text-white' : 'text-slate-500'} />
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <div
        className={`w-10 h-6 rounded-full p-0.5 transition-colors ${enabled ? 'bg-zone-target' : 'bg-slate-700'}`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </div>
    </button>
  );
}

export function AudioSettings({ audioEnabled, vibrationEnabled, onAudioToggle, onVibrationToggle }: Props) {
  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Notifications</h3>
      <Toggle
        enabled={audioEnabled}
        onToggle={onAudioToggle}
        label="Sound Effects"
        icon={audioEnabled ? Bell : BellOff}
      />
      <Toggle
        enabled={vibrationEnabled}
        onToggle={onVibrationToggle}
        label="Vibration"
        icon={Smartphone}
      />
    </div>
  );
}
