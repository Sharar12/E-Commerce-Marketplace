"use client";

import Link from "next/link";
import { Package, Wallet, Truck, Gift, ChevronRight, ArrowRight, Star } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetCustomerDashboardQuery, useGetRecommendedProductsQuery, useGetCustomerQuery } from "@/features/api/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { OrderRow } from "@/components/shared/OrderRow";
import { ProductCard } from "@/components/shared/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { formatBDT } from "@/lib/utils";

export default function CustomerDashboardPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const { data, isLoading } = useGetCustomerDashboardQuery(user.id);
  const { data: recs } = useGetRecommendedProductsQuery();
  const { data: profile } = useGetCustomerQuery(user.id);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-slate-900 via-dark-800 to-primary-900 p-6 sm:p-8">
        <div>
          <p className="text-sm text-slate-300">Welcome back 👋</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">{user.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-accent-400">
            <Star className="h-4 w-4 fill-accent-400" /> {profile?.tier ?? "bronze"} member · {(profile?.loyaltyPoints ?? 0).toLocaleString()} points
          </p>
        </div>
        <div className="flex gap-2">
          <Button href="/account/loyalty" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20">
            <Gift className="h-4 w-4" /> Loyalty
          </Button>
          <Button href="/account/orders">My Orders</Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={data?.kpis.totalOrders ?? "—"}
          icon={<Package className="h-5 w-5" />}
          iconClass="bg-primary-500/20 text-primary-800"
          loading={isLoading}
        />
        <StatCard
          label="Total Spent"
          value={data ? formatBDT(data.kpis.totalSpent) : "—"}
          icon={<Wallet className="h-5 w-5" />}
          iconClass="bg-accent-400/20 text-primary-800"
          loading={isLoading}
        />
        <StatCard
          label="In Transit"
          value={data?.kpis.inTransit ?? "—"}
          icon={<Truck className="h-5 w-5" />}
          iconClass="bg-info-100 text-info-400"
          loading={isLoading}
        />
        <StatCard
          label="Loyalty Points"
          value={(data?.kpis.loyaltyPoints ?? 0).toLocaleString()}
          icon={<Gift className="h-5 w-5" />}
          iconClass="bg-success-100 text-success-500"
          loading={isLoading}
        />
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
          <Link href="/account/orders" className="flex items-center gap-1 text-sm font-medium text-primary-800 hover:text-primary-800">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
          ) : (data?.recentOrders ?? []).length === 0 ? (
            <Card className="p-8 text-center text-sm text-[var(--muted)]">
              No orders yet. <Link href="/" className="font-medium text-primary-800">Start shopping →</Link>
            </Card>
          ) : (
            data!.recentOrders.map((o) => <OrderRow key={o.id} order={o} href={`/account/orders/${o.id}`} />)
          )}
        </div>
      </div>

      {/* Recommended */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Recommended for you</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {(recs?.items ?? []).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
