import Link from "next/link";
import { Loader2, type LucideIcon } from "lucide-react";

/** Einziger Button der App — bewusst nur Icon, kein sichtbarer Text. Das `label` ist Pflicht und
 * landet als aria-label (Screenreader) und als data-tip (Tooltip über TooltipLayer bei Hover und
 * Tastatur-Fokus), damit die Bedeutung trotzdem nie verloren geht. Welches Icon für welche Aktion
 * steht, ist projektweit festgelegt (siehe ACTION_ICONS in ./icons) — neue Aufrufer nehmen das
 * Icon von dort statt ein eigenes zu wählen. Hooks-frei, damit auch Server-Components es nutzen. */
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
  disabled, loading, pressed, expanded, form, className = "",
}: ButtonProps) {
  const s = sizeStyles[size];
  const pressedStyle = pressed ? "!bg-basil-soft !text-basil ring-1 ring-basil/40" : "";
  const cls = `inline-flex shrink-0 cursor-pointer items-center justify-center transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil disabled:pointer-events-none disabled:opacity-45 ${s.box} ${variantStyles[variant]} ${pressedStyle} ${className}`;
  const inner = loading ? <Loader2 size={s.icon} className="animate-spin" aria-hidden /> : <Icon size={s.icon} strokeWidth={2} aria-hidden />;

  if (href && !disabled) {
    if (external) {
      return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" aria-label={label} data-tip={label} className={cls}>{inner}</a>;
    }
    return <Link href={href} aria-label={label} data-tip={label} className={cls}>{inner}</Link>;
  }
  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={label}
      aria-pressed={pressed}
      aria-expanded={expanded}
      aria-busy={loading || undefined}
      data-tip={label}
      className={cls}
    >
      {inner}
    </button>
  );
}
