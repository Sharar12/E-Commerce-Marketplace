"use client";

import { useState } from "react";
import { Search, Package, Radio } from "lucide-react";
import { useGetOrderQuery } from "@/features/api/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrderStatusTimeline } from "@/components/shared/OrderStatusTimeline";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge, statusTone } from "@/components/ui/Badge";
import { formatBDT } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  placed: "Placed", confirmed: "Confirmed", packed: "Packed", shipped: "Shipped",
  out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
  return_requested: "Return Requested", returned: "Returned", refunded: "Refunded",
};

export default function TrackOrderPage() {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState("");
  const { data: order, isLoading, isError } = useGetOrderQuery(submitted, { skip: !submitted });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumbs items={[{ label: "Track Order" }]} />
      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-md border border-primary-700/40 bg-primary-500/20 text-primary-800">
          <Radio className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Track Your Order</h1>
          <p className="font-mono text-xs tracking-wider text-[var(--muted)]">ENTER YOUR APD ORDER CODE FOR LIVE STATUS.</p>
        </div>
      </div>

      <Card className="mt-6 p-6">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) setSubmitted(code.trim());
          }}
        >
          <Input
            placeholder="e.g. APD100042"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Button type="submit" className="shrink-0" loading={isLoading}>TRACK</Button>
        </form>
        <p className="mt-2 font-mono text-[10px] tracking-wider text-[var(--muted)]">TRY APD100001 – APD100128 (DEMO ORDER CODES)</p>
      </Card>

      {submitted && isError ? (
        <div className="mt-6">
          <EmptyState
            icon={<Package className="h-8 w-8 text-primary-800" />}
            title="Order not found"
            description={`We couldn't find an order with code "${submitted}". Double-check the code.`}
          />
        </div>
      ) : null}

      {order ? (
        <Card className="mt-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-lg font-bold text-primary-800">{order.orderCode}</p>
              <p className="font-mono text-[10px] tracking-wider text-[var(--muted)]">PLACED {new Date(order.placedAt).toLocaleString("en-GB")}</p>
            </div>
            <Badge tone={statusTone(order.status)}>{statusLabels[order.status] ?? order.status.toUpperCase()}</Badge>
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-mono text-xs font-bold tracking-[0.2em] text-primary-800">ITEMS</h3>
              <div className="mt-2 space-y-2 font-mono text-xs tracking-wider">
                {order.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span className="text-[var(--muted)]">{it.name} × {it.quantity}</span>
                    <span className="font-medium text-foreground">{formatBDT(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-[var(--line)] pt-2 font-mono text-xs tracking-wider">
                <span className="text-[var(--muted)]">TOTAL</span>
                <span className="font-bold text-primary-800">{formatBDT(order.total)}</span>
              </div>
            </div>
            <div>
              <h3 className="font-mono text-xs font-bold tracking-[0.2em] text-primary-800">DELIVERY TO</h3>
              <p className="mt-2 font-mono text-xs tracking-wider text-foreground">
                {order.deliveryAddress.line1}, {order.deliveryAddress.area}
                <br />{order.deliveryAddress.city} {order.deliveryAddress.postalCode}
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-wider text-[var(--muted)]">PHONE: {order.deliveryAddress.phone}</p>
            </div>
          </div>
          <div className="mt-6 border-t border-[var(--line)] pt-5">
            <OrderStatusTimeline events={order.timeline} />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
