"use client";

import { useState } from "react";
import { Card, CardHeader, Button } from "@/components/ui";
import { TextField, NumberField, TextareaField, SelectField, CheckboxRow, CheckboxGroup, ImageField } from "@/components/ui/form-fields";
import { REZEPT_KATEGORIEN, ZIELGRUPPEN_LISTE, SCHWIERIGKEITSGRADE } from "../data";
import { useZutaten } from "@/lib/services/ingredients";
import type { Rezept, RezeptZutat, Schwierigkeitsgrad } from "../types";
import { Plus, Trash2 } from "lucide-react";

export type RezeptFormDaten = Omit<Rezept, "id" | "version" | "erstelltVon" | "erstelltAm" | "aktualisiertAm">;

function leer(erstesZutatId: string): RezeptFormDaten {
  return {
    name: "", beschreibung: "", kategorie: REZEPT_KATEGORIEN[0], standardPortionen: 10, zubereitungszeitMin: 30, schwierigkeit: "Einfach",
    zubereitungsschritte: [""], zutaten: erstesZutatId ? [{ zutatId: erstesZutatId, menge: 1, einheit: "kg" }] : [],
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
  const [r, setR] = useState<RezeptFormDaten>(initial ? { ...initial } : leer(zutaten[0]?.id ?? ""));

  const set = <K extends keyof RezeptFormDaten>(key: K, value: RezeptFormDaten[K]) => setR((prev) => ({ ...prev, [key]: value }));
  const toggleZielgruppe = (z: string) => set("zielgruppen", r.zielgruppen.includes(z) ? r.zielgruppen.filter((x) => x !== z) : [...r.zielgruppen, z]);

  const addZutatRow = () => {
    const erste = zutaten[0];
    if (!erste) return;
    set("zutaten", [...r.zutaten, { zutatId: erste.id, menge: 1, einheit: erste.basiseinheit }]);
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
        <CardHeader title="Zutaten" actions={<button type="button" onClick={addZutatRow} className="flex cursor-pointer items-center gap-1 text-xs font-medium text-basil hover:underline no-print"><Plus size={13} aria-hidden /> Zutat hinzufügen</button>} />
        <div className="flex flex-col gap-2 px-5 py-4">
          {r.zutaten.length === 0 && <p className="text-sm text-muted">Noch keine Zutaten hinzugefügt.</p>}
          {r.zutaten.map((rz, i) => {
            const zutat = zutaten.find((z) => z.id === rz.zutatId);
            return (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <select
                    aria-label="Zutat"
                    value={rz.zutatId}
                    onChange={(e) => {
                      const neu = zutaten.find((z) => z.id === e.target.value);
                      updateZutatRow(i, { zutatId: e.target.value, einheit: neu?.basiseinheit ?? rz.einheit });
                    }}
                    className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm"
                  >
                    {zutaten.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                <input
                  type="number"
                  aria-label="Menge"
                  min={0}
                  step="any"
                  value={rz.menge}
                  onChange={(e) => updateZutatRow(i, { menge: Number(e.target.value) || 0 })}
                  className="min-h-10 w-24 rounded-lg border border-line bg-surface px-3 text-sm text-right"
                />
                <span className="min-h-10 flex items-center px-1 text-sm text-muted">{zutat?.basiseinheit ?? rz.einheit}</span>
                <button type="button" onClick={() => removeZutatRow(i)} aria-label="Zutat entfernen" className="flex min-h-10 cursor-pointer items-center px-2 text-muted hover:text-danger no-print">
                  <Trash2 size={15} aria-hidden />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title="Zubereitungsschritte" actions={<button type="button" onClick={addSchritt} className="flex cursor-pointer items-center gap-1 text-xs font-medium text-basil hover:underline no-print"><Plus size={13} aria-hidden /> Schritt hinzufügen</button>} />
        <div className="flex flex-col gap-2 px-5 py-4">
          {r.zubereitungsschritte.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold text-basil">{i + 1}</span>
              <input
                type="text"
                aria-label={`Schritt ${i + 1}`}
                value={s}
                onChange={(e) => updateSchritt(i, e.target.value)}
                className="min-h-10 flex-1 rounded-lg border border-line bg-surface px-3 text-sm"
              />
              <button type="button" onClick={() => removeSchritt(i)} aria-label="Schritt entfernen" className="flex min-h-10 cursor-pointer items-center px-2 text-muted hover:text-danger no-print">
                <Trash2 size={15} aria-hidden />
              </button>
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
        {onAbbrechen && <Button variant="secondary" onClick={onAbbrechen}>Abbrechen</Button>}
        <Button type="submit" disabled={!kannSpeichern}>{initial ? "Änderungen speichern" : "Rezept anlegen"}</Button>
      </div>
    </form>
  );
}
