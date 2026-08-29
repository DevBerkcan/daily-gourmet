# Backend Code-Qualität & Architektur

Geprüfter Bereich: `backend/{Controllers,Services,Repositories,Handlers,Middleware,Data,Models,
Extensions,Options,Program.cs}`. Kontext: `BACKEND_IMPLEMENTATION_PLAN.md` (Repo-Root),
`BACKEND_AUDIT.md` (Feature-Fertigstellungsstatus, keine Überschneidung mit den folgenden Befunden).

**Positivbefund vorab:** Die 23 Controller sind durchgängig dünn (17–163 Zeilen, Median ~40) und
delegieren ausnahmslos an Handler — keine fette Controller-Logik gefunden. Middleware-Reihenfolge
(`ExceptionMiddleware → Cors → Authentication → TenantContextMiddleware → Authorization →
ImpersonationAuditMiddleware → MapControllers`) ist korrekt und begründet. DI-Lifetimes sind konsistent
(kein Lifetime-Mismatch gefunden). Async/await ist sauber: keine `.Result`/`.Wait()`/`async void`,
`CancellationToken` wird bis in EF-Core-Aufrufe durchgereicht. `#nullable disable` nur in generierten
Migrationsdateien (Standard).

---

### BEQ-01 — Testprojekte sind leere Ordnerhüllen, nicht Teil der Solution

> **⚠️ Teilweise behoben 2026-08-29.** `backend/tests/DailyGourmet.Api.IntegrationTests` ist jetzt ein
> echtes xUnit-Projekt (via `WebApplicationFactory<Program>` + EF Core InMemory), in der `.slnx`
> referenziert, mit 5 laufenden Tests für SEC-01/SEC-02. Die drei übrigen leeren Ordner
> (`DailyGourmet.Application.UnitTests`, `DailyGourmet.ArchitectureTests`,
> `DailyGourmet.Domain.UnitTests`) sind weiterhin leer — Aufbau steht noch aus. Zusätzlich musste
> `DailyGourmet.Api.csproj` um explizite `<Compile Remove>`-Einträge für `src/**` und `tests/**`
> ergänzt werden, da das rekursive Datei-Glob des Hauptprojekts sonst den neuen Testcode mit
> eingesammelt hätte (dieselbe Ursache wie der ursprüngliche Build-Fehler in
> `01-phase2-runnable.md`).

**Beschreibung:** `backend/tests/` enthält vier Verzeichnisse (xUnit-Namenskonvention), aber keine
`.csproj`- oder Quelldateien — nur `bin`/`obj`-Artefakte eines früheren Build-Versuchs gegen ein nie
angelegtes Projekt. `DailyGourmet.Api.slnx` referenziert ausschließlich das API-Projekt.

**Beleg:** `backend/tests/DailyGourmet.{Api.IntegrationTests,Application.UnitTests,
ArchitectureTests,Domain.UnitTests}/` — jeweils nur `bin/`,`obj/`; `backend/DailyGourmet.Api.slnx`
referenziert nur `DailyGourmet.Api.csproj`.

**Auswirkung:** Keinerlei automatisierte Testabdeckung für die gesamte API. `dotnet test` liefert 0
ausgeführte Tests, ohne dass das auffällt ("no tests found", kein Fehler).

**Empfohlene Lösung:** Entweder die vier Projekte tatsächlich scaffolden (`dotnet new xunit`), ins
`.slnx` aufnehmen und befüllen — oder die leeren Ordner entfernen und den Testaufbau explizit als
offenen Punkt in `BACKEND_IMPLEMENTATION_PLAN.md`/README dokumentieren, damit kein falscher Eindruck
vorhandener Testinfrastruktur entsteht.

**Priorität:** P1 · **Aufwand:** M (pro Projekt: Bootstrap + erste Tests) · **Risiko:** S
Siehe vertiefend `06-testing-ci-gap.md`.

---

### BEQ-02 — `RecipeHandler` (755 Zeilen) ist ein "God Handler"

**Beschreibung:** Mit Abstand größte Klasse im Backend — vereint CRUD, CSV-Import-Orchestrierung
(inkl. Kategorie-Zuordnung, Allergen/Zusatzstoff-Parsing, Reduktionsfaktor-Herleitung),
Portionsskalierung, Nährwert-Umrechnung (BE/KHE), Einheiten-Konvertierung, Kostenkalkulation und
PDF-Etiketten-Rendering. `ImportFromRezeptrechnerAsync` allein ist ~200 Zeilen. Zusätzlich hängt
`RecipeHandler` direkt von `IngredientHandler` ab (Handler-zu-Handler-Kopplung statt gemeinsamem
Domänendienst).

**Beleg:** `backend/Handlers/RecipeHandler.cs:15` (Konstruktor mit 4 Abhängigkeiten inkl.
`IngredientHandler`); Methoden Zeilen 29–755, u. a. `ImportFromRezeptrechnerAsync` (232–429),
`ScaleAsync`/`ScaleNutritionToPortion` (431–479), Kosten-/Einheiten-Logik (643–688).

**Auswirkung:** Schwer testbar (viele Collaborator-Pfade in einer Klasse), hohes Änderungsrisiko —
eine Änderung an der CSV-Import-Logik kann versehentlich Skalierungs-/Kostenlogik im selben File
beeinflussen.

**Empfohlene Lösung:** Aufteilen entlang fachlicher Achsen: eigener `RecipeImportService`/
`RecipeNutritionCalculator`/`RecipeCostCalculator` als reine Domänen-/Berechnungsklassen (keine
DB-Abhängigkeit nötig), `RecipeHandler` bleibt schlanke Orchestrierung.

**Priorität:** P2 · **Aufwand:** M · **Risiko:** M (Refactoring ohne Tests riskant, siehe BEQ-01)
**Benötigte Tests:** Unit-Tests für Kategorie-Resolution, Reduktionsfaktor, Nährwert-Skalierung,
Einheiten-Konvertierung — vor der Extraktion anlegen.

---

### BEQ-03 — Repository-Abstraktion wird von der Mehrheit der Handler umgangen

**Beschreibung:** `IRepository<T>` existiert, wird aber nur von 6 der 27 Handler genutzt. Die übrigen
~20 injizieren `DailyGourmetDbContext` direkt. `SupplierHandler` injiziert **beides gleichzeitig**
(`IRepository<Supplier>` UND `DailyGourmetDbContext`), was zeigt, dass die Abstraktion hier keine echte
Grenze mehr zieht.

**Beleg:** `backend/Repositories/Interfaces/IRepository.cs`; direkter `DbContext`-Konstruktor-Parameter
u. a. in `RecipeHandler.cs:15`, `IngredientHandler.cs:13`, `OrderHandler.cs:13`, `MealPlanHandler.cs:15`
(22 Fundstellen); doppelte Abhängigkeit in `SupplierHandler.cs:17`.

**Auswirkung:** Die Repository-Schicht suggeriert eine Kapselung, die faktisch nicht besteht — neue
Entwickler können nicht vorhersagen, ob ein Handler über Repository oder DbContext arbeitet (relevant
z. B. für automatisch gesetzte Audit-Timestamps in `Repository<T>.AddAsync` vs. manuellem `db.Add()`).

**Empfohlene Lösung:** Architekturentscheidung treffen und dokumentieren: entweder Repository nur für
Fälle ohne Custom-Queries beibehalten (als ADR festhalten), oder ganz entfernen zugunsten von
durchgängigem `DbContext`-Zugriff (Mehrheitspraxis) — Hauptsache konsistent.

**Priorität:** P2 · **Aufwand:** S (Entscheidung+Doku) bis M (Vereinheitlichung) · **Risiko:** S

---

### BEQ-04 — Weitverbreitetes `tenantContext.TenantId!.Value` ohne Guard

> **✅ Behoben 2026-08-29.** Entscheidung bestätigt (`07-open-questions.md #8`): SUPER_ADMIN greift nie
> direkt auf tenant-gebundene Handler zu, nur über Impersonation — die 24 Stellen in 19 Handlern waren
> also eine echte Robustheitslücke, kein theoretisches Problem. Neue Extension-Methode
> `ITenantContext.RequireTenantId()` (`Authentication/ITenantContext.cs`) wirft eine
> `ForbiddenException` (→ 403) statt der rohen `InvalidOperationException`; alle 24 Stellen ersetzt.
> Unit-Tests: `TenantContextExtensionsTests.cs`.

**Beschreibung:** Mindestens 24 Stellen in 19 Handler-Dateien verwenden den Null-forgiving-Operator auf
`ITenantContext.TenantId` (`Guid?`), ohne Guard-Klausel — obwohl das Feld explizit `null` sein kann,
wenn ein SUPER_ADMIN anfragt. Die Invariante wird nur implizit über `[Authorize(Roles="TENANT_...")]`
auf Controller-Ebene sichergestellt. `SupportTicketHandler.cs:86` behandelt den Fall bereits defensiv
(`tenantContext.TenantId is { } tid && ...`) — 19 andere Handler nicht.

**Beleg:** u. a. `RecipeHandler.cs:234`, `IngredientHandler.cs:137,210`, `DashboardHandler.cs:18,47,75`,
`OrderHandler.cs:67`, `MealPlanHandler.cs:45,200`, `AuditLogHandler.cs:18`,
`ProcurementListHandler.cs:50,90` (24 Treffer, 19 Dateien). Gegenbeispiel: `SupportTicketHandler.cs:86`.

**Auswirkung:** `Nullable<Guid>.Value` auf `null` wirft eine `InvalidOperationException`, vom
`ExceptionMiddleware` nur als generischer 500 beantwortet statt einer sprechenden 403/400. Jede
künftige Erweiterung einer `[Authorize(Roles=...)]`-Liste um SUPER_ADMIN reißt diese Handler ohne
Compile-Fehler auf.

**Empfohlene Lösung:** Zentrale Guard-Erweiterung schaffen (`tenantContext.RequireTenantId()` → wirft
`ForbiddenException` mit klarer Meldung statt `!.Value`), überall einsetzen wo aktuell `!.Value` steht.

**Priorität:** P2 · **Aufwand:** S · **Risiko:** S
**Benötigte Tests:** Unit-Test, dass die neue Guard-Methode bei `TenantId == null` eine definierte
Exception wirft statt einer rohen `InvalidOperationException`.

---

### BEQ-05 — JWT-Signaturschlüssel fällt bei fehlendem Secret auf triviale Konstante zurück

> **✅ Behoben 2026-08-29.** `Program.cs` wirft jetzt vor `builder.Build()` eine
> `InvalidOperationException`, wenn `Jwt:Secret` fehlt oder kürzer als 32 Zeichen ist — kein
> Fallback-Key mehr. Indirekt durch alle Integrationstests in
> `UserManagementSecurityTests.cs` mitverifiziert (die Test-Factory muss ein echtes Secret setzen,
> damit die App überhaupt startet).

**Beschreibung:** Die `TokenValidationParameters`-Konfiguration ersetzt ein fehlendes/leeres
`Jwt:Secret` durch `new string('0', 32)` — die App startet anstandslos mit einem trivial erratbaren
Schlüssel weiter, statt fail-fast abzubrechen. `JwtTokenService.GenerateToken`/
`GenerateImpersonationToken` werfen bei leerem Secret dagegen korrekt eine `InvalidOperationException`
— die Inkonsistenz besteht nur in der Bearer-Validierungs-Pipeline.

**Beleg:** `backend/Program.cs:62-63`:
```csharp
IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
    string.IsNullOrWhiteSpace(jwtOptions.Secret) ? new string('0', 32) : jwtOptions.Secret)),
```

**Auswirkung:** Fehlt diese Konfiguration in einer Umgebung (vergessenes Env-Var bei neuer Umgebung),
validiert die API Tokens weiterhin — nur mit trivial erratbarem Schlüssel, statt den Start zu
verweigern. "Silent insecure default" statt Fail-Fast. Aktuell in `appsettings.json` ein echtes Secret
hinterlegt (siehe `04-security-authz.md` zum Committing-Problem selbst), Risiko betrifft künftige/
andere Deployments ohne gesetztes Secret.

**Empfohlene Lösung:** Vor `app.Run()` hart validieren, dass `Jwt:Secret` gesetzt und ausreichend lang
ist; sonst `InvalidOperationException` werfen — konsistent mit `JwtTokenService`.

**Priorität:** P1 · **Aufwand:** S · **Risiko:** S
**Benötigte Tests:** Startup-Test, der fehlendes `Jwt:Secret` simuliert und Startup-Abbruch erwartet.

---

### BEQ-06 — `DbSeeder` widerspricht der dokumentierten Passwort-Policy für Seed-Accounts

**Beschreibung:** `BACKEND_IMPLEMENTATION_PLAN.md` §10 legt fest: dev/test-Accounts ohne committete
Klartext-Passwörter, generiert beim ersten Seed-Lauf oder per Env-Var. Tatsächlich verwendet
`DbSeeder.SeedAsync` eine fest im Quellcode hinterlegte Konstante für **alle** Konten inkl. SUPER_ADMIN.

**Beleg:** Plan: `BACKEND_IMPLEMENTATION_PLAN.md:750-751`. Code:
`backend/Data/DbSeeder.cs:22` (`private const string DevPassword = "Passwort123!";`),
Zeile 203 (identisch für jeden Benutzer inkl. SUPER_ADMIN, Zeile 180).

**Auswirkung:** Ein für alle im Repo sichtbares, identisches Passwort für sämtliche Seed-Accounts
(inkl. SUPER_ADMIN) — falls der Seed je gegen eine erreichbare Staging-/Demo-Umgebung statt rein
lokaler DB läuft, ist das ein öffentlich einsehbares Credential für einen Plattform-Admin-Zugang.

**Empfohlene Lösung:** Passwort zur Seed-Zeit zufällig generieren und einmalig ausgeben, oder über
Env-Var (`SEED_DEV_PASSWORD`) konfigurierbar machen, wie im Plan vorgesehen; Standardwert nur für
rein lokale `localdb` beibehalten und explizit kennzeichnen.

**Priorität:** P2 · **Aufwand:** S · **Risiko:** S

---

### BEQ-07 — Feature-Flag-Guard-Pattern in mindestens 5 Handlern identisch dupliziert

**Beschreibung:** `if (!await featureFlags.IsEnabledAsync(...)) throw new ForbiddenException(...)`
wortgleich in mehreren Handlern statt zentral als Erweiterungsmethode.

**Beleg:** `DashboardHandler.cs:47-48,75-76`, `AuditLogHandler.cs:18`, `IngredientHandler.cs:210-211`,
`MealPlanHandler.cs:200-201`, `ProcurementListHandler.cs:50-51`.

**Empfohlene Lösung:** `IFeatureFlagService.EnsureEnabledAsync(tenantId, key, message, ct)` einführen.

**Priorität:** P3 · **Aufwand:** S · **Risiko:** S

---

### BEQ-08 — Unique-Constraint-Erkennung über brüchiges String-Matching

**Beschreibung:** Zur Umwandlung von DB-Unique-Constraint-Verletzungen in `ConflictException` (409)
wird der Indexname als Teilstring in `DbUpdateException.InnerException.Message` gesucht, statt die
SQL-Server-Fehlernummer (2601/2627) auszuwerten.

**Beleg:** `IngredientHandler.cs:127` (`ex.InnerException?.Message.Contains("IX_Ingredients_...")`),
`MealPlanHandler.cs:53,57,134`, `ProductionPlanHandler.cs:44`.

**Auswirkung:** Ändert sich die Fehlermeldung (SQL-Server-Sprachumstellung, anderer Provider, geänderte
Indexbenennung), greift der `when`-Filter nicht mehr — die Exception fällt als generischer 500 durch
statt als sprechender 409. Erst in Produktion bei echtem Konflikt bemerkbar.

**Empfohlene Lösung:** Auf `SqlException`-Fehlernummer prüfen (`Number: 2601 or 2627`) statt
Teilstring-Vergleich auf die komplette Meldung.

**Priorität:** P2 · **Aufwand:** S · **Risiko:** S
**Benötigte Tests:** Integrationstest (oder Testcontainer) gegen echte SQL-Server-Instanz.

---

### BEQ-09 — Fehler externer Dienste (ImgBb-Upload) nicht auf spezifische Fehlerzustände gemappt

**Beschreibung:** `ImgBbImageHostingService.UploadAsync` wirft generische `InvalidOperationException`/
`HttpRequestException`, die im `ExceptionMiddleware`-Switch nicht abgedeckt sind und im generischen
500-Zweig landen.

**Beleg:** `backend/Services/ImgBbImageHostingService.cs:12-13,26-28`; `ExceptionMiddleware.cs:19-27`
(Switch ohne diese Typen).

**Auswirkung:** Ein Nutzer, der einen Support-Ticket-Anhang hochlädt, bekommt bei Upstream-Ausfall nur
"Ein unerwarteter Fehler ist aufgetreten" statt "Bild-Upload derzeit nicht möglich"; erwartbare,
transiente Drittanbieter-Fehler verrauschen den 500-Level-Log.

**Empfohlene Lösung:** Fehler in fachliche Exception übersetzen (z. B. `ExternalServiceException` →
502/503) und im Middleware-Switch ergänzen.

**Priorität:** P3 · **Aufwand:** S · **Risiko:** S

---

### BEQ-10 — Feature-Flag-Seed anfällig für Race Condition bei horizontal skalierten Instanzen

**Beschreibung:** Bei jedem Programmstart prüft `DbSeeder.EnsureFeatureFlagsExistAsync` fehlende
Feature-Flag-Keys und fügt sie ein (`FeatureFlag.Key` hat Unique-Index). Starten zwei Instanzen
gleichzeitig gegen dieselbe, noch nicht aktualisierte DB, können beide denselben fehlenden Key lesen
und gleichzeitig einfügen — die zweite `SaveChangesAsync()` schlägt mit unbehandelter
`DbUpdateException` fehl und der Instanzstart stürzt ab.

**Beleg:** `backend/Data/DbSeeder.cs:55-65` (kein try/catch); Unique-Index in
`IdentityConfigurations.cs:66`; Aufruf bei jedem Start in `Program.cs:142-146`.

**Auswirkung:** Nur relevant bei >1 gleichzeitig startender Instanz UND fehlendem neuen Flag-Key
(schmales Fenster, aber realistisch bei Rolling-Deployment).

**Empfohlene Lösung:** `SaveChangesAsync()` hier in `try/catch (DbUpdateException)` einwickeln und im
Konfliktfall ignorieren (andere Instanz hat den Flag bereits angelegt).

**Priorität:** P3 · **Aufwand:** S · **Risiko:** S

---

## Offene Fragen

1. **BEQ-04 / Rollenerweiterung:** Ist geplant, dass SUPER_ADMIN je direkt (ohne Impersonation) auf
   tenant-gebundene Handler-Methoden zugreifen soll? Falls nein, ist die aktuelle Absicherung über
   `[Authorize(Roles=...)]` eine bewusste Design-Entscheidung, keine Korrektheitslücke.
2. **BEQ-03 / Repository-Pattern:** Unklar, ob ursprünglich für zukünftige Testbarkeit eingeführt und
   die Migration unvollständig ist, oder ob es ein bewusst aufgegebener Zwischenschritt ist.
3. **BEQ-10 / Deployment-Topologie:** Ob das Backend je mit mehr als einer Instanz gleichzeitig
   deployed wird, ist unbekannt — falls nein (Single-Instance-Hosting, wie der Connection-String zu
   einem Shared-Hosting-Provider nahelegt), ist BEQ-10 vernachlässigbar.
