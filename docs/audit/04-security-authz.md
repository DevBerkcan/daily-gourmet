# Security & Autorisierung (Mandantentrennung, Impersonation, Secrets)

Geprüft: Backend `.NET`-API unter `backend/` (aktives Projekt: `DailyGourmet.Api.csproj`; der parallele
`backend/src/DailyGourmet.*`-Baum hat keine eigene `.csproj`/`Program.cs` und ist nicht Teil des
gebauten Projekts, siehe `01-phase2-runnable.md`) sowie Frontend unter `src/`. Rein statische
Code-Analyse, keine Live-Requests.

**Dies ist der Bereich mit den schwerwiegendsten Funden des gesamten Audits — drei P0-Befunde.**

---

## SEC-01 — Cross-Tenant-Datenleck: globaler Query-Filter für `User` gibt alle SUPER_ADMIN-Konten frei

> **✅ Behoben 2026-08-29.** `HasQueryFilter` in `backend/Data/DailyGourmetDbContext.cs` korrigiert
> (die `u.TenantId == null`-Klausel entfernt, matcht jetzt das Standardmuster aller anderen Entitäten).
> Regressionstests: `backend/tests/DailyGourmet.Api.IntegrationTests/UserManagementSecurityTests.cs`
> (`ListUsers_AsTenantAdmin_DoesNotIncludeSuperAdminAccounts`,
> `GetUserById_AsTenantAdmin_ForSuperAdminAccount_Returns404`) — beide zuvor am ungefixten Code
> reproduzierbar fehlgeschlagen, jetzt grün.

**Beschreibung:** `DailyGourmetDbContext` setzt für `User` (abweichend vom Standard-Muster
`IsSuperAdmin || TenantId == currentTenant` für alle anderen Entitäten) einen Filter, der zusätzlich
`u.TenantId == null` generell zulässt — unabhängig von der Rolle des aufrufenden Nutzers. Da
SUPER_ADMIN-Konten `TenantId = null` haben, matcht **jede** Query auf `Users`, durch jeden eingeloggten
Nutzer, auch alle Super-Admin-Zeilen.

**Beleg:** `backend/Data/DailyGourmetDbContext.cs:105-106`:
```csharp
modelBuilder.Entity<User>().HasQueryFilter(u =>
    _tenantContext.IsSuperAdmin || u.TenantId == null || u.TenantId == _tenantContext.TenantId);
```
`backend/Handlers/UserManagementHandler.cs:17-25` (`ListAsync`, kein zusätzliches Tenant-`Where`),
`:27-33` (`GetByIdAsync`, lädt per `Id` ohne Tenant-Check);
`backend/Repositories/Implementations/Repository.cs:16-17` (unterliegt demselben Filter).

**Auswirkung:** Jeder Tenant-Nutzer mit Zugriff auf `GET /api/users` (`TENANT_OWNER`, `TENANT_ADMIN`,
`FACILITY_ADMIN`, `FACILITY_USER` laut `UsersController.cs:16`) sieht Name, E-Mail, Rolle, Status,
`LastLoginAt`, `FailedLoginCount` **aller** Super-Admin-Konten der gesamten Plattform — ein
plattformweites Datenleck über Mandantengrenzen hinweg, das zugleich Aufklärung für gezielte Angriffe
auf die Plattform-Administration liefert. In Kombination mit SEC-02 lässt sich daraus eine
Kompromittierung von Super-Admin-Konten ableiten.

**Reproduktion:** Ein `TENANT_ADMIN`-Konto ruft `GET /api/users` auf; der `PagedResult<UserDto>`
enthält alle Zeilen mit `TenantId == null`, da `ListAsync` sich vollständig auf den fehlerhaften
globalen Filter verlässt. `GET /api/users/{superAdminId}` liefert dieselbe Zeile zurück. Durch
Code-Lesen bestätigt, nicht live getestet — der Mechanismus lässt keine andere Deutung zu.

**Empfohlene Lösung:** Filter korrigieren, sodass `TenantId == null` nur zusammen mit `IsSuperAdmin`
gilt; die Sonderbehandlung „eigene Zeile trotz `TenantId==null` sichtbar" (für `/auth/me`) gezielt per
`IgnoreQueryFilters()` statt globaler Aufweichung lösen. Zusätzlich defensiv ein explizites
`Where(u => u.TenantId == tenantContext.TenantId)` in `UserManagementHandler` ergänzen.

**Priorität:** P0 · **Aufwand:** S
**Risiko der Änderung:** M (betrifft alle `User`-Zugriffe inkl. Login/`/auth/me` — sorgfältig mit
Regressionstests für Super-Admin-Login und Impersonation prüfen)
**Benötigte Tests:** Integrationstest: `TENANT_ADMIN` ruft `GET /api/users`/`GET /api/users/{id}` mit
bekannter Super-Admin-`Id` auf → erwartet 404/leere Liste. Regressionstest: Super-Admin-Login und
`/auth/me` funktionieren weiterhin.

---

## SEC-02 — Vertikale Rechteausweitung: Tenant-Admin kann Rolle auf SUPER_ADMIN setzen

> **✅ Behoben 2026-08-29.** `UserManagementHandler.InviteAsync`/`UpdateAsync` weisen `SUPER_ADMIN`
> als Zielrolle jetzt explizit per `ForbiddenException` zurück (Entscheidung: kein direkter
> SUPER_ADMIN-Zugriff außerhalb der Mandanten-Verwaltung, siehe `07-open-questions.md #8`).
> Regressionstests in `UserManagementSecurityTests.cs`
> (`UpdateUser_AsTenantAdmin_SettingRoleToSuperAdmin_IsRejected`,
> `InviteUser_AsTenantAdmin_WithSuperAdminRole_IsRejected`) plus ein Positivtest, dass legitime
> Rollenwechsel innerhalb des Mandanten weiterhin funktionieren
> (`UpdateUser_AsTenantAdmin_SettingLegitimateTenantRole_StillSucceeds`) — alle drei am ungefixten
> Code verifiziert (die ersten beiden schlugen fehl, der Positivtest war bereits grün).

**Beschreibung:** `PUT /api/users/{id}` ist für `TENANT_OWNER, TENANT_ADMIN, FACILITY_ADMIN`
freigegeben. Für `FACILITY_ADMIN` wird eine Rollenänderung verboten, für `TENANT_OWNER`/`TENANT_ADMIN`
(der `else`-Zweig) wird der clientseitig übergebene `dto.Role`-String ungeprüft per
`Enum.TryParse<Role>` übernommen. `Role` enthält `SUPER_ADMIN` als validen Wert. Keine Prüfung, dass
die Zielrolle „kleiner/gleich" der eigenen sein muss; keine Sperre gegen `SUPER_ADMIN`. Dasselbe
Problem in `InviteAsync` (`POST /api/users`).

**Beleg:** `backend/Handlers/UserManagementHandler.cs:59-72`:
```csharp
else
{
    if (dto.Role is not null && Enum.TryParse<Role>(dto.Role, out var role)) user.Role = role;
    if (dto.FacilityId is not null) user.FacilityId = dto.FacilityId;
}
```
`:35-44` (`InviteAsync`, nur `FACILITY_ADMIN` wird auf `FACILITY_USER` gezwungen);
`backend/Models/Enums/Enums.cs:3-11` (`SUPER_ADMIN` erster Enum-Wert);
`backend/Authentication/ITenantContext.cs:39` (`IsSuperAdmin` wertet nur den JWT-Rollenclaim aus).

**Auswirkung:** Ein `TENANT_ADMIN`/`TENANT_OWNER` kann sich selbst (oder jeden Nutzer im eigenen
Mandanten) per `PUT /api/users/{eigeneId}` mit `{"role": "SUPER_ADMIN"}` zum Super-Admin machen. Nach
erneutem Login (neues JWT mit `role=SUPER_ADMIN`) greift `TenantContext.IsSuperAdmin = true`
**plattformweit** — der globale Tenant-Query-Filter wird für **alle** Entitäten umgangen, und
`[Authorize(Roles = "SUPER_ADMIN")]`-geschützte Controller (`SuperAdminController`,
`SupportSessionsController` inkl. Impersonation!) werden zugänglich. Vollständige Kompromittierung der
Mandantentrennung durch einen reinen Tenant-Nutzer.

**Reproduktion:** `TENANT_ADMIN` meldet sich an, ruft `PUT /api/users/{ownUserId}` mit
`{"name":"X","role":"SUPER_ADMIN"}` auf (erlaubt laut `[Authorize(Roles =
"TENANT_OWNER,TENANT_ADMIN,FACILITY_ADMIN")]` in `UsersController.cs:30-33`). Der `else`-Zweig greift,
`Enum.TryParse<Role>("SUPER_ADMIN", ...)` gelingt, `user.Role` wird persistiert. Nächster Login liefert
JWT mit `role=SUPER_ADMIN`. Durch Code-Lesen eindeutig nachvollzogen, nicht live getestet.

**Empfohlene Lösung:** Allow-List zulässiger Zielrollen je aufrufender Rolle einführen
(`TENANT_OWNER`/`TENANT_ADMIN` dürfen nur `TENANT_ADMIN, FACILITY_ADMIN, FACILITY_USER, READ_ONLY,
DRIVER` vergeben, nie `SUPER_ADMIN`). Zusätzlich Selbst-Höherstufung verhindern. Zentral (z. B.
`RoleAssignmentPolicy`) für `InviteAsync` und `UpdateAsync` gemeinsam durchsetzen.

**Priorität:** P0 · **Aufwand:** S · **Risiko der Änderung:** S (zusätzliche Validierung, keine
Breaking Changes für legitime Abläufe)
**Benötigte Tests:** `TENANT_ADMIN` versucht `role: "SUPER_ADMIN"` bei Update/Invite → erwartet
400/403. Regressionstest: legitime Rollenwechsel (`FACILITY_USER` → `FACILITY_ADMIN`) funktionieren
weiterhin.

---

## SEC-03 — Produktive Zugangsdaten im Git-Repository

> **⚠️ Teilweise behoben 2026-08-29.** `backend/appsettings.json` enthält keine Klartext-Secrets mehr
> (leere Platzhalter, siehe README.md Abschnitt 6.6 für den neuen Sicherheitshinweis). `Program.cs`
> verweigert jetzt den Start ohne gültiges `Jwt:Secret` (siehe BEQ-05). **Weiterhin offen und nur vom
> Nutzer durchführbar:** die eigentliche Rotation der vier Zugangsdaten beim jeweiligen Anbieter
> (MonsterASP/databaseasp.net-Connection-String, JWT-Secret, netcup-SMTP-Passwort, ImgBB-Key) sowie
> die Bereinigung der Git-Historie — beides erfordert Zugriff auf externe Hosting-/Provider-Panels und
> ggf. einen koordinierten Force-Push, den ich nicht eigenmächtig durchführe.

**Beschreibung:** `backend/appsettings.json` ist als reguläre Datei im Git-Repository versioniert
(bestätigt: kein Eintrag in `.gitignore` außer für `appsettings.*.local.json`) und enthält
produktionsartige Zugangsdaten im Klartext.

**Beleg:**
- Connection String mit eingebetteten Zugangsdaten: `backend/appsettings.json:3`
- JWT-Signaturschlüssel: `backend/appsettings.json:6`
- SMTP-Zugangsdaten: `backend/appsettings.json:15`
- Externer API-Key (ImgBB): `backend/appsettings.json:26`
- Datei ist laut Git-Historie seit dem Commit "Add new backend" durchgängig enthalten — bleibt auch bei
  nachträglicher Entfernung aus dem aktuellen Stand in der Historie erhalten.

**Auswirkung:** Jeder mit Lesezugriff auf das Repository (jetzt oder historisch) kann sich direkt mit
der Produktionsdatenbank verbinden, gültige JWTs für beliebige Nutzer/Rollen selbst signieren (das
JWT-Secret erlaubt Erstellung beliebiger Tokens inkl. SUPER_ADMIN+Impersonation — unabhängig von
SEC-01/SEC-02), E-Mails über den SMTP-Account versenden (Phishing/Spoofing im Firmennamen) und das
ImgBB-Konto missbrauchen.

**Reproduktion:** Direkt durch Lesen der Datei bestätigt (Werte werden hier bewusst nicht wiederholt).
Kein Verdacht — vollständig verifiziert.

**Empfohlene Lösung:** Sofort: DB-Passwort, JWT-Secret, SMTP-Passwort, ImgBB-Key rotieren (bestehende
JWTs werden dadurch ungültig — gewünscht). Secrets aus der Git-Historie entfernen (`git filter-repo`
o. ä.) und danach ausschließlich über User-Secrets (lokal, `UserSecretsId` existiert bereits im
`.csproj`), Umgebungsvariablen oder Secret-Store in Produktion beziehen. `appsettings.json` im Repo
nur mit Platzhaltern führen.

**Priorität:** P0 · **Aufwand:** M (Rotation + Historie bereinigen + Deployment-Pipeline umstellen)
**Risiko der Änderung:** M (Rotation erfordert koordinierten Deployment-Schritt; Historie-Rewrite
erfordert Force-Push und Koordination)
**Benötigte Tests:** Verifikation, dass alte Secrets nach Rotation nicht mehr funktionieren;
Deployment-Smoke-Test mit neuen Werten.

---

## SEC-04 — Impersonation-Audit erfasst nur schreibende Requests, keine Lesezugriffe

> **✅ Behoben 2026-08-29.** `ImpersonationAuditMiddleware` protokolliert jetzt auch GET/HEAD-Requests
> während einer aktiven Impersonation — aber dedupliziert pro Sitzung nach `Entity`/`EntityId`/`Action`,
> damit wiederholtes Neuladen/Polling nicht die Tabelle flutet (jeder distinkte Pfad wird einmal pro
> Sitzung geloggt, nicht pro Request). Sitzungsstart/-ende sind bereits über DBI-05 abgedeckt.
> Test: `ImpersonationAuditTests.RepeatedGetDuringImpersonation_IsLoggedOnceNotOncePerRequest` — 3
> identische GET-Requests erzeugen genau 1 Audit-Log-Eintrag; am ungefixten Code verifiziert
> fehlgeschlagen (0 statt 1, da GETs komplett ignoriert wurden).

**Beschreibung:** `ImpersonationAuditMiddleware` schreibt einen `AuditLog`-Eintrag nur bei
Nicht-GET/HEAD-Requests. Während einer aktiven Impersonation können beliebig viele lesende Endpunkte
(Bestellungen, Rezepte, Nutzerlisten, Standortdaten) aufgerufen werden, ohne dass dies im Audit-Trail
erscheint.

**Beleg:** `backend/Middleware/ImpersonationAuditMiddleware.cs:17-19`:
```csharp
var shouldAudit = tenantContext.IsImpersonation
    && !HttpMethods.IsGet(context.Request.Method)
    && !HttpMethods.IsHead(context.Request.Method);
```

**Auswirkung:** Bei internem Missbrauch (neugieriger/kompromittierter Support-Mitarbeiter) lässt sich
nicht rekonstruieren, welche Mandantendaten während einer Impersonation eingesehen wurden — nur welche
geändert wurden. Für ein DSGVO-relevantes Multi-Tenant-System eine Nachvollziehbarkeitslücke.

**Empfohlene Lösung:** Mindestens Sitzungsstart/-ende sowie eine aggregierte Zusammenfassung
aufgerufener Ressourcen/Entitäten pro Sitzung auch für GET-Requests protokollieren, ohne die
Log-Tabelle mit jeder Einzelanfrage zu fluten.

**Priorität:** P2 · **Aufwand:** M · **Risiko:** S

---

## SEC-05 — Impersonation-Sichtbarkeit für den Mandanten standardmäßig deaktiviert

**Beschreibung:** Das Feature-Flag `impersonation-audit-visible-to-tenant` (Seed-Default `false`)
steuert, ob der Mandant Impersonation-Einträge im eigenen Audit-Log sieht. `AuditLogHandler` filtert
`Entity == "Impersonation"` für den Mandanten heraus, solange das Flag inaktiv ist.

**Beleg:** `backend/Data/DbSeeder.cs:45`; `backend/Handlers/AuditLogHandler.cs:15-19`.

**Auswirkung:** Kein technischer Bypass, aber Transparenz-/Vertrauenslücke — ein Mandant hat
standardmäßig keine nachträgliche Einsicht, dass/wann ein Super-Admin unter seiner Identität agiert
hat, trotz Live-Anzeige im Frontend-Banner während der aktiven Sitzung.

**Empfohlene Lösung:** Abwägen, ob dieses Flag standardmäßig `true` sein sollte (Transparenz als
Default), oder vertraglich klarstellen, dass Mandanten dies aktiv einfordern müssen.

**Priorität:** P3 · **Aufwand:** S · **Risiko:** S

---

## SEC-06 — Frontend: Impersonation-Token überschreibt den globalen `localStorage`-Slot browserweit

**Beschreibung:** `setToken`/`startImpersonation` schreiben in den gemeinsamen Schlüssel `dg_token`.
`localStorage` ist pro Origin global über alle Tabs geteilt. Startet ein Super-Admin in Tab A eine
Impersonation, schaltet sich der aktive Token in **allen** Tabs derselben Browser-Session sofort um —
Requests aus Tab B laufen dann unbemerkt mit der Identität des impersonierten Mandanten (oder
umgekehrt bei Sitzungsende).

**Beleg:** `src/lib/auth/token-storage.ts:4-5` (`TOKEN_KEY`/`REAL_TOKEN_KEY`, kein Tab-Scoping),
`:26-31` (`startImpersonation` überschreibt global).

**Auswirkung:** Kein direkter Autorisierungs-Bypass (Backend erzwingt weiterhin serverseitig die
tatsächlichen Rollen des aktiven Tokens), aber reales Verwirrungs-/Fehlbedienungsrisiko: ein Admin
könnte in einem vermeintlich normalen Tab versehentlich als impersonierter Mandant handeln (oder
umgekehrt) — Integritätsrisiko durch Identitätsverwechslung bei sensiblen Aktionen.

**Empfohlene Lösung:** `storage`-Event abhören und andere Tabs warnen/aktualisieren, oder mittelfristig
auf `sessionStorage` (pro Tab) für den aktiven Token umstellen.

**Priorität:** P2 · **Aufwand:** M · **Risiko der Änderung:** M (grundlegende Änderung der
Token-Storage-Strategie, hoher Regressionsbedarf)

---

## SEC-07 — Fehlende Content-Security-Policy als Mitigation für JWT in `localStorage`

> **✅ Behoben 2026-08-29, mit wichtigem Nebeneffekt.** `src/middleware.ts` (neu) setzt eine
> Nonce-basierte CSP (`script-src 'self' 'nonce-…' 'strict-dynamic'`, kein `unsafe-inline`/
> `unsafe-eval` in Produktion) plus `X-Content-Type-Options`, `X-Frame-Options: DENY`,
> `Referrer-Policy`. `src/app/layout.tsx` liest den Nonce jetzt über `headers()` — das ist laut
> Next.js-Dokumentation zwingend nötig, damit Next die Nonce automatisch an seine eigenen
> Framework-Skripte anhängt.
>
> **Wichtiger Nebeneffekt:** Next.js erzwingt bei Nonce-basierter CSP **vollständig dynamisches
> Rendering für die gesamte Anwendung** — statische Optimierung/ISR sind damit systembedingt
> deaktiviert (alle 34 Routen liefen vorher gemischt statisch/dynamisch, jetzt durchgängig `ƒ
> Dynamic`). Das ist eine bewusste Next.js-Design-Entscheidung (nonces ergeben bei statisch zur
> Build-Zeit generiertem HTML keinen Sinn), kein Implementierungsfehler — aber ein echter
> Performance-/Hosting-Kosten-Trade-off, den der Fund selbst als "Risiko der Änderung: M" erwartet
> hatte. Für eine intern genutzte B2B-Verwaltungsanwendung (kein hoher öffentlicher Traffic) als
> vertretbar eingeschätzt; sollte sich das ändern, wäre die im selben Next.js-Leitfaden erwähnte
> experimentelle Subresource-Integrity-Variante (`experimental.sri`) eine Alternative, die
> statisches Rendering erhält.
>
> **Verifiziert per echtem Browser** (nicht nur Server-Response, da CSP-Verletzungen nur im Browser
> sichtbar werden): `npm run build && npm start` sowie separat `npm run dev`, jeweils mit Headless
> Chrome (`--headless=new --dump-dom --enable-logging=stderr`) gegen `/` und `/login` geprüft — 0
> CSP-Verletzungen, 0 JS-Fehler, Seiteninhalt rendert korrekt. Zwei frühere Fehlversuche dabei
> aufgedeckt und behoben: (1) ohne den `headers()`-Aufruf in `layout.tsx` blockierte die CSP
> sämtliche Next.js-eigenen Skript-Chunks und Inline-Hydration-Skripte — die App wäre komplett
> funktionsunfähig gewesen; (2) ein zwischenzeitlicher Fehlschlag stellte sich als Test gegen einen
> noch laufenden alten Server-Prozess heraus, nicht als echtes CSP-Problem. Beide Server-Prozesse
> nach den Tests sauber beendet.

**Beschreibung:** JWT wird bewusst (dokumentierter Trade-off) in `localStorage` statt einem
`HttpOnly`-Cookie gespeichert. Es existiert weder in `next.config.ts` noch anderswo eine CSP oder
vergleichbare Kopfzeile, die eine XSS-Injektion am Auslesen des Tokens hindern würde.

**Beleg:** `src/lib/auth/token-storage.ts:1-3` (Kommentar bestätigt Design-Entscheidung); Grep über das
Repository nach `Content-Security-Policy`/`headers()` in `next.config.ts` → kein Treffer.

**Auswirkung:** Eine künftige XSS-Lücke (Rich-Text-Anzeige, Drittanbieter-Skript, verwundbare
Abhängigkeit) könnte das aktive Token — ggf. inkl. eines Impersonation-Tokens mit Rechten über einen
fremden Mandanten — vollständig abgreifen und für externe Requests missbrauchen.
*Kein konkreter XSS-Vektor gefunden — Bewertung des fehlenden Tiefenschutzes, nicht Nachweis einer
aktiven Lücke.*

**Empfohlene Lösung:** Restriktive CSP (`script-src 'self'`, kein `unsafe-inline`/`unsafe-eval`,
begrenzte `connect-src`) über Next.js-`headers()` einführen. Mittelfristig `HttpOnly`-Cookie-Ansatz
(mit CSRF-Schutz) als Grundarchitektur prüfen.

**Priorität:** P2 · **Aufwand:** M · **Risiko der Änderung:** M (CSP kann bestehende
Inline-Skripte/Drittanbieter-Einbindungen brechen)

---

## SEC-08 — Öffentlicher Freigabe-Link (Procurement-Approval): nicht-zeitkonstanter Token-Vergleich

**Beschreibung:** Der `[AllowAnonymous]`-Endpunkt `POST /api/procurement-lists/{id}/approve?token=...`
ist bewusst und gut dokumentiert (192-Bit-Token, 48h-Gültigkeit, Single-Use). Der Tokenvergleich
erfolgt aber über den normalen `!=`-Operator, keine zeitkonstante Vergleichsfunktion.

**Beleg:** `backend/Handlers/ProcurementListHandler.cs:163`
(`list.ApprovalToken != token`); Token-Erzeugung `:138` (`RandomNumberGenerator.GetBytes(24)`).

**Auswirkung:** Theoretisches Timing-Angriffsrisiko, praktisch sehr gering (192 Bit Entropie schließt
Brute-Force aus, Netzwerk-Jitter erschwert Timing-Seitenkanal über HTTP stark, zusätzlich 48h-Ablauf
und Single-Use).

**Empfohlene Lösung:** `CryptographicOperations.FixedTimeEquals` statt `!=` verwenden.

**Priorität:** P3 · **Aufwand:** S · **Risiko:** S

---

## SEC-09 — Login: kein IP-Rate-Limiting, leichtes Timing-Enumeration-Risiko

**Beschreibung:** Es existiert ein Pro-Konto-Lockout (5 Fehlversuche/15 Min.), aber keine IP-basierte
Drosselung — ein Angreifer kann viele E-Mail-Adressen parallel mit niedriger Rate pro Konto
durchprobieren, ohne eine Kontosperre auszulösen. Zusätzlich wird bei nicht-existierender E-Mail sofort
abgebrochen (keine Passwort-Hash-Berechnung), während bei existierender E-Mail zusätzlich
`VerifyHashedPassword` durchläuft — ein messbarer Timing-Unterschied zur Konto-Existenz-Feststellung.

**Beleg:** `backend/Handlers/AuthHandler.cs:22-23` (Lockout-Konstanten), `:27-28` (sofortiger Abbruch
ohne Hash), `:36-44` (Hash-Vergleich nur im "E-Mail existiert"-Pfad); kein
`AddRateLimiter`/`UseRateLimiter` in `Program.cs` gefunden.

**Auswirkung:** Begrenzt — Kontosperre verhindert Brute-Force auf ein bekanntes Konto zuverlässig;
verbleibendes Risiko ist verteiltes Password-Spraying sowie theoretische Nutzer-Enumeration über
Timing. *Nicht praktisch gemessen.*

**Empfohlene Lösung:** ASP.NET Core Rate Limiting Middleware für `/api/auth/login` (Sliding-Window pro
IP) ergänzen; optional Dummy-Hash-Berechnung auch im "E-Mail nicht gefunden"-Pfad zur
Timing-Nivellierung.

**Priorität:** P3 · **Aufwand:** S–M · **Risiko:** S

---

## Positive Befunde (geprüft, kein Handlungsbedarf)

- **Tenant-Isolation via EF-Core Global Query Filter** ist für alle regulären `ITenantScoped`-Entitäten
  (Orders, Recipes, Facilities, MealPlans, ProcurementLists, Routes, SupportTickets etc.) konsistent
  und robust implementiert — Cross-Tenant-IDOR über ID-Manipulation ist für diese Entitäten serverseitig
  ausgeschlossen. Stichproben in Orders-, Facilities-, Recipes-, Ingredients-, MealPlans-, Routes-
  (inkl. fahrer-eigener `DriverId`-Prüfung) und Support-Controllern/Handlern bestätigen das. Die
  Ausnahme ist ausschließlich `User` (siehe SEC-01).
- **Facility-Ebene** wird — mangels eigenem Query-Filter — konsequent manuell in den Handlern geprüft
  (`OrderHandler.EnsureFacilityAccess`, `FacilityHandler`, `FacilityClosureHandler`,
  `UserManagementHandler`), an allen gesichteten Stellen korrekt.
- **Impersonation-Mechanismus im Kern gut konstruiert**: serverseitig fest auf 60 Minuten begrenzt
  (nicht clientseitig veränderbar), Rolle im Impersonation-Token hart auf `TENANT_ADMIN` reduziert
  (kein direkter `SUPER_ADMIN`-Zugriff über das Token selbst — vorbehaltlich SEC-02, das einen
  unabhängigen Weg zu echtem `SUPER_ADMIN` öffnet), Session-Beendigung wird bei jedem Request
  server-seitig re-validiert (nicht nur über JWT-`exp`), Selbstbeendigung durch den Mandanten möglich,
  mutierende Aktionen werden automatisch auditiert. Frontend stellt zuverlässigen Rückweg zur
  ursprünglichen Identität sicher (auch bei fehlgeschlagenem "Beenden" oder abgelaufener Session).
  Einschränkungen: siehe SEC-04–SEC-06.
- **CORS** ist sauber konfiguriert: explizite Origin-Liste in Produktion, `AllowCredentials()` nur mit
  expliziten Origins kombiniert; fehlende Konfiguration schließt in Produktion sicher
  (`SetIsOriginAllowed(_ => false)`), statt offen zu bleiben.
- **Mass Assignment**: Keine der gesichteten Create/Update-DTOs exponiert ein client-setzbares
  `TenantId`-Feld; `TenantId` wird serverseitig immer aus `tenantContext` gesetzt.

---

## Zusammenfassung nach Priorität

| ID | Titel | Priorität |
|---|---|---|
| SEC-01 | Globaler `User`-Filter leakt alle SUPER_ADMIN-Konten an Tenant-Nutzer | **P0** |
| SEC-02 | Tenant-Admin kann sich zu SUPER_ADMIN eskalieren | **P0** |
| SEC-03 | Produktions-Secrets im Git-Repository | **P0** |
| SEC-04 | Impersonation-Audit erfasst keine Lesezugriffe | P2 |
| SEC-06 | Cross-Tab-Token-Überschreibung bei Impersonation | P2 |
| SEC-07 | Keine CSP als XSS-Tiefenschutz für localStorage-Token | P2 |
| SEC-05 | Impersonation-Sichtbarkeit für Mandant per Default aus | P3 |
| SEC-08 | Nicht-zeitkonstanter Token-Vergleich (Procurement-Approval) | P3 |
| SEC-09 | Kein IP-Rate-Limiting auf Login | P3 |

**Dringendste Empfehlung:** SEC-01, SEC-02 und SEC-03 unverzüglich beheben — SEC-02 ist ein trivial
ausnutzbarer, vollständiger Bruch der Mandantentrennung durch jeden regulären Tenant-Admin-Account.
