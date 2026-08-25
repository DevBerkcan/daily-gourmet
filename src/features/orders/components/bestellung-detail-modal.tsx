"use client";

import { X } from "lucide-react";
import { StatusBadge, Table, Td } from "@/components/ui";
import type { Bestellung } from "@/lib/types";
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
  const gesamt = bestellung.positionen.reduce((summe, position) => summe + position.portionen, 0);
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
          <div>
            <h2 id="bestellung-detail-title" className="font-display text-lg font-semibold text-ink">
              Bestellung {einrichtung?.name ?? bestellung.einrichtungId}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              KW {plan?.kalenderwoche ?? "—"}
              {plan?.jahr ? `/${plan.jahr}` : ""} · Frist {bestellung.frist}
              {bestellung.abgesendetAm && ` · Abgesendet ${bestellung.abgesendetAm}`}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Schließen" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-paper hover:text-ink">
            <X size={19} aria-hidden />
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg border border-line bg-paper px-4 py-3 text-sm">
            <StatusBadge status={bestellung.status} />
            <span className="text-muted">Bestellte Portionen gesamt:</span>
            <span className="font-display text-xl font-semibold text-basil">{gesamt}</span>
            <span className="ml-auto text-xs text-muted">{bestellung.id}</span>
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
                  <Td className="font-semibold">{position.portionen}</Td>
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
