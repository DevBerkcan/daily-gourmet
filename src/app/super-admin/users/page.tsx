import { PageHeader, Card, Table, Td, StatusBadge, SearchInput, Tag, DummyNote } from "@/components/ui";
import { benutzer, tenants } from "@/lib/data";

export const metadata = { title: "Globale Benutzer" };

export default function GlobalUsersPage() {
  return (
    <>
      <PageHeader title="Benutzer" subtitle="Globale Benutzerübersicht über alle Mandanten — nur lesend, Verwaltung erfolgt im jeweiligen Mandanten." />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
          <SearchInput placeholder="Name oder E-Mail suchen …" />
          <select aria-label="Nach Mandant filtern" className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option>Alle Mandanten</option>
            {tenants.map((t) => <option key={t.id}>{t.name}</option>)}
          </select>
          <select aria-label="Nach Rolle filtern" className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option>Alle Rollen</option><option>TENANT_OWNER</option><option>TENANT_ADMIN</option><option>KITCHEN_MANAGER</option><option>FACILITY_ADMIN</option>
          </select>
        </div>
        <Table head={["Benutzer", "Mandant", "Rolle", "Status", "Letzte Anmeldung", "Fehlversuche"]}>
          {benutzer.map((u) => (
            <tr key={u.id} className="hover:bg-paper">
              <Td>
                <span className="font-medium text-ink">{u.name}</span>
                <span className="block text-xs text-muted">{u.email}</span>
              </Td>
              <Td>{u.tenantId ? tenants.find((t) => t.id === u.tenantId)?.name : <Tag>Plattform</Tag>}</Td>
              <Td><Tag tone="green">{u.rolle}</Tag></Td>
              <Td><StatusBadge status={u.status} /></Td>
              <Td className="text-muted">{u.letzteAnmeldung ?? "—"}</Td>
              <Td className={u.fehlgeschlageneLogins > 0 ? "font-medium text-warn" : "text-muted"}>{u.fehlgeschlageneLogins}</Td>
            </tr>
          ))}
        </Table>
      </Card>
      <DummyNote />
    </>
  );
}
