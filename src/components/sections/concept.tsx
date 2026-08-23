import Link from "next/link";
import { ShoppingBag, Briefcase, BookOpen, Leaf, ArrowDown } from "lucide-react";
import { SectionHeading } from "./section-heading";

const MODULES = [
  { icon: ShoppingBag, name: "ই-কমার্স", pct: "৩০%" },
  { icon: Briefcase, name: "কনসালটেন্সি", pct: "২৫%" },
  { icon: BookOpen, name: "এজুকেশন", pct: "৩৫%" },
  { icon: Leaf, name: "কৃষি ফার্ম", pct: "২০%" },
];

export function Concept() {
  return (
    <section id="concept" className="relative py-20 lg:py-28 star-field">
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

        {/* Funnel diagram */}
        <div className="mt-14 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Visual */}
          <div className="order-2 lg:order-1">
            <div className="relative rounded-3xl bg-gradient-to-b from-emerald-soft/60 to-cream border border-gold/20 p-6 sm:p-8 emerald-glow">
              {/* stage 1 — modules */}
              <p className="text-xs font-600 uppercase tracking-wider text-emerald-deep/70 mb-3">
                ১. দুনিয়াবি মডিউল
              </p>
              <div className="grid grid-cols-2 gap-3">
                {MODULES.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center gap-2.5 rounded-xl bg-background/70 border border-border px-3 py-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/10 text-emerald-deep">
                      <m.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-600 text-foreground truncate">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-gold-deep font-500">
                        ফানেলে {m.pct}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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
                “নেকির ঝুড়ি” পরিচালনার জন্য আমাদের কিছু মডিউল থাকবে। প্রতিটি
                মডিউল আমাদেরকে রেভিনিউ জেনারেট করে দেবে। প্রতিটি মডিউল থেকে একটি
                শতাংশ “নেকির ঝুড়ি” ফানেলে যাবে — এটাই আমাদের দুনিয়াবি আসবাব।
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
              “আখিরাতে প্রোপার ওয়েতে ইমপ্যাক্ট ফেলতে হলে আমাদের দুনিয়াবি আসবাব
              ব্যবহার করতে হবে।”
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
