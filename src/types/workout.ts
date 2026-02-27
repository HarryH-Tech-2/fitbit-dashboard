import type { HeartRateReading } from './heartrate';
import type { Phase } from './timer';

export interface IntervalStats {
  intervalNumber: number;
  avgHR: number | null;
  maxHR: number | null;
  timeInZoneSec: number;
  readings: HeartRateReading[];
}

export interface WorkoutRecord {
  id: string;
  startedAt: number;
  finishedAt: number;
  durationSec: number;
  phases: Phase[];
  completed: boolean;
  intervals: IntervalStats[];
  avgHR: number | null;
  maxHR: number | null;
  allReadings: HeartRateReading[];
  fitbitSynced: boolean;
}
