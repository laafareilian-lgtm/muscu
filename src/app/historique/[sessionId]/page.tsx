"use client";

import { Suspense, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
import { useStorage } from "@/components/Providers";
import { formatDateLong, formatTimer, getVolume } from "@/lib/utils";

function DetailLoading() {
  return (
    <main className="safe-top flex flex-1 flex-col px-4 pt-6">
      <div className="h-8 w-40 animate-pulse rounded bg-zinc-900" />
      <div className="mt-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-900" />
        ))}
      </div>
    </main>
  );
}

function SessionDetail({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { ready, sessions, deleteSession } = useStorage();

  const session = useMemo(
    () => sessions.find((s) => s.id === sessionId && s.completedAt) ?? null,
    [sessions, sessionId]
  );

  if (!ready) return <DetailLoading />;

  if (!session) {
    return (
      <main className="safe-top flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-zinc-400">Séance introuvable</p>
        <Link href="/historique" className="text-emerald-400 underline">
          Retour à l&apos;historique
        </Link>
      </main>
    );
  }

  const totalSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalVolume = session.exercises.reduce(
    (sum, ex) => sum + getVolume(ex.sets),
    0
  );
  const durationSec =
    session.startedAt && session.completedAt
      ? Math.max(
          0,
          Math.floor(
            (new Date(session.completedAt).getTime() -
              new Date(session.startedAt).getTime()) /
              1000
          )
        )
      : null;

  const handleDelete = () => {
    if (!confirm("Supprimer cette séance ?")) return;
    deleteSession(session.id);
    router.push("/historique");
  };

  return (
    <main className="safe-top flex flex-1 flex-col px-4 pb-28 pt-4">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/historique"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 active:scale-95"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-white">
              {session.dayName}
            </h1>
            <p className="text-sm capitalize text-zinc-500">
              {formatDateLong(session.completedAt!)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-600 active:bg-zinc-800 active:text-red-400"
            aria-label="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
          <span className="rounded-lg bg-zinc-900 px-2.5 py-1.5">
            <strong className="text-zinc-300">{totalSets}</strong> séries
          </span>
          <span className="rounded-lg bg-zinc-900 px-2.5 py-1.5">
            <strong className="text-zinc-300">
              {Math.round(totalVolume).toLocaleString("fr-FR")}
            </strong>{" "}
            kg volume
          </span>
          {durationSec !== null && (
            <span className="rounded-lg bg-zinc-900 px-2.5 py-1.5">
              <strong className="text-zinc-300">{formatTimer(durationSec)}</strong>{" "}
              durée
            </span>
          )}
        </div>
      </header>

      <div className="space-y-5">
        {session.exercises.map((ex, index) => {
          const done = ex.sets.filter((s) => s.completed);
          const volume = getVolume(ex.sets);
          return (
            <section
              key={`${ex.exerciseId}-${index}`}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">
                    Exercice {index + 1}
                  </p>
                  <h2 className="text-base font-semibold text-white">
                    {ex.exerciseName}
                  </h2>
                </div>
                <span className="shrink-0 text-xs text-zinc-500">
                  {Math.round(volume).toLocaleString("fr-FR")} kg
                </span>
              </div>

              {done.length === 0 ? (
                <p className="text-sm text-zinc-600">Aucune série validée</p>
              ) : (
                <ul className="space-y-2">
                  {ex.sets.map((set) => (
                    <li
                      key={set.setNumber}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                        set.completed
                          ? "bg-zinc-950/80"
                          : "bg-zinc-950/40 opacity-40"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          set.completed
                            ? "bg-emerald-500 text-zinc-950"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {set.completed ? (
                          <Check className="h-4 w-4" strokeWidth={3} />
                        ) : (
                          set.setNumber
                        )}
                      </span>
                      <span className="text-sm font-medium text-zinc-400">
                        Série {set.setNumber}
                      </span>
                      <span className="ml-auto font-mono text-sm font-semibold tabular-nums text-white">
                        {set.weight} kg × {set.reps}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}

function SessionParams({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  return <SessionDetail sessionId={sessionId} />;
}

export default function HistoriqueDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <Suspense fallback={<DetailLoading />}>
      <SessionParams params={params} />
    </Suspense>
  );
}
