"use client";

import { Store, Target, Users, Rocket, Heart } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const values = [
  { icon: <Heart className="h-5 w-5" />, title: "Customer First", desc: "Every decision starts with what's best for the person holding the phone." },
  { icon: <Target className="h-5 w-5" />, title: "Trust & Transparency", desc: "Real products, real sellers, honest prices — no surprises at checkout." },
  { icon: <Rocket className="h-5 w-5" />, title: "Speed to Doorstep", desc: "Same-day delivery in Dhaka and 48-hour coverage across 64 districts." },
  { icon: <Users className="h-5 w-5" />, title: "Empowering Sellers", desc: "10,000+ local entrepreneurs grow their business on our platform." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs items={[{ label: "About Us" }]} />
      <div className="mt-6 rounded-3xl bg-gradient-to-r from-slate-900 via-dark-800 to-primary-900 p-10 text-center sm:p-14">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--line)] text-foreground backdrop-blur">
          <Store className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Bangladesh's premium marketplace
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-foreground">
          ApnarDokan (আপনার দোকান — "your shop") was founded in 2020 with one belief:
          every Bangladeshi deserves a world-class shopping experience, in their language,
          with their payment methods, delivered to their door.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {values.map((v, i) => (
          <Card key={i} hover className="p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary-500/30 bg-primary-500/25 text-primary-800">{v.icon}</span>
            <h3 className="mt-3 text-base font-semibold text-foreground">{v.title}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{v.desc}</p>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { stat: "50,000+", label: "Products listed" },
          { stat: "10,000+", label: "Active sellers" },
          { stat: "1.2M+", label: "Happy customers" },
        ].map((s, i) => (
          <Card key={i} className="p-6 text-center">
            <p className="font-mono text-3xl font-bold text-primary-800">{s.stat}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{s.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
