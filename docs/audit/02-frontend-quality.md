# Frontend Code-Qualität & Architektur

Geprüfter Scope: `src/app/`, `src/features/`, `src/components/`, `src/lib/` (alle .ts/.tsx), gegen die
in `docs/ARCHITECTURE.md` festgelegten Regeln. Alle Befunde durch Lesen der referenzierten Dateien
verifiziert.

---

### FEQ-01 — `lib/services/*.ts` importiert systematisch aus `features/*`

**Beschreibung:** `docs/ARCHITECTURE.md` (Abschnitt 1) legt fest: „`lib/` importiert nie aus `features/`
oder `app/`." Die neue Schicht `src/lib/services/*.ts` (17 Dateien, TanStack-Query-Hooks) verletzt das
durchgängig — importiert Typen UND Laufzeit-Code aus `features/`, statt wie in Abschnitt 4 der Doku
selbst vorgesehen die `data.ts`/`store.ts` **innerhalb** des jeweiligen Features zu ersetzen.

**Beleg:**
- `src/lib/services/recipes.ts:4` `import type { Rezept, ... } from "@/features/recipes/types";`
- `src/lib/services/recipes.ts:8-16` re-exportiert Laufzeitfunktionen aus `@/features/recipes/store`
- `src/lib/services/super-admin.ts:4,14`, `support.ts:4,6`, `meal-plans.ts:4,6-7` — analog
- Gegenrichtung: `src/features/recipes/store.ts:2` importiert aus `@/lib/services/ingredients` — der
  Abhängigkeitspfad läuft bereits in beide Richtungen quer durch die Schichten.

**Auswirkung:** `lib/` soll gefahrlos aus jedem Feature importierbar sein. Sobald `lib/` selbst aus
`features/` importiert, entsteht harte Kopplung und ein echter Zirkelimport ist nur einen weiteren
Import entfernt.

**Reproduktion:** Grep nach `from ["']@/features` in `src/lib/` → Treffer in `super-admin.ts`,
`recipes.ts`, `support.ts`, `meal-plans.ts`.

**Empfohlene Lösung:** Entweder (a) TanStack-Query-Hooks + Typen konsequent in `features/<name>/`
verschieben (Abschnitt 4 der Doku), oder (b) `lib/services/` als bewusste neue Schicht dokumentieren
und Domänentypen nach `lib/types.ts` verschieben — nicht beides parallel belassen.

**Priorität:** P2 · **Aufwand:** L (4+ Service-Dateien + Konsumenten) · **Risiko:** M
**Benötigte Tests:** Statische Architekturprüfung im CI (`dependency-cruiser`/ESLint
`import/no-restricted-paths`), die `lib/ → features/` hart verbietet.

---

### FEQ-02 — `src/lib/einrichtungenStore.ts` ist toter Code mit namensgleichem Hook

**Beschreibung:** Definiert `useEinrichtungen()`/`addEinrichtung()` als Session-Store auf Mock-Basis.
Parallel exportiert `src/lib/services/facilities.ts:78` eine **gleichnamige** Funktion, die echt gegen
das Backend lädt. Alle 8 tatsächlichen Konsumenten importieren ausschließlich aus
`@/lib/services/facilities`. Die alte Datei hat keinen Importeur mehr.

**Beleg:** `src/lib/einrichtungenStore.ts:16-29` (unbenutzt); Grep über `useEinrichtungen` zeigt 8
Treffer, alle mit `from "@/lib/services/facilities"`.

**Auswirkung:** Zwei gleichnamige Funktionen mit identischer Signatur, aber unterschiedlicher
Datenquelle sind gleichzeitig unter `@/lib/...` importierbar — ein falscher Autocomplete-Treffer liefert
lautlos veraltete Mock-Daten statt Backend-Daten, ohne Typfehler.

**Empfohlene Lösung:** `src/lib/einrichtungenStore.ts` löschen (Facilities ist bereits vollständig
migriert).

**Priorität:** P2 · **Aufwand:** S · **Risiko:** S (Datei nachweislich unbenutzt)
**Benötigte Tests:** Keine; `tsc --noEmit`/Build nach Löschung genügt.

---

### FEQ-03 — Dupliziertes `HEUTE` in `plan-detail.tsx` statt zentraler Konstante

**Beschreibung:** `src/lib/heute.ts` trägt den Kommentar „Einzige Stelle, die bei einem neuen
Datenstand angepasst werden muss". Trotzdem definiert `plan-detail.tsx:24` eine eigene lokale
Konstante `const HEUTE = "2026-08-06"` statt zu importieren (wie `bestellwoche.tsx:17` es korrekt tut).

**Beleg:** `src/features/meal-plans/components/plan-detail.tsx:24` vs. `src/lib/heute.ts:7`.

**Auswirkung:** Bei Aktualisierung von `lib/heute.ts` zeigt der Admin-Speiseplankalender weiterhin den
alten „Heute"-Tag, während jede andere Ansicht korrekt aktualisiert.

**Priorität:** P3 · **Aufwand:** S · **Risiko:** S

---

### FEQ-04 — Modal-Dialoge ohne Fokus-Falle, Fokus-Restore oder Escape-Handling

**Beschreibung:** `ConfirmDialog`/`PromptDialog` (`src/components/ui/confirm-dialog.tsx`) deklarieren
`aria-modal="true"`, implementieren aber kein modales Verhalten: kein Fokus-Trap (Tab kann aus dem
Dialog heraus navigieren), kein Escape-Handler (im Gegensatz zu `AppShell.tsx:53-55`), `ConfirmDialog`
setzt keinen initialen Fokus, kein Fokus-Restore beim Schließen. Verwendet für destruktive Aktionen in
7+ Dateien (Einrichtung löschen, Mandant sperren, Bestellung absenden).

**Beleg:** `src/components/ui/confirm-dialog.tsx:30-51` (kein `useEffect` für Fokus/Escape); Verwendung
z. B. `src/app/admin/facilities/facilities-manager.tsx:120-151`.

**Auswirkung:** Tastatur-/Screenreader-Nutzer können bei geöffnetem Dialog aus Versehen hinter das
Overlay navigieren und dort Aktionen auslösen, während `aria-modal="true"` dem Screenreader fälschlich
signalisiert, die Seite dahinter sei ausgeblendet — bei destruktiven Aktionen ein reales Risiko.

**Empfohlene Lösung:** Gemeinsamen Fokus-Trap-Hook für beide Dialog-Komponenten: Fokus beim Öffnen
setzen, Tab-Zyklus begrenzen, Escape schließt, Fokus-Restore beim Schließen.

**Priorität:** P2 · **Aufwand:** M · **Risiko:** S
**Benötigte Tests:** Playwright-Tastaturtest (Tab-Reihenfolge, Escape, Fokus-Restore); axe-core-Check.

---

### FEQ-05 — `NumberField` ohne Clamping, inkonsistent mit anderen Zahlen-Inputs im selben Repo

**Beschreibung:** `NumberField` (`src/components/ui/form-fields.tsx:25-42`) reicht `onChange`-Werte
ungeklammert durch (`step ?? "any"` als Default, kein `min`-Enforcement in JS), während mehrere manuell
geschriebene `<input type="number">` an anderer Stelle im selben Repo (`produktionstag-detail.tsx:45`,
`procurement-board.tsx:103`) dasselbe Problem bereits per `Math.max(0, ...)` lösen. `NumberField` wird
ausgerechnet für geldrelevante Felder eingesetzt: `Preis` (`preise-panel.tsx:92`), `Einkaufspreis`
(`zutat-formular.tsx:56`) — beide ohne `step`, beliebig viele Nachkommastellen möglich.

**Beleg:** `src/components/ui/form-fields.tsx:25-42,34`; Gegenbeispiele mit Clamping:
`produktionstag-detail.tsx:45`, `procurement-board.tsx:103`, `bestellwoche.tsx:163`.

**Auswirkung:** Einzige Absicherung ist native `type="number"`/`min`-HTML-Validierung beim Submit;
Zwischenzustände (negativ/NaN) landen ungeklammert im React-State und fließen in Live-Berechnungen ein
(z. B. „günstigster Preis" per `reduce` in `preise-panel.tsx:30`) — dasselbe Problem wurde an anderer
Stelle im Formularsystem bereits gelöst, hier aber nicht.

**Empfohlene Lösung:** `NumberField` intern klammern (`Math.max(min ?? -Infinity, ...)`), sinnvollen
`step` (z. B. `0.01`) für Geldfelder erzwingen bzw. eigene `MoneyField`-Variante.

**Priorität:** P2 · **Aufwand:** S · **Risiko:** S
**Benötigte Tests:** Unit-Test für `NumberField` gegen negative Eingaben/übermäßige Nachkommastellen.

---

### FEQ-06 — `app/procurement/approve/page.tsx` bricht die „dünne Seite"-Konvention

**Beschreibung:** Einzige `page.tsx` im gesamten Repo mit `"use client"` an erster Stelle und
vollständiger Fetch-/Render-Logik inline (`useSearchParams`, `useEffect`, Mutation, drei UI-Zustände),
statt sie nach `features/procurement/components/` auszulagern.

**Beleg:** `src/app/procurement/approve/page.tsx:1-72`.

**Auswirkung:** Isoliert gering, aber untergräbt die Konvention, die den Rest von `app/` sauber hält;
Risiko, dass das Muster bei ähnlichen künftigen Magic-Link-Seiten kopiert wird.

**Priorität:** P3 · **Aufwand:** S · **Risiko:** S

---

### FEQ-07 — `lib/services/super-admin.ts` (553 Zeilen) bündelt sechs unabhängige Domänen

**Beschreibung:** Anders als jede andere `lib/services/*.ts`-Datei (je eine Domäne) vereint
`super-admin.ts` Tenant-CRUD, Tenant-Settings/-Profil, Nutzerverwaltung, Dashboard, System-Status,
Feature-Flags, Audit-Log und Tenant-Facilities in einer Datei.

**Beleg:** `src/lib/services/super-admin.ts`, 553 Zeilen, neun Abschnitte; zweitgrößte Datei
(`recipes.ts`) hat 458 Zeilen für genau eine Domäne.

**Auswirkung:** Änderungen an einer Sub-Domäne erfordern Navigation durch unrelatedten Kontext; erhöhtes
Merge-Konflikt-Risiko zwischen Teams.

**Empfohlene Lösung:** Entlang bestehender Abschnittskommentare aufteilen (`super-admin-tenants.ts`,
`super-admin-users.ts`, `super-admin-system.ts`, `super-admin-facilities.ts`).

**Priorität:** P3 · **Aufwand:** M · **Risiko:** S (reines Aufteilen ohne Verhaltensänderung)

---

## Offene Fragen

1. **Dokumentationsdrift bei `features/kitchen/`:** `docs/ARCHITECTURE.md` referenziert mehrfach ein
   `features/kitchen/`-Feature (inkl. `recipe-requirement.tsx`) und das dort beschriebene Store-vs-Seed-
   Beispiel. Im aktuellen Code existiert **kein** `features/kitchen/`-Verzeichnis und keine
   `kitchen`-Route mehr — die relevanten Felder (`workStatus`, `stagedQuantity`, `workstation`) sind
   vollständig in `lib/services/production.ts` aufgegangen. Unklar, ob `kitchen` bewusst in
   `production` aufgegangen ist (Doku müsste aktualisiert werden) oder ob das Feature versehentlich
   verloren ging. Deckt sich mit dem eigenständigen Befund aus `01-phase2-runnable.md` (fehlende
   `/kitchen`-Route im Build). Team-/Produktentscheidung zur Dokumentationspflege, keine Code-Änderung.
2. **Store-vs-Seed-Array-Split:** Gezielt nach weiteren Instanzen des in `docs/ARCHITECTURE.md` bereits
   bekannten Musters gesucht (ein Bereich liest Store/Hook, ein anderer denselben statischen
   `data.ts`-Seed für dieselbe Domäne). **Keine weiteren Instanzen gefunden** — verbleibende
   `data.ts`-Importe außerhalb des eigenen Features sind reine Konstanten-/Lookup-Listen, keine
   Entitäts-Arrays. Das ursprünglich dokumentierte Beispiel selbst lässt sich mangels existierendem
   `features/kitchen/` im aktuellen Code nicht mehr nachvollziehen (siehe Punkt 1).
