const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080';

export const ADMIN_SESSION_EXPIRED_EVENT = 'arvind-admin-session-expired';

export interface AdminAuthUser {
  username: string;
  email: string;
  name: string;
  role: string;
}

export interface AdminSessionState {
  authenticated: boolean;
  user: AdminAuthUser | null;
  activeSessions: number;
  maxSessions: number;
  csrfToken: string | null;
}

export interface AdminLoginCredentials {
  identifier: string;
  password: string;
}

let cachedCsrfToken: string | null = null;

function authApiBase(): string {
  return `${API_BASE_URL.replace(/\/+$/, '')}/api/auth`;
}

function mergePlainHeaders(
  headersInit: HeadersInit | undefined,
  extraHeaders: Record<string, string>
): HeadersInit | undefined {
  if (!headersInit && Object.keys(extraHeaders).length === 0) {
    return undefined;
  }
  const merged: Record<string, string> = {};
  if (headersInit instanceof Headers) {
    headersInit.forEach((value, key) => {
      merged[key] = value;
    });
  } else if (Array.isArray(headersInit)) {
    headersInit.forEach(([key, value]) => {
      merged[key] = value;
    });
  } else if (headersInit && typeof headersInit === 'object') {
    Object.assign(merged, headersInit);
  }
  Object.assign(merged, extraHeaders);
  return merged;
}

export function clearCachedCsrfToken(): void {
  cachedCsrfToken = null;
}

export function setCachedCsrfToken(token: string | null): void {
  cachedCsrfToken = token && token.trim() ? token.trim() : null;
}

export function getCachedCsrfToken(): string | null {
  return cachedCsrfToken;
}

async function parseAuthApiError(response: Response): Promise<string> {
  try {
    const text = await response.text();
    if (!text) return `Authentication error (${response.status})`;
    const json = JSON.parse(text) as { message?: string };
    if (json?.message) return json.message;
  } catch {
    // Non-JSON response fallback
  }
  return `Authentication error (${response.status})`;
}

export async function fetchAdminSessionBackend(
  signal?: AbortSignal
): Promise<AdminSessionState> {
  const response = await fetch(`${authApiBase()}/session`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error(await parseAuthApiError(response));
  }
  const json = (await response.json()) as { data?: AdminSessionState };
  const data = json?.data ?? {
    authenticated: false,
    user: null,
    activeSessions: 0,
    maxSessions: 10,
    csrfToken: null,
  };
  setCachedCsrfToken(data.csrfToken ?? null);
  return data;
}

export async function loginAdminBackend(
  credentials: AdminLoginCredentials
): Promise<AdminSessionState> {
  const response = await fetch(`${authApiBase()}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      identifier: credentials.identifier.trim(),
      password: credentials.password,
    }),
  });
  if (!response.ok) {
    throw new Error(await parseAuthApiError(response));
  }
  const json = (await response.json()) as { data?: AdminSessionState };
  if (!json?.data || !json.data.authenticated) {
    throw new Error('Authentication failed.');
  }
  setCachedCsrfToken(json.data.csrfToken ?? null);
  return json.data;
}

export async function logoutAdminBackend(): Promise<void> {
  try {
    await fetch(`${authApiBase()}/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  } finally {
    clearCachedCsrfToken();
  }
}

/**
 * Authenticated session wrapper for all Admin Dashboard requests:
 * - Always attaches HttpOnly session cookie via credentials: 'include'
 * - Lazily ensures & sends X-CSRF-TOKEN header on mutating browser requests
 * - Broadcasts ADMIN_SESSION_EXPIRED_EVENT on 401 Unauthorized responses
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const method = String(init.method ?? 'GET').toUpperCase();
  const isMutating =
    method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';

  if (
    isMutating &&
    !cachedCsrfToken &&
    typeof window !== 'undefined' &&
    typeof fetch === 'function'
  ) {
    try {
      await fetchAdminSessionBackend(init.signal ?? undefined);
    } catch {
      // Allow actual request to run and surface exact status/error
    }
  }

  const extraHeaders: Record<string, string> = {};
  if (isMutating && cachedCsrfToken) {
    extraHeaders['X-CSRF-TOKEN'] = cachedCsrfToken;
  }

  const nextHeaders = mergePlainHeaders(init.headers, extraHeaders);
  const response = await fetch(input, {
    ...init,
    credentials: 'include',
    ...(nextHeaders ? { headers: nextHeaders } : {}),
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    clearCachedCsrfToken();
    window.dispatchEvent(new CustomEvent(ADMIN_SESSION_EXPIRED_EVENT));
  }

  return response;
}
