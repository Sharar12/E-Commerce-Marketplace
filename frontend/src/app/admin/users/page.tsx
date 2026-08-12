"use client";

import { useState } from "react";
import { Users, Search, Ban, CheckCircle2, UserCog } from "lucide-react";
import { useGetCustomersQuery, useGetSellersQuery, useGetDeliveryPartnersQuery, useGetSupportAgentsQuery } from "@/features/api/api";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

type TabId = "customers" | "sellers" | "partners" | "agents";

export default function AdminUsersPage() {
  const { success } = useToast();
  const [tab, setTab] = useState<TabId>("customers");
  const [q, setQ] = useState("");
  const { data: customersData } = useGetCustomersQuery();
  const { data: sellersData } = useGetSellersQuery();
  const { data: partnersData } = useGetDeliveryPartnersQuery();
  const { data: agentsData } = useGetSupportAgentsQuery();
  const customers = customersData?.items ?? [];
  const sellers = sellersData?.items ?? [];
  const deliveryPartners = partnersData?.items ?? [];
  const supportAgents = agentsData?.items ?? [];

  const [states, setStates] = useState<Record<string, "active" | "suspended">>({});
  const statusOf = (id: string, fallback: "active" | "suspended") => states[id] ?? fallback;

  const toggle = (id: string, current: "active" | "suspended") => {
    const next = current === "active" ? "suspended" : "active";
    setStates({ ...states, [id]: next });
    success(next === "suspended" ? "User suspended" : "User activated", id);
  };

  const counts = {
    customers: customers.length,
    sellers: sellers.length,
    partners: deliveryPartners.length,
    agents: supportAgents.length,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Manage all accounts across the platform.</p>
        </div>
        <div className="w-64">
          <Input placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "customers", label: "Customers", count: counts.customers },
          { id: "sellers", label: "Sellers", count: counts.sellers },
          { id: "partners", label: "Delivery Partners", count: counts.partners },
          { id: "agents", label: "Support Agents", count: counts.agents },
        ]}
        active={tab}
        onChange={(id) => setTab(id as TabId)}
      />

      <Card className="overflow-hidden">
        <Table>
          <THead>
            <Th>User</Th>
            <Th>Contact</Th>
            <Th>Joined</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </THead>
          <TBody>
            {tab === "customers"
              ? customers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())).map((c) => (
                  <Tr key={c.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar src={c.avatar} name={c.name} size={32} />
                        <div>
                          <p className="font-medium text-foreground">{c.name}</p>
                          <p className="text-xs text-[var(--muted)]">{c.tier} tier · {c.loyaltyPoints.toLocaleString()} pts</p>
                        </div>
                      </div>
                    </Td>
                    <Td><span className="text-xs text-[var(--muted)]">{c.phone}<br />{c.email}</span></Td>
                    <Td className="text-xs text-[var(--muted)]">{formatDate(c.joinDate)}</Td>
                    <Td><Badge tone={statusOf(c.id, c.status) === "active" ? "success" : "danger"}>{statusOf(c.id, c.status)}</Badge></Td>
                    <Td className="text-right">
                      <button
                        onClick={() => toggle(c.id, statusOf(c.id, c.status))}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--surface-2)]"
                      >
                        {statusOf(c.id, c.status) === "active" ? <><Ban className="h-3.5 w-3.5 text-danger-500" /> Suspend</> : <><CheckCircle2 className="h-3.5 w-3.5 text-success-500" /> Activate</>}
                      </button>
                    </Td>
                  </Tr>
                ))
              : tab === "sellers"
                ? sellers.filter((s) => s.shopName.toLowerCase().includes(q.toLowerCase())).map((s) => (
                    <Tr key={s.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar src={s.logo} name={s.shopName} size={32} />
                          <div>
                            <p className="font-medium text-foreground">{s.shopName}</p>
                            <p className="text-xs text-[var(--muted)]">{s.ownerName} · {s.rating} ★</p>
                          </div>
                        </div>
                      </Td>
                      <Td><span className="text-xs text-[var(--muted)]">{s.phone}<br />{s.email}</span></Td>
                      <Td className="text-xs text-[var(--muted)]">{formatDate(s.joinedAt)}</Td>
                      <Td><Badge tone={statusOf(s.id, s.status === "active" ? "active" : "suspended") === "active" ? "success" : statusOf(s.id, s.status === "active" ? "active" : "suspended") === "suspended" ? "danger" : "warning"}>{statusOf(s.id, s.status === "active" ? "active" : "suspended")}</Badge></Td>
                      <Td className="text-right">
                        <button onClick={() => toggle(s.id, statusOf(s.id, s.status === "active" ? "active" : "suspended") as "active" | "suspended")} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--surface-2)]">
                          {statusOf(s.id, s.status === "active" ? "active" : "suspended") === "active" ? <><Ban className="h-3.5 w-3.5 text-danger-500" /> Suspend</> : <><CheckCircle2 className="h-3.5 w-3.5 text-success-500" /> Activate</>}
                        </button>
                      </Td>
                    </Tr>
                  ))
                : tab === "partners"
                  ? deliveryPartners.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).map((p) => (
                      <Tr key={p.id}>
                        <Td>
                          <div className="flex items-center gap-3">
                            <Avatar src={p.avatar} name={p.name} size={32} />
                            <div>
                              <p className="font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-[var(--muted)]">{p.vehicle.type} · {p.vehicle.regNo}</p>
                            </div>
                          </div>
                        </Td>
                        <Td><span className="text-xs text-[var(--muted)]">{p.phone}<br />{p.serviceAreas.join(", ")}</span></Td>
                        <Td className="text-xs text-[var(--muted)]">{p.completionRate}% completion</Td>
                        <Td><Badge tone={statusOf(p.id, p.status) === "active" ? "success" : "danger"}>{statusOf(p.id, p.status)}</Badge></Td>
                        <Td className="text-right">
                          <button onClick={() => toggle(p.id, statusOf(p.id, p.status))} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--surface-2)]">
                            {statusOf(p.id, p.status) === "active" ? <><Ban className="h-3.5 w-3.5 text-danger-500" /> Suspend</> : <><CheckCircle2 className="h-3.5 w-3.5 text-success-500" /> Activate</>}
                          </button>
                        </Td>
                      </Tr>
                    ))
                  : supportAgents.filter((a) => a.name.toLowerCase().includes(q.toLowerCase())).map((a) => (
                      <Tr key={a.id}>
                        <Td>
                          <div className="flex items-center gap-3">
                            <Avatar src={a.avatar} name={a.name} size={32} />
                            <div>
                              <p className="font-medium text-foreground">{a.name}</p>
                              <p className="text-xs text-[var(--muted)]">{a.role}</p>
                            </div>
                          </div>
                        </Td>
                        <Td><span className="text-xs text-[var(--muted)]">{a.email}<br />{a.skills.join(", ")}</span></Td>
                        <Td className="text-xs text-[var(--muted)]">{a.ticketsResolved} resolved</Td>
                        <Td><Badge tone={statusOf(a.id, a.status) === "active" ? "success" : "danger"}>{statusOf(a.id, a.status)}</Badge></Td>
                        <Td className="text-right">
                          <button onClick={() => success("Role updated", "Agent role changed.")} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)]">
                            <UserCog className="h-3.5 w-3.5" /> Change Role
                          </button>
                        </Td>
                      </Tr>
                    ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
