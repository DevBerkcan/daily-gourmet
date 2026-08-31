"use client";

import { type FormEvent, useState } from "react";
import { X } from "lucide-react";
import { Button, Card, CardHeader } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { useUpdateGlobalUser, useTenantFacilities, type GlobalUser } from "@/lib/services/super-admin";
import { ApiError } from "@/lib/api/client";

export const ROLLEN = ["TENANT_OWNER", "TENANT_ADMIN", "FACILITY_ADMIN", "FACILITY_USER", "DRIVER", "READ_ONLY"];
export const ANLEGBARE_ROLLEN = ["SUPER_ADMIN", ...ROLLEN];
const FACILITY_ROLLEN = ["FACILITY_ADMIN", "FACILITY_USER"];
const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm";

/** Geteilt zwischen /super-admin/users (globale Liste) und der Mandanten-Detailseite ("Benutzer des
 * Mandanten"), damit ein Benutzer an beiden Stellen auf dieselbe Weise bearbeitet werden kann. */
export function EditUserForm({ user, onDone }: { user: GlobalUser; onDone: () => void }) {
  const toast = useToast();
  const updateUser = useUpdateGlobalUser();
  const facilitiesOfTenant = useTenantFacilities(user.tenantId ?? "");
  const [name, setName] = useState(user.name);
  const [rolle, setRolle] = useState(user.rolle);
  const [facilityId, setFacilityId] = useState(user.facilityId ?? "");
  const brauchtEinrichtung = FACILITY_ROLLEN.includes(rolle);
  // Ein Wechsel zwischen Plattform- (SUPER_ADMIN) und Mandanten-Rolle ist serverseitig blockiert
  // (SuperAdminHandler.UpdateUserAsync bewegt kein TenantId mit) — die Auswahl bietet ihn deshalb nur
  // an, wenn der bearbeitete Benutzer ohnehin schon Super Admin ist (damit die aktuelle Rolle
  // wenigstens korrekt angezeigt wird), sonst gar nicht erst.
  const rollenOptionen = user.rolle === "SUPER_ADMIN" ? ANLEGBARE_ROLLEN : ROLLEN;

  function speichern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUser.mutate(
      { id: user.id, input: { name: name.trim(), role: rolle, facilityId: brauchtEinrichtung ? facilityId || null : null } },
      { onSuccess: () => { toast.success("Benutzer wurde gespeichert."); onDone(); }, onError: () => toast.error("Speichern fehlgeschlagen. Bitte erneut versuchen.") }
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader
        title={`${user.name} bearbeiten`}
        hint={user.tenantName ? `Mandant: ${user.tenantName}` : "Plattform-Konto"}
        actions={<button type="button" onClick={onDone} aria-label="Schließen" className="rounded-lg p-2 text-muted hover:bg-paper hover:text-ink"><X size={18} aria-hidden /></button>}
      />
      <form onSubmit={speichern} className="grid gap-4 p-5 md:grid-cols-2">
        <label className="text-xs font-medium text-muted">
          Benutzername
          <input value={name} onChange={(e) => setName(e.target.value)} required className={`mt-1.5 ${fieldClass}`} />
        </label>
        <label className="text-xs font-medium text-muted">
          Rolle
          <select value={rolle} onChange={(e) => setRolle(e.target.value)} required className={`mt-1.5 ${fieldClass}`}>
            {rollenOptionen.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        {brauchtEinrichtung && (
          <label className="text-xs font-medium text-muted md:col-span-2">
            Einrichtung
            <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} className={`mt-1.5 ${fieldClass}`}>
              <option value="">Keine Einrichtung zugeordnet</option>
              {facilitiesOfTenant.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </label>
        )}
        {updateUser.isError && (
          <p className="text-sm text-danger md:col-span-2">
            {updateUser.error instanceof ApiError ? updateUser.error.message : "Der Benutzer konnte nicht gespeichert werden."}
          </p>
        )}
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={updateUser.isPending}>{updateUser.isPending ? "Wird gespeichert …" : "Änderungen speichern"}</Button>
          <Button variant="secondary" onClick={onDone}>Abbrechen</Button>
        </div>
      </form>
    </Card>
  );
}
