"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { WorkoutSession } from "@/lib/types";
import { formatDateLong, getVolume } from "@/lib/utils";

interface HistoryListProps {
  sessions: WorkoutSession[];
  onDelete: (id: string) => void;
}

export function HistoryList({ sessions, onDelete }: HistoryListProps) {
  const completed = sessions.filter((s) => s.completedAt);

  if (completed.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800 px-6 py-12 text-center">
        <p className="text-zinc-500">Aucune séance enregistrée</p>
        <p className="mt-1 text-sm text-zinc-600">
          Terminez une séance pour voir l&apos;historique ici.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {completed.map((session) => {
        const totalSets = session.exercises.reduce(
          (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
          0
        );
        const totalVolume = session.exercises.reduce(
          (sum, ex) => sum + getVolume(ex.sets),
          0
        );

        return (
          <li key={session.id} className="relative">
            <Link
              href={`/historique/${session.id}`}
              className="block rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 pr-14 transition-colors active:bg-zinc-800/80"
            >
              <div>
                <h3 className="text-base font-semibold text-white">
                  {session.dayName}
                </h3>
                <p className="text-sm capitalize text-zinc-500">
                  {formatDateLong(session.completedAt!)}
                </p>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-zinc-500">
                <span>
                  <strong className="text-zinc-300">{totalSets}</strong> séries
                </span>
                <span>
                  <strong className="text-zinc-300">
                    {Math.round(totalVolume).toLocaleString("fr-FR")}
                  </strong>{" "}
                  kg volume
                </span>
                <span>
                  <strong className="text-zinc-300">
                    {session.exercises.length}
                  </strong>{" "}
                  exercices
                </span>
              </div>
              <p className="mt-2 text-xs text-emerald-500/80">Voir le détail →</p>
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm("Supprimer cette séance ?")) onDelete(session.id);
              }}
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition-colors active:bg-zinc-800 active:text-red-400"
              aria-label="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
