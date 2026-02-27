export type HRZone = 'below' | 'target' | 'above';

export interface HeartRateReading {
  bpm: number;
  timestamp: number;
}

export interface HeartRateState {
  connected: boolean;
  connecting: boolean;
  currentBPM: number | null;
  readings: HeartRateReading[];
  zone: HRZone | null;
  error: string | null;
}

export interface HRZoneConfig {
  maxHR: number;
  targetLow: number;  // fraction of max HR, e.g. 0.85
  targetHigh: number; // fraction of max HR, e.g. 0.95
}

export const DEFAULT_HR_ZONE_CONFIG: HRZoneConfig = {
  maxHR: 190,
  targetLow: 0.85,
  targetHigh: 0.95,
};
