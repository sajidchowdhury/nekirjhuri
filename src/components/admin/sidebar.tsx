"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  /** Minimum role required to see this nav item. */
  role: "editor" | "super_admin";
}

/**
 * Admin sidebar navigation.
 * Shows nav items based on the user's role:
 *   - editor: dashboard, needs, donations, stories, projects, uploads
 *   - super_admin: all of the above + modules, settings, users
 */
const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, phase: "9", role: "editor" },
  {
    href: "/admin/modules",
    label: "দুনিয়াবি মডিউল",
    icon: ShoppingBag,
    phase: "4",
    role: "super_admin",
  },
  {
    href: "/admin/needs",
    label: "উম্মাহর প্রয়োজন",
    icon: HeartHandshake,
    phase: "5",
    role: "editor",
  },
  {
    href: "/admin/donations",
    label: "ডোনেশন",
    icon: Wallet,
    phase: "6",
    role: "editor",
  },
  {
    href: "/admin/stories",
    label: "চলমান গল্প",
    icon: BookOpen,
    phase: "7",
    role: "editor",
  },
  {
    href: "/admin/projects",
    label: "স্থায়ী প্রজেক্ট",
    icon: Building2,
    phase: "8",
    role: "editor",
  },
  {
    href: "/admin/settings",
    label: "সাইট সেটিংস",
    icon: Settings,
    phase: "3",
    role: "super_admin",
  },
  {
    href: "/admin/uploads",
    label: "মিডিয়া লাইব্রেরি",
    icon: ImageIcon,
    phase: "2",
    role: "editor",
  },
  {
    href: "/admin/users",
    label: "ইউজার ম্যানেজমেন্ট",
    icon: Users,
    phase: "10",
    role: "super_admin",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role ?? "editor";

  // Filter nav items by role
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (userRole === "super_admin") return true;
    return item.role === "editor";
  });

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
          {visibleItems.map((item) => {
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
