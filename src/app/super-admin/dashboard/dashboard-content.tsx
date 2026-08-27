"use client";

import { PageHeader, StatCard, Card, CardHeader, Table, Td, StatusBadge } from "@/components/ui";
import { useTenants, useSuperAdminDashboard, useGlobalAuditLog, useFeatureFlagAdoption } from "@/lib/services/super-admin";
import { SupportSummary } from "./support-summary";

export function DashboardContent() {
  const tenants = useTenants();
  const dashboard = useSuperAdminDashboard();
  const auditLog = useGlobalAuditLog();
  const flagAdoption = useFeatureFlagAdoption();
  const aktiv = dashboard?.tenantCountsByStatus.AKTIV ?? 0;
  const gesperrt = dashboard?.tenantCountsByStatus.GESPERRT ?? 0;
  const archiviert = dashboard?.tenantCountsByStatus.ARCHIVIERT ?? 0;

  return (
    <>
      <PageHeader title="Plattform-Übersicht" subtitle="Status aller Mandanten, Benutzer und Systemdienste der Gentle-Group-Plattform." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Aktive Mandanten" value={String(aktiv)} hint={`${gesperrt} gesperrt · ${archiviert} archiviert`} />
        <StatCard label="Benutzer gesamt" value={String(dashboard?.totalUsers ?? "—")} hint={dashboard ? `${dashboard.activeUsersLast7Days} in den letzten 7 Tagen aktiv` : undefined} />
        <StatCard label="Einrichtungen" value={String(dashboard?.totalFacilities ?? "—")} hint="über alle Mandanten" />
        <StatCard label="Bestellungen diese KW" value={String(dashboard?.thisWeekOrderCount ?? "—")} tone="ok" />
      </div>

      <SupportSummary />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader title="Mandanten" hint="Alle Catering-Unternehmen der Plattform" />
          <Table head={["Mandant", "Status", "Benutzer", "Einrichtungen"]}>
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-paper">
                <Td className="font-medium text-ink">{t.name}</Td>
                <Td><StatusBadge status={t.status} /></Td>
                <Td>{t.benutzerAnzahl}</Td>
                <Td>{t.einrichtungenAnzahl}</Td>
              </tr>
            ))}
          </Table>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Systemstatus" hint="Health Checks" />
            <ul className="divide-y divide-line text-sm">
              <li className="flex items-center justify-between gap-3 px-5 py-3">
                <span className="text-ink">Backend-API (.NET)</span>
                <span className="text-xs font-medium text-ok">Erreichbar</span>
              </li>
            </ul>
          </Card>

          <Card>
            <CardHeader title="Top-Mandanten" hint="Nach Bestellungen diese Kalenderwoche" />
            {dashboard?.topTenantsByOrdersThisWeek.length ? (
              <ul className="divide-y divide-line text-sm">
                {dashboard.topTenantsByOrdersThisWeek.map((t) => (
                  <li key={t.tenantName} className="flex items-center justify-between gap-3 px-5 py-3">
                    <span className="text-ink">{t.tenantName}</span>
                    <span className="font-medium text-ink">{t.orderCount}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm text-muted">Diese Woche noch keine Bestellungen.</p>
            )}
          </Card>

          <Card>
            <CardHeader title="Fehlgeschlagene Logins" hint="Letzte 24 Stunden" />
            <p className="px-5 py-4 text-sm text-muted">
              <span className="font-display text-2xl font-semibold text-ink">{dashboard?.failedLoginsLast24h ?? "—"}</span>
              <span className="ml-2">Versuche</span>
            </p>
            {dashboard?.currentlyLockedOutUsers.length ? (
              <ul className="divide-y divide-line border-t border-line text-sm">
                {dashboard.currentlyLockedOutUsers.map((u) => (
                  <li key={u.email} className="px-5 py-3">
                    <p className="font-medium text-ink">{u.name} {u.tenantName && <span className="font-normal text-muted">· {u.tenantName}</span>}</p>
                    <p className="text-xs text-muted">Gesperrt bis {new Date(u.lockedUntil).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>

          <Card>
            <CardHeader title="Feature-Flag-Nutzung" hint="Aktiv über alle Mandanten" />
            <ul className="divide-y divide-line text-sm">
              {flagAdoption.map((f) => (
                <li key={f.key} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="text-ink">{f.name}</span>
                  <span className="text-muted">{f.enabledTenantCount}/{f.totalTenantCount}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader title="Letzte Systemaktivitäten" hint="Auszug aus dem globalen Audit-Log" />
        <Table head={["Zeitpunkt", "Mandant", "Benutzer", "Aktion"]}>
          {auditLog.slice(0, 5).map((a) => (
            <tr key={a.id} className="hover:bg-paper">
              <Td className="whitespace-nowrap text-muted">{a.zeitpunkt}</Td>
              <Td>{a.tenantName ?? "Plattform"}</Td>
              <Td>{a.benutzer}</Td>
              <Td className="text-ink">{a.aktion}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
