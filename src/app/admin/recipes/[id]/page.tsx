import { RezeptDetail } from "./rezept-detail";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RezeptDetail id={id} />;
}
