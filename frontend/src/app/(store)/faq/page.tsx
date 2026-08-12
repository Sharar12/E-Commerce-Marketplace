"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useGetKnowledgeArticlesQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";

export default function FaqPage() {
  const { data: knowledgeData } = useGetKnowledgeArticlesQuery();
  const knowledgeArticles = knowledgeData?.items ?? [];
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary-500/30 bg-primary-500/25 text-primary-800">
          <HelpCircle className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h1>
          <p className="text-sm text-[var(--muted)]">Answers to the questions we hear most.</p>
        </div>
      </div>

      {knowledgeArticles.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">Loading answers…</p>
      ) : null}

      <div className="mt-8 space-y-3">
        {knowledgeArticles.map((a) => (
          <Card key={a.id} className="overflow-hidden">
            <button
              onClick={() => setOpen(open === a.id ? null : a.id)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
            >
              <span className="text-sm font-semibold text-foreground">{a.title}</span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-200", open === a.id && "rotate-180")} />
            </button>
            {open === a.id ? (
              <div className="border-t border-[var(--line)] px-5 py-4">
                <p className="text-sm leading-relaxed text-[var(--muted)]">{a.body}</p>
                <p className="mt-3 text-xs text-[var(--muted)]">
                  Category: {a.category} · {a.views.toLocaleString()} views · Updated {new Date(a.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
