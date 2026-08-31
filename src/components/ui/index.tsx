import { Children, cloneElement, isValidElement, type ReactNode, type TdHTMLAttributes } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/I18nContext";

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
  // Lieferroute
  GEPLANT: "bg-line text-ink-soft",
  BELADUNG: "bg-warn-soft text-warn",
  UNTERWEGS: "bg-info-soft text-info",
  ABGESCHLOSSEN: "bg-ok-soft text-ok",
  // Routen-Stopp
  OFFEN: "bg-line text-ink-soft",
  ZUGESTELLT: "bg-ok-soft text-ok",
  PROBLEM: "bg-danger-soft text-danger",
};

const badgeLabels: Record<string, string> = {
  DRAFT: "Entwurf", REVIEW: "In Prüfung", PUBLISHED: "Veröffentlicht", CLOSED: "Geschlossen", ARCHIVED: "Archiviert",
  SUBMITTED: "Abgesendet", CONFIRMED: "Bestätigt", LOCKED: "Gesperrt", CANCELLED: "Storniert",
  PLANNED: "Geplant", PREPARING: "In Zubereitung", COMPLETED: "Abgeschlossen",
  REVIEWED: "Geprüft", ORDERED: "Bestellt",
  AKTIV: "Aktiv", INAKTIV: "Inaktiv", GESPERRT: "Gesperrt", ARCHIVIERT: "Archiviert",
  EINGELADEN: "Eingeladen", DEAKTIVIERT: "Deaktiviert",
  GEPLANT: "Geplant", BELADUNG: "In Beladung", UNTERWEGS: "Unterwegs", ABGESCHLOSSEN: "Abgeschlossen",
  OFFEN: "Offen", ZUGESTELLT: "Zugestellt", PROBLEM: "Problem",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles[status] ?? "bg-line text-ink-soft"}`}>
      {badgeLabels[status] ?? status}
    </span>
  );
}

/** Einziger Toggle-Switch der App — vorher gab es zwei leicht unterschiedliche, handgestrickte
 * Varianten (Checkbox+peer in FeatureFlagsBoard, absolut positioniert ohne `left` in
 * TenantFeatureFlagsCard), deren zweite ohne verlässliche Startposition auskam und auf schmaleren
 * Desktop-Spalten (z. B. der Mandanten-Detailseite) neben langen Labels verrutschte/abgeschnitten
 * wirkte. `shrink-0` hält die Größe fest, egal wie breit das Label daneben ist — die eigentliche
 * Abhilfe gegen das Abschneiden ist aber `min-w-0` auf dem Text daneben (siehe Aufrufer). */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil ${checked ? "bg-basil" : "bg-line-strong"}`}
    >
      <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
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

type TableHead = string | { label: string; className?: string };

/** Below 640px every row becomes its own card instead of scrolling sideways (see the
 * `.responsive-table` rules in globals.css) — each cell needs to know its own column label to show
 * inline once stacked, so this walks the row/cell tree once and stamps a `data-label` onto every
 * <Td> matching its column index. Anything that isn't a plain `<tr>` of cells (empty-state rows,
 * fragments, colSpan banners, …) is left untouched and just renders unlabeled when stacked, rather
 * than risk mangling it. */
function withResponsiveLabels(children: ReactNode, labels: string[]): ReactNode {
  return Children.map(children, (row) => {
    if (!isValidElement(row) || row.type !== "tr") return row;
    const rowProps = row.props as { children?: ReactNode };
    const cells = Children.map(rowProps.children, (cell, i) => {
      if (!isValidElement(cell)) return cell;
      const cellProps = cell.props as { "data-label"?: string };
      return cloneElement(cell as React.ReactElement<Record<string, unknown>>, { "data-label": cellProps["data-label"] ?? labels[i] ?? "" });
    });
    return cloneElement(row, undefined, cells);
  });
}

export function Table({ head, children }: { head: TableHead[]; children: ReactNode }) {
  const labels = head.map((h) => (typeof h === "string" ? h : h.label));

  return (
    <div className="scroll-x">
      {/* No forced min-width: a table with columns hidden on narrow screens (via a head entry's
          className, e.g. "hidden sm:table-cell" — matched by the same className on that column's
          <Td> in every row) should size to what's actually visible instead of scrolling needlessly. */}
      <table className="responsive-table w-full text-left text-sm">
        <thead>
          {/* First column stays pinned while scrolling horizontally on tablet/desktop widths above
              640px; below that the whole table restacks into cards (see .responsive-table) and this
              has no effect. */}
          <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
            {head.map((h, i) => {
              const label = typeof h === "string" ? h : h.label;
              const extra = typeof h === "string" ? "" : (h.className ?? "");
              return <th key={label || i} className={`px-3 py-3 font-medium ${i === 0 ? "sticky left-0 z-10 bg-surface" : ""} ${extra}`}>{label}</th>;
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-line [&>tr>td:first-child]:sticky [&>tr>td:first-child]:left-0 [&>tr>td:first-child]:z-10 [&>tr>td:first-child]:bg-surface">
          {withResponsiveLabels(children, labels)}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "", ...rest }: { children: ReactNode; className?: string } & TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-3 py-3 align-middle ${className}`} {...rest}>{children}</td>;
}

/** Pairs with lib/use-pagination.ts's usePagination() — page-size selector plus prev/next, stacked
 * on narrow screens so it stays usable on a phone. */
export function Pagination({
  page, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange, pageSizeOptions = [20, 50, 100],
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
}) {
  const { t } = useTranslation();
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-line px-5 py-3.5 no-print sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted">{totalItems === 0 ? t("pagination.noEntries") : t("pagination.rangeOf", { from, to, total: totalItems })}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-muted">
          {t("pagination.perPage")}
          <select
            aria-label={t("pagination.perPage")}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="min-h-9 rounded-lg border border-line bg-surface px-2 text-sm text-ink"
          >
            {pageSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-1.5">
          <button
            type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label={t("pagination.prev")}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-line hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={15} aria-hidden />
          </button>
          <span className="min-w-[5.5rem] text-center text-xs text-muted">{t("pagination.page", { page, totalPages })}</span>
          <button
            type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label={t("pagination.next")}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-line hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={15} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Zustände ---------- */

/** Ersetzt Tabellen/Listen/Karten während des ersten Ladens — verhindert, dass für einen Moment
 * fälschlich "keine Einträge vorhanden" aufblitzt, bevor die Daten eintreffen. */
export function LoadingState({ text }: { text?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <Loader2 className="animate-spin text-muted" size={24} aria-hidden />
      <p className="text-sm text-muted">{text ?? t("state.loading")}</p>
    </div>
  );
}

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
