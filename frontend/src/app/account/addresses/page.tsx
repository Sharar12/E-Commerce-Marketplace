"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Edit3 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAppSelector } from "@/lib/hooks";
import { useGetCustomerQuery } from "@/features/api/api";
import type { Address } from "@/types";

export default function AddressesPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const { data: profile } = useGetCustomerQuery(user.id);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const effectiveAddresses =
    addresses.length > 0 ? addresses : (profile?.addresses ?? []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const { success } = useToast();

  const [form, setForm] = useState({
    label: "Home", name: "", phone: "", line1: "", area: "", city: "Dhaka", postalCode: "",
  });

  const openNew = () => {
    setEditing(null);
    setForm({ label: "Home", name: user.name, phone: user.phone, line1: "", area: "", city: "Dhaka", postalCode: "" });
    setModalOpen(true);
  };

  const openEdit = (a: Address) => {
    setEditing(a);
    setForm({ label: a.label, name: a.name, phone: a.phone, line1: a.line1, area: a.area, city: a.city, postalCode: a.postalCode });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.line1 || !form.area || !form.phone) return;
    if (editing) {
      setAddresses(effectiveAddresses.map((a) => (a.id === editing.id ? { ...a, ...form } : a)));
      success("Address updated");
    } else {
      setAddresses([...effectiveAddresses, { ...form, id: `addr-${Date.now()}`, isDefault: effectiveAddresses.length === 0 }]);
      success("Address added");
    }
    setModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Saved Addresses</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Manage your delivery addresses.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Add Address</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {effectiveAddresses.map((a) => (
          <Card key={a.id} hover className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/20 text-primary-800">
                  <MapPin className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{a.label} · {a.name}</p>
                  {a.isDefault ? <Badge tone="primary" className="mt-0.5">Default</Badge> : null}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(a)} className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--muted)]" aria-label="Edit">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => setAddresses(effectiveAddresses.filter((x) => x.id !== a.id))} className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-danger-100/50 hover:text-danger-500" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {a.line1}, {a.area}, {a.city} {a.postalCode}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">{a.phone}</p>
          </Card>
        ))}
        {effectiveAddresses.length === 0 ? (
          <Card className="p-10 text-center text-sm text-[var(--muted)] sm:col-span-2">
            No addresses saved yet. Add one to speed up checkout.
          </Card>
        ) : null}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit address" : "Add new address"}>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <Input label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home / Work" />
          <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Postal code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
          <div className="sm:col-span-2">
            <Textarea label="Address line" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="House, road, area" rows={2} />
          </div>
          <Input label="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <div className="flex gap-3 sm:col-span-2">
            <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={save}>Save Address</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
