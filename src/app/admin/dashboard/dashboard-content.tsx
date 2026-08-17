"use client";

import Link from "next/link";
import { PageHeader, StatCard, Card, CardHeader, Table, Td, StatusBadge, Button } from "@/components/ui";
import { CalendarPlus, ShoppingBasket, Factory } from "lucide-react";
import { useAdminDashboardSummary, useBenachrichtigungen } from "@/lib/services/dashboard";
import { useSpeiseplaene } from "@/lib/services/meal-plans";
import { useBestellungen } from "@/lib/services/orders";
import { useEinrichtungen } from "@/lib/services/facilities";
import { isoWeekInfo } from "@/lib/isoWeek";

const HEUTE = "2026-08-06";

export function DashboardContent() {
  const summary = useAdminDashboardSummary();
  const speiseplaene = useSpeiseplaene();
  const benachrichtigungen = useBenachrichtigungen();
  const einrichtungen = useEinrichtungen();
  const { week, year } = isoWeekInfo(new Date(HEUTE));
  const aktuellerPlan = speiseplaene.find((p) => p.kalenderwoche === week && p.jahr === year);
  const bestellungen = useBestellungen(aktuellerPlan ? { speiseplanId: aktuellerPlan.id } : undefined);
  const entwuerfe = summary ? summary.bestellungenDieseWoche - summary.verbindlicheBestellungen : 0;

  return (
    <>
      <PageHeader
        title="Übersicht"
        subtitle={`Hier ist der Stand für KW ${week} bei Daily Gourmet.`}
        actions={
          <>
            <Button variant="secondary" href="/admin/production"><Factory size={15} aria-hidden /> Produktion heute</Button>
            <Button href="/admin/meal-plans/new"><CalendarPlus size={15} aria-hidden /> Neuer Speiseplan</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Bestellungen KW ${week}`} value={String(summary?.bestellungenDieseWoche ?? "—")} hint={summary ? `${summary.verbindlicheBestellungen} verbindlich · ${entwuerfe} Entwurf` : undefined} />
        <StatCard label="Portionen heute" value={String(summary?.portionenHeute ?? "—")} />
        <StatCard label="Einrichtungen ohne Bestellung" value={String(summary?.einrichtungenOhneBestellung ?? "—")} tone={summary?.einrichtungenOhneBestellung ? "warn" : "ok"} />
        <StatCard label="Speiseplan nächste Woche" value={summary?.naechsteWocheSpeiseplanStatus ?? "Nicht angelegt"} tone={summary?.naechsteWocheSpeiseplanStatus === "REVIEW" ? "warn" : "default"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader
            title="Bestellungen der Woche"
            actions={<Link href="/admin/orders" className="text-xs font-medium text-basil hover:underline">Alle Bestellungen</Link>}
          />
          {bestellungen.length ? (
            <Table head={["Einrichtung", "Status", "Abgesendet", "Frist"]}>
              {bestellungen.map((b) => (
                <tr key={b.id} className="hover:bg-paper">
                  <Td className="font-medium text-ink">{einrichtungen.find((e) => e.id === b.einrichtungId)?.name ?? b.einrichtungId}</Td>
                  <Td><StatusBadge status={b.status} /></Td>
                  <Td className="text-muted">{b.abgesendetAm ?? "—"}</Td>
                  <Td className="text-muted">{b.frist}</Td>
                </tr>
              ))}
            </Table>
          ) : (
            <p className="px-5 py-6 text-sm text-muted">{aktuellerPlan ? "Für diesen Speiseplan liegen noch keine Bestellungen vor." : "Für diese Woche ist noch kein Speiseplan angelegt."}</p>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Speisepläne" />
            <ul className="divide-y divide-line text-sm">
              {speiseplaene.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/meal-plans/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-paper">
                    <span className="font-medium text-ink">KW {p.kalenderwoche} / {p.jahr}</span>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Letzte Änderungen" />
            <ul className="divide-y divide-line">
              {benachrichtigungen.map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-ink">{n.titel}</p>
                  <p className="text-xs text-muted">{n.text}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">{n.zeitpunkt}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 no-print">
        <Link href="/admin/procurement" className="flex items-center gap-3 rounded-card border border-line bg-surface px-5 py-4 transition-colors hover:border-basil hover:bg-basil-soft">
          <ShoppingBasket size={18} className="text-basil" aria-hidden />
          <span className="text-sm font-medium text-ink">Einkaufslisten prüfen</span>
        </Link>
        <Link href="/admin/production" className="flex items-center gap-3 rounded-card border border-line bg-surface px-5 py-4 transition-colors hover:border-basil hover:bg-basil-soft">
          <Factory size={18} className="text-basil" aria-hidden />
          <span className="text-sm font-medium text-ink">Produktion vorbereiten</span>
        </Link>
      </div>
    </>
  );
}
