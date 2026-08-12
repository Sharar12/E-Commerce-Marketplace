"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { useGetSellerOrdersQuery } from "@/features/api/api";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { ProductImage } from "@/components/shared/ProductImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBDT, timeAgo } from "@/lib/utils";

export default function SellerOrdersPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const sellerId = user.sellerId ?? "sel-techpoint";
  const { data } = useGetSellerOrdersQuery(sellerId);
  const orders = data?.items ?? [];
  const [tab, setTab] = useState("new");

  const tabs = [
    { id: "new", label: "To Process", count: orders.filter((o) => ["placed", "confirmed"].includes(o.status)).length },
    { id: "fulfilling", label: "Fulfilling", count: orders.filter((o) => ["packed", "shipped", "out_for_delivery"].includes(o.status)).length },
    { id: "completed", label: "Completed", count: orders.filter((o) => o.status === "delivered").length },
    { id: "returns", label: "Returns", count: orders.filter((o) => ["return_requested", "returned", "refunded"].includes(o.status)).length },
    { id: "all", label: "All", count: orders.length },
  ];

  const filtered = orders.filter((o) => {
    if (tab === "all") return true;
    if (tab === "new") return ["placed", "confirmed"].includes(o.status);
    if (tab === "fulfilling") return ["packed", "shipped", "out_for_delivery"].includes(o.status);
    if (tab === "completed") return o.status === "delivered";
    return ["return_requested", "returned", "refunded"].includes(o.status);
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Process, fulfill and manage returns.</p>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState title="No orders in this view" description="New orders from customers will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <Link key={o.id} href={`/seller/orders/${o.id}`} className="block">
              <Card hover className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-foreground">{o.orderCode}</span>
                    <Badge tone={statusTone(o.status)}>{o.status.replace("_", " ")}</Badge>
                    <span className="text-xs text-[var(--muted)]">{timeAgo(o.placedAt)}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{formatBDT(o.total)}</p>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {o.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="relative h-11 w-11 overflow-hidden rounded-xl border-2 border-white bg-[var(--surface-2)]">
                        <ProductImage src={item.image} alt={item.name} sizes="44px" />
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {o.items[0].name}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ""}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{o.customerName} · {o.deliveryAddress.area}, {o.deliveryAddress.city}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
