import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  size = 14,
  showValue,
  className,
  count,
}: {
  rating: number;
  size?: number;
  showValue?: boolean;
  count?: number;
  className?: string;
}) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.4;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="flex items-center gap-px" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < full) return <Star key={i} style={{ width: size, height: size }} className="fill-[var(--star)] text-[var(--star)]" />;
          if (i === full && hasHalf)
            return <StarHalf key={i} style={{ width: size, height: size }} className="fill-[var(--star)] text-[var(--star)]" />;
          return <Star key={i} style={{ width: size, height: size }} className="text-[var(--line-strong)]" />;
        })}
      </span>
      {showValue ? <span className="font-mono text-xs font-semibold text-foreground">{rating.toFixed(1)}</span> : null}
      {count != null ? <span className="font-mono text-xs text-[var(--muted)]">({count})</span> : null}
    </span>
  );
}
