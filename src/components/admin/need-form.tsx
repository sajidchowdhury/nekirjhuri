"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImagePicker } from "@/components/admin/image-picker";
import { slugify } from "@/lib/validations/slug";
import {
  NEED_CATEGORIES,
  NEED_URGENCIES,
  NEED_STATUSES,
  BKASH_TYPES,
} from "@/lib/validations/need";

interface NeedFormProps {
  initial?: {
    id: string;
    title: string;
    slug: string | null;
    summary: string;
    description: string;
    category: string;
    location: string | null;
    targetAmount: number;
    image: string | null;
    urgency: string;
    beneficiary: string | null;
    status: string;
    bKashNumber: string | null;
    bKashType: string;
  } | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  madrasa: "মাদরাসা",
  student: "ছাত্র",
  medical: "চিকিৎসা",
  family: "পরিবার",
  emergency: "জরুরি ত্রাণ",
  general: "সাধারণ",
};

const URGENCY_LABELS: Record<string, string> = {
  critical: "জরুরি (Critical)",
  high: "গুরুত্বপূর্ণ (High)",
  normal: "সাধারণ (Normal)",
};

const STATUS_LABELS: Record<string, string> = {
  active: "সক্রিয় (Active)",
  funded: "পূর্ণ (Funded)",
  closed: "বন্ধ (Closed)",
};

const BKASH_LABELS: Record<string, string> = {
  personal: "পার্সোনাল",
  merchant: "মার্চেন্ট",
};

export function NeedForm({ initial }: NeedFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "general");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [targetAmount, setTargetAmount] = useState(
    initial?.targetAmount ?? 0
  );
  const [image, setImage] = useState(initial?.image ?? "");
  const [urgency, setUrgency] = useState(initial?.urgency ?? "normal");
  const [beneficiary, setBeneficiary] = useState(initial?.beneficiary ?? "");
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [bKashNumber, setBKashNumber] = useState(initial?.bKashNumber ?? "");
  const [bKashType, setBKashType] = useState(initial?.bKashType ?? "personal");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setErrors({});
    setTopError(null);
    setSaving(true);

    const payload = {
      title,
      slug: slug || null,
      summary,
      description,
      category,
      location: location || null,
      targetAmount,
      image: image || null,
      urgency,
      beneficiary: beneficiary || null,
      status,
      bKashNumber: bKashNumber || null,
      bKashType,
    };

    try {
      const url = isEdit
        ? `/api/admin/needs/${initial!.id}`
        : "/api/admin/needs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 422) {
        setErrors(data.fields || {});
        setTopError(data.error || "ভ্যালিডেশন ত্রুটি।");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "সেভ করা যায়নি।");
      }

      toast({
        title: isEdit ? "আপডেট হয়েছে" : "তৈরি হয়েছে",
        description: `"${data.title}" সফলভাবে ${isEdit ? "আপডেট" : "তৈরি"} হয়েছে।`,
      });

      router.push("/admin/needs");
      router.refresh();
    } catch (err) {
      setTopError(
        err instanceof Error ? err.message : "সার্ভারে সমস্যা হয়েছে।"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Link
        href="/admin/needs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-deep transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        প্রয়োজন তালিকায় ফিরুন
      </Link>

      {topError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{topError}</AlertDescription>
        </Alert>
      )}

      {/* Basic info */}
      <FormSection title="মৌলিক তথ্য">
        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">
            শিরোনাম <span className="text-destructive">*</span>
          </Label>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="যেমন: মাদরাসা ছাদ মেরামতের তহবিল"
            disabled={saving}
            aria-invalid={!!errors.title}
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">স্লাগ (URL)</Label>
          <Input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="auto-from-title"
            disabled={saving}
            className={`font-mono text-sm ${errors.slug ? "border-destructive" : ""}`}
          />
          {errors.slug ? (
            <p className="text-xs text-destructive">{errors.slug}</p>
          ) : (
            <p className="text-xs text-muted-foreground">ফাঁকা রাখলে শিরোনাম থেকে তৈরি হবে</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-sm font-600 text-emerald-deep">
            সংক্ষিপ্ত বিবরণ <span className="text-destructive">*</span>
          </Label>
          <Input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="এক লাইনে প্রয়োজনের বিবরণ"
            disabled={saving}
            maxLength={250}
            className={errors.summary ? "border-destructive" : ""}
          />
          {errors.summary && (
            <p className="text-xs text-destructive">{errors.summary}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-sm font-600 text-emerald-deep">
            বিস্তারিত বিবরণ <span className="text-destructive">*</span>
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="প্রয়োজনের সম্পূর্ণ বিবরণ..."
            disabled={saving}
            rows={5}
            className={errors.description ? "border-destructive" : ""}
          />
          <p className="text-xs text-muted-foreground">
            {(description ?? "").length} / 5000 অক্ষর
          </p>
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description}</p>
          )}
        </div>
      </FormSection>

      {/* Classification */}
      <FormSection title="শ্রেণীবিভাগ">
        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">ক্যাটাগরি</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className={errors.category ? "border-destructive" : ""}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NEED_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABELS[c] ?? c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">জরুরি অবস্থা</Label>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger className={errors.urgency ? "border-destructive" : ""}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NEED_URGENCIES.map((u) => (
                <SelectItem key={u} value={u}>
                  {URGENCY_LABELS[u] ?? u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.urgency && (
            <p className="text-xs text-destructive">{errors.urgency}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">স্ট্যাটাস</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NEED_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s] ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">উপকৃত ব্যক্তি/গোষ্ঠী</Label>
          <Input
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
            placeholder="যেমন: ৮০ জন ছাত্র"
            disabled={saving}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">অবস্থান</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="যেমন: সিলেট, বাংলাদেশ"
            disabled={saving}
          />
        </div>
      </FormSection>

      {/* Budget */}
      <FormSection title="বাজেট">
        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">
            লক্ষ্য পরিমাণ (৳) <span className="text-destructive">*</span>
          </Label>
          <Input
            type="number"
            min={1}
            value={targetAmount}
            onChange={(e) => setTargetAmount(Number(e.target.value))}
            disabled={saving}
            aria-invalid={!!errors.targetAmount}
            className={errors.targetAmount ? "border-destructive" : ""}
          />
          {errors.targetAmount && (
            <p className="text-xs text-destructive">{errors.targetAmount}</p>
          )}
          <p className="text-xs text-muted-foreground">
            সংগৃহীত পরিমাণ Phase 6-এ ডোনেশন ট্র্যাকিং দিয়ে আপডেট হবে
          </p>
        </div>
      </FormSection>

      {/* bKash */}
      <FormSection
        title="bKash তথ্য"
        description="ডোনেশন গ্রহণের জন্য bKash নম্বর — পাবলিক ডিটেইল পেজে দেখানো হবে।"
      >
        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">bKash নম্বর</Label>
          <Input
            value={bKashNumber}
            onChange={(e) => setBKashNumber(e.target.value)}
            placeholder="01712-345678"
            disabled={saving}
            className={errors.bKashNumber ? "border-destructive" : ""}
          />
          {errors.bKashNumber && (
            <p className="text-xs text-destructive">{errors.bKashNumber}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">bKash টাইপ</Label>
          <Select value={bKashType} onValueChange={setBKashType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BKASH_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {BKASH_LABELS[t] ?? t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FormSection>

      {/* Image */}
      <FormSection title="ছবি">
        <div className="sm:col-span-2">
          <ImagePicker
            value={image || null}
            onChange={(p) => setImage(p)}
            label="প্রয়োজনের ছবি"
            hint="কার্ডে ও ডিটেইল পেজে দেখানো হবে"
          />
          {errors.image && (
            <p className="text-xs text-destructive mt-1">{errors.image}</p>
          )}
        </div>
      </FormSection>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2 sticky bottom-0 bg-background/80 backdrop-blur py-3 -mx-6 px-6 border-t border-border">
        <Button
          type="submit"
          disabled={saving}
          className="bg-emerald-deep hover:bg-emerald text-primary-foreground h-11 px-6"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              সেভ হচ্ছে...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? "আপডেট করুন" : "প্রয়োজন তৈরি করুন"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/needs")}
          disabled={saving}
        >
          বাতিল
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="font-display font-700 text-base text-emerald-deep">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}
