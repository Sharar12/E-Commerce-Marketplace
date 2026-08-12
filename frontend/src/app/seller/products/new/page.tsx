"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { useCreateProductMutation } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Checkbox } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function NewProductPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [createProduct, { isLoading: saving }] = useCreateProductMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [mrp, setMrp] = useState(0);
  const [stock, setStock] = useState(0);
  const [published, setPublished] = useState(true);
  const [highlight, setHighlight] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [images, setImages] = useState<{ id: string; url: string; alt: string }[]>([]);

  const save = async () => {
    if (!name.trim() || price <= 0) {
      error("Missing details", "Enter a product name and a price greater than 0.");
      return;
    }
    try {
      await createProduct({
        name: name.trim(),
        description,
        price,
        mrp: mrp || undefined,
        stock,
        highlights,
        images: images.map((img) => ({ url: img.url, alt: img.alt })),
        isPublished: published,
      }).unwrap();
      success("Product created", name);
      router.push("/seller/products");
    } catch {
      error("Product not saved", "Something went wrong — try again.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--muted)]">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Add New Product</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/seller/products")}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save {published ? "& Publish" : "Draft"}</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <h2 className="text-base font-semibold text-foreground">Basic Information</h2>
            <Input label="Product name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Xiaomi Smart Band 9" />
            <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Highlights</label>
              <div className="flex gap-2">
                <Input placeholder="e.g. AMOLED display" value={highlight} onChange={(e) => setHighlight(e.target.value)} />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (highlight.trim()) {
                      setHighlights([...highlights, highlight.trim()]);
                      setHighlight("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {highlights.map((h, i) => (
                  <span key={i} className="flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs text-foreground">
                    {h}
                    <button onClick={() => setHighlights(highlights.filter((_, j) => j !== i))}><X className="h-3 w-3 text-[var(--muted)] hover:text-danger-500" /></button>
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="text-base font-semibold text-foreground">Pricing & Inventory</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Selling price (৳)" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              <Input label="MRP (৳)" type="number" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} />
              <Input label="Stock" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
            </div>
            <Checkbox
              label="Publish immediately"
              description="Uncheck to save as draft"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Images</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-[var(--surface-2)]">
                  <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                  <button
                    onClick={() => setImages(images.filter((x) => x.id !== img.id))}
                    className="absolute right-1.5 top-1.5 rounded-full bg-[var(--surface)] p-1 text-[var(--muted)] shadow-sm hover:text-danger-500"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setImages([...images, { id: `img-${Date.now()}`, url: `https://picsum.photos/seed/apnar-new-${Date.now()}/640/640`, alt: name }])}
                className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[var(--line)] text-[var(--muted)] transition-colors hover:border-primary-400 hover:text-primary-800"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs">Add photo</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">Upload up to 6 images (JPG, PNG). First image is the cover.</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Variants</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Add color/size options with price differences.</p>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => success("Variant editor opened")}>
              <Plus className="h-3.5 w-3.5" /> Add Variant
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
