"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { RezeptFormular, type RezeptFormDaten } from "../rezept-formular";
import { addRezept } from "../store";

const HEUTE = "2026-08-06";
const ADMIN_NAME = "Miriam Hoffmann";

export function NeuesRezept() {
  const router = useRouter();

  return (
    <>
      <nav aria-label="Brotkrumen" className="mb-3 text-xs text-muted no-print">
        <Link href="/admin/recipes" className="hover:text-basil hover:underline">Rezepte</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">Rezept erstellen</span>
      </nav>

      <PageHeader title="Rezept erstellen" subtitle="Alle Angaben, die für Produktion, Kalkulation und Freigabe an Einrichtungen gebraucht werden." />

      <RezeptFormular
        erstelltVon={ADMIN_NAME}
        erstelltAm={HEUTE}
        onSubmit={(input: RezeptFormDaten) => {
          const rezept = addRezept({ ...input, erstelltVon: ADMIN_NAME, erstelltAm: HEUTE });
          router.push(`/admin/recipes/${rezept.id}`);
        }}
        onAbbrechen={() => router.push("/admin/recipes")}
      />
    </>
  );
}
