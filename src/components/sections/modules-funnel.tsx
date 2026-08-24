"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Briefcase,
  BookOpen,
  Leaf,
  ArrowDown,
  ArrowRight,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Facebook,
  Youtube,
  Instagram,
  Twitter,
  MessageCircle,
  Send,
  Globe,
  X,
  Heart,
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

const SOCIAL_ICONS: Record<string, typeof Facebook> = {
  facebook: Facebook,
  youtube: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  whatsapp: MessageCircle,
  telegram: Send,
  website: Globe,
  linkedin: Globe,
};

interface SocialLink {
  type: string;
  url: string;
}

function parseSocialLinks(raw: string | null | undefined): SocialLink[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is SocialLink =>
        typeof s === "object" &&
        s !== null &&
        typeof s.type === "string" &&
        typeof s.url === "string"
    );
  } catch {
    return [];
  }
}

const MAX_VISIBLE = 4;

export function ModulesFunnel() {
  const [modules, setModules] = useState<RevenueModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [selectedModule, setSelectedModule] = useState<RevenueModule | null>(null);

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

  const canScrollUp = scrollIndex > 0;
  const canScrollDown = scrollIndex + MAX_VISIBLE < modules.length;
  const visibleModules = modules.slice(scrollIndex, scrollIndex + MAX_VISIBLE);

  const scrollUp = useCallback(() => {
    setScrollIndex((i) => Math.max(0, i - 1));
  }, []);

  const scrollDown = useCallback(() => {
    setScrollIndex((i) => Math.min(modules.length - MAX_VISIBLE, i + 1));
  }, [modules.length]);

  const handleModuleClick = useCallback((m: RevenueModule) => {
    setSelectedModule(m);
  }, []);

  return (
    <section id="how" className="relative py-16 lg:py-20 overflow-hidden">
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

        <div className="mt-10 grid lg:grid-cols-3 gap-6 items-stretch">
          {/* modules column — vertical scroll, max 4 visible */}
          <div className="lg:col-span-2">
            {/* Scroll controls */}
            {!loading && modules.length > MAX_VISIBLE && (
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">
                  {scrollIndex + 1}–{Math.min(scrollIndex + MAX_VISIBLE, modules.length)} / {modules.length}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={scrollUp}
                    disabled={!canScrollUp}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:border-gold/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="আগের মডিউল"
                  >
                    <ChevronUp className="h-4 w-4 text-emerald-deep" />
                  </button>
                  <button
                    onClick={scrollDown}
                    disabled={!canScrollDown}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:border-gold/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="পরের মডিউল"
                  >
                    <ChevronDown className="h-4 w-4 text-emerald-deep" />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: MAX_VISIBLE }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl" />
                ))
              ) : (
                visibleModules.map((m, i) => {
                  const Icon = ICONS[m.icon ?? ""] ?? Sparkles;
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleModuleClick(m)}
                      className="group flex items-center gap-4 rounded-2xl bg-card border border-border p-4 hover:border-gold/50 hover:shadow-md cursor-pointer transition-all animate-rise"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-deep to-emerald text-primary-foreground ring-1 ring-gold/30 group-hover:scale-110 transition-transform">
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
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden flex-1">
                            <div
                              className="h-full progress-fill rounded-full"
                              style={{ width: `${m.funnelPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-emerald-deep font-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            বিস্তারিত দেখুন →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Scroll dots indicator */}
            {!loading && modules.length > MAX_VISIBLE && (
              <div className="flex justify-center gap-1.5 mt-3">
                {Array.from({ length: Math.ceil(modules.length / MAX_VISIBLE) }).map((_, i) => {
                  const isActive = Math.floor(scrollIndex / MAX_VISIBLE) === i;
                  return (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        isActive ? "w-6 bg-emerald-deep" : "w-1.5 bg-muted-foreground/30"
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* funnel → akhirah column */}
          <div className="relative">
            <div className="h-full rounded-3xl bg-gradient-to-b from-emerald-deep to-emerald text-primary-foreground p-6 emerald-glow flex flex-col sticky top-24">
              <p className="text-xs font-600 uppercase tracking-wider text-gold-soft/90 mb-1">
                সর্বমোট ফানেলে যায়
              </p>
              <p className="font-display font-800 text-4xl text-gold">
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
                <p className="font-display font-700 text-gold mt-2">
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
                    className="rounded-xl bg-cream/10 border border-gold/20 py-2"
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

      {/* Module detail modal */}
      {selectedModule && (
        <ModuleDetailModal
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
        />
      )}
    </section>
  );
}

// ----------------------------------------------------------------
// Module detail modal — shows description, how-it-works, social links
// ----------------------------------------------------------------

function ModuleDetailModal({
  module,
  onClose,
}: {
  module: RevenueModule;
  onClose: () => void;
}) {
  const socials = parseSocialLinks(
    "socialLinks" in module ? (module as unknown as { socialLinks: string | null }).socialLinks : null
  );
  const howItWorks =
    "howItWorks" in module ? (module as unknown as { howItWorks: string | null }).howItWorks : null;
  const featuredImage =
    "featuredImage" in module ? (module as unknown as { featuredImage: string | null }).featuredImage : null;
  const Icon = ICONS[module.icon ?? ""] ?? Sparkles;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-deep/70 backdrop-blur-sm animate-rise"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full max-h-[85vh] overflow-y-auto custom-scroll rounded-2xl bg-card border border-gold/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-cream/80 text-emerald-deep hover:bg-cream transition-colors"
          aria-label="বন্ধ করুন"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Featured image */}
        {featuredImage && (
          <div className="relative h-40 overflow-hidden rounded-t-2xl">
            <Image
              src={featuredImage}
              alt={module.name}
              fill
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          </div>
        )}

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-deep to-emerald text-primary-foreground ring-1 ring-gold/30">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display font-700 text-lg text-emerald-deep">
                {module.name}
              </h3>
              <span className="text-sm font-600 text-gold-deep">
                ফানেল {module.funnelPercent}%
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground/75 leading-relaxed mb-4">
            {module.description}
          </p>

          {/* How it works (if available) */}
          {howItWorks && (
            <div className="rounded-xl bg-emerald-soft/30 border border-emerald/20 p-4 mb-4">
              <p className="text-xs font-600 uppercase tracking-wider text-emerald-deep/70 mb-2">
                কিভাবে কাজ করে
              </p>
              <p className="text-sm text-foreground/75 leading-relaxed whitespace-pre-wrap">
                {howItWorks}
              </p>
            </div>
          )}

          {/* Social links */}
          {socials.length > 0 && (
            <div>
              <p className="text-xs font-600 uppercase tracking-wider text-emerald-deep/70 mb-2">
                যোগাযোগ ও সোশ্যাল মিডিয়া
              </p>
              <div className="flex flex-wrap gap-2">
                {socials.map((s, i) => {
                  const SocialIcon = SOCIAL_ICONS[s.type] ?? Globe;
                  return (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-soft/40 border border-emerald/20 px-3.5 py-1.5 text-xs font-500 text-emerald-deep hover:bg-emerald-soft/70 transition-colors"
                    >
                      <SocialIcon className="h-3.5 w-3.5" />
                      {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detail page link */}
          {module.slug && (
            <Link
              href={`/modules/${module.slug}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-600 text-emerald-deep hover:text-gold-deep transition-colors"
            >
              সম্পূর্ণ পেজ দেখুন
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
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
