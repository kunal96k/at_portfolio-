import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BATCHES_STORAGE_KEY,
  buildEmptyPublicBatchPage,
  formatBatchDateDisplay,
  formatBatchTimeDisplay,
  isBatchStarted,
  loadPublicBatchesFromStorage,
  parseBatchModules,
  saveBatchesSnapshotToStorage,
  type ManagedBatch,
} from './batchesService';

function setupMockWindowStorage(): () => void {
  const store = new Map<string, string>();
  const origWindow = globalThis.window;
  const origCustomEvent = globalThis.CustomEvent;

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
    dispatchEvent: () => true,
  };

  return () => {
    (globalThis as unknown as { window: unknown }).window = origWindow;
    (globalThis as unknown as { CustomEvent: unknown }).CustomEvent = origCustomEvent;
  };
}

function makeBatch(overrides: Partial<ManagedBatch> = {}): ManagedBatch {
  return {
    id: '1',
    batchCode: 'BATCH-001',
    title: 'Red Hat Linux (RHEL) Upcoming Cohort',
    slug: 'red-hat-linux-upcoming-cohort',
    shortDescription: 'Hands-on RHEL lab training.',
    detailedContent: '1. LVM Storage\n2. systemd Services',
    modules: ['LVM Storage', 'systemd Services'],
    category: 'Linux',
    relatedCourse: 'Red Hat Linux (RHEL)',
    batchDate: '2028-06-15',
    batchTime: '19:00',
    mode: 'Classroom & Online',
    seatsTotal: 20,
    location: 'Nashik Classroom & Live Online',
    coverImage: '/assets/images/linux_rhel_lab_1795164484674.jpg',
    coverImageName: 'linux.jpg',
    tags: ['rhel'],
    learningLevel: 'Intermediate',
    attachments: [],
    displayOrder: 1,
    featured: false,
    status: 'Published',
    createdAt: '2026-01-01T10:00:00',
    updatedAt: '2026-01-01T10:00:00',
    ...overrides,
  };
}

test('loadPublicBatchesFromStorage returns empty array when storage has no data (no mock seeds)', () => {
  const restore = setupMockWindowStorage();
  try {
    assert.deepEqual(loadPublicBatchesFromStorage(), []);
  } finally {
    restore();
  }
});

test('buildEmptyPublicBatchPage defaults to size 5 with empty items', () => {
  const empty = buildEmptyPublicBatchPage();
  assert.deepEqual(empty.items, []);
  assert.equal(empty.size, 5);
  assert.equal(empty.totalItems, 0);
  assert.equal(empty.totalPages, 1);
  assert.equal(empty.hasNext, false);
  assert.equal(empty.hasPrevious, false);
});

test('isBatchStarted detects past vs future schedules accurately', () => {
  const fixedNow = new Date(2026, 5, 10, 14, 0, 0).getTime();

  const startedByDate = makeBatch({
    batchDate: '2026-06-09',
    batchTime: '19:00',
  });
  const startedSameDayEarlierTime = makeBatch({
    batchDate: '2026-06-10',
    batchTime: '10:00',
  });
  const upcomingSameDayLaterTime = makeBatch({
    batchDate: '2026-06-10',
    batchTime: '19:00',
  });
  const upcomingFutureDate = makeBatch({
    batchDate: '2026-06-15',
    batchTime: '09:00',
  });

  assert.equal(isBatchStarted(startedByDate, fixedNow), true);
  assert.equal(isBatchStarted(startedSameDayEarlierTime, fixedNow), true);
  assert.equal(isBatchStarted(upcomingSameDayLaterTime, fixedNow), false);
  assert.equal(isBatchStarted(upcomingFutureDate, fixedNow), false);
});

test('loadPublicBatchesFromStorage excludes Drafts and already-started batches', () => {
  const restore = setupMockWindowStorage();
  try {
    const pastBatch = makeBatch({
      id: 'past',
      batchCode: 'BATCH-001',
      title: 'Already Started Batch',
      batchDate: '2020-01-10',
      batchTime: '10:00',
      status: 'Published',
    });
    const draftFuture = makeBatch({
      id: 'draft',
      batchCode: 'BATCH-002',
      title: 'Future Draft Batch',
      batchDate: '2099-01-10',
      batchTime: '19:00',
      status: 'Draft',
    });
    const upcomingLive = makeBatch({
      id: 'upcoming',
      batchCode: 'BATCH-003',
      title: 'Upcoming Live Cohort',
      batchDate: '2099-02-15',
      batchTime: '19:00',
      status: 'Published',
    });

    saveBatchesSnapshotToStorage([pastBatch, draftFuture, upcomingLive]);
    assert.ok(window.localStorage.getItem(BATCHES_STORAGE_KEY));

    const publicBatches = loadPublicBatchesFromStorage();
    assert.equal(publicBatches.length, 1);
    assert.equal(publicBatches[0].id, 'upcoming');
  } finally {
    restore();
  }
});

test('batch date/time display and module parsing utilities format cleanly', () => {
  assert.equal(formatBatchDateDisplay('2026-04-12'), '12 Apr 2026');
  assert.equal(formatBatchTimeDisplay('19:00'), '07:00 PM IST');
  assert.deepEqual(
    parseBatchModules('1. First Module\n2. Second Module\n- Third Module'),
    ['First Module', 'Second Module', 'Third Module']
  );
});
