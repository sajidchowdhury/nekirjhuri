import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userUpdateSchema, userPasswordSchema } from "@/lib/validations/user";
import { validatePassword, BCRYPT_COST } from "@/lib/password";
import { requireRole } from "@/lib/rbac";
import { checkCSRF } from "@/lib/csrf";
import { logAction, getClientIP } from "@/lib/audit";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/** PATCH /api/admin/users/[id] — update name, role, or isActive. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRole("super_admin");
  if (error) return error;

  const csrfError = checkCSRF(request);
  if (csrfError) return csrfError;

  const { id } = await params;
  const existing = await db.adminUser.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "ইউজার পাওয়া যায়নি।" }, { status: 404 });
  }

  // Prevent self-deactivation or self-demotion
  if (id === session!.user.id) {
    const body = await request.clone().json().catch(() => ({}));
    if (body.isActive === false) {
      return NextResponse.json(
        { error: "নিজের অ্যাকাউন্ট নিষ্ক্রিয় করা যায় না।" },
        { status: 400 }
      );
    }
    if (body.role && body.role !== "super_admin") {
      return NextResponse.json(
        { error: "নিজের রোল কমানো যায় না।" },
        { status: 400 }
      );
    }
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "অগ্রহণযোগ্য JSON।" }, { status: 400 });
  }

  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json({ error: "ভ্যালিডেশন ত্রুটি।", fields }, { status: 422 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.role !== undefined) data.role = parsed.data.role;
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;

  // Prevent deactivating the last super_admin
  if (parsed.data.isActive === false && existing.role === "super_admin") {
    const activeSuperAdmins = await db.adminUser.count({
      where: { role: "super_admin", isActive: true },
    });
    if (activeSuperAdmins <= 1) {
      return NextResponse.json(
        { error: "শেষ সুপার অ্যাডমিনকে নিষ্ক্রিয় করা যায় না।" },
        { status: 400 }
      );
    }
  }

  // Prevent demoting the last super_admin
  if (parsed.data.role === "editor" && existing.role === "super_admin") {
    const activeSuperAdmins = await db.adminUser.count({
      where: { role: "super_admin", isActive: true },
    });
    if (activeSuperAdmins <= 1) {
      return NextResponse.json(
        { error: "শেষ সুপার অ্যাডমিনের রোল কমানো যায় না।" },
        { status: 400 }
      );
    }
  }

  try {
    const updated = await db.adminUser.update({
      where: { id },
      data,
      select: {
        id: true, email: true, name: true, role: true, isActive: true,
        lastLoginAt: true, updatedAt: true,
      },
    });

    await logAction({
      userId: session!.user.id,
      userEmail: session!.user.email,
      action: "update",
      resource: "user",
      resourceId: id,
      ip: getClientIP(request),
      details: JSON.stringify({
        oldRole: existing.role,
        newRole: parsed.data.role ?? existing.role,
        oldActive: existing.isActive,
        newActive: parsed.data.isActive ?? existing.isActive,
      }),
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[users] update error:", err);
    return NextResponse.json({ error: "আপডেট করা যায়নি।" }, { status: 500 });
  }
}

/** DELETE /api/admin/users/[id] — permanently delete a user. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRole("super_admin");
  if (error) return error;

  const csrfError = checkCSRF(request);
  if (csrfError) return csrfError;

  const { id } = await params;
  const existing = await db.adminUser.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "ইউজার পাওয়া যায়নি।" }, { status: 404 });
  }

  // Prevent self-deletion
  if (id === session!.user.id) {
    return NextResponse.json(
      { error: "নিজের অ্যাকাউন্ট মুছে ফেলা যায় না।" },
      { status: 400 }
    );
  }

  // Prevent deleting the last super_admin
  if (existing.role === "super_admin") {
    const activeSuperAdmins = await db.adminUser.count({
      where: { role: "super_admin", isActive: true },
    });
    if (activeSuperAdmins <= 1) {
      return NextResponse.json(
        { error: "শেষ সুপার অ্যাডমিনকে মুছে ফেলা যায় না।" },
        { status: 400 }
      );
    }
  }

  await db.adminUser.delete({ where: { id } });

  await logAction({
    userId: session!.user.id,
    userEmail: session!.user.email,
    action: "delete",
    resource: "user",
    resourceId: id,
    ip: getClientIP(request),
    details: JSON.stringify({ deletedEmail: existing.email, deletedRole: existing.role }),
  });

  return NextResponse.json({ success: true, id });
}

/** PUT /api/admin/users/[id]/password — change password. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRole("super_admin");
  if (error) return error;

  const csrfError = checkCSRF(request);
  if (csrfError) return csrfError;

  const { id } = await params;
  const existing = await db.adminUser.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "ইউজার পাওয়া যায়নি।" }, { status: 404 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "অগ্রহণযোগ্য JSON।" }, { status: 400 });
  }

  const parsed = userPasswordSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json({ error: "ভ্যালিডেশন ত্রুটি।", fields }, { status: 422 });
  }

  // Double-check policy
  const pwCheck = validatePassword(parsed.data.password);
  if (!pwCheck.valid) {
    return NextResponse.json(
      { error: "পাসওয়ার্ড নীতিমালা পূরণ করে না।", fields: { password: pwCheck.errors[0] } },
      { status: 422 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_COST);

  await db.adminUser.update({
    where: { id },
    data: { passwordHash },
  });

  await logAction({
    userId: session!.user.id,
    userEmail: session!.user.email,
    action: "update",
    resource: "user",
    resourceId: id,
    ip: getClientIP(request),
    details: JSON.stringify({ action: "password_reset", targetEmail: existing.email }),
  });

  return NextResponse.json({ success: true });
}
