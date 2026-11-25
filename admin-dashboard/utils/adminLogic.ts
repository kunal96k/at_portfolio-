import type {
  Topic,
  TopicFormValues,
  TopicQueryState,
  TopicValidationErrors,
} from '../topics/types/topic';

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

export function validateTopicForm(
  values: TopicFormValues,
  existingSlugs: string[] = [],
  currentSlug?: string
): TopicValidationErrors {
  const errors: TopicValidationErrors = {};

  if (!values.title.trim() || values.title.trim().length < 3) {
    errors.title = 'Enter a topic title of at least 3 characters.';
  }

  const normalizedSlug = slugifyText(values.slug);
  if (!normalizedSlug) {
    errors.slug = 'Provide a valid URL slug (letters, numbers, and hyphens).';
  } else {
    const duplicate = existingSlugs.some(
      (slug) => slug === normalizedSlug && slug !== currentSlug
    );
    if (duplicate) {
      errors.slug = 'This slug is already in use by another topic.';
    }
  }

  if (!values.shortDescription.trim() || values.shortDescription.trim().length < 15) {
    errors.shortDescription = 'Add a short summary (at least 15 characters).';
  }

  if (!values.detailedContent.trim() || values.detailedContent.trim().length < 30) {
    errors.detailedContent = 'Add detailed topic notes or outline (at least 30 characters).';
  }

  if (!values.relatedCourse.trim()) {
    errors.relatedCourse = 'Select a related course or technology track.';
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

export function filterAndSortTopics(
  topics: Topic[],
  query: TopicQueryState
): PaginatedResult<Topic> {
  const q = query.search.trim().toLowerCase();

  const filtered = topics.filter((topic) => {
    if (query.status !== 'All' && topic.status !== query.status) return false;
    if (query.level !== 'All' && topic.learningLevel !== query.level) return false;
    if (query.course !== 'All' && topic.relatedCourse !== query.course) return false;
    if (query.featuredOnly && !topic.featured) return false;

    if (!q) return true;
    const haystack = [
      topic.title,
      topic.slug,
      topic.shortDescription,
      topic.relatedCourse,
      topic.subject,
      topic.tags.join(' '),
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
  return expandedIds.includes(groupId) ? [] : [groupId];
}

export function ensureSidebarGroupExpanded(
  expandedIds: SidebarGroupId[],
  groupId: SidebarGroupId | undefined
): SidebarGroupId[] {
  if (!groupId) return expandedIds;
  return [groupId];
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

