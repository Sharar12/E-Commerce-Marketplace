"use client";

import { useState } from "react";
import { Gift, Coins, TrendingUp, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAppSelector } from "@/lib/hooks";
import { useGetCustomerQuery } from "@/features/api/api";
import { Progress } from "@/components/ui/Progress";
import { formatBDT } from "@/lib/utils";
import { cn } from "@/lib/utils";

const tierMeta = {
  bronze: { color: "text-amber-700 bg-amber-100", threshold: 0 },
  silver: { color: "text-[var(--muted)] bg-[var(--surface-2)]", threshold: 5000 },
  gold: { color: "text-primary-800 bg-accent-400/20", threshold: 15000 },
  platinum: { color: "text-foreground bg-[var(--surface-2)]", threshold: 40000 },
};

export default function LoyaltyPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const { data: profile } = useGetCustomerQuery(user.id);
  const points = profile?.loyaltyPoints ?? 1200;
  const tier = profile?.tier ?? "bronze";
  const { success } = useToast();
  const [history] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      desc: i % 3 === 0 ? "Order APD1004XX" : i % 3 === 1 ? "Redeemed at checkout" : "Welcome bonus",
      points: i % 3 === 1 ? -250 : 120 + i * 35,
      at: new Date(Date.now() - i * 9 * 86400000).toISOString(),
    })),
  );

  const nextTier = tier === "bronze" ? "silver" : tier === "silver" ? "gold" : tier === "gold" ? "platinum" : null;
  const pointsValue = Math.round(points / 100) * 10;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Loyalty & Rewards</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Earn 1 point per ৳100 spent. 100 points = ৳10.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-foreground">
            <p className="flex items-center gap-2 text-sm text-foreground/80"><Coins className="h-4 w-4" /> Available points</p>
            <p className="mt-1 text-4xl font-bold">{points.toLocaleString()}</p>
            <p className="mt-1 text-sm text-foreground/80">Worth {formatBDT(pointsValue)} at checkout</p>
          </div>
          <div className="p-5">
            <Button className="w-full" onClick={() => success("Points redeemed!", `${formatBDT(pointsValue)} discount applied at checkout.`)}>
              Redeem at Checkout
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-accent-500" /> Current tier: <Badge tone="accent" className="capitalize">{tier}</Badge>
            </p>
          </div>
          {nextTier ? (
            <>
              <p className="mt-4 text-sm text-[var(--muted)]">Progress to <span className="font-semibold text-foreground capitalize">{nextTier}</span></p>
              <Progress className="mt-2" value={Math.min(100, (points / (tierMeta[nextTier].threshold)) * 100)} barClass="bg-gradient-to-r from-accent-400 to-accent-500" />
              <p className="mt-2 text-xs text-[var(--muted)]">
                {formatBDT(Math.max(0, tierMeta[nextTier].threshold - points))} more spend to reach {nextTier}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">You've reached the top tier — enjoy all platinum perks! 🎉</p>
          )}
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-4 text-center">
            {[
              { label: "Points per ৳100", value: "1x" },
              { label: "Free delivery", value: "✓" },
              { label: "Birthday gift", value: "✓" },
            ].map((p, i) => (
              <div key={i}>
                <p className="text-sm font-bold text-foreground">{p.value}</p>
                <p className="text-[10px] text-[var(--muted)]">{p.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <TrendingUp className="h-4.5 w-4.5 text-primary-800" /> Points History
        </h2>
        <div className="mt-4 divide-y divide-[var(--line)]">
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{h.desc}</p>
                <p className="text-xs text-[var(--muted)]">{new Date(h.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <p className={cn("text-sm font-bold", h.points > 0 ? "text-success-500" : "text-danger-500")}>
                {h.points > 0 ? "+" : ""}{h.points}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
