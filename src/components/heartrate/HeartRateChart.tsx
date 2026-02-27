import type { HeartRateReading, HRZoneConfig } from '../../types/heartrate';

interface Props {
  readings: HeartRateReading[];
  zoneConfig: HRZoneConfig;
  width?: number;
  height?: number;
}

export function HeartRateChart({ readings, zoneConfig, width = 300, height = 60 }: Props) {
  if (readings.length < 2) return null;

  const recent = readings.slice(-60);
  const minBPM = Math.min(...recent.map(r => r.bpm)) - 5;
  const maxBPM = Math.max(...recent.map(r => r.bpm)) + 5;
  const range = maxBPM - minBPM || 1;

  const points = recent.map((r, i) => {
    const x = (i / (recent.length - 1)) * width;
    const y = height - ((r.bpm - minBPM) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const targetLow = zoneConfig.maxHR * zoneConfig.targetLow;
  const targetHigh = zoneConfig.maxHR * zoneConfig.targetHigh;
  const yLow = height - ((targetLow - minBPM) / range) * height;
  const yHigh = height - ((targetHigh - minBPM) / range) * height;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {targetLow >= minBPM && targetHigh <= maxBPM && (
        <rect
          x={0}
          y={Math.max(0, yHigh)}
          width={width}
          height={Math.max(0, yLow - yHigh)}
          fill="rgb(34 197 94 / 0.1)"
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke="rgb(239 68 68)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}
