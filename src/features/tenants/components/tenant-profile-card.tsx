"use client";

import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { Button, Card, CardHeader } from "@/components/ui";
import { ImageField } from "@/components/ui/form-fields";
import { useTenantProfile, useUpdateTenantProfile, type TenantProfile } from "@/lib/services/super-admin";

const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil";

function Field({ label, value, onChange, id }: { label: string; value: string; onChange: (v: string) => void; id: string }) {
  return (
    <label htmlFor={id} className="text-xs font-medium text-muted">
      {label}
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`mt-1.5 ${fieldClass}`} />
    </label>
  );
}

/** Unternehmensprofil (Stammdaten, Branding) eines Mandanten — nur hier auf der Super-Admin-Seite
 * editierbar; der Mandant selbst sieht/ändert dies nicht mehr über /admin/company. */
export function TenantProfileCard({ tenantId }: { tenantId: string }) {
  const profile = useTenantProfile(tenantId);
  const updateProfile = useUpdateTenantProfile(tenantId);
  const [bearbeiten, setBearbeiten] = useState(false);
  const [form, setForm] = useState<TenantProfile>({ zeitzone: "Europe/Berlin", waehrung: "EUR" });

  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  function starten() {
    if (profile) setForm(profile);
    setBearbeiten(true);
  }

  async function speichern() {
    await updateProfile.mutateAsync(form);
    setBearbeiten(false);
  }

  return (
    <Card>
      <CardHeader
        title="Unternehmensprofil"
        hint="Stammdaten und Branding — nur durch Daily Gourmet editierbar"
        actions={
          bearbeiten ? (
            <button type="button" onClick={() => setBearbeiten(false)} aria-label="Bearbeitung schließen" className="rounded-lg p-2 text-muted hover:bg-paper hover:text-ink"><X size={18} aria-hidden /></button>
          ) : (
            <Button variant="secondary" onClick={starten} disabled={!profile}><Pencil size={15} aria-hidden /> Bearbeiten</Button>
          )
        }
      />
      {!profile ? (
        <p className="px-5 py-6 text-sm text-muted">Lade Unternehmensprofil …</p>
      ) : !bearbeiten ? (
        <dl className="grid gap-4 p-5 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-muted">USt-IdNr.</dt><dd className="font-medium text-ink">{profile.ustId || "—"}</dd></div>
          <div><dt className="text-xs text-muted">Telefon</dt><dd className="font-medium text-ink">{profile.telefon || "—"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs text-muted">Anschrift</dt><dd className="font-medium text-ink">{profile.strasse ? `${profile.strasse}, ${profile.plz} ${profile.ort}` : "—"}</dd></div>
          <div><dt className="text-xs text-muted">E-Mail (Rechnung)</dt><dd className="font-medium text-ink">{profile.email || "—"}</dd></div>
          <div><dt className="text-xs text-muted">Zeitzone / Währung</dt><dd className="font-medium text-ink">{profile.zeitzone} · {profile.waehrung}</dd></div>
        </dl>
      ) : (
        <div className="flex flex-col gap-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="ust" label="USt-IdNr." value={form.ustId ?? ""} onChange={(v) => setForm((f) => ({ ...f, ustId: v }))} />
            <Field id="tel" label="Telefon" value={form.telefon ?? ""} onChange={(v) => setForm((f) => ({ ...f, telefon: v }))} />
            <Field id="strasse" label="Straße und Hausnummer" value={form.strasse ?? ""} onChange={(v) => setForm((f) => ({ ...f, strasse: v }))} />
            <div className="grid grid-cols-2 gap-4">
              <Field id="plz" label="PLZ" value={form.plz ?? ""} onChange={(v) => setForm((f) => ({ ...f, plz: v }))} />
              <Field id="ort" label="Ort" value={form.ort ?? ""} onChange={(v) => setForm((f) => ({ ...f, ort: v }))} />
            </div>
            <Field id="mail" label="E-Mail (Rechnung)" value={form.email ?? ""} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
            <div className="grid grid-cols-2 gap-4">
              <Field id="tz" label="Zeitzone" value={form.zeitzone} onChange={(v) => setForm((f) => ({ ...f, zeitzone: v }))} />
              <Field id="cur" label="Währung" value={form.waehrung} onChange={(v) => setForm((f) => ({ ...f, waehrung: v }))} />
            </div>
          </div>
          <ImageField label="Logo" value={form.logoUrl} onChange={(v) => setForm((f) => ({ ...f, logoUrl: v }))} hint="PNG oder SVG, max. 1 MB" />
          <div className="flex gap-2">
            <Button onClick={speichern} disabled={updateProfile.isPending}>Änderungen speichern</Button>
            <Button variant="secondary" onClick={() => setBearbeiten(false)}>Abbrechen</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
