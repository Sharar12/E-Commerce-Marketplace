"use client";

import { useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { useGetReviewsQuery, useGetProductsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/shared/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { timeAgo } from "@/lib/utils";

export default function SellerReviewsPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const sellerId = user.sellerId ?? "sel-techpoint";
  const { data: reviewsData } = useGetReviewsQuery({ sellerId });
  const { data: productsData } = useGetProductsQuery({ pageSize: 100 });
  const productNames = new Map(
    (productsData?.items ?? []).map((p) => [p.id, p.name] as const),
  );
  const myReviews = reviewsData?.items ?? [];
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [repliedTo, setRepliedTo] = useState<Set<string>>(new Set());
  const { success } = useToast();

  const avg = myReviews.length ? myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length : 0;

  const reply = (id: string) => {
    if (!replies[id]?.trim()) return;
    setRepliedTo(new Set(repliedTo).add(id));
    success("Reply posted", "Your response is now visible to the customer.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reviews & Ratings</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{myReviews.length} reviews · avg {avg.toFixed(1)} ★</p>
        </div>
        <Badge tone="success" className="px-3 py-1.5">{avg.toFixed(1)} / 5 average</Badge>
      </div>

      <div className="space-y-4">
        {myReviews.map((r) => {
          const productName = productNames.get(r.productId) ?? "Product";
          const hasReplied = repliedTo.has(r.id);
          return (
            <Card key={r.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={r.customerAvatar} name={r.customerName} size={36} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.customerName}</p>
                    <div className="flex items-center gap-2">
                      <RatingStars rating={r.rating} size={12} />
                      <span className="text-xs text-[var(--muted)]">{timeAgo(r.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {r.verifiedPurchase ? <Badge tone="success">Verified</Badge> : null}
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">on {productName}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{r.body}</p>

              {r.sellerResponse || hasReplied ? (
                <div className="mt-3 rounded-xl bg-[var(--surface-2)] p-3">
                  <p className="text-xs font-semibold text-foreground">Your response</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {hasReplied ? replies[r.id] : r.sellerResponse?.body}
                  </p>
                </div>
              ) : (
                <div className="mt-3">
                  <input
                    value={replies[r.id] ?? ""}
                    onChange={(e) => setReplies({ ...replies, [r.id]: e.target.value })}
                    placeholder={`Reply to ${r.customerName.split(" ")[0]}…`}
                    className="h-10 w-full rounded-xl border border-[var(--line)] px-3.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-600/10"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" onClick={() => reply(r.id)} disabled={!replies[r.id]?.trim()}>Post Reply</Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
