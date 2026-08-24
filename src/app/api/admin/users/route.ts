import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userCreateSchema } from "@/lib/validations/user";
import { validatePassword, BCRYPT_COST } from "@/lib/password";
import { requireRole } from "@/lib/rbac";
import { checkCSRF } from "@/lib/csrf";
import { logAction, getClientIP } from "@/lib/audit";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users — list all admin users (super_admin only).
 * Excludes passwordHash from the response.
 */
export async function GET() {
  const { error } = await requireRole("super_admin");
  if (error) return error;

  const users = await db.adminUser.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { uploads: true, projects: true } },
    },
  });

  return NextResponse.json({ users });
}

/**
 * POST /api/admin/users — create a new admin user (super_admin only).
 * Validates email uniqueness + password policy. Hashes with bcrypt cost 12.
 */
export async function POST(request: Request) {
  const { session, error } = await requireRole("super_admin");
  if (error) return error;

  const csrfError = checkCSRF(request);
  if (csrfError) return csrfError;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "অগ্রহণযোগ্য JSON।" }, { status: 400 });
  }

  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json({ error: "ভ্যালিডেশন ত্রুটি।", fields }, { status: 422 });
  }

  const data = parsed.data;

  // Double-check password policy
  const pwCheck = validatePassword(data.password);
  if (!pwCheck.valid) {
    return NextResponse.json(
      { error: "পাসওয়ার্ড নীতিমালা পূরণ করে না।", fields: { password: pwCheck.errors[0] } },
      { status: 422 }
    );
  }

  // Check email uniqueness
  const existing = await db.adminUser.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json(
      { error: "এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।", fields: { email: "ইমেইল পুনরাবৃত্তি" } },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_COST);

  try {
    const user = await db.adminUser.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: data.role,
        isActive: true,
      },
      select: {
        id: true, email: true, name: true, role: true, isActive: true,
        createdAt: true,
      },
    });

    await logAction({
      userId: session!.user.id,
      userEmail: session!.user.email,
      action: "create",
      resource: "user",
      resourceId: user.id,
      ip: getClientIP(request),
      details: JSON.stringify({ newEmail: user.email, newRole: user.role }),
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("[users] create error:", err);
    return NextResponse.json({ error: "তৈরি করা যায়নি।" }, { status: 500 });
  }
}
