"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useGetProductsQuery, useGetCategoriesQuery, useGetBrandsQuery } from "@/features/api/api";
import type { ProductFilters } from "@/types";

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: catsData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();
  const category = (catsData?.items ?? []).find((c) => c.slug === slug);

  const [brand, setBrand] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<ProductFilters["sort"]>("popular");
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);

  const params = useMemo(
    () => ({
      categoryId: category?.id,
      brand: brand ?? undefined,
      minPrice: minPrice ?? undefined,
      maxPrice: maxPrice ?? undefined,
      minRating: minRating ?? undefined,
      inStockOnly: inStock || undefined,
      sort,
      page,
      pageSize: 12,
    }),
    [category?.id, brand, minPrice, maxPrice, minRating, inStock, sort, page],
  );

  const { data, isLoading } = useGetProductsQuery(params, { skip: !category });
  const products = data?.items ?? [];
  const brands = brandsData?.items ?? [];

  const hasFilters = brand || minPrice != null || maxPrice != null || minRating != null || inStock;

  const clearFilters = () => {
    setBrand(null);
    setMinPrice(null);
    setMaxPrice(null);
    setMinRating(null);
    setInStock(false);
    setPage(1);
  };

  const priceBands = [
    { label: "Under ৳1,000", min: null, max: 1000 },
    { label: "৳1,000 – ৳5,000", min: 1000, max: 5000 },
    { label: "৳5,000 – ৳20,000", min: 5000, max: 20000 },
    { label: "৳20,000 – ৳50,000", min: 20000, max: 50000 },
    { label: "Above ৳50,000", min: 50000, max: null },
  ];

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 font-mono text-xs font-bold tracking-[0.2em] text-primary-800">BRAND</h4>
        <div className="space-y-2">
          {brands.slice(0, 10).map((b) => (
            <label key={b.id} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="radio"
                name="brand"
                checked={brand === b.name}
                onChange={() => {
                  setBrand(brand === b.name ? null : b.name);
                  setPage(1);
                }}
                className="h-4 w-4 accent-primary-500"
              />
              {b.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 font-mono text-xs font-bold tracking-[0.2em] text-primary-800">PRICE</h4>
        <div className="space-y-2">
          {priceBands.map((p, i) => (
            <label key={i} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="radio"
                name="price"
                checked={minPrice === p.min && maxPrice === p.max}
                onChange={() => {
                  setMinPrice(p.min);
                  setMaxPrice(p.max);
                  setPage(1);
                }}
                className="h-4 w-4 accent-primary-500"
              />
              {p.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 font-mono text-xs font-bold tracking-[0.2em] text-primary-800">RATING</h4>
        <div className="space-y-2">
          {[4, 3, 2].map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => {
                  setMinRating(minRating === r ? null : r);
                  setPage(1);
                }}
                className="h-4 w-4 accent-primary-500"
              />
              {r}+ stars
            </label>
          ))}
        </div>
      </div>

      <Checkbox
        label="In stock only"
        checked={inStock}
        onChange={(e) => {
          setInStock(e.target.checked);
          setPage(1);
        }}
      />

      {hasFilters ? (
        <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
          <X className="h-3.5 w-3.5" /> CLEAR FILTERS
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumbs items={[{ label: category?.name ?? "Category" }]} />

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-primary-800">
            <span className="bg-primary-500 h-1.5 w-1.5 rounded-[1px]" />
            MODULE // {category?.name.toUpperCase() ?? "CATEGORY"}
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{category?.name}</h1>
          <p className="mt-1 font-mono text-xs tracking-wider text-[var(--muted)]">
            {isLoading ? "LOADING…" : `${data?.total ?? 0} PRODUCTS ONLINE`}
          </p>
        </div>
        <div className="relative hidden sm:block">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as ProductFilters["sort"]);
              setPage(1);
            }}
            className="h-10 cursor-pointer appearance-none rounded-md border border-[var(--line)] bg-[var(--surface)] pl-4 pr-9 font-mono text-xs tracking-wider text-foreground focus:border-primary-600 focus:outline-none"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-36 rounded-lg border border-primary-700/30 bg-[var(--surface)] p-5 shadow-card">{FilterPanel}</div>
        </aside>

        <div>
          {/* Mobile filter bar */}
          <div className="mb-4 flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileFilters(true)}
              className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 font-mono text-xs tracking-wider text-foreground"
            >
              <SlidersHorizontal className="h-4 w-4" /> FILTERS
              {hasFilters ? <span className="h-2 w-2 rounded-full bg-primary-500" /> : null}
            </button>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as ProductFilters["sort"]);
                setPage(1);
              }}
              className="h-10 flex-1 cursor-pointer appearance-none rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 font-mono text-xs text-foreground focus:outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {mobileFilters ? (
            <div className="fixed inset-0 z-[90] lg:hidden">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileFilters(false)} />
              <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto border-r border-primary-700/35 bg-[var(--surface)] p-5 shadow-overlay">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-mono text-sm font-bold tracking-[0.2em] text-primary-800">FILTERS</h3>
                  <button onClick={() => setMobileFilters(false)} className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)]">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {FilterPanel}
                <Button className="mt-6 w-full" onClick={() => setMobileFilters(false)}>SHOW RESULTS</Button>
              </div>
            </div>
          ) : null}

          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or browsing another category."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  CLEAR FILTERS
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
