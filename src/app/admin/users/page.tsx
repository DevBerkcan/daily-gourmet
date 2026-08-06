import { PageHeader, Card, Table, Td, StatusBadge, Button, SearchInput, Tag, DummyNote } from "@/components/ui";
import { benutzer, einrichtungById } from "@/lib/data";
import { UserPlus } from "lucide-react";

export const metadata = { title: "Benutzer" };

export default function UsersPage() {
  const eigene = benutzer.filter((b) => b.tenantId === "t-001");
  return (
    <>
      <PageHeader
        title="Benutzer"
        subtitle="Alle Benutzerkonten von Daily Gourmet. Neue Benutzer werden per E-Mail eingeladen — es gibt keine Selbstregistrierung."
        actions={<Button><UserPlus size={16} aria-hidden /> Benutzer einladen</Button>}
      />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
          <SearchInput placeholder="Name oder E-Mail suchen …" />
          <select aria-label="Nach Rolle filtern" className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option>Alle Rollen</option><option>TENANT_ADMIN</option><option>KITCHEN_MANAGER</option><option>KITCHEN_STAFF</option><option>FACILITY_ADMIN</option><option>FACILITY_USER</option><option>READ_ONLY</option>
          </select>
        </div>
        <Table head={["Benutzer", "Rolle", "Einrichtung", "Status", "Letzte Anmeldung", "Aktionen"]}>
          {eigene.map((u) => (
            <tr key={u.id} className="hover:bg-paper">
              <Td>
                <span className="font-medium text-ink">{u.name}</span>
                <span className="block text-xs text-muted">{u.email}</span>
              </Td>
              <Td><Tag tone="green">{u.rolle}</Tag></Td>
              <Td className="text-muted">{u.einrichtungId ? einrichtungById(u.einrichtungId)?.name : "—"}</Td>
              <Td><StatusBadge status={u.status} /></Td>
              <Td className="text-muted">{u.letzteAnmeldung ?? "—"}</Td>
              <Td>
                <div className="flex gap-3 text-xs font-medium no-print">
                  {u.status === "EINGELADEN" && <button type="button" className="cursor-pointer text-basil hover:underline">Erneut einladen</button>}
                  {u.status === "AKTIV" && u.rolle !== "TENANT_OWNER" && <button type="button" className="cursor-pointer text-basil hover:underline">Passwort-Reset</button>}
                  {u.status === "AKTIV" && u.rolle !== "TENANT_OWNER" && <button type="button" className="cursor-pointer text-danger hover:underline">Deaktivieren</button>}
                  {u.status === "DEAKTIVIERT" && <button type="button" className="cursor-pointer text-basil hover:underline">Aktivieren</button>}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
      <DummyNote />
    </>
  );
}
