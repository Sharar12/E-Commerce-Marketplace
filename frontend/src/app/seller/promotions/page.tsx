"use client";

import { useState } from "react";
import { Plus, Megaphone, Zap, TicketPercent, Trash2 } from "lucide-react";
import { useGetPromotionsQuery } from "@/features/api/api";
import type { PromoCode } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatBDT, formatDate } from "@/lib/utils";

export default function SellerPromotionsPage() {
  const { success } = useToast();
  const { data: promoData } = useGetPromotionsQuery();
  const flashSales = promoData?.flashSales ?? [];
  const [localCoupons, setLocalCoupons] = useState<PromoCode[]>([]);
  const coupons = localCoupons.length > 0 ? localCoupons : (promoData?.coupons ?? []);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState(10);

  const create = () => {
    if (!code.trim()) return;
    setLocalCoupons([...coupons, {
      id: `promo-${Date.now()}`, code: code.toUpperCase(), title: title || code.toUpperCase(),
      discountType: type, discountValue: value, minOrder: 0, maxDiscount: type === "percent" ? 500 : undefined,
      startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
      usageLimit: 500, usedCount: 0, active: true,
    }]);
    setOpen(false);
    setCode(""); setTitle("");
    success("Coupon created!", `${code.toUpperCase()} is now live.`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Promotions</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Create coupons and join flash sales.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Coupon</Button>
      </div>

      {/* Flash sale enrollment */}
      <Card className="overflow-hidden border-accent-300/60 bg-gradient-to-r from-accent-400/10 to-primary-50/40">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500 text-foreground shadow-lg shadow-accent-500/30">
              <Zap className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground">Mega Electronics Sale — Flash</h2>
              <p className="text-sm text-[var(--muted)]">Ends {flashSales[0] ? formatDate(flashSales[0].endsAt) : "—"} · Up to 15% platform-funded discount</p>
            </div>
          </div>
          <Button variant="accent" onClick={() => success("Enrolled!", "Your products are in the flash sale.")}>
            <Megaphone className="h-4 w-4" /> Enroll Products
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <TicketPercent className="h-4.5 w-4.5 text-primary-800" /> My Coupons
          </h2>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {coupons.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500/20 text-primary-800">
                <TicketPercent className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">{c.code}</span>
                  <Badge tone={c.active ? "success" : "neutral"}>{c.active ? "Active" : "Ended"}</Badge>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  {c.discountType === "percent" ? `${c.discountValue}% off` : `${formatBDT(c.discountValue)} off`} · {c.usedCount}/{c.usageLimit} used · ends {formatDate(c.endsAt)}
                </p>
              </div>
              <button onClick={() => setLocalCoupons(coupons.filter((x) => x.id !== c.id))} className="rounded-lg p-2 text-foreground hover:bg-danger-100/50 hover:text-danger-500" aria-label="Delete coupon">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Create coupon">
        <div className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Code" placeholder="e.g. SAVE20" value={code} onChange={(e) => setCode(e.target.value)} />
            <Input label="Title" placeholder="e.g. Save 20% this week" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["percent", "fixed"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-xl border-2 py-2.5 text-sm font-medium capitalize transition-all ${type === t ? "border-primary-600 bg-primary-500/20 text-primary-800" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line)]"}`}
              >
                {t === "percent" ? "% off" : "৳ off"}
              </button>
            ))}
          </div>
          <Input
            label={type === "percent" ? "Discount percentage" : "Discount amount (৳)"}
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={create} disabled={!code.trim()}>Create Coupon</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
