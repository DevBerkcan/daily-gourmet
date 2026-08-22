"use client";

import { useState } from "react";
import { Button } from "./index";

/** Eigene Client-Komponente, damit Seiten mit `metadata`-Export Server-Components bleiben können. */
export function SaveButton({
  label = "Speichern",
  savedLabel = "Gespeichert ✓",
  onSave,
  disabled,
}: {
  label?: string;
  savedLabel?: string;
  /** Wenn angegeben, wird beim Klick wirklich gespeichert; ohne bleibt der Button rein dekorativ. */
  onSave?: () => Promise<unknown> | void;
  disabled?: boolean;
}) {
  const [gespeichert, setGespeichert] = useState(false);

  async function handleClick() {
    if (onSave) await onSave();
    setGespeichert(true);
    window.setTimeout(() => setGespeichert(false), 2000);
  }

  return <Button onClick={handleClick} disabled={disabled}>{gespeichert ? savedLabel : label}</Button>;
}
