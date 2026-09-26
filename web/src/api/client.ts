const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = init?.body !== undefined;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Please check your connection",
      0,
    );
  }
  const text = await response.text();
  const body: unknown = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const errorBody = body as {
      error?: { message?: string; details?: unknown };
    } | null;
    throw new ApiError(
      errorBody?.error?.message ?? `Request failed (${response.status})`,
      response.status,
      errorBody?.error?.details,
    );
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
};
