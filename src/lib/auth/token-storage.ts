/** Client-only JWT persistence. The backend is stateless (bearer tokens, no server-side session),
 * so the token just lives in localStorage — guarded everywhere since this module is also imported
 * from code that runs during SSR/build where `window` doesn't exist. */
const TOKEN_KEY = "dg_token";
const REAL_TOKEN_KEY = "dg_token_real_before_impersonation";

/** Exposed so AuthContext's cross-tab `storage` listener (SEC-06) knows which keys to react to,
 * without hardcoding them a second time or reacting to unrelated localStorage writes from elsewhere. */
export const TOKEN_STORAGE_KEYS = [TOKEN_KEY, REAL_TOKEN_KEY];

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REAL_TOKEN_KEY);
}

/** Stashes the super admin's real token and swaps the active one to the impersonation token — every
 * existing apiFetch* call reads the single TOKEN_KEY, so this makes them "just work" against the
 * impersonated tenant without touching a single call site. */
export function startImpersonation(impersonationToken: string): void {
  if (typeof window === "undefined") return;
  const real = getToken();
  if (real) window.localStorage.setItem(REAL_TOKEN_KEY, real);
  setToken(impersonationToken);
}

/** Restores the real super-admin token, dropping the impersonation one — used both by the explicit
 * "Beenden" action and by AuthContext's 401 handler when the backing session got revoked/expired. */
export function endImpersonation(): void {
  if (typeof window === "undefined") return;
  const real = window.localStorage.getItem(REAL_TOKEN_KEY);
  window.localStorage.removeItem(REAL_TOKEN_KEY);
  if (real) setToken(real);
  else clearToken();
}

export function isImpersonating(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(REAL_TOKEN_KEY) !== null;
}
