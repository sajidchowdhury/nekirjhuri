import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_ID } from "@/lib/validations/settings";

/**
 * Get the SiteSettings singleton row, creating it (empty) if it doesn't
 * exist yet. This is called by every settings read — admin API, public
 * API, and server components — so the row is always present.
 *
 * Uses upsert so it's safe to call concurrently (no race condition).
 */
export async function getOrCreateSettings() {
  return db.siteSettings.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: { id: SETTINGS_SINGLETON_ID },
  });
}
