/**
 * নেকির ঝুড়ি — Seed bootstrap super_admin
 *
 * Creates one super_admin account if none exists yet, using the email from
 * ADMIN_BOOTSTRAP_EMAIL (default: admin@nekirjhuri.org) and a default password.
 *
 * Usage:
 *   bun run prisma/seed-admin.ts
 *   # or: bun run seed:admin  (after adding to package.json)
 *
 * To set a custom password for the first run, pass it as an env var:
 *   ADMIN_BOOTSTRAP_PASSWORD="your-password" bun run prisma/seed-admin.ts
 *
 * If the admin already exists, the script is a no-op (idempotent).
 */
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

const DEFAULT_PASSWORD = "NekirJhuri@2025";

async function main() {
  const email = (
    process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@nekirjhuri.org"
  )
    .toLowerCase()
    .trim();

  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? DEFAULT_PASSWORD;
  const name = "Super Admin";

  console.log("👤 Seeding bootstrap super_admin…");

  // Check if already exists
  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Admin user already exists: ${email} (role: ${existing.role})`);
    console.log("  Skipping creation. To reset the password, delete the row and re-run.");
    return;
  }

  // Hash the password (cost factor 12 — strong, ~250ms)
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await db.adminUser.create({
    data: {
      email,
      name,
      passwordHash,
      role: "super_admin",
      isActive: true,
    },
  });

  console.log("✅ Bootstrap super_admin created:");
  console.log(`   id:    ${admin.id}`);
  console.log(`   email: ${admin.email}`);
  console.log(`   name:  ${admin.name}`);
  console.log(`   role:  ${admin.role}`);
  console.log("");
  console.log("🔑 Login credentials (change the password after first login):");
  console.log(`   email:    ${email}`);
  console.log(
    `   password: ${process.env.ADMIN_BOOTSTRAP_PASSWORD ? "*** (from ADMIN_BOOTSTRAP_PASSWORD)" : DEFAULT_PASSWORD}`
  );
  console.log("");
  console.log("⚠️  IMPORTANT: Change this password immediately after first login.");
}

main()
  .catch((e) => {
    console.error("✗ Failed to seed admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
