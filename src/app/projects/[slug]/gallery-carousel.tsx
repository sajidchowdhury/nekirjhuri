"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Simple image gallery carousel for the project detail page.
 * Shows one image at a time with prev/next buttons + dot indicators.
 * Clicking an image opens it full-size in a new tab.
 */
export function GalleryCarousel({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);

  const goPrev = useCallback(
    () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length]
  );
  const goNext = useCallback(
    () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length]
  );

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden border border-border">
        <Image
          src={images[0]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 1024px"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden border border-border group">
        <Image
          src={images[index]}
          alt={`${alt} — ${index + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 1024px"
          className="object-cover transition-opacity duration-300"
          priority
        />

        {/* Prev/next buttons */}
        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-emerald-deep/70 hover:bg-emerald-deep text-primary-foreground flex items-center justify-center backdrop-blur transition-colors"
          aria-label="পূর্ববর্তী"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-emerald-deep/70 hover:bg-emerald-deep text-primary-foreground flex items-center justify-center backdrop-blur transition-colors"
          aria-label="পরবর্তী"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Counter */}
        <div className="absolute bottom-2 right-2 rounded-full bg-emerald-deep/70 px-3 py-1 text-xs font-600 text-cream backdrop-blur">
          {index + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto custom-scroll pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`relative h-16 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
              i === index
                ? "border-emerald-deep ring-2 ring-emerald/30"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${i + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
