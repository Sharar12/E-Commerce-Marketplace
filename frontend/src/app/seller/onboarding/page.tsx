"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Upload, Store, FileText, Banknote, ArrowRight, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Shop details" },
  { id: 2, label: "Documents" },
  { id: 3, label: "Payout setup" },
  { id: 4, label: "Review" },
];

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { success } = useToast();
  const [step, setStep] = useState(1);
  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState("");
  const [bio, setBio] = useState("");
  const [docs, setDocs] = useState<{ name: string; icon: string }[]>([]);
  const [payoutMethod, setPayoutMethod] = useState("bkash");
  const [accountNo, setAccountNo] = useState("");

  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = () => {
    success("Application submitted!", "Our team will review your shop within 48 hours.");
    router.push("/seller");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Become a Seller</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Set up your shop in under 5 minutes.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <span className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                done ? "bg-success-500 text-foreground" : active ? "bg-primary-600 text-foreground ring-4 ring-primary-600/20" : "bg-[var(--surface-2)] text-[var(--muted)]",
              )}>
                {done ? <Check className="h-4 w-4" /> : s.id}
              </span>
              <span className={cn("hidden text-xs font-medium sm:block", active ? "text-foreground" : "text-[var(--muted)]")}>{s.label}</span>
              {s.id < 4 ? <div className={cn("h-0.5 flex-1 rounded", done ? "bg-success-400" : "bg-[var(--surface-2)]")} /> : null}
            </div>
          );
        })}
      </div>

      <Card className="p-6">
        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-800"><Store className="h-5 w-5" /></span>
              <div>
                <h2 className="text-base font-semibold text-foreground">Tell us about your shop</h2>
                <p className="text-xs text-[var(--muted)]">This is what customers will see.</p>
              </div>
            </div>
            <Input label="Shop name" placeholder="e.g. TechPoint BD" value={shopName} onChange={(e) => setShopName(e.target.value)} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Primary category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-600/10">
                <option value="">Select…</option>
                {["Electronics", "Fashion", "Home & Living", "Beauty & Health", "Sports & Outdoors", "Grocery", "Toys & Kids", "Automotive"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <Input label="Shop bio" placeholder="What do you sell?" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-800"><FileText className="h-5 w-5" /></span>
              <div>
                <h2 className="text-base font-semibold text-foreground">Verify your identity</h2>
                <p className="text-xs text-[var(--muted)]">NID and trade license (for companies).</p>
              </div>
            </div>
            {[
              { key: "nid", label: "NID (Front & Back)", icon: "🪪" },
              { key: "license", label: "Trade License (optional)", icon: "📄" },
            ].map((d) => (
              <button
                key={d.key}
                onClick={() => setDocs([...docs.filter((x) => x.icon !== d.icon), { name: `${d.label}.pdf`, icon: d.icon }])}
                className="flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-[var(--line)] p-4 transition-colors hover:border-primary-400"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <span className="text-xl">{d.icon}</span> {d.label}
                </span>
                <Upload className="h-4 w-4 text-[var(--muted)]" />
              </button>
            ))}
            <div className="space-y-1.5">
              {docs.map((d, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-success-100/60 px-3.5 py-2.5 text-sm text-success-700">
                  <span className="flex items-center gap-2"><Check className="h-4 w-4" /> {d.name}</span>
                  <span>Uploaded</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-800"><Banknote className="h-5 w-5" /></span>
              <div>
                <h2 className="text-base font-semibold text-foreground">How should we pay you?</h2>
                <p className="text-xs text-[var(--muted)]">Payouts are processed every Sunday.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["bkash", "nagad", "bank"].map((m) => (
                <button
                  key={m}
                  onClick={() => setPayoutMethod(m)}
                  className={cn("rounded-xl border-2 py-3 text-sm font-medium capitalize transition-all", payoutMethod === m ? "border-primary-600 bg-primary-500/20 text-primary-800" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line)]")}
                >
                  {m === "bkash" ? "bKash" : m}
                </button>
              ))}
            </div>
            <Input
              label={payoutMethod === "bank" ? "Account number" : "Mobile number"}
              placeholder={payoutMethod === "bank" ? "1234567890" : "01XXXXXXXXX"}
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
            />
            {payoutMethod === "bank" ? (
              <div className="grid grid-cols-2 gap-3">
                <Input label="Bank name" placeholder="e.g. Dutch-Bangla Bank" />
                <Input label="Account holder" placeholder="Full name" />
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Review your application</h2>
            <div className="space-y-2 rounded-2xl bg-[var(--surface-2)] p-4 text-sm">
              <p className="flex justify-between"><span className="text-[var(--muted)]">Shop name</span><span className="font-medium text-foreground">{shopName || "—"}</span></p>
              <p className="flex justify-between"><span className="text-[var(--muted)]">Category</span><span className="font-medium text-foreground">{category || "—"}</span></p>
              <p className="flex justify-between"><span className="text-[var(--muted)]">Documents</span><span className="font-medium text-foreground">{docs.length} uploaded</span></p>
              <p className="flex justify-between"><span className="text-[var(--muted)]">Payout method</span><span className="font-medium capitalize text-foreground">{payoutMethod}</span></p>
            </div>
            <p className="text-xs text-[var(--muted)]">
              By submitting, you agree to ApnarDokan's seller terms. Commission starts at 2.5% and varies by category.
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex gap-3 border-t border-[var(--line)] pt-5">
          {step > 1 ? <Button variant="outline" onClick={back}><ArrowLeft className="h-4 w-4" /> Back</Button> : null}
          {step < 4 ? (
            <Button className="flex-1" onClick={next} disabled={(step === 1 && (!shopName || !category)) || (step === 2 && docs.length === 0)}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="flex-1" onClick={submit}>Submit Application</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
