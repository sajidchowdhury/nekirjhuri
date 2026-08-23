"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ImagePlus,
  UploadCloud,
  X,
  Check,
  Loader2,
  Library,
  FileImage,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface UploadedImageItem {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  width: number;
  height: number;
  createdAt: string;
}

interface ImagePickerProps {
  /** Current value: the public path of the selected image (or null/empty). */
  value?: string | null;
  /** Called when the user selects an image (receives the public path). */
  onChange: (path: string) => void;
  /** Label for the field (shown above the trigger button). */
  label?: string;
  /** Optional helper text. */
  hint?: string;
}

/**
 * Reusable image picker.
 *
 * - Trigger button shows a thumbnail preview of the current value, or
 *   a "Select image" prompt if empty.
 * - Opens a Dialog with two tabs:
 *   - Upload: drag-drop zone + file input. Posts to /api/admin/upload,
 *     on success switches to Library + auto-selects the new image.
 *   - Library: paginated grid of recent uploads from /api/admin/uploads.
 *     Click an image to select it.
 * - "Remove" button clears the value (sets to empty string).
 *
 * Usage in any admin form:
 *   <ImagePicker value={form.image} onChange={(p) => form.set("image", p)} />
 */
export function ImagePicker({
  value,
  onChange,
  label = "ছবি",
  hint,
}: ImagePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-600 text-emerald-deep">{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            সরান
          </button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className={cn(
              "group relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
              value
                ? "border-emerald/30 bg-emerald-soft/20"
                : "border-border bg-muted/30 hover:border-gold/50 hover:bg-muted/50"
            )}
          >
            {value ? (
              <>
                <Image
                  src={value}
                  alt="Selected"
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-emerald-deep/0 group-hover:bg-emerald-deep/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-600 text-emerald-deep shadow">
                    <ImagePlus className="h-3.5 w-3.5" />
                    পরিবর্তন করুন
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center px-4">
                <ImagePlus className="h-7 w-7 mx-auto text-muted-foreground mb-1.5" />
                <p className="text-xs font-500 text-muted-foreground">
                  ছবি নির্বাচন করুন
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  ক্লিক করে আপলোড বা লাইব্রেরি থেকে বাছাই
                </p>
              </div>
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-deep">
              <FileImage className="h-5 w-5" />
              ছবি নির্বাচন করুন
            </DialogTitle>
          </DialogHeader>

          <PickerBody
            value={value}
            onSelect={(path) => {
              onChange(path);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * The body of the picker dialog — two tabs (Upload + Library).
 * Split out so the trigger dialog can stay unmounted when closed.
 */
function PickerBody({
  value,
  onSelect,
}: {
  value?: string | null;
  onSelect: (path: string) => void;
}) {
  const [tab, setTab] = useState<"upload" | "library">("library");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as "upload" | "library")}
      className="flex-1 flex flex-col overflow-hidden"
    >
      <TabsList className="grid w-full grid-cols-2 max-w-xs">
        <TabsTrigger value="library" className="gap-1.5">
          <Library className="h-3.5 w-3.5" />
          লাইব্রেরি
        </TabsTrigger>
        <TabsTrigger value="upload" className="gap-1.5">
          <UploadCloud className="h-3.5 w-3.5" />
          আপলোড
        </TabsTrigger>
      </TabsList>

      <TabsContent value="library" className="flex-1 mt-3 overflow-hidden">
        <LibraryGrid
          key={refreshKey}
          value={value}
          onSelect={onSelect}
        />
      </TabsContent>

      <TabsContent value="upload" className="flex-1 mt-3 overflow-hidden">
        <UploadZone
          onUploaded={() => {
            // Switch to library + force refresh to show the new image
            setTab("library");
            setRefreshKey((k) => k + 1);
          }}
          onSelect={onSelect}
        />
      </TabsContent>
    </Tabs>
  );
}

// ----------------------------------------------------------------
// Library tab — paginated grid of recent uploads
// ----------------------------------------------------------------

function LibraryGrid({
  value,
  onSelect,
}: {
  value?: string | null;
  onSelect: (path: string) => void;
}) {
  const [items, setItems] = useState<UploadedImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(async (p: number, append: boolean) => {
    try {
      if (append) setLoadingMore(true);
      const res = await fetch(
        `/api/admin/uploads?page=${p}&pageSize=24`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setItems((prev) =>
        append ? [...prev, ...data.items] : data.items
      );
      setHasMore(data.meta.hasNext);
      setPage(p);
    } catch {
      setError("ছবি লোড করা যায়নি।");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  if (loading) {
    return (
      <ScrollArea className="h-[50vh]">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </ScrollArea>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center gap-2">
        <Library className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          লাইব্রেরি খালি। প্রথম ছবি আপলোড করুন।
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[50vh]">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-1">
        {items.map((item) => {
          const selected = value === item.path;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.path)}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                selected
                  ? "border-emerald-deep ring-2 ring-emerald/30"
                  : "border-transparent hover:border-gold/50"
              )}
            >
              <Image
                src={item.path}
                alt={item.filename}
                fill
                sizes="(max-width: 640px) 33vw, 25vw"
                className="object-cover"
              />
              {selected && (
                <div className="absolute inset-0 bg-emerald-deep/40 flex items-center justify-center">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-deep text-primary-foreground">
                    <Check className="h-5 w-5" />
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-emerald-deep/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] text-cream truncate">
                  {item.filename}
                </p>
                <p className="text-[9px] text-cream/70">
                  {item.width}×{item.height} · {fmtSize(item.size)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {hasMore && (
        <div className="p-3 text-center">
          <Button
            variant="outline"
            size="sm"
            disabled={loadingMore}
            onClick={() => fetchPage(page + 1, true)}
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                লোড হচ্ছে...
              </>
            ) : (
              "আরও লোড করুন"
            )}
          </Button>
        </div>
      )}
    </ScrollArea>
  );
}

// ----------------------------------------------------------------
// Upload tab — drag-drop zone
// ----------------------------------------------------------------

function UploadZone({
  onUploaded,
  onSelect,
}: {
  onUploaded: () => void;
  onSelect: (path: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      setProgress(`${(file.size / 1024).toFixed(0)} KB আপলোড হচ্ছে...`);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "আপলোড ব্যর্থ");
        }

        setProgress("✅ সফল! লাইব্রেরিতে যোগ হয়েছে।");
        // Auto-select the new image
        onSelect(data.path);
        // Switch to library tab + refresh
        onUploaded();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "আপলোডে সমস্যা হয়েছে।"
        );
        setProgress(null);
      } finally {
        setUploading(false);
      }
    },
    [onSelect, onUploaded]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setError("শুধুমাত্র ছবি ফাইল আপলোড করুন।");
        return;
      }
      uploadFile(file);
    },
    [uploadFile]
  );

  return (
    <div className="flex flex-col gap-3 h-[50vh]">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-colors p-6",
          dragging
            ? "border-emerald-deep bg-emerald-soft/30"
            : "border-border bg-muted/30 hover:border-gold/50 hover:bg-muted/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />

        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 text-emerald-deep animate-spin mb-3" />
            <p className="text-sm font-500 text-emerald-deep">{progress}</p>
          </>
        ) : (
          <>
            <UploadCloud
              className={cn(
                "h-10 w-10 mb-3 transition-colors",
                dragging ? "text-emerald-deep" : "text-muted-foreground"
              )}
            />
            <p className="text-sm font-600 text-foreground">
              ছবি টেনে এনে ছাড়ুন
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              অথবা ক্লিক করে ব্রাউজ করুন
            </p>
            <div className="flex gap-1.5 mt-3">
              <Badge variant="secondary" className="text-[10px]">
                PNG
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                JPEG
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                WebP
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                সর্বোচ্চ ৫ MB
              </Badge>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <X className="h-4 w-4" />
          {error}
        </p>
      )}

      <p className="text-xs text-muted-foreground text-center">
        ছবি স্বয়ংক্রিয়ভাবে WebP তে অপটিমাইজ হবে (সর্বোচ্চ ১৬০০px, q৮০)
      </p>
    </div>
  );
}

// ----------------------------------------------------------------
// helpers
// ----------------------------------------------------------------

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
