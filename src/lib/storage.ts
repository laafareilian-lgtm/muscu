import type { WorkoutSession } from "./types";

const SESSIONS_KEY = "muscu-sessions";
const ACTIVE_KEY = "muscu-active-session";
const SETTINGS_KEY = "muscu-settings";

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultRestSeconds: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  defaultRestSeconds: 90,
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadSessions(): WorkoutSession[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WorkoutSession[];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: WorkoutSession[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function loadActiveSession(): WorkoutSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkoutSession;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: WorkoutSession | null): void {
  if (!isBrowser()) return;
  if (session === null) {
    localStorage.removeItem(ACTIVE_KEY);
  } else {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
  }
}

export function loadSettings(): AppSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (!isBrowser()) return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
