"use client";

import { useParams } from "next/navigation";
import { Store, MapPin, Clock, ShieldCheck, MessageCircle } from "lucide-react";
import { useGetSellerQuery, useGetProductsQuery } from "@/features/api/api";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { RatingStars } from "@/components/shared/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SellerStorefrontPage() {
  const { id } = useParams<{ id: string }>();
  const { data: seller, isLoading } = useGetSellerQuery(id);
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery(
    { sellerId: id, pageSize: 20 },
    { skip: !seller },
  );

  if (isLoading || !seller) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  return (
    <div>
      {/* Cover */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-r from-slate-900 via-dark-800 to-primary-900 sm:h-52">
        <img src={seller.coverImage} alt="" className="h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="relative -mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
              <img src={seller.logo} alt={seller.shopName} className="h-full w-full object-cover" />
            </div>
            <div className="pb-1">
              <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {seller.shopName}
                {seller.status === "active" ? <Badge tone="success">Verified</Badge> : null}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                <RatingStars rating={seller.rating} showValue size={14} count={seller.reviewCount} />
                <span>{seller.followers.toLocaleString()} followers</span>
                <span>{seller.productCount} products</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pb-1">
            <Button variant="outline" className="flex-1 sm:flex-none">
              <MessageCircle className="h-4 w-4" /> Contact Seller
            </Button>
            <Button className="flex-1 sm:flex-none">Follow</Button>
          </div>
        </div>

        {/* Info strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: <Clock className="h-4.5 w-4.5" />, label: "Response time", value: seller.avgResponseTime },
            { icon: <Store className="h-4.5 w-4.5" />, label: "Response rate", value: `${seller.responseRate}%` },
            { icon: <MapPin className="h-4.5 w-4.5" />, label: "Location", value: seller.address.split(",").pop()?.trim() ?? "Bangladesh" },
            { icon: <ShieldCheck className="h-4.5 w-4.5" />, label: "Member since", value: new Date(seller.joinedAt).getFullYear().toString() },
          ].map((f, i) => (
            <Card key={i} className="flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary-500/30 bg-primary-500/25 text-primary-800">{f.icon}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{f.value}</p>
                <p className="text-xs text-[var(--muted)]">{f.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Bio */}
        <Card className="mt-4 p-5">
          <p className="text-sm leading-relaxed text-[var(--muted)]">{seller.bio}</p>
        </Card>

        {/* Products */}
        <div className="mt-8 pb-12">
          <h2 className="text-lg font-bold text-foreground">All Products</h2>
          {productsLoading ? (
            <div className="mt-4"><ProductGridSkeleton count={4} /></div>
          ) : (productsData?.items ?? []).length === 0 ? (
            <div className="mt-4"><EmptyState title="No products yet" description="This seller hasn't listed any products." /></div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {(productsData?.items ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
