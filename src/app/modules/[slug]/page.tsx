import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Facebook,
  Youtube,
  Instagram,
  Twitter,
  MessageCircle,
  Send,
  Globe,
  TrendingUp,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/db";
import { parseSocialLinks } from "@/lib/validations/module";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";

export const dynamic = "force-dynamic";

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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const revModule = await db.revenueModule.findUnique({
    where: { slug },
    select: { name: true, description: true, featuredImage: true },
  });

  if (!revModule) return { title: "মডিউল পাওয়া যায়নি" };

  return {
    title: `${revModule.name} — নেকির ঝুড়ি`,
    description: revModule.description,
    openGraph: {
      title: revModule.name,
      description: revModule.description,
      images: revModule.featuredImage ? [{ url: revModule.featuredImage }] : [],
    },
  };
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const revModule = await db.revenueModule.findUnique({
    where: { slug },
  });

  if (!revModule || !revModule.isActive || revModule.status !== "active") {
    notFound();
  }

  const socials = parseSocialLinks(revModule.socialLinks);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <article className="py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {/* Back link */}
            <Link
              href="/#how"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-deep transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              সাইটে ফিরে যান
            </Link>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full bg-gold/15 border border-gold/30 px-3 py-1 text-xs font-600 text-gold-deep">
                  দুনিয়াবি মডিউল
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-600 text-emerald-deep">
                  <TrendingUp className="h-3.5 w-3.5" />
                  ফানেল {revModule.funnelPercent}%
                </span>
              </div>
              <h1 className="font-display font-800 text-3xl sm:text-4xl text-emerald-deep leading-tight">
                {revModule.name}
              </h1>
              <p className="mt-3 text-base text-foreground/70 leading-relaxed">
                {revModule.description}
              </p>
            </div>

            {/* Featured image */}
            {revModule.featuredImage && (
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-8 border border-border">
                <Image
                  src={revModule.featuredImage}
                  alt={revModule.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* How it works (markdown) */}
            {revModule.howItWorks && (
              <div className="prose prose-emerald max-w-none mb-8">
                <div className="rounded-xl border border-border bg-card p-6">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h2 className="font-display font-700 text-xl text-emerald-deep mt-0 mb-3">
                          {children}
                        </h2>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-display font-700 text-lg text-emerald-deep mt-4 mb-2">
                          {children}
                        </h2>
                      ),
                      p: ({ children }) => (
                        <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1 mb-3">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside text-sm text-foreground/80 space-y-1 mb-3">
                          {children}
                        </ol>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-700 text-emerald-deep">
                          {children}
                        </strong>
                      ),
                    }}
                  >
                    {revModule.howItWorks}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Social links */}
            {socials.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-display font-700 text-base text-emerald-deep mb-4">
                  সোশ্যাল মিডিয়া
                </h2>
                <div className="flex flex-wrap gap-2">
                  {socials.map((s, i) => {
                    const Icon = SOCIAL_ICONS[s.type] ?? Globe;
                    return (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-soft/40 border border-emerald/20 px-4 py-2 text-sm font-500 text-emerald-deep hover:bg-emerald-soft/70 transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Donate CTA */}
            <div className="mt-10 rounded-2xl bg-gradient-to-br from-emerald-deep to-emerald text-primary-foreground p-6 text-center">
              <p className="font-display font-700 text-lg text-cream mb-2">
                এই মডিউল থেকে {revModule.funnelPercent}% নেকির ঝুড়ি ফানেলে যায়
              </p>
              <p className="text-sm text-cream/70 mb-4">
                আপনার অবদান আখিরাতের পাথেয়।
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
