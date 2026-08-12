"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, AlertTriangle, UserCheck, StickyNote } from "lucide-react";
import { useGetTicketQuery, useGetSupportAgentsQuery, useReplyTicketMutation } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAppSelector } from "@/lib/hooks";
import { timeAgo, cn } from "@/lib/utils";
import type { SupportTicketMessage, TicketStatus, TicketPriority } from "@/types";

const cannedResponses = [
  "Thanks for reaching out! I've looked into your order and will update you shortly.",
  "I understand the frustration — let me check this with our team and get back to you.",
  "Your refund has been approved and will reflect within 3-5 business days.",
  "The delivery partner has been notified. Your package will arrive within 24 hours.",
  "I've escalated this to our specialist team for priority handling.",
];

export default function SupportTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user)!;
  const agentId = user.agentId ?? "agt-01";
  const { success } = useToast();
  const { data: ticket } = useGetTicketQuery(id);
  const { data: agentsData } = useGetSupportAgentsQuery();
  const [replyTicket] = useReplyTicketMutation();
  const supportAgents = agentsData?.items ?? [];

  const [sent, setSent] = useState<SupportTicketMessage[]>([]);
  const messages = [...(ticket?.messages ?? []), ...sent];
  const [input, setInput] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [status, setStatus] = useState<TicketStatus>(ticket?.status ?? "new");
  const [priority, setPriority] = useState<TicketPriority>(ticket?.priority ?? "medium");
  const [assignedTo, setAssignedTo] = useState(ticket?.assignedAgentId ?? agentId);

  if (!ticket) return <div className="p-8 text-center text-[var(--muted)]">Ticket not found.</div>;

  const send = async (isInternal = false) => {
    const body = (isInternal ? internalNote : input).trim();
    if (!body) return;
    try {
      const res = await replyTicket({ ticketId: id, body, isInternalNote: isInternal }).unwrap();
      setSent([...sent, res]);
      setInput("");
      setInternalNote("");
      success(isInternal ? "Internal note saved" : "Reply sent");
    } catch {
      success(isInternal ? "Note failed to save" : "Reply failed", "Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--muted)]">
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </button>

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-[var(--muted)]">{ticket.code}</span>
          <Badge tone={statusTone(status)}>{status}</Badge>
          <Badge tone={priority === "urgent" ? "danger" : priority === "high" ? "warning" : "neutral"}>{priority}</Badge>
          <Badge tone="neutral">{ticket.category.replace("_", " ")}</Badge>
          {ticket.orderCode ? <Badge tone="info">Order {ticket.orderCode}</Badge> : null}
        </div>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-foreground">{ticket.subject}</h1>
        <p className="mt-1 text-xs text-[var(--muted)]">From {ticket.customerName} · Created {timeAgo(ticket.createdAt)} · SLA {timeAgo(ticket.slaDeadline)}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Select
            label="Status"
            value={status}
            onChange={(e) => { setStatus(e.target.value as TicketStatus); success("Status updated"); }}
            options={[
              { value: "new", label: "New" },
              { value: "open", label: "Open" },
              { value: "pending", label: "Pending" },
              { value: "resolved", label: "Resolved" },
            ]}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]}
          />
          <Select
            label="Assigned to"
            value={assignedTo}
            onChange={(e) => { setAssignedTo(e.target.value); success("Reassigned"); }}
            options={supportAgents.map((a) => ({ value: a.id, label: a.name }))}
          />
        </div>
      </Card>

      {/* Conversation */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-foreground">Conversation</h2>
        <div className="mt-4 space-y-4">
          {messages.map((m) => {
            const mine = m.authorId === user.id || m.authorId === agentId;
            return (
              <div key={m.id} className={cn("flex gap-3", m.isInternalNote ? "" : mine ? "flex-row-reverse" : "")}>
                <Avatar src={undefined} name={m.authorName} size={32} />
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl p-3.5",
                    m.isInternalNote
                      ? "border border-dashed border-accent-400/60 bg-accent-400/10"
                      : mine
                        ? "bg-primary-600 text-foreground"
                        : "bg-[var(--surface-2)] text-foreground",
                  )}
                >
                  <p className={cn("flex items-center gap-1.5 text-xs font-semibold", m.isInternalNote ? "text-accent-700" : "opacity-80")}>
                    {m.isInternalNote ? <StickyNote className="h-3 w-3" /> : null}
                    {m.authorName} · {timeAgo(m.createdAt)}
                    {m.isInternalNote ? " · INTERNAL NOTE" : ""}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{m.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Canned responses */}
        <div className="mt-5 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-[var(--line)] pt-4">
          {cannedResponses.map((c, i) => (
            <button
              key={i}
              onClick={() => setInput(c)}
              className="shrink-0 rounded-full border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-primary-300 hover:bg-primary-500/25 hover:text-primary-800"
            >
              {c.split(" ").slice(0, 4).join(" ")}…
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(false)}
            placeholder="Type your reply to the customer…"
            className="h-11 flex-1 rounded-xl border border-[var(--line)] px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-600/10"
          />
          <Button onClick={() => send(false)} disabled={!input.trim()}><Send className="h-4 w-4" /> Send</Button>
        </div>

        {/* Internal note */}
        <div className="mt-3 rounded-2xl border border-dashed border-accent-300 bg-accent-400/5 p-3">
          <p className="text-xs font-semibold text-accent-700">Internal note (not visible to customer)</p>
          <div className="mt-2 flex gap-2">
            <input
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Add a note for your team…"
              className="h-10 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 text-sm focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/10"
            />
            <Button variant="outline" onClick={() => send(true)} disabled={!internalNote.trim()}>Save Note</Button>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => success("Ticket resolved")}>Resolve Ticket</Button>
        <Button variant="danger" onClick={() => success("Escalated to admin", "Admin has been notified.")}>
          <AlertTriangle className="h-4 w-4" /> Escalate to Admin
        </Button>
        <Button variant="ghost" onClick={() => success("Order lookup opened")}>View Related Order</Button>
      </div>
    </div>
  );
}
