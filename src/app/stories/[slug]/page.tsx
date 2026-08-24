import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { formatBDT, percent } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await db.project.findUnique({
    where: { slug },
    select: { name: true, description: true, featuredImage: true, tags: true },
  });

  if (!story) return { title: "গল্প পাওয়া যায়নি" };

  return {
    title: `${story.name} — নেকির ঝুড়ি`,
    description: story.description.slice(0, 160),
    openGraph: {
      title: story.name,
      description: story.description.slice(0, 160),
      images: story.featuredImage ? [{ url: story.featuredImage }] : [],
    },
  };
}

export default async function StoryDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const story = await db.project.findUnique({
    where: { slug },
    include: {
      updates: {
        where: { published: true },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!story || !story.published) {
    notFound();
  }

  const pct = percent(story.raisedAmount, story.targetAmount);
  const tags = story.tags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <article className="py-10 lg:py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {/* Back link */}
            <Link
              href="/stories"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-deep transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              সব গল্প
            </Link>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full bg-gold/15 border border-gold/30 px-3 py-1 text-xs font-600 text-gold-deep">
                  {story.status === "ongoing" ? "চলমান" : story.status === "completed" ? "সম্পন্ন" : "পরিকল্পনা"}
                </span>
                {tags.slice(0, 3).map((t) => (
                  <span key={t} className="text-xs text-muted-foreground">#{t}</span>
                ))}
              </div>
              <h1 className="font-display font-800 text-3xl sm:text-4xl text-emerald-deep leading-tight">
                {story.name}
              </h1>
              <p className="mt-3 text-base text-foreground/70 leading-relaxed">
                {story.description}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                {story.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {story.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(story.startDate).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Featured image */}
            {story.featuredImage && (
              <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-8 border border-border">
                <Image
                  src={story.featuredImage}
                  alt={story.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Progress summary */}
            <div className="rounded-2xl bg-emerald-soft/30 border border-emerald/20 p-5 mb-8">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-700 text-emerald-deep inline-flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" />
                  ৳{formatBDT(story.raisedAmount)} সংগৃহীত
                </span>
                <span className="text-muted-foreground">
                  লক্ষ্য ৳{formatBDT(story.targetAmount)}
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full progress-fill rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1.5 text-right text-xs text-gold-deep font-600">{pct}% সম্পন্ন</div>
            </div>

            {/* Timeline */}
            {story.updates.length > 0 && (
              <div>
                <h2 className="font-display font-700 text-xl text-emerald-deep mb-6">
                  টাইমলাইন ({story.updates.length})
                </h2>
                <div className="relative pl-8">
                  {/* vertical line */}
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-gold/60 via-gold/40 to-emerald/20" />

                  <ol className="space-y-6">
                    {story.updates.map((u, i) => {
                      const last = i === story.updates.length - 1;
                      const dateStr = new Date(u.date).toLocaleDateString("bn-BD", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });
                      return (
                        <li key={u.id} className="relative">
                          <span className="absolute -left-8 top-1.5 flex items-center justify-center">
                            {last ? (
                              <CheckCircle2 className="h-6 w-6 text-gold bg-background rounded-full" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-emerald bg-background rounded-full" />
                            )}
                          </span>
                          <div className="rounded-2xl bg-card border border-border p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                {dateStr}
                              </span>
                            </div>
                            <h3 className="font-display font-700 text-base text-emerald-deep">
                              {u.title}
                            </h3>
                            <p className="mt-1.5 text-sm text-foreground/75 leading-relaxed">
                              {u.description}
                            </p>
                            {u.body && (
                              <div className="mt-3 prose prose-sm max-w-none">
                                <ReactMarkdown
                                  components={{
                                    h1: ({ children }) => (
                                      <h2 className="font-display font-700 text-lg text-emerald-deep mt-3 mb-2">{children}</h2>
                                    ),
                                    h2: ({ children }) => (
                                      <h3 className="font-display font-700 text-base text-emerald-deep mt-3 mb-1.5">{children}</h3>
                                    ),
                                    p: ({ children }) => (
                                      <p className="text-sm text-foreground/80 leading-relaxed mb-2">{children}</p>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1 mb-2">{children}</ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-decimal list-inside text-sm text-foreground/80 space-y-1 mb-2">{children}</ol>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-700 text-emerald-deep">{children}</strong>
                                    ),
                                  }}
                                >
                                  {u.body}
                                </ReactMarkdown>
                              </div>
                            )}
                            {u.image && (
                              <div className="relative h-40 mt-3 rounded-xl overflow-hidden">
                                <Image src={u.image} alt={u.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
                              </div>
                            )}
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                              <div className="rounded-lg bg-emerald-soft/50 px-3 py-2">
                                <div className="text-muted-foreground">সংগৃহীত</div>
                                <div className="font-700 text-emerald-deep">৳{formatBDT(u.collectedAmount)}</div>
                              </div>
                              <div className="rounded-lg bg-gold-soft/40 px-3 py-2">
                                <div className="text-muted-foreground">আরও প্রয়োজন</div>
                                <div className="font-700 text-gold-deep">৳{formatBDT(u.neededAmount)}</div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-10 rounded-2xl bg-gradient-to-br from-emerald-deep to-emerald text-primary-foreground p-6 text-center">
              <p className="font-display font-700 text-lg text-cream mb-2">
                এই গল্পে অবদান রাখুন
              </p>
              <p className="text-sm text-cream/70 mb-4">
                আপনার ছোট অবদান বড় পরিবর্তন আনতে পারে।
              </p>
              <Link
                href="/#needs"
                className="inline-flex items-center gap-2 rounded-full bg-gold hover:bg-gold-deep text-emerald-deep font-600 px-6 py-2.5 text-sm transition-colors"
              >
                উম্মাহর প্রয়োজন দেখুন
              </Link>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
