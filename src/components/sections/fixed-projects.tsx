"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Users,
  CalendarRange,
  Wallet,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { SectionHeading } from "./section-heading";
import {
  formatBDT,
  FIXED_TYPE_LABEL,
  type FixedProject,
} from "@/lib/types";

export function FixedProjects() {
  const [projects, setProjects] = useState<FixedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/fixed-projects", { cache: "no-store" });
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

  return (
    <section id="projects" className="relative py-16 lg:py-20 bg-cream-deep/50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="স্থায়ী প্রজেক্ট"
          title={
            <>
              যেসব প্রতিষ্ঠান{" "}
              <span className="text-gradient-gold">নিয়মিত চলছে</span>
            </>
          }
          subtitle="চলমান মাদরাসা, মক্তব ও এতিমখানা — যেগুলো আপনার নিয়মিত সাপোর্টে টিকে আছে এবং এগিয়ে যাচ্ছে।"
        />

        {loading ? (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[360px] rounded-2xl" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            এখনো কোনো স্থায়ী প্রজেক্ট নেই।
          </p>
        ) : (
          <div className="mt-10 px-2">
            <Carousel
              opts={{
                align: "start",
                loop: projects.length > 3,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {projects.map((p) => (
                  <CarouselItem
                    key={p.id}
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <FixedCard project={p} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {projects.length > 3 && (
                <>
                  <CarouselPrevious className="hidden lg:flex -left-4 bg-emerald-deep text-cream hover:bg-emerald border-gold/30" />
                  <CarouselNext className="hidden lg:flex -right-4 bg-emerald-deep text-cream hover:bg-emerald border-gold/30" />
                </>
              )}
            </Carousel>

            {/* Mobile swipe hint */}
            {projects.length > 1 && (
              <p className="lg:hidden text-center text-xs text-muted-foreground mt-3">
                ← সোয়াইপ করে আরও দেখুন →
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function FixedCard({ project }: { project: FixedProject }) {
  return (
    <article className="group flex flex-col h-full rounded-2xl bg-card border border-border overflow-hidden hover:border-gold/50 hover:shadow-xl transition-all duration-300">
      <div className="relative h-40 overflow-hidden">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full bg-emerald-soft/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/60 to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge className="bg-cream/95 text-emerald-deep border-0 hover:bg-cream font-500">
            {FIXED_TYPE_LABEL[project.type]}
          </Badge>
        </div>
        {project.establishedAt && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-emerald-deep/90 text-cream border-0 hover:bg-emerald-deep font-500">
              <CalendarRange className="h-3 w-3 mr-1" />
              {project.establishedAt}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display font-700 text-lg text-emerald-deep">
          {project.name}
        </h3>
        <p className="mt-2 text-sm text-foreground/70 leading-relaxed line-clamp-3">
          {project.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-foreground/75">
            <Users className="h-4 w-4 text-emerald" />
            <span className="text-xs">
              <span className="font-700 text-foreground">
                {project.beneficiaries}
              </span>{" "}
              উপকৃত
            </span>
          </div>
          {project.location && (
            <div className="flex items-center gap-2 text-foreground/75">
              <MapPin className="h-4 w-4 text-emerald" />
              <span className="text-xs truncate">{project.location}</span>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-emerald-soft/40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-deep" />
            <div>
              <div className="text-[10px] text-muted-foreground">মাসিক খরচ</div>
              <div className="font-700 text-emerald-deep text-sm">
                ৳{formatBDT(project.monthlyCost)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">প্রতিদিন</div>
            <div className="font-700 text-gold-deep text-sm">
              ৳{formatBDT(Math.round(project.monthlyCost / 30))}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Button className="w-full bg-emerald-deep hover:bg-emerald text-primary-foreground rounded-full">
            <HeartHandshake className="h-4 w-4 mr-1.5" />
            নিয়মিত সাপোর্ট করুন
          </Button>
        </div>
      </div>
    </article>
  );
}
