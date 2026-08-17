"use client";

import { PageHeader, Card, CardHeader, Table, Td, StatusBadge, Tag, EmptyState } from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthContext";
import { useEinrichtung } from "@/lib/services/facilities";
import { useUsers } from "@/lib/services/users";

export function ProfileContent() {
  const { user } = useAuth();
  const e = useEinrichtung(user?.facilityId);
  const benutzer = useUsers();

  if (!e) {
    return <Card><EmptyState title="Keine Einrichtung zugeordnet" text="Ihrem Konto ist derzeit keine Einrichtung zugeordnet." /></Card>;
  }

  const eigeneBenutzer = benutzer.filter((b) => b.facilityId === e.id);

  return (
    <>
      <PageHeader title={e.name} subtitle={`Kundennummer ${e.kundennummer} · betreut durch Daily Gourmet`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Einrichtungsdaten" hint="Änderungen bitte an Daily Gourmet melden" />
          <dl className="grid gap-y-3 px-5 py-5 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="text-muted">Anschrift</dt><dd className="text-ink">{e.anschrift}</dd>
            <dt className="text-muted">Ansprechpartner</dt><dd className="text-ink">{e.ansprechpartner}</dd>
            <dt className="text-muted">E-Mail</dt><dd className="text-ink">{e.email}</dd>
            <dt className="text-muted">Telefon</dt><dd className="text-ink">{e.telefon}</dd>
            <dt className="text-muted">Bestellfrist</dt><dd className="text-ink">{e.bestellfrist}</dd>
            <dt className="text-muted">Liefertage</dt>
            <dd className="flex gap-1">{e.aktiveWochentage.map((t) => <Tag key={t}>{t}</Tag>)}</dd>
          </dl>
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
    </>
  );
}
