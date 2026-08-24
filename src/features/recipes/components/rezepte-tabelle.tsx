"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Table, Td, StatusBadge, SearchInput, Tag, Pagination } from "@/components/ui";
import { REZEPT_KATEGORIEN } from "../data";
import { useZutaten } from "@/lib/services/ingredients";
import { useRezepte, rezeptAllergeneLive } from "@/lib/services/recipes";
import { usePagination } from "@/lib/use-pagination";

export function RezepteTabelle() {
  const rezepte = useRezepte();
  const zutaten = useZutaten();
  const [suche, setSuche] = useState("");
  const [kategorie, setKategorie] = useState("Alle Kategorien");

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase();
    return rezepte.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (kategorie !== "Alle Kategorien" && r.kategorie !== kategorie) return false;
      return true;
    });
  }, [rezepte, suche, kategorie]);

  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(gefiltert);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
        <SearchInput placeholder="Rezept suchen …" value={suche} onChange={(e) => setSuche(e.target.value)} />
        <select aria-label="Nach Kategorie filtern" value={kategorie} onChange={(e) => setKategorie(e.target.value)} className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
          <option>Alle Kategorien</option>
          {REZEPT_KATEGORIEN.map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>
      <Table
        head={[
          "Rezept",
          { label: "Kategorie", className: "hidden md:table-cell" },
          { label: "Portionen (Std.)", className: "hidden sm:table-cell" },
          { label: "Nutri-Score", className: "hidden sm:table-cell" },
          { label: "Ersteller", className: "hidden lg:table-cell" },
          { label: "Allergene", className: "hidden md:table-cell" },
          { label: "Ernährung", className: "hidden lg:table-cell" },
          { label: "Version", className: "hidden lg:table-cell" },
          "Status",
        ]}
      >
        {pageItems.map((r) => {
          const allergene = rezeptAllergeneLive(r, zutaten);
          return (
            <tr key={r.id} className="hover:bg-paper">
              <Td>
                <Link href={`/admin/recipes/${r.id}`} className="font-medium text-basil hover:underline">{r.name}</Link>
                <span className="block max-w-40 truncate text-xs text-muted sm:max-w-64">{r.rezeptnummer ? `${r.rezeptnummer} · ` : ""}{r.beschreibung}</span>
              </Td>
              <Td className="hidden text-muted md:table-cell">{r.kategorie}</Td>
              <Td className="hidden sm:table-cell">{r.standardPortionen}</Td>
              <Td className="hidden sm:table-cell">{r.nutriScore ? <Tag tone="green">{r.nutriScore}</Tag> : <span className="text-muted">—</span>}</Td>
              <Td className="hidden text-muted lg:table-cell">{r.erstelltVon}</Td>
              <Td className="hidden md:table-cell">
                {allergene.length > 0
                  ? <span className="flex flex-wrap gap-1">{allergene.map((a) => <Tag key={a} tone="amber">{a}</Tag>)}</span>
                  : <span className="text-muted">—</span>}
              </Td>
              <Td className="hidden lg:table-cell">{r.vegan ? <Tag tone="green">vegan</Tag> : r.vegetarisch ? <Tag tone="green">vegetarisch</Tag> : <span className="text-muted">—</span>}</Td>
              <Td className="hidden text-muted lg:table-cell">v{r.version}</Td>
              <Td><StatusBadge status={r.aktiv ? "AKTIV" : "ARCHIVIERT"} /></Td>
            </tr>
          );
        })}
      </Table>
      <Pagination
        page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems}
        onPageChange={setPage} onPageSizeChange={setPageSize} pageSizeOptions={pageSizeOptions}
      />
    </>
  );
}
