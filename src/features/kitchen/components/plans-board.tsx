import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Card } from "@/components/ui";
import { standortById } from "@/lib/data";
import { produktionsplaene } from "@/features/production/data";
import { rezeptById } from "@/features/recipes/data";
import { PlanStatus } from "./plan-status";

function datumLabel(datum: string) {
  return new Date(`${datum}T12:00:00`).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function PlansBoard() {
  return (
    <div className="flex flex-col gap-6">
      {produktionsplaene.map((plan, index) => {
        const gesamt = plan.positionen.reduce(
          (summe, position) => summe + position.bestellteMenge + position.zusatzMenge,
          0,
        );

        return (
          <Card key={plan.id}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={17} className="text-basil" aria-hidden />
                  <h2 className="font-display text-lg font-semibold capitalize text-ink">
                    {datumLabel(plan.datum)}
                  </h2>
                  {index === 0 && (
                    <span className="rounded-full bg-saffron-soft px-2.5 py-0.5 text-xs font-medium text-saffron">
                      Aktueller Plan
                    </span>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                  <MapPin size={13} aria-hidden /> {standortById(plan.standortId)?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-semibold text-ink">{gesamt}</p>
                <p className="text-xs text-muted">Portionen gesamt</p>
              </div>
            </div>

            <div className="divide-y divide-line">
              {plan.positionen.map((position) => {
                const rezept = rezeptById(position.rezeptId);
                const produktionsmenge = position.bestellteMenge + position.zusatzMenge;

                return (
                  <Link
                    key={position.rezeptId}
                    href={`/kitchen/plans/${plan.id}/recipes/${position.rezeptId}`}
                    className="group flex min-h-20 items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-basil"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-ink group-hover:text-basil">{rezept?.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <PlanStatus planId={plan.id} rezeptId={position.rezeptId} />
                        <span>{position.bestellteMenge} bestellt</span>
                        {position.zusatzMenge > 0 && <span>+ {position.zusatzMenge} Zusatzmenge</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <div className="text-right">
                        <p className="font-display text-xl font-semibold text-basil">{produktionsmenge}</p>
                        <p className="text-xs text-muted">Portionen</p>
                      </div>
                      <ArrowRight size={18} className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-basil" aria-hidden />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
