// Thin wrapper around fetch. Every API call in this app goes through here,
// specifically so `credentials: 'include'` (needed to send/receive the
// session cookie cross-origin in dev) can never be forgotten on one call site.

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  // For file uploads (multipart/form-data) — pass a FormData instance
  // directly and it's sent as-is, without JSON-encoding it.
  formData?: FormData;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, formData } = options;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include", // always send/accept the session cookie
    headers: formData ? undefined : { "Content-Type": "application/json" },
    // Don't set Content-Type on a FormData request — the browser sets it
    // itself, including the multipart boundary, which Multer needs to parse
    // the request correctly. Setting it manually silently breaks uploads.
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? "Something went wrong");
  }

  return data as T;
}
