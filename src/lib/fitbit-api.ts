import type { FitbitActivity, FitbitDailyHR, FitbitIntradayHR, FitbitProfile, FitbitTokens } from '../types/fitbit';
import { refreshAccessToken, storeTokens } from './fitbit-auth';

const BASE_URL = 'https://api.fitbit.com';

async function apiFetch(
  url: string,
  tokens: FitbitTokens,
  clientId: string,
  clientSecret: string,
): Promise<Response> {
  let accessToken = tokens.accessToken;

  // Refresh if expired
  if (Date.now() >= tokens.expiresAt - 60_000) {
    const newTokens = await refreshAccessToken(clientId, clientSecret, tokens.refreshToken);
    storeTokens(newTokens);
    accessToken = newTokens.accessToken;
  }

  return fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getProfile(tokens: FitbitTokens, clientId: string, clientSecret: string): Promise<FitbitProfile> {
  const res = await apiFetch(`${BASE_URL}/1/user/-/profile.json`, tokens, clientId, clientSecret);
  if (!res.ok) throw new Error('Failed to fetch profile');
  const data = await res.json();
  return {
    displayName: data.user.displayName,
    avatar: data.user.avatar,
  };
}

export async function getIntradayHR(
  tokens: FitbitTokens,
  clientId: string,
  clientSecret: string,
  date: string,
  startTime: string,
  endTime: string,
): Promise<FitbitIntradayHR[]> {
  const url = `${BASE_URL}/1/user/-/activities/heart/date/${date}/1d/1sec/time/${startTime}/${endTime}.json`;
  const res = await apiFetch(url, tokens, clientId, clientSecret);
  if (!res.ok) throw new Error('Failed to fetch intraday HR');
  const data = await res.json();
  return data['activities-heart-intraday']?.dataset ?? [];
}

export async function getActivityLog(
  tokens: FitbitTokens,
  clientId: string,
  clientSecret: string,
  limit = 50,
): Promise<FitbitActivity[]> {
  const afterDate = new Date();
  afterDate.setFullYear(afterDate.getFullYear() - 1);
  const dateStr = afterDate.toISOString().split('T')[0];
  const url = `${BASE_URL}/1/user/-/activities/list.json?afterDate=${dateStr}&sort=desc&limit=${limit}&offset=0`;
  const res = await apiFetch(url, tokens, clientId, clientSecret);
  if (!res.ok) throw new Error('Failed to fetch activity log');
  const data = await res.json();
  return (data.activities ?? []).map((a: Record<string, unknown>) => ({
    logId: a.logId,
    activityName: a.activityName,
    startDate: a.startDate,
    startTime: a.startTime,
    activeDurationMs: a.activeDuration,
    calories: a.calories ?? 0,
    averageHeartRate: a.averageHeartRate ?? null,
    steps: a.steps ?? null,
    distance: a.distance != null ? Number(a.distance) : null,
    distanceUnit: a.distanceUnit ?? null,
  }));
}

export async function getHeartRateTimeSeries(
  tokens: FitbitTokens,
  clientId: string,
  clientSecret: string,
  period = '1m',
): Promise<FitbitDailyHR[]> {
  const url = `${BASE_URL}/1/user/-/activities/heart/date/today/${period}.json`;
  const res = await apiFetch(url, tokens, clientId, clientSecret);
  if (!res.ok) throw new Error('Failed to fetch HR time series');
  const data = await res.json();
  return (data['activities-heart'] ?? []).map((d: Record<string, unknown>) => {
    const value = d.value as Record<string, unknown> | undefined;
    const zones = (value?.heartRateZones as Array<Record<string, unknown>>) ?? [];
    return {
      date: d.dateTime as string,
      restingHeartRate: (value?.restingHeartRate as number) ?? null,
      zones: zones.map(z => ({ name: z.name as string, minutes: (z.minutes as number) ?? 0 })),
    };
  });
}
