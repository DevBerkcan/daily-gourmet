import Link from "next/link";
import { PageHeader, Card, Table, Td, StatusBadge, Button, SearchInput, DummyNote } from "@/components/ui";
import { tenants } from "@/lib/data";
import { Plus } from "lucide-react";

export const metadata = { title: "Mandanten" };

export default function TenantsPage() {
  return (
    <>
      <PageHeader
        title="Mandanten"
        subtitle="Alle Catering-Unternehmen auf der Plattform. Neue Mandanten werden ausschließlich hier angelegt — es gibt keine Selbstregistrierung."
        actions={<Button><Plus size={16} aria-hidden /> Mandant anlegen</Button>}
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
          <SearchInput placeholder="Mandant suchen …" />
          <select aria-label="Nach Status filtern" className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink">
            <option>Alle Status</option><option>Aktiv</option><option>Gesperrt</option><option>Archiviert</option>
          </select>
        </div>
        <Table head={["Mandant", "Status", "Ansprechpartner", "Angelegt", "Benutzer", "Einrichtungen", "Letzte Aktivität"]}>
          {tenants.map((t) => (
            <tr key={t.id} className="hover:bg-paper">
              <Td className="font-medium">
                <Link href={`/super-admin/tenants/${t.id}`} className="text-basil hover:underline">{t.name}</Link>
              </Td>
              <Td><StatusBadge status={t.status} /></Td>
              <Td>{t.ansprechpartner}</Td>
              <Td className="text-muted">{t.erstelltAm}</Td>
              <Td>{t.benutzerAnzahl}</Td>
              <Td>{t.einrichtungenAnzahl}</Td>
              <Td className="text-muted">{t.letzteAktivitaet}</Td>
            </tr>
          ))}
        </Table>
        <p className="border-t border-line px-5 py-3 text-xs text-muted">4 von 4 Mandanten · Seite 1 von 1</p>
      </Card>

      <DummyNote />
    </>
  );
}
