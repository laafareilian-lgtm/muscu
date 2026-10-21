"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAllExercises } from "@/lib/programme";
import type { WorkoutSession } from "@/lib/types";
import { formatDate, getExerciseProgress } from "@/lib/utils";

interface ProgressChartProps {
  sessions: WorkoutSession[];
}

type Metric = "maxWeight" | "volume";

export function ProgressChart({ sessions }: ProgressChartProps) {
  const exercises = useMemo(() => getAllExercises(), []);
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const [metric, setMetric] = useState<Metric>("maxWeight");

  const data = useMemo(() => {
    if (!exerciseId) return [];
    return getExerciseProgress(sessions, exerciseId).map((p) => ({
      ...p,
      label: formatDate(p.date),
    }));
  }, [sessions, exerciseId]);

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Progression
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMetric("maxWeight")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              metric === "maxWeight"
                ? "bg-white text-zinc-950"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            Charge max
          </button>
          <button
            type="button"
            onClick={() => setMetric("volume")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              metric === "volume"
                ? "bg-white text-zinc-950"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            Volume
          </button>
        </div>
      </div>

      <select
        value={exerciseId}
        onChange={(e) => setExerciseId(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none focus:border-zinc-500"
      >
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>

      {data.length < 2 ? (
        <div className="flex h-48 items-center justify-center text-sm text-zinc-600">
          {data.length === 0
            ? "Pas encore de données pour cet exercice"
            : "Au moins 2 séances nécessaires pour la courbe"}
        </div>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={{ stroke: "#3f3f46" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
                unit={metric === "maxWeight" ? "" : ""}
              />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#a1a1aa" }}
                formatter={(value) => [
                  `${value}${metric === "maxWeight" ? " kg" : " kg·reps"}`,
                  metric === "maxWeight" ? "Charge max" : "Volume",
                ]}
              />
              <Line
                type="monotone"
                dataKey={metric}
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{ fill: "#34d399", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
