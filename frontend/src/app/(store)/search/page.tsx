"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGetProductsQuery } from "@/features/api/api";
import type { ProductFilters } from "@/types";

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [sort, setSort] = useState<ProductFilters["sort"]>("popular");
  const [page, setPage] = useState(1);

  const params = useMemo(() => ({ q, sort, page, pageSize: 16 }), [q, sort, page]);
  const { data, isLoading } = useGetProductsQuery(params, { skip: !q });
  const products = data?.items ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-2 font-mono text-sm tracking-wider text-[var(--muted)]">
        <Search className="h-4 w-4 text-primary-800" />
        {isLoading ? "SEARCHING…" : (
          <span>
            {data?.total ?? 0} RESULTS FOR{" "}
            <span className="font-semibold text-primary-800">“{q}”</span>
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="font-mono text-xs tracking-wider text-[var(--muted)]">
          SHOWING {products.length} OF {data?.total ?? 0}
        </p>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as ProductFilters["sort"]); setPage(1); }}
            className="h-10 cursor-pointer appearance-none rounded-md border border-[var(--line)] bg-[var(--surface)] pl-4 pr-9 font-mono text-xs tracking-wider text-foreground focus:border-primary-600 focus:outline-none"
          >
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6"><ProductGridSkeleton count={8} /></div>
      ) : products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Search className="h-7 w-7 text-primary-800" />}
            title={`No results for “${q}”`}
            description="Try different keywords, or check the spelling."
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-8">
            <Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8"><ProductGridSkeleton /></div>}>
      <SearchContent />
    </Suspense>
  );
}
