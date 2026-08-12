"use client";

import { useState } from "react";
import { Wallet, Check, X, Percent, FileText } from "lucide-react";
import { useGetPayoutsQuery, useGetSellersQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatBDT, formatDate } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const { success } = useToast();
  const { data: payoutsData } = useGetPayoutsQuery();
  const { data: sellersData } = useGetSellersQuery();
  const payouts = payoutsData?.items ?? [];
  const sellers = sellersData?.items ?? [];
  const [queue, setQueue] = useState<typeof payouts>([]);
  const effectiveQueue = queue.length > 0 ? queue : payouts.filter((p) => p.status === "pending");
  const ledger = payouts;
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [rate, setRate] = useState(3.5);

  const decide = (id: string, approve: boolean) => {
    setQueue(effectiveQueue.filter((p) => p.id !== id));
    success(approve ? "Payout approved" : "Payout rejected", approve ? "Funds will be transferred within 24 hours." : "Seller has been notified.");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payments & Payouts</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{effectiveQueue.length} payout(s) awaiting approval.</p>
        </div>
        <Button variant="outline" onClick={() => setCommissionOpen(true)}>
          <Percent className="h-4 w-4" /> Commission Settings
        </Button>
      </div>

      {/* Commission cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Platform Commission (avg)</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{rate}%</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Per completed order</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Pending Payouts</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{formatBDT(effectiveQueue.reduce((s, p) => s + p.amount, 0))}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{effectiveQueue.length} sellers</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Paid This Month</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{formatBDT(ledger.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0))}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{ledger.filter((p) => p.status === "paid").length} transactions</p>
        </Card>
      </div>

      {/* Approval queue */}
      <Card className="overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Wallet className="h-4.5 w-4.5 text-primary-800" /> Payout Approval Queue
          </h2>
        </div>
        <Table>
          <THead>
            <Th>Seller</Th>
            <Th>Amount</Th>
            <Th>Method</Th>
            <Th>Period</Th>
            <Th className="text-right">Actions</Th>
          </THead>
          <TBody>
            {effectiveQueue.map((p) => {
              const seller = sellers.find((s) => s.id === p.sellerId);
              return (
                <Tr key={p.id}>
                  <Td>
                    <p className="font-medium text-foreground">{seller?.shopName ?? p.sellerId}</p>
                    <p className="text-xs text-[var(--muted)]">{p.id}</p>
                  </Td>
                  <Td className="font-semibold text-foreground">{formatBDT(p.amount)}</Td>
                  <Td className="capitalize text-[var(--muted)]">{p.method} · {p.accountSummary}</Td>
                  <Td className="text-xs text-[var(--muted)]">{formatDate(p.periodStart)} — {formatDate(p.periodEnd)}</Td>
                  <Td className="text-right">
                    <Button size="sm" variant="outline" className="text-danger-500 hover:border-danger-300" onClick={() => decide(p.id, false)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" className="ml-1.5" onClick={() => decide(p.id, true)}>
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                  </Td>
                </Tr>
              );
            })}
            {effectiveQueue.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="py-10 text-center text-[var(--muted)]">Queue is clear 🎉</Td>
              </Tr>
            ) : null}
          </TBody>
        </Table>
      </Card>

      {/* Ledger */}
      <Card className="overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <FileText className="h-4.5 w-4.5 text-primary-800" /> Transaction Ledger
          </h2>
        </div>
        <Table>
          <THead>
            <Th>Reference</Th>
            <Th>Seller</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th>Date</Th>
          </THead>
          <TBody>
            {ledger.slice(0, 10).map((p) => (
              <Tr key={p.id}>
                <Td><span className="font-mono text-xs text-[var(--muted)]">{p.id}</span></Td>
                <Td className="text-[var(--muted)]">{sellers.find((s) => s.id === p.sellerId)?.shopName ?? p.sellerId}</Td>
                <Td className="font-medium text-foreground">{formatBDT(p.amount)}</Td>
                <Td><Badge tone={statusTone(p.status)}>{p.status}</Badge></Td>
                <Td className="text-xs text-[var(--muted)]">{formatDate(p.createdAt)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <Modal open={commissionOpen} onClose={() => setCommissionOpen(false)} title="Commission settings" description="Default commission for new sellers">
        <div className="space-y-4 p-6">
          <Input label="Commission rate (%)" type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm">
            <p className="flex justify-between"><span className="text-[var(--muted)]">Category override</span><span className="font-medium text-foreground">Grocery 2.5% · Electronics 3.5%</span></p>
            <p className="mt-1 flex justify-between"><span className="text-[var(--muted)]">Flash sale funding</span><span className="font-medium text-foreground">Platform covers 50%</span></p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setCommissionOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => { setCommissionOpen(false); success("Commission settings saved"); }}>Save Settings</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
