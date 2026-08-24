"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatBDT } from "@/lib/types";

interface DataPoint {
  date: string;
  amount: number;
  count: number;
}

/** Area chart showing daily donation amounts over the last 30 days. */
export function DonationsAreaChart({ data }: { data: DataPoint[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0);
  const daysWithDonations = data.filter((d) => d.count > 0).length;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-700 text-base text-emerald-deep">
            গত ৩০ দিনের ডোনেশন
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            মোট ৳{formatBDT(total)} · {daysWithDonations} দিনে ডোনেশন এসেছে
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.46 0.095 162)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="oklch(0.46 0.095 162)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.018 90)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "oklch(0.55 0.02 165)" }}
            interval={4}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "oklch(0.55 0.02 165)" }}
            tickFormatter={(v) => `৳${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0.004 90)",
              border: "1px solid oklch(0.9 0.018 90)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "oklch(0.34 0.07 165)", fontWeight: 600 }}
            formatter={(value: number) => [`৳${formatBDT(value)}`, "পরিমাণ"]}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="oklch(0.46 0.095 162)"
            strokeWidth={2}
            fill="url(#colorAmount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
