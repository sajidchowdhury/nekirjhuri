"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/**
 * Admin topbar.
 * Shows the authenticated user's name/email/role + a logout button.
 * Also has a mobile menu trigger (sidebar is hidden on mobile — a
 * future session will add a mobile drawer; for now the icon is a
 * placeholder).
 */
export function AdminTopbar() {
  const { data: session } = useSession();

  const name = session?.user?.name ?? "Admin";
  const email = session?.user?.email ?? "";
  const role = session?.user?.role ?? "editor";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/95 backdrop-blur px-4 lg:px-6">
      {/* Mobile menu (placeholder — drawer comes in a polish session) */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden rounded-full"
        aria-label="মেনু"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title (can be made dynamic later) */}
      <div className="hidden lg:block">
        <h1 className="font-display font-700 text-base text-emerald-deep">
          অ্যাডমিন প্যানেল
        </h1>
      </div>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 rounded-full border border-border bg-card pl-1.5 pr-3 py-1.5 hover:border-gold/40 transition-colors">
            <Avatar className="h-8 w-8 bg-emerald-deep">
              <AvatarFallback className="bg-emerald-deep text-primary-foreground text-xs font-700">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-600 text-foreground">{name}</p>
              <p className="text-[10px] text-muted-foreground">{email}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span className="truncate">{name}</span>
            <Badge
              className={`ml-2 text-[9px] ${
                role === "super_admin"
                  ? "bg-emerald-deep text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {role === "super_admin" ? "সুপার অ্যাডমিন" : "এডিটর"}
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            লগআউট
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
