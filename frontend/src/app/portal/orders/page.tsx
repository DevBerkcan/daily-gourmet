import { PageHeader, DummyNote } from "@/components/ui";
import { OrdersHistory } from "./orders-history";

export const metadata = { title: "Bestellungen" };

export default function PortalOrdersPage() {
  return (
    <>
      <PageHeader
        title="Bestellungen"
        subtitle="Ihre Bestellhistorie. Änderungen sind bis zur jeweiligen Frist möglich — danach wird die Bestellung gesperrt."
      />
      <OrdersHistory />
      <DummyNote />
    </>
  );
}
