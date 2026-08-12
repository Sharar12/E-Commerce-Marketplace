"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface MenuItem {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  divider?: boolean;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
  width = "w-52",
}: {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute top-full z-50 mt-2 overflow-hidden rounded-lg border border-primary-600/25 bg-dark-800 py-1.5 shadow-overlay animate-[fadeIn_0.15s_ease-out]",
            align === "right" ? "right-0" : "left-0",
            width,
          )}
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="my-1.5 border-t border-white/5" />
            ) : item.href ? (
              <Link
                key={i}
                href={item.href}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition-colors",
                  item.danger ? "text-danger-500 hover:bg-danger-600/10" : "text-slate-300 hover:bg-primary-600/10 hover:text-primary-400",
                )}
                onClick={() => setOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <button
                key={i}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition-colors",
                  item.danger ? "text-danger-500 hover:bg-danger-600/10" : "text-slate-300 hover:bg-primary-600/10 hover:text-primary-400",
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
