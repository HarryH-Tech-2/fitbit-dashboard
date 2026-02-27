import { useCallback, useEffect, useState } from 'react';
import type { FitbitTokens, FitbitProfile } from '../types/fitbit';
import {
  clearTokens,
  getStoredClientId,
  getStoredTokens,
  handleOAuthCallback,
  setStoredClientId,
  startAuthFlow,
} from '../lib/fitbit-auth';
import { getProfile, getIntradayHR } from '../lib/fitbit-api';
import type { HeartRateReading } from '../types/heartrate';

export function useFitbit() {
  const [tokens, setTokens] = useState<FitbitTokens | null>(getStoredTokens);
  const [clientId, setClientIdState] = useState(getStoredClientId);
  const [profile, setProfile] = useState<FitbitProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connected = tokens !== null;

  const setClientId = useCallback((id: string) => {
    setStoredClientId(id);
    setClientIdState(id);
  }, []);

  const connect = useCallback(() => {
    if (!clientId) {
      setError('Enter your Fitbit Client ID first');
      return;
    }
    startAuthFlow(clientId);
  }, [clientId]);

  const disconnect = useCallback(() => {
    clearTokens();
    setTokens(null);
    setProfile(null);
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;

    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);

    const id = getStoredClientId();
    if (!id) return;

    handleOAuthCallback(code, id)
      .then(t => setTokens(t))
      .catch(e => setError(e.message));
  }, []);

  // Fetch profile when tokens available
  useEffect(() => {
    if (!tokens || !clientId) return;
    getProfile(tokens, clientId)
      .then(p => setProfile(p))
      .catch(() => { /* silently fail */ });
  }, [tokens, clientId]);

  const fetchWorkoutHR = useCallback(async (
    startedAt: number,
    finishedAt: number,
  ): Promise<HeartRateReading[]> => {
    if (!tokens || !clientId) throw new Error('Not connected');

    const start = new Date(startedAt);
    const end = new Date(finishedAt);
    const date = start.toISOString().split('T')[0];
    const startTime = start.toTimeString().slice(0, 8);
    const endTime = end.toTimeString().slice(0, 8);

    const data = await getIntradayHR(tokens, clientId, date, startTime, endTime);
    return data.map(d => ({
      bpm: d.value,
      timestamp: new Date(`${date}T${d.time}`).getTime(),
    }));
  }, [tokens, clientId]);

  return {
    connected,
    tokens,
    clientId,
    setClientId,
    profile,
    connect,
    disconnect,
    fetchWorkoutHR,
    error,
  };
}
