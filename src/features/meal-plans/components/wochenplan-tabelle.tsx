"use client";

import { useState } from "react";
import Link from "next/link";
import { Megaphone } from "lucide-react";
import { Table, Td, StatusBadge, Pagination, Button, ACTION_ICONS } from "@/components/ui";
import { ConfirmDialog, PromptDialog } from "@/components/ui/confirm-dialog";
import { useStandorte } from "@/lib/services/locations";
import { useEinrichtungen } from "@/lib/services/facilities";
import { useSpeiseplaene, useDuplicateSpeiseplan, useDeleteSpeiseplan, useSubmitReviewSpeiseplan, usePublishSpeiseplan, useRejectSpeiseplan } from "@/lib/services/meal-plans";
import { usePagination } from "@/lib/use-pagination";
import type { Speiseplan } from "@/features/meal-plans/types";

export function WochenplanTabelle() {
  const plaene = useSpeiseplaene();
  const standorte = useStandorte();
  const einrichtungen = useEinrichtungen();
  const duplicateSpeiseplan = useDuplicateSpeiseplan();
  const deleteSpeiseplan = useDeleteSpeiseplan();
  const submitReview = useSubmitReviewSpeiseplan();
  const publish = usePublishSpeiseplan();
  const reject = useRejectSpeiseplan();
  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(plaene);
  const [loeschenBestaetigung, setLoeschenBestaetigung] = useState<Speiseplan | null>(null);
  const [ablehnenPlan, setAblehnenPlan] = useState<Speiseplan | null>(null);

  return (
    <>
      <Table head={["Kalenderwoche", "Status", "Standorte", "Einrichtungen", "Gerichte", "Aktionen"]}>
        {pageItems.map((p) => (
        <tr key={p.id} className="hover:bg-paper">
          <Td>
            <Link href={`/admin/meal-plans/${p.id}`} className="whitespace-nowrap font-medium text-basil hover:underline">KW {p.kalenderwoche} / {p.jahr}</Link>
          </Td>
          <Td><StatusBadge status={p.status} /></Td>
          <Td className="text-muted">{p.standortIds.map((s) => standorte.find((st) => st.id === s)?.name).join(", ")}</Td>
          <Td>{p.einrichtungIds.length > 0 ? p.einrichtungIds.map((id) => einrichtungen.find((e) => e.id === id)?.name ?? "—").join(", ") : <span className="text-muted">Vorlage</span>}</Td>
          <Td>{p.tage.reduce((sum, t) => sum + t.gerichte.length, 0)}</Td>
          <Td>
            <div className="flex items-center gap-1.5 no-print">
              {p.status === "REVIEW" && <Button icon={Megaphone} label="Veröffentlichen" variant="ghost" size="sm" onClick={() => publish.mutate(p.id)} />}
              {p.status === "REVIEW" && <Button icon={ACTION_ICONS.reject} label="Ablehnen" variant="ghost" size="sm" onClick={() => setAblehnenPlan(p)} />}
              {p.status === "DRAFT" && <Button icon={ACTION_ICONS.send} label="Zur Prüfung" variant="ghost" size="sm" onClick={() => submitReview.mutate(p.id)} />}
              <Button icon={ACTION_ICONS.copy} label="Duplizieren" variant="ghost" size="sm" onClick={() => duplicateSpeiseplan.mutate(p.id)} />
              {(p.status === "DRAFT" || p.status === "REVIEW") && (
                <Button icon={ACTION_ICONS.delete} label="Löschen" variant="danger" size="sm" onClick={() => setLoeschenBestaetigung(p)} />
              )}
            </div>
          </Td>
        </tr>
        ))}
      </Table>
      <Pagination
        page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems}
        onPageChange={setPage} onPageSizeChange={setPageSize} pageSizeOptions={pageSizeOptions}
      />
      <ConfirmDialog
        open={loeschenBestaetigung !== null}
        title="Wochenplan löschen?"
        tone="warn"
        confirmLabel="Ja, löschen"
        confirmIcon={ACTION_ICONS.delete}
        onCancel={() => setLoeschenBestaetigung(null)}
        onConfirm={() => { if (loeschenBestaetigung) deleteSpeiseplan.mutate(loeschenBestaetigung.id); setLoeschenBestaetigung(null); }}
        message={
          <>
            <p>Wochenplan KW {loeschenBestaetigung?.kalenderwoche}/{loeschenBestaetigung?.jahr} wirklich löschen?</p>
            {loeschenBestaetigung?.status === "REVIEW" && (
              <p className="mt-2 text-xs text-muted">Dieser Plan ist noch in Prüfung — die übrigen Administratoren werden per E-Mail informiert.</p>
            )}
          </>
        }
      />
      <PromptDialog
        open={ablehnenPlan !== null}
        title="Wochenplan ablehnen"
        message={<p>Wochenplan KW {ablehnenPlan?.kalenderwoche}/{ablehnenPlan?.jahr} wird zurück in den Entwurf gesendet. Der Grund wird dem Ersteller angezeigt und die übrigen Administratoren werden per E-Mail informiert.</p>}
        label="Grund der Ablehnung"
        placeholder="z. B. Menülinie Alternativ fehlt an zwei Tagen"
        confirmLabel="Ablehnen"
        confirmIcon={ACTION_ICONS.reject}
        onCancel={() => setAblehnenPlan(null)}
        onConfirm={(grund) => { if (ablehnenPlan) reject.mutate({ id: ablehnenPlan.id, grund }); setAblehnenPlan(null); }}
      />
    </>
  );
}
