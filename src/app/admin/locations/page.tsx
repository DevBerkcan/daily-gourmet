import { PageHeader, Card, Table, Td, StatusBadge, Button, DummyNote } from "@/components/ui";
import { standorte } from "@/lib/data";
import { Plus } from "lucide-react";

export const metadata = { title: "Standorte" };

export default function LocationsPage() {
  return (
    <>
      <PageHeader
        title="Standorte"
        subtitle="Küchen- und Produktionsstandorte von Daily Gourmet."
        actions={<Button><Plus size={16} aria-hidden /> Standort anlegen</Button>}
      />
      <Card>
        <Table head={["Standort", "Anschrift", "Kontaktperson", "Kapazität / Tag", "Status"]}>
          {standorte.map((s) => (
            <tr key={s.id} className="hover:bg-paper">
              <Td className="font-medium text-ink">{s.name}</Td>
              <Td className="text-muted">{s.anschrift}</Td>
              <Td>{s.kontaktperson}</Td>
              <Td>{s.kapazitaetPortionen.toLocaleString("de-DE")} Portionen</Td>
              <Td><StatusBadge status={s.status} /></Td>
            </tr>
          ))}
        </Table>
      </Card>
      <DummyNote />
    </>
  );
}
