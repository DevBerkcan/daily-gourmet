"use client";

import { ACTION_ICONS, Button, StatusBadge, Table, Td } from "@/components/ui";
import { bestellSummen, type Bestellung } from "@/lib/types";
import type { Rezept } from "@/features/recipes/types";
import type { Einrichtung } from "@/lib/services/facilities";
import type { Speiseplan } from "@/features/meal-plans/types";

export function BestellungDetailModal({
  bestellung,
  einrichtung,
  plan,
  rezepte,
  onClose,
}: {
  bestellung: Bestellung;
  einrichtung: Einrichtung | undefined;
  plan: Speiseplan | undefined;
  rezepte: Rezept[];
  onClose: () => void;
}) {
  const { urspruenglich, angepasst: gesamt, differenz } = bestellSummen(bestellung);
  const nachTag = [...bestellung.positionen].sort((a, b) => a.datum.localeCompare(b.datum) || a.rezeptId.localeCompare(b.rezeptId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bestellung-detail-title"
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-card border border-line bg-surface shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h2 id="bestellung-detail-title" className="break-words font-display text-lg font-semibold text-ink">
              Bestellung {einrichtung?.name ?? bestellung.einrichtungId}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              KW {plan?.kalenderwoche ?? "—"}
              {plan?.jahr ? `/${plan.jahr}` : ""} · Frist {bestellung.frist}
              {bestellung.abgesendetAm && ` · Abgesendet ${bestellung.abgesendetAm}`}
            </p>
          </div>
          <Button icon={ACTION_ICONS.cancel} label="Schließen" variant="ghost" onClick={onClose} showLabel />
        </header>

        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg border border-line bg-paper px-4 py-3 text-sm">
            <StatusBadge status={bestellung.status} />
            <span className="text-muted">{differenz > 0 ? "Abrechenbare Portionen:" : "Bestellte Portionen gesamt:"}</span>
            <span className="font-display text-xl font-semibold text-basil">{gesamt}</span>
            {differenz > 0 && (
              <span className="text-xs text-muted">
                ursprünglich {urspruenglich} · am Liefertag reduziert <strong className="text-warn">−{differenz}</strong>
              </span>
            )}
            <span className="ml-auto min-w-0 break-all text-xs text-muted">{bestellung.id}</span>
          </div>

          {nachTag.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Für diese Bestellung wurden keine Positionen übermittelt.</p>
          ) : (
            <Table head={["Tag", "Gericht", "Portionen", "Hinweis"]}>
              {nachTag.map((position, index) => (
                <tr key={`${position.datum}-${position.rezeptId}-${index}`}>
                  <Td className="whitespace-nowrap text-muted">
                    {new Date(`${position.datum}T12:00:00`).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })}
                  </Td>
                  <Td className="font-medium text-ink">{rezepte.find((r) => r.id === position.rezeptId)?.name ?? position.rezeptId}</Td>
                  <Td className="whitespace-nowrap font-semibold">
                    {/* Single wrapper: in the mobile card layout every direct child of a cell is laid
                        out separately, which split the number and the "urspr." line apart. */}
                    <div>
                      {position.portionen}
                      {position.urspruenglichePortionen !== undefined && position.urspruenglichePortionen !== position.portionen && (
                        <span className="block text-xs font-normal text-muted">
                          urspr. {position.urspruenglichePortionen} · <span className="text-warn">−{position.urspruenglichePortionen - position.portionen}</span>
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td className="text-muted">{position.hinweis ?? "—"}</Td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
