"use client";

import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import type { DayConfig } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";

interface DayCardProps {
  day: DayConfig;
  lastDate: string | null;
  hasActive?: boolean;
}

export function DayCard({ day, lastDate, hasActive }: DayCardProps) {
  return (
    <Link
      href={`/seance/${day.id}`}
      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 transition-all active:scale-[0.98] active:bg-zinc-800/80 sm:gap-4 sm:p-4"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold tracking-wide text-white sm:h-14 sm:w-14 sm:text-sm"
        style={{ backgroundColor: day.color }}
      >
        {day.shortName.slice(0, 4)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="truncate text-base font-semibold text-white sm:text-lg">
            {day.name}
          </h2>
          {hasActive && (
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              En cours
            </span>
          )}
        </div>
        <p className="truncate text-sm text-zinc-500">{day.description}</p>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-xs text-zinc-600">
          <Clock className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {lastDate ? `Dernier : ${formatRelativeDate(lastDate)}` : "Jamais fait"}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="rounded-xl bg-white px-2.5 py-2 text-[11px] font-semibold text-zinc-950 transition-colors group-active:bg-zinc-200 sm:px-3 sm:text-xs">
          Démarrer
        </span>
        <ChevronRight className="h-4 w-4 text-zinc-600" />
      </div>
    </Link>
  );
}
