import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchAdminCoursesPageBackend,
  fetchPublicCoursesAsync,
} from './coursesService';

test('fetchAdminCoursesPageBackend sends JPA specification search/filter/pagination params and maps stats cleanly', async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = '';

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    capturedUrl = String(input);
    return new Response(
      JSON.stringify({
        data: {
          items: [
            {
              id: 7,
              domainCode: 'DOM-007',
              title: 'DevOps',
              slug: 'devops',
              category: 'DevOps & Automation',
              shortDescription: 'Containers and CI/CD pipelines.',
              detailedSyllabus: '1. Docker\n2. Kubernetes',
              coverImage: '/assets/images/corporate_it_workshop_1795164484663.jpg',
              displayOrder: 7,
              status: 'Published',
              createdAt: '2026-03-01T10:00:00',
              updatedAt: '2026-03-19T12:00:00',
            },
          ],
          page: 1,
          size: 5,
          totalItems: 6,
          totalPages: 2,
          hasNext: false,
          hasPrevious: true,
          stats: {
            total: 10,
            published: 9,
            drafts: 1,
            totalDocuments: 3,
          },
          availableCategories: ['Cloud Infrastructure', 'DevOps & Automation'],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }) as typeof fetch;

  try {
    const page = await fetchAdminCoursesPageBackend({
      search: 'devops',
      status: 'Published',
      category: 'DevOps & Automation',
      hasFilesOnly: true,
      page: 1,
      size: 5,
      sortBy: 'title',
      sortDir: 'desc',
    });

    const parsed = new URL(capturedUrl);
    assert.equal(parsed.pathname, '/api/courses/search');
    assert.equal(parsed.searchParams.get('search'), 'devops');
    assert.equal(parsed.searchParams.get('status'), 'Published');
    assert.equal(parsed.searchParams.get('category'), 'DevOps & Automation');
    assert.equal(parsed.searchParams.get('hasFilesOnly'), 'true');
    assert.equal(parsed.searchParams.get('page'), '1');
    assert.equal(parsed.searchParams.get('size'), '5');
    assert.equal(parsed.searchParams.get('sortBy'), 'title');
    assert.equal(parsed.searchParams.get('sortDir'), 'desc');

    assert.equal(page.items.length, 1);
    assert.equal(page.items[0].domainCode, 'DOM-007');
    assert.equal(page.totalItems, 6);
    assert.equal(page.totalPages, 2);
    assert.equal(page.stats.total, 10);
    assert.equal(page.stats.totalDocuments, 3);
    assert.deepEqual(page.availableCategories, [
      'Cloud Infrastructure',
      'DevOps & Automation',
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fetchPublicCoursesAsync safely returns built-in default domains during SSR without window', async () => {
  const list = await fetchPublicCoursesAsync();
  assert.ok(list.length >= 10);
  assert.ok(list.every((c) => c.status === 'Published'));
});
