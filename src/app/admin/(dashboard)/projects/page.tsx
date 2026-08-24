"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Users,
  Wallet,
  ExternalLink,
  Eye,
  EyeOff,
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
import { formatBDT } from "@/lib/types";

interface Project {
  id: string;
  name: string;
  slug: string | null;
  type: string;
  location: string | null;
  beneficiaries: number;
  monthlyCost: number;
  establishedAt: string | null;
  image: string | null;
  gallery: string | null;
  isActive: boolean;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  madrasha: "মাদরাসা",
  moktob: "মক্তব",
  orphanage: "এতিমখানা",
  clinic: "ক্লিনিক",
  mosque: "মসজিদ",
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/fixed-projects", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setProjects(data.projects);
    } catch {
      toast({ title: "ত্রুটি", description: "প্রজেক্ট লোড করা যায়নি।", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/fixed-projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "delete failed");
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "মুছে ফেলা হয়েছে", description: `"${name}" মুছে ফেলা হয়েছে।` });
    } catch (err) {
      toast({
        title: "ত্রুটি",
        description: err instanceof Error ? err.message : "মুছতে সমস্যা।",
        variant: "destructive",
      });
    }
  };

  const totalMonthly = projects
    .filter((p) => p.isActive)
    .reduce((s, p) => s + p.monthlyCost, 0);
  const totalBeneficiaries = projects
    .filter((p) => p.isActive)
    .reduce((s, p) => s + p.beneficiaries, 0);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-800 text-2xl text-emerald-deep">
            স্থায়ী প্রজেক্ট
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects.length} টি · উপকৃত {totalBeneficiaries} · মাসিক ৳{formatBDT(totalMonthly)}
          </p>
        </div>
        <Button asChild className="bg-emerald-deep hover:bg-emerald text-primary-foreground">
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4 mr-1.5" />
            নতুন প্রজেক্ট
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
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">এখনো কোনো প্রজেক্ট নেই।</p>
          <Button asChild className="bg-emerald-deep hover:bg-emerald text-primary-foreground">
            <Link href="/admin/projects/new">
              <Plus className="h-4 w-4 mr-1.5" />
              প্রথম প্রজেক্ট তৈরি করুন
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            const galleryCount = p.gallery ? JSON.parse(p.gallery).length : 0;
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 hover:border-gold/40 transition-colors"
              >
                {/* Image */}
                {p.image ? (
                  <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-border">
                    <Image src={p.image} alt={p.name} fill sizes="64px" className="object-cover" />
                  </div>
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-600 text-sm text-foreground truncate">{p.name}</p>
                    <Badge className="text-[9px] bg-emerald/15 text-emerald-deep border-emerald/30">
                      {TYPE_LABELS[p.type] ?? p.type}
                    </Badge>
                    {p.isActive ? (
                      <Badge className="text-[9px] bg-emerald/10 text-emerald-deep border-emerald/20">
                        <Eye className="h-2.5 w-2.5 mr-0.5" />সক্রিয়
                      </Badge>
                    ) : (
                      <Badge className="text-[9px] bg-muted text-muted-foreground border-border">
                        <EyeOff className="h-2.5 w-2.5 mr-0.5" />নিষ্ক্রিয়
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-[11px] text-muted-foreground inline-flex items-center gap-0.5">
                      <Users className="h-3 w-3" />
                      {p.beneficiaries} উপকৃত
                    </span>
                    <span className="text-[11px] font-600 text-emerald-deep inline-flex items-center gap-0.5">
                      <Wallet className="h-3 w-3" />
                      ৳{formatBDT(p.monthlyCost)}/মাস
                    </span>
                    {p.location && (
                      <span className="text-[11px] text-muted-foreground">{p.location}</span>
                    )}
                    {galleryCount > 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        {galleryCount} ছবি
                      </span>
                    )}
                    {p.slug && (
                      <Link
                        href={`/projects/${p.slug}`}
                        className="text-[11px] text-emerald-deep hover:underline inline-flex items-center gap-0.5"
                      >
                        /projects/{p.slug}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                    <Link href={`/admin/projects/${p.id}/edit`}>
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
                        <AlertDialogTitle>প্রজেক্টটি মুছে ফেলবেন?</AlertDialogTitle>
                        <AlertDialogDescription>
                          এই কাজটি ফেরানো যাবে না।{" "}
                          <span className="font-500 text-foreground">{p.name}</span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>বাতিল</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(p.id, p.name)}
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
