"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { RezeptFormular, type RezeptFormDaten } from "@/features/recipes/components/rezept-formular";
import { useCreateRezept } from "@/lib/services/recipes";

export function NeuesRezept() {
  const router = useRouter();
  const createRezept = useCreateRezept();

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
        <Link href="/admin/recipes" className="hover:text-basil hover:underline">Rezepte</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">Rezept erstellen</span>
      </nav>

      <PageHeader title="Rezept erstellen" subtitle="Alle Angaben, die für Produktion, Kalkulation und Freigabe an Einrichtungen gebraucht werden." />

      <RezeptFormular
        onSubmit={(input: RezeptFormDaten) => {
          createRezept.mutate(input, { onSuccess: (rezept) => router.push(`/admin/recipes/${rezept.id}`) });
        }}
        onAbbrechen={() => router.push("/admin/recipes")}
      />
    </>
  );
}
