import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApiEndpointUrl, getApiBaseUrl } from './api';
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

test('all admin search services resolve relative /api paths safely under same-origin VITE_API_BASE_URL=/', async () => {
  const originalEnv = process.env.VITE_API_BASE_URL;
  const originalFetch = globalThis.fetch;
  const requestedUrls: string[] = [];

  assert.equal(
    buildApiEndpointUrl('/api/blogs/search', new URLSearchParams({ page: '0', size: '5' })),
    '/api/blogs/search?page=0&size=5'
  );
  assert.equal(
    buildApiEndpointUrl('https://api.arvindthevar.com/api/blogs/search', new URLSearchParams({ page: '1' })),
    'https://api.arvindthevar.com/api/blogs/search?page=1'
  );

  process.env.VITE_API_BASE_URL = '/';
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrls.push(String(input));
    return new Response(
      JSON.stringify({
        data: { items: [], page: 0, size: 5, totalItems: 0, totalPages: 1, hasNext: false, hasPrevious: false },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }) as typeof fetch;

  try {
    const [batchesMod, blogsMod, enquiriesMod, galleryMod, testimonialsMod] = await Promise.all([
      import('../services/batchesService'),
      import('../services/blogsService'),
      import('../services/enquiryApi'),
      import('../services/galleryService'),
      import('../services/testimonialsService'),
    ]);

    await batchesMod.fetchAdminBatchesPageBackend({ page: 0, size: 5 });
    await blogsMod.fetchAdminBlogsPageBackend({ page: 0, size: 5 });
    await enquiriesMod.fetchAdminEnquiriesPageBackend({ page: 0, size: 5 });
    await galleryMod.fetchAdminGalleryPageBackend({ page: 0, size: 5 });
    await testimonialsMod.fetchAdminTestimonialsPageBackend({ page: 0, size: 5 });

    assert.equal(requestedUrls.length, 5);
    for (const url of requestedUrls) {
      assert.ok(url.startsWith('/api/'), `Expected root-relative /api/... URL, got ${url}`);
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalEnv === undefined) {
      delete process.env.VITE_API_BASE_URL;
    } else {
      process.env.VITE_API_BASE_URL = originalEnv;
    }
  }
});
