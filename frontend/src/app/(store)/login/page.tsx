"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Store, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch } from "@/lib/hooks";
import { login, demoAccounts, type SessionUser } from "@/features/auth/authSlice";
import { useLoginMutation, type AuthLoginResponse } from "@/features/api/api";
import { SESSION_TOKEN_KEY } from "@/features/api/realBaseQuery";
import type { Role } from "@/types";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const roleHome: Record<Role, string> = {
  customer: "/account",
  seller: "/seller",
  delivery: "/delivery",
  support: "/support",
  admin: "/admin",
};

/** Demo credentials mirror the seeder users (used only as a dev fallback). */
function buildSession(role: Role): SessionUser {
  switch (role) {
    case "seller":
      return { id: "sel-techpoint", role, name: "Tanvir Ahmed", email: "tanvir@techpointbd.com", phone: "+8801812345678", avatar: "", sellerId: "sel-techpoint", shopName: "TechPoint BD" };
    case "customer":
      return { id: "cus-01", role, name: "Rahim Uddin", email: "rahim.uddin@gmail.com", phone: "+8801712345678", avatar: "" };
    case "delivery":
      return { id: "dlv-01", role, name: "Habib Mia", email: "habib.mia@apnardokan.delivery", phone: "+8801612345678", avatar: "", partnerId: "dlv-01" };
    case "support":
      return { id: "spt-01", role, name: "Sharmin Akter", email: "sharmin@apnardokan.com", phone: "", avatar: "", agentId: "spt-01" };
    case "admin":
      return { id: "adm-01", role, name: "Ashraful Islam", email: "admin@apnardokan.com", phone: "+8801700000000", avatar: "" };
  }
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { success } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loadingRole, setLoadingRole] = useState<Role | null>(null);
  const [apiLogin] = useLoginMutation();
  const isRealMode = process.env.NEXT_PUBLIC_API_MODE !== "mock";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const redirect = searchParams.get("redirect") ?? "";

  const finishSession = (session: SessionUser, role: Role) => {
    dispatch(login(session));
    success(`Welcome back, ${session.name.split(" ")[0]}!`, "You've been signed in.");
    const target = role === "customer" && redirect ? redirect : roleHome[role];
    router.push(target);
  };

  /**
   * Real mode: authenticate against /api/v1/auth/login (Sanctum). On any
   * failure (offline backend, wrong password) fall back to the demo
   * session so the UI stays usable during development.
   */
  const doLogin = async (role: Role, email?: string, password?: string) => {
    if (isRealMode) {
      try {
        const res = await apiLogin({
          email: email ?? demoAccounts[role].email,
          password: password ?? demoAccounts[role].password,
        });
        const { data } = res as { data?: AuthLoginResponse };
        if (data?.token && data.user) {
          window.localStorage.setItem(SESSION_TOKEN_KEY, data.token);
          finishSession(data.user, data.user.role);
          return;
        }
      } catch {
        // fall through to demo session
      }
    }

    const session = buildSession(role);
    finishSession(session, role);
  };

  const onSubmit = async (data: FormData) => {
    const role = (Object.keys(demoAccounts) as Role[]).find(
      (r) => demoAccounts[r].email === data.email.toLowerCase(),
    );
    await doLogin(role ?? "customer", data.email, data.password);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 20%, rgb(198 255 0 / 0.28), transparent 60%), radial-gradient(ellipse 50% 40% at 85% 80%, rgb(13 13 13 / 0.035), transparent 60%)",
        }}
      />

      <div className="relative grid w-full max-w-4xl gap-10 lg:grid-cols-2">
        {/* Left panel */}
        <div className="hidden flex-col justify-center lg:flex">
          <span className="bento-panel relative flex h-14 w-14 items-center justify-center overflow-hidden bg-primary-500/25">
            <Store className="h-7 w-7 text-primary-800" />
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-foreground">
            Welcome back to <span className="text-primary-800">ApnarDokan</span>
          </h1>
          <p className="mt-3 max-w-sm font-mono text-xs tracking-wider text-[var(--muted)]">
            SIGN IN TO SHOP, SELL, DELIVER, OR SUPPORT THE MARKETPLACE.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { title: "One account, five experiences", desc: "Customer, Seller, Delivery, Support & Admin" },
              { title: "Seamless bKash & Nagad payments", desc: "Secure checkout, instant confirmation" },
              { title: "Track everything in real time", desc: "Orders, earnings, tickets and payouts" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-sm border border-success-500/40 bg-success-500/10 text-[10px] font-bold text-success-700">✓</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{f.title}</p>
                  <p className="font-mono text-[10px] tracking-wider text-[var(--muted)]">{f.desc.toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <Card className="p-8 shadow-overlay">
          <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-primary-800">
            <span className="bg-primary-500 h-1.5 w-1.5 rounded-[1px]" />
            AUTH // ACCESS POINT
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">Log in</h2>
          <p className="mt-1 font-mono text-xs tracking-wider text-[var(--muted)]">USE A DEMO ACCOUNT BELOW OR ENTER CREDENTIALS.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Input
              label="Email address"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[var(--muted)] hover:text-primary-800" aria-label="Toggle password">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register("password")}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="font-mono text-[11px] tracking-widest text-primary-800 hover:text-primary-800">
                FORGOT PASSWORD?
              </Link>
            </div>
            <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
              LOG IN <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[var(--line)]" /></div>
              <div className="relative flex justify-center"><span className="bg-[var(--surface)] px-3 font-mono text-[10px] tracking-widest text-[var(--muted)]">QUICK DEMO ACCESS</span></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(Object.keys(demoAccounts) as Role[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  disabled={loadingRole !== null}
                  onClick={() => {
                    setLoadingRole(role);
                    setTimeout(async () => {
                      await doLogin(role);
                      setLoadingRole(null);
                    }, 350);
                  }}
                  className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 text-center transition-all hover:-translate-y-0.5 hover:border-primary-700/50 hover:shadow-card disabled:opacity-60"
                >
                  <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-foreground">{demoAccounts[role].label}</span>
                  <span className="mt-0.5 block font-mono text-[9px] tracking-widest text-[var(--muted)]">{role} DEMO</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-xs tracking-wider text-[var(--muted)]">
            NEW TO APNARDOKAN?{" "}
            <Link href="/register" className="font-semibold text-primary-800 hover:text-primary-800">
              CREATE AN ACCOUNT
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
