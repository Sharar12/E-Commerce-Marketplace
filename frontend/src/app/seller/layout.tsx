"use client";

import { RequireRole } from "@/components/layout/RequireRole";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Toaster } from "@/components/ui/Toast";
import { useAppSelector } from "@/lib/hooks";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const safeUser = user ?? { id: "", name: "", avatar: "", email: "", shopName: "" };

  return (
    <RequireRole role="seller">
      <DashboardShell role="seller" user={safeUser}>
        {children}
      </DashboardShell>
      <Toaster />
    </RequireRole>
  );
}
