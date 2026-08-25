"use client";

import { X } from "lucide-react";
import { useRezeptNaehrwerteDetail } from "@/lib/services/recipes";
import type { Rezept, RezeptNaehrwerte100 } from "../types";

const fmt = (n: number | undefined, digits = 2) =>
  n === undefined ? "—" : n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: digits });

const spalten = [
  { label: "Kcal", key: "kcal" as const },
  { label: "KJ", key: "kj" as const },
  { label: "Fett", key: "fettG" as const },
  { label: "ges.FE", key: "gesFettSaeurenG" as const },
  { label: "KH", key: "kohlenhydrateG" as const },
  { label: "ZU", key: "zuckerG" as const },
  { label: "EW", key: "eiweissG" as const },
  { label: "Sal", key: "salzG" as const },
  { label: "BAl", key: "ballaststoffeG" as const },
  { label: "ALK", key: "alkoholG" as const },
];

function AggregatZeile({ label, hint, werte, betont }: { label: string; hint?: string; werte?: RezeptNaehrwerte100; betont?: boolean }) {
  return (
    <tr className={betont ? "bg-saffron-soft/60" : ""}>
      <td colSpan={3} className="px-3 py-2 text-right text-xs font-semibold text-ink">
        {label}
        {hint && <span className="ml-1 font-normal text-muted">{hint}</span>}
      </td>
      {spalten.map((s) => (
        <td key={s.key} className="whitespace-nowrap px-3 py-2 text-right text-xs font-semibold text-ink">
          {werte ? fmt(werte[s.key]) : "—"}
        </td>
      ))}
    </tr>
  );
}

function DiabetikerZeile({ label, werte }: { label: string; werte?: { be: number; ke: number; fpe: number } }) {
  return (
    <tr>
      <td colSpan={3} className="px-3 py-1.5 text-right text-xs text-muted">{label}</td>
      <td colSpan={10} className="px-3 py-1.5 text-xs text-muted">
        {werte ? `BE: ${fmt(werte.be, 1)} · KE: ${fmt(werte.ke, 1)} · FPE: ${fmt(werte.fpe, 1)}` : "—"}
      </td>
    </tr>
  );
}

export function NaehrwerteModal({ rezept, onClose }: { rezept: Rezept; onClose: () => void }) {
  const detail = useRezeptNaehrwerteDetail(rezept.id);

  const macro = detail?.pro100g;
  const macroSumG = macro ? macro.fettG + macro.kohlenhydrateG + macro.eiweissG : 0;
  const macroAnteile = macro && macroSumG > 0
    ? [
        { label: "Fett", g: macro.fettG, farbe: "var(--color-warn, #d97706)" },
        { label: "Kohlenhydrate", g: macro.kohlenhydrateG, farbe: "var(--color-basil-deep, #166534)" },
        { label: "Eiweiß", g: macro.eiweissG, farbe: "var(--color-basil, #4d9a5b)" },
      ].map((m) => ({ ...m, prozent: (m.g / macroSumG) * 100 }))
    : [];
  let laufwinkel = 0;
  const gradientTeile = macroAnteile.map((m) => {
    const start = laufwinkel;
    laufwinkel += (m.prozent / 100) * 360;
    return `${m.farbe} ${start}deg ${laufwinkel}deg`;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="naehrwerte-modal-title"
        className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-card border border-line bg-surface shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
          <div>
            <h2 id="naehrwerte-modal-title" className="font-display text-lg font-semibold text-ink">Nährwerte ansehen</h2>
            <p className="mt-0.5 text-sm text-muted">Rezept: {rezept.name}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Schließen" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-paper hover:text-ink">
            <X size={19} aria-hidden />
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-5">
          {!detail ? (
            <p className="py-8 text-center text-sm text-muted">Lade Nährwerte …</p>
          ) : (
            <>
              <div className="mb-5 grid grid-cols-2 gap-3 rounded-lg border border-line bg-paper p-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted">Rohgewicht</p>
                  <p className="font-display text-lg font-semibold text-ink">{fmt(detail.rohgewichtG, 1)} g</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Reduktionsfaktor</p>
                  <p className="font-display text-lg font-semibold text-ink">{fmt(detail.reduktionsfaktor, 3)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Gewicht zubereitet</p>
                  <p className="font-display text-lg font-semibold text-ink">{fmt(detail.gewichtZubereitetG, 1)} g</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Portionen</p>
                  <p className="font-display text-lg font-semibold text-ink">
                    {detail.standardPortionen}
                    {detail.gewichtProPortionG !== undefined && <span className="ml-1 text-sm font-normal text-muted">à {fmt(detail.gewichtProPortionG, 0)} g</span>}
                  </p>
                </div>
              </div>

              <div className="scroll-x rounded-lg border border-line">
                <table className="w-full min-w-[860px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-saffron-soft text-xs font-semibold uppercase tracking-wide text-ink">
                      <th className="px-3 py-2 text-left">Menge</th>
                      <th className="px-3 py-2 text-left">Gewicht</th>
                      <th className="px-3 py-2 text-left">Zutat</th>
                      {spalten.map((s) => <th key={s.key} className="px-3 py-2 text-right">{s.label}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {detail.zutaten.map((z) => (
                      <tr key={z.zutatId} className={z.hatNaehrwerte ? "" : "text-muted"}>
                        <td className="whitespace-nowrap px-3 py-2 text-xs">{fmt(z.menge, 3)} {z.einheit}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-xs">{z.gewichtG !== undefined ? `${fmt(z.gewichtG, 0)}g` : "—"}</td>
                        <td className="px-3 py-2 text-xs font-medium text-ink">
                          {z.name}
                          {!z.hatNaehrwerte && <span className="ml-1.5 text-[11px] text-muted">(keine Nährwerte hinterlegt)</span>}
                        </td>
                        {spalten.map((s) => (
                          <td key={s.key} className="whitespace-nowrap px-3 py-2 text-right text-xs">{fmt(z.naehrwerte[s.key])}</td>
                        ))}
                      </tr>
                    ))}
                    <AggregatZeile label="Nährwerte pro Rezept" werte={detail.proRezept} />
                    <AggregatZeile label="Nährwerte pro Portion" werte={detail.proPortion} betont />
                    <DiabetikerZeile label="Diabetiker Werte pro Portion" werte={detail.diabetikerProPortion} />
                    <AggregatZeile label="Nährwerte pro 100g" hint="inkl. Reduktionsfaktor" werte={detail.pro100g} betont />
                    <DiabetikerZeile label="Diabetiker Werte je 100g" werte={detail.diabetikerPro100g} />
                  </tbody>
                </table>
              </div>
              {detail.zutaten.some((z) => !z.hatNaehrwerte) && (
                <p className="mt-2 text-xs text-muted">
                  Zutaten ohne hinterlegte Nährwerte gehen mit 0 in die Zutaten-Zeile ein — die Zeilen „pro Rezept“/„pro Portion“/„pro 100g“ stammen
                  aber aus den Kennzeichnungsdaten dieses Rezepts, nicht aus der Summe der Zutaten, und sind davon nicht betroffen.
                </p>
              )}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-ink">Makro Nährstoff-Zusammensetzung</h3>
                  {macroAnteile.length > 0 ? (
                    <div className="flex items-center gap-6">
                      <div
                        className="size-36 shrink-0 rounded-full"
                        style={{ background: `conic-gradient(${gradientTeile.join(", ")})` }}
                        role="img"
                        aria-label={macroAnteile.map((m) => `${m.label} ${fmt(m.prozent, 1)}%`).join(", ")}
                      />
                      <ul className="flex flex-col gap-2 text-sm">
                        {macroAnteile.map((m) => (
                          <li key={m.label} className="flex items-center gap-2">
                            <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: m.farbe }} aria-hidden />
                            <span className="text-ink">{m.label}</span>
                            <span className="font-semibold text-ink">{fmt(m.prozent, 2)}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Keine Nährwerte für dieses Rezept hinterlegt.</p>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-ink">Nährwertbezogene Angaben</h3>
                  {detail.angaben.length === 0 ? (
                    <p className="text-sm text-muted">Keine nährwertbezogenen Angaben importiert.</p>
                  ) : (
                    <div className="scroll-x rounded-lg border border-line">
                      <table className="w-full min-w-[420px] border-collapse text-sm">
                        <thead>
                          <tr className="bg-paper text-xs font-semibold uppercase tracking-wide text-muted">
                            <th className="px-3 py-2 text-left">Angabe</th>
                            <th className="px-3 py-2 text-left">Messwert</th>
                            <th className="px-3 py-2 text-left">Gehalt</th>
                            <th className="px-3 py-2 text-left">Schwelle</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {detail.angaben.map((a) => (
                            <tr key={a.text}>
                              <td className="px-3 py-2 text-xs font-medium text-ink">{a.text}</td>
                              <td className="px-3 py-2 text-xs text-muted">{a.messgroesse ?? "—"}</td>
                              <td className="px-3 py-2 text-xs text-muted">{a.gemessenerWert ?? "—"}</td>
                              <td className="px-3 py-2 text-xs text-muted">{a.schwelle ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
