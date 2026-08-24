"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Search,
  Trash2,
  Copy,
  Check,
  Loader2,
  ImagePlus,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { ImagePicker } from "@/components/admin/image-picker";

interface UploadItem {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  width: number;
  height: number;
  createdAt: string;
}

interface Meta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

/**
 * Media Library page.
 *
 * Features:
 *   - Grid of uploaded images (newest first)
 *   - Search by filename (debounced)
 *   - Copy public path to clipboard
 *   - Delete with confirmation (soft-delete + file removed from disk)
 *   - Upload new images via the reusable ImagePicker
 *   - Pagination ("Load more")
 *   - Stats header (total count)
 */
export default function AdminUploadsPage() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPage = useCallback(
    async (page: number, append: boolean, q: string) => {
      try {
        if (append) setLoadingMore(true);
        const params = new URLSearchParams({
          page: String(page),
          pageSize: "24",
        });
        if (q) params.set("q", q);

        const res = await fetch(`/api/admin/uploads?${params}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        setItems((prev) =>
          append ? [...prev, ...data.items] : data.items
        );
        setMeta(data.meta);
      } catch {
        toast({
          title: "ত্রুটি",
          description: "ছবি লোড করা যায়নি।",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [toast]
  );

  // Fetch on mount + when search or refresh changes
  useEffect(() => {
    setLoading(true);
    fetchPage(1, false, debouncedSearch);
  }, [fetchPage, debouncedSearch, refreshKey]);

  const handleCopy = async (item: UploadItem) => {
    try {
      await navigator.clipboard.writeText(item.path);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
      toast({
        title: "কপি হয়েছে",
        description: item.path,
      });
    } catch {
      toast({
        title: "ত্রুটি",
        description: "ক্লিপবোর্ডে কপি করা যায়নি।",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/uploads/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "delete failed");
      }
      // Remove from local list
      setItems((prev) => prev.filter((i) => i.id !== id));
      setMeta((prev) =>
        prev ? { ...prev, total: prev.total - 1 } : prev
      );
      toast({
        title: "মুছে ফেলা হয়েছে",
        description: "ছবিটি সফলভাবে মুছে ফেলা হয়েছে।",
      });
    } catch (err) {
      toast({
        title: "ত্রুটি",
        description:
          err instanceof Error ? err.message : "মুছতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-800 text-2xl text-emerald-deep">
            মিডিয়া লাইব্রেরি
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {meta
              ? `মোট ${meta.total} টি ছবি`
              : "আপলোড করা ছবি দেখুন, সার্চ করুন ও মুছুন"}
          </p>
        </div>

        {/* Quick upload via ImagePicker */}
        <div className="w-full sm:w-64">
          <ImagePicker
            value={null}
            onChange={() => {
              // Trigger refresh after upload
              setRefreshKey((k) => k + 1);
            }}
            label="দ্রুত আপলোড"
            hint="আপলোড করলে লাইব্রেরিতে যোগ হবে"
          />
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="ফাইলের নাম দিয়ে সার্চ করুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-10 h-11 max-w-md"
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

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImagePlus className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            {debouncedSearch
              ? `"${debouncedSearch}" এর জন্য কোনো ছবি পাওয়া যায়নি।`
              : "এখনো কোনো ছবি আপলোড করা হয়নি।"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((item) => (
              <ImageCard
                key={item.id}
                item={item}
                copied={copiedId === item.id}
                onCopy={() => handleCopy(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>

          {/* Load more */}
          {meta?.hasNext && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                disabled={loadingMore}
                onClick={() => fetchPage((meta?.page ?? 1) + 1, true, debouncedSearch)}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    লোড হচ্ছে...
                  </>
                ) : (
                  "আরও লোড করুন"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Single image card with hover actions
// ----------------------------------------------------------------

function ImageCard({
  item,
  copied,
  onCopy,
  onDelete,
}: {
  item: UploadItem;
  copied: boolean;
  onCopy: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card">
      <Image
        src={item.path}
        alt={item.filename}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
        className="object-cover"
      />

      {/* Hover overlay with actions */}
      <div className="absolute inset-0 bg-emerald-deep/0 group-hover:bg-emerald-deep/60 transition-colors flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
        {/* Top-right actions */}
        <div className="flex justify-end gap-1.5">
          <button
            onClick={onCopy}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-card/90 text-emerald-deep hover:bg-card shadow-sm transition-colors"
            title="পাথ কপি করুন"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-card/90 text-destructive hover:bg-red-50 shadow-sm transition-colors"
                title="মুছে ফেলুন"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ছবিটি মুছে ফেলবেন?</AlertDialogTitle>
                <AlertDialogDescription>
                  এই কাজটি ফেরানো যাবে না। ফাইলটি ডিস্ক থেকে মুছে যাবে।
                  <br />
                  <span className="font-500 text-foreground">
                    {item.filename}
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  মুছে ফেলুন
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Bottom info */}
        <div className="space-y-0.5">
          <p className="text-[11px] text-cream truncate font-500">
            {item.filename}
          </p>
          <div className="flex items-center gap-1.5">
            <Badge className="text-[9px] bg-cream/20 text-cream border-0">
              {item.width}×{item.height}
            </Badge>
            <Badge className="text-[9px] bg-cream/20 text-cream border-0">
              {fmtSize(item.size)}
            </Badge>
          </div>
          <p className="text-[9px] text-cream/70 truncate font-mono">
            {item.path}
          </p>
        </div>
      </div>
    </div>
  );
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
