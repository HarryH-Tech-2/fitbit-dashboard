export interface FitbitTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

export interface FitbitConfig {
  clientId: string;
}

export interface FitbitIntradayHR {
  time: string;
  value: number;
}

export interface FitbitProfile {
  displayName: string;
  avatar: string;
}
