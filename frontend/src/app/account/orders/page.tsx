"use client";

import { useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { useGetCustomerOrdersQuery } from "@/features/api/api";
import { Tabs } from "@/components/ui/Tabs";
import { OrderRow } from "@/components/shared/OrderRow";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

const filterTabs = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
  { id: "returns", label: "Returns" },
];

export default function OrdersPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const [tab, setTab] = useState("all");
  const { data, isLoading } = useGetCustomerOrdersQuery(user.id);

  const orders = data?.items ?? [];
  const filtered = orders.filter((o) => {
    if (tab === "all") return true;
    if (tab === "active") return ["placed", "confirmed", "packed", "shipped", "out_for_delivery"].includes(o.status);
    if (tab === "delivered") return o.status === "delivered";
    if (tab === "cancelled") return o.status === "cancelled";
    return ["return_requested", "returned", "refunded"].includes(o.status);
  });

  const counts = {
    all: orders.length,
    active: orders.filter((o) => ["placed", "confirmed", "packed", "shipped", "out_for_delivery"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    returns: orders.filter((o) => ["return_requested", "returned", "refunded"].includes(o.status)).length,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Orders</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Track, manage and return your orders.</p>
      </div>

      <Tabs
        tabs={filterTabs.map((t) => ({ ...t, count: counts[t.id as keyof typeof counts] }))}
        active={tab}
        onChange={setTab}
      />

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Package2Icon />}
          title="No orders here yet"
          description="When you place orders, they'll show up here."
          action={<Button href="/">Start Shopping</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => <OrderRow key={o.id} order={o} href={`/account/orders/${o.id}`} />)}
        </div>
      )}
    </div>
  );
}

function Package2Icon() {
  return <span className="text-3xl">📦</span>;
}
