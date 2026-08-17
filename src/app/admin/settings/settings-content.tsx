"use client";

import { PageHeader, Card, CardHeader, Tag } from "@/components/ui";
import { SaveButton } from "@/components/ui/save-button";
import { useTenantSettings, notificationLabel } from "@/lib/services/tenant";

export function SettingsContent() {
  const settings = useTenantSettings();

  return (
    <>
      <PageHeader
        title="Einstellungen"
        subtitle="Bestellfristen, Freigaben und Standardwerte für Daily Gourmet."
        actions={<SaveButton />}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Bestellfristen" hint="Serverseitig durchgesetzt — Browser-Manipulation umgeht die Frist nicht" />
          <div className="flex flex-col gap-4 px-5 py-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>Globale Standardfrist</span>
              <span className="font-medium text-ink">{settings ? `${settings.bestellfristTageVorher} Tag(e) vorher, ${settings.bestellfristUhrzeit} Uhr` : "…"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Korrektur nach Fristablauf</span>
              <span className="text-muted">Nur Tenant Owner / Admin, mit Begründung</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Wochenenden von Fristberechnung ausnehmen</span>
              <Tag tone={settings?.wochenendenAusschliessen ? "green" : "neutral"}>{settings ? (settings.wochenendenAusschliessen ? "Aktiv" : "Inaktiv") : "…"}</Tag>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Freigabeprozesse" />
          <div className="flex flex-col gap-4 px-5 py-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>Speisepläne vor Veröffentlichung prüfen (REVIEW)</span>
              <Tag tone={settings?.pruefungVorVeroeffentlichung ? "green" : "neutral"}>{settings ? (settings.pruefungVorVeroeffentlichung ? "Aktiv" : "Inaktiv") : "…"}</Tag>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Freigabeberechtigt</span>
              <span className="text-muted">Tenant Owner, Tenant Admin</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Zurückziehen nach Veröffentlichung</span>
              <span className="text-muted">{settings?.zurueckziehenNurOhneBestellungen ? "Nur ohne vorliegende Bestellungen" : "Jederzeit möglich"}</span>
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
              <span className="font-medium text-ink">{settings?.praefixEinrichtungen || "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Nummernkreis Artikel</span>
              <span className="font-medium text-ink">{settings?.praefixArtikel || "—"}</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Benachrichtigungen" />
          <div className="flex flex-col gap-4 px-5 py-5 text-sm">
            {(settings?.benachrichtigungen ?? []).map((n) => (
              <div key={n.eventKey} className="flex items-center justify-between gap-3">
                <span>{notificationLabel(n.eventKey)}</span>
                <Tag tone={n.aktiv ? "green" : "neutral"}>{n.aktiv ? "Aktiv" : "Inaktiv"}</Tag>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
