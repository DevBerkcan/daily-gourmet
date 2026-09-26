"use client";

import { type FormEvent, useState } from "react";
import { PageHeader, Card, Button, ACTION_ICONS, Table, Td, StatusBadge, SearchInput, Tag, Pagination } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog, InviteLinkDialog, Modal } from "@/components/ui/confirm-dialog";
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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [rolle, setRolle] = useState("TENANT_ADMIN");
  const [tenantId, setTenantId] = useState("");
  const [inviteResult, setInviteResult] = useState<{ username: string; link: string } | null>(null);
  const brauchtMandant = rolle !== "SUPER_ADMIN";

  function speichern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createUser.mutate(
      { name: name.trim(), username: username.trim(), email: email.trim(), role: rolle, tenantId: brauchtMandant ? tenantId : undefined },
      {
        onSuccess: (data) => {
          setName(""); setUsername(""); setEmail(""); setRolle("TENANT_ADMIN"); setTenantId("");
          if (data.inviteLink) setInviteResult({ username: data.username, link: data.inviteLink });
          else onDone();
        },
      }
    );
  }

  if (inviteResult) {
    return (
      <InviteLinkDialog
        open
        title="Benutzer wurde angelegt"
        username={inviteResult.username}
        link={inviteResult.link}
        onClose={() => { setInviteResult(null); onDone(); }}
      />
    );
  }

  return (
    <Modal open onClose={onDone} title="Neuen Benutzer anlegen" hint="Nach dem Anlegen erhalten Sie einen Link, um das Passwort für die Person festzulegen.">
      <form onSubmit={speichern} className="grid gap-4 p-5 md:grid-cols-2">
        <label className="text-xs font-medium text-muted">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required className={`mt-1.5 ${fieldClass}`} />
        </label>
        <label className="text-xs font-medium text-muted">
          Benutzername (Login)
          <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} pattern="[a-z0-9._-]+" title="Nur Kleinbuchstaben, Zahlen, Punkt, Unterstrich oder Bindestrich" className={`mt-1.5 ${fieldClass}`} />
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
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button type="submit" loading={createUser.isPending} icon={ACTION_ICONS.create} label="Benutzer anlegen" showLabel />
          <Button variant="secondary" onClick={onDone} icon={ACTION_ICONS.cancel} label="Abbrechen" showLabel />
        </div>
      </form>
    </Modal>
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
  const [resetBenutzer, setResetBenutzer] = useState<GlobalUser | null>(null);
  const [resetLinkResult, setResetLinkResult] = useState<{ username: string; link: string } | null>(null);
  const benutzer = useGlobalUsers({ tenantId: tenantId || undefined, role: rolle || undefined });
  const gefiltert = benutzer.filter((u) => `${u.name} ${u.username} ${u.email}`.toLowerCase().includes(suche.toLowerCase()));
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
        actions={!formularOffen && <Button onClick={() => setFormularOffen(true)} icon={ACTION_ICONS.create} label="Benutzer anlegen" showLabel />}
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
                <span className="block break-all text-xs text-muted">@{u.username} · {u.email}</span>
              </Td>
              <Td>{u.tenantName ?? <Tag>Plattform</Tag>}</Td>
              <Td><Tag tone="green">{u.rolle}</Tag></Td>
              <Td><StatusBadge status={u.status} /></Td>
              <Td className="text-muted">{u.letzteAnmeldung ? new Date(u.letzteAnmeldung).toLocaleString("de-DE") : "—"}</Td>
              <Td className={u.fehlgeschlageneLogins > 0 ? "font-medium text-warn" : "text-muted"}>{u.fehlgeschlageneLogins}</Td>
              <Td className="no-print">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button size="sm" variant="ghost" icon={ACTION_ICONS.edit} label={`${u.name} bearbeiten`} onClick={() => setBearbeiteBenutzer(u)} />
                  <Button size="sm" variant="ghost" icon={ACTION_ICONS.password} label={`Passwort von ${u.name} zurücksetzen`} onClick={() => setResetBenutzer(u)} />
                  {u.status === "DEAKTIVIERT" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={ACTION_ICONS.userActivate}
                      label={`${u.name} aktivieren`}
                      onClick={() => activateUser.mutate(u.id, { onSuccess: () => toast.success("Benutzer wurde aktiviert."), onError: () => toast.error("Aktivieren fehlgeschlagen.") })}
                    />
                  ) : (
                    <Button
                      size="sm"
                      variant="danger"
                      icon={ACTION_ICONS.userDeactivate}
                      label={`${u.name} deaktivieren`}
                      onClick={() => deactivateUser.mutate(u.id, { onSuccess: () => toast.success("Benutzer wurde deaktiviert."), onError: () => toast.error("Deaktivieren fehlgeschlagen.") })}
                    />
                  )}
                  <Button size="sm" variant="danger" icon={ACTION_ICONS.delete} label={`${u.name} endgültig löschen`} onClick={() => setLoescheBenutzer(u)} />
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
            <strong>{loescheBenutzer?.name}</strong> (<span className="break-all">{loescheBenutzer?.email}</span>) wird unwiderruflich gelöscht — anders als „Deaktivieren“ kann das nicht rückgängig gemacht werden.
            Ist der Benutzer noch mit anderen Datensätzen verknüpft (z. B. Rezepten, Bestellungen, Support-Tickets), schlägt das Löschen fehl; deaktivieren Sie ihn dann stattdessen.
          </>
        }
        confirmLabel="Endgültig löschen"
        confirmIcon={ACTION_ICONS.delete}
        onCancel={() => setLoescheBenutzer(null)}
        onConfirm={loeschenBestaetigt}
      />
      <ConfirmDialog
        open={!!resetBenutzer}
        title="Passwort zurücksetzen"
        message={<>An <strong className="break-all">{resetBenutzer?.email}</strong> wird ein Link zum Festlegen eines neuen Passworts gesendet. Das aktuelle Passwort bleibt bis dahin gültig.</>}
        confirmLabel="Link senden"
        confirmIcon={ACTION_ICONS.send}
        onCancel={() => setResetBenutzer(null)}
        onConfirm={() => {
          if (!resetBenutzer) return;
          resetPassword.mutate(resetBenutzer.id, {
            onSuccess: (data) => setResetLinkResult({ username: resetBenutzer.username, link: data.link }),
            onError: () => toast.error("Zurücksetzen fehlgeschlagen. Bitte erneut versuchen."),
          });
          setResetBenutzer(null);
        }}
      />
      <InviteLinkDialog
        open={!!resetLinkResult}
        title="Neuer Link zum Passwort festlegen"
        username={resetLinkResult?.username}
        link={resetLinkResult?.link ?? ""}
        onClose={() => setResetLinkResult(null)}
      />
    </>
  );
}
