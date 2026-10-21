"use client";

import { Suspense, use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ExerciseCard } from "@/components/ExerciseCard";
import { RestTimer } from "@/components/RestTimer";
import { useStorage } from "@/components/Providers";
import { useRestTimer } from "@/hooks/useRestTimer";
import { getDayById } from "@/lib/programme";
import { getLastPerformance } from "@/lib/utils";

function SeanceLoading() {
  return (
    <main className="safe-top flex flex-1 flex-col px-4 pt-6">
      <div className="h-8 w-32 animate-pulse rounded bg-zinc-900" />
      <div className="mt-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-zinc-900" />
        ))}
      </div>
    </main>
  );
}

function SeanceContent({ dayId }: { dayId: string }) {
  const router = useRouter();
  const {
    ready,
    sessions,
    activeSession,
    settings,
    startSession,
    updateActiveSession,
    completeSession,
    discardActiveSession,
  } = useStorage();

  const day = getDayById(dayId);
  const [started, setStarted] = useState(false);
  const initRef = useRef(false);

  const timer = useRestTimer({
    soundEnabled: settings.soundEnabled,
    vibrationEnabled: settings.vibrationEnabled,
  });

  useEffect(() => {
    if (!ready || !day || initRef.current) return;
    initRef.current = true;
    startSession(day);
    setStarted(true);
  }, [ready, day, startSession]);

  const session =
    activeSession?.dayId === dayId && !activeSession.completedAt
      ? activeSession
      : null;

  const handleSetChange = useCallback(
    (exerciseIndex: number, setIndex: number, patch: { weight?: number; reps?: number }) => {
      updateActiveSession((prev) => {
        const exercises = prev.exercises.map((ex, ei) => {
          if (ei !== exerciseIndex) return ex;
          return {
            ...ex,
            sets: ex.sets.map((s, si) => (si === setIndex ? { ...s, ...patch } : s)),
          };
        });
        return { ...prev, exercises };
      });
    },
    [updateActiveSession]
  );

  const handleToggleSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      if (!day || !session) return;
      const exercise = session.exercises[exerciseIndex];
      const set = exercise?.sets[setIndex];
      if (!set) return;

      const willComplete = !set.completed;

      updateActiveSession((prev) => {
        const exercises = prev.exercises.map((ex, ei) => {
          if (ei !== exerciseIndex) return ex;
          return {
            ...ex,
            sets: ex.sets.map((s, si) =>
              si === setIndex ? { ...s, completed: !s.completed } : s
            ),
          };
        });
        return { ...prev, exercises };
      });

      if (willComplete) {
        const config = day.exercises[exerciseIndex];
        timer.start(config?.restSeconds ?? settings.defaultRestSeconds);
      }
    },
    [day, session, updateActiveSession, timer, settings.defaultRestSeconds]
  );

  const handleFinish = () => {
    if (!confirm("Terminer et enregistrer la séance ?")) return;
    timer.stop();
    completeSession();
    router.push("/historique");
  };

  const handleAbort = () => {
    if (
      !confirm(
        "Abandonner la séance en cours ? Les données ne seront pas sauvegardées."
      )
    )
      return;
    timer.stop();
    discardActiveSession();
    router.push("/");
  };

  if (!day) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-zinc-400">Séance introuvable</p>
        <Link href="/" className="text-emerald-400 underline">
          Retour
        </Link>
      </main>
    );
  }

  if (!ready || !started || !session) {
    return <SeanceLoading />;
  }

  const doneSets = session.exercises.reduce(
    (n, ex) => n + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = session.exercises.reduce((n, ex) => n + ex.sets.length, 0);

  return (
    <main className="safe-top relative flex flex-1 flex-col pb-36">
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-3 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAbort}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 active:scale-95"
            aria-label="Quitter"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-white">{day.name}</h1>
            <p className="text-xs text-zinc-500">
              {doneSets}/{totalSets} séries · {day.description}
            </p>
          </div>
          <div className="h-2 w-16 overflow-hidden rounded-full bg-zinc-800" aria-hidden>
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-8 px-4 py-6">
        {day.exercises.map((config, ei) => {
          const log = session.exercises[ei];
          if (!log) return null;
          const last = getLastPerformance(sessions, day.id, config.id);
          return (
            <ExerciseCard
              key={config.id}
              config={config}
              log={log}
              last={last}
              index={ei}
              onSetChange={(si, patch) => handleSetChange(ei, si, patch)}
              onToggleSet={(si) => handleToggleSet(ei, si)}
            />
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur-lg safe-bottom">
        <button
          type="button"
          onClick={handleFinish}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-base font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 transition-transform active:scale-[0.98]"
        >
          <CheckCircle2 className="h-5 w-5" />
          Terminer et enregistrer
        </button>
      </div>

      <RestTimer
        secondsLeft={timer.secondsLeft}
        totalSeconds={timer.totalSeconds}
        isRunning={timer.isRunning}
        isActive={timer.isActive}
        progress={timer.progress}
        onPause={timer.pause}
        onResume={timer.resume}
        onStop={timer.stop}
        onAddTime={timer.addTime}
      />
    </main>
  );
}

function SeanceParams({ params }: { params: Promise<{ dayId: string }> }) {
  const { dayId } = use(params);
  return <SeanceContent dayId={dayId} />;
}

export default function SeancePage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  return (
    <Suspense fallback={<SeanceLoading />}>
      <SeanceParams params={params} />
    </Suspense>
  );
}
