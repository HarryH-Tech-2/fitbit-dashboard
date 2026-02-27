import { useWorkoutContext } from '../../context/WorkoutContext';
import { useFitbit } from '../../hooks/useFitbit';
import { MaxHRSetting } from './MaxHRSetting';
import { TimerSettingsComponent } from './TimerSettings';
import { AudioSettings } from './AudioSettings';
import { FitbitConnectCard } from './FitbitConnectCard';

export function SettingsScreen() {
  const { settings, updateSettings } = useWorkoutContext();
  const fitbit = useFitbit();

  return (
    <div className="px-4 py-6 space-y-4">
      <TimerSettingsComponent
        settings={settings.timerSettings}
        onChange={(timerSettings) => updateSettings({ timerSettings })}
      />
      <MaxHRSetting
        config={settings.hrZoneConfig}
        onChange={(hrZoneConfig) => updateSettings({ hrZoneConfig })}
      />
      <AudioSettings
        audioEnabled={settings.audioEnabled}
        vibrationEnabled={settings.vibrationEnabled}
        onAudioToggle={(audioEnabled) => updateSettings({ audioEnabled })}
        onVibrationToggle={(vibrationEnabled) => updateSettings({ vibrationEnabled })}
      />
      <FitbitConnectCard
        connected={fitbit.connected}
        profile={fitbit.profile}
        clientId={fitbit.clientId}
        error={fitbit.error}
        onClientIdChange={fitbit.setClientId}
        onConnect={fitbit.connect}
        onDisconnect={fitbit.disconnect}
      />
    </div>
  );
}
