"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  HeartHandshake,
  Users,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatBDT, percent } from "@/lib/types";

interface Need {
  id: string;
  title: string;
  slug: string | null;
  summary: string;
  category: string;
  location: string | null;
  targetAmount: number;
  raisedAmount: number;
  image: string | null;
  urgency: string;
  beneficiary: string | null;
  status: string;
  donorCount: number;
  createdAt: string;
}

const CATEGORIES = [
  { value: "all", label: "সব ক্যাটাগরি" },
  { value: "madrasa", label: "মাদরাসা" },
  { value: "student", label: "ছাত্র" },
  { value: "medical", label: "চিকিৎসা" },
  { value: "family", label: "পরিবার" },
  { value: "emergency", label: "জরুরি ত্রাণ" },
  { value: "general", label: "সাধারণ" },
];

const URGENCIES = [
  { value: "all", label: "সব জরুরি" },
  { value: "critical", label: "জরুরি" },
  { value: "high", label: "গুরুত্বপূর্ণ" },
  { value: "normal", label: "সাধারণ" },
];

const STATUSES = [
  { value: "all", label: "সব স্ট্যাটাস" },
  { value: "active", label: "সক্রিয়" },
  { value: "funded", label: "পূর্ণ" },
  { value: "closed", label: "বন্ধ" },
];

const URGENCY_BADGE: Record<string, { label: string; cls: string }> = {
  critical: { label: "জরুরি", cls: "bg-red-100 text-red-700 border-red-200" },
  high: { label: "গুরুত্বপূর্ণ", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  normal: { label: "সাধারণ", cls: "bg-muted text-muted-foreground border-border" },
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active: { label: "সক্রিয়", cls: "bg-emerald/15 text-emerald-deep border-emerald/30" },
  funded: { label: "পূর্ণ", cls: "bg-gold/15 text-gold-deep border-gold/30" },
  closed: { label: "বন্ধ", cls: "bg-muted text-muted-foreground border-border" },
};

export default function AdminNeedsPage() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [status, setStatus] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchNeeds = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (urgency !== "all") params.set("urgency", urgency);
      if (status !== "all") params.set("status", status);
      if (debouncedSearch) params.set("q", debouncedSearch);

      const res = await fetch(`/api/admin/needs?${params}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setNeeds(data.needs);
    } catch {
      toast({
        title: "ত্রুটি",
        description: "প্রয়োজন লোড করা যায়নি।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [category, urgency, status, debouncedSearch, toast]);

  useEffect(() => {
    fetchNeeds();
  }, [fetchNeeds]);

  const handleDelete = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/admin/needs/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "delete failed");
      }
      setNeeds((prev) => prev.filter((n) => n.id !== id));
      toast({
        title: "মুছে ফেলা হয়েছে",
        description: `"${title}" মুছে ফেলা হয়েছে।`,
      });
    } catch (err) {
      toast({
        title: "ত্রুটি",
        description: err instanceof Error ? err.message : "মুছতে সমস্যা।",
        variant: "destructive",
      });
    }
  };

  const hasFilters =
    category !== "all" || urgency !== "all" || status !== "all" || !!search;

  const clearFilters = () => {
    setCategory("all");
    setUrgency("all");
    setStatus("all");
    setSearch("");
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-800 text-2xl text-emerald-deep">
            উম্মাহর প্রয়োজন
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {needs.length} টি প্রয়োজন
          </p>
        </div>
        <Button asChild className="bg-emerald-deep hover:bg-emerald text-primary-foreground">
          <Link href="/admin/needs/new">
            <Plus className="h-4 w-4 mr-1.5" />
            নতুন প্রয়োজন
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="শিরোনাম দিয়ে সার্চ করুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {URGENCIES.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              ফিল্টার মুছুন
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : needs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <HeartHandshake className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {hasFilters
              ? "ফিল্টারের সাথে মিলে এমন কোনো প্রয়োজন নেই।"
              : "এখনো কোনো প্রয়োজন তৈরি করা হয়নি।"}
          </p>
          {!hasFilters && (
            <Button asChild className="bg-emerald-deep hover:bg-emerald text-primary-foreground">
              <Link href="/admin/needs/new">
                <Plus className="h-4 w-4 mr-1.5" />
                প্রথম প্রয়োজন তৈরি করুন
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {needs.map((need) => {
            const pct = percent(need.raisedAmount, need.targetAmount);
            const uBadge = URGENCY_BADGE[need.urgency] ?? URGENCY_BADGE.normal;
            const sBadge = STATUS_BADGE[need.status] ?? STATUS_BADGE.closed;
            return (
              <div
                key={need.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 hover:border-gold/40 transition-colors"
              >
                {/* Image */}
                {need.image ? (
                  <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-border">
                    <Image
                      src={need.image}
                      alt={need.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                    <HeartHandshake className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-600 text-sm text-foreground truncate">
                      {need.title}
                    </p>
                    <Badge className={`text-[9px] ${uBadge.cls}`}>{uBadge.label}</Badge>
                    <Badge className={`text-[9px] ${sBadge.cls}`}>{sBadge.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {need.summary}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] font-600 text-emerald-deep">
                      ৳{formatBDT(need.raisedAmount)} / ৳{formatBDT(need.targetAmount)}
                    </span>
                    <span className="text-[11px] text-gold-deep font-600">{pct}%</span>
                    {need.beneficiary && (
                      <span className="text-[11px] text-muted-foreground inline-flex items-center gap-0.5">
                        <Users className="h-3 w-3" />
                        {need.beneficiary}
                      </span>
                    )}
                    {need.location && (
                      <span className="text-[11px] text-muted-foreground inline-flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {need.location}
                      </span>
                    )}
                    {need.donorCount > 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        {need.donorCount} ডোনার
                      </span>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden max-w-xs">
                    <div
                      className="h-full progress-fill rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                    <Link href={`/admin/needs/${need.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>প্রয়োজনটি মুছে ফেলবেন?</AlertDialogTitle>
                        <AlertDialogDescription>
                          এই কাজটি ফেরানো যাবে না।{" "}
                          <span className="font-500 text-foreground">{need.title}</span>{" "}
                          স্থায়ীভাবে মুছে যাবে।
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>বাতিল</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(need.id, need.title)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          মুছে ফেলুন
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
