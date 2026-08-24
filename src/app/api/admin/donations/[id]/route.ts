import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { donationStatusSchema } from "@/lib/validations/donation";
import { revalidateHome } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/donations/[id]
 *
 * Auth-gated. Confirms or rejects a (pending) donation.
 * - Confirm: atomically increments need's raisedAmount + donorCount.
 *   Auto-marks need as 'funded' if target reached.
 * - Reject: just sets status (no amount change).
 *
 * Body: { status: "confirmed" | "rejected" }
 * Response (200): the updated donation.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.donation.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "ডোনেশন পাওয়া যায়নি।" },
      { status: 404 }
    );
  }

  // Only pending donations can be confirmed/rejected
  if (existing.status !== "pending") {
    return NextResponse.json(
      { error: "শুধুমাত্র pending ডোনেশন confirm/reject করা যায়।" },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "অগ্রহণযোগ্য JSON।" }, { status: 400 });
  }

  const parsed = donationStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ভ্যালিডেশন ত্রুটি।" },
      { status: 422 }
    );
  }

  const newStatus = parsed.data.status;
  const isConfirm = newStatus === "confirmed";

  try {
    const updated = await db.$transaction(async (tx) => {
      const result = await tx.donation.update({
        where: { id },
        data: {
          status: newStatus,
          confirmedById: isConfirm ? session.user.id : null,
        },
      });

      if (isConfirm) {
        await tx.ummahNeed.update({
          where: { id: existing.needId },
          data: {
            raisedAmount: { increment: existing.amount },
            donorCount: { increment: 1 },
          },
        });

        // Auto-fund check
        const need = await tx.ummahNeed.findUnique({
          where: { id: existing.needId },
          select: { raisedAmount: true, targetAmount: true },
        });
        if (need && need.raisedAmount >= need.targetAmount) {
          await tx.ummahNeed.update({
            where: { id: existing.needId },
            data: { status: "funded" },
          });
        }
      }

      return result;
    });

    await revalidateHome();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[donations] status update error:", err);
    return NextResponse.json(
      { error: "আপডেট করা যায়নি।" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/donations/[id]
 *
 * Auth-gated. Deletes a donation. If it was confirmed, decrements the
 * need's raisedAmount + donorCount atomically (reversing the effect).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.donation.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "ডোনেশন পাওয়া যায়নি।" },
      { status: 404 }
    );
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.donation.delete({ where: { id } });

      // If it was confirmed, reverse the increment
      if (existing.status === "confirmed") {
        await tx.ummahNeed.update({
          where: { id: existing.needId },
          data: {
            raisedAmount: { decrement: existing.amount },
            donorCount: { decrement: 1 },
          },
        });

        // If need was auto-funded, revert to active (unless still over target)
        const need = await tx.ummahNeed.findUnique({
          where: { id: existing.needId },
          select: { raisedAmount: true, targetAmount: true, status: true },
        });
        if (need && need.status === "funded" && need.raisedAmount < need.targetAmount) {
          await tx.ummahNeed.update({
            where: { id: existing.needId },
            data: { status: "active" },
          });
        }
      }
    });

    await revalidateHome();

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[donations] delete error:", err);
    return NextResponse.json(
      { error: "মুছতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
