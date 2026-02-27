import { useCallback, useEffect, useRef, useState } from 'react';
import type { HeartRateReading, HRZoneConfig } from '../types/heartrate';
import { getStoredClientId, getStoredClientSecret, getStoredTokens } from '../lib/fitbit-auth';
import { getIntradayHR } from '../lib/fitbit-api';
import { getZone } from '../lib/heart-rate-zones';
import type { HRZone } from '../types/heartrate';

const POLL_INTERVAL_MS = 15_000;

export function useFitbitHR(zoneConfig: HRZoneConfig, active: boolean) {
  const [currentBPM, setCurrentBPM] = useState<number | null>(null);
  const [readings, setReadings] = useState<HeartRateReading[]>([]);
  const [zone, setZone] = useState<HRZone | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTimestampRef = useRef<string>('');

  const poll = useCallback(async () => {
    const tokens = getStoredTokens();
    const clientId = getStoredClientId();
    const clientSecret = getStoredClientSecret();
    if (!tokens || !clientId || !clientSecret) return;

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    // Fetch last 2 minutes of data to catch recent readings
    const start = new Date(now.getTime() - 2 * 60_000);
    const startTime = start.toTimeString().slice(0, 8);
    const endTime = now.toTimeString().slice(0, 8);

    try {
      const data = await getIntradayHR(tokens, clientId, clientSecret, date, startTime, endTime);
      if (data.length === 0) return;

      const newReadings: HeartRateReading[] = [];
      for (const d of data) {
        const key = `${date}T${d.time}`;
        if (key > lastTimestampRef.current) {
          lastTimestampRef.current = key;
          newReadings.push({
            bpm: d.value,
            timestamp: new Date(key).getTime(),
          });
        }
      }

      if (newReadings.length > 0) {
        setReadings(prev => [...prev, ...newReadings].slice(-300));
        const latest = newReadings[newReadings.length - 1];
        setCurrentBPM(latest.bpm);
        setZone(getZone(latest.bpm, zoneConfig));
      }
    } catch {
      // Silently fail on polling errors
    }
  }, [zoneConfig]);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Poll immediately, then on interval
    poll();
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, poll]);

  const clearReadings = useCallback(() => {
    setReadings([]);
    setCurrentBPM(null);
    setZone(null);
    lastTimestampRef.current = '';
  }, []);

  const connected = getStoredTokens() !== null;

  return { currentBPM, readings, zone, connected, clearReadings };
}
