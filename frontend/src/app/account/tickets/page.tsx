"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Ticket as TicketIcon, ChevronRight } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetTicketsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { timeAgo } from "@/lib/utils";

export default function TicketsPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const { success } = useToast();
  const { data: ticketsData } = useGetTicketsQuery();
  const myTickets = (ticketsData?.items ?? []).filter((t) => t.customerId === user.id);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("order_issue");
  const [body, setBody] = useState("");

  const create = () => {
    if (!subject.trim()) return;
    success("Ticket created!", `Our team will reply to "${subject}" within 24 hours.`);
    setOpen(false);
    setSubject(""); setBody("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Support Tickets</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Track and manage your requests.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Ticket</Button>
      </div>

      {myTickets.length === 0 ? (
        <EmptyState
          icon={<TicketIcon className="h-7 w-7 text-foreground" />}
          title="No tickets yet"
          description="Need help with an order, payment or return? Create a ticket and our team will jump in."
          action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create Ticket</Button>}
        />
      ) : (
        <div className="space-y-3">
          {myTickets.map((t) => (
            <Link key={t.id} href={`/account/tickets/${t.id}`} className="block">
              <Card hover className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[var(--muted)]">{t.code}</span>
                      <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                      <Badge tone={t.priority === "urgent" ? "danger" : t.priority === "high" ? "warning" : "neutral"}>{t.priority}</Badge>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-semibold text-foreground">{t.subject}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {t.category.replace("_", " ")} · Last activity {timeAgo(t.updatedAt)}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-foreground" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create a support ticket">
        <div className="space-y-4 p-6">
          <Input label="Subject" placeholder="Brief summary of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-600/10">
              <option value="order_issue">Order Issue</option>
              <option value="payment">Payment</option>
              <option value="return">Return</option>
              <option value="account">Account</option>
              <option value="seller_complaint">Seller Complaint</option>
              <option value="delivery">Delivery</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Textarea label="Describe your issue" rows={4} placeholder="Share as much detail as possible…" value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={create} disabled={!subject.trim()}>Submit Ticket</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
