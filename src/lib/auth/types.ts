export type Rolle =
  | "SUPER_ADMIN"
  | "TENANT_OWNER"
  | "TENANT_ADMIN"
  | "FACILITY_ADMIN"
  | "FACILITY_USER"
  | "READ_ONLY"
  | "DRIVER";

export interface CurrentUser {
  id: string;
  tenantId: string | null;
  tenantName: string | null;
  facilityId: string | null;
  facilityName: string | null;
  name: string;
  email: string;
  role: Rolle;
  activeSupportSession: boolean;
  /** Set only when the white-label flag is enabled for this tenant and a logo is configured. */
  logoUrl: string | null;
  /** True when this session is a super admin actively impersonating this tenant — every field above
   * already describes the impersonated tenant, not the super admin's own account. */
  isImpersonation: boolean;
  impersonationExpiresAtUtc: string | null;
}

export interface LoginResponse {
  token: string;
  user: CurrentUser;
}
