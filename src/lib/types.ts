export interface ExerciseConfig {
  id: string;
  name: string;
  targetSets: number;
  /** Durée de repos par défaut après une série (secondes) */
  restSeconds: number;
}

export interface DayConfig {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  exercises: ExerciseConfig[];
}

export interface SetLog {
  setNumber: number;
  /** null = champ vide (saisie libre) */
  weight: number | null;
  /** null = champ vide (saisie libre) */
  reps: number | null;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface WorkoutSession {
  id: string;
  dayId: string;
  dayName: string;
  startedAt: string;
  completedAt: string | null;
  exercises: ExerciseLog[];
}

export interface LastSetSummary {
  weight: number;
  reps: number;
  date: string;
}
