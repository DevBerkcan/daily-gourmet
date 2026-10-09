"use client";

import { useRef, useState } from "react";
import { Card, CardHeader, Table, Td, Button, ACTION_ICONS } from "@/components/ui";
import { TextField } from "@/components/ui/form-fields";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
  useClearSupplierPrices,
  useImportSupplierPriceList,
  type Lieferant,
  type PreislistenImportErgebnis,
} from "@/lib/services/ingredients";

const fehlertext = (error: unknown, fallback: string) => (error instanceof ApiError ? error.message : fallback);

function LieferantZeile({
  lieferant, onBearbeiten, onLeeren, onLoeschen,
}: {
  lieferant: Lieferant;
  onBearbeiten: () => void;
  onLeeren: () => void;
  onLoeschen: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const importieren = useImportSupplierPriceList(lieferant.id);
  const [ergebnis, setErgebnis] = useState<PreislistenImportErgebnis | null>(null);
  const kontakt = [lieferant.ansprechpartner, lieferant.telefon, lieferant.email].filter(Boolean).join(" · ");

  return (
    <tr>
      <Td>
        <p className="font-medium text-ink">{lieferant.name}</p>
        {kontakt && <p className="text-xs text-muted">{kontakt}</p>}
      </Td>
      <Td>{lieferant.anzahlPreise.toLocaleString("de-DE")}</Td>
      <Td>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setErgebnis(null);
            importieren.mutate(file, { onSuccess: setErgebnis });
          }}
        />
        <div className="flex flex-wrap gap-1.5">
          <Button icon={ACTION_ICONS.upload} label="Preisliste importieren (CSV/XLSX)" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} loading={importieren.isPending} />
          <Button icon={ACTION_ICONS.edit} label={`${lieferant.name} bearbeiten`} variant="secondary" size="sm" onClick={onBearbeiten} />
          <Button icon={ACTION_ICONS.reset} label="Preisliste leeren" variant="secondary" size="sm" onClick={onLeeren} disabled={lieferant.anzahlPreise === 0} />
          <Button icon={ACTION_ICONS.delete} label={`${lieferant.name} löschen`} variant="danger" size="sm" onClick={onLoeschen} />
        </div>
        {ergebnis && (
          <p className="mt-1.5 text-xs text-muted">
            {ergebnis.gefunden} zugeordnet
            {ergebnis.nichtGefunden.length > 0 && `, ${ergebnis.nichtGefunden.length} nicht gefunden (${ergebnis.nichtGefunden.map((u) => `Zeile ${u.zeile}: ${u.grund}`).join("; ")})`}
          </p>
        )}
      </Td>
    </tr>
  );
}

/** Lieferantenstamm samt Preislisten: anlegen, bearbeiten, löschen, Preisliste importieren oder leeren.
 * Erwartete Importspalten (Semikolon-getrennt): SupplierArtikelnummer;Artikelnummer;Preis;Einheit —
 * "Artikelnummer" ist unsere Zutaten-Artikelnummer und dient als Zuordnungsschlüssel. */
export function PreislisteImportPanel() {
  const toast = useToast();
  const lieferanten = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const clearPrices = useClearSupplierPrices();
  const [neuerName, setNeuerName] = useState("");
  const [bearbeitet, setBearbeitet] = useState<Omit<Lieferant, "anzahlPreise"> | null>(null);
  const [leeren, setLeeren] = useState<Lieferant | null>(null);
  const [loeschen, setLoeschen] = useState<Lieferant | null>(null);

  return (
    <Card className="mt-6">
      <CardHeader
        title="Lieferanten & Preislisten"
        hint="Import-Spalten: SupplierArtikelnummer; Artikelnummer; Preis; Einheit — Artikelnummer muss mit der Zutat übereinstimmen"
      />
      {lieferanten.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted">Noch keine Lieferanten angelegt.</p>
      ) : (
        <Table head={["Lieferant", "Preise", "Aktionen"]}>
          {lieferanten.map((l) => (
            <LieferantZeile
              key={l.id}
              lieferant={l}
              onBearbeiten={() => setBearbeitet({ id: l.id, name: l.name, ansprechpartner: l.ansprechpartner, telefon: l.telefon, email: l.email })}
              onLeeren={() => setLeeren(l)}
              onLoeschen={() => setLoeschen(l)}
            />
          ))}
        </Table>
      )}

      {bearbeitet && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!bearbeitet.name.trim()) return;
            updateSupplier.mutate(
              { ...bearbeitet, name: bearbeitet.name.trim() },
              {
                onSuccess: () => { setBearbeitet(null); toast.success("Lieferant wurde gespeichert."); },
                onError: (error) => toast.error(fehlertext(error, "Speichern fehlgeschlagen. Bitte erneut versuchen.")),
              }
            );
          }}
          className="grid gap-3 border-t border-line px-5 py-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <TextField label="Name" value={bearbeitet.name} onChange={(v) => setBearbeitet({ ...bearbeitet, name: v })} required />
          <TextField label="Ansprechpartner" value={bearbeitet.ansprechpartner ?? ""} onChange={(v) => setBearbeitet({ ...bearbeitet, ansprechpartner: v })} />
          <TextField label="Telefon" value={bearbeitet.telefon ?? ""} onChange={(v) => setBearbeitet({ ...bearbeitet, telefon: v })} />
          <TextField label="E-Mail" value={bearbeitet.email ?? ""} onChange={(v) => setBearbeitet({ ...bearbeitet, email: v })} />
          <div className="col-span-full flex flex-wrap gap-2">
            <Button icon={ACTION_ICONS.save} label="Speichern" showLabel type="submit" disabled={!bearbeitet.name.trim()} loading={updateSupplier.isPending} />
            <Button icon={ACTION_ICONS.cancel} label="Abbrechen" showLabel variant="secondary" onClick={() => setBearbeitet(null)} />
          </div>
        </form>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!neuerName.trim()) return;
          createSupplier.mutate(neuerName.trim(), {
            onSuccess: () => setNeuerName(""),
            onError: (error) => toast.error(fehlertext(error, "Anlegen fehlgeschlagen. Bitte erneut versuchen.")),
          });
        }}
        className="flex items-end gap-3 border-t border-line px-5 py-4"
      >
        <div className="min-w-0 flex-1 sm:w-64 sm:flex-none">
          <TextField label="Neuer Lieferant" value={neuerName} onChange={setNeuerName} placeholder="Name" />
        </div>
        <Button icon={ACTION_ICONS.create} label="Hinzufügen" showLabel type="submit" variant="secondary" disabled={!neuerName.trim()} loading={createSupplier.isPending} />
      </form>

      <ConfirmDialog
        open={!!leeren}
        title="Preisliste leeren"
        tone="warn"
        message={<>Alle <strong>{leeren?.anzahlPreise}</strong> Zutatenpreise von <strong>{leeren?.name}</strong> werden gelöscht. Der Lieferant selbst bleibt erhalten.</>}
        confirmLabel="Preisliste leeren"
        confirmIcon={ACTION_ICONS.delete}
        onCancel={() => setLeeren(null)}
        onConfirm={() => {
          if (!leeren) return;
          const name = leeren.name;
          clearPrices.mutate(leeren.id, {
            onSuccess: (anzahl) => toast.success(`Preisliste von „${name}“ geleert (${anzahl} Preise entfernt).`),
            onError: (error) => toast.error(fehlertext(error, "Leeren fehlgeschlagen. Bitte erneut versuchen.")),
          });
          setLeeren(null);
        }}
      />
      <ConfirmDialog
        open={!!loeschen}
        title="Lieferant löschen"
        tone="warn"
        message={
          <>
            <strong>{loeschen?.name}</strong> wird samt Preisliste ({loeschen?.anzahlPreise} Preise) unwiderruflich gelöscht. Gibt es bereits
            Einkaufslisten für diesen Lieferanten, schlägt das Löschen fehl — leeren Sie dann stattdessen die Preisliste.
          </>
        }
        confirmLabel="Endgültig löschen"
        confirmIcon={ACTION_ICONS.delete}
        onCancel={() => setLoeschen(null)}
        onConfirm={() => {
          if (!loeschen) return;
          const { id, name } = loeschen;
          deleteSupplier.mutate(id, {
            onSuccess: () => { toast.success(`„${name}“ wurde gelöscht.`); if (bearbeitet?.id === id) setBearbeitet(null); },
            onError: (error) => toast.error(fehlertext(error, "Löschen fehlgeschlagen. Bitte erneut versuchen.")),
          });
          setLoeschen(null);
        }}
      />
    </Card>
  );
}
