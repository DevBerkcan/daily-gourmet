"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui";
import { useSyncIngredients, mapSyncResult, type SyncErgebnis } from "@/lib/services/ingredients";

/** Holt Zutaten aus dem Rezeptrechner-Export erneut ab, ohne von Fee manuell bearbeitete Zutaten
 * zu überschreiben (siehe Ingredient.IsManuallyEdited auf dem Backend). Format des Exports ist mit
 * dem Kunden noch nicht final geklärt — bis dahin wird eine JSON-Datei mit den erwarteten Feldern
 * (externalRefId, name, articleNumber, …) erwartet; die Zuordnung lässt sich hier anpassen, sobald
 * ein echtes Beispiel vorliegt. */
export function SyncButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const sync = useSyncIngredients();
  const [ergebnis, setErgebnis] = useState<SyncErgebnis | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  const onFile = async (file: File) => {
    setFehler(null);
    setErgebnis(null);
    try {
      const text = await file.text();
      const rows = JSON.parse(text);
      if (!Array.isArray(rows)) throw new Error("Erwartet wird eine Liste von Zutaten-Zeilen.");
      sync.mutate(rows, {
        onSuccess: (data) => setErgebnis(mapSyncResult(data)),
        onError: () => setFehler("Synchronisierung fehlgeschlagen."),
      });
    } catch {
      setFehler("Datei konnte nicht gelesen werden — wird ein gültiger Rezeptrechner-Export erwartet?");
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={sync.isPending}>
        {sync.isPending ? "Synchronisiere …" : "Zutaten neu holen"}
      </Button>
      {ergebnis && (
        <p className="text-xs text-muted">
          {ergebnis.hinzugefuegt} neu · {ergebnis.aktualisiert} aktualisiert · {ergebnis.uebersprungenManuell} übersprungen (manuell bearbeitet)
        </p>
      )}
      {fehler && <p className="text-xs text-danger">{fehler}</p>}
    </div>
  );
}
