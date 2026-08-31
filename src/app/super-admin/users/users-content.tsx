"use client";

import { type FormEvent, useState } from "react";
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { PageHeader, Card, CardHeader, Button, Table, Td, StatusBadge, SearchInput, Tag, Pagination } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useTenants,
  useGlobalUsers,
  useCreateUser,
  useDeactivateGlobalUser,
  useActivateGlobalUser,
  useResetGlobalUserPassword,
  useDeleteGlobalUser,
  type GlobalUser,
} from "@/lib/services/super-admin";
import { EditUserForm, ANLEGBARE_ROLLEN, ROLLEN } from "@/features/users/components/edit-user-form";
import { ApiError } from "@/lib/api/client";
import { usePagination } from "@/lib/use-pagination";

const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm";

function CreateUserForm({ onDone }: { onDone: () => void }) {
  const tenants = useTenants();
  const createUser = useCreateUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rolle, setRolle] = useState("TENANT_ADMIN");
  const [tenantId, setTenantId] = useState("");
  const brauchtMandant = rolle !== "SUPER_ADMIN";

  function speichern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createUser.mutate(
      { name: name.trim(), email: email.trim(), role: rolle, tenantId: brauchtMandant ? tenantId : undefined },
      { onSuccess: () => { setName(""); setEmail(""); setRolle("TENANT_ADMIN"); setTenantId(""); onDone(); } }
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader title="Neuen Benutzer anlegen" hint="Der Benutzer erhält eine E-Mail mit einem Link, um sein Passwort festzulegen." />
      <form onSubmit={speichern} className="grid gap-4 p-5 md:grid-cols-2">
        <label className="text-xs font-medium text-muted">
          Benutzername
          <input value={name} onChange={(e) => setName(e.target.value)} required className={`mt-1.5 ${fieldClass}`} />
        </label>
        <label className="text-xs font-medium text-muted">
          E-Mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`mt-1.5 ${fieldClass}`} />
        </label>
        <label className="text-xs font-medium text-muted">
          Rolle
          <select value={rolle} onChange={(e) => setRolle(e.target.value)} required className={`mt-1.5 ${fieldClass}`}>
            {ANLEGBARE_ROLLEN.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-muted">
          Mandant
          <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} required={brauchtMandant} disabled={!brauchtMandant} className={`mt-1.5 ${fieldClass} disabled:opacity-50`}>
            <option value="">{brauchtMandant ? "Mandant wählen …" : "Nicht erforderlich (Plattform)"}</option>
            {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        {createUser.isError && (
          <p className="text-sm text-danger md:col-span-2">
            {createUser.error instanceof ApiError ? createUser.error.message : "Der Benutzer konnte nicht angelegt werden."}
          </p>
        )}
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={createUser.isPending}>{createUser.isPending ? "Wird angelegt …" : "Benutzer anlegen"}</Button>
          <Button variant="secondary" onClick={onDone}>Abbrechen</Button>
        </div>
      </form>
    </Card>
  );
}

export function UsersContent() {
  const toast = useToast();
  const tenants = useTenants();
  const [suche, setSuche] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [rolle, setRolle] = useState("");
  const [formularOffen, setFormularOffen] = useState(false);
  const [bearbeiteBenutzer, setBearbeiteBenutzer] = useState<GlobalUser | null>(null);
  const [loescheBenutzer, setLoescheBenutzer] = useState<GlobalUser | null>(null);
  const benutzer = useGlobalUsers({ tenantId: tenantId || undefined, role: rolle || undefined });
  const gefiltert = benutzer.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(suche.toLowerCase()));
  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(gefiltert);
  const deactivateUser = useDeactivateGlobalUser();
  const activateUser = useActivateGlobalUser();
  const resetPassword = useResetGlobalUserPassword();
  const deleteUser = useDeleteGlobalUser();

  function loeschenBestaetigt() {
    if (!loescheBenutzer) return;
    deleteUser.mutate(loescheBenutzer.id, {
      onSuccess: () => toast.success(`${loescheBenutzer.name} wurde endgültig gelöscht.`),
      onError: (error) => toast.error(error instanceof ApiError ? error.message : "Löschen fehlgeschlagen. Bitte erneut versuchen."),
    });
    setLoescheBenutzer(null);
  }

  return (
    <>
      <PageHeader
        title="Benutzer"
        subtitle="Globale Benutzerübersicht über alle Mandanten."
        actions={!formularOffen && <Button onClick={() => setFormularOffen(true)}><Plus size={16} aria-hidden /> Benutzer anlegen</Button>}
      />
      {formularOffen && <CreateUserForm onDone={() => setFormularOffen(false)} />}
      {bearbeiteBenutzer && <EditUserForm user={bearbeiteBenutzer} onDone={() => setBearbeiteBenutzer(null)} />}
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
        <Table head={["Benutzer", "Mandant", "Rolle", "Status", "Letzte Anmeldung", "Fehlversuche", ""]}>
          {pageItems.map((u) => (
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
              <Td className="no-print">
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => setBearbeiteBenutzer(u)} aria-label={`${u.name} bearbeiten`} className="flex cursor-pointer items-center gap-1 text-xs font-medium text-basil hover:underline">
                    <Pencil size={13} aria-hidden /> Bearbeiten
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      resetPassword.mutate(u.id, {
                        onSuccess: () => toast.success(`Zurücksetzen-Link wurde an ${u.email} gesendet.`),
                        onError: () => toast.error("Zurücksetzen fehlgeschlagen. Bitte erneut versuchen."),
                      })
                    }
                    aria-label={`Passwort von ${u.name} zurücksetzen`}
                    className="flex cursor-pointer items-center gap-1 text-xs font-medium text-basil hover:underline"
                  >
                    <RotateCcw size={13} aria-hidden /> Passwort zurücksetzen
                  </button>
                  {u.status === "DEAKTIVIERT" ? (
                    <button
                      type="button"
                      onClick={() => activateUser.mutate(u.id, { onSuccess: () => toast.success("Benutzer wurde aktiviert."), onError: () => toast.error("Aktivieren fehlgeschlagen.") })}
                      className="flex cursor-pointer items-center gap-1 text-xs font-medium text-basil hover:underline"
                    >
                      Aktivieren
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => deactivateUser.mutate(u.id, { onSuccess: () => toast.success("Benutzer wurde deaktiviert."), onError: () => toast.error("Deaktivieren fehlgeschlagen.") })}
                      className="flex cursor-pointer items-center gap-1 text-xs font-medium text-danger hover:underline"
                    >
                      Deaktivieren
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setLoescheBenutzer(u)}
                    aria-label={`${u.name} endgültig löschen`}
                    className="flex cursor-pointer items-center gap-1 text-xs font-medium text-danger hover:underline"
                  >
                    <Trash2 size={13} aria-hidden /> Löschen
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
        <Pagination
          page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems}
          onPageChange={setPage} onPageSizeChange={setPageSize} pageSizeOptions={pageSizeOptions}
        />
      </Card>
      <ConfirmDialog
        open={!!loescheBenutzer}
        title="Benutzer endgültig löschen"
        tone="warn"
        message={
          <>
            <strong>{loescheBenutzer?.name}</strong> ({loescheBenutzer?.email}) wird unwiderruflich gelöscht — anders als „Deaktivieren“ kann das nicht rückgängig gemacht werden.
            Ist der Benutzer noch mit anderen Datensätzen verknüpft (z. B. Rezepten, Bestellungen, Support-Tickets), schlägt das Löschen fehl; deaktivieren Sie ihn dann stattdessen.
          </>
        }
        confirmLabel="Endgültig löschen"
        onCancel={() => setLoescheBenutzer(null)}
        onConfirm={loeschenBestaetigt}
      />
    </>
  );
}
