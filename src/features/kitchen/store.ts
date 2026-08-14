import { createStore } from "@/lib/store/create-store";
import { produktionsplaene } from "@/features/production/data";
import type { KitchenWorkStatus } from "./types";

const initialStatuses = new Map<string, KitchenWorkStatus>();
for (const plan of produktionsplaene) {
  for (const position of plan.positionen) {
    initialStatuses.set(`${plan.id}:${position.rezeptId}`, position.status === "PREPARING" ? "ZUBEREITUNG" : position.status === "COMPLETED" ? "FERTIG" : "OFFEN");
  }
}

const statusStore = createStore<Map<string, KitchenWorkStatus>>(initialStatuses);
const packedStore = createStore<Set<string>>(new Set());

export function setWorkStatus(planId: string, rezeptId: string, status: KitchenWorkStatus) {
  statusStore.set((statuses) => new Map(statuses).set(`${planId}:${rezeptId}`, status));
}

export function toggleVerpackt(id: string) {
  packedStore.set((verpackt) => {
    const next = new Set(verpackt);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}

export function useWorkStatuses(): Map<string, KitchenWorkStatus> {
  return statusStore.useValue();
}
export function usePackedItems(): Set<string> {
  return packedStore.useValue();
}
