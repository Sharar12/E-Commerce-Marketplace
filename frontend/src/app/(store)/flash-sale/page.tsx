"use client";

import { Zap } from "lucide-react";
import { useGetFlashSaleProductsQuery } from "@/features/api/api";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function FlashSalePage() {
  const { data, isLoading } = useGetFlashSaleProductsQuery();
  const products = data?.items ?? [];
  const endsAt = products[0]?.flashSaleEndsAt ?? new Date(Date.now() + 86400000).toISOString();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumbs items={[{ label: "Flash Sale" }]} />
      <div className="bento-panel   relative mt-4 overflow-hidden p-6 sm:p-8">
        <div className="bento-stripe absolute inset-x-0 top-0 h-1.5 w-full" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-md bg-danger-600 text-white shadow-[0_0_24px_rgb(220_38_38/0.35)]">
              <Zap className="h-7 w-7" />
            </span>
            <div>
              <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                FLASH SALE
                <span className="bg-danger-500 h-2 w-2 rounded-[1px]" />
              </h1>
              <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--muted)]">HUGE DISCOUNTS, LIMITED STOCK — WHEN IT'S GONE, IT'S GONE!</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-danger-600/30 bg-white/90 px-4 py-3">
            <span className="font-mono text-[10px] tracking-widest text-[var(--muted)]">ENDS IN</span>
            <CountdownTimer endsAt={endsAt} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8"><ProductGridSkeleton count={8} /></div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <div key={p.id} style={{ animation: `deal-in 0.5s ease-out ${(i % 4) * 0.06}s both` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
