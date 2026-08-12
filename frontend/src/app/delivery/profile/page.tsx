"use client";

import { useState } from "react";
import { Bike, MapPin, User as UserIcon, Phone } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetDeliveryPartnerQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Switch, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function DeliveryProfilePage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const partnerId = user.partnerId ?? "dlv-01";
  const { data: partner } = useGetDeliveryPartnerQuery(partnerId);
  const { success } = useToast();
  const [online, setOnline] = useState(true);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile & Vehicle</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Manage your availability and details.</p>
      </div>

      {/* Availability */}
      <Card className={`p-6 transition-all ${online ? "border-success-300 bg-success-100/30" : ""}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-foreground">Availability</p>
            <p className="text-sm text-[var(--muted)]">
              {online ? "You're online — ready to receive deliveries." : "You're offline — you won't receive new assignments."}
            </p>
          </div>
          <Switch checked={online} onChange={setOnline} />
        </div>
        <div className="mt-4">
          <Badge tone={online ? "success" : "neutral"} className="px-3 py-1">
            <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${online ? "bg-success-600" : "bg-slate-400"}`} />
            {online ? "Online" : "Offline"}
          </Badge>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Personal Information</h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" defaultValue={partner?.name ?? ""} leftIcon={<UserIcon className="h-4 w-4" />} />
            <Input label="Phone" defaultValue={partner?.phone ?? ""} leftIcon={<Phone className="h-4 w-4" />} />
          </div>
          <Input label="Email" defaultValue={partner?.email ?? ""} disabled />
          <Button onClick={() => success("Profile saved")}>Save Changes</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Vehicle Information</h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Vehicle type" defaultValue={partner?.vehicle?.type ?? ""} leftIcon={<Bike className="h-4 w-4" />} />
            <Input label="Registration no." defaultValue={partner?.vehicle?.regNo ?? ""} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Service areas</label>
            <div className="flex flex-wrap gap-2">
              {(partner?.serviceAreas ?? []).map((a) => (
                <span key={a} className="flex items-center gap-1.5 rounded-full bg-primary-500/20 px-3 py-1.5 text-xs font-medium text-primary-800">
                  <MapPin className="h-3 w-3" /> {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
