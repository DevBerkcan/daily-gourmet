"use client";

import { useState } from "react";
import { PageHeader, Card, Table, Td, StatusBadge, SearchInput, Tag } from "@/components/ui";
import { useTenants, useGlobalUsers } from "@/lib/services/super-admin";

const ROLLEN = ["TENANT_OWNER", "TENANT_ADMIN", "KITCHEN_MANAGER", "KITCHEN_STAFF", "FACILITY_ADMIN", "FACILITY_USER", "DRIVER", "READ_ONLY"];

export function UsersContent() {
  const tenants = useTenants();
  const [suche, setSuche] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [rolle, setRolle] = useState("");
  const benutzer = useGlobalUsers({ tenantId: tenantId || undefined, role: rolle || undefined });
  const gefiltert = benutzer.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(suche.toLowerCase()));

  return (
    <>
      <PageHeader title="Benutzer" subtitle="Globale Benutzerübersicht über alle Mandanten — nur lesend, Verwaltung erfolgt im jeweiligen Mandanten." />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
          <SearchInput placeholder="Name oder E-Mail suchen …" value={suche} onChange={(e) => setSuche(e.target.value)} />
          <select aria-label="Nach Mandant filtern" value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option value="">Alle Mandanten</option>
            {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select aria-label="Nach Rolle filtern" value={rolle} onChange={(e) => setRolle(e.target.value)} className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option value="">Alle Rollen</option>
            {ROLLEN.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <Table head={["Benutzer", "Mandant", "Rolle", "Status", "Letzte Anmeldung", "Fehlversuche"]}>
          {gefiltert.map((u) => (
            <tr key={u.id} className="hover:bg-paper">
              <Td>
                <span className="font-medium text-ink">{u.name}</span>
                <span className="block text-xs text-muted">{u.email}</span>
              </Td>
              <Td>{u.tenantName ?? <Tag>Plattform</Tag>}</Td>
              <Td><Tag tone="green">{u.rolle}</Tag></Td>
              <Td><StatusBadge status={u.status} /></Td>
              <Td className="text-muted">{u.letzteAnmeldung ? new Date(u.letzteAnmeldung).toLocaleString("de-DE") : "—"}</Td>
              <Td className={u.fehlgeschlageneLogins > 0 ? "font-medium text-warn" : "text-muted"}>{u.fehlgeschlageneLogins}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
