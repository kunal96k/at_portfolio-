import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildEmptyPublicBlogPage,
  createBlogBackend,
  deleteBlogBackend,
  fetchAdminBlogsPageBackend,
  fetchPublicBlogBySlugAsync,
  patchBlogFeaturedBackend,
  patchBlogStatusBackend,
} from './blogsService';

test('buildEmptyPublicBlogPage returns clean zero-mock empty state with default size 5', () => {
  const empty = buildEmptyPublicBlogPage();
  assert.equal(empty.items.length, 0);
  assert.equal(empty.totalItems, 0);
  assert.equal(empty.size, 5);
  assert.equal(empty.stats.scheduled, 0);
});

test('fetchAdminBlogsPageBackend sends JPA spec filters and resolves uploaded /api/files URLs', async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = '';

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    capturedUrl = String(input);
    return new Response(
      JSON.stringify({
        data: {
          items: [
            {
              id: 11,
              blogCode: 'BLOG-011',
              title: 'RHEL 9 Networking Labs',
              slug: 'rhel-9-networking-labs',
              category: 'Red Hat Linux',
              author: 'Arvind Thevar',
              readTime: '6 min read',
              guideLabel: 'Study Guide',
              excerpt: 'Complete nmcli & VLAN configuration walkthrough.',
              sections: [
                {
                  heading: '1. Overview',
                  body: 'Verify interfaces first.',
                  images: ['/api/files/blogs/section-1.png'],
                },
              ],
              tags: ['RHEL', 'nmcli'],
              coverImage: '/api/files/blogs/cover-1.jpg',
              coverImageName: 'cover-1.jpg',
              attachments: [
                {
                  id: 'att-1',
                  name: 'lab-guide.pdf',
                  type: 'application/pdf',
                  sizeBytes: 2048,
                  url: '/api/files/blogs/lab-guide.pdf',
                  uploadedAt: '2026-04-01T10:00:00Z',
                },
              ],
              attachmentCount: 1,
              featured: true,
              viewsCount: 18,
              displayOrder: 1,
              status: 'Scheduled',
              scheduledAt: '2026-12-01T09:30:00',
              createdAt: '2026-04-01T10:00:00Z',
              updatedAt: '2026-04-01T10:00:00Z',
            },
          ],
          page: 0,
          size: 5,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
          stats: {
            total: 1,
            published: 0,
            drafts: 0,
            scheduled: 1,
            featured: 1,
            totalViews: 18,
            totalDocuments: 1,
          },
          availableCategories: ['Red Hat Linux'],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }) as typeof fetch;

  try {
    const page = await fetchAdminBlogsPageBackend({
      search: 'nmcli',
      status: 'Scheduled',
      category: 'Red Hat Linux',
      featuredOnly: true,
      hasFilesOnly: true,
      page: 0,
      size: 5,
      sortBy: 'viewsCount',
      sortDir: 'desc',
    });

    assert.match(capturedUrl, /\/api\/blogs\/search\?/);
    assert.match(capturedUrl, /search=nmcli/);
    assert.match(capturedUrl, /status=Scheduled/);
    assert.match(capturedUrl, /featuredOnly=true/);
    assert.match(capturedUrl, /hasFilesOnly=true/);
    assert.match(capturedUrl, /sortBy=viewsCount/);
    assert.equal(page.items.length, 1);
    assert.equal(page.items[0].status, 'Scheduled');
    assert.equal(page.items[0].scheduledAt, '2026-12-01T09:30:00');
    assert.equal(page.stats.scheduled, 1);
    assert.equal(
      page.items[0].coverImage,
      'http://localhost:8080/api/files/blogs/cover-1.jpg'
    );
    assert.equal(
      page.items[0].sections[0].images?.[0],
      'http://localhost:8080/api/files/blogs/section-1.png'
    );
    assert.equal(
      page.items[0].attachments[0].url,
      'http://localhost:8080/api/files/blogs/lab-guide.pdf'
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('createBlogBackend, patchBlogStatusBackend (with scheduledAt), patchBlogFeaturedBackend, and deleteBlogBackend hit expected REST endpoints', async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ method: string; url: string; body?: string }> = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    calls.push({ method, url, body: init?.body ? String(init.body) : undefined });

    if (method === 'DELETE') {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          id: '25',
          blogCode: 'BLOG-025',
          title: 'Test Guide',
          slug: 'test-guide',
          category: 'Red Hat',
          author: 'Arvind Thevar',
          readTime: '4 min read',
          guideLabel: 'Study Guide',
          excerpt: 'Detailed excerpt with at least ten characters.',
          sections: [],
          tags: ['RHEL'],
          coverImage: '',
          attachments: [],
          attachmentCount: 0,
          featured: method === 'PATCH' && url.includes('/featured') ? false : true,
          viewsCount: 0,
          displayOrder: 1,
          status: method === 'PATCH' && url.includes('/status') ? 'Scheduled' : 'Published',
          scheduledAt: '2026-12-01T09:30:00',
          createdAt: '2026-04-01T10:00:00Z',
          updatedAt: '2026-04-01T10:00:00Z',
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }) as typeof fetch;

  try {
    await createBlogBackend({
      blogCode: 'BLOG-025',
      title: 'Test Guide',
      slug: 'test-guide',
      category: 'Red Hat',
      author: 'Arvind Thevar',
      readTime: '4 min read',
      guideLabel: 'Study Guide',
      excerpt: 'Detailed excerpt with at least ten characters.',
      sections: [],
      tags: ['RHEL'],
      coverImage: '',
      coverImageName: '',
      attachments: [],
      featured: true,
      displayOrder: 1,
      status: 'Published',
    });
    await patchBlogStatusBackend('25', 'Scheduled', '2026-12-01T09:30:00');
    await patchBlogFeaturedBackend('25', false);
    await deleteBlogBackend('25');

    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[1].method, 'PATCH');
    assert.match(calls[1].url, /\/api\/blogs\/25\/status$/);
    assert.match(calls[1].body ?? '', /2026-12-01T09:30:00/);
    assert.equal(calls[2].method, 'PATCH');
    assert.match(calls[2].url, /\/api\/blogs\/25\/featured$/);
    assert.equal(calls[3].method, 'DELETE');
    assert.match(calls[3].url, /\/api\/blogs\/25$/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fetchPublicBlogBySlugAsync returns null during SSR with no mock fallback', async () => {
  const res = await fetchPublicBlogBySlugAsync('preparing-for-rhcsa-rhce-on-rhel');
  assert.equal(res.fromApi, false);
  assert.equal(res.item, null);
});

test('fetchPublicBlogsPageAsync & fetchPublicBlogsAsync return empty zero-mock states when backend is empty or offline', async () => {
  const { fetchPublicBlogsPageAsync, fetchPublicBlogsAsync, fetchNextBlogCodeBackend } =
    await import('./blogsService');

  const ssrPage = await fetchPublicBlogsPageAsync({ page: 0, size: 5 });
  assert.equal(ssrPage.fromApi, false);
  assert.equal(ssrPage.page.items.length, 0);
  assert.equal(ssrPage.page.size, 5);

  const ssrList = await fetchPublicBlogsAsync();
  assert.equal(ssrList.fromApi, false);
  assert.deepEqual(ssrList.items, []);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({ data: { blogCode: 'BLOG-008' } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )) as typeof fetch;

  try {
    const nextCode = await fetchNextBlogCodeBackend();
    assert.equal(nextCode, 'BLOG-008');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fetchPublicBlogsAsync writes snapshot without emitting BLOGS_UPDATED_EVENT loop', async () => {
  const { BLOGS_STORAGE_KEY, BLOGS_UPDATED_EVENT, fetchPublicBlogsAsync } =
    await import('./blogsService');

  const store = new Map<string, string>();
  const dispatched: string[] = [];
  const origWindow = globalThis.window;
  const origCustomEvent = globalThis.CustomEvent;
  const originalFetch = globalThis.fetch;

  (globalThis as unknown as { CustomEvent: unknown }).CustomEvent = class MockCustomEvent {
    type: string;
    constructor(type: string) {
      this.type = type;
    }
  };
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => {
        store.set(key, val);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    },
    dispatchEvent: (ev: { type: string }) => {
      dispatched.push(ev.type);
      return true;
    },
  };

  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        data: [
          {
            id: 42,
            blogCode: 'BLOG-042',
            title: 'Production Hardening Checklist',
            slug: 'production-hardening-checklist',
            category: 'DevSecOps',
            author: 'Arvind Thevar',
            readTime: '5 min read',
            guideLabel: 'Guide',
            excerpt: 'Locking down public APIs.',
            sections: [],
            tags: ['Security'],
            status: 'Published',
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )) as typeof fetch;

  try {
    const res = await fetchPublicBlogsAsync();
    assert.equal(res.fromApi, true);
    assert.equal(res.items.length, 1);
    assert.ok(store.get(BLOGS_STORAGE_KEY));
    assert.equal(dispatched.includes(BLOGS_UPDATED_EVENT), false);
  } finally {
    globalThis.fetch = originalFetch;
    (globalThis as unknown as { window: unknown }).window = origWindow;
    (globalThis as unknown as { CustomEvent: unknown }).CustomEvent = origCustomEvent;
  }
});
