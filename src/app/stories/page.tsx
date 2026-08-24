import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, MapPin, BookOpen, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { formatBDT, percent } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "চলমান গল্প — নেকির ঝুড়ি",
  description: "আমাদের প্রতিটি প্রজেক্ট ধাপে ধাপে এগোয়। কবে কোথায় গিয়েছি, কী হয়েছে — সব এক টাইমলাইনে।",
};

export default async function StoriesIndexPage() {
  const stories = await db.project.findMany({
    where: { published: true },
    include: {
      updates: {
        where: { published: true },
        orderBy: { date: "desc" },
        take: 1, // latest update for preview
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-6 bg-gold/60" />
                <span className="text-xs font-600 uppercase tracking-[0.18em] text-gold-deep">ব্লগ</span>
              </div>
              <h1 className="font-display font-800 text-3xl sm:text-4xl text-emerald-deep">
                চলমান গল্প
              </h1>
              <p className="mt-3 text-base text-foreground/70 max-w-2xl">
                আমাদের প্রতিটি প্রজেক্ট ধাপে ধাপে এগোয়। কবে কোথায় গিয়েছি, কী হয়েছে, কত সংগৃহীত — সব এক টাইমলাইনে।
              </p>
            </div>

            {stories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">এখনো কোনো গল্প প্রকাশিত নয়।</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {stories.map((s) => {
                  const pct = percent(s.raisedAmount, s.targetAmount);
                  const latest = s.updates[0];
                  return (
                    <Link
                      key={s.id}
                      href={`/stories/${s.slug}`}
                      className="group flex flex-col rounded-2xl bg-card border border-border overflow-hidden hover:border-gold/50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      {s.featuredImage && (
                        <div className="relative h-40 overflow-hidden">
                          <Image
                            src={s.featuredImage}
                            alt={s.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 50vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {s.featured && (
                            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-700 text-emerald-deep">
                              ★ ফিচার্ড
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex flex-col flex-1 p-5">
                        <h2 className="font-display font-700 text-lg text-emerald-deep leading-snug">
                          {s.name}
                        </h2>
                        <p className="mt-1.5 text-sm text-foreground/70 line-clamp-2">
                          {s.description}
                        </p>
                        {s.location && (
                          <p className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {s.location}
                          </p>
                        )}
                        {latest && (
                          <p className="mt-2 text-xs text-gold-deep font-500">
                            সর্বশেষ: {latest.title}
                          </p>
                        )}
                        <div className="mt-auto pt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-600 text-emerald-deep inline-flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              ৳{formatBDT(s.raisedAmount)}
                            </span>
                            <span className="text-muted-foreground">
                              লক্ষ্য ৳{formatBDT(s.targetAmount)}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full progress-fill rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gold-deep font-600">{pct}%</span>
                            <span className="text-xs font-600 text-emerald-deep inline-flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                              বিস্তারিত পড়ুন
                              <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
