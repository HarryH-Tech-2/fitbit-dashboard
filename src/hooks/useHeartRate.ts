import { useCallback, useRef, useState } from 'react';
import type { HeartRateReading, HeartRateState, HRZoneConfig } from '../types/heartrate';
import { DEFAULT_HR_ZONE_CONFIG } from '../types/heartrate';
import { connectHeartRateMonitor, isWebBluetoothSupported, type BLEHeartRateConnection } from '../lib/bluetooth-hr';
import { getZone } from '../lib/heart-rate-zones';

export function useHeartRate(zoneConfig: HRZoneConfig = DEFAULT_HR_ZONE_CONFIG) {
  const [state, setState] = useState<HeartRateState>({
    connected: false,
    connecting: false,
    currentBPM: null,
    readings: [],
    zone: null,
    error: null,
  });

  const connectionRef = useRef<BLEHeartRateConnection | null>(null);

  const connect = useCallback(async () => {
    if (!isWebBluetoothSupported()) {
      setState(prev => ({ ...prev, error: 'Web Bluetooth is not supported in this browser.' }));
      return;
    }

    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      const conn = await connectHeartRateMonitor(
        (bpm) => {
          const reading: HeartRateReading = { bpm, timestamp: Date.now() };
          const zone = getZone(bpm, zoneConfig);
          setState(prev => ({
            ...prev,
            currentBPM: bpm,
            zone,
            readings: [...prev.readings, reading],
          }));
        },
        () => {
          connectionRef.current = null;
          setState(prev => ({
            ...prev,
            connected: false,
            connecting: false,
          }));
        },
      );
      connectionRef.current = conn;
      setState(prev => ({ ...prev, connected: true, connecting: false }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setState(prev => ({
        ...prev,
        connecting: false,
        error: message.includes('cancelled') ? null : message,
      }));
    }
  }, [zoneConfig]);

  const disconnect = useCallback(() => {
    connectionRef.current?.disconnect();
    connectionRef.current = null;
  }, []);

  const clearReadings = useCallback(() => {
    setState(prev => ({ ...prev, readings: [], currentBPM: null, zone: null }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    clearReadings,
    supported: isWebBluetoothSupported(),
  };
}
