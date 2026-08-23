import { TrendingUp, Heart, Scale, ArrowRight } from "lucide-react";
import { SectionHeading } from "./section-heading";

const FLOW = [
  {
    icon: TrendingUp,
    label: "সাফল্য ও বোনাস",
    desc: "আমাদের সাফল্য ও বোনাস নির্ভর করে আমাদের পারফরম্যান্সের উপর।",
  },
  {
    icon: Heart,
    label: "পারফরম্যান্স",
    desc: "আর এই পারফরম্যান্স নির্ভর করে আমাদের নিয়তের ইস্তিকলাসের উপর।",
  },
  {
    icon: Scale,
    label: "নিয়তের ইস্তিকলাস",
    desc: "আমাদের পারফরম্যান্স বলে দেবে দুনিয়া ও আখিরাতের সফলতার পারসেন্টেজ।",
  },
];

export function Policy() {
  return (
    <section id="policy" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="আমাদের পলিসি"
          title={
            <>
              পারফরম্যান্স বলে দেবে{" "}
              <span className="text-gradient-gold">সফলতার হিসাব</span>
            </>
          }
          subtitle="আমাদের সাফল্য শুধু দুনিয়াবি লাভে মাপা হবে না। নিয়তের ইস্তিকলাসই নির্ধারণ করবে দুনিয়া ও আখিরাতের সফলতার পারসেন্টেজ।"
        />

        {/* Flow chain */}
        <div className="mt-14 grid md:grid-cols-3 gap-4 lg:gap-6">
          {FLOW.map((f, i) => (
            <div key={f.label} className="relative">
              <div className="h-full rounded-2xl bg-card border border-border p-6 hover:border-gold/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep">
                    <f.icon className="h-6 w-6" />
                  </span>
                  <span className="font-display font-800 text-3xl text-emerald-soft">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-700 text-lg text-emerald-deep">
                  {f.label}
                </h3>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                  {f.desc}
                </p>
              </div>
              {i < FLOW.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 lg:-right-4 -translate-y-1/2 z-10">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-emerald-deep shadow">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* two worlds */}
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-soft/70 to-cream border border-emerald/20 p-6">
            <p className="text-xs font-600 uppercase tracking-wider text-emerald-deep/70 mb-2">
              দুনিয়া
            </p>
            <h3 className="font-display font-700 text-xl text-emerald-deep mb-2">
              দুনিয়াবি জরুরত
            </h3>
            <p className="text-foreground/75 leading-relaxed text-sm">
              পরিবার, আত্মীয় ও বৃহৎ পরিসরে উম্মাহর প্রয়োজন পূরণের জন্য আর্থিক
              সামর্থ্য — আমলের ইস্তিকামাত ও নফসের হেফাজতে পুরোপুরি মুখাপেক্ষী।
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-gold-soft/60 to-cream border border-gold/30 p-6">
            <p className="text-xs font-600 uppercase tracking-wider text-gold-deep mb-2">
              আখিরাত
            </p>
            <h3 className="font-display font-700 text-xl text-emerald-deep mb-2">
              চিরস্থায়ী সফলতা
            </h3>
            <p className="text-foreground/75 leading-relaxed text-sm">
              সুন্নত, সাদিক হিসেবে পরিচয়, শহীদদের সাথে হাশর, এবং উম্মাহর নেক
              আমলের কারণ হওয়া — আল্লাহর অসীম রহমতের উসিলায়।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
