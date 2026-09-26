"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <Button
      variant="ghost"
      size="sm"
      icon={Languages}
      label={`${t("shell.language")} (${locale === "de" ? "DE" : "EN"})`}
      onClick={() => setLocale(locale === "de" ? "en" : "de")}
    />
  );
}
