"use client";

import { useState } from "react";
import { Store, Check, X, FileText, Eye } from "lucide-react";
import { useGetSellersQuery } from "@/features/api/api";
import type { Seller } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

export default function SellerApprovalsPage() {
  const { success } = useToast();
  const { data: sellersData } = useGetSellersQuery();
  const sellers = sellersData?.items ?? [];
  const [pending, setPending] = useState<Seller[]>([]);
  const [approved, setApproved] = useState<Seller[]>([]);
  const effectivePending = pending.length > 0 || sellers.length === 0 ? pending : sellers.filter((s) => s.status === "pending");
  const effectiveApproved = approved.length > 0 ? approved : sellers.filter((s) => s.status === "active");
  const [reviewing, setReviewing] = useState<Seller | null>(null);
  const [note, setNote] = useState("");

  const decide = (approve: boolean) => {
    if (!reviewing) return;
    if (approve) {
      setApproved([reviewing, ...effectiveApproved]);
      success("Seller approved!", `${reviewing.shopName} can now list products.`);
    } else {
      success("Application rejected", `${reviewing.shopName} has been notified with your note.`);
    }
    setPending(effectivePending.filter((s) => s.id !== reviewing.id));
    setReviewing(null);
    setNote("");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Seller Approvals</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{effectivePending.length} application(s) awaiting review.</p>
      </div>

      {effectivePending.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-4xl">✅</p>
          <h2 className="mt-3 text-lg font-bold text-foreground">Queue is clear</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">No seller applications awaiting review.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {effectivePending.map((s) => (
            <Card key={s.id} className="border-accent-300/70 p-5">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar src={s.logo} name={s.shopName} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-foreground">{s.shopName}</p>
                  <p className="text-xs text-[var(--muted)]">Owner: {s.ownerName} · {s.email} · {s.phone}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">Applied {formatDate(s.joinedAt)} · {s.address}</p>
                </div>
                <Badge tone="warning">Pending Review</Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-4">
                <Button size="sm" onClick={() => setReviewing(s)}><FileText className="h-4 w-4" /> Review Documents</Button>
                <Button size="sm" variant="outline" onClick={() => setReviewing(s)}><Eye className="h-4 w-4" /> View Application</Button>
                <div className="ml-auto flex gap-2">
                  <Button size="sm" variant="outline" className="text-danger-500 hover:border-danger-300 hover:bg-danger-100/40" onClick={() => { setReviewing(s); }}>
                    <X className="h-4 w-4" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => { setApproved([s, ...effectiveApproved]); setPending(effectivePending.filter((x) => x.id !== s.id)); success("Seller approved!", `${s.shopName} is now live.`); }}>
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="text-base font-semibold text-foreground">Recently Approved</h2>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {effectiveApproved.slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-100 text-success-500"><Store className="h-4 w-4" /></span>
              <p className="flex-1 text-sm font-medium text-foreground">{s.shopName}</p>
              <Badge tone="success">Active</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={reviewing != null} onClose={() => setReviewing(null)} title={`Review: ${reviewing?.shopName}`} size="lg">
        {reviewing ? (
          <div className="space-y-4 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[var(--surface-2)] p-4">
                <p className="text-xs font-semibold uppercase text-[var(--muted)]">Shop details</p>
                <p className="mt-2 text-sm text-foreground">Owner: <span className="font-medium">{reviewing.ownerName}</span></p>
                <p className="text-sm text-foreground">Email: <span className="font-medium">{reviewing.email}</span></p>
                <p className="text-sm text-foreground">Address: <span className="font-medium">{reviewing.address}</span></p>
                <p className="mt-2 text-sm text-[var(--muted)]">{reviewing.bio}</p>
              </div>
              <div className="rounded-2xl bg-[var(--surface-2)] p-4">
                <p className="text-xs font-semibold uppercase text-[var(--muted)]">Verification documents</p>
                <div className="mt-2 space-y-2">
                  {reviewing.verificationDocs.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg bg-[var(--surface)] px-3 py-2 shadow-sm">
                      <span className="flex items-center gap-2 text-sm text-foreground"><FileText className="h-4 w-4 text-primary-800" /> {d.name}</span>
                      <Badge tone="success">Valid</Badge>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-[var(--muted)]">Bank: {reviewing.bankAccount ? `${reviewing.bankAccount.bankName} · ${reviewing.bankAccount.accountNo}` : "Not set"}</p>
              </div>
            </div>
            <Textarea label="Decision note (sent to seller)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note…" />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setReviewing(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => decide(false)}><X className="h-4 w-4" /> Reject</Button>
              <Button className="flex-1" onClick={() => decide(true)}><Check className="h-4 w-4" /> Approve Seller</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
