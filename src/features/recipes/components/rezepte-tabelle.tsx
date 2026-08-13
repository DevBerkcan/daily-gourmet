"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Table, Td, StatusBadge, SearchInput, Tag } from "@/components/ui";
import { REZEPT_KATEGORIEN } from "../data";
import { useZutaten } from "@/features/ingredients/store";
import { useRezepte, rezeptAllergeneLive } from "../store";

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

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
        <SearchInput placeholder="Rezept suchen …" value={suche} onChange={(e) => setSuche(e.target.value)} />
        <select aria-label="Nach Kategorie filtern" value={kategorie} onChange={(e) => setKategorie(e.target.value)} className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
          <option>Alle Kategorien</option>
          {REZEPT_KATEGORIEN.map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>
      <Table head={["Rezept", "Kategorie", "Portionen (Std.)", "Nutri-Score", "Ersteller", "Allergene", "Ernährung", "Version", "Status"]}>
        {gefiltert.map((r) => {
          const allergene = rezeptAllergeneLive(r, zutaten);
          return (
            <tr key={r.id} className="hover:bg-paper">
              <Td>
                <Link href={`/admin/recipes/${r.id}`} className="font-medium text-basil hover:underline">{r.name}</Link>
                <span className="block max-w-64 truncate text-xs text-muted">{r.rezeptnummer ? `${r.rezeptnummer} · ` : ""}{r.beschreibung}</span>
              </Td>
              <Td className="text-muted">{r.kategorie}</Td>
              <Td>{r.standardPortionen}</Td>
              <Td>{r.nutriScore ? <Tag tone="green">{r.nutriScore}</Tag> : <span className="text-muted">—</span>}</Td>
              <Td className="text-muted">{r.erstelltVon}</Td>
              <Td>
                {allergene.length > 0
                  ? <span className="flex flex-wrap gap-1">{allergene.map((a) => <Tag key={a} tone="amber">{a}</Tag>)}</span>
                  : <span className="text-muted">—</span>}
              </Td>
              <Td>{r.vegan ? <Tag tone="green">vegan</Tag> : r.vegetarisch ? <Tag tone="green">vegetarisch</Tag> : <span className="text-muted">—</span>}</Td>
              <Td className="text-muted">v{r.version}</Td>
              <Td><StatusBadge status={r.aktiv ? "AKTIV" : "ARCHIVIERT"} /></Td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
