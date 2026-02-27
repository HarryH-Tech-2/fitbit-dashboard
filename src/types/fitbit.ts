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

export interface FitbitActivity {
  logId: number;
  activityName: string;
  startDate: string;
  startTime: string;
  activeDurationMs: number;
  calories: number;
  averageHeartRate: number | null;
  steps: number | null;
  distance: number | null;
  distanceUnit: string | null;
}

export interface FitbitDailyHR {
  date: string;
  restingHeartRate: number | null;
  zones: { name: string; minutes: number }[];
}
