/**
 * One typed fetch client shared by all three apps (R3).
 *
 * Handles the four things every screen needs from the network layer:
 *  - success            -> returns parsed JSON, typed by the caller
 *  - network error      -> thrown as ApiError({ kind: "network" })
 *  - non-2xx response   -> thrown as ApiError({ kind: "http", status })
 *  - abort on unmount   -> thrown as ApiError({ kind: "aborted" }), callers
 *                          should treat this as "ignore, component is gone"
 *
 * There are no write endpoints in this take-home, but R3 asks us to wire the
 * idempotency-key pattern anyway so it is already in place when writes show
 * up. `withIdempotencyKey` generates a stable per-call key and attaches it as
 * an `Idempotency-Key` header, which is the standard way to make retries of
 * a POST/PUT safe on the server (the server would dedupe on that key).
 */

export type ApiErrorKind = "network" | "http" | "aborted" | "parse";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

export interface ApiClientOptions {
  /** e.g. "http://localhost:4000". No trailing slash. */
  baseUrl: string;
  /** Extra headers sent on every request (e.g. hardcoded userId auth stand-in). */
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions {
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

function buildUrl(baseUrl: string, path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Generates a stable idempotency key for a single logical write attempt.
 * Callers should generate one key per user-initiated write and reuse it
 * across retries of that same write, so the server can dedupe.
 */
export function createIdempotencyKey(): string {
  return `idem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export class ApiClient {
  constructor(private readonly options: ApiClientOptions) {}

  async get<T>(path: string, requestOptions: RequestOptions = {}): Promise<T> {
    return this.request<T>("GET", path, undefined, requestOptions);
  }

  /**
   * Wired for future writes (R3): attaches an Idempotency-Key header so a
   * retried mutation is safe to send twice. No endpoint in this take-home
   * accepts writes yet, but the pattern is ready.
   */
  async mutate<T>(
    method: "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    body: unknown,
    requestOptions: RequestOptions & { idempotencyKey?: string } = {},
  ): Promise<T> {
    const idempotencyKey = requestOptions.idempotencyKey ?? createIdempotencyKey();
    return this.request<T>(method, path, body, {
      ...requestOptions,
      headers: {
        "Idempotency-Key": idempotencyKey,
        ...requestOptions.headers,
      },
    });
  }

  private async request<T>(
    method: string,
    path: string,
    body: unknown,
    { query, signal, headers }: RequestOptions,
  ): Promise<T> {
    const url = buildUrl(this.options.baseUrl, path, query);

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        signal,
        headers: {
          Accept: "application/json",
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...this.options.defaultHeaders,
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new ApiError("aborted", "Request was aborted");
      }
      throw new ApiError(
        "network",
        err instanceof Error ? err.message : "Network request failed",
      );
    }

    if (!response.ok) {
      let detail = "";
      try {
        detail = await response.text();
      } catch {
        // ignore — body may be empty or unreadable
      }
      throw new ApiError(
        "http",
        `Request to ${path} failed with status ${response.status}${detail ? `: ${detail}` : ""}`,
        response.status,
      );
    }

    try {
      // json-server returns 204 with no body for some verbs; guard against
      // an empty body throwing a parse error on .json().
      const text = await response.text();
      return (text ? JSON.parse(text) : (undefined as unknown)) as T;
    } catch (err) {
      throw new ApiError(
        "parse",
        err instanceof Error ? err.message : "Failed to parse response body",
      );
    }
  }
}
