"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/types";
import { discountPercent, cn } from "@/lib/utils";
import { RatingStars } from "./RatingStars";
import { Price } from "./Price";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addItem, toggleWishlist, selectWishlist } from "@/features/cart/cartSlice";
import { pushToast } from "@/features/ui/uiSlice";
import { ProductImage } from "./ProductImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const stockTone = (stock: number) => {
  if (stock <= 0) return "bg-danger-600";
  if (stock < 20) return "bg-primary-600";
  return "bg-success-600";
};

export function ProductCard({
  product,
  view = "grid",
  className,
}: {
  product: Product;
  view?: "grid" | "list";
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector(selectWishlist);
  const wished = wishlist.some((w) => w.productId === product.id);
  const discount = discountPercent(product.price, product.mrp);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addItem({ productId: product.id, variantLabel: product.variants[0]?.value }));
    dispatch(pushToast({ type: "success", title: "Added to cart", message: product.name }));
  };

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product.id));
    dispatch(
      pushToast({
        type: wished ? "info" : "success",
        title: wished ? "Removed from wishlist" : "Saved to wishlist",
        message: product.name,
      }),
    );
  };

  if (view === "list") {
    return (
      <Link
        href={`/product/${product.id}`}
        className={cn(
          "group relative flex gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-600/50 hover:shadow-hover",
          className,
        )}
      >
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface-2)] sm:h-32 sm:w-32">
          <ProductImage src={product.images[0]?.url} alt={product.name} className="transition-transform duration-500 group-hover:scale-110" />
          {product.isFlashSale ? (
            <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-md bg-danger-600 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
              <Zap className="h-2.5 w-2.5" /> {discount}%
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--muted)]">{product.brand.toUpperCase()}</p>
              <h3 className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary-800">
                {product.name}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <RatingStars rating={product.rating} showValue size={12} />
                <span className="font-mono text-[11px] text-[var(--muted)]">· {product.reviewCount} R</span>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={handleWish} className="shrink-0" aria-label="Wishlist">
              <Heart className={cn("h-4.5 w-4.5", wished ? "fill-danger-600 text-danger-600" : "")} />
            </Button>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm text-[var(--muted)]">{product.description}</p>
          <div className="mt-auto flex items-center justify-between pt-3">
            <Price price={product.price} mrp={product.mrp} size="md" />
            <Button size="sm" onClick={handleAdd}>
              <ShoppingCart className="h-3.5 w-3.5" /> ADD
            </Button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-card spring-lift hover:border-primary-600/60 hover:shadow-hover",
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--surface-2)]">
        <ProductImage
          src={product.images[0]?.url}
          alt={product.name}
          className="transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Lime sweep on hover */}
        <span className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-primary-500/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[radar-sweep_0.9s_ease-in-out]" />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {discount > 0 ? (
            <Badge tone="danger" className="border border-danger-600/30 bg-danger-500/10 font-mono tracking-wider text-danger-700">
              -{discount}%
            </Badge>
          ) : null}
          {product.isFlashSale ? (
            <Badge tone="warning" className="border border-primary-700/40 bg-primary-500/25 font-mono tracking-wider text-primary-800">
              <Zap className="h-3 w-3" /> FLASH
            </Badge>
          ) : null}
        </div>
        <button
          onClick={handleWish}
          className={cn(
            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-white/90 shadow-sm backdrop-blur transition-all hover:scale-110",
            wished ? "text-danger-600" : "text-ink hover:text-danger-600",
          )}
          aria-label="Toggle wishlist"
        >
          <Heart className={cn("h-4 w-4", wished && "fill-danger-600")} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">{product.brand.toUpperCase()}</p>
          <span className="font-mono text-[9px] tracking-widest text-[var(--muted)]">{product.sku}</span>
        </div>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary-800">
          {product.name}
        </h3>
        <div className="mt-1.5">
          <RatingStars rating={product.rating} size={12} />
          <span className="ml-1 font-mono text-[11px] text-[var(--muted)]">({product.reviewCount})</span>
        </div>
        {/* Stock status bar */}
        <div className="mt-2.5">
          <div className="h-1 overflow-hidden rounded-full bg-[var(--line)]">
            <div
              className={cn("h-full transition-all duration-500", stockTone(product.stock))}
              style={{ width: `${Math.min(100, Math.max(4, product.stock))}%` }}
            />
          </div>
          <p className="mt-1 font-mono text-[10px] tracking-widest text-[var(--muted)]">
            {product.stock > 0 ? `${product.stock} UNITS` : "OUT OF STOCK"}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <Price
            price={product.price}
            mrp={product.mrp}
            size="md"
            className="group-hover:animate-[price-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)]"
          />
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-ink shadow-[0_2px_8px_rgb(13_13_13/0.14)] transition-all hover:bg-primary-400 active:scale-90 disabled:opacity-40"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
