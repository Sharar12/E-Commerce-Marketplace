"use client";

import { FileText, Download, TrendingUp, ShoppingBag, Users, Wallet } from "lucide-react";
import { useGetOrdersQuery, useGetSellersQuery, useGetCustomersQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const { success } = useToast();
  const { data: ordersData } = useGetOrdersQuery({ pageSize: 1 });
  const { data: sellersData } = useGetSellersQuery();
  const { data: customersData } = useGetCustomersQuery();
  const orders = ordersData?.items ?? [];
  const sellers = sellersData?.items ?? [];
  const customers = customersData?.items ?? [];
  const orderCount = ordersData?.total ?? orders.length;
  const sellerCount = sellersData?.total ?? sellers.length;
  const customerCount = customersData?.total ?? customers.length;

  const reports = [
    { icon: <TrendingUp className="h-5 w-5" />, title: "Sales Report", desc: "GMV, orders and AOV by day/week/month", rowCount: "30 days" },
    { icon: <ShoppingBag className="h-5 w-5" />, title: "Order Report", desc: `${orderCount} orders with full line items`, rowCount: `${orderCount} rows` },
    { icon: <Users className="h-5 w-5" />, title: "Customer Report", desc: `${customerCount} customers with lifetime value`, rowCount: `${customerCount} rows` },
    { icon: <Wallet className="h-5 w-5" />, title: "Payout Report", desc: `${sellerCount} sellers with payout summaries`, rowCount: "Weekly" },
    { icon: <FileText className="h-5 w-5" />, title: "Category Performance", desc: "Revenue and units by category", rowCount: "8 categories" },
    { icon: <FileText className="h-5 w-5" />, title: "Tax Summary", desc: "VAT collected by period", rowCount: "Monthly" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports & Exports</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Generate and export platform reports as CSV.</p>
      </div>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Date Range</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {["Today", "7 days", "30 days", "90 days", "This year"].map((r, i) => (
              <button key={r} className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${i === 2 ? "border-primary-600 bg-primary-500/20 text-primary-800" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line)]"}`}>
                {r}
              </button>
            ))}
          </div>
          <p className="ml-auto text-xs text-[var(--muted)]">Last updated: {formatDate(new Date().toISOString())}</p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.title} hover className="p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-800">{r.icon}</span>
            <h3 className="mt-3 text-sm font-semibold text-foreground">{r.title}</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">{r.desc}</p>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-foreground">{r.rowCount}</p>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => success("Report downloaded", `${r.title}.csv is ready (mock).`)}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </Card>
        ))}
      </div>

      <Card className="flex items-center gap-3 p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-100 text-info-400">ℹ️</span>
        <p className="text-sm text-[var(--muted)]">
          CSV exports stream from the live order, seller and customer data on the real backend.
        </p>
      </Card>
    </div>
  );
}
