"use client";

import { useState } from "react";
import { Card, CardHeader, Table, Td, Button, Tag, ACTION_ICONS } from "@/components/ui";
import { NumberField, SelectField, TextField } from "@/components/ui/form-fields";
import {
  useIngredientSupplierPrices,
  useSaveSupplierPrice,
  useDeleteSupplierPrice,
  useSuppliers,
  type SaveLieferantenpreisInput,
} from "@/lib/services/ingredients";
import type { Einheit } from "@/lib/types";

const EINHEITEN: Einheit[] = ["g", "kg", "ml", "l", "Stück"];

function leeresFormular(lieferantId: string): SaveLieferantenpreisInput {
  return { lieferantId, lieferantArtikelnummer: "", preis: 0, einheit: "kg" };
}

/** Preise mehrerer Lieferanten für eine Zutat — der günstigste wird serverseitig für Kalkulation
 * und Einkauf herangezogen (siehe Ingredient.CheapestSupplierPriceId auf dem Backend). */
export function PreisePanel({ zutatId }: { zutatId: string }) {
  const preise = useIngredientSupplierPrices(zutatId);
  const lieferanten = useSuppliers();
  const savePrice = useSaveSupplierPrice(zutatId);
  const deletePrice = useDeleteSupplierPrice(zutatId);
  const [neu, setNeu] = useState<SaveLieferantenpreisInput | null>(null);

  const guenstigsterId = preise.length > 0 ? preise.reduce((a, b) => (a.preis <= b.preis ? a : b)).id : undefined;

  return (
    <Card>
      <CardHeader
        title="Lieferantenpreise"
        hint="Der günstigste Preis wird automatisch für Kalkulation und Einkauf verwendet."
        actions={
          !neu && lieferanten.length > 0 ? (
            <Button icon={ACTION_ICONS.create} label="Preis hinzufügen" variant="secondary" onClick={() => setNeu(leeresFormular(lieferanten[0].id))} />
          ) : undefined
        }
      />

      {preise.length === 0 && !neu && <p className="px-5 py-4 text-sm text-muted">Für diese Zutat sind noch keine Lieferantenpreise hinterlegt.</p>}

      {preise.length > 0 && (
        <Table head={["Lieferant", "Artikelnummer", "Preis", "Einheit", "Hinweis", ""]}>
          {preise.map((p) => (
            <tr key={p.id}>
              <Td className="font-medium text-ink">
                {p.lieferantName} {p.id === guenstigsterId && <Tag tone="green">günstigster</Tag>}
              </Td>
              <Td className="text-muted">{p.lieferantArtikelnummer || "—"}</Td>
              <Td>{p.preis.toLocaleString("de-DE")} €</Td>
              <Td className="text-muted">{p.einheit}</Td>
              <Td className="text-muted">{p.verfuegbarkeitshinweis || "—"}</Td>
              <Td>
                <Button icon={ACTION_ICONS.delete} label="Entfernen" variant="danger" size="sm" onClick={() => deletePrice.mutate(p.id)} />
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {neu && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            savePrice.mutate(neu, { onSuccess: () => setNeu(null) });
          }}
          className="grid gap-3 border-t border-line px-5 py-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Lieferant</span>
            <select
              value={neu.lieferantId}
              onChange={(e) => setNeu({ ...neu, lieferantId: e.target.value })}
              className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink"
            >
              {lieferanten.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </label>
          <TextField label="Lieferanten-Artikelnr." value={neu.lieferantArtikelnummer} onChange={(v) => setNeu({ ...neu, lieferantArtikelnummer: v })} />
          <NumberField label="Preis" value={neu.preis} onChange={(v) => setNeu({ ...neu, preis: v })} min={0} suffix="€" />
          <SelectField label="Einheit" value={neu.einheit} onChange={(v) => setNeu({ ...neu, einheit: v as Einheit })} options={EINHEITEN} />
          <TextField label="Verfügbarkeit / Hinweis" value={neu.verfuegbarkeitshinweis ?? ""} onChange={(v) => setNeu({ ...neu, verfuegbarkeitshinweis: v })} placeholder="z. B. Vorlaufzeit 3 Tage" />
          <div className="col-span-full flex gap-2">
            <Button icon={ACTION_ICONS.save} label="Speichern" type="submit" disabled={!neu.lieferantId} loading={savePrice.isPending} />
            <Button icon={ACTION_ICONS.cancel} label="Abbrechen" variant="secondary" onClick={() => setNeu(null)} />
          </div>
        </form>
      )}
    </Card>
  );
}
