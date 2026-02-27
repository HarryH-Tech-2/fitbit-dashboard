import type { HRZone, HRZoneConfig } from '../types/heartrate';

export function getZone(bpm: number, config: HRZoneConfig): HRZone {
  const low = config.maxHR * config.targetLow;
  const high = config.maxHR * config.targetHigh;
  if (bpm < low) return 'below';
  if (bpm > high) return 'above';
  return 'target';
}

export function zoneLabel(zone: HRZone): string {
  switch (zone) {
    case 'below': return 'Below Zone';
    case 'target': return 'In Zone';
    case 'above': return 'Above Zone';
  }
}

export function zoneColorClass(zone: HRZone): string {
  switch (zone) {
    case 'below': return 'text-zone-below bg-zone-below/20';
    case 'target': return 'text-zone-target bg-zone-target/20';
    case 'above': return 'text-zone-above bg-zone-above/20';
  }
}

export function maxHRFromAge(age: number): number {
  return Math.round(220 - age);
}
