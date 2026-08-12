"use client";

import { useState } from "react";
import { CreditCard, Smartphone, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAppSelector } from "@/lib/hooks";
import { useGetCustomerQuery } from "@/features/api/api";
import { maskCard } from "@/lib/utils";

export default function PaymentsPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const { data: profile } = useGetCustomerQuery(user.id);
  const { success } = useToast();
  const [methods, setMethods] = useState(profile?.savedCards ?? []);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"card" | "bkash" | "nagad">("card");
  const [number, setNumber] = useState("");

  const add = () => {
    if (number.trim().length < 4) return;
    setMethods([...methods, { id: `m-${Date.now()}`, brand: type === "card" ? "Visa" : type === "bkash" ? "bKash" : "Nagad", last4: number.slice(-4), expiry: type === "card" ? "09/29" : "—", type }]);
    setOpen(false);
    setNumber("");
    success("Payment method added");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payment Methods</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Securely stored — we never keep full card numbers.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add Method</Button>
      </div>

      <div className="space-y-3">
        {methods.map((m) => (
          <Card key={m.id} className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-800">
              {m.type === "card" ? <CreditCard className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{m.brand}</p>
              <p className="text-xs text-[var(--muted)]">
                {m.type === "card" ? `${maskCard(m.last4)} · expires ${m.expiry}` : `Mobile: ••••${m.last4}`}
              </p>
            </div>
            <Badge tone="success">Verified</Badge>
            <button onClick={() => setMethods(methods.filter((x) => x.id !== m.id))} className="rounded-lg p-2 text-foreground hover:bg-danger-100/50 hover:text-danger-500" aria-label="Remove">
              <Trash2 className="h-4 w-4" />
            </button>
          </Card>
        ))}
        {methods.length === 0 ? (
          <Card className="p-10 text-center text-sm text-[var(--muted)]">No saved payment methods yet.</Card>
        ) : null}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add payment method">
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-3 gap-2">
            {(["card", "bkash", "nagad"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-xl border-2 py-2.5 text-sm font-medium capitalize transition-all ${type === t ? "border-primary-600 bg-primary-500/20 text-primary-800" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line)]"}`}
              >
                {t === "card" ? "Card" : t === "bkash" ? "bKash" : "Nagad"}
              </button>
            ))}
          </div>
          <Input
            label={type === "card" ? "Card number" : "Mobile number"}
            placeholder={type === "card" ? "4242 4242 4242 4242" : "01XXXXXXXXX"}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
          {type === "card" ? (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Expiry" placeholder="MM/YY" />
              <Input label="CVV" placeholder="•••" />
            </div>
          ) : null}
          <p className="text-xs text-[var(--muted)]">Demo only — no real details are stored.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={add} disabled={number.trim().length < 4}>Save Method</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
