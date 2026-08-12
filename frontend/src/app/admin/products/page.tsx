"use client";

import { useState } from "react";
import { Flag, Check, X, Search } from "lucide-react";
import { useGetProductsQuery } from "@/features/api/api";
import type { Product } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductImage } from "@/components/shared/ProductImage";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatBDT } from "@/lib/utils";

export default function ProductModerationPage() {
  const { success } = useToast();
  const [tab, setTab] = useState("flagged");
  const [q, setQ] = useState("");
  const { data: productsData } = useGetProductsQuery({ pageSize: 100 });
  const products = productsData?.items ?? [];
  const [flagged, setFlagged] = useState<Product[]>([]);
  const [removed, setRemoved] = useState<Product[]>([]);
  const effectiveFlagged = flagged.length > 0 ? flagged : products.filter((p) => p.isFlagged);

  const filtered = (tab === "flagged" ? effectiveFlagged : tab === "removed" ? removed : products).filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()),
  );

  const remove = (id: string) => {
    const p = effectiveFlagged.find((x) => x.id === id);
    if (!p) return;
    setFlagged(effectiveFlagged.filter((x) => x.id !== id));
    setRemoved([p, ...removed]);
    success("Listing removed", `${p.name} is no longer visible on the store.`);
  };

  const keep = (id: string) => {
    setFlagged(effectiveFlagged.filter((x) => x.id !== id));
    success("Listing kept", "Flag cleared — product remains live.");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Product Moderation</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{effectiveFlagged.length} flagged listing(s) needing review.</p>
        </div>
        <div className="w-64">
          <Input placeholder="Search listings…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "flagged", label: "Flagged", count: effectiveFlagged.length },
          { id: "removed", label: "Removed", count: removed.length },
          { id: "all", label: "All Listings", count: products.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-4xl">🎉</p>
          <h2 className="mt-3 text-lg font-bold text-foreground">Nothing here</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">No listings match this view.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                  <ProductImage src={p.images[0]?.url} alt={p.name} sizes="56px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-[var(--muted)]">{p.brand} · {p.categoryName} · {formatBDT(p.price)} · Seller {p.sellerId}</p>
                </div>
                {tab === "flagged" ? (
                  <Badge tone="danger"><Flag className="h-3 w-3" /> {p.flagReason ?? "Reported"}</Badge>
                ) : null}
                {tab === "flagged" ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => keep(p.id)}><Check className="h-4 w-4" /> Keep</Button>
                    <Button size="sm" variant="danger" onClick={() => remove(p.id)}><X className="h-4 w-4" /> Remove</Button>
                  </div>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
