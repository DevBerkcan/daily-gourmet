"use client";

import { useState } from "react";
import { Button } from "./index";

/** Eigene Client-Komponente, damit Seiten mit `metadata`-Export Server-Components bleiben können. */
export function SaveButton({ label = "Speichern", savedLabel = "Gespeichert ✓" }: { label?: string; savedLabel?: string }) {
  const [gespeichert, setGespeichert] = useState(false);

  function handleClick() {
    setGespeichert(true);
    window.setTimeout(() => setGespeichert(false), 2000);
  }

  return <Button onClick={handleClick}>{gespeichert ? savedLabel : label}</Button>;
}
