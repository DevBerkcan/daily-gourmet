"use client";

import { KitchenStatus } from "./kitchen-status";
import { useWorkStatuses } from "../store";

export function PlanStatus({ planId, rezeptId }: { planId: string; rezeptId: string }) {
  const statuses = useWorkStatuses();
  return <KitchenStatus status={statuses.get(`${planId}:${rezeptId}`) ?? "OFFEN"} />;
}
