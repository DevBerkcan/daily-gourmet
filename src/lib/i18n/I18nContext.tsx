"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Locale, type TranslationKey } from "./translations";

const STORAGE_KEY = "dg-locale";
const DEFAULT_LOCALE: Locale = "de";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}

/** Minimal-i18n ohne externe Bibliothek (siehe translations.ts) — für zwei Sprachen und ohne
 * Pluralregeln/ICU-Bedarf reicht ein Dictionary + Platzhalter-Ersetzung, und es kommt ohne
 * `npm install` einer neuen Abhängigkeit aus, im selben Stil wie der Rest der App (eigener Store,
 * eigene Toasts, eigene Table-Komponente statt einer UI-Bibliothek). Die Sprache wird in
 * localStorage gemerkt; welche Sprache das Feature-Flag "mehrsprachigkeit" den Umschalter überhaupt
 * anzeigen lässt, entscheidet der Aufrufer (siehe LanguageToggle), nicht dieser Provider — er
 * funktioniert unabhängig davon, damit eine bereits gespeicherte Wahl nicht verloren geht, falls das
 * Flag später wieder deaktiviert wird. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "de" || stored === "en") setLocaleState(stored);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const dict = translations[locale];
      const text = (dict as Record<string, string>)[key] ?? translations.de[key] ?? key;
      return interpolate(text, params);
    },
    [locale]
  );

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation() muss innerhalb von <I18nProvider> verwendet werden.");
  return ctx;
}
