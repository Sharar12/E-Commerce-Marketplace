"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Zap, Truck, ShieldCheck, RefreshCcw, Headset,
  Store, Star, Flame, BadgePercent,
} from "lucide-react";
import {
  useGetCategoriesQuery,
  useGetFlashSaleProductsQuery,
  useGetRecommendedProductsQuery,
  useGetTopSellingProductsQuery,
  useGetSellersQuery,
  useGetProductsQuery,
} from "@/features/api/api";
import { ProductImage } from "@/components/shared/ProductImage";
import { Price } from "@/components/shared/Price";
import type { Product, Seller } from "@/types";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { Card } from "@/components/ui/Card";
import { RatingStars } from "@/components/shared/RatingStars";
import { cn } from "@/lib/utils";

/* ================================================================== */
/* Interaction primitives                                              */
/* ================================================================== */

/** Respect prefers-reduced-motion for the JS-driven effects */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Magnetic pull — the element leans toward the cursor on hover */
function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(-10, Math.min(10, (e.clientX - (r.left + r.width / 2)) * 0.3));
    const y = Math.max(-10, Math.min(10, (e.clientY - (r.top + r.height / 2)) * 0.3));
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0, 0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("inline-block transition-transform duration-300", className)}
      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      {children}
    </div>
  );
}

/** Staggered fade-up on scroll — each tile delays 50ms after the previous */
function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.classList.add("revealed");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("revealed");
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -48px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);
  return (
    <div ref={ref} className={cn("reveal", className)} style={{ "--rv-delay": `${delay}ms` } as React.CSSProperties}>
      {children}
    </div>
  );
}

/** Animated count-up on view */
function useCountUp(target: number, duration = 1500) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      setVal(target);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration, reduced]);
  return { ref, val };
}

/** 3D tilt + parallax — used on product bento tiles */
function TiltCard({
  children,
  className,
  imgScale = 1.08,
}: {
  children: React.ReactNode;
  className?: string;
  imgScale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch" || reduced) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateY(-4px)`;
    const img = el.querySelector<HTMLElement>("[data-tilt-img]");
    if (img) img.style.transform = `scale(${imgScale}) translate(${-px * 10}px, ${-py * 10}px)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0)";
    const img = el.querySelector<HTMLElement>("[data-tilt-img]");
    if (img) img.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("will-change-transform", className)}
      style={{ transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)", transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

/* ================================================================== */
/* Section header — the heading carries its own weight                */
/* ================================================================== */

function SectionHeading({
  title,
  href,
  linkLabel = "VIEW ALL",
  className,
}: {
  title: string;
  href: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
      <Link href={href} className="group flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--line)] px-3.5 py-2 font-mono text-[11px] font-semibold tracking-widest text-ink transition-colors hover:border-primary-600 hover:bg-primary-500">
        {linkLabel} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

/* ================================================================== */
/* 1 · Hero bento                                                      */
/* ================================================================== */

function HeroBento() {
  const { data: flash } = useGetFlashSaleProductsQuery();
  const flashProducts = flash?.items ?? [];
  const { data: cats } = useGetCategoriesQuery();
  const categories = cats?.items ?? [];
  const { data: top } = useGetTopSellingProductsQuery();
  const topProducts = top?.items ?? [];

  const trending = topProducts[0];
  const heroFlash = flashProducts[0];

  const sellersCount = useCountUp(2400);
  const ordersCount = useCountUp(98);

  const entrance = (i: number) => ({
    animation: `rise-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s both`,
  });

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:pt-12">
        <div className="grid gap-4 lg:grid-cols-4 lg:auto-rows-[minmax(170px,auto)]">
          {/* A — Thesis tile (ink, 2×2) */}
          <div
            className="bento-ink relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-hover sm:p-8 lg:col-span-2 lg:row-span-2"
            style={entrance(0)}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: "radial-gradient(rgb(198 255 0 / 0.14) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
            />
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-500/10 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.3em] text-primary-500">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500" style={{ animation: "blink-soft 1.4s ease-in-out infinite" }} />
                LIVE MARKET // DHAKA
              </span>
              <span className="rounded-md border border-white/15 px-2 py-1 font-mono text-[9px] tracking-widest text-white/60">
                SAME-DAY
              </span>
            </div>

            <div className="relative">
              <h1 className="font-display text-4xl font-extrabold leading-[0.98] tracking-tight text-white sm:text-5xl lg:text-6xl">
                SHOP THE
                <br />
                <span className="text-primary-500">LIVE</span> MARKET.
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/60">
                50,000+ verified products. Same-day delivery in Dhaka. Buyer protection on every order.
              </p>
            </div>

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <Magnetic>
                  <Link
                    href="/search"
                    className="group inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3.5 font-mono text-sm font-bold tracking-widest text-ink shadow-[0_6px_24px_rgb(198_255_0/0.35)] transition-all hover:bg-primary-400"
                  >
                    START SHOPPING <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </Magnetic>
                <Magnetic>
                  <Link
                    href="/flash-sale"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 font-mono text-sm font-semibold tracking-widest text-white transition-colors hover:border-primary-500 hover:text-primary-500"
                  >
                    <Flame className="h-4 w-4" /> FLASH SALE
                  </Link>
                </Magnetic>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { icon: <Truck className="h-3.5 w-3.5" />, label: "Same-day Dhaka" },
                  { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Buyer protection" },
                  { icon: <RefreshCcw className="h-3.5 w-3.5" />, label: "7-day returns" },
                  { icon: <Headset className="h-3.5 w-3.5" />, label: "24/7 support" },
                ].map((t) => (
                  <span key={t.label} className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-white/50">
                    <span className="text-primary-500">{t.icon}</span> {t.label.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* B — Trending product tile */}
          {trending ? (
            <Link
              href={`/product/${trending.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-card spring-lift hover:border-primary-600/60 hover:shadow-hover"
              style={entrance(1)}
            >
              <div className="relative h-32 overflow-hidden bg-[var(--surface-2)] sm:h-36">
                <ProductImage src={trending.images[0]?.url} alt={trending.name} className="transition-transform duration-700 ease-out group-hover:scale-110" />
                <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-ink px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-primary-500">
                  <Flame className="h-3 w-3" /> HOT
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="font-mono text-[9px] tracking-[0.22em] text-[var(--muted)]">{trending.brand.toUpperCase()}</p>
                <h3 className="mt-0.5 line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary-800">
                  {trending.name}
                </h3>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <Price price={trending.price} mrp={trending.mrp} size="sm" />
                  <ArrowUpRight className="h-4 w-4 text-ink opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-primary-800 group-hover:opacity-100" />
                </div>
              </div>
            </Link>
          ) : null}

          {/* C — Live stat counter tile */}
          <div
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-5 shadow-card spring-lift hover:border-primary-600/60 hover:shadow-hover"
            style={entrance(2)}
          >
            <p className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.25em] text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" style={{ animation: "blink-soft 1.4s ease-in-out infinite" }} />
              THE MARKET TODAY
            </p>
            <div>
              <div ref={sellersCount.ref} className="font-display text-3xl font-extrabold tracking-tight text-ink">
                {sellersCount.val.toLocaleString("en-IN")}+
              </div>
              <p className="font-mono text-[10px] tracking-widest text-[var(--muted)]">VERIFIED SELLERS</p>
            </div>
            <div className="flex items-end justify-between border-t border-[var(--line)] pt-3">
              <div>
                <span className="font-display text-xl font-extrabold text-primary-800">{ordersCount.val}%</span>
                <p className="font-mono text-[9px] tracking-widest text-[var(--muted)]">SAME-DAY DHAKA</p>
              </div>
              <span className="rounded-md border border-primary-700/30 bg-primary-500/20 px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-primary-800">
                LIVE
              </span>
            </div>
          </div>

          {/* D — Category quick-links tile */}
          <div
            className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-card spring-lift hover:border-primary-600/60 hover:shadow-hover"
            style={entrance(3)}
          >
            <div className="grid h-full grid-cols-2 gap-2">
              {categories.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="flex flex-col items-start justify-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-primary-600/60 hover:bg-primary-100"
                >
                  <span className="text-base">{emojiFor(c.name)}</span>
                  <span className="text-[11px] font-semibold leading-tight text-foreground">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* E — Flash sale tile (lime) */}
          <Link
            href="/flash-sale"
            className="bento-lime group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-hover spring-lift"
            style={entrance(4)}
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-ink/10 blur-xl" />
            <div className="relative flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.25em] text-ink">
                <Zap className="h-3.5 w-3.5" /> FLASH SALE
              </p>
              <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-primary-500">
                UP TO 70% OFF
              </span>
            </div>
            <div className="relative" style={{ "--seg-on": "#0d0d0d", "--seg-off": "rgb(13 13 13 / 0.15)", "--surface": "rgb(13 13 13 / 0.06)", "--line": "rgb(13 13 13 / 0.15)" } as React.CSSProperties}>
              {heroFlash?.flashSaleEndsAt ? (
                <CountdownTimer endsAt={heroFlash.flashSaleEndsAt} compact />
              ) : (
                <p className="font-mono text-xs font-bold tracking-widest text-ink">DEALS ARE LIVE NOW</p>
              )}
            </div>
            <div className="relative flex items-center gap-1.5 font-mono text-xs font-bold tracking-widest text-ink">
              GRAB DEALS <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Brand marquee                                                       */
/* ================================================================== */

const BRANDS = ["Apple", "Samsung", "Xiaomi", "HP", "Dell", "Levi's", "H&M", "Aarong", "IKEA", "Otobi", "Nike", "Adidas", "Nivea", "Bosch", "MRF", "RENO"];

function BrandMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-[var(--line)] bg-[var(--surface-2)] py-4">
      <div className="ticker-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
            {BRANDS.map((b) => (
              <Link
                key={`${b}-${dup}`}
                href={`/search?q=${encodeURIComponent(b)}`}
                className="mx-3 flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-2 font-display text-sm font-bold tracking-tight text-ink transition-colors hover:border-primary-600 hover:bg-primary-500"
              >
                {b}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/* 2 · Shop by Category — bento tiles with FLIP reflow                 */
/* ================================================================== */

const CATEGORY_FILTERS = ["All", "Trending", "Electronics", "Fashion", "Home & Living", "Beauty & Health"] as const;

function emojiFor(name: string) {
  const map: Record<string, string> = {
    Electronics: "📱",
    Fashion: "👕",
    "Home & Living": "🛋️",
    "Beauty & Health": "✨",
    "Sports & Outdoors": "🏃",
    Grocery: "🛒",
    "Toys & Kids": "🧸",
    Automotive: "🚗",
  };
  return map[name] ?? "🛍️";
}

function CategoryBento() {
  const { data } = useGetCategoriesQuery();
  const categories = (data?.items ?? []).slice().sort((a, b) => b.productCount - a.productCount);
  const [filter, setFilter] = useState<(typeof CATEGORY_FILTERS)[number]>("All");
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const firstPositions = useRef<Map<string, DOMRect> | null>(null);
  const reduced = useReducedMotion();

  const shown =
    filter === "All"
      ? categories
      : filter === "Trending"
        ? categories.slice(0, 4)
        : categories.filter((c) => c.name === filter);

  const handleFilter = (f: (typeof CATEGORY_FILTERS)[number]) => {
    if (f === filter) return;
    firstPositions.current = new Map();
    categories.forEach((c) => {
      const el = refs.current[c.id];
      if (el) firstPositions.current?.set(c.id, el.getBoundingClientRect());
    });
    setFilter(f);
  };

  /* FLIP — measure, invert, play */
  useLayoutEffect(() => {
    const first = firstPositions.current;
    firstPositions.current = null;
    if (!first) return;
    if (reduced) return; // reduced motion: reflow instantly, no FLIP

    const moved: { el: HTMLDivElement; dx: number; dy: number }[] = [];
    const entering: HTMLDivElement[] = [];
    shown.forEach((c) => {
      const el = refs.current[c.id];
      if (!el) return;
      const f = first.get(c.id);
      if (!f) {
        entering.push(el);
        return;
      }
      const last = el.getBoundingClientRect();
      const dx = f.left - last.left;
      const dy = f.top - last.top;
      if (dx || dy) moved.push({ el, dx, dy });
    });

    moved.forEach(({ el, dx, dy }) => {
      el.style.transition = "none";
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    requestAnimationFrame(() => {
      moved.forEach(({ el }) => {
        el.style.transition = "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)";
        el.style.transform = "";
      });
    });
    entering.forEach((el) => {
      el.style.animation = "rise-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both";
    });
  }, [shown]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Shop by <span className="text-primary-800">category</span>
          </h2>
          <p className="mt-1.5 text-sm text-[var(--muted)]">Bigger tile, hotter trend. Tiles reflow as you filter.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={cn(
                "rounded-lg border px-3.5 py-2 font-mono text-[11px] font-semibold tracking-wider transition-all",
                filter === f
                  ? "border-ink bg-ink text-primary-500 shadow-card"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-primary-600 hover:text-primary-800",
              )}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {shown.map((c, i) => {
          const featured = i === 0 && filter === "All";
          return (
            <div
              key={c.id}
              ref={(el) => { refs.current[c.id] = el; }}
              className={cn(featured ? "col-span-2 row-span-2" : "")}
            >
              <Link
                href={`/category/${c.slug}`}
                className={cn(
                  "group relative flex h-full min-h-36 flex-col justify-between overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-card spring-lift hover:border-primary-600/60 hover:shadow-hover",
                  featured && "min-h-72 p-5",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-cover bg-center opacity-25 transition-all duration-700 group-hover:scale-105 group-hover:opacity-40",
                    featured && "opacity-60 group-hover:opacity-80",
                  )}
                  style={{ backgroundImage: `url(${c.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
                <span
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-xl shadow-sm transition-transform duration-300 group-hover:scale-110",
                    featured && "h-12 w-12 text-2xl",
                  )}
                >
                  {emojiFor(c.name)}
                </span>
                <div className="relative">
                  <h3 className={cn("font-display text-sm font-bold tracking-tight text-ink", featured && "text-xl")}>
                    {c.name}
                  </h3>
                  <p className="mt-1 font-mono text-[9px] tracking-widest text-[var(--muted)]">
                    {c.productCount} ITEMS
                  </p>
                  <span className={cn(
                    "mt-2 inline-flex items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 font-mono text-[9px] font-bold tracking-widest text-primary-500 opacity-0 transition-all duration-300 group-hover:opacity-100",
                    featured && "opacity-100",
                  )}>
                    SHOP NOW <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ================================================================== */
/* 3 · Product bento grid — mixed 1×1 / 2×1 / 1×2, tilt + price pop    */
/* ================================================================== */

const PRODUCT_SPANS = ["lg:col-span-2", "", "", "lg:row-span-2", "", "lg:col-span-2", "", ""];

function ProductBento() {
  const { data, isLoading } = useGetRecommendedProductsQuery();
  const products = data?.items ?? [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeading title="Trending products" href="/search" linkLabel="BROWSE ALL" />
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:auto-rows-[minmax(230px,auto)] lg:grid-flow-dense">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={cn("aspect-[3/4] animate-pulse rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]", PRODUCT_SPANS[i])} />
            ))
          : products.slice(0, 8).map((p, i) => {
              const tall = PRODUCT_SPANS[i] === "lg:row-span-2";
              return (
                <Reveal key={p.id} delay={(i % 4) * 50} className={cn(PRODUCT_SPANS[i], i < 4 && "col-span-1")}>
                  <TiltCard className="h-full">
                    <Link
                      href={`/product/${p.id}`}
                      className={cn(
                        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-card transition-colors duration-300 hover:border-primary-600/60 hover:shadow-hover",
                        !tall && "spring-lift",
                      )}
                    >
                      <div className={cn("relative overflow-hidden bg-[var(--surface-2)]", tall ? "aspect-[3/4]" : "aspect-[16/11]")}>
                        <div data-tilt-img className="h-full w-full">
                          <ProductImage src={p.images[0]?.url} alt={p.name} className="transition-transform duration-700 ease-out group-hover:scale-110" />
                        </div>
                        <span className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-primary-500/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[radar-sweep_0.9s_ease-in-out]" />
                        {p.isFlashSale ? (
                          <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-ink px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-primary-500">
                            <Zap className="h-3 w-3" /> FLASH
                          </span>
                        ) : null}
                      </div>
                      <div className={cn("flex flex-1 flex-col p-4", tall && "p-5")}>
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-[9px] tracking-[0.22em] text-[var(--muted)]">{p.brand.toUpperCase()}</p>
                          <span className="font-mono text-[9px] tracking-widest text-[var(--muted)]">{p.soldCount.toLocaleString("en-IN")} SOLD</span>
                        </div>
                        <h3 className={cn("mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary-800", tall && "text-base")}>
                          {p.name}
                        </h3>
                        {tall ? <p className="mt-1.5 line-clamp-2 text-xs text-[var(--muted)]">{p.description}</p> : null}
                        <div className="mt-1.5">
                          <RatingStars rating={p.rating} size={11} count={p.reviewCount} />
                        </div>
                        <div className="mt-auto flex items-end justify-between pt-3">
                          <Price
                            price={p.price}
                            mrp={p.mrp}
                            size={tall ? "lg" : "md"}
                            className="group-hover:animate-[price-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)]"
                          />
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-ink opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:animate-[price-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </Reveal>
              );
            })}
      </div>
    </section>
  );
}

/* ================================================================== */
/* 4 · Flash sale module — pulses / glows as time runs low             */
/* ================================================================== */

function FlashBento() {
  const { data, isLoading } = useGetFlashSaleProductsQuery();
  const products = data?.items ?? [];
  const [low, setLow] = useState(false);

  const endsAt = products[0]?.flashSaleEndsAt;

  /* Glow when the window runs low — demo mocks end 1–3 days out, so the
     threshold is tuned (~36h) to keep the interaction observable while
     still meaning "low time". */
  useEffect(() => {
    if (!endsAt) return;
    const check = () => setLow(new Date(endsAt).getTime() - Date.now() < 36 * 3600000);
    check();
    const t = setInterval(check, 15000);
    return () => clearInterval(t);
  }, [endsAt]);

  if (products.length === 0 && !isLoading) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-ink text-white shadow-hover transition-shadow",
          low && "glow-low",
        )}
      >
        <div className="bento-stripe absolute inset-x-0 top-0 h-1.5 w-full" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(rgb(198 255 0 / 0.12) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />

        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_1.5fr] lg:items-center">
          {/* Left — headline + live countdown */}
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.3em] text-primary-500">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" style={{ animation: "blink-soft 1s ease-in-out infinite" }} />
              {low ? "ENDING SOON" : "FLASH SALE"}
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              UP TO <span className="text-primary-500">70% OFF</span>
            </h2>
            <p className="mt-2 max-w-sm text-sm text-white/60">
              Hand-picked drops at knife-edge prices. When it's gone, it's gone.
            </p>
            <div className="mt-5" style={{ "--seg-on": "#c6ff00", "--seg-off": "rgb(198 255 0 / 0.16)", "--surface": "rgb(255 255 255 / 0.06)", "--line": "rgb(255 255 255 / 0.14)", "--muted": "#a8a8ad" } as React.CSSProperties}>
              {endsAt ? <CountdownTimer endsAt={endsAt} /> : null}
            </div>
            <Magnetic className="mt-6">
              <Link
                href="/flash-sale"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3.5 font-mono text-sm font-bold tracking-widest text-ink shadow-[0_6px_24px_rgb(198_255_0/0.3)] transition-all hover:bg-primary-400"
              >
                <Zap className="h-4 w-4" /> CLAIM A DEAL
              </Link>
            </Magnetic>
          </div>

          {/* Right — flash product tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-white/10" />)
              : products.slice(0, 4).map((p, i) => (
                  <Reveal key={p.id} delay={i * 50}>
                    <Link
                      href={`/product/${p.id}`}
                      className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/50 hover:bg-white/10"
                    >
                      <div className="relative aspect-square overflow-hidden bg-white/10">
                        <ProductImage src={p.images[0]?.url} alt={p.name} className="transition-transform duration-700 ease-out group-hover:scale-110" />
                        <span className="absolute left-2 top-2 rounded-md bg-danger-600 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                          -{Math.round(((p.mrp - p.price) / p.mrp) * 100)}%
                        </span>
                      </div>
                      <div className="p-2.5">
                        <p className="truncate text-[11px] font-medium text-white/90">{p.name}</p>
                        <p className="mt-0.5 font-mono text-xs font-bold text-primary-500">
                          {p.price.toLocaleString("en-IN")} <span className="text-[9px] text-white/40 line-through">{p.mrp.toLocaleString("en-IN")}</span>
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* 5 · Vendor highlight — auto-rotating carousel inside each card      */
/* ================================================================== */

function VendorTile({ seller, products, index }: { seller: Seller; products: Product[]; index: number }) {
  const images = products.length > 0 ? Array.from(new Set(products.flatMap((p) => p.images.map((i) => i.url)))).slice(0, 4) : [];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % count), 3000);
    return () => clearInterval(t);
  }, [count, paused]);

  const firstProduct = products[0];

  return (
    <Reveal delay={index * 60}>
      <Link
        href={`/seller/${seller.id}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="group block overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-600/60 hover:shadow-hover"
      >
        {/* Rotating cover */}
        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--surface-2)]">
          {count > 0 ? (
            images.map((url, i) => (
              <ProductImage
                key={url}
                src={url}
                alt={`${seller.shopName} product ${i + 1}`}
                className={cn(
                  "absolute inset-0 transition-all duration-700 ease-out",
                  i === active ? "scale-105 opacity-100" : "scale-100 opacity-0",
                )}
              />
            ))
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--surface-2)]">
              <Store className="h-10 w-10 text-[var(--muted)]" />
            </div>
          )}
          {/* Carousel progress */}
          {count > 1 ? (
            <div className="absolute inset-x-3 bottom-3 flex gap-1">
              {images.map((_, i) => (
                <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                  <span
                    className={cn("block h-full rounded-full bg-primary-500", paused && i === active && "w-full")}
                    style={i === active && !paused ? { animation: `flash-progress 3s linear infinite` } : { width: i === active ? "100%" : "0%" }}
                  />
                </span>
              ))}
            </div>
          ) : null}
          <span className="absolute right-3 top-3 rounded-md bg-ink/80 px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-primary-500 backdrop-blur">
            SHOP
          </span>
        </div>

        {/* Shop identity */}
        <div className="flex items-center gap-3 p-4">
          <span className="relative shrink-0">
            <img
              src={seller.logo}
              alt={seller.shopName}
              className="h-11 w-11 rounded-xl border border-[var(--line)] object-cover"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-success-500" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary-800">{seller.shopName}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <RatingStars rating={seller.rating} size={11} count={seller.reviewCount} />
              <span className="font-mono text-[9px] tracking-widest text-[var(--muted)]">{seller.followers.toLocaleString("en-IN")} FOLLOWERS</span>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-ink opacity-0 transition-all group-hover:text-primary-800 group-hover:opacity-100" />
        </div>

        {firstProduct ? (
          <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-2.5">
            <span className="truncate font-mono text-[10px] tracking-wider text-[var(--muted)]">
              FROM <span className="font-bold text-ink">{firstProduct.price.toLocaleString("en-IN")} ৳</span>
            </span>
            <span className="flex items-center gap-1 font-mono text-[9px] tracking-widest text-primary-800">
              <Star className="h-3 w-3" /> {seller.rating.toFixed(1)}
            </span>
          </div>
        ) : null}
      </Link>
    </Reveal>
  );
}

function VendorBento() {
  const { data: sellers } = useGetSellersQuery();
  const { data: products } = useGetProductsQuery({ pageSize: 100 });
  const allProducts = products?.items ?? [];
  const sellersList = sellers?.items ?? [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeading title="Trusted shops" href="/search" linkLabel="ALL SELLERS" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sellersList.slice(0, 3).map((s, i) => (
          <VendorTile key={s.id} seller={s} products={allProducts.filter((p) => p.sellerId === s.id)} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/* Closing — trust tiles + sell-with-us tile                           */
/* ================================================================== */

function ClosingBento() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16">
      <div className="grid gap-4 lg:grid-cols-4">
        {[
          {
            icon: <ShieldCheck className="h-5 w-5" />,
            name: "Nadia Islam",
            city: "DHAKA",
            quote: "Ordered a phone at midnight, it arrived the next morning — packaging perfect, price beat every store in the city.",
          },
          {
            icon: <Store className="h-5 w-5" />,
            name: "Rubel Sheikh",
            city: "CHATTOGRAM",
            quote: "As a first-time seller, onboarding was smooth and payouts arrive like clockwork every week.",
          },
          {
            icon: <RefreshCcw className="h-5 w-5" />,
            name: "Sharmin Lucky",
            city: "SYLHET",
            quote: "Support resolved my return in under a day. This is how e-commerce should work in Bangladesh.",
          },
        ].map((t, i) => (
          <Reveal key={t.name} delay={i * 60}>
            <Card className="relative flex h-full flex-col p-6" hover>
              <span className="absolute right-4 top-4 font-mono text-[9px] tracking-widest text-[var(--muted)]">RX-{String(i + 1).padStart(3, "0")}</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-primary-800">
                {t.icon}
              </span>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3 border-t border-[var(--line)] pt-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink font-display text-xs font-bold text-primary-500">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="font-mono text-[9px] tracking-widest text-[var(--muted)]">{t.city}</p>
                </div>
              </div>
            </Card>
          </Reveal>
        ))}

        {/* Sell-with-us lime tile */}
        <Reveal delay={180}>
          <Link
            href="/register?role=seller"
            className="bento-lime group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-hover spring-lift"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ink/10 blur-2xl" />
            <div className="relative">
              <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.25em] text-ink">
                <BadgePercent className="h-3.5 w-3.5" /> FOR SELLERS
              </p>
              <h3 className="mt-3 font-display text-xl font-extrabold leading-tight tracking-tight text-ink">
                Your shop.
                <br />Our market.
              </h3>
              <p className="mt-2 text-xs font-medium leading-relaxed text-ink/70">
                Weekly payouts, seller tools, 2.4M+ monthly visitors.
              </p>
            </div>
            <div className="relative flex items-center gap-1.5 font-mono text-xs font-bold tracking-widest text-ink">
              OPEN A SHOP <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */

export default function HomePage() {
  return (
    <div>
      <HeroBento />
      <BrandMarquee />
      <CategoryBento />
      <ProductBento />
      <FlashBento />
      <VendorBento />
      <ClosingBento />
    </div>
  );
}
