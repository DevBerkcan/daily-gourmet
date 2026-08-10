import type { ReactNode } from "react";
import Link from "next/link";

/* ---------- Status-Badges ---------- */

const badgeStyles: Record<string, string> = {
  // generisch
  AKTIV: "bg-ok-soft text-ok",
  INAKTIV: "bg-line text-muted",
  GESPERRT: "bg-danger-soft text-danger",
  ARCHIVIERT: "bg-line text-muted",
  EINGELADEN: "bg-info-soft text-info",
  DEAKTIVIERT: "bg-line text-muted",
  // Speiseplan
  DRAFT: "bg-line text-ink-soft",
  REVIEW: "bg-warn-soft text-warn",
  PUBLISHED: "bg-ok-soft text-ok",
  CLOSED: "bg-info-soft text-info",
  ARCHIVED: "bg-line text-muted",
  // Bestellung
  SUBMITTED: "bg-info-soft text-info",
  CONFIRMED: "bg-ok-soft text-ok",
  LOCKED: "bg-line text-ink-soft",
  CANCELLED: "bg-danger-soft text-danger",
  // Produktion
  PLANNED: "bg-line text-ink-soft",
  PREPARING: "bg-warn-soft text-warn",
  COMPLETED: "bg-ok-soft text-ok",
  // Einkauf
  REVIEWED: "bg-info-soft text-info",
  ORDERED: "bg-warn-soft text-warn",
};

const badgeLabels: Record<string, string> = {
  DRAFT: "Entwurf", REVIEW: "In Prüfung", PUBLISHED: "Veröffentlicht", CLOSED: "Geschlossen", ARCHIVED: "Archiviert",
  SUBMITTED: "Abgesendet", CONFIRMED: "Bestätigt", LOCKED: "Gesperrt", CANCELLED: "Storniert",
  PLANNED: "Geplant", PREPARING: "In Zubereitung", COMPLETED: "Abgeschlossen",
  REVIEWED: "Geprüft", ORDERED: "Bestellt",
  AKTIV: "Aktiv", INAKTIV: "Inaktiv", GESPERRT: "Gesperrt", ARCHIVIERT: "Archiviert",
  EINGELADEN: "Eingeladen", DEAKTIVIERT: "Deaktiviert",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles[status] ?? "bg-line text-ink-soft"}`}>
      {badgeLabels[status] ?? status}
    </span>
  );
}

export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" }) {
  const tones = {
    neutral: "bg-paper text-ink-soft border border-line",
    green: "bg-basil-soft text-basil",
    amber: "bg-saffron-soft text-warn",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${tones[tone]}`}>{children}</span>;
}

/* ---------- Layout-Bausteine ---------- */

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 no-print">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-card border border-line bg-surface ${className}`}>{children}</div>;
}

export function CardHeader({ title, hint, actions }: { title: string; hint?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
      <div>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {actions}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = "default" }: { label: string; value: string; hint?: string; tone?: "default" | "warn" | "ok" | "danger" }) {
  const valueTone = { default: "text-ink", warn: "text-warn", ok: "text-ok", danger: "text-danger" }[tone];
  return (
    <Card className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1.5 font-display text-2xl font-semibold ${valueTone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

/* ---------- Buttons & Inputs (Dummy-Interaktion) ---------- */

export function Button({ children, variant = "primary", href, onClick, type = "button", disabled }: { children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; href?: string; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  const styles = {
    primary: "bg-basil text-white hover:bg-basil-deep",
    secondary: "border border-line-strong bg-surface text-ink hover:bg-paper",
    ghost: "text-basil hover:bg-basil-soft",
    danger: "bg-danger-soft text-danger hover:bg-danger hover:text-white",
  }[variant];
  const cls = `inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil disabled:cursor-not-allowed disabled:opacity-50 ${styles}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

export function SearchInput({ placeholder = "Suchen …", value, onChange }: { placeholder?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <input
      type="search"
      placeholder={placeholder}
      aria-label={placeholder}
      value={value}
      onChange={onChange}
      className="min-h-10 w-full max-w-xs rounded-lg border border-line bg-surface px-3.5 text-sm text-ink placeholder:text-muted focus:outline-2 focus:outline-offset-1 focus:outline-basil"
    />
  );
}

/* ---------- Tabelle ---------- */

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="scroll-x">
      <table className="w-full min-w-160 text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
            {head.map((h) => (
              <th key={h} className="px-5 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-5 py-3.5 align-middle ${className}`}>{children}</td>;
}

/* ---------- Zustände ---------- */

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className="font-medium text-ink">{title}</p>
      <p className="max-w-sm text-sm text-muted">{text}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function DummyNote() {
  return (
    <p className="mt-8 rounded-lg border border-dashed border-line-strong bg-surface px-4 py-3 text-xs text-muted no-print">
      Phase 1 · Ansicht mit Beispieldaten — Aktionen sind noch nicht angebunden. In Phase 2 werden alle Daten über das C#-Backend geladen und gespeichert.
    </p>
  );
}
