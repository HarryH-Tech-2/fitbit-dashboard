import { useCallback, useEffect, useRef, useState } from 'react';
import type { HeartRateReading, HRZoneConfig } from '../types/heartrate';
import { getStoredClientId, getStoredClientSecret, getStoredTokens } from '../lib/fitbit-auth';
import { getIntradayHR } from '../lib/fitbit-api';
import { getZone } from '../lib/heart-rate-zones';
import type { HRZone } from '../types/heartrate';

const POLL_INTERVAL_MS = 10_000;
const LOOKBACK_MINUTES = 15;

export function useFitbitHR(zoneConfig: HRZoneConfig, active: boolean) {
  const [currentBPM, setCurrentBPM] = useState<number | null>(null);
  const [readings, setReadings] = useState<HeartRateReading[]>([]);
  const [zone, setZone] = useState<HRZone | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenTimesRef = useRef<Set<string>>(new Set());

  const poll = useCallback(async () => {
    const tokens = getStoredTokens();
    const clientId = getStoredClientId();
    const clientSecret = getStoredClientSecret();
    if (!tokens || !clientId || !clientSecret) return;

    setPolling(true);

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const start = new Date(now.getTime() - LOOKBACK_MINUTES * 60_000);
    const startTime = start.toTimeString().slice(0, 8);
    const endTime = now.toTimeString().slice(0, 8);

    try {
      const data = await getIntradayHR(tokens, clientId, clientSecret, date, startTime, endTime);
      if (data.length === 0) return;

      const newReadings: HeartRateReading[] = [];
      for (const d of data) {
        const key = `${date}T${d.time}`;
        if (!seenTimesRef.current.has(key)) {
          seenTimesRef.current.add(key);
          newReadings.push({
            bpm: d.value,
            timestamp: new Date(key).getTime(),
          });
        }
      }

      // Always use the most recent reading from the full dataset
      const latest = data[data.length - 1];
      const latestBPM = latest.value;
      setCurrentBPM(latestBPM);
      setZone(getZone(latestBPM, zoneConfig));
      setLastUpdated(new Date(`${date}T${latest.time}`).getTime());

      if (newReadings.length > 0) {
        setReadings(prev => [...prev, ...newReadings].slice(-300));
      }
    } catch {
      // Silently fail on polling errors
    } finally {
      setPolling(false);
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
    setLastUpdated(null);
    seenTimesRef.current.clear();
  }, []);

  const connected = getStoredTokens() !== null;

  return { currentBPM, readings, zone, connected, lastUpdated, polling, clearReadings };
}
