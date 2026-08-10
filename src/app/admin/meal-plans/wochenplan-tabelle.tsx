"use client";

import Link from "next/link";
import { Table, Td, StatusBadge } from "@/components/ui";
import { standortById } from "@/lib/data";
import { useSpeiseplaene } from "./store";

export function WochenplanTabelle() {
  const plaene = useSpeiseplaene();

  return (
    <Table head={["Kalenderwoche", "Status", "Standorte", "Einrichtungen", "Gerichte", "Aktionen"]}>
      {plaene.map((p) => (
        <tr key={p.id} className="hover:bg-paper">
          <Td>
            <Link href={`/admin/meal-plans/${p.id}`} className="font-medium text-basil hover:underline">KW {p.kalenderwoche} / {p.jahr}</Link>
          </Td>
          <Td><StatusBadge status={p.status} /></Td>
          <Td className="text-muted">{p.standortIds.map((s) => standortById(s)?.name).join(", ")}</Td>
          <Td>{p.einrichtungIds.length}</Td>
          <Td>{p.tage.reduce((sum, t) => sum + t.rezeptIds.length, 0)}</Td>
          <Td>
            <div className="flex gap-3 text-xs font-medium no-print">
              {p.status === "REVIEW" && <button type="button" className="cursor-pointer text-basil hover:underline">Veröffentlichen</button>}
              {p.status === "DRAFT" && <button type="button" className="cursor-pointer text-basil hover:underline">Zur Prüfung</button>}
              <button type="button" className="cursor-pointer text-muted hover:text-ink hover:underline">Duplizieren</button>
            </div>
          </Td>
        </tr>
      ))}
    </Table>
  );
}
