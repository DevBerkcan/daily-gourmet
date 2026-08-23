"use client";

import { useState } from "react";
import { Card, CardHeader, Table, Td, Button } from "@/components/ui";
import { TextField } from "@/components/ui/form-fields";
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
        actions={!offen ? <Button variant="secondary" onClick={() => setOffen(true)}>Zeitraum hinzufügen</Button> : undefined}
      />

      {schliesstage.length === 0 && !offen && <p className="px-5 py-4 text-sm text-muted">Noch keine Schließtage eingetragen.</p>}

      {schliesstage.length > 0 && (
        <Table head={["Von", "Bis", "Hinweis", ""]}>
          {schliesstage.map((s) => (
            <tr key={s.id}>
              <Td>{formatiert(s.von)}</Td>
              <Td>{formatiert(s.bis)}</Td>
              <Td className="text-muted">{s.hinweis || "—"}{s.vonVerwaltungErfasst && <span className="ml-2 text-xs text-muted">(von Verwaltung erfasst)</span>}</Td>
              <Td>
                <button type="button" onClick={() => entfernen.mutate(s.id)} className="cursor-pointer text-xs font-medium text-danger hover:underline">
                  Entfernen
                </button>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {offen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!kannSpeichern) return;
            hinzufuegen.mutate({ von, bis, hinweis: hinweis.trim() || undefined }, { onSuccess: () => { setVon(""); setBis(""); setHinweis(""); setOffen(false); } });
          }}
          className="grid gap-3 border-t border-line px-5 py-4 sm:grid-cols-4"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Von</span>
            <input type="date" value={von} onChange={(e) => setVon(e.target.value)} required className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Bis</span>
            <input type="date" value={bis} onChange={(e) => setBis(e.target.value)} required className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm" />
          </label>
          <div className="sm:col-span-2">
            <TextField label="Hinweis" value={hinweis} onChange={setHinweis} placeholder="z. B. Sommerferien" />
          </div>
          <div className="col-span-full flex gap-2">
            <Button type="submit" disabled={!kannSpeichern || hinzufuegen.isPending}>Speichern</Button>
            <Button variant="secondary" onClick={() => setOffen(false)}>Abbrechen</Button>
          </div>
        </form>
      )}
    </Card>
  );
}
