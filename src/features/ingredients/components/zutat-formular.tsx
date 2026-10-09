"use client";

import { useState } from "react";
import { Card, CardHeader, Button, ACTION_ICONS } from "@/components/ui";
import { TextField, NumberField, OptionalNumberField, SelectField, CheckboxRow, CheckboxGroup } from "@/components/ui/form-fields";
import { ZUTAT_KATEGORIEN, ALLERGENE_LISTE, ZUSATZSTOFFE_LISTE } from "../data";
import { useSuppliers, type Zutat } from "@/lib/services/ingredients";
import type { Einheit } from "@/lib/types";

const EINHEITEN: Einheit[] = ["g", "kg", "ml", "l", "Stück"];
const NAEHRWERT_QUELLEN = ["Open Food Facts", "USDA FoodData Central", "Manuell", "Bundeslebensmittelschlüssel (BLS)"] as const;

function leer(): Omit<Zutat, "id"> {
  return {
    name: "", artikelnummer: "", kategorie: ZUTAT_KATEGORIEN[0], basiseinheit: "kg", einkaufseinheit: "", umrechnungsfaktor: 1,
    einkaufspreis: undefined, lieferant: "", allergene: [], zusatzstoffe: [], vegetarisch: true, vegan: true, bio: false, regional: false, aktiv: true,
    naehrwertePro100: { kcal: 0, kj: 0, eiweissG: 0, fettG: 0, gesFettSaeurenG: 0, kohlenhydrateG: 0, zuckerG: 0, ballaststoffeG: 0, salzG: 0, alkoholG: 0, quelle: "Manuell" },
    quelle: "Manuell", manuellBearbeitet: false, lieferantenpreise: [],
  };
}

export function ZutatFormular({ initial, onSubmit, onAbbrechen }: { initial?: Zutat; onSubmit: (input: Omit<Zutat, "id">) => void; onAbbrechen?: () => void }) {
  const [z, setZ] = useState<Omit<Zutat, "id">>(initial ? { ...initial } : leer());
  const lieferanten = useSuppliers();
  // Importierte Zutaten können eine Kategorie außerhalb der Standardliste tragen — die bleibt wählbar,
  // statt beim Speichern stillschweigend auf die erste Option zu springen.
  const kategorien = ZUTAT_KATEGORIEN.includes(z.kategorie) || !z.kategorie ? ZUTAT_KATEGORIEN : [z.kategorie, ...ZUTAT_KATEGORIEN];

  const set = <K extends keyof Omit<Zutat, "id">>(key: K, value: Omit<Zutat, "id">[K]) => setZ((prev) => ({ ...prev, [key]: value }));
  const toggleAllergen = (a: string) => set("allergene", z.allergene.includes(a) ? z.allergene.filter((x) => x !== a) : [...z.allergene, a]);
  const toggleZusatzstoff = (a: string) => set("zusatzstoffe", z.zusatzstoffe.includes(a) ? z.zusatzstoffe.filter((x) => x !== a) : [...z.zusatzstoffe, a]);

  const kannSpeichern = z.name.trim() !== "" && z.artikelnummer.trim() !== "";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!kannSpeichern) return;
        onSubmit(z);
      }}
      className="flex flex-col gap-6"
    >
      <Card>
        <CardHeader title="Stammdaten" />
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <TextField label="Name" value={z.name} onChange={(v) => set("name", v)} required />
          <TextField label="Artikelnummer" value={z.artikelnummer} onChange={(v) => set("artikelnummer", v)} required />
          <SelectField label="Kategorie" value={z.kategorie} onChange={(v) => set("kategorie", v)} options={kategorien} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Lieferant</span>
            <input
              type="text"
              list="zutat-lieferanten"
              value={z.lieferant}
              onChange={(e) => set("lieferant", e.target.value)}
              placeholder="Lieferant wählen oder neuen Namen eingeben"
              className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:outline-2 focus:outline-offset-1 focus:outline-basil"
            />
            <datalist id="zutat-lieferanten">
              {lieferanten.map((l) => <option key={l.id} value={l.name} />)}
            </datalist>
            <span className="text-xs text-muted">Ein neuer Name legt den Lieferanten automatisch an.</span>
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader title="Einheiten & Preis" />
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <SelectField label="Basiseinheit" value={z.basiseinheit} onChange={(v) => set("basiseinheit", v as Einheit)} options={EINHEITEN} />
          <TextField label="Einkaufseinheit" value={z.einkaufseinheit} onChange={(v) => set("einkaufseinheit", v)} placeholder="z. B. Sack (25 kg)" />
          <NumberField label="Umrechnungsfaktor" value={z.umrechnungsfaktor} onChange={(v) => set("umrechnungsfaktor", v)} min={0.01} hint="Basiseinheiten je Einkaufseinheit" />
          <OptionalNumberField
            label="Standardpreis"
            value={z.einkaufspreis}
            onChange={(v) => set("einkaufspreis", v)}
            min={0}
            step={0.01}
            suffix="€ je Einkaufseinheit"
            hint="Greift, solange kein Lieferantenpreis hinterlegt ist. Lieferantenpreise pflegen Sie nach dem Speichern auf der Zutatenseite."
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Kennzeichnung & Nachhaltigkeit" />
        <div className="flex flex-col gap-4 px-5 py-4">
          <CheckboxGroup label="Allergene" options={ALLERGENE_LISTE} selected={z.allergene} onToggle={toggleAllergen} />
          <CheckboxGroup label="Zusatzstoffe" options={ZUSATZSTOFFE_LISTE} selected={z.zusatzstoffe} onToggle={toggleZusatzstoff} />
          <div className="grid gap-2.5 sm:grid-cols-2">
            <CheckboxRow checked={z.vegetarisch} onChange={() => set("vegetarisch", !z.vegetarisch)} label="Vegetarisch" />
            <CheckboxRow checked={z.vegan} onChange={() => set("vegan", !z.vegan)} label="Vegan" />
            <CheckboxRow checked={z.bio} onChange={() => set("bio", !z.bio)} label="Bio-zertifiziert" />
            <CheckboxRow checked={z.regional} onChange={() => set("regional", !z.regional)} label="Regionale Herkunft" />
            <CheckboxRow checked={z.aktiv} onChange={() => set("aktiv", !z.aktiv)} label="Aktiv" sub="Inaktive Zutaten stehen in neuen Rezepten nicht zur Auswahl." />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Nährwerte je 100 g / 100 ml" />
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
          <NumberField label="Kalorien" value={z.naehrwertePro100.kcal} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, kcal: v })} min={0} suffix="kcal" />
          <NumberField label="Energie" value={z.naehrwertePro100.kj} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, kj: v })} min={0} suffix="kJ" />
          <NumberField label="Eiweiß" value={z.naehrwertePro100.eiweissG} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, eiweissG: v })} min={0} suffix="g" />
          <NumberField label="Fett" value={z.naehrwertePro100.fettG} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, fettG: v })} min={0} suffix="g" />
          <NumberField label="davon gesättigte Fettsäuren" value={z.naehrwertePro100.gesFettSaeurenG} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, gesFettSaeurenG: v })} min={0} suffix="g" />
          <NumberField label="Kohlenhydrate" value={z.naehrwertePro100.kohlenhydrateG} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, kohlenhydrateG: v })} min={0} suffix="g" />
          <NumberField label="davon Zucker" value={z.naehrwertePro100.zuckerG} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, zuckerG: v })} min={0} suffix="g" />
          <NumberField label="Ballaststoffe" value={z.naehrwertePro100.ballaststoffeG} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, ballaststoffeG: v })} min={0} suffix="g" />
          <NumberField label="Salz" value={z.naehrwertePro100.salzG} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, salzG: v })} min={0} suffix="g" />
          <NumberField label="Alkohol" value={z.naehrwertePro100.alkoholG} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, alkoholG: v })} min={0} suffix="g" />
          <div className="sm:col-span-3">
            <SelectField label="Quelle" value={z.naehrwertePro100.quelle} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, quelle: v as Zutat["naehrwertePro100"]["quelle"] })} options={NAEHRWERT_QUELLEN} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2 no-print">
        {onAbbrechen && <Button icon={ACTION_ICONS.cancel} label="Abbrechen" showLabel variant="secondary" onClick={onAbbrechen} />}
        <Button icon={initial ? ACTION_ICONS.save : ACTION_ICONS.create} label={initial ? "Änderungen speichern" : "Zutat anlegen"} showLabel type="submit" disabled={!kannSpeichern} />
      </div>
    </form>
  );
}
