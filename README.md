# Daily Gourmet — Catering-Management-Plattform

Mandantenfähige SaaS-Plattform für Catering-Unternehmen, Großküchen, Schulen und Einrichtungen.
Plattformbetreiber: **Gentle Group** · Beispiel-Mandant: **Daily Gourmet**

> **Aktueller Stand: Phase 2 — Backend fertiggestellt, Frontend-Anbindung läuft.**
> Das C#-Backend (`DailyGourmet.Api`, ASP.NET Core 10 + EF Core + SQL Server) ist vollständig
> implementiert, migriert und mit Beispieldaten befüllt (`Data/DbSeeder.cs`). Login, Routenschutz
> und die Einrichtungsverwaltung sind bereits an die echte API angebunden; alle übrigen Bereiche
> laufen noch mit den ursprünglichen Dummy-Daten aus Phase 1. Genauer Stand je Feature:
> **`BACKEND_AUDIT.md`**. Architektur/Entitäten/Endpunkte: **`BACKEND_IMPLEMENTATION_PLAN.md`**.

---

## 1. Schnellstart (Frontend)

Voraussetzungen: Node.js ≥ 20

```bash
npm install
npm run dev        # http://localhost:3000
```

Produktion:

```bash
npm run build
npm start
```

Auf der Login-Seite (`/login`) gibt es **Demo-Einstiege** für alle vier Bereiche:

| Bereich | Rolle | Route |
|---|---|---|
| Plattformverwaltung | SUPER_ADMIN (Gentle Group) | `/super-admin/dashboard` |
| Mandanten-Verwaltung | TENANT_OWNER (Daily Gourmet) | `/admin/dashboard` |
| Küche | KITCHEN_MANAGER | `/kitchen` |
| Fahrer | DRIVER | `/driver` |
| Kundenportal | FACILITY_ADMIN (Musterschule Nord) | `/portal/dashboard` |

Für eine echte Anmeldung muss `DailyGourmet.Api` laufen (Abschnitt 6) und
`NEXT_PUBLIC_API_BASE_URL` in `.env.local` darauf zeigen (Default: `http://localhost:5080/api`,
siehe `.env.example`). Test-Zugänge: Abschnitt 6.4.

## 2. Tech-Stack (Frontend)

- **Next.js 15** (App Router) + **TypeScript** (strict)
- **Tailwind CSS 4** mit zentralem Token-System (`src/app/globals.css`)
- **lucide-react** Icons
- Deutsche Oberfläche, responsive (Desktop-Sidebar + Mobile-Drawer), Druckansichten via `no-print`, `prefers-reduced-motion` beachtet
- **TanStack Query** für Server-State (`src/lib/services/*.ts`) + eigener `fetch`-Client (`src/lib/api/client.ts`) gegen `DailyGourmet.Api`
- Auth: JWT (Bearer, `localStorage`), React-Context (`src/lib/auth/AuthContext.tsx`), rollenbasierter Routenschutz (`src/lib/auth/RequireRole.tsx`)

## 3. Projektstruktur

```
src/
  app/
    login/                Anmeldung + Demo-Einstiege
    super-admin/          Plattform: Dashboard, Mandanten (+Detail), Benutzer, System, Audit, Feature-Flags
    admin/                Mandant:  Dashboard, Speisepläne (+Detail), Rezepte (+Detail & Hochrechnung),
                          Zutaten, Produktion (+Tagesansicht), Einkauf, Einrichtungen, Standorte,
                          Benutzer, Unternehmen, Einstellungen
    kitchen/              Küche: heutige Produktion, Statuspflege
    portal/               Einrichtungen: Dashboard, Speiseplan mit Portionseingabe, Bestellungen, Profil
  components/
    shell/AppShell.tsx    Sidebar, Topbar, Mobile-Navigation (bereichsabhängig eingefärbt)
    ui/index.tsx          StatusBadge, Card, Table, StatCard, Button, EmptyState, …
  lib/
    types.ts              Domain-Typen — entsprechen 1:1 den Backend-DTOs
    data/index.ts         Verbleibende Dummy-Daten (Phase-1-Rest, siehe BACKEND_AUDIT.md)
    api/client.ts         Zentraler fetch-Wrapper gegen DailyGourmet.Api
    auth/                 AuthContext, RequireRole (Routenschutz), Token-Speicherung
    services/              TanStack-Query-Hooks je Feature (ersetzen data.ts/store.ts schrittweise)
docs/
  ARCHITECTURE.md          Frontend-Architektur (Ordnerstruktur, Konventionen)
  backend-architektur.md   Historisch — durch BACKEND_IMPLEMENTATION_PLAN.md ersetzt
  api-endpunkte.md         Historisch — durch BACKEND_IMPLEMENTATION_PLAN.md ersetzt
DailyGourmet.Api/          ASP.NET Core 10 Backend (siehe Abschnitt 6)
Database/DailyGourmet.sql  SQL-Deploymentskript (idempotent)
BACKEND_IMPLEMENTATION_PLAN.md  Entitäten, Endpunkte, Business-Regeln
BACKEND_AUDIT.md                Feature-für-Feature-Status (Backend/Frontend)
```

## 4. Design-System

Basiert auf dem offiziellen Branding (`Catering_Firma_Branding` / `tokens.json`):

| Token | Wert | Branding-Quelle |
|---|---|---|
| `paper` | `#F6F7F9` | surfaceTint (Seitenhintergrund) |
| `surface` | `#FFFFFF` | Karten, Tabellen |
| `ink` / `muted` | `#1E2937` / `#667085` | textPrimary / textSecondary |
| `line` | `#E3E7ED` | border |
| `basil` / `basil-deep` / `basil-soft` | `#1B5FA0` / `#1B3350` / `#EAF3FB` | primary (Brand-Blau) |
| `saffron` / `saffron-soft` | `#E12B76` / `#FCE9F0` | accentMagenta |
| `ok` | `#2FAE94` | accentTeal / success |
| `warn` / `danger` / `info` | `#E2A93B` / `#D6455A` / `#5AA3E0` | warning / danger / primary (dark) |

Schriften laut Branding: **Outfit** (Display, 500–800) + **Work Sans** (UI, 400–700), Basisgröße 15 px, Kartenradius 14 px.
Logo: `public/logo-daily-gourmet.png` (Sidebar + Login).
Hinweis: Die Token-*Namen* (`basil`, `saffron`, …) stammen aus dem ersten Entwurf und wurden aus
Stabilitätsgründen beibehalten — nur die *Werte* wurden auf das Branding umgestellt.
Dark Mode ist im Branding definiert (`tokens.json → colors.dark`) und kann als nächster Schritt ergänzt werden.

## 5. Fachliche Besonderheiten (bereits im Frontend abgebildet)

- **Mandantentrennung** sichtbar vorbereitet (Super-Admin sieht Mandanten, Tenant sieht nur eigene Daten) — die harte Durchsetzung erfolgt serverseitig (Phase 2).
- **Rezept-Hochrechnung**: interaktiv auf der Rezeptdetailseite (Zielportionen → Faktor → skalierte Mengen). Verbindliche Berechnung in Phase 2 mit `decimal` im Backend.
- **Produktionsmengen**: getrennte Anzeige von *bestellter Menge*, *Zusatzmenge (mit Begründung)* und *finaler Produktionsmenge*.
- **Bestellfristen**: gesperrte Vergangenheitstage im Portal; Korrektur nach Frist nur durch Tenant Owner/Admin mit Begründung (→ Audit-Log).
- **Nährwerte über Lebensmittel-API**: Zutaten tragen Nährwerte je 100 g/ml inkl. Quelle (Open Food Facts / USDA). Der Live-Abruf läuft in Phase 2 über das Backend (siehe `docs/backend-architektur.md`, Abschnitt 7).
- **Snapshots**: veröffentlichte Speisepläne frieren Rezeptversionen ein (Datenmodell in Phase 2).

## 6. Backend (`DailyGourmet.Api`)

ASP.NET Core 10 Web API, Entity Framework Core, SQL Server. Einzelnes Projekt (keine
Clean-Architecture-Aufteilung), JWT-Bearer-Auth, Repository/Handler/Controller-Schichtung.
Vollständige Entitäts-/Endpunktliste: **`BACKEND_IMPLEMENTATION_PLAN.md`**.

### 6.1 Lokales Setup

Voraussetzungen: .NET SDK ≥ 10, SQL Server (LocalDB reicht für die Entwicklung).

```bash
cd DailyGourmet.Api
dotnet restore
```

**Verbindungszeichenfolge** — niemals in `appsettings.json` committen. Lokal über
[User Secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets):

```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\MSSQLLocalDB;Database=DailyGourmetDev;Trusted_Connection=True;TrustServerCertificate=True"
dotnet user-secrets set "Jwt:Secret" "<mind. 32 zeichen langer zufälliger string>"
```

Für Produktionsbetrieb (MonsterASP) werden dieselben Schlüssel stattdessen als
Umgebungsvariablen gesetzt (`ConnectionStrings__DefaultConnection`, `Jwt__Secret`, …) — siehe 6.5.

### 6.2 Datenbank anlegen (Migrationen)

```bash
dotnet tool install --global dotnet-ef   # einmalig
dotnet ef database update                # erstellt/aktualisiert das Schema
dotnet run -- --seed                     # befüllt mit Beispieldaten (idempotent, nur wenn leer)
```

Ein SQL-Skript für Umgebungen ohne direkten `dotnet ef`-Zugriff liegt unter
`Database/DailyGourmet.sql` (idempotent, per `dotnet ef migrations script --idempotent` erzeugt —
bei Schemaänderungen neu generieren).

Neue Migration nach Entitätsänderungen:

```bash
dotnet ef migrations add <Name>
dotnet ef database update
```

### 6.3 Starten & Swagger

```bash
dotnet run --launch-profile http     # http://localhost:5080
```

Swagger UI (nur `Development`): `http://localhost:5080/swagger`. Der **Authorize**-Button akzeptiert
ein JWT aus `POST /api/auth/login` (Format: `Bearer <token>`).

### 6.4 Test-Zugänge (Seed-Daten)

Alle Seed-Benutzer teilen sich das Passwort **`Passwort123!`** (nur lokale Entwicklung —
`Data/DbSeeder.cs`):

| E-Mail | Rolle | Bereich |
|---|---|---|
| `berkcan@gentle-webdesign.com` | SUPER_ADMIN | `/super-admin/dashboard` |
| `miriam.hoffmann@daily-gourmet.de` | TENANT_OWNER | `/admin/dashboard` |
| `petra.salomon@daily-gourmet.de` | KITCHEN_MANAGER | `/kitchen` |
| `claudia.winter@musterschule-nord.example.de` | FACILITY_ADMIN | `/portal/dashboard` |
| `markus.becker@daily-gourmet.de` | DRIVER | `/driver` |

Diese fünf sind auch als Ein-Klick-Buttons auf `/login` hinterlegt.

### 6.5 Deployment (MonsterASP)

1. `dotnet publish -c Release` → Ergebnis per WebDeploy/ZIP auf die MonsterASP-Website hochladen.
2. Datenbank im MonsterASP-Panel anlegen, Connection String **nicht** ins Repo — als
   Umgebungsvariable/Portal-Konfiguration setzen (`ConnectionStrings__DefaultConnection`).
3. `Jwt__Secret`, `Smtp__Host`/`Smtp__Username`/`Smtp__Password`/`Smtp__FromEmail`,
   `Cors__AllowedOrigins__0` (Frontend-URL) ebenfalls als Umgebungsvariablen setzen.
4. Migrationen als separater Schritt ausführen (`dotnet ef database update` mit der
   Produktions-Connection-String, oder `Database/DailyGourmet.sql` manuell einspielen) —
   **nicht** automatisch beim App-Start.
5. Frontend: `NEXT_PUBLIC_API_BASE_URL` auf die MonsterASP-API-URL setzen, CORS im Backend
   entsprechend auf die Frontend-Produktions-URL beschränken.

### 6.6 Konfiguration im Überblick

| appsettings-Schlüssel | Zweck | Produktionsquelle |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | SQL-Server-Verbindung | Umgebungsvariable |
| `Jwt:Secret` / `Issuer` / `Audience` / `ExpirationMinutes` | JWT-Signierung | `Secret` als Umgebungsvariable |
| `Smtp:Host/Port/Username/Password/FromEmail/FromName` | E-Mail-Versand (Einladungen) | Umgebungsvariablen |
| `Cors:AllowedOrigins` | Erlaubte Frontend-Origins | Umgebungsvariable/Portal-Konfiguration |

## 7. Nächste Schritte

Siehe `BACKEND_AUDIT.md` für den genauen Stand je Feature und die priorisierte Liste der noch
auf Dummy-Daten laufenden Frontend-Bereiche.

---

© 2026 Gentle Group
