"use client";

import { Check, Circle, PackageCheck } from "lucide-react";
import type { OrderTimelineEvent } from "@/types";
import { cn, formatDateTime } from "@/lib/utils";

export function OrderStatusTimeline({ events }: { events: OrderTimelineEvent[] }) {
  const currentIndex = events.length - 1;
  return (
    <ol className="relative space-y-0">
      {events.map((event, i) => {
        const isLast = i === events.length - 1;
        const done = i <= currentIndex;
        const isCancelled = event.status === "cancelled";
        return (
          <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast ? (
              <span
                className={cn(
                  "absolute left-[13px] top-7 h-[calc(100%-14px)] w-0.5",
                  done ? "bg-success-500 shadow-[0_0_8px_rgb(25_209_98/0.5)]" : "bg-[var(--line)]",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                isCancelled
                  ? "border-danger-500 bg-danger-600/20 text-danger-500"
                  : done
                    ? "border-success-500 bg-success-500/20 text-success-700 shadow-[0_0_10px_rgb(25_209_98/0.35)]"
                    : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)]",
              )}
            >
              {isCancelled ? (
                <Circle className="h-3 w-3" />
              ) : done ? (
                isLast ? (
                  <PackageCheck className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </span>
            <div className="flex flex-col pt-1">
              <p className={cn("font-mono text-xs tracking-wider", isCancelled ? "text-danger-500" : "text-foreground")}>
                {event.label.toUpperCase()}
              </p>
              <p className="font-mono text-[10px] tracking-wider text-[var(--muted)]">{formatDateTime(event.timestamp)}</p>
              {event.note ? <p className="mt-0.5 text-xs text-[var(--muted)]">{event.note}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
