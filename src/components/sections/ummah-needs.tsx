"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Heart, MapPin, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "./section-heading";
import {
  formatBDT,
  percent,
  URGENCY_LABEL,
  CATEGORY_LABEL,
  type UmmahNeed,
  type NeedCategory,
} from "@/lib/types";

const FILTERS: { key: "all" | NeedCategory; label: string }[] = [
  { key: "all", label: "সব" },
  { key: "madrasa", label: "মাদরাসা" },
  { key: "student", label: "ছাত্র" },
  { key: "medical", label: "চিকিৎসা" },
  { key: "family", label: "পরিবার" },
  { key: "emergency", label: "জরুরি ত্রাণ" },
];

export function UmmahNeeds() {
  const [filter, setFilter] = useState<"all" | NeedCategory>("all");

  // Live polling: refetch every 15s so donation progress updates automatically.
  // When an admin records a donation, the public sees it within 15s — no
  // manual refresh needed.
  const { data, isLoading } = useQuery({
    queryKey: ["needs"],
    queryFn: async () => {
      const res = await fetch("/api/needs", { cache: "no-store" });
      const json = await res.json();
      return json.needs as UmmahNeed[];
    },
    refetchInterval: 15 * 1000, // 15s live polling
  });

  const needs = data ?? [];
  const loading = isLoading;

  const filtered = useMemo(
    () =>
      filter === "all" ? needs : needs.filter((n) => n.category === filter),
    [needs, filter]
  );

  return (
    <section id="needs" className="relative py-20 lg:py-28 bg-cream-deep/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="উম্মাহর প্রয়োজন"
          title={
            <>
              যাদের দিকে আল্লাহ{" "}
              <span className="text-gradient-gold">তাকিয়ে আছেন</span>
            </>
          }
          subtitle="উম্মাহর ভাই-বোনদের জরুরি প্রয়োজন — মাদরাসা, ছাত্র, চিকিৎসা, পরিবার ও ত্রাণ। আপনার ছোট অবদান বড় পরিবর্তন আনতে পারে।"
        />

        {/* filters */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-500 transition-all border ${
                filter === f.key
                  ? "bg-emerald-deep text-primary-foreground border-emerald-deep shadow-sm"
                  : "bg-card text-foreground/75 border-border hover:border-gold/50 hover:text-emerald-deep"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* grid */}
        {loading ? (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            এই ক্যাটাগরিতে এ মুহূর্তে কোনো প্রয়োজন নেই।
          </p>
        ) : (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((n) => (
              <NeedCard key={n.id} need={n} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function NeedCard({ need }: { need: UmmahNeed }) {
  const pct = percent(need.raisedAmount, need.targetAmount);
  const urgent = need.urgency === "critical";

  return (
    <article className="group flex flex-col rounded-2xl bg-card border border-border overflow-hidden hover:border-gold/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* image */}
      <div className="relative h-44 overflow-hidden">
        {need.image ? (
          <Image
            src={need.image}
            alt={need.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full bg-emerald-soft/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/70 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-cream/95 text-emerald-deep border-0 hover:bg-cream font-500">
            {CATEGORY_LABEL[need.category]}
          </Badge>
        </div>
        {urgent && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-red-600/95 text-white border-0 hover:bg-red-600 font-500 animate-pulse-gold">
              <AlertCircle className="h-3 w-3 mr-1" />
              {URGENCY_LABEL[need.urgency]}
            </Badge>
          </div>
        )}
        {need.beneficiary && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-cream/90 text-xs">
            <Users className="h-3.5 w-3.5" />
            {need.beneficiary}
          </div>
        )}
      </div>

      {/* body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display font-700 text-lg text-emerald-deep leading-snug">
          {need.title}
        </h3>
        <p className="mt-2 text-sm text-foreground/70 leading-relaxed line-clamp-3">
          {need.summary}
        </p>

        {need.location && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {need.location}
          </div>
        )}

        {/* progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-600 text-emerald-deep">
              ৳{formatBDT(need.raisedAmount)}
            </span>
            <span className="text-muted-foreground">
              লক্ষ্য ৳{formatBDT(need.targetAmount)}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full progress-fill rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 text-right text-xs text-gold-deep font-600">
            {pct}% সংগৃহীত
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Button
            className="w-full bg-emerald-deep hover:bg-emerald text-primary-foreground rounded-full"
          >
            <Heart className="h-4 w-4 mr-1.5" />
            অবদান রাখুন
          </Button>
        </div>
      </div>
    </article>
  );
}

