import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fetchUnreadNotificationsBackend,
  markAllNewEnquiriesReadBackend,
  NOTIFICATION_LIMIT,
} from './enquiryApi';

test('fetchUnreadNotificationsBackend requests status=New top 5 and strips any read items', async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = '';
  try {
    globalThis.fetch = async (input) => {
      capturedUrl = String(input);
      const rawItems = [
        { id: '1', name: 'Lead 1', status: 'New', createdAt: '2026-11-26T10:06:00' },
        { id: '2', name: 'Read Lead', status: 'Read', createdAt: '2026-11-26T10:05:00' },
        { id: '3', name: 'Lead 3', status: 'New', createdAt: '2026-11-26T10:04:00' },
        { id: '4', name: 'Lead 4', status: 'New', createdAt: '2026-11-26T10:03:00' },
        { id: '5', name: 'Lead 5', status: 'New', createdAt: '2026-11-26T10:02:00' },
        { id: '6', name: 'Lead 6', status: 'New', createdAt: '2026-11-26T10:01:00' },
        { id: '7', name: 'Lead 7', status: 'New', createdAt: '2026-11-26T10:00:00' },
      ];
      return new Response(
        JSON.stringify({
          data: {
            items: rawItems,
            page: 0,
            size: 5,
            totalItems: 6,
            totalPages: 2,
            hasNext: true,
            hasPrevious: false,
            stats: { total: 7, newCount: 6, readCount: 1, repliedCount: 0, archivedCount: 0 },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const result = await fetchUnreadNotificationsBackend(12);
    const parsedUrl = new URL(capturedUrl);

    assert.equal(parsedUrl.searchParams.get('status'), 'New');
    assert.equal(parsedUrl.searchParams.get('size'), String(NOTIFICATION_LIMIT));
    assert.equal(parsedUrl.searchParams.get('sortBy'), 'createdAt');
    assert.equal(parsedUrl.searchParams.get('sortDir'), 'desc');
    assert.equal(result.items.length, NOTIFICATION_LIMIT);
    assert.equal(result.totalUnread, 6);
    assert.equal(result.totalEnquiries, 7);
    assert.ok(result.items.every((item) => item.status === 'New'));
    assert.equal(
      result.items.some((item) => item.name === 'Read Lead'),
      false
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('markAllNewEnquiriesReadBackend PATCHes /api/enquiries/mark-all-read and returns updatedCount', async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = '';
  let capturedMethod = '';
  try {
    globalThis.fetch = async (input, init) => {
      capturedUrl = String(input);
      capturedMethod = String(init?.method ?? 'GET');
      return new Response(
        JSON.stringify({ success: true, data: { updatedCount: 3 } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const updatedCount = await markAllNewEnquiriesReadBackend();
    assert.equal(capturedMethod, 'PATCH');
    assert.ok(capturedUrl.endsWith('/api/enquiries/mark-all-read'));
    assert.equal(updatedCount, 3);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
