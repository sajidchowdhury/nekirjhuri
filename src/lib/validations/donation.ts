import { z } from "zod";

/**
 * Validation schema for Donation (Phase 6).
 */

export const DONATION_METHODS = [
  "bkash",
  "nagad",
  "cash",
  "bank",
] as const;

export const DONATION_STATUSES = [
  "pending",
  "confirmed",
  "rejected",
] as const;

/** Admin recording a donation (defaults to confirmed). */
export const donationCreateSchema = z.object({
  needId: z.string().min(1, "প্রয়োজন নির্বাচন করুন"),
  donorName: z
    .string()
    .trim()
    .min(1, "ডোনারের নাম আবশ্যক")
    .max(100, "নাম ১০০ অক্ষরের বেশি নয়"),
  donorPhone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || /^[0-9 +\-]{6,20}$/.test(v),
      "বৈধ ফোন নম্বর দিন"
    ),
  amount: z
    .number()
    .int("পূর্ণসংখ্যা হতে হবে")
    .min(1, "পরিমাণ ০ এর বেশি হতে হবে")
    .max(10000000, "পরিমাণ ১ কোটির বেশি নয়"),
  method: z.refine(
    (v) => DONATION_METHODS.includes(v as (typeof DONATION_METHODS)[number]),
    `পদ্ধতি হতে হবে: ${DONATION_METHODS.join(", ")}`
  ),
  transactionId: z.string().trim().optional().nullable(),
  note: z.string().trim().optional().nullable(),
  receivedAt: z.string().optional().nullable(), // ISO date string
  status: z
    .refine(
      (v) => DONATION_STATUSES.includes(v as (typeof DONATION_STATUSES)[number]),
      `স্ট্যাটাস হতে হবে: ${DONATION_STATUSES.join(", ")}`
    )
    .default("confirmed"),
});

/** Public self-report (always pending). */
export const donationSelfReportSchema = z.object({
  needId: z.string().min(1, "প্রয়োজন নির্বাচন করুন"),
  donorName: z
    .string()
    .trim()
    .min(1, "আপনার নাম আবশ্যক")
    .max(100, "নাম ১০০ অক্ষরের বেশি নয়"),
  donorPhone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || /^[0-9 +\-]{6,20}$/.test(v),
      "বৈধ ফোন নম্বর দিন"
    ),
  amount: z
    .number()
    .int("পূর্ণসংখ্যা হতে হবে")
    .min(1, "পরিমাণ ০ এর বেশি হতে হবে")
    .max(10000000, "পরিমাণ ১ কোটির বেশি নয়"),
  method: z.refine(
    (v) => DONATION_METHODS.includes(v as (typeof DONATION_METHODS)[number]),
    `পদ্ধতি হতে হবে: ${DONATION_METHODS.join(", ")}`
  ),
  transactionId: z.string().trim().optional().nullable(),
});

/** Status update (confirm/reject). */
export const donationStatusSchema = z.object({
  status: z.refine(
    (v) => ["confirmed", "rejected"].includes(v),
    "status হতে হবে: confirmed বা rejected"
  ),
});

export type DonationCreateInput = z.infer<typeof donationCreateSchema>;
export type DonationSelfReportInput = z.infer<typeof donationSelfReportSchema>;
