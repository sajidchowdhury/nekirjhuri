import { z } from "zod";

/**
 * Validation schema for FixedProject (স্থায়ী প্রজেক্ট) — Phase 8.
 */

export const PROJECT_TYPES = [
  "madrasha",
  "moktob",
  "orphanage",
  "clinic",
  "mosque",
] as const;

export const fixedProjectCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "নাম আবশ্যক")
    .max(150, "নাম ১৫০ অক্ষরের বেশি নয়"),
  slug: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || /^[\p{L}\p{N}-]+$/u.test(v),
      "slug-এ শুধু অক্ষর, সংখ্যা ও হাইফেন"
    ),
  type: z.refine(
    (v) => PROJECT_TYPES.includes(v as (typeof PROJECT_TYPES)[number]),
    `টাইপ হতে হবে: ${PROJECT_TYPES.join(", ")}`
  ),
  description: z
    .string()
    .trim()
    .min(1, "বিবরণ আবশ্যক")
    .max(3000, "বিবরণ ৩০০০ অক্ষরের বেশি নয়"),
  location: z.string().trim().optional().nullable(),
  beneficiaries: z
    .number()
    .int("পূর্ণসংখ্যা হতে হবে")
    .min(0, "০ বা তার বেশি")
    .max(100000, "১ লক্ষের বেশি নয়"),
  monthlyCost: z
    .number()
    .int("পূর্ণসংখ্যা হতে হবে")
    .min(0, "০ বা তার বেশি")
    .max(10000000, "১ কোটির বেশি নয়"),
  establishedAt: z.string().trim().optional().nullable(),
  image: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || v.startsWith("/uploads/") || v.startsWith("/images/"),
      "ছবি /uploads/ বা /images/ দিয়ে শুরু হতে হবে"
    ),
  gallery: z
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
            (p) => typeof p === "string" && (p.startsWith("/uploads/") || p.startsWith("/images/"))
          )
        );
      } catch {
        return false;
      }
    }, "gallery অবৈধ JSON — string array হতে হবে (/uploads/ বা /images/ পথ)"),
  isActive: z.boolean().default(true),
});

export type FixedProjectCreateInput = z.infer<typeof fixedProjectCreateSchema>;
