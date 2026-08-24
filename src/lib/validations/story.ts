import { z } from "zod";

/** Story (Project) create/update validation. */
export const storyCreateSchema = z.object({
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
  description: z
    .string()
    .trim()
    .min(1, "বিবরণ আবশ্যক")
    .max(2000, "বিবরণ ২০০০ অক্ষরের বেশি নয়"),
  location: z.string().trim().optional().nullable(),
  status: z
    .string()
    .refine(
      (v) => ["ongoing", "completed", "planning"].includes(v),
      "ongoing | completed | planning"
    ),
  targetAmount: z
    .number()
    .int()
    .min(0, "০ বা তার বেশি")
    .max(100000000, "১০ কোটির বেশি নয়"),
  raisedAmount: z.number().int().min(0).default(0),
  featuredImage: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || v.startsWith("/uploads/") || v.startsWith("/images/"),
      "ছবি /uploads/ বা /images/ দিয়ে শুরু হতে হবে"
    ),
  tags: z.string().trim().optional().nullable(),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  startDate: z.string().optional().nullable(),
});

/** Update (timeline entry) create/update validation. */
export const updateCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "শিরোনাম আবশ্যক")
    .max(200, "শিরোনাম ২০০ অক্ষরের বেশি নয়"),
  description: z
    .string()
    .trim()
    .min(1, "সংক্ষিপ্ত বিবরণ আবশ্যক")
    .max(500, "সারাংশ ৫০০ অক্ষরের বেশি নয়"),
  body: z.string().trim().optional().nullable(),
  image: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || v.startsWith("/uploads/") || v.startsWith("/images/"),
      "ছবি /uploads/ বা /images/ দিয়ে শুরু হতে হবে"
    ),
  collectedAmount: z.number().int().min(0).default(0),
  neededAmount: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
  date: z.string().optional().nullable(),
});

export type StoryCreateInput = z.infer<typeof storyCreateSchema>;
export type UpdateCreateInput = z.infer<typeof updateCreateSchema>;
