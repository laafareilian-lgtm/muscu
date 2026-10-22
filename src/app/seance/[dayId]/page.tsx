"use client";

import { Suspense, use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Timer } from "lucide-react";
import Link from "next/link";
import { ExerciseCard } from "@/components/ExerciseCard";
import { RestTimer } from "@/components/RestTimer";
import { useStorage } from "@/components/Providers";
import { useRestTimer } from "@/hooks/useRestTimer";
import { useSessionChrono } from "@/hooks/useSessionChrono";
import { getDayById } from "@/lib/programme";
import { formatTimer, getLastPerformance } from "@/lib/utils";

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

  const elapsed = useSessionChrono(session?.startedAt);

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
          <div className="min-w-0 flex-1 overflow-hidden">
            <h1 className="truncate text-lg font-bold text-white">{day.name}</h1>
            <p className="truncate text-xs text-zinc-500">
              {doneSets}/{totalSets} séries · {day.description}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div
              className="flex items-center gap-1 rounded-xl bg-zinc-900 px-2 py-1.5 font-mono text-xs font-semibold tabular-nums text-emerald-400 sm:gap-1.5 sm:px-2.5 sm:text-sm"
              aria-label={`Durée de séance ${formatTimer(elapsed)}`}
            >
              <Timer className="h-3.5 w-3.5 shrink-0" />
              {formatTimer(elapsed)}
            </div>
            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-zinc-800 sm:w-16" aria-hidden>
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex w-full max-w-full flex-col gap-8 overflow-x-hidden px-3 py-6 sm:px-4">
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-lg safe-bottom">
        <div className="mx-auto w-full max-w-lg px-3 py-3 sm:px-4">
          <button
            type="button"
            onClick={handleFinish}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 transition-transform active:scale-[0.98] sm:text-base"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="truncate">Terminer et enregistrer</span>
          </button>
        </div>
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
