import assert from 'node:assert/strict';
import test from 'node:test';
import { getApiBaseUrl } from './api';
import { PRODUCTION_SITE_URL, SITE_URL } from './site';

test('site configuration defaults canonical origin to HTTPS https://arvindthevar.com', () => {
  assert.equal(PRODUCTION_SITE_URL, 'https://arvindthevar.com');
  assert.equal(SITE_URL, 'https://arvindthevar.com');
});

test('getApiBaseUrl safely resolves HTTPS API URL in production and avoids mixed-content localhost calls', () => {
  const originalWindow = (globalThis as { window?: unknown }).window;
  const originalEnv = process.env.VITE_API_BASE_URL;

  try {
    delete process.env.VITE_API_BASE_URL;
    assert.equal(getApiBaseUrl(), 'http://localhost:8080');

    // Simulating live browser at https://arvindthevar.com without env var
    (globalThis as { window?: unknown }).window = {
      location: { hostname: 'arvindthevar.com', protocol: 'https:' },
    };
    assert.equal(getApiBaseUrl(), 'https://api.arvindthevar.com');

    // Simulating accidental localhost env leak onto HTTPS production build
    process.env.VITE_API_BASE_URL = 'http://localhost:8080';
    assert.equal(getApiBaseUrl(), 'https://api.arvindthevar.com');

    // Simulating same-origin Nginx reverse proxy config
    process.env.VITE_API_BASE_URL = '/';
    assert.equal(getApiBaseUrl(), '');

    // Simulating custom HTTPS API subdomain
    process.env.VITE_API_BASE_URL = 'https://backend.arvindthevar.com/';
    assert.equal(getApiBaseUrl(), 'https://backend.arvindthevar.com');
  } finally {
    if (originalEnv === undefined) {
      delete process.env.VITE_API_BASE_URL;
    } else {
      process.env.VITE_API_BASE_URL = originalEnv;
    }
    if (originalWindow === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      (globalThis as { window?: unknown }).window = originalWindow;
    }
  }
});
