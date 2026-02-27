import { useCallback, useMemo, useRef, useState } from 'react';
import { Loader } from 'lucide-react';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { useTimer } from '../../hooks/useTimer';
import { useHeartRate } from '../../hooks/useHeartRate';
import { useFitbitHR } from '../../hooks/useFitbitHR';
import { useAudio } from '../../hooks/useAudio';
import { useVibration } from '../../hooks/useVibration';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useWorkoutStorage } from '../../hooks/useWorkoutStorage';
import { formatTime, generateId } from '../../lib/utils';
import { buildPhases } from '../../lib/timer-phases';
import type { Phase } from '../../types/timer';
import type { HeartRateReading } from '../../types/heartrate';
import type { IntervalStats, WorkoutRecord } from '../../types/workout';
import { CountdownRing } from './CountdownRing';
import { PhaseIndicator } from './PhaseIndicator';
import { IntervalProgress } from './IntervalProgress';
import { TimerControls } from './TimerControls';
import { WorkoutSummaryModal } from './WorkoutSummaryModal';
import { HeartRateDisplay } from '../heartrate/HeartRateDisplay';
import { HeartRateZoneBadge } from '../heartrate/HeartRateZoneBadge';
import { BluetoothConnectButton } from '../heartrate/BluetoothConnectButton';
import { HeartRateChart } from '../heartrate/HeartRateChart';

const DANGER_BPM = 175;

function timeAgo(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 10) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  return `${min}m ago`;
}

export function TimerScreen() {
  const { settings } = useWorkoutContext();
  const audio = useAudio();
  const vibration = useVibration();
  const wakeLock = useWakeLock();
  const { save } = useWorkoutStorage();
  const hr = useHeartRate(settings.hrZoneConfig);
  const fitbitHR = useFitbitHR(settings.hrZoneConfig, true);

  // Use Bluetooth HR if connected, otherwise fall back to Fitbit polling
  const liveHR = useMemo(() => {
    if (hr.connected) {
      return { bpm: hr.currentBPM, readings: hr.readings, zone: hr.zone, connected: true, source: 'ble' as const, lastUpdated: null as number | null, polling: false };
    }
    if (fitbitHR.connected) {
      return { bpm: fitbitHR.currentBPM, readings: fitbitHR.readings, zone: fitbitHR.zone, connected: true, source: 'fitbit' as const, lastUpdated: fitbitHR.lastUpdated, polling: fitbitHR.polling };
    }
    return { bpm: null, readings: [] as HeartRateReading[], zone: null, connected: false, source: null, lastUpdated: null as number | null, polling: false };
  }, [hr.connected, hr.currentBPM, hr.readings, hr.zone, fitbitHR.connected, fitbitHR.currentBPM, fitbitHR.readings, fitbitHR.zone, fitbitHR.lastUpdated, fitbitHR.polling]);

  const isDanger = (liveHR.bpm ?? 0) >= DANGER_BPM;

  const [completedWorkout, setCompletedWorkout] = useState<WorkoutRecord | null>(null);
  const workoutStartRef = useRef<number>(0);
  const intervalReadingsRef = useRef<Map<number, HeartRateReading[]>>(new Map());
  const phasesRef = useRef<Phase[]>(buildPhases(settings.timerSettings));

  const buildWorkoutRecord = useCallback((completed: boolean): WorkoutRecord => {
    const allReadings = hr.readings;
    const intervals: IntervalStats[] = [];

    for (const [intervalNum, readings] of intervalReadingsRef.current.entries()) {
      const bpms = readings.map(r => r.bpm);
      intervals.push({
        intervalNumber: intervalNum,
        avgHR: bpms.length > 0 ? bpms.reduce((a, b) => a + b, 0) / bpms.length : null,
        maxHR: bpms.length > 0 ? Math.max(...bpms) : null,
        timeInZoneSec: 0,
        readings,
      });
    }

    const allBpms = allReadings.map(r => r.bpm);

    return {
      id: generateId(),
      startedAt: workoutStartRef.current,
      finishedAt: Date.now(),
      durationSec: (Date.now() - workoutStartRef.current) / 1000,
      phases: phasesRef.current,
      completed,
      intervals,
      avgHR: allBpms.length > 0 ? allBpms.reduce((a, b) => a + b, 0) / allBpms.length : null,
      maxHR: allBpms.length > 0 ? Math.max(...allBpms) : null,
      allReadings,
      fitbitSynced: false,
    };
  }, [hr.readings]);

  const onPhaseChange = useCallback((phase: Phase, _prev: Phase | null) => {
    if (phase.type === 'interval') {
      if (settings.audioEnabled) {
        audio.play('interval-start');
        audio.beep(880, 0.3);
      }
      if (settings.vibrationEnabled) vibration.longBuzz();
    } else if (phase.type === 'recovery' || phase.type === 'cooldown') {
      if (settings.audioEnabled) {
        audio.play('interval-end');
        audio.beep(440, 0.2);
      }
      if (settings.vibrationEnabled) vibration.shortBuzz();
    }
  }, [audio, vibration, settings.audioEnabled, settings.vibrationEnabled]);

  const onFinish = useCallback(async () => {
    if (settings.audioEnabled) {
      audio.play('workout-complete');
      audio.beep(660, 0.15);
      setTimeout(() => audio.beep(880, 0.15), 200);
      setTimeout(() => audio.beep(1100, 0.3), 400);
    }
    if (settings.vibrationEnabled) vibration.longBuzz();
    await wakeLock.release();

    const record = buildWorkoutRecord(true);
    await save(record);
    setCompletedWorkout(record);
  }, [audio, vibration, wakeLock, settings, buildWorkoutRecord, save]);

  const timer = useTimer(settings.timerSettings, onPhaseChange, onFinish);
  phasesRef.current = timer.state.phases;

  const handleStart = async () => {
    await audio.unlock();
    await wakeLock.request();
    workoutStartRef.current = Date.now();
    intervalReadingsRef.current.clear();
    hr.clearReadings();
    timer.start();
  };

  const handleFinishEarly = async () => {
    await wakeLock.release();
    const record = buildWorkoutRecord(false);
    await save(record);
    setCompletedWorkout(record);
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      {/* HR Connection */}
      {timer.state.status === 'idle' && (
        <BluetoothConnectButton
          connected={hr.connected}
          connecting={hr.connecting}
          supported={hr.supported}
          error={hr.error}
          onConnect={hr.connect}
          onDisconnect={hr.disconnect}
        />
      )}

      {/* Heart Rate Display */}
      {liveHR.connected && liveHR.bpm !== null && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <HeartRateDisplay bpm={liveHR.bpm} connected={liveHR.connected} dangerThreshold={DANGER_BPM} />
            <HeartRateZoneBadge zone={liveHR.zone} />
          </div>
          {liveHR.source === 'fitbit' && (
            <span className="text-[10px] text-slate-500">
              via Fitbit · {liveHR.lastUpdated ? timeAgo(liveHR.lastUpdated) : 'syncing...'}
            </span>
          )}
        </div>
      )}

      {/* Fitbit waiting state */}
      {liveHR.source === 'fitbit' && liveHR.bpm === null && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader size={12} className="animate-spin" />
          Waiting for Fitbit heart rate data...
        </div>
      )}

      {/* Phase Label */}
      <PhaseIndicator phase={timer.currentPhase} />

      {/* Countdown Ring */}
      <CountdownRing
        progress={timer.state.status === 'idle' ? 0 : timer.progress}
        phaseType={timer.currentPhase?.type ?? null}
        danger={isDanger}
      >
        <div className={`text-5xl font-bold tabular-nums tracking-tight ${isDanger ? 'text-red-300' : ''}`}>
          {formatTime(timer.remainingInPhase)}
        </div>
        <div className="text-sm text-slate-400 mt-1">
          {formatTime(timer.totalRemaining)} total
        </div>
      </CountdownRing>

      {/* Phase Progress Bars */}
      {timer.state.status !== 'idle' && (
        <IntervalProgress
          phases={timer.state.phases}
          currentPhaseIndex={timer.state.currentPhaseIndex}
          phaseProgress={timer.progress}
        />
      )}

      {/* HR Sparkline */}
      {liveHR.readings.length > 1 && (
        <HeartRateChart
          readings={liveHR.readings}
          zoneConfig={settings.hrZoneConfig}
          width={280}
          height={50}
        />
      )}

      {/* Controls */}
      <TimerControls
        status={timer.state.status}
        onStart={handleStart}
        onPause={timer.pause}
        onResume={timer.resume}
        onReset={timer.reset}
        onFinish={handleFinishEarly}
      />

      {/* Summary Modal */}
      <WorkoutSummaryModal
        workout={completedWorkout}
        onClose={() => {
          setCompletedWorkout(null);
          timer.reset();
        }}
      />
    </div>
  );
}
