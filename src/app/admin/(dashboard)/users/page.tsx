"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  ShieldCheck,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  Loader2,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  _count: { uploads: number; projects: number };
}

const ROLE_LABELS: Record<string, { label: string; cls: string; icon: typeof Shield }> = {
  super_admin: { label: "সুপার অ্যাডমিন", cls: "bg-emerald/15 text-emerald-deep border-emerald/30", icon: ShieldCheck },
  editor: { label: "এডিটর", cls: "bg-gold/15 text-gold-deep border-gold/30", icon: Shield },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setUsers(data.users);
    } catch {
      toast({ title: "ত্রুটি", description: "ইউজার লোড করা যায়নি।", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "update failed");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
      toast({ title: "রোল আপডেট হয়েছে", description: `${data.name} → ${newRole === "super_admin" ? "সুপার অ্যাডমিন" : "এডিটর"}` });
    } catch (err) {
      toast({ title: "ত্রুটি", description: err instanceof Error ? err.message : "আপডেট সমস্যা।", variant: "destructive" });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "update failed");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive } : u)));
      toast({ title: isActive ? "সক্রিয় করা হয়েছে" : "নিষ্ক্রিয় করা হয়েছে", description: data.name });
    } catch (err) {
      toast({ title: "ত্রুটি", description: err instanceof Error ? err.message : "আপডেট সমস্যা।", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "delete failed");
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast({ title: "মুছে ফেলা হয়েছে", description: `${name} মুছে ফেলা হয়েছে।` });
    } catch (err) {
      toast({ title: "ত্রুটি", description: err instanceof Error ? err.message : "মুছতে সমস্যা।", variant: "destructive" });
    }
  };

  const handleResetPassword = async (id: string, password: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      toast({ title: "পাসওয়ার্ড পরিবর্তন হয়েছে", description: "নতুন পাসওয়ার্ড সেট করা হয়েছে।" });
    } catch (err) {
      toast({ title: "ত্রুটি", description: err instanceof Error ? err.message : "সমস্যা।", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-800 text-2xl text-emerald-deep">ইউজার ম্যানেজমেন্ট</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users.length} জন অ্যাডমিন · {users.filter((u) => u.isActive).length} সক্রিয়
          </p>
        </div>
        <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchUsers} />
        <Button className="bg-emerald-deep hover:bg-emerald text-primary-foreground" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          নতুন ইউজার
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UserIcon className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">কোনো ইউজার নেই।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => {
            const roleInfo = ROLE_LABELS[u.role] ?? ROLE_LABELS.editor;
            const RoleIcon = roleInfo.icon;
            return (
              <div key={u.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-gold/40 transition-colors">
                {/* Avatar */}
                <div className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center ${u.isActive ? "bg-emerald-soft/50" : "bg-muted"}`}>
                  <span className="font-display font-700 text-sm text-emerald-deep">
                    {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-600 text-sm text-foreground">{u.name}</p>
                    <Badge className={`text-[9px] ${roleInfo.cls}`}>
                      <RoleIcon className="h-2.5 w-2.5 mr-0.5" />
                      {roleInfo.label}
                    </Badge>
                    {u.isActive ? (
                      <Badge className="text-[9px] bg-emerald/10 text-emerald-deep border-emerald/20">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />সক্রিয়
                      </Badge>
                    ) : (
                      <Badge className="text-[9px] bg-red-50 text-red-600 border-red-200">
                        <XCircle className="h-2.5 w-2.5 mr-0.5" />নিষ্ক্রিয়
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-[11px] text-muted-foreground inline-flex items-center gap-0.5">
                      <Mail className="h-3 w-3" />
                      {u.email}
                    </span>
                    {u.lastLoginAt && (
                      <span className="text-[11px] text-muted-foreground inline-flex items-center gap-0.5">
                        <Calendar className="h-3 w-3" />
                        শেষ লগইন: {new Date(u.lastLoginAt).toLocaleDateString("bn-BD", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Role select */}
                  <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v)}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">সুপার অ্যাডমিন</SelectItem>
                      <SelectItem value="editor">এডিটর</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Activate/Deactivate */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggleActive(u.id, !u.isActive)}
                    title={u.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                  >
                    {u.isActive ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-emerald-deep" />}
                  </Button>

                  {/* Password reset */}
                  <PasswordResetDialog userId={u.id} userName={u.name} onReset={handleResetPassword} />

                  {/* Delete */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ইউজারকে মুছে ফেলবেন?</AlertDialogTitle>
                        <AlertDialogDescription>
                          এই কাজটি ফেরানো যাবে না। <span className="font-500 text-foreground">{u.name} ({u.email})</span> স্থায়ীভাবে মুছে যাবে।
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>বাতিল</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(u.id, u.name)}
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
// Create user dialog
// ----------------------------------------------------------------

function CreateUserDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("editor");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName(""); setEmail(""); setPassword(""); setRole("editor"); setError(null); setShowPw(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (res.status === 422 || res.status === 409) {
        setError(data.error || "ভ্যালিডেশন ত্রুটি।");
        return;
      }
      if (!res.ok) throw new Error(data.error || "তৈরি করা যায়নি।");

      toast({ title: "ইউজার তৈরি হয়েছে", description: `${data.name} (${data.email})` });
      reset();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "সার্ভারে সমস্যা।");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-emerald-deep">নতুন অ্যাডমিন ইউজার</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="text-sm text-destructive bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
          )}
          <div className="space-y-1.5">
            <Label className="text-sm font-600 text-emerald-deep">নাম *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="পূর্ণ নাম" required disabled={saving} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-600 text-emerald-deep">ইমেইল *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@nekirjhuri.org" required disabled={saving} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-600 text-emerald-deep">পাসওয়ার্ড *</Label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ১০ অক্ষর, ১ অক্ষর + ১ সংখ্যা"
                required
                disabled={saving}
                minLength={10}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-600 text-emerald-deep">রোল</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">সুপার অ্যাডমিন (সবকিছু)</SelectItem>
                <SelectItem value="editor">এডিটর (শুধু কন্টেন্ট)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="ghost">বাতিল</Button></DialogClose>
            <Button type="submit" disabled={saving || !name || !email || !password} className="bg-emerald-deep hover:bg-emerald text-primary-foreground">
              {saving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />তৈরি হচ্ছে...</> : <><Save className="h-4 w-4 mr-1.5" />তৈরি করুন</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------
// Password reset dialog
// ----------------------------------------------------------------

function PasswordResetDialog({
  userId,
  userName,
  onReset,
}: {
  userId: string;
  userName: string;
  onReset: (id: string, password: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    await onReset(userId, password);
    setSaving(false);
    setPassword("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="পাসওয়ার্ড পরিবর্তন">
          <KeyRound className="h-4 w-4 text-gold-deep" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-emerald-deep">পাসওয়ার্ড পরিবর্তন</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-500 text-foreground">{userName}</span> এর জন্য নতুন পাসওয়ার্ড দিন।
          </p>
          <div className="space-y-1.5">
            <Label className="text-sm font-600 text-emerald-deep">নতুন পাসওয়ার্ড *</Label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ১০ অক্ষর"
                required
                minLength={10}
                disabled={saving}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="ghost">বাতিল</Button></DialogClose>
            <Button type="submit" disabled={saving || password.length < 10} className="bg-emerald-deep hover:bg-emerald text-primary-foreground">
              {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <KeyRound className="h-4 w-4 mr-1.5" />}
              পরিবর্তন করুন
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
