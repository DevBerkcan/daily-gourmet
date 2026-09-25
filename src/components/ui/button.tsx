import Link from "next/link";
import { Loader2, type LucideIcon } from "lucide-react";

/** Einziger Button der App. Icon-only (Standard, ohne `showLabel`) ist der kompakte Stil für enge
 * Kontexte — vor allem die Aktionsspalte einer Tabellenzeile — und bleibt dort bewusst so: Das
 * `label` ist Pflicht und landet als aria-label (Screenreader) und als data-tip (Tooltip über
 * TooltipLayer bei Hover und Tastatur-Fokus), damit die Bedeutung trotzdem nie verloren geht.
 * `showLabel` zeigt das Label zusätzlich als sichtbaren Text neben dem Icon und ist der Normalfall
 * für Seiten-, Karten- und Toolbar-Buttons (nicht mehr nur Anmelden/Abmelden/Support-Anfrage).
 * Welches Icon für welche Aktion steht, ist projektweit festgelegt (siehe ACTION_ICONS in ./icons)
 * — neue Aufrufer nehmen das Icon von dort statt ein eigenes zu wählen. Hooks-frei, damit auch
 * Server-Components es nutzen. */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  icon: LucideIcon;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  /** Öffnet href in neuem Tab bzw. als native URL (tel:, mailto:, externe Links). */
  external?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  /** Zeigt einen Spinner statt des Icons und sperrt den Button. */
  loading?: boolean;
  /** Für Umschalter (Ansicht Liste/Woche, Filter …): aktiver Zustand hervorgehoben. */
  pressed?: boolean;
  /** Für Auf-/Zuklapp-Toggles (Panels, Widgets): setzt aria-expanded. */
  expanded?: boolean;
  /** Zeigt das Label als sichtbaren Text neben dem Icon (klassischer Button) statt nur als
   * aria-label/Tooltip. Normalfall für Seiten-, Karten- und Toolbar-Buttons; in engen Kontexten
   * wie der Aktionsspalte einer Tabellenzeile bleibt es beim kompakten Icon-only-Standard. */
  showLabel?: boolean;
  form?: string;
  className?: string;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-basil text-white shadow-sm shadow-basil/25 hover:bg-basil-deep",
  secondary: "border border-line-strong bg-surface text-ink-soft hover:border-basil hover:text-basil",
  ghost: "text-muted hover:bg-basil-soft hover:text-basil",
  danger: "bg-danger-soft text-danger hover:bg-danger hover:text-white",
};

const sizeStyles: Record<ButtonSize, { box: string; icon: number }> = {
  sm: { box: "size-8 rounded-lg", icon: 15 },
  md: { box: "size-10 rounded-xl", icon: 18 },
  lg: { box: "size-12 rounded-xl", icon: 20 },
};

export function Button({
  icon: Icon, label, variant = "primary", size = "md", href, external, onClick, type = "button",
  disabled, loading, pressed, expanded, showLabel, form, className = "",
}: ButtonProps) {
  const s = sizeStyles[size];
  const pressedStyle = pressed ? "!bg-basil-soft !text-basil ring-1 ring-basil/40" : "";
  const cls = `inline-flex shrink-0 cursor-pointer items-center justify-center transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil disabled:pointer-events-none disabled:opacity-45 ${showLabel ? "min-h-10 gap-2 rounded-lg px-4 text-sm font-medium" : s.box} ${variantStyles[variant]} ${pressedStyle} ${className}`;
  const inner = loading ? <Loader2 size={s.icon} className="animate-spin" aria-hidden /> : <Icon size={s.icon} strokeWidth={2} aria-hidden />;
  const content = showLabel ? <>{inner}<span>{label}</span></> : inner;
  // Mit sichtbarem Text braucht es weder aria-label noch Tooltip.
  const a11y = showLabel ? {} : { "aria-label": label, "data-tip": label };

  if (href && !disabled) {
    if (external) {
      return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" {...a11y} className={cls}>{content}</a>;
    }
    return <Link href={href} {...a11y} className={cls}>{content}</Link>;
  }
  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled || loading}
      {...a11y}
      aria-pressed={pressed}
      aria-expanded={expanded}
      aria-busy={loading || undefined}
      className={cls}
    >
      {content}
    </button>
  );
}
