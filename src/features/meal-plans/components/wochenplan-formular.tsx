"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, Card, CardHeader, Button, StatusBadge } from "@/components/ui";
import { useStandorte } from "@/lib/services/locations";
import { useEinrichtungen } from "@/lib/services/facilities";
import { nextUpcomingWeeks } from "@/lib/isoWeek";
import { useCreateSpeiseplan, useSpeiseplaene } from "@/lib/services/meal-plans";

const HEUTE = "2026-08-06";

function CheckboxRow({ checked, onChange, label, sub, status }: { checked: boolean; onChange: () => void; label: string; sub?: string; status?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm hover:bg-paper">
      <span className="flex items-center gap-2.5">
        <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-basil" />
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
  const standorte = useStandorte();
  const einrichtungen = useEinrichtungen();
  const createSpeiseplan = useCreateSpeiseplan();

  const wochen = useMemo(() => {
    const takenKeys = new Set(plaene.map((p) => `${p.jahr}-${p.kalenderwoche}`));
    return nextUpcomingWeeks(HEUTE, takenKeys, 10);
  }, [plaene]);

  const [weekKey, setWeekKey] = useState(() => (wochen[0] ? `${wochen[0].jahr}-${wochen[0].kalenderwoche}` : ""));
  const [standortIds, setStandortIds] = useState<string[]>(() => standorte.map((s) => s.id));
  const [einrichtungIds, setEinrichtungIds] = useState<string[]>([]);

  const toggleStandort = (id: string) => {
    setStandortIds((ids) => (ids.includes(id) ? ids.filter((s) => s !== id) : [...ids, id]));
    setEinrichtungIds((ids) => ids.filter((eid) => einrichtungen.find((e) => e.id === eid)?.standortId !== id));
  };

  const toggleEinrichtung = (id: string) => {
    setEinrichtungIds((ids) => (ids.includes(id) ? ids.filter((e) => e !== id) : [...ids, id]));
  };

  const kannAbsenden = weekKey !== "" && standortIds.length > 0 && einrichtungIds.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kannAbsenden) return;
    const [jahr, kalenderwoche] = weekKey.split("-").map(Number);
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

      <PageHeader title="Wochenplan erstellen" subtitle="Legen Sie Kalenderwoche, Standorte und Einrichtungen fest. Rezepte fügen Sie im nächsten Schritt je Essenstag hinzu." />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader title="Kalenderwoche" hint="Nur noch nicht verplante, kommende Wochen stehen zur Auswahl." />
          <div className="px-5 py-4">
            <select
              aria-label="Kalenderwoche wählen"
              value={weekKey}
              onChange={(e) => setWeekKey(e.target.value)}
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
          <CardHeader title="Standorte" hint="Küchen- bzw. Produktionsstandort(e) für diesen Wochenplan." />
          <div className="flex flex-col gap-2 px-5 py-4">
            {standorte.map((s) => (
              <CheckboxRow key={s.id} checked={standortIds.includes(s.id)} onChange={() => toggleStandort(s.id)} label={s.name} sub={s.anschrift} status={s.status} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Einrichtungen" hint="Für welche Einrichtungen wird dieser Wochenplan veröffentlicht?" />
          <div className="flex flex-col gap-5 px-5 py-4">
            {standortIds.length === 0 ? (
              <p className="text-sm text-muted">Wählen Sie zunächst mindestens einen Standort.</p>
            ) : (
              standortIds.map((sid) => {
                const standort = standorte.find((s) => s.id === sid);
                const zugehoerige = einrichtungen.filter((e) => e.standortId === sid);
                return (
                  <div key={sid}>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{standort?.name}</p>
                    <div className="flex flex-col gap-2">
                      {zugehoerige.map((e) => (
                        <CheckboxRow key={e.id} checked={einrichtungIds.includes(e.id)} onChange={() => toggleEinrichtung(e.id)} label={e.name} sub={e.kundennummer} status={e.status} />
                      ))}
                    </div>
                  </div>
                );
              })
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
