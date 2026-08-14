import { PageHeader, Card, CardHeader, Button, DummyNote } from "@/components/ui";

export const metadata = { title: "Unternehmen" };

function Field({ label, value, id }: { label: string; value: string; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <input id={id} defaultValue={value} className="min-h-10 w-full rounded-lg border border-line bg-surface px-3.5 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-basil" />
    </div>
  );
}

export default function CompanyPage() {
  return (
    <>
      <PageHeader title="Unternehmen" subtitle="Stammdaten und Branding von Daily Gourmet." actions={<Button>Änderungen speichern</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Stammdaten" />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <Field id="name" label="Unternehmensname" value="Daily Gourmet GmbH" />
            <Field id="ust" label="USt-IdNr." value="DE 123 456 789" />
            <Field id="strasse" label="Straße und Hausnummer" value="Eiland 2" />
            <Field id="plz" label="PLZ und Ort" value="42103 Wuppertal" />
            <Field id="tel" label="Telefon" value="(0)202 – 479 47 001" />
            <Field id="mail" label="E-Mail" value="info@daily-gourmet.de" />
          </div>
        </Card>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Standardwerte" />
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
              <Field id="tz" label="Zeitzone" value="Europe/Berlin" />
              <Field id="cur" label="Währung" value="EUR" />
              <Field id="frist" label="Standard-Bestellfrist" value="Vortag, 09:00 Uhr" />
              <Field id="portion" label="Standardportion" value="1 Portion = 1 Essen" />
            </div>
          </Card>
          <Card>
            <CardHeader title="Branding" hint="Logo und Farben erscheinen im Kundenportal" />
            <div className="flex items-center gap-4 px-5 py-5">
              <div className="flex size-16 items-center justify-center rounded-xl bg-basil font-display text-xl font-semibold text-white" aria-hidden>DG</div>
              <div>
                <Button variant="secondary">Logo hochladen</Button>
                <p className="mt-1.5 text-xs text-muted">PNG oder SVG, max. 1 MB</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <DummyNote />
    </>
  );
}
