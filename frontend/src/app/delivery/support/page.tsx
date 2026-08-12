"use client";

import { useState } from "react";
import { HelpCircle, Plus, ChevronRight } from "lucide-react";
import { useGetKnowledgeArticlesQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function DeliverySupportPage() {
  const { success } = useToast();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const { data: articlesData } = useGetKnowledgeArticlesQuery();
  const knowledgeArticles = articlesData?.items ?? [];
  const [faqOpen, setFaqOpen] = useState<string | null>(null);

  const partnerArticles = knowledgeArticles.filter((a) => a.category === "Deliveries" || a.category === "Orders");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Partner Support</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Help for delivery partners, available 24/7.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Ticket</Button>
      </div>

      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <HelpCircle className="h-4.5 w-4.5 text-primary-800" /> Frequently Asked
        </h2>
        <div className="mt-4 space-y-2">
          {partnerArticles.map((a) => (
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

      <Card className="flex items-center gap-3 p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-100 text-success-500">📞</span>
        <div>
          <p className="text-sm font-semibold text-foreground">Partner hotline: 09678-654321</p>
          <p className="text-xs text-[var(--muted)]">For urgent issues during delivery, call us — we answer fast.</p>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Contact partner support">
        <div className="space-y-4 p-6">
          <Input label="Subject" placeholder="e.g. COD remittance question" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea label="Describe the issue" rows={4} placeholder="Share details…" />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" disabled={!subject.trim()} onClick={() => { setOpen(false); success("Ticket submitted", "Support will reply within a few hours."); }}>
              Submit Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
