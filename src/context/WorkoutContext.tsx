import { createContext, useContext, useState, type ReactNode } from 'react';
import type { TimerSettings } from '../types/timer';
import { DEFAULT_TIMER_SETTINGS } from '../types/timer';
import type { HRZoneConfig } from '../types/heartrate';
import { DEFAULT_HR_ZONE_CONFIG } from '../types/heartrate';

export type Tab = 'timer' | 'history' | 'settings';

interface AppSettings {
  timerSettings: TimerSettings;
  hrZoneConfig: HRZoneConfig;
  audioEnabled: boolean;
  vibrationEnabled: boolean;
}

interface WorkoutContextValue {
  tab: Tab;
  setTab: (tab: Tab) => void;
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

const STORAGE_KEY = 'four-by-four-settings';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultSettings;
}

function persistSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

const defaultSettings: AppSettings = {
  timerSettings: DEFAULT_TIMER_SETTINGS,
  hrZoneConfig: DEFAULT_HR_ZONE_CONFIG,
  audioEnabled: true,
  vibrationEnabled: true,
};

const WorkoutCtx = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<Tab>('timer');
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      persistSettings(next);
      return next;
    });
  };

  return (
    <WorkoutCtx.Provider value={{ tab, setTab, settings, updateSettings }}>
      {children}
    </WorkoutCtx.Provider>
  );
}

export function useWorkoutContext() {
  const ctx = useContext(WorkoutCtx);
  if (!ctx) throw new Error('useWorkoutContext must be used within WorkoutProvider');
  return ctx;
}
