import { ZutatDetail } from "./zutat-detail";

export default async function IngredientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ZutatDetail id={id} />;
}
