import { PlanDetail } from "@/features/meal-plans/components/plan-detail";

export default async function MealPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlanDetail id={id} />;
}
