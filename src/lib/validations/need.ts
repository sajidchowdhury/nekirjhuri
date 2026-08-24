import { z } from "zod";

/**
 * Validation schema for UmmahNeed (উম্মাহর প্রয়োজন).
 *
 * Used by the admin create/update APIs.
 */

export const NEED_CATEGORIES = [
  "madrasa",
  "student",
  "medical",
  "family",
  "emergency",
  "general",
] as const;

export const NEED_URGENCIES = ["critical", "high", "normal"] as const;

export const NEED_STATUSES = ["active", "funded", "closed"] as const;

export const BKASH_TYPES = ["personal", "merchant"] as const;

export const needCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "শিরোনাম আবশ্যক")
    .max(150, "শিরোনাম ১৫০ অক্ষরের বেশি নয়"),
  slug: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || /^[\p{L}\p{N}-]+$/u.test(v),
      "slug-এ শুধু অক্ষর, সংখ্যা ও হাইফেন থাকতে পারে"
    ),
  summary: z
    .string()
    .trim()
    .min(1, "সংক্ষিপ্ত বিবরণ আবশ্যক")
    .max(250, "সারাংশ ২৫০ অক্ষরের বেশি নয়"),
  description: z
    .string()
    .trim()
    .min(1, "বিস্তারিত বিবরণ আবশ্যক")
    .max(5000, "বিবরণ ৫০০০ অক্ষরের বেশি নয়"),
  category: z.refine(
    (v) => NEED_CATEGORIES.includes(v as (typeof NEED_CATEGORIES)[number]),
    `ক্যাটাগরি হতে হবে: ${NEED_CATEGORIES.join(", ")}`
  ),
  location: z.string().trim().optional().nullable(),
  targetAmount: z
    .number()
    .int("পূর্ণসংখ্যা হতে হবে")
    .min(1, "লক্ষ্য পরিমাণ ০ এর বেশি হতে হবে")
    .max(100000000, "লক্ষ্য ১০ কোটির বেশি নয়"),
  image: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || v.startsWith("/uploads/") || v.startsWith("/images/"),
      "ছবি /uploads/ বা /images/ দিয়ে শুরু হতে হবে"
    ),
  urgency: z.refine(
    (v) => NEED_URGENCIES.includes(v as (typeof NEED_URGENCIES)[number]),
    `জরুরি অবস্থা হতে হবে: ${NEED_URGENCIES.join(", ")}`
  ),
  beneficiary: z.string().trim().optional().nullable(),
  status: z.refine(
    (v) => NEED_STATUSES.includes(v as (typeof NEED_STATUSES)[number]),
    `স্ট্যাটাস হতে হবে: ${NEED_STATUSES.join(", ")}`
  ),
  bKashNumber: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || /^[0-9 +\-]{6,20}$/.test(v),
      "বৈধ ফোন নম্বর দিন (৬-২০ অক্ষর)"
    ),
  bKashType: z.refine(
    (v) => BKASH_TYPES.includes(v as (typeof BKASH_TYPES)[number]),
    `bKash টাইপ হতে হবে: ${BKASH_TYPES.join(", ")}`
  ),
});

export type NeedCreateInput = z.infer<typeof needCreateSchema>;
