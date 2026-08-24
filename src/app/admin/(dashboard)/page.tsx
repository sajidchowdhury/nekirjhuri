import Link from "next/link";
import {
  TrendingUp,
  HeartHandshake,
  Wallet,
  Building2,
  ShoppingBag,
  BookOpen,
  Users,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatBDT, percent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { DonationsAreaChart } from "@/components/admin/charts/donations-area-chart";
import { MethodPieChart } from "@/components/admin/charts/method-pie-chart";
import { NeedsBarChart } from "@/components/admin/charts/needs-bar-chart";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Date ranges
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
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
    // Chart: donations over last 30 days
    db.donation.findMany({
      where: { status: "confirmed", receivedAt: { gte: thirtyDaysAgo } },
      select: { amount: true, receivedAt: true, method: true },
      orderBy: { receivedAt: "asc" },
    }),
    // Chart: method distribution
    db.donation.groupBy({
      by: ["method"],
      where: { status: "confirmed" },
      _count: true,
      _sum: { amount: true },
    }),
    // Chart: top 8 active needs by raised
    db.ummahNeed.findMany({
      where: { status: "active" },
      select: { id: true, title: true, raisedAmount: true, targetAmount: true },
      orderBy: { raisedAmount: "desc" },
      take: 8,
    }),
  ]);

  const totalRaisedAmount = totalRaised._sum.amount ?? 0;
  const monthlyRaisedAmount = monthlyRaised._sum.amount ?? 0;
  const needsTarget = needsAgg._sum.targetAmount ?? 0;
  const needsRaised = needsAgg._sum.raisedAmount ?? 0;
  const needsPct = percent(needsRaised, needsTarget);
  const fixedMonthly = fixedProjectsAgg._sum.monthlyCost ?? 0;
  const fixedBeneficiaries = fixedProjectsAgg._sum.beneficiaries ?? 0;
  const moduleFunnel = modulesAgg._sum.funnelPercent ?? 0;

  // Build chart data
  const METHOD_LABELS: Record<string, string> = {
    bkash: "বিকাশ",
    nagad: "নগদ",
    cash: "ক্যাশ",
    bank: "ব্যাংক",
  };

  // 30-day donations array (fill gaps with 0)
  const donations30DaysMap = new Map<string, { amount: number; count: number }>();
  for (const d of donationsLast30Days) {
    const day = new Date(d.receivedAt);
    day.setHours(0, 0, 0, 0);
    const key = day.toISOString().split("T")[0];
    const existing = donations30DaysMap.get(key) ?? { amount: 0, count: 0 };
    existing.amount += d.amount;
    existing.count += 1;
    donations30DaysMap.set(key, existing);
  }
  const donations30Days: { date: string; amount: number; count: number }[] = [];
  const cursor = new Date(thirtyDaysAgo);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  while (cursor <= today) {
    const key = cursor.toISOString().split("T")[0];
    const data = donations30DaysMap.get(key) ?? { amount: 0, count: 0 };
    donations30Days.push({
      date: cursor.toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
      amount: data.amount,
      count: data.count,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const methodChartData = methodDistribution.map((m) => ({
    method: METHOD_LABELS[m.method] ?? m.method,
    count: m._count,
    amount: m._sum.amount ?? 0,
  }));

  const needsProgress = topNeeds.map((n) => ({
    id: n.id,
    title: n.title.length > 20 ? n.title.slice(0, 20) + "…" : n.title,
    raised: n.raisedAmount,
    target: n.targetAmount,
    pct: n.targetAmount > 0 ? Math.round((n.raisedAmount / n.targetAmount) * 100) : 0,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-800 text-2xl text-emerald-deep">ড্যাশবোর্ড</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {now.toLocaleDateString("bn-BD", { dateStyle: "full" })}
        </p>
      </div>

      {/* Pending alert */}
      {pendingDonations > 0 && (
        <Link
          href="/admin/donations?status=pending"
          className="mb-6 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 hover:bg-amber-100 transition-colors"
        >
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-600 text-amber-900">
              {pendingDonations} টি ডোনেশন কনফার্মেশনের অপেক্ষায়
            </p>
            <p className="text-xs text-amber-700">ক্লিক করে যাচাই করুন</p>
          </div>
          <ArrowRight className="h-4 w-4 text-amber-600" />
        </Link>
      )}

      {/* Stats cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total raised */}
        <StatCard
          icon={TrendingUp}
          label="মোট সংগৃহীত"
          value={`৳${formatBDT(totalRaisedAmount)}`}
          sublabel={`এই মাসে ৳${formatBDT(monthlyRaisedAmount)}`}
          accent="emerald"
        />

        {/* Donations */}
        <StatCard
          icon={Wallet}
          label="ডোনেশন সংখ্যা"
          value={String(donationCount)}
          sublabel={`এই মাসে ${monthlyDonationCount} টি`}
          accent="gold"
        />

        {/* Active needs */}
        <StatCard
          icon={HeartHandshake}
          label="সক্রিয় প্রয়োজন"
          value={String(activeNeeds)}
          sublabel={`${needsPct}% সংগৃহীত`}
          accent="emerald"
          href="/admin/needs"
        />

        {/* Fixed projects */}
        <StatCard
          icon={Building2}
          label="স্থায়ী প্রজেক্ট"
          value={String(fixedProjects)}
          sublabel={`মাসিক ৳${formatBDT(fixedMonthly)}`}
          accent="gold"
          href="/admin/projects"
        />
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="উপকৃত মানুষ"
          value={String(fixedBeneficiaries)}
          sublabel="স্থায়ী প্রজেক্ট থেকে"
          accent="emerald"
        />
        <StatCard
          icon={ShoppingBag}
          label="রেভিনিউ মডিউল"
          value={String(activeModules)}
          sublabel={`ফানেল ${moduleFunnel}%`}
          accent="gold"
          href="/admin/modules"
        />
        <StatCard
          icon={BookOpen}
          label="প্রকাশিত গল্প"
          value={String(publishedStories)}
          sublabel="ব্লগ পোস্ট"
          accent="emerald"
          href="/admin/stories"
        />
        <StatCard
          icon={Clock}
          label="অপেক্ষমাণ ডোনেশন"
          value={String(pendingDonations)}
          sublabel={pendingDonations > 0 ? "যাচাই করুন" : "সব পরিষ্কার"}
          accent={pendingDonations > 0 ? "gold" : "emerald"}
          href="/admin/donations"
        />
      </div>

      {/* Needs progress + recent donations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Needs progress */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-700 text-base text-emerald-deep">
              প্রয়োজন অগ্রগতি
            </h2>
            <Link
              href="/admin/needs"
              className="text-xs text-emerald-deep hover:underline inline-flex items-center gap-0.5"
            >
              সব দেখুন <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">সংগৃহীত</span>
              <span className="font-700 text-emerald-deep">
                ৳{formatBDT(needsRaised)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">মোট লক্ষ্য</span>
              <span className="font-600 text-foreground">
                ৳{formatBDT(needsTarget)}
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full progress-fill rounded-full transition-all duration-700"
                style={{ width: `${needsPct}%` }}
              />
            </div>
            <p className="text-right text-sm font-600 text-gold-deep">
              {needsPct}% সম্পন্ন
            </p>
          </div>
        </div>

        {/* Recent donations */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-700 text-base text-emerald-deep">
              সাম্প্রতিক ডোনেশন
            </h2>
            <Link
              href="/admin/donations"
              className="text-xs text-emerald-deep hover:underline inline-flex items-center gap-0.5"
            >
              সব দেখুন <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentDonations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              এখনো কোনো ডোনেশন নেই।
            </p>
          ) : (
            <ul className="space-y-2">
              {recentDonations.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="shrink-0 h-9 w-9 rounded-full bg-emerald-soft/50 flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-emerald-deep" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-foreground truncate">
                      {d.donorName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {d.need?.title ?? "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-700 text-emerald-deep">
                      ৳{formatBDT(d.amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(d.receivedAt).toLocaleDateString("bn-BD", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6">
        <h2 className="font-display font-700 text-lg text-emerald-deep mb-4">
          বিশ্লেষণ
        </h2>
        <div className="space-y-4">
          <DonationsAreaChart data={donations30Days} />
          <div className="grid lg:grid-cols-2 gap-4">
            <MethodPieChart data={methodChartData} />
            <NeedsBarChart data={needsProgress} />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display font-700 text-base text-emerald-deep mb-3">
          দ্রুত অ্যাকশন
        </h2>
        <div className="flex flex-wrap gap-2">
          <QuickAction href="/admin/needs/new" label="নতুন প্রয়োজন" />
          <QuickAction href="/admin/donations" label="ডোনেশন রেকর্ড" />
          <QuickAction href="/admin/stories/new" label="নতুন গল্প" />
          <QuickAction href="/admin/projects/new" label="নতুন প্রজেক্ট" />
          <QuickAction href="/admin/modules/new" label="নতুন মডিউল" />
          <QuickAction href="/admin/settings" label="সেটিংস" />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------

const ACCENT_CLASSES = {
  emerald: {
    iconBg: "bg-emerald-soft/50",
    iconText: "text-emerald-deep",
    value: "text-emerald-deep",
  },
  gold: {
    iconBg: "bg-gold-soft/40",
    iconText: "text-gold-deep",
    value: "text-gold-deep",
  },
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accent,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sublabel?: string;
  accent: keyof typeof ACCENT_CLASSES;
  href?: string;
}) {
  const cls = ACCENT_CLASSES[accent];
  const content = (
    <div className="group rounded-xl border border-border bg-card p-4 hover:border-gold/40 hover:shadow-sm transition-all h-full">
      <div className="flex items-center justify-between mb-2">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${cls.iconBg}`}
        >
          <Icon className={`h-4.5 w-4.5 ${cls.iconText}`} />
        </span>
        {href && (
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <p className="text-xs text-muted-foreground font-500">{label}</p>
      <p className={`font-display font-800 text-xl mt-0.5 ${cls.value}`}>
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full bg-emerald-soft/40 border border-emerald/20 px-3.5 py-1.5 text-sm font-500 text-emerald-deep hover:bg-emerald-soft/70 transition-colors"
    >
      {label}
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}
