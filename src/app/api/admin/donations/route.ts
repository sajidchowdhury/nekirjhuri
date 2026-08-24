import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { donationCreateSchema } from "@/lib/validations/donation";
import { revalidateHome } from "@/lib/revalidate";
import { checkCSRF } from "@/lib/csrf";
import { logAction, getClientIP } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/donations
 *
 * Auth-gated. Records a donation against a need. If status is 'confirmed'
 * (the default for admin-recorded), atomically increments the need's
 * raisedAmount + donorCount in a Prisma $transaction.
 *
 * Response (201): the created donation (with need relation).
 * Errors: 401, 404 (need not found), 422, 500.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  // CSRF check
  const csrfError = checkCSRF(request);
  if (csrfError) return csrfError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "অগ্রহণযোগ্য JSON।" }, { status: 400 });
  }

  const parsed = donationCreateSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json(
      { error: "ভ্যালিডেশন ত্রুটি।", fields },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Verify the need exists
  const need = await db.ummahNeed.findUnique({ where: { id: data.needId } });
  if (!need) {
    return NextResponse.json(
      { error: "নির্বাচিত প্রয়োজন পাওয়া যায়নি।" },
      { status: 404 }
    );
  }

  const receivedAt = data.receivedAt ? new Date(data.receivedAt) : new Date();
  const isConfirmed = data.status === "confirmed";

  try {
    // Atomic: create donation + increment need's raisedAmount/donorCount
    const donation = await db.$transaction(async (tx) => {
      const created = await tx.donation.create({
        data: {
          needId: data.needId,
          donorName: data.donorName,
          donorPhone: data.donorPhone?.trim() || null,
          amount: data.amount,
          method: data.method,
          transactionId: data.transactionId?.trim() || null,
          status: data.status,
          note: data.note?.trim() || null,
          receivedAt,
          confirmedById: isConfirmed ? session.user.id : null,
        },
      });

      if (isConfirmed) {
        await tx.ummahNeed.update({
          where: { id: data.needId },
          data: {
            raisedAmount: { increment: data.amount },
            donorCount: { increment: 1 },
          },
        });

        // Auto-mark as funded if target reached
        const updatedNeed = await tx.ummahNeed.findUnique({
          where: { id: data.needId },
          select: { raisedAmount: true, targetAmount: true },
        });
        if (
          updatedNeed &&
          updatedNeed.raisedAmount >= updatedNeed.targetAmount
        ) {
          await tx.ummahNeed.update({
            where: { id: data.needId },
            data: { status: "funded" },
          });
        }
      }

      return created;
    });

    await revalidateHome();

    // Audit log
    await logAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: "create",
      resource: "donation",
      resourceId: donation.id,
      ip: getClientIP(request),
      details: JSON.stringify({
        needId: data.needId,
        amount: data.amount,
        method: data.method,
        status: data.status,
      }),
    });

    return NextResponse.json(donation, { status: 201 });
  } catch (err) {
    console.error("[donations] create error:", err);
    return NextResponse.json(
      { error: "রেকর্ড করা যায়নি। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/donations?status=&method=&needId=&q=
 *
 * Auth-gated. Returns donations with filters, newest first.
 * Includes the need relation (title) for display.
 *
 * Response (200): { donations: [{...need: {title}}] }
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const method = searchParams.get("method");
  const needId = searchParams.get("needId");
  const q = (searchParams.get("q") || "").trim();

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (method) where.method = method;
  if (needId) where.needId = needId;
  if (q) where.donorName = { contains: q };

  const donations = await db.donation.findMany({
    where,
    orderBy: { receivedAt: "desc" },
    include: {
      need: {
        select: { id: true, title: true },
      },
    },
  });

  return NextResponse.json({ donations });
}
