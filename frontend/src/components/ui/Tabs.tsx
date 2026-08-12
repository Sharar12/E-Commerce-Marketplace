"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto no-scrollbar rounded-md border border-[var(--line)] bg-[var(--surface)] p-1",
        className,
      )}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded px-3.5 py-2 font-mono text-xs tracking-wider transition-all",
            active === t.id
              ? "bg-primary-500/30 text-primary-800 shadow-[inset_0_-2px_0_rgb(240_106_0/0.6)]"
              : "text-[var(--muted)] hover:text-foreground",
          )}
        >
          {t.label.toUpperCase()}
          {t.count != null ? (
            <span
              className={cn(
                "rounded-sm px-1.5 py-0.5 text-[10px] font-bold",
                active === t.id ? "bg-primary-500/30 text-primary-800" : "bg-[var(--surface-2)] text-[var(--muted)]",
              )}
            >
              {t.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
