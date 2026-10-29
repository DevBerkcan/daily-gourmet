"use client";

import { useState } from "react";
import { Card, CardHeader, Table, Td, Button, ACTION_ICONS } from "@/components/ui";
import { TextField } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/confirm-dialog";
import { usePortalSchliesstage, useAddPortalSchliesstag, useDeletePortalSchliesstag } from "@/lib/services/facilities";

const formatiert = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

/** Schließtage/Abwesenheit — die Einrichtung trägt für das ganze Jahr im Voraus ein, wann sie zu
 * hat (z. B. Sommerferien), statt uns das jede Woche einzeln per E-Mail mitzuteilen. Verwaltung
 * sieht das dann direkt bei der Speiseplan- und Tourenplanung. */
export function SchliesstagePanel() {
  const schliesstage = usePortalSchliesstage();
  const hinzufuegen = useAddPortalSchliesstag();
  const entfernen = useDeletePortalSchliesstag();
  const [offen, setOffen] = useState(false);
  const [von, setVon] = useState("");
  const [bis, setBis] = useState("");
  const [hinweis, setHinweis] = useState("");

  const kannSpeichern = von !== "" && bis !== "" && von <= bis;

  return (
    <Card>
      <CardHeader
        title="Schließtage / Abwesenheit"
        hint="Am besten für das ganze Jahr im Voraus eintragen (z. B. Ferien) — dann fragen wir nicht jede Woche einzeln nach."
        actions={<Button icon={ACTION_ICONS.create} label="Zeitraum hinzufügen" showLabel variant="secondary" onClick={() => setOffen(true)} />}
      />

      {schliesstage.length === 0 &&<p className="px-5 py-4 text-sm text-muted">Noch keine Schließtage eingetragen.</p>}

      {schliesstage.length > 0 && (
        <Table head={["Von", "Bis", "Hinweis", ""]}>
          {schliesstage.map((s) => (
            <tr key={s.id}>
              <Td>{formatiert(s.von)}</Td>
              <Td>{formatiert(s.bis)}</Td>
              <Td className="text-muted">{s.hinweis || "—"}{s.vonVerwaltungErfasst && <span className="ml-2 text-xs text-muted">(von Verwaltung erfasst)</span>}</Td>
              <Td>
                <Button icon={ACTION_ICONS.delete} label="Entfernen" variant="danger" size="sm" onClick={() => entfernen.mutate(s.id)} />
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {offen && (
        <Modal open onClose={() => setOffen(false)} title="Schließzeitraum hinzufügen" hint="Zeitraum, in dem die Einrichtung geschlossen ist (z. B. Ferien).">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!kannSpeichern) return;
            hinzufuegen.mutate({ von, bis, hinweis: hinweis.trim() || undefined }, { onSuccess: () => { setVon(""); setBis(""); setHinweis(""); setOffen(false); } });
          }}
          className="grid gap-4 p-5 sm:grid-cols-2"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Von</span>
            <input type="date" value={von} onChange={(e) => setVon(e.target.value)} required className="min-h-10 w-full min-w-0 rounded-lg border border-line bg-surface px-3 text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Bis</span>
            <input type="date" value={bis} onChange={(e) => setBis(e.target.value)} required className="min-h-10 w-full min-w-0 rounded-lg border border-line bg-surface px-3 text-sm" />
          </label>
          <div className="sm:col-span-2">
            <TextField label="Hinweis" value={hinweis} onChange={setHinweis} placeholder="z. B. Sommerferien" />
          </div>
          {von !== "" && bis !== "" && von > bis ? <p className="col-span-full text-xs font-medium text-danger">„Bis“ darf nicht vor „Von“ liegen.</p> : null}
          <div className="col-span-full flex justify-end gap-2">
            <Button icon={ACTION_ICONS.cancel} label="Abbrechen" showLabel variant="secondary" onClick={() => setOffen(false)} />
            <Button icon={ACTION_ICONS.save} label="Speichern" showLabel type="submit" disabled={!kannSpeichern} loading={hinzufuegen.isPending} />
          </div>
        </form>
        </Modal>
      )}
    </Card>
  );
}
