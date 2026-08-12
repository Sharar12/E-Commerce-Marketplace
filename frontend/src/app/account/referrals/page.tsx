"use client";

import { Gift, Copy, Users, Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAppSelector } from "@/lib/hooks";
import { useGetCustomerQuery } from "@/features/api/api";
import { formatBDT } from "@/lib/utils";

export default function ReferralsPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const { data: profile } = useGetCustomerQuery(user.id);
  const { success } = useToast();
  const code = profile?.referralCode ?? "APD12345";
  const link = `apnardokan.com/ref/${code}`;
  const stats = { invites: 12, joined: 7, earned: 3500 };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Referral Program</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Share ApnarDokan with friends — earn for every signup and order.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-center text-foreground">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)] backdrop-blur">
            <Gift className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-2xl font-bold">Give ৳200, get ৳200</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-foreground/85">
            When your friend signs up with your code and places their first order, you both get ৳200 in wallet credit.
          </p>
          <div className="mx-auto mt-5 flex max-w-md items-center gap-2">
            <div className="flex-1 rounded-xl bg-[var(--surface-2)] px-4 py-3 font-mono text-sm text-foreground backdrop-blur">{link}</div>
            <Button
              variant="outline"
              className="border-[var(--line-strong)] bg-[var(--surface-2)] text-foreground hover:bg-[var(--surface-2)]"
              onClick={() => { navigator.clipboard?.writeText(link); success("Link copied!", "Share it with your friends."); }}
            >
              <Copy className="h-4 w-4" /> Copy
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-[var(--line)]">
          {[
            { icon: <Users className="h-4.5 w-4.5" />, label: "Invites sent", value: stats.invites },
            { icon: <Gift className="h-4.5 w-4.5" />, label: "Friends joined", value: stats.joined },
            { icon: <Wallet className="h-4.5 w-4.5" />, label: "Total earned", value: formatBDT(stats.earned) },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 p-5 text-center">
              <span className="text-primary-800">{s.icon}</span>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">How it works</h2>
        <ol className="mt-4 space-y-3">
          {[
            ["Share your code", "Send your unique link to friends via WhatsApp, Facebook or SMS."],
            ["They sign up & order", "Your friend creates an account with your code and places any order over ৳500."],
            ["You both earn", "৳200 wallet credit lands in both accounts within 24 hours of delivery."],
          ].map(([title, desc], i) => (
            <li key={i} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-sm font-bold text-primary-800">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-sm text-[var(--muted)]">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
