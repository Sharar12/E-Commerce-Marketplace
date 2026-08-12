"use client";

import { useState } from "react";
import Link from "next/link";
import { Ticket, Search } from "lucide-react";
import { useGetTicketsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { timeAgo } from "@/lib/utils";

const priorityTone = (p: string): "danger" | "warning" | "neutral" =>
  p === "urgent" ? "danger" : p === "high" ? "warning" : "neutral";

export default function TicketQueuePage() {
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [q, setQ] = useState("");
  const { data: ticketsData } = useGetTicketsQuery();
  const tickets = ticketsData?.items ?? [];

  const filtered = tickets.filter((t) => {
    const matchesStatus = status === "all" ? true : t.status === status;
    const matchesPriority = priority === "all" ? true : t.priority === priority;
    const matchesQ = t.subject.toLowerCase().includes(q.toLowerCase()) || t.code.toLowerCase().includes(q.toLowerCase()) || t.customerName.toLowerCase().includes(q.toLowerCase());
    return matchesStatus && matchesPriority && matchesQ;
  });

  const statusCounts = (s: string) => (s === "all" ? tickets.length : tickets.filter((t) => t.status === s).length);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ticket Queue</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Respond, triage and resolve customer issues.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          tabs={[
            { id: "all", label: "All", count: statusCounts("all") },
            { id: "new", label: "New", count: statusCounts("new") },
            { id: "open", label: "Open", count: statusCounts("open") },
            { id: "pending", label: "Pending", count: statusCounts("pending") },
            { id: "resolved", label: "Resolved", count: statusCounts("resolved") },
          ]}
          active={status}
          onChange={setStatus}
        />
        <div className="ml-auto flex gap-2">
          <div className="relative">
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="h-10 cursor-pointer appearance-none rounded-xl border border-[var(--line)] bg-[var(--surface)] pl-3.5 pr-8 text-sm text-[var(--muted)] focus:border-primary-500 focus:outline-none">
              <option value="all">All priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="w-56">
            <Input placeholder="Search tickets…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Ticket className="h-7 w-7 text-foreground" />} title="No tickets match" description="Try changing filters or the search query." />
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <Link key={t.id} href={`/support/tickets/${t.id}`} className="block">
              <Card hover className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[var(--muted)]">{t.code}</span>
                  <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                  <Badge tone={priorityTone(t.priority)}>{t.priority}</Badge>
                  <Badge tone="neutral">{t.category.replace("_", " ")}</Badge>
                  {t.escalated ? <Badge tone="danger">Escalated</Badge> : null}
                  <span className="ml-auto text-xs text-[var(--muted)]">{timeAgo(t.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{t.subject}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {t.customerName} · {t.orderCode ? `Order ${t.orderCode}` : "No order"} · {t.messages.length} messages
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
