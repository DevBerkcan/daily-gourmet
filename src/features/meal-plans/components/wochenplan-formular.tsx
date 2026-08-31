"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, Card, CardHeader, Button, StatusBadge } from "@/components/ui";
import { useStandorte } from "@/lib/services/locations";
import { useEinrichtungen } from "@/lib/services/facilities";
import { nextUpcomingWeeks } from "@/lib/isoWeek";
import { useCreateSpeiseplan, useSpeiseplaene, useMealPlanTemplates, useDuplicateIntoWeek } from "@/lib/services/meal-plans";
import { HEUTE } from "@/lib/heute";

function CheckboxRow({ checked, onChange, label, sub, status, disabled }: { checked: boolean; onChange: () => void; label: string; sub?: string; status?: string; disabled?: boolean }) {
  return (
    <label
      className={`flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-paper"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="size-4 accent-basil" />
        <span>
          <span className="font-medium text-ink">{label}</span>
          {sub && <span className="block text-xs text-muted">{sub}</span>}
        </span>
      </span>
      {status && <StatusBadge status={status} />}
    </label>
  );
}

export function WochenplanFormular() {
  const router = useRouter();
  const plaene = useSpeiseplaene();
  const vorlagen = useMealPlanTemplates();
  const standorte = useStandorte();
  const einrichtungen = useEinrichtungen();
  const createSpeiseplan = useCreateSpeiseplan();
  const duplicateIntoWeek = useDuplicateIntoWeek();

  /** Pro KW ("jahr-kalenderwoche") die Einrichtungen, die dort bereits einen Plan haben — über alle
   * bestehenden Pläne hinweg, nicht nur einen. Mehrere unterschiedliche Pläne können dieselbe KW
   * belegen (z. B. 14 Einrichtungen mit einem Plan, 6 andere mit einem eigenen); nur eine einzelne
   * Einrichtung darf pro KW nicht in zwei Plänen vorkommen (serverseitig erzwungen über
   * MealPlanFacilities' Unique-Index, siehe MealPlanHandler.AddFacilities). */
  const belegtByWeek = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const p of plaene) {
      const key = `${p.jahr}-${p.kalenderwoche}`;
      const set = map.get(key) ?? new Set<string>();
      for (const id of p.einrichtungIds) set.add(id);
      map.set(key, set);
    }
    return map;
  }, [plaene]);

  const wochen = useMemo(() => {
    const aktiveIds = einrichtungen.filter((e) => e.status === "AKTIV").map((e) => e.id);
    const vollBelegteWochen = new Set(
      [...belegtByWeek.entries()]
        .filter(([, ids]) => aktiveIds.length > 0 && aktiveIds.every((id) => ids.has(id)))
        .map(([key]) => key)
    );
    return nextUpcomingWeeks(HEUTE, vollBelegteWochen, 10);
  }, [belegtByWeek, einrichtungen]);

  const [modus, setModus] = useState<"leer" | "vorlage">("leer");
  const [vorlageId, setVorlageId] = useState("");
  const [weekKey, setWeekKey] = useState(() => (wochen[0] ? `${wochen[0].jahr}-${wochen[0].kalenderwoche}` : ""));
  const [einrichtungIds, setEinrichtungIds] = useState<string[]>([]);
  const [einrichtungSuche, setEinrichtungSuche] = useState("");

  const belegteEinrichtungIds = belegtByWeek.get(weekKey) ?? new Set<string>();

  const handleWeekChange = (newKey: string) => {
    setWeekKey(newKey);
    const belegt = belegtByWeek.get(newKey) ?? new Set<string>();
    setEinrichtungIds((ids) => ids.filter((id) => !belegt.has(id)));
  };

  const gefilterteEinrichtungen = einrichtungen.filter(
    (e) => e.status === "AKTIV" && (einrichtungSuche.trim() === "" || e.name.toLowerCase().includes(einrichtungSuche.trim().toLowerCase()) || e.kundennummer.toLowerCase().includes(einrichtungSuche.trim().toLowerCase()))
  );

  const toggleEinrichtung = (id: string) => {
    setEinrichtungIds((ids) => (ids.includes(id) ? ids.filter((e) => e !== id) : [...ids, id]));
  };

  const kannAbsenden = weekKey !== "" && einrichtungIds.length > 0 && (modus === "vorlage" ? vorlageId !== "" : true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kannAbsenden) return;
    const [jahr, kalenderwoche] = weekKey.split("-").map(Number);
    if (modus === "vorlage") {
      duplicateIntoWeek.mutate(
        { id: vorlageId, zielJahr: jahr, zielKalenderwoche: kalenderwoche, einrichtungIds },
        { onSuccess: (plan) => router.push(`/admin/meal-plans/${plan.id}`) }
      );
      return;
    }
    const standortIds = [...new Set(einrichtungIds.map((id) => einrichtungen.find((e) => e.id === id)?.standortId).filter((id): id is string => !!id))];
    createSpeiseplan.mutate(
      { kalenderwoche, jahr, standortIds, einrichtungIds },
      { onSuccess: (plan) => router.push(`/admin/meal-plans/${plan.id}`) }
    );
  };

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
        <Link href="/admin/meal-plans" className="hover:text-basil hover:underline">Speisepläne</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">Wochenplan erstellen</span>
      </nav>

      <PageHeader title="Wochenplan erstellen" subtitle="Legen Sie Kalenderwoche und Einrichtungen fest, oder starten Sie aus einer der acht Vorlagen." />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader title="Ausgangspunkt" />
          <div className="flex gap-4 px-5 py-4">
            <CheckboxRow checked={modus === "leer"} onChange={() => setModus("leer")} label="Leerer Plan" sub="Gerichte im nächsten Schritt je Tag hinzufügen" />
            <CheckboxRow checked={modus === "vorlage"} onChange={() => setModus("vorlage")} label="Aus Vorlage erstellen" sub="Übernimmt Tage, Gerichte und Menülinien einer der 8 Vorlagen" />
          </div>
        </Card>

        {modus === "vorlage" && (
          <Card>
            <CardHeader title="Vorlage" hint="Tage, Gerichte und Menülinien werden übernommen — die Einrichtungen wählen Sie unten, da eine Vorlage keinem Kunden zugeordnet ist." />
            <div className="px-5 py-4">
              {vorlagen.length === 0 ? (
                <p className="text-sm text-muted">Noch keine Vorlagen angelegt — legen Sie einen Plan an und markieren Sie ihn als Vorlage (Slot 1-8).</p>
              ) : (
                <select
                  aria-label="Vorlage wählen"
                  value={vorlageId}
                  onChange={(e) => setVorlageId(e.target.value)}
                  className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm"
                >
                  <option value="" disabled>Vorlage wählen …</option>
                  {vorlagen.map((v) => (
                    <option key={v.id} value={v.id}>Vorlage {v.vorlagenSlot}</option>
                  ))}
                </select>
              )}
            </div>
          </Card>
        )}

        <Card>
          <CardHeader title="Kalenderwoche" hint="Kommende Wochen, für die noch nicht alle aktiven Einrichtungen verplant sind. Für dieselbe KW können mehrere unterschiedliche Pläne für unterschiedliche Einrichtungen existieren." />
          <div className="px-5 py-4">
            <select
              aria-label="Kalenderwoche wählen"
              value={weekKey}
              onChange={(e) => handleWeekChange(e.target.value)}
              className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm"
            >
              {wochen.map((w) => (
                <option key={`${w.jahr}-${w.kalenderwoche}`} value={`${w.jahr}-${w.kalenderwoche}`}>
                  KW {w.kalenderwoche} / {w.jahr}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card>
          <CardHeader title="Einrichtungen" hint="Für welche Einrichtungen gilt dieser Wochenplan? Mehrere möglich — sie teilen sich dann dieselben Gerichte. Der Standort wird automatisch übernommen. Einrichtungen, die für diese Kalenderwoche bereits einen anderen Plan haben, sind ausgegraut." />
          <div className="flex flex-col gap-4 px-5 py-4">
            <input
              type="search"
              value={einrichtungSuche}
              onChange={(e) => setEinrichtungSuche(e.target.value)}
              placeholder="Einrichtung suchen …"
              aria-label="Einrichtung suchen"
              className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-basil"
            />
            {gefilterteEinrichtungen.length === 0 ? (
              <p className="text-sm text-muted">Keine Einrichtung gefunden.</p>
            ) : (
              standorte
                .filter((s) => gefilterteEinrichtungen.some((e) => e.standortId === s.id))
                .map((standort) => (
                  <div key={standort.id}>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{standort.name}</p>
                    <div className="flex flex-col gap-2">
                      {gefilterteEinrichtungen
                        .filter((e) => e.standortId === standort.id)
                        .map((e) => {
                          const belegt = belegteEinrichtungIds.has(e.id);
                          return (
                            <CheckboxRow
                              key={e.id}
                              checked={einrichtungIds.includes(e.id)}
                              onChange={() => toggleEinrichtung(e.id)}
                              label={e.name}
                              sub={belegt ? "Bereits verplant für diese Kalenderwoche" : e.kundennummer}
                              status={e.status}
                              disabled={belegt}
                            />
                          );
                        })}
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>

        <div className="flex justify-end gap-2 no-print">
          <Button variant="secondary" href="/admin/meal-plans">Abbrechen</Button>
          <Button type="submit" disabled={!kannAbsenden}>Wochenplan anlegen</Button>
        </div>
      </form>
    </>
  );
}
