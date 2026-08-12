"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Zap, Megaphone, Upload } from "lucide-react";
import { useGetPromotionsQuery } from "@/features/api/api";
import type { HomepageBanner } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Switch } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatBDT } from "@/lib/utils";

export default function AdminPromotionsPage() {
  const { success } = useToast();
  const { data: promosData } = useGetPromotionsQuery();
  const flashSales = promosData?.flashSales ?? [];
  const promoCodes = promosData?.coupons ?? [];
  const [bannerList, setBannerList] = useState<HomepageBanner[]>(promosData?.banners ?? []);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current || !promosData?.banners) return;
    setBannerList(promosData.banners);
    hydrated.current = true;
  }, [promosData]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Promotions & Banners</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Manage homepage banners, campaigns and coupons.</p>
        </div>
        <Button onClick={() => setBannerOpen(true)}><Plus className="h-4 w-4" /> New Banner</Button>
      </div>

      {/* Flash sales */}
      <Card className="overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Zap className="h-4.5 w-4.5 text-danger-500" /> Flash Sale Campaigns
          </h2>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {flashSales.map((fs) => (
            <div key={fs.id} className="flex items-center gap-4 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger-100 text-danger-500"><Zap className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{fs.title}</p>
                <p className="text-xs text-[var(--muted)]">
                  {fs.discountPercent}% off · {fs.productIds.length} products · {formatDate(fs.startsAt)} → {formatDate(fs.endsAt)}
                </p>
              </div>
              <Badge tone={fs.active ? "success" : "neutral"}>{fs.active ? "Live" : "Scheduled"}</Badge>
              <Button size="sm" variant="outline" onClick={() => success("Campaign editor opened")}>Edit</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Banners */}
      <Card className="overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Megaphone className="h-4.5 w-4.5 text-primary-800" /> Homepage Banners
          </h2>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {bannerList.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-2xl border border-[var(--line)]">
              <div className="relative aspect-[16/6] overflow-hidden bg-gradient-to-r from-slate-900 to-primary-900">
                <img src={b.image} alt={b.title} className="h-full w-full object-cover opacity-70" />
                <div className="absolute inset-0 flex flex-col justify-center px-5">
                  <p className="text-sm font-bold text-white">{b.title}</p>
                  <p className="text-xs text-white/80">{b.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3">
                <Switch checked={b.active} onChange={() => { setBannerList(bannerList.map((x) => (x.id === b.id ? { ...x, active: !x.active } : x))); success(b.active ? "Banner paused" : "Banner live"); }} />
                <div className="flex gap-1">
                  <button className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--muted)]" onClick={() => success("Banner editor opened")} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-danger-100/50 hover:text-danger-500" onClick={() => setBannerList(bannerList.filter((x) => x.id !== b.id))} aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Coupons */}
      <Card className="overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="text-base font-semibold text-foreground">Platform Coupons</h2>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {promoCodes.slice(0, 4).map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-4">
              <span className="font-mono text-sm font-bold text-foreground">{c.code}</span>
              <p className="flex-1 text-sm text-[var(--muted)]">{c.title} · {c.discountType === "percent" ? `${c.discountValue}%` : formatBDT(c.discountValue)} off</p>
              <Badge tone={c.active ? "success" : "neutral"}>{c.active ? "Active" : "Ended"}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={bannerOpen} onClose={() => setBannerOpen(false)} title="Create homepage banner">
        <div className="space-y-4 p-6">
          <Input label="Title" placeholder="e.g. Eid Mega Sale" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Subtitle" placeholder="e.g. Up to 50% off" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--line)] py-4 text-sm font-medium text-[var(--muted)] transition-colors hover:border-primary-400 hover:text-primary-800">
            <Upload className="h-4 w-4" /> Upload banner image (1600×500)
          </button>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setBannerOpen(false)}>Cancel</Button>
            <Button className="flex-1" disabled={!title.trim()} onClick={() => { setBannerOpen(false); setTitle(""); setSubtitle(""); success("Banner created", "It will go live after scheduling."); }}>
              Create Banner
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
