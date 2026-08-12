"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

type Step = "email" | "otp" | "reset" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { success } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const sendOtp = () => {
    setStep("otp");
    setResendCooldown(30);
    const t = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) clearInterval(t);
        return c - 1;
      });
    }, 1000);
  };

  const verifyOtp = () => {
    if (otp.join("").length === 6) setStep("reset");
  };

  const resetPassword = () => {
    if (password.length < 6) return;
    setStep("done");
    success("Password updated!", "You can now log in with your new password.");
    setTimeout(() => router.push("/login"), 1800);
  };

  const updateOtp = (i: number, v: string) => {
    const next = [...otp];
    next[i] = v.replace(/\D/g, "").slice(0, 1);
    setOtp(next);
    if (v && i < 5) {
      const input = document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null;
      input?.focus();
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="p-8">
          {step !== "done" ? (
            <button
              onClick={() => (step === "email" ? router.back() : setStep("email"))}
              className="mb-4 flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-primary-800"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : null}

          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary-500/30 bg-primary-500/25 text-primary-800">
            {step === "email" ? <Mail className="h-6 w-6" /> : step === "otp" ? <KeyRound className="h-6 w-6" /> : step === "reset" ? <KeyRound className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {step === "email" && "Forgot your password?"}
            {step === "otp" && "Enter the verification code"}
            {step === "reset" && "Set a new password"}
            {step === "done" && "All set!"}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {step === "email" && "Enter your registered email and we'll send you a 6-digit OTP."}
            {step === "otp" && `We sent a code to ${email || "your email"}. It expires in 5 minutes.`}
            {step === "reset" && "Choose a strong password you haven't used before."}
            {step === "done" && "Your password has been reset successfully. Redirecting to login…"}
          </p>

          {step === "email" ? (
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) sendOtp();
              }}
            >
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" size="lg" className="w-full">
                Send OTP
              </Button>
            </form>
          ) : null}

          {step === "otp" ? (
            <div className="mt-6">
              <div className="flex justify-between gap-2">
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
              <Button size="lg" className="mt-5 w-full" onClick={verifyOtp}>
                Verify & Continue
              </Button>
              <p className="mt-4 text-center text-sm text-[var(--muted)]">
                Didn't receive it?{" "}
                <button
                  onClick={sendOtp}
                  disabled={resendCooldown > 0}
                  className="font-semibold text-primary-800 hover:text-primary-800 disabled:text-[var(--muted)]"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </p>
            </div>
          ) : null}

          {step === "reset" ? (
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                resetPassword();
              }}
            >
              <Input
                label="New password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                hint="At least 6 characters"
              />
              <Button type="submit" size="lg" className="w-full" disabled={password.length < 6}>
                Reset Password
              </Button>
            </form>
          ) : null}

          {step === "done" ? (
            <Link href="/login" className="mt-6 block">
              <Button size="lg" className="w-full">
                Go to Login
              </Button>
            </Link>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
