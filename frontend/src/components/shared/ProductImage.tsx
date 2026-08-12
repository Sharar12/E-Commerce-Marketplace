"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Product image with a deterministic light fallback so the
 * mock never shows broken images (e.g. when offline).
 */
export function ProductImage({
  src,
  alt,
  className,
  sizes = "400px",
}: {
  src: string | undefined;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center bg-[var(--surface-2)]",
          className,
        )}
        aria-label={alt}
      >
        <Package className="h-10 w-10 text-[var(--muted)]" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}
