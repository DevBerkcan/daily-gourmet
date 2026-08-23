import { getToken } from "@/lib/auth/token-storage";
import type { ApiEnvelope } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5080/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Builds a query string from an object, skipping null/undefined/empty values. */
export function toQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  const search = new URLSearchParams();
  for (const [key, value] of entries) search.set(key, String(value));
  return `?${search.toString()}`;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

/** Central fetch wrapper — attaches the bearer token, unwraps the {success,data,message}
 * envelope every backend endpoint returns, and normalizes failures into ApiError. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) return undefined as T;

  let payload: ApiEnvelope<T> | undefined;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON response (e.g. CSV export) — caller uses apiFetchBlob instead.
  }

  if (!response.ok || (payload && payload.success === false)) {
    throw new ApiError(payload?.message ?? `Anfrage fehlgeschlagen (${response.status}).`, response.status);
  }

  return (payload?.data ?? (undefined as T)) as T;
}

/** For endpoints returning a raw file (CSV/PDF export) rather than the JSON envelope. */
export async function apiFetchBlob(path: string): Promise<Blob> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, { headers });
  if (!response.ok) throw new ApiError(`Anfrage fehlgeschlagen (${response.status}).`, response.status);
  return response.blob();
}

/** For multipart file uploads (e.g. a supplier price-list import) — no Content-Type header is set
 * so the browser attaches its own multipart boundary; response still unwraps the usual envelope. */
export async function apiFetchUpload<T>(path: string, file: File): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}${path}`, { method: "POST", headers, body: formData });
  const payload: ApiEnvelope<T> = await response.json();
  if (!response.ok || payload.success === false) {
    throw new ApiError(payload?.message ?? `Anfrage fehlgeschlagen (${response.status}).`, response.status);
  }
  return payload.data as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
