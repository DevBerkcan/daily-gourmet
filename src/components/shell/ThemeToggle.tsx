"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/I18nContext";

type Theme = "light" | "dark";
const STORAGE_KEY = "dg-theme";

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

/** Manueller Hell/Dunkel-Umschalter. Ohne gespeicherten Wert folgt die App der Systemeinstellung
 * (prefers-color-scheme, siehe globals.css) — der Umschalter setzt danach einen expliziten
 * Override, der in beide Richtungen gewinnt. Die Wahl landet in localStorage und wird beim nächsten
 * Laden schon vor dem ersten Paint angewendet (siehe das Inline-Script in layout.tsx), damit die
 * Seite nie kurz im falschen Theme aufblitzt.
 *
 * `mounted` hält den Server-/ersten-Client-Render auf einem neutralen Platzhalter, statt sofort
 * `window.matchMedia` abzufragen — sonst würde das serverseitig gerenderte Icon (das die
 * Systemeinstellung nicht kennt) vom tatsächlichen Icon im Browser abweichen und React würde beim
 * Hydrieren eine Warnung werfen. */
export function ThemeToggle() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setTheme(stored === "dark" || stored === "light" ? stored : null);
  }, []);

  if (!mounted) return <span className="block size-8 shrink-0" aria-hidden />;

  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme ? theme === "dark" : systemPrefersDark;

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    window.localStorage.setItem(STORAGE_KEY, next);
    apply(next);
    setTheme(next);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={isDark ? Sun : Moon}
      label={isDark ? t("shell.theme.toLight") : t("shell.theme.toDark")}
      onClick={toggle}
    />
  );
}
