"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PackageCheck, Printer, Truck, Check, X } from "lucide-react";
import { useGetOrderQuery, useGetOrdersQuery } from "@/features/api/api";
import type { OrderStatus } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { ProductImage } from "@/components/shared/ProductImage";
import { Price } from "@/components/shared/Price";
import { useToast } from "@/components/ui/Toast";
import { formatBDT } from "@/lib/utils";

export default function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success } = useToast();
  const { data: orderData } = useGetOrderQuery(id);
  const { data: allOrdersData } = useGetOrdersQuery({ pageSize: 100 });
  const order =
    orderData ??
    allOrdersData?.items.find((o) => o.orderCode === id || o.id === id);

  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "placed");

  // Sync once the async order data arrives (initial state defaults to "placed").
  useEffect(() => {
    if (order?.status && order.status !== status) {
      setStatus(order.status);
    }
  }, [order?.status]);

  if (!order) return <div className="p-8 text-center text-[var(--muted)]">Order not found.</div>;

  const advance = (next: OrderStatus) => {
    setStatus(next);
    success("Order updated", `Status changed to ${next.replace("_", " ")}`);
  };

  const canShip = status === "confirmed";
  const canPack = status === "placed" || status === "confirmed";
  const isReturn = order.returnRequest != null && ["return_requested", "returned"].includes(status);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--muted)]">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">{order.orderCode}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{order.customerName} · {order.customerPhone}</p>
        </div>
        <Badge tone={statusTone(status)}>{status.replace("_", " ")}</Badge>
      </div>

      {/* Fulfillment actions */}
      <Card className="flex flex-wrap items-center gap-3 p-5">
        <p className="text-sm font-semibold text-foreground">Fulfillment:</p>
        {canPack ? (
          <Button size="sm" onClick={() => advance("packed")}><PackageCheck className="h-4 w-4" /> Mark as Packed</Button>
        ) : null}
        {status === "packed" ? (
          <Button size="sm" onClick={() => advance("shipped")}><Truck className="h-4 w-4" /> Mark as Shipped</Button>
        ) : null}
        {status === "shipped" ? (
          <Button size="sm" onClick={() => advance("out_for_delivery")}><Truck className="h-4 w-4" /> Out for Delivery</Button>
        ) : null}
        <Button size="sm" variant="outline" onClick={() => success("Label ready for printing")}>
          <Printer className="h-4 w-4" /> Print Label
        </Button>
      </Card>

      {isReturn && order.returnRequest ? (
        <Card className="border-accent-300 bg-accent-400/10 p-5">
          <h2 className="text-base font-semibold text-foreground">Return Request · {order.returnRequest.reason}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{order.returnRequest.detail}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => { advance("returned"); success("Return approved"); }}>
              <Check className="h-4 w-4" /> Approve Return
            </Button>
            <Button size="sm" variant="outline" onClick={() => success("Return denied", "Customer will be notified.")}>
              <X className="h-4 w-4" /> Deny
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Items</h2>
          <div className="mt-4 divide-y divide-[var(--line)]">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                  <ProductImage src={item.image} alt={item.name} sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-[var(--muted)]">Qty {item.quantity}{item.variantLabel ? ` · ${item.variantLabel}` : ""}</p>
                </div>
                <Price price={item.price * item.quantity} size="sm" />
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-[var(--line)] pt-4 text-sm">
            <div className="flex justify-between text-[var(--muted)]"><span>Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
            {order.discount > 0 ? <div className="flex justify-between text-success-500"><span>Discount</span><span>-{formatBDT(order.discount)}</span></div> : null}
            <div className="flex justify-between text-[var(--muted)]"><span>Shipping</span><span>{order.shippingFee === 0 ? "Free" : formatBDT(order.shippingFee)}</span></div>
            <div className="flex justify-between border-t border-[var(--line)] pt-2 text-base font-bold text-foreground"><span>Total</span><span>{formatBDT(order.total)}</span></div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">Ship To</h3>
            <div className="mt-2 text-sm text-[var(--muted)]">
              <p className="font-medium text-foreground">{order.deliveryAddress.name}</p>
              <p className="mt-1">{order.deliveryAddress.line1}, {order.deliveryAddress.area}</p>
              <p>{order.deliveryAddress.city} {order.deliveryAddress.postalCode}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{order.deliveryAddress.phone}</p>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">Payment</h3>
            <p className="mt-2 text-sm capitalize text-[var(--muted)]">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</p>
            <Badge tone={statusTone(order.paymentStatus)} className="mt-1.5">{order.paymentStatus}</Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}
