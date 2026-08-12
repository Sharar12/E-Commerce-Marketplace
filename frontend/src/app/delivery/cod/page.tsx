"use client";

import { useState } from "react";
import { Banknote, CheckCircle2, AlertCircle } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetDeliveryDashboardQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { formatBDT } from "@/lib/utils";

export default function CodReconciliationPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const partnerId = user.partnerId ?? "dlv-01";
  const { data } = useGetDeliveryDashboardQuery(partnerId);
  const { success } = useToast();
  const [remitted, setRemitted] = useState(false);

  const collected = data?.kpis.codCollected ?? 0;
  const toRemit = data?.kpis.codToRemit ?? 0;
  const myShare = Math.round(collected * 0.02); // 2% COD handling bonus

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">COD Reconciliation</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Track cash collected and amounts to remit.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Cash Collected</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{formatBDT(collected)}</p>
          <p className="mt-1 text-xs text-success-500 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</p>
        </Card>
        <Card className="border-accent-300 bg-accent-400/5 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-800">To Remit</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{formatBDT(toRemit)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Remit by 8 PM today</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Your Bonus</p>
          <p className="mt-1.5 text-2xl font-bold text-success-500">+{formatBDT(myShare)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">2% COD handling</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Banknote className="h-4.5 w-4.5 text-primary-800" /> Remittance Status
        </h2>
        <div className="mt-4 space-y-3">
          {[
            { label: "Collected yesterday", amount: collected - 1800, status: "remitted" },
            { label: "Collected today (so far)", amount: 1800, status: "pending" },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-2xl border border-[var(--line)] p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{r.label}</p>
                <p className="text-xs text-[var(--muted)]">{formatBDT(r.amount)}</p>
              </div>
              {r.status === "remitted" ? (
                <Badge tone="success"><CheckCircle2 className="h-3.5 w-3.5" /> Remitted</Badge>
              ) : (
                <Badge tone="warning"><AlertCircle className="h-3.5 w-3.5" /> Pending</Badge>
              )}
            </div>
          ))}
        </div>
        <Button
          className="mt-4 w-full"
          disabled={remitted}
          onClick={() => {
            setRemitted(true);
            success("Remittance confirmed", "Thank you! Your reconciliation is up to date.");
          }}
        >
          {remitted ? "Remitted ✓" : `Confirm Remit ${formatBDT(toRemit)}`}
        </Button>
      </Card>
    </div>
  );
}
