"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { ZutatFormular } from "@/features/ingredients/components/zutat-formular";
import { addZutat } from "@/features/ingredients/store";
import type { Zutat } from "@/features/ingredients/types";

export function NeueZutat() {
  const router = useRouter();

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
          const zutat = addZutat(input);
          router.push(`/admin/ingredients/${zutat.id}`);
        }}
        onAbbrechen={() => router.push("/admin/ingredients")}
      />
    </>
  );
}
