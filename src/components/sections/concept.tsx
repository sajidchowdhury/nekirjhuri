"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Briefcase,
  BookOpen,
  Leaf,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import type { RevenueModule } from "@/lib/types";

const ICONS: Record<string, typeof ShoppingBag> = {
  shopping: ShoppingBag,
  briefcase: Briefcase,
  book: BookOpen,
  leaf: Leaf,
};

const VISIBLE_COUNT = 4;
const SLIDE_COUNT = 2;

export function Concept() {
  const [modules, setModules] = useState<RevenueModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollIdx, setScrollIdx] = useState(0);

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

  const canScrollLeft = scrollIdx > 0;
  const canScrollRight = scrollIdx + VISIBLE_COUNT < modules.length;

  const scrollLeft = useCallback(() => {
    setScrollIdx((i) => Math.max(0, i - SLIDE_COUNT));
  }, []);
  const scrollRight = useCallback(() => {
    setScrollIdx((i) => Math.min(modules.length - VISIBLE_COUNT, i + SLIDE_COUNT));
  }, [modules.length]);

  const visibleModules = modules.slice(scrollIdx, scrollIdx + VISIBLE_COUNT);

  return (
    <section id="concept" className="relative py-12 lg:py-16 star-field">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="আমাদের কনসেপ্ট"
          title={
            <>
              দুনিয়ার উসিলায়{" "}
              <span className="text-gradient-gold">আখিরাতের সফলতা</span>
            </>
          }
          subtitle="আমাদের মেধা ও সময়কে পুঁজি করে, দুনিয়াবি আসবাবের উসিলায় আখিরাত ইমপ্রুভ করার এই মিশনকে সমন্বয় করার জন্য এই প্ল্যাটফর্ম। এটি আমাদের ফানেলের উপরের ভাগ — যা কবরের মতো অন্ধকার টানেল হয়ে আখিরাতে চলে যায়।"
        />

        <div className="mt-14 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Visual */}
          <div className="order-2 lg:order-1">
            <div className="relative rounded-3xl bg-gradient-to-b from-emerald-soft/60 to-cream border border-gold/20 p-6 sm:p-8 emerald-glow">
              {/* stage 1 — modules carousel */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-600 uppercase tracking-wider text-emerald-deep/70">
                  ১. দুনিয়াবি মডিউল
                </p>
                {modules.length > VISIBLE_COUNT && (
                  <div className="flex gap-1">
                    <button
                      onClick={scrollLeft}
                      disabled={!canScrollLeft}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card hover:border-gold/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label="বাঁদিকে"
                    >
                      <ChevronLeft className="h-4 w-4 text-emerald-deep" />
                    </button>
                    <button
                      onClick={scrollRight}
                      disabled={!canScrollRight}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card hover:border-gold/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label="ডানদিকে"
                    >
                      <ChevronRight className="h-4 w-4 text-emerald-deep" />
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: VISIBLE_COUNT }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {visibleModules.map((m, i) => {
                    const Icon = ICONS[m.icon ?? ""] ?? Sparkles;
                    return (
                      <div
                        key={m.id}
                        className="flex flex-col items-center gap-1.5 rounded-xl bg-background/70 border border-border px-2 py-3 hover:border-gold/40 transition-all animate-rise"
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/10 text-emerald-deep">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="text-xs font-600 text-foreground text-center truncate w-full">
                          {m.name}
                        </div>
                        <div className="text-[10px] text-gold-deep font-500">
                          ফানেল {m.funnelPercent}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* dots */}
              {modules.length > VISIBLE_COUNT && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {Array.from({
                    length: Math.ceil(modules.length / SLIDE_COUNT) - 1,
                  }).map((_, i) => {
                    const isActive = Math.floor(scrollIdx / SLIDE_COUNT) === i;
                    return (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          isActive
                            ? "w-5 bg-emerald-deep"
                            : "w-1.5 bg-muted-foreground/30"
                        }`}
                      />
                    );
                  })}
                </div>
              )}

              {/* arrow */}
              <div className="flex justify-center my-3">
                <ArrowDown className="h-5 w-5 text-gold animate-float-slow" />
              </div>

              {/* stage 2 — funnel */}
              <p className="text-xs font-600 uppercase tracking-wider text-emerald-deep/70 mb-3 text-center">
                ২. নেকির ঝুড়ি ফানেল
              </p>
              <div className="flex justify-center">
                <div className="w-full max-w-[260px]">
                  <div className="h-20 flex items-center justify-center rounded-t-[40px] bg-gradient-to-b from-gold/30 to-gold/15 border-x border-t border-gold/40">
                    <span className="font-display font-700 text-emerald-deep">
                      নেকির ঝুড়ি
                    </span>
                  </div>
                  <div
                    className="mx-auto h-3 bg-gradient-to-r from-transparent via-gold/50 to-transparent"
                    style={{
                      clipPath: "polygon(15% 0, 85% 0, 100% 100%, 0 100%)",
                    }}
                  />
                </div>
              </div>

              {/* tunnel */}
              <div className="flex justify-center mt-1">
                <div className="relative w-24">
                  <div className="mx-auto w-px h-10 bg-gradient-to-b from-gold/60 to-emerald-deep/40" />
                  <div className="h-14 w-full rounded-b-2xl bg-gradient-to-b from-emerald-deep/40 to-emerald-deep border-x border-b border-emerald-deep/40 flex items-end justify-center pb-2">
                    <span className="text-[10px] text-cream/80 font-500">
                      কবর → আখিরাত
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 space-y-5">
            <div className="glass-card rounded-2xl p-5 sm:p-6">
              <h3 className="font-display font-700 text-xl text-emerald-deep mb-2">
                দুনিয়াবি আসবাব
              </h3>
              <p className="text-foreground/75 leading-relaxed">
                &ldquo;নেকির ঝুড়ি&rdquo; পরিচালনার জন্য আমাদের কিছু মডিউল থাকবে।
                প্রতিটি মডিউল আমাদেরকে রেভিনিউ জেনারেট করে দেবে। প্রতিটি মডিউল থেকে
                একটি শতাংশ &ldquo;নেকির ঝুড়ি&rdquo; ফানেলে যাবে — এটাই আমাদের
                দুনিয়াবি আসবাব।
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <PointCard
                step="উসিলা"
                title="মেধা ও সময়"
                desc="আল্লাহর দেওয়া মেধা ও সময় আল্লাহর রাস্তায় বিনিয়োগ।"
              />
              <PointCard
                step="বিনিময়"
                title="আর্থিক সামর্থ্য"
                desc="পরিবার, আত্মীয় ও উম্মাহর প্রয়োজন পূরণে সামর্থ্য অর্জন।"
              />
              <PointCard
                step="ইস্তিকামত"
                title="আমলের ইস্তিকামত"
                desc="নফসের হেফাজতে ও আমলে ইস্তিকামতে মুখাপেক্ষী।"
              />
              <PointCard
                step="লক্ষ্য"
                title="আখিরাত ইমপ্যাক্ট"
                desc="দুনিয়াবি আসবাব দিয়ে আখিরাতে সঠিক ইমপ্যাক্ট তৈরি।"
              />
            </div>

            <p className="text-sm text-muted-foreground italic border-l-2 border-gold/50 pl-4">
              &ldquo;আখিরাতে প্রোপার ওয়েতে ইমপ্যাক্ট ফেলতে হলে আমাদের দুনিয়াবি
              আসবাব ব্যবহার করতে হবে।&rdquo;
            </p>

            <Link
              href="#how"
              className="inline-flex items-center gap-1.5 text-emerald-deep font-600 hover:gap-2.5 transition-all"
            >
              কিভাবে কাজ করে দেখুন
              <ArrowDown className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PointCard({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative rounded-2xl bg-card border border-border p-4 hover:border-gold/40 hover:shadow-md transition-all">
      <span className="absolute -top-2 left-4 inline-flex items-center rounded-full bg-emerald-deep text-primary-foreground text-[10px] font-600 px-2 py-0.5">
        {step}
      </span>
      <h4 className="font-display font-700 text-base text-emerald-deep mt-1 mb-1">
        {title}
      </h4>
      <p className="text-sm text-foreground/70 leading-relaxed">{desc}</p>
    </div>
  );
}
