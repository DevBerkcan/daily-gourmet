"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useIsFetching } from "@tanstack/react-query";
import { Card, Table, Td, StatusBadge, Tag, SearchInput, Pagination, LoadingState } from "@/components/ui";
import { ZUTAT_KATEGORIEN, ALLERGENE_LISTE } from "../data";
import { useZutaten } from "@/lib/services/ingredients";
import { usePagination } from "@/lib/use-pagination";

const QUELLE_KURZ: Record<string, string> = {
  "Open Food Facts": "OFF",
  "USDA FoodData Central": "USDA",
  "Bundeslebensmittelschlüssel (BLS)": "BLS",
};

export function ZutatenTabelle() {
  const zutaten = useZutaten();
  const ladend = useIsFetching({ queryKey: ["ingredients"] }) > 0 && zutaten.length === 0;
  const [suche, setSuche] = useState("");
  const [kategorie, setKategorie] = useState("Alle Kategorien");
  const [allergen, setAllergen] = useState("Alle Allergene");

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase();
    return zutaten.filter((z) => {
      if (q && !z.name.toLowerCase().includes(q) && !z.artikelnummer.toLowerCase().includes(q)) return false;
      if (kategorie !== "Alle Kategorien" && z.kategorie !== kategorie) return false;
      if (allergen !== "Alle Allergene" && !z.allergene.includes(allergen)) return false;
      return true;
    });
  }, [zutaten, suche, kategorie, allergen]);

  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(gefiltert);

  const csvExport = () => {
    const head = ["Name", "Artikelnummer", "Kategorie", "Basiseinheit", "Einkaufseinheit", "Einkaufspreis", "Lieferant", "Allergene", "Aktiv"];
    const zeilen = gefiltert.map((z) => [z.name, z.artikelnummer, z.kategorie, z.basiseinheit, z.einkaufseinheit, z.einkaufspreis ?? "", z.lieferant, z.allergene.join("; "), z.aktiv ? "Ja" : "Nein"]);
    const csv = [head, ...zeilen].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zutaten.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
        <SearchInput placeholder="Zutat oder Artikelnummer suchen …" value={suche} onChange={(e) => setSuche(e.target.value)} />
        <select aria-label="Nach Kategorie filtern" value={kategorie} onChange={(e) => setKategorie(e.target.value)} className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
          <option>Alle Kategorien</option>
          {ZUTAT_KATEGORIEN.map((k) => <option key={k}>{k}</option>)}
        </select>
        <select aria-label="Nach Allergen filtern" value={allergen} onChange={(e) => setAllergen(e.target.value)} className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
          <option>Alle Allergene</option>
          {ALLERGENE_LISTE.map((a) => <option key={a}>{a}</option>)}
        </select>
        <button type="button" onClick={csvExport} className="ml-auto cursor-pointer text-xs font-medium text-basil hover:underline">CSV-Export</button>
      </div>
      {ladend ? <LoadingState text="Zutaten werden geladen …" /> : (
      <>
      <Table
        head={[
          "Zutat",
          { label: "Kategorie", className: "hidden sm:table-cell" },
          { label: "Einheit", className: "hidden lg:table-cell" },
          { label: "Preis", className: "hidden lg:table-cell" },
          { label: "kcal / 100", className: "hidden md:table-cell" },
          { label: "Allergene", className: "hidden md:table-cell" },
          { label: "Ernährung", className: "hidden lg:table-cell" },
          { label: "Lieferant", className: "hidden lg:table-cell" },
          "Status",
        ]}
      >
        {pageItems.map((z) => (
          <tr key={z.id} className="hover:bg-paper">
            <Td>
              <Link href={`/admin/ingredients/${z.id}`} className="font-medium text-basil hover:underline">{z.name}</Link>
              <span className="block text-xs text-muted">{z.artikelnummer}</span>
            </Td>
            <Td className="hidden text-muted sm:table-cell">{z.kategorie}</Td>
            <Td className="hidden text-muted lg:table-cell">{z.basiseinheit} · {z.einkaufseinheit}</Td>
            <Td className="hidden lg:table-cell">
              {z.einkaufspreis !== undefined
                ? <>{z.einkaufspreis.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}<span className="text-muted"> / {z.einkaufseinheit}</span></>
                : <span className="text-muted">—</span>}
            </Td>
            <Td className="hidden md:table-cell">
              <span className="font-medium">{z.naehrwertePro100.kcal}</span>
              <span className="block text-[11px] text-muted">{QUELLE_KURZ[z.naehrwertePro100.quelle] ?? z.naehrwertePro100.quelle}</span>
            </Td>
            <Td className="hidden md:table-cell">
              {z.allergene.length > 0
                ? <span className="flex flex-wrap gap-1">{z.allergene.map((a) => <Tag key={a} tone="amber">{a}</Tag>)}</span>
                : <span className="text-muted">—</span>}
            </Td>
            <Td className="hidden lg:table-cell">
              <span className="flex gap-1">
                {z.vegan ? <Tag tone="green">vegan</Tag> : z.vegetarisch ? <Tag tone="green">vegetarisch</Tag> : <span className="text-muted">—</span>}
              </span>
            </Td>
            <Td className="hidden text-muted lg:table-cell">{z.lieferant}</Td>
            <Td><StatusBadge status={z.aktiv ? "AKTIV" : "INAKTIV"} /></Td>
          </tr>
        ))}
      </Table>
      <p className="border-t border-line px-5 py-2.5 text-xs text-muted">Unzulässige Umrechnungen (z. B. kg → l) sind ohne individuellen Faktor gesperrt.</p>
      <Pagination
        page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems}
        onPageChange={setPage} onPageSizeChange={setPageSize} pageSizeOptions={pageSizeOptions}
      />
      </>
      )}
    </Card>
  );
}
