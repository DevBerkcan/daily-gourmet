"use client";

import { useRouter } from "next/navigation";
import { Eye, LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth/AuthContext";
import { endImpersonation } from "@/lib/auth/token-storage";
import { useEndeSupportSitzung } from "@/lib/services/support";
import { ApiError } from "@/lib/api/client";

/** Shown to the SUPER ADMIN while they're actively impersonating a tenant (see support-center.tsx's
 * "Im Mandanten prüfen") — the counterpart to SupportModeBanner, which is shown to the TENANT while
 * a support session is active. Both are driven by the same SupportSession, so admin/layout.tsx shows
 * exactly one of the two based on user.isImpersonation rather than both at once. */
export function ImpersonationBanner() {
  const router = useRouter();
  const toast = useToast();
  const { user, refresh } = useAuth();
  const endeSitzung = useEndeSupportSitzung();

  if (!user?.isImpersonation) return null;

  const endetUm = user.impersonationExpiresAtUtc
    ? new Date(user.impersonationExpiresAtUtc).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    : null;

  async function beenden() {
    try {
      await endeSitzung.mutateAsync();
    } catch (error) {
      // Even if ending the session server-side fails (e.g. already expired), still drop the
      // impersonation token locally — staying stuck "as the tenant" would be worse than a stale
      // SupportSession row.
      if (!(error instanceof ApiError)) throw error;
    } finally {
      endImpersonation();
      await refresh();
      router.push("/super-admin/support");
      toast.success("Supportsitzung beendet.");
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-card border-2 border-saffron bg-saffron-soft px-5 py-4 no-print">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-saffron text-white">
          <Eye size={19} aria-hidden />
        </span>
        <div>
          <p className="font-semibold text-ink">Ansicht als {user.tenantName}</p>
          <p className="mt-0.5 text-sm text-muted">
            Sie sehen die Verwaltung als dieser Mandant{endetUm ? ` · endet automatisch ${endetUm} Uhr` : ""} · alle Aktionen werden protokolliert.
          </p>
        </div>
      </div>
      <Button variant="secondary" onClick={beenden} disabled={endeSitzung.isPending}>
        <LogOut size={15} aria-hidden /> {endeSitzung.isPending ? "Wird beendet …" : "Beenden"}
      </Button>
    </div>
  );
}
