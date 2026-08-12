"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Boxes } from "lucide-react";
import { useGetCategoriesQuery, useGetBrandsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";

export default function CatalogPage() {
  const { success } = useToast();
  const { data: catsData } = useGetCategoriesQuery();
  const { data: brsData } = useGetBrandsQuery();
  const [tab, setTab] = useState("categories");
  const [cats, setCats] = useState(catsData?.items ?? []);
  const [brs, setBrs] = useState(brsData?.items ?? []);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    if (catsData?.items) setCats(catsData.items);
    if (brsData?.items) setBrs(brsData.items);
    if (catsData?.items && brsData?.items) hydrated.current = true;
  }, [catsData, brsData]);

  const add = () => {
    if (!name.trim()) return;
    if (tab === "categories") {
      setCats([...cats, { id: `cat-${Date.now()}`, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), icon: "Tag", image: "", productCount: 0 }]);
    } else {
      setBrs([...brs, { id: `brd-${Date.now()}`, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") }]);
    }
    setOpen(false);
    setName("");
    success(tab === "categories" ? "Category created" : "Brand added");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories & Catalog</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Manage categories, brands and attributes.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add {tab === "categories" ? "Category" : "Brand"}</Button>
      </div>

      <Tabs
        tabs={[
          { id: "categories", label: "Categories", count: cats.length },
          { id: "brands", label: "Brands", count: brs.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <Card className="overflow-hidden">
        <Table>
          <THead>
            <Th>{tab === "categories" ? "Category" : "Brand"}</Th>
            {tab === "categories" ? <Th>Slug</Th> : null}
            {tab === "categories" ? <Th>Products</Th> : null}
            <Th className="text-right">Actions</Th>
          </THead>
          <TBody>
            {tab === "categories"
              ? cats.map((c) => (
                  <Tr key={c.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/20 text-lg">{iconFor(c.name)}</span>
                        <p className="font-medium text-foreground">{c.name}</p>
                      </div>
                    </Td>
                    <Td><span className="font-mono text-xs text-[var(--muted)]">{c.slug}</span></Td>
                    <Td><Badge tone="neutral">{c.productCount}</Badge></Td>
                    <Td className="text-right">
                      <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--muted)]" onClick={() => success("Category editor opened")} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-danger-100/50 hover:text-danger-500" onClick={() => setCats(cats.filter((x) => x.id !== c.id))} aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Td>
                  </Tr>
                ))
              : brs.map((b) => (
                  <Tr key={b.id}>
                    <Td><p className="font-medium text-foreground">{b.name}</p></Td>
                    <Td className="text-right">
                      <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--muted)]" onClick={() => success("Brand editor opened")} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-danger-100/50 hover:text-danger-500" onClick={() => setBrs(brs.filter((x) => x.id !== b.id))} aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Td>
                  </Tr>
                ))}
          </TBody>
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={`Add ${tab === "categories" ? "category" : "brand"}`}>
        <div className="space-y-4 p-6">
          <Input label="Name" placeholder={tab === "categories" ? "e.g. Books & Stationery" : "e.g. Sony"} value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={add} disabled={!name.trim()}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function iconFor(name: string) {
  const map: Record<string, string> = {
    Electronics: "📱", Fashion: "👕", "Home & Living": "🛋️", "Beauty & Health": "✨",
    "Sports & Outdoors": "🏃", Grocery: "🛒", "Toys & Kids": "🧸", Automotive: "🚗",
  };
  return map[name] ?? "📦";
}
