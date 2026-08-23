"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Youtube,
  Instagram,
  Twitter,
  MessageCircle,
  Send,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

/** The shape of the settings row returned by the API. */
interface SiteSettings {
  id: string;
  phone: string | null;
  altPhone: string | null;
  email: string | null;
  address: string | null;
  facebook: string | null;
  youtube: string | null;
  instagram: string | null;
  twitter: string | null;
  whatsapp: string | null;
  telegram: string | null;
  mapEmbed: string | null;
  updatedAt: string | null;
}

/** Form state — all strings (null becomes "" for inputs). */
type FormState = Record<keyof Omit<SiteSettings, "id" | "updatedAt">, string>;

const EMPTY_FORM: FormState = {
  phone: "",
  altPhone: "",
  email: "",
  address: "",
  facebook: "",
  youtube: "",
  instagram: "",
  twitter: "",
  whatsapp: "",
  telegram: "",
  mapEmbed: "",
};

/**
 * Admin settings form.
 *
 * - On mount: fetches GET /api/admin/settings, populates the form.
 * - On submit: PUT /api/admin/settings with the form data.
 * - On 422: shows field-level Bengali errors inline (under each field).
 * - On success: toast notification.
 * - On error: top-level Alert + toast.
 *
 * Sections: Contact (phone/email/address) + Social Links (all platforms).
 */
export function SettingsForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const { toast } = useToast();

  // Load current settings on mount
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data: SiteSettings = await res.json();
      // Map null → "" for form inputs
      setForm({
        phone: data.phone ?? "",
        altPhone: data.altPhone ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
        facebook: data.facebook ?? "",
        youtube: data.youtube ?? "",
        instagram: data.instagram ?? "",
        twitter: data.twitter ?? "",
        whatsapp: data.whatsapp ?? "",
        telegram: data.telegram ?? "",
        mapEmbed: data.mapEmbed ?? "",
      });
      setUpdatedAt(data.updatedAt);
    } catch {
      setTopError("সেটিংস লোড করা যায়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear field error on edit
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setErrors({});
    setTopError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.status === 422) {
        // Field-level validation errors from zod
        setErrors(data.fields || {});
        setTopError(data.error || "ভ্যালিডেশন ত্রুটি। লাল চিহ্নিত ফিল্ড ঠিক করুন।");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "সেভ করা যায়নি।");
      }

      // Success
      setUpdatedAt(data.updatedAt);
      toast({
        title: "সেভ হয়েছে",
        description: "সাইট সেটিংস সফলভাবে আপডেট হয়েছে।",
      });
    } catch (err) {
      setTopError(
        err instanceof Error ? err.message : "সার্ভারে সমস্যা হয়েছে।"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-deep" />
        <span className="ml-2 text-sm text-muted-foreground">লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top-level error */}
      {topError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{topError}</AlertDescription>
        </Alert>
      )}

      {/* Last saved indicator */}
      {updatedAt && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald" />
          সর্বশেষ সেভ:{" "}
          {new Date(updatedAt).toLocaleString("bn-BD", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>
      )}

      {/* Contact section */}
      <FormSection
        title="যোগাযোগ"
        description="ফোন, ইমেইল ও ঠিকানা — সাইটের footer-এ দেখানো হবে।"
      >
        <Field
          label="প্রাথমিক ফোন"
          icon={Phone}
          value={form.phone}
          onChange={(v) => setField("phone", v)}
          error={errors.phone}
          placeholder="+8801712345678"
          disabled={saving}
        />
        <Field
          label="বিকল্প ফোন"
          icon={Phone}
          value={form.altPhone}
          onChange={(v) => setField("altPhone", v)}
          error={errors.altPhone}
          placeholder="+8801987654321"
          disabled={saving}
        />
        <Field
          label="ইমেইল"
          icon={Mail}
          type="email"
          value={form.email}
          onChange={(v) => setField("email", v)}
          error={errors.email}
          placeholder="info@nekirjhuri.org"
          disabled={saving}
        />
        <Field
          label="ঠিকানা"
          icon={MapPin}
          value={form.address}
          onChange={(v) => setField("address", v)}
          error={errors.address}
          placeholder="ঢাকা, বাংলাদেশ"
          disabled={saving}
        />
      </FormSection>

      {/* Social links section */}
      <FormSection
        title="সোশ্যাল মিডিয়া লিংক"
        description="সব লিংক http:// বা https:// দিয়ে শুরু হতে হবে।"
      >
        <Field
          label="Facebook"
          icon={Facebook}
          value={form.facebook}
          onChange={(v) => setField("facebook", v)}
          error={errors.facebook}
          placeholder="https://facebook.com/nekirjhuri"
          disabled={saving}
        />
        <Field
          label="YouTube"
          icon={Youtube}
          value={form.youtube}
          onChange={(v) => setField("youtube", v)}
          error={errors.youtube}
          placeholder="https://youtube.com/@nekirjhuri"
          disabled={saving}
        />
        <Field
          label="Instagram"
          icon={Instagram}
          value={form.instagram}
          onChange={(v) => setField("instagram", v)}
          error={errors.instagram}
          placeholder="https://instagram.com/nekirjhuri"
          disabled={saving}
        />
        <Field
          label="Twitter / X"
          icon={Twitter}
          value={form.twitter}
          onChange={(v) => setField("twitter", v)}
          error={errors.twitter}
          placeholder="https://twitter.com/nekirjhuri"
          disabled={saving}
        />
        <Field
          label="WhatsApp"
          icon={MessageCircle}
          value={form.whatsapp}
          onChange={(v) => setField("whatsapp", v)}
          error={errors.whatsapp}
          placeholder="01712345678 বা https://wa.me/8801712345678"
          disabled={saving}
        />
        <Field
          label="Telegram"
          icon={Send}
          value={form.telegram}
          onChange={(v) => setField("telegram", v)}
          error={errors.telegram}
          placeholder="https://t.me/nekirjhuri"
          disabled={saving}
        />
      </FormSection>

      {/* Map embed (full width, textarea) */}
      <FormSection
        title="ম্যাপ এম্বেড"
        description="Google Maps iframe-এর src লিংক দিন (ঐচ্ছিক)।"
      >
        <div className="space-y-1.5">
          <Label htmlFor="mapEmbed" className="text-sm font-600 text-emerald-deep">
            Google Maps Embed URL
          </Label>
          <Textarea
            id="mapEmbed"
            value={form.mapEmbed}
            onChange={(e) => setField("mapEmbed", e.target.value)}
            aria-invalid={!!errors.mapEmbed}
            placeholder="https://www.google.com/maps/embed?pb=..."
            disabled={saving}
            rows={3}
            className={`font-mono text-xs ${errors.mapEmbed ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          {errors.mapEmbed && (
            <p className="text-xs text-destructive">{errors.mapEmbed}</p>
          )}
        </div>
      </FormSection>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
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
              সেটিংস সেভ করুন
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          সেভ করলে সাইটের footer ও donate section সাথে সাথে আপডেট হবে।
        </p>
      </div>
    </form>
  );
}

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------

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
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="font-display font-700 text-base text-emerald-deep">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  disabled,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-600 text-emerald-deep">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          className={`pl-9 h-10 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
