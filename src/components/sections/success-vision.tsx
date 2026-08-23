import {
  Sun,
  Users,
  Star,
  ShieldCheck,
  HandHeart,
} from "lucide-react";
import { SectionHeading } from "./section-heading";

const GOALS = [
  {
    icon: Sun,
    title: "সুন্নত ও আমলমুখী জীবন",
    desc: "এই প্রতিষ্ঠানের উসিলায় আমাদের জিন্দিগিতে সুন্নত চলে আসবে। আমরা আমলমুখী হব।",
  },
  {
    icon: Users,
    title: "১০ হাজার আলেমের জানাজা",
    desc: "আমাদের মৃত্যুর দিন ১০ হাজার আলেম-ওলামা ও তালেবে ইলম আমাদের জানাজায় উপস্থিত থাকবেন।",
  },
  {
    icon: Star,
    title: "শহীদদের সাথে হাশর",
    desc: "আল্লাহর অসীম রহমতে আমরা শহীদদের সাথে হাশর হবো ইনশাআল্লাহ।",
  },
  {
    icon: ShieldCheck,
    title: "সাদিক হিসেবে পরিচয়",
    desc: "আল্লাহ তাঁর রহমতে আমাদের দোষ লুকিয়ে, রাসুল ﷺ-এর সামনে আমাদের সাদিক বলে পরিচয় করিয়ে দেন।",
  },
  {
    icon: HandHeart,
    title: "উম্মাহর নেক আমলের কারণ",
    desc: "রাসুল ﷺ-এর বিশাল এক উম্মতের নেক আমলের কারণ হিসেবে আল্লাহ আমাদের কবুল করেন।",
  },
];

export function SuccessVision() {
  return (
    <section id="success" className="relative py-20 lg:py-28 bg-cream-deep/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="আমাদের সফলতার সংজ্ঞা"
          title={
            <>
              সফলতা শুধু দুনিয়ার নয় —{" "}
              <span className="text-gradient-gold">আখিরাতের</span>
            </>
          }
          subtitle="আল্লাহর দেওয়া মেধা ও সময় তাঁর রাস্তায় দেওয়ার বিনিময়ে আমরা যা চাই — তা দুনিয়া ও আখিরাতের সফলতার মিলন।"
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GOALS.map((g, i) => (
            <div
              key={g.title}
              className={`group relative rounded-2xl bg-card border border-border p-6 hover:border-gold/50 hover:-translate-y-1 transition-all duration-300 ${
                i === 0 ? "lg:row-span-1" : ""
              } ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}
            >
              {/* number watermark */}
              <span className="absolute top-4 right-5 font-display font-800 text-5xl text-emerald-soft/50 select-none">
                {["০১", "০২", "০৩", "০৪", "০৫"][i]}
              </span>

              <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-deep to-emerald text-primary-foreground shadow-sm ring-1 ring-gold/30 group-hover:scale-110 transition-transform">
                <g.icon className="h-6 w-6" />
              </span>

              <h3 className="mt-4 font-display font-700 text-lg text-emerald-deep">
                {g.title}
              </h3>
              <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                {g.desc}
              </p>
            </div>
          ))}
        </div>

        {/* dua band */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-emerald-deep to-emerald text-primary-foreground p-6 sm:p-8 emerald-glow relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px)",
              backgroundSize: "32px 32px, 40px 40px",
            }}
          />
          <div className="relative flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <p className="font-ar text-2xl text-gold-soft">اللهم تقبل</p>
            <p className="text-cream/90 leading-relaxed flex-1">
              “হে আল্লাহ! আমাদের দোষগুলো লুকিয়ে দিন, আমাদের ভালোবাসার রাসুল ﷺ-এর
              সামনে আমাদের সাদিক বলে পরিচয় করিয়ে দিন।”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
