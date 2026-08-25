"use client";

import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { Button, Card, CardHeader, Tag } from "@/components/ui";
import { useTenantSettings, useUpdateTenantSettings, notificationLabel, type TenantSettings } from "@/lib/services/super-admin";

const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil";

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-basil" />
    </label>
  );
}

/** Bestellfristen, Freigabeprozesse und Nummernkreise eines Mandanten — nur hier auf der
 * Super-Admin-Seite editierbar; der Mandant selbst sieht/ändert dies nicht mehr über /admin/settings. */
export function TenantSettingsCard({ tenantId }: { tenantId: string }) {
  const settings = useTenantSettings(tenantId);
  const updateSettings = useUpdateTenantSettings(tenantId);
  const [bearbeiten, setBearbeiten] = useState(false);
  const [form, setForm] = useState<TenantSettings | null>(null);

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  function starten() {
    if (settings) setForm(settings);
    setBearbeiten(true);
  }

  async function speichern() {
    if (!form) return;
    await updateSettings.mutateAsync(form);
    setBearbeiten(false);
  }

  return (
    <Card>
      <CardHeader
        title="Einstellungen"
        hint="Bestellfristen, Freigaben und Standardwerte — nur durch Daily Gourmet editierbar"
        actions={
          bearbeiten ? (
            <button type="button" onClick={() => setBearbeiten(false)} aria-label="Bearbeitung schließen" className="rounded-lg p-2 text-muted hover:bg-paper hover:text-ink"><X size={18} aria-hidden /></button>
          ) : (
            <Button variant="secondary" onClick={starten} disabled={!settings}><Pencil size={15} aria-hidden /> Bearbeiten</Button>
          )
        }
      />
      {!settings || !form ? (
        <p className="px-5 py-6 text-sm text-muted">Lade Einstellungen …</p>
      ) : !bearbeiten ? (
        <dl className="grid gap-4 p-5 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-muted">Bestellfrist</dt><dd className="font-medium text-ink">{settings.bestellfristTageVorher} Tag(e) vorher, {settings.bestellfristUhrzeit} Uhr</dd></div>
          <div><dt className="text-xs text-muted">Anpassung am Liefertag bis</dt><dd className="font-medium text-ink">{settings.sameDayAnpassungFrist} Uhr</dd></div>
          <div><dt className="text-xs text-muted">Wochenenden ausnehmen</dt><dd><Tag tone={settings.wochenendenAusschliessen ? "green" : "neutral"}>{settings.wochenendenAusschliessen ? "Aktiv" : "Inaktiv"}</Tag></dd></div>
          <div><dt className="text-xs text-muted">Prüfung vor Veröffentlichung</dt><dd><Tag tone={settings.pruefungVorVeroeffentlichung ? "green" : "neutral"}>{settings.pruefungVorVeroeffentlichung ? "Aktiv" : "Inaktiv"}</Tag></dd></div>
          <div><dt className="text-xs text-muted">Zurückziehen nur ohne Bestellungen</dt><dd><Tag tone={settings.zurueckziehenNurOhneBestellungen ? "green" : "neutral"}>{settings.zurueckziehenNurOhneBestellungen ? "Aktiv" : "Inaktiv"}</Tag></dd></div>
          <div><dt className="text-xs text-muted">Nummernkreise</dt><dd className="font-medium text-ink">{settings.praefixEinrichtungen || "—"} · {settings.praefixArtikel || "—"} · {settings.praefixTouren || "—"}</dd></div>
          <div className="sm:col-span-2">
            <dt className="mb-1.5 text-xs text-muted">Benachrichtigungen</dt>
            <dd className="flex flex-wrap gap-1.5">
              {settings.benachrichtigungen.map((n) => <Tag key={n.eventKey} tone={n.aktiv ? "green" : "neutral"}>{notificationLabel(n.eventKey)}</Tag>)}
            </dd>
          </div>
        </dl>
      ) : (
        <div className="flex flex-col gap-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-muted">Bestellfrist (Tage vorher)
              <input type="number" min={0} value={form.bestellfristTageVorher} onChange={(e) => setForm((f) => f && { ...f, bestellfristTageVorher: Math.max(0, Number(e.target.value) || 0) })} className={`mt-1.5 ${fieldClass}`} />
            </label>
            <label className="text-xs font-medium text-muted">Bestellfrist (Uhrzeit)
              <input type="time" value={form.bestellfristUhrzeit} onChange={(e) => setForm((f) => f && { ...f, bestellfristUhrzeit: e.target.value })} className={`mt-1.5 ${fieldClass}`} />
            </label>
            <label className="text-xs font-medium text-muted">Anpassung am Liefertag bis
              <input type="time" value={form.sameDayAnpassungFrist} onChange={(e) => setForm((f) => f && { ...f, sameDayAnpassungFrist: e.target.value })} className={`mt-1.5 ${fieldClass}`} />
            </label>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <ToggleRow label="Wochenenden ausnehmen" checked={form.wochenendenAusschliessen} onChange={(v) => setForm((f) => f && { ...f, wochenendenAusschliessen: v })} />
            <ToggleRow label="Prüfung vor Veröffentlichung" checked={form.pruefungVorVeroeffentlichung} onChange={(v) => setForm((f) => f && { ...f, pruefungVorVeroeffentlichung: v })} />
            <ToggleRow label="Zurückziehen nur ohne Bestellungen" checked={form.zurueckziehenNurOhneBestellungen} onChange={(v) => setForm((f) => f && { ...f, zurueckziehenNurOhneBestellungen: v })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-xs font-medium text-muted">Nummernkreis Einrichtungen
              <input value={form.praefixEinrichtungen} onChange={(e) => setForm((f) => f && { ...f, praefixEinrichtungen: e.target.value })} className={`mt-1.5 ${fieldClass}`} />
            </label>
            <label className="text-xs font-medium text-muted">Nummernkreis Artikel
              <input value={form.praefixArtikel} onChange={(e) => setForm((f) => f && { ...f, praefixArtikel: e.target.value })} className={`mt-1.5 ${fieldClass}`} />
            </label>
            <label className="text-xs font-medium text-muted">Nummernkreis Touren
              <input value={form.praefixTouren} onChange={(e) => setForm((f) => f && { ...f, praefixTouren: e.target.value })} className={`mt-1.5 ${fieldClass}`} />
            </label>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted">Benachrichtigungen</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {form.benachrichtigungen.map((n) => (
                <ToggleRow
                  key={n.eventKey}
                  label={notificationLabel(n.eventKey)}
                  checked={n.aktiv}
                  onChange={(v) => setForm((f) => f && { ...f, benachrichtigungen: f.benachrichtigungen.map((entry) => (entry.eventKey === n.eventKey ? { ...entry, aktiv: v } : entry)) })}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={speichern} disabled={updateSettings.isPending}>Änderungen speichern</Button>
            <Button variant="secondary" onClick={() => setBearbeiten(false)}>Abbrechen</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
