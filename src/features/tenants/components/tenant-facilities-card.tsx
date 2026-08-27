"use client";

import { useState } from "react";
import { Card, CardHeader, Table, Td, StatusBadge, Button } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { PromptDialog } from "@/components/ui/confirm-dialog";
import { TextField, NumberField, CheckboxGroup } from "@/components/ui/form-fields";
import { ApiError } from "@/lib/api/client";
import {
  useAllLocations,
  useTenantFacilities,
  useCreateTenantFacility,
  useUpdateTenantFacility,
  useTenantFacilityDeleteImpact,
  useDeleteTenantFacility,
} from "@/lib/services/super-admin";
import type { Einrichtung } from "@/lib/services/facilities";
import { Pencil, Plus, Trash2, X } from "lucide-react";

const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/** Einrichtungen eines einzelnen Mandanten, verwaltet vom Super Admin — Pendant zu
 * admin/facilities/facilities-manager.tsx, aber über die tenantId-parametrisierten
 * /super-admin/tenants/{tenantId}/facilities-Routen statt der eigenen Mandanten-Session. */
export function TenantFacilitiesCard({ tenantId }: { tenantId: string }) {
  const toast = useToast();
  const einrichtungen = useTenantFacilities(tenantId);
  const standorte = useAllLocations(tenantId);
  const [formularOffen, setFormularOffen] = useState(false);
  const [bearbeiteEinrichtung, setBearbeiteEinrichtung] = useState<Einrichtung | null>(null);
  const [loescheEinrichtung, setLoescheEinrichtung] = useState<Einrichtung | null>(null);
  const { impact } = useTenantFacilityDeleteImpact(tenantId, loescheEinrichtung?.id ?? null);
  const deleteEinrichtung = useDeleteTenantFacility(tenantId);

  return (
    <Card>
      <CardHeader
        title="Einrichtungen des Mandanten"
        hint="Schulen, Kitas und weitere Abnehmer dieses Mandanten"
        actions={<Button variant="secondary" onClick={() => setFormularOffen(true)}><Plus size={15} aria-hidden /> Einrichtung anlegen</Button>}
      />

      {formularOffen && (
        <EinrichtungFormular tenantId={tenantId} standorte={standorte} onClose={() => setFormularOffen(false)} />
      )}
      {bearbeiteEinrichtung && (
        <EinrichtungFormular tenantId={tenantId} standorte={standorte} initial={bearbeiteEinrichtung} onClose={() => setBearbeiteEinrichtung(null)} />
      )}

      {einrichtungen.length ? (
        <Table head={["Einrichtung", "Ansprechpartner", "Status", ""]}>
          {einrichtungen.map((e) => (
            <tr key={e.id} className="hover:bg-paper">
              <Td><span className="font-medium text-ink">{e.name}</span><span className="block text-xs text-muted">{e.kundennummer}</span></Td>
              <Td><span>{e.ansprechpartner}</span><span className="block text-xs text-muted">{e.email}</span></Td>
              <Td><StatusBadge status={e.status} /></Td>
              <Td>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setBearbeiteEinrichtung(e)} aria-label={`${e.name} bearbeiten`} className="flex cursor-pointer items-center gap-1 text-xs font-medium text-basil hover:underline">
                    <Pencil size={13} aria-hidden /> Bearbeiten
                  </button>
                  <button type="button" onClick={() => setLoescheEinrichtung(e)} aria-label={`${e.name} löschen`} className="flex cursor-pointer items-center gap-1 text-xs font-medium text-danger hover:underline">
                    <Trash2 size={13} aria-hidden /> Löschen
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      ) : (
        <p className="px-5 py-6 text-sm text-muted">Dieser Mandant hat noch keine Einrichtungen angelegt.</p>
      )}

      <PromptDialog
        open={!!loescheEinrichtung}
        title={loescheEinrichtung ? `${loescheEinrichtung.name} endgültig löschen` : ""}
        message={
          loescheEinrichtung && (
            <p>
              Diese Einrichtung hat {impact ? (
                <>
                  <strong>{impact.bestellungen}</strong> Bestellung(en), <strong>{impact.tourStopps}</strong> Tour-Stopp(s),{" "}
                  <strong>{impact.benutzer}</strong> Benutzerkonto(en) und <strong>{impact.schliesstage}</strong> Schließtag(e)
                </>
              ) : "Bestellungen, Benutzerkonten und Schließtage"} — alle werden unwiderruflich gelöscht (Benutzerkonten werden
              stattdessen deaktiviert). Zum Bestätigen bitte den Namen <strong>{loescheEinrichtung.name}</strong> eingeben.
            </p>
          )
        }
        label="Name der Einrichtung"
        placeholder={loescheEinrichtung?.name}
        confirmLabel="Endgültig löschen"
        onCancel={() => setLoescheEinrichtung(null)}
        onConfirm={(wert) => {
          if (!loescheEinrichtung) return;
          if (wert.trim() !== loescheEinrichtung.name) {
            toast.error("Name stimmt nicht überein. Löschen abgebrochen.");
            return;
          }
          deleteEinrichtung.mutate(loescheEinrichtung.id, {
            onSuccess: () => { toast.success("Einrichtung wurde gelöscht."); setLoescheEinrichtung(null); },
            onError: () => toast.error("Löschen fehlgeschlagen. Bitte erneut versuchen."),
          });
        }}
      />
    </Card>
  );
}

function EinrichtungFormular({
  tenantId,
  standorte,
  initial,
  onClose,
}: {
  tenantId: string;
  standorte: ReturnType<typeof useAllLocations>;
  initial?: Einrichtung;
  onClose: () => void;
}) {
  const toast = useToast();
  const createEinrichtung = useCreateTenantFacility(tenantId);
  const updateEinrichtung = useUpdateTenantFacility(tenantId);
  const [name, setName] = useState(initial?.name ?? "");
  const [anschrift, setAnschrift] = useState(initial?.anschrift ?? "");
  const [ansprechpartner, setAnsprechpartner] = useState(initial?.ansprechpartner ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [telefon, setTelefon] = useState(initial?.telefon ?? "");
  const [standortId, setStandortId] = useState(initial?.standortId ?? standorte[0]?.id ?? "");
  const [routeNummer, setRouteNummer] = useState(initial?.routeNummer ?? "");
  const [portionspreis, setPortionspreis] = useState(initial?.portionspreis ?? 5);
  const [wochentage, setWochentage] = useState<string[]>(initial?.aktiveWochentage ?? ["Mo", "Di", "Mi", "Do", "Fr"]);
  const [status, setStatus] = useState<Einrichtung["status"]>(initial?.status ?? "AKTIV");

  const mutation = initial ? updateEinrichtung : createEinrichtung;
  const kannSpeichern =
    name.trim() !== "" && anschrift.trim() !== "" && ansprechpartner.trim() !== "" &&
    email.trim() !== "" && telefon.trim() !== "" && standortId !== "" && !mutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kannSpeichern) return;
    const werte = {
      name: name.trim(), anschrift: anschrift.trim(), ansprechpartner: ansprechpartner.trim(),
      email: email.trim(), telefon: telefon.trim(), standortId, aktiveWochentage: wochentage,
      portionspreis, routeNummer: routeNummer.trim() || undefined,
    };
    if (initial) {
      updateEinrichtung.mutate(
        { id: initial.id, input: { ...werte, status } },
        { onSuccess: () => { onClose(); toast.success("Einrichtung wurde gespeichert."); }, onError: () => toast.error("Speichern fehlgeschlagen. Bitte erneut versuchen.") }
      );
    } else {
      createEinrichtung.mutate(werte, {
        onSuccess: (data) => {
          onClose();
          toast.success(data.adminInvited ? `Einrichtung wurde angelegt. Zugangsdaten wurden an ${data.email} gesendet.` : "Einrichtung wurde angelegt.");
        },
        onError: (error) => toast.error(error instanceof ApiError && error.status === 409 ? error.message : "Speichern fehlgeschlagen. Bitte erneut versuchen."),
      });
    }
  }

  return (
    <div className="border-b border-line px-5 py-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{initial ? `${initial.name} bearbeiten` : "Neue Einrichtung"}</h3>
        <button type="button" onClick={onClose} aria-label="Schließen" className="cursor-pointer text-muted hover:text-ink"><X size={18} aria-hidden /></button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Name" value={name} onChange={setName} required />
          <TextField label="Anschrift" value={anschrift} onChange={setAnschrift} required />
          <TextField label="Ansprechpartner" value={ansprechpartner} onChange={setAnsprechpartner} required />
          <TextField label="E-Mail" value={email} onChange={setEmail} required hint="Wird als Zugang für die Einrichtung verwendet" />
          <TextField label="Telefon" value={telefon} onChange={setTelefon} required />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Standort</span>
            <select value={standortId} onChange={(e) => setStandortId(e.target.value)} className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil">
              {standorte.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <NumberField label="Preis je Portion" value={portionspreis} onChange={setPortionspreis} min={0} step={0.1} suffix="€" />
          <TextField label="Tour" value={routeNummer} onChange={setRouteNummer} placeholder="z. B. RT1" />
          {initial && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as Einrichtung["status"])} className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil">
                <option value="AKTIV">Aktiv</option>
                <option value="INAKTIV">Inaktiv</option>
              </select>
            </label>
          )}
        </div>
        <CheckboxGroup label="Aktive Liefertage" options={WOCHENTAGE} selected={wochentage} onToggle={(t) => setWochentage((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))} />
        {mutation.isError && <p className="text-sm text-danger">Speichern fehlgeschlagen. Bitte erneut versuchen.</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Abbrechen</Button>
          <Button type="submit" disabled={!kannSpeichern}>{mutation.isPending ? "Wird gespeichert …" : "Einrichtung speichern"}</Button>
        </div>
      </form>
    </div>
  );
}
