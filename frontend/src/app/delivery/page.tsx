"use client";

import Link from "next/link";
import { Truck, Wallet, TrendingUp, Banknote, ArrowRight, Phone } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetDeliveryDashboardQuery, useGetPartnerOrdersQuery, useGetDeliveryPartnerQuery } from "@/features/api/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Progress } from "@/components/ui/Progress";
import { formatBDT } from "@/lib/utils";
import dynamic from "next/dynamic";

const BarTrend = dynamic(() => import("@/components/shared/charts/BarTrend"), { ssr: false, loading: () => <Skeleton className="h-56 w-full" /> });

export default function DeliveryDashboardPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const partnerId = user.partnerId ?? "dlv-01";
  const { data, isLoading } = useGetDeliveryDashboardQuery(partnerId);
  const { data: ordersData } = useGetPartnerOrdersQuery(partnerId);
  const { data: partner } = useGetDeliveryPartnerQuery(partnerId);
  const todays = (ordersData?.items ?? []).filter(
    (o) => o.status === "out_for_delivery" || o.status === "shipped" || o.status === "confirmed",
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-slate-900 via-dark-800 to-primary-900 p-6 sm:p-8">
        <div>
          <p className="text-sm text-slate-300">Welcome back 🛵</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">{user.name}</h1>
          <p className="mt-1 text-sm text-slate-300/80">
            {partner?.vehicle.type} · {partner?.vehicle.regNo} · {partner?.serviceAreas.join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="success" className="px-3 py-1.5"><span className="h-2 w-2 animate-pulse rounded-full bg-success-600" /> Online</Badge>
          <Button href="/delivery/queue"><Truck className="h-4 w-4" /> Delivery Queue</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned Today" value={data?.kpis.assignedToday ?? "—"} icon={<Truck className="h-5 w-5" />} iconClass="bg-primary-500/20 text-primary-800" loading={isLoading} />
        <StatCard label="Delivered Today" value={data?.kpis.deliveredToday ?? "—"} icon={<TrendingUp className="h-5 w-5" />} iconClass="bg-info-100 text-info-400" loading={isLoading} />
        <StatCard label="Earnings Today" value={data ? formatBDT(data.kpis.earningsToday) : "—"} icon={<Wallet className="h-5 w-5" />} iconClass="bg-accent-400/20 text-primary-800" loading={isLoading} />
        <StatCard label="This Week" value={data ? formatBDT(data.kpis.earningsWeek) : "—"} icon={<Banknote className="h-5 w-5" />} iconClass="bg-success-100 text-success-500" loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Earnings — This Week</h2>
            <Link href="/delivery/history" className="text-sm font-medium text-primary-800 hover:text-primary-800">History →</Link>
          </div>
          <div className="mt-4">
            <BarTrend data={data?.weekEarnings ?? []} height={220} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Performance</h2>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Completion rate</span><span className="font-semibold text-foreground">{data?.kpis.completionRate ?? "—"}%</span></div>
              <Progress className="mt-2" value={data?.kpis.completionRate ?? 0} barClass="bg-gradient-to-r from-success-500 to-success-600" />
            </div>
            <div>
              <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">COD to remit</span><span className="font-semibold text-foreground">{data ? formatBDT(data.kpis.codToRemit) : "—"}</span></div>
              <div className="mt-2 flex justify-between text-sm"><span className="text-[var(--muted)]">COD collected</span><span className="font-semibold text-foreground">{data ? formatBDT(data.kpis.codCollected) : "—"}</span></div>
            </div>
            <div>
              <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Pending payout</span><span className="font-semibold text-foreground">{data ? formatBDT(data.kpis.pendingPayout) : "—"}</span></div>
            </div>
            <Link href="/delivery/cod" className="block">
              <Button variant="outline" className="w-full">COD Reconciliation</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Today's deliveries */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Today's Deliveries</h2>
          <Link href="/delivery/queue" className="flex items-center gap-1 text-sm font-medium text-primary-800 hover:text-primary-800">Queue <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {todays.slice(0, 3).map((o) => (
            <Link key={o.id} href={`/delivery/active`} className="rounded-2xl border border-[var(--line)] p-4 transition-all hover:border-primary-200 hover:shadow-card">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-foreground">{o.orderCode}</span>
                <Badge tone={statusTone(o.status)}>{o.status.replace("_", " ")}</Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{o.deliveryAddress.area}, {o.deliveryAddress.city}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{o.customerName}</p>
              <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-2">
                <span className="text-sm font-bold text-foreground">{o.paymentMethod === "cod" ? formatBDT(o.total) : "Prepaid"}</span>
                <span className="flex items-center gap-1 text-xs text-[var(--muted)]"><Phone className="h-3 w-3" /> {o.customerPhone.slice(0, 8)}••••</span>
              </div>
            </Link>
          ))}
          {todays.length === 0 ? <p className="text-sm text-[var(--muted)]">No deliveries assigned right now.</p> : null}
        </div>
      </Card>
    </div>
  );
}
