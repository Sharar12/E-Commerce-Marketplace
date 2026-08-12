"use client";

import Link from "next/link";
import { TrendingUp, Package, Users, Star } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetSellerDashboardQuery, useGetSellerQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatBDT } from "@/lib/utils";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(() => import("@/components/shared/charts/RevenueChart"), { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> });
const DonutChart = dynamic(() => import("@/components/shared/charts/DonutChart"), { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> });
const BarTrend = dynamic(() => import("@/components/shared/charts/BarTrend"), { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> });

export default function SellerAnalyticsPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const sellerId = user.sellerId ?? "sel-techpoint";
  const { data, isLoading } = useGetSellerDashboardQuery(sellerId);
  const { data: seller } = useGetSellerQuery(sellerId);

  const weeklyRevenue = (data?.revenueTrend ?? []).map((t) => ({ label: t.label, value: t.revenue }));
  const weeklyOrders = (data?.revenueTrend ?? []).map((t) => ({ label: t.label, value: t.orders }));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Deep insights into {seller?.shopName}'s performance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Units Sold" value={data?.kpis.unitsSold?.toLocaleString() ?? "—"} icon={<Package className="h-5 w-5" />} iconClass="bg-primary-500/20 text-primary-800" loading={isLoading} />
        <StatCard label="Avg Rating" value={data ? `${data.kpis.avgRating} ★` : "—"} icon={<Star className="h-5 w-5" />} iconClass="bg-accent-400/20 text-primary-800" loading={isLoading} />
        <StatCard label="Conversion Rate" value="3.4%" icon={<TrendingUp className="h-5 w-5" />} iconClass="bg-info-100 text-info-400" />
        <StatCard label="Returning Customers" value="41%" icon={<Users className="h-5 w-5" />} iconClass="bg-success-100 text-success-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Revenue Trend</h2>
          <div className="mt-4"><RevenueChart data={weeklyRevenue} height={240} /></div>
        </Card>
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Orders per Day</h2>
          <div className="mt-4"><BarTrend data={weeklyOrders} height={240} /></div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Customer Demographics</h2>
          <div className="mt-4"><DonutChart data={data?.demographics ?? []} height={240} /></div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Best Selling Products</h2>
          <div className="mt-4 space-y-3">
            {(data?.topProducts ?? []).map((p, i) => (
              <Link key={p.id} href={`/seller/products/${p.id}`} className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3 transition-colors hover:bg-[var(--surface-2)]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-xs font-bold text-primary-800">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-[var(--muted)]">{p.sold.toLocaleString()} sold · {p.stock} in stock</p>
                </div>
                <p className="text-sm font-bold text-foreground">{formatBDT(p.revenue, { compact: true })}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
