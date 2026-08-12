import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-primary-700/40 bg-[var(--surface)]/60 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-md border border-primary-700/40 bg-[var(--surface-2)] text-primary-800 shadow-card">
        {icon ?? <Package className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-1 max-w-sm font-mono text-xs tracking-wider text-[var(--muted)]">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
