import { ShieldAlert, BookX, Lightbulb, ArrowRight } from "lucide-react";
import { SectionHeading } from "./section-heading";

const FLOW = [
  {
    icon: ShieldAlert,
    label: "ভয় ও হতাশা",
    desc: "প্রতিদিন বাজারে যাওয়া, পরিবারকে নিরাপদ রাখা, আর ধোঁকা না খাওয়ার ভয়। সময়ের অভাবে আপত্তিকর পণ্য কিনতে বাধ্য হচ্ছেন।",
  },
  {
    icon: BookX,
    label: "প্রাতিষ্ঠানিক হতাশা",
    desc: "ইলমের আলো ছড়ানো মাদরাসাগুলো আজও হাজার বছরের পুরোনো ম্যানুয়াল সিস্টমে চলছে। প্রযুক্তির অভাবে তালেবে ইলমদের সুবিধা কঠিন।",
  },
  {
    icon: Lightbulb,
    label: "সমাধানের ডাক",
    desc: "নেকির ঝুড়ি এই সমস্যার সমাধান—দুটি মডিউলে দুনিয়ার দায়িত্ব আর আখিরাতের আকাঙ্ক্ষার সেতু বাঁধা হবে।",
  },
];

export function Policy() {
  return (
    <section id="problem" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="সমস্যা"
          title={
            <>
              বাজারের ভিড়ে হারিয়ে যাচ্ছে{" "}
              <span className="text-gradient-gold">আমানত ও সময়?</span>
            </>
          }
          subtitle="দুনিয়ার দৈনন্দিন টানাপোড়েনে আখিরাতের বড় কাজের জন্য সময় বা মেধা বরাদ্দ করা কঠিন হয়ে পড়ে। দুটি হতাশা আমাদের প্রতিনিয়ত তাড়া করে—আর এখানেই নেকির ঝুড়ির মিশন শুরু।"
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

        {/* two worlds of frustration */}
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-soft/70 to-cream border border-emerald/20 p-6">
            <p className="text-xs font-600 uppercase tracking-wider text-emerald-deep/70 mb-2">
              পরিবারের জগৎ
            </p>
            <h3 className="font-display font-700 text-xl text-emerald-deep mb-2">
              বিশ্বস্ত পণ্যের অভাব
            </h3>
            <p className="text-foreground/75 leading-relaxed text-sm">
              আপনি চান সবচেয়ে পবিত্র ও ভালো পণ্যটি আপনার পরিবারের জন্য, কিন্তু
              সময়ের অভাবে আপত্তিকর পণ্য কিনতে বাধ্য হচ্ছেন। নিরাপত্তা আর
              আমানতদারি ক্রমশ দুর্লভ হয়ে উঠছে।
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-gold-soft/60 to-cream border border-gold/30 p-6">
            <p className="text-xs font-600 uppercase tracking-wider text-gold-deep mb-2">
              ইলমের জগৎ
            </p>
            <h3 className="font-display font-700 text-xl text-emerald-deep mb-2">
              ম্যানুয়াল সিস্টমে আটকে থাকা
            </h3>
            <p className="text-foreground/75 leading-relaxed text-sm">
              মাদরাসাগুলো—যেখানে ইলমের আলো ছড়ায়—সেগুলো আজও হাজার বছরের পুরোনো
              ম্যানুয়াল সিস্টমে পরিচালিত। সঠিক খেদমত ও প্রযুক্তির অভাবে আলেম ও
              তালেবে ইলমদের সুবিধা নিশ্চিত করা কঠিন।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
