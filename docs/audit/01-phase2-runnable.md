# Phase 2 — Ausführbarkeit (Frontend + Backend)

Stand: 2026-08-29. Alle Befehle wurden im Arbeitsverzeichnis
`c:\Users\AtesogluBerk-Can\Downloads\daily-gourmet-frontend\daily-gourmet` (Frontend) bzw.
`.\backend` (Backend, eigenes Git-Repo) ausgeführt. Keine destruktiven DB-Befehle, keine Migrationen
gegen eine echte Datenbank.

## Zusammenfassung

| Prüfung | Ergebnis (Erstlauf) | Ergebnis (nach Bereinigung lokaler Altlasten) |
|---|---|---|
| `npm run lint` (Frontend) | ✅ nur 5 Warnungen | — (unverändert) |
| `npx tsc --noEmit` (Frontend) | ❌ >40 Fehler | ✅ 0 Fehler |
| `npm run build` (Frontend) | ❌ Build fehlgeschlagen | ✅ Build erfolgreich (34 Routen) |
| `dotnet build` (Backend) | ❌ Build fehlgeschlagen (CS0579, Xunit fehlt) | ✅ 0 Fehler, 0 Warnungen |
| `npm audit` (Frontend) | 4 High-Severity-Schwachstellen | unverändert (siehe unten) |

**Wichtige Erkenntnis:** Beide anfänglichen Build-Fehler waren **keine Fehler im Quellcode**, sondern
Artefakte des lokalen Checkouts. Nach Bereinigung bauen Frontend und Backend beide sauber. Das ist
selbst ein Befund (siehe unten), aber kein Blocker für den weiteren Audit.

## Frontend

### 1. `npm run lint`

Erfolgreich, 5 Next.js-Core-Web-Vitals-Warnungen (kein Fehler):
- `src/app/layout.tsx:18` — Custom Font nicht in `_document.js`-Äquivalent geladen (App-Router-spezifische
  Regel, hier vermutlich ein False-Positive der Lint-Regel für den Pages-Router, da dieses Projekt den
  App Router nutzt — sollte im Frontend-Qualitätsbefund verifiziert werden).
- 4× `no-img-element`: `src/components/meal-plans/index.tsx:70`, `src/components/ui/form-fields.tsx:103`,
  `src/features/recipes/components/rezept-detail.tsx:119`, `src/features/support/components/support-center.tsx:64`
  — native `<img>` statt `next/image`, Performance-relevant (siehe Frontend-Qualitätsbericht).

### 2. `npx tsc --noEmit` — Erstlauf: fehlgeschlagen

Über 40 Fehler, davon zwei Ursachen:

**Ursache A — `@tanstack/react-query` fehlte in `node_modules`**, obwohl in `package.json` (Dependency)
und `package-lock.json` vorhanden. `node_modules/@tanstack` existierte nicht. Root Cause: `npm install`
wurde nach Hinzufügen der Dependency im Checkout nie (erneut) ausgeführt. Nach `npm install` behoben.
Dies ist eine reine **Onboarding-/Reproduzierbarkeits-Lücke**, kein Code-Fehler — aber sie hätte jeden
Entwickler, der frisch klont und direkt `tsc`/`build` ohne vorheriges `npm install` laufen lässt, exakt so
getroffen. Kein Handlungsbedarf am Code; sicherstellen, dass Onboarding-Doku (`README.md` Abschnitt 1)
`npm install` unübersehbar als ersten Schritt nennt (ist bereits der Fall — Befund ist rein informativ).

**Ursache B — veraltete Type-Caches in `.next-dev/types/` vs. `.next/types/`**: Nach Fix von Ursache A
verblieben Fehler wie `Cannot find module '../../src/app/kitchen/page.js'` und ein `LayoutRoutes`-
Typkonflikt zwischen `.next-dev/types/routes` und `.next/types/routes`. Beide Verzeichnisse sind laut
`next.config.ts` bewusst getrennte Dist-Verzeichnisse für Dev- (`.next-dev`) und Prod-Build (`.next`), um
zu verhindern, dass ein laufender Dev-Server Chunks eines parallelen Builds überschreibt. `tsconfig.json`
inkludiert aber `.next/types/**/*.ts` UND `.next-dev/types/**/*.ts` gleichzeitig — lag aus einer früheren
Dev-Session ein `.next-dev/types/validator.ts` mit Referenzen auf inzwischen entfernte Routen (`/kitchen/*`,
siehe unten) vor, kollidiert das mit dem aktuellen `.next/types/routes`. Nach `rm -rf .next .next-dev` und
Neu-Build: 0 Fehler. **Das ist eine reale, reproduzierbare Falle für den normalen Dev-Workflow** (Route
umbenennen/löschen → `npm run dev` starten → `npx tsc --noEmit` oder `npm run build` ohne vorheriges
Aufräumen ausführen → Phantom-Fehler), keine Fehlfunktion des Produktivsystems selbst. Siehe Befund
`FEQ`-Bereich für Empfehlung (z. B. `.next-dev/types` aus `tsconfig.json`-`include` entfernen oder
Troubleshooting-Hinweis in `README.md` ergänzen).

Nach beiden Bereinigungen: `npx tsc --noEmit` → **0 Fehler**.

### 3. `npm run build` — nach Bereinigung: erfolgreich

34 Routen erzeugt (Übersicht siehe Build-Output), keine Fehler. **Auffällig:** keine `/kitchen/*`-Route
im Output, und `src/app/kitchen/` sowie `src/features/kitchen/` existieren im aktuellen Checkout nicht,
obwohl sowohl `README.md` (Abschnitt 3, Projektstruktur: *"kitchen/ Küche: heutige Produktion,
Statuspflege"*) als auch `BACKEND_AUDIT.md` (Abschnitt "Production & Kitchen") ein Küchen-Modul als
existierenden Bestandteil beschreiben. Entweder wurde das Küchen-Modul entfernt/umgebaut (z. B. in
`admin/production` aufgegangen) und die Doku nicht nachgezogen, oder es ist ein noch ausstehendes Feature,
das fälschlich als vorhanden dokumentiert ist. Siehe `07-open-questions.md` — das ist eine Dokumentations-
Diskrepanz, kein Code-Fehler, und wird dort als offene Frage geführt statt als Bug mit erfundener Ursache.

### 4. `npm audit` — 4 High-Severity-Schwachstellen

Alle vier hängen an `next@15.3.3` selbst (transitive `nanoid`, `postcss`, `sharp`):
- `nanoid <3.3.18` — kann bei `size: 0` in eine Endlosschleife laufen.
- `postcss <=8.5.22` — mehrere XSS-/Path-Traversal-Advisories über SourceMap-Handling.
- `sharp <0.35.0` — geerbte `libvips`-CVEs (Bildverarbeitung).
- `next` selbst als Treiber der beiden letzteren.

Ein Fix ohne Breaking Change ist laut `npm audit` **nicht** verfügbar — `npm audit fix --force` würde
auf `next@16.3.3` heben (Major-Upgrade). Gemäß Vorgabe *"Keine Major-Upgrades ohne Kompatibilitätsanalyse"*
wird das hier **nicht** durchgeführt. Siehe `06-testing-ci-gap.md`/`00-index.md` für Priorisierung —
Ausnutzbarkeit dieser Advisories in diesem konkreten Server-/Build-Kontext (nicht Laufzeit-User-Input an
`sharp`/`postcss` in der aktuellen Nutzung) sollte im Sicherheitsbefund kurz eingeordnet werden.

## Backend

### 5. `dotnet build` — Erstlauf: fehlgeschlagen

Fehler: `CS0579: Doppeltes Attribut "TargetFrameworkAttribute"` (und weitere doppelte Assembly-Attribute)
sowie `CS0246: Der Typ- oder Namespacename "Xunit" wurde nicht gefunden`.

**Root Cause identifiziert:** `backend/DailyGourmet.Api.csproj` ist ein SDK-Style-Projekt ohne
explizite `<Compile>`-Einschränkung; es inkludiert standardmäßig **rekursiv alle `.cs`-Dateien** im
Projektverzeichnis (`backend/`). Unter `backend/src/DailyGourmet.Api/`, `DailyGourmet.Application/`,
`DailyGourmet.Domain/`, `DailyGourmet.Infrastructure/` sowie `backend/tests/DailyGourmet.*` lagen
**verwaiste, nicht von Git getrackte `bin/`- und `obj/`-Ordner** einer früheren, offenbar wieder
verworfenen Clean-Architecture-Restrukturierung (siehe Commit-Historie: zwei Commits, die eine
Frontend/Backend-Ordnerumstrukturierung zurückrollen bzw. wiederherstellen). Diese Ordner enthalten
generierte `AssemblyAttributes.cs`/`AssemblyInfo.cs`/`GlobalUsings.g.cs`-Dateien aus früheren Builds
separater Projekte — die wurden vom rekursiven Glob des aktiven `DailyGourmet.Api.csproj` mit
eingesammelt und kollidierten mit den frisch generierten Attributen des aktuellen Builds bzw.
referenzierten ein nicht eingebundenes `Xunit`-Paket.

Bestätigt: `src/*/` und `tests/*/` enthalten **ausschließlich** `bin`/`obj` (keine `.csproj`, kein
Quellcode) und sind nicht Teil des Git-Repos (`git ls-files src tests` → leer; beide Ordner sind über
die generische `bin/`/`obj/`-Regel in `backend/.gitignore` abgedeckt). Nach Löschen aller
`bin`/`obj`-Ordner unter `src/*`, `tests/*` und `backend/` selbst: **`dotnet build` → 0 Fehler, 0
Warnungen.**

**Einordnung:** Dies ist **kein Fehler im versionierten Code** — auf einem frischen Checkout ohne diese
lokalen Altlasten würde der Build sofort sauber laufen. Es ist trotzdem ein **konkretes Risiko für dieses
Repo**, weil das gleiche rekursive Glob-Verhalten erneut zuschlägt, sobald die leeren `backend/src/` und
`backend/tests/*`-Ordner (die selbst weiterhin existieren und offenbar für eine künftige
Clean-Architecture-Migration vorgesehen sind, siehe `backend/tests/*`-Namen wie
`DailyGourmet.Api.IntegrationTests`, `DailyGourmet.ArchitectureTests`) mit echten `.cs`-Dateien befüllt
werden, ohne dass `DailyGourmet.Api.csproj` diese Verzeichnisse explizit ausschließt oder jedes
Unterprojekt eine eigene `.csproj` bekommt, die den rekursiven Include des Elternprojekts "abschneidet".
Siehe Backend-Qualitätsbefund für die konkrete Empfehlung (z. B. `<Compile Remove="src/**;tests/**" />`
in `DailyGourmet.Api.csproj`, bis diese Ordner echte eigenständige Projekte enthalten).

### 6. Test-Projekte nicht Teil der Solution

`backend/DailyGourmet.Api.slnx` referenziert ausschließlich `DailyGourmet.Api.csproj`. Die vier
Testordner unter `backend/tests/` (`DailyGourmet.Api.IntegrationTests`,
`DailyGourmet.Application.UnitTests`, `DailyGourmet.ArchitectureTests`, `DailyGourmet.Domain.UnitTests`)
enthalten keine `.csproj`-Dateien — sie sind reine, leere Namensordner. `dotnet test` liefe daher ins
Leere (keine Testprojekte gefunden). Siehe `06-testing-ci-gap.md` für die Einordnung als eigenständiges
Findungsthema.

### 7. Secrets in `appsettings.json` (Backend, per Git getrackt)

`backend/appsettings.json` **ist in Git getrackt** (`git ls-files` bestätigt: `appsettings.json` und
`appsettings.Development.json` beide getrackt; nur `appsettings.*.local.json` ist per `.gitignore`
ausgeschlossen). `appsettings.json` enthält **eingebettete Klartext-Zugangsdaten**, die nach Inhalt und
Format wie echte Produktionswerte aussehen:
- `ConnectionStrings:DefaultConnection` (Zeile 3) — SQL-Server-Connection-String **inklusive Passwort**
  für einen Host `db62760.databaseasp.net`.
- `Jwt:Secret` (Zeile 6) — JWT-Signierschlüssel im Klartext.
- `Smtp:Password` (Zeile 15) — SMTP-Zugangsdaten für `office@gentlegroup.de`.
- `ImgBb:ApiKey` (Zeile 26) — externer API-Key.

Das widerspricht direkt der eigenen Dokumentation in `README.md` Abschnitt 6.1/6.5, die ausdrücklich
festhält: *"Verbindungszeichenfolge — niemals in `appsettings.json` committen"* und für Produktion
Umgebungsvariablen vorschreibt. Werte wurden hier **nicht** erneut ausgegeben (nur Zeilenverweise) und
nicht gegen den Host getestet. Dies ist der **schwerwiegendste Einzelbefund des gesamten Audits** und
wird in `04-security-authz.md` mit höchster Priorität (P0) geführt, inklusive Empfehlung zur sofortigen
Rotation aller vier Zugangsdaten (Connection-String-Passwort, JWT-Secret, SMTP-Passwort, ImgBB-Key) —
ein bereits committetes Secret gilt als kompromittiert, sobald es im Git-Verlauf steht, unabhängig davon,
ob dieses Repo öffentlich ist.

### 8. `dotnet list package --vulnerable --include-transitive` (Backend)

Nachträglich ergänzt: keine bekannten Schwachstellen in den NuGet-Paketen inkl. transitiver
Abhängigkeiten. Im Gegensatz zum Frontend (Fund 4, `npm audit`) gibt es hier keinen offenen Punkt.

### 9. `dotnet ef` / Datenbank

Wie im Plan vorgesehen: **nicht ausgeführt** (`dotnet ef migrations add/remove`, `dotnet ef database
update`, `dotnet run` gegen echte Connection-String, `Database/DailyGourmet.sql` gegen eine Instanz).
Die Konfiguration in `appsettings.Development.json` zeigt auf LocalDB (`(localdb)\MSSQLLocalDB`), nicht
auf eine geteilte/produktive Instanz — für lokale Entwicklung unkritisch, im Gegensatz zu Fund 7.

## Nicht ausführbare Prüfungen

- **Unit-/Integrationstests**: nicht vorhanden (weder Frontend noch Backend) — siehe `06-testing-ci-gap.md`.
- **End-to-End-Tests**: nicht vorhanden, kein Browser-Automatisierungstool in dieser Umgebung verfügbar
  (bereits in `BACKEND_AUDIT.md` so vermerkt).
- **CI/CD-Pipeline**: `.github/workflows/` ist ein leeres, getracktes Verzeichnis — keine automatisierte
  Ausführung der oben genannten Prüfungen bei Push/PR vorhanden.
