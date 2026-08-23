"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

const NAV = [
  { href: "#concept", label: "কনসেপ্ট" },
  { href: "#success", label: "সফলতা" },
  { href: "#needs", label: "উম্মাহর প্রয়োজন" },
  { href: "#story", label: "চলমান গল্প" },
  { href: "#projects", label: "স্থায়ী প্রজেক্ট" },
  { href: "#how", label: "কিভাবে কাজ করে" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-gold/25 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="#top" className="flex items-center gap-2.5 group">
            <BasketMark />
            <div className="leading-tight">
              <span className="font-display font-700 text-lg sm:text-xl text-emerald-deep tracking-tight">
                নেকির ঝুড়ি
              </span>
              <span className="block text-[10px] sm:text-[11px] text-muted-foreground -mt-0.5 font-ar tracking-wide">
                بسم الله الرحمن الرحيم
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-500 text-foreground/80 hover:text-emerald-deep hover:bg-emerald-soft/50 rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              className="hidden sm:inline-flex bg-emerald-deep hover:bg-emerald text-primary-foreground rounded-full shadow-sm"
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
                  className="lg:hidden rounded-full"
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
                    <BasketMark />
                    <span className="font-display font-700 text-lg text-emerald-deep">
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
                  {NAV.map((item) => (
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

function BasketMark() {
  return (
    <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-deep to-emerald text-primary-foreground shadow-sm ring-1 ring-gold/40">
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
      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-background" />
    </span>
  );
}
