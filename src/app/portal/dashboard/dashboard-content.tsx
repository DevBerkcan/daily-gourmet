"use client";

import Link from "next/link";
import { PageHeader, StatCard, Card, CardHeader, Table, Td, StatusBadge, Button } from "@/components/ui";
import { CalendarRange } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePortalDashboardSummary } from "@/lib/services/dashboard";
import { useBestellungen } from "@/lib/services/orders";
import { usePortalSpeiseplaene } from "@/lib/services/meal-plans";

export function DashboardContent() {
  const { user } = useAuth();
  const summary = usePortalDashboardSummary();
  const eigene = useBestellungen();
  const speiseplaene = usePortalSpeiseplaene();

  return (
    <>
      <PageHeader
        title={`Willkommen, ${user?.facilityName ?? user?.name ?? ""}`}
        subtitle="Ihr Überblick über Speisepläne und Bestellungen bei Daily Gourmet."
        actions={<Button href="/portal/meal-plans"><CalendarRange size={15} aria-hidden /> Speiseplan öffnen</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Aktueller Speiseplan" value={summary?.aktuelleVeroeffentlichteWoche ? `KW ${summary.aktuelleVeroeffentlichteWoche}` : "—"} />
        <StatCard label="Nächste Bestellfrist" value={summary?.naechsteFrist ?? "—"} tone="warn" />
        <StatCard label="Bestellstatus aktuelle Woche" value={summary?.bestellstatusAktuelleWoche ?? "—"} tone="ok" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Ihre Bestellungen" actions={<Link href="/portal/orders" className="text-xs font-medium text-basil hover:underline">Alle ansehen</Link>} />
          <Table head={["Woche", "Status", "Abgesendet"]}>
            {eigene.slice(0, 5).map((b) => {
              const plan = speiseplaene.find((p) => p.id === b.speiseplanId);
              return (
                <tr key={b.id} className="hover:bg-paper">
                  <Td className="font-medium text-ink">{plan ? `KW ${plan.kalenderwoche}` : "—"}</Td>
                  <Td><StatusBadge status={b.status} /></Td>
                  <Td className="text-muted">{b.abgesendetAm ?? "—"}</Td>
                </tr>
              );
            })}
          </Table>
        </Card>

        <Card>
          <CardHeader title="Hinweise von Daily Gourmet" />
          <p className="px-5 py-4 text-sm text-muted">Aktuell liegen keine besonderen Hinweise vor.</p>
        </Card>
      </div>
    </>
  );
}
