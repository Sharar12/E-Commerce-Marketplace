"use client";

import { useState } from "react";
import { Wallet, Banknote, Smartphone, Landmark } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetSellerQuery, useGetPayoutsQuery, useRequestPayoutMutation } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatBDT, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function SellerPayoutsPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const sellerId = user.sellerId ?? "sel-techpoint";
  const { data: seller } = useGetSellerQuery(sellerId);
  const { success, error } = useToast();
  const { data: payoutsData } = useGetPayoutsQuery({ sellerId });
  const [requestPayout, { isLoading: requesting }] = useRequestPayoutMutation();
  const myPayouts = payoutsData?.items ?? [];
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [method, setMethod] = useState("bkash");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payouts</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Payouts are processed every Sunday.</p>
        </div>
        <Button onClick={() => setWithdrawOpen(true)}><Wallet className="h-4 w-4" /> Withdraw Balance</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Available Balance</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{formatBDT(seller?.payoutBalance ?? 0)}</p>
          <p className="mt-1 text-xs text-success-500">Ready to withdraw</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Pending Clearance</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{formatBDT(seller?.pendingPayout ?? 0)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Releases after delivery</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Platform Commission</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{seller?.commissionRate ?? 4}%</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Per completed order</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Withdrawal Methods</h2>
        <div className="mt-3 space-y-2">
          {[
            { id: "bkash", label: "bKash", desc: seller?.phone ?? "", icon: <Smartphone className="h-4.5 w-4.5 text-danger-500" /> },
            { id: "bank", label: "Bank Transfer", desc: seller?.bankAccount ? `${seller.bankAccount.bankName} · ${seller.bankAccount.accountNo}` : "Not set", icon: <Landmark className="h-4.5 w-4.5 text-info-500" /> },
          ].map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-2)]">{m.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{m.label}</p>
                <p className="text-xs text-[var(--muted)]">{m.desc}</p>
              </div>
              <Badge tone="success">Verified</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="text-base font-semibold text-foreground">Payout History</h2>
        </div>
        <Table>
          <THead>
            <Th>Period</Th>
            <Th>Amount</Th>
            <Th>Method</Th>
            <Th>Status</Th>
            <Th>Requested</Th>
          </THead>
          <TBody>
            {myPayouts.map((p) => (
              <Tr key={p.id}>
                <Td className="text-xs text-[var(--muted)]">
                  {formatDate(p.periodStart)} — {formatDate(p.periodEnd)}
                </Td>
                <Td className="font-semibold text-foreground">{formatBDT(p.amount)}</Td>
                <Td className="capitalize text-[var(--muted)]">{p.method}</Td>
                <Td><Badge tone={statusTone(p.status)}>{p.status}</Badge></Td>
                <Td className="text-xs text-[var(--muted)]">{formatDate(p.createdAt)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <Modal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} title="Withdraw balance" description={`Available: ${formatBDT(seller?.payoutBalance ?? 0)}`}>
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-2">
            {["bkash", "bank"].map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={cn("rounded-xl border-2 py-3 text-sm font-medium capitalize transition-all", method === m ? "border-primary-600 bg-primary-500/20 text-primary-800" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line)]")}
              >
                {m === "bkash" ? "bKash" : "Bank Transfer"}
              </button>
            ))}
          </div>
          <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm">
            <p className="flex justify-between"><span className="text-[var(--muted)]">Amount</span><span className="font-bold text-foreground">{formatBDT(seller?.payoutBalance ?? 0)}</span></p>
            <p className="mt-1 flex justify-between"><span className="text-[var(--muted)]">Processing fee</span><span className="text-success-500">Free</span></p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
            <Button
              className="flex-1"
              loading={requesting}
              disabled={(seller?.payoutBalance ?? 0) <= 0}
              onClick={async () => {
                try {
                  await requestPayout({ method, accountSummary: method === "bkash" ? seller?.phone : undefined }).unwrap();
                  setWithdrawOpen(false);
                  success("Withdrawal requested", "Funds arrive within 2-3 business days.");
                } catch {
                  error("Request failed", "Could not request a withdrawal.");
                }
              }}
            >
              <Banknote className="h-4 w-4" /> Request Withdrawal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
