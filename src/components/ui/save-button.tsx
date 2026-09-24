"use client";

import { useState } from "react";
import { Button } from "./button";
import { ACTION_ICONS } from "./icons";

/** Eigene Client-Komponente, damit Seiten mit `metadata`-Export Server-Components bleiben können. */
export function SaveButton({
  label = "Speichern",
  savedLabel = "Gespeichert",
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
  const [laeuft, setLaeuft] = useState(false);

  async function handleClick() {
    setLaeuft(true);
    try {
      if (onSave) await onSave();
    } finally {
      setLaeuft(false);
    }
    setGespeichert(true);
    window.setTimeout(() => setGespeichert(false), 2000);
  }

  return (
    <Button
      icon={gespeichert ? ACTION_ICONS.confirm : ACTION_ICONS.save}
      label={gespeichert ? savedLabel : label}
      onClick={handleClick}
      disabled={disabled}
      loading={laeuft}
    />
  );
}
