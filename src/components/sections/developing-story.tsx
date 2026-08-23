"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Loader2,
  CheckCircle2,
  CircleDot,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { formatBDT, percent, type Project } from "@/lib/types";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  ongoing: {
    label: "চলমান",
    cls: "bg-gold/15 text-gold-deep border-gold/30",
  },
  completed: {
    label: "সম্পন্ন",
    cls: "bg-emerald/15 text-emerald-deep border-emerald/30",
  },
  planning: {
    label: "পরিকল্পনায়",
    cls: "bg-muted text-muted-foreground border-border",
  },
};

export function DevelopingStory() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        const data = await res.json();
        if (alive) setProjects(data.projects ?? []);
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

  const project = projects[active];

  return (
    <section id="story" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="চলমান গল্প"
          title={
            <>
              প্রতিটি ধাপে{" "}
              <span className="text-gradient-gold">আল্লাহর রহমত</span>
            </>
          }
          subtitle="আমাদের প্রতিটি প্রজেক্ট ধাপে ধাপে এগোয়। কবে কোথায় গিয়েছি, কী হয়েছে, কত সংগৃহীত ও কত প্রয়োজন — সব এক টাইমলাইনে।"
        />

        {loading ? (
          <div className="mt-12 space-y-4">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        ) : projects.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            কোনো গল্প পাওয়া যায়নি।
          </p>
        ) : (
          <div className="mt-12">
            {/* project switcher */}
            <div className="flex flex-wrap gap-2 mb-8">
              {projects.map((p, i) => {
                const st = STATUS_LABEL[p.status] ?? STATUS_LABEL.ongoing;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActive(i)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-500 border transition-all ${
                      i === active
                        ? "bg-card border-gold/50 shadow-sm text-emerald-deep"
                        : "bg-transparent border-border text-foreground/70 hover:border-gold/40 hover:text-emerald-deep"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] border ${st.cls}`}
                    >
                      {st.label}
                    </span>
                    <span className="max-w-[200px] truncate">{p.name}</span>
                  </button>
                );
              })}
            </div>

            {project && <StoryDetail project={project} />}
          </div>
        )}
      </div>
    </section>
  );
}

function StoryDetail({ project }: { project: Project }) {
  const pct = percent(project.raisedAmount, project.targetAmount);
  const st = STATUS_LABEL[project.status] ?? STATUS_LABEL.ongoing;

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* summary card */}
      <div className="lg:col-span-2 lg:sticky lg:top-24 h-fit">
        <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm">
          <div className="relative h-48">
            {project.featuredImage ? (
              <Image
                src={project.featuredImage}
                alt={project.name}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            ) : (
              <div className="h-full bg-emerald-soft/40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/80 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-600 border ${st.cls} bg-background/80 backdrop-blur`}
              >
                {st.label}
              </span>
              <h3 className="mt-2 font-display font-700 text-xl text-cream leading-snug">
                {project.name}
              </h3>
            </div>
          </div>

          <div className="p-5">
            <p className="text-sm text-foreground/75 leading-relaxed">
              {project.description}
            </p>

            {project.location && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {project.location}
              </div>
            )}

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-600 text-emerald-deep flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  ৳{formatBDT(project.raisedAmount)}
                </span>
                <span className="text-muted-foreground">
                  লক্ষ্য ৳{formatBDT(project.targetAmount)}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full progress-fill rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1.5 text-right text-xs text-gold-deep font-600">
                {pct}% সম্পন্ন
              </div>
            </div>

            <Button className="mt-5 w-full bg-emerald-deep hover:bg-emerald text-primary-foreground rounded-full">
              এই প্রজেক্টে অবদান রাখুন
            </Button>
          </div>
        </div>
      </div>

      {/* timeline */}
      <div className="lg:col-span-3">
        <div className="relative pl-8 sm:pl-10">
          {/* vertical line */}
          <div className="absolute left-3 sm:left-4 top-2 bottom-2 w-px bg-gradient-to-b from-gold/60 via-gold/40 to-emerald/20" />

          <ol className="space-y-6">
            {project.updates.map((u, i) => {
              const last = i === project.updates.length - 1;
              const dateStr = new Date(u.date).toLocaleDateString("bn-BD", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              return (
                <li key={u.id} className="relative animate-rise" style={{ animationDelay: `${i * 0.08}s` }}>
                  {/* node */}
                  <span className="absolute -left-8 sm:-left-10 top-1.5 flex items-center justify-center">
                    {last ? (
                      <CircleDot className="h-6 w-6 text-gold bg-background rounded-full" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-emerald bg-background rounded-full" />
                    )}
                  </span>

                  <div className="rounded-2xl bg-card border border-border p-5 hover:border-gold/40 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {dateStr}
                      </span>
                      {last && (
                        <Badge className="bg-gold/15 text-gold-deep border-0 hover:bg-gold/15">
                          সর্বশেষ
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-display font-700 text-base text-emerald-deep">
                      {u.title}
                    </h4>
                    <p className="mt-1.5 text-sm text-foreground/75 leading-relaxed">
                      {u.description}
                    </p>

                    {u.image && (
                      <div className="relative h-40 mt-3 rounded-xl overflow-hidden">
                        <Image
                          src={u.image}
                          alt={u.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-emerald-soft/50 px-3 py-2">
                        <div className="text-muted-foreground">সংগৃহীত</div>
                        <div className="font-700 text-emerald-deep">
                          ৳{formatBDT(u.collectedAmount)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-gold-soft/40 px-3 py-2">
                        <div className="text-muted-foreground">আরও প্রয়োজন</div>
                        <div className="font-700 text-gold-deep">
                          ৳{formatBDT(u.neededAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

export function StoryLoading() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}
