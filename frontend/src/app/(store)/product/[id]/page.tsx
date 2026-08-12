"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Heart, ShoppingCart, Share2, Truck, ShieldCheck, RefreshCcw, Store, Check, Minus, Plus, ChevronRight,
} from "lucide-react";
import { useGetProductQuery, useGetProductReviewsQuery, useGetSellerQuery, useGetRecommendedProductsQuery } from "@/features/api/api";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductImage } from "@/components/shared/ProductImage";
import { RatingStars } from "@/components/shared/RatingStars";
import { Price } from "@/components/shared/Price";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBDT, cn, discountPercent, timeAgo } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addItem, toggleWishlist, selectWishlist } from "@/features/cart/cartSlice";
import { pushToast } from "@/features/ui/uiSlice";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector(selectWishlist);

  const { data: product, isLoading } = useGetProductQuery(id);
  const { data: reviewsData, isLoading: reviewsLoading } = useGetProductReviewsQuery(id, { skip: !product });
  const { data: sellerData } = useGetSellerQuery(product?.sellerId ?? "", { skip: !product?.sellerId });
  const { data: recs } = useGetRecommendedProductsQuery();

  const [activeImage, setActiveImage] = useState(0);
  const [variant, setVariant] = useState<string | undefined>(product?.variants[0]?.value);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("reviews");
  const [qa, setQa] = useState<{ q: string; a: string }[]>([]);
  const [qaInput, setQaInput] = useState("");

  const reviews = reviewsData?.items ?? [];
  const related = (recs?.items ?? []).filter((p) => p.categoryId === product?.categoryId && p.id !== product?.id).slice(0, 4);

  if (isLoading || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-6 w-72" />
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const wished = wishlist.some((w) => w.productId === product.id);
  const discount = discountPercent(product.price, product.mrp);
  const freeDelivery = product.price >= 499 || product.freeDelivery;

  const askQuestion = () => {
    if (!qaInput.trim()) return;
    setQa([...qa, { q: qaInput.trim(), a: "" }]);
    setQaInput("");
    dispatch(pushToast({ type: "success", title: "Question submitted", message: "Sellers typically reply within 24 hours." }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumbs items={[{ label: product.categoryName, href: `/category/${product.categoryName.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-")}` }, { label: product.name }]} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.1fr_340px]">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface-2)]">
            <ProductImage src={product.images[activeImage]?.url} alt={product.name} className="rounded-lg" sizes="600px" />
            {discount > 0 ? (
              <Badge tone="danger" className="absolute left-4 top-4 border border-danger-600/30 bg-danger-600/20 text-danger-500">-{discount}%</Badge>
            ) : null}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2.5">
            {product.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md border transition-all",
                  activeImage === i ? "border-primary-500 shadow-[0_0_12px_rgb(240_106_0/0.35)]" : "border-[var(--line)] opacity-70 hover:opacity-100",
                )}
              >
                <ProductImage src={img.url} alt={img.alt} sizes="120px" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-[var(--muted)]">{product.brand.toUpperCase()}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{product.name}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <RatingStars rating={product.rating} showValue size={16} />
            <span className="font-mono text-xs text-[var(--muted)]">{product.reviewCount} RATINGS</span>
            <span className="text-[var(--muted)]">·</span>
            <span className="font-mono text-xs text-[var(--muted)]">{formatBDT(product.soldCount, { compact: true })} SOLD</span>
          </div>

          <div className="mt-4 rounded-lg border border-primary-700/35 bg-[var(--surface)] p-5">
            <Price price={product.price} mrp={product.mrp} size="lg" />
            <p className="mt-2 font-mono text-xs tracking-wider text-[var(--muted)]">
              INCLUSIVE OF ALL TAXES · <span className="font-semibold text-success-700">CASH ON DELIVERY AVAILABLE</span>
            </p>
          </div>

          {/* Variants */}
          {product.variants.length > 0 ? (
            <div className="mt-5">
              <p className="font-mono text-xs tracking-wider text-foreground">
                {product.variants[0].name.toUpperCase()}: <span className="text-primary-800">{variant}</span>
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariant(v.value)}
                    className={cn(
                      "rounded-md border px-4 py-2 font-mono text-xs tracking-wider transition-all",
                      variant === v.value
                        ? "border-primary-500/60 bg-primary-500/25 text-primary-800"
                        : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-primary-700/50",
                    )}
                  >
                    {v.value.toUpperCase()}
                    {v.priceDelta > 0 ? <span className="ml-1 text-[10px] text-[var(--muted)]">+{formatBDT(v.priceDelta)}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Highlights */}
          <ul className="mt-5 space-y-2">
            {product.highlights.map((h, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 shrink-0 text-success-700" /> {h}
              </li>
            ))}
          </ul>

          {/* Qty + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-[var(--line)] bg-[var(--surface)]">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-11 w-11 items-center justify-center text-[var(--muted)] hover:text-primary-800" aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-mono font-semibold">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="flex h-11 w-11 items-center justify-center text-[var(--muted)] hover:text-primary-800" aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              size="lg"
              disabled={product.stock <= 0}
              onClick={() => {
                dispatch(addItem({ productId: product.id, quantity: qty, variantLabel: variant }));
                dispatch(pushToast({ type: "success", title: "Added to cart", message: `${product.name} × ${qty}` }));
              }}
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4" /> ADD TO CART
            </Button>
            <Button
              size="icon"
              variant="outline"
              className={cn("h-12 w-12", wished && "border-danger-500/60 text-danger-500")}
              onClick={() => {
                dispatch(toggleWishlist(product.id));
                dispatch(pushToast({ type: wished ? "info" : "success", title: wished ? "Removed from wishlist" : "Added to wishlist" }));
              }}
              aria-label="Toggle wishlist"
            >
              <Heart className={cn("h-5 w-5", wished && "fill-danger-500 text-danger-500")} />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-12 w-12"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                dispatch(pushToast({ type: "info", title: "Link copied" }));
              }}
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-2 font-mono text-[11px] tracking-wider text-[var(--muted)]">
            {product.stock > 20 ? `IN STOCK (${product.stock} UNITS)` : product.stock > 0 ? `ONLY ${product.stock} LEFT!` : "CURRENTLY OUT OF STOCK"}
          </p>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          {/* Delivery estimate */}
          <Card className="p-5">
            <h3 className="font-mono text-xs font-bold tracking-[0.2em] text-primary-800">DELIVERY OPTIONS</h3>
            <div className="mt-3 space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary-800" />
                <div>
                  <p className="text-sm text-foreground">
                    {freeDelivery ? "Free delivery" : "Delivery ৳60"}
                  </p>
                  <p className="font-mono text-[10px] tracking-wider text-[var(--muted)]">ARRIVES IN {product.deliveryEstimateDays[0]}-{product.deliveryEstimateDays[1]} DAYS · ALL DISTRICTS</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success-700" />
                <div>
                  <p className="text-sm text-foreground">ApnarDokan Buyer Protection</p>
                  <p className="font-mono text-[10px] tracking-wider text-[var(--muted)]">FULL REFUND IF NOT AS DESCRIBED</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCcw className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary-800" />
                <div>
                  <p className="text-sm text-foreground">7-day easy returns</p>
                  <p className="font-mono text-[10px] tracking-wider text-[var(--muted)]">FREE RETURN PICKUP ON ELIGIBLE ITEMS</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Seller card */}
          {sellerData ? (
            <Link href={`/seller/${sellerData.id}`} className="block">
              <Card hover className="p-5">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)]">
                    <ProductImage src={sellerData.logo} alt={sellerData.shopName} sizes="48px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{sellerData.shopName}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="bg-primary-500 h-1.5 w-1.5 rounded-[1px]" />
                      <RatingStars rating={sellerData.rating} size={11} count={sellerData.reviewCount} />
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-3 text-center">
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">{sellerData.productCount}</p>
                    <p className="font-mono text-[9px] tracking-widest text-[var(--muted)]">PRODUCTS</p>
                  </div>
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">{sellerData.responseRate}%</p>
                    <p className="font-mono text-[9px] tracking-widest text-[var(--muted)]">RESPONSE</p>
                  </div>
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">{sellerData.avgResponseTime}</p>
                    <p className="font-mono text-[9px] tracking-widest text-[var(--muted)]">REPLY TIME</p>
                  </div>
                </div>
              </Card>
            </Link>
          ) : null}

          <Card className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-success-500/40 bg-success-500/10 text-success-700">
              <Store className="h-5 w-5" />
            </span>
            <p className="font-mono text-[11px] tracking-wider text-[var(--muted)]">
              SELLING ON APNARDOKAN?{" "}
              <Link href="/register?role=seller" className="font-bold text-primary-800 hover:text-primary-800">START SELLING</Link>
            </p>
          </Card>
        </div>
      </div>

      {/* Details + Reviews */}
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs
            tabs={[
              { id: "reviews", label: "Reviews", count: reviews.length },
              { id: "description", label: "Description" },
              { id: "qa", label: "Q&A", count: qa.length },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === "reviews" ? (
            <div className="mt-5 space-y-4">
              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
                </div>
              ) : reviews.length === 0 ? (
                <EmptyState title="No reviews yet" description="Be the first to review this product." />
              ) : (
                reviews.map((r) => (
                  <Card key={r.id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar src={r.customerAvatar} name={r.customerName} size={36} />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{r.customerName}</p>
                          <div className="flex items-center gap-2">
                            <RatingStars rating={r.rating} size={12} />
                            <span className="font-mono text-[10px] text-[var(--muted)]">{timeAgo(r.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      {r.verifiedPurchase ? <Badge tone="success">VERIFIED</Badge> : null}
                    </div>
                    {r.title ? <p className="mt-3 text-sm font-semibold text-foreground">{r.title}</p> : null}
                    <p className="mt-1 text-sm leading-relaxed text-foreground">{r.body}</p>
                    {r.images.length > 0 ? (
                      <div className="mt-3 flex gap-2">
                        {r.images.map((img, i) => (
                          <div key={i} className="relative h-16 w-16 overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)]">
                            <ProductImage src={img} alt="Review photo" sizes="64px" />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {r.sellerResponse ? (
                      <div className="mt-3 rounded-md border border-[var(--line)] bg-[var(--surface-2)]/60 p-3">
                        <p className="font-mono text-[10px] tracking-wider text-[var(--muted)]">RESPONSE FROM SELLER · {timeAgo(r.sellerResponse.createdAt)}</p>
                        <p className="mt-1 text-sm text-foreground">{r.sellerResponse.body}</p>
                      </div>
                    ) : null}
                  </Card>
                ))
              )}
            </div>
          ) : null}

          {activeTab === "description" ? (
            <Card className="mt-5 p-6">
              <p className="text-sm leading-relaxed text-foreground">{product.description}</p>
              <h4 className="mt-5 font-mono text-xs font-bold tracking-[0.2em] text-primary-800">KEY HIGHLIGHTS</h4>
              <ul className="mt-2 space-y-1.5">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-3.5 w-3.5 text-success-700" /> {h}
                  </li>
                ))}
              </ul>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-4 text-sm sm:grid-cols-3">
                {[
                  ["BRAND", product.brand.toUpperCase()],
                  ["CATEGORY", product.categoryName.toUpperCase()],
                  ["SKU", product.sku],
                  ["WARRANTY", "1 YEAR"],
                  ["CONDITION", "BRAND NEW"],
                  ["STOCK", `${product.stock} UNITS`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="font-mono text-[10px] tracking-widest text-[var(--muted)]">{k}</p>
                    <p className="font-mono text-xs font-medium text-foreground">{v}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {activeTab === "qa" ? (
            <Card className="mt-5 p-6">
              <h4 className="font-mono text-xs font-bold tracking-[0.2em] text-primary-800">ASK A QUESTION</h4>
              <div className="mt-3 flex gap-2">
                <input
                  value={qaInput}
                  onChange={(e) => setQaInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                  placeholder="Ask about size, compatibility, warranty…"
                  className="h-11 flex-1 rounded-md border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-foreground placeholder:text-[var(--muted)] focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                <Button onClick={askQuestion}>ASK</Button>
              </div>
              <div className="mt-5 space-y-3">
                {qa.length === 0 ? (
                  <p className="font-mono text-xs tracking-wider text-[var(--muted)]">NO QUESTIONS YET. BE THE FIRST TO ASK!</p>
                ) : (
                  qa.map((item, i) => (
                    <div key={i} className="rounded-md border border-[var(--line)] bg-[var(--surface-2)]/60 p-3">
                      <p className="text-sm font-medium text-foreground">Q: {item.q}</p>
                      {item.a ? (
                        <p className="mt-1 text-sm text-[var(--muted)]">A: {item.a}</p>
                      ) : (
                        <p className="mt-1 font-mono text-[10px] tracking-wider text-primary-800">AWAITING SELLER RESPONSE</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          ) : null}
        </div>

        {/* Frequently bought together */}
        <div>
          <h3 className="font-mono text-xs font-bold tracking-[0.2em] text-primary-800">FREQUENTLY BOUGHT TOGETHER</h3>
          <div className="mt-3 space-y-3">
            {related.slice(0, 3).map((p, i) => (
              <Link key={p.id} href={`/product/${p.id}`} className="block">
                <Card hover className="flex items-center gap-3 p-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)]">
                    <ProductImage src={p.images[0]?.url} alt={p.name} sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    <Price price={p.price} size="sm" />
                  </div>
                  {i < 2 ? <span className="font-mono text-xl text-[var(--muted)]">+</span> : null}
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 ? (
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">Related Products</h2>
            <Link href={`/category/${product.categoryName.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="font-mono text-xs tracking-widest text-primary-800 hover:text-primary-800">
              VIEW ALL
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
