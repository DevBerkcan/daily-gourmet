"use client";

import { PageHeader, Card, Table, Td } from "@/components/ui";
import { useAllLocations } from "@/lib/services/super-admin";

export function LocationsContent() {
  const standorte = useAllLocations();

  return (
    <>
      <PageHeader
        title="Standorte"
        subtitle="Küchen- und Produktionsstandorte aller Mandanten."
      />
      <Card>
        <Table head={["Standort", "Mandant"]}>
          {standorte.map((s) => (
            <tr key={s.id} className="hover:bg-paper">
              <Td className="font-medium text-ink">{s.name}</Td>
              <Td className="text-muted">{s.tenantName}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
