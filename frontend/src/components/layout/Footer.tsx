"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, CreditCard, Smartphone, Banknote, Send, ArrowUpRight } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";
import { useGetCategoriesQuery } from "@/features/api/api";

export function Footer() {
  const { data: cats } = useGetCategoriesQuery();
  const categories = cats?.items ?? [];
  const { success } = useToast();
  const [email, setEmail] = useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      success("Subscribed!", "You're on the list — watch your inbox for deals.");
      setEmail("");
    }
  };

  return (
    <footer className="mt-auto bg-[var(--surface-2)]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Bento tile grid */}
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Newsletter — highlighted large tile */}
          <div className="bento-ink relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl p-6 shadow-hover sm:p-7 lg:col-span-5">
            <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(rgb(198 255 0 / 0.16) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative">
              <p className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.3em] text-primary-500">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500" style={{ animation: "blink-soft 1.4s ease-in-out infinite" }} />
                THE DEAL FEED
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                First dibs on<br />flash sales &amp; coupons.
              </h3>
              <p className="mt-2 max-w-sm text-sm text-white/60">
                One email a week. Member-only prices, restock alerts and ৳500-off codes.
              </p>
            </div>
            <form onSubmit={subscribe} className="relative flex w-full max-w-md gap-2">
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-lg border border-white/15 bg-white/10 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              <button
                type="submit"
                className="flex h-11 items-center gap-1.5 rounded-lg bg-primary-500 px-5 font-mono text-xs font-bold tracking-widest text-ink transition-all hover:-translate-y-px hover:bg-primary-400"
              >
                JOIN <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Brand tile */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-card lg:col-span-3">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 font-display text-lg font-extrabold text-ink transition-transform duration-300 group-hover:scale-110">
                A
              </span>
              <span className="font-display text-base font-bold tracking-tight text-ink">APNARDOKAN</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
              Bangladesh's verified marketplace. 50,000+ products from trusted sellers with fast nationwide delivery.
            </p>
            <div className="mt-4 space-y-2.5 text-xs text-[var(--muted)]">
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary-800" /> LEVEL 8, GULSHAN AVENUE, DHAKA 1212</p>
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-primary-800" /> 09678-123456 (10:00–22:00)</p>
            </div>
          </div>

          {/* Catalog tile */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-card lg:col-span-2">
            <h4 className="font-mono text-xs font-bold tracking-[0.25em] text-primary-800">CATALOG</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}`} className="text-[var(--muted)] transition-colors hover:text-primary-800">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company tile */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-card lg:col-span-2">
            <h4 className="font-mono text-xs font-bold tracking-[0.25em] text-primary-800">COMPANY</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: "About Us", href: "/about" },
                { label: "Contact Us", href: "/contact" },
                { label: "FAQ", href: "/faq" },
                { label: "Return Policy", href: "/returns" },
                { label: "Track Order", href: "/track-order" },
                { label: "Become a Seller", href: "/register?role=seller" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="flex items-center gap-1 text-[var(--muted)] transition-colors hover:text-primary-800">
                    {l.label} <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment + social strip */}
        <div className="mt-4 grid gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-card lg:grid-cols-3">
          <div>
            <h4 className="font-mono text-xs font-bold tracking-[0.25em] text-primary-800">PAYMENT CHANNELS</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 font-mono text-[11px] tracking-wider text-foreground">
                <Smartphone className="h-3.5 w-3.5 text-danger-600" /> BKASH
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 font-mono text-[11px] tracking-wider text-foreground">
                <Smartphone className="h-3.5 w-3.5 text-danger-600" /> NAGAD
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 font-mono text-[11px] tracking-wider text-foreground">
                <CreditCard className="h-3.5 w-3.5 text-info-600" /> CARDS
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 font-mono text-[11px] tracking-wider text-foreground">
                <Banknote className="h-3.5 w-3.5 text-success-600" /> COD
              </span>
            </div>
          </div>
          <p className="flex items-center justify-start text-xs text-[var(--muted)] lg:justify-center lg:text-center">
            All channels encrypted. Buyer protection on every order.
          </p>
          <p className="font-mono text-xs text-[var(--muted)] lg:text-right">
            © {new Date().getFullYear()} APNARDOKAN LTD.
          </p>
        </div>
      </div>
    </footer>
  );
}
