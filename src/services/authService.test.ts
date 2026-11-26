import assert from 'node:assert/strict';
import test from 'node:test';
import {
  adminFetch,
  clearCachedCsrfToken,
  fetchAdminSessionBackend,
  getCachedCsrfToken,
  loginAdminBackend,
  logoutAdminBackend,
  setCachedCsrfToken,
} from './authService';

test('loginAdminBackend, fetchAdminSessionBackend, and logoutAdminBackend send credentials include and cache CSRF token', async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });

    if (url.endsWith('/api/auth/login')) {
      return new Response(
        JSON.stringify({
          data: {
            authenticated: true,
            user: {
              username: 'arvind',
              email: 'arvindthaver@gmail.com',
              name: 'Arvind Thevar',
              role: 'ADMIN',
            },
            activeSessions: 1,
            maxSessions: 10,
            csrfToken: 'csrf-login-token',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (url.endsWith('/api/auth/session')) {
      return new Response(
        JSON.stringify({
          data: {
            authenticated: true,
            user: {
              username: 'arvind',
              email: 'arvindthaver@gmail.com',
              name: 'Arvind Thevar',
              role: 'ADMIN',
            },
            activeSessions: 2,
            maxSessions: 10,
            csrfToken: 'csrf-session-token',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ data: { authenticated: false } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    clearCachedCsrfToken();

    const loginRes = await loginAdminBackend({
      identifier: 'arvind',
      password: 'Arvind@2026',
    });
    assert.equal(loginRes.authenticated, true);
    assert.equal(loginRes.maxSessions, 10);
    assert.equal(getCachedCsrfToken(), 'csrf-login-token');
    assert.equal(calls[0].init?.credentials, 'include');

    const sessRes = await fetchAdminSessionBackend();
    assert.equal(sessRes.activeSessions, 2);
    assert.equal(getCachedCsrfToken(), 'csrf-session-token');
    assert.equal(calls[1].init?.credentials, 'include');

    await logoutAdminBackend();
    assert.equal(getCachedCsrfToken(), null);
    assert.equal(calls[2].init?.credentials, 'include');
    assert.equal(
      (calls[2].init?.headers as Record<string, string>)['X-CSRF-TOKEN'],
      'csrf-session-token'
    );
  } finally {
    globalThis.fetch = originalFetch;
    clearCachedCsrfToken();
  }
});

test('adminFetch injects credentials: include on all requests and X-CSRF-TOKEN on mutating requests', async () => {
  const originalFetch = globalThis.fetch;
  const captured: Array<{ url: string; credentials?: RequestCredentials; headers?: HeadersInit }> = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    captured.push({
      url: String(input),
      credentials: init?.credentials,
      headers: init?.headers,
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    setCachedCsrfToken('csrf-abc-123');

    await adminFetch('http://localhost:8080/api/courses/search', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    assert.equal(captured[0].credentials, 'include');
    assert.equal(
      (captured[0].headers as Record<string, string>)['X-CSRF-TOKEN'],
      undefined
    );

    await adminFetch('http://localhost:8080/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test' }),
    });
    assert.equal(captured[1].credentials, 'include');
    assert.equal(
      (captured[1].headers as Record<string, string>)['X-CSRF-TOKEN'],
      'csrf-abc-123'
    );
  } finally {
    globalThis.fetch = originalFetch;
    clearCachedCsrfToken();
  }
});
