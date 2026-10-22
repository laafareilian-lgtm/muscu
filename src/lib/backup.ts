import type { WorkoutSession } from "./types";
import {
  loadActiveSession,
  loadSessions,
  loadSettings,
  saveActiveSession,
  saveSessions,
  saveSettings,
  type AppSettings,
} from "./storage";

export const BACKUP_VERSION = 1;

export interface MuscuBackup {
  version: number;
  exportedAt: string;
  sessions: WorkoutSession[];
  settings: AppSettings;
  activeSession: WorkoutSession | null;
}

export function buildBackup(): MuscuBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    sessions: loadSessions(),
    settings: loadSettings(),
    activeSession: loadActiveSession(),
  };
}

/** Télécharge un fichier JSON sur l'appareil. */
export function downloadBackup(): void {
  const backup = buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `muscu-backup-${stamp}.json`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseBackup(raw: string): MuscuBackup {
  const data = JSON.parse(raw) as Partial<MuscuBackup>;
  if (!data || typeof data !== "object") {
    throw new Error("Fichier invalide");
  }
  if (!Array.isArray(data.sessions)) {
    throw new Error("Pas de séances dans ce fichier");
  }
  return {
    version: typeof data.version === "number" ? data.version : BACKUP_VERSION,
    exportedAt:
      typeof data.exportedAt === "string"
        ? data.exportedAt
        : new Date().toISOString(),
    sessions: data.sessions as WorkoutSession[],
    settings: data.settings
      ? { ...loadSettings(), ...data.settings }
      : loadSettings(),
    activeSession: data.activeSession ?? null,
  };
}

/** Remplace les données locales par le backup. */
export function applyBackup(backup: MuscuBackup): void {
  saveSessions(backup.sessions);
  saveSettings(backup.settings);
  saveActiveSession(backup.activeSession);
}

export async function readBackupFile(file: File): Promise<MuscuBackup> {
  const text = await file.text();
  return parseBackup(text);
}
