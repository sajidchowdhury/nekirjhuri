"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  HeartHandshake,
  Wallet,
  BookOpen,
  Building2,
  Settings,
  Image as ImageIcon,
  Users,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  phase: string;
}

/**
 * Admin sidebar navigation.
 * Lists every admin section with its phase label.
 * Routes that don't have their phase implemented yet show a
 * "Coming in Phase X" empty state (handled by the page itself).
 */
const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, phase: "9" },
  {
    href: "/admin/modules",
    label: "দুনিয়াবি মডিউল",
    icon: ShoppingBag,
    phase: "4",
  },
  {
    href: "/admin/needs",
    label: "উম্মাহর প্রয়োজন",
    icon: HeartHandshake,
    phase: "5",
  },
  {
    href: "/admin/donations",
    label: "ডোনেশন",
    icon: Wallet,
    phase: "6",
  },
  {
    href: "/admin/stories",
    label: "চলমান গল্প",
    icon: BookOpen,
    phase: "7",
  },
  {
    href: "/admin/projects",
    label: "স্থায়ী প্রজেক্ট",
    icon: Building2,
    phase: "8",
  },
  {
    href: "/admin/settings",
    label: "সাইট সেটিংস",
    icon: Settings,
    phase: "3",
  },
  {
    href: "/admin/uploads",
    label: "মিডিয়া লাইব্রেরি",
    icon: ImageIcon,
    phase: "2",
  },
  {
    href: "/admin/users",
    label: "ইউজার ম্যানেজমেন্ট",
    icon: Users,
    phase: "10",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-deep to-emerald text-primary-foreground ring-1 ring-gold/30">
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
          </svg>
        </span>
        <div className="leading-tight">
          <p className="font-display font-700 text-sm text-emerald-deep">
            নেকির ঝুড়ি
          </p>
          <p className="text-[10px] text-muted-foreground">অ্যাডমিন প্যানেল</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto custom-scroll p-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-500 transition-colors ${
                    isActive
                      ? "bg-emerald-deep text-primary-foreground shadow-sm"
                      : "text-foreground/75 hover:bg-emerald-soft/50 hover:text-emerald-deep"
                  }`}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-600 ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    P{item.phase}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          এই ফার্মের মালিক আল্লাহ তায়ালা
          <br />
          আমরা শুধু প্রতিনিধি
        </p>
      </div>
    </aside>
  );
}
