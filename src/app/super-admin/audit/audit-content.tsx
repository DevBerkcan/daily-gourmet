"use client";

import { useState } from "react";
import { PageHeader, Card, Table, Td, SearchInput, Pagination } from "@/components/ui";
import { useTenants, useGlobalAuditLog } from "@/lib/services/super-admin";
import { usePagination } from "@/lib/use-pagination";

export function AuditContent() {
  const tenants = useTenants();
  const [suche, setSuche] = useState("");
  const [tenantId, setTenantId] = useState("");
  const eintraege = useGlobalAuditLog({ tenantId: tenantId || undefined });
  const gefiltert = eintraege.filter((a) => `${a.benutzer} ${a.aktion}`.toLowerCase().includes(suche.toLowerCase()));
  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(gefiltert);

  return (
    <>
      <PageHeader title="Audit-Log" subtitle="Globale Änderungsprotokolle — Einträge können über die Oberfläche weder geändert noch gelöscht werden." />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
          <SearchInput placeholder="Benutzer oder Aktion suchen …" value={suche} onChange={(e) => setSuche(e.target.value)} />
          <select aria-label="Nach Mandant filtern" value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
            <option value="">Alle Mandanten</option>
            {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <Table head={["Zeitpunkt", "Mandant", "Benutzer", "Aktion", "Entität", "Begründung"]}>
          {pageItems.map((a) => (
            <tr key={a.id} className="hover:bg-paper">
              <Td className="whitespace-nowrap text-muted">{a.zeitpunkt}</Td>
              <Td>{a.tenantName ?? "Plattform"}</Td>
              <Td>{a.benutzer}</Td>
              <Td className="font-medium text-ink">{a.aktion}</Td>
              <Td className="text-muted">{a.entitaet} · {a.entitaetId}</Td>
              <Td className="max-w-56 text-muted">{a.begruendung ?? "—"}</Td>
            </tr>
          ))}
        </Table>
        <Pagination
          page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems}
          onPageChange={setPage} onPageSizeChange={setPageSize} pageSizeOptions={pageSizeOptions}
        />
      </Card>
    </>
  );
}
