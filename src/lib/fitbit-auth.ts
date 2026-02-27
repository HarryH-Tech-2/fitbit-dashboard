import type { FitbitTokens } from '../types/fitbit';

const FITBIT_AUTH_URL = 'https://www.fitbit.com/oauth2/authorize';
const FITBIT_TOKEN_URL = 'https://api.fitbit.com/oauth2/token';
const REDIRECT_URI = window.location.origin + window.location.pathname;
const SCOPES = 'heartrate profile';
const STORAGE_KEY = 'fitbit-tokens';
const VERIFIER_KEY = 'fitbit-pkce-verifier';
const CLIENT_ID_KEY = 'fitbit-client-id';

function generateRandomString(length: number): string {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(36).padStart(2, '0')).join('').slice(0, length);
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(plain));
}

function base64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function getStoredClientId(): string {
  return localStorage.getItem(CLIENT_ID_KEY) ?? '';
}

export function setStoredClientId(id: string): void {
  localStorage.setItem(CLIENT_ID_KEY, id);
}

export function getStoredTokens(): FitbitTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeTokens(tokens: FitbitTokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function startAuthFlow(clientId: string): Promise<void> {
  const verifier = generateRandomString(64);
  localStorage.setItem(VERIFIER_KEY, verifier);

  const challenge = base64url(await sha256(verifier));

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${FITBIT_AUTH_URL}?${params}`;
}

export async function handleOAuthCallback(code: string, clientId: string): Promise<FitbitTokens> {
  const verifier = localStorage.getItem(VERIFIER_KEY);
  if (!verifier) throw new Error('PKCE verifier not found');
  localStorage.removeItem(VERIFIER_KEY);

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
    code,
    code_verifier: verifier,
  });

  const res = await fetch(FITBIT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(clientId + ':')}`,
    },
    body,
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.errors?.[0]?.message || data?.error_description || 'Token exchange failed';
    throw new Error(msg);
  }

  const tokens: FitbitTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    userId: data.user_id,
  };

  storeTokens(tokens);
  return tokens;
}

export async function refreshAccessToken(clientId: string, refreshToken: string): Promise<FitbitTokens> {
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const res = await fetch(FITBIT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(clientId + ':')}`,
    },
    body,
  });

  if (!res.ok) throw new Error('Token refresh failed');
  const data = await res.json();

  const tokens: FitbitTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    userId: data.user_id,
  };

  storeTokens(tokens);
  return tokens;
}
