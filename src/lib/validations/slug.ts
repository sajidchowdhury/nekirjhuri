/**
 * Slugify helpers — Unicode-aware (supports Bengali + Latin).
 *
 * Used by admin forms to auto-generate URL slugs from titles.
 * Example: "মাদরাসা ছাদ মেরামত" → "মাদরাসা-ছাদ-মেরামত"
 *          "Water Well Project"   → "water-well-project"
 */

/**
 * Convert a string into a URL-safe slug.
 *
 * - Lowercases Latin characters (Bengali has no case).
 * - Replaces whitespace and common separators with single hyphens.
 * - Removes characters that are unsafe in a URL path segment, but KEEPS
 *   Unicode word characters (Bengali, Arabic, etc.) so non-Latin slugs work.
 * - Collapses consecutive hyphens and trims leading/trailing hyphens.
 *
 * @param input  The source string (title, name, etc.)
 * @returns      A slug string, possibly empty if input has no usable chars.
 */
export function slugify(input: string): string {
  if (!input) return "";

  return (
    input
      .toString()
      .normalize("NFC")
      // lowercase Latin letters
      .toLowerCase()
      // replace whitespace + common separators with a single hyphen
      .replace(/[\s_]+/g, "-")
      // remove characters that are not: letters, digits, hyphens, or
      // any non-ASCII word character (covers Bengali/Arabic ranges)
      .replace(/[^\p{L}\p{N}-]/gu, "")
      // collapse multiple hyphens
      .replace(/-+/g, "-")
      // trim leading/trailing hyphens
      .replace(/^-+|-+$/g, "")
  );
}

/**
 * Slugify with a guaranteed non-empty result.
 *
 * If `slugify(input)` produces an empty string (e.g. input was only
 * punctuation/symbols), a fallback is appended so the slug is never empty.
 * This is useful when a slug must be unique and non-empty (DB constraints).
 *
 * @param input    The source string.
 * @param fallback  Suffix to use when the slug would be empty
 *                  (default: a short random id).
 * @returns         A non-empty slug.
 */
export function slugifyOrFallback(
  input: string,
  fallback?: string
): string {
  const slug = slugify(input);
  if (slug) return slug;

  const suffix =
    fallback ??
    Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

  return `item-${suffix}`;
}

/**
 * Generate a unique slug by appending -2, -3, ... if the base slug already
 * exists. Checks existence via the provided `exists` predicate.
 *
 * @param base      The desired slug (already slugified).
 * @param exists    Async function returning true if a slug is taken.
 * @param excludeId Optional id to exclude from the uniqueness check (for edits).
 */
export async function ensureUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
  excludeId?: string
): Promise<string> {
  let candidate = base;
  let n = 1;

  // If the base is taken, try base-2, base-3, ...
  while (await exists(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }

  // excludeId note: the caller's `exists` predicate should itself exclude
  // the given id (e.g. WHERE slug = ? AND id != ?). We don't pass excludeId
  // through here to keep the predicate signature simple.
  void excludeId;

  return candidate;
}
