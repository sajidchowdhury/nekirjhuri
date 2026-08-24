"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Loader2,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { cn } from "@/lib/utils";
import { parseSocialLinks } from "@/lib/validations/module";

interface Module {
  id: string;
  name: string;
  slug: string | null;
  description: string;
  icon: string | null;
  featuredImage: string | null;
  socialLinks: string | null;
  funnelPercent: number;
  order: number;
  status: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminModulesPageClient() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/modules", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setModules(data.modules);
    } catch {
      toast({
        title: "ত্রুটি",
        description: "মডিউল লোড করা যায়নি।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setModules((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });

    // Persist the new order
    setReordering(true);
    try {
      const items = modules.map((m, i) => ({ id: m.id, order: i + 1 }));
      // Use the latest state (after arrayMove) — recompute
      const latest = modules;
      const reordered = arrayMove(
        latest,
        latest.findIndex((i) => i.id === active.id),
        latest.findIndex((i) => i.id === over.id)
      ).map((m, i) => ({ id: m.id, order: i + 1 }));

      await fetch("/api/admin/modules/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reordered.length ? reordered : items }),
      });
      toast({
        title: "ক্রম সেভ হয়েছে",
        description: "মডিউলের ক্রম আপডেট হয়েছে।",
      });
    } catch {
      toast({
        title: "ত্রুটি",
        description: "ক্রম সেভ করা যায়নি।",
        variant: "destructive",
      });
      // Revert by refetching
      fetchModules();
    } finally {
      setReordering(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/modules/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "delete failed");
      }
      setModules((prev) => prev.filter((m) => m.id !== id));
      toast({
        title: "মুছে ফেলা হয়েছে",
        description: `"${name}" মডিউল মুছে ফেলা হয়েছে।`,
      });
    } catch (err) {
      toast({
        title: "ত্রুটি",
        description: err instanceof Error ? err.message : "মুছতে সমস্যা।",
        variant: "destructive",
      });
    }
  };

  const totalFunnel = modules
    .filter((m) => m.status === "active")
    .reduce((s, m) => s + m.funnelPercent, 0);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-800 text-2xl text-emerald-deep">
            দুনিয়াবি মডিউল
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {modules.length} টি মডিউল · সর্বমোট ফানেল {totalFunnel}%
          </p>
        </div>
        <Button asChild className="bg-emerald-deep hover:bg-emerald text-primary-foreground">
          <Link href="/admin/modules/new">
            <Plus className="h-4 w-4 mr-1.5" />
            নতুন মডিউল
          </Link>
        </Button>
      </div>

      {/* Hint */}
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-soft/30 border border-emerald/20 px-4 py-2.5">
        <GripVertical className="h-4 w-4 text-emerald-deep shrink-0" />
        <p className="text-xs text-emerald-deep">
          ক্রম পরিবর্তন করতে হ্যান্ডেল ধরে টেনে নামান। সাইটে উপরের থেকে নিচে দেখাবে।
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            এখনো কোনো মডিউল নেই।
          </p>
          <Button asChild className="bg-emerald-deep hover:bg-emerald text-primary-foreground">
            <Link href="/admin/modules/new">
              <Plus className="h-4 w-4 mr-1.5" />
              প্রথম মডিউল তৈরি করুন
            </Link>
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {modules.map((m, index) => (
                <SortableModuleRow
                  key={m.id}
                  module={m}
                  index={index}
                  reordering={reordering}
                  onDelete={() => handleDelete(m.id, m.name)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableModuleRow({
  module,
  index,
  reordering,
  onDelete,
}: {
  module: Module;
  index: number;
  reordering: boolean;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const socials = parseSocialLinks(module.socialLinks);
  const statusBadge =
    module.status === "active"
      ? { label: "সক্রিয়", cls: "bg-emerald/15 text-emerald-deep border-emerald/30" }
      : module.status === "inactive"
      ? { label: "নিষ্ক্রিয়", cls: "bg-muted text-muted-foreground border-border" }
      : { label: "আর্কাইভ", cls: "bg-muted text-muted-foreground border-border" };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-shadow",
        isDragging && "shadow-lg border-emerald/40 z-10"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-emerald-deep touch-none p-1"
        aria-label="টেনে সাজান"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Order number */}
      <span className="font-display font-700 text-sm text-muted-foreground w-6 text-center shrink-0">
        {index + 1}
      </span>

      {/* Image thumbnail */}
      {module.featuredImage ? (
        <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-border">
          <Image
            src={module.featuredImage}
            alt={module.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-12 w-12 shrink-0 rounded-lg bg-muted flex items-center justify-center">
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-600 text-sm text-foreground truncate">{module.name}</p>
          <Badge className={`text-[9px] ${statusBadge.cls}`}>{statusBadge.label}</Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {module.description}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[11px] text-gold-deep font-600">
            ফানেল {module.funnelPercent}%
          </span>
          {socials.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {socials.length} সোশ্যাল লিংক
            </span>
          )}
          {module.slug && (
            <Link
              href={`/modules/${module.slug}`}
              className="text-[11px] text-emerald-deep hover:underline inline-flex items-center gap-0.5"
            >
              /modules/{module.slug}
              <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button asChild variant="ghost" size="icon" className="h-9 w-9">
          <Link href={`/admin/modules/${module.id}/edit`}>
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
              <AlertDialogTitle>মডিউলটি মুছে ফেলবেন?</AlertDialogTitle>
              <AlertDialogDescription>
                এই কাজটি ফেরানো যাবে না।{" "}
                <span className="font-500 text-foreground">{module.name}</span>{" "}
                স্থায়ীভাবে মুছে যাবে।
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

      {reordering && isDragging && (
        <Loader2 className="h-4 w-4 animate-spin text-emerald-deep shrink-0" />
      )}
    </div>
  );
}
