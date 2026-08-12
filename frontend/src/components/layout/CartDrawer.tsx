"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Drawer } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage } from "@/components/shared/ProductImage";
import { Price } from "@/components/shared/Price";
import { formatBDT } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  selectCartItems, selectCartOpen, toggleCart, setQuantity, removeItem,
} from "@/features/cart/cartSlice";
import { useGetProductsQuery } from "@/features/api/api";
import { pushToast } from "@/features/ui/uiSlice";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectCartOpen);
  const items = useAppSelector(selectCartItems);

  const ids = items.map((i) => i.productId);
  const { data } = useGetProductsQuery({ pageSize: 100 }, { skip: ids.length === 0 });
  const allProducts = data?.items ?? [];

  const lineItems = items
    .map((item) => {
      const product = allProducts.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as { productId: string; quantity: number; variantLabel?: string; product: (typeof allProducts)[number] }[];

  const subtotal = lineItems.reduce((s, li) => s + li.product.price * li.quantity, 0);

  return (
    <Drawer open={open} onClose={() => dispatch(toggleCart(false))} title="Your Cart" width="max-w-md">
      {lineItems.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={<ShoppingBag className="h-7 w-7 text-primary-500" />}
            title="Cart empty"
            description="Feed the cart with catalog items."
            action={
              <Button href="/" onClick={() => dispatch(toggleCart(false))}>
                Start Shopping
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="divide-y divide-[var(--line)] px-5">
            {lineItems.map((li) => (
              <div key={li.productId + (li.variantLabel ?? "")} className="flex gap-3 py-4">
                <Link
                  href={`/product/${li.product.id}`}
                  onClick={() => dispatch(toggleCart(false))}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)]"
                >
                  <ProductImage src={li.product.images[0]?.url} alt={li.product.name} sizes="80px" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/product/${li.product.id}`}
                    onClick={() => dispatch(toggleCart(false))}
                    className="truncate text-sm font-medium text-foreground hover:text-primary-800"
                  >
                    {li.product.name}
                  </Link>
                  {li.variantLabel ? <p className="font-mono text-[10px] tracking-wider text-[var(--muted)]">{li.variantLabel.toUpperCase()}</p> : null}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface-2)]">
                      <button
                        onClick={() =>
                          dispatch(
                            setQuantity({
                              productId: li.productId,
                              variantLabel: li.variantLabel,
                              quantity: li.quantity - 1,
                            }),
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center text-[var(--muted)] hover:text-primary-800"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center font-mono text-xs font-semibold">{li.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(
                            setQuantity({
                              productId: li.productId,
                              variantLabel: li.variantLabel,
                              quantity: li.quantity + 1,
                            }),
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center text-[var(--muted)] hover:text-primary-800"
                        aria-label="Increase"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <Price price={li.product.price} size="sm" />
                  </div>
                </div>
                <button
                  onClick={() => {
                    dispatch(removeItem({ productId: li.productId, variantLabel: li.variantLabel }));
                    dispatch(pushToast({ type: "info", title: "Removed from cart" }));
                  }}
                  className="self-start rounded-md p-1.5 text-[var(--muted)] transition-colors hover:bg-danger-500/10 hover:text-danger-600"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--line)] p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs tracking-widest text-[var(--muted)]">SUBTOTAL</span>
              <span className="font-mono text-lg font-bold text-primary-800">{formatBDT(subtotal)}</span>
            </div>
            <p className="mt-1 font-mono text-[10px] tracking-wider text-[var(--muted)]">
              {subtotal >= 499 ? "FREE DELIVERY UNLOCKED" : `ADD ${formatBDT(499 - subtotal)} FOR FREE DELIVERY`}
            </p>
            <Link href="/checkout" onClick={() => dispatch(toggleCart(false))}>
              <Button className={cn("mt-4 w-full")} size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <Link href="/cart" onClick={() => dispatch(toggleCart(false))}>
              <Button variant="ghost" className="mt-2 w-full">
                View Full Cart
              </Button>
            </Link>
          </div>
        </>
      )}
    </Drawer>
  );
}
