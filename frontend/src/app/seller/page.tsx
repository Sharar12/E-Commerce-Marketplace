"use client";

import Link from "next/link";
import { Wallet, Package, AlertTriangle, Star, TrendingUp, ArrowRight } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetSellerDashboardQuery, useGetSellerOrdersQuery, useGetSellerQuery, useGetProductsQuery } from "@/features/api/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { formatBDT } from "@/lib/utils";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(() => import("@/components/shared/charts/RevenueChart"), { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> });
const DonutChart = dynamic(() => import("@/components/shared/charts/DonutChart"), { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> });

export default function SellerDashboardPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const sellerId = user.sellerId ?? "sel-techpoint";
  const { data, isLoading } = useGetSellerDashboardQuery(sellerId);
  const { data: ordersData } = useGetSellerOrdersQuery(sellerId);
  const { data: seller } = useGetSellerQuery(sellerId);
  const { data: productsData } = useGetProductsQuery({ sellerId, pageSize: 100 });
  const recentOrders = (ordersData?.items ?? []).slice(0, 5);
  const lowStock = (productsData?.items ?? [])
    .filter((p) => p.stock < 10)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, {seller?.ownerName ?? "Seller"} 👋</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{seller?.shopName} · Here's how your shop performed.</p>
        </div>
        <Button href="/seller/products/new"><Package className="h-4 w-4" /> Add Product</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue Today" value={data ? formatBDT(data.kpis.revenueToday) : "—"} icon={<Wallet className="h-5 w-5" />} iconClass="bg-primary-500/20 text-primary-800" loading={isLoading} trend={{ value: "+12.4%" }} />
        <StatCard label="This Week" value={data ? formatBDT(data.kpis.revenueWeek) : "—"} icon={<TrendingUp className="h-5 w-5" />} iconClass="bg-accent-400/20 text-primary-800" loading={isLoading} trend={{ value: "+8.1%" }} />
        <StatCard label="Pending Orders" value={data?.kpis.ordersPending ?? "—"} icon={<Package className="h-5 w-5" />} iconClass="bg-info-100 text-info-400" loading={isLoading} />
        <StatCard label="Avg Rating" value={data ? `${data.kpis.avgRating.toFixed(1)} ★` : "—"} icon={<Star className="h-5 w-5" />} iconClass="bg-success-100 text-success-500" loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Revenue — Last 30 Days</h2>
            <Link href="/seller/analytics" className="text-sm font-medium text-primary-800 hover:text-primary-800">Analytics →</Link>
          </div>
          <div className="mt-4">
            <RevenueChart data={(data?.revenueTrend ?? []).map((t) => ({ label: t.label, value: t.revenue }))} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Customer Demographics</h2>
          <div className="mt-4">
            <DonutChart data={data?.demographics ?? []} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
            <Link href="/seller/orders" className="flex items-center gap-1 text-sm font-medium text-primary-800 hover:text-primary-800">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentOrders.map((o) => (
              <Link key={o.id} href={`/seller/orders/${o.id}`} className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3 transition-colors hover:bg-[var(--surface-2)]">
                <div>
                  <p className="font-mono text-xs font-semibold text-foreground">{o.orderCode}</p>
                  <p className="text-xs text-[var(--muted)]">{o.customerName} · {formatBDT(o.total)}</p>
                </div>
                <Badge tone={statusTone(o.status)}>{o.status.replace("_", " ")}</Badge>
              </Link>
            ))}
            {recentOrders.length === 0 ? <p className="text-sm text-[var(--muted)]">No orders yet.</p> : null}
          </div>
        </Card>

        {/* Low stock */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <AlertTriangle className="h-4.5 w-4.5 text-accent-500" /> Low Stock Alerts
            </h2>
            <Link href="/seller/inventory" className="text-sm font-medium text-primary-800 hover:text-primary-800">Inventory →</Link>
          </div>
          <div className="mt-4 space-y-3">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-accent-300/50 bg-accent-400/5 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-[var(--muted)]">SKU {p.sku}</p>
                </div>
                <Badge tone={p.stock === 0 ? "danger" : "warning"}>{p.stock} left</Badge>
              </div>
            ))}
            {lowStock.length === 0 ? <p className="text-sm text-[var(--muted)]">All stock levels healthy ✅</p> : null}
          </div>
        </Card>
      </div>

      {/* Top products */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Top Selling Products</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(data?.topProducts ?? []).slice(0, 5).map((p, i) => (
            <Link key={p.id} href={`/seller/products/${p.id}`} className="rounded-2xl border border-[var(--line)] p-4 transition-all hover:border-primary-200 hover:shadow-card">
              <p className="text-xs font-bold text-primary-800">#{i + 1}</p>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">{p.name}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">{p.sold.toLocaleString()} sold</p>
              <p className="text-sm font-bold text-foreground">{formatBDT(p.revenue, { compact: true })}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
