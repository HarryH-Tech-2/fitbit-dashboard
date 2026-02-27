import type { FitbitIntradayHR, FitbitProfile, FitbitTokens } from '../types/fitbit';
import { refreshAccessToken, storeTokens } from './fitbit-auth';

const BASE_URL = 'https://api.fitbit.com';

async function apiFetch(
  url: string,
  tokens: FitbitTokens,
  clientId: string,
): Promise<Response> {
  let accessToken = tokens.accessToken;

  // Refresh if expired
  if (Date.now() >= tokens.expiresAt - 60_000) {
    const newTokens = await refreshAccessToken(clientId, tokens.refreshToken);
    storeTokens(newTokens);
    accessToken = newTokens.accessToken;
  }

  return fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getProfile(tokens: FitbitTokens, clientId: string): Promise<FitbitProfile> {
  const res = await apiFetch(`${BASE_URL}/1/user/-/profile.json`, tokens, clientId);
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
  date: string,
  startTime: string,
  endTime: string,
): Promise<FitbitIntradayHR[]> {
  const url = `${BASE_URL}/1/user/-/activities/heart/date/${date}/1d/1sec/time/${startTime}/${endTime}.json`;
  const res = await apiFetch(url, tokens, clientId);
  if (!res.ok) throw new Error('Failed to fetch intraday HR');
  const data = await res.json();
  return data['activities-heart-intraday']?.dataset ?? [];
}
