import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampToMaxWords,
  countWords,
  filterAndSortBatches,
  filterAndSortCourses,
  formatFileSize,
  generateNextBatchCode,
  generateNextDomainCode,
  generateNextNoteCode,
  generateUniqueSlug,
  MAX_UPLOAD_BYTES,
  paginateList,
  slugifyText,
  validateBatchForm,
  validateCourseForm,
  validateResourceForm,
  validateUploadFile,
} from './adminLogic';
import type {
  Batch,
  BatchFormValues,
  BatchQueryState,
} from '../batches/types/batch';
import type {
  CourseDomain,
  CourseDomainFormPayload,
  CourseQueryState,
} from '../courses/types/course';
import type { StudyResourceFormPayload } from '../resources/types/resource';

const SAMPLE_BATCHES: Batch[] = [
  {
    id: 'b1',
    batchCode: 'BATCH-CCNP-01',
    title: 'BGP Path Selection Lab Batch',
    slug: 'bgp-path-selection-lab-batch',
    shortDescription: 'Sample routing topology batch covering BGP attributes.',
    detailedContent: '1. Verify local preference\n2. Tune AS-path prepending and MED',
    modules: ['Verify local preference', 'Tune AS-path prepending and MED'],
    category: 'Networking',
    relatedCourse: 'Cisco CCNA & CCNP',
    batchDate: '15 Apr 2026',
    batchTime: 'Sat–Sun · 10:00 AM IST',
    mode: 'Classroom & Online',
    seatsTotal: 18,
    location: 'Nashik & Live Online',
    coverImage: '/assets/images/cisco_network_lab_1795164486189.jpg',
    tags: ['bgp', 'routing', 'ccnp'],
    learningLevel: 'Advanced',
    attachments: [
      {
        id: 'att-1',
        name: 'ccnp-brochure.pdf',
        type: 'application/pdf',
        sizeBytes: 245000,
        uploadedAt: '2026-03-10T12:00:00.000Z',
      },
    ],
    displayOrder: 2,
    featured: true,
    status: 'Published',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-03-10T12:00:00.000Z',
  },
  {
    id: 'b2',
    batchCode: 'BATCH-RHEL-02',
    title: 'RHEL 9 Storage & LVM Setup Batch',
    slug: 'rhel-9-storage-lvm-setup-batch',
    shortDescription: 'Sample practical checklist for physical volumes and volume groups.',
    detailedContent: '1. Configure PV and VG\n2. Extend XFS logical volumes live',
    modules: ['Configure PV and VG', 'Extend XFS logical volumes live'],
    category: 'Linux',
    relatedCourse: 'Red Hat Linux (RHEL)',
    batchDate: '22 Apr 2026',
    batchTime: 'Mon–Fri · 07:00 PM IST',
    mode: 'Live Lab-Driven Training',
    seatsTotal: 20,
    location: 'Nashik Classroom',
    coverImage: '/assets/images/linux_rhel_lab_1795164484674.jpg',
    tags: ['rhel', 'lvm', 'storage'],
    learningLevel: 'Intermediate',
    attachments: [],
    displayOrder: 1,
    featured: false,
    status: 'Draft',
    createdAt: '2026-02-15T10:00:00.000Z',
    updatedAt: '2026-03-18T12:00:00.000Z',
  },
];

test('slugifyText normalizes spacing, casing, and punctuation', () => {
  assert.equal(slugifyText('  RHEL 9: Firewalld & SELinux!  '), 'rhel-9-firewalld-selinux');
  assert.equal(slugifyText('AWS VPC---Peering'), 'aws-vpc-peering');
});

test('formatFileSize formats bytes, KB, and MB cleanly', () => {
  assert.equal(formatFileSize(0), '0 B');
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(1536), '1.5 KB');
  assert.equal(formatFileSize(2 * 1024 * 1024), '2.0 MB');
});

test('validateBatchForm rejects empty fields and duplicate slugs', () => {
  const emptyValues: BatchFormValues = {
    batchCode: '',
    title: '',
    slug: '',
    shortDescription: 'Too short',
    detailedContent: 'Short',
    category: 'Linux',
    relatedCourse: '',
    batchDate: '',
    batchTime: '',
    mode: 'Live Lab-Driven Training',
    seatsTotal: 20,
    location: '',
    coverImage: '',
    coverImageName: '',
    tags: [],
    learningLevel: 'Beginner',
    attachments: [],
    displayOrder: 0,
    featured: false,
    status: 'Draft',
  };

  const errors = validateBatchForm(emptyValues, ['existing-slug']);
  assert.ok(errors.title);
  assert.ok(errors.slug);
  assert.ok(errors.shortDescription);
  assert.equal(errors.detailedContent, undefined);
  assert.ok(errors.relatedCourse);
  assert.ok(errors.batchDate);
  assert.ok(errors.batchTime);
  assert.ok(errors.displayOrder);

  const withoutModulesErrors = validateBatchForm(
    {
      ...emptyValues,
      title: 'Valid Batch Title',
      slug: 'new-unique-batch-slug',
      shortDescription: 'This is a valid short description for the batch.',
      detailedContent: '',
      relatedCourse: 'AWS Cloud Infrastructure',
      batchDate: '01 May 2026',
      batchTime: 'Sat–Sun · 10:00 AM IST',
      displayOrder: 1,
    },
    ['existing-slug']
  );
  assert.equal(Object.keys(withoutModulesErrors).length, 0);

  const duplicateErrors = validateBatchForm(
    {
      ...emptyValues,
      title: 'Valid Batch Title',
      slug: 'existing-slug',
      shortDescription: 'This is a valid short description for the batch.',
      detailedContent: '1. Configure AWS VPC networking and security groups cleanly.',
      relatedCourse: 'AWS Cloud Infrastructure',
      batchDate: '01 May 2026',
      batchTime: 'Sat–Sun · 10:00 AM IST',
      displayOrder: 1,
    },
    ['existing-slug']
  );
  assert.ok(duplicateErrors.slug);
  assert.equal(Object.keys(duplicateErrors).length, 1);

  const editingOwnSlugErrors = validateBatchForm(
    {
      ...emptyValues,
      title: 'Valid Batch Title',
      slug: 'existing-slug',
      shortDescription: 'This is a valid short description for the batch.',
      detailedContent: '1. Configure AWS VPC networking and security groups cleanly.',
      relatedCourse: 'AWS Cloud Infrastructure',
      batchDate: '01 May 2026',
      batchTime: 'Sat–Sun · 10:00 AM IST',
      displayOrder: 1,
    },
    ['existing-slug'],
    'existing-slug'
  );
  assert.equal(Object.keys(editingOwnSlugErrors).length, 0);
});

test('filterAndSortBatches filters by search, status, category, files, and empty sets', () => {
  const baseQuery: BatchQueryState = {
    search: '',
    status: 'All',
    category: 'All',
    level: 'All',
    hasFilesOnly: false,
    sortBy: 'displayOrder',
    sortDir: 'asc',
    page: 1,
    pageSize: 10,
  };

  const all = filterAndSortBatches(SAMPLE_BATCHES, baseQuery);
  assert.equal(all.totalItems, 2);
  assert.equal(all.items[0].id, 'b2'); // displayOrder 1 first

  const searched = filterAndSortBatches(SAMPLE_BATCHES, { ...baseQuery, search: 'BGP' });
  assert.equal(searched.totalItems, 1);
  assert.equal(searched.items[0].id, 'b1');

  const drafts = filterAndSortBatches(SAMPLE_BATCHES, { ...baseQuery, status: 'Draft' });
  assert.equal(drafts.totalItems, 1);
  assert.equal(drafts.items[0].id, 'b2');

  const networking = filterAndSortBatches(SAMPLE_BATCHES, { ...baseQuery, category: 'Networking' });
  assert.equal(networking.totalItems, 1);
  assert.equal(networking.items[0].id, 'b1');

  const withFiles = filterAndSortBatches(SAMPLE_BATCHES, { ...baseQuery, hasFilesOnly: true });
  assert.equal(withFiles.totalItems, 1);
  assert.equal(withFiles.items[0].id, 'b1');

  const emptyBatches = filterAndSortBatches([], baseQuery);
  assert.equal(emptyBatches.totalItems, 0);
  assert.equal(emptyBatches.items.length, 0);
});

test('parseBatchModules normalizes numbered and bulleted syllabus lines cleanly', async () => {
  const {
    formatBatchDateDisplay,
    formatBatchTimeDisplay,
    normalizeDateForInput,
    normalizeTimeForInput,
    parseBatchModules,
  } = await import('../../src/services/batchesService');
  const modules = parseBatchModules(
    '1. RHEL Storage & LVM\n2) Firewalld & SELinux\n- Shell Scripting Basics\n  • Final Exam Prep  '
  );
  assert.deepEqual(modules, [
    'RHEL Storage & LVM',
    'Firewalld & SELinux',
    'Shell Scripting Basics',
    'Final Exam Prep',
  ]);
  assert.equal(formatBatchDateDisplay('2026-04-12'), '12 Apr 2026');
  assert.equal(normalizeDateForInput('2026-04-12'), '2026-04-12');
  assert.equal(formatBatchTimeDisplay('19:00'), '07:00 PM IST');
  assert.equal(normalizeTimeForInput('07:30 PM IST'), '19:30');
});

test('generateUniqueSlug prevents repeating existing slugs cleanly', () => {
  const existing = ['rhel-batch', 'rhel-batch-2', 'ccna-batch'];
  assert.equal(generateUniqueSlug('New AWS Batch', existing), 'new-aws-batch');
  assert.equal(generateUniqueSlug('RHEL Batch', existing), 'rhel-batch-3');
  assert.equal(
    generateUniqueSlug('RHEL Batch', existing, 'rhel-batch'),
    'rhel-batch'
  );
});

test('generateNextBatchCode increments uniquely past existing batch codes', () => {
  assert.equal(generateNextBatchCode([]), 'BATCH-001');
  assert.equal(
    generateNextBatchCode(['BATCH-001', 'BATCH-002', 'BATCH-006']),
    'BATCH-007'
  );
});

test('countWords, clampToMaxWords, and validateBatchForm enforce max 500 word limit', () => {
  assert.equal(countWords('  one two   three '), 3);
  assert.equal(clampToMaxWords('one two three four', 2), 'one two');

  const over500Words = Array.from({ length: 505 }, (_, i) => `w${i}`).join(' ');
  const err500 = validateBatchForm(
    {
      batchCode: 'BATCH-010',
      title: 'Valid Batch Title',
      slug: 'valid-batch-title',
      shortDescription: 'This is a clean summary of more than 15 characters.',
      detailedContent: over500Words,
      category: 'Linux',
      relatedCourse: 'Red Hat',
      batchDate: '2026-05-01',
      batchTime: '19:00',
      mode: 'Online Live',
      seatsTotal: 20,
      location: 'Online Live',
      coverImage: '',
      coverImageName: '',
      tags: [],
      learningLevel: 'Intermediate',
      attachments: [],
      displayOrder: 1,
      featured: false,
      status: 'Draft',
    },
    []
  );
  assert.ok(err500.detailedContent);
});

test('paginateList clamps out-of-range page numbers safely', () => {
  const list = [1, 2, 3, 4, 5];
  const page2 = paginateList(list, 2, 2);
  assert.deepEqual(page2.items, [3, 4]);
  assert.equal(page2.totalPages, 3);

  const clamped = paginateList(list, 99, 2);
  assert.equal(clamped.currentPage, 3);
  assert.deepEqual(clamped.items, [5]);
});

test('validateUploadFile enforces 5 MB max limit and allowed extensions', () => {
  assert.equal(MAX_UPLOAD_BYTES, 5 * 1024 * 1024);

  const okPdf = validateUploadFile(
    { name: 'rhel-notes.pdf', size: 2 * 1024 * 1024 },
    ['.pdf', '.docx']
  );
  assert.equal(okPdf.valid, true);

  const tooBig = validateUploadFile(
    { name: 'huge-video.pdf', size: MAX_UPLOAD_BYTES + 1024 },
    ['.pdf']
  );
  assert.equal(tooBig.valid, false);
  assert.match(tooBig.error ?? '', /5\.0 MB/);

  const badExt = validateUploadFile(
    { name: 'script.exe', size: 1024 },
    ['.pdf', '.docx']
  );
  assert.equal(badExt.valid, false);
});

test('sidebar dropdown helpers default all groups open, toggle independently without collapsing others, and filter modules', async () => {
  const {
    ALL_SIDEBAR_GROUP_IDS,
    ensureSidebarGroupExpanded,
    filterSidebarGroups,
    findSidebarGroupForSection,
    toggleSidebarGroup,
  } = await import('./adminLogic');

  assert.deepEqual(ALL_SIDEBAR_GROUP_IDS, [
    'curriculum',
    'publishing',
    'engagement',
  ]);

  const groups = [
    {
      id: 'curriculum' as const,
      label: 'Curriculum',
      items: [
        { id: 'batches', label: 'Batches', keywords: ['schedules', 'upcoming'] },
        { id: 'courses', label: 'Courses', keywords: ['tracks'] },
        { id: 'resources', label: 'Resources & Notes', keywords: ['pdfs'] },
      ],
    },
    {
      id: 'publishing' as const,
      label: 'Publishing',
      items: [
        { id: 'blogs', label: 'Blogs', keywords: ['articles'] },
        { id: 'gallery', label: 'Gallery', keywords: ['photos'] },
      ],
    },
    {
      id: 'engagement' as const,
      label: 'Engagement',
      items: [
        { id: 'enquiries', label: 'Enquiries', keywords: ['leads'] },
        { id: 'testimonials', label: 'Testimonials', keywords: ['reviews'] },
      ],
    },
  ];

  assert.equal(findSidebarGroupForSection(groups, 'batches')?.id, 'curriculum');
  assert.equal(findSidebarGroupForSection(groups, 'gallery')?.id, 'publishing');
  assert.equal(findSidebarGroupForSection(groups, 'overview'), undefined);

  assert.deepEqual(toggleSidebarGroup(['curriculum'], 'publishing'), [
    'curriculum',
    'publishing',
  ]);
  assert.deepEqual(
    toggleSidebarGroup(['curriculum', 'publishing', 'engagement'], 'publishing'),
    ['curriculum', 'engagement']
  );
  assert.deepEqual(toggleSidebarGroup(['curriculum'], 'curriculum'), []);

  assert.deepEqual(ensureSidebarGroupExpanded(['curriculum'], 'engagement'), [
    'curriculum',
    'engagement',
  ]);
  assert.deepEqual(ensureSidebarGroupExpanded(['curriculum'], 'curriculum'), [
    'curriculum',
  ]);

  const byKeyword = filterSidebarGroups(groups, 'pdfs');
  assert.equal(byKeyword.length, 1);
  assert.equal(byKeyword[0].id, 'curriculum');
  assert.deepEqual(
    byKeyword[0].items.map((item) => item.id),
    ['resources']
  );

  const byGroupLabel = filterSidebarGroups(groups, 'publish');
  assert.equal(byGroupLabel.length, 1);
  assert.equal(byGroupLabel[0].items.length, 2);

  const empty = filterSidebarGroups(groups, 'nonexistent-module');
  assert.equal(empty.length, 0);

  const { getSidebarShellLayout } = await import('./adminLogic');
  const openLayout = getSidebarShellLayout(false);
  assert.equal(openLayout.showLabels, true);
  assert.equal(openLayout.asideWidthClass, 'lg:w-[244px]');
  assert.ok(openLayout.mainWidthClass.includes('max-w-[1440px]'));

  const collapsedLayout = getSidebarShellLayout(true);
  assert.equal(collapsedLayout.showLabels, false);
  assert.equal(collapsedLayout.asideWidthClass, 'lg:w-[76px]');
  assert.ok(collapsedLayout.mainWidthClass.includes('max-w-none'));
});

test('generateNextDomainCode auto-increments DOM-xxx codes without collisions', () => {
  assert.equal(generateNextDomainCode([]), 'DOM-001');
  assert.equal(generateNextDomainCode(['DOM-001', 'DOM-004']), 'DOM-005');
  assert.equal(generateNextDomainCode(['dom-009', 'DOM-010']), 'DOM-011');
});

test('validateCourseForm validates text category, short fields, duplicate slugs, and 500-word limit', () => {
  const emptyPayload: CourseDomainFormPayload = {
    domainCode: 'DOM-001',
    title: 'A',
    slug: 'red hat',
    category: ' ',
    shortDescription: 'Short',
    detailedSyllabus: '',
    coverImage: '/assets/images/linux_rhel_lab_1795164484674.jpg',
    coverImageName: 'linux.jpg',
    tags: [],
    attachments: [],
    displayOrder: 0,
    status: 'Draft',
  };

  const errs = validateCourseForm(emptyPayload, ['red-hat']);
  assert.ok(errs.title);
  assert.ok(errs.category);
  assert.ok(errs.shortDescription);
  assert.equal(errs.detailedSyllabus, undefined);
  assert.ok(errs.displayOrder);

  const duplicateSlugErrs = validateCourseForm(
    {
      ...emptyPayload,
      title: 'Red Hat Enterprise Linux',
      slug: 'red-hat',
      category: 'Enterprise Linux & Security',
      shortDescription: 'Enterprise Linux RHEL system administration and RHCSA exam track.',
      displayOrder: 1,
    },
    ['red-hat', 'ccna']
  );
  assert.equal(duplicateSlugErrs.category, undefined);
  assert.match(duplicateSlugErrs.slug ?? '', /already in use/);

  const longWords = Array.from({ length: 505 }, (_, i) => `word${i}`).join(' ');
  const wordLimitErrs = validateCourseForm(
    {
      ...emptyPayload,
      title: 'Docker & Kubernetes Track',
      slug: 'docker-kubernetes-track',
      category: 'Cloud Native',
      shortDescription: 'Practical container orchestration and DevOps pipelines.',
      detailedSyllabus: longWords,
      displayOrder: 2,
    },
    []
  );
  assert.match(wordLimitErrs.detailedSyllabus ?? '', /500 words/);
});

test('filterAndSortCourses filters by free-text category, files, status, and search query', () => {
  const sampleCourses: CourseDomain[] = [
    {
      id: 'c1',
      domainCode: 'DOM-001',
      title: 'Red Hat Linux (RHEL)',
      slug: 'red-hat-linux',
      category: 'Enterprise Linux',
      shortDescription: 'Enterprise Linux administration and security training.',
      detailedSyllabus: '1. LVM\n2. SELinux',
      modules: ['LVM', 'SELinux'],
      coverImage: '/assets/images/linux_rhel_lab_1795164484674.jpg',
      tags: ['rhel', 'rhcsa'],
      attachments: [
        {
          id: 'att-1',
          name: 'rhel.pdf',
          type: 'application/pdf',
          sizeBytes: 120000,
          uploadedAt: '2026-03-10T10:00:00.000Z',
        },
      ],
      displayOrder: 1,
      status: 'Published',
      createdAt: '2026-03-01T10:00:00.000Z',
      updatedAt: '2026-03-10T10:00:00.000Z',
    },
    {
      id: 'c2',
      domainCode: 'DOM-002',
      title: 'DevOps CI/CD & Kubernetes',
      slug: 'devops-kubernetes',
      category: 'DevOps & Automation',
      shortDescription: 'Container automation with Docker, Kubernetes, and Terraform.',
      detailedSyllabus: '',
      modules: [],
      coverImage: '/assets/images/corporate_it_workshop_1795164484663.jpg',
      tags: ['docker', 'k8s'],
      attachments: [],
      displayOrder: 2,
      status: 'Draft',
      createdAt: '2026-03-05T10:00:00.000Z',
      updatedAt: '2026-03-15T10:00:00.000Z',
    },
  ];

  const baseQuery: CourseQueryState = {
    search: '',
    status: 'All',
    category: 'All',
    hasFilesOnly: false,
    sortBy: 'displayOrder',
    sortDir: 'asc',
    page: 1,
    pageSize: 10,
  };

  const onlyWithFiles = filterAndSortCourses(sampleCourses, {
    ...baseQuery,
    hasFilesOnly: true,
  });
  assert.equal(onlyWithFiles.totalItems, 1);
  assert.equal(onlyWithFiles.items[0].domainCode, 'DOM-001');

  const searchDevOps = filterAndSortCourses(sampleCourses, {
    ...baseQuery,
    search: 'kubernetes',
    category: 'devops & automation',
    status: 'Draft',
  });
  assert.equal(searchDevOps.totalItems, 1);
  assert.equal(searchDevOps.items[0].domainCode, 'DOM-002');
});

test('generateNextNoteCode and validateResourceForm validate fields and 500-word limits', () => {
  assert.equal(generateNextNoteCode([]), 'NOTE-001');
  assert.equal(generateNextNoteCode(['NOTE-001', 'NOTE-006']), 'NOTE-007');

  const invalidPayload: StudyResourceFormPayload = {
    noteCode: 'NOTE-001',
    title: 'A',
    slug: 'rhel notes',
    sectionType: 'Notes',
    domain: 'X',
    summary: 'Too short',
    topicsText: '',
    fileName: 'notes.pdf',
    fileType: 'PDF',
    mimeType: 'application/pdf',
    fileSizeBytes: 0,
    fileUrl: '',
    downloadEnabled: false,
    displayOrder: 0,
    status: 'Published',
  };

  const errs = validateResourceForm(invalidPayload, ['rhel-notes']);
  assert.ok(errs.title);
  assert.ok(errs.domain);
  assert.equal(errs.summary, undefined);
  assert.ok(errs.displayOrder);

  const withoutSummaryOrTopicsErrs = validateResourceForm(
    {
      ...invalidPayload,
      title: 'RHEL 9 Quick Reference',
      slug: 'rhel-9-quick-reference',
      domain: 'Linux & RHEL',
      summary: '',
      topicsText: '',
      displayOrder: 1,
    },
    ['rhel-notes']
  );
  assert.equal(Object.keys(withoutSummaryOrTopicsErrs).length, 0);

  const duplicateErrs = validateResourceForm(
    {
      ...invalidPayload,
      title: 'RHEL 9 Cheat Sheet',
      slug: 'rhel-notes',
      domain: 'Linux & RHEL',
      summary: 'Structured Linux commands covering systemd, firewalld, and LVM storage.',
      displayOrder: 1,
    },
    ['rhel-notes']
  );
  assert.match(duplicateErrs.slug ?? '', /already in use/);

  const overWords = Array.from({ length: 505 }, (_, i) => `cmd${i}`).join(' ');
  const limitErrs = validateResourceForm(
    {
      ...invalidPayload,
      title: 'CCNA Notes',
      slug: 'ccna-notes',
      domain: 'Cisco Networking',
      summary: overWords,
      displayOrder: 2,
    },
    []
  );
  assert.match(limitErrs.summary ?? '', /500 words/);

  // Saving a study note without any uploaded file or URL must pass validation cleanly
  const noFileErrs = validateResourceForm(
    {
      ...invalidPayload,
      title: 'AWS VPC Architecture Outline',
      slug: 'aws-vpc-architecture-outline',
      domain: 'AWS Cloud',
      summary: 'Structured VPC and peering notes with no file uploaded yet.',
      fileName: '',
      fileUrl: '',
      fileSizeBytes: 0,
      removeFile: false,
      displayOrder: 3,
    },
    []
  );
  assert.deepEqual(noFileErrs, {});
});

test('filterAndSortBatches filters dynamically by relatedCourse domain track', () => {
  const batchA: Batch = {
    id: 'b1',
    batchCode: 'BATCH-001',
    title: 'Red Hat System Admin Cohort',
    slug: 'red-hat-cohort',
    shortDescription: 'RHEL 9 hands-on training.',
    detailedContent: '1. LVM',
    modules: ['LVM'],
    category: 'Linux',
    relatedCourse: 'Red Hat',
    batchDate: '2026-06-01',
    batchTime: '19:00',
    mode: 'Online Live',
    seatsTotal: 20,
    location: 'Online',
    coverImage: '/assets/images/linux_rhel_lab_1795164484674.jpg',
    tags: ['rhel'],
    learningLevel: 'Intermediate',
    attachments: [],
    displayOrder: 1,
    featured: false,
    status: 'Published',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-05T10:00:00.000Z',
  };
  const batchB: Batch = {
    ...batchA,
    id: 'b2',
    batchCode: 'BATCH-002',
    title: 'Cisco BGP Lab Cohort',
    slug: 'cisco-bgp-cohort',
    category: 'Networking',
    relatedCourse: 'CCNP',
    displayOrder: 2,
  };

  const filtered = filterAndSortBatches([batchA, batchB], {
    search: '',
    status: 'All',
    category: 'All',
    relatedCourse: 'ccnp',
    level: 'All',
    hasFilesOnly: false,
    sortBy: 'displayOrder',
    sortDir: 'asc',
    page: 1,
    pageSize: 10,
  });

  assert.equal(filtered.totalItems, 1);
  assert.equal(filtered.items[0].batchCode, 'BATCH-002');
});

test('validateResourceForm rejects broken file URLs like /TestUrl unless an upload is attached', () => {
  const basePayload: StudyResourceFormPayload = {
    noteCode: 'NOTE-099',
    title: 'RHEL Admin Notes',
    slug: 'rhel-admin-notes',
    sectionType: 'Notes',
    domain: 'Linux & RHEL',
    summary: 'Structured Linux commands covering systemd, firewalld, and storage.',
    topicsText: '1. LVM',
    fileName: '123page.pdf',
    fileType: 'PDF',
    mimeType: 'application/pdf',
    fileSizeBytes: 160492,
    fileUrl: '/TestUrl',
    storedFilePath: undefined,
    fileData: undefined,
    removeFile: false,
    downloadEnabled: false,
    displayOrder: 1,
    status: 'Published',
  };

  const invalidUrlErrs = validateResourceForm(basePayload, []);
  assert.ok(invalidUrlErrs.fileUrl);

  const validSeedErrs = validateResourceForm(
    { ...basePayload, fileUrl: '/seed-materials/rhel-administration-notes.pdf' },
    []
  );
  assert.equal(validSeedErrs.fileUrl, undefined);

  const validHttpErrs = validateResourceForm(
    { ...basePayload, fileUrl: 'https://cdn.example.com/rhel-guide.pdf' },
    []
  );
  assert.equal(validHttpErrs.fileUrl, undefined);

  const validDiskUploadErrs = validateResourceForm(
    {
      ...basePayload,
      fileUrl: '',
      storedFilePath: 'resources/123page.pdf',
    },
    []
  );
  assert.equal(validDiskUploadErrs.fileUrl, undefined);
});

test('generateNextBlogCode and validateBlogForm validate slug uniqueness, category, and 500-word excerpt limit', async () => {
  const { generateNextBlogCode, validateBlogForm } = await import('./adminLogic');
  assert.equal(generateNextBlogCode([]), 'BLOG-001');
  assert.equal(generateNextBlogCode(['BLOG-001', 'BLOG-004']), 'BLOG-005');

  const base = {
    blogCode: 'BLOG-005',
    title: 'Linux LVM Snapshots Walkthrough',
    slug: 'linux-lvm-snapshots-walkthrough',
    category: 'Linux & RHEL',
    author: 'Arvind Thevar',
    readTime: '6 min read',
    guideLabel: 'Study Guide',
    excerpt: 'Practical LVM snapshot workflows, rollback validation, and storage recovery.',
    sections: [
      {
        heading: '1. Preparing Physical Volumes',
        body: 'Verify free extents inside the volume group before allocating snapshots.',
        images: [],
      },
    ],
    tags: ['RHEL', 'LVM'],
    coverImage: '/assets/images/linux_rhel_lab_1795164484674.jpg',
    coverImageName: 'linux_rhel_lab_1795164484674.jpg',
    attachments: [],
    featured: false,
    displayOrder: 5,
    status: 'Published' as const,
  };

  assert.deepEqual(validateBlogForm(base, ['existing-slug']), {});

  const dupSlugErrs = validateBlogForm(base, ['linux-lvm-snapshots-walkthrough']);
  assert.match(dupSlugErrs.slug ?? '', /already in use/);

  const over500 = Array.from({ length: 505 }, (_, i) => `b${i}`).join(' ');
  const wordLimitErrs = validateBlogForm({ ...base, excerpt: over500 }, []);
  assert.match(wordLimitErrs.excerpt ?? '', /500 words/);

  const schedMissingErrs = validateBlogForm(
    { ...base, status: 'Scheduled' as const, scheduledAt: '' },
    []
  );
  assert.ok(schedMissingErrs.scheduledAt);

  const schedValidErrs = validateBlogForm(
    { ...base, status: 'Scheduled' as const, scheduledAt: '2026-12-01T10:30:00' },
    []
  );
  assert.equal(schedValidErrs.scheduledAt, undefined);

  const sectionErrs = validateBlogForm(
    {
      ...base,
      sections: [
        {
          heading: Array.from({ length: 35 }, (_, i) => `h${i}`).join(' '),
          body: 'Valid section body.',
          images: [],
        },
      ],
    },
    []
  );
  assert.match(sectionErrs.sections ?? '', /30 words/);

  const missingCoreErrs = validateBlogForm(
    {
      ...base,
      title: 'No',
      slug: 'a',
      category: ' ',
      author: ' ',
      excerpt: 'short',
      displayOrder: 0,
    },
    []
  );
  assert.ok(missingCoreErrs.title);
  assert.ok(missingCoreErrs.slug);
  assert.ok(missingCoreErrs.category);
  assert.ok(missingCoreErrs.author);
  assert.ok(missingCoreErrs.excerpt);
  assert.ok(missingCoreErrs.displayOrder);
});
