"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, CreditCard, Truck, FileText } from "lucide-react";
import { useGetOrderQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { OrderStatusTimeline } from "@/components/shared/OrderStatusTimeline";
import { ProductImage } from "@/components/shared/ProductImage";
import { Price } from "@/components/shared/Price";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatBDT, formatDate } from "@/lib/utils";
import { useState } from "react";

const statusLabels: Record<string, string> = {
  placed: "Placed", confirmed: "Confirmed", packed: "Packed", shipped: "Shipped",
  out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
  return_requested: "Return Requested", returned: "Returned", refunded: "Refunded",
};

const paymentLabels: Record<string, string> = {
  card: "Credit / Debit Card", bkash: "bKash", nagad: "Nagad", cod: "Cash on Delivery",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success } = useToast();
  const { data: order, isLoading } = useGetOrderQuery(id);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");

  if (isLoading || !order) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const canCancel = ["placed", "confirmed"].includes(order.status);
  const canReturn = order.status === "delivered";

  const requestReturn = () => {
    success("Return requested!", "Our support team will review and contact you within 24 hours.");
    setReturnOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--muted)]">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">{order.orderCode}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Placed {formatDate(order.placedAt, { hour: "numeric", minute: "2-digit" })}</p>
        </div>
        <Badge tone={statusTone(order.status)}>{statusLabels[order.status] ?? order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: timeline + items */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Order Status</h2>
            <div className="mt-5">
              <OrderStatusTimeline events={order.timeline} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Items ({order.items.length})</h2>
            <div className="mt-4 divide-y divide-[var(--line)]">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                    <ProductImage src={item.image} alt={item.name} sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-[var(--muted)]">Qty: {item.quantity}{item.variantLabel ? ` · ${item.variantLabel}` : ""}</p>
                  </div>
                  <Price price={item.price * item.quantity} size="sm" />
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-[var(--line)] pt-4 text-sm">
              <div className="flex justify-between text-[var(--muted)]"><span>Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
              {order.discount > 0 ? <div className="flex justify-between text-success-500"><span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span><span>-{formatBDT(order.discount)}</span></div> : null}
              <div className="flex justify-between text-[var(--muted)]"><span>Shipping</span><span>{order.shippingFee === 0 ? "Free" : formatBDT(order.shippingFee)}</span></div>
              <div className="flex justify-between text-[var(--muted)]"><span>Tax</span><span>{formatBDT(order.tax)}</span></div>
              <div className="flex justify-between border-t border-[var(--line)] pt-3 text-base font-bold text-foreground"><span>Total</span><span>{formatBDT(order.total)}</span></div>
            </div>
          </Card>
        </div>

        {/* Right: info + actions */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary-800" /> Delivery Address
            </h3>
            <div className="mt-3 text-sm text-[var(--muted)]">
              <p className="font-medium text-foreground">{order.deliveryAddress.name}</p>
              <p className="mt-1">{order.deliveryAddress.line1}, {order.deliveryAddress.area}</p>
              <p>{order.deliveryAddress.city} {order.deliveryAddress.postalCode}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{order.deliveryAddress.phone}</p>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CreditCard className="h-4 w-4 text-primary-800" /> Payment
            </h3>
            <div className="mt-3 space-y-1.5 text-sm">
              <p className="flex justify-between text-[var(--muted)]"><span>Method</span><span className="font-medium text-foreground">{paymentLabels[order.paymentMethod]}</span></p>
              <p className="flex justify-between text-[var(--muted)]"><span>Status</span><Badge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</Badge></p>
            </div>
          </Card>

          {order.returnRequest ? (
            <Card className="border-accent-300 bg-accent-400/10 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary-800" /> Return Request
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{order.returnRequest.reason}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{order.returnRequest.detail}</p>
              <div className="mt-3"><Badge tone={statusTone(order.returnRequest.status)}>{order.returnRequest.status}</Badge></div>
            </Card>
          ) : null}

          <div className="flex flex-col gap-2">
            {canCancel ? (
              <Button variant="outline" className="w-full" onClick={() => setCancelOpen(true)}>Cancel Order</Button>
            ) : null}
            {canReturn ? (
              <Button variant="outline" className="w-full text-danger-500 hover:border-danger-300 hover:bg-danger-100/40" onClick={() => setReturnOpen(true)}>
                Request Return
              </Button>
            ) : null}
            <Button href={`/track-order?code=${order.orderCode}`} variant="ghost" className="w-full">
              <Truck className="h-4 w-4" /> Track this order
            </Button>
            {order.status === "delivered" || order.status === "return_requested" ? (
              <Button href={`/product/${order.items[0].productId}`} variant="ghost" className="w-full">
                Buy again
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel this order?" description={`${order.orderCode} · ${formatBDT(order.total)}`}>
        <div className="p-6">
          <p className="text-sm text-[var(--muted)]">
            Your refund will be processed within 3-5 business days to your original payment method. This action can't be undone.
          </p>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setCancelOpen(false)}>Keep Order</Button>
            <Button variant="danger" className="flex-1" onClick={() => { setCancelOpen(false); success("Order cancelled", "Refund will be processed within 3-5 days."); }}>
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return modal */}
      <Modal open={returnOpen} onClose={() => setReturnOpen(false)} title="Request a return" description="Why are you returning this order?">
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-600/10">
              <option value="">Select a reason…</option>
              <option>Wrong item delivered</option>
              <option>Damaged in transit</option>
              <option>Item not as described</option>
              <option>No longer needed</option>
            </select>
          </div>
          <Textarea label="Details (optional)" placeholder="Tell us what went wrong…" value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setReturnOpen(false)}>Cancel</Button>
            <Button className="flex-1" disabled={!reason} onClick={requestReturn}>Submit Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
