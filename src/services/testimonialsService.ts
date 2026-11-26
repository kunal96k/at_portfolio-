import {
  resolveResourceUrl,
  uploadProjectFileBackend,
  type ProjectUploadedFileResult,
} from './resourcesService';

export type TestimonialStatus = 'Published' | 'Draft' | 'Archived';

export interface StudentTestimonial {
  id: string;
  testimonialCode: string;
  studentName: string;
  role: string;
  company: string;
  courseTrack: string;
  quote: string;
  avatarUrl: string;
  avatarName: string;
  featured: boolean;
  displayOrder: number;
  status: TestimonialStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialFormPayload {
  testimonialCode: string;
  studentName: string;
  role: string;
  company: string;
  courseTrack: string;
  quote: string;
  avatarUrl: string;
  avatarName: string;
  featured: boolean;
  displayOrder: number;
  status: TestimonialStatus;
}

export interface TestimonialSearchParams {
  search?: string;
  status?: 'All' | TestimonialStatus;
  courseTrack?: string;
  featuredOnly?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface TestimonialStats {
  total: number;
  published: number;
  drafts: number;
  archived: number;
  featured: number;
}

export interface TestimonialPageResult {
  items: StudentTestimonial[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  stats: TestimonialStats;
  availableCourseTracks: string[];
}

export const TESTIMONIALS_UPDATED_EVENT = 'arvind-testimonials-updated';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080';

function testimonialsApiBase(): string {
  return `${API_BASE_URL.replace(/\/+$/, '')}/api/testimonials`;
}

function normalizeStatus(raw: unknown): TestimonialStatus {
  const s = String(raw ?? '').trim().toLowerCase();
  if (s === 'draft') return 'Draft';
  if (s === 'archived') return 'Archived';
  return 'Published';
}

function sanitizeTestimonialRecord(raw: StudentTestimonial): StudentTestimonial {
  return {
    ...raw,
    id: String(raw.id),
    testimonialCode: String(raw.testimonialCode ?? ''),
    studentName: String(raw.studentName ?? ''),
    role: String(raw.role ?? ''),
    company: String(raw.company ?? ''),
    courseTrack: String(raw.courseTrack ?? ''),
    quote: String(raw.quote ?? ''),
    avatarUrl: resolveResourceUrl(String(raw.avatarUrl ?? '')),
    avatarName: String(raw.avatarName ?? ''),
    featured: Boolean(raw.featured),
    displayOrder: Number(raw.displayOrder ?? 1),
    status: normalizeStatus(raw.status),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  };
}

function sanitizeTestimonialPage(
  raw: TestimonialPageResult,
  defaultSize = 6
): TestimonialPageResult {
  return {
    items: (raw.items ?? []).map(sanitizeTestimonialRecord),
    page: Number(raw.page ?? 0),
    size: Number(raw.size ?? defaultSize),
    totalItems: Number(raw.totalItems ?? 0),
    totalPages: Math.max(1, Number(raw.totalPages ?? 1)),
    hasNext: Boolean(raw.hasNext),
    hasPrevious: Boolean(raw.hasPrevious),
    stats: {
      total: Number(raw.stats?.total ?? 0),
      published: Number(raw.stats?.published ?? 0),
      drafts: Number(raw.stats?.drafts ?? 0),
      archived: Number(raw.stats?.archived ?? 0),
      featured: Number(raw.stats?.featured ?? 0),
    },
    availableCourseTracks: Array.isArray(raw.availableCourseTracks)
      ? raw.availableCourseTracks.filter(Boolean)
      : [],
  };
}

function buildSearchUrl(
  path: string,
  params: TestimonialSearchParams,
  defaultSize: number
): string {
  const url = new URL(`${testimonialsApiBase()}${path}`);
  if (params.search && params.search.trim()) {
    url.searchParams.set('search', params.search.trim());
  }
  if (params.status && params.status !== 'All') {
    url.searchParams.set('status', params.status);
  }
  if (params.courseTrack && params.courseTrack !== 'All') {
    url.searchParams.set('courseTrack', params.courseTrack);
  }
  if (params.featuredOnly) {
    url.searchParams.set('featuredOnly', 'true');
  }
  url.searchParams.set('page', String(Math.max(0, params.page ?? 0)));
  url.searchParams.set('size', String(Math.max(1, params.size ?? defaultSize)));
  url.searchParams.set('sortBy', params.sortBy ?? 'displayOrder');
  url.searchParams.set('sortDir', params.sortDir ?? 'asc');
  return url.toString();
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const text = await response.text();
    if (!text) return `Request failed with status ${response.status}`;
    const json = JSON.parse(text) as {
      message?: string;
      validationErrors?: Record<string, string>;
    };
    if (json?.validationErrors && typeof json.validationErrors === 'object') {
      const errs = Object.values(json.validationErrors).filter(Boolean);
      if (errs.length > 0) return errs.join(' ');
    }
    if (json?.message) return json.message;
  } catch {
    // Non-JSON response
  }
  return `Request failed with status ${response.status}`;
}

export function buildEmptyPublicTestimonialsPage(
  params: TestimonialSearchParams = {}
): TestimonialPageResult {
  return {
    items: [],
    page: params.page ?? 0,
    size: params.size ?? 6,
    totalItems: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    stats: { total: 0, published: 0, drafts: 0, archived: 0, featured: 0 },
    availableCourseTracks: [],
  };
}

function notifyTestimonialsUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TESTIMONIALS_UPDATED_EVENT));
  }
}

export async function fetchPublicTestimonialsPageAsync(
  params: TestimonialSearchParams,
  signal?: AbortSignal
): Promise<{ page: TestimonialPageResult; fromBackend: boolean }> {
  try {
    const url = buildSearchUrl('/public/search', params, params.size ?? 6);
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal,
    });
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }
    const json = (await response.json()) as { data?: TestimonialPageResult };
    return {
      page: sanitizeTestimonialPage(
        json?.data ?? buildEmptyPublicTestimonialsPage(params),
        params.size ?? 6
      ),
      fromBackend: true,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    return {
      page: buildEmptyPublicTestimonialsPage(params),
      fromBackend: false,
    };
  }
}

export async function fetchAdminTestimonialsPageBackend(
  params: TestimonialSearchParams,
  signal?: AbortSignal
): Promise<TestimonialPageResult> {
  const url = buildSearchUrl('/search', params, params.size ?? 5);
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: TestimonialPageResult };
  return sanitizeTestimonialPage(
    json?.data ?? buildEmptyPublicTestimonialsPage(params),
    params.size ?? 5
  );
}

export async function fetchAllTestimonialsBackend(): Promise<StudentTestimonial[]> {
  const response = await fetch(`${testimonialsApiBase()}/all`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: StudentTestimonial[] };
  return Array.isArray(json?.data)
    ? json.data.map(sanitizeTestimonialRecord)
    : [];
}

export async function fetchNextTestimonialCodeBackend(): Promise<string> {
  const response = await fetch(`${testimonialsApiBase()}/next-code`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as {
    data?: { testimonialCode?: string };
  };
  return json?.data?.testimonialCode || 'TEST-001';
}

export async function uploadTestimonialPhotoBackend(
  file: File
): Promise<ProjectUploadedFileResult> {
  return uploadProjectFileBackend(file, 'testimonials');
}

export async function createTestimonialBackend(
  payload: TestimonialFormPayload
): Promise<StudentTestimonial> {
  const response = await fetch(testimonialsApiBase(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: StudentTestimonial };
  if (!json?.data) throw new Error('Invalid server response.');
  notifyTestimonialsUpdated();
  return sanitizeTestimonialRecord(json.data);
}

export async function updateTestimonialBackend(
  id: string,
  payload: TestimonialFormPayload
): Promise<StudentTestimonial> {
  const response = await fetch(
    `${testimonialsApiBase()}/${encodeURIComponent(id)}`,
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
  const json = (await response.json()) as { data?: StudentTestimonial };
  if (!json?.data) throw new Error('Invalid server response.');
  notifyTestimonialsUpdated();
  return sanitizeTestimonialRecord(json.data);
}

export async function toggleTestimonialStatusBackend(
  id: string,
  status?: TestimonialStatus
): Promise<StudentTestimonial> {
  const response = await fetch(
    `${testimonialsApiBase()}/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(status ? { status } : {}),
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: StudentTestimonial };
  if (!json?.data) throw new Error('Invalid server response.');
  notifyTestimonialsUpdated();
  return sanitizeTestimonialRecord(json.data);
}

export async function toggleTestimonialFeaturedBackend(
  id: string,
  featured?: boolean
): Promise<StudentTestimonial> {
  const response = await fetch(
    `${testimonialsApiBase()}/${encodeURIComponent(id)}/featured`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(
        typeof featured === 'boolean' ? { featured } : {}
      ),
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: StudentTestimonial };
  if (!json?.data) throw new Error('Invalid server response.');
  notifyTestimonialsUpdated();
  return sanitizeTestimonialRecord(json.data);
}

export async function deleteTestimonialBackend(id: string): Promise<void> {
  const response = await fetch(
    `${testimonialsApiBase()}/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  notifyTestimonialsUpdated();
}
