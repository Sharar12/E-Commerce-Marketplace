"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Heart, Ticket, User, Settings, Gift, Users,
  Wallet, Megaphone, Star, Store, HelpCircle, Truck, MapPin, Banknote,
  Headphones, BookOpen, BarChart3, ShieldCheck, Flag, Boxes, CreditCard, FileText,
  AlertTriangle, LogOut, Menu, X, Store as StoreIcon, ScanLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAppDispatch } from "@/lib/hooks";
import { logout } from "@/features/auth/authSlice";
import type { Role } from "@/types";
import { useGetSupportDashboardQuery, useGetSellerDashboardQuery } from "@/features/api/api";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const roleNav: Record<Role, NavItem[]> = {
  customer: [
    { label: "Dashboard", href: "/account", icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { label: "My Orders", href: "/account/orders", icon: <Package className="h-4.5 w-4.5" /> },
    { label: "Wishlist", href: "/account/wishlist", icon: <Heart className="h-4.5 w-4.5" /> },
    { label: "Saved Addresses", href: "/account/addresses", icon: <MapPin className="h-4.5 w-4.5" /> },
    { label: "Payment Methods", href: "/account/payments", icon: <CreditCard className="h-4.5 w-4.5" /> },
    { label: "My Reviews", href: "/account/reviews", icon: <Star className="h-4.5 w-4.5" /> },
    { label: "Support Tickets", href: "/account/tickets", icon: <Ticket className="h-4.5 w-4.5" /> },
    { label: "Loyalty Points", href: "/account/loyalty", icon: <Gift className="h-4.5 w-4.5" /> },
    { label: "Referral Program", href: "/account/referrals", icon: <Users className="h-4.5 w-4.5" /> },
    { label: "Settings", href: "/account/settings", icon: <Settings className="h-4.5 w-4.5" /> },
  ],
  seller: [
    { label: "Dashboard", href: "/seller", icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { label: "Products", href: "/seller/products", icon: <ShoppingBag className="h-4.5 w-4.5" /> },
    { label: "Inventory", href: "/seller/inventory", icon: <Boxes className="h-4.5 w-4.5" /> },
    { label: "Orders", href: "/seller/orders", icon: <Package className="h-4.5 w-4.5" /> },
    { label: "Payouts", href: "/seller/payouts", icon: <Wallet className="h-4.5 w-4.5" /> },
    { label: "Promotions", href: "/seller/promotions", icon: <Megaphone className="h-4.5 w-4.5" /> },
    { label: "Reviews", href: "/seller/reviews", icon: <Star className="h-4.5 w-4.5" /> },
    { label: "Analytics", href: "/seller/analytics", icon: <BarChart3 className="h-4.5 w-4.5" /> },
    { label: "Storefront", href: "/seller/storefront", icon: <Store className="h-4.5 w-4.5" /> },
    { label: "Support", href: "/seller/support", icon: <HelpCircle className="h-4.5 w-4.5" /> },
  ],
  delivery: [
    { label: "Dashboard", href: "/delivery", icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { label: "Delivery Queue", href: "/delivery/queue", icon: <Truck className="h-4.5 w-4.5" /> },
    { label: "Active Delivery", href: "/delivery/active", icon: <MapPin className="h-4.5 w-4.5" /> },
    { label: "History & Earnings", href: "/delivery/history", icon: <Banknote className="h-4.5 w-4.5" /> },
    { label: "Payouts", href: "/delivery/payouts", icon: <Wallet className="h-4.5 w-4.5" /> },
    { label: "COD Reconciliation", href: "/delivery/cod", icon: <Banknote className="h-4.5 w-4.5" /> },
    { label: "Profile & Vehicle", href: "/delivery/profile", icon: <User className="h-4.5 w-4.5" /> },
    { label: "Support", href: "/delivery/support", icon: <HelpCircle className="h-4.5 w-4.5" /> },
  ],
  support: [
    { label: "Dashboard", href: "/support", icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { label: "Ticket Queue", href: "/support/tickets", icon: <Ticket className="h-4.5 w-4.5" /> },
    { label: "Order Lookup", href: "/support/orders", icon: <Package className="h-4.5 w-4.5" /> },
    { label: "Refunds & Disputes", href: "/support/refunds", icon: <Banknote className="h-4.5 w-4.5" /> },
    { label: "Knowledge Base", href: "/support/knowledge", icon: <BookOpen className="h-4.5 w-4.5" /> },
    { label: "Performance", href: "/support/performance", icon: <BarChart3 className="h-4.5 w-4.5" /> },
    { label: "Escalations", href: "/support/escalations", icon: <AlertTriangle className="h-4.5 w-4.5" /> },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { label: "Users", href: "/admin/users", icon: <Users className="h-4.5 w-4.5" /> },
    { label: "Seller Approvals", href: "/admin/sellers", icon: <StoreIcon className="h-4.5 w-4.5" /> },
    { label: "Product Moderation", href: "/admin/products", icon: <Flag className="h-4.5 w-4.5" /> },
    { label: "Categories & Catalog", href: "/admin/catalog", icon: <Boxes className="h-4.5 w-4.5" /> },
    { label: "Orders", href: "/admin/orders", icon: <Package className="h-4.5 w-4.5" /> },
    { label: "Payments & Payouts", href: "/admin/payments", icon: <Wallet className="h-4.5 w-4.5" /> },
    { label: "Promotions & Banners", href: "/admin/promotions", icon: <Megaphone className="h-4.5 w-4.5" /> },
    { label: "Reviews Moderation", href: "/admin/reviews", icon: <Star className="h-4.5 w-4.5" /> },
    { label: "Support Oversight", href: "/admin/support", icon: <Headphones className="h-4.5 w-4.5" /> },
    { label: "Delivery Oversight", href: "/admin/delivery", icon: <Truck className="h-4.5 w-4.5" /> },
    { label: "Reports & Exports", href: "/admin/reports", icon: <FileText className="h-4.5 w-4.5" /> },
    { label: "Platform Settings", href: "/admin/settings", icon: <Settings className="h-4.5 w-4.5" /> },
    { label: "Audit Log", href: "/admin/audit", icon: <ShieldCheck className="h-4.5 w-4.5" /> },
  ],
};

const roleTitles: Record<Role, string> = {
  customer: "Customer Panel",
  seller: "Seller Panel",
  delivery: "Delivery Partner Panel",
  support: "Support Panel",
  admin: "Admin Panel",
};

const roleBackLinks: Partial<Record<Role, { label: string; href: string }>> = {
  seller: { label: "View my storefront", href: "/seller/storefront" },
  support: { label: "Customer-facing site", href: "/" },
};

export function DashboardShell({
  role,
  user,
  children,
}: {
  role: Role;
  user: { id: string; name: string; avatar?: string; email?: string; shopName?: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = roleNav[role];

  // Live badges
  const { data: supportDash } = useGetSupportDashboardQuery(undefined, { skip: role !== "support" });
  const { data: sellerDash } = useGetSellerDashboardQuery(user.id, { skip: role !== "seller" });

  const navWithBadges = useMemo(
    () =>
      nav.map((item) => {
        if (role === "support" && item.href === "/support/tickets" && supportDash)
          return { ...item, badge: supportDash.kpis.openTickets };
        if (role === "seller" && item.href === "/seller/orders" && sellerDash)
          return { ...item, badge: sellerDash.kpis.ordersPending };
        return item;
      }),
    [nav, role, supportDash, sellerDash],
  );

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-[var(--surface-2)] text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-[var(--line)] bg-[var(--surface)] transition-transform duration-300 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
            <Link href="/" className="group flex items-center gap-2">
              <span className="bento-panel relative flex h-8 w-8 items-center justify-center overflow-hidden bg-primary-500/20">
                <ScanLine className="h-4 w-4 text-primary-800" />
              </span>
              <span className="font-display text-sm font-bold tracking-[0.12em] text-foreground">
                RELAY<span className="text-primary-800">/OPS</span>
              </span>
            </Link>
            <button className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-foreground lg:hidden" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="border-b border-[var(--line)] px-5 py-4">
            <div className="flex items-center gap-3">
              <Avatar src={user.avatar} name={user.name} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{user.shopName ?? user.name}</p>
                <p className="truncate font-mono text-[10px] tracking-wider text-[var(--muted)]">{user.email}</p>
              </div>
            </div>
            <Badge tone="primary" className="mt-3">{roleTitles[role].toUpperCase()}</Badge>
          </div>

          <nav className="flex-1 overflow-y-auto app-scroll px-3 py-3">
            {navWithBadges.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/")) || pathname.startsWith(item.href) && item.href.split("/").length > 2;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group mb-0.5 flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-[11px] tracking-wider transition-all",
                    active
                      ? "border border-primary-700/40 bg-primary-500/15 text-primary-800"
                      : "border border-transparent text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-foreground",
                  )}
                >
                  <span className={cn("transition-colors", active ? "text-primary-800" : "text-[var(--muted)] group-hover:text-foreground")}>
                    {item.icon}
                  </span>
                  {item.label.toUpperCase()}
                  {item.badge ? (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-sm bg-danger-600 px-1.5 font-mono text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[var(--line)] p-3">
            {roleBackLinks[role] ? (
              <Link
                href={roleBackLinks[role]!.href}
                className="mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-[11px] tracking-wider text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-foreground"
              >
                <Store className="h-4.5 w-4.5 text-[var(--muted)]" /> {roleBackLinks[role]!.label.toUpperCase()}
              </Link>
            ) : null}
            <Link href="/" className="mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-[11px] tracking-wider text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-foreground">
              <LayoutDashboard className="h-4.5 w-4.5 text-[var(--muted)]" /> BACK TO STORE
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 font-mono text-[11px] tracking-wider text-danger-500 transition-colors hover:bg-danger-600/10"
            >
              <LogOut className="h-4.5 w-4.5" /> SIGN OUT
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen ? <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} /> : null}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-white/85 backdrop-blur-md">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button className="rounded-md p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-foreground">{roleTitles[role]}</p>
              <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-[var(--muted)]">
                <span className="h-1.5 w-1.5 rounded-[1px] bg-primary-500 shadow-[0_0_6px_1px_rgb(198_255_0/0.8)]" /> {role.toUpperCase()} WORKSPACE
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/" className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 font-mono text-[10px] tracking-widest text-[var(--muted)] transition-colors hover:border-primary-700/50 hover:text-primary-800">
                VISIT STORE
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 font-mono text-[10px] tracking-widest text-[var(--muted)] transition-colors hover:border-danger-600/50 hover:text-danger-600"
              >
                <LogOut className="h-3.5 w-3.5" /> SIGN OUT
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

        <footer className="border-t border-[var(--line)] px-6 py-4 text-center font-mono text-[10px] tracking-widest text-[var(--muted)]">
          RELAY/OPS — MOCK BUILD {"//"} ALL DATA LOCAL &amp; SIMULATED
        </footer>
      </div>
    </div>
  );
}
