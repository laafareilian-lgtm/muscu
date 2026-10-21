"use client";

import { DayCard } from "@/components/DayCard";
import { useStorage } from "@/components/Providers";
import { PROGRAMME } from "@/lib/programme";
import { getLastSessionDate } from "@/lib/utils";

export default function HomePage() {
  const { ready, sessions, activeSession } = useStorage();

  return (
    <main className="safe-top flex flex-1 flex-col px-4 pb-28 pt-6">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Programme
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Muscu</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Choisis ta séance. Une main, zéro friction.
        </p>
      </header>

      {!ready ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-zinc-900"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {PROGRAMME.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              lastDate={getLastSessionDate(sessions, day.id)}
              hasActive={activeSession?.dayId === day.id && !activeSession.completedAt}
            />
          ))}
        </div>
      )}
    </main>
  );
}
