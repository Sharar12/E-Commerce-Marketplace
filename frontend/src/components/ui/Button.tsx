"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "dark" | "accent";
type Size = "xs" | "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-500 text-ink hover:bg-primary-400 active:bg-primary-600 shadow-[0_2px_10px_rgb(13_13_13/0.12)]",
  secondary: "bg-[var(--surface-2)] text-foreground hover:bg-[var(--line)] active:bg-[var(--line-strong)]",
  outline:
    "border border-[var(--line-strong)] bg-transparent text-foreground hover:border-ink hover:bg-ink hover:text-white",
  ghost: "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-foreground",
  danger: "bg-danger-600 text-white hover:bg-danger-500 shadow-[0_2px_10px_rgb(220_38_38/0.25)]",
  dark: "bg-ink text-white hover:bg-ink/85 active:bg-ink",
  accent: "bg-primary-500 text-ink hover:bg-primary-400 shadow-[0_2px_10px_rgb(13_13_13/0.12)]",
};

const sizes: Record<Size, string> = {
  xs: "h-7 px-2.5 text-xs gap-1",
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "h-9 w-9",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, href, disabled, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center rounded-lg font-mono font-semibold tracking-wide transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none",
      "hover:-translate-y-px active:translate-y-0 active:scale-[0.98]",
      variants[variant],
      sizes[size],
      className,
    );

    if (href) {
      return (
        <Link href={href} className={classes} onClick={props.onClick as never}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
