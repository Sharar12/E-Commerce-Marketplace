"use client";

import { useAppSelector } from "@/lib/hooks";
import { selectWishlist } from "@/features/cart/cartSlice";
import { useGetProductsQuery } from "@/features/api/api";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function WishlistPage() {
  const wishlist = useAppSelector(selectWishlist);
  const { data, isLoading } = useGetProductsQuery({ pageSize: 100 }, { skip: wishlist.length === 0 });
  const products = (data?.items ?? []).filter((p) => wishlist.some((w) => w.productId === p.id));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Wishlist</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{wishlist.length} item(s) saved</p>
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : products.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here for later."
          action={<Button href="/">Discover Products</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
