import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEmptyPublicGalleryPage,
  createGalleryItemBackend,
  deleteGalleryItemBackend,
  fetchAdminGalleryPageBackend,
  fetchPublicGalleryPageAsync,
  toggleGalleryFeaturedBackend,
  toggleGalleryStatusBackend,
  uploadGalleryImageBackend,
} from './galleryService';

test('buildEmptyPublicGalleryPage defaults cleanly to 12 items per page', () => {
  const empty = buildEmptyPublicGalleryPage({ page: 1 });
  assert.equal(empty.items.length, 0);
  assert.equal(empty.size, 12);
  assert.equal(empty.page, 1);
  assert.equal(empty.totalItems, 0);
  assert.equal(empty.totalPages, 1);
  assert.equal(empty.hasNext, false);
  assert.equal(empty.hasPrevious, false);
});

test('fetchPublicGalleryPageAsync renders empty state cleanly in SSR or when server unavailable', async () => {
  const ssrRes = await fetchPublicGalleryPageAsync({ page: 0, size: 12 });
  assert.equal(ssrRes.fromApi, false);
  assert.equal(ssrRes.page.items.length, 0);
  assert.equal(ssrRes.page.size, 12);
});

test('fetchAdminGalleryPageBackend, createGalleryItemBackend, toggles, upload & delete work with backend API format', async () => {
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    calls.push(`${method} ${url}`);

    if (url.includes('/api/files/upload')) {
      return new Response(
        JSON.stringify({
          data: {
            storedPath: 'gallery/1234-cisco.png',
            fileName: 'cisco.png',
            mimeType: 'image/png',
            sizeBytes: 1024,
            url: '/api/files/gallery/1234-cisco.png',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'GET' && url.includes('/api/gallery?')) {
      return new Response(
        JSON.stringify({
          data: {
            items: [
              {
                id: 1,
                galleryCode: 'GALLERY-001',
                title: 'Cisco Lab Rack',
                caption: 'Live switching stack',
                category: 'Labs',
                imageUrl: '/api/files/gallery/1234-cisco.png',
                imageName: 'cisco.png',
                altText: 'Cisco Lab Rack',
                tags: ['Cisco'],
                featured: true,
                displayOrder: 1,
                status: 'Published',
                takenAt: '2026-03-18',
                createdAt: '2026-03-18T10:00:00',
                updatedAt: '2026-03-18T10:00:00',
              },
            ],
            page: 0,
            size: 5,
            totalItems: 1,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
            stats: { total: 1, published: 1, drafts: 0, featured: 1 },
            availableCategories: ['Labs'],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'POST' && url.endsWith('/api/gallery')) {
      return new Response(
        JSON.stringify({
          data: {
            id: 1,
            galleryCode: 'GALLERY-001',
            title: 'Cisco Lab Rack',
            caption: 'Live switching stack',
            category: 'Labs',
            imageUrl: '/api/files/gallery/1234-cisco.png',
            imageName: 'cisco.png',
            altText: 'Cisco Lab Rack',
            tags: ['Cisco'],
            featured: true,
            displayOrder: 1,
            status: 'Published',
            takenAt: '2026-03-18',
            createdAt: '2026-03-18T10:00:00',
            updatedAt: '2026-03-18T10:00:00',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'PATCH' && url.endsWith('/status')) {
      return new Response(
        JSON.stringify({
          data: {
            id: 1,
            galleryCode: 'GALLERY-001',
            title: 'Cisco Lab Rack',
            category: 'Labs',
            imageUrl: '/api/files/gallery/1234-cisco.png',
            status: 'Draft',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'PATCH' && url.endsWith('/featured')) {
      return new Response(
        JSON.stringify({
          data: {
            id: 1,
            galleryCode: 'GALLERY-001',
            title: 'Cisco Lab Rack',
            category: 'Labs',
            imageUrl: '/api/files/gallery/1234-cisco.png',
            featured: false,
            status: 'Draft',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'DELETE' && url.endsWith('/api/gallery/1')) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unexpected request: ${method} ${url}`);
  }) as typeof fetch;

  try {
    const file = new File([new Uint8Array([1, 2, 3])], 'cisco.png', {
      type: 'image/png',
    });
    const uploaded = await uploadGalleryImageBackend(file);
    assert.equal(uploaded.storedPath, 'gallery/1234-cisco.png');

    const created = await createGalleryItemBackend({
      galleryCode: 'GALLERY-001',
      title: 'Cisco Lab Rack',
      caption: 'Live switching stack',
      category: 'Labs',
      imageUrl: uploaded.url,
      imageName: uploaded.fileName,
      altText: 'Cisco Lab Rack',
      tags: ['Cisco'],
      featured: true,
      displayOrder: 1,
      status: 'Published',
      takenAt: '2026-03-18',
    });
    assert.equal(created.galleryCode, 'GALLERY-001');
    assert.match(created.imageUrl, /\/api\/files\/gallery\/1234-cisco\.png$/);

    const adminPage = await fetchAdminGalleryPageBackend({
      search: 'Cisco',
      category: 'Labs',
      page: 0,
      size: 5,
    });
    assert.equal(adminPage.totalItems, 1);
    assert.equal(adminPage.stats.featured, 1);

    const toggledStatus = await toggleGalleryStatusBackend('1', 'Draft');
    assert.equal(toggledStatus.status, 'Draft');

    const toggledFeatured = await toggleGalleryFeaturedBackend('1', false);
    assert.equal(toggledFeatured.featured, false);

    await deleteGalleryItemBackend('1');
    assert.ok(calls.some((c) => c.includes('/api/files/upload?folder=gallery')));
    assert.ok(calls.some((c) => c.startsWith('DELETE ')));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
