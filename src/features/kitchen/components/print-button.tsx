"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui";

export function PrintButton({ label = "Küchenzettel drucken" }: { label?: string }) {
  return (
    <Button variant="secondary" onClick={() => window.print()}>
      <Printer size={15} aria-hidden /> {label}
    </Button>
  );
}
