"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Check, X, Navigation, Wallet } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetPartnerOrdersQuery, useGetOrdersQuery } from "@/features/api/api";
import type { Order } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatBDT } from "@/lib/utils";

export default function DeliveryQueuePage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const partnerId = user.partnerId ?? "dlv-01";
  const { success } = useToast();
  const { data: assignedData } = useGetPartnerOrdersQuery(partnerId);
  const { data: allOrdersData } = useGetOrdersQuery({ pageSize: 100 });
  const assigned = assignedData?.items ?? [];
  const orders = allOrdersData?.items ?? [];
  const pending = orders.filter(
    (o) => o.status === "shipped" && !o.assignedPartnerId && o.deliveryAddress.city === "Dhaka",
  ).slice(0, 3);

  const [tab, setTab] = useState("pending");
  const [accepted, setAccepted] = useState<Order[]>([]);
  const myDeliveries = [...assigned, ...accepted];

  const accept = (id: string) => {
    const found = pending.find((o) => o.id === id) ?? orders.find((o) => o.id === id);
    if (!found) return;
    setAccepted([...accepted, { ...found, assignedPartnerId: partnerId }]);
    success("Delivery accepted", "Pick up the package and head to the customer.");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Delivery Queue</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Accept new assignments or manage active deliveries.</p>
      </div>

      <Tabs
        tabs={[
          { id: "pending", label: "Available", count: pending.length },
          { id: "mine", label: "My Deliveries", count: myDeliveries.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "pending" ? (
        pending.length === 0 ? (
          <EmptyState title="No available deliveries" description="New assignments will appear here as sellers ship orders." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {pending.map((o) => (
              <Card key={o.id} className="overflow-hidden">
                <div className="grid gap-4 p-5 sm:grid-cols-[1fr_120px]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">{o.orderCode}</span>
                      <Badge tone="warning">Awaiting pickup</Badge>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="flex items-start gap-2 text-[var(--muted)]">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-800" />
                        <span>Pickup: {o.sellerId === "sel-techpoint" ? "TechPoint BD · Gulshan-1" : "Seller warehouse"}<br />Drop: {o.deliveryAddress.line1}, {o.deliveryAddress.area}, {o.deliveryAddress.city}</span>
                      </p>
                      <p className="flex items-center gap-2 text-[var(--muted)]"><Phone className="h-4 w-4 text-success-500" /> {o.customerName} · {o.customerPhone.slice(0, 8)}••••</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2 border-t border-[var(--line)] pt-3">
                      {o.paymentMethod === "cod" ? (
                        <Badge tone="accent"><Wallet className="h-3 w-3" /> Collect {formatBDT(o.total)}</Badge>
                      ) : (
                        <Badge tone="success">Prepaid</Badge>
                      )}
                      <Badge tone="neutral">{o.items.reduce((s, i) => s + i.quantity, 0)} items</Badge>
                    </div>
                  </div>
                  {/* Map placeholder */}
                  <div className="relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-primary-50">
                    <Navigation className="h-7 w-7 text-primary-800" />
                    <p className="mt-1 text-[10px] font-medium text-[var(--muted)]">Route view</p>
                    <p className="text-[10px] text-foreground">~ {2 + (o.id.length % 4)} km</p>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-[var(--line)] p-4">
                  <Button size="sm" variant="outline" className="flex-1 text-danger-500 hover:border-danger-300 hover:bg-danger-100/40" onClick={() => success("Delivery declined")}>
                    <X className="h-4 w-4" /> Decline
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => accept(o.id)}>
                    <Check className="h-4 w-4" /> Accept
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : myDeliveries.length === 0 ? (
        <EmptyState
          title="No active deliveries"
          description="Accept assignments from the Available tab to get started."
          action={<Button onClick={() => setTab("pending")}>View Available</Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {myDeliveries.map((o) => (
            <Link key={o.id} href="/delivery/active" className="block">
              <Card hover className="p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-foreground">{o.orderCode}</span>
                  <Badge tone={o.status === "out_for_delivery" ? "info" : "warning"}>{o.status.replace("_", " ")}</Badge>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">→ {o.deliveryAddress.line1}, {o.deliveryAddress.area}, {o.deliveryAddress.city}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{o.customerName} · {o.customerPhone.slice(0, 8)}••••</p>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-2">
                  <span className="text-sm font-bold text-foreground">{o.paymentMethod === "cod" ? formatBDT(o.total) : "Prepaid"}</span>
                  <span className="text-xs text-primary-800 font-medium">Start delivery →</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
