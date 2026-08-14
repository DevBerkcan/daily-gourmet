import { PageHeader, Card, CardHeader, Button, Tag, DummyNote } from "@/components/ui";

export const metadata = { title: "Einstellungen" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Einstellungen" subtitle="Bestellfristen, Freigaben und Standardwerte für Daily Gourmet." actions={<Button>Speichern</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Bestellfristen" hint="Serverseitig durchgesetzt — Browser-Manipulation umgeht die Frist nicht" />
          <div className="flex flex-col gap-4 px-5 py-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>Globale Standardfrist</span>
              <span className="font-medium text-ink">Vortag, 09:00 Uhr</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Abweichende Fristen je Einrichtung</span>
              <Tag tone="green">2 aktiv</Tag>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Korrektur nach Fristablauf</span>
              <span className="text-muted">Nur Tenant Owner / Admin, mit Begründung</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Wochenenden von Fristberechnung ausnehmen</span>
              <Tag tone="green">Aktiv</Tag>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Freigabeprozesse" />
          <div className="flex flex-col gap-4 px-5 py-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>Speisepläne vor Veröffentlichung prüfen (REVIEW)</span>
              <Tag tone="green">Aktiv</Tag>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Freigabeberechtigt</span>
              <span className="text-muted">Tenant Owner, Tenant Admin</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Zurückziehen nach Veröffentlichung</span>
              <span className="text-muted">Nur ohne vorliegende Bestellungen</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Einheiten und Nummernkreise" />
          <div className="flex flex-col gap-4 px-5 py-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>Erlaubte Basiseinheiten</span>
              <span className="flex gap-1">{["g", "kg", "ml", "l", "Stück"].map((e) => <Tag key={e}>{e}</Tag>)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Nummernkreis Einrichtungen</span>
              <span className="font-medium text-ink">DG-1###</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Nummernkreis Artikel</span>
              <span className="font-medium text-ink">ART-####</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Benachrichtigungen" />
          <div className="flex flex-col gap-4 px-5 py-5 text-sm">
            {[
              ["Speiseplan veröffentlicht → Einrichtungen", true],
              ["Frist läuft ab → Einrichtungen ohne Bestellung", true],
              ["Bestellung nachträglich geändert → Küche", true],
              ["Produktionsplan geändert → Kitchen Manager", false],
            ].map(([label, on]) => (
              <div key={label as string} className="flex items-center justify-between gap-3">
                <span>{label}</span>
                <Tag tone={on ? "green" : "neutral"}>{on ? "Aktiv" : "Inaktiv"}</Tag>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <DummyNote />
    </>
  );
}
