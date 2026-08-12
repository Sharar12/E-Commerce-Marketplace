import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";

export function StatCard({
  label,
  value,
  icon,
  iconClass,
  trend,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  iconClass?: string;
  trend?: { value: string; positive?: boolean };
  loading?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-24" />
          ) : (
            <p className="mt-1.5 truncate text-2xl font-bold tracking-tight text-foreground">{value}</p>
          )}
          {trend ? (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trend.positive === false ? "text-danger-500" : "text-success-700",
              )}
            >
              {trend.value} <span className="font-normal text-[var(--muted)]">vs last period</span>
            </p>
          ) : null}
        </div>
        {icon ? (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
              iconClass ?? "border border-primary-500/30 bg-primary-500/25 text-primary-800",
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
