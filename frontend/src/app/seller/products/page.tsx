"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, MoreVertical, Eye, Copy, Trash2, Package } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetProductsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Tabs } from "@/components/ui/Tabs";
import { ProductImage } from "@/components/shared/ProductImage";
import { Price } from "@/components/shared/Price";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

export default function SellerProductsPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const sellerId = user.sellerId ?? "sel-techpoint";
  const { success } = useToast();
  const { data } = useGetProductsQuery({ sellerId, pageSize: 100 });
  const myProducts = data?.items ?? [];
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  const filtered = myProducts.filter((p) => {
    const matchesTab =
      tab === "all" ? true : tab === "draft" ? !p.isPublished : tab === "low" ? p.stock < 10 : p.isPublished;
    const matchesQ = p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase());
    return matchesTab && matchesQ;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{myProducts.length} products in your catalog</p>
        </div>
        <Button href="/seller/products/new"><Plus className="h-4 w-4" /> Add Product</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          tabs={[
            { id: "all", label: "All", count: myProducts.length },
            { id: "published", label: "Published" },
            { id: "draft", label: "Drafts" },
            { id: "low", label: "Low Stock" },
          ]}
          active={tab}
          onChange={setTab}
        />
        <div className="ml-auto w-full sm:w-72">
          <Input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8 text-foreground" />}
          title="No products found"
          description="Add your first product to start selling."
          action={<Button href="/seller/products/new"><Plus className="h-4 w-4" /> Add Product</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-[var(--line)]">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-[var(--surface-2)]">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                  <ProductImage src={p.images[0]?.url} alt={p.name} sizes="56px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {p.sku} · {p.stock} in stock · {p.soldCount} sold
                  </p>
                </div>
                <div className="hidden sm:block">
                  <Price price={p.price} mrp={p.mrp} size="sm" />
                </div>
                <Badge tone={p.isPublished ? "success" : "neutral"}>{p.isPublished ? "Published" : "Draft"}</Badge>
                {p.stock < 10 ? <Badge tone="warning">Low stock</Badge> : null}
                <Dropdown
                  trigger={
                    <button className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--muted)]" aria-label="Product actions">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  }
                  items={[
                    { label: "Edit", icon: <Pencil className="h-4 w-4" />, href: `/seller/products/${p.id}` },
                    { label: "View on store", icon: <Eye className="h-4 w-4" />, href: `/product/${p.id}` },
                    { label: "Duplicate", icon: <Copy className="h-4 w-4" />, onClick: () => success("Product duplicated") },
                    { divider: true },
                    { label: "Delete", icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: () => success("Product deleted") },
                  ]}
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
