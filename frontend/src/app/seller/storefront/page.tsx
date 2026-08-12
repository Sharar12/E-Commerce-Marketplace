"use client";

import Link from "next/link";
import { Store, Eye, Clock, MapPin } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetSellerQuery, useGetProductsQuery } from "@/features/api/api";
import { ProductCard } from "@/components/shared/ProductCard";
import { RatingStars } from "@/components/shared/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StorefrontPreviewPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const sellerId = user.sellerId ?? "sel-techpoint";
  const { data: seller, isLoading } = useGetSellerQuery(sellerId);
  const { data: productsData } = useGetProductsQuery({ sellerId, pageSize: 12 }, { skip: !sellerId });

  if (isLoading || !seller) {
    return <div className="mx-auto max-w-6xl p-8"><Skeleton className="h-48 w-full" /><Skeleton className="mt-6 h-64 w-full" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-primary-200 bg-primary-500/15 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-primary-800">
          <Eye className="h-4 w-4" /> This is how customers see your shop
        </p>
        <Link href={`/seller/${seller.id}`} className="text-sm font-semibold text-primary-800 hover:text-primary-800 underline">
          View live →
        </Link>
      </div>

      <div className="relative h-36 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-dark-800 to-primary-900">
        <img src={seller.coverImage} alt="" className="h-full w-full object-cover opacity-40" />
      </div>

      <div className="relative -mt-10 px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-[var(--surface)] shadow-overlay">
              <img src={seller.logo} alt={seller.shopName} className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">{seller.shopName}<Badge tone="success">Verified</Badge></h1>
              <div className="mt-1 flex items-center gap-3 text-sm text-[var(--muted)]">
                <RatingStars rating={seller.rating} showValue size={13} count={seller.reviewCount} />
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {seller.avgResponseTime}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {seller.address.split(",").pop()}</span>
              </div>
            </div>
          </div>
          <Button variant="outline"><Store className="h-4 w-4" /> Following · {seller.followers.toLocaleString()}</Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {(productsData?.items ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
