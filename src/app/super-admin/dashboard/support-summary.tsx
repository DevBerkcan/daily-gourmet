"use client";

import { LifeBuoy, ShieldCheck } from "lucide-react";
import { Button, Card, CardHeader } from "@/components/ui";
import { useSupportTickets } from "@/lib/services/support";
import { useSuperAdminDashboard } from "@/lib/services/super-admin";

function formatReaktionszeit(minuten: number): string {
  if (minuten < 60) return `${Math.round(minuten)} Min.`;
  const stunden = minuten / 60;
  if (stunden < 24) return `${stunden.toFixed(1)} Std.`;
  return `${(stunden / 24).toFixed(1)} Tage`;
}

export function SupportSummary() {
  const tickets = useSupportTickets();
  const dashboard = useSuperAdminDashboard();
  const offen = tickets.filter((ticket) => ticket.status !== "GELOEST");
  return <Card className="mt-6"><CardHeader title="Mandanten-Support" hint="Direkte Fragen und Fehlermeldungen der Tenant Owner" actions={<LifeBuoy size={19} className="text-basil" aria-hidden />} /><div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto]"><div className="grid gap-3 sm:grid-cols-2">{offen.slice(0, 2).map((ticket) => <div key={ticket.id} className="rounded-lg bg-paper px-4 py-3"><div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-warn">{ticket.prioritaet}</span><span className="text-xs text-muted">{ticket.ticketNummer}</span></div><p className="mt-1 font-semibold text-ink">{ticket.titel}</p><p className="mt-1 text-xs text-muted">{ticket.tenantName} · {ticket.erstelltAm}</p></div>)}</div><div className="flex flex-col justify-center gap-2"><Button href="/super-admin/support"><LifeBuoy size={16} aria-hidden /> {offen.length} offene Anfragen</Button><Button href="/super-admin/tenants" variant="secondary"><ShieldCheck size={16} aria-hidden /> Mandanten prüfen</Button>{dashboard?.averageFirstResponseMinutes != null && <p className="text-center text-xs text-muted">Ø Reaktionszeit: {formatReaktionszeit(dashboard.averageFirstResponseMinutes)}</p>}</div></div></Card>;
}
