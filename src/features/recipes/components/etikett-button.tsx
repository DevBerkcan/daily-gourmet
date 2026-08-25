"use client";

import { useState } from "react";
import { Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { EtikettenGeneratorModal } from "./etiketten-generator-modal";

/** Öffnet den Etiketten-Generator (Inhalt, Layout, Nährwertbasis, MHD) mit Live-Vorschau des
 * serverseitig gerenderten Etikett-PDFs — siehe GET /api/recipes/{id}/label. */
export function EtikettButton({ rezeptId, rezeptName, portionsgewichtG }: { rezeptId: string; rezeptName: string; portionsgewichtG?: number }) {
  const [offen, setOffen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOffen(true)}>
        <TagIcon size={15} aria-hidden /> Etikett drucken
      </Button>
      {offen && (
        <EtikettenGeneratorModal rezeptId={rezeptId} rezeptName={rezeptName} portionsgewichtG={portionsgewichtG} onClose={() => setOffen(false)} />
      )}
    </>
  );
}
