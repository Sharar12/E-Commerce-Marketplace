"use client";

import { RefreshCcw, ShieldCheck, Banknote, Truck, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs items={[{ label: "Return Policy" }]} />
      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-success-500/30 bg-success-600/15 text-success-700">
          <RefreshCcw className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Return & Refund Policy</h1>
          <p className="text-sm text-[var(--muted)]">Simple, fair and customer-first.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-primary-500/30 bg-primary-500/25 text-primary-800"><Truck className="h-5 w-5" /></span>
          <h3 className="mt-3 font-semibold text-foreground">Free return pickup</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Our delivery partners collect the item from your doorstep — no courier hassle.</p>
        </Card>
        <Card className="p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-success-500/30 bg-success-600/15 text-success-700"><ShieldCheck className="h-5 w-5" /></span>
          <h3 className="mt-3 font-semibold text-foreground">7-day window</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Request a return within 7 days of delivery for most categories.</p>
        </Card>
        <Card className="p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-accent-400/30 bg-accent-400/10 text-primary-800"><Banknote className="h-5 w-5" /></span>
          <h3 className="mt-3 font-semibold text-foreground">Fast refunds</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Refunds are processed within 3-5 business days to your original payment method.</p>
        </Card>
        <Card className="p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-info-500/30 bg-info-500/15 text-info-400"><Check className="h-5 w-5" /></span>
          <h3 className="mt-3 font-semibold text-foreground">Inspection-free</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">For items under ৳5,000, refunds are approved without return inspection.</p>
        </Card>
      </div>

      <Card className="mt-8 p-6">
        <h3 className="font-semibold text-foreground">What can be returned?</h3>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
          {[
            "Wrong item or size delivered",
            "Damaged or defective product",
            "Item not matching the listing description or photos",
            "Missing accessories or parts",
            "Counterfeit product (full refund + platform action against seller)",
          ].map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success-600/20 text-[9px] font-bold text-success-700">✓</span>
              {r}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
