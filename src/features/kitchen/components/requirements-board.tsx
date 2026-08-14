import { AlertTriangle, CheckCircle2, MapPin, PackageSearch } from "lucide-react";
import { Card, CardHeader, StatCard, Table, Td } from "@/components/ui";
import { gesamtbedarfFuerPlan } from "../data";

function runde(menge: number) { return Math.round(menge * 100) / 100; }

export function RequirementsBoard({ planId }: { planId: string }) {
  const positionen = gesamtbedarfFuerPlan(planId);
  const vollstaendig = positionen.filter((position) => position.bereitgestellt >= position.menge).length;
  const fehlend = positionen.length - vollstaendig;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Zutatenpositionen" value={String(positionen.length)} hint="Für alle heutigen Gerichte" />
        <StatCard label="Vollständig bereitgestellt" value={String(vollstaendig)} tone="ok" />
        <StatCard label="Noch offen" value={String(fehlend)} tone={fehlend ? "warn" : "ok"} hint={fehlend ? "Fehlmenge prüfen" : "Alles vorhanden"} />
      </div>

      {fehlend > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-card border border-warn/30 bg-warn-soft px-5 py-4 text-sm">
          <AlertTriangle size={19} className="mt-0.5 shrink-0 text-warn" aria-hidden />
          <div><p className="font-semibold text-ink">Bereitstellung noch nicht vollständig</p><p className="mt-1 text-muted">Mindestens eine Zutat ist noch nicht in der benötigten Menge am Arbeitsplatz. Fehlmenge bitte mit Lager oder Einkauf klären.</p></div>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader title="Zutatenbereitstellung" hint="Mengen sind bereits auf die heutige Produktionsmenge hochgerechnet." actions={<PackageSearch size={19} className="text-basil" aria-hidden />} />
        <Table head={["Zutat & Verwendung", "Lagerort", "Benötigt", "Bereitgestellt", "Status"]}>
          {positionen.map((position) => {
            const rest = Math.max(0, runde(position.menge - position.bereitgestellt));
            const istKomplett = rest === 0;
            return (
              <tr key={`${position.zutatId}-${position.einheit}`}>
                <Td><p className="font-semibold text-ink">{position.name}</p><p className="mt-0.5 text-xs text-muted">{position.rezepte.join(" · ")}</p>{position.allergene.length ? <p className="mt-1 text-xs font-medium text-warn">Allergene: {position.allergene.join(", ")}</p> : null}</Td>
                <Td><span className="inline-flex items-center gap-1.5 text-sm"><MapPin size={14} className="text-muted" aria-hidden />{position.lagerort}</span></Td>
                <Td className="font-display text-lg font-semibold text-ink">{runde(position.menge).toLocaleString("de-DE")} {position.einheit}</Td>
                <Td>{runde(position.bereitgestellt).toLocaleString("de-DE")} {position.einheit}{!istKomplett ? <p className="mt-1 text-xs font-semibold text-danger">Noch {rest.toLocaleString("de-DE")} {position.einheit}</p> : null}</Td>
                <Td>{istKomplett ? <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ok"><CheckCircle2 size={15} aria-hidden />Vollständig</span> : <span className="inline-flex items-center gap-1.5 text-xs font-medium text-danger"><AlertTriangle size={15} aria-hidden />Fehlmenge</span>}</Td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
