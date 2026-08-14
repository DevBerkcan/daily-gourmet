"use client";

import Link from "next/link";
import { PageHeader, Card, CardHeader, Table, Td, StatusBadge, Button, EmptyState, DummyNote } from "@/components/ui";
import { standortById } from "@/lib/data";
import { zutatById } from "@/features/ingredients/data";
import { rezeptById } from "@/features/recipes/data";
import type { ProduktionsStatus } from "../types";
import { Printer, Download, RefreshCw } from "lucide-react";
import { useProduktionsplaene, updatePosition, refreshBestellmengen } from "../store";

const STATUS_OPTIONEN: { value: ProduktionsStatus; label: string }[] = [
  { value: "PLANNED", label: "Geplant" },
  { value: "PREPARING", label: "In Zubereitung" },
  { value: "COMPLETED", label: "Abgeschlossen" },
  { value: "CANCELLED", label: "Storniert" },
];

export function ProduktionstagDetail({ id }: { id: string }) {
  const plaene = useProduktionsplaene();
  const pp = plaene.find((p) => p.id === id);

  if (!pp) {
    return (
      <>
        <Card>
          <EmptyState
            title="Produktionsplan nicht gefunden"
            text="Dieser Produktionsplan existiert nicht (mehr) in dieser Sitzung."
            action={<Button href="/admin/production">Zurück zur Übersicht</Button>}
          />
        </Card>
        <DummyNote />
      </>
    );
  }

  const datumLabel = new Date(pp.datum).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  const csvExport = () => {
    const head = ["Gericht", "Bestellt", "Zusatzmenge", "Produktion", "Status"];
    const zeilen = pp.positionen.map((pos) => [
      rezeptById(pos.rezeptId)?.name ?? pos.rezeptId, pos.bestellteMenge, pos.zusatzMenge, pos.bestellteMenge + pos.zusatzMenge, pos.status,
    ]);
    const csv = [head, ...zeilen].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `produktion-${pp.datum}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
        <Link href="/admin/production" className="hover:text-basil hover:underline">Produktion</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{datumLabel}</span>
      </nav>

      <PageHeader
        title={`Produktion ${datumLabel}`}
        subtitle={standortById(pp.standortId)?.name}
        actions={
          <>
            <Button variant="secondary" onClick={() => refreshBestellmengen(pp.id)}><RefreshCw size={15} aria-hidden /> Bestellmengen aktualisieren</Button>
            <Button variant="secondary" onClick={csvExport}><Download size={15} aria-hidden /> Export</Button>
            <Button variant="secondary" onClick={() => window.print()}><Printer size={15} aria-hidden /> Druckansicht</Button>
          </>
        }
      />

      <div className="flex flex-col gap-6">
        {pp.positionen.map((pos) => {
          const rezept = rezeptById(pos.rezeptId);
          if (!rezept) return null;
          const finaleMenge = pos.bestellteMenge + pos.zusatzMenge;
          const faktor = finaleMenge / rezept.standardPortionen;
          const rund = (n: number) => Math.round(n * 100) / 100;

          return (
            <Card key={pos.rezeptId}>
              <CardHeader
                title={rezept.name}
                hint={`Bestellt: ${pos.bestellteMenge} · Zusatz: +${pos.zusatzMenge} · Produktion: ${finaleMenge} Portionen (Faktor ${rund(faktor).toLocaleString("de-DE")})`}
                actions={<StatusBadge status={pos.status} />}
              />

              <div className="flex flex-wrap items-end gap-3 border-b border-line px-5 py-3.5 no-print">
                <label className="flex flex-col gap-1 text-xs text-muted">
                  Zusatzmenge
                  <input
                    type="number"
                    min={0}
                    value={pos.zusatzMenge}
                    onChange={(e) => updatePosition(pp.id, pos.rezeptId, { zusatzMenge: Math.max(0, Number(e.target.value) || 0) })}
                    className="min-h-9 w-24 rounded-lg border border-line bg-surface px-2.5 text-sm"
                  />
                </label>
                <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-muted">
                  Begründung
                  <input
                    type="text"
                    value={pos.begruendung ?? ""}
                    onChange={(e) => updatePosition(pp.id, pos.rezeptId, { begruendung: e.target.value })}
                    placeholder="z. B. Sicherheitsmenge, Erfahrungswert …"
                    className="min-h-9 w-full rounded-lg border border-line bg-surface px-2.5 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-muted">
                  Status
                  <select
                    value={pos.status}
                    onChange={(e) => updatePosition(pp.id, pos.rezeptId, { status: e.target.value as ProduktionsStatus })}
                    className="min-h-9 rounded-lg border border-line bg-surface px-2.5 text-sm"
                  >
                    {STATUS_OPTIONEN.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </label>
              </div>

              <Table head={["Zutat", "Rezeptmenge (Basis)", "Hochgerechnet für Produktion"]}>
                {rezept.zutaten.map((rz) => (
                  <tr key={rz.zutatId}>
                    <Td className="font-medium text-ink">{zutatById(rz.zutatId)?.name}</Td>
                    <Td className="text-muted">{rz.menge.toLocaleString("de-DE")} {rz.einheit} / {rezept.standardPortionen} Port.</Td>
                    <Td className="font-semibold text-basil">{rund(rz.menge * faktor).toLocaleString("de-DE")} {rz.einheit}</Td>
                  </tr>
                ))}
              </Table>
            </Card>
          );
        })}
      </div>

      <DummyNote />
    </>
  );
}
