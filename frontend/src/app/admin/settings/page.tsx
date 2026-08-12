"use client";

import { useState } from "react";
import { Percent, Truck, FileText, Megaphone, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Switch } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";

export default function AdminSettingsPage() {
  const { success } = useToast();
  const [tab, setTab] = useState("commission");
  const [announcement, setAnnouncement] = useState("Free delivery on orders above ৳499 · Same-day delivery in Dhaka");
  const [announcementOn, setAnnouncementOn] = useState(true);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Commission, shipping, tax and site-wide announcements.</p>
      </div>

      <Tabs
        tabs={[
          { id: "commission", label: "Commission" },
          { id: "shipping", label: "Shipping" },
          { id: "tax", label: "Tax" },
          { id: "announcement", label: "Announcement" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "commission" ? (
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Percent className="h-4.5 w-4.5 text-primary-800" /> Commission Rates by Category
          </h2>
          <div className="mt-4 space-y-3">
            {[
              ["Electronics", 3.5], ["Fashion", 5], ["Home & Living", 4], ["Beauty & Health", 4.5],
              ["Sports", 5], ["Grocery", 2.5], ["Toys & Kids", 5], ["Automotive", 4.5],
            ].map(([cat, rate]) => (
              <div key={cat as string} className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3.5">
                <p className="text-sm font-medium text-foreground">{cat}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={rate as number}
                    className="h-9 w-20 rounded-lg border border-[var(--line)] px-3 text-right text-sm focus:border-primary-500 focus:outline-none"
                  />
                  <span className="text-sm text-[var(--muted)]">%</span>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-5" onClick={() => success("Commission rates saved")}>Save Rates</Button>
        </Card>
      ) : null}

      {tab === "shipping" ? (
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Truck className="h-4.5 w-4.5 text-primary-800" /> Shipping Zones
          </h2>
          <div className="mt-4 space-y-3">
            {[
              ["Dhaka (Inside)", 60, "1-2 days"],
              ["Dhaka (Outside)", 80, "2-3 days"],
              ["Divisional Cities", 100, "2-4 days"],
              ["Other Districts", 120, "3-6 days"],
              ["Hill Tracts", 160, "5-8 days"],
            ].map(([zone, fee, eta]) => (
              <div key={zone as string} className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{zone}</p>
                  <p className="text-xs text-[var(--muted)]">{eta}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--muted)]">৳</span>
                  <input type="number" defaultValue={fee as number} className="h-9 w-20 rounded-lg border border-[var(--line)] px-3 text-right text-sm focus:border-primary-500 focus:outline-none" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--surface-2)] p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Free delivery threshold</p>
              <p className="text-xs text-[var(--muted)]">Orders above this get free shipping</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--muted)]">৳</span>
              <input type="number" defaultValue={499} className="h-9 w-20 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-right text-sm focus:border-primary-500 focus:outline-none" />
            </div>
          </div>
          <Button className="mt-5" onClick={() => success("Shipping settings saved")}>Save Shipping</Button>
        </Card>
      ) : null}

      {tab === "tax" ? (
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <FileText className="h-4.5 w-4.5 text-primary-800" /> Tax Rules
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3.5">
              <div>
                <p className="text-sm font-medium text-foreground">VAT (standard)</p>
                <p className="text-xs text-[var(--muted)]">Applied to all physical goods</p>
              </div>
              <input type="number" defaultValue={5} className="h-9 w-20 rounded-lg border border-[var(--line)] px-3 text-right text-sm focus:border-primary-500 focus:outline-none" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3.5">
              <div>
                <p className="text-sm font-medium text-foreground">SD on luxury goods</p>
                <p className="text-xs text-[var(--muted)]">Electronics over ৳1,00,000</p>
              </div>
              <input type="number" defaultValue={3} className="h-9 w-20 rounded-lg border border-[var(--line)] px-3 text-right text-sm focus:border-primary-500 focus:outline-none" />
            </div>
          </div>
          <Button className="mt-5" onClick={() => success("Tax rules saved")}>Save Tax Rules</Button>
        </Card>
      ) : null}

      {tab === "announcement" ? (
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Megaphone className="h-4.5 w-4.5 text-primary-800" /> Site-wide Announcement
          </h2>
          <div className="mt-4 space-y-4">
            <Input label="Announcement text" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} />
            <div className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Show announcement bar</p>
                <p className="text-xs text-[var(--muted)]">Displayed at the top of every page</p>
              </div>
              <Switch checked={announcementOn} onChange={setAnnouncementOn} />
            </div>
            {announcementOn ? (
              <div className="rounded-xl bg-slate-900 px-4 py-2.5 text-center text-xs text-white">
                <span className="flex items-center justify-center gap-2"><Megaphone className="h-3.5 w-3.5 text-primary-300" /> {announcement}</span>
              </div>
            ) : null}
            <Button onClick={() => success("Announcement published")}><Check className="h-4 w-4" /> Publish</Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
