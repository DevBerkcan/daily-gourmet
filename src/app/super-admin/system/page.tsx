import { PageHeader, Card, CardHeader, DummyNote } from "@/components/ui";

export const metadata = { title: "System" };

const groups: { title: string; hint: string; rows: [string, string, "ok" | "warn" | "muted"][] }[] = [
  {
    title: "Health Checks",
    hint: "Automatische Prüfung alle 60 Sekunden (Phase 2)",
    rows: [
      ["Frontend (Next.js)", "Erreichbar", "ok"],
      ["Backend-API /api/v1/health", "Noch nicht angebunden", "warn"],
      ["PostgreSQL/SQL Server (MonsterASP)", "Noch nicht angebunden", "warn"],
      ["Nährwert-API (Open Food Facts)", "Noch nicht angebunden", "warn"],
    ],
  },
  {
    title: "Konfiguration",
    hint: "Aus Umgebungsvariablen — keine Geheimnisse im Repository",
    rows: [
      ["Umgebung", "Lokal (Entwicklung)", "muted"],
      ["API-Basis-URL", "http://localhost:5080/api/v1", "muted"],
      ["E-Mail-Versand", "Mailpit (lokal, Phase 2)", "muted"],
      ["Storage", "Lokal (Phase 2: konfigurierbar)", "muted"],
    ],
  },
  {
    title: "Version",
    hint: "Build-Informationen",
    rows: [
      ["Frontend", "0.1.0 (Phase 1)", "muted"],
      ["Backend", "— (Phase 2)", "muted"],
      ["Letztes Deployment", "—", "muted"],
    ],
  },
];

export default function SystemPage() {
  return (
    <>
      <PageHeader title="System" subtitle="Zustand und Konfiguration der Plattformdienste." />
      <div className="grid gap-6 lg:grid-cols-3">
        {groups.map((g) => (
          <Card key={g.title}>
            <CardHeader title={g.title} hint={g.hint} />
            <ul className="divide-y divide-line text-sm">
              {g.rows.map(([k, v, tone]) => (
                <li key={k} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="text-ink">{k}</span>
                  <span className={`text-right text-xs font-medium ${tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : "text-muted"}`}>{v}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <DummyNote />
    </>
  );
}
