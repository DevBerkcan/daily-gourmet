"use client";

import { useMemo, useState } from "react";
import { PageHeader, Card, Table, Td, StatusBadge, Button, ACTION_ICONS, SearchInput, Pagination } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { PromptDialog, Modal, InviteLinkDialog } from "@/components/ui/confirm-dialog";
import { ApiError } from "@/lib/api/client";
import { TextField, NumberField, CheckboxGroup, TimeField, TextareaField } from "@/components/ui/form-fields";
import { useStandorte } from "@/lib/services/locations";
import {
  useEinrichtungen,
  useCreateEinrichtung,
  useUpdateEinrichtung,
  useDeleteEinrichtung,
  useEinrichtungLoeschImpact,
  type Einrichtung,
} from "@/lib/services/facilities";
import { usePagination } from "@/lib/use-pagination";

const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function FacilitiesManager() {
  const toast = useToast();
  const einrichtungen = useEinrichtungen();
  const standorte = useStandorte();
  const [suche, setSuche] = useState("");
  const [standortFilter, setStandortFilter] = useState("");
  const [formularOffen, setFormularOffen] = useState(false);
  const [bearbeiteEinrichtung, setBearbeiteEinrichtung] = useState<Einrichtung | null>(null);
  const [loescheEinrichtung, setLoescheEinrichtung] = useState<Einrichtung | null>(null);
  const { impact } = useEinrichtungLoeschImpact(loescheEinrichtung?.id ?? null);
  const deleteEinrichtung = useDeleteEinrichtung();

  const gefiltert = useMemo(() => {
    const s = suche.trim().toLowerCase();
    return einrichtungen.filter((e) => {
      const treffer = !s || e.name.toLowerCase().includes(s) || e.ansprechpartner.toLowerCase().includes(s);
      const amStandort = !standortFilter || e.standortId === standortFilter;
      return treffer && amStandort;
    });
  }, [einrichtungen, suche, standortFilter]);
  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(gefiltert);

  return (
    <>
      <PageHeader
        title="Einrichtungen"
        subtitle="Schulen, Kitas und weitere Abnehmer, die über das Kundenportal bestellen."
        actions={<Button onClick={() => setFormularOffen(true)} icon={ACTION_ICONS.create} label="Einrichtung anlegen" showLabel />}
      />

      {formularOffen && <EinrichtungFormular standorte={standorte} onClose={() => setFormularOffen(false)} />}
      {bearbeiteEinrichtung && (
        <EinrichtungFormular standorte={standorte} initial={bearbeiteEinrichtung} onClose={() => setBearbeiteEinrichtung(null)} />
      )}

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
          <SearchInput placeholder="Einrichtung suchen …" value={suche} onChange={(e) => setSuche(e.target.value)} />
          <select
            aria-label="Nach Standort filtern"
            value={standortFilter}
            onChange={(e) => setStandortFilter(e.target.value)}
            className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm"
          >
            <option value="">Alle Standorte</option>
            {standorte.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <Table head={["Einrichtung", "Ansprechpartner", "Standort", "Tour", "Liefertage", "Lieferfenster", "Preis/Portion", "Status", ""]}>
          {pageItems.map((e) => (
            <tr key={e.id} className="hover:bg-paper">
              <Td>
                <span className="font-medium text-ink">{e.name}</span>
                <span className="block text-xs text-muted">{e.kundennummer} · {e.anschrift}</span>
              </Td>
              <Td>
                <span>{e.ansprechpartner}</span>
                <span className="block text-xs text-muted">{e.email}</span>
              </Td>
              <Td className="text-muted">{e.standortName}</Td>
              <Td className="text-muted">{e.routeNummer ?? "—"}</Td>
              <Td className="text-muted">{e.aktiveWochentage.join(", ")}</Td>
              <Td className="text-muted">{e.lieferfensterStart && e.lieferfensterEnde ? `${e.lieferfensterStart}–${e.lieferfensterEnde}` : "—"}</Td>
              <Td>{e.portionspreis.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</Td>
              <Td><StatusBadge status={e.status} /></Td>
              <Td className="no-print">
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="ghost" icon={ACTION_ICONS.edit} label={`${e.name} bearbeiten`} onClick={() => setBearbeiteEinrichtung(e)} />
                  <Button size="sm" variant="danger" icon={ACTION_ICONS.delete} label={`${e.name} löschen`} onClick={() => setLoescheEinrichtung(e)} />
                </div>
              </Td>
            </tr>
          ))}
        </Table>
        {gefiltert.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted">Keine Einrichtung gefunden.</p>
        )}
        <Pagination
          page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems}
          onPageChange={setPage} onPageSizeChange={setPageSize} pageSizeOptions={pageSizeOptions}
        />
      </Card>

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
    </>
  );
}

function EinrichtungFormular({ standorte, initial, onClose }: { standorte: ReturnType<typeof useStandorte>; initial?: Einrichtung; onClose: () => void }) {
  const toast = useToast();
  const createEinrichtung = useCreateEinrichtung();
  const updateEinrichtung = useUpdateEinrichtung();
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
  const [lieferfensterStart, setLieferfensterStart] = useState(initial?.lieferfensterStart ?? "");
  const [lieferfensterEnde, setLieferfensterEnde] = useState(initial?.lieferfensterEnde ?? "");
  const [lieferdauerMinuten, setLieferdauerMinuten] = useState<number | "">(initial?.lieferdauerMinuten ?? "");
  const [lieferBesonderheiten, setLieferBesonderheiten] = useState(initial?.lieferBesonderheiten ?? "");
  const [inviteResult, setInviteResult] = useState<{ username: string; link: string } | null>(null);

  const mutation = initial ? updateEinrichtung : createEinrichtung;
  const kannSpeichern =
    name.trim() !== "" &&
    anschrift.trim() !== "" &&
    ansprechpartner.trim() !== "" &&
    email.trim() !== "" &&
    telefon.trim() !== "" &&
    standortId !== "" &&
    !mutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kannSpeichern) return;
    const werte = {
      name: name.trim(),
      anschrift: anschrift.trim(),
      ansprechpartner: ansprechpartner.trim(),
      email: email.trim(),
      telefon: telefon.trim(),
      standortId,
      aktiveWochentage: wochentage,
      portionspreis,
      routeNummer: routeNummer.trim() || undefined,
      lieferfensterStart: lieferfensterStart || undefined,
      lieferfensterEnde: lieferfensterEnde || undefined,
      lieferdauerMinuten: lieferdauerMinuten === "" ? undefined : lieferdauerMinuten,
      lieferBesonderheiten: lieferBesonderheiten.trim() || undefined,
    };
    if (initial) {
      updateEinrichtung.mutate(
        { id: initial.id, input: { ...werte, status } },
        {
          onSuccess: () => { onClose(); toast.success("Einrichtung wurde gespeichert."); },
          onError: () => toast.error("Speichern fehlgeschlagen. Bitte erneut versuchen."),
        }
      );
    } else {
      createEinrichtung.mutate(werte, {
        onSuccess: (data) => {
          if (data.adminInvited && data.adminInviteLink) {
            setInviteResult({ username: data.adminUsername ?? "", link: data.adminInviteLink });
          } else {
            onClose();
            toast.success("Einrichtung wurde angelegt.");
          }
        },
        onError: (error) =>
          toast.error(error instanceof ApiError && error.status === 409 ? error.message : "Speichern fehlgeschlagen. Bitte erneut versuchen."),
      });
    }
  }

  if (inviteResult) {
    return (
      <InviteLinkDialog
        open
        title="Einrichtung wurde angelegt"
        username={inviteResult.username}
        link={inviteResult.link}
        onClose={() => { setInviteResult(null); onClose(); }}
      />
    );
  }

  return (
    <Modal open onClose={onClose} title={initial ? `${initial.name} bearbeiten` : "Neue Einrichtung"} widthClassName="max-w-3xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Name" value={name} onChange={setName} required />
          <TextField label="Anschrift" value={anschrift} onChange={setAnschrift} required />
          <TextField label="Ansprechpartner" value={ansprechpartner} onChange={setAnsprechpartner} required />
          <TextField label="E-Mail" value={email} onChange={setEmail} required hint="Wird als Zugang für die Einrichtung verwendet" />
          <TextField label="Telefon" value={telefon} onChange={setTelefon} required />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Standort</span>
            <select
              value={standortId}
              onChange={(e) => setStandortId(e.target.value)}
              className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil"
            >
              {standorte.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <NumberField label="Preis je Portion" value={portionspreis} onChange={setPortionspreis} min={0} step={0.1} suffix="€" />
          <TextField label="Tour" value={routeNummer} onChange={setRouteNummer} placeholder="z. B. RT1" hint="Nummernkreis siehe Einstellungen" />
          <TimeField label="Lieferfenster ab" value={lieferfensterStart} onChange={setLieferfensterStart} hint="Optional, z. B. 07:30" />
          <TimeField label="Lieferfenster bis" value={lieferfensterEnde} onChange={setLieferfensterEnde} hint="Optional, z. B. 08:00" />
          <NumberField label="Lieferdauer vor Ort" value={lieferdauerMinuten} onChange={setLieferdauerMinuten} min={1} suffix="Min." hint="Standard 15 Min., falls leer" />
          {initial && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Einrichtung["status"])}
                className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil"
              >
                <option value="AKTIV">Aktiv</option>
                <option value="INAKTIV">Inaktiv</option>
              </select>
            </label>
          )}
        </div>
        <CheckboxGroup label="Aktive Liefertage" options={WOCHENTAGE} selected={wochentage} onToggle={(t) => setWochentage((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))} />
        <TextareaField
          label="Besonderheiten bei der Lieferung"
          value={lieferBesonderheiten}
          onChange={setLieferBesonderheiten}
          rows={2}
          placeholder="z. B. steile Treppe, kein Rollwagen möglich, Temperaturkontrolle"
        />
        {mutation.isError && <p className="text-sm text-danger">Speichern fehlgeschlagen. Bitte erneut versuchen.</p>}
        <div className="flex justify-end gap-2 no-print">
          <Button variant="secondary" onClick={onClose} icon={ACTION_ICONS.cancel} label="Abbrechen" showLabel />
          <Button type="submit" disabled={!kannSpeichern} loading={mutation.isPending} icon={ACTION_ICONS.save} label="Einrichtung speichern" showLabel />
        </div>
      </form>
    </Modal>
  );
}
