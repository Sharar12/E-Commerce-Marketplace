"use client";

import { useState } from "react";
import { Package, AlertTriangle, Minus, Plus } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetProductsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function InventoryPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const sellerId = user.sellerId ?? "sel-techpoint";
  const { success } = useToast();
  const { data } = useGetProductsQuery({ sellerId, pageSize: 100 });
  const myProducts = data?.items ?? [];
  const [stock, setStock] = useState<Record<string, number>>({});
  const stockOf = (id: string, fallback: number) => stock[id] ?? fallback;
  const [log] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      product: myProducts[i % myProducts.length]?.name ?? "Product",
      action: ["Stock added", "Order shipped", "Stock adjusted", "Return received"][i % 4],
      qty: ["+20", "-2", "+5", "-1"][i % 4],
      at: new Date(Date.now() - i * 11 * 3600000).toISOString(),
    })),
  );

  const adjust = (id: string, delta: number) => {
    setStock((s) => ({ ...s, [id]: Math.max(0, (s[id] ?? 0) + delta) }));
    success("Stock updated", delta > 0 ? `Added ${delta} units` : `Removed ${Math.abs(delta)} units`);
  };

  const lowStock = myProducts.filter((p) => stockOf(p.id, p.stock) < 10).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventory</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{myProducts.length} SKUs · {lowStock} below threshold</p>
        </div>
        <Badge tone={lowStock > 0 ? "warning" : "success"} className="px-3 py-1.5">
          {lowStock > 0 ? <><AlertTriangle className="h-3.5 w-3.5" /> {lowStock} low stock items</> : "All healthy"}
        </Badge>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <THead>
            <Th>Product</Th>
            <Th>SKU</Th>
            <Th className="text-center">Current Stock</Th>
            <Th className="text-center">Adjust</Th>
            <Th>Status</Th>
          </THead>
          <TBody>
            {myProducts.map((p) => (
              <Tr key={p.id}>
                <Td className="max-w-[280px]">
                  <p className="truncate font-medium text-foreground">{p.name}</p>
                </Td>
                <Td><span className="font-mono text-xs text-[var(--muted)]">{p.sku}</span></Td>
                <Td className="text-center font-semibold text-foreground">{stockOf(p.id, p.stock)}</Td>
                <Td>
                  <div className="flex justify-center gap-1">
                    <button onClick={() => adjust(p.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-danger-500" aria-label="Decrease">
                      <Minus className="h-3 w-3" />
                    </button>
                    <button onClick={() => adjust(p.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-success-500" aria-label="Increase">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </Td>
                <Td>
                  <Badge tone={stockOf(p.id, p.stock) === 0 ? "danger" : stockOf(p.id, p.stock) < 10 ? "warning" : "success"}>
                    {stockOf(p.id, p.stock) === 0 ? "Out of stock" : stockOf(p.id, p.stock) < 10 ? "Low stock" : "In stock"}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Package className="h-4.5 w-4.5 text-primary-800" /> Stock History
        </h2>
        <div className="mt-4 divide-y divide-[var(--line)]">
          {log.map((l) => (
            <div key={l.id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{l.product}</p>
                <p className="text-xs text-[var(--muted)]">{l.action} · {new Date(l.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
              </div>
              <span className={`text-sm font-bold ${l.qty.startsWith("+") ? "text-success-500" : "text-danger-500"}`}>{l.qty}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
