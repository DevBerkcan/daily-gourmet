import { PlanDetail } from "./plan-detail";

export default async function MealPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlanDetail id={id} />;
}
