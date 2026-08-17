"use client";

import { PageHeader, Card, CardHeader } from "@/components/ui";
import { useSystemStatus } from "@/lib/services/super-admin";

export function SystemContent() {
  const status = useSystemStatus();

  const healthChecks: [string, string, "ok" | "warn" | "muted"][] = [
    ["Frontend (Next.js)", "Erreichbar", "ok"],
    ["Backend-API /api", "Erreichbar", "ok"],
    ["Datenbank", status ? (status.databaseConnected ? "Verbunden" : "Nicht verbunden") : "Wird geprüft …", status?.databaseConnected ? "ok" : "warn"],
  ];

  const groups: { title: string; hint: string; rows: [string, string, "ok" | "warn" | "muted"][] }[] = [
    { title: "Health Checks", hint: "Live geprüft bei Seitenaufruf", rows: healthChecks },
    {
      title: "Konfiguration",
      hint: "Aus Umgebungsvariablen — keine Geheimnisse im Repository",
      rows: [["API-Basis-URL", process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5080/api", "muted"]],
    },
    {
      title: "Version",
      hint: "Build-Informationen",
      rows: [
        ["Backend", status?.version ?? "—", "muted"],
        ["Hintergrunddienste", status?.backgroundJobs ?? "—", "muted"],
      ],
    },
  ];

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
    </>
  );
}
