"use client";

import Link from "next/link";
import type { Order } from "@/types";
import { formatBDT, formatDate } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/Badge";
import { ProductImage } from "./ProductImage";

const statusLabels: Record<string, string> = {
  placed: "Placed", confirmed: "Confirmed", packed: "Packed", shipped: "Shipped",
  out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
  return_requested: "Return Requested", returned: "Returned", refunded: "Refunded",
};

export function OrderRow({ order, href }: { order: Order; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-700/40"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <p className="font-mono text-sm font-semibold text-primary-800">{order.orderCode}</p>
          <Badge tone={statusTone(order.status)}>{statusLabels[order.status] ?? order.status}</Badge>
          {order.paymentMethod === "cod" ? <Badge tone="accent">COD</Badge> : null}
        </div>
        <p className="text-xs text-[var(--muted)]">{formatDate(order.placedAt)}</p>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex -space-x-3">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="relative h-12 w-12 overflow-hidden rounded-md border border-[var(--line)] bg-[var(--line)]">
              <ProductImage src={item.image} alt={item.name} sizes="48px" />
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {order.items[0].name}
            {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {order.items.reduce((s, i) => s + i.quantity, 0)} item(s) · {order.deliveryAddress.area}, {order.deliveryAddress.city}
          </p>
        </div>
        <p className="text-sm font-bold text-foreground">{formatBDT(order.total)}</p>
      </div>
    </Link>
  );
}
