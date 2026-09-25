import { PageHeader, Card, Button, ACTION_ICONS } from "@/components/ui";
import { WochenplanTabelle } from "@/features/meal-plans/components/wochenplan-tabelle";

export const metadata = { title: "Speisepläne" };

export default function MealPlansPage() {
  return (
    <>
      <PageHeader
        title="Speisepläne"
        subtitle="Wochenpläne je Kalenderwoche. Nach Veröffentlichung werden die Rezeptdaten als Snapshot eingefroren."
        actions={<Button href="/admin/meal-plans/new" icon={ACTION_ICONS.create} label="Wochenplan erstellen" showLabel />}
      />
      <Card>
        <WochenplanTabelle />
      </Card>
    </>
  );
}
