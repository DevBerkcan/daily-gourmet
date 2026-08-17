"use client";

import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { KitchenStatus } from "./kitchen-status";
import { useUpdateProduktionsposition, type ProduktionsPosition } from "@/lib/services/production";
import { workStatusLabel, workStatusOrder } from "../data";

export function RecipeWorkActions({ planId, position }: { planId: string; position: ProduktionsPosition }) {
  const updateStatus = useUpdateProduktionsposition();
  const index = workStatusOrder.indexOf(position.workStatus);
  const next = workStatusOrder[index + 1];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface px-5 py-4 no-print">
      <div className="mr-auto"><p className="text-xs font-medium uppercase tracking-wide text-muted">Aktueller Arbeitsstatus</p><div className="mt-1"><KitchenStatus status={position.workStatus} /></div></div>
      {next ? (
        <Button onClick={() => updateStatus.mutate({ planId, itemId: position.id, updates: { workStatus: next } })}>
          {next === "FERTIG" ? <CheckCircle2 size={16} aria-hidden /> : <ArrowRight size={16} aria-hidden />}{workStatusLabel[next]}
        </Button>
      ) : null}
      {index > 0 ? (
        <Button variant="secondary" onClick={() => updateStatus.mutate({ planId, itemId: position.id, updates: { workStatus: workStatusOrder[index - 1] } })}>
          <RotateCcw size={15} aria-hidden /> Einen Schritt zurück
        </Button>
      ) : null}
    </div>
  );
}
