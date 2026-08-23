/**
 * Safe revalidation wrapper around Next.js `revalidatePath`.
 *
 * Why a wrapper?
 * - `revalidatePath` throws if called in certain contexts (e.g. inside a
 *   route handler that wasn't set up with the right runtime). We never want
 *   a revalidation failure to crash an admin mutation response.
 * - We want a single, consistent place to log revalidation activity.
 * - We want convenience helpers for the common paths used across the admin
 *   panel (home, story pages, project pages, etc.).
 *
 * Usage in an admin API route handler after a mutation:
 *
 *   import { revalidateHome, revalidatePathSafe } from "@/lib/revalidate";
 *   await revalidateHome();
 *   await revalidatePathSafe("/stories/[slug]", "page");
 */

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Revalidate a single path, swallowing + logging any error.
 *
 * @param path     The path to revalidate (e.g. "/" or "/stories/my-slug").
 * @param type     "page" | "layout" (optional). Use "layout" for the root
 *                 layout to revalidate every page.
 * @returns        true if it succeeded, false if it threw.
 */
export async function revalidatePathSafe(
  path: string,
  type?: "page" | "layout"
): Promise<boolean> {
  try {
    revalidatePath(path, type);
    return true;
  } catch (err) {
    console.warn(
      `[revalidate] failed to revalidate path "${path}"` +
        (type ? ` (type=${type})` : "") +
        `:`,
      err instanceof Error ? err.message : err
    );
    return false;
  }
}

/**
 * Revalidate a cache tag, swallowing + logging any error.
 */
export async function revalidateTagSafe(tag: string): Promise<boolean> {
  try {
    revalidateTag(tag);
    return true;
  } catch (err) {
    console.warn(
      `[revalidate] failed to revalidate tag "${tag}":`,
      err instanceof Error ? err.message : err
    );
    return false;
  }
}

/**
 * Revalidate the public home page (and its root layout) so every section
 * reflects the latest data. Use after any content mutation.
 */
export async function revalidateHome(): Promise<void> {
  await revalidatePathSafe("/", "layout");
}

/**
 * Revalidate a story's public detail page.
 * Pass the slug; this expands to /stories/<slug>.
 */
export async function revalidateStory(slug: string): Promise<void> {
  await revalidatePathSafe(`/stories/${slug}`, "page");
}

/**
 * Revalidate a fixed project's public detail page.
 * Pass the slug; this expands to /projects/<slug>.
 */
export async function revalidateProject(slug: string): Promise<void> {
  await revalidatePathSafe(`/projects/${slug}`, "page");
}

/**
 * Revalidate a revenue module's public detail page.
 * Pass the slug; this expands to /modules/<slug>.
 */
export async function revalidateModule(slug: string): Promise<void> {
  await revalidatePathSafe(`/modules/${slug}`, "page");
}

/**
 * Revalidate everything public — use sparingly (e.g. after a bulk import).
 * Revalidates the root layout, which cascades to all pages.
 */
export async function revalidateAll(): Promise<void> {
  await revalidatePathSafe("/", "layout");
}
