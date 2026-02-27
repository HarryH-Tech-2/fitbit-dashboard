import type { HRZone } from '../../types/heartrate';
import { zoneColorClass, zoneLabel } from '../../lib/heart-rate-zones';

interface Props {
  zone: HRZone | null;
}

export function HeartRateZoneBadge({ zone }: Props) {
  if (!zone) return null;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${zoneColorClass(zone)}`}>
      {zoneLabel(zone)}
    </span>
  );
}
