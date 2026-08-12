import Image from "next/image";
import { cn, initials } from "@/lib/utils";

export function Avatar({
  src,
  name,
  className,
  size = 40,
}: {
  src?: string;
  name: string;
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface-2)] font-mono font-bold text-primary-800",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {src ? (
        <Image src={src} alt={name} fill sizes="80px" className="object-cover" unoptimized />
      ) : (
        initials(name)
      )}
    </div>
  );
}
