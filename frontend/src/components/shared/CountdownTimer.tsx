"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function getRemaining(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

/* Seven-segment geometry: which segments light per digit.
   a=top, b=top-right, c=bottom-right, d=bottom, e=bottom-left, f=top-left, g=middle */
const DIGIT_MAP: Record<string, string[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "g", "e", "d"],
  "3": ["a", "b", "g", "c", "d"],
  "4": ["f", "g", "b", "c"],
  "5": ["a", "f", "g", "c", "d"],
  "6": ["a", "f", "g", "e", "c", "d"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
};

const SEG_STYLES: Record<string, React.CSSProperties> = {
  a: { top: "0", left: "18%", right: "18%", height: "16%" },
  b: { top: "17%", right: "0", width: "16%", height: "33%" },
  c: { top: "50%", right: "0", width: "16%", height: "33%" },
  d: { bottom: "0", left: "18%", right: "18%", height: "16%" },
  e: { bottom: "17%", left: "0", width: "16%", height: "33%" },
  f: { top: "17%", left: "0", width: "16%", height: "33%" },
  g: { top: "42%", left: "18%", right: "18%", height: "16%" },
};

function SevenSeg({ value, compact }: { value: string; compact?: boolean }) {
  const lit = DIGIT_MAP[value] ?? [];
  return (
    <span
      className={cn("relative inline-block aspect-[3/5]", compact ? "w-4" : "w-6 sm:w-8")}
      role="img"
      aria-label={value}
    >
      {Object.entries(SEG_STYLES).map(([key, style]) => {
        const on = lit.includes(key);
        const horizontal = style.width === undefined;
        return (
          <span
            key={key}
            className={cn("absolute transition-colors duration-100", horizontal ? "seg-h" : "seg-v")}
            style={{
              ...style,
              background: on ? "var(--seg-on)" : "var(--seg-off)",
              boxShadow: on ? "0 0 8px var(--seg-on)" : "none",
            }}
          />
        );
      })}
      <style jsx>{`
        .seg-h {
          clip-path: polygon(12% 0, 88% 0, 100% 50%, 88% 100%, 12% 100%, 0 50%);
        }
        .seg-v {
          clip-path: polygon(50% 0, 100% 12%, 100% 88%, 50% 100%, 0 88%, 0 12%);
        }
      `}</style>
    </span>
  );
}

export function CountdownTimer({
  endsAt,
  compact,
  className,
}: {
  endsAt: string;
  compact?: boolean;
  className?: string;
}) {
  const [remaining, setRemaining] = useState(() => getRemaining(endsAt));

  useEffect(() => {
    const t = setInterval(() => setRemaining(getRemaining(endsAt)), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const cells = [
    { label: "HR", value: String(remaining.hours).padStart(2, "0") },
    { label: "MIN", value: String(remaining.minutes).padStart(2, "0") },
    { label: "SEC", value: String(remaining.seconds).padStart(2, "0") },
  ];

  return (
    <div className={cn("flex items-center", className)}>
      {cells.map((c, i) => (
        <span key={c.label} className="flex items-center">
          <span
            className={cn(
              "flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2 py-1.5",
              compact && "px-1.5 py-1",
            )}
          >
            {c.value.split("").map((digit, di) => (
              <span key={`${digit}-${di}`} className={cn(i === 2 && "seven-seg")}>
                <SevenSeg value={digit} compact={compact} />
              </span>
            ))}
            <span className="ml-1 hidden font-mono text-[8px] tracking-widest text-[var(--muted)] sm:block">
              {c.label}
            </span>
          </span>
          {i < 2 ? (
            <span className="mx-1 flex flex-col gap-1 self-center">
              <span className="h-1 w-1 rounded-[1px] bg-[var(--seg-on)]" />
              <span className="h-1 w-1 rounded-[1px] bg-[var(--seg-on)]" />
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
