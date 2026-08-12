"use client";

import { useState } from "react";
import { Banknote, Check, X } from "lucide-react";
import { useGetOrdersQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatBDT } from "@/lib/utils";

export default function RefundsPage() {
  const { success } = useToast();
  const { data: ordersData } = useGetOrdersQuery({ pageSize: 100 });
  const disputes = (ordersData?.items ?? []).filter(
    (o) => o.returnRequest && o.returnRequest.status === "pending",
  );
  const [selected, setSelected] = useState<(typeof disputes)[0] | null>(null);
  const [decision, setDecision] = useState<"approve" | "deny" | null>(null);
  const [reason, setReason] = useState("");

  const decide = () => {
    if (!selected) return;
    success(
      decision === "approve" ? "Refund approved" : "Refund denied",
      decision === "approve" ? `${selected.orderCode}: ${formatBDT(selected.returnRequest?.refundAmount ?? selected.total)} will be refunded.` : "Customer will be notified with your reason.",
    );
    setSelected(null);
    setDecision(null);
    setReason("");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Refunds & Disputes</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{disputes.length} pending request(s) awaiting your decision.</p>
      </div>

      {disputes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-4xl">🎉</p>
          <h2 className="mt-3 text-lg font-bold text-foreground">No pending disputes</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">All refund requests have been processed.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {disputes.map((o) => (
            <Card key={o.id} hover className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-400/20 text-primary-800">
                    <Banknote className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">{o.orderCode}</p>
                    <p className="text-xs text-[var(--muted)]">{o.customerName} · {formatBDT(o.returnRequest?.refundAmount ?? o.total)} refund requested</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelected(o); setDecision("approve"); }}>
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-danger-500 hover:border-danger-300 hover:bg-danger-100/40" onClick={() => { setSelected(o); setDecision("deny"); }}>
                    <X className="h-4 w-4" /> Deny
                  </Button>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-[var(--surface-2)] p-3">
                <p className="text-sm font-medium text-foreground">Reason: {o.returnRequest?.reason}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{o.returnRequest?.detail}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Requested {o.returnRequest ? new Date(o.returnRequest.requestedAt).toLocaleDateString("en-GB") : ""} · {o.items.length} item(s) · {formatBDT(o.total)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={selected != null} onClose={() => setSelected(null)} title={decision === "approve" ? "Approve refund" : "Deny refund"}>
        <div className="space-y-4 p-6">
          {selected ? (
            <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm">
              <p className="font-mono font-bold text-foreground">{selected.orderCode}</p>
              <p className="mt-1 text-[var(--muted)]">{selected.customerName} · {formatBDT(selected.returnRequest?.refundAmount ?? selected.total)}</p>
              <Badge tone={statusTone(selected.status)} className="mt-2">{selected.status.replace("_", " ")}</Badge>
            </div>
          ) : null}
          <Textarea
            label={decision === "approve" ? "Note (optional)" : "Reason for denial (sent to customer)"}
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Cancel</Button>
            <Button
              variant={decision === "approve" ? "primary" : "danger"}
              className="flex-1"
              disabled={decision === "deny" && !reason.trim()}
              onClick={decide}
            >
              {decision === "approve" ? "Approve Refund" : "Deny Request"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
