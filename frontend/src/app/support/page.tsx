"use client";

import Link from "next/link";
import { Ticket, AlertTriangle, CheckCircle2, Clock, ArrowRight, Headphones } from "lucide-react";
import { useGetSupportDashboardQuery, useGetTicketsQuery } from "@/features/api/api";
import { useAppSelector } from "@/lib/hooks";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { timeAgo } from "@/lib/utils";
import dynamic from "next/dynamic";

const DonutChart = dynamic(() => import("@/components/shared/charts/DonutChart"), { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> });

export default function SupportDashboardPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const agentId = user.agentId ?? "agt-01";
  const { data, isLoading } = useGetSupportDashboardQuery();
  const { data: ticketsData } = useGetTicketsQuery();
  const tickets = ticketsData?.items ?? [];
  const myTickets = tickets.filter((t) => t.assignedAgentId === agentId);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-slate-900 via-dark-800 to-primary-900 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur">
            <Headphones className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Support Dashboard</h1>
            <p className="mt-1 text-sm text-slate-300/80">Welcome back, {user.name} — {myTickets.length} tickets assigned to you.</p>
          </div>
        </div>
        <Button href="/support/tickets"><Ticket className="h-4 w-4" /> Open Ticket Queue</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open Tickets" value={data?.kpis.openTickets ?? "—"} icon={<Ticket className="h-5 w-5" />} iconClass="bg-primary-500/20 text-primary-800" loading={isLoading} />
        <StatCard label="SLA Breaches" value={data?.kpis.slaBreaches ?? "—"} icon={<AlertTriangle className="h-5 w-5" />} iconClass="bg-danger-100 text-danger-500" loading={isLoading} />
        <StatCard label="Resolved Today" value={data?.kpis.resolvedToday ?? "—"} icon={<CheckCircle2 className="h-5 w-5" />} iconClass="bg-success-100 text-success-500" loading={isLoading} />
        <StatCard label="Avg Response" value={data?.kpis.avgResponseTime ?? "—"} icon={<Clock className="h-5 w-5" />} iconClass="bg-info-100 text-info-400" loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Tickets by Category</h2>
          <div className="mt-4"><DonutChart data={data?.ticketsByCategory ?? []} height={240} /></div>
        </Card>

        {/* SLA alerts */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <AlertTriangle className="h-4.5 w-4.5 text-danger-500" /> SLA Alerts
          </h2>
          <div className="mt-4 space-y-2">
            {tickets.filter((t) => new Date(t.slaDeadline) < new Date() && t.status !== "resolved").slice(0, 5).map((t) => (
              <Link key={t.id} href={`/support/tickets/${t.id}`} className="block rounded-xl border border-danger-200 bg-danger-100/30 p-3 transition-colors hover:bg-danger-100/60">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{t.subject}</p>
                  <Badge tone="danger">Overdue</Badge>
                </div>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{t.code} · {t.priority} priority · {timeAgo(t.slaDeadline)}</p>
              </Link>
            ))}
            {tickets.filter((t) => new Date(t.slaDeadline) < new Date() && t.status !== "resolved").length === 0 ? (
              <p className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">No SLA breaches 🎉</p>
            ) : null}
          </div>
          <Link href="/support/escalations" className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-800 hover:text-primary-800">
            View escalations <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
