import { PageHeader, Card, Button, DummyNote } from "@/components/ui";
import { Plus } from "lucide-react";
import { WochenplanTabelle } from "./wochenplan-tabelle";

export const metadata = { title: "Speisepläne" };

export default function MealPlansPage() {
  return (
    <>
      <PageHeader
        title="Speisepläne"
        subtitle="Wochenpläne je Kalenderwoche. Nach Veröffentlichung werden die Rezeptdaten als Snapshot eingefroren."
        actions={<Button href="/admin/meal-plans/new"><Plus size={16} aria-hidden /> Wochenplan erstellen</Button>}
      />
      <Card>
        <WochenplanTabelle />
      </Card>
      <DummyNote />
    </>
  );
}
