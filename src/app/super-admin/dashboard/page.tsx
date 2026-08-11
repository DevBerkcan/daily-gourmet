import { PageHeader, StatCard, Card, CardHeader, Table, Td, StatusBadge, DummyNote } from "@/components/ui";
import { auditLog } from "@/lib/data";
import { tenants } from "@/features/tenants/data";
import { SupportSummary } from "./support-summary";

export const metadata = { title: "Plattform-Übersicht" };

export default function SuperAdminDashboard() {
  return (
    <>
      <PageHeader title="Plattform-Übersicht" subtitle="Status aller Mandanten, Benutzer und Systemdienste der Gentle-Group-Plattform." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Aktive Mandanten" value="3" hint="1 gesperrt · 0 archiviert" />
        <StatCard label="Benutzer gesamt" value="35" hint="28 in den letzten 7 Tagen aktiv" />
        <StatCard label="Einrichtungen" value="15" hint="über alle Mandanten" />
        <StatCard label="Bestellungen KW 32" value="212" hint="+9 % gegenüber Vorwoche" tone="ok" />
      </div>

      <SupportSummary />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader title="Mandanten" hint="Letzte Aktivität je Catering-Unternehmen" />
          <Table head={["Mandant", "Status", "Benutzer", "Einrichtungen", "Letzte Aktivität"]}>
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-paper">
                <Td className="font-medium text-ink">{t.name}</Td>
                <Td><StatusBadge status={t.status} /></Td>
                <Td>{t.benutzerAnzahl}</Td>
                <Td>{t.einrichtungenAnzahl}</Td>
                <Td className="text-muted">{t.letzteAktivitaet}</Td>
              </tr>
            ))}
          </Table>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Systemstatus" hint="Health Checks · Version 0.1.0" />
            <ul className="divide-y divide-line text-sm">
              {[
                ["Frontend (Next.js)", "Erreichbar", "ok"],
                ["Backend-API (.NET)", "Phase 2 — noch nicht angebunden", "warn"],
                ["Datenbank (MonsterASP)", "Phase 2 — noch nicht angebunden", "warn"],
                ["E-Mail-Versand", "Phase 2 — geplant", "warn"],
              ].map(([name, status, tone]) => (
                <li key={name} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="text-ink">{name}</span>
                  <span className={`text-xs font-medium ${tone === "ok" ? "text-ok" : "text-warn"}`}>{status}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Fehlgeschlagene Logins" hint="Letzte 24 Stunden" />
            <p className="px-5 py-4 text-sm text-muted">
              <span className="font-display text-2xl font-semibold text-ink">4</span>
              <span className="ml-2">Versuche · kein Konto gesperrt</span>
            </p>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader title="Letzte Systemaktivitäten" hint="Auszug aus dem globalen Audit-Log" />
        <Table head={["Zeitpunkt", "Mandant", "Benutzer", "Aktion"]}>
          {auditLog.slice(0, 5).map((a) => (
            <tr key={a.id} className="hover:bg-paper">
              <Td className="whitespace-nowrap text-muted">{a.zeitpunkt}</Td>
              <Td>{a.tenant}</Td>
              <Td>{a.benutzer}</Td>
              <Td className="text-ink">{a.aktion}</Td>
            </tr>
          ))}
        </Table>
      </Card>

      <DummyNote />
    </>
  );
}
