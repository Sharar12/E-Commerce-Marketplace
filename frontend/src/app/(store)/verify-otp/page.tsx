"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { success } = useToast();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(30);

  const updateOtp = (i: number, v: string) => {
    const next = [...otp];
    next[i] = v.replace(/\D/g, "").slice(0, 1);
    setOtp(next);
    if (v && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null)?.focus();
  };

  const verify = () => {
    if (otp.join("").length === 6) {
      success("Verified!", "Phone number confirmed.");
      router.push("/login");
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <button onClick={() => router.back()} className="mb-4 flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-primary-800">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary-500/30 bg-primary-500/25 text-primary-800">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Verify your number</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            We sent a 6-digit code to +88017••••••78 for two-step verification.
          </p>
          <div className="mt-6 flex justify-between gap-2">
            {otp.map((d, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                value={d}
                onChange={(e) => updateOtp(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[i] && i > 0) {
                    (document.getElementById(`otp-${i - 1}`) as HTMLInputElement | null)?.focus();
                  }
                }}
                className="h-14 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] text-center text-xl font-bold text-foreground focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                inputMode="numeric"
              />
            ))}
          </div>
          <Button size="lg" className="mt-5 w-full" onClick={verify} disabled={otp.join("").length !== 6}>
            Verify
          </Button>
          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            <button
              disabled={cooldown > 0}
              className="font-semibold text-primary-800 hover:text-primary-800 disabled:text-[var(--muted)]"
              onClick={() => setCooldown(30)}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}
