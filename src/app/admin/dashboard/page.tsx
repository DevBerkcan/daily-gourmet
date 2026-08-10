import Link from "next/link";
import { PageHeader, StatCard, Card, CardHeader, Table, Td, StatusBadge, Button, DummyNote } from "@/components/ui";
import { bestellungen, einrichtungById, speiseplaene, benachrichtigungen, standorte } from "@/lib/data";
import { CalendarPlus, ShoppingBasket, Factory } from "lucide-react";

export const metadata = { title: "Übersicht" };

export default function AdminDashboard() {
  return (
    <>
      <PageHeader
        title="Guten Morgen, Miriam"
        subtitle="Donnerstag, 06. August — hier ist der Stand für KW 32 bei Daily Gourmet."
        actions={
          <>
            <Button variant="secondary" href="/admin/production"><Factory size={15} aria-hidden /> Produktion heute</Button>
            <Button href="/admin/meal-plans"><CalendarPlus size={15} aria-hidden /> Neuer Speiseplan</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bestellungen KW 32" value="3" hint="2 verbindlich · 1 Entwurf" />
        <StatCard label="Portionen heute" value="315" hint={standorte[0]?.name} />
        <StatCard label="Offene Fristen" value="1" hint="Kita Sonnenblume · morgen 08:00 Uhr" tone="warn" />
        <StatCard label="Speiseplan KW 33" value="In Prüfung" hint="Freigabe durch Miriam ausstehend" tone="warn" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader
            title="Bestellungen der Woche"
            actions={<Link href="/admin/facilities" className="text-xs font-medium text-basil hover:underline">Alle Einrichtungen</Link>}
          />
          <Table head={["Einrichtung", "Status", "Abgesendet", "Frist"]}>
            {bestellungen.filter((b) => b.speiseplanId === "mp-032").map((b) => (
              <tr key={b.id} className="hover:bg-paper">
                <Td className="font-medium text-ink">{einrichtungById(b.einrichtungId)?.name}</Td>
                <Td><StatusBadge status={b.status} /></Td>
                <Td className="text-muted">{b.abgesendetAm ?? "—"}</Td>
                <Td className="text-muted">{b.frist}</Td>
              </tr>
            ))}
          </Table>
          <div className="border-t border-line px-5 py-3 text-xs text-warn">
            Einrichtung ohne Bestellung: Kita Sonnenblume (Entwurf gespeichert, noch nicht abgesendet).
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Speisepläne" />
            <ul className="divide-y divide-line text-sm">
              {speiseplaene.map((p) => (
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

      <div className="mt-6 grid gap-4 sm:grid-cols-3 no-print">
        <Link href="/admin/procurement" className="flex items-center gap-3 rounded-card border border-line bg-surface px-5 py-4 transition-colors hover:border-basil hover:bg-basil-soft">
          <ShoppingBasket size={18} className="text-basil" aria-hidden />
          <span className="text-sm font-medium text-ink">Einkaufsliste KW 32 prüfen</span>
        </Link>
        <Link href="/admin/production/2026-08-07" className="flex items-center gap-3 rounded-card border border-line bg-surface px-5 py-4 transition-colors hover:border-basil hover:bg-basil-soft">
          <Factory size={18} className="text-basil" aria-hidden />
          <span className="text-sm font-medium text-ink">Produktion Freitag vorbereiten</span>
        </Link>
        <Link href="/admin/meal-plans/mp-033" className="flex items-center gap-3 rounded-card border border-line bg-surface px-5 py-4 transition-colors hover:border-basil hover:bg-basil-soft">
          <CalendarPlus size={18} className="text-basil" aria-hidden />
          <span className="text-sm font-medium text-ink">Speiseplan KW 33 freigeben</span>
        </Link>
      </div>

      <DummyNote />
    </>
  );
}
