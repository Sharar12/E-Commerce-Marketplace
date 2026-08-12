"use client";

import { useAppSelector } from "@/lib/hooks";
import { useGetReviewsQuery, useGetProductsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { RatingStars } from "@/components/shared/RatingStars";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function MyReviewsPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const { data: reviewsData } = useGetReviewsQuery();
  const { data: productsData } = useGetProductsQuery({ pageSize: 100 });
  const productNames = new Map(
    (productsData?.items ?? []).map((p) => [p.id, p.name] as const),
  );
  const myReviews = (reviewsData?.items ?? []).filter((r) => r.customerId === user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Reviews</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{myReviews.length} review(s) you've written</p>
      </div>

      {myReviews.length === 0 ? (
        <EmptyState
          title="You haven't reviewed anything yet"
          description="After your orders are delivered, share your experience."
        />
      ) : (
        <div className="space-y-3">
          {myReviews.map((r) => {
            const productName = productNames.get(r.productId) ?? "Product";
            return (
              <Card key={r.id} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {productName}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{formatDate(r.createdAt)}</p>
                  </div>
                  <RatingStars rating={r.rating} size={14} />
                </div>
                {r.title ? <p className="mt-2 text-sm font-medium text-foreground">{r.title}</p> : null}
                <p className="mt-1 text-sm text-[var(--muted)]">{r.body}</p>
                {r.sellerResponse ? (
                  <div className="mt-3 rounded-xl bg-[var(--surface-2)] p-3">
                    <p className="text-xs font-semibold text-foreground">Seller response</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{r.sellerResponse.body}</p>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
