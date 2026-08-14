import type { KitchenWorkStatus } from "../types";
import { workStatusLabel } from "../data";

const styles: Record<KitchenWorkStatus, string> = {
  OFFEN: "bg-line text-ink-soft",
  BEREITSTELLUNG: "bg-info-soft text-info",
  ZUBEREITUNG: "bg-warn-soft text-warn",
  FERTIG: "bg-ok-soft text-ok",
  VERPACKT: "bg-basil-soft text-basil",
  ABHOLBEREIT: "bg-ok text-white",
};

export function KitchenStatus({ status }: { status: KitchenWorkStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>{workStatusLabel[status]}</span>;
}
