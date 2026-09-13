export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * Browser-side fetch wrapper. Always sends credentials so the API's httpOnly
 * session cookie (scoped to the API's own domain) rides along — this only
 * works for direct browser -> API calls, not server-side Next.js requests.
 * See client auth-gating note in the dashboard/admin layouts.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let details: unknown;
    try {
      details = await res.json();
    } catch {
      // no JSON body
    }
    throw new ApiError(
      (details as { error?: string })?.error ?? `Request failed with status ${res.status}`,
      res.status,
      details,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
