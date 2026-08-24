"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Check,
  X,
  Trash2,
  Search,
  Wallet,
  Loader2,
  User,
  Phone,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { formatBDT } from "@/lib/types";
import {
  DONATION_METHODS,
  DONATION_STATUSES,
} from "@/lib/validations/donation";

interface Donation {
  id: string;
  needId: string;
  donorName: string;
  donorPhone: string | null;
  amount: number;
  method: string;
  transactionId: string | null;
  status: string;
  note: string | null;
  receivedAt: string;
  createdAt: string;
  need: { id: string; title: string } | null;
}

interface Need {
  id: string;
  title: string;
}

const METHOD_LABELS: Record<string, string> = {
  bkash: "বিকাশ",
  nagad: "নগদ",
  cash: "ক্যাশ",
  bank: "ব্যাংক",
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  confirmed: {
    label: "নিশ্চিত",
    cls: "bg-emerald/15 text-emerald-deep border-emerald/30",
  },
  pending: {
    label: "অপেক্ষমাণ",
    cls: "bg-amber-100 text-amber-700 border-amber-200",
  },
  rejected: {
    label: "বাতিল",
    cls: "bg-red-100 text-red-700 border-red-200",
  },
};

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [recordOpen, setRecordOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (methodFilter !== "all") params.set("method", methodFilter);
      if (debouncedSearch) params.set("q", debouncedSearch);

      const res = await fetch(`/api/admin/donations?${params}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setDonations(data.donations);
    } catch {
      toast({
        title: "ত্রুটি",
        description: "ডোনেশন লোড করা যায়নি।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, methodFilter, debouncedSearch, toast]);

  const fetchNeeds = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/needs?status=active", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setNeeds(data.needs);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  useEffect(() => {
    fetchNeeds();
  }, [fetchNeeds]);

  const handleStatusChange = async (
    id: string,
    newStatus: "confirmed" | "rejected"
  ) => {
    try {
      const res = await fetch(`/api/admin/donations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "update failed");
      }
      toast({
        title: newStatus === "confirmed" ? "নিশ্চিত হয়েছে" : "বাতিল হয়েছে",
        description:
          newStatus === "confirmed"
            ? "ডোনেশন নিশ্চিত করা হয়েছে। প্রোগ্রেস আপডেট হবে।"
            : "ডোনেশন বাতিল করা হয়েছে।",
      });
      fetchDonations();
    } catch (err) {
      toast({
        title: "ত্রুটি",
        description: err instanceof Error ? err.message : "আপডেট সমস্যা।",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/donations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "delete failed");
      }
      setDonations((prev) => prev.filter((d) => d.id !== id));
      toast({ title: "মুছে ফেলা হয়েছে" });
    } catch (err) {
      toast({
        title: "ত্রুটি",
        description: err instanceof Error ? err.message : "মুছতে সমস্যা।",
        variant: "destructive",
      });
    }
  };

  const totalRaised = donations
    .filter((d) => d.status === "confirmed")
    .reduce((s, d) => s + d.amount, 0);
  const pendingCount = donations.filter((d) => d.status === "pending").length;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-800 text-2xl text-emerald-deep">
            ডোনেশন
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {donations.length} টি · নিশ্চিত: ৳{formatBDT(totalRaised)} ·
            অপেক্ষমাণ: {pendingCount}
          </p>
        </div>

        <RecordDonationDialog
          open={recordOpen}
          onOpenChange={setRecordOpen}
          needs={needs}
          onRecorded={fetchDonations}
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ডোনারের নাম দিয়ে সার্চ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
            {DONATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_BADGE[s]?.label ?? s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব পদ্ধতি</SelectItem>
            {DONATION_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {METHOD_LABELS[m] ?? m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            কোনো ডোনেশন পাওয়া যায়নি।
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {donations.map((d) => {
            const sBadge = STATUS_BADGE[d.status] ?? STATUS_BADGE.pending;
            return (
              <div
                key={d.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 hover:border-gold/40 transition-colors"
              >
                {/* Amount */}
                <div className="shrink-0 text-center w-20">
                  <p className="font-display font-800 text-lg text-emerald-deep">
                    ৳{formatBDT(d.amount)}
                  </p>
                  <Badge className={`text-[9px] mt-0.5 ${sBadge.cls}`}>
                    {sBadge.label}
                  </Badge>
                </div>

                {/* Donor info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-600 text-sm text-foreground inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {d.donorName}
                    </p>
                    <Badge variant="secondary" className="text-[9px]">
                      {METHOD_LABELS[d.method] ?? d.method}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {d.need?.title ?? "—"}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {d.donorPhone && (
                      <span className="text-[11px] text-muted-foreground inline-flex items-center gap-0.5">
                        <Phone className="h-3 w-3" />
                        {d.donorPhone}
                      </span>
                    )}
                    {d.transactionId && (
                      <span className="text-[11px] text-muted-foreground inline-flex items-center gap-0.5">
                        <Hash className="h-3 w-3" />
                        {d.transactionId}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(d.receivedAt).toLocaleDateString("bn-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {d.status === "pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-emerald-deep hover:bg-emerald-soft/50"
                        onClick={() => handleStatusChange(d.id, "confirmed")}
                        title="নিশ্চিত করুন"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:bg-red-50"
                        onClick={() => handleStatusChange(d.id, "rejected")}
                        title="বাতিল করুন"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
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
                        <AlertDialogTitle>
                          ডোনেশনটি মুছে ফেলবেন?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          নিশ্চিত ডোনেশন হলে প্রয়োজনের raisedAmount কমে যাবে।
                          এই কাজটি ফেরানো যাবে না।
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>বাতিল</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(d.id)}
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

// ----------------------------------------------------------------
// Record donation dialog
// ----------------------------------------------------------------

function RecordDonationDialog({
  open,
  onOpenChange,
  needs,
  onRecorded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  needs: Need[];
  onRecorded: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [needId, setNeedId] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("bkash");
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setNeedId("");
    setDonorName("");
    setDonorPhone("");
    setAmount(0);
    setMethod("bkash");
    setTransactionId("");
    setNote("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          needId,
          donorName,
          donorPhone: donorPhone || null,
          amount,
          method,
          transactionId: transactionId || null,
          note: note || null,
          status: "confirmed",
        }),
      });

      const data = await res.json();

      if (res.status === 422) {
        setError(data.error || "ভ্যালিডেশন ত্রুটি।");
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || "রেকর্ড করা যায়নি।");
      }

      toast({
        title: "রেকর্ড হয়েছে",
        description: `৳${formatBDT(amount)} — ${donorName}`,
      });
      reset();
      onOpenChange(false);
      onRecorded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "সার্ভারে সমস্যা।");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-deep hover:bg-emerald text-primary-foreground">
          <Plus className="h-4 w-4 mr-1.5" />
          ডোনেশন রেকর্ড করুন
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-emerald-deep">
            নতুন ডোনেশন রেকর্ড
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="text-sm text-destructive bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-600 text-emerald-deep">
              প্রয়োজন <span className="text-destructive">*</span>
            </Label>
            <Select value={needId} onValueChange={setNeedId} required>
              <SelectTrigger>
                <SelectValue placeholder="প্রয়োজন নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {needs.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-600 text-emerald-deep">
                ডোনারের নাম <span className="text-destructive">*</span>
              </Label>
              <Input
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="নাম"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-600 text-emerald-deep">
                পরিমাণ (৳) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-600 text-emerald-deep">
                ফোন
              </Label>
              <Input
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder="01712-345678"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-600 text-emerald-deep">
                পদ্ধতি
              </Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DONATION_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {METHOD_LABELS[m] ?? m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-600 text-emerald-deep">
              ট্রানজেকশন আইডি
            </Label>
            <Input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="bKash/Nagad TXN ID"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-600 text-emerald-deep">নোট</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ঐচ্ছিক নোট..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                বাতিল
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={saving || !needId || !donorName || !amount}
              className="bg-emerald-deep hover:bg-emerald text-primary-foreground"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  রেকর্ড হচ্ছে...
                </>
              ) : (
                "রেকর্ড করুন"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
