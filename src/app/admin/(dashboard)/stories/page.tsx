"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Eye,
  EyeOff,
  Star,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

interface Story {
  id: string;
  name: string;
  slug: string;
  status: string;
  targetAmount: number;
  raisedAmount: number;
  featuredImage: string | null;
  tags: string | null;
  published: boolean;
  featured: boolean;
  createdAt: string;
  _count: { updates: number };
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  ongoing: { label: "চলমান", cls: "bg-emerald/15 text-emerald-deep border-emerald/30" },
  completed: { label: "সম্পন্ন", cls: "bg-gold/15 text-gold-deep border-gold/30" },
  planning: { label: "পরিকল্পনা", cls: "bg-muted text-muted-foreground border-border" },
};

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stories", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setStories(data.stories);
    } catch {
      toast({ title: "ত্রুটি", description: "গল্প লোড করা যায়নি।", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/stories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "delete failed");
      }
      setStories((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "মুছে ফেলা হয়েছে", description: `"${name}" মুছে ফেলা হয়েছে।` });
    } catch (err) {
      toast({
        title: "ত্রুটি",
        description: err instanceof Error ? err.message : "মুছতে সমস্যা।",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-800 text-2xl text-emerald-deep">
            চলমান গল্প
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stories.length} টি গল্প · ব্লগ হিসেবে ব্যবহার হয়
          </p>
        </div>
        <Button asChild className="bg-emerald-deep hover:bg-emerald text-primary-foreground">
          <Link href="/admin/stories/new">
            <Plus className="h-4 w-4 mr-1.5" />
            নতুন গল্প
          </Link>
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">এখনো কোনো গল্প নেই।</p>
          <Button asChild className="bg-emerald-deep hover:bg-emerald text-primary-foreground">
            <Link href="/admin/stories/new">
              <Plus className="h-4 w-4 mr-1.5" />
              প্রথম গল্প তৈরি করুন
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((s) => {
            const pct = percent(s.raisedAmount, s.targetAmount);
            const sBadge = STATUS_BADGE[s.status] ?? STATUS_BADGE.ongoing;
            return (
              <div
                key={s.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 hover:border-gold/40 transition-colors"
              >
                {/* Image */}
                {s.featuredImage ? (
                  <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-border">
                    <Image src={s.featuredImage} alt={s.name} fill sizes="64px" className="object-cover" />
                  </div>
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-600 text-sm text-foreground truncate">{s.name}</p>
                    <Badge className={`text-[9px] ${sBadge.cls}`}>{sBadge.label}</Badge>
                    {s.featured && (
                      <Badge className="text-[9px] bg-gold/20 text-gold-deep border-gold/30">
                        <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                        ফিচার্ড
                      </Badge>
                    )}
                    {s.published ? (
                      <Badge className="text-[9px] bg-emerald/10 text-emerald-deep border-emerald/20">
                        <Eye className="h-2.5 w-2.5 mr-0.5" />
                        প্রকাশিত
                      </Badge>
                    ) : (
                      <Badge className="text-[9px] bg-muted text-muted-foreground border-border">
                        <EyeOff className="h-2.5 w-2.5 mr-0.5" />
                        ড্রাফট
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] font-600 text-emerald-deep">
                      ৳{formatBDT(s.raisedAmount)} / ৳{formatBDT(s.targetAmount)}
                    </span>
                    <span className="text-[11px] text-gold-deep font-600">{pct}%</span>
                    <span className="text-[11px] text-muted-foreground inline-flex items-center gap-0.5">
                      <ListOrdered className="h-3 w-3" />
                      {s._count.updates} আপডেট
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button asChild variant="ghost" size="icon" className="h-9 w-9" title="আপডেট ব্যবস্থাপনা">
                    <Link href={`/admin/stories/${s.id}/updates`}>
                      <ListOrdered className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="h-9 w-9" title="সম্পাদনা">
                    <Link href={`/admin/stories/${s.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>গল্পটি মুছে ফেলবেন?</AlertDialogTitle>
                        <AlertDialogDescription>
                          সব আপডেটসহ মুছে যাবে। ফেরানো যাবে না।{" "}
                          <span className="font-500 text-foreground">{s.name}</span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>বাতিল</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(s.id, s.name)}
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
