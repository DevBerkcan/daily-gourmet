import Link from "next/link";
import { PageHeader, StatCard, Card, CardHeader, Table, Td, StatusBadge, Button, DummyNote } from "@/components/ui";
import { bestellungen } from "@/lib/data";
import { CalendarRange } from "lucide-react";

export const metadata = { title: "Kundenportal" };

export default function PortalDashboard() {
  const eigene = bestellungen.filter((b) => b.einrichtungId === "f-001");
  return (
    <>
      <PageHeader
        title="Willkommen, Musterschule Nord"
        subtitle="Ihr Überblick über Speisepläne und Bestellungen bei Daily Gourmet."
        actions={<Button href="/portal/meal-plans"><CalendarRange size={15} aria-hidden /> Speiseplan KW 32</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Aktueller Speiseplan" value="KW 32" hint="Veröffentlicht am 01.08." />
        <StatCard label="Nächste Bestellfrist" value="Morgen, 09:00" hint="Für Freitag, 07.08." tone="warn" />
        <StatCard label="Bestellstatus KW 32" value="Bestätigt" hint="Abgesendet am 01.08., 14:22" tone="ok" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Ihre Bestellungen" actions={<Link href="/portal/orders" className="text-xs font-medium text-basil hover:underline">Alle ansehen</Link>} />
          <Table head={["Woche", "Status", "Abgesendet"]}>
            {eigene.map((b) => (
              <tr key={b.id} className="hover:bg-paper">
                <Td className="font-medium text-ink">{b.speiseplanId === "mp-032" ? "KW 32" : "KW 31"}</Td>
                <Td><StatusBadge status={b.status} /></Td>
                <Td className="text-muted">{b.abgesendetAm ?? "—"}</Td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card>
          <CardHeader title="Hinweise von Daily Gourmet" />
          <ul className="divide-y divide-line">
            <li className="px-5 py-3.5">
              <p className="text-sm font-medium text-ink">Vegetarische Aktionswoche</p>
              <p className="text-sm text-muted">Am Mittwoch (05.08.) sind alle Gerichte vegetarisch. Der Speiseplan ist entsprechend gekennzeichnet.</p>
            </li>
            <li className="px-5 py-3.5">
              <p className="text-sm font-medium text-ink">Fristerinnerung</p>
              <p className="text-sm text-muted">Bestellungen für Freitag können noch bis morgen 09:00 Uhr geändert werden. Danach ist die Bestellung gesperrt.</p>
            </li>
          </ul>
        </Card>
      </div>

      <DummyNote />
    </>
  );
}
