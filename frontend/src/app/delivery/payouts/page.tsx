"use client";

import { useState } from "react";
import { Wallet, Banknote } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetDeliveryDashboardQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatBDT, formatDate } from "@/lib/utils";

export default function DeliveryPayoutsPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const partnerId = user.partnerId ?? "dlv-01";
  const { data } = useGetDeliveryDashboardQuery(partnerId);
  const { success } = useToast();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("bkash");

  const history = [
    { id: 1, amount: 6200, status: "paid" as const, date: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: 2, amount: 5900, status: "paid" as const, date: new Date(Date.now() - 14 * 86400000).toISOString() },
    { id: 3, amount: 5400, status: "paid" as const, date: new Date(Date.now() - 21 * 86400000).toISOString() },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payouts</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Weekly earnings, remitted every Monday.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Wallet className="h-4 w-4" /> Withdraw Balance</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Available</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{formatBDT(data?.kpis.pendingPayout ?? 0)}</p>
          <p className="mt-1 text-xs text-success-500">Ready to withdraw</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">This Week</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{formatBDT(data?.kpis.earningsWeek ?? 0)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Before deductions</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Total Earnings</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{formatBDT(48000)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">All time</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="text-base font-semibold text-foreground">Payout History</h2>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{formatBDT(h.amount)}</p>
                <p className="text-xs text-[var(--muted)]">{formatDate(h.date)} · bKash ••••1234</p>
              </div>
              <Badge tone={statusTone(h.status)}>{h.status}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Withdraw earnings">
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-2">
            {["bkash", "nagad"].map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`rounded-xl border-2 py-3 text-sm font-medium capitalize transition-all ${method === m ? "border-primary-600 bg-primary-500/20 text-primary-800" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line)]"}`}
              >
                {m === "bkash" ? "bKash" : "Nagad"}
              </button>
            ))}
          </div>
          <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm">
            <p className="flex justify-between"><span className="text-[var(--muted)]">Amount</span><span className="font-bold text-foreground">{formatBDT(data?.kpis.pendingPayout ?? 0)}</span></p>
            <p className="mt-1 flex justify-between"><span className="text-[var(--muted)]">Fee</span><span className="text-success-500">Free</span></p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => { setOpen(false); success("Withdrawal requested", "Money arrives within 24 hours."); }}>
              <Banknote className="h-4 w-4" /> Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
