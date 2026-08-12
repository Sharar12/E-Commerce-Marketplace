import { cn, formatBDT, discountPercent } from "@/lib/utils";

export function Price({
  price,
  mrp,
  size = "md",
  className,
}: {
  price: number;
  mrp?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };
  const discount = mrp ? discountPercent(price, mrp) : 0;

  return (
    <span className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-mono font-bold tracking-tight text-ink", sizes[size])}>
        {formatBDT(price)}
      </span>
      {mrp && mrp > price ? (
        <>
          <span className={cn("font-mono text-[var(--muted)] line-through", size === "sm" ? "text-xs" : "text-sm")}>
            {formatBDT(mrp)}
          </span>
          <span className="rounded-md border border-danger-600/30 bg-danger-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-danger-700">
            -{discount}%
          </span>
        </>
      ) : null}
    </span>
  );
}
