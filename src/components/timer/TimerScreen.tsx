import { useCallback, useRef, useState } from 'react';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { useTimer } from '../../hooks/useTimer';
import { useHeartRate } from '../../hooks/useHeartRate';
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

export function TimerScreen() {
  const { settings } = useWorkoutContext();
  const audio = useAudio();
  const vibration = useVibration();
  const wakeLock = useWakeLock();
  const { save } = useWorkoutStorage();
  const hr = useHeartRate(settings.hrZoneConfig);

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
      {hr.connected && (
        <div className="flex items-center gap-3">
          <HeartRateDisplay bpm={hr.currentBPM} connected={hr.connected} />
          <HeartRateZoneBadge zone={hr.zone} />
        </div>
      )}

      {/* Phase Label */}
      <PhaseIndicator phase={timer.currentPhase} />

      {/* Countdown Ring */}
      <CountdownRing
        progress={timer.state.status === 'idle' ? 0 : timer.progress}
        phaseType={timer.currentPhase?.type ?? null}
      >
        <div className="text-5xl font-bold tabular-nums tracking-tight">
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
      {hr.readings.length > 1 && timer.state.status !== 'idle' && (
        <HeartRateChart
          readings={hr.readings}
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
