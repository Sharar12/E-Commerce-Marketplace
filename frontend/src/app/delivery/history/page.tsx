"use client";

import { useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { useGetPartnerOrdersQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBDT, formatDate } from "@/lib/utils";

export default function DeliveryHistoryPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const partnerId = user.partnerId ?? "dlv-01";
  const { data } = useGetPartnerOrdersQuery(partnerId);
  const history = (data?.items ?? []).filter((o) => o.status === "delivered");
  const [filter, setFilter] = useState("all");

  const filtered = history.filter((o) => (filter === "cod" ? o.paymentMethod === "cod" : filter === "prepaid" ? o.paymentMethod !== "cod" : true));

  const totalEarnings = history.reduce((s, o) => s + (o.paymentMethod === "cod" ? 60 : 50), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Delivery History</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{history.length} completed · {formatBDT(totalEarnings)} total earned</p>
        </div>
        <div className="flex gap-2">
          {["all", "cod", "prepaid"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl border px-3.5 py-2 text-xs font-medium capitalize transition-all ${filter === f ? "border-primary-600 bg-primary-500/20 text-primary-800" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line)]"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No deliveries yet" description="Completed deliveries with earnings will appear here." />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-[var(--line)]">
            {filtered.map((o) => (
              <div key={o.id} className="flex items-center gap-4 p-4">
                <span className="font-mono text-sm font-bold text-foreground">{o.orderCode}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--muted)]">{o.deliveryAddress.area}, {o.deliveryAddress.city}</p>
                  <p className="text-xs text-[var(--muted)]">{o.customerName} · {formatDate(o.placedAt)}</p>
                </div>
                <Badge tone={o.paymentMethod === "cod" ? "accent" : "success"}>{o.paymentMethod === "cod" ? "COD" : "Prepaid"}</Badge>
                <p className="text-sm font-bold text-success-500">+{formatBDT(o.paymentMethod === "cod" ? 60 : 50)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
