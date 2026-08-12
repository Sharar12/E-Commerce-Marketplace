import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 font-mono text-xs tracking-wider text-[var(--muted)]" aria-label="Breadcrumb">
      <Link href="/" className="flex items-center gap-1 transition-colors hover:text-primary-800">
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">HOME</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)]" />
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-primary-800">
              {item.label.toUpperCase()}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label.toUpperCase()}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
