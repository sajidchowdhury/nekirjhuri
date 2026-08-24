"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, AlertCircle, ArrowLeft, Star, Eye, EyeOff } from "lucide-react";
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

interface StoryFormProps {
  initial?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    location: string | null;
    status: string;
    targetAmount: number;
    raisedAmount: number;
    featuredImage: string | null;
    tags: string | null;
    published: boolean;
    featured: boolean;
    startDate: string;
  } | null;
}

const STATUS_LABELS: Record<string, string> = {
  ongoing: "চলমান (Ongoing)",
  completed: "সম্পন্ন (Completed)",
  planning: "পরিকল্পনা (Planning)",
};

export function StoryForm({ initial }: StoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [status, setStatus] = useState(initial?.status ?? "ongoing");
  const [targetAmount, setTargetAmount] = useState(initial?.targetAmount ?? 0);
  const [raisedAmount, setRaisedAmount] = useState(initial?.raisedAmount ?? 0);
  const [featuredImage, setFeaturedImage] = useState(initial?.featuredImage ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [startDate, setStartDate] = useState(
    initial?.startDate ? initial.startDate.split("T")[0] : ""
  );

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setErrors({});
    setTopError(null);
    setSaving(true);

    const payload = {
      name,
      slug: slug || null,
      description,
      location: location || null,
      status,
      targetAmount,
      raisedAmount,
      featuredImage: featuredImage || null,
      tags: tags || null,
      published,
      featured,
      startDate: startDate || null,
    };

    try {
      const url = isEdit ? `/api/admin/stories/${initial!.id}` : "/api/admin/stories";
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
      if (!res.ok) throw new Error(data.error || "সেভ করা যায়নি।");

      toast({
        title: isEdit ? "আপডেট হয়েছে" : "তৈরি হয়েছে",
        description: `"${data.name}" সফলভাবে ${isEdit ? "আপডেট" : "তৈরি"} হয়েছে।`,
      });

      if (isEdit) {
        router.refresh();
      } else {
        router.push(`/admin/stories/${data.id}/updates`);
      }
    } catch (err) {
      setTopError(err instanceof Error ? err.message : "সার্ভারে সমস্যা।");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Link
        href="/admin/stories"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-deep transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        গল্প তালিকায় ফিরুন
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
            নাম <span className="text-destructive">*</span>
          </Label>
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="যেমন: নুরানি মাদরাসা নির্মাণ প্রকল্প"
            disabled={saving}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">স্লাগ (URL)</Label>
          <Input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            placeholder="auto-from-name"
            disabled={saving}
            className={`font-mono text-sm ${errors.slug ? "border-destructive" : ""}`}
          />
          {errors.slug ? (
            <p className="text-xs text-destructive">{errors.slug}</p>
          ) : (
            <p className="text-xs text-muted-foreground">/stories/&lt;slug&gt;</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-sm font-600 text-emerald-deep">
            বিবরণ <span className="text-destructive">*</span>
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="গল্পের বিস্তারিত বিবরণ..."
            disabled={saving}
            rows={4}
            className={errors.description ? "border-destructive" : ""}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">অবস্থান</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="কুমিল্লা, বাংলাদেশ"
            disabled={saving}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">ট্যাগ</Label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="মাদরাসা, নির্মাণ, কুমিল্লা"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">কমা দিয়ে আলাদা করুন</p>
        </div>
      </FormSection>

      {/* Status + budget */}
      <FormSection title="স্ট্যাটাস ও বাজেট">
        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">স্ট্যাটাস</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">শুরুর তারিখ</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">লক্ষ্য পরিমাণ (৳)</Label>
          <Input
            type="number"
            min={0}
            value={targetAmount}
            onChange={(e) => setTargetAmount(Number(e.target.value))}
            disabled={saving}
            className={errors.targetAmount ? "border-destructive" : ""}
          />
          {errors.targetAmount && <p className="text-xs text-destructive">{errors.targetAmount}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">সংগৃহীত (৳)</Label>
          <Input
            type="number"
            min={0}
            value={raisedAmount}
            onChange={(e) => setRaisedAmount(Number(e.target.value))}
            disabled={saving}
          />
        </div>
      </FormSection>

      {/* Image */}
      <FormSection title="ফিচার্ড ছবি">
        <div className="sm:col-span-2">
          <ImagePicker
            value={featuredImage || null}
            onChange={(p) => setFeaturedImage(p)}
            label="কভার ছবি"
          />
        </div>
      </FormSection>

      {/* Publishing */}
      <FormSection title="প্রকাশনা">
        <div className="sm:col-span-2 flex flex-wrap gap-4">
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm font-600 text-emerald-deep flex items-center gap-1">
              <Star className="h-4 w-4" />
              ফিচার্ড (ব্লগ ইনডেক্সে হাইলাইট)
            </span>
          </label>
        </div>
      </FormSection>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2 sticky bottom-0 bg-background/80 backdrop-blur py-3 -mx-6 px-6 border-t border-border">
        <Button type="submit" disabled={saving} className="bg-emerald-deep hover:bg-emerald text-primary-foreground h-11 px-6">
          {saving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />সেভ হচ্ছে...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" />{isEdit ? "আপডেট করুন" : "গল্প তৈরি করুন"}</>
          )}
        </Button>
        {isEdit && initial && (
          <Button type="button" variant="outline" asChild>
            <Link href={`/admin/stories/${initial.id}/updates`}>আপডেট ব্যবস্থাপনা</Link>
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/stories")} disabled={saving}>
          বাতিল
        </Button>
      </div>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display font-700 text-base text-emerald-deep mb-4">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}
