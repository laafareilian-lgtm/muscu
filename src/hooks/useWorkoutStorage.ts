"use client";

import { useCallback, useEffect, useState } from "react";
import type { DayConfig, WorkoutSession } from "@/lib/types";
import {
  loadActiveSession,
  loadSessions,
  loadSettings,
  saveActiveSession,
  saveSessions,
  saveSettings,
  type AppSettings,
} from "@/lib/storage";
import { createEmptySets, getLastPerformance, uid } from "@/lib/utils";

export function useWorkoutStorage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessions(loadSessions());
    setActiveSession(loadActiveSession());
    setSettingsState(loadSettings());
    setReady(true);
  }, []);

  const persistSessions = useCallback((next: WorkoutSession[]) => {
    setSessions(next);
    saveSessions(next);
  }, []);

  const persistActive = useCallback((session: WorkoutSession | null) => {
    setActiveSession(session);
    saveActiveSession(session);
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const startSession = useCallback(
    (day: DayConfig): WorkoutSession => {
      const existing = loadActiveSession();
      if (existing && existing.dayId === day.id && !existing.completedAt) {
        setActiveSession(existing);
        return existing;
      }

      const allSessions = loadSessions();
      const session: WorkoutSession = {
        id: uid(),
        dayId: day.id,
        dayName: day.name,
        startedAt: new Date().toISOString(),
        completedAt: null,
        exercises: day.exercises.map((ex) => {
          const last = getLastPerformance(allSessions, day.id, ex.id);
          return {
            exerciseId: ex.id,
            exerciseName: ex.name,
            sets: createEmptySets(ex.targetSets, last),
          };
        }),
      };
      persistActive(session);
      return session;
    },
    [persistActive]
  );

  const updateActiveSession = useCallback(
    (updater: (prev: WorkoutSession) => WorkoutSession) => {
      setActiveSession((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        saveActiveSession(next);
        return next;
      });
    },
    []
  );

  const completeSession = useCallback(() => {
    const current = loadActiveSession();
    if (!current) return;

    const finished: WorkoutSession = {
      ...current,
      completedAt: new Date().toISOString(),
    };

    const all = loadSessions();
    persistSessions([finished, ...all.filter((s) => s.id !== finished.id)]);
    persistActive(null);
    return finished;
  }, [persistActive, persistSessions]);

  const discardActiveSession = useCallback(() => {
    persistActive(null);
  }, [persistActive]);

  const deleteSession = useCallback(
    (id: string) => {
      persistSessions(sessions.filter((s) => s.id !== id));
    },
    [sessions, persistSessions]
  );

  return {
    ready,
    sessions,
    activeSession,
    settings,
    updateSettings,
    startSession,
    updateActiveSession,
    completeSession,
    discardActiveSession,
    deleteSession,
  };
}
