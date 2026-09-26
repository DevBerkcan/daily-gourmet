"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, Copy, type LucideIcon } from "lucide-react";
import { Button } from "./button";
import { ACTION_ICONS } from "./icons";
import { useDialogFocus } from "@/lib/use-dialog-focus";

/** Gemeinsame Overlay-Hülle für Anlegen-/Bearbeiten-Formulare (Benutzer, Route, Einrichtung, …) —
 * ersetzt das bisherige Muster, ein Formular als Card in den normalen Seitenfluss zu rendern.
 * Formulare selbst bleiben unverändert, nur die Hülle wechselt von Card zu Overlay+Panel. */
export function Modal({
  open,
  onClose,
  title,
  hint,
  widthClassName = "max-w-2xl",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  hint?: string;
  widthClassName?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(open, dialogRef, onClose);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`relative flex max-h-[90vh] w-full ${widthClassName} flex-col overflow-hidden rounded-card border border-line bg-surface shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            <h2 id="modal-title" className="font-display text-lg font-semibold text-ink">{title}</h2>
            {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
          </div>
          <Button icon={ACTION_ICONS.cancel} label="Schließen" variant="ghost" size="sm" className="shrink-0" onClick={onClose} />
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/** Zentrierter Bestätigungsdialog im App-Design (siehe TenantSupportWidget für dasselbe
 * Overlay-Muster) — Ersatz für window.confirm() an Stellen, an denen eine Aktion (fast) endgültig
 * ist und der Nutzer noch einmal gezielt nachdenken soll. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  confirmIcon = ACTION_ICONS.confirm,
  tone = "default",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Icon des Bestätigen-Buttons, z. B. ACTION_ICONS.delete bei Löschdialogen (wird dann rot). */
  confirmIcon?: LucideIcon;
  tone?: "default" | "warn";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(open, dialogRef, onCancel);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-ink/50" onClick={onCancel} aria-hidden />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        tabIndex={-1}
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-card border border-line bg-surface shadow-2xl"
      >
        <div className="flex items-start gap-3 px-5 pt-5">
          {tone === "warn" && <AlertTriangle size={20} className="mt-0.5 shrink-0 text-warn" aria-hidden />}
          <h2 id="confirm-dialog-title" className="font-display text-lg font-semibold text-ink">{title}</h2>
        </div>
        <div className="max-h-[50vh] overflow-y-auto px-5 py-4 text-sm text-ink-soft">{message}</div>
        <div className="flex justify-end gap-2 border-t border-line bg-paper px-5 py-4">
          <Button icon={ACTION_ICONS.cancel} label={cancelLabel} variant="secondary" showLabel onClick={onCancel} />
          <Button icon={confirmIcon} label={confirmLabel} variant={confirmIcon === ACTION_ICONS.delete ? "danger" : "primary"} showLabel onClick={onConfirm} />
        </div>
      </div>
    </div>
  );
}

/** Zeigt einen einmalig generierten "Passwort festlegen"-Link zum Kopieren an — der Admin schickt
 * ihn manuell (z. B. per Chat) an die Person, statt sich auf den Mail-Versand zu verlassen (der,
 * je nach SMTP-Konfiguration, im Hintergrund weiterhin best-effort versucht wird). Wiederverwendet
 * für Benutzer anlegen/Passwort zurücksetzen, Mandant anlegen (Inhaber) und Einrichtung anlegen
 * (Einrichtungs-Admin) — überall dort, wo AuthController/InviteLinkDto einen Link zurückgibt. */
export function InviteLinkDialog({
  open,
  title,
  username,
  link,
  onClose,
}: {
  open: boolean;
  title: string;
  /** Der Login-Benutzername, falls bekannt — zusätzlich zum Link angezeigt, da der Empfänger ihn
   * beim ersten Login braucht. */
  username?: string;
  link: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [kopiert, setKopiert] = useState(false);
  useDialogFocus(open, dialogRef, onClose);

  if (!open) return null;

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(link);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch {
      // Clipboard-API kann in unsicheren Kontexten fehlen — der Link steht ohnehin sichtbar da.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-link-dialog-title"
        tabIndex={-1}
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-card border border-line bg-surface shadow-2xl"
      >
        <div className="px-5 pt-5">
          <h2 id="invite-link-dialog-title" className="font-display text-lg font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-xs text-muted">
            Diesen Link manuell an die Person senden (z. B. per Chat) — damit kann sie ihr Passwort festlegen.
            {username && <> Login-Benutzername: <strong className="text-ink">{username}</strong></>}
          </p>
        </div>
        <div className="flex flex-col gap-3 px-5 py-4">
          <div className="flex items-center gap-2">
            <input readOnly value={link} onFocus={(e) => e.target.select()} className="min-h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink" />
            <Button icon={Copy} label={kopiert ? "Kopiert!" : "Kopieren"} showLabel variant="secondary" onClick={kopieren} />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-line bg-paper px-5 py-4">
          <Button icon={ACTION_ICONS.cancel} label="Schließen" showLabel onClick={onClose} />
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
  confirmIcon = ACTION_ICONS.confirm,
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
  confirmIcon?: LucideIcon;
  onConfirm: (wert: string) => void;
  onCancel: () => void;
}) {
  const [wert, setWert] = useState("");
  const dialogRef = useRef<HTMLFormElement>(null);
  useDialogFocus(open, dialogRef, abbrechen);

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
        ref={dialogRef}
        onSubmit={absenden}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-dialog-title"
        tabIndex={-1}
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
              required
              value={wert}
              onChange={(event) => setWert(event.target.value)}
              placeholder={placeholder}
              className="mt-1.5 min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-line bg-paper px-5 py-4">
          <Button icon={ACTION_ICONS.cancel} label={cancelLabel} variant="secondary" showLabel onClick={abbrechen} />
          <Button icon={confirmIcon} label={confirmLabel} type="submit" showLabel disabled={!wert.trim()} />
        </div>
      </form>
    </div>
  );
}
