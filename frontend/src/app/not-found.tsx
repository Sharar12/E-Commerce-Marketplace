import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50/60 px-4 text-center">
      <p className="text-7xl font-black tracking-tight text-primary-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Page not found</h1>
      <p className="mt-2 max-w-sm text-[var(--muted)]">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:-translate-y-px hover:bg-primary-700"
        >
          Back to Home
        </Link>
        <Link
          href="/search"
          className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--surface-2)]"
        >
          <Search className="h-4 w-4" /> Search
        </Link>
      </div>
    </div>
  );
}
