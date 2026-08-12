"use client";

import { useGetSupportDashboardQuery, useGetTicketsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { timeAgo } from "@/lib/utils";
import dynamic from "next/dynamic";

const DonutChart = dynamic(() => import("@/components/shared/charts/DonutChart"), { ssr: false, loading: () => <Skeleton className="h-56 w-full" /> });

export default function AdminSupportPage() {
  const { data, isLoading } = useGetSupportDashboardQuery();
  const { data: ticketsData } = useGetTicketsQuery({ pageSize: 8 });
  const tickets = ticketsData?.items ?? [];
  const sorted = [...(data?.agentPerformance ?? [])].sort((a, b) => b.resolved - a.resolved);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Support Oversight</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">All tickets, agent performance and category volumes.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open Tickets" value={data?.kpis.openTickets ?? "—"} icon={<span>🎫</span>} iconClass="bg-primary-500/20" loading={isLoading} />
        <StatCard label="Avg Response" value={data?.kpis.avgResponseTime ?? "—"} icon={<span>⚡</span>} iconClass="bg-info-100" loading={isLoading} />
        <StatCard label="Satisfaction" value={data ? `${data.kpis.satisfaction} ★` : "—"} icon={<span>💛</span>} iconClass="bg-accent-400/20" loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Tickets by Category</h2>
          <div className="mt-4"><DonutChart data={data?.ticketsByCategory ?? []} height={220} /></div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Agent Performance Leaderboard</h2>
          <div className="mt-4 space-y-3">
            {sorted.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-accent-400/30 text-primary-800" : "bg-[var(--surface-2)] text-[var(--muted)]"}`}>{i + 1}</span>
                <Avatar src={undefined} name={a.name} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{a.name}</p>
                  <p className="text-xs text-[var(--muted)]">{a.resolved} resolved · {a.avgResponse} avg</p>
                </div>
                <Badge tone={a.satisfaction >= 4.7 ? "success" : "neutral"}>{a.satisfaction} ★</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="text-base font-semibold text-foreground">Latest Tickets</h2>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {tickets.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-4">
              <span className="font-mono text-xs font-semibold text-[var(--muted)]">{t.code}</span>
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{t.subject}</p>
              <Badge tone={statusTone(t.status)}>{t.status}</Badge>
              <span className="text-xs text-[var(--muted)]">{timeAgo(t.createdAt)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
