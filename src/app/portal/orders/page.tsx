import { PageHeader, Card, CardHeader, Table, Td, StatusBadge, DummyNote } from "@/components/ui";
import { bestellungen, rezeptById } from "@/lib/data";

export const metadata = { title: "Bestellungen" };

export default function PortalOrdersPage() {
  const eigene = bestellungen.filter((b) => b.einrichtungId === "f-001");
  return (
    <>
      <PageHeader
        title="Bestellungen"
        subtitle="Ihre Bestellhistorie. Änderungen sind bis zur jeweiligen Frist möglich — danach wird die Bestellung gesperrt."
      />
      <div className="flex flex-col gap-6">
        {eigene.map((b) => (
          <Card key={b.id}>
            <CardHeader
              title={b.speiseplanId === "mp-032" ? "Bestellung KW 32" : "Bestellung KW 31"}
              hint={`Frist: ${b.frist}${b.abgesendetAm ? ` · Abgesendet: ${b.abgesendetAm}` : ""}`}
              actions={<StatusBadge status={b.status} />}
            />
            <Table head={["Tag", "Gericht", "Portionen", "Hinweis"]}>
              {b.positionen.map((p, i) => (
                <tr key={i} className="hover:bg-paper">
                  <Td className="whitespace-nowrap text-muted">
                    {new Date(p.datum).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })}
                  </Td>
                  <Td className="font-medium text-ink">{rezeptById(p.rezeptId)?.name}</Td>
                  <Td className="font-semibold">{p.portionen}</Td>
                  <Td className="text-muted">{p.hinweis ?? "—"}</Td>
                </tr>
              ))}
            </Table>
            {b.status === "LOCKED" && (
              <p className="border-t border-line px-5 py-3 text-xs text-muted">
                Die Frist ist abgelaufen. Korrekturen sind nur noch durch Daily Gourmet möglich und werden protokolliert.
              </p>
            )}
          </Card>
        ))}
      </div>
      <DummyNote />
    </>
  );
}
