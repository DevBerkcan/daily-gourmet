"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface SearchSelectOption {
  value: string;
  label: string;
}

/**
 * Durchsuchbares Auswahlfeld (Combobox) — Ersatz für ein natives <select>, wenn die Liste lang ist
 * (z. B. Zutaten im Rezeptformular). Tippen filtert, ↑/↓ wählen, Enter übernimmt, Esc schließt.
 */
export function SearchSelect({
  value, options, onChange, ariaLabel, placeholder = "Suchen…", className = "",
}: {
  value: string;
  options: SearchSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [offen, setOffen] = useState(false);
  const [suche, setSuche] = useState("");
  const [aktiv, setAktiv] = useState(0);

  const gewaehlt = options.find((o) => o.value === value);

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLocaleLowerCase("de-DE");
    if (!q) return options;
    const begriffe = q.split(/\s+/);
    const treffer = options.filter((o) => {
      const l = o.label.toLocaleLowerCase("de-DE");
      return begriffe.every((b) => l.includes(b));
    });
    // Treffer am Wortanfang zuerst — "Ei" soll "Eier" vor "Weißwein" liefern.
    return treffer.sort((a, b) => Number(!a.label.toLocaleLowerCase("de-DE").startsWith(q)) - Number(!b.label.toLocaleLowerCase("de-DE").startsWith(q)));
  }, [options, suche]);

  useEffect(() => {
    if (!offen) return;
    const schliessen = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) { setOffen(false); setSuche(""); }
    };
    document.addEventListener("mousedown", schliessen);
    return () => document.removeEventListener("mousedown", schliessen);
  }, [offen]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${aktiv}"]`)?.scrollIntoView({ block: "nearest" });
  }, [aktiv]);

  const waehle = (o: SearchSelectOption) => {
    onChange(o.value);
    setOffen(false);
    setSuche("");
  };

  const oeffnen = () => {
    setOffen(true);
    setAktiv(Math.max(0, options.findIndex((o) => o.value === value)));
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input
        type="text"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={offen}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={offen ? suche : gewaehlt?.label ?? ""}
        placeholder={offen ? gewaehlt?.label ?? placeholder : placeholder}
        onFocus={oeffnen}
        onClick={() => { if (!offen) oeffnen(); }}
        onChange={(e) => { setSuche(e.target.value); setOffen(true); setAktiv(0); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); if (!offen) oeffnen(); else setAktiv((i) => Math.min(i + 1, gefiltert.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setAktiv((i) => Math.max(i - 1, 0)); }
          else if (e.key === "Enter") { if (offen) { e.preventDefault(); const o = gefiltert[aktiv]; if (o) waehle(o); } }
          else if (e.key === "Escape") { setOffen(false); setSuche(""); }
          else if (e.key === "Tab") { setOffen(false); setSuche(""); }
        }}
        className="min-h-10 w-full rounded-lg border border-line bg-surface pl-3 pr-8 text-sm text-ink placeholder:text-muted focus:outline-2 focus:outline-offset-1 focus:outline-basil"
      />
      <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
        {offen ? <><circle cx="9" cy="9" r="5.5" /><path d="m13 13 4 4" strokeLinecap="round" /></> : <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
      {offen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-lg border border-line bg-surface py-1 text-sm shadow-lg"
        >
          {gefiltert.length === 0 && <li className="px-3 py-2 text-muted">Keine Treffer für „{suche}“</li>}
          {gefiltert.map((o, i) => (
            <li
              key={o.value}
              data-index={i}
              role="option"
              aria-selected={o.value === value}
              onMouseDown={(e) => { e.preventDefault(); waehle(o); }}
              onMouseEnter={() => setAktiv(i)}
              className={`cursor-pointer px-3 py-1.5 ${i === aktiv ? "bg-basil-soft text-basil" : "text-ink"} ${o.value === value ? "font-semibold" : ""}`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
