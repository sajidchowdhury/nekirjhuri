import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Users,
  Wallet,
  MapPin,
  CalendarRange,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { formatBDT } from "@/lib/types";
import { GalleryCarousel } from "./gallery-carousel";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  madrasha: "মাদরাসা",
  moktob: "মক্তব",
  orphanage: "এতিমখানা",
  clinic: "ক্লিনিক",
  mosque: "মসজিদ",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await db.fixedProject.findUnique({
    where: { slug },
    select: { name: true, description: true, image: true },
  });

  if (!project) return { title: "প্রজেক্ট পাওয়া যায়নি" };

  return {
    title: `${project.name} — নেকির ঝুড়ি`,
    description: project.description.slice(0, 160),
    openGraph: {
      title: project.name,
      description: project.description.slice(0, 160),
      images: project.image ? [{ url: project.image }] : [],
    },
  };
}

function parseGallery(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p) => typeof p === "string") : [];
  } catch {
    return [];
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const project = await db.fixedProject.findUnique({ where: { slug } });

  if (!project || !project.isActive) {
    notFound();
  }

  const gallery = parseGallery(project.gallery);
  // Include the main image in the gallery if not already there
  const allImages = project.image && !gallery.includes(project.image)
    ? [project.image, ...gallery]
    : gallery;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <article className="py-10 lg:py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Back link */}
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-deep transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              সব প্রজেক্ট
            </Link>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full bg-gold/15 border border-gold/30 px-3 py-1 text-xs font-600 text-gold-deep">
                  {TYPE_LABELS[project.type] ?? project.type}
                </span>
                {project.establishedAt && (
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <CalendarRange className="h-3.5 w-3.5" />
                    প্রতিষ্ঠিত {project.establishedAt}
                  </span>
                )}
              </div>
              <h1 className="font-display font-800 text-3xl sm:text-4xl text-emerald-deep leading-tight">
                {project.name}
              </h1>
              <p className="mt-3 text-base text-foreground/70 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Gallery carousel */}
            {allImages.length > 0 && (
              <div className="mb-8">
                <GalleryCarousel images={allImages} alt={project.name} />
              </div>
            )}

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl bg-emerald-soft/30 border border-emerald/20 p-4 text-center">
                <Users className="h-6 w-6 text-emerald-deep mx-auto mb-1.5" />
                <div className="font-display font-800 text-2xl text-emerald-deep">
                  {project.beneficiaries}
                </div>
                <div className="text-xs text-muted-foreground">উপকৃত</div>
              </div>
              <div className="rounded-xl bg-gold-soft/30 border border-gold/30 p-4 text-center">
                <Wallet className="h-6 w-6 text-gold-deep mx-auto mb-1.5" />
                <div className="font-display font-800 text-2xl text-gold-deep">
                  ৳{formatBDT(project.monthlyCost)}
                </div>
                <div className="text-xs text-muted-foreground">মাসিক খরচ</div>
              </div>
              <div className="rounded-xl bg-card border border-border p-4 text-center">
                <MapPin className="h-6 w-6 text-emerald-deep mx-auto mb-1.5" />
                <div className="font-display font-700 text-sm text-emerald-deep">
                  {project.location ?? "—"}
                </div>
                <div className="text-xs text-muted-foreground">অবস্থান</div>
              </div>
            </div>

            {/* Daily cost breakdown */}
            {project.monthlyCost > 0 && (
              <div className="rounded-2xl bg-gradient-to-br from-emerald-deep to-emerald text-primary-foreground p-6 mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-cream/80 text-sm">দৈনিক খরচ</p>
                    <p className="font-display font-800 text-3xl text-cream">
                      ৳{formatBDT(Math.round(project.monthlyCost / 30))}
                    </p>
                    <p className="text-cream/60 text-xs mt-1">
                      মাসিক ৳{formatBDT(project.monthlyCost)} ÷ ৩০ দিন
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-cream/80 text-sm">বার্ষিক খরচ</p>
                    <p className="font-display font-700 text-xl text-cream">
                      ৳{formatBDT(project.monthlyCost * 12)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Support CTA */}
            <div className="rounded-2xl border border-gold/30 bg-gold-soft/20 p-6 text-center">
              <HeartHandshake className="h-8 w-8 text-gold-deep mx-auto mb-2" />
              <p className="font-display font-700 text-lg text-emerald-deep mb-1">
                এই প্রতিষ্ঠানটি সাপোর্ট করুন
              </p>
              <p className="text-sm text-foreground/70 mb-4">
                আপনার নিয়মিত সাপোর্টে এই প্রতিষ্ঠান টিকে আছে। মাসিক অবদান রাখুন।
              </p>
              <Link
                href="/#needs"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-deep hover:bg-emerald text-primary-foreground font-600 px-6 py-2.5 text-sm transition-colors"
              >
                অবদান রাখুন
              </Link>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
