import { cn } from "@/lib/utils";

type Tone = "primary" | "dark" | "accent" | "success" | "danger" | "info" | "neutral" | "warning";

const tones: Record<Tone, string> = {
  primary: "bg-primary-500/20 text-primary-800 border-primary-700/40",
  dark: "bg-[var(--surface-2)] text-foreground border-[var(--line-strong)]",
  accent: "bg-primary-500/20 text-primary-800 border-primary-700/40",
  success: "bg-[var(--ok-tint)] text-[var(--ok)] border-[var(--ok)]/30",
  danger: "bg-[var(--err-tint)] text-[var(--err)] border-[var(--err)]/30",
  info: "bg-[var(--info-tint)] text-[var(--info)] border-[var(--info)]/30",
  neutral: "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)]",
  warning: "bg-[var(--warn-tint)] text-[var(--warn)] border-[var(--warn)]/30",
};

export function Badge({
  tone = "neutral",
  className,
  dot,
  children,
}: {
  tone?: Tone;
  className?: string;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-widest",
        tones[tone],
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

/** Map an order status / ticket status to a badge tone */
export function statusTone(status: string): Tone {
  switch (status) {
    case "delivered":
    case "paid":
    case "resolved":
    case "approved":
    case "active":
    case "online":
      return "success";
    case "cancelled":
    case "suspended":
    case "rejected":
    case "denied":
    case "failed":
    case "flagged":
      return "danger";
    case "return_requested":
    case "returned":
    case "refunded":
    case "pending":
    case "processing":
    case "new":
    case "escalated":
      return "warning";
    case "out_for_delivery":
    case "open":
      return "info";
    default:
      return "neutral";
  }
}
