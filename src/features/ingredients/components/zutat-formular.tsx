"use client";

import { useState } from "react";
import { Card, CardHeader, Button } from "@/components/ui";
import { TextField, NumberField, SelectField, CheckboxRow, CheckboxGroup } from "@/components/ui/form-fields";
import { ZUTAT_KATEGORIEN, ALLERGENE_LISTE, ZUSATZSTOFFE_LISTE } from "../data";
import type { Zutat } from "@/lib/services/ingredients";
import type { Einheit } from "@/lib/types";

const EINHEITEN: Einheit[] = ["g", "kg", "ml", "l", "Stück"];
const NAEHRWERT_QUELLEN = ["Open Food Facts", "USDA FoodData Central", "Manuell"] as const;

function leer(): Omit<Zutat, "id"> {
  return {
    name: "", artikelnummer: "", kategorie: ZUTAT_KATEGORIEN[0], basiseinheit: "kg", einkaufseinheit: "", umrechnungsfaktor: 1,
    einkaufspreis: undefined, lieferant: "", allergene: [], zusatzstoffe: [], vegetarisch: true, vegan: true, bio: false, regional: false, aktiv: true,
    naehrwertePro100: { kcal: 0, eiweissG: 0, fettG: 0, kohlenhydrateG: 0, zuckerG: 0, salzG: 0, quelle: "Manuell" },
  };
}

export function ZutatFormular({ initial, onSubmit, onAbbrechen }: { initial?: Zutat; onSubmit: (input: Omit<Zutat, "id">) => void; onAbbrechen?: () => void }) {
  const [z, setZ] = useState<Omit<Zutat, "id">>(initial ? { ...initial } : leer());

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
          <SelectField label="Kategorie" value={z.kategorie} onChange={(v) => set("kategorie", v)} options={ZUTAT_KATEGORIEN} />
          <TextField label="Lieferant" value={z.lieferant} onChange={(v) => set("lieferant", v)} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Einheiten & Preis" />
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <SelectField label="Basiseinheit" value={z.basiseinheit} onChange={(v) => set("basiseinheit", v as Einheit)} options={EINHEITEN} />
          <TextField label="Einkaufseinheit" value={z.einkaufseinheit} onChange={(v) => set("einkaufseinheit", v)} placeholder="z. B. Sack (25 kg)" />
          <NumberField label="Umrechnungsfaktor" value={z.umrechnungsfaktor} onChange={(v) => set("umrechnungsfaktor", v)} min={0.01} hint="Basiseinheiten je Einkaufseinheit" />
          <NumberField label="Einkaufspreis" value={z.einkaufspreis ?? ""} onChange={(v) => set("einkaufspreis", v)} min={0} suffix="€ je Einkaufseinheit" />
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
          <NumberField label="Eiweiß" value={z.naehrwertePro100.eiweissG} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, eiweissG: v })} min={0} suffix="g" />
          <NumberField label="Fett" value={z.naehrwertePro100.fettG} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, fettG: v })} min={0} suffix="g" />
          <NumberField label="Kohlenhydrate" value={z.naehrwertePro100.kohlenhydrateG} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, kohlenhydrateG: v })} min={0} suffix="g" />
          <NumberField label="davon Zucker" value={z.naehrwertePro100.zuckerG} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, zuckerG: v })} min={0} suffix="g" />
          <NumberField label="Salz" value={z.naehrwertePro100.salzG} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, salzG: v })} min={0} suffix="g" />
          <div className="sm:col-span-3">
            <SelectField label="Quelle" value={z.naehrwertePro100.quelle} onChange={(v) => set("naehrwertePro100", { ...z.naehrwertePro100, quelle: v as Zutat["naehrwertePro100"]["quelle"] })} options={NAEHRWERT_QUELLEN} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2 no-print">
        {onAbbrechen && <Button variant="secondary" onClick={onAbbrechen}>Abbrechen</Button>}
        <Button type="submit" disabled={!kannSpeichern}>{initial ? "Änderungen speichern" : "Zutat anlegen"}</Button>
      </div>
    </form>
  );
}
