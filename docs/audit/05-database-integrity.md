# Datenbank-Schema & Datenintegrität

Geprüfte Quellen: `Database/DailyGourmet.sql` (2112 Zeilen), `backend/Data/DailyGourmetDbContext.cs`,
`backend/Data/Configurations/*.cs`, `backend/Models/Entities/*.cs`, `backend/Migrations/*.cs`
(9 Migrationen, InitialCreate bis `20260827054437_AddImgBbSupportAttachments`),
`BACKEND_IMPLEMENTATION_PLAN.md`, `BACKEND_AUDIT.md`. Reine Lesetätigkeit, keine `dotnet ef`/SQL-Ausführung.

**Gesamteindruck:** Die Kernentitäten (Order, OrderItem, Recipe, Ingredient, Facility, MealPlan,
RecipeIngredient, ProcurementListItem) sind bei Geld-/Mengenfeldern durchgängig mit explizitem
`HasPrecision(...)` konfiguriert, FK-Kaskaden auf bestell-/produktionsrelevanten Entitäten sind
überwiegend korrekt auf `Restrict`/`NO ACTION` gesetzt, und die Mandantentrennung (globale
Query-Filter) ist vollständig und sorgfältig implementiert. Die gefundenen Probleme sind eng
umrissen, aber teils mit echtem Risiko.

---

### DBI-01 — SQL-Deploy-Skript ist veraltet: letzte Migration fehlt vollständig

> **✅ Behoben 2026-08-29.** `Database/DailyGourmet.sql` per `dotnet ef migrations script --idempotent`
> neu generiert (zweimal — einmal initial, einmal erneut nach dem DBI-02-Fix, damit beide Migrationen
> enthalten sind). Rein additive Änderung, verifiziert per `dotnet ef database update` gegen eine
> frische, isolierte lokale Testdatenbank (`DailyGourmet_MigrationTest`, danach gelöscht) — alle 10
> Migrationen wenden fehlerfrei an.

**Titel:** `DailyGourmet.sql` enthält die Migration `20260827054437_AddImgBbSupportAttachments` nicht

**Beschreibung:** Das Skript wird laut Vorgabe idempotent per `dotnet ef migrations script --idempotent`
erzeugt. Die letzte im Repo vorhandene Migration `20260827054437_AddImgBbSupportAttachments` (fügt
`SupportTicketAttachments.ExternalUrl`/`DeleteUrl` hinzu und macht `StorageKey` nullable) taucht im
Skript nirgends auf. Die Datei endet mit dem Eintrag für
`20260825125442_AddRecipeReductionFactorAndFullIngredientNutrition`.

**Beleg:** `Database/DailyGourmet.sql` Zeilen 2095–2112 (letzter Migrationsblock); vergleiche
`backend/Migrations/20260827054437_AddImgBbSupportAttachments.cs` (existiert, neueste Datei im Ordner).

**Auswirkung:** Wer die Datenbank aus diesem Skript neu aufsetzt (Onboarding, DR, Staging), bekommt ein
Schema ohne `ExternalUrl`/`DeleteUrl` auf `SupportTicketAttachments` und mit `StorageKey NOT NULL` — die
Anwendung (bereits gegen das neue Modell kompiliert) schlägt beim Schreiben/Lesen von Support-Anhängen
fehl.

**Reproduktion:** Migrationsordner chronologisch sortiert, geprüft, ob jede `MigrationId` als Block im
`.sql` vorkommt — die neueste Datei fehlt.

**Empfohlene Lösung:** Skript aus dem aktuellen Migrationsstand neu generieren
(`dotnet ef migrations script --idempotent`) und als CI-Gate absichern.

**Priorität:** P1 · **Aufwand:** S · **Risiko:** S
**Benötigte Tests:** Deploy gegen leere DB, danach `dotnet ef database update` sollte "up to date" melden.

---

### DBI-02 — `IngredientSupplierPrice.Price` ohne explizite Precision, keine EF-Konfiguration überhaupt

> **✅ Behoben 2026-08-29** (Unique-Constraint-Teil weiterhin offen, siehe Offene Frage 1).
> `IngredientSupplierPriceConfiguration` ergänzt (`HasPrecision(12,2)` für `Price`,
> `HasConversion<string>()` für `Unit`, `MaxLength` für die String-Felder, explizite FK-Delete-Behaviors).
> Migration `20260829213739_ConfigureIngredientSupplierPrice` erstellt — **manuell nachbearbeitet**,
> da die von `dotnet ef migrations add` generierte `Unit`-Spaltenkonvertierung (`int` → `nvarchar`)
> SQL Servers impliziten Zahl-zu-Text-Cast genutzt hätte (`0` → `"0"` statt `"g"`) und damit jede
> bestehende Zeile beim nächsten Lesen zum Absturz gebracht hätte. Stattdessen: neue Spalte anlegen,
> per `CASE`-Statement die Ordinalwerte auf die Enum-Namen abbilden, alte Spalte löschen, umbenennen
> (symmetrisch auch in `Down()`). Verifiziert: (1) volle Migrationskette gegen eine frische, isolierte
> LocalDB-Testdatenbank angewendet (0 Fehler), (2) die exakte `CASE`-Zuordnung isoliert per `sqlcmd`
> gegen eine Scratch-Tabelle mit allen 5 Ordinalwerten geprüft — Ergebnis stimmt exakt mit der
> Enum-Deklarationsreihenfolge überein. `DbSeeder.cs` legt aktuell keine `IngredientSupplierPrice`-
> Zeilen an, das Risiko war also zusätzlich gering, aber die Migration ist jetzt auch für einen
> künftig befüllten Bestand sicher.

**Titel:** Lieferantenpreis-Tabelle hat keine `IEntityTypeConfiguration`, `Price` läuft auf EF-Default

**Beschreibung:** Für `IngredientSupplierPrice` existiert — anders als für jede andere Geld-/
Mengen-Entität im Projekt — keine `IEntityTypeConfiguration`-Klasse. `Price` bekommt dadurch EF Cores
impliziten SQL-Server-Default `decimal(18,2)`, nicht durch bewusste `HasPrecision(...)`-Angabe.
Zusätzlich wird `Unit` hier als rohes `int` (Enum-Ordinal) gespeichert statt wie überall sonst per
`HasConversion<string>()` — ein Bruch mit dem projektweiten Muster.

**Beleg:** Keine Datei `backend/Data/Configurations/*IngredientSupplierPrice*`;
`backend/Migrations/20260823204916_...cs` Zeile 73: `Price = table.Column<decimal>(type: "decimal(18,2)")`;
Zeile 74: `Unit = table.Column<int>` (Gegenprobe: `RecipeIngredientConfiguration` nutzt
`HasConversion<string>()` für `Unit`).

**Auswirkung:** `decimal(18,2)` ist zufällig ausreichend, aber kein bewusstes Design. Ändert sich die
Enum-Reihenfolge von `Unit`, werden gespeicherte Werte in dieser Tabelle stillschweigend falsch
interpretiert. Zusätzlich fehlt jede Constraint (kein CHECK gegen negative Preise, keine
Unique-Constraint auf `(IngredientId, SupplierId)`).

**Empfohlene Lösung:** Neue `IngredientSupplierPriceConfiguration` ergänzen: `HasPrecision(12,2)`,
`HasConversion<string>()` für `Unit`, CHECK/`[Range]` gegen `Price <= 0`, ggf. Unique-Index
(abhängig von Offener Frage 1).

**Priorität:** P1 · **Aufwand:** S · **Risiko:** M (neue Migration; ggf. Datenbereinigung vorher nötig)
**Benötigte Tests:** Migrationstest auf Seed-Daten; Unit-Test gegen negativen/0-Preis; Regressionstest
für "günstigster Lieferant"-Auflösung.

---

### DBI-03 — Nahezu keine DB-seitigen CHECK-Constraints gegen negative/ungültige Werte

**Titel:** Außer `Portions >= 0` existiert im gesamten Schema kein einziger CHECK-Constraint

**Beschreibung:** Vollständige Suche über `Database/DailyGourmet.sql` nach `CHECK` liefert genau einen
Treffer: `CK_OrderItem_Portions CHECK ([Portions] >= 0)`. Für alle anderen geld-/mengenrelevanten
Spalten gibt es keinen DB-seitigen Schutz — insbesondere `Ingredient.ConversionFactor`: der
Implementierungsplan behauptet explizit, das sei "enforced by a CHECK constraint at the schema level
too" — das ist **nicht wahr**, Schutz existiert nur clientseitig als DTO-`[Range]`-Attribut.

**Beleg:** `grep -in "check" Database/DailyGourmet.sql` → einziger Treffer Zeile 766;
`BACKEND_IMPLEMENTATION_PLAN.md` Zeile 674 (falsche Behauptung); `backend/Handlers/IngredientHandler.cs`
Zeilen 55–90 (Create/Update ohne serverseitige Nachprüfung außerhalb der DTO-Annotation).

**Auswirkung:** Reines App-Layer-Vertrauen ist ein bekanntes Risiko bei wachsendem Endpoint-Katalog
(23 Controller) — ein übersehener Schreibpfad kann negative Preise/Mengen persistieren, die in
Umsatz-/Produktionsberechnungen einfließen.

**Empfohlene Lösung:** CHECK-Constraints ergänzen: `Ingredient.ConversionFactor > 0`,
`Ingredient.PurchasePrice >= 0`, `Facility.PortionPrice >= 0`, `RecipeIngredient.Quantity >= 0`,
`ProcurementListItem`-Mengenfelder `>= 0`. Plan-Dokumentation entsprechend korrigieren.

**Priorität:** P1 · **Aufwand:** M · **Risiko:** M (Migration kann bei Altdaten-Verstößen fehlschlagen)
**Benötigte Tests:** Negative Testfälle je Feld; Regressionstest bestehender Seed-/Testdaten vor Rollout.

---

### DBI-04 — Feature-Flag-Toggle pro Mandant ist komplett unauditierbar

**Titel:** `TenantFeatureFlag` hat weder Zeitstempel noch "wer" noch Grund; Handler schreibt nicht ins AuditLog

**Beschreibung:** `TenantFeatureFlag` erbt nicht von `BaseEntity` (keine `CreatedAt`/`UpdatedAt`/
`ChangedByUserId`). `FeatureFlagHandler.cs` (22 Zeilen) schreibt an keiner Stelle in `AuditLogs`, obwohl
der Implementierungsplan "feature-flag toggle" explizit als AuditLog-pflichtige Aktion listet.

**Beleg:** `backend/Models/Entities/Identity.cs` Zeilen 82–90; `backend/Handlers/FeatureFlagHandler.cs`
(vollständig gelesen, keine `AuditLogs.Add`); `BACKEND_IMPLEMENTATION_PLAN.md` Zeile 64.

**Auswirkung:** Keine Nachvollziehbarkeit, wer wann ein Feature für einen Mandanten aktiviert/deaktiviert
hat — relevant bei Support-Eskalationen und potenziell bei Abrechnungsfragen.

**Empfohlene Lösung:** `TenantFeatureFlag` um `ChangedByUserId`/`ChangedAt` erweitern, `FeatureFlagHandler`
soll beim Toggle einen `AuditLog`-Eintrag schreiben.

**Priorität:** P2 · **Aufwand:** S · **Risiko:** S
**Benötigte Tests:** Handler-Test: Toggle erzeugt erwarteten `AuditLog`-Eintrag.

---

### DBI-05 — Support-Session-Start/-Ende schreibt nicht ins zentrale AuditLog

**Titel:** `SupportSessionHandler` protokolliert nur in eigener Tabelle, nicht im `AuditLog`

**Beschreibung:** `SupportSession` selbst ist audit-fähig (`StartedByUserId`, Zeitstempel, `EndedReason`),
aber `SupportSessionHandler.cs` (95 Zeilen, vollständig gelesen) schreibt nirgends in `AuditLogs`. Nur
Requests *während* einer aktiven Impersonation werden über `ImpersonationAuditMiddleware` geloggt — der
Start/Ende-Vorgang selbst erscheint im zentralen `/api/audit-logs`-Feed nicht.

**Beleg:** `backend/Handlers/SupportSessionHandler.cs` Zeilen 13–33, 67–74; Gegenprobe
`backend/Middleware/ImpersonationAuditMiddleware.cs` Zeilen 25–36; `BACKEND_IMPLEMENTATION_PLAN.md`
Zeile 64/69.

**Auswirkung:** Lückenhafte Nachvollziehbarkeit für ein sicherheitsrelevantes Feature (Super-Admin erhält
Zugriff auf Mandantendaten) — siehe auch Security-Bericht zum Impersonations-Mechanismus.

**Empfohlene Lösung:** In `StartAsync`/`EndAsync`/`EndCurrentForCallerTenantAsync` je einen `AuditLog`-
Eintrag ergänzen.

**Priorität:** P2 · **Aufwand:** S · **Risiko:** S
**Benötigte Tests:** Handler-Test: Start/Ende erzeugt erwarteten `AuditLog`-Eintrag.

---

### DBI-06 — `ProductionAdjustment` dokumentiert als AuditLog-Schreiber, schreibt aber nur in eigene Tabelle

**Titel:** Produktionsanpassungen mit Grund landen nicht im zentralen AuditLog

**Beschreibung:** `ProductionAdjustment` selbst ist vollständig (OldQuantity, NewQuantity, Reason,
ChangedByUserId, ChangedAt) — fachlich unkritisch, Daten gehen nicht verloren. `ProductionPlanHandler.
AddAdjustmentAsync` schreibt aber nur in `db.ProductionAdjustments`, nicht zusätzlich in `db.AuditLogs`,
obwohl der Plan das vorsieht.

**Beleg:** `backend/Handlers/ProductionPlanHandler.cs` Zeile 72/80; `BACKEND_IMPLEMENTATION_PLAN.md`
Zeile 64.

**Auswirkung:** Gering — reine Doku-/Code-Inkonsistenz. Eine Suche im zentralen Audit-Log findet
Produktionskorrekturen nicht.

**Empfohlene Lösung:** Entweder Plan-Doku korrigieren (dedizierte Tabelle ist bewusst ausreichend) oder
zusätzlichen `AuditLog`-Eintrag ergänzen — Produktentscheidung, siehe Offene Frage 3.

**Priorität:** P3 · **Aufwand:** S · **Risiko:** S

---

### DBI-07 — Kein Unique-Constraint gegen doppelte Lieferantenpreis-Zeilen

**Titel:** `IngredientSupplierPrice` erlaubt beliebig viele widersprüchliche Preiszeilen pro (Ingredient, Supplier)

**Beschreibung:** Kein Unique-Index auf `(IngredientId, SupplierId)`, obwohl der Modellkommentar die
fachliche Absicht "ein aktueller Preis pro Lieferant, günstigster wird zur Laufzeit aufgelöst"
beschreibt — technisch nicht erzwungen.

**Beleg:** `backend/Migrations/20260823204916_...cs` Zeilen 96–104 (nur Non-Unique-Indizes einzeln);
`Database/DailyGourmet.sql` Zeilen 1739/1747.

**Auswirkung:** Datenpflege kann versehentlich neue Zeile statt Update erzeugen; veraltete Preise
bleiben unsichtbar liegen — Datenqualitätsrisiko für die Beschaffungsliste.

**Empfohlene Lösung:** Siehe Offene Frage 1 — abhängig von Produktentscheidung Preishistorie vs.
Einzelpreis.

**Priorität:** P2 · **Aufwand:** S–M · **Risiko:** M (Altdaten-Duplikate müssten vorher bereinigt werden)

---

### DBI-08 — `ConversionFactor`-Schutz existiert nur in einem von mehreren Schreibpfaden

**Titel:** Ingredient-Sync-Import defaultet ungültige `ConversionFactor`-Werte statt sie abzulehnen

**Beschreibung:** Manueller Create/Update-Pfad lehnt ungültige Werte per DTO-`[Range]` ab. Der
Sync-Import-Pfad setzt einen `ConversionFactor <= 0` dagegen still auf `1`
(`row.ConversionFactor <= 0 ? 1 : row.ConversionFactor`) statt den Datensatz zu melden/überspringen.

**Beleg:** `backend/Handlers/IngredientHandler.cs` Zeile 185 vs.
`backend/Models/DTOs/Ingredients/IngredientDtos.cs` Zeile 135.

**Auswirkung:** Ein fehlerhafter externer Datenfeed kann eine Zutat mit `ConversionFactor = 1` anlegen,
obwohl der reale Faktor unbekannt ist — verfälscht in der Folge alle Wareneinsatz-/
Beschaffungsberechnungen für diese Zutat, ohne sichtbaren Fehler.

**Empfohlene Lösung:** Sync-Import soll ungültige Werte markieren/überspringen statt still `1` zu setzen.

**Priorität:** P2 · **Aufwand:** S · **Risiko:** S
**Benötigte Tests:** Sync-Test mit `ConversionFactor = 0`/negativ, erwartet sichtbare Markierung.

---

## Positive Befunde (zur Vollständigkeit dokumentiert, kein Handlungsbedarf)

- **DBI-09 — FK-Kaskaden auf Bestell-/Finanzdaten sind korrekt restriktiv.** Alle FKs von Order,
  OrderItem, Facility, MealPlan, Recipe, Ingredient zu ihrem Tenant/Parent sind `NO ACTION`/`Restrict`.
  Einzige Cascade-Kette ist `Order → OrderItem` (korrekt, da OrderItem reine Kind-Zeilen sind). Kein
  Hard-Delete-Endpoint für Order/Facility/Tenant/User/Recipe existiert überhaupt.
- **DBI-11 — Kein generisches Soft-Delete-Flag, aber bewusst konsistent über domänenspezifische
  Statusfelder gelöst** (`Ingredient.Active`, `Facility.Status`, `User.Status`, `Tenant.Status`,
  `MealPlan.Status`) — deckt alle in `BACKEND_AUDIT.md` genannten Deaktivierungs-Features ab.
- **DBI-12 — Tenant-Scoping ist vollständig und mechanisch korrekt implementiert.** Jede
  mandantengebundene Entität trägt `TenantId` + FK; ein globaler EF-Core-Query-Filter
  (`DailyGourmetDbContext.OnModelCreating`, Zeilen 91–131) deckt auch Kind-Entitäten ohne eigenes
  `TenantId` über mehrstufige Navigation ab (z. B. `RouteStopItem` → `RouteStop` → `DeliveryRoute` →
  `TenantId`). Kein reines "jeder Handler filtert manuell"-Muster.
- **DBI-13 — Duplicate-Article-Number-Konflikt ist ein echter DB-Unique-Index**, nicht nur
  App-Code-Prüfung: `IX_Ingredients_TenantId_ArticleNumber` auf `(TenantId, ArticleNumber)` — bestätigt
  `BACKEND_AUDIT.md`s Behauptung eines "409 on duplicate".
- **DBI-10 — `RouteStop`/`RouteStopItem` cascaden von `DeliveryRoute`** ohne Statusschutz gegen bereits
  zugestellte Touren — aktuell kein akutes Risiko, da kein Route-Lösch-Endpoint existiert (P3, nur
  relevant falls ein solcher Endpoint je ergänzt wird).

## Offene Fragen

1. **IngredientSupplierPrice — Preishistorie oder Einzelpreis?** (betrifft DBI-07): Soll pro Lieferant
   nur ein aktueller Preis existieren (harte Unique-Constraint), oder ist eine Preishistorie über die
   Zeit gewollt (`EffectiveFrom`/`IsCurrent`-Felder nötig)? Ohne Produktentscheidung kann kein
   sinnvoller Constraint ergänzt werden.
2. **CHECK-Constraints auf Bestandsdaten:** Vor Rollout von DBI-03 muss geprüft werden, ob Seed-/
   Testdaten oder ein bereits befüllter DB-Stand Verstöße enthalten (z. B. `ConversionFactor = 0` aus
   altem Sync-Lauf, siehe DBI-08) — ohne Zugriff auf echte Produktionsdaten nicht abschließend zu
   beurteilen.
3. **Ist die zentrale `AuditLog`-Tabelle als vollständiger Audit-Trail gedacht, oder sind dedizierte
   Tabellen (`ProductionAdjustment`, `SupportSession`) als gleichwertiger Ersatz akzeptiert?** DBI-04/
   05/06 gehen von der im Plan formulierten Erwartung aus — falls das Produktteam dedizierte Tabellen
   bewusst als ausreichend ansieht, wäre nur die Doku, nicht der Code zu ändern.
4. **RouteStop/RouteStopItem-Kaskade (DBI-10):** Unklar, ob ein Lösch-Endpoint für Routen je geplant
   ist — falls nicht, ist der Punkt rein theoretisch.
5. **Cross-Check mit Controller-/Service-Code nötig** für alle Audit-Trail-Findings (DBI-04/05/06):
   Dieses Audit hat nur Handler-Dateien gezielt durchsucht; eine vollständige Verifikation aller
   Aufrufpfade ist Aufgabe eines Backend-Code-Reviews (siehe `03-backend-quality.md`).
