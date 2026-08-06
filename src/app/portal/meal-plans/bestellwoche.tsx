"use client";

import { useMemo, useState } from "react";
import { PageHeader, Card, Button, Tag, DummyNote } from "@/components/ui";
import { speiseplaene, rezeptById, rezeptAllergene } from "@/lib/data";
import { Lock, Save, Send } from "lucide-react";

/**
 * Interaktive Wochenansicht mit Portionseingabe (Phase 1: nur Client-State).
 * In Phase 2: Speichern als Entwurf / verbindliches Absenden über
 * POST /api/v1/orders bzw. POST /api/v1/orders/{id}/submit — inkl.
 * serverseitiger Fristprüfung.
 */
export function BestellWoche() {
  const plan = speiseplaene.find((p) => p.status === "PUBLISHED")!;
  const [mengen, setMengen] = useState<Record<string, number>>({
    "2026-08-06|r-001": 145,
    "2026-08-07|r-002": 120,
    "2026-08-07|r-003": 35,
  });
  const [gespeichert, setGespeichert] = useState<string | null>(null);

  const heute = "2026-08-06";
  const gesamt = useMemo(() => Object.values(mengen).reduce((s, n) => s + (n || 0), 0), [mengen]);

  const setMenge = (key: string, value: number) => {
    // Mengen dürfen nicht negativ sein (Prüfung erfolgt in Phase 2 zusätzlich serverseitig).
    setMengen((m) => ({ ...m, [key]: Math.max(0, value) }));
    setGespeichert(null);
  };

  return (
    <>
      <PageHeader
        title={`Speiseplan KW ${plan.kalenderwoche}`}
        subtitle="Tragen Sie die Portionsmengen je Gericht ein. Vergangene Tage sind gesperrt; Änderungen sind bis zur Frist (Vortag, 09:00 Uhr) möglich."
        actions={
          <>
            <Button variant="secondary"><Save size={15} aria-hidden /> Als Entwurf speichern</Button>
            <Button><Send size={15} aria-hidden /> Verbindlich absenden</Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-card border border-line bg-surface px-5 py-3 text-sm">
        <span className="text-muted">Bestellte Portionen gesamt:</span>
        <span className="font-display text-xl font-semibold text-basil">{gesamt}</span>
        <span className="ml-auto text-xs text-muted">Status: Bestätigt · letzte Änderung 01.08., 14:22</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {plan.tage.map((tag) => {
          const gesperrt = tag.datum < heute;
          return (
            <Card key={tag.datum} className={`flex flex-col ${gesperrt ? "opacity-70" : ""}`}>
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{tag.wochentag}</p>
                  <p className="text-xs text-muted">{new Date(tag.datum).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}</p>
                </div>
                {gesperrt && <Lock size={14} className="text-muted" aria-label="Frist abgelaufen" />}
              </div>
              <div className="flex flex-1 flex-col gap-3 px-4 py-3">
                {tag.rezeptIds.map((rid) => {
                  const r = rezeptById(rid);
                  if (!r) return null;
                  const key = `${tag.datum}|${rid}`;
                  const allergene = rezeptAllergene(r);
                  return (
                    <div key={rid} className="rounded-lg border border-line bg-paper px-3 py-2.5">
                      <p className="text-sm font-medium leading-snug text-ink">{r.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {r.vegan ? <Tag tone="green">vegan</Tag> : r.vegetarisch ? <Tag tone="green">veg.</Tag> : null}
                        {allergene.map((a) => <Tag key={a} tone="amber">{a}</Tag>)}
                      </div>
                      <label className="mt-2.5 flex items-center justify-between gap-2 text-xs text-muted">
                        Portionen
                        <input
                          type="number"
                          min={0}
                          disabled={gesperrt}
                          value={mengen[key] ?? 0}
                          onChange={(e) => setMenge(key, Number(e.target.value) || 0)}
                          className="min-h-9 w-20 rounded-lg border border-line bg-surface px-2.5 text-right text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil disabled:cursor-not-allowed disabled:bg-line"
                          aria-label={`Portionen für ${r.name} am ${tag.wochentag}`}
                        />
                      </label>
                    </div>
                  );
                })}
                {tag.hinweis && <p className="rounded-md bg-saffron-soft px-2.5 py-1.5 text-xs text-ink">{tag.hinweis}</p>}
                {!gesperrt && (
                  <label className="mt-auto text-xs text-muted">
                    Hinweis zum Tag
                    <input
                      type="text"
                      placeholder="z. B. Klasse 5b auf Ausflug"
                      className="mt-1 min-h-9 w-full rounded-lg border border-line bg-surface px-2.5 text-sm placeholder:text-muted focus:outline-2 focus:outline-offset-1 focus:outline-basil"
                    />
                  </label>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {gespeichert && <p className="mt-4 text-sm text-ok">{gespeichert}</p>}
      <DummyNote />
    </>
  );
}
