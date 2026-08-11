import { ProduktionstagDetail } from "@/features/production/components/produktionstag-detail";

export default async function ProductionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProduktionstagDetail id={id} />;
}
