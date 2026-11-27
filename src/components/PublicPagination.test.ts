import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPaginationTokens } from './PublicPagination';

test('buildPaginationTokens renders all pages when totalPages <= 10 and ellipses when > 10', () => {
  assert.deepEqual(buildPaginationTokens(0, 1), []);
  assert.deepEqual(buildPaginationTokens(0, 6), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(buildPaginationTokens(5, 10), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  // 17 pages (e.g. 100+ items at 6/page): compact sliding window with ellipses
  const startTokens = buildPaginationTokens(0, 17);
  assert.deepEqual(startTokens, [0, 1, 2, 3, 4, 5, 6, 'ellipsis', 16]);

  const middleTokens = buildPaginationTokens(8, 17);
  assert.deepEqual(middleTokens, [0, 'ellipsis', 6, 7, 8, 9, 10, 'ellipsis', 16]);

  const endTokens = buildPaginationTokens(16, 17);
  assert.deepEqual(endTokens, [0, 'ellipsis', 10, 11, 12, 13, 14, 15, 16]);
});
