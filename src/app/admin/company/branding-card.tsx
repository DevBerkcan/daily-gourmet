"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui";
import { ImageField } from "@/components/ui/form-fields";

export function BrandingCard() {
  const [logo, setLogo] = useState<string | undefined>(undefined);

  return (
    <Card>
      <CardHeader title="Branding" hint="Logo und Farben erscheinen im Kundenportal" />
      <div className="px-5 py-5">
        <ImageField label="Logo" value={logo} onChange={setLogo} hint="PNG oder SVG, max. 1 MB (nur Vorschau in dieser Demo)" />
      </div>
    </Card>
  );
}
