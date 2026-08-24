"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button, Card, CardHeader, StatusBadge, Table, Td, Pagination } from "@/components/ui";
import { useTenants, useCreateTenant } from "@/lib/services/super-admin";
import type { TenantStatus } from "@/lib/services/super-admin";
import { usePagination } from "@/lib/use-pagination";

const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm";

export function TenantsManager() {
  const tenants = useTenants();
  const createTenant = useCreateTenant();
  const [suche, setSuche] = useState("");
  const [status, setStatus] = useState<"ALLE" | TenantStatus>("ALLE");
  const [offen, setOffen] = useState(false);
  const [name, setName] = useState("");
  const [kontakt, setKontakt] = useState("");
  const [email, setEmail] = useState("");

  const gefiltert = tenants.filter(
    (tenant) => (status === "ALLE" || tenant.status === status) && `${tenant.name} ${tenant.ansprechpartner}`.toLowerCase().includes(suche.toLowerCase())
  );
  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(gefiltert);

  function speichern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createTenant.mutate(
      { name: name.trim(), ansprechpartner: kontakt.trim(), email: email.trim() },
      { onSuccess: () => { setName(""); setKontakt(""); setEmail(""); setOffen(false); } }
    );
  }

  return (
    <>
      {offen ? (
        <Card className="mb-6">
          <CardHeader title="Neuen Mandanten anlegen" hint="Nur der Super Admin kann Catering-Unternehmen auf der Plattform anlegen." />
          <form onSubmit={speichern} className="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3">
            <label className="text-xs font-medium text-muted">
              Unternehmen
              <input value={name} onChange={(event) => setName(event.target.value)} required className={`mt-1.5 ${fieldClass}`} />
            </label>
            <label className="text-xs font-medium text-muted">
              Tenant Owner
              <input value={kontakt} onChange={(event) => setKontakt(event.target.value)} required className={`mt-1.5 ${fieldClass}`} />
            </label>
            <label className="text-xs font-medium text-muted sm:col-span-2 md:col-span-1">
              E-Mail
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className={`mt-1.5 ${fieldClass}`} />
            </label>
            <div className="flex gap-2 sm:col-span-2 md:col-span-3">
              <Button type="submit">Mandant anlegen</Button>
              <Button variant="secondary" onClick={() => setOffen(false)}>Abbrechen</Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="mb-6 flex justify-end">
          <Button onClick={() => setOffen(true)}><Plus size={16} aria-hidden /> Mandant anlegen</Button>
        </div>
      )}
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-line px-5 py-3.5">
          <label className="relative min-w-56 flex-1">
            <Search size={16} className="absolute left-3 top-3 text-muted" aria-hidden />
            <span className="sr-only">Mandant suchen</span>
            <input
              type="search" value={suche} onChange={(event) => setSuche(event.target.value)} placeholder="Mandant suchen …"
              className="min-h-10 w-full rounded-lg border border-line pl-9 pr-3 text-sm"
            />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value as "ALLE" | TenantStatus)} aria-label="Nach Status filtern" className={fieldClass}>
            <option value="ALLE">Alle Status</option>
            <option value="AKTIV">Aktiv</option>
            <option value="GESPERRT">Gesperrt</option>
            <option value="ARCHIVIERT">Archiviert</option>
          </select>
        </div>
        <Table head={["Mandant", "Status", "Tenant Owner", "Angelegt", "Benutzer", "Einrichtungen"]}>
          {pageItems.map((tenant) => (
            <tr key={tenant.id}>
              <Td className="font-medium"><Link href={`/super-admin/tenants/${tenant.id}`} className="text-basil hover:underline">{tenant.name}</Link></Td>
              <Td><StatusBadge status={tenant.status} /></Td>
              <Td><p>{tenant.ansprechpartner}</p><p className="text-xs text-muted">{tenant.email}</p></Td>
              <Td className="text-muted">{new Date(tenant.erstelltAm).toLocaleDateString("de-DE")}</Td>
              <Td>{tenant.benutzerAnzahl}</Td>
              <Td>{tenant.einrichtungenAnzahl}</Td>
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
