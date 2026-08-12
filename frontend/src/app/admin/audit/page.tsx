"use client";

import { useState } from "react";
import { ShieldCheck, Search } from "lucide-react";
import { useGetAuditLogsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { timeAgo } from "@/lib/utils";

export default function AuditLogPage() {
  const [q, setQ] = useState("");
  const { data: auditData } = useGetAuditLogsQuery();
  const auditLog = auditData?.items ?? [];
  const filtered = auditLog.filter(
    (a) => a.action.toLowerCase().includes(q.toLowerCase()) || a.target.toLowerCase().includes(q.toLowerCase()) || a.adminName.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Log</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Every administrative action, tracked.</p>
        </div>
        <div className="w-64">
          <Input placeholder="Search audit trail…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-0">
          {filtered.map((entry, i) => (
            <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
              {i < filtered.length - 1 ? <span className="absolute left-[13px] top-7 h-[calc(100%-14px)] w-0.5 bg-[var(--surface-2)]" /> : null}
              <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-800">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-foreground">
                  <span className="font-semibold">{entry.adminName}</span> {entry.action.toLowerCase()}
                </p>
                <p className="text-xs text-[var(--muted)]">Target: {entry.target} · {entry.detail}</p>
                <p className="mt-0.5 text-[11px] text-foreground">{timeAgo(entry.at)}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 ? <p className="p-4 text-center text-sm text-[var(--muted)]">No audit entries match.</p> : null}
        </div>
      </Card>
    </div>
  );
}
