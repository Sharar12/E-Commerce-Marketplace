"use client";

import { useState } from "react";
import { Search, Package, MapPin, CreditCard, Truck } from "lucide-react";
import { useGetOrdersQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge, statusTone } from "@/components/ui/Badge";
import { ProductImage } from "@/components/shared/ProductImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBDT, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

export default function SupportOrderLookupPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Order | undefined>();
  const [searched, setSearched] = useState(false);
  const { data: ordersData } = useGetOrdersQuery({ pageSize: 100 });
  const orders = ordersData?.items ?? [];

  const findOrder = (c: string) =>
    orders.find((o) => o.orderCode.toLowerCase() === c.trim().toLowerCase());

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(code ? findOrder(code) : undefined);
    setSearched(true);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Order Lookup</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Search any order to view customer, seller and delivery info in one panel.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={search} className="flex gap-2">
          <Input
            placeholder="Search by order code (e.g. APD100042) or customer name"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Button type="submit" className="shrink-0">Lookup</Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {orders.slice(0, 6).map((o) => (
            <button key={o.id} onClick={() => { setCode(o.orderCode); setResult(o); setSearched(true); }} className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-mono text-[var(--muted)] transition-colors hover:bg-primary-500/25 hover:text-primary-800">
              {o.orderCode}
            </button>
          ))}
        </div>
      </Card>

      {searched && !result ? (
        <EmptyState icon={<Package className="h-8 w-8 text-foreground" />} title="Order not found" description={`No order matches "${code}". Try another code.`} />
      ) : null}

      {result ? (
        <>
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xl font-bold text-foreground">{result.orderCode}</p>
                <p className="text-sm text-[var(--muted)]">Placed {formatDate(result.placedAt, { hour: "numeric", minute: "2-digit" })} · Updated {formatDate(result.updatedAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={statusTone(result.status)}>{result.status.replace("_", " ")}</Badge>
                <Badge tone={result.paymentStatus === "paid" ? "success" : result.paymentStatus === "pending" ? "warning" : "danger"}>Payment: {result.paymentStatus}</Badge>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Package className="h-4 w-4 text-primary-800" /> Customer</h3>
              <p className="mt-2 text-sm font-medium text-foreground">{result.customerName}</p>
              <p className="text-xs text-[var(--muted)]">{result.customerEmail}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{result.customerPhone}</p>
            </Card>
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><CreditCard className="h-4 w-4 text-primary-800" /> Payment</h3>
              <p className="mt-2 text-sm capitalize text-foreground">{result.paymentMethod === "cod" ? "Cash on Delivery" : result.paymentMethod}</p>
              <p className="mt-1 text-sm font-bold text-foreground">{formatBDT(result.total)}</p>
              <p className="text-xs text-[var(--muted)]">Subtotal {formatBDT(result.subtotal)} · Shipping {result.shippingFee === 0 ? "Free" : formatBDT(result.shippingFee)}</p>
            </Card>
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><MapPin className="h-4 w-4 text-primary-800" /> Delivery</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{result.deliveryAddress.line1}, {result.deliveryAddress.area}</p>
              <p className="text-xs text-[var(--muted)]">{result.deliveryAddress.city} {result.deliveryAddress.postalCode} · {result.deliveryAddress.phone}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-[var(--muted)]"><Truck className="h-3 w-3" /> {result.assignedPartnerId ? `Partner ${result.assignedPartnerId}` : "Not yet assigned"}</p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Items ({result.items.length})</h2>
            <div className="mt-4 divide-y divide-[var(--line)]">
              {result.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                    <ProductImage src={item.image} alt={item.name} sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-[var(--muted)]">Seller {item.sellerId} · Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatBDT(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
