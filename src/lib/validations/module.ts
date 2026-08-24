import { z } from "zod";

/**
 * Validation schema for RevenueModule (দুনিয়াবি মডিউল).
 *
 * Used by the admin create/update APIs.
 * - name: required, 1-100 chars
 * - slug: optional, URL-safe (allows Bengali + Latin + hyphens)
 * - description: required, short (1-300 chars)
 * - howItWorks: optional, markdown body (max 5000 chars)
 * - icon: optional, one of the known lucide icon keys
 * - featuredImage: optional, must be a path like /uploads/... or /images/...
 * - socialLinks: optional, JSON string of [{type, url}]
 * - funnelPercent: 0-100
 * - status: active | inactive | archived
 */

export const SOCIAL_TYPES = [
  "facebook",
  "youtube",
  "instagram",
  "twitter",
  "whatsapp",
  "telegram",
  "linkedin",
  "website",
] as const;

export const MODULE_ICONS = [
  "shopping",
  "briefcase",
  "book",
  "leaf",
  "heart",
  "star",
  "globe",
  "truck",
  "code",
  "palette",
] as const;

export const moduleCreateSchema = z.object({
  name: z.string().trim().min(1, "নাম আবশ্যক").max(100, "নাম ১০০ অক্ষরের বেশি নয়"),
  slug: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || /^[\p{L}\p{N}-]+$/u.test(v),
      "slug-এ শুধু অক্ষর, সংখ্যা ও হাইফেন থাকতে পারে"
    ),
  description: z
    .string()
    .trim()
    .min(1, "সংক্ষিপ্ত বিবরণ আবশ্যক")
    .max(300, "বিবরণ ৩০০ অক্ষরের বেশি নয়"),
  howItWorks: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((v) => !v || v.length <= 5000, "সর্বোচ্চ ৫০০০ অক্ষর"),
  icon: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || MODULE_ICONS.includes(v as (typeof MODULE_ICONS)[number]),
      `আইকন হতে হবে: ${MODULE_ICONS.join(", ")}`
    ),
  featuredImage: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || v.startsWith("/uploads/") || v.startsWith("/images/"),
      "ছবি /uploads/ বা /images/ দিয়ে শুরু হতে হবে"
    ),
  socialLinks: z
    .string()
    .optional()
    .nullable()
    .refine((v) => {
      if (!v) return true;
      try {
        const parsed = JSON.parse(v);
        return (
          Array.isArray(parsed) &&
          parsed.every(
            (s) =>
              typeof s === "object" &&
              s !== null &&
              typeof s.type === "string" &&
              typeof s.url === "string" &&
              /^https?:\/\//.test(s.url)
          )
        );
      } catch {
        return false;
      }
    }, "socialLinks অবৈধ JSON — [{type, url}] ফরম্যাটে হতে হবে এবং URL http(s):// দিয়ে শুরু হতে হবে"),
  funnelPercent: z
    .number()
    .int("পূর্ণসংখ্যা হতে হবে")
    .min(0, "০ বা তার বেশি")
    .max(100, "১০০ বা তার কম"),
  status: z
    .string()
    .refine((v) => ["active", "inactive", "archived"].includes(v), "active | inactive | archived"),
});

/** Reorder payload: array of {id, order} */
export const moduleReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        order: z.number().int().min(0),
      })
    )
    .min(1, "অন্তত একটি আইটেম প্রয়োজন"),
});

export type ModuleCreateInput = z.infer<typeof moduleCreateSchema>;
export type ModuleReorderInput = z.infer<typeof moduleReorderSchema>;

/** Parse the socialLinks JSON string into a typed array (or empty). */
export interface SocialLink {
  type: string;
  url: string;
}

export function parseSocialLinks(raw: string | null | undefined): SocialLink[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is SocialLink =>
        typeof s === "object" &&
        s !== null &&
        typeof s.type === "string" &&
        typeof s.url === "string"
    );
  } catch {
    return [];
  }
}
