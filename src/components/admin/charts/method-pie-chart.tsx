"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatBDT } from "@/lib/types";

interface DataPoint {
  method: string;
  count: number;
  amount: number;
}

const COLORS = [
  "oklch(0.46 0.095 162)", // emerald
  "oklch(0.74 0.135 82)", // gold
  "oklch(0.55 0.12 200)", // blue-teal
  "oklch(0.7 0.1 50)", // warm
];

/** Pie chart showing donation method distribution. */
export function MethodPieChart({ data }: { data: DataPoint[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display font-700 text-base text-emerald-deep mb-4">
          ডোনেশন পদ্ধতি
        </h3>
        <p className="text-sm text-muted-foreground text-center py-16">
          এখনো কোনো ডোনেশন নেই।
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="font-display font-700 text-base text-emerald-deep">
          ডোনেশন পদ্ধতি
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          মোট ৳{formatBDT(total)} · {data.length} পদ্ধতি
        </p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="method"
            cx="50%"
            cy="50%"
            outerRadius={75}
            innerRadius={40}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0.004 90)",
              border: "1px solid oklch(0.9 0.018 90)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number, _name: string, entry) => {
              const dp = entry?.payload as DataPoint;
              return [
                `৳${formatBDT(value)} (${dp?.count ?? 0} টি)`,
                dp?.method ?? "",
              ];
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
