"use client";

import { useRef, useState } from "react";
import { Card, CardHeader, Button } from "@/components/ui";
import { useImportRezeptrechner, type RezeptImportErgebnis } from "@/lib/services/recipes";
import { ApiError } from "@/lib/api/client";

/** Erwartet die beiden CSV-Exporte aus dem Rezeptrechner: "Rezepte-Zutaten-Mengen" (Rezept, Zutat,
 * Menge) und "Artikeldaten-Kennzeichnung" (Nährwerte, Allergene, Kategorie, Nutri-Score je Rezept)
 * — siehe RecipeHandler.ImportFromRezeptrechnerAsync auf dem Backend. Legt Rezepte und die darin
 * verwendeten Zutaten gemeinsam an bzw. aktualisiert sie; bereits manuell bearbeitete Zutaten werden
 * nie überschrieben. Erneut hochladbar, sobald ein frischer Export vorliegt. */
export function RezeptrechnerImportPanel() {
  const zutatenRef = useRef<HTMLInputElement>(null);
  const artikelRef = useRef<HTMLInputElement>(null);
  const [zutatenFile, setZutatenFile] = useState<File | null>(null);
  const [artikelFile, setArtikelFile] = useState<File | null>(null);
  const importieren = useImportRezeptrechner();
  const [ergebnis, setErgebnis] = useState<RezeptImportErgebnis | null>(null);

  const bereit = !!zutatenFile && !!artikelFile;

  function starten() {
    if (!zutatenFile || !artikelFile) return;
    setErgebnis(null);
    importieren.mutate(
      { zutatenMengenFile: zutatenFile, artikeldatenFile: artikelFile },
      { onSuccess: setErgebnis }
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader
        title="Rezeptrechner-Import"
        hint="Zwei CSV-Exporte aus dem Rezeptrechner hochladen — Rezepte und die verwendeten Zutaten werden gemeinsam angelegt bzw. aktualisiert."
      />
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Rezepte-Zutaten-Mengen (CSV)</span>
          <input
            ref={zutatenRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => setZutatenFile(e.target.files?.[0] ?? null)}
          />
          <Button variant="secondary" onClick={() => zutatenRef.current?.click()}>
            {zutatenFile ? zutatenFile.name : "Datei wählen …"}
          </Button>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Artikeldaten-Kennzeichnung (CSV)</span>
          <input
            ref={artikelRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => setArtikelFile(e.target.files?.[0] ?? null)}
          />
          <Button variant="secondary" onClick={() => artikelRef.current?.click()}>
            {artikelFile ? artikelFile.name : "Datei wählen …"}
          </Button>
        </label>
      </div>
      <div className="flex items-center gap-3 border-t border-line px-5 py-4">
        <Button onClick={starten} disabled={!bereit || importieren.isPending}>
          {importieren.isPending ? "Importiere …" : "Import starten"}
        </Button>
        {importieren.isError && (
          <p className="text-sm text-danger">
            {importieren.error instanceof ApiError ? importieren.error.message : "Der Import ist fehlgeschlagen."}
          </p>
        )}
      </div>
      {ergebnis && (
        <div className="border-t border-line px-5 py-4 text-sm">
          <p className="text-ink">
            <strong>{ergebnis.rezepteNeu}</strong> Rezepte neu, <strong>{ergebnis.rezepteAktualisiert}</strong> aktualisiert ·{" "}
            <strong>{ergebnis.zutatenNeu}</strong> Zutaten neu, <strong>{ergebnis.zutatenAktualisiert}</strong> aktualisiert
            {ergebnis.zutatenUebersprungenManuell > 0 && <>, {ergebnis.zutatenUebersprungenManuell} übersprungen (manuell bearbeitet)</>}
          </p>
          {ergebnis.hinweise.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-medium text-muted">{ergebnis.hinweise.length} Hinweise anzeigen</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted">
                {ergebnis.hinweise.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </Card>
  );
}
