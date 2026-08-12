"use client";

import { useState } from "react";
import { MapPin, Phone, Navigation, PackageCheck, Check, X, MessageSquare } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetPartnerOrdersQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatBDT } from "@/lib/utils";

export default function ActiveDeliveryPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const partnerId = user.partnerId ?? "dlv-01";
  const { success, error } = useToast();
  const { data: ordersData } = useGetPartnerOrdersQuery(partnerId);
  const active = (ordersData?.items ?? [])[0];

  const [stage, setStage] = useState(active?.status ?? "out_for_delivery");
  const [failOpen, setFailOpen] = useState(false);
  const [failReason, setFailReason] = useState("");

  if (!active) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-dashed border-[var(--line)] bg-[var(--surface-2)] p-16 text-center">
        <p className="text-4xl">🛵</p>
        <h2 className="mt-3 text-lg font-bold text-foreground">No active delivery</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Accept an assignment from the queue to start delivering.</p>
      </div>
    );
  }

  const next = () => {
    setStage(stage === "out_for_delivery" ? "delivered" : stage);
    success("Status updated", stage === "out_for_delivery" ? "Marked as delivered 🎉" : "Progress saved");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">{active.orderCode}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Active delivery · {active.deliveryAddress.area}, {active.deliveryAddress.city}</p>
        </div>
        <Badge tone={stage === "delivered" ? "success" : "info"}>{stage.replace("_", " ")}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          {/* Map placeholder */}
          <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-primary-100">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, #cbd5e1 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #cbd5e1 40px)" }} />
            <div className="relative flex flex-col items-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-foreground shadow-lg shadow-primary-600/40 animate-pulse">
                <MapPin className="h-8 w-8" />
              </span>
              <p className="mt-3 rounded-full bg-[var(--surface)] px-4 py-1.5 text-sm font-semibold text-foreground shadow-card">
                {active.deliveryAddress.line1}, {active.deliveryAddress.area}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">Live route · ~2.4 km · ~12 min</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline"><Navigation className="h-4 w-4" /> Start Navigation</Button>
            <Button variant="outline"><MessageSquare className="h-4 w-4" /> Message Customer</Button>
            <Button variant="outline"><Phone className="h-4 w-4" /> Call {active.customerName.split(" ")[0]}</Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">Delivery Info</h3>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-[var(--muted)]"><MapPin className="h-4 w-4 text-primary-800" /> {active.deliveryAddress.line1}, {active.deliveryAddress.area}</p>
              <p className="text-xs text-[var(--muted)]">{active.deliveryAddress.city} {active.deliveryAddress.postalCode}</p>
              <p className="flex items-center gap-2 text-[var(--muted)]"><Phone className="h-4 w-4 text-success-500" /> {active.customerPhone.slice(0, 8)}••••</p>
              <p className="text-xs text-[var(--muted)]">{active.customerName} — masked number reveals on call</p>
            </div>
            <div className="mt-3 border-t border-[var(--line)] pt-3 text-sm">
              <p className="flex justify-between"><span className="text-[var(--muted)]">Payment</span><span className="font-medium capitalize text-foreground">{active.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid"}</span></p>
              {active.paymentMethod === "cod" ? (
                <p className="mt-1 flex justify-between"><span className="text-[var(--muted)]">Collect</span><span className="font-bold text-foreground">{formatBDT(active.total)}</span></p>
              ) : null}
              <p className="mt-1 flex justify-between"><span className="text-[var(--muted)]">Items</span><span className="font-medium text-foreground">{active.items.length}</span></p>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">Update Status</h3>
            <div className="mt-3 space-y-2">
              {stage === "out_for_delivery" ? (
                <Button className="w-full" onClick={next}>
                  <PackageCheck className="h-4 w-4" /> Mark as Delivered
                </Button>
              ) : (
                <Badge tone="success" className="w-full justify-center py-2">Delivered ✓</Badge>
              )}
              {stage !== "delivered" ? (
                <Button variant="outline" className="w-full text-danger-500 hover:border-danger-300 hover:bg-danger-100/40" onClick={() => setFailOpen(true)}>
                  <X className="h-4 w-4" /> Failed Attempt
                </Button>
              ) : null}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={failOpen} onClose={() => setFailOpen(false)} title="Failed delivery attempt" description="Tell us what happened — the order will be rescheduled.">
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Reason</label>
            <select value={failReason} onChange={(e) => setFailReason(e.target.value)} className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-600/10">
              <option value="">Select a reason…</option>
              <option>Customer not reachable</option>
              <option>Wrong address</option>
              <option>Customer refused</option>
              <option>Address not found</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setFailOpen(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1" disabled={!failReason} onClick={() => { setFailOpen(false); error("Delivery failed", "Order returned for rescheduling."); }}>
              Report Failure
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
