import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  barClass,
}: {
  value: number; // 0-100
  className?: string;
  barClass?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-[var(--line)]", className)}>
      <div
        className={cn("h-full rounded-full bg-primary-500 transition-all duration-500", barClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
