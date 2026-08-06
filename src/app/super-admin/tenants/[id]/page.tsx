import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, Table, Td, StatusBadge, Button, Tag, DummyNote } from "@/components/ui";
import { tenants, benutzer, auditLog } from "@/lib/data";
import { ShieldAlert, Lock } from "lucide-react";

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = tenants.find((t) => t.id === id);
  if (!tenant) notFound();

  const tenantUsers = benutzer.filter((b) => b.tenantId === tenant.id);

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted">
        <Link href="/super-admin/tenants" className="hover:text-basil hover:underline">Mandanten</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{tenant.name}</span>
      </nav>

      <PageHeader
        title={tenant.name}
        subtitle={`Angelegt am ${tenant.erstelltAm} · Hauptansprechpartner: ${tenant.ansprechpartner} (${tenant.email})`}
        actions={
          <>
            <Button variant="secondary">Bearbeiten</Button>
            {tenant.status === "AKTIV"
              ? <Button variant="danger"><Lock size={15} aria-hidden /> Mandant sperren</Button>
              : <Button>Reaktivieren</Button>}
          </>
        }
      />

      <div className="mb-6 flex items-center gap-3">
        <StatusBadge status={tenant.status} />
        <Tag>{tenant.benutzerAnzahl} Benutzer</Tag>
        <Tag>{tenant.einrichtungenAnzahl} Einrichtungen</Tag>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Benutzer des Mandanten" hint="Nur Ansicht — Änderungen erfolgen durch den Tenant Owner" />
            <Table head={["Name", "Rolle", "Status", "Letzte Anmeldung"]}>
              {tenantUsers.map((u) => (
                <tr key={u.id} className="hover:bg-paper">
                  <Td>
                    <span className="font-medium text-ink">{u.name}</span>
                    <span className="block text-xs text-muted">{u.email}</span>
                  </Td>
                  <Td><Tag tone="green">{u.rolle}</Tag></Td>
                  <Td><StatusBadge status={u.status} /></Td>
                  <Td className="text-muted">{u.letzteAnmeldung ?? "—"}</Td>
                </tr>
              ))}
            </Table>
          </Card>

          <Card>
            <CardHeader title="Audit-Log dieses Mandanten" />
            <Table head={["Zeitpunkt", "Benutzer", "Aktion", "Begründung"]}>
              {auditLog.filter((a) => a.tenant === tenant.name).map((a) => (
                <tr key={a.id} className="hover:bg-paper">
                  <Td className="whitespace-nowrap text-muted">{a.zeitpunkt}</Td>
                  <Td>{a.benutzer}</Td>
                  <Td>{a.aktion}</Td>
                  <Td className="text-muted">{a.begruendung ?? "—"}</Td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Supportzugriff" hint="Kontrolliert, zeitlich begrenzt, vollständig protokolliert" />
            <div className="px-5 py-4">
              <p className="flex items-start gap-2 text-sm text-muted">
                <ShieldAlert size={16} className="mt-0.5 shrink-0 text-warn" aria-hidden />
                Kein aktiver Supportzugriff. Ein Zugriff ist für den Mandanten sichtbar, endet automatisch nach 60 Minuten und wird im Audit-Log dokumentiert.
              </p>
              <div className="mt-4"><Button variant="secondary">Supportzugriff starten</Button></div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Feature-Flags" hint="Module je Mandant aktivierbar" />
            <ul className="divide-y divide-line text-sm">
              {[
                ["Kundenportal", true],
                ["Einkaufslisten", true],
                ["Nährwert-API (Zutaten)", true],
                ["Bedarfsprognose (Basis)", false],
                ["White-Label-Branding", false],
              ].map(([name, on]) => (
                <li key={name as string} className="flex items-center justify-between px-5 py-3">
                  <span>{name}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${on ? "bg-ok-soft text-ok" : "bg-line text-muted"}`}>
                    {on ? "Aktiv" : "Inaktiv"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <DummyNote />
    </>
  );
}
