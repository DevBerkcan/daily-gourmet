import { PageHeader } from "@/components/ui";
import { OrdersBoard } from "@/features/orders/components/orders-board";

export const metadata = { title: "Bestellungen" };

export default function OrdersPage() {
  return <><PageHeader title="Bestellmanagement" subtitle="Portionsmengen, Fristen, Freigaben und nachträgliche Korrekturen aller Einrichtungen zentral verwalten." /><OrdersBoard /></>;
}
