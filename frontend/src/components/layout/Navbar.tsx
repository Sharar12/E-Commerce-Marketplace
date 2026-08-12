"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart, Menu, Search, ShoppingCart, Store, ChevronDown, LogOut, LayoutDashboard,
  Package, Ticket, Truck, Headphones, ShieldCheck, Zap, ArrowUpRight, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCategoriesQuery, useGetSearchSuggestionsQuery } from "@/features/api/api";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectCartItems, selectWishlist, toggleCart } from "@/features/cart/cartSlice";
import { logout } from "@/features/auth/authSlice";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { ProductImage } from "@/components/shared/ProductImage";
import { formatBDT } from "@/lib/utils";

const roleHome: Record<string, string> = {
  customer: "/account",
  seller: "/seller",
  delivery: "/delivery",
  support: "/support",
  admin: "/admin",
};

const roleIcon: Record<string, React.ReactNode> = {
  customer: <LayoutDashboard className="h-4 w-4" />,
  seller: <Store className="h-4 w-4" />,
  delivery: <Truck className="h-4 w-4" />,
  support: <Headphones className="h-4 w-4" />,
  admin: <ShieldCheck className="h-4 w-4" />,
};

const NAV_LINKS = [
  { label: "Shop", href: "/search" },
  { label: "Flash Sale", href: "/flash-sale" },
  { label: "Track Order", href: "/track-order" },
  { label: "Become a Seller", href: "/register?role=seller" },
];

const TICKER_ITEMS = [
  "FREE DELIVERY OVER ৳499",
  "SAME-DAY DELIVERY IN DHAKA",
  "7-DAY EASY RETURNS",
  "VERIFIED SELLERS ONLY",
  "BUYER PROTECTION ON EVERY ORDER",
  "WEEKLY SELLER PAYOUTS",
];

const CATEGORY_EMOJI: Record<string, string> = {
  Electronics: "📱",
  Fashion: "👕",
  "Home & Living": "🛋️",
  "Beauty & Health": "✨",
  "Sports & Outdoors": "🏃",
  Grocery: "🛒",
  "Toys & Kids": "🧸",
  Automotive: "🚗",
};

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const wishlist = useAppSelector(selectWishlist);
  const user = useAppSelector((s) => s.auth.user);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const { data: cats } = useGetCategoriesQuery();
  const categories = cats?.items ?? [];

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [megaOpen, setMegaOpen] = useState(false);

  const { data: suggestions } = useGetSearchSuggestionsQuery(query, { skip: query.trim().length < 2 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setSearchFocused(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  /* Morphing underline — slides between active links with spring ease */
  const navTrackRef = useRef<HTMLDivElement>(null);
  const [activeBar, setActiveBar] = useState<{ left: number; width: number } | null>(null);

  const activeNav = NAV_LINKS.find((l) => {
    const href = l.href.split("?")[0];
    return href === "/search" ? pathname.startsWith("/search") || pathname.startsWith("/category") || pathname.startsWith("/product") : pathname.startsWith(href);
  });
  const activeHref = activeNav?.href ?? null;

  useLayoutEffect(() => {
    const track = navTrackRef.current;
    if (!track) return;
    if (!activeHref) {
      setActiveBar(null);
      return;
    }
    const el = track.querySelector<HTMLAnchorElement>(`[data-nav="${activeHref}"]`);
    if (el) {
      const t = track.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setActiveBar({ left: r.left - t.left, width: r.width });
    }
  }, [activeHref, pathname]);

  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50">
      {/* Marquee ticker */}
      <div className="relative overflow-hidden bg-ink text-primary-500">
        <div className="ticker-track py-1.5">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {TICKER_ITEMS.map((item) => (
                <span key={item} className="flex items-center gap-3 pr-8 font-mono text-[11px] font-medium tracking-[0.18em]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" style={{ animation: "blink-soft 1.4s ease-in-out infinite" }} />
                  <span className="uppercase">{item}</span>
                  <span className="text-primary-400/60" aria-hidden="true">{"//"}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <nav
        className={cn(
          "border-b border-[var(--line)] transition-all duration-300",
          scrolled ? "bg-white/90 shadow-card backdrop-blur-md" : "bg-white",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-5">
          {/* Mobile menu */}
          <button
            className="rounded-lg border border-[var(--line)] p-2 text-foreground hover:border-primary-600 hover:text-primary-800 lg:hidden"
            onClick={() => setMobileMenu((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo — mark shape-shifts on load */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span
              className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-primary-500 text-ink shadow-[0_2px_10px_rgb(198_255_0/0.5)]"
              style={{ animation: "logo-morph 1.3s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
            >
              <span className="font-display text-lg font-extrabold">A</span>
              <span className="absolute inset-0 bg-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-primary-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                A
              </span>
            </span>
            <span className="hidden sm:block">
              <span className="block font-display text-base font-bold leading-none tracking-tight text-ink">
                APNARDOKAN
              </span>
              <span className="mt-0.5 block font-mono text-[9px] tracking-[0.3em] text-primary-800">
                MARKETPLACE
              </span>
            </span>
          </Link>

          {/* Desktop nav — morphing underline */}
          <div ref={navTrackRef} className="relative hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => {
              const active = activeNav?.href === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  data-nav={l.href}
                  className={cn(
                    "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active ? "text-ink" : "text-[var(--muted)] hover:text-ink",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            {/* Sliding active underline — transform-only morph */}
            {activeBar ? (
              <span
                className="pointer-events-none absolute -bottom-0.5 left-0 h-[3px] w-px rounded-full bg-primary-500 shadow-[0_0_8px_rgb(198_255_0/0.8)]"
                style={{
                  transform: `translateX(${activeBar.left}px) scaleX(${activeBar.width})`,
                  transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              />
            ) : null}
          </div>

          {/* Search */}
          <div ref={searchRef} className="relative hidden flex-1 max-w-xl md:block">
            <form onSubmit={submitSearch}>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search products, brands, categories…"
                  className="h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--surface-2)] pl-10 pr-4 text-sm text-foreground placeholder:text-[var(--muted)] transition-all focus:border-primary-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            </form>
            {searchFocused && query.trim().length >= 2 && suggestions?.items?.length ? (
              <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-overlay">
                <p className="border-b border-[var(--line)] px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-[var(--muted)]">
                  RESULTS // {suggestions.items.length}
                </p>
                {suggestions.items.slice(0, 6).map((s: { id: string; name: string; price: number; image: string; brand: string }) => (
                  <Link
                    key={s.id}
                    href={`/product/${s.id}`}
                    onClick={() => setSearchFocused(false)}
                    className="flex items-center gap-3 border-b border-[var(--line)] p-2.5 transition-colors last:border-0 hover:bg-primary-100"
                  >
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface-2)]">
                      <ProductImage src={s.image} alt={s.name} sizes="40px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{s.name}</p>
                      <p className="font-mono text-[10px] tracking-wider text-[var(--muted)]">{s.brand.toUpperCase()}</p>
                    </div>
                    <p className="font-mono text-sm font-bold text-ink">{formatBDT(s.price)}</p>
                  </Link>
                ))}
                <button
                  onClick={submitSearch}
                  className="mt-0.5 flex w-full items-center justify-center gap-1.5 bg-primary-500 py-2.5 text-center font-mono text-xs font-bold tracking-widest text-ink transition-colors hover:bg-primary-400"
                >
                  SEE ALL RESULTS FOR “{query}” <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {/* Mobile search */}
            <Link href="/search" className="rounded-lg p-2 text-foreground hover:text-primary-800 md:hidden" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>

            {/* Wishlist */}
            <Link
              href={user ? "/account/wishlist" : "/wishlist"}
              className="relative rounded-lg border border-[var(--line)] p-2 text-foreground transition-colors hover:border-primary-600 hover:text-primary-800"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-ink px-1 font-mono text-[10px] font-bold text-primary-500">
                  {wishlist.length}
                </span>
              ) : null}
            </Link>

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart(true))}
              className="relative rounded-lg border border-[var(--line)] p-2 text-foreground transition-colors hover:border-primary-600 hover:text-primary-800"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary-500 px-1 font-mono text-[10px] font-bold text-ink">
                  {cartCount}
                </span>
              ) : null}
            </button>

            {/* Auth area */}
            {user ? (
              <Dropdown
                trigger={
                  <button className="flex items-center gap-2 rounded-lg border border-[var(--line)] p-1.5 transition-colors hover:border-primary-600">
                    <Avatar src={user.avatar} name={user.name} size={30} />
                    <ChevronDown className="hidden h-4 w-4 text-[var(--muted)] sm:block" />
                  </button>
                }
                items={[
                  { label: "Dashboard", icon: roleIcon[user.role], href: roleHome[user.role] },
                  ...(user.role === "customer"
                    ? [
                        { label: "My Orders", icon: <Package className="h-4 w-4" />, href: "/account/orders" },
                        { label: "Support Tickets", icon: <Ticket className="h-4 w-4" />, href: "/account/tickets" },
                      ]
                    : []),
                  { divider: true },
                  { label: `Sign out (${user.name.split(" ")[0]})`, icon: <LogOut className="h-4 w-4" />, onClick: handleLogout, danger: true },
                ]}
              />
            ) : (
              <div className="hidden items-center gap-1.5 lg:flex">
                <Link
                  href="/login"
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-ink"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-primary-500 transition-all hover:-translate-y-px hover:bg-ink/85 hover:shadow-card"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Category rail */}
        <div className="hidden border-t border-[var(--line)] lg:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-mono text-xs font-semibold tracking-widest text-foreground transition-colors hover:bg-[var(--surface-2)] hover:text-primary-800">
                <Menu className="h-4 w-4" /> CATEGORIES <ChevronDown className="h-3.5 w-3.5 text-[var(--muted)]" />
              </button>
              {megaOpen && (
                <div className="absolute left-0 top-full z-50 w-[560px] overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-overlay">
                  <p className="border-b border-[var(--line)] px-4 py-2 font-mono text-[10px] tracking-[0.25em] text-[var(--muted)]">
                    ALL CATEGORIES // {categories.length}
                  </p>
                  <div className="grid grid-cols-2 gap-0.5 p-1.5">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/category/${c.slug}`}
                        className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-primary-100"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-sm">
                          {CATEGORY_EMOJI[c.name] ?? "🛍️"}
                        </span>
                        <span>
                          <span className="block text-sm font-medium text-foreground">{c.name}</span>
                          <span className="block font-mono text-[10px] tracking-wider text-[var(--muted)]">
                            {c.productCount} ITEMS
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-[var(--line)] p-2">
                    <Link href="/flash-sale" className="flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-2.5 font-mono text-xs font-bold tracking-widest text-ink transition-colors hover:bg-primary-400">
                      <Zap className="h-3.5 w-3.5" /> FLASH SALE — UP TO 70% OFF
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center overflow-x-auto no-scrollbar">
              {categories.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="whitespace-nowrap rounded-lg px-3 py-2.5 font-mono text-[11px] tracking-wider text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-primary-800"
                >
                  {c.name.toUpperCase()}
                </Link>
              ))}
              <Link
                href="/flash-sale"
                className="ml-1 flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-ink px-3 py-2.5 font-mono text-[11px] font-bold tracking-widest text-primary-500 transition-colors hover:bg-ink/85"
              >
                <Zap className="h-3.5 w-3.5" /> FLASH
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-[var(--muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500" style={{ animation: "blink-soft 1.4s ease-in-out infinite" }} />
                MARKET LIVE
              </span>
              {!isHome ? (
                <Link href="/" className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-foreground transition-colors hover:text-primary-800">
                  <Sparkles className="h-3.5 w-3.5" /> HOME
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenu ? (
        <div className="border-b border-[var(--line)] bg-white p-4 shadow-card lg:hidden">
          <form onSubmit={submitSearch} className="mb-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              leftIcon={<Search className="h-4 w-4" />}
            />
          </form>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileMenu(false)}
                className="rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-primary-500"
              >
                {l.label.toUpperCase()}
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                onClick={() => setMobileMenu(false)}
                className="rounded-lg p-2.5 font-mono text-xs tracking-wider text-[var(--muted)] hover:bg-primary-100 hover:text-primary-800"
              >
                {c.name.toUpperCase()}
              </Link>
            ))}
          </div>
          <div className="mt-3 border-t border-[var(--line)] pt-3">
            {user ? (
              <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg p-2 font-mono text-xs tracking-widest text-danger-700 hover:bg-danger-100">
                <LogOut className="h-4 w-4" /> SIGN OUT
              </button>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" onClick={() => setMobileMenu(false)} className="flex-1 rounded-lg border border-[var(--line)] px-3 py-2.5 text-center font-mono text-xs font-semibold tracking-widest text-foreground">
                  LOG IN
                </Link>
                <Link href="/register" onClick={() => setMobileMenu(false)} className="flex-1 rounded-lg bg-primary-500 px-3 py-2.5 text-center font-mono text-xs font-bold tracking-widest text-ink">
                  SIGN UP
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
