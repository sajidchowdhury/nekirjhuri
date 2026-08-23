"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Briefcase,
  BookOpen,
  Leaf,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "./section-heading";
import type { RevenueModule } from "@/lib/types";

const ICONS: Record<string, typeof ShoppingBag> = {
  shopping: ShoppingBag,
  briefcase: Briefcase,
  book: BookOpen,
  leaf: Leaf,
};

export function ModulesFunnel() {
  const [modules, setModules] = useState<RevenueModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/modules", { cache: "no-store" });
        const data = await res.json();
        if (alive) setModules(data.modules ?? []);
      } catch {
        /* ignore */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const totalFunnel = modules.reduce((s, m) => s + m.funnelPercent, 0);

  return (
    <section id="how" className="relative py-20 lg:py-28 overflow-hidden">
      {/* decorative arches */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 islamic-pattern opacity-60"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="কিভাবে কাজ করে"
          title={
            <>
              প্রতিটি মডিউল থেকে একটি অংশ{" "}
              <span className="text-gradient-gold">ফানেলে যায়</span>
            </>
          }
          subtitle="আমাদের প্রতিটি রেভিনিউ মডিউল লাভ জেনারেট করে, এবং সেখান থেকে একটি নির্দিষ্ট শতাংশ সরাসরি নেকির ঝুড়ি ফানেলে প্রবাহিত হয় — দুনিয়া থেকে আখিরাতে।"
        />

        <div className="mt-14 grid lg:grid-cols-3 gap-6 items-stretch">
          {/* modules column */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))
            ) : (
              modules.map((m) => {
                const Icon = ICONS[m.icon ?? ""] ?? Sparkles;
                return (
                  <div
                    key={m.id}
                    className="group flex items-center gap-4 rounded-2xl bg-card border border-border p-4 hover:border-gold/50 transition-all"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-deep to-emerald text-primary-foreground ring-1 ring-gold/30">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display font-700 text-emerald-deep truncate">
                          {m.name}
                        </h3>
                        <span className="text-sm font-700 text-gold-deep whitespace-nowrap">
                          {m.funnelPercent}%
                        </span>
                      </div>
                      <p className="text-xs text-foreground/65 line-clamp-1 mt-0.5">
                        {m.description}
                      </p>
                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full progress-fill rounded-full"
                          style={{ width: `${m.funnelPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* funnel → akhirah column */}
          <div className="relative">
            <div className="h-full rounded-3xl bg-gradient-to-b from-emerald-deep to-emerald text-primary-foreground p-6 emerald-glow flex flex-col">
              <p className="text-xs font-600 uppercase tracking-wider text-gold-soft/90 mb-1">
                সর্বমোট ফানেলে যায়
              </p>
              <p className="font-display font-800 text-4xl text-cream">
                {loading ? "—" : `${totalFunnel}%`}
              </p>
              <p className="text-xs text-cream/70 mt-1">
                সব মডিউল থেকে একত্রিত অংশ
              </p>

              <div className="my-5 flex justify-center">
                <ArrowDown className="h-6 w-6 text-gold animate-float-slow" />
              </div>

              {/* basket visual */}
              <div className="rounded-2xl bg-cream/10 border border-gold/30 p-5 text-center backdrop-blur">
                <BasketIllustration />
                <p className="font-display font-700 text-cream mt-2">
                  নেকির ঝুড়ি
                </p>
                <p className="text-[11px] text-cream/70 mt-1 leading-relaxed">
                  এই ফানেল কবরের অন্ধকার টানেল পার হয়ে আখিরাতে পৌঁছায়।
                </p>
              </div>

              <div className="mt-auto pt-5 grid grid-cols-3 gap-2 text-center">
                {[
                  { l: "দুনিয়া", v: "উসিলা" },
                  { l: "ঝুড়ি", v: "ফানেল" },
                  { l: "আখিরাত", v: "লক্ষ্য" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-xl bg-cream/5 border border-cream/10 py-2"
                  >
                    <div className="text-[10px] text-gold-soft">{s.l}</div>
                    <div className="text-xs font-600 text-cream">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BasketIllustration() {
  return (
    <svg
      viewBox="0 0 64 56"
      className="mx-auto h-14 w-16 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 20h48l-4.5 26a4 4 0 0 1-4 3.4H16.5a4 4 0 0 1-4-3.4L8 20Z" />
      <path d="M20 20v-6a12 12 0 0 1 24 0v6" />
      <path d="M8 20h48" />
      <path d="M24 28v14M32 28v14M40 28v14" />
      <circle cx="32" cy="10" r="1.5" className="fill-current" />
    </svg>
  );
}
