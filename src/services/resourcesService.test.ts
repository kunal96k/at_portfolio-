import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFallbackPublicResourcePage,
  createResourceBackend,
  DEFAULT_WEBSITE_STUDY_NOTES,
  downloadResourceSafely,
  fetchAdminResourcesPageBackend,
  fetchResourcePreviewInfo,
  getResourcePreviewPageUrl,
  parseTopicLines,
  patchResourceDownloadAccessBackend,
  patchResourceFileAttachmentBackend,
  resolveResourceUrl,
  updateResourceBackend,
} from './resourcesService';

test('parseTopicLines strips numbering and bullets cleanly', () => {
  const topics = parseTopicLines('1. LVM Storage\n2) firewalld Rules\n- SELinux Booleans\n• systemd Units\n\n');
  assert.deepEqual(topics, [
    'LVM Storage',
    'firewalld Rules',
    'SELinux Booleans',
    'systemd Units',
  ]);
});

test('resolveResourceUrl qualifies /api/ paths and preserves static paths', () => {
  assert.equal(resolveResourceUrl(''), '');
  assert.equal(
    resolveResourceUrl('/study-materials/rhel-administration-notes.pdf'),
    '/study-materials/rhel-administration-notes.pdf'
  );
  assert.match(
    resolveResourceUrl('/api/resources/12/file'),
    /\/api\/resources\/12\/file$/
  );
});

test('buildFallbackPublicResourcePage filters by sectionType, domain, search and paginates', () => {
  const onlyLabs = buildFallbackPublicResourcePage({
    sectionType: 'Lab Sections',
    page: 0,
    size: 10,
  });
  assert.ok(onlyLabs.items.length > 0);
  assert.ok(onlyLabs.items.every((item) => item.sectionType === 'Lab Sections'));

  const searchRhel = buildFallbackPublicResourcePage({
    search: 'rhel',
    page: 0,
    size: 1,
  });
  assert.ok(searchRhel.totalItems >= 1);
  assert.equal(searchRhel.items.length, 1);
  assert.equal(searchRhel.totalPages, searchRhel.totalItems);
});

test('fetchAdminResourcesPageBackend sends JPA spec query params, signal, and maps server pagination', async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = '';
  let capturedSignal: AbortSignal | undefined;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    capturedUrl = String(input);
    capturedSignal = init?.signal ?? undefined;
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          items: [
            {
              id: 7,
              noteCode: 'NOTE-007',
              title: 'BGP Lab Notes',
              slug: 'bgp-lab-notes',
              sectionType: 'Lab Sections',
              domain: 'Cisco Networking',
              summary: 'Path selection and route-maps workbook.',
              topicsText: 'Local Preference\nAS-Path',
              topics: ['Local Preference', 'AS-Path'],
              fileName: 'bgp.pdf',
              fileType: 'PDF',
              mimeType: 'application/pdf',
              fileSizeBytes: 102400,
              fileSizeLabel: '100 KB',
              fileUrl: '/api/resources/7/file',
              hasUploadedFile: true,
              downloads: 5,
              displayOrder: 7,
              status: 'Published',
              createdAt: '2026-03-19T10:00:00',
              updatedAt: '2026-03-19T10:00:00',
            },
          ],
          page: 1,
          size: 5,
          totalItems: 6,
          totalPages: 2,
          hasNext: false,
          hasPrevious: true,
          stats: { total: 6, published: 5, drafts: 1, totalDownloads: 42 },
          availableDomains: ['Cisco Networking', 'Linux & RHEL'],
          availableFileTypes: ['PDF'],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }) as typeof fetch;

  try {
    const ac = new AbortController();
    const result = await fetchAdminResourcesPageBackend(
      {
        search: 'bgp',
        status: 'Published',
        sectionType: 'Lab Sections',
        domain: 'Cisco Networking',
        fileType: 'PDF',
        hasFileOnly: true,
        page: 1,
        size: 5,
        sortBy: 'downloads',
        sortDir: 'desc',
      },
      ac.signal
    );

    assert.equal(capturedSignal, ac.signal);
    const parsedUrl = new URL(capturedUrl);
    assert.equal(parsedUrl.searchParams.get('search'), 'bgp');
    assert.equal(parsedUrl.searchParams.get('status'), 'Published');
    assert.equal(parsedUrl.searchParams.get('sectionType'), 'Lab Sections');
    assert.equal(parsedUrl.searchParams.get('domain'), 'Cisco Networking');
    assert.equal(parsedUrl.searchParams.get('hasFileOnly'), 'true');
    assert.equal(parsedUrl.searchParams.get('page'), '1');
    assert.equal(parsedUrl.searchParams.get('size'), '5');
    assert.equal(parsedUrl.searchParams.get('sortBy'), 'downloads');
    assert.equal(parsedUrl.searchParams.get('sortDir'), 'desc');

    assert.equal(result.items[0].noteCode, 'NOTE-007');
    assert.equal(result.items[0].downloadEnabled, false);
    assert.equal(result.totalItems, 6);
    assert.equal(result.stats.totalDownloads, 42);
    assert.deepEqual(result.availableDomains, ['Cisco Networking', 'Linux & RHEL']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('createResourceBackend & updateResourceBackend surface backend validation error messages cleanly', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    return new Response(
      JSON.stringify({
        message: 'Validation failed',
        validationErrors: { summary: 'Summary must be between 10 and 4000 characters' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }) as typeof fetch;

  try {
    const samplePayload = {
      noteCode: 'NOTE-008',
      title: 'Test Note',
      slug: 'test-note',
      sectionType: 'Notes' as const,
      domain: 'Linux',
      summary: 'Short',
      topicsText: '',
      fileName: 'test.pdf',
      fileType: 'PDF',
      mimeType: 'application/pdf',
      fileSizeBytes: 0,
      fileUrl: '',
      downloadEnabled: false,
      displayOrder: 8,
      status: 'Draft' as const,
    };

    await assert.rejects(
      () => createResourceBackend(samplePayload),
      /Summary must be between 10 and 4000 characters/
    );
    await assert.rejects(
      () => updateResourceBackend('8', samplePayload),
      /Summary must be between 10 and 4000 characters/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('DEFAULT_WEBSITE_STUDY_NOTES and fallback defaults enforce Preview-Only mode', () => {
  assert.ok(DEFAULT_WEBSITE_STUDY_NOTES.length > 0);
  assert.ok(DEFAULT_WEBSITE_STUDY_NOTES.every((n) => n.downloadEnabled === false));
  assert.ok(DEFAULT_WEBSITE_STUDY_NOTES.every((n) => n.fileUrl === ''));
  const fallback = buildFallbackPublicResourcePage({ page: 0, size: 10 });
  assert.equal(fallback.stats.downloadEnabledCount, 0);
  assert.equal(fallback.stats.previewOnlyCount, DEFAULT_WEBSITE_STUDY_NOTES.length);
});

test('patchResourceDownloadAccessBackend, fetchResourcePreviewInfo, getResourcePreviewPageUrl, and downloadResourceSafely work cleanly', async () => {
  assert.match(
    getResourcePreviewPageUrl('12', 2, true),
    /\/api\/resources\/public\/12\/preview\/pages\/2$/
  );
  assert.match(
    getResourcePreviewPageUrl('12', 1, false),
    /\/api\/resources\/12\/preview\/pages\/1$/
  );

  const originalFetch = globalThis.fetch;
  let capturedPatchBody = '';
  let capturedDownloadAccessParam: string | null = null;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes('/download-access')) {
      capturedPatchBody = String(init?.body ?? '');
      return new Response(
        JSON.stringify({
          data: {
            id: 12,
            noteCode: 'NOTE-012',
            title: 'RHEL Labs',
            slug: 'rhel-labs',
            sectionType: 'Notes',
            domain: 'Linux & RHEL',
            summary: 'Hands-on commands.',
            downloadEnabled: true,
            previewMode: 'PDF_PAGES',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (url.includes('/preview-info')) {
      return new Response(
        JSON.stringify({
          data: {
            id: 12,
            noteCode: 'NOTE-012',
            title: 'RHEL Labs',
            slug: 'rhel-labs',
            sectionType: 'Notes',
            domain: 'Linux & RHEL',
            fileName: 'rhel-labs.pdf',
            fileType: 'PDF',
            mimeType: 'application/pdf',
            fileSizeLabel: '120 KB',
            summary: 'Hands-on commands.',
            topics: ['LVM'],
            downloadEnabled: false,
            previewMode: 'PDF_PAGES',
            pageCount: 4,
            status: 'Published',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (url.includes('/file')) {
      return new Response(
        JSON.stringify({
          message: 'Download is currently disabled for this study note.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    capturedDownloadAccessParam = new URL(url).searchParams.get('downloadEnabled');
    return new Response(JSON.stringify({ data: { items: [], stats: {} } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    await fetchAdminResourcesPageBackend({ downloadAccess: 'preview-only' });
    assert.equal(capturedDownloadAccessParam, 'false');

    const patched = await patchResourceDownloadAccessBackend('12', true);
    assert.equal(capturedPatchBody, '{"downloadEnabled":true}');
    assert.equal(patched.downloadEnabled, true);

    const preview = await fetchResourcePreviewInfo('12', true);
    assert.equal(preview.previewMode, 'PDF_PAGES');
    assert.equal(preview.pageCount, 4);
    assert.equal(preview.downloadEnabled, false);

    // Local guard blocks download immediately when downloadEnabled=false
    const baseNote = {
      ...DEFAULT_WEBSITE_STUDY_NOTES[0],
      id: '12',
      fileUrl: '/api/resources/12/file',
      hasFile: true,
      downloadEnabled: false,
    };
    const localBlocked = await downloadResourceSafely(baseNote);
    assert.equal(localBlocked.blocked, true);

    // Server 403 mid-session race condition returns clean blocked state instead of throwing
    const raceBlocked = await downloadResourceSafely({
      ...baseNote,
      downloadEnabled: true,
    });
    assert.equal(raceBlocked.blocked, true);
    assert.match(raceBlocked.message ?? '', /disabled/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('admin downloads bypass preview-only lock, no-file blocks cleanly, and patchResourceFileAttachmentBackend works', async () => {
  const originalFetch = globalThis.fetch;
  const calledEndpoints: string[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calledEndpoints.push(`${init?.method ?? 'GET'} ${url}`);
    if (url.includes('/file-attachment')) {
      const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          data: {
            id: 21,
            noteCode: 'NOTE-021',
            title: 'Kubernetes Lab Guide',
            slug: 'kubernetes-lab-guide',
            sectionType: 'Lab Sections',
            domain: 'DevOps',
            summary: 'Container lab.',
            hasFile: !body.removeFile,
            hasUploadedFile: Boolean(body.fileData) && !body.removeFile,
            fileName: body.removeFile ? '' : String(body.fileName ?? ''),
            fileSizeLabel: body.removeFile ? 'No file attached' : '12 KB',
            downloadEnabled: false,
            downloads: 4,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (url.includes('/api/resources/admin/21/file')) {
      return new Response('PDF binary bytes', {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      });
    }
    if (url.includes('/api/resources/admin/22/download')) {
      return new Response(
        JSON.stringify({
          data: {
            id: 22,
            noteCode: 'NOTE-022',
            title: 'External Link Resource',
            slug: 'external-link-resource',
            sectionType: 'Notes',
            domain: 'Cloud',
            summary: 'External documentation.',
            hasFile: true,
            fileUrl: 'https://example.com/guide.pdf',
            downloadEnabled: false,
            downloads: 8,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(JSON.stringify({ data: {} }), { status: 404 });
  }) as typeof fetch;

  try {
    // Attaching a file via Action Group modal API
    const attached = await patchResourceFileAttachmentBackend('21', {
      fileName: 'k8s-lab.pdf',
      fileType: 'PDF',
      fileData: 'data:application/pdf;base64,JVBERi0x',
      removeFile: false,
      downloadEnabled: false,
    });
    assert.equal(attached.hasFile, true);
    assert.equal(attached.hasUploadedFile, true);

    // Removing a file via Action Group modal API clears file state cleanly
    const removed = await patchResourceFileAttachmentBackend('21', {
      removeFile: true,
    });
    assert.equal(removed.hasFile, false);
    assert.equal(removed.fileName, '');
    assert.equal(removed.fileSizeLabel, 'No file attached');

    // No-file note cannot be downloaded even in admin mode
    const noFileResult = await downloadResourceSafely(removed, { isAdmin: true });
    assert.equal(noFileResult.blocked, true);

    // Admin download succeeds even when downloadEnabled is false!
    const lockedWithFile = {
      ...DEFAULT_WEBSITE_STUDY_NOTES[0],
      id: '21',
      hasFile: true,
      hasUploadedFile: true,
      fileUrl: '/api/resources/21/file',
      downloadEnabled: false,
      downloads: 4,
    };
    const adminDownload = await downloadResourceSafely(lockedWithFile, {
      isAdmin: true,
    });
    assert.equal(adminDownload.blocked, false);
    assert.equal(adminDownload.updatedDownloads, 5);
    assert.ok(
      calledEndpoints.some((e) =>
        e.includes('GET http://localhost:8080/api/resources/admin/21/file?download=true')
      )
    );

    // External URL in admin mode also skips downloadEnabled lock and increments admin download counter
    const externalLocked = {
      ...DEFAULT_WEBSITE_STUDY_NOTES[0],
      id: '22',
      hasFile: true,
      hasUploadedFile: false,
      fileUrl: 'https://example.com/guide.pdf',
      downloadEnabled: false,
      downloads: 7,
    };
    const extResult = await downloadResourceSafely(externalLocked, {
      isAdmin: true,
    });
    assert.equal(extResult.blocked, false);
    assert.equal(extResult.updatedDownloads, 8);
    assert.ok(
      calledEndpoints.some((e) =>
        e.includes('POST http://localhost:8080/api/resources/admin/22/download')
      )
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('uploadProjectFileBackend uploads multipart file and forwards storedFilePath on save/patch', async () => {
  const {
    uploadProjectFileBackend,
    createResourceBackend,
    patchResourceFileAttachmentBackend,
  } = await import('./resourcesService');

  const originalFetch = globalThis.fetch;
  let uploadedUrl = '';
  let sentBodyHasFile = false;
  let createJson = '';
  let patchJson = '';

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    if (method === 'POST' && url.includes('/api/files/upload')) {
      uploadedUrl = url;
      sentBodyHasFile = init?.body instanceof FormData;
      return new Response(
        JSON.stringify({
          data: {
            storedPath: 'resources/12345_rhel-guide.pdf',
            fileName: 'rhel-guide.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 2048,
            url: '/api/files/resources/12345_rhel-guide.pdf',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (method === 'POST' && url.endsWith('/api/resources')) {
      createJson = String(init?.body ?? '');
      return new Response(
        JSON.stringify({
          data: {
            id: 50,
            noteCode: 'NOTE-050',
            title: 'RHEL Stored Note',
            slug: 'rhel-stored-note',
            sectionType: 'Notes',
            domain: 'Linux & RHEL',
            summary: 'Stored physically in uploads/resources directory.',
            fileName: 'rhel-guide.pdf',
            fileType: 'PDF',
            mimeType: 'application/pdf',
            fileSizeBytes: 2048,
            fileUrl: '/api/resources/50/file',
            hasFile: true,
            hasUploadedFile: true,
            downloadEnabled: false,
            downloads: 0,
            displayOrder: 50,
            status: 'Published',
            createdAt: '2026-04-01T10:00:00Z',
            updatedAt: '2026-04-01T10:00:00Z',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (method === 'PATCH' && url.endsWith('/api/resources/50/file-attachment')) {
      patchJson = String(init?.body ?? '');
      return new Response(
        JSON.stringify({
          data: {
            id: 50,
            noteCode: 'NOTE-050',
            title: 'RHEL Stored Note',
            slug: 'rhel-stored-note',
            sectionType: 'Notes',
            domain: 'Linux & RHEL',
            summary: 'Stored physically in uploads/resources directory.',
            fileName: 'rhel-guide.pdf',
            fileType: 'PDF',
            mimeType: 'application/pdf',
            fileSizeBytes: 2048,
            fileUrl: '/api/resources/50/file',
            hasFile: true,
            hasUploadedFile: true,
            downloadEnabled: true,
            downloads: 0,
            displayOrder: 50,
            status: 'Published',
            createdAt: '2026-04-01T10:00:00Z',
            updatedAt: '2026-04-01T10:00:00Z',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    throw new Error(`Unexpected fetch ${method} ${url}`);
  }) as typeof fetch;

  try {
    const file = new File([new Uint8Array([37, 80, 68, 70])], 'rhel-guide.pdf', {
      type: 'application/pdf',
    });
    const uploaded = await uploadProjectFileBackend(file, 'resources');
    assert.match(uploadedUrl, /\/api\/files\/upload\?folder=resources$/);
    assert.equal(sentBodyHasFile, true);
    assert.equal(uploaded.storedPath, 'resources/12345_rhel-guide.pdf');
    assert.equal(uploaded.fileName, 'rhel-guide.pdf');
    assert.match(uploaded.url, /\/api\/files\/resources\/12345_rhel-guide\.pdf$/);

    await createResourceBackend({
      noteCode: 'NOTE-050',
      title: 'RHEL Stored Note',
      slug: 'rhel-stored-note',
      sectionType: 'Notes',
      domain: 'Linux & RHEL',
      summary: 'Stored physically in uploads/resources directory.',
      topicsText: '',
      fileName: uploaded.fileName,
      fileType: 'PDF',
      mimeType: uploaded.mimeType,
      fileSizeBytes: uploaded.sizeBytes,
      fileUrl: '',
      storedFilePath: uploaded.storedPath,
      downloadEnabled: false,
      displayOrder: 50,
      status: 'Published',
    });
    assert.match(createJson, /"storedFilePath":"resources\/12345_rhel-guide\.pdf"/);

    await patchResourceFileAttachmentBackend('50', {
      fileName: uploaded.fileName,
      fileType: 'PDF',
      mimeType: uploaded.mimeType,
      fileSizeBytes: uploaded.sizeBytes,
      fileUrl: '',
      storedFilePath: uploaded.storedPath,
      removeFile: false,
      downloadEnabled: true,
    });
    assert.match(patchJson, /"storedFilePath":"resources\/12345_rhel-guide\.pdf"/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
