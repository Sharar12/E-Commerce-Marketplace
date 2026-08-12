"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-primary-700/50 hover:text-primary-800 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} className="px-1 text-[var(--muted)]">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "h-9 min-w-9 rounded-md px-2 font-mono text-xs tracking-wider transition-all",
              p === page
                ? "bg-primary-500 text-ink font-bold shadow-[0_0_14px_rgb(240_106_0/0.35)]"
                : "text-[var(--muted)] hover:bg-primary-500/20 hover:text-primary-800",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-primary-700/50 hover:text-primary-800 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
