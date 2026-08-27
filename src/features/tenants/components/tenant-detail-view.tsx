"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useIsFetching } from "@tanstack/react-query";
import { Lock, Pencil, RotateCcw, X } from "lucide-react";
import { Button, Card, CardHeader, LoadingState, PageHeader, StatusBadge, Table, Tag, Td } from "@/components/ui";
import { PromptDialog } from "@/components/ui/confirm-dialog";
import { useTenants, useUpdateTenant, useLockTenant, useUnlockTenant, useTenantUsers, useGlobalAuditLog } from "@/lib/services/super-admin";
import { SupportAccess } from "./support-access";
import { TenantProfileCard } from "./tenant-profile-card";
import { TenantSettingsCard } from "./tenant-settings-card";
import { TenantFacilitiesCard } from "./tenant-facilities-card";
import { TenantFeatureFlagsCard } from "./tenant-feature-flags-card";

const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil";

export function TenantDetailView({ tenantId }: { tenantId: string }) {
  const tenants = useTenants();
  const tenant = tenants.find((entry) => entry.id === tenantId);
  const ladend = useIsFetching({ queryKey: ["super-admin-tenants"] }) > 0 && tenants.length === 0;
  const updateTenant = useUpdateTenant();
  const lockTenant = useLockTenant();
  const unlockTenant = useUnlockTenant();
  const tenantUsers = useTenantUsers(tenantId);
  const tenantAudit = useGlobalAuditLog({ tenantId });
  const [bearbeiten, setBearbeiten] = useState(false);
  const [name, setName] = useState(tenant?.name ?? "");
  const [ansprechpartner, setAnsprechpartner] = useState(tenant?.ansprechpartner ?? "");
  const [email, setEmail] = useState(tenant?.email ?? "");
  const [sperrenDialog, setSperrenDialog] = useState(false);
  const [reaktivierenDialog, setReaktivierenDialog] = useState(false);

  if (!tenant) {
    if (ladend) return <Card><LoadingState text="Mandant wird geladen …" /></Card>;
    return (
      <Card className="p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Mandant nicht gefunden</h1>
        <p className="mt-2 text-sm text-muted">Dieser Mandant existiert nicht (mehr).</p>
        <div className="mt-5"><Button href="/super-admin/tenants">Zur Mandantenübersicht</Button></div>
      </Card>
    );
  }

  function editierenStarten() {
    setName(tenant!.name);
    setAnsprechpartner(tenant!.ansprechpartner);
    setEmail(tenant!.email);
    setBearbeiten(true);
  }

  function speichern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateTenant.mutate({ id: tenant!.id, input: { name: name.trim(), ansprechpartner: ansprechpartner.trim(), email: email.trim() } }, { onSuccess: () => setBearbeiten(false) });
  }

  function sperrenBestaetigt(grund: string) {
    lockTenant.mutate({ id: tenant!.id, grund });
    setSperrenDialog(false);
  }

  function reaktivierenBestaetigt(grund: string) {
    unlockTenant.mutate({ id: tenant!.id, grund });
    setReaktivierenDialog(false);
  }

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted">
        <Link href="/super-admin/tenants" className="hover:text-basil hover:underline">Mandanten</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{tenant.name}</span>
      </nav>

      <PageHeader
        title={tenant.name}
        subtitle={`Angelegt am ${new Date(tenant.erstelltAm).toLocaleDateString("de-DE")} · Tenant Owner: ${tenant.ansprechpartner} (${tenant.email})`}
        actions={
          <>
            <Button variant="secondary" onClick={editierenStarten}><Pencil size={15} aria-hidden /> Bearbeiten</Button>
            {tenant.status === "AKTIV" ? (
              <Button variant="danger" onClick={() => setSperrenDialog(true)}><Lock size={15} aria-hidden /> Mandant sperren</Button>
            ) : (
              <Button onClick={() => setReaktivierenDialog(true)}><RotateCcw size={15} aria-hidden /> Reaktivieren</Button>
            )}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={tenant.status} />
        <Tag>{tenant.benutzerAnzahl} Benutzer</Tag>
        <Tag>{tenant.einrichtungenAnzahl} Einrichtungen</Tag>
        <Tag tone="green">Tenant Owner: {tenant.ansprechpartner}</Tag>
      </div>

      {bearbeiten ? (
        <Card className="mb-6">
          <CardHeader title="Mandant bearbeiten" hint="Stammdaten und verantwortlichen Tenant Owner verwalten" actions={<button type="button" onClick={() => setBearbeiten(false)} aria-label="Bearbeitung schließen" className="rounded-lg p-2 text-muted hover:bg-paper hover:text-ink"><X size={18} aria-hidden /></button>} />
          <form onSubmit={speichern} className="grid gap-4 p-5 md:grid-cols-3">
            <label className="text-xs font-medium text-muted">Unternehmen<input required value={name} onChange={(event) => setName(event.target.value)} className={`mt-1.5 ${fieldClass}`} /></label>
            <label className="text-xs font-medium text-muted">Tenant Owner<input required value={ansprechpartner} onChange={(event) => setAnsprechpartner(event.target.value)} className={`mt-1.5 ${fieldClass}`} /></label>
            <label className="text-xs font-medium text-muted">E-Mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={`mt-1.5 ${fieldClass}`} /></label>
            <div className="flex gap-2 md:col-span-3"><Button type="submit">Änderungen speichern</Button><Button variant="secondary" onClick={() => setBearbeiten(false)}>Abbrechen</Button></div>
          </form>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Benutzer des Mandanten" hint="Rollen und Zugänge des Catering-Unternehmens" />
            {tenantUsers.length ? (
              <Table head={["Name", "Rolle", "Status", "Letzte Anmeldung"]}>
                {tenantUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-paper">
                    <Td><span className="font-medium text-ink">{user.name}</span><span className="block text-xs text-muted">{user.email}</span></Td>
                    <Td><Tag tone="green">{user.rolle}</Tag></Td>
                    <Td><StatusBadge status={user.status} /></Td>
                    <Td className="text-muted">{user.letzteAnmeldung ? new Date(user.letzteAnmeldung).toLocaleString("de-DE") : "—"}</Td>
                  </tr>
                ))}
              </Table>
            ) : <p className="px-5 py-6 text-sm text-muted">Noch keine weiteren Benutzer angelegt.</p>}
          </Card>

          <TenantFacilitiesCard tenantId={tenant.id} />
          <TenantProfileCard tenantId={tenant.id} />
          <TenantSettingsCard tenantId={tenant.id} />

          <Card>
            <CardHeader title="Aktivitäts- und Audit-Log" hint="Nachvollziehbare Änderungen im Mandanten" />
            {tenantAudit.length ? (
              <Table head={["Zeitpunkt", "Benutzer", "Aktion", "Begründung"]}>
                {tenantAudit.map((entry) => (
                  <tr key={entry.id} className="hover:bg-paper">
                    <Td className="whitespace-nowrap text-muted">{entry.zeitpunkt}</Td><Td>{entry.benutzer}</Td><Td>{entry.aktion}</Td><Td className="text-muted">{entry.begruendung ?? "—"}</Td>
                  </tr>
                ))}
              </Table>
            ) : <p className="px-5 py-6 text-sm text-muted">Für diesen Mandanten liegen noch keine protokollierten Aktivitäten vor.</p>}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card><CardHeader title="Supportzugriff" hint="Sichtbar, zeitlich begrenzt und protokolliert" /><SupportAccess tenantId={tenant.id} tenantName={tenant.name} /></Card>
          <TenantFeatureFlagsCard tenantId={tenant.id} />
          <Card>
            <CardHeader title="Berechtigungsmodell" hint="Klare Trennung zwischen Plattform und Mandant" />
            <dl className="space-y-4 p-5 text-sm">
              <div><dt className="font-semibold text-ink">Super Admin · Softwareinhaber</dt><dd className="mt-1 text-muted">Vollzugriff auf Mandanten, Module, Support und Aktivitätsprotokolle.</dd></div>
              <div><dt className="font-semibold text-ink">Tenant Owner · Firmenleitung</dt><dd className="mt-1 text-muted">Verwaltet Daily Gourmet, Benutzer, Küche, Kunden, Bestellungen und Logistik.</dd></div>
              <div><dt className="font-semibold text-ink">Fachrollen</dt><dd className="mt-1 text-muted">Küche, Fahrer und Einrichtungen sehen nur ihre jeweiligen Arbeitsbereiche.</dd></div>
            </dl>
          </Card>
        </div>
      </div>

      <PromptDialog
        open={sperrenDialog}
        title="Mandant sperren"
        label="Begründung für die Sperrung"
        placeholder="z. B. Zahlungsrückstand"
        confirmLabel="Sperren"
        onCancel={() => setSperrenDialog(false)}
        onConfirm={sperrenBestaetigt}
      />
      <PromptDialog
        open={reaktivierenDialog}
        title="Mandant reaktivieren"
        label="Begründung für die Reaktivierung"
        placeholder="z. B. Zahlung eingegangen"
        confirmLabel="Reaktivieren"
        onCancel={() => setReaktivierenDialog(false)}
        onConfirm={reaktivierenBestaetigt}
      />
    </>
  );
}
