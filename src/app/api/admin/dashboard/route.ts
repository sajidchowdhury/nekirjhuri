import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/dashboard
 *
 * Auth-gated. Returns aggregated stats for the admin dashboard:
 *   - Total raised (all-time + this month, confirmed donations only)
 *   - Donation count (total + this month)
 *   - Active needs count + total target vs raised
 *   - Pending donations count (awaiting confirmation)
 *   - Fixed projects count + total monthly cost + total beneficiaries
 *   - Revenue modules count + total funnel %
 *   - Published stories count
 *   - Recent donations (last 5, confirmed)
 *
 * Response (200): { stats: {...}, recentDonations: [...] }
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "অননুমোদিত।" }, { status: 401 });
  }

  // Date ranges
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Run all counts/sums in parallel for speed
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
  ] = await Promise.all([
    // Total raised (confirmed only)
    db.donation.aggregate({
      where: { status: "confirmed" },
      _sum: { amount: true },
    }),
    // Raised this month
    db.donation.aggregate({
      where: {
        status: "confirmed",
        receivedAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    // Total donation count (confirmed)
    db.donation.count({ where: { status: "confirmed" } }),
    // Donation count this month
    db.donation.count({
      where: {
        status: "confirmed",
        receivedAt: { gte: startOfMonth },
      },
    }),
    // Pending donations
    db.donation.count({ where: { status: "pending" } }),
    // Active needs count
    db.ummahNeed.count({ where: { status: "active" } }),
    // Needs: sum of target + raised (active only)
    db.ummahNeed.aggregate({
      where: { status: "active" },
      _sum: { targetAmount: true, raisedAmount: true },
    }),
    // Fixed projects count (active)
    db.fixedProject.count({ where: { isActive: true } }),
    // Fixed projects: sum of monthlyCost + beneficiaries
    db.fixedProject.aggregate({
      where: { isActive: true },
      _sum: { monthlyCost: true, beneficiaries: true },
    }),
    // Active revenue modules
    db.revenueModule.count({
      where: { isActive: true, status: "active" },
    }),
    // Modules: sum of funnelPercent
    db.revenueModule.aggregate({
      where: { isActive: true, status: "active" },
      _sum: { funnelPercent: true },
    }),
    // Published stories
    db.project.count({ where: { published: true } }),
    // Recent donations (last 5 confirmed, with need title)
    db.donation.findMany({
      where: { status: "confirmed" },
      orderBy: { receivedAt: "desc" },
      take: 5,
      include: {
        need: { select: { title: true } },
      },
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

  return NextResponse.json({ stats, recentDonations });
}
