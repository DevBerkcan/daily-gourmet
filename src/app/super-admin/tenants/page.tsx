import { PageHeader } from "@/components/ui";
import { TenantsManager } from "@/features/tenants/components/tenants-manager";

export const metadata = { title: "Mandanten" };

export default function TenantsPage() {
  return (
    <>
      <PageHeader
        title="Mandanten"
        subtitle="Alle Catering-Unternehmen auf der Plattform. Neue Mandanten werden ausschließlich hier angelegt — es gibt keine Selbstregistrierung."
      />
      <TenantsManager />
    </>
  );
}
