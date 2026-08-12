"use client";

import { useState } from "react";
import { useGetOrdersQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBDT, timeAgo } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  placed: "Placed", confirmed: "Confirmed", packed: "Packed", shipped: "Shipped",
  out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
  return_requested: "Return Requested", returned: "Returned", refunded: "Refunded",
};

export default function AdminOrdersPage() {
  const [tab, setTab] = useState("all");
  const { data: ordersData } = useGetOrdersQuery({ pageSize: 100 });
  const orders = ordersData?.items ?? [];

  const tabs = [
    { id: "all", label: "All", count: orders.length },
    { id: "active", label: "Active", count: orders.filter((o) => ["placed", "confirmed", "packed", "shipped", "out_for_delivery"].includes(o.status)).length },
    { id: "delivered", label: "Delivered", count: orders.filter((o) => o.status === "delivered").length },
    { id: "disputes", label: "Disputes", count: orders.filter((o) => ["return_requested", "returned", "refunded"].includes(o.status)).length },
    { id: "cancelled", label: "Cancelled", count: orders.filter((o) => o.status === "cancelled").length },
  ];

  const filtered = orders.filter((o) => {
    if (tab === "all") return true;
    if (tab === "active") return ["placed", "confirmed", "packed", "shipped", "out_for_delivery"].includes(o.status);
    if (tab === "delivered") return o.status === "delivered";
    if (tab === "disputes") return ["return_requested", "returned", "refunded"].includes(o.status);
    return o.status === "cancelled";
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Order Oversight</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Platform-wide order visibility and dispute escalations.</p>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="No orders in this view" />
        ) : (
          <Table>
            <THead>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Items</Th>
              <Th>Total</Th>
              <Th>Payment</Th>
              <Th>Status</Th>
              <Th>Placed</Th>
            </THead>
            <TBody>
              {filtered.slice(0, 40).map((o) => (
                <Tr key={o.id}>
                  <Td><span className="font-mono text-xs font-bold text-foreground">{o.orderCode}</span></Td>
                  <Td>
                    <p className="text-foreground">{o.customerName}</p>
                    <p className="text-xs text-[var(--muted)]">{o.deliveryAddress.city}</p>
                  </Td>
                  <Td><span className="text-xs text-[var(--muted)]">{o.items.length} item(s)</span></Td>
                  <Td className="font-semibold text-foreground">{formatBDT(o.total)}</Td>
                  <Td><Badge tone={o.paymentMethod === "cod" ? "accent" : "info"} className="capitalize">{o.paymentMethod}</Badge></Td>
                  <Td><Badge tone={statusTone(o.status)}>{statusLabels[o.status] ?? o.status}</Badge></Td>
                  <Td className="text-xs text-[var(--muted)]">{timeAgo(o.placedAt)}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
