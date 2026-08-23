export function SuccessVision() {
  return (
    <section id="success" className="relative py-16 lg:py-24 bg-cream-deep/60 overflow-hidden">
      {/* decorative ornamental rings */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full border border-gold/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/3 h-40 w-40 rounded-full border border-gold/10"
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* dua band */}
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-deep via-emerald to-emerald-deep text-primary-foreground p-8 sm:p-12 lg:p-16 emerald-glow overflow-hidden">
          {/* dotted star pattern overlay */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px), radial-gradient(circle at 50% 80%, white 1px, transparent 1px)",
              backgroundSize: "32px 32px, 40px 40px, 28px 28px",
            }}
          />
          {/* gold corner ornaments */}
          <div
            aria-hidden
            className="absolute top-4 left-4 h-10 w-10 border-t-2 border-l-2 border-gold/40 rounded-tl-xl"
          />
          <div
            aria-hidden
            className="absolute top-4 right-4 h-10 w-10 border-t-2 border-r-2 border-gold/40 rounded-tr-xl"
          />
          <div
            aria-hidden
            className="absolute bottom-4 left-4 h-10 w-10 border-b-2 border-l-2 border-gold/40 rounded-bl-xl"
          />
          <div
            aria-hidden
            className="absolute bottom-4 right-4 h-10 w-10 border-b-2 border-r-2 border-gold/40 rounded-br-xl"
          />

          <div className="relative text-center">
            <p className="font-ar text-3xl sm:text-4xl text-gold mb-5 tracking-wide">
              اللهم تقبل
            </p>

            {/* gold divider with ornament */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/60" />
              <span className="text-gold text-sm">۞</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/60" />
            </div>

            <p className="font-display font-600 text-xl sm:text-2xl lg:text-3xl text-cream leading-relaxed max-w-3xl mx-auto">
              “হে আল্লাহ! আমাদের দোষগুলো লুকিয়ে দিন, আমাদের ভালোবাসার রাসুল ﷺ-এর
              সামনে আমাদের সাদিক বলে পরিচয় করিয়ে দিন।”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
