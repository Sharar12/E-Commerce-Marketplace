"use client";

import Link from "next/link";
import { TrendingUp, ShoppingBag, Users, Store, ArrowRight } from "lucide-react";
import { useGetAdminDashboardQuery } from "@/features/api/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatBDT } from "@/lib/utils";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(() => import("@/components/shared/charts/RevenueChart"), { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> });
const DonutChart = dynamic(() => import("@/components/shared/charts/DonutChart"), { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> });
const BarTrend = dynamic(() => import("@/components/shared/charts/BarTrend"), { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> });

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetAdminDashboardQuery();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-slate-900 via-dark-800 to-primary-900 p-6 sm:p-8">
        <div>
          <p className="text-sm text-slate-300">Platform overview</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">ApnarDokan Admin</h1>
          <p className="mt-1 text-sm text-slate-300/80">
            {data ? `${formatBDT(data.kpis.gmv)} GMV all-time · ${data.kpis.activeUsers.toLocaleString()} active users` : "Loading…"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/reports" className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20">
            Reports
          </Link>
          <Link href="/admin/sellers" className="rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/25">
            {data?.kpis.pendingSellers ?? 0} Seller approvals
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="GMV Today" value={data ? formatBDT(data.kpis.gmvToday) : "—"} icon={<TrendingUp className="h-5 w-5" />} iconClass="bg-primary-500/20 text-primary-800" loading={isLoading} trend={{ value: "+9.2%" }} />
        <StatCard label="Orders Today" value={data?.kpis.ordersToday ?? "—"} icon={<ShoppingBag className="h-5 w-5" />} iconClass="bg-info-100 text-info-400" loading={isLoading} trend={{ value: "+4.1%" }} />
        <StatCard label="Active Users" value={data?.kpis.activeUsers?.toLocaleString() ?? "—"} icon={<Users className="h-5 w-5" />} iconClass="bg-success-100 text-success-500" loading={isLoading} />
        <StatCard label="Active Sellers" value={data?.kpis.sellers ?? "—"} icon={<Store className="h-5 w-5" />} iconClass="bg-accent-400/20 text-primary-800" loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">GMV — Last 30 Days</h2>
            <span className="text-xs text-[var(--muted)]">Total {data ? formatBDT(data.kpis.gmv) : "—"}</span>
          </div>
          <div className="mt-4">
            <RevenueChart data={data?.revenueTrend ?? []} height={280} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Payment Split</h2>
          <div className="mt-4">
            <DonutChart data={data?.paymentSplit ?? []} height={260} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Orders per Day</h2>
          <div className="mt-4"><BarTrend data={data?.orderTrend ?? []} height={220} /></div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Category Performance</h2>
            <Link href="/admin/catalog" className="text-sm font-medium text-primary-800 hover:text-primary-800">Manage catalog →</Link>
          </div>
          <div className="mt-4 space-y-3">
            {(data?.categoryPerformance ?? []).map((c) => {
              const max = Math.max(...(data?.categoryPerformance ?? []).map((x) => x.revenue), 1);
              return (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-sm text-[var(--muted)]">{c.name}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700" style={{ width: `${(c.revenue / max) * 100}%` }} />
                  </div>
                  <span className="w-20 text-right text-sm font-semibold text-foreground">{formatBDT(c.revenue, { compact: true })}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
          <h2 className="text-base font-semibold text-foreground">Top Sellers by GMV</h2>
          <Link href="/admin/users" className="flex items-center gap-1 text-sm font-medium text-primary-800 hover:text-primary-800">All users <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-px bg-[var(--surface-2)] sm:grid-cols-2 lg:grid-cols-3">
          {(data?.sellerLeaderboard ?? []).map((s, i) => (
            <div key={s.sellerId} className="flex items-center gap-3 bg-[var(--surface)] p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-sm font-bold text-primary-800">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{s.shopName}</p>
                <p className="text-xs text-[var(--muted)]">{s.orders} orders · {s.rating} ★</p>
              </div>
              <p className="text-sm font-bold text-foreground">{formatBDT(s.gmv, { compact: true })}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
