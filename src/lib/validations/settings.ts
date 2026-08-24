import { z } from "zod";

/**
 * Validation schema for SiteSettings.
 *
 * All fields are optional strings (the singleton can start empty). We
 * validate formats where it makes sense:
 *   - email: must be a valid email if provided
 *   - URLs (facebook, youtube, etc.): must start with http:// or https://
 *     if provided — prevents broken links on the public site
 *   - phone/altPhone: free-form (countries have wildly different formats)
 *   - whatsapp: free-form (can be a number or a wa.me link)
 *   - mapEmbed: free-form (it's a Google Maps iframe src, hard to validate)
 *
 * Empty strings are coerced to null so the DB stores NULL, not "".
 */
export const siteSettingsSchema = z.object({
  phone: z.string().trim().optional().nullable(),
  altPhone: z.string().trim().optional().nullable(),
  email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || z.string().email().safeParse(v).success,
      "বৈধ ইমেইল ঠিকানা দিন"
    ),
  address: z.string().trim().optional().nullable(),
  facebook: urlOptional("facebook"),
  youtube: urlOptional("youtube"),
  instagram: urlOptional("instagram"),
  twitter: urlOptional("twitter"),
  telegram: urlOptional("telegram"),
  whatsapp: z.string().trim().optional().nullable(),
  mapEmbed: z.string().trim().optional().nullable(),
  logo: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || v.startsWith("/uploads/") || v.startsWith("/images/"),
      "লোগো /uploads/ বা /images/ দিয়ে শুরু হতে হবে"
    ),
  navItems: z
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
            (item) =>
              typeof item === "object" &&
              item !== null &&
              typeof item.label === "string" &&
              typeof item.href === "string"
          )
        );
      } catch {
        return false;
      }
    }, "navItems অবৈধ JSON — [{label, href}] ফরম্যাটে হতে হবে"),
});

/** Helper: optional string that must be a URL if non-empty. */
function urlOptional(_field: string) {
  return z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || /^https?:\/\/.+/i.test(v),
      `${_field} লিংক http:// বা https:// দিয়ে শুরু হতে হবে`
    );
}

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

/** The singleton row id — always this fixed string. */
export const SETTINGS_SINGLETON_ID = "singleton";
