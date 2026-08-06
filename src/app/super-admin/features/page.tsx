import { PageHeader, Card, CardHeader, DummyNote } from "@/components/ui";

export const metadata = { title: "Feature-Flags" };

const flags = [
  { name: "Kundenportal", beschreibung: "Bestellportal für Schulen und Einrichtungen", global: true, tenants: "4 / 4 Mandanten" },
  { name: "Nährwert-API (Zutaten)", beschreibung: "Automatischer Abruf von Nährwerten über Open Food Facts / USDA", global: true, tenants: "3 / 4 Mandanten" },
  { name: "Einkaufslisten", beschreibung: "Bedarfsaggregation und CSV-Export", global: true, tenants: "4 / 4 Mandanten" },
  { name: "Bedarfsprognose (Basis)", beschreibung: "Neutrale Hochrechnung auf Basis bestätigter Bestellmengen — keine KI", global: false, tenants: "0 / 4 Mandanten" },
  { name: "White-Label-Branding", beschreibung: "Eigenes Logo und Farben je Mandant", global: false, tenants: "0 / 4 Mandanten" },
  { name: "Mehrsprachigkeit", beschreibung: "Weitere Sprachen neben Deutsch", global: false, tenants: "0 / 4 Mandanten" },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHeader title="Feature-Flags" subtitle="Module global und je Mandant aktivieren oder deaktivieren. Zukünftige Erweiterungen werden hier freigeschaltet." />
      <Card>
        <CardHeader title="Module" hint="Global aktiv = für neue Mandanten standardmäßig verfügbar" />
        <ul className="divide-y divide-line">
          {flags.map((f) => (
            <li key={f.name} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium text-ink">{f.name}</p>
                <p className="text-sm text-muted">{f.beschreibung}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted">{f.tenants}</span>
                <span
                  role="switch"
                  aria-checked={f.global}
                  aria-label={`${f.name} global ${f.global ? "deaktivieren" : "aktivieren"}`}
                  tabIndex={0}
                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${f.global ? "bg-basil" : "bg-line-strong"}`}
                >
                  <span className={`inline-block size-4.5 rounded-full bg-white shadow transition-transform ${f.global ? "translate-x-5.5" : "translate-x-1"}`} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <DummyNote />
    </>
  );
}
