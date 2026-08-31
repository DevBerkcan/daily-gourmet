"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui";
import { useDialogFocus } from "@/lib/use-dialog-focus";
import { useMealPlanTemplates } from "@/lib/services/meal-plans";

const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Legt eine eigenständige Kopie eines Plans als Vorlage (Slot 1-8) an — der Ursprungsplan bleibt
 * unangetastet (siehe MealPlanHandler.MarkAsTemplateAsync). Belegte Slots sind sichtbar, aber
 * deaktiviert statt einfach ausgeblendet, damit klar bleibt, dass es genau 8 Plätze gibt. */
export function MarkAsTemplateDialog({
  open,
  onConfirm,
  onCancel,
  submitting,
}: {
  open: boolean;
  onConfirm: (slot: number) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const vorlagen = useMealPlanTemplates();
  const [slot, setSlot] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(open, dialogRef, onCancel);

  if (!open) return null;
  const belegtBySlot = new Map(vorlagen.filter((v) => v.vorlagenSlot).map((v) => [v.vorlagenSlot!, v]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-ink/50" onClick={onCancel} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-slot-dialog-title"
        tabIndex={-1}
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-card border border-line bg-surface shadow-2xl"
      >
        <div className="px-5 pt-5">
          <h2 id="template-slot-dialog-title" className="font-display text-lg font-semibold text-ink">Als Vorlage markieren</h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            Legt eine eigenständige Kopie dieses Plans als Vorlage an — Tage, Gerichte und Menülinien werden übernommen. Der Originalplan (Einrichtung, Status, Bestellungen) bleibt unverändert.
          </p>
        </div>
        <fieldset className="px-5 py-4">
          <legend className="mb-2 text-xs font-medium text-muted">Vorlagenplatz wählen</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SLOTS.map((s) => {
              const belegt = belegtBySlot.get(s);
              return (
                <label
                  key={s}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    belegt ? "cursor-not-allowed border-line bg-paper text-muted" : slot === s ? "cursor-pointer border-basil bg-basil-soft" : "cursor-pointer border-line bg-surface hover:bg-paper"
                  }`}
                >
                  <input
                    type="radio"
                    name="vorlagenslot"
                    checked={slot === s}
                    disabled={!!belegt}
                    onChange={() => setSlot(s)}
                    className="size-4 accent-basil disabled:opacity-40"
                  />
                  <span>
                    <span className="font-medium text-ink">Slot {s}</span>
                    {belegt && <span className="block text-[11px] text-muted">belegt</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="flex justify-end gap-2 border-t border-line bg-paper px-5 py-4">
          <Button variant="secondary" onClick={onCancel}>Abbrechen</Button>
          <Button onClick={() => slot && onConfirm(slot)} disabled={!slot || submitting}>Vorlage anlegen</Button>
        </div>
      </div>
    </div>
  );
}
