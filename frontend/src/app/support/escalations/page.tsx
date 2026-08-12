"use client";

import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { useGetTicketsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { timeAgo } from "@/lib/utils";

export default function EscalationsPage() {
  const { success } = useToast();
  const { data: ticketsData } = useGetTicketsQuery();
  const escalated = (ticketsData?.items ?? []).filter((t) => t.escalated);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Escalations</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Tickets escalated to Admin for resolution.</p>
      </div>

      {escalated.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-4xl">🧘</p>
          <h2 className="mt-3 text-lg font-bold text-foreground">No escalations</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Everything is being handled at the agent level.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {escalated.map((t) => (
            <Card key={t.id} className="border-danger-200 bg-danger-100/20 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground">{t.code}</span>
                <Badge tone="danger"><AlertTriangle className="h-3 w-3" /> Escalated to Admin</Badge>
                <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                <span className="ml-auto text-xs text-[var(--muted)]">{timeAgo(t.escalated!.at)}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{t.subject}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Reason: {t.escalated!.reason}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{t.customerName} · {t.orderCode ? `Order ${t.orderCode}` : "No order"}</p>
              <div className="mt-3">
                <Button size="sm" onClick={() => success("Escalation acknowledged", "Admin has been notified of your action.")}>
                  <ArrowUpRight className="h-4 w-4" /> Acknowledge
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
