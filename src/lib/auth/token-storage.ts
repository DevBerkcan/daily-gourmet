/** Client-only JWT persistence. The backend is stateless (bearer tokens, no server-side session),
 * so the token just lives in localStorage — guarded everywhere since this module is also imported
 * from code that runs during SSR/build where `window` doesn't exist. */
const TOKEN_KEY = "dg_token";

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
}
