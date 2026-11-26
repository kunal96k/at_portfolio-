import type {
  Batch,
  BatchFormValues,
  BatchQueryState,
  BatchValidationErrors,
} from '../batches/types/batch';
import type {
  CourseDomain,
  CourseDomainFormPayload,
  CourseQueryState,
  CourseValidationErrors,
} from '../courses/types/course';
import type {
  ResourceValidationErrors,
  StudyResourceFormPayload,
} from '../resources/types/resource';
import type {
  BlogFormPayload,
  BlogValidationErrors,
} from '../blogs/types/blog';
import type {
  GalleryFormPayload,
  GalleryValidationErrors,
} from '../gallery/types/gallery';

export function countWords(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Enforces a maximum word count on controlled inputs without stripping intermediate spacing.
 */
export function clampToMaxWords(input: string, maxWords: number): string {
  if (countWords(input) <= maxWords) return input;
  const matches = input.match(/\S+\s*/g);
  if (!matches) return input;
  return matches.slice(0, maxWords).join('').trimEnd();
}

export const BATCH_FIELD_LIMITS = {
  titleMaxChars: 120,
  titleMaxWords: 20,
  slugMaxChars: 120,
  locationMaxChars: 100,
  locationMaxWords: 18,
  shortDescriptionMaxWords: 150,
  shortDescriptionMaxChars: 1000,
  detailedContentMaxWords: 500,
  detailedContentMaxChars: 4000,
  tagMaxChars: 40,
  maxTags: 10,
} as const;

/**
 * Auto-generates a unique URL slug from title/slug text,
 * appending -2, -3, ... when that slug already exists in existingSlugs.
 */
export function generateUniqueSlug(
  input: string,
  existingSlugs: string[] = [],
  currentSlug?: string
): string {
  const base = slugifyText(input);
  if (!base) return '';
  const taken = new Set(
    existingSlugs
      .map((s) => slugifyText(s))
      .filter((s) => s && s !== currentSlug)
  );
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

/**
 * Generates the next unique sequential batch code (e.g., BATCH-007).
 * TODO(backend): In production, the backend DB sequence / pre-persist hook
 * will authoritatively allocate and enforce uniqueness for batch codes.
 */
export function generateNextBatchCode(existingCodes: string[] = []): string {
  const normalizedExisting = new Set(
    existingCodes.map((c) => c.trim().toUpperCase()).filter(Boolean)
  );
  let maxNumber = 0;
  for (const code of normalizedExisting) {
    const match = /(\d+)$/.exec(code);
    if (match) {
      const num = Number(match[1]);
      if (Number.isFinite(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  }
  let nextNum = maxNumber + 1;
  let candidate = `BATCH-${String(nextNum).padStart(3, '0')}`;
  while (normalizedExisting.has(candidate)) {
    nextNum += 1;
    candidate = `BATCH-${String(nextNum).padStart(3, '0')}`;
  }
  return candidate;
}

export function generateNextDomainCode(existingCodes: string[] = []): string {
  const normalizedExisting = new Set(
    existingCodes.map((c) => c.trim().toUpperCase()).filter(Boolean)
  );
  let maxNumber = 0;
  for (const code of normalizedExisting) {
    const match = /(\d+)$/.exec(code);
    if (match) {
      const num = Number(match[1]);
      if (Number.isFinite(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  }
  let nextNum = maxNumber + 1;
  let candidate = `DOM-${String(nextNum).padStart(3, '0')}`;
  while (normalizedExisting.has(candidate)) {
    nextNum += 1;
    candidate = `DOM-${String(nextNum).padStart(3, '0')}`;
  }
  return candidate;
}

export const COURSE_FIELD_LIMITS = {
  titleMaxChars: 140,
  titleMaxWords: 25,
  slugMaxChars: 120,
  categoryMaxChars: 60,
  categoryMaxWords: 10,
  shortDescriptionMaxWords: 500,
  shortDescriptionMaxChars: 4000,
  detailedSyllabusMaxWords: 500,
  detailedSyllabusMaxChars: 8000,
  tagMaxChars: 40,
  maxTags: 10,
} as const;

export function validateCourseForm(
  values: CourseDomainFormPayload,
  existingSlugs: string[] = [],
  currentSlug?: string
): CourseValidationErrors {
  const errors: CourseValidationErrors = {};

  const trimmedTitle = values.title.trim();
  if (!trimmedTitle || trimmedTitle.length < 2) {
    errors.title = 'Enter a course / domain title of at least 2 characters.';
  } else if (trimmedTitle.length > COURSE_FIELD_LIMITS.titleMaxChars) {
    errors.title = `Title cannot exceed ${COURSE_FIELD_LIMITS.titleMaxChars} characters.`;
  }

  const normalizedSlug = slugifyText(values.slug);
  if (!normalizedSlug) {
    errors.slug = 'Provide a valid URL slug (letters, numbers, and hyphens).';
  } else if (normalizedSlug.length > COURSE_FIELD_LIMITS.slugMaxChars) {
    errors.slug = `Slug cannot exceed ${COURSE_FIELD_LIMITS.slugMaxChars} characters.`;
  } else {
    const duplicate = existingSlugs.some(
      (slug) => slug === normalizedSlug && slug !== currentSlug
    );
    if (duplicate) {
      errors.slug = 'This slug is already in use by another course / domain.';
    }
  }

  const trimmedCategory = values.category.trim();
  if (!trimmedCategory || trimmedCategory.length < 2) {
    errors.category = 'Enter a website category (at least 2 characters).';
  } else if (trimmedCategory.length > COURSE_FIELD_LIMITS.categoryMaxChars) {
    errors.category = `Category cannot exceed ${COURSE_FIELD_LIMITS.categoryMaxChars} characters.`;
  } else if (countWords(trimmedCategory) > COURSE_FIELD_LIMITS.categoryMaxWords) {
    errors.category = `Category cannot exceed ${COURSE_FIELD_LIMITS.categoryMaxWords} words.`;
  }

  const trimmedSummary = values.shortDescription.trim();
  if (!trimmedSummary || trimmedSummary.length < 10) {
    errors.shortDescription = 'Add a domain description (at least 10 characters).';
  } else if (
    countWords(trimmedSummary) > COURSE_FIELD_LIMITS.shortDescriptionMaxWords
  ) {
    errors.shortDescription = `Domain description cannot exceed ${COURSE_FIELD_LIMITS.shortDescriptionMaxWords} words.`;
  }

  const trimmedSyllabus = values.detailedSyllabus.trim();
  if (
    trimmedSyllabus &&
    countWords(trimmedSyllabus) > COURSE_FIELD_LIMITS.detailedSyllabusMaxWords
  ) {
    errors.detailedSyllabus = `Detailed syllabus cannot exceed ${COURSE_FIELD_LIMITS.detailedSyllabusMaxWords} words.`;
  }

  if (!Number.isFinite(values.displayOrder) || values.displayOrder < 1) {
    errors.displayOrder = 'Display order must be 1 or higher.';
  }

  return errors;
}

export function filterAndSortCourses(
  courses: CourseDomain[],
  query: CourseQueryState
): PaginatedResult<CourseDomain> {
  const q = query.search.trim().toLowerCase();

  const filtered = courses.filter((course) => {
    if (query.status !== 'All' && course.status !== query.status) return false;
    if (
      query.category !== 'All' &&
      course.category.trim().toLowerCase() !==
        query.category.trim().toLowerCase()
    ) {
      return false;
    }
    if (query.hasFilesOnly && course.attachments.length === 0) return false;

    if (!q) return true;
    const haystack = [
      course.title,
      course.domainCode,
      course.slug,
      course.shortDescription,
      course.category,
      course.tags.join(' '),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (query.sortBy === 'displayOrder') {
      comparison = a.displayOrder - b.displayOrder;
    } else if (query.sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (query.sortBy === 'createdAt') {
      comparison =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      comparison =
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    return query.sortDir === 'asc' ? comparison : -comparison;
  });

  const pageSize = Math.max(1, query.pageSize);
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, query.page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const items = sorted.slice(startIndex, startIndex + pageSize);
  const endIndex = startIndex + items.length;

  return {
    items,
    totalItems,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
  };
}

export function slugifyText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIdx = 0;
  while (value >= 1024 && unitIdx < units.length - 1) {
    value /= 1024;
    unitIdx += 1;
  }
  const decimals = unitIdx === 0 ? 0 : value >= 100 ? 0 : 1;
  return `${value.toFixed(decimals)} ${units[unitIdx]}`;
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUploadFile(
  file: { name: string; size: number },
  allowedExtensions: string[],
  maxBytes: number = MAX_UPLOAD_BYTES
): FileValidationResult {
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `"${file.name}" (${formatFileSize(file.size)}) exceeds the ${formatFileSize(maxBytes)} maximum file size limit.`,
    };
  }
  const ext = file.name.includes('.')
    ? `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`
    : '';
  if (
    allowedExtensions.length > 0 &&
    ext &&
    !allowedExtensions.includes(ext)
  ) {
    return {
      valid: false,
      error: `"${file.name}" is not a supported format. Allowed: ${allowedExtensions.join(', ')}.`,
    };
  }
  return { valid: true };
}

export function formatShortDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function validateBatchForm(
  values: BatchFormValues,
  existingSlugs: string[] = [],
  currentSlug?: string
): BatchValidationErrors {
  const errors: BatchValidationErrors = {};

  const trimmedTitle = values.title.trim();
  if (!trimmedTitle || trimmedTitle.length < 3) {
    errors.title = 'Enter a batch title of at least 3 characters.';
  } else if (trimmedTitle.length > BATCH_FIELD_LIMITS.titleMaxChars) {
    errors.title = `Title cannot exceed ${BATCH_FIELD_LIMITS.titleMaxChars} characters.`;
  }

  const normalizedSlug = slugifyText(values.slug);
  if (!normalizedSlug) {
    errors.slug = 'Provide a valid URL slug (letters, numbers, and hyphens).';
  } else if (normalizedSlug.length > BATCH_FIELD_LIMITS.slugMaxChars) {
    errors.slug = `Slug cannot exceed ${BATCH_FIELD_LIMITS.slugMaxChars} characters.`;
  } else {
    const duplicate = existingSlugs.some(
      (slug) => slug === normalizedSlug && slug !== currentSlug
    );
    if (duplicate) {
      errors.slug = 'This slug is already in use by another batch.';
    }
  }

  const trimmedSummary = values.shortDescription.trim();
  if (!trimmedSummary || trimmedSummary.length < 15) {
    errors.shortDescription = 'Add a short summary (at least 15 characters).';
  } else if (countWords(trimmedSummary) > BATCH_FIELD_LIMITS.shortDescriptionMaxWords) {
    errors.shortDescription = `Short summary cannot exceed ${BATCH_FIELD_LIMITS.shortDescriptionMaxWords} words.`;
  }

  const trimmedContent = values.detailedContent.trim();
  if (!trimmedContent || trimmedContent.length < 20) {
    errors.detailedContent = 'Add key lab modules or syllabus notes (at least 20 characters).';
  } else if (countWords(trimmedContent) > BATCH_FIELD_LIMITS.detailedContentMaxWords) {
    errors.detailedContent = `Lab modules cannot exceed ${BATCH_FIELD_LIMITS.detailedContentMaxWords} words.`;
  }

  if (!values.relatedCourse.trim()) {
    errors.relatedCourse = 'Select a related course or technology track.';
  }

  if (!values.batchDate.trim()) {
    errors.batchDate = 'Select the batch start date.';
  }

  if (!values.batchTime.trim()) {
    errors.batchTime = 'Select the batch start time.';
  }

  if (!Number.isFinite(values.displayOrder) || values.displayOrder < 1) {
    errors.displayOrder = 'Display order must be 1 or higher.';
  }

  return errors;
}

export function generateNextNoteCode(existingCodes: string[] = []): string {
  const normalizedExisting = new Set(
    existingCodes.map((c) => c.trim().toUpperCase()).filter(Boolean)
  );
  let maxNumber = 0;
  for (const code of normalizedExisting) {
    const match = /(\d+)$/.exec(code);
    if (match) {
      const num = Number(match[1]);
      if (Number.isFinite(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  }
  let nextNum = maxNumber + 1;
  let candidate = `NOTE-${String(nextNum).padStart(3, '0')}`;
  while (normalizedExisting.has(candidate)) {
    nextNum += 1;
    candidate = `NOTE-${String(nextNum).padStart(3, '0')}`;
  }
  return candidate;
}

export const RESOURCE_FIELD_LIMITS = {
  titleMaxChars: 160,
  titleMaxWords: 25,
  slugMaxChars: 140,
  domainMaxChars: 80,
  domainMaxWords: 10,
  summaryMaxWords: 500,
  summaryMaxChars: 4000,
  topicsMaxWords: 500,
  topicsMaxChars: 8000,
} as const;

export function validateResourceForm(
  values: StudyResourceFormPayload,
  existingSlugs: string[] = [],
  currentSlug?: string
): ResourceValidationErrors {
  const errors: ResourceValidationErrors = {};

  const trimmedTitle = values.title.trim();
  if (!trimmedTitle || trimmedTitle.length < 2) {
    errors.title = 'Enter a resource / note title of at least 2 characters.';
  } else if (trimmedTitle.length > RESOURCE_FIELD_LIMITS.titleMaxChars) {
    errors.title = `Title cannot exceed ${RESOURCE_FIELD_LIMITS.titleMaxChars} characters.`;
  }

  const normalizedSlug = slugifyText(values.slug);
  if (!normalizedSlug) {
    errors.slug = 'Provide a valid URL slug (letters, numbers, and hyphens).';
  } else if (normalizedSlug.length > RESOURCE_FIELD_LIMITS.slugMaxChars) {
    errors.slug = `Slug cannot exceed ${RESOURCE_FIELD_LIMITS.slugMaxChars} characters.`;
  } else {
    const duplicate = existingSlugs.some(
      (slug) => slug === normalizedSlug && slug !== currentSlug
    );
    if (duplicate) {
      errors.slug = 'This slug is already in use by another study note.';
    }
  }

  const trimmedDomain = values.domain.trim();
  if (!trimmedDomain || trimmedDomain.length < 2) {
    errors.domain = 'Enter a subject / domain (at least 2 characters).';
  } else if (trimmedDomain.length > RESOURCE_FIELD_LIMITS.domainMaxChars) {
    errors.domain = `Subject / domain cannot exceed ${RESOURCE_FIELD_LIMITS.domainMaxChars} characters.`;
  }

  const trimmedSummary = values.summary.trim();
  if (!trimmedSummary || trimmedSummary.length < 10) {
    errors.summary = 'Add a summary description (at least 10 characters).';
  } else if (
    countWords(trimmedSummary) > RESOURCE_FIELD_LIMITS.summaryMaxWords
  ) {
    errors.summary = `Summary cannot exceed ${RESOURCE_FIELD_LIMITS.summaryMaxWords} words.`;
  }

  const trimmedTopics = values.topicsText.trim();
  if (
    trimmedTopics &&
    countWords(trimmedTopics) > RESOURCE_FIELD_LIMITS.topicsMaxWords
  ) {
    errors.topicsText = `Topics outline cannot exceed ${RESOURCE_FIELD_LIMITS.topicsMaxWords} words.`;
  }

  const trimmedFileUrl = values.fileUrl.trim();
  const hasBinaryUpload = Boolean(values.storedFilePath || values.fileData);
  if (!hasBinaryUpload && trimmedFileUrl) {
    const isAllowedLocalPath =
      trimmedFileUrl.startsWith('/seed-materials/') ||
      trimmedFileUrl.startsWith('/api/files/') ||
      trimmedFileUrl.startsWith('/api/resources/') ||
      trimmedFileUrl.startsWith('/study-materials/');
    let isValidHttp = false;
    if (!isAllowedLocalPath) {
      try {
        const parsed = new URL(trimmedFileUrl);
        isValidHttp =
          parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        isValidHttp = false;
      }
    }
    if (!isAllowedLocalPath && !isValidHttp) {
      errors.fileUrl =
        'Enter a valid http(s):// or /seed-materials/ file URL, or upload a file on the left.';
    }
  }

  if (!Number.isFinite(values.displayOrder) || values.displayOrder < 1) {
    errors.displayOrder = 'Display order must be 1 or higher.';
  }

  return errors;
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  startIndex: number;
  endIndex: number;
}

export function filterAndSortBatches(
  batches: Batch[],
  query: BatchQueryState
): PaginatedResult<Batch> {
  const q = query.search.trim().toLowerCase();

  const filtered = batches.filter((batch) => {
    if (query.status !== 'All' && batch.status !== query.status) return false;
    if (query.category !== 'All' && batch.category !== query.category) return false;
    if (
      query.relatedCourse &&
      query.relatedCourse !== 'All' &&
      batch.relatedCourse.trim().toLowerCase() !==
        query.relatedCourse.trim().toLowerCase()
    ) {
      return false;
    }
    if (query.level !== 'All' && batch.learningLevel !== query.level) return false;
    if (query.hasFilesOnly && batch.attachments.length === 0) return false;

    if (!q) return true;
    const haystack = [
      batch.title,
      batch.batchCode,
      batch.slug,
      batch.shortDescription,
      batch.relatedCourse,
      batch.category,
      batch.batchDate,
      batch.batchTime,
      batch.mode,
      batch.tags.join(' '),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (query.sortBy === 'displayOrder') {
      comparison = a.displayOrder - b.displayOrder;
    } else if (query.sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (query.sortBy === 'batchDate') {
      comparison = a.batchDate.localeCompare(b.batchDate);
    } else if (query.sortBy === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    return query.sortDir === 'asc' ? comparison : -comparison;
  });

  const pageSize = Math.max(1, query.pageSize);
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, query.page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const items = sorted.slice(startIndex, startIndex + pageSize);
  const endIndex = startIndex + items.length;

  return {
    items,
    totalItems,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
  };
}

export function paginateList<T>(
  records: T[],
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const safeSize = Math.max(1, pageSize);
  const totalItems = records.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * safeSize;
  const items = records.slice(startIndex, startIndex + safeSize);

  return {
    items,
    totalItems,
    totalPages,
    currentPage,
    startIndex,
    endIndex: startIndex + items.length,
  };
}

export type SidebarGroupId = 'curriculum' | 'publishing' | 'engagement';

export const ALL_SIDEBAR_GROUP_IDS: SidebarGroupId[] = [
  'curriculum',
  'publishing',
  'engagement',
];

export interface SidebarModuleRef {
  id: string;
  label: string;
  keywords?: string[];
}

export interface SidebarGroupDef<T extends SidebarModuleRef = SidebarModuleRef> {
  id: SidebarGroupId;
  label: string;
  items: T[];
}

export function findSidebarGroupForSection<T extends SidebarModuleRef>(
  groups: SidebarGroupDef<T>[],
  sectionId: string
): SidebarGroupDef<T> | undefined {
  return groups.find((group) =>
    group.items.some((item) => item.id === sectionId)
  );
}

export function toggleSidebarGroup(
  expandedIds: SidebarGroupId[],
  groupId: SidebarGroupId
): SidebarGroupId[] {
  return expandedIds.includes(groupId)
    ? expandedIds.filter((id) => id !== groupId)
    : [...expandedIds, groupId];
}

export function ensureSidebarGroupExpanded(
  expandedIds: SidebarGroupId[],
  groupId: SidebarGroupId | undefined
): SidebarGroupId[] {
  if (!groupId || expandedIds.includes(groupId)) return expandedIds;
  return [...expandedIds, groupId];
}

export function filterSidebarGroups<T extends SidebarModuleRef>(
  groups: SidebarGroupDef<T>[],
  rawQuery: string
): SidebarGroupDef<T>[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return groups;

  return groups
    .map((group) => {
      const groupMatches = group.label.toLowerCase().includes(query);
      if (groupMatches) return group;

      const matchingItems = group.items.filter((item) => {
        const haystack = [item.label, item.id, ...(item.keywords ?? [])]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });

      if (matchingItems.length === 0) return null;
      return { ...group, items: matchingItems };
    })
    .filter((group): group is SidebarGroupDef<T> => group !== null);
}

export const BLOG_FIELD_LIMITS = {
  titleMaxChars: 220,
  titleMaxWords: 30,
  slugMaxChars: 160,
  categoryMaxChars: 80,
  categoryMaxWords: 10,
  authorMaxChars: 100,
  readTimeMaxChars: 40,
  guideLabelMaxChars: 80,
  excerptMaxWords: 500,
  excerptMaxChars: 4000,
  sectionHeadingMaxWords: 30,
  sectionBodyMaxWords: 1200,
  tagMaxChars: 40,
  maxTags: 10,
} as const;

export function generateNextBlogCode(existingCodes: string[] = []): string {
  const normalizedExisting = new Set(
    existingCodes.map((c) => c.trim().toUpperCase()).filter(Boolean)
  );
  let maxNumber = 0;
  for (const code of normalizedExisting) {
    const match = /(\d+)$/.exec(code);
    if (match) {
      const num = Number(match[1]);
      if (Number.isFinite(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  }
  let nextNum = maxNumber + 1;
  let candidate = `BLOG-${String(nextNum).padStart(3, '0')}`;
  while (normalizedExisting.has(candidate)) {
    nextNum += 1;
    candidate = `BLOG-${String(nextNum).padStart(3, '0')}`;
  }
  return candidate;
}

export function validateBlogForm(
  values: BlogFormPayload,
  existingSlugs: string[] = [],
  currentSlug?: string
): BlogValidationErrors {
  const errors: BlogValidationErrors = {};

  const trimmedTitle = values.title.trim();
  if (!trimmedTitle || trimmedTitle.length < 3) {
    errors.title = 'Enter a blog title (at least 3 characters).';
  } else if (trimmedTitle.length > BLOG_FIELD_LIMITS.titleMaxChars) {
    errors.title = `Title cannot exceed ${BLOG_FIELD_LIMITS.titleMaxChars} characters.`;
  } else if (countWords(trimmedTitle) > BLOG_FIELD_LIMITS.titleMaxWords) {
    errors.title = `Title cannot exceed ${BLOG_FIELD_LIMITS.titleMaxWords} words.`;
  }

  const normalizedSlug = slugifyText(values.slug);
  if (!normalizedSlug || normalizedSlug.length < 3) {
    errors.slug = 'Provide a valid URL slug (at least 3 characters).';
  } else if (normalizedSlug.length > BLOG_FIELD_LIMITS.slugMaxChars) {
    errors.slug = `Slug cannot exceed ${BLOG_FIELD_LIMITS.slugMaxChars} characters.`;
  } else {
    const duplicate = existingSlugs.some(
      (slug) => slug === normalizedSlug && slug !== currentSlug
    );
    if (duplicate) {
      errors.slug = 'This slug is already in use by another blog article.';
    }
  }

  const trimmedCategory = values.category.trim();
  if (!trimmedCategory || trimmedCategory.length < 2) {
    errors.category = 'Select or enter a category / domain (at least 2 characters).';
  } else if (trimmedCategory.length > BLOG_FIELD_LIMITS.categoryMaxChars) {
    errors.category = `Category cannot exceed ${BLOG_FIELD_LIMITS.categoryMaxChars} characters.`;
  } else if (countWords(trimmedCategory) > BLOG_FIELD_LIMITS.categoryMaxWords) {
    errors.category = `Category cannot exceed ${BLOG_FIELD_LIMITS.categoryMaxWords} words.`;
  }

  const trimmedAuthor = values.author.trim();
  if (!trimmedAuthor || trimmedAuthor.length < 2) {
    errors.author = 'Enter the author name.';
  }

  if (values.status === 'Scheduled') {
    const rawSchedule = String(values.scheduledAt ?? '').trim();
    if (!rawSchedule || Number.isNaN(new Date(rawSchedule).getTime())) {
      errors.scheduledAt =
        'Select a valid date & time to auto-publish this scheduled blog.';
    }
  }

  const trimmedExcerpt = values.excerpt.trim();
  if (!trimmedExcerpt || trimmedExcerpt.length < 10) {
    errors.excerpt = 'Write a clear article summary / excerpt (at least 10 characters).';
  } else if (countWords(trimmedExcerpt) > BLOG_FIELD_LIMITS.excerptMaxWords) {
    errors.excerpt = `Excerpt cannot exceed ${BLOG_FIELD_LIMITS.excerptMaxWords} words.`;
  }

  for (let i = 0; i < values.sections.length; i += 1) {
    const sec = values.sections[i];
    if (countWords(sec.heading || '') > BLOG_FIELD_LIMITS.sectionHeadingMaxWords) {
      errors.sections = `Section ${i + 1} heading cannot exceed ${BLOG_FIELD_LIMITS.sectionHeadingMaxWords} words.`;
      break;
    }
    if (countWords(sec.body || '') > BLOG_FIELD_LIMITS.sectionBodyMaxWords) {
      errors.sections = `Section ${i + 1} content cannot exceed ${BLOG_FIELD_LIMITS.sectionBodyMaxWords} words.`;
      break;
    }
  }

  if (!Number.isFinite(values.displayOrder) || values.displayOrder < 1) {
    errors.displayOrder = 'Display order must be 1 or higher.';
  }

  return errors;
}

export const GALLERY_FIELD_LIMITS = {
  titleMaxChars: 220,
  titleMaxWords: 30,
  categoryMaxChars: 80,
  categoryMaxWords: 10,
  captionMaxChars: 2000,
  captionMaxWords: 300,
  altTextMaxChars: 255,
  tagMaxChars: 40,
  maxTags: 10,
} as const;

export function generateNextGalleryCode(existingCodes: string[] = []): string {
  const normalizedExisting = new Set(
    existingCodes.map((c) => c.trim().toUpperCase()).filter(Boolean)
  );
  let maxNumber = 0;
  for (const code of normalizedExisting) {
    const match = /(\d+)$/.exec(code);
    if (match) {
      const num = Number(match[1]);
      if (Number.isFinite(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  }
  let nextNum = maxNumber + 1;
  let candidate = `GALLERY-${String(nextNum).padStart(3, '0')}`;
  while (normalizedExisting.has(candidate)) {
    nextNum += 1;
    candidate = `GALLERY-${String(nextNum).padStart(3, '0')}`;
  }
  return candidate;
}

export function validateGalleryForm(
  values: GalleryFormPayload
): GalleryValidationErrors {
  const errors: GalleryValidationErrors = {};

  const trimmedTitle = values.title.trim();
  if (!trimmedTitle || trimmedTitle.length < 3) {
    errors.title = 'Enter a photo title (at least 3 characters).';
  } else if (trimmedTitle.length > GALLERY_FIELD_LIMITS.titleMaxChars) {
    errors.title = `Title cannot exceed ${GALLERY_FIELD_LIMITS.titleMaxChars} characters.`;
  } else if (countWords(trimmedTitle) > GALLERY_FIELD_LIMITS.titleMaxWords) {
    errors.title = `Title cannot exceed ${GALLERY_FIELD_LIMITS.titleMaxWords} words.`;
  }

  const trimmedCategory = values.category.trim();
  if (!trimmedCategory || trimmedCategory.length < 2) {
    errors.category = 'Select or enter a category (at least 2 characters).';
  } else if (trimmedCategory.length > GALLERY_FIELD_LIMITS.categoryMaxChars) {
    errors.category = `Category cannot exceed ${GALLERY_FIELD_LIMITS.categoryMaxChars} characters.`;
  } else if (countWords(trimmedCategory) > GALLERY_FIELD_LIMITS.categoryMaxWords) {
    errors.category = `Category cannot exceed ${GALLERY_FIELD_LIMITS.categoryMaxWords} words.`;
  }

  const trimmedCaption = values.caption.trim();
  if (trimmedCaption.length > GALLERY_FIELD_LIMITS.captionMaxChars) {
    errors.caption = `Caption cannot exceed ${GALLERY_FIELD_LIMITS.captionMaxChars} characters.`;
  } else if (
    trimmedCaption &&
    countWords(trimmedCaption) > GALLERY_FIELD_LIMITS.captionMaxWords
  ) {
    errors.caption = `Caption cannot exceed ${GALLERY_FIELD_LIMITS.captionMaxWords} words.`;
  }

  if (values.altText.trim().length > GALLERY_FIELD_LIMITS.altTextMaxChars) {
    errors.altText = `Alt text cannot exceed ${GALLERY_FIELD_LIMITS.altTextMaxChars} characters.`;
  }

  if (!values.imageUrl.trim()) {
    errors.imageUrl = 'Upload a gallery image or select a preset.';
  }

  if (!Number.isFinite(values.displayOrder) || values.displayOrder < 1) {
    errors.displayOrder = 'Display order must be 1 or higher.';
  }

  return errors;
}


