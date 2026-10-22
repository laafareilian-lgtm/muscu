"use client";

import { Check, Minus, Plus } from "lucide-react";
import type { SetLog } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SetRowProps {
  set: SetLog;
  onChange: (patch: Partial<SetLog>) => void;
  onToggleComplete: () => void;
}

function CompactStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="w-10 shrink-0 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <button
        type="button"
        aria-label={`Diminuer ${label}`}
        onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 active:bg-zinc-700 active:scale-95"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          onChange(Number.isFinite(n) ? Math.max(min, n) : 0);
        }}
        className="h-10 min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 text-center text-base font-semibold tabular-nums text-white outline-none focus:border-zinc-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={`Augmenter ${label}`}
        onClick={() => onChange(+(value + step).toFixed(1))}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 active:bg-zinc-700 active:scale-95"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function SetRow({ set, onChange, onToggleComplete }: SetRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-hidden rounded-2xl border p-2.5 transition-colors",
        set.completed
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-zinc-800 bg-zinc-900/50"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full text-sm font-bold",
          set.completed ? "bg-emerald-500 text-zinc-950" : "bg-zinc-800 text-zinc-400"
        )}
      >
        {set.setNumber}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <CompactStepper
          label="kg"
          value={set.weight}
          step={2.5}
          onChange={(weight) => onChange({ weight })}
        />
        <CompactStepper
          label="reps"
          value={set.reps}
          step={1}
          onChange={(reps) => onChange({ reps })}
        />
      </div>

      <button
        type="button"
        aria-label={set.completed ? "Décocher la série" : "Valider la série"}
        onClick={onToggleComplete}
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-2xl transition-all active:scale-95",
          set.completed
            ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20"
            : "bg-zinc-800 text-zinc-500"
        )}
      >
        <Check className="h-6 w-6" strokeWidth={3} />
      </button>
    </div>
  );
}
