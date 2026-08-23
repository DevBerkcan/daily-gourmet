"use client";

import Link from "next/link";
import { Table, Td, StatusBadge } from "@/components/ui";
import { useStandorte } from "@/lib/services/locations";
import { useSpeiseplaene, useDuplicateSpeiseplan, useDeleteSpeiseplan, useSubmitReviewSpeiseplan, usePublishSpeiseplan } from "@/lib/services/meal-plans";

export function WochenplanTabelle() {
  const plaene = useSpeiseplaene();
  const standorte = useStandorte();
  const duplicateSpeiseplan = useDuplicateSpeiseplan();
  const deleteSpeiseplan = useDeleteSpeiseplan();
  const submitReview = useSubmitReviewSpeiseplan();
  const publish = usePublishSpeiseplan();

  return (
    <Table head={["Kalenderwoche", "Status", "Standorte", "Einrichtungen", "Gerichte", "Aktionen"]}>
      {plaene.map((p) => (
        <tr key={p.id} className="hover:bg-paper">
          <Td>
            <Link href={`/admin/meal-plans/${p.id}`} className="font-medium text-basil hover:underline">KW {p.kalenderwoche} / {p.jahr}</Link>
          </Td>
          <Td><StatusBadge status={p.status} /></Td>
          <Td className="text-muted">{p.standortIds.map((s) => standorte.find((st) => st.id === s)?.name).join(", ")}</Td>
          <Td>{p.einrichtungIds.length}</Td>
          <Td>{p.tage.reduce((sum, t) => sum + t.gerichte.length, 0)}</Td>
          <Td>
            <div className="flex gap-3 text-xs font-medium no-print">
              {p.status === "REVIEW" && <button type="button" onClick={() => publish.mutate(p.id)} className="cursor-pointer text-basil hover:underline">Veröffentlichen</button>}
              {p.status === "DRAFT" && <button type="button" onClick={() => submitReview.mutate(p.id)} className="cursor-pointer text-basil hover:underline">Zur Prüfung</button>}
              <button type="button" onClick={() => duplicateSpeiseplan.mutate(p.id)} className="cursor-pointer text-muted hover:text-ink hover:underline">Duplizieren</button>
              {p.status === "DRAFT" && (
                <button
                  type="button"
                  onClick={() => window.confirm(`Wochenplan KW ${p.kalenderwoche}/${p.jahr} wirklich löschen?`) && deleteSpeiseplan.mutate(p.id)}
                  className="cursor-pointer text-muted hover:text-danger hover:underline"
                >
                  Löschen
                </button>
              )}
            </div>
          </Td>
        </tr>
      ))}
    </Table>
  );
}
