# Audit-Index — Daily Gourmet (Frontend + Backend)

Stand: 2026-08-29. Vollständiger technischer, architektonischer und sicherheitsbezogener Audit gemäß
dem in `C:\Users\AtesogluBerk-Can\.claude\plans\der-prompt-ist-so-generic-hippo.md` freigegebenen Plan.

**Umsetzungsstatus (laufend aktualisiert):** Nach Review der offenen Fragen (`07-open-questions.md`)
mit dem Nutzer wurde am 2026-08-29 mit der Umsetzung begonnen.

Bereits behoben und mit Regressionstests abgesichert: **SEC-01, SEC-02, BEQ-05, DBI-01, DBI-02, BEQ-04,
DBI-04, DBI-06**. Behoben ohne dediziertem Test: **DBI-05** (mechanisch identisch zu DBI-04/06).
Teilweise: **SEC-03** (Code-seitig bereinigt, Rotation beim Hoster steht noch aus) und **BEQ-01** (ein
reales Testprojekt existiert jetzt mit 9 laufenden Tests, deckt SEC-01/SEC-02/BEQ-04/DBI-04/DBI-06 ab;
die übrigen drei leeren Testordner sind noch offen). DBI-07 (Unique-Constraint) bleibt bewusst
zurückgestellt bis zur Lieferanten-API/CSV-Entscheidung. Alle übrigen Funde sind unverändert offen.

Drei Commits im Backend-Repo, zwei Commits im Frontend-Repo (Audit-Report + README, SQL-Skript +
Doku-Updates).

## Systemkontext (kurz)

Daily Gourmet ist eine mandantenfähige Catering-SaaS-Plattform (Next.js 15/React 19-Frontend +
ASP.NET-Core-10-Backend, SQL Server), die sich **mitten in der Migration** von Phase 1
(Frontend-Dummy-Daten) zu Phase 2 (echtes Backend) befindet. Nur Auth und Facilities sind
Ende-zu-Ende verdrahtet; alle anderen Features laufen noch auf Dummy-Daten, obwohl die meisten
Backend-Endpunkte bereits existieren — Details dazu bereits erschöpfend in `BACKEND_AUDIT.md`
dokumentiert und hier nicht wiederholt. Dieser Audit deckt das ab, was dort fehlt: Codequalität,
Architektur, Security, Datenbank-Integrität und die Test-/CI-Lücke.

## Ausführbarkeit (Details: `01-phase2-runnable.md`)

Frontend und Backend bauen beide **sauber**, nachdem lokale Altlasten bereinigt wurden (fehlendes
`npm install`, verwaiste Build-Artefakte einer abgebrochenen Clean-Architecture-Restrukturierung unter
`backend/src/`+`backend/tests/`). Das war reines Checkout-Rauschen, kein Code-Fehler. `npm audit`
meldet 4 High-Severity-Schwachstellen, deren Fix ein Next.js-Major-Upgrade erfordert (siehe
`07-open-questions.md #6`).

## Funde nach Priorität

| Priorität | Anzahl | Bedeutung |
|---|---|---|
| **P0 — Kritisch** | **3** | Sicherheitslücke mit Datenleck-/Übernahme-Potential — sofortiger Handlungsbedarf |
| **P1 — Hoch** | **5** | Zentraler Prozess fehlerhaft oder erhebliche Stabilitäts-/Dokumentationsgefahr |
| **P2 — Mittel** | **16** | Wartbarkeit, Performance oder wichtiger Randfall |
| **P3 — Niedrig** | **11** | Kleinere Verbesserung, Konsistenz, Codehygiene |
| **Gesamt** | **35** | — |

Zusätzlich: **8 offene Fragen** (`07-open-questions.md`) ohne erfundene Lösung, und **6 positive
Befunde** (korrekt implementierte Mechanismen, zur Vollständigkeit dokumentiert, kein Handlungsbedarf).

## P0 — Kritisch (sofortiger Handlungsbedarf)

| ID | Titel | Bereich | Datei |
|---|---|---|---|
| SEC-02 | Tenant-Admin kann sich selbst per API zu SUPER_ADMIN eskalieren — trivial ausnutzbar, vollständiger Bruch der Mandantentrennung | Security | `04-security-authz.md` |
| SEC-01 | Globaler EF-Query-Filter für `User` gibt alle SUPER_ADMIN-Konten an jeden Tenant-Nutzer frei | Security | `04-security-authz.md` |
| SEC-03 | Produktive Zugangsdaten (DB-Passwort, JWT-Secret, SMTP-Passwort, API-Key) im Git-Repository committet | Security | `04-security-authz.md` |

**Diese drei Funde sollten vor jeder anderen Änderung behoben werden.** SEC-02 ist der schwerwiegendste
Einzelfund des gesamten Audits: jeder reguläre `TENANT_ADMIN`-Account kann sich selbst zum
Plattform-Super-Admin machen, ohne dass eine Systemgrenze das verhindert.

## P1 — Hoch

| ID | Titel | Bereich | Datei |
|---|---|---|---|
| BEQ-01 | Backend-Testprojekte sind leere Ordnerhüllen, nicht Teil der Solution — keinerlei automatisierte Testabdeckung | Backend/Tests | `03-backend-quality.md` |
| BEQ-05 | JWT-Signaturschlüssel fällt bei fehlendem Secret still auf triviale Konstante zurück statt fail-fast zu starten | Backend | `03-backend-quality.md` |
| DBI-01 | SQL-Deploy-Skript veraltet — letzte Migration fehlt vollständig | Datenbank | `05-database-integrity.md` |
| DBI-02 | `IngredientSupplierPrice.Price` ohne explizite Precision/Konfiguration, Enum als rohes `int` | Datenbank | `05-database-integrity.md` |
| DBI-03 | Fast keine DB-seitigen CHECK-Constraints gegen negative Preise/Mengen; Plan behauptet fälschlich das Gegenteil | Datenbank | `05-database-integrity.md` |

## P2 — Mittel (16 Funde, Details in den Fachberichten)

- **Frontend** (`02-frontend-quality.md`): FEQ-01 (Schichtregel-Verletzung `lib/`↔`features/`),
  FEQ-02 (toter Code mit Namenskollision), FEQ-04 (Fokus-Falle fehlt in Dialogen), FEQ-05
  (`NumberField` ohne Clamping bei Geldfeldern)
- **Backend** (`03-backend-quality.md`): BEQ-02 (`RecipeHandler` God-Handler), BEQ-03
  (Repository-Pattern inkonsistent genutzt), BEQ-04 (`TenantId!.Value` ohne Guard, 24 Stellen),
  BEQ-06 (Seed-Passwort widerspricht Policy), BEQ-08 (brüchige Unique-Constraint-Erkennung)
- **Security** (`04-security-authz.md`): SEC-04 (Impersonation-Audit ohne Lesezugriffe), SEC-06
  (Cross-Tab-Token-Überschreibung bei Impersonation), SEC-07 (keine CSP für localStorage-JWT)
- **Datenbank** (`05-database-integrity.md`): DBI-04 (Feature-Flag-Toggle unauditierbar), DBI-05
  (Support-Session-Start/-Ende nicht im AuditLog), DBI-07 (keine Unique-Constraint auf
  Lieferantenpreise), DBI-08 (Sync-Import defaultet ungültige Werte still)

## P3 — Niedrig (11 Funde)

FEQ-03, FEQ-06, FEQ-07 · BEQ-07, BEQ-09, BEQ-10 · SEC-05, SEC-08, SEC-09 · DBI-06, DBI-10 —
Details in den jeweiligen Fachberichten.

## Sicherheitsstatus

**Kritisch.** Drei P0-Funde, davon zwei mit unmittelbarem Kompromittierungspotential der gesamten
Mandantentrennung (SEC-01, SEC-02) und einer mit bereits eingetretener Exposition (SEC-03, Secrets
seit mehreren Commits in der Git-Historie). Positiv: die reguläre Tenant-Isolation über EF-Core Global
Query Filters ist für alle anderen Entitäten (Orders, Recipes, Facilities, MealPlans etc.) korrekt und
robust implementiert — die Lücke bei `User` (SEC-01) ist eine isolierte Ausnahme vom sonst sauberen
Muster, kein systemisches Problem. Der Impersonation-Mechanismus selbst ist im Kern gut konstruiert
(zeitlich begrenzt, auditiert, rollenreduziert) — die verbleibenden Impersonation-Funde (SEC-04–06)
sind Härtungsthemen, keine Bypässe.

## Teststatus

**Keine automatisierte Testabdeckung** in beiden Repos (0 Frontend-Tests, 0 Backend-Tests trotz
vorbereiteter, aber leerer 4-Schichten-Testprojektstruktur, leere CI-Pipeline). Siehe
`06-testing-ci-gap.md` für die Einordnung und einen Vorschlag zur Priorisierung. Das ist der Grund,
warum jede Umsetzung der obigen Funde — insbesondere SEC-01/SEC-02 — mit besonderer manueller
Sorgfalt und begleitenden neuen Tests erfolgen muss.

## Architekturstatus

**Grundsolide, mit klaren, punktuellen Abweichungen von der eigenen Doku.** Frontend: die in
`docs/ARCHITECTURE.md` definierte Schichtregel wird größtenteils eingehalten, aber die neue
`lib/services/`-Schicht verletzt sie systematisch (FEQ-01). Backend: Controller sind durchgängig dünn,
Middleware-Reihenfolge korrekt, DI sauber — die Ausnahmen sind ein einzelner God-Handler (`RecipeHandler`,
BEQ-02) und eine inkonsistent genutzte Repository-Abstraktion (BEQ-03). Keine zirkulären Abhängigkeiten
im kritischen Pfad gefunden, aber ein reales Zirkelimport-Risiko durch FEQ-01.

## Fachliche Lücken

- **Dokumentations-Ist-Diskrepanz**: Ein in README.md und BACKEND_AUDIT.md als existierend
  beschriebenes "Küche"-Modul fehlt im aktuellen Code vollständig (siehe `07-open-questions.md #2`).
- Mehrere state-changing Aktionen (Feature-Flag-Toggle, Support-Session, Produktionsanpassung) sind
  laut Implementierungsplan audit-pflichtig, schreiben aber nicht ins zentrale AuditLog
  (DBI-04/05/06) — Diskrepanz zwischen Plan und Umsetzung, siehe `07-open-questions.md #4`.
- Die im Master-Prompt gewünschten Kern-Geschäftsprozesse (Speiseplanung → Bestellung → Produktion →
  Lieferung) sind laut `BACKEND_AUDIT.md` überwiegend backend-seitig vorhanden, aber frontend-seitig
  größtenteils noch nicht an die echte API angebunden — das ist der dort bereits dokumentierte
  Haupt-Fortschrittsindikator dieses Projekts, keine neue Erkenntnis dieses Audits.

## Empfohlene Umsetzungsreihenfolge (Vorschlag, keine Umsetzung in diesem Durchlauf)

1. **SEC-03** (Secrets rotieren) — unabhängig von Code-Änderungen sofort möglich, entkoppelt von
   allem anderen.
2. **SEC-02** dann **SEC-01** (Privilegien-Eskalation und Datenleck schließen) — kleine, gut
   abgrenzbare Code-Änderungen, aber höchste Priorität; vor der Umsetzung mindestens einen
   Regressionstest für Login/`/auth/me`/Impersonation anlegen (siehe `06-testing-ci-gap.md`, Schritt 2).
3. **BEQ-01** (Backend-Testprojekte tatsächlich anlegen) — Voraussetzung dafür, dass alle folgenden
   Änderungen sicher verifiziert werden können.
4. **BEQ-05, DBI-01** (Fail-Fast bei fehlendem JWT-Secret, SQL-Skript neu generieren) — kleine,
   risikoarme Korrekturen mit hohem Nutzen.
5. **DBI-02, DBI-03** (Datenintegrität) — vorher Offene Frage 5 (Altdaten-Verstöße) klären.
6. Verbleibende P2-Funde nach Team-Kapazität, P3 opportunistisch.

Diese Reihenfolge ist ein Vorschlag zur Diskussion — die tatsächliche Priorisierung und Freigabe zur
Umsetzung liegt beim Nutzer, wie im Plan festgehalten.

## Berichtsstruktur

- `01-phase2-runnable.md` — Ausführbarkeit: Befehle, Output, Exit-Codes
- `02-frontend-quality.md` — Frontend Codequalität & Architektur (7 Funde)
- `03-backend-quality.md` — Backend Codequalität & Architektur (10 Funde)
- `04-security-authz.md` — Security & Autorisierung (9 Funde, davon 3× P0)
- `05-database-integrity.md` — Datenbank-Schema & Datenintegrität (8 Funde + 5 positive Bestätigungen)
- `06-testing-ci-gap.md` — Test-/CI-Lücke, Ist-Zustand und Priorisierungsvorschlag
- `07-open-questions.md` — 8 offene fachliche/produktbezogene Fragen zur Entscheidung durch den Nutzer

## Nicht ausgeführte Prüfungen

- **Frontend-/Backend-Unit- und Integrationstests**: nicht vorhanden, siehe `06-testing-ci-gap.md`.
- **End-to-End-Tests**: nicht vorhanden, kein Browser-Automatisierungstool in dieser Umgebung
  verfügbar.
- **Live-Exploit-Verifikation der Security-Funde**: bewusst nicht durchgeführt (statische Code-Analyse
  gemäß Plan-Vorgabe "keine destruktiven Security-Tests gegen produktive Systeme"). SEC-01 und SEC-02
  sind durch Code-Lesen eindeutig, aber nicht live gegen eine laufende Instanz bestätigt.
- **Dependency-Audit für das Backend**: nachträglich ausgeführt —
  `dotnet list package --vulnerable --include-transitive` meldet **keine** bekannten Schwachstellen in
  den NuGet-Paketen (inkl. transitiver Abhängigkeiten). Nur das Frontend hat offene Advisories
  (`npm audit`, siehe oben und `07-open-questions.md #6`).
