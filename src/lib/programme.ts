import type { DayConfig } from "./types";

/**
 * Programme d'entraînement — Lundi → Samedi (Dimanche = repos).
 * Modifiez ce fichier pour ajuster jours, exercices, séries et repos.
 */
export const PROGRAMME: DayConfig[] = [
  {
    id: "lundi",
    name: "Lundi",
    shortName: "LUN",
    description: "Pecs · Quads · Triceps · 19 séries",
    color: "#f97316",
    exercises: [
      { id: "dc-incline-smith", name: "DC incliné Smith", targetSets: 4, restSeconds: 120 },
      { id: "leg-press", name: "Leg press", targetSets: 3, restSeconds: 90 },
      { id: "leg-extension", name: "Leg extension", targetSets: 3, restSeconds: 60 },
      { id: "pec-deck", name: "Pec deck", targetSets: 3, restSeconds: 60 },
      { id: "tricep-overhead", name: "Extension triceps overhead", targetSets: 3, restSeconds: 60 },
      { id: "crunch-poulie", name: "Crunch poulie", targetSets: 3, restSeconds: 45 },
    ],
  },
  {
    id: "mardi",
    name: "Mardi",
    shortName: "MAR",
    description: "Dos · Ischios · Biceps · 19 séries",
    color: "#3b82f6",
    exercises: [
      { id: "rowing-horizontal", name: "Rowing horizontal", targetSets: 4, restSeconds: 90 },
      { id: "tirage-vertical", name: "Tirage vertical", targetSets: 3, restSeconds: 90 },
      { id: "leg-curl-assis", name: "Leg curl assis", targetSets: 3, restSeconds: 75 },
      { id: "pec-poulie-haute", name: "Pec poulie haute", targetSets: 2, restSeconds: 60 },
      { id: "face-pull", name: "Face pull", targetSets: 3, restSeconds: 60 },
      { id: "curl-pupitre", name: "Curl pupitre", targetSets: 3, restSeconds: 60 },
    ],
  },
  {
    id: "mercredi",
    name: "Mercredi",
    shortName: "MER",
    description: "Pecs · Épaules · Abdos · 16+6",
    color: "#a855f7",
    exercises: [
      { id: "dc-assis-machine", name: "DC assis machine", targetSets: 4, restSeconds: 120 },
      { id: "elevations-laterales", name: "Élévations latérales", targetSets: 3, restSeconds: 60 },
      { id: "poulie-arriere-epaule", name: "Poulie arrière d'épaule", targetSets: 3, restSeconds: 60 },
      { id: "ecartes-poulie-basse", name: "Écartés poulie basse", targetSets: 3, restSeconds: 60 },
      { id: "crunch-poulie", name: "Crunch poulie", targetSets: 3, restSeconds: 45 },
      { id: "releves-suspendus", name: "Relevés suspendus", targetSets: 3, restSeconds: 45 },
    ],
  },
  {
    id: "jeudi",
    name: "Jeudi",
    shortName: "JEU",
    description: "Dos · Jambes · Épaules · 18 séries",
    color: "#22c55e",
    exercises: [
      { id: "developpe-militaire", name: "Développé militaire", targetSets: 3, restSeconds: 120 },
      { id: "tirage-horizontal-large", name: "Tirage horizontal prise large", targetSets: 4, restSeconds: 90 },
      { id: "rowing-poulie-basse", name: "Rowing poulie basse", targetSets: 2, restSeconds: 75 },
      { id: "hack-squat", name: "Hack squat", targetSets: 3, restSeconds: 120 },
      { id: "leg-curl-assis", name: "Leg curl assis", targetSets: 3, restSeconds: 75 },
      { id: "shrugs", name: "Shrugs", targetSets: 3, restSeconds: 60 },
    ],
  },
  {
    id: "vendredi",
    name: "Vendredi",
    shortName: "VEN",
    description: "Pecs · Jambes · Triceps · 15+3",
    color: "#ef4444",
    exercises: [
      { id: "dc-incline-halteres", name: "DC incliné haltères", targetSets: 4, restSeconds: 120 },
      { id: "machine-fessier", name: "Machine fessier", targetSets: 2, restSeconds: 60 },
      { id: "ecartes-poulie-haute", name: "Écartés poulie haute", targetSets: 3, restSeconds: 60 },
      { id: "elevations-laterales", name: "Élévations latérales", targetSets: 3, restSeconds: 60 },
      { id: "extension-triceps", name: "Extension triceps", targetSets: 3, restSeconds: 60 },
      { id: "releves-suspendus", name: "Relevés suspendus", targetSets: 3, restSeconds: 45 },
    ],
  },
  {
    id: "samedi",
    name: "Samedi",
    shortName: "SAM",
    description: "Léger · Bras · Dos · Abdos · 8+5",
    color: "#eab308",
    exercises: [
      { id: "tirage-vertical-neutre", name: "Tirage vertical prise neutre", targetSets: 3, restSeconds: 75 },
      { id: "face-pull", name: "Face pull", targetSets: 2, restSeconds: 45 },
      { id: "hammer-curl", name: "Hammer curl", targetSets: 3, restSeconds: 60 },
      { id: "crunch-poulie", name: "Crunch poulie", targetSets: 3, restSeconds: 45 },
      { id: "releves-suspendus", name: "Relevés suspendus", targetSets: 2, restSeconds: 45 },
    ],
  },
];

export function getDayById(id: string): DayConfig | undefined {
  return PROGRAMME.find((d) => d.id === id);
}

export function getExerciseById(exerciseId: string) {
  for (const day of PROGRAMME) {
    const exercise = day.exercises.find((e) => e.id === exerciseId);
    if (exercise) return { day, exercise };
  }
  return undefined;
}

/** Tous les exercices uniques du programme (pour les graphiques) */
export function getAllExercises(): { id: string; name: string }[] {
  const map = new Map<string, string>();
  for (const day of PROGRAMME) {
    for (const ex of day.exercises) {
      if (!map.has(ex.id)) map.set(ex.id, ex.name);
    }
  }
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
}
