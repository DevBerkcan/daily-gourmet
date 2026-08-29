# Test- und CI-Lücke

Dieser Bereich wird bewusst gesondert behandelt statt nur als einzelner Fund, weil er die Grundlage für
jede sichere Umsetzung der übrigen Befunde ist — insbesondere die P0-Security-Fixes in
`04-security-authz.md` brauchen Regressionstests, bevor sie produktiv gehen.

## Ist-Zustand

**Frontend:** Kein Test-Runner im Projekt (`package.json` hat nur `dev/build/start/lint`). Keine
`*.test.*`/`*.spec.*`-Dateien irgendwo unter `src/`. Kein Jest/Vitest/Testing-Library/Playwright/
Cypress als Dependency.

**Backend:** Unter `backend/tests/` liegen vier Verzeichnisse mit xUnit-Namenskonvention —
`DailyGourmet.Api.IntegrationTests`, `DailyGourmet.Application.UnitTests`, `DailyGourmet.ArchitectureTests`,
`DailyGourmet.Domain.UnitTests` — aber **keines enthält eine `.csproj` oder Quelldateien**, nur
verwaiste `bin`/`obj`-Ordner. `DailyGourmet.Api.slnx` referenziert ausschließlich das API-Projekt. Wer
auch immer diese vier Projekte ursprünglich geplant hat, hat eine sinnvolle 4-Schichten-Teststrategie
angelegt (API-Integration, Application-Unit, Domain-Unit, Architektur-/Fitness-Function-Tests) — sie
wurde aber nie umgesetzt (siehe `BEQ-01` in `03-backend-quality.md`).

**CI/CD:** `.github/workflows/` ist ein leeres, getracktes Verzeichnis — keine automatisierte
Ausführung von Lint/Typecheck/Build/Tests bei Push oder Pull Request.

**Konsequenz:** Jede der in diesem Audit gefundenen Änderungen — insbesondere die P0-Security-Fixes
(SEC-01, SEC-02) und die Datenintegritäts-Constraints (DBI-02, DBI-03) — muss aktuell **komplett
manuell** verifiziert werden. Es gibt keinen automatisierten Schutz gegen Regressionen.

## Fehlende Testarten je Schicht

| Schicht | Aktuell | Bedarf laut Master-Prompt / Projektrisiko |
|---|---|---|
| Backend Domain/Application (Unit) | 0 Tests | Preisberechnung, Mengenumrechnung (`ConversionFactor`), Portionsskalierung, Bestellfristen-Logik, Rollenzuweisungs-Policy (nach SEC-02-Fix) |
| Backend API (Integration) | 0 Tests | Tenant-Isolation je Controller (insb. Regressionstest für SEC-01/SEC-02), Auth-Flow, Impersonation-Start/Ende, Unique-Constraint-Konflikte (409) |
| Backend Architektur (Fitness Functions) | 0 Tests | Schichtgrenzen (z. B. "Handler dürfen nicht X"), würde BEQ-03 (Repository-Umgehung) und ähnliche Drifts automatisch erkennen |
| Frontend Unit/Component | 0 Tests | Formularvalidierung (insb. Geld-/Mengenfelder, siehe FEQ-05), Store-Hooks |
| Frontend E2E | 0 Tests, kein Tool verfügbar | Die vom Master-Prompt gewünschten Kern-Journeys (Kunde anlegen → Rezept → Speiseplan → Bestellung → Produktion) |
| CI-Integration | Keine | Muss alle obigen Ebenen bei jedem PR automatisch ausführen |

## Vorschlag für eine minimale Teststrategie (nur geplant, hier nicht umgesetzt)

Dies ist ein Vorschlag zur Priorisierung, keine Umsetzung — die tatsächliche Implementierung ist Teil
eines separaten, vom Nutzer freizugebenden Folge-Plans.

1. **Zuerst: Backend-Testprojekte tatsächlich anlegen** (`dotnet new xunit` in jedem der vier
   `backend/tests/*`-Ordner, `.slnx` aktualisieren) — das ist die Voraussetzung für alles Weitere.
2. **Regressionstests für die P0-Security-Fixes zuerst**, sobald diese umgesetzt werden (SEC-01, SEC-02)
   — das ist der Bereich mit dem höchsten Schadenspotential bei einer Rückregression.
3. **Unit-Tests für reine Berechnungslogik** ohne DB-Abhängigkeit: Rezeptskalierung, Nährwert-Umrechnung,
   Kostenkalkulation (`RecipeHandler`, siehe BEQ-02 — diese Extraktion würde Testbarkeit direkt
   verbessern), Bestellfristen-Berechnung.
4. **Wenige, aber gezielte Integrationstests** für Tenant-Isolation über mehrere Controller hinweg
   (Stichprobenartig, wie im Security-Bericht bereits als Prüfmethode verwendet) — am besten mit
   `Microsoft.AspNetCore.Mvc.Testing`/`WebApplicationFactory` gegen eine In-Memory- oder
   Testcontainer-SQL-Server-Instanz.
5. **CI-Workflow ergänzen** (`.github/workflows/ci.yml`): `npm run lint`, `npx tsc --noEmit`,
   `npm run build`, `dotnet build`, `dotnet test` bei jedem Push/PR — verhindert, dass die in
   `01-phase2-runnable.md` dokumentierten (lokal bereits gelösten) Build-Probleme unbemerkt erneut
   auftreten.
6. **Frontend-Komponententests** für die identifizierten Risikobereiche (FEQ-04 Fokus-Trap, FEQ-05
   Geld-Feld-Clamping) mit React Testing Library.
7. **E2E zuletzt**, sobald mehr Features auf die echte API migriert sind (aktuell laufen die meisten
   Frontend-Bereiche noch auf Dummy-Daten, siehe `BACKEND_AUDIT.md` — E2E-Tests gegen Dummy-Daten hätten
   geringen Aussagewert für die eigentliche Produktionsreife).

## Warum dies keine Priorität mit Nummer (P0-P3) bekommt

Die einzelnen Symptome sind bereits als `BEQ-01` (P1, leere Backend-Testprojekte) erfasst. Diese Datei
ordnet das Gesamtbild ein und liefert die Grundlage für die Priorisierungsentscheidung, die der Nutzer
nach Review dieses Audits treffen muss: Investiert man zuerst in Testinfrastruktur (dann sind die
P0-Security-Fixes sicherer, aber langsamer auszurollen) oder behebt man die P0-Funde zuerst mit
sorgfältiger manueller Verifikation und baut Tests parallel auf? Das ist eine Priorisierungsfrage, keine
technische — siehe `00-index.md`, Abschnitt "Empfohlene Umsetzungsreihenfolge".
