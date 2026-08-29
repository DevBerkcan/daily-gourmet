"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Fixed 2026-08-29 (FEQ-04, docs/audit/02-frontend-quality.md): ConfirmDialog/PromptDialog declared
 * `aria-modal="true"` without actually behaving modally — Tab could move focus out onto the page
 * behind the overlay, there was no Escape-to-close, and focus never returned to whatever triggered
 * the dialog. Used for destructive actions (delete facility, lock tenant), where that gap matters.
 *
 * On open: remembers the triggering element, moves focus into the dialog, traps Tab/Shift+Tab
 * within its focusable elements, and closes on Escape. On close: restores focus to the trigger.
 */
export function useDialogFocus(open: boolean, containerRef: RefObject<HTMLElement | null>, onEscape: () => void) {
  const previouslyFocused = useRef<HTMLElement | null>(null);
  // Callers typically pass an inline arrow function, which would otherwise re-identify on every
  // render (e.g. every keystroke in PromptDialog's input) and re-run the effect below, stealing
  // focus back to the first field mid-typing. Reading through a ref keeps the effect's own
  // dependency list to just `open`/`containerRef` (a stable ref object) without needing to widen it.
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    const focusables = container ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
    (focusables[0] ?? container)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const current = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!current || current.length === 0) return;
      const list = Array.from(current);
      const first = list[0];
      const last = list[list.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, containerRef]);
}
