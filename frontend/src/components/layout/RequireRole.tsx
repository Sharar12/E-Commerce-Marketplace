"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import type { Role } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Guards a role workspace. Redirects guests to /login and users of other
 * roles back to the store. Works entirely client-side on the mocked session.
 */
export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    } else if (user.role !== role) {
      router.replace(user.role === "admin" ? "/admin" : `/${user.role}`);
    }
  }, [user, role, router]);

  if (!user || user.role !== role) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
