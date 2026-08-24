import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/dashboard
 *
 * Auth-gated. Returns aggregated stats + chart data for the admin dashboard.
 *
 * Response (200): {
 *   stats: {...},          // scalar aggregates (from 9.1)
 *   recentDonations: [...], // last 5 confirmed
 *   charts: {
 *     donations30Days: [{ date, amount, count }],  // area chart
 *     methodDistribution: [{ method, count, amount }],  // pie chart
 *     needsProgress: [{ id, title, raised, target, pct }],  // bar chart
 *   }
 * }
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  // Date ranges
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // 30 days inclusive
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalRaised,
    monthlyRaised,
    donationCount,
    monthlyDonationCount,
    pendingDonations,
    activeNeeds,
    needsAgg,
    fixedProjects,
    fixedProjectsAgg,
    activeModules,
    modulesAgg,
    publishedStories,
    recentDonations,
    donationsLast30Days,
    methodDistribution,
    topNeeds,
  ] = await Promise.all([
    db.donation.aggregate({
      where: { status: "confirmed" },
      _sum: { amount: true },
    }),
    db.donation.aggregate({
      where: { status: "confirmed", receivedAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    db.donation.count({ where: { status: "confirmed" } }),
    db.donation.count({
      where: { status: "confirmed", receivedAt: { gte: startOfMonth } },
    }),
    db.donation.count({ where: { status: "pending" } }),
    db.ummahNeed.count({ where: { status: "active" } }),
    db.ummahNeed.aggregate({
      where: { status: "active" },
      _sum: { targetAmount: true, raisedAmount: true },
    }),
    db.fixedProject.count({ where: { isActive: true } }),
    db.fixedProject.aggregate({
      where: { isActive: true },
      _sum: { monthlyCost: true, beneficiaries: true },
    }),
    db.revenueModule.count({ where: { isActive: true, status: "active" } }),
    db.revenueModule.aggregate({
      where: { isActive: true, status: "active" },
      _sum: { funnelPercent: true },
    }),
    db.project.count({ where: { published: true } }),
    db.donation.findMany({
      where: { status: "confirmed" },
      orderBy: { receivedAt: "desc" },
      take: 5,
      include: { need: { select: { title: true } } },
    }),
    // Chart: donations over last 30 days (all confirmed in range)
    db.donation.findMany({
      where: {
        status: "confirmed",
        receivedAt: { gte: thirtyDaysAgo },
      },
      select: { amount: true, receivedAt: true, method: true },
      orderBy: { receivedAt: "asc" },
    }),
    // Chart: method distribution (all confirmed)
    db.donation.groupBy({
      by: ["method"],
      where: { status: "confirmed" },
      _count: true,
      _sum: { amount: true },
    }),
    // Chart: top 8 active needs by raised amount (for bar chart)
    db.ummahNeed.findMany({
      where: { status: "active" },
      select: {
        id: true,
        title: true,
        raisedAmount: true,
        targetAmount: true,
      },
      orderBy: { raisedAmount: "desc" },
      take: 8,
    }),
  ]);

  const stats = {
    raised: {
      total: totalRaised._sum.amount ?? 0,
      thisMonth: monthlyRaised._sum.amount ?? 0,
    },
    donations: {
      total: donationCount,
      thisMonth: monthlyDonationCount,
      pending: pendingDonations,
    },
    needs: {
      active: activeNeeds,
      totalTarget: needsAgg._sum.targetAmount ?? 0,
      totalRaised: needsAgg._sum.raisedAmount ?? 0,
    },
    fixedProjects: {
      active: fixedProjects,
      monthlyCost: fixedProjectsAgg._sum.monthlyCost ?? 0,
      beneficiaries: fixedProjectsAgg._sum.beneficiaries ?? 0,
    },
    modules: {
      active: activeModules,
      totalFunnel: modulesAgg._sum.funnelPercent ?? 0,
    },
    stories: {
      published: publishedStories,
    },
  };

  // Build 30-day donations array (fill missing days with 0)
  const donations30Days = build30DayArray(donationsLast30Days, thirtyDaysAgo);

  // Format method distribution for pie chart
  const METHOD_LABELS: Record<string, string> = {
    bkash: "বিকাশ",
    nagad: "নগদ",
    cash: "ক্যাশ",
    bank: "ব্যাংক",
  };
  const methodChartData = methodDistribution.map((m) => ({
    method: METHOD_LABELS[m.method] ?? m.method,
    count: m._count,
    amount: m._sum.amount ?? 0,
  }));

  // Format needs progress for bar chart
  const needsProgress = topNeeds.map((n) => ({
    id: n.id,
    title: n.title.length > 20 ? n.title.slice(0, 20) + "…" : n.title,
    raised: n.raisedAmount,
    target: n.targetAmount,
    pct: n.targetAmount > 0 ? Math.round((n.raisedAmount / n.targetAmount) * 100) : 0,
  }));

  return NextResponse.json({
    stats,
    recentDonations,
    charts: {
      donations30Days,
      methodDistribution: methodChartData,
      needsProgress,
    },
  });
}

/** Build a 30-element array of { date, amount, count } with no gaps. */
function build30DayArray(
  donations: { amount: number; receivedAt: Date; method: string }[],
  startDate: Date
) {
  const days: { date: string; amount: number; count: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create a map of date-string → { amount, count }
  const map = new Map<string, { amount: number; count: number }>();
  for (const d of donations) {
    const day = new Date(d.receivedAt);
    day.setHours(0, 0, 0, 0);
    const key = day.toISOString().split("T")[0];
    const existing = map.get(key) ?? { amount: 0, count: 0 };
    existing.amount += d.amount;
    existing.count += 1;
    map.set(key, existing);
  }

  // Iterate 30 days from startDate to today
  const cursor = new Date(startDate);
  while (cursor <= today) {
    const key = cursor.toISOString().split("T")[0];
    const data = map.get(key) ?? { amount: 0, count: 0 };
    days.push({
      date: cursor.toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
      amount: data.amount,
      count: data.count,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}
