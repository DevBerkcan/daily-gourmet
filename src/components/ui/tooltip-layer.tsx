"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Tip = { text: string; x: number; y: number; below: boolean };

/** Ein einziger, global gemounteter Tooltip für alle Elemente mit `data-tip` (vor allem die
 * Icon-Buttons). Hängt per Portal an <body> und positioniert sich fixed — so wird er weder von
 * scrollenden Tabellen (overflow-x) noch von Modals abgeschnitten. Erscheint bei Maus-Hover und
 * Tastatur-Fokus, nicht bei Touch (dort reicht das aria-label). */
export function TooltipLayer() {
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    let current: HTMLElement | null = null;

    function show(el: HTMLElement) {
      const text = el.dataset.tip;
      if (!text) return;
      current = el;
      const r = el.getBoundingClientRect();
      const below = r.top < 44;
      setTip({ text, x: r.left + r.width / 2, y: below ? r.bottom + 8 : r.top - 8, below });
    }
    function hide() {
      current = null;
      setTip(null);
    }
    function onOver(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-tip]");
      if (el && el !== current) show(el);
      else if (!el && current) hide();
    }
    function onFocusIn(e: FocusEvent) {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-tip]");
      if (el && el.matches(":focus-visible")) show(el);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") hide();
    }

    document.addEventListener("pointerover", onOver);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", hide);
    document.addEventListener("pointerdown", hide);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", hide, true);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", hide);
      document.removeEventListener("pointerdown", hide);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", hide, true);
    };
  }, []);

  if (!tip) return null;
  const x = Math.min(Math.max(tip.x, 90), window.innerWidth - 90);
  return createPortal(
    <div
      role="tooltip"
      style={{ left: x, top: tip.y }}
      className={`pointer-events-none fixed z-[100] w-max max-w-[180px] -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-center text-xs font-medium text-surface shadow-lg no-print ${tip.below ? "" : "-translate-y-full"}`}
    >
      {tip.text}
    </div>,
    document.body,
  );
}
