"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatBDT } from "@/lib/types";

interface DataPoint {
  id: string;
  title: string;
  raised: number;
  target: number;
  pct: number;
}

/** Horizontal bar chart showing raised vs target per active need (top 8). */
export function NeedsBarChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display font-700 text-base text-emerald-deep mb-4">
          প্রয়োজন অগ্রগতি
        </h3>
        <p className="text-sm text-muted-foreground text-center py-16">
          কোনো সক্রিয় প্রয়োজন নেই।
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="font-display font-700 text-base text-emerald-deep">
          প্রয়োজন অগ্রগতি (শীর্ষ {data.length})
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          সংগৃহীত বনাম লক্ষ্য — সবুজ = সংগৃহীত, সোনালী = বাকি
        </p>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(220, data.length * 40)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.9 0.018 90)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "oklch(0.55 0.02 165)" }}
            tickFormatter={(v) => `৳${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="title"
            tick={{ fontSize: 11, fill: "oklch(0.34 0.07 165)" }}
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0.004 90)",
              border: "1px solid oklch(0.9 0.018 90)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "oklch(0.34 0.07 165)", fontWeight: 600 }}
            formatter={(value: number, name: string) => {
              const label = name === "raised" ? "সংগৃহীত" : "লক্ষ্য";
              return [`৳${formatBDT(value)}`, label];
            }}
          />
          <Bar dataKey="target" fill="oklch(0.9 0.08 85)" radius={[0, 4, 4, 0]} barSize={16} />
          <Bar dataKey="raised" fill="oklch(0.46 0.095 162)" radius={[0, 4, 4, 0]} barSize={16}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.pct >= 100 ? "oklch(0.74 0.135 82)" : "oklch(0.46 0.095 162)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
