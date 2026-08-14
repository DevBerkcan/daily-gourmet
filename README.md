# Daily Gourmet — Catering-Management-Plattform

Mandantenfähige SaaS-Plattform für Catering-Unternehmen, Großküchen, Schulen und Einrichtungen.
Plattformbetreiber: **Gentle Group** · Beispiel-Mandant: **Daily Gourmet**

> **Aktueller Stand: Phase 1 — Frontend mit Beispieldaten.**
> Alle Ansichten sind mit Dummy-Daten hinterlegt. In Phase 2 wird das C#-Backend
> (ASP.NET Core, gehostet auf MonsterASP) angebunden und ersetzt die Dummy-Daten vollständig.

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
| Kundenportal | FACILITY_ADMIN (Musterschule Nord) | `/portal/dashboard` |

## 2. Tech-Stack (Frontend)

- **Next.js 15** (App Router) + **TypeScript** (strict)
- **Tailwind CSS 4** mit zentralem Token-System (`src/app/globals.css`)
- **lucide-react** Icons
- Deutsche Oberfläche, responsive (Desktop-Sidebar + Mobile-Drawer), Druckansichten via `no-print`, `prefers-reduced-motion` beachtet
- Vorbereitet für Phase 2: React Hook Form + Zod (Formulare), TanStack Query (Server State)

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
    types.ts              Domain-Typen — entsprechen 1:1 den geplanten Backend-DTOs
    data/index.ts         Dummy-Daten (werden in Phase 2 durch API-Aufrufe ersetzt)
docs/
  backend-architektur.md  C#-Backend: Architektur, Schichten, Sicherheit, MonsterASP, Nährwert-API
  api-endpunkte.md        Vollständige Endpunktliste /api/v1
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

## 6. Nächste Schritte (Phase 2 — Backend)

1. ASP.NET Core 8 Web-API aufsetzen (Clean Architecture, siehe `docs/backend-architektur.md`)
2. MS-SQL-Datenbank auf MonsterASP anlegen, EF-Core-Migrationen
3. Authentifizierung (HTTP-only-Cookies, Argon2id), RBAC, Tenant-Middleware
4. Endpunkte gemäß `docs/api-endpunkte.md` implementieren
5. Frontend: Dummy-Daten (`src/lib/data`) durch TanStack-Query-Hooks ersetzen
6. Nährwert-API-Anbindung (Open Food Facts, Fallback USDA) über Backend-Proxy
7. Tests (xUnit, Playwright E2E), Audit-Log, Benachrichtigungen

---

© 2026 Gentle Group
