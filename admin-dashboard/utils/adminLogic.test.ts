import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterAndSortTopics,
  formatFileSize,
  MAX_UPLOAD_BYTES,
  paginateList,
  slugifyText,
  validateTopicForm,
  validateUploadFile,
} from './adminLogic';
import type { Topic, TopicFormValues, TopicQueryState } from '../topics/types/topic';

const SAMPLE_TOPICS: Topic[] = [
  {
    id: 't1',
    title: 'BGP Path Selection Lab',
    slug: 'bgp-path-selection-lab',
    shortDescription: 'Sample routing topology outline covering BGP attributes.',
    detailedContent: 'Sample lab notes for verifying local preference, AS-path, and MED.',
    relatedCourse: 'Cisco CCNA & CCNP',
    subject: 'Routing & Switching',
    coverImage: '/assets/images/cisco_network_lab_1795164486189.jpg',
    tags: ['bgp', 'routing', 'ccnp'],
    learningLevel: 'Advanced',
    attachments: [],
    displayOrder: 2,
    featured: true,
    status: 'Published',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-03-10T12:00:00.000Z',
  },
  {
    id: 't2',
    title: 'RHEL 9 Storage & LVM Setup',
    slug: 'rhel-9-storage-lvm-setup',
    shortDescription: 'Sample practical checklist for physical volumes and volume groups.',
    detailedContent: 'Sample step-by-step practice sheet for extending XFS logical volumes.',
    relatedCourse: 'Red Hat Linux (RHEL)',
    subject: 'Linux Administration',
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

test('validateTopicForm rejects empty fields and duplicate slugs', () => {
  const emptyValues: TopicFormValues = {
    title: '',
    slug: '',
    shortDescription: 'Too short',
    detailedContent: 'Short',
    relatedCourse: '',
    subject: '',
    coverImage: '',
    coverImageName: '',
    tags: [],
    learningLevel: 'Beginner',
    attachments: [],
    displayOrder: 0,
    featured: false,
    status: 'Draft',
  };

  const errors = validateTopicForm(emptyValues, ['existing-slug']);
  assert.ok(errors.title);
  assert.ok(errors.slug);
  assert.ok(errors.shortDescription);
  assert.ok(errors.detailedContent);
  assert.ok(errors.relatedCourse);
  assert.ok(errors.displayOrder);

  const duplicateErrors = validateTopicForm(
    {
      ...emptyValues,
      title: 'Valid Topic Title',
      slug: 'existing-slug',
      shortDescription: 'This is a valid short description for the topic.',
      detailedContent: 'This is a sufficiently detailed sample outline for the topic module.',
      relatedCourse: 'AWS Cloud Infrastructure',
      displayOrder: 1,
    },
    ['existing-slug']
  );
  assert.ok(duplicateErrors.slug);
  assert.equal(Object.keys(duplicateErrors).length, 1);

  const editingOwnSlugErrors = validateTopicForm(
    {
      ...emptyValues,
      title: 'Valid Topic Title',
      slug: 'existing-slug',
      shortDescription: 'This is a valid short description for the topic.',
      detailedContent: 'This is a sufficiently detailed sample outline for the topic module.',
      relatedCourse: 'AWS Cloud Infrastructure',
      displayOrder: 1,
    },
    ['existing-slug'],
    'existing-slug'
  );
  assert.equal(Object.keys(editingOwnSlugErrors).length, 0);
});

test('filterAndSortTopics filters by search, status, featured, and sorts by displayOrder', () => {
  const baseQuery: TopicQueryState = {
    search: '',
    status: 'All',
    level: 'All',
    course: 'All',
    featuredOnly: false,
    sortBy: 'displayOrder',
    sortDir: 'asc',
    page: 1,
    pageSize: 10,
  };

  const all = filterAndSortTopics(SAMPLE_TOPICS, baseQuery);
  assert.equal(all.totalItems, 2);
  assert.equal(all.items[0].id, 't2'); // displayOrder 1 first

  const searched = filterAndSortTopics(SAMPLE_TOPICS, { ...baseQuery, search: 'BGP' });
  assert.equal(searched.totalItems, 1);
  assert.equal(searched.items[0].id, 't1');

  const drafts = filterAndSortTopics(SAMPLE_TOPICS, { ...baseQuery, status: 'Draft' });
  assert.equal(drafts.totalItems, 1);
  assert.equal(drafts.items[0].id, 't2');

  const featured = filterAndSortTopics(SAMPLE_TOPICS, { ...baseQuery, featuredOnly: true });
  assert.equal(featured.totalItems, 1);
  assert.equal(featured.items[0].id, 't1');
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

test('sidebar dropdown helpers resolve active groups, toggle cleanly, and filter modules', async () => {
  const {
    ensureSidebarGroupExpanded,
    filterSidebarGroups,
    findSidebarGroupForSection,
    toggleSidebarGroup,
  } = await import('./adminLogic');

  const groups = [
    {
      id: 'curriculum' as const,
      label: 'Curriculum',
      items: [
        { id: 'topics', label: 'Topics', keywords: ['syllabus', 'lab'] },
        { id: 'courses', label: 'Courses', keywords: ['batches'] },
        { id: 'resources', label: 'Resources & Notes', keywords: ['pdfs'] },
      ],
    },
    {
      id: 'publishing' as const,
      label: 'Publishing',
      items: [
        { id: 'blogs', label: 'Blogs', keywords: ['articles'] },
        { id: 'gallery', label: 'Gallery', keywords: ['photos'] },
        { id: 'media', label: 'Media Library', keywords: ['uploads'] },
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

  assert.equal(findSidebarGroupForSection(groups, 'topics')?.id, 'curriculum');
  assert.equal(findSidebarGroupForSection(groups, 'media')?.id, 'publishing');
  assert.equal(findSidebarGroupForSection(groups, 'overview'), undefined);

  assert.deepEqual(toggleSidebarGroup(['curriculum'], 'publishing'), [
    'publishing',
  ]);
  assert.deepEqual(toggleSidebarGroup(['curriculum'], 'curriculum'), []);

  assert.deepEqual(ensureSidebarGroupExpanded(['curriculum'], 'engagement'), [
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
  assert.equal(byGroupLabel[0].items.length, 3);

  const empty = filterSidebarGroups(groups, 'nonexistent-module');
  assert.equal(empty.length, 0);
});

