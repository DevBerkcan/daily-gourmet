export type Rolle =
  | "SUPER_ADMIN"
  | "TENANT_OWNER"
  | "TENANT_ADMIN"
  | "KITCHEN_MANAGER"
  | "KITCHEN_STAFF"
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
}

export interface LoginResponse {
  token: string;
  user: CurrentUser;
}
