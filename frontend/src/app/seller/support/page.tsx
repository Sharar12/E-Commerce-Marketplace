"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, Plus, ChevronRight } from "lucide-react";
import { useGetKnowledgeArticlesQuery, useGetTicketsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function SellerSupportPage() {
  const { success } = useToast();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const { data: articlesData } = useGetKnowledgeArticlesQuery();
  const { data: ticketsData } = useGetTicketsQuery();
  const knowledgeArticles = articlesData?.items ?? [];
  const tickets = ticketsData?.items ?? [];
  const [faqOpen, setFaqOpen] = useState<string | null>(null);

  const sellerTickets = tickets.filter((t) => t.createdBy === "seller");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Seller Support</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Help center, FAQs and direct ticket support.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Ticket</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <HelpCircle className="h-4.5 w-4.5 text-primary-800" /> Help Center
          </h2>
          <div className="mt-4 space-y-2">
            {knowledgeArticles.map((a) => (
              <div key={a.id} className="overflow-hidden rounded-xl border border-[var(--line)]">
                <button onClick={() => setFaqOpen(faqOpen === a.id ? null : a.id)} className="flex w-full items-center justify-between p-3.5 text-left">
                  <span className="text-sm font-medium text-foreground">{a.title}</span>
                  <ChevronRight className={cn("h-4 w-4 text-[var(--muted)] transition-transform", faqOpen === a.id && "rotate-90")} />
                </button>
                {faqOpen === a.id ? <p className="border-t border-[var(--line)] px-3.5 py-3 text-sm text-[var(--muted)]">{a.body}</p> : null}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">My Tickets</h2>
          <div className="mt-4 space-y-2">
            {sellerTickets.length === 0 ? (
              <p className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">No tickets yet — create one and we'll respond within 24 hours.</p>
            ) : (
              sellerTickets.map((t) => (
                <Link key={t.id} href="/support/tickets" className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3.5 transition-colors hover:bg-[var(--surface-2)]">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{t.subject}</p>
                    <p className="text-xs text-[var(--muted)]">{t.code}</p>
                  </div>
                  <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Contact seller support">
        <div className="space-y-4 p-6">
          <Input label="Subject" placeholder="e.g. Payout delay" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea label="Describe the issue" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share order IDs, dates and details…" />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" disabled={!subject.trim()} onClick={() => { setOpen(false); success("Ticket submitted", "Our seller success team will reply within 24 hours."); }}>
              Submit Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
