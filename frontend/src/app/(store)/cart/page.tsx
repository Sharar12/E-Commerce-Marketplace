"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, TicketPercent, ArrowRight, Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  selectCartItems, selectWishlist, setQuantity, removeItem, setCoupon, toggleWishlist,
} from "@/features/cart/cartSlice";
import { useGetProductsQuery, useGetPromotionsQuery } from "@/features/api/api";
import { ProductImage } from "@/components/shared/ProductImage";
import { Price } from "@/components/shared/Price";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatBDT } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { success, error } = useToast();
  const items = useAppSelector(selectCartItems);
  const wishlist = useAppSelector(selectWishlist);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const { data } = useGetProductsQuery({ pageSize: 100 }, { skip: items.length === 0 });
  const { data: promosData } = useGetPromotionsQuery();
  const allProducts = data?.items ?? [];
  const promoCodes = promosData?.coupons ?? [];

  const lineItems = items
    .map((item) => {
      const product = allProducts.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as { productId: string; quantity: number; variantLabel?: string; product: (typeof allProducts)[number] }[];

  const subtotal = lineItems.reduce((s, li) => s + li.product.price * li.quantity, 0);
  const coupon = promoCodes.find((c) => c.code === appliedCoupon);
  const discount = coupon
    ? Math.min(coupon.discountType === "percent" ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue, coupon.maxDiscount ?? Infinity)
    : 0;
  const shipping = subtotal - discount >= 499 ? 0 : 60;
  const total = subtotal - discount + shipping;

  const savedForLater = wishlist
    .map((w) => allProducts.find((p) => p.id === w.productId))
    .filter(Boolean) as (typeof allProducts)[number][];

  const applyCoupon = () => {
    const promo = promoCodes.find((c) => c.code === couponInput.toUpperCase());
    if (promo && promo.active) {
      setAppliedCoupon(promo.code);
      dispatch(setCoupon(promo.code));
      success("Coupon applied!", `${promo.title} — you saved ${formatBDT(discount)}`);
    } else {
      error("Invalid coupon", "This code is expired or doesn't exist.");
    }
  };

  if (lineItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8 text-primary-800" />}
          title="Cart empty"
          description="Feed the cart with catalog items."
          action={<Button href="/">Enter Market</Button>}
        />
        {savedForLater.length > 0 ? (
          <div className="mt-12">
            <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Saved for later</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {savedForLater.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-primary-800">
        <span className="bg-[var(--line-strong)] h-1.5 w-1.5 rounded-[1px]" />
        CART // MANIFEST
      </p>
      <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-foreground">Shopping Cart</h1>
      <p className="mt-1 font-mono text-xs tracking-wider text-[var(--muted)]">{lineItems.length} ITEM(S) LOADED</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {lineItems.map((li) => (
            <Card key={li.productId + (li.variantLabel ?? "")} className="p-4">
              <div className="flex gap-4">
                <Link href={`/product/${li.product.id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)]">
                  <ProductImage src={li.product.images[0]?.url} alt={li.product.name} sizes="96px" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/product/${li.product.id}`} className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary-800">
                        {li.product.name}
                      </Link>
                      <p className="mt-0.5 font-mono text-[10px] tracking-wider text-[var(--muted)]">
                        {li.variantLabel ? `${li.variantLabel.toUpperCase()} · ` : ""}{li.product.brand.toUpperCase()}
                      </p>
                    </div>
                    <Price price={li.product.price * li.quantity} size="md" />
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-md border border-[var(--line)] bg-white">
                      <button
                        onClick={() => dispatch(setQuantity({ productId: li.productId, variantLabel: li.variantLabel, quantity: li.quantity - 1 }))}
                        className="flex h-8 w-8 items-center justify-center text-[var(--muted)] hover:text-primary-800"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono text-sm font-semibold">{li.quantity}</span>
                      <button
                        onClick={() => dispatch(setQuantity({ productId: li.productId, variantLabel: li.variantLabel, quantity: li.quantity + 1 }))}
                        className="flex h-8 w-8 items-center justify-center text-[var(--muted)] hover:text-primary-800"
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          dispatch(toggleWishlist(li.productId));
                          dispatch(removeItem({ productId: li.productId, variantLabel: li.variantLabel }));
                          success("Moved to wishlist");
                        }}
                        className="flex items-center gap-1 rounded-md px-2 py-1.5 font-mono text-[10px] tracking-wider text-[var(--muted)] transition-colors hover:bg-primary-400/20 hover:text-primary-800"
                      >
                        <Heart className="h-3.5 w-3.5" /> SAVE
                      </button>
                      <button
                        onClick={() => {
                          dispatch(removeItem({ productId: li.productId, variantLabel: li.variantLabel }));
                          error("Removed from cart");
                        }}
                        className="rounded-md px-2 py-1.5 text-[var(--muted)] transition-colors hover:bg-danger-500/10 hover:text-danger-500"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {savedForLater.length > 0 ? (
            <div className="pt-4">
              <h2 className="font-display text-base font-bold tracking-tight text-foreground">Saved for later</h2>
              <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                {savedForLater.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          ) : null}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-mono text-sm font-bold tracking-[0.2em] text-primary-800">ORDER SUMMARY</h2>

            {/* Coupon */}
            {appliedCoupon ? (
              <div className="mt-4 flex items-center justify-between rounded-md border border-success-500/40 bg-success-500/10 px-3.5 py-2.5">
                <span className="flex items-center gap-2 font-mono text-xs tracking-wider text-success-700">
                  <TicketPercent className="h-4 w-4" /> {appliedCoupon}
                </span>
                <button
                  onClick={() => { setAppliedCoupon(null); dispatch(setCoupon(null)); }}
                  className="font-mono text-[10px] text-success-700 underline"
                >
                  REMOVE
                </button>
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="ENTER COUPON CODE"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="h-10"
                />
                <Button variant="outline" size="sm" className="h-10 shrink-0" onClick={applyCoupon}>
                  Apply
                </Button>
              </div>
            )}

            <div className="mt-4 space-y-2.5 border-t border-[var(--line)] pt-4 font-mono text-xs tracking-wider">
              <div className="flex justify-between text-[var(--muted)]">
                <span>SUBTOTAL</span><span className="text-foreground">{formatBDT(subtotal)}</span>
              </div>
              {discount > 0 ? (
                <div className="flex justify-between text-success-700">
                  <span>COUPON DISCOUNT</span><span>-{formatBDT(discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-[var(--muted)]">
                <span>SHIPPING</span>
                <span className="text-foreground">{shipping === 0 ? "FREE" : formatBDT(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--line)] pt-3 font-mono text-base font-bold text-primary-800">
                <span>TOTAL</span><span>{formatBDT(total)}</span>
              </div>
            </div>

            <Button size="lg" className="mt-5 w-full" onClick={() => router.push("/checkout")}>
              CHECKOUT <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="mt-3 text-center font-mono text-[10px] tracking-wider text-[var(--muted)]">
              {subtotal >= 499 ? "FREE DELIVERY UNLOCKED" : `ADD ${formatBDT(499 - subtotal)} FOR FREE DELIVERY`}
            </p>
          </Card>

          <Link href="/" className="block text-center font-mono text-xs tracking-widest text-primary-800 hover:text-primary-800">
            ← CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </div>
  );
}
