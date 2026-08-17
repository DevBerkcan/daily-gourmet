"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { ZutatFormular } from "@/features/ingredients/components/zutat-formular";
import { useCreateZutat, type Zutat } from "@/lib/services/ingredients";

export function NeueZutat() {
  const router = useRouter();
  const createZutat = useCreateZutat();

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
        <Link href="/admin/ingredients" className="hover:text-basil hover:underline">Zutaten</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">Zutat anlegen</span>
      </nav>

      <PageHeader title="Zutat anlegen" subtitle="Stammdaten, Kennzeichnung und Nährwerte der neuen Zutat." />

      <ZutatFormular
        onSubmit={(input: Omit<Zutat, "id">) => {
          createZutat.mutate(input, { onSuccess: (zutat) => router.push(`/admin/ingredients/${zutat.id}`) });
        }}
        onAbbrechen={() => router.push("/admin/ingredients")}
      />
    </>
  );
}
