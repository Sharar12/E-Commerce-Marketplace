"use client";

import { RequireRole } from "@/components/layout/RequireRole";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Toaster } from "@/components/ui/Toast";
import { useAppSelector } from "@/lib/hooks";

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const safeUser = user ?? { id: "", name: "", avatar: "", email: "" };

  return (
    <RequireRole role="delivery">
      <DashboardShell role="delivery" user={safeUser}>
        {children}
      </DashboardShell>
      <Toaster />
    </RequireRole>
  );
}
