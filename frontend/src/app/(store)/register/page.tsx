"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Store, User, Truck, Headphones, ShieldCheck, ArrowRight, Check, Upload,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch } from "@/lib/hooks";
import { login } from "@/features/auth/authSlice";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

const roles: { role: Role; label: string; desc: string; icon: React.ReactNode }[] = [
  { role: "customer", label: "Customer", desc: "Shop 50,000+ products", icon: <User className="h-5 w-5" /> },
  { role: "seller", label: "Seller", desc: "Grow your online business", icon: <Store className="h-5 w-5" /> },
  { role: "delivery", label: "Delivery Partner", desc: "Earn by delivering", icon: <Truck className="h-5 w-5" /> },
  { role: "support", label: "Web Support", desc: "Join the service team", icon: <Headphones className="h-5 w-5" /> },
  { role: "admin", label: "Admin", desc: "Platform operations", icon: <ShieldCheck className="h-5 w-5" /> },
];

const baseSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

const sellerExtra = z.object({
  shopName: z.string().min(2, "Shop name is required"),
  category: z.string().min(1, "Choose a category"),
  tin: z.string().optional(),
});

const deliveryExtra = z.object({
  vehicle: z.string().min(1, "Select vehicle type"),
  area: z.string().min(1, "Select service area"),
});

type BaseForm = z.infer<typeof baseSchema>;
type SellerForm = z.infer<typeof sellerExtra>;
type DeliveryForm = z.infer<typeof deliveryExtra>;

const roleHome: Record<Role, string> = {
  customer: "/account",
  seller: "/seller",
  delivery: "/delivery",
  support: "/support",
  admin: "/admin",
};

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { success } = useToast();
  const initialRole = (searchParams.get("role") as Role) || "customer";
  const [role, setRole] = useState<Role>(roles.some((r) => r.role === initialRole) ? initialRole : "customer");
  const [docs, setDocs] = useState<{ name: string }[]>([]);

  const base = useForm<BaseForm>({ resolver: zodResolver(baseSchema) });
  const seller = useForm<SellerForm>({ resolver: zodResolver(sellerExtra) });
  const delivery = useForm<DeliveryForm>({ resolver: zodResolver(deliveryExtra) });

  const allValid = base.formState.isValid && (role !== "seller" || seller.formState.isValid) && (role !== "delivery" || delivery.formState.isValid);

  const onSubmit = () => {
    const values = base.getValues();
    const sellerValues = role === "seller" ? seller.getValues() : undefined;
    dispatch(
      login({
        id: `new-${role}-${Date.now()}`,
        role,
        name: values.name,
        email: values.email,
        phone: values.phone,
        avatar: "",
        shopName: sellerValues?.shopName,
      }),
    );
    success("Account created!", `Welcome to ApnarDokan, ${values.name.split(" ")[0]}!`);
    router.push(role === "seller" ? "/seller/onboarding" : roleHome[role]);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 80% 20%, rgb(198 255 0 / 0.26), transparent 60%), radial-gradient(ellipse 50% 40% at 10% 85%, rgb(13 13 13 / 0.035), transparent 60%)",
        }}
      />
      <div className="relative w-full max-w-xl">
        <Card className="p-8 shadow-overlay">
          <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-primary-800">
            <span className="bg-primary-500 h-1.5 w-1.5 rounded-[1px]" />
            AUTH // NEW OPERATOR
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="mt-1 font-mono text-xs tracking-wider text-[var(--muted)]">CHOOSE YOUR ROLE — EACH HAS ITS OWN WORKSPACE.</p>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {roles.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => setRole(r.role)}
                className={cn(
                  "rounded-lg border p-3.5 text-left transition-all",
                  role === r.role
                    ? "border-primary-700/50 bg-primary-500/20 shadow-[0_0_14px_rgb(240_106_0/0.2)]"
                    : "border-[var(--line)] bg-[var(--surface)] hover:border-primary-700/50",
                )}
              >
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-md", role === r.role ? "bg-primary-500 text-ink" : "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)]")}>
                  {r.icon}
                </span>
                <span className="mt-2 block text-sm font-semibold text-foreground">{r.label}</span>
                <span className="block font-mono text-[10px] tracking-wider text-[var(--muted)]">{r.desc.toUpperCase()}</span>
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" placeholder="Rahim Uddin" error={base.formState.errors.name?.message} {...base.register("name")} />
              <Input label="Phone" placeholder="+8801XXXXXXXXX" error={base.formState.errors.phone?.message} {...base.register("phone")} />
            </div>
            <Input label="Email" type="email" placeholder="you@example.com" error={base.formState.errors.email?.message} {...base.register("email")} />
            <Input label="Password" type="password" placeholder="••••••••" error={base.formState.errors.password?.message} {...base.register("password")} />

            {role === "seller" ? (
              <div className="space-y-4 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]/60 p-4">
                <p className="font-mono text-xs font-bold tracking-[0.2em] text-primary-800">SELLER DETAILS</p>
                <Input label="Shop name" placeholder="e.g. TechPoint BD" error={seller.formState.errors.shopName?.message} {...seller.register("shopName")} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-xs font-medium tracking-widest text-foreground">CATEGORY</label>
                    <select className="h-11 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3.5 font-mono text-xs tracking-wider text-foreground focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30" {...seller.register("category")}>
                      <option value="">Select…</option>
                      {["Electronics", "Fashion", "Home & Living", "Beauty & Health", "Sports", "Grocery", "Toys", "Automotive"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <Input label="TIN (optional)" placeholder="123456789" {...seller.register("tin")} />
                </div>
                <button
                  type="button"
                  onClick={() => setDocs((d) => [...d, { name: `document-${d.length + 1}.pdf` }])}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[var(--line)] py-3 font-mono text-xs tracking-widest text-[var(--muted)] transition-colors hover:border-primary-700/50 hover:text-primary-800"
                >
                  <Upload className="h-4 w-4" /> UPLOAD NID / TRADE LICENSE
                </button>
                {docs.length > 0 ? (
                  <div className="space-y-1.5">
                    {docs.map((d, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-mono text-[10px] tracking-wider text-foreground">
                        <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-success-700" /> {d.name}</span>
                        <span className="text-success-700">UPLOADED</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {role === "delivery" ? (
              <div className="space-y-4 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]/60 p-4">
                <p className="font-mono text-xs font-bold tracking-[0.2em] text-primary-800">DELIVERY PARTNER DETAILS</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-xs font-medium tracking-widest text-foreground">VEHICLE TYPE</label>
                    <select className="h-11 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3.5 font-mono text-xs tracking-wider text-foreground focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30" {...delivery.register("vehicle")}>
                      <option value="">Select…</option>
                      {["Motorcycle", "Bicycle", "CNG Auto-rickshaw", "Pickup Van"].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-xs font-medium tracking-widest text-foreground">SERVICE AREA</label>
                    <select className="h-11 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3.5 font-mono text-xs tracking-wider text-foreground focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30" {...delivery.register("area")}>
                      <option value="">Select…</option>
                      {["Dhaka North", "Dhaka South", "Chattogram", "Sylhet", "Khulna"].map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDocs((d) => [...d, { name: `license-${d.length + 1}.pdf` }])}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[var(--line)] py-3 font-mono text-xs tracking-widest text-[var(--muted)] transition-colors hover:border-primary-700/50 hover:text-primary-800"
                >
                  <Upload className="h-4 w-4" /> UPLOAD DRIVING LICENSE
                </button>
              </div>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={!allValid} onClick={onSubmit}>
              Create account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-5 text-center font-mono text-xs tracking-wider text-[var(--muted)]">
            ALREADY HAVE AN ACCOUNT?{" "}
            <Link href="/login" className="font-semibold text-primary-800 hover:text-primary-800">
              LOG IN
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
