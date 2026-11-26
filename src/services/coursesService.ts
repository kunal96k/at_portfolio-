import { getApiBaseUrl } from '../config/api';
import { ASSETS, EXPERTISE_DOMAINS } from '../data/portfolioData';
import { adminFetch } from './authService';

export type CourseDomainStatus = 'Published' | 'Draft';

export interface CourseAttachment {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  url?: string;
  uploadedAt: string;
}

export interface CourseDomain {
  id: string;
  domainCode: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  detailedSyllabus: string;
  modules: string[];
  coverImage: string;
  coverImageName?: string;
  tags: string[];
  attachments: CourseAttachment[];
  displayOrder: number;
  status: CourseDomainStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDomainFormPayload {
  domainCode: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  detailedSyllabus: string;
  coverImage: string;
  coverImageName: string;
  tags: string[];
  attachments: CourseAttachment[];
  displayOrder: number;
  status: CourseDomainStatus;
}

export interface CourseSearchParams {
  search?: string;
  status?: string;
  category?: string;
  hasFilesOnly?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CourseStats {
  total: number;
  published: number;
  drafts: number;
  totalDocuments: number;
}

export interface CourseDomainPage {
  items: CourseDomain[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  stats: CourseStats;
  availableCategories: string[];
}

export const COURSES_STORAGE_KEY = 'arvind_thevar_courses_v1';
export const COURSES_UPDATED_EVENT = 'arvind-courses-updated';

function coursesApiBase(): string {
  return `${getApiBaseUrl()}/api/courses`;
}

export function parseCourseModules(detailedSyllabus: string): string[] {
  if (!detailedSyllabus) return [];
  return detailedSyllabus
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, '').trim())
    .filter((line) => line.length > 0);
}

function slugifyCourseTitle(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const DEFAULT_WEBSITE_CATEGORY_BY_TITLE: Record<string, string> = {
  'Red Hat': 'Enterprise Linux',
  CCNA: 'Networking',
  CCNP: 'Enterprise Routing',
  'Amazon Web Services (AWS)': 'Cloud Infrastructure',
  'Google Cloud Platform (GCP)': 'Cloud Infrastructure',
  'Microsoft Azure': 'Cloud Infrastructure',
  DevOps: 'DevOps & Automation',
  VMware: 'Virtualization',
  'Network Security': 'Security',
  'Server Infrastructure': 'Server Infrastructure',
};

/**
 * Lightweight fallback mirroring portfolioData.ts EXPERTISE_DOMAINS strictly for
 * build-time SSR prerendering or offline static renders when the backend API is unreachable.
 */
const DEFAULT_WEBSITE_DOMAINS: CourseDomain[] = EXPERTISE_DOMAINS.map(
  (dom, index) => {
    const order = index + 1;
    return {
      id: `default-${order}`,
      domainCode: `DOM-${String(order).padStart(3, '0')}`,
      title: dom.title,
      slug: slugifyCourseTitle(dom.title),
      category:
        DEFAULT_WEBSITE_CATEGORY_BY_TITLE[dom.title] ?? 'IT Infrastructure',
      shortDescription: dom.description,
      detailedSyllabus: '',
      modules: [],
      coverImage: ASSETS.courseLinux,
      coverImageName: 'linux_rhel_lab_1795164484674.jpg',
      tags: [],
      attachments: [],
      displayOrder: order,
      status: 'Published',
      createdAt: '2026-03-01T09:00:00.000Z',
      updatedAt: '2026-03-19T12:00:00.000Z',
    };
  }
);

function sanitizeCourseRecord(raw: CourseDomain): CourseDomain {
  const brokenCover =
    !raw.coverImage ||
    raw.coverImage.includes('framerusercontent.com') ||
    raw.coverImage.startsWith('/src/assets/images/');

  const modules =
    Array.isArray(raw.modules) && raw.modules.length > 0
      ? raw.modules
      : parseCourseModules(raw.detailedSyllabus || '');

  return {
    ...raw,
    id: String(raw.id),
    category: String(raw.category ?? '').trim() || 'IT Infrastructure',
    detailedSyllabus: String(raw.detailedSyllabus ?? ''),
    modules,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
    coverImage: brokenCover ? ASSETS.courseLinux : raw.coverImage,
  };
}

export function loadAllCoursesFromStorage(): CourseDomain[] {
  if (typeof window === 'undefined') return DEFAULT_WEBSITE_DOMAINS;
  try {
    const raw = window.localStorage.getItem(COURSES_STORAGE_KEY);
    if (raw === null) return DEFAULT_WEBSITE_DOMAINS;
    const parsed = JSON.parse(raw) as CourseDomain[];
    if (!Array.isArray(parsed)) return DEFAULT_WEBSITE_DOMAINS;
    return parsed.map(sanitizeCourseRecord);
  } catch {
    return DEFAULT_WEBSITE_DOMAINS;
  }
}

export function loadPublicCoursesFromStorage(): CourseDomain[] {
  return loadAllCoursesFromStorage()
    .filter((c) => c.status === 'Published')
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function saveCoursesToStorage(
  courses: CourseDomain[],
  emitEvent = true
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
    if (emitEvent) {
      window.dispatchEvent(new CustomEvent(COURSES_UPDATED_EVENT));
    }
  } catch {
    // Ignore storage quota warnings
  }
}

function mapApiCourse(apiItem: Record<string, unknown>): CourseDomain {
  const rawCover = String(apiItem.coverImage ?? ASSETS.courseLinux);
  const apiBase = getApiBaseUrl();
  const resolvedCover = rawCover.startsWith('/api/files/')
    ? `${apiBase}${rawCover}`
    : rawCover;

  const resolvedAttachments: CourseAttachment[] = Array.isArray(
    apiItem.attachments
  )
    ? (apiItem.attachments as CourseAttachment[]).map((att) => ({
        ...att,
        url:
          att.url && att.url.startsWith('/api/files/')
            ? `${apiBase}${att.url}`
            : att.url,
      }))
    : [];

  return sanitizeCourseRecord({
    id: String(apiItem.id ?? ''),
    domainCode: String(apiItem.domainCode ?? ''),
    title: String(apiItem.title ?? ''),
    slug: String(apiItem.slug ?? ''),
    category: String(apiItem.category ?? ''),
    shortDescription: String(apiItem.shortDescription ?? ''),
    detailedSyllabus: String(apiItem.detailedSyllabus ?? ''),
    modules: Array.isArray(apiItem.modules)
      ? apiItem.modules.map(String)
      : [],
    coverImage: resolvedCover,
    coverImageName: apiItem.coverImageName
      ? String(apiItem.coverImageName)
      : undefined,
    tags: Array.isArray(apiItem.tags) ? apiItem.tags.map(String) : [],
    attachments: resolvedAttachments,
    displayOrder: Number(apiItem.displayOrder ?? 1),
    status: apiItem.status === 'Draft' ? 'Draft' : 'Published',
    createdAt: String(apiItem.createdAt ?? new Date().toISOString()),
    updatedAt: String(apiItem.updatedAt ?? new Date().toISOString()),
  });
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const json = (await response.json()) as {
      message?: string;
      validationErrors?: Record<string, string>;
    };
    if (json?.validationErrors) {
      const firstErr = Object.values(json.validationErrors)[0];
      if (firstErr) return firstErr;
    }
    if (json?.message) return json.message;
  } catch {
    // Ignore JSON parse fallback
  }
  return `Request failed with status ${response.status}`;
}

function buildCourseQueryString(params: CourseSearchParams): string {
  const searchParams = new URLSearchParams();
  if (params.search && params.search.trim()) {
    searchParams.set('search', params.search.trim());
  }
  if (params.status && params.status !== 'All') {
    searchParams.set('status', params.status);
  }
  if (params.category && params.category !== 'All') {
    searchParams.set('category', params.category);
  }
  if (params.hasFilesOnly) {
    searchParams.set('hasFilesOnly', 'true');
  }
  searchParams.set('page', String(Math.max(0, params.page ?? 0)));
  searchParams.set('size', String(Math.max(1, params.size ?? 5)));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  return searchParams.toString();
}

export async function fetchAdminCoursesPageBackend(
  params: CourseSearchParams,
  signal?: AbortSignal
): Promise<CourseDomainPage> {
  const qs = buildCourseQueryString(params);
  const response = await adminFetch(`${coursesApiBase()}/search?${qs}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as {
    data?: Record<string, unknown>;
  };
  const rawData = json?.data ?? {};
  const rawItems = Array.isArray(rawData.items)
    ? (rawData.items as Record<string, unknown>[])
    : [];
  const rawStats = (rawData.stats ?? {}) as Record<string, unknown>;

  return {
    items: rawItems.map(mapApiCourse),
    page: Number(rawData.page ?? 0),
    size: Number(rawData.size ?? 5),
    totalItems: Number(rawData.totalItems ?? rawItems.length),
    totalPages: Math.max(1, Number(rawData.totalPages ?? 1)),
    hasNext: Boolean(rawData.hasNext),
    hasPrevious: Boolean(rawData.hasPrevious),
    stats: {
      total: Number(rawStats.total ?? rawItems.length),
      published: Number(rawStats.published ?? 0),
      drafts: Number(rawStats.drafts ?? 0),
      totalDocuments: Number(rawStats.totalDocuments ?? 0),
    },
    availableCategories: Array.isArray(rawData.availableCategories)
      ? rawData.availableCategories.map(String)
      : [],
  };
}

export async function fetchPublicCoursesAsync(): Promise<CourseDomain[]> {
  if (typeof fetch !== 'function' || typeof window === 'undefined') {
    return DEFAULT_WEBSITE_DOMAINS;
  }
  try {
    const response = await fetch(`${coursesApiBase()}/public`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return loadPublicCoursesFromStorage();
    }
    const json = (await response.json()) as {
      data?: Record<string, unknown>[];
    };
    const items = Array.isArray(json?.data) ? json.data.map(mapApiCourse) : [];
    const sorted = items.sort((a, b) => a.displayOrder - b.displayOrder);
    if (typeof window !== 'undefined') {
      try {
        // Keep public cache synchronized so hard-deleted domains never reappear on reload
        const existingRaw = window.localStorage.getItem(COURSES_STORAGE_KEY);
        const existing = existingRaw ? (JSON.parse(existingRaw) as CourseDomain[]) : [];
        const drafts = Array.isArray(existing)
          ? existing.filter((c) => c.status === 'Draft')
          : [];
        window.localStorage.setItem(
          COURSES_STORAGE_KEY,
          JSON.stringify([...sorted, ...drafts])
        );
      } catch {
        // Ignore storage quota issues
      }
    }
    return sorted;
  } catch {
    return loadPublicCoursesFromStorage();
  }
}

export async function fetchAllCoursesBackend(): Promise<CourseDomain[]> {
  const response = await adminFetch(coursesApiBase(), {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as {
    data?: Record<string, unknown>[];
  };
  const items = Array.isArray(json?.data) ? json.data.map(mapApiCourse) : [];
  saveCoursesToStorage(items, false);
  return items;
}

export async function fetchAllCoursesFromApiOrStorage(): Promise<{
  items: CourseDomain[];
  fromBackend: boolean;
}> {
  if (typeof fetch !== 'function' || typeof window === 'undefined') {
    return { items: DEFAULT_WEBSITE_DOMAINS, fromBackend: false };
  }
  try {
    const items = await fetchAllCoursesBackend();
    return { items, fromBackend: true };
  } catch {
    return { items: [], fromBackend: false };
  }
}

export async function fetchNextDomainCodeBackend(): Promise<string> {
  const response = await adminFetch(`${coursesApiBase()}/next-code`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as {
    data?: { domainCode?: string };
  };
  return json?.data?.domainCode || 'DOM-001';
}

export async function createCourseBackend(
  payload: CourseDomainFormPayload
): Promise<CourseDomain> {
  const response = await adminFetch(coursesApiBase(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: Record<string, unknown> };
  if (!json?.data) throw new Error('Invalid response from server.');
  return mapApiCourse(json.data);
}

export async function updateCourseBackend(
  id: string,
  payload: CourseDomainFormPayload
): Promise<CourseDomain> {
  const response = await adminFetch(
    `${coursesApiBase()}/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: Record<string, unknown> };
  if (!json?.data) throw new Error('Invalid response from server.');
  return mapApiCourse(json.data);
}

export async function patchCourseStatusBackend(
  id: string,
  status: CourseDomainStatus
): Promise<CourseDomain> {
  const response = await adminFetch(
    `${coursesApiBase()}/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ status }),
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: Record<string, unknown> };
  if (!json?.data) throw new Error('Invalid response from server.');
  return mapApiCourse(json.data);
}

export async function deleteCourseBackend(id: string): Promise<void> {
  const response = await adminFetch(
    `${coursesApiBase()}/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}
