"use client";

import { useTranslation } from "@/lib/i18n/I18nContext";
import { useFeatureFlag } from "@/lib/services/feature-flags";

/** Nur sichtbar, solange das Feature-Flag "mehrsprachigkeit" für den Mandanten aktiv ist (siehe
 * DbSeeder.FeatureFlagCatalog) — bisher tat das Aktivieren dieses Flags nichts, weil nichts es
 * abgefragt hat; das hier ist die erste tatsächliche Funktion dahinter. Übersetzt ist bislang nur
 * ein Teil der App (Shell-Navigation, gemeinsame UI-Bausteine, Login, Admin-Übersicht) — der Rest
 * zeigt bis zur weiteren Migration weiterhin deutschen Text, siehe translations.ts. */
export function LanguageToggle() {
  const aktiv = useFeatureFlag("mehrsprachigkeit");
  const { locale, setLocale, t } = useTranslation();
  if (!aktiv) return null;

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "de" ? "en" : "de")}
      aria-label={t("shell.language")}
      title={t("shell.language")}
      className="flex h-9 shrink-0 items-center justify-center rounded-lg px-2.5 text-xs font-semibold text-ink-soft hover:bg-paper hover:text-ink"
    >
      {locale === "de" ? "DE" : "EN"}
    </button>
  );
}
