import type { ExerciseLog, LastSetSummary, SetLog, WorkoutSession } from "./types";

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
  return formatDate(iso);
}

export function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function createEmptySets(targetSets: number, last?: LastSetSummary | null): SetLog[] {
  return Array.from({ length: targetSets }, (_, i) => ({
    setNumber: i + 1,
    weight: last?.weight ?? 0,
    reps: last?.reps ?? 0,
    completed: false,
  }));
}

export function getLastPerformance(
  sessions: WorkoutSession[],
  dayId: string,
  exerciseId: string
): LastSetSummary | null {
  const completed = sessions
    .filter((s) => s.completedAt && s.dayId === dayId)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  for (const session of completed) {
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;
    const done = ex.sets.filter((s) => s.completed && (s.weight > 0 || s.reps > 0));
    if (done.length === 0) continue;
    const best = done.reduce((a, b) => (b.weight >= a.weight ? b : a));
    return {
      weight: best.weight,
      reps: best.reps,
      date: session.completedAt!,
    };
  }
  return null;
}

export function getLastSessionDate(sessions: WorkoutSession[], dayId: string): string | null {
  const completed = sessions
    .filter((s) => s.completedAt && s.dayId === dayId)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  return completed[0]?.completedAt ?? null;
}

export function getMaxWeight(sets: SetLog[]): number {
  const done = sets.filter((s) => s.completed);
  if (done.length === 0) return 0;
  return Math.max(...done.map((s) => s.weight));
}

export function getVolume(sets: SetLog[]): number {
  return sets
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.weight * s.reps, 0);
}

export function getExerciseProgress(
  sessions: WorkoutSession[],
  exerciseId: string
): { date: string; maxWeight: number; volume: number }[] {
  return sessions
    .filter((s) => s.completedAt)
    .map((s) => {
      const ex = s.exercises.find((e) => e.exerciseId === exerciseId);
      if (!ex) return null;
      const maxWeight = getMaxWeight(ex.sets);
      const volume = getVolume(ex.sets);
      if (maxWeight === 0 && volume === 0) return null;
      return {
        date: s.completedAt!,
        maxWeight,
        volume,
      };
    })
    .filter((x): x is { date: string; maxWeight: number; volume: number } => x !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function isSessionComplete(exercises: ExerciseLog[]): boolean {
  return exercises.every((ex) => ex.sets.some((s) => s.completed));
}
