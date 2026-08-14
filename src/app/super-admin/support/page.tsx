import { PageHeader } from "@/components/ui";
import { SupportCenter } from "@/features/support/components/support-center";

export const metadata = { title: "Supportcenter" };

export default function SupportPage() {
  return <><PageHeader title="Supportcenter" subtitle="Anfragen der Tenant Owner bearbeiten, Mandantenaktivitäten nachvollziehen und kontrollierten Supportzugriff starten." /><SupportCenter /></>;
}
