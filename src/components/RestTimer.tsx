"use client";

import { Minus, Pause, Play, Plus, X } from "lucide-react";
import { formatTimer } from "@/lib/utils";

interface RestTimerProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  isActive: boolean;
  progress: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onAddTime: (s: number) => void;
}

export function RestTimer({
  secondsLeft,
  isRunning,
  isActive,
  progress,
  onPause,
  onResume,
  onStop,
  onAddTime,
}: RestTimerProps) {
  if (!isActive) return null;

  const circumference = 2 * Math.PI * 36;
  const offset = circumference * (1 - progress);

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-slide-up">
      <div className="rounded-3xl border border-zinc-700/80 bg-zinc-900/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="text-zinc-800"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="text-emerald-400 transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-lg font-bold tabular-nums text-white">
              {formatTimer(secondsLeft)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Repos
            </p>
            <p className="text-sm text-zinc-400">
              {isRunning ? "Compte à rebours…" : "En pause"}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAddTime(-15)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 active:scale-95"
                aria-label="Retirer 15 secondes"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={isRunning ? onPause : onResume}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white text-sm font-semibold text-zinc-950 active:scale-95"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Reprendre
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onAddTime(15)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 active:scale-95"
                aria-label="Ajouter 15 secondes"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onStop}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 active:scale-95"
                aria-label="Fermer le timer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
