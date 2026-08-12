"use client";

import { useState } from "react";
import { Truck, MapPin } from "lucide-react";
import { useGetDeliveryPartnersQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Avatar } from "@/components/ui/Avatar";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { formatBDT } from "@/lib/utils";

export default function AdminDeliveryPage() {
  const { success } = useToast();
  const { data: partnersData } = useGetDeliveryPartnersQuery();
  const deliveryPartners = partnersData?.items ?? [];
  const [zones] = useState([
    { name: "Dhaka North", partners: 8, deliveries: 1240, onTime: 96 },
    { name: "Dhaka South", partners: 6, deliveries: 980, onTime: 93 },
    { name: "Chattogram", partners: 5, deliveries: 640, onTime: 94 },
    { name: "Sylhet", partners: 3, deliveries: 410, onTime: 91 },
    { name: "Khulna", partners: 3, deliveries: 380, onTime: 92 },
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Delivery Oversight</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Partner performance and delivery zone management.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Active Partners</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{deliveryPartners.filter((p) => p.online).length}/{deliveryPartners.length}</p>
          <p className="mt-1 text-xs text-success-500">Online now</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Avg Completion</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">
            {Math.round(deliveryPartners.reduce((s, p) => s + p.completionRate, 0) / deliveryPartners.length)}%
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">Across all partners</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Total Delivered</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">
            {deliveryPartners.reduce((s, p) => s + p.completedDeliveries, 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">All time</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="text-base font-semibold text-foreground">Partner Performance</h2>
        </div>
        <Table>
          <THead>
            <Th>Partner</Th>
            <Th>Vehicle</Th>
            <Th>Areas</Th>
            <Th>Deliveries</Th>
            <Th>Completion</Th>
            <Th>Earnings</Th>
            <Th>Status</Th>
          </THead>
          <TBody>
            {deliveryPartners.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar src={p.avatar} name={p.name} size={32} />
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-[var(--muted)]">{p.rating} ★ rating</p>
                    </div>
                  </div>
                </Td>
                <Td className="text-xs text-[var(--muted)]">{p.vehicle.type}<br /><span className="font-mono">{p.vehicle.regNo}</span></Td>
                <Td className="text-xs text-[var(--muted)]">{p.serviceAreas.join(", ")}</Td>
                <Td className="font-medium text-foreground">{p.completedDeliveries.toLocaleString()}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Progress className="w-16" value={p.completionRate} barClass="bg-success-500" />
                    <span className="text-xs font-medium text-[var(--muted)]">{p.completionRate}%</span>
                  </div>
                </Td>
                <Td className="font-medium text-foreground">{formatBDT(p.totalEarnings, { compact: true })}</Td>
                <Td><Badge tone={p.online ? "success" : "neutral"}>{p.online ? "Online" : "Offline"}</Badge></Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--line)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <MapPin className="h-4.5 w-4.5 text-primary-800" /> Delivery Zones
          </h2>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((z) => (
            <button key={z.name} onClick={() => success("Zone editor opened")} className="rounded-2xl border border-[var(--line)] p-4 text-left transition-all hover:border-primary-200 hover:shadow-card">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Truck className="h-4 w-4 text-primary-800" /> {z.name}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">{z.partners} partners · {z.deliveries.toLocaleString()} deliveries</p>
              <div className="mt-2 flex items-center gap-2">
                <Progress className="w-20" value={z.onTime} barClass="bg-gradient-to-r from-success-500 to-success-600" />
                <span className="text-xs font-medium text-success-500">{z.onTime}% on-time</span>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
