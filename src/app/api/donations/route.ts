import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { donationSelfReportSchema } from "@/lib/validations/donation";

export const dynamic = "force-dynamic";

/**
 * POST /api/donations
 *
 * PUBLIC (no auth). Allows a donor to self-report that they made a
 * donation. Creates a Donation with status='pending' — admin confirms
 * or rejects it later. The need's raisedAmount is NOT incremented until
 * admin confirms.
 *
 * This is the "আমি দান করেছি" button flow on the public need card.
 *
 * Response (201): { success: true, message } (does NOT expose the row id
 *   to avoid leaking info; admin sees it in the pending queue).
 * Errors: 404 (need not found / inactive), 422, 429 (rate limit future).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "অগ্রহণযোগ্য JSON।" }, { status: 400 });
  }

  const parsed = donationSelfReportSchema.safeParse(body);
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

  // Verify the need exists and is active
  const need = await db.ummahNeed.findUnique({ where: { id: data.needId } });
  if (!need || need.status !== "active") {
    return NextResponse.json(
      { error: "এই প্রয়োজনটি আর সক্রিয় নেই।" },
      { status: 404 }
    );
  }

  try {
    await db.donation.create({
      data: {
        needId: data.needId,
        donorName: data.donorName,
        donorPhone: data.donorPhone?.trim() || null,
        amount: data.amount,
        method: data.method,
        transactionId: data.transactionId?.trim() || null,
        status: "pending", // always pending for self-reports
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "আপনার রিপোর্ট গ্রহণ করা হয়েছে। অ্যাডমিন যাচাই করার পর প্রোগ্রেস আপডেট হবে ইনশাআল্লাহ।",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[donations] self-report error:", err);
    return NextResponse.json(
      { error: "রিপোর্ট করা যায়নি। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
