"use client";

import type { ScaleResponse } from "@/modules/clinical/types";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

export function ScaleSparkline({
  scales,
  type,
  color,
}: {
  scales: ScaleResponse[];
  type: ScaleResponse["type"];
  color: string;
}) {
  const data = scales
    .filter((s) => s.type === type)
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    )
    .map((s) => ({
      date: new Date(s.recordedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      score: s.score,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-16 items-center justify-center text-xs text-slate-400">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={64}>
      <LineChart data={data}>
        <YAxis hide domain={[0, type === "phq9" ? 27 : 21]} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
