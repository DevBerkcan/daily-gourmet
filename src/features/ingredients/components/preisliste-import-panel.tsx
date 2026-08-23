"use client";

import { useRef, useState } from "react";
import { Card, CardHeader, Table, Td, Button } from "@/components/ui";
import { TextField } from "@/components/ui/form-fields";
import { useSuppliers, useCreateSupplier, useImportSupplierPriceList, type PreislistenImportErgebnis } from "@/lib/services/ingredients";

function LieferantImportZeile({ supplierId, name }: { supplierId: string; name: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const importieren = useImportSupplierPriceList(supplierId);
  const [ergebnis, setErgebnis] = useState<PreislistenImportErgebnis | null>(null);

  return (
    <tr>
      <Td className="font-medium text-ink">{name}</Td>
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
        <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={importieren.isPending}>
          {importieren.isPending ? "Importiere …" : "Preisliste importieren (CSV/XLSX)"}
        </Button>
      </Td>
      <Td className="text-xs text-muted">
        {ergebnis && (
          <>
            {ergebnis.gefunden} zugeordnet
            {ergebnis.nichtGefunden.length > 0 && `, ${ergebnis.nichtGefunden.length} nicht gefunden (${ergebnis.nichtGefunden.map((u) => `Zeile ${u.zeile}: ${u.grund}`).join("; ")})`}
          </>
        )}
      </Td>
    </tr>
  );
}

/** Erwartete Spalten (Semikolon-getrennt): SupplierArtikelnummer;Artikelnummer;Preis;Einheit —
 * "Artikelnummer" ist unsere Zutaten-Artikelnummer und dient als Zuordnungsschlüssel. Noch nicht
 * mit einer echten Lieferanten-Datei abgeglichen; Spaltenzuordnung lässt sich serverseitig anpassen. */
export function PreislisteImportPanel() {
  const lieferanten = useSuppliers();
  const createSupplier = useCreateSupplier();
  const [neuerName, setNeuerName] = useState("");

  return (
    <Card className="mt-6">
      <CardHeader
        title="Lieferanten & Preislisten"
        hint="Spalten: SupplierArtikelnummer;Artikelnummer;Preis;Einheit — Artikelnummer muss mit der Zutat übereinstimmen"
      />
      {lieferanten.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted">Noch keine Lieferanten angelegt.</p>
      ) : (
        <Table head={["Lieferant", "Import", "Ergebnis"]}>
          {lieferanten.map((l) => <LieferantImportZeile key={l.id} supplierId={l.id} name={l.name} />)}
        </Table>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!neuerName.trim()) return;
          createSupplier.mutate(neuerName.trim(), { onSuccess: () => setNeuerName("") });
        }}
        className="flex items-end gap-3 border-t border-line px-5 py-4"
      >
        <div className="w-64">
          <TextField label="Neuer Lieferant" value={neuerName} onChange={setNeuerName} placeholder="Name" />
        </div>
        <Button type="submit" variant="secondary" disabled={!neuerName.trim() || createSupplier.isPending}>Hinzufügen</Button>
      </form>
    </Card>
  );
}
