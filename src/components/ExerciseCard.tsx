"use client";

import type { ExerciseConfig, ExerciseLog, LastSetSummary } from "@/lib/types";
import { SetRow } from "./SetRow";

interface ExerciseCardProps {
  config: ExerciseConfig;
  log: ExerciseLog;
  last: LastSetSummary | null;
  index: number;
  onSetChange: (setIndex: number, patch: Partial<ExerciseLog["sets"][0]>) => void;
  onToggleSet: (setIndex: number) => void;
}

export function ExerciseCard({
  config,
  log,
  last,
  index,
  onSetChange,
  onToggleSet,
}: ExerciseCardProps) {
  const completedCount = log.sets.filter((s) => s.completed).length;

  return (
    <section className="space-y-3">
      <header className="flex items-start justify-between gap-3 px-1">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">
            Exercice {index + 1}
          </p>
          <h3 className="text-lg font-semibold text-white">{config.name}</h3>
          {last ? (
            <p className="mt-0.5 text-sm text-zinc-500">
              Dernière fois :{" "}
              <span className="text-zinc-400">
                {last.weight} kg × {last.reps}
              </span>
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-zinc-600">Pas d&apos;historique</p>
          )}
        </div>
        <span className="shrink-0 rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400">
          {completedCount}/{config.targetSets}
        </span>
      </header>

      <div className="space-y-2">
        {log.sets.map((set, i) => (
          <SetRow
            key={set.setNumber}
            set={set}
            onChange={(patch) => onSetChange(i, patch)}
            onToggleComplete={() => onToggleSet(i)}
          />
        ))}
      </div>
    </section>
  );
}
