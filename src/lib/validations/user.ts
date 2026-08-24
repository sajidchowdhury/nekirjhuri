import { z } from "zod";

/** Create a new admin user. */
export const userCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "নাম আবশ্যক")
    .max(100, "নাম ১০০ অক্ষরের বেশি নয়"),
  email: z
    .string()
    .trim()
    .min(1, "ইমেইল আবশ্যক")
    .email("বৈধ ইমেইল ঠিকানা দিন")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(1, "পাসওয়ার্ড আবশ্যক")
    .refine((v) => v.length >= 10, "পাসওয়ার্ড কমপক্ষে ১০ অক্ষরের হতে হবে")
    .refine((v) => /[a-zA-Z]/.test(v), "পাসওয়ার্ডে কমপক্ষে একটি অক্ষর থাকতে হবে")
    .refine((v) => /\d/.test(v), "পাসওয়ার্ডে কমপক্ষে একটি সংখ্যা থাকতে হবে"),
  role: z
    .string()
    .refine(
      (v) => ["super_admin", "editor"].includes(v),
      "role হতে হবে: super_admin বা editor"
    ),
});

/** Update an existing user (role + active status). */
export const userUpdateSchema = z.object({
  name: z.string().trim().min(1, "নাম আবশ্যক").max(100).optional(),
  role: z
    .string()
    .refine(
      (v) => ["super_admin", "editor"].includes(v),
      "role হতে হবে: super_admin বা editor"
    )
    .optional(),
  isActive: z.boolean().optional(),
});

/** Change password (for existing user). */
export const userPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "পাসওয়ার্ড আবশ্যক")
    .refine((v) => v.length >= 10, "পাসওয়ার্ড কমপক্ষে ১০ অক্ষরের হতে হবে")
    .refine((v) => /[a-zA-Z]/.test(v), "পাসওয়ার্ডে কমপক্ষে একটি অক্ষর থাকতে হবে")
    .refine((v) => /\d/.test(v), "পাসওয়ার্ডে কমপক্ষে একটি সংখ্যা থাকতে হবে"),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
