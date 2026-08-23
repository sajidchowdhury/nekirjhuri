import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.png"
          alt="সুবহে সাদিকে আলোর ঝুড়ি — আধ্যাত্মিক দৃশ্য"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep/85 via-emerald-deep/55 to-emerald-deep/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-emerald-deep/30" />
      </div>

      {/* floating ornamental ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full border border-gold/30 animate-float-slow hidden lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-16 top-40 h-40 w-40 rounded-full border border-gold/20 animate-float-slow hidden lg:block"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-28 pb-20 lg:pt-24">
        <div className="max-w-3xl">
          {/* Bismillah */}
          <p className="font-ar text-gold text-xl sm:text-2xl mb-5 tracking-wide animate-rise">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>

          <div className="flex items-center gap-2 mb-5 animate-rise" style={{ animationDelay: "0.05s" }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 border border-gold/30 px-3 py-1 text-xs sm:text-sm text-gold-soft font-500">
              <Sparkles className="h-3.5 w-3.5" />
              আল্লাহর রাস্তায় একটি মিশন
            </span>
          </div>

          <h1
            className="font-display font-800 text-5xl sm:text-6xl lg:text-7xl text-cream leading-[1.05] mb-6 animate-rise"
            style={{ animationDelay: "0.1s" }}
          >
            নেকির{" "}
            <span className="relative inline-block">
              <span className="text-gradient-gold">ঝুড়ি</span>
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-gold/60"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M2 8 Q 50 2, 100 6 T 198 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl text-cream/90 font-500 mb-3 animate-rise"
            style={{ animationDelay: "0.18s" }}
          >
            এই ফার্মের মালিক আল্লাহ তায়ালা — আমরা শুধু প্রতিনিধি।
          </p>

          <p
            className="text-base sm:text-lg text-cream/75 leading-relaxed max-w-2xl mb-8 animate-rise"
            style={{ animationDelay: "0.24s" }}
          >
            মেধা ও সময়কে পুঁজি করে, দুনিয়াবি উসিলায় আখিরাত ইমপ্রুভ করার মিশন।
            আমাদের প্রতিটি মডিউল থেকে একটি অংশ এই ফানেলে পৌঁছায় — যা কবরের
            অন্ধকার টানেল পার হয়ে আখিরাতে গিয়ে পৌঁছায়।
          </p>

          <div
            className="flex flex-wrap items-center gap-3 animate-rise"
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              asChild
              size="lg"
              className="bg-gold hover:bg-gold-deep text-emerald-deep font-600 rounded-full px-7 h-12 shadow-lg gold-glow"
            >
              <Link href="#needs">
                <Heart className="h-4.5 w-4.5 mr-2" />
                উম্মাহর প্রয়োজন দেখুন
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-cream/30 text-cream hover:bg-cream/10 hover:text-cream rounded-full px-7 h-12 bg-transparent"
            >
              <Link href="#concept">
                মিশন জানুন
                <ArrowDown className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* mini stats */}
          <div
            className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-xl animate-rise"
            style={{ animationDelay: "0.4s" }}
          >
            {[
              { n: "৩", l: "চলমান প্রজেক্ট" },
              { n: "২৪৫+", l: "উপকৃত মানুষ" },
              { n: "১০০%", l: "আমানতদার" },
            ].map((s) => (
              <div key={s.l} className="border-l border-gold/30 pl-3 sm:pl-4">
                <div className="font-display font-700 text-2xl sm:text-3xl text-gold">
                  {s.n}
                </div>
                <div className="text-xs sm:text-sm text-cream/70 mt-0.5">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* bottom fade into page */}
      <div className="absolute bottom-0 inset-x-0 h-20 z-10 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}
