import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  light?: boolean;
}) {
  const isCenter = align === "center";
  return (
    <div
      className={`${isCenter ? "text-center mx-auto" : "text-left"} max-w-3xl`}
    >
      {eyebrow && (
        <div
          className={`flex items-center gap-2 mb-3 ${
            isCenter ? "justify-center" : ""
          }`}
        >
          <span className="h-px w-6 bg-gold/60" />
          <span className="text-xs font-600 uppercase tracking-[0.18em] text-gold-deep">
            {eyebrow}
          </span>
          <span className="h-px w-6 bg-gold/60" />
        </div>
      )}
      <h2
        className={`font-display font-800 text-3xl sm:text-4xl lg:text-5xl leading-tight ${
          light ? "text-cream" : "text-emerald-deep"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base sm:text-lg leading-relaxed ${
            light ? "text-cream/75" : "text-foreground/70"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
