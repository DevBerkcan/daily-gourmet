"use client";

import { useState } from "react";
import { Card, CardHeader, Button, Tag, ACTION_ICONS } from "@/components/ui";
import { OptionalNumberField } from "@/components/ui/form-fields";
import { useToast } from "@/components/ui/toast";
import { useUpdateRezept, type Rezept } from "@/lib/services/recipes";

const euro = (v: number) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

/** Wareneinsatz eines Rezepts: manuell gepflegter Preis je Portion (hat Vorrang) bzw. der aus den
 * Zutatenpreisen berechnete Schätzwert — direkt hier pflegbar, ohne das ganze Rezeptformular. */
export function KalkulationCard({ rezept }: { rezept: Rezept }) {
  const toast = useToast();
  const updateRezept = useUpdateRezept();
  const [bearbeiten, setBearbeiten] = useState(false);
  const [preis, setPreis] = useState<number | undefined>(rezept.manuellerPreisProPortion);

  const manuell = rezept.manuellerPreisProPortion != null;
  const proPortion = rezept.geschaetzteKostenProPortion;

  function speichern(neuerPreis: number | undefined) {
    updateRezept.mutate(
      { id: rezept.id, input: { ...rezept, manuellerPreisProPortion: neuerPreis } },
      {
        onSuccess: () => { setBearbeiten(false); toast.success(neuerPreis != null ? "Preis wurde gespeichert." : "Manueller Preis wurde entfernt."); },
        onError: () => toast.error("Speichern fehlgeschlagen. Bitte erneut versuchen."),
      }
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader
        title="Kalkulation"
        hint={manuell ? "Manuell gepflegter Preis je Portion" : "Geschätzt anhand der günstigsten hinterlegten Lieferantenpreise, ersatzweise Standardpreis"}
        actions={
          !bearbeiten ? (
            <div className="no-print">
              <Button icon={ACTION_ICONS.edit} label="Preis pflegen" variant="ghost" size="sm" showLabel onClick={() => { setPreis(rezept.manuellerPreisProPortion); setBearbeiten(true); }} />
            </div>
          ) : undefined
        }
      />
      {bearbeiten ? (
        <form
          onSubmit={(e) => { e.preventDefault(); speichern(preis); }}
          className="flex flex-col gap-3 px-5 py-4"
        >
          <OptionalNumberField
            label="Preis je Portion (manuell)"
            value={preis}
            onChange={setPreis}
            min={0}
            step={0.01}
            suffix="€"
            hint={
              rezept.berechneteKostenProPortion != null
                ? `Berechnet aus Zutatenpreisen: ${euro(rezept.berechneteKostenProPortion)}. Leer lassen, um diesen Wert zu verwenden.`
                : "Für die Zutaten sind keine Preise hinterlegt — leer lassen heißt: kein Preis."
            }
          />
          <div className="flex flex-wrap gap-2">
            <Button icon={ACTION_ICONS.save} label="Speichern" showLabel type="submit" loading={updateRezept.isPending} />
            {manuell && <Button icon={ACTION_ICONS.delete} label="Manuellen Preis entfernen" showLabel variant="secondary" onClick={() => speichern(undefined)} />}
            <Button icon={ACTION_ICONS.cancel} label="Abbrechen" showLabel variant="secondary" onClick={() => setBearbeiten(false)} />
          </div>
        </form>
      ) : proPortion != null ? (
        <div className="flex flex-col gap-2 px-5 py-4 text-sm">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="text-muted">Wareneinsatz gesamt:</span>
            <span className="font-display text-lg font-semibold text-basil">{euro(proPortion * rezept.standardPortionen)}</span>
            <span className="ml-auto text-muted">je Portion:</span>
            <span className="font-display text-lg font-semibold text-basil">{euro(proPortion)}</span>
            {manuell && <Tag tone="amber">manuell</Tag>}
          </div>
          {manuell && rezept.berechneteKostenProPortion != null && (
            <p className="text-xs text-muted">Berechnet aus Zutatenpreisen wären es {euro(rezept.berechneteKostenProPortion)} je Portion.</p>
          )}
        </div>
      ) : (
        <p className="px-5 py-4 text-sm text-muted">Für die Zutaten dieses Rezepts sind noch keine Einkaufspreise hinterlegt — über „Preis pflegen“ lässt sich ein Preis je Portion manuell festlegen.</p>
      )}
    </Card>
  );
}
