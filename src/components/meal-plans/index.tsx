import type { ReactNode } from "react";
import { Lock, UtensilsCrossed, Carrot, Soup, Salad, IceCreamCone, Croissant, Sandwich, Utensils, type LucideIcon } from "lucide-react";
import { Tag } from "@/components/ui";
import type { Rezept } from "@/features/recipes/types";

export function WeekCalendar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`scroll-x ${className}`} role="region" aria-label="Wochenübersicht" tabIndex={0}>
      <div className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col snap-x snap-mandatory gap-4 xl:grid-flow-row xl:auto-cols-auto xl:grid-cols-5 xl:snap-none">
        {children}
      </div>
    </div>
  );
}

export function DayColumn({
  wochentag, datum, isToday, locked, lockedLabel, hinweis, footer, children,
}: {
  wochentag: string;
  datum: string;
  isToday?: boolean;
  locked?: boolean;
  lockedLabel?: string;
  hinweis?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const dateLabel = new Date(datum).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  return (
    <section
      aria-label={`${wochentag}, ${dateLabel}`}
      className={`flex h-full snap-start flex-col rounded-card border bg-surface ${isToday ? "border-basil" : "border-line"}`}
    >
      <div className={`flex items-center justify-between gap-2 rounded-t-card border-b border-line px-3.5 py-2.5 ${locked ? "bg-paper" : isToday ? "bg-basil-soft" : ""}`}>
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">{wochentag}</p>
          <p className={`font-display text-xl font-semibold ${isToday ? "text-basil" : "text-ink"}`}>{dateLabel}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {isToday && <Tag tone="green">Heute</Tag>}
          {locked && <Lock size={14} className="text-muted" aria-label={lockedLabel ?? "Gesperrt"} />}
        </div>
      </div>
      <div className={`flex flex-1 flex-col gap-2.5 px-3.5 py-3 ${locked ? "opacity-70" : ""}`}>
        {hinweis && <p className="rounded-md bg-saffron-soft px-2.5 py-1.5 text-xs text-ink">{hinweis}</p>}
        {children}
        {footer}
      </div>
    </section>
  );
}

const KATEGORIE_VISUAL: Record<string, { Icon: LucideIcon; bg: string }> = {
  "Hauptgericht": { Icon: UtensilsCrossed, bg: "bg-basil-soft" },
  "Beilage": { Icon: Carrot, bg: "bg-line" },
  "Suppe": { Icon: Soup, bg: "bg-info-soft" },
  "Vorspeise/Salat": { Icon: Salad, bg: "bg-ok-soft" },
  "Süßspeise": { Icon: IceCreamCone, bg: "bg-saffron-soft" },
  "Frühstück": { Icon: Croissant, bg: "bg-warn-soft" },
  "Snack": { Icon: Sandwich, bg: "bg-line" },
};
const DEFAULT_VISUAL = { Icon: Utensils, bg: "bg-line" };

export function MealTile({ rezept, tags, aside, footer }: { rezept: Rezept; tags?: ReactNode; aside?: ReactNode; footer?: ReactNode }) {
  const visual = KATEGORIE_VISUAL[rezept.kategorie] ?? DEFAULT_VISUAL;
  const Icon = visual.Icon;
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-paper">
      {rezept.bildUrl ? (
        <img src={rezept.bildUrl} alt="" className="h-24 w-full object-cover" />
      ) : (
        <div className={`flex h-24 w-full items-center justify-center ${visual.bg}`}>
          <Icon size={28} className="text-ink-soft" aria-hidden />
        </div>
      )}
      <div className="flex flex-col gap-1.5 px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug text-ink">{rezept.name}</p>
          {aside}
        </div>
        {tags && <div className="flex flex-wrap gap-1">{tags}</div>}
        {footer}
      </div>
    </div>
  );
}
