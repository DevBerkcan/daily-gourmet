import { PageHeader, Card, Table, Td, SearchInput, DummyNote } from "@/components/ui";
import { auditLog } from "@/lib/data";

export const metadata = { title: "Audit-Log" };

export default function AuditPage() {
  return (
    <>
      <PageHeader title="Audit-Log" subtitle="Globale Änderungsprotokolle — Einträge können über die Oberfläche weder geändert noch gelöscht werden." />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
          <SearchInput placeholder="Benutzer oder Aktion suchen …" />
          <select aria-label="Nach Mandant filtern" className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option>Alle Mandanten</option><option>Daily Gourmet</option><option>Küchenwerk Rhein</option>
          </select>
          <select aria-label="Zeitraum" className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option>Letzte 30 Tage</option><option>Letzte 7 Tage</option><option>Heute</option>
          </select>
        </div>
        <Table head={["Zeitpunkt", "Mandant", "Benutzer", "Aktion", "Entität", "Begründung"]}>
          {auditLog.map((a) => (
            <tr key={a.id} className="hover:bg-paper">
              <Td className="whitespace-nowrap text-muted">{a.zeitpunkt}</Td>
              <Td>{a.tenant}</Td>
              <Td>{a.benutzer}</Td>
              <Td className="font-medium text-ink">{a.aktion}</Td>
              <Td className="text-muted">{a.entitaet} · {a.entitaetId}</Td>
              <Td className="max-w-56 text-muted">{a.begruendung ?? "—"}</Td>
            </tr>
          ))}
        </Table>
      </Card>
      <DummyNote />
    </>
  );
}
