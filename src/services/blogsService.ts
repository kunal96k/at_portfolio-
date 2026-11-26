import { buildApiEndpointUrl, getApiBaseUrl } from '../config/api';
import type { CourseAttachment } from './coursesService';
import { adminFetch } from './authService';
import { resolveResourceUrl } from './resourcesService';

export type BlogStatus = 'Published' | 'Draft' | 'Scheduled';

export type BlogAttachment = CourseAttachment;

export interface BlogSectionItem {
  heading: string;
  body: string;
  images?: string[];
}

export interface BlogArticle {
  id: string;
  blogCode: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  readTime: string;
  guideLabel: string;
  excerpt: string;
  sections: BlogSectionItem[];
  tags: string[];
  coverImage: string;
  coverImageName?: string;
  attachments: BlogAttachment[];
  attachmentCount: number;
  featured: boolean;
  viewsCount: number;
  displayOrder: number;
  status: BlogStatus;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogFormPayload {
  blogCode: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  readTime: string;
  guideLabel: string;
  excerpt: string;
  sections: BlogSectionItem[];
  tags: string[];
  coverImage: string;
  coverImageName: string;
  attachments: BlogAttachment[];
  featured: boolean;
  displayOrder: number;
  status: BlogStatus;
  scheduledAt?: string | null;
}

export interface BlogSearchParams {
  search?: string;
  status?: string;
  category?: string;
  featuredOnly?: boolean;
  hasFilesOnly?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface BlogStats {
  total: number;
  published: number;
  drafts: number;
  scheduled: number;
  featured: number;
  totalViews: number;
  totalDocuments: number;
}

export interface BlogPageResult {
  items: BlogArticle[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  stats: BlogStats;
  availableCategories: string[];
}

export const BLOGS_STORAGE_KEY = 'arvind_thevar_blogs_v2';
export const BLOGS_UPDATED_EVENT = 'arvind-blogs-updated';

function blogsApiBase(): string {
  return `${getApiBaseUrl()}/api/blogs`;
}

function normalizeStatus(rawStatus: unknown): BlogStatus {
  const normalized = String(rawStatus ?? '').trim().toLowerCase();
  if (normalized === 'draft') return 'Draft';
  if (normalized === 'scheduled') return 'Scheduled';
  return 'Published';
}

function sanitizeBlogRecord(raw: BlogArticle): BlogArticle {
  const sections: BlogSectionItem[] = Array.isArray(raw.sections)
    ? raw.sections.map((sec) => ({
        heading: String(sec?.heading ?? ''),
        body: String(sec?.body ?? ''),
        images: Array.isArray(sec?.images)
          ? sec.images
              .map((img) => resolveResourceUrl(String(img ?? '')))
              .filter(Boolean)
          : [],
      }))
    : [];

  const attachments: BlogAttachment[] = Array.isArray(raw.attachments)
    ? raw.attachments.map((att) => ({
        ...att,
        url: att?.url ? resolveResourceUrl(String(att.url)) : att?.url,
      }))
    : [];

  return {
    ...raw,
    id: String(raw.id),
    blogCode: String(raw.blogCode ?? ''),
    title: String(raw.title ?? ''),
    slug: String(raw.slug ?? ''),
    category: String(raw.category ?? '').trim() || 'IT Infrastructure',
    author: String(raw.author ?? '').trim() || 'Arvind Thevar',
    readTime: String(raw.readTime ?? '').trim() || '5 min read',
    guideLabel: String(raw.guideLabel ?? '').trim() || 'Infrastructure Guide',
    excerpt: String(raw.excerpt ?? ''),
    sections,
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => String(t)) : [],
    coverImage: resolveResourceUrl(String(raw.coverImage ?? '')),
    coverImageName: String(raw.coverImageName ?? ''),
    attachments,
    attachmentCount: Number(raw.attachmentCount ?? attachments.length),
    featured: Boolean(raw.featured),
    viewsCount: Number(raw.viewsCount ?? 0),
    displayOrder: Number(raw.displayOrder ?? 1),
    status: normalizeStatus(raw.status),
    scheduledAt: raw.scheduledAt ? String(raw.scheduledAt) : null,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  };
}

function sanitizeBlogPage(raw: BlogPageResult): BlogPageResult {
  return {
    items: (raw.items ?? []).map(sanitizeBlogRecord),
    page: Number(raw.page ?? 0),
    size: Number(raw.size ?? 5),
    totalItems: Number(raw.totalItems ?? 0),
    totalPages: Math.max(1, Number(raw.totalPages ?? 1)),
    hasNext: Boolean(raw.hasNext),
    hasPrevious: Boolean(raw.hasPrevious),
    stats: {
      total: Number(raw.stats?.total ?? 0),
      published: Number(raw.stats?.published ?? 0),
      drafts: Number(raw.stats?.drafts ?? 0),
      scheduled: Number(raw.stats?.scheduled ?? 0),
      featured: Number(raw.stats?.featured ?? 0),
      totalViews: Number(raw.stats?.totalViews ?? 0),
      totalDocuments: Number(raw.stats?.totalDocuments ?? 0),
    },
    availableCategories: Array.isArray(raw.availableCategories)
      ? raw.availableCategories.filter(Boolean)
      : [],
  };
}

function buildSearchUrl(path: string, params: BlogSearchParams): string {
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
  if (params.featuredOnly) {
    searchParams.set('featuredOnly', 'true');
  }
  if (params.hasFilesOnly) {
    searchParams.set('hasFilesOnly', 'true');
  }
  searchParams.set('page', String(Math.max(0, params.page ?? 0)));
  searchParams.set('size', String(Math.max(1, params.size ?? 5)));
  if (params.sortBy) {
    searchParams.set('sortBy', params.sortBy);
  }
  if (params.sortDir) {
    searchParams.set('sortDir', params.sortDir);
  }
  return buildApiEndpointUrl(`${blogsApiBase()}${path}`, searchParams);
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      message?: string;
      validationErrors?: Record<string, string>;
    };
    if (data.validationErrors) {
      const firstErr = Object.values(data.validationErrors)[0];
      if (firstErr) return firstErr;
    }
    if (data.message) return data.message;
  } catch {
    // Non-JSON error body
  }
  return `Server responded with status ${response.status}`;
}

export function buildEmptyPublicBlogPage(
  params: BlogSearchParams = {}
): BlogPageResult {
  return {
    items: [],
    page: Math.max(0, params.page ?? 0),
    size: Math.max(1, params.size ?? 5),
    totalItems: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    stats: {
      total: 0,
      published: 0,
      drafts: 0,
      scheduled: 0,
      featured: 0,
      totalViews: 0,
      totalDocuments: 0,
    },
    availableCategories: [],
  };
}

export function loadPublicBlogsFromStorage(): BlogArticle[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(BLOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BlogArticle[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeBlogRecord)
      .filter((b) => b.status === 'Published')
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        if (a.viewsCount !== b.viewsCount) return b.viewsCount - a.viewsCount;
        return a.displayOrder - b.displayOrder;
      });
  } catch {
    return [];
  }
}

export function saveBlogsSnapshotToStorage(
  blogs: BlogArticle[],
  emitEvent = false
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(blogs));
    if (emitEvent) {
      window.dispatchEvent(new CustomEvent(BLOGS_UPDATED_EVENT));
    }
  } catch {
    // Ignore storage quota errors
  }
}

export async function fetchAdminBlogsPageBackend(
  params: BlogSearchParams = {},
  signal?: AbortSignal
): Promise<BlogPageResult> {
  const response = await adminFetch(buildSearchUrl('/search', params), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: BlogPageResult };
  if (!json.data) {
    throw new Error('Unexpected response format from server.');
  }
  return sanitizeBlogPage(json.data);
}

export async function fetchPublicBlogsPageAsync(
  params: BlogSearchParams = {},
  signal?: AbortSignal
): Promise<{ page: BlogPageResult; fromApi: boolean }> {
  if (typeof window === 'undefined') {
    return { page: buildEmptyPublicBlogPage(params), fromApi: false };
  }
  try {
    const response = await fetch(buildSearchUrl('/public/search', params), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal,
    });
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }
    const json = (await response.json()) as { data?: BlogPageResult };
    if (json.data) {
      return { page: sanitizeBlogPage(json.data), fromApi: true };
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    // Render clean empty state if server unreachable
  }
  return { page: buildEmptyPublicBlogPage(params), fromApi: false };
}

export async function fetchAllBlogsBackend(): Promise<BlogArticle[]> {
  const response = await adminFetch(blogsApiBase(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: BlogArticle[] };
  return Array.isArray(json.data) ? json.data.map(sanitizeBlogRecord) : [];
}

export async function fetchAllBlogsFromApiOrStorage(): Promise<{
  items: BlogArticle[];
  fromApi: boolean;
}> {
  try {
    const response = await adminFetch(blogsApiBase(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }
    const json = (await response.json()) as { data?: BlogArticle[] };
    if (Array.isArray(json.data)) {
      const items = json.data.map(sanitizeBlogRecord);
      saveBlogsSnapshotToStorage(items);
      return { items, fromApi: true };
    }
  } catch {
    // Return cached backend items or empty list
  }

  return {
    items: loadPublicBlogsFromStorage(),
    fromApi: false,
  };
}

export async function fetchPublicBlogsAsync(): Promise<{
  items: BlogArticle[];
  fromApi: boolean;
}> {
  if (typeof window === 'undefined') {
    return { items: [], fromApi: false };
  }
  try {
    const response = await fetch(`${blogsApiBase()}/public`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }
    const json = (await response.json()) as { data?: BlogArticle[] };
    if (Array.isArray(json.data)) {
      const items = json.data.map(sanitizeBlogRecord);
      saveBlogsSnapshotToStorage(items);
      return { items, fromApi: true };
    }
  } catch {
    // Return empty state instead of hardcoded mock blogs
  }
  return { items: [], fromApi: false };
}

export async function fetchPublicBlogBySlugAsync(
  slug: string,
  signal?: AbortSignal
): Promise<{ item: BlogArticle | null; fromApi: boolean }> {
  const cleanSlug = slug.trim().toLowerCase();
  if (typeof window === 'undefined') {
    return { item: null, fromApi: false };
  }
  try {
    const response = await fetch(
      `${blogsApiBase()}/public/slug/${encodeURIComponent(cleanSlug)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal,
      }
    );
    if (response.status === 404) {
      return { item: null, fromApi: true };
    }
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }
    const json = (await response.json()) as { data?: BlogArticle };
    return {
      item: json.data ? sanitizeBlogRecord(json.data) : null,
      fromApi: true,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    return { item: null, fromApi: false };
  }
}

export async function fetchNextBlogCodeBackend(): Promise<string> {
  const response = await adminFetch(`${blogsApiBase()}/next-code`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: { blogCode?: string } };
  return json.data?.blogCode ?? 'BLOG-001';
}

export async function createBlogBackend(
  payload: BlogFormPayload
): Promise<BlogArticle> {
  const response = await adminFetch(blogsApiBase(), {
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
  const json = (await response.json()) as { data?: BlogArticle };
  if (!json.data) throw new Error('Unexpected response from server.');
  const saved = sanitizeBlogRecord(json.data);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BLOGS_UPDATED_EVENT));
  }
  return saved;
}

export async function updateBlogBackend(
  id: string,
  payload: BlogFormPayload
): Promise<BlogArticle> {
  const response = await adminFetch(`${blogsApiBase()}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: BlogArticle };
  if (!json.data) throw new Error('Unexpected response from server.');
  const saved = sanitizeBlogRecord(json.data);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BLOGS_UPDATED_EVENT));
  }
  return saved;
}

export async function patchBlogStatusBackend(
  id: string,
  status: BlogStatus,
  scheduledAt?: string | null
): Promise<BlogArticle> {
  const body: Record<string, string> = { status };
  if (scheduledAt) {
    body.scheduledAt = scheduledAt;
  }
  const response = await adminFetch(
    `${blogsApiBase()}/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: BlogArticle };
  if (!json.data) throw new Error('Unexpected response from server.');
  const saved = sanitizeBlogRecord(json.data);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BLOGS_UPDATED_EVENT));
  }
  return saved;
}

export async function patchBlogFeaturedBackend(
  id: string,
  featured: boolean
): Promise<BlogArticle> {
  const response = await adminFetch(
    `${blogsApiBase()}/${encodeURIComponent(id)}/featured`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ featured }),
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: BlogArticle };
  if (!json.data) throw new Error('Unexpected response from server.');
  const saved = sanitizeBlogRecord(json.data);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BLOGS_UPDATED_EVENT));
  }
  return saved;
}

export async function recordBlogViewBackend(
  id: string
): Promise<BlogArticle | null> {
  try {
    const response = await fetch(
      `${blogsApiBase()}/public/${encodeURIComponent(id)}/view`,
      {
        method: 'POST',
        headers: { Accept: 'application/json' },
      }
    );
    if (!response.ok) return null;
    const json = (await response.json()) as { data?: BlogArticle };
    return json.data ? sanitizeBlogRecord(json.data) : null;
  } catch {
    return null;
  }
}

export async function deleteBlogBackend(id: string): Promise<void> {
  const response = await adminFetch(`${blogsApiBase()}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BLOGS_UPDATED_EVENT));
  }
}
