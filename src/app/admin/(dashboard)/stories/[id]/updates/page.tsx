"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Calendar,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { formatBDT } from "@/lib/types";

interface Update {
  id: string;
  title: string;
  description: string;
  body: string | null;
  image: string | null;
  collectedAmount: number;
  neededAmount: number;
  published: boolean;
  date: string;
}

export default function StoryUpdatesPage() {
  const params = useParams<{ id: string }>();
  const storyId = params.id;
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [storyName, setStoryName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUpdates = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/stories/${storyId}/updates`, { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setUpdates(data.updates);
    } catch {
      toast({ title: "ত্রুটি", description: "আপডেট লোড করা যায়নি।", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [storyId, toast]);

  const fetchStory = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/stories/${storyId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setStoryName(data.name);
    } catch { /* ignore */ }
  }, [storyId]);

  useEffect(() => {
    fetchUpdates();
    fetchStory();
  }, [fetchUpdates, fetchStory]);

  const handleDelete = async (updateId: string) => {
    try {
      const res = await fetch(`/api/admin/stories/${storyId}/updates/${updateId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      setUpdates((prev) => prev.filter((u) => u.id !== updateId));
      toast({ title: "মুছে ফেলা হয়েছে" });
    } catch {
      toast({ title: "ত্রুটি", description: "মুছতে সমস্যা।", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <Link
        href="/admin/stories"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-deep transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        গল্প তালিকায় ফিরুন
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-800 text-2xl text-emerald-deep">
            টাইমলাইন আপডেট
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {storyName ? `"${storyName}"` : ""} — {updates.length} টি আপডেট
          </p>
        </div>
        <UpdateDialog
          storyId={storyId}
          open={dialogOpen}
          onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingId(null); }}
          editingId={editingId}
          existing={editingId ? updates.find((u) => u.id === editingId) : null}
          onSaved={() => { fetchUpdates(); setEditingId(null); }}
        />
        <Button
          className="bg-emerald-deep hover:bg-emerald text-primary-foreground"
          onClick={() => { setEditingId(null); setDialogOpen(true); }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          নতুন আপডেট
        </Button>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : updates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            এখনো কোনো আপডেট নেই। প্রথম আপডেট যোগ করুন।
          </p>
        </div>
      ) : (
        <div className="relative pl-8">
          {/* vertical line */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-gold/60 via-gold/40 to-emerald/20" />
          <ol className="space-y-4">
            {updates.map((u, i) => (
              <li key={u.id} className="relative">
                <span className="absolute -left-8 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-deep text-primary-foreground text-[10px] font-700">
                  {i + 1}
                </span>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-600 text-sm text-foreground">{u.title}</p>
                        {u.published ? (
                          <Badge className="text-[9px] bg-emerald/10 text-emerald-deep border-emerald/20">
                            <Eye className="h-2.5 w-2.5 mr-0.5" />প্রকাশিত
                          </Badge>
                        ) : (
                          <Badge className="text-[9px] bg-muted text-muted-foreground border-border">
                            <EyeOff className="h-2.5 w-2.5 mr-0.5" />ড্রাফট
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(u.date).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <p className="text-sm text-foreground/70 mt-1.5 line-clamp-2">{u.description}</p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-[11px] text-emerald-deep font-600">
                          সংগৃহীত: ৳{formatBDT(u.collectedAmount)}
                        </span>
                        <span className="text-[11px] text-gold-deep font-600">
                          প্রয়োজন: ৳{formatBDT(u.neededAmount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setEditingId(u.id); setDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>আপডেটটি মুছে ফেলবেন?</AlertDialogTitle>
                            <AlertDialogDescription>এই কাজটি ফেরানো যাবে না।</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>বাতিল</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(u.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              মুছে ফেলুন
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Update create/edit dialog with markdown textarea
// ----------------------------------------------------------------

function UpdateDialog({
  storyId,
  open,
  onOpenChange,
  editingId,
  existing,
  onSaved,
}: {
  storyId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingId: string | null;
  existing: Update | null;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState("");
  const [collectedAmount, setCollectedAmount] = useState(0);
  const [neededAmount, setNeededAmount] = useState(0);
  const [published, setPublished] = useState(true);
  const [date, setDate] = useState("");

  // Sync form when dialog opens or existing changes
  useEffect(() => {
    if (open) {
      setTitle(existing?.title ?? "");
      setDescription(existing?.description ?? "");
      setBody(existing?.body ?? "");
      setImage(existing?.image ?? "");
      setCollectedAmount(existing?.collectedAmount ?? 0);
      setNeededAmount(existing?.neededAmount ?? 0);
      setPublished(existing?.published ?? true);
      setDate(existing ? existing.date.split("T")[0] : new Date().toISOString().split("T")[0]);
    }
  }, [open, existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    const payload = {
      title,
      description,
      body: body || null,
      image: image || null,
      collectedAmount,
      neededAmount,
      published,
      date: date || null,
    };

    try {
      const url = editingId
        ? `/api/admin/stories/${storyId}/updates/${editingId}`
        : `/api/admin/stories/${storyId}/updates`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "সেভ করা যায়নি।");

      toast({
        title: editingId ? "আপডেট হয়েছে" : "তৈরি হয়েছে",
        description: `"${data.title}" সফলভাবে সেভ হয়েছে।`,
      });
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast({
        title: "ত্রুটি",
        description: err instanceof Error ? err.message : "সার্ভারে সমস্যা।",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-emerald-deep">
            {editingId ? "আপডেট সম্পাদনা" : "নতুন টাইমলাইন আপডেট"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-600 text-emerald-deep">শিরোনাম *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="ভিত্তি স্থাপন সম্পন্ন" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-600 text-emerald-deep">সংক্ষিপ্ত বিবরণ *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              placeholder="এক লাইনে কী হয়েছে..."
              maxLength={500}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-600 text-emerald-deep">
              বিস্তারিত (Markdown)
            </Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder={"## হেডিং\n\nবিস্তারিত লিখুন...\n\n- পয়েন্ট ১\n- পয়েন্ট ২"}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Markdown ফরম্যাট — # হেডিং, **বোল্ড**, - লিস্ট</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-600 text-emerald-deep">তারিখ</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-600 text-emerald-deep">ছবি</Label>
              <div className="flex items-center gap-2">
                <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="/uploads/..." className="text-xs font-mono" />
                <ImagePicker value={image || null} onChange={(p) => setImage(p)} label="" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-600 text-emerald-deep">সংগৃহীত (৳)</Label>
              <Input type="number" min={0} value={collectedAmount} onChange={(e) => setCollectedAmount(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-600 text-emerald-deep">প্রয়োজন (৳)</Label>
              <Input type="number" min={0} value={neededAmount} onChange={(e) => setNeededAmount(Number(e.target.value))} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm font-600 text-emerald-deep flex items-center gap-1">
              {published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              প্রকাশিত
            </span>
          </label>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">বাতিল</Button>
            </DialogClose>
            <Button type="submit" disabled={saving || !title || !description} className="bg-emerald-deep hover:bg-emerald text-primary-foreground">
              {saving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />সেভ হচ্ছে...</> : <><Save className="h-4 w-4 mr-1.5" />সেভ করুন</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
