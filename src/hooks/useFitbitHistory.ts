import { useEffect, useState } from 'react';
import type { FitbitActivity, FitbitDailyHR } from '../types/fitbit';
import { getStoredClientId, getStoredClientSecret, getStoredTokens } from '../lib/fitbit-auth';
import { getActivityLog, getHeartRateTimeSeries } from '../lib/fitbit-api';

export function useFitbitHistory() {
  const [activities, setActivities] = useState<FitbitActivity[]>([]);
  const [dailyHR, setDailyHR] = useState<FitbitDailyHR[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokens = getStoredTokens();
    const clientId = getStoredClientId();
    const clientSecret = getStoredClientSecret();
    if (!tokens || !clientId || !clientSecret) return;

    setLoading(true);
    setError(null);

    Promise.all([
      getActivityLog(tokens, clientId, clientSecret).catch(() => [] as FitbitActivity[]),
      getHeartRateTimeSeries(tokens, clientId, clientSecret).catch(() => [] as FitbitDailyHR[]),
    ])
      .then(([acts, hr]) => {
        setActivities(acts);
        setDailyHR(hr);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { activities, dailyHR, loading, error };
}
