import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

export function Table({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("w-full overflow-x-auto app-scroll", className)}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]">
        {children}
      </tr>
    </thead>
  );
}

export function Th({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <th className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]", className)}>
      {children}
    </th>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function Tr({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <tr className={cn("transition-colors hover:bg-[var(--surface-2)]", className)}>{children}</tr>
  );
}

export function Td({ className, children, colSpan }: { className?: string; children?: React.ReactNode; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={cn("px-4 py-3.5 align-middle text-[var(--muted)]", className)}>
      {children}
    </td>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function TableEmpty({
  colSpan,
  title,
  description,
  action,
}: {
  colSpan: number;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--line)] text-2xl">📦</div>
          <p className="font-medium text-[var(--muted)]">{title}</p>
          {description ? <p className="text-sm text-[var(--muted)]">{description}</p> : null}
          {action}
        </div>
      </td>
    </tr>
  );
}
