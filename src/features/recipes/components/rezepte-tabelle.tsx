"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsFetching } from "@tanstack/react-query";
import { ACTION_ICONS, Button, Table, Td, StatusBadge, SearchInput, Tag, Pagination, LoadingState } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { REZEPT_KATEGORIEN } from "../data";
import { useZutaten } from "@/lib/services/ingredients";
import { useRezepte, useDeleteRezept, rezeptAllergeneLive, type Rezept } from "@/lib/services/recipes";
import { usePagination } from "@/lib/use-pagination";

type Sortierung = "name" | "neu";

export function RezepteTabelle() {
  const router = useRouter();
  const toast = useToast();
  const rezepte = useRezepte();
  const zutaten = useZutaten();
  const deleteRezept = useDeleteRezept();
  const ladend = useIsFetching({ queryKey: ["recipes"] }) > 0 && rezepte.length === 0;
  const [suche, setSuche] = useState("");
  const [kategorie, setKategorie] = useState("Alle Kategorien");
  const [sortierung, setSortierung] = useState<Sortierung>("name");
  const [loescheRezept, setLoescheRezept] = useState<Rezept | null>(null);

  function loeschenBestaetigt() {
    if (!loescheRezept) return;
    deleteRezept.mutate(loescheRezept.id, {
      onSuccess: () => toast.success(`„${loescheRezept.name}“ wurde gelöscht.`),
      onError: (error) => toast.error(error instanceof ApiError ? error.message : "Löschen fehlgeschlagen. Bitte erneut versuchen."),
    });
    setLoescheRezept(null);
  }

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase();
    const treffer = rezepte.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (kategorie !== "Alle Kategorien" && r.kategorie !== kategorie) return false;
      return true;
    });
    const sortiert = [...treffer];
    if (sortierung === "neu") sortiert.sort((a, b) => (b.erstelltAm ?? "").localeCompare(a.erstelltAm ?? ""));
    else sortiert.sort((a, b) => a.name.localeCompare(b.name, "de"));
    return sortiert;
  }, [rezepte, suche, kategorie, sortierung]);

  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(gefiltert);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
        <SearchInput placeholder="Rezept suchen …" value={suche} onChange={(e) => setSuche(e.target.value)} />
        <select aria-label="Nach Kategorie filtern" value={kategorie} onChange={(e) => setKategorie(e.target.value)} className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
          <option>Alle Kategorien</option>
          {REZEPT_KATEGORIEN.map((k) => <option key={k}>{k}</option>)}
        </select>
        <select aria-label="Sortierung" value={sortierung} onChange={(e) => setSortierung(e.target.value as Sortierung)} className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm">
          <option value="name">Name (A–Z)</option>
          <option value="neu">Zuletzt hinzugefügt</option>
        </select>
      </div>
      {ladend ? <LoadingState text="Rezepte werden geladen …" /> : (
      <>
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
          "",
        ]}
      >
        {pageItems.map((r) => {
          const allergene = rezeptAllergeneLive(r, zutaten);
          const href = `/admin/recipes/${r.id}`;
          return (
            <tr
              key={r.id}
              tabIndex={0}
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a, button")) return;
                router.push(href);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") router.push(href);
              }}
              className="cursor-pointer hover:bg-paper"
            >
              <Td>
                <div className="max-w-40 sm:max-w-52">
                  <Link href={`/admin/recipes/${r.id}`} className="block truncate font-medium text-basil hover:underline">{r.name}</Link>
                  <span className="block truncate text-xs text-muted">{r.rezeptnummer ? `${r.rezeptnummer} · ` : ""}{r.beschreibung}</span>
                </div>
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
              <Td className="no-print">
                <Button icon={ACTION_ICONS.delete} label={`${r.name} löschen`} variant="danger" size="sm" onClick={() => setLoescheRezept(r)} />
              </Td>
            </tr>
          );
        })}
      </Table>
      <Pagination
        page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems}
        onPageChange={setPage} onPageSizeChange={setPageSize} pageSizeOptions={pageSizeOptions}
      />
      </>
      )}
      <ConfirmDialog
        open={!!loescheRezept}
        title="Rezept löschen"
        tone="warn"
        message={
          <>
            <strong>{loescheRezept?.name}</strong> wird unwiderruflich gelöscht. Wird es bereits in einem Wochenplan, einer
            Bestellung, einer Route oder Produktion verwendet, schlägt das Löschen fehl — archivieren Sie es dann stattdessen.
          </>
        }
        confirmLabel="Endgültig löschen"
        confirmIcon={ACTION_ICONS.delete}
        onCancel={() => setLoescheRezept(null)}
        onConfirm={loeschenBestaetigt}
      />
    </>
  );
}
