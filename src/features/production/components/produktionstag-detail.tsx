"use client";

import { useState } from "react";
import Link from "next/link";
import { useIsFetching } from "@tanstack/react-query";
import { PageHeader, Card, CardHeader, Table, Td, StatusBadge, Button, EmptyState, LoadingState } from "@/components/ui";
import { useRezepte } from "@/lib/services/recipes";
import { useZutaten } from "@/lib/services/ingredients";
import {
  useProduktionsplaene,
  useUpdateProduktionsposition,
  useAddProduktionsAnpassung,
  useRefreshProduktionsplan,
  type ProduktionsStatus,
  type ProduktionsPosition,
} from "@/lib/services/production";
import { Printer, Download, RefreshCw } from "lucide-react";

const STATUS_OPTIONEN: { value: ProduktionsStatus; label: string }[] = [
  { value: "PLANNED", label: "Geplant" },
  { value: "PREPARING", label: "In Zubereitung" },
  { value: "COMPLETED", label: "Abgeschlossen" },
  { value: "CANCELLED", label: "Storniert" },
];

function PositionAnpassung({ planId, pos }: { planId: string; pos: ProduktionsPosition }) {
  const updateStatus = useUpdateProduktionsposition();
  const addAnpassung = useAddProduktionsAnpassung();
  const [zusatzMenge, setZusatzMenge] = useState(pos.zusatzMenge);
  const [begruendung, setBegruendung] = useState(pos.begruendung ?? "");

  const anpassungSpeichern = () => {
    if (zusatzMenge === pos.zusatzMenge && begruendung === (pos.begruendung ?? "")) return;
    addAnpassung.mutate({ planId, itemId: pos.id, menge: zusatzMenge, begruendung });
  };

  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-line px-5 py-3.5 no-print">
      <label className="flex flex-col gap-1 text-xs text-muted">
        Zusatzmenge
        <input
          type="number"
          min={0}
          value={zusatzMenge}
          onChange={(e) => setZusatzMenge(Math.max(0, Number(e.target.value) || 0))}
          onBlur={anpassungSpeichern}
          className="min-h-9 w-24 rounded-lg border border-line bg-surface px-2.5 text-sm"
        />
      </label>
      <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-muted">
        Begründung
        <input
          type="text"
          value={begruendung}
          onChange={(e) => setBegruendung(e.target.value)}
          onBlur={anpassungSpeichern}
          placeholder="z. B. Sicherheitsmenge, Erfahrungswert …"
          className="min-h-9 w-full rounded-lg border border-line bg-surface px-2.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Status
        <select
          value={pos.status}
          onChange={(e) => updateStatus.mutate({ planId, itemId: pos.id, updates: { status: e.target.value as ProduktionsStatus } })}
          className="min-h-9 rounded-lg border border-line bg-surface px-2.5 text-sm"
        >
          {STATUS_OPTIONEN.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </label>
    </div>
  );
}

export function ProduktionstagDetail({ id }: { id: string }) {
  const plaene = useProduktionsplaene();
  const rezepte = useRezepte();
  const zutaten = useZutaten();
  const refreshPlan = useRefreshProduktionsplan();
  const pp = plaene.find((p) => p.id === id);
  const ladend = useIsFetching({ queryKey: ["production-plans"] }) > 0 && plaene.length === 0;

  if (!pp) {
    if (ladend) return <Card><LoadingState text="Produktionsplan wird geladen …" /></Card>;
    return (
      <Card>
        <EmptyState
          title="Produktionsplan nicht gefunden"
          text="Dieser Produktionsplan existiert nicht (mehr)."
          action={<Button href="/admin/production">Zurück zur Übersicht</Button>}
        />
      </Card>
    );
  }

  const datumLabel = new Date(pp.datum).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  const csvExport = () => {
    const head = ["Gericht", "Bestellt", "Zusatzmenge", "Produktion", "Status"];
    const zeilen = pp.positionen.map((pos) => [
      pos.rezeptName, pos.bestellteMenge, pos.zusatzMenge, pos.bestellteMenge + pos.zusatzMenge, pos.status,
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
        subtitle={pp.standortName}
        actions={
          <>
            <Button variant="secondary" onClick={() => refreshPlan.mutate(pp.id)}><RefreshCw size={15} aria-hidden /> Bestellmengen aktualisieren</Button>
            <Button variant="secondary" onClick={csvExport}><Download size={15} aria-hidden /> Export</Button>
            <Button variant="secondary" onClick={() => window.print()}><Printer size={15} aria-hidden /> Druckansicht</Button>
          </>
        }
      />

      <div className="flex flex-col gap-6">
        {pp.positionen.map((pos) => {
          const rezept = rezepte.find((r) => r.id === pos.rezeptId);
          if (!rezept) return null;
          const finaleMenge = pos.bestellteMenge + pos.zusatzMenge;
          const faktor = rezept.standardPortionen > 0 ? finaleMenge / rezept.standardPortionen : 0;
          const rund = (n: number) => Math.round(n * 100) / 100;

          return (
            <Card key={pos.id}>
              <CardHeader
                title={rezept.name}
                hint={`Bestellt: ${pos.bestellteMenge} · Zusatz: +${pos.zusatzMenge} · Produktion: ${finaleMenge} Portionen (Faktor ${rund(faktor).toLocaleString("de-DE")})`}
                actions={<StatusBadge status={pos.status} />}
              />

              <PositionAnpassung planId={pp.id} pos={pos} />

              <Table head={["Zutat", "Rezeptmenge (Basis)", "Hochgerechnet für Produktion"]}>
                {rezept.zutaten.map((rz) => (
                  <tr key={rz.id ?? rz.zutatId}>
                    <Td className="font-medium text-ink">{zutaten.find((z) => z.id === rz.zutatId)?.name}</Td>
                    <Td className="text-muted">{rz.menge.toLocaleString("de-DE")} {rz.einheit} / {rezept.standardPortionen} Port.</Td>
                    <Td className="font-semibold text-basil">{rund(rz.menge * faktor).toLocaleString("de-DE")} {rz.einheit}</Td>
                  </tr>
                ))}
              </Table>
            </Card>
          );
        })}
      </div>
    </>
  );
}
