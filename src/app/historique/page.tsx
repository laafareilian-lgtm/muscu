"use client";

import { HistoryList } from "@/components/HistoryList";
import { ProgressChart } from "@/components/ProgressChart";
import { useStorage } from "@/components/Providers";

export default function HistoriquePage() {
  const { ready, sessions, deleteSession } = useStorage();

  return (
    <main className="safe-top flex flex-1 flex-col px-4 pb-28 pt-6">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Progression
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
          Historique
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Suis la surcharge progressive semaine après semaine.
        </p>
      </header>

      {!ready ? (
        <div className="h-52 animate-pulse rounded-2xl bg-zinc-900" />
      ) : (
        <div className="space-y-6">
          <ProgressChart sessions={sessions} />
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Séances terminées
            </h2>
            <HistoryList sessions={sessions} onDelete={deleteSession} />
          </section>
        </div>
      )}
    </main>
  );
}
