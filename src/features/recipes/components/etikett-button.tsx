"use client";

import { useState } from "react";
import { Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { apiFetchBlob } from "@/lib/api/client";

/** Lädt das serverseitig gerenderte Etikett-PDF (Grammatur, Zutaten, Allergene, volle
 * Nährwertdeklaration je Portion) — siehe GET /api/recipes/{id}/label. */
export function EtikettButton({ rezeptId, rezeptName }: { rezeptId: string; rezeptName: string }) {
  const [laedt, setLaedt] = useState(false);

  const herunterladen = async () => {
    setLaedt(true);
    try {
      const blob = await apiFetchBlob(`/recipes/${rezeptId}/label`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `etikett-${rezeptName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLaedt(false);
    }
  };

  return (
    <Button variant="secondary" onClick={herunterladen} disabled={laedt}>
      <TagIcon size={15} aria-hidden /> {laedt ? "Erzeuge Etikett …" : "Etikett drucken"}
    </Button>
  );
}
