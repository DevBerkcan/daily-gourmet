"use client";

import type { ReactNode } from "react";

const inputCls = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:outline-2 focus:outline-offset-1 focus:outline-basil";

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-ink">{label}{required && <span className="text-danger"> *</span>}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function TextField({ label, value, onChange, placeholder, required, hint }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; hint?: string }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className={inputCls} />
    </Field>
  );
}

export function NumberField({ label, value, onChange, min, step, suffix, required, hint }: { label: string; value: number | ""; onChange: (v: number) => void; min?: number; step?: number; suffix?: string; required?: boolean; hint?: string }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          step={step ?? "any"}
          onChange={(e) => {
            // Fixed 2026-08-29 (FEQ-05): this used to pass the raw parsed value straight through,
            // so a negative/NaN keystroke (or a value below `min`) landed unclamped in state and fed
            // straight into live calculations (e.g. cheapest-supplier-price reduce) — several other
            // number inputs in the codebase already clamp with this same Math.max pattern.
            const parsed = e.target.value === "" ? 0 : Number(e.target.value) || 0;
            onChange(min !== undefined ? Math.max(min, parsed) : parsed);
          }}
          required={required}
          className={inputCls}
        />
        {suffix && <span className="shrink-0 text-xs text-muted">{suffix}</span>}
      </div>
    </Field>
  );
}

export function TextareaField({ label, value, onChange, rows = 3, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${inputCls} py-2`} />
    </Field>
  );
}

export function SelectField({ label, value, onChange, options, required, hint }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[]; required?: boolean; hint?: string }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required} className={inputCls}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  );
}

export function CheckboxRow({ checked, onChange, label, sub }: { checked: boolean; onChange: () => void; label: string; sub?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm hover:bg-paper">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-basil" />
      <span>
        <span className="font-medium text-ink">{label}</span>
        {sub && <span className="block text-xs text-muted">{sub}</span>}
      </span>
    </label>
  );
}

export function CheckboxGroup({ label, options, selected, onToggle, hint }: { label: string; options: readonly string[]; selected: string[]; onToggle: (value: string) => void; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const checked = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onToggle(o)}
              aria-pressed={checked}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                checked ? "border-basil bg-basil-soft text-basil" : "border-line bg-surface text-ink-soft hover:bg-paper"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

export function ImageField({ label, value, onChange, hint }: { label: string; value: string | undefined; onChange: (url: string | undefined) => void; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        {value && <img src={value} alt="" className="size-16 rounded-lg border border-line object-cover" />}
        <div className="flex flex-col gap-1.5">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              onChange(file ? URL.createObjectURL(file) : undefined);
            }}
            className="text-xs text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-paper"
          />
          {value && (
            <button type="button" onClick={() => onChange(undefined)} className="cursor-pointer text-left text-xs text-muted hover:text-danger hover:underline">
              Foto entfernen
            </button>
          )}
        </div>
      </div>
    </Field>
  );
}
