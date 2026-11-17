"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, Button, ACTION_ICONS } from "@/components/ui";
import { SearchSelect } from "@/components/ui/search-select";
import type { Einheit } from "@/lib/types";
import { TextField, NumberField, OptionalNumberField, TextareaField, SelectField, CheckboxRow, CheckboxGroup, ImageField } from "@/components/ui/form-fields";
import { REZEPT_KATEGORIEN, ZIELGRUPPEN_LISTE, SCHWIERIGKEITSGRADE } from "../data";
import { useZutaten } from "@/lib/services/ingredients";
import type { Rezept, RezeptZutat, Schwierigkeitsgrad } from "../types";

const formatEuro = (v: number) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

/** Einheiten je Rezeptzeile — Gramm und Stück (z. B. Eier) statt nur der kg-Basiseinheit. */
const REZEPT_EINHEITEN: Einheit[] = ["g", "kg", "ml", "l", "Stück"];

/** Neue Zeilen starten in Gramm bzw. Milliliter (Küchenpraxis) — Backend rechnet g↔kg / ml↔l für Preis & Nährwerte um. */
const standardEinheit = (basis: Einheit): Einheit => (basis === "kg" ? "g" : basis === "l" ? "ml" : basis);

/** Gleiche Dimension wie die Basiseinheit der Zutat (Masse, Volumen, Stück) → umrechenbar. */
const dimension = (e: Einheit) => (e === "g" || e === "kg" ? "masse" : e === "ml" || e === "l" ? "volumen" : "stueck");
const einheitPasst = (e: Einheit, basis: Einheit) => dimension(e) === dimension(basis);

export type RezeptFormDaten = Omit<Rezept, "id" | "version" | "erstelltVon" | "erstelltAm" | "aktualisiertAm">;

function leer(erstesZutatId: string, basis: Einheit = "kg"): RezeptFormDaten {
  return {
    name: "", beschreibung: "", kategorie: REZEPT_KATEGORIEN[0], standardPortionen: 10, zubereitungszeitMin: 30, schwierigkeit: "Einfach",
    zubereitungsschritte: [""], zutaten: erstesZutatId ? [{ zutatId: erstesZutatId, menge: 1, einheit: standardEinheit(basis) }] : [],
    vegetarisch: true, vegan: true, glutenfrei: false, laktosefrei: false, dgeZertifiziert: false,
    produktionshinweise: "", zielgruppen: [], bildUrl: undefined,
    kerntemperaturC: undefined, lagerhinweis: "", haltbarkeitNachZubereitung: "", reduktionsfaktor: 1, aktiv: true,
  };
}

export function RezeptFormular({
  initial, erstelltVon, erstelltAm, onSubmit, onAbbrechen,
}: {
  initial?: Rezept;
  erstelltVon?: string;
  erstelltAm?: string;
  onSubmit: (input: RezeptFormDaten) => void;
  onAbbrechen?: () => void;
}) {
  const zutaten = useZutaten();
  const [r, setR] = useState<RezeptFormDaten>(initial ? { ...initial } : leer(zutaten[0]?.id ?? "", zutaten[0]?.basiseinheit));
  const zutatOptionen = useMemo(
    () => [...zutaten].sort((a, b) => a.name.localeCompare(b.name, "de")).map((z) => ({ value: z.id, label: z.name })),
    [zutaten],
  );

  const set = <K extends keyof RezeptFormDaten>(key: K, value: RezeptFormDaten[K]) => setR((prev) => ({ ...prev, [key]: value }));
  const toggleZielgruppe = (z: string) => set("zielgruppen", r.zielgruppen.includes(z) ? r.zielgruppen.filter((x) => x !== z) : [...r.zielgruppen, z]);

  const addZutatRow = () => {
    const erste = zutaten[0];
    if (!erste) return;
    set("zutaten", [...r.zutaten, { zutatId: erste.id, menge: 1, einheit: standardEinheit(erste.basiseinheit) }]);
  };
  const updateZutatRow = (i: number, updates: Partial<RezeptZutat>) => {
    set("zutaten", r.zutaten.map((rz, idx) => (idx === i ? { ...rz, ...updates } : rz)));
  };
  const removeZutatRow = (i: number) => set("zutaten", r.zutaten.filter((_, idx) => idx !== i));

  const addSchritt = () => set("zubereitungsschritte", [...r.zubereitungsschritte, ""]);
  const updateSchritt = (i: number, value: string) => set("zubereitungsschritte", r.zubereitungsschritte.map((s, idx) => (idx === i ? value : s)));
  const removeSchritt = (i: number) => set("zubereitungsschritte", r.zubereitungsschritte.filter((_, idx) => idx !== i));

  const kannSpeichern = r.name.trim() !== "" && r.zutaten.length > 0 && r.zubereitungsschritte.some((s) => s.trim() !== "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!kannSpeichern) return;
        onSubmit({ ...r, zubereitungsschritte: r.zubereitungsschritte.filter((s) => s.trim() !== "") });
      }}
      className="flex flex-col gap-6"
    >
      {(erstelltVon || initial) && (
        <p className="text-xs text-muted">
          Erstellt von {initial?.erstelltVon ?? erstelltVon} am {new Date(initial?.erstelltAm ?? erstelltAm ?? "").toLocaleDateString("de-DE")}
          {initial?.aktualisiertAm && ` · zuletzt geändert am ${new Date(initial.aktualisiertAm).toLocaleDateString("de-DE")}`}
        </p>
      )}

      <Card>
        <CardHeader title="Basisinformationen" />
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><TextField label="Name" value={r.name} onChange={(v) => set("name", v)} required /></div>
          <div className="sm:col-span-2"><TextareaField label="Beschreibung" value={r.beschreibung} onChange={(v) => set("beschreibung", v)} /></div>
          <TextField label="Rezeptnummer" value={r.rezeptnummer ?? ""} onChange={(v) => set("rezeptnummer", v || undefined)} placeholder="z. B. Woche 3" />
          <SelectField label="Kategorie" value={r.kategorie} onChange={(v) => set("kategorie", v)} options={REZEPT_KATEGORIEN} />
          <SelectField label="Schwierigkeitsgrad" value={r.schwierigkeit} onChange={(v) => set("schwierigkeit", v as Schwierigkeitsgrad)} options={SCHWIERIGKEITSGRADE} />
          <NumberField label="Anzahl Portionen" value={r.standardPortionen} onChange={(v) => set("standardPortionen", v)} min={1} required />
          <NumberField label="Zubereitungszeit" value={r.zubereitungszeitMin} onChange={(v) => set("zubereitungszeitMin", v)} min={1} suffix="Min." />
          <div className="sm:col-span-2"><ImageField label="Foto" value={r.bildUrl} onChange={(v) => set("bildUrl", v)} /></div>
          <div className="flex flex-wrap gap-4 sm:col-span-2">
            <CheckboxRow checked={r.vegetarisch} onChange={() => set("vegetarisch", !r.vegetarisch)} label="Vegetarisch" />
            <CheckboxRow checked={r.vegan} onChange={() => set("vegan", !r.vegan)} label="Vegan" />
            <CheckboxRow checked={r.glutenfrei ?? false} onChange={() => set("glutenfrei", !r.glutenfrei)} label="Glutenfrei" />
            <CheckboxRow checked={r.laktosefrei ?? false} onChange={() => set("laktosefrei", !r.laktosefrei)} label="Laktosefrei" />
            <CheckboxRow checked={r.dgeZertifiziert ?? false} onChange={() => set("dgeZertifiziert", !r.dgeZertifiziert)} label="DGE-zertifiziert" />
            <CheckboxRow checked={r.aktiv} onChange={() => set("aktiv", !r.aktiv)} label="Aktiv" />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="DGE-/Ernährungsangaben" hint="Für welche Lebenswelten ist dieses Rezept freigegeben?" />
        <div className="px-5 py-4">
          <CheckboxGroup label="Zielgruppen" options={ZIELGRUPPEN_LISTE} selected={r.zielgruppen} onToggle={toggleZielgruppe} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Zutaten" actions={<div className="no-print"><Button icon={ACTION_ICONS.create} label="Zutat hinzufügen" variant="ghost" size="sm" showLabel onClick={addZutatRow} /></div>} />
        <div className="flex flex-col gap-2 px-5 py-4">
          {r.zutaten.length === 0 && <p className="text-sm text-muted">Noch keine Zutaten hinzugefügt.</p>}
          {r.zutaten.map((rz, i) => {
            const zutat = zutaten.find((z) => z.id === rz.zutatId);
            return (
              <div key={rz.id ?? i} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <SearchSelect
                  ariaLabel="Zutat"
                  placeholder="Zutat suchen…"
                  value={rz.zutatId}
                  options={zutatOptionen}
                  onChange={(id) => {
                    const neu = zutaten.find((z) => z.id === id);
                    updateZutatRow(i, { zutatId: id, einheit: neu ? standardEinheit(neu.basiseinheit) : rz.einheit });
                  }}
                  className="min-w-0 basis-full sm:basis-auto sm:flex-1"
                />
                <input
                  type="number"
                  aria-label="Menge"
                  min={0}
                  step={rz.einheit === "Stück" ? 1 : "any"}
                  value={rz.menge}
                  onChange={(e) => updateZutatRow(i, { menge: Number(e.target.value) || 0 })}
                  className="min-h-10 w-20 shrink-0 rounded-lg border border-line bg-surface px-3 text-right text-sm sm:w-24"
                />
                <select
                  aria-label="Einheit"
                  value={rz.einheit}
                  onChange={(e) => updateZutatRow(i, { einheit: e.target.value as Einheit })}
                  title={zutat && !einheitPasst(rz.einheit, zutat.basiseinheit) ? `Basiseinheit der Zutat ist ${zutat.basiseinheit} — für diese Zeile ist keine Preis-/Nährwertumrechnung möglich.` : undefined}
                  className={`min-h-10 w-24 shrink-0 rounded-lg border bg-surface px-2 text-sm ${zutat && !einheitPasst(rz.einheit, zutat.basiseinheit) ? "border-warn" : "border-line"}`}
                >
                  {REZEPT_EINHEITEN.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
                <Button icon={ACTION_ICONS.delete} label="Zutat entfernen" variant="danger" size="sm" showLabel className="ml-auto no-print sm:ml-0" onClick={() => removeZutatRow(i)} />
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title="Kalkulation" hint="Optional — ohne manuellen Preis wird der Wareneinsatz aus den Zutatenpreisen berechnet." />
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <OptionalNumberField
            label="Preis je Portion (manuell)"
            value={r.manuellerPreisProPortion}
            onChange={(v) => set("manuellerPreisProPortion", v)}
            min={0}
            step={0.01}
            suffix="€"
            placeholder={initial?.berechneteKostenProPortion != null ? initial.berechneteKostenProPortion.toLocaleString("de-DE") : "nicht gesetzt"}
            hint={
              initial?.berechneteKostenProPortion != null
                ? `Berechnet aus Zutatenpreisen: ${formatEuro(initial.berechneteKostenProPortion)} je Portion. Leer lassen, um diesen Wert zu verwenden.`
                : "Leer lassen, um den Preis aus den Zutatenpreisen zu berechnen."
            }
          />
          {r.manuellerPreisProPortion != null && (
            <div className="flex flex-col justify-center text-sm">
              <span className="text-muted">Wareneinsatz gesamt ({r.standardPortionen} Portionen)</span>
              <span className="font-display text-lg font-semibold text-basil">{formatEuro(r.manuellerPreisProPortion * r.standardPortionen)}</span>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Zubereitungsschritte" actions={<div className="no-print"><Button icon={ACTION_ICONS.create} label="Schritt hinzufügen" variant="ghost" size="sm" showLabel onClick={addSchritt} /></div>} />
        <div className="flex flex-col gap-2 px-5 py-4">
          {r.zubereitungsschritte.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="shrink-0 font-display text-sm font-semibold text-basil">{i + 1}</span>
              <input
                type="text"
                aria-label={`Schritt ${i + 1}`}
                value={s}
                onChange={(e) => updateSchritt(i, e.target.value)}
                className="min-h-10 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-sm"
              />
              <Button icon={ACTION_ICONS.delete} label="Schritt entfernen" variant="danger" size="sm" showLabel className="no-print" onClick={() => removeSchritt(i)} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Küchen- & HACCP-Hinweise" />
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <NumberField label="Kerntemperatur" value={r.kerntemperaturC ?? ""} onChange={(v) => set("kerntemperaturC", v)} min={0} suffix="°C" />
          <NumberField
            label="Reduktionsfaktor"
            value={r.reduktionsfaktor ?? 1}
            onChange={(v) => set("reduktionsfaktor", v)}
            min={0.1}
            step={0.01}
            hint="Gewichtsverlust beim Garen, z. B. 0,7 = 30 % Verlust. Treibt „Gewicht zubereitet“ in der Nährwerte-Ansicht."
          />
          <TextField label="Haltbarkeit nach Zubereitung" value={r.haltbarkeitNachZubereitung ?? ""} onChange={(v) => set("haltbarkeitNachZubereitung", v)} placeholder="z. B. 24 Stunden gekühlt" />
          <div className="sm:col-span-2"><TextField label="Lagerhinweis" value={r.lagerhinweis ?? ""} onChange={(v) => set("lagerhinweis", v)} /></div>
          <div className="sm:col-span-2"><TextareaField label="Produktionshinweise" value={r.produktionshinweise ?? ""} onChange={(v) => set("produktionshinweise", v)} /></div>
        </div>
      </Card>

      <div className="flex justify-end gap-2 no-print">
        {onAbbrechen && <Button icon={ACTION_ICONS.cancel} label="Abbrechen" variant="secondary" showLabel onClick={onAbbrechen} />}
        <Button icon={initial ? ACTION_ICONS.save : ACTION_ICONS.create} label={initial ? "Änderungen speichern" : "Rezept anlegen"} showLabel type="submit" disabled={!kannSpeichern} />
      </div>
    </form>
  );
}
