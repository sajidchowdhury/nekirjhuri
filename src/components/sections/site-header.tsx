"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

const DEFAULT_NAV = [
  { href: "#concept", label: "কনসেপ্ট" },
  { href: "#success", label: "সফলতা" },
  { href: "#needs", label: "উম্মাহর প্রয়োজন" },
  { href: "#story", label: "চলমান গল্প" },
  { href: "#projects", label: "স্থায়ী প্রজেক্ট" },
  { href: "#how", label: "কিভাবে কাজ করে" },
];

interface SiteSettings {
  logo: string | null;
  navItems: string | null;
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  // Parse nav items from settings, fall back to defaults
  let nav = DEFAULT_NAV;
  if (settings?.navItems) {
    try {
      const parsed = JSON.parse(settings.navItems);
      if (Array.isArray(parsed) && parsed.length > 0) {
        nav = parsed.filter(
          (item: { label?: string; href?: string }) => item.label && item.href
        );
      }
    } catch {
      /* use defaults */
    }
  }

  const logo = settings?.logo || null;

  // When not scrolled (over hero), use light/cream text for contrast
  // against the dark emerald hero. When scrolled, use dark text on light bg.
  const onHero = !scrolled;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-gold/25 shadow-sm"
          : "bg-gradient-to-b from-emerald-deep/40 to-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
          {/* Logo — creative text logo */}
          <Link href="#top" className="flex items-center gap-2.5 group shrink-0">
            <BasketMark onHero={onHero} />
            <div className="flex flex-col leading-none">
              <span
                className={`font-display font-800 text-lg sm:text-xl tracking-tight transition-colors ${
                  onHero ? "text-cream" : "text-emerald-deep"
                }`}
                style={{ textShadow: onHero ? "0 2px 8px rgba(0,0,0,0.3)" : "none" }}
              >
                নেকির ঝুড়ি
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-ar tracking-wider mt-0.5 transition-colors ${
                  onHero ? "text-gold-soft" : "text-gold-deep"
                }`}
              >
                بِسْمِ اللَّهِ
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm font-500 rounded-md transition-all ${
                  onHero
                    ? "text-cream/90 hover:text-gold hover:bg-cream/10"
                    : "text-foreground/80 hover:text-emerald-deep hover:bg-emerald-soft/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              className={`hidden sm:inline-flex rounded-full shadow-sm transition-all ${
                onHero
                  ? "bg-gold hover:bg-gold-deep text-emerald-deep"
                  : "bg-emerald-deep hover:bg-emerald text-primary-foreground"
              }`}
            >
              <Link href="#needs">
                <Heart className="h-4 w-4 mr-1.5" />
                অবদান রাখুন
              </Link>
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`lg:hidden rounded-full transition-colors ${
                    onHero ? "text-cream hover:bg-cream/10" : "text-foreground hover:bg-muted"
                  }`}
                  aria-label="মেনু"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] bg-background border-gold/25"
              >
                <SheetTitle className="sr-only">নেভিগেশন</SheetTitle>
                <div className="flex items-center justify-between mt-2 mb-6">
                  <div className="flex items-center gap-2">
                    <BasketMark onHero={false} />
                    <span className="font-display font-800 text-lg text-emerald-deep">
                      নেকির ঝুড়ি
                    </span>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col gap-1">
                  {nav.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className="px-4 py-3 rounded-lg text-foreground/85 hover:bg-emerald-soft/60 hover:text-emerald-deep font-500 transition-colors"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <Button
                  asChild
                  className="mt-6 w-full bg-emerald-deep hover:bg-emerald text-primary-foreground rounded-full"
                >
                  <Link href="#needs">
                    <Heart className="h-4 w-4 mr-1.5" />
                    অবদান রাখুন
                  </Link>
                </Button>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function BasketMark({ onHero }: { onHero: boolean }) {
  return (
    <span
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition-all ${
        onHero
          ? "bg-gradient-to-br from-gold to-gold-deep text-emerald-deep ring-1 ring-gold/50"
          : "bg-gradient-to-br from-emerald-deep to-emerald text-primary-foreground ring-1 ring-gold/30"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 9h18l-1.6 9.2A2 2 0 0 1 17.4 20H6.6a2 2 0 0 1-2-1.8L3 9Z" />
        <path d="M8 9V6a4 4 0 0 1 8 0v3" />
        <path d="M3 9h18" />
        <path d="M9 13v3M15 13v3M12 13v3" />
      </svg>
      <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ring-2 ring-background ${
        onHero ? "bg-cream" : "bg-gold"
      }`} />
    </span>
  );
}
