"use client";

import { useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { PageHeader, Card, CardHeader, Table, Td, Button, StatusBadge, Tag, EmptyState, LoadingState } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { TextField } from "@/components/ui/form-fields";
import { Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useEinrichtung, useUpdatePortalEinrichtung } from "@/lib/services/facilities";
import { useUsers } from "@/lib/services/users";
import { SchliesstagePanel } from "@/features/facilities/components/schliesstage-panel";

function EinrichtungsdatenFormular({ e, onClose }: { e: NonNullable<ReturnType<typeof useEinrichtung>>; onClose: () => void }) {
  const toast = useToast();
  const updateEinrichtung = useUpdatePortalEinrichtung();
  const [anschrift, setAnschrift] = useState(e.anschrift);
  const [ansprechpartner, setAnsprechpartner] = useState(e.ansprechpartner);
  const [email, setEmail] = useState(e.email);
  const [telefon, setTelefon] = useState(e.telefon);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    updateEinrichtung.mutate(
      { anschrift: anschrift.trim(), ansprechpartner: ansprechpartner.trim(), email: email.trim(), telefon: telefon.trim() },
      {
        onSuccess: () => { onClose(); toast.success("Ihre Einrichtungsdaten wurden gespeichert."); },
        onError: () => toast.error("Speichern fehlgeschlagen. Bitte erneut versuchen."),
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Anschrift" value={anschrift} onChange={setAnschrift} />
        <TextField label="Ansprechpartner" value={ansprechpartner} onChange={setAnsprechpartner} />
        <TextField label="E-Mail" value={email} onChange={setEmail} />
        <TextField label="Telefon" value={telefon} onChange={setTelefon} />
      </div>
      {updateEinrichtung.isError && <p className="text-sm text-danger">Speichern fehlgeschlagen. Bitte erneut versuchen.</p>}
      <div className="flex justify-end gap-2 no-print">
        <Button variant="secondary" onClick={onClose}>Abbrechen</Button>
        <Button type="submit" disabled={updateEinrichtung.isPending}>{updateEinrichtung.isPending ? "Wird gespeichert …" : "Speichern"}</Button>
      </div>
    </form>
  );
}

export function ProfileContent() {
  const { user, isLoading: authLaedt } = useAuth();
  const e = useEinrichtung(user?.facilityId);
  const benutzer = useUsers();
  const [bearbeiten, setBearbeiten] = useState(false);
  const facilityLaedt = useIsFetching({ queryKey: ["facility", user?.facilityId] }) > 0;

  if (!e) {
    if (authLaedt || facilityLaedt) return <Card><LoadingState text="Einrichtung wird geladen …" /></Card>;
    return <Card><EmptyState title="Keine Einrichtung zugeordnet" text="Ihrem Konto ist derzeit keine Einrichtung zugeordnet." /></Card>;
  }

  const eigeneBenutzer = benutzer.filter((b) => b.facilityId === e.id);

  return (
    <>
      <PageHeader title={e.name} subtitle={`Kundennummer ${e.kundennummer} · betreut durch Daily Gourmet`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Einrichtungsdaten"
            hint={bearbeiten ? "Kontaktdaten Ihrer Einrichtung" : "Kontaktdaten können Sie hier selbst pflegen"}
            actions={!bearbeiten && (
              <button type="button" onClick={() => setBearbeiten(true)} className="flex cursor-pointer items-center gap-1 text-xs font-medium text-basil hover:underline no-print">
                <Pencil size={13} aria-hidden /> Bearbeiten
              </button>
            )}
          />
          {bearbeiten ? (
            <EinrichtungsdatenFormular e={e} onClose={() => setBearbeiten(false)} />
          ) : (
            <dl className="grid gap-y-3 px-5 py-5 text-sm sm:grid-cols-[10rem_1fr]">
              <dt className="text-muted">Anschrift</dt><dd className="text-ink">{e.anschrift}</dd>
              <dt className="text-muted">Ansprechpartner</dt><dd className="text-ink">{e.ansprechpartner}</dd>
              <dt className="text-muted">E-Mail</dt><dd className="text-ink">{e.email}</dd>
              <dt className="text-muted">Telefon</dt><dd className="text-ink">{e.telefon}</dd>
              <dt className="text-muted">Bestellfrist</dt><dd className="text-ink">{e.bestellfrist}</dd>
              <dt className="text-muted">Liefertage</dt>
              <dd className="flex gap-1">{e.aktiveWochentage.map((t) => <Tag key={t}>{t}</Tag>)}</dd>
            </dl>
          )}
        </Card>
        <Card>
          <CardHeader title="Benutzer Ihrer Einrichtung" hint="Als Facility Admin können Sie weitere Benutzer einladen" />
          <Table head={["Name", "Rolle", "Status"]}>
            {eigeneBenutzer.map((u) => (
              <tr key={u.id} className="hover:bg-paper">
                <Td>
                  <span className="font-medium text-ink">{u.name}</span>
                  <span className="block text-xs text-muted">{u.email}</span>
                </Td>
                <Td><Tag tone="green">{u.rolle}</Tag></Td>
                <Td><StatusBadge status={u.status} /></Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
      <div className="mt-6">
        <SchliesstagePanel />
      </div>
    </>
  );
}
