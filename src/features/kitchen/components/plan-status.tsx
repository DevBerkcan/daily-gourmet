import { KitchenStatus } from "./kitchen-status";
import type { KitchenWorkStatus } from "@/lib/services/production";

export function PlanStatus({ status }: { status: KitchenWorkStatus }) {
  return <KitchenStatus status={status} />;
}
