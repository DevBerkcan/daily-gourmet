import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";

interface FeatureFlagStatusDto {
  key: string;
  enabled: boolean;
}

/** Resolved flag status for the caller's own tenant (GET /api/feature-flags) — the tenant-side
 * counterpart to the super-admin flag CRUD, actually used to gate UI/behavior. Disabled while
 * logged out (e.g. the login page) since the endpoint requires auth. */
function useFeatureFlagsQuery() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["feature-flags-mine"],
    queryFn: () => api.get<FeatureFlagStatusDto[]>("/feature-flags"),
    enabled: !!user,
  });
}

export function useFeatureFlags(): Record<string, boolean> {
  const query = useFeatureFlagsQuery();
  return Object.fromEntries((query.data ?? []).map((f) => [f.key, f.enabled]));
}

/** For a small piece of UI (a button, a section) where briefly defaulting to "off" while the flag
 * loads is harmless. */
export function useFeatureFlag(key: string): boolean {
  return useFeatureFlags()[key] ?? false;
}

/** For gating a whole page/area, where flashing a "not activated" message before the flag has even
 * loaded would be jarring — callers should treat `isLoading` as "don't render either state yet". */
export function useFeatureFlagGate(key: string): { enabled: boolean; isLoading: boolean } {
  const query = useFeatureFlagsQuery();
  const flags = Object.fromEntries((query.data ?? []).map((f) => [f.key, f.enabled]));
  return { enabled: flags[key] ?? false, isLoading: query.isLoading };
}
