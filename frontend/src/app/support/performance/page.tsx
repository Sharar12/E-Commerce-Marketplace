"use client";

import { useGetSupportDashboardQuery, useGetSupportAgentsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import dynamic from "next/dynamic";

const BarTrend = dynamic(() => import("@/components/shared/charts/BarTrend"), { ssr: false, loading: () => <Skeleton className="h-56 w-full" /> });

export default function PerformancePage() {
  const { data, isLoading } = useGetSupportDashboardQuery();
  const { data: agentsData } = useGetSupportAgentsQuery();
  const supportAgents = agentsData?.items ?? [];

  const weekly = Array.from({ length: 14 }, (_, i) => ({
    label: `${i + 1}`,
    value: 20 + Math.round(Math.sin(i * 1.7) * 12 + i * 1.4),
  }));

  const sorted = [...(data?.agentPerformance ?? [])].sort((a, b) => b.resolved - a.resolved);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Team Performance</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Agent leaderboard and weekly resolution trends.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tickets Resolved" value={data?.kpis.resolvedToday ?? "—"} icon={<span>✅</span>} iconClass="bg-success-100" loading={isLoading} />
        <StatCard label="Avg Response Time" value={data?.kpis.avgResponseTime ?? "—"} icon={<span>⚡</span>} iconClass="bg-info-100" loading={isLoading} />
        <StatCard label="Satisfaction" value={data ? `${data.kpis.satisfaction} ★` : "—"} icon={<span>💛</span>} iconClass="bg-accent-400/20" loading={isLoading} />
      </div>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Tickets Resolved — Last 14 Days</h2>
        <div className="mt-4"><BarTrend data={weekly} height={220} /></div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="text-base font-semibold text-foreground">Agent Leaderboard</h2>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {sorted.map((a, i) => {
            const agent = supportAgents.find((x) => x.id === a.id);
            return (
              <div key={a.id} className="flex items-center gap-4 p-4">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? "bg-accent-400/30 text-primary-800" : i === 1 ? "bg-[var(--surface-2)] text-[var(--muted)]" : i === 2 ? "bg-orange-200 text-orange-700" : "bg-[var(--surface-2)] text-[var(--muted)]"}`}>
                  {i + 1}
                </span>
                <Avatar src={agent?.avatar} name={a.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{a.name}</p>
                  <p className="text-xs text-[var(--muted)]">{agent?.role ?? "agent"} · {agent?.skills?.join(", ") ?? ""}</p>
                </div>
                <div className="hidden text-center sm:block">
                  <p className="text-sm font-bold text-foreground">{a.resolved}</p>
                  <p className="text-[10px] text-[var(--muted)]">Resolved</p>
                </div>
                <div className="hidden text-center sm:block">
                  <p className="text-sm font-medium text-foreground">{a.avgResponse}</p>
                  <p className="text-[10px] text-[var(--muted)]">Avg reply</p>
                </div>
                <Badge tone={a.satisfaction >= 4.7 ? "success" : "neutral"}>{a.satisfaction} ★</Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
