"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, AlertCircle, ArrowLeft, Plus, Trash2, ImagePlus } from "lucide-react";
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
import { PROJECT_TYPES } from "@/lib/validations/fixed-project";
import Image from "next/image";

interface FixedProjectFormProps {
  initial?: {
    id: string;
    name: string;
    slug: string | null;
    type: string;
    description: string;
    location: string | null;
    beneficiaries: number;
    monthlyCost: number;
    establishedAt: string | null;
    image: string | null;
    gallery: string | null;
    isActive: boolean;
  } | null;
}

const TYPE_LABELS: Record<string, string> = {
  madrasha: "মাদরাসা",
  moktob: "মক্তব",
  orphanage: "এতিমখানা",
  clinic: "ক্লিনিক",
  mosque: "মসজিদ",
};

function parseGallery(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p) => typeof p === "string") : [];
  } catch {
    return [];
  }
}

export function FixedProjectForm({ initial }: FixedProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [type, setType] = useState(initial?.type ?? "madrasha");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [beneficiaries, setBeneficiaries] = useState(initial?.beneficiaries ?? 0);
  const [monthlyCost, setMonthlyCost] = useState(initial?.monthlyCost ?? 0);
  const [establishedAt, setEstablishedAt] = useState(initial?.establishedAt ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [gallery, setGallery] = useState<string[]>(parseGallery(initial?.gallery ?? null));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const addGalleryImage = (path: string) => {
    if (path && !gallery.includes(path)) {
      setGallery((prev) => [...prev, path]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
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
      type,
      description,
      location: location || null,
      beneficiaries,
      monthlyCost,
      establishedAt: establishedAt || null,
      image: image || null,
      gallery: gallery.length > 0 ? JSON.stringify(gallery) : null,
      isActive,
    };

    try {
      const url = isEdit
        ? `/api/admin/fixed-projects/${initial!.id}`
        : "/api/admin/fixed-projects";
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
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setTopError(err instanceof Error ? err.message : "সার্ভারে সমস্যা।");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-deep transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        প্রজেক্ট তালিকায় ফিরুন
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
            placeholder="যেমন: দারুল উলূম মাদরাসা"
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
            <p className="text-xs text-muted-foreground">/projects/&lt;slug&gt;</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">টাইপ</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className={errors.type ? "border-destructive" : ""}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABELS[t] ?? t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">অবস্থান</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="সিলেট, বাংলাদেশ"
            disabled={saving}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-sm font-600 text-emerald-deep">
            বিবরণ <span className="text-destructive">*</span>
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="প্রতিষ্ঠানের বিস্তারিত বিবরণ..."
            disabled={saving}
            rows={4}
            className={errors.description ? "border-destructive" : ""}
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description}</p>
          )}
        </div>
      </FormSection>

      {/* Stats */}
      <FormSection title="পরিসংখ্যান">
        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">উপকৃত সংখ্যা</Label>
          <Input
            type="number"
            min={0}
            value={beneficiaries}
            onChange={(e) => setBeneficiaries(Number(e.target.value))}
            disabled={saving}
            className={errors.beneficiaries ? "border-destructive" : ""}
          />
          {errors.beneficiaries && (
            <p className="text-xs text-destructive">{errors.beneficiaries}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">মাসিক খরচ (৳)</Label>
          <Input
            type="number"
            min={0}
            value={monthlyCost}
            onChange={(e) => setMonthlyCost(Number(e.target.value))}
            disabled={saving}
            className={errors.monthlyCost ? "border-destructive" : ""}
          />
          {errors.monthlyCost && (
            <p className="text-xs text-destructive">{errors.monthlyCost}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">প্রতিষ্ঠার সাল</Label>
          <Input
            value={establishedAt}
            onChange={(e) => setEstablishedAt(e.target.value)}
            placeholder="২০১৩"
            disabled={saving}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">স্ট্যাটাস</Label>
          <label className="flex items-center gap-2 cursor-pointer h-10">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm font-600 text-emerald-deep">
              {isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
            </span>
          </label>
        </div>
      </FormSection>

      {/* Cover image */}
      <FormSection title="কভার ছবি">
        <div className="sm:col-span-2">
          <ImagePicker
            value={image || null}
            onChange={(p) => setImage(p)}
            label="প্রধান ছবি"
            hint="কার্ডে ও ডিটেইল পেজে দেখানো হবে"
          />
          {errors.image && (
            <p className="text-xs text-destructive mt-1">{errors.image}</p>
          )}
        </div>
      </FormSection>

      {/* Gallery (multi-image) */}
      <FormSection
        title="গ্যালারি"
        description="একাধিক ছবি যোগ করুন — ডিটেইল পেজে ক্যারোসেলে দেখানো হবে।"
      >
        <div className="sm:col-span-2 space-y-3">
          {/* Gallery grid */}
          {gallery.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {gallery.map((path, index) => (
                <div
                  key={index}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-border"
                >
                  <Image
                    src={path}
                    alt={`Gallery ${index + 1}`}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add to gallery via ImagePicker */}
          <div className="flex items-center gap-3">
            <ImagePicker
              value={null}
              onChange={(p) => {
                if (p) addGalleryImage(p);
              }}
              label=""
              hint="ছবি নির্বাচন করলে গ্যালারিতে যোগ হবে"
            />
            <span className="text-xs text-muted-foreground">
              {gallery.length} টি ছবি গ্যালারিতে
            </span>
          </div>

          {errors.gallery && (
            <p className="text-xs text-destructive">{errors.gallery}</p>
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
              {isEdit ? "আপডেট করুন" : "প্রজেক্ট তৈরি করুন"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/projects")}
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
