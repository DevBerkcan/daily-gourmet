"use client";

import { useState } from "react";
import { Card, CardHeader, Table, Td, Button, Tag, ACTION_ICONS } from "@/components/ui";
import { NumberField, SelectField, TextField } from "@/components/ui/form-fields";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import {
  useIngredientSupplierPrices,
  useSaveSupplierPrice,
  useUpdateSupplierPrice,
  useDeleteSupplierPrice,
  useSuppliers,
  type SaveLieferantenpreisInput,
  type ZutatLieferantenpreis,
} from "@/lib/services/ingredients";
import type { Einheit } from "@/lib/types";

const EINHEITEN: Einheit[] = ["g", "kg", "ml", "l", "Stück"];

function leeresFormular(lieferantId: string): SaveLieferantenpreisInput {
  return { lieferantId, lieferantArtikelnummer: "", preis: 0, einheit: "kg" };
}

/** Preise mehrerer Lieferanten für eine Zutat — der günstigste wird serverseitig für Kalkulation
 * und Einkauf herangezogen (siehe IngredientPricing auf dem Backend). Anlegen, bearbeiten, löschen. */
export function PreisePanel({ zutatId }: { zutatId: string }) {
  const toast = useToast();
  const preise = useIngredientSupplierPrices(zutatId);
  const lieferanten = useSuppliers();
  const savePrice = useSaveSupplierPrice(zutatId);
  const updatePrice = useUpdateSupplierPrice(zutatId);
  const deletePrice = useDeleteSupplierPrice(zutatId);
  /** preisId = undefined → neuer Preis, sonst Bearbeitung eines bestehenden. */
  const [formular, setFormular] = useState<{ preisId?: string; daten: SaveLieferantenpreisInput } | null>(null);
  const [loeschePreis, setLoeschePreis] = useState<ZutatLieferantenpreis | null>(null);

  const guenstigsterId = preise.length > 0 ? preise.reduce((a, b) => (a.preis <= b.preis ? a : b)).id : undefined;
  const neu = formular?.daten;
  const setNeu = (daten: SaveLieferantenpreisInput) => setFormular((f) => (f ? { ...f, daten } : f));
  const fehler = (error: unknown) => toast.error(error instanceof ApiError ? error.message : "Speichern fehlgeschlagen. Bitte erneut versuchen.");

  return (
    <Card>
      <CardHeader
        title="Lieferantenpreise"
        hint={lieferanten.length === 0 ? "Legen Sie zuerst unter „Zutaten → Lieferanten & Preislisten“ einen Lieferanten an." : "Der günstigste Preis wird automatisch für Kalkulation und Einkauf verwendet."}
        actions={
          !formular && lieferanten.length > 0 ? (
            <Button icon={ACTION_ICONS.create} label="Preis hinzufügen" showLabel variant="secondary" onClick={() => setFormular({ daten: leeresFormular(lieferanten[0].id) })} />
          ) : undefined
        }
      />

      {preise.length === 0 && !formular && <p className="px-5 py-4 text-sm text-muted">Für diese Zutat sind noch keine Lieferantenpreise hinterlegt.</p>}

      {preise.length > 0 && (
        <Table head={["Lieferant", "Artikelnummer", "Preis", "Einheit", "Hinweis", ""]}>
          {preise.map((p) => (
            <tr key={p.id} className={formular?.preisId === p.id ? "bg-basil-soft/40" : undefined}>
              <Td className="font-medium text-ink">
                {p.lieferantName} {p.id === guenstigsterId && <Tag tone="green">günstigster</Tag>}
              </Td>
              <Td className="text-muted">{p.lieferantArtikelnummer || "—"}</Td>
              <Td>{p.preis.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</Td>
              <Td className="text-muted">je {p.einheit}</Td>
              <Td className="text-muted">{p.verfuegbarkeitshinweis || "—"}</Td>
              <Td>
                <div className="flex gap-1.5 no-print">
                  <Button
                    icon={ACTION_ICONS.edit}
                    label="Bearbeiten"
                    variant="secondary"
                    size="sm"
                    onClick={() => setFormular({
                      preisId: p.id,
                      daten: { lieferantId: p.lieferantId, lieferantArtikelnummer: p.lieferantArtikelnummer, preis: p.preis, einheit: p.einheit, verfuegbarkeitshinweis: p.verfuegbarkeitshinweis },
                    })}
                  />
                  <Button icon={ACTION_ICONS.delete} label="Entfernen" variant="danger" size="sm" onClick={() => setLoeschePreis(p)} />
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {formular && neu && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const onSuccess = () => { setFormular(null); toast.success("Preis wurde gespeichert."); };
            if (formular.preisId) updatePrice.mutate({ preisId: formular.preisId, input: neu }, { onSuccess, onError: fehler });
            else savePrice.mutate(neu, { onSuccess, onError: fehler });
          }}
          className="grid gap-3 border-t border-line px-5 py-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <p className="col-span-full text-sm font-medium text-ink">{formular.preisId ? "Preis bearbeiten" : "Neuer Preis"}</p>
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
          <NumberField label="Preis" value={neu.preis} onChange={(v) => setNeu({ ...neu, preis: v })} min={0} step={0.01} suffix="€" />
          <SelectField label="je Einheit" value={neu.einheit} onChange={(v) => setNeu({ ...neu, einheit: v as Einheit })} options={EINHEITEN} />
          <TextField label="Verfügbarkeit / Hinweis" value={neu.verfuegbarkeitshinweis ?? ""} onChange={(v) => setNeu({ ...neu, verfuegbarkeitshinweis: v })} placeholder="z. B. Vorlaufzeit 3 Tage" />
          <div className="col-span-full flex gap-2">
            <Button icon={ACTION_ICONS.save} label="Speichern" showLabel type="submit" disabled={!neu.lieferantId} loading={savePrice.isPending || updatePrice.isPending} />
            <Button icon={ACTION_ICONS.cancel} label="Abbrechen" showLabel variant="secondary" onClick={() => setFormular(null)} />
          </div>
        </form>
      )}

      <ConfirmDialog
        open={!!loeschePreis}
        title="Preis entfernen"
        tone="warn"
        message={<>Den Preis von <strong>{loeschePreis?.lieferantName}</strong> ({loeschePreis?.preis.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} je {loeschePreis?.einheit}) entfernen?</>}
        confirmLabel="Entfernen"
        confirmIcon={ACTION_ICONS.delete}
        onCancel={() => setLoeschePreis(null)}
        onConfirm={() => {
          if (!loeschePreis) return;
          const id = loeschePreis.id;
          deletePrice.mutate(id, {
            onSuccess: () => { if (formular?.preisId === id) setFormular(null); },
            onError: (error) => toast.error(error instanceof ApiError ? error.message : "Entfernen fehlgeschlagen."),
          });
          setLoeschePreis(null);
        }}
      />
    </Card>
  );
}
