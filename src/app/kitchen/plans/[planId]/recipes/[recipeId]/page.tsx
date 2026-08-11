import { RecipeRequirement } from "@/features/kitchen/components/recipe-requirement";

type Props = {
  params: Promise<{ planId: string; recipeId: string }>;
};

export default async function KitchenRecipeRequirementPage({ params }: Props) {
  const { planId, recipeId } = await params;
  return <RecipeRequirement planId={planId} recipeId={recipeId} />;
}
