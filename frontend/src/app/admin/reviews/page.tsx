"use client";

import { useState, useEffect } from "react";
import { Flag, Check, X } from "lucide-react";
import { useGetReviewsQuery, useGetProductsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/shared/RatingStars";
import { useToast } from "@/components/ui/Toast";
import { timeAgo } from "@/lib/utils";

export default function AdminReviewsPage() {
  const { success } = useToast();
  const { data: reviewsData } = useGetReviewsQuery();
  const { data: productsData } = useGetProductsQuery({ pageSize: 100 });
  const productNames = new Map(
    (productsData?.items ?? []).map((p) => [p.id, p.name] as const),
  );
  const reviews = reviewsData?.items ?? [];
  const [flagged, setFlagged] = useState<typeof reviews>([]);
  const [removed, setRemoved] = useState<typeof reviews>([]);

  useEffect(() => {
    if (flagged.length === 0 && removed.length === 0) {
      setFlagged(reviews.filter((r) => r.isFlagged));
    }
  }, [reviewsData]);

  const remove = (id: string) => {
    const r = flagged.find((x) => x.id === id)!;
    setFlagged(flagged.filter((x) => x.id !== id));
    setRemoved([r, ...removed]);
    success("Review removed", "The review is no longer visible.");
  };

  const keep = (id: string) => {
    setFlagged(flagged.filter((x) => x.id !== id));
    success("Review kept", "Flag cleared.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reviews Moderation</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{flagged.length} flagged review(s) awaiting review.</p>
      </div>

      {flagged.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-4xl">🧹</p>
          <h2 className="mt-3 text-lg font-bold text-foreground">Queue is clean</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">No flagged reviews at the moment.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {flagged.map((r) => (
            <Card key={r.id} className="border-danger-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={r.customerAvatar} name={r.customerName} size={36} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.customerName}</p>
                    <RatingStars rating={r.rating} size={12} />
                  </div>
                </div>
                <Badge tone="danger"><Flag className="h-3 w-3" /> {r.flagReason ?? "Flagged"}</Badge>
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">on {productNames.get(r.productId) ?? "Product"}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{r.body}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{timeAgo(r.createdAt)} · {r.verifiedPurchase ? "verified purchase" : "unverified"}</p>
              <div className="mt-3 flex justify-end gap-2 border-t border-[var(--line)] pt-3">
                <Button size="sm" variant="outline" onClick={() => keep(r.id)}><Check className="h-4 w-4" /> Keep</Button>
                <Button size="sm" variant="danger" onClick={() => remove(r.id)}><X className="h-4 w-4" /> Remove</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {removed.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="border-b border-[var(--line)] p-5"><h2 className="text-base font-semibold text-foreground">Recently Removed</h2></div>
          <div className="divide-y divide-[var(--line)]">
            {removed.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3.5">
                <p className="flex-1 truncate text-sm text-[var(--muted)]">{r.body}</p>
                <Badge tone="danger">Removed</Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
