"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, CardHeader } from "@/components/ui";
import { SaveButton } from "@/components/ui/save-button";
import { BrandingCard } from "./branding-card";
import { useCurrentTenant, useUpdateCurrentTenant, useTenantProfile, useUpdateTenantProfile, useTenantSettings } from "@/lib/services/tenant";

function Field({ label, value, onChange, id }: { label: string; value: string; onChange: (v: string) => void; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="min-h-10 w-full rounded-lg border border-line bg-surface px-3.5 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-basil" />
    </div>
  );
}

export function CompanyContent() {
  const tenant = useCurrentTenant();
  const profile = useTenantProfile();
  const settings = useTenantSettings();
  const updateTenant = useUpdateCurrentTenant();
  const updateProfile = useUpdateTenantProfile();

  const [name, setName] = useState("");
  const [ansprechpartner, setAnsprechpartner] = useState("");
  const [ustId, setUstId] = useState("");
  const [strasse, setStrasse] = useState("");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [zeitzone, setZeitzone] = useState("Europe/Berlin");
  const [waehrung, setWaehrung] = useState("EUR");

  useEffect(() => {
    if (tenant) { setName(tenant.name); setAnsprechpartner(tenant.ansprechpartner); }
  }, [tenant]);
  useEffect(() => {
    if (profile) {
      setUstId(profile.ustId ?? ""); setStrasse(profile.strasse ?? ""); setPlz(profile.plz ?? ""); setOrt(profile.ort ?? "");
      setTelefon(profile.telefon ?? ""); setEmail(profile.email ?? ""); setZeitzone(profile.zeitzone); setWaehrung(profile.waehrung);
    }
  }, [profile]);

  async function speichern() {
    if (tenant) await updateTenant.mutateAsync({ name, ansprechpartner, email: tenant.email });
    if (profile) await updateProfile.mutateAsync({ ustId, strasse, plz, ort, telefon, email, zeitzone, waehrung, logoUrl: profile.logoUrl });
  }

  return (
    <>
      <PageHeader title="Unternehmen" subtitle="Stammdaten und Branding von Daily Gourmet." actions={<SaveButton label="Änderungen speichern" onSave={speichern} disabled={!tenant || !profile} />} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Stammdaten" />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <Field id="name" label="Unternehmensname" value={name} onChange={setName} />
            <Field id="ansprechpartner" label="Tenant Owner" value={ansprechpartner} onChange={setAnsprechpartner} />
            <Field id="ust" label="USt-IdNr." value={ustId} onChange={setUstId} />
            <Field id="strasse" label="Straße und Hausnummer" value={strasse} onChange={setStrasse} />
            <Field id="plz" label="PLZ" value={plz} onChange={setPlz} />
            <Field id="ort" label="Ort" value={ort} onChange={setOrt} />
            <Field id="tel" label="Telefon" value={telefon} onChange={setTelefon} />
            <Field id="mail" label="E-Mail" value={email} onChange={setEmail} />
          </div>
        </Card>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Standardwerte" />
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
              <Field id="tz" label="Zeitzone" value={zeitzone} onChange={setZeitzone} />
              <Field id="cur" label="Währung" value={waehrung} onChange={setWaehrung} />
              <div className="sm:col-span-2">
                <p className="mb-1.5 text-sm font-medium text-ink">Standard-Bestellfrist</p>
                <p className="text-sm text-muted">{settings ? `${settings.bestellfristTageVorher} Tag(e) vorher, ${settings.bestellfristUhrzeit} Uhr` : "…"} — wird unter Einstellungen verwaltet</p>
              </div>
            </div>
          </Card>
          <BrandingCard />
        </div>
      </div>
    </>
  );
}
