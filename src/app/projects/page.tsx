import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Users, Wallet, MapPin, Building2 } from "lucide-react";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { formatBDT } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "স্থায়ী প্রজেক্ট — নেকির ঝুড়ি",
  description: "চলমান মাদরাসা, মক্তব ও এতিমখানা — যেগুলো আপনার নিয়মিত সাপোর্টে টিকে আছে।",
};

const TYPE_LABELS: Record<string, string> = {
  madrasha: "মাদরাসা",
  moktob: "মক্তব",
  orphanage: "এতিমখানা",
  clinic: "ক্লিনিক",
  mosque: "মসজিদ",
};

export default async function ProjectsIndexPage() {
  const projects = await db.fixedProject.findMany({
    where: { isActive: true },
    orderBy: [{ establishedAt: "asc" }],
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
                <span className="text-xs font-600 uppercase tracking-[0.18em] text-gold-deep">প্রতিষ্ঠান</span>
              </div>
              <h1 className="font-display font-800 text-3xl sm:text-4xl text-emerald-deep">
                স্থায়ী প্রজেক্ট
              </h1>
              <p className="mt-3 text-base text-foreground/70 max-w-2xl">
                চলমান মাদরাসা, মক্তব ও এতিমখানা — যেগুলো আপনার নিয়মিত সাপোর্টে টিকে আছে এবং এগিয়ে যাচ্ছে।
              </p>
            </div>

            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">এখনো কোনো প্রজেক্ট নেই।</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    href={p.slug ? `/projects/${p.slug}` : "/#projects"}
                    className="group flex flex-col rounded-2xl bg-card border border-border overflow-hidden hover:border-gold/50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    {p.image && (
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/60 to-transparent" />
                        <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-cream/95 px-2.5 py-0.5 text-[10px] font-600 text-emerald-deep">
                          {TYPE_LABELS[p.type] ?? p.type}
                        </span>
                        {p.establishedAt && (
                          <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-emerald-deep/90 px-2.5 py-0.5 text-[10px] font-600 text-cream">
                            {p.establishedAt}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col flex-1 p-5">
                      <h2 className="font-display font-700 text-lg text-emerald-deep leading-snug">
                        {p.name}
                      </h2>
                      <p className="mt-1.5 text-sm text-foreground/70 line-clamp-2">
                        {p.description}
                      </p>
                      {p.location && (
                        <p className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {p.location}
                        </p>
                      )}
                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <span className="text-xs font-600 text-emerald-deep inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {p.beneficiaries} উপকৃত
                        </span>
                        <span className="text-xs font-600 text-gold-deep inline-flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          ৳{formatBDT(p.monthlyCost)}/মাস
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
