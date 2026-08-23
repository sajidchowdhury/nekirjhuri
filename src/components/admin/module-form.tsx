"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Plus,
  Trash2,
  Link2,
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
  MODULE_ICONS,
  SOCIAL_TYPES,
} from "@/lib/validations/module";

interface SocialLinkEntry {
  type: string;
  url: string;
}

interface ModuleFormProps {
  /** If provided, this is an edit form. If null, it's a create form. */
  initial?: {
    id: string;
    name: string;
    slug: string | null;
    description: string;
    howItWorks: string | null;
    icon: string | null;
    featuredImage: string | null;
    socialLinks: string | null;
    funnelPercent: number;
    status: string;
  } | null;
}

const ICON_LABELS: Record<string, string> = {
  shopping: "শপিং (Shopping)",
  briefcase: "ব্রিফকেস (Briefcase)",
  book: "বই (Book)",
  leaf: "পাতা (Leaf)",
  heart: "হৃদয় (Heart)",
  star: "তারা (Star)",
  globe: "গ্লোব (Globe)",
  truck: "ট্রাক (Truck)",
  code: "কোড (Code)",
  palette: "প্যালেট (Palette)",
};

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  youtube: "YouTube",
  instagram: "Instagram",
  twitter: "Twitter / X",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  linkedin: "LinkedIn",
  website: "Website",
};

export function ModuleForm({ initial }: ModuleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [howItWorks, setHowItWorks] = useState(initial?.howItWorks ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [featuredImage, setFeaturedImage] = useState(initial?.featuredImage ?? "");
  const [socialLinks, setSocialLinks] = useState<SocialLinkEntry[]>(() => {
    if (!initial?.socialLinks) return [];
    try {
      const parsed = JSON.parse(initial.socialLinks);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [funnelPercent, setFunnelPercent] = useState(
    initial?.funnelPercent ?? 0
  );
  const [status, setStatus] = useState(initial?.status ?? "active");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);

  // Auto-generate slug from name (unless user manually edited the slug)
  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugTouched) {
      setSlug(slugify(v));
    }
  };

  const addSocialLink = () => {
    setSocialLinks((prev) => [...prev, { type: "facebook", url: "" }]);
  };

  const updateSocialLink = (index: number, field: keyof SocialLinkEntry, value: string) => {
    setSocialLinks((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
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
      howItWorks: howItWorks || null,
      icon: icon || null,
      featuredImage: featuredImage || null,
      socialLinks:
        socialLinks.length > 0 ? JSON.stringify(socialLinks) : null,
      funnelPercent,
      status,
    };

    try {
      const url = isEdit
        ? `/api/admin/modules/${initial!.id}`
        : "/api/admin/modules";
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
        description: `"${data.name}" মডিউল সফলভাবে ${isEdit ? "আপডেট" : "তৈরি"} হয়েছে।`,
      });

      router.push("/admin/modules");
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
      {/* Back link */}
      <Link
        href="/admin/modules"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-deep transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        মডিউল তালিকায় ফিরুন
      </Link>

      {/* Top error */}
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
            placeholder="যেমন: ই-কমার্স ও দান-খাদা"
            disabled={saving}
            aria-invalid={!!errors.name}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">স্লাগ (URL)</Label>
          <Input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="auto-generated-from-name"
            disabled={saving}
            aria-invalid={!!errors.slug}
            className={`font-mono text-sm ${errors.slug ? "border-destructive" : ""}`}
          />
          {errors.slug ? (
            <p className="text-xs text-destructive">{errors.slug}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              /modules/&lt;slug&gt; — ফাঁকা রাখলে নাম থেকে তৈরি হবে
            </p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-sm font-600 text-emerald-deep">
            সংক্ষিপ্ত বিবরণ <span className="text-destructive">*</span>
          </Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="মডিউলের এক লাইন বিবরণ"
            disabled={saving}
            maxLength={300}
            aria-invalid={!!errors.description}
            className={errors.description ? "border-destructive" : ""}
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description}</p>
          )}
        </div>
      </FormSection>

      {/* Configuration */}
      <FormSection title="কনফিগারেশন">
        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">আইকন</Label>
          <Select value={icon || "none"} onValueChange={(v) => setIcon(v === "none" ? "" : v)}>
            <SelectTrigger className={errors.icon ? "border-destructive" : ""}>
              <SelectValue placeholder="আইকন নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— কোনো আইকন নয় —</SelectItem>
              {MODULE_ICONS.map((ic) => (
                <SelectItem key={ic} value={ic}>
                  {ICON_LABELS[ic] ?? ic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.icon && <p className="text-xs text-destructive">{errors.icon}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">
            ফানেল শতাংশ (%)
          </Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={funnelPercent}
            onChange={(e) => setFunnelPercent(Number(e.target.value))}
            disabled={saving}
            aria-invalid={!!errors.funnelPercent}
            className={errors.funnelPercent ? "border-destructive" : ""}
          />
          {errors.funnelPercent && (
            <p className="text-xs text-destructive">{errors.funnelPercent}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-600 text-emerald-deep">স্ট্যাটাস</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">সক্রিয় (Active)</SelectItem>
              <SelectItem value="inactive">নিষ্ক্রিয় (Inactive)</SelectItem>
              <SelectItem value="archived">আর্কাইভ (Archived)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FormSection>

      {/* Featured image */}
      <FormSection title="ফিচার্ড ছবি">
        <div className="sm:col-span-2">
          <ImagePicker
            value={featuredImage || null}
            onChange={(p) => setFeaturedImage(p)}
            label="কভার ছবি"
            hint="মডিউল ডিটেইল পেজে দেখানো হবে"
          />
          {errors.featuredImage && (
            <p className="text-xs text-destructive mt-1">{errors.featuredImage}</p>
          )}
        </div>
      </FormSection>

      {/* How it works (markdown) */}
      <FormSection
        title="কিভাবে কাজ করে"
        description="Markdown ফরম্যাটে লিখুন। ডিটেইল পেজে রেন্ডার হবে।"
      >
        <div className="sm:col-span-2 space-y-1.5">
          <Textarea
            value={howItWorks ?? ""}
            onChange={(e) => setHowItWorks(e.target.value)}
            placeholder={"## কিভাবে কাজ করে\n\n১. প্রথম ধাপ...\n২. দ্বিতীয় ধাপ..."}
            disabled={saving}
            rows={8}
            className="font-mono text-sm"
            aria-invalid={!!errors.howItWorks}
          />
          <p className="text-xs text-muted-foreground">
            {(howItWorks ?? "").length} / 5000 অক্ষর
          </p>
          {errors.howItWorks && (
            <p className="text-xs text-destructive">{errors.howItWorks}</p>
          )}
        </div>
      </FormSection>

      {/* Social links */}
      <FormSection
        title="সোশ্যাল মিডিয়া লিংক"
        description="প্রতিটি মডিউলের নিজস্ব সোশ্যাল লিংক থাকতে পারে।"
      >
        <div className="sm:col-span-2 space-y-2">
          {socialLinks.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-2">
              কোনো সোশ্যাল লিংক যোগ করা হয়নি।
            </p>
          )}
          {socialLinks.map((link, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Select
                value={link.type}
                onValueChange={(v) => updateSocialLink(index, "type", v)}
              >
                <SelectTrigger className="w-40 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {SOCIAL_LABELS[t] ?? t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={link.url}
                onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                placeholder="https://..."
                disabled={saving}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSocialLink(index)}
                className="shrink-0 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSocialLink}
            className="mt-1"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            সোশ্যাল লিংক যোগ করুন
          </Button>
          {errors.socialLinks && (
            <p className="text-xs text-destructive">{errors.socialLinks}</p>
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
              {isEdit ? "আপডেট করুন" : "মডিউল তৈরি করুন"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/modules")}
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
