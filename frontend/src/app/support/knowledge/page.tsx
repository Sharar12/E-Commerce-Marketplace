"use client";

import { useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, Search } from "lucide-react";
import { useGetKnowledgeArticlesQuery } from "@/features/api/api";
import type { KnowledgeArticle } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

export default function KnowledgeBasePage() {
  const { success } = useToast();
  const { data: articlesData } = useGetKnowledgeArticlesQuery();
  const [local, setLocal] = useState<KnowledgeArticle[]>([]);
  const articles = local.length > 0 ? local : (articlesData?.items ?? []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Orders");
  const [body, setBody] = useState("");

  const filtered = articles.filter((a) => a.title.toLowerCase().includes(q.toLowerCase()));

  const save = () => {
    if (!title.trim()) return;
    const base = articles;
    if (editing) {
      setLocal(base.map((a) => (a.id === editing ? { ...a, title, category, body, updatedAt: new Date().toISOString() } : a)));
      success("Article updated");
    } else {
      setLocal([{ id: `kb-${Date.now()}`, title, category, body, updatedAt: new Date().toISOString(), views: 0 }, ...base]);
      success("Article created");
    }
    setOpen(false); setEditing(null); setTitle(""); setBody("");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Knowledge Base</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{articles.length} articles · used by agents to answer customers fast.</p>
        </div>
        <Button onClick={() => { setEditing(null); setTitle(""); setBody(""); setOpen(true); }}><Plus className="h-4 w-4" /> New Article</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {["All", "Orders", "Payments", "Returns", "Deliveries", "Account", "Sellers"].map((c) => (
          <button
            key={c}
            onClick={() => setQ(c === "All" ? "" : c)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${(c === "All" ? q === "" : q === c) ? "bg-primary-600 text-foreground" : "bg-[var(--surface-2)] text-[var(--muted)] hover:bg-[var(--surface-2)]"}`}
          >
            {c}
          </button>
        ))}
        <div className="ml-auto w-56">
          <Input placeholder="Search articles…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((a) => (
          <Card key={a.id} className="flex items-center gap-4 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-800">
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{a.title}</p>
              <p className="text-xs text-[var(--muted)]">{a.category} · {a.views.toLocaleString()} views · updated {formatDate(a.updatedAt)}</p>
            </div>
            <Badge tone="neutral">{a.category}</Badge>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setEditing(a.id); setTitle(a.title); setCategory(a.category); setBody(a.body); setOpen(true);
              }}
              aria-label="Edit article"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setLocal(articles.filter((x) => x.id !== a.id))} aria-label="Delete article" className="text-danger-500 hover:bg-danger-100/50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
        {filtered.length === 0 ? <p className="rounded-2xl bg-[var(--surface-2)] p-8 text-center text-sm text-[var(--muted)]">No articles match.</p> : null}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit article" : "New article"}>
        <div className="space-y-4 p-6">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How do I track my order?" />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 text-sm focus:border-primary-500 focus:outline-none">
              {["Orders", "Payments", "Returns", "Deliveries", "Account", "Sellers"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Textarea label="Body" rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={save} disabled={!title.trim()}>Save Article</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
