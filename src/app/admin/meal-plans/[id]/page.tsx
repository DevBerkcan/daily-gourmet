import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Card, StatusBadge, Button, Tag, EmptyState, DummyNote } from "@/components/ui";
import { speiseplaene, rezeptById, einrichtungById, rezeptAllergene } from "@/lib/data";
import { Eye, Send, Plus } from "lucide-react";

export default async function MealPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = speiseplaene.find((p) => p.id === id);
  if (!plan) notFound();

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
        <Link href="/admin/meal-plans" className="hover:text-basil hover:underline">Speisepläne</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">KW {plan.kalenderwoche} / {plan.jahr}</span>
      </nav>

      <PageHeader
        title={`Speiseplan KW ${plan.kalenderwoche}`}
        subtitle={`Veröffentlicht für: ${plan.einrichtungIds.map((f) => einrichtungById(f)?.name).join(", ")}`}
        actions={
          <>
            <Button variant="secondary"><Eye size={15} aria-hidden /> Vorschau als Einrichtung</Button>
            {plan.status === "REVIEW" && <Button><Send size={15} aria-hidden /> Veröffentlichen</Button>}
            {plan.status === "PUBLISHED" && <Button variant="secondary">Veröffentlichung zurückziehen</Button>}
          </>
        }
      />

      <div className="mb-6"><StatusBadge status={plan.status} /></div>

      {plan.tage.length === 0 ? (
        <Card>
          <EmptyState
            title="Noch keine Tage geplant"
            text="Dieser Wochenplan enthält noch keine Gerichte. Fügen Sie Gerichte je Wochentag hinzu oder duplizieren Sie eine bestehende Woche."
            action={<Button><Plus size={15} aria-hidden /> Gerichte hinzufügen</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {plan.tage.map((tag) => (
            <Card key={tag.datum} className="flex flex-col">
              <div className="border-b border-line px-4 py-3">
                <p className="text-sm font-semibold text-ink">{tag.wochentag}</p>
                <p className="text-xs text-muted">{new Date(tag.datum).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}</p>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 px-4 py-3">
                {tag.rezeptIds.map((rid) => {
                  const r = rezeptById(rid);
                  if (!r) return null;
                  const allergene = rezeptAllergene(r);
                  return (
                    <div key={rid} className="rounded-lg border border-line bg-paper px-3 py-2.5">
                      <p className="text-sm font-medium leading-snug text-ink">{r.name}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {r.vegan ? <Tag tone="green">vegan</Tag> : r.vegetarisch ? <Tag tone="green">veg.</Tag> : null}
                        {allergene.map((a) => <Tag key={a} tone="amber">{a}</Tag>)}
                      </div>
                    </div>
                  );
                })}
                {tag.hinweis && <p className="mt-auto rounded-md bg-saffron-soft px-2.5 py-1.5 text-xs text-ink">{tag.hinweis}</p>}
                <button type="button" className="mt-1 cursor-pointer rounded-lg border border-dashed border-line-strong py-1.5 text-xs font-medium text-muted hover:border-basil hover:text-basil no-print">
                  + Gericht hinzufügen
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DummyNote />
    </>
  );
}
