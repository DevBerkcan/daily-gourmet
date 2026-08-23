"use client";

import { useMemo, useState } from "react";
import { PageHeader, Card, Table, Td, StatusBadge, Button, SearchInput, Tag } from "@/components/ui";
import { TextField, NumberField, CheckboxGroup } from "@/components/ui/form-fields";
import { useStandorte } from "@/lib/services/locations";
import { useEinrichtungen, useCreateEinrichtung } from "@/lib/services/facilities";
import { Plus, X } from "lucide-react";

const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function FacilitiesManager() {
  const einrichtungen = useEinrichtungen();
  const standorte = useStandorte();
  const [suche, setSuche] = useState("");
  const [standortFilter, setStandortFilter] = useState("");
  const [formularOffen, setFormularOffen] = useState(false);

  const gefiltert = useMemo(() => {
    const s = suche.trim().toLowerCase();
    return einrichtungen.filter((e) => {
      const treffer = !s || e.name.toLowerCase().includes(s) || e.ansprechpartner.toLowerCase().includes(s);
      const amStandort = !standortFilter || e.standortId === standortFilter;
      return treffer && amStandort;
    });
  }, [einrichtungen, suche, standortFilter]);

  return (
    <>
      <PageHeader
        title="Einrichtungen"
        subtitle="Schulen, Kitas und weitere Abnehmer, die über das Kundenportal bestellen."
        actions={<Button onClick={() => setFormularOffen(true)}><Plus size={16} aria-hidden /> Einrichtung anlegen</Button>}
      />

      {formularOffen && <NeueEinrichtungFormular standorte={standorte} onClose={() => setFormularOffen(false)} />}

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5 no-print">
          <SearchInput placeholder="Einrichtung suchen …" value={suche} onChange={(e) => setSuche(e.target.value)} />
          <select
            aria-label="Nach Standort filtern"
            value={standortFilter}
            onChange={(e) => setStandortFilter(e.target.value)}
            className="min-h-10 rounded-lg border border-line bg-surface px-3 text-sm"
          >
            <option value="">Alle Standorte</option>
            {standorte.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <Table head={["Einrichtung", "Kundennr.", "Ansprechpartner", "Standort", "Tour", "Bestellfrist", "Liefertage", "Preis/Portion", "Status"]}>
          {gefiltert.map((e) => (
            <tr key={e.id} className="hover:bg-paper">
              <Td>
                <span className="font-medium text-ink">{e.name}</span>
                <span className="block text-xs text-muted">{e.anschrift}</span>
              </Td>
              <Td className="text-muted">{e.kundennummer}</Td>
              <Td>
                <span>{e.ansprechpartner}</span>
                <span className="block text-xs text-muted">{e.email}</span>
              </Td>
              <Td className="text-muted">{e.standortName}</Td>
              <Td className="text-muted">{e.routeNummer ?? "—"}</Td>
              <Td className="text-muted">{e.bestellfrist}</Td>
              <Td><span className="flex gap-1">{e.aktiveWochentage.map((t) => <Tag key={t}>{t}</Tag>)}</span></Td>
              <Td>{e.portionspreis.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</Td>
              <Td><StatusBadge status={e.status} /></Td>
            </tr>
          ))}
        </Table>
        {gefiltert.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted">Keine Einrichtung gefunden.</p>
        )}
      </Card>
    </>
  );
}

function NeueEinrichtungFormular({ standorte, onClose }: { standorte: ReturnType<typeof useStandorte>; onClose: () => void }) {
  const createEinrichtung = useCreateEinrichtung();
  const [name, setName] = useState("");
  const [anschrift, setAnschrift] = useState("");
  const [ansprechpartner, setAnsprechpartner] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [standortId, setStandortId] = useState(standorte[0]?.id ?? "");
  const [routeNummer, setRouteNummer] = useState("");
  const [portionspreis, setPortionspreis] = useState(5);
  const [wochentage, setWochentage] = useState<string[]>(["Mo", "Di", "Mi", "Do", "Fr"]);

  const kannSpeichern = name.trim() !== "" && standortId !== "" && !createEinrichtung.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kannSpeichern) return;
    createEinrichtung.mutate(
      {
        name: name.trim(),
        anschrift: anschrift.trim(),
        ansprechpartner: ansprechpartner.trim(),
        email: email.trim(),
        telefon: telefon.trim(),
        standortId,
        aktiveWochentage: wochentage,
        portionspreis,
        routeNummer: routeNummer.trim() || undefined,
      },
      { onSuccess: onClose }
    );
  }

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="text-sm font-semibold text-ink">Neue Einrichtung</h2>
        <button type="button" onClick={onClose} aria-label="Schließen" className="cursor-pointer text-muted hover:text-ink">
          <X size={18} aria-hidden />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Name" value={name} onChange={setName} required />
          <TextField label="Anschrift" value={anschrift} onChange={setAnschrift} />
          <TextField label="Ansprechpartner" value={ansprechpartner} onChange={setAnsprechpartner} />
          <TextField label="E-Mail" value={email} onChange={setEmail} />
          <TextField label="Telefon" value={telefon} onChange={setTelefon} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Standort</span>
            <select
              value={standortId}
              onChange={(e) => setStandortId(e.target.value)}
              className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil"
            >
              {standorte.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <NumberField label="Preis je Portion" value={portionspreis} onChange={setPortionspreis} min={0} step={0.1} suffix="€" />
          <TextField label="Tour" value={routeNummer} onChange={setRouteNummer} placeholder="z. B. RT1" hint="Nummernkreis siehe Einstellungen" />
        </div>
        <CheckboxGroup label="Aktive Liefertage" options={WOCHENTAGE} selected={wochentage} onToggle={(t) => setWochentage((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))} />
        {createEinrichtung.isError && <p className="text-sm text-danger">Speichern fehlgeschlagen. Bitte erneut versuchen.</p>}
        <div className="flex justify-end gap-2 no-print">
          <Button variant="secondary" onClick={onClose}>Abbrechen</Button>
          <Button type="submit" disabled={!kannSpeichern}>{createEinrichtung.isPending ? "Wird gespeichert …" : "Einrichtung speichern"}</Button>
        </div>
      </form>
    </Card>
  );
}
