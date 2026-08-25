"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./index";

/** Zentrierter Bestätigungsdialog im App-Design (siehe TenantSupportWidget für dasselbe
 * Overlay-Muster) — Ersatz für window.confirm() an Stellen, an denen eine Aktion (fast) endgültig
 * ist und der Nutzer noch einmal gezielt nachdenken soll. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  tone = "default",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "warn";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-ink/50" onClick={onCancel} aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-card border border-line bg-surface shadow-2xl"
      >
        <div className="flex items-start gap-3 px-5 pt-5">
          {tone === "warn" && <AlertTriangle size={20} className="mt-0.5 shrink-0 text-warn" aria-hidden />}
          <h2 id="confirm-dialog-title" className="font-display text-lg font-semibold text-ink">{title}</h2>
        </div>
        <div className="max-h-[50vh] overflow-y-auto px-5 py-4 text-sm text-ink-soft">{message}</div>
        <div className="flex justify-end gap-2 border-t border-line bg-paper px-5 py-4">
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

/** Textabfrage im App-Design — Ersatz für window.prompt() (z. B. Begründung für eine Sperrung). */
export function PromptDialog({
  open,
  title,
  message,
  label,
  placeholder,
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: ReactNode;
  label: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (wert: string) => void;
  onCancel: () => void;
}) {
  const [wert, setWert] = useState("");

  if (!open) return null;

  function absenden(event: FormEvent) {
    event.preventDefault();
    const getrimmt = wert.trim();
    if (!getrimmt) return;
    setWert("");
    onConfirm(getrimmt);
  }

  function abbrechen() {
    setWert("");
    onCancel();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-ink/50" onClick={abbrechen} aria-hidden />
      <form
        onSubmit={absenden}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-dialog-title"
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-card border border-line bg-surface shadow-2xl"
      >
        <div className="px-5 pt-5">
          <h2 id="prompt-dialog-title" className="font-display text-lg font-semibold text-ink">{title}</h2>
        </div>
        <div className="flex flex-col gap-2 px-5 py-4 text-sm text-ink-soft">
          {message}
          <label className="text-xs font-medium text-muted">
            {label}
            <input
              autoFocus
              required
              value={wert}
              onChange={(event) => setWert(event.target.value)}
              placeholder={placeholder}
              className="mt-1.5 min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-line bg-paper px-5 py-4">
          <Button type="button" variant="secondary" onClick={abbrechen}>{cancelLabel}</Button>
          <Button type="submit" disabled={!wert.trim()}>{confirmLabel}</Button>
        </div>
      </form>
    </div>
  );
}
