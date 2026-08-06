import Link from "next/link";
import { PageHeader, Card, Table, Td, StatusBadge, Button, DummyNote } from "@/components/ui";
import { speiseplaene, standortById } from "@/lib/data";
import { Plus } from "lucide-react";

export const metadata = { title: "Speisepläne" };

export default function MealPlansPage() {
  return (
    <>
      <PageHeader
        title="Speisepläne"
        subtitle="Wochenpläne je Kalenderwoche. Nach Veröffentlichung werden die Rezeptdaten als Snapshot eingefroren."
        actions={<Button><Plus size={16} aria-hidden /> Wochenplan erstellen</Button>}
      />
      <Card>
        <Table head={["Kalenderwoche", "Status", "Standorte", "Einrichtungen", "Gerichte", "Aktionen"]}>
          {speiseplaene.map((p) => (
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
      </Card>
      <DummyNote />
    </>
  );
}
