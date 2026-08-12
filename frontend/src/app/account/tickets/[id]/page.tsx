"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { useGetTicketQuery, useReplyTicketMutation } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAppSelector } from "@/lib/hooks";
import { timeAgo } from "@/lib/utils";
import type { SupportTicketMessage } from "@/types";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user)!;
  const { success } = useToast();
  const { data: ticket } = useGetTicketQuery(id);
  const [replyTicket] = useReplyTicketMutation();
  const [sent, setSent] = useState<SupportTicketMessage[]>([]);
  const messages = [...(ticket?.messages ?? []), ...sent];
  const [input, setInput] = useState("");

  if (!ticket) {
    return <div className="p-8 text-center text-[var(--muted)]">Ticket not found.</div>;
  }

  const send = async () => {
    if (!input.trim()) return;
    try {
      const res = await replyTicket({ ticketId: id, body: input.trim() }).unwrap();
      setSent([...sent, res]);
      setInput("");
      success("Message sent");
    } catch {
      success("Message failed", "Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--muted)]">
        <ArrowLeft className="h-4 w-4" /> Back to tickets
      </button>

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-[var(--muted)]">{ticket.code}</span>
          <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge>
          <Badge tone={ticket.priority === "urgent" ? "danger" : "warning"}>{ticket.priority} priority</Badge>
        </div>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-foreground">{ticket.subject}</h1>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Category: {ticket.category.replace("_", " ")} · Created {timeAgo(ticket.createdAt)} · SLA deadline {timeAgo(ticket.slaDeadline)}
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-foreground">Conversation</h2>
        <div className="mt-4 space-y-4">
          {messages.map((m) => {
            const mine = m.authorRole === "customer";
            return (
              <div key={m.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
                <Avatar src={undefined} name={m.authorName} size={32} />
                <div className={`max-w-[75%] rounded-2xl p-3.5 ${mine ? "bg-primary-600 text-foreground" : "bg-[var(--surface-2)] text-foreground"}`}>
                  <p className="text-xs font-semibold opacity-80">{m.authorName} · {timeAgo(m.createdAt)}</p>
                  <p className="mt-1 text-sm leading-relaxed">{m.body}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex gap-2 border-t border-[var(--line)] pt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type your reply…"
            className="h-11 flex-1 rounded-xl border border-[var(--line)] px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-600/10"
          />
          <Button onClick={send} disabled={!input.trim()}><Send className="h-4 w-4" /> Send</Button>
        </div>
      </Card>
    </div>
  );
}
