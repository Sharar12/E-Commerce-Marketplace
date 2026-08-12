"use client";

import { useState } from "react";
import { User, Bell, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { useAppSelector } from "@/lib/hooks";
import { useGetCustomerQuery } from "@/features/api/api";

export default function SettingsPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const { data: profile } = useGetCustomerQuery(user.id);
  const { success } = useToast();
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(profile?.name ?? user.name);
  const [phone, setPhone] = useState(profile?.phone ?? user.phone);
  const [prefs, setPrefs] = useState(profile?.notificationPrefs ?? { email: true, sms: false, push: true });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Manage your profile, security and notifications.</p>
      </div>

      <Tabs
        tabs={[
          { id: "profile", label: "Profile" },
          { id: "notifications", label: "Notifications" },
          { id: "security", label: "Security" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "profile" ? (
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <User className="h-4.5 w-4.5 text-primary-800" /> Profile Information
          </h2>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Input label="Email" value={user.email} disabled hint="Contact support to change your email" />
            <Button onClick={() => success("Profile updated", "Your changes have been saved.")}>Save Changes</Button>
          </div>
        </Card>
      ) : null}

      {tab === "notifications" ? (
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Bell className="h-4.5 w-4.5 text-primary-800" /> Notification Preferences
          </h2>
          <div className="mt-4 space-y-4">
            {[
              { key: "email" as const, label: "Email notifications", desc: "Order updates, deals and receipts" },
              { key: "sms" as const, label: "SMS notifications", desc: "Delivery updates via text message" },
              { key: "push" as const, label: "Push notifications", desc: "Instant alerts in your browser" },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between rounded-2xl border border-[var(--line)] p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{n.label}</p>
                  <p className="text-xs text-[var(--muted)]">{n.desc}</p>
                </div>
                <Switch checked={prefs[n.key]} onChange={(v) => setPrefs({ ...prefs, [n.key]: v })} />
              </div>
            ))}
            <Button onClick={() => success("Preferences saved")}>Save Preferences</Button>
          </div>
        </Card>
      ) : null}

      {tab === "security" ? (
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <KeyRound className="h-4.5 w-4.5 text-primary-800" /> Security
          </h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-[var(--line)] p-4">
              <p className="text-sm font-medium text-foreground">Change password</p>
              <p className="text-xs text-[var(--muted)]">Use at least 8 characters with numbers and symbols.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Input type="password" placeholder="Current password" />
                <Input type="password" placeholder="New password" />
                <Input type="password" placeholder="Confirm new password" />
              </div>
              <Button className="mt-3" onClick={() => success("Password updated", "Use your new password next time you log in.")}>Update Password</Button>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-[var(--line)] p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Two-factor authentication</p>
                <p className="text-xs text-[var(--muted)]">Add an extra layer of security to your account.</p>
              </div>
              <Switch checked onChange={() => success("2FA is already enabled")} />
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
