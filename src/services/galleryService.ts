import {
  resolveResourceUrl,
  uploadProjectFileBackend,
  type ProjectUploadedFileResult,
} from './resourcesService';

export type GalleryStatus = 'Published' | 'Draft';

export type GalleryCategory =
  | 'Training'
  | 'Labs'
  | 'Infrastructure'
  | 'Events'
  | (string & {});

export interface GalleryItem {
  id: string;
  galleryCode: string;
  title: string;
  caption: string;
  category: GalleryCategory;
  imageUrl: string;
  imageName: string;
  altText: string;
  tags: string[];
  featured: boolean;
  displayOrder: number;
  status: GalleryStatus;
  takenAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryFormPayload {
  galleryCode: string;
  title: string;
  caption: string;
  category: string;
  imageUrl: string;
  imageName: string;
  altText: string;
  tags: string[];
  featured: boolean;
  displayOrder: number;
  status: GalleryStatus;
  takenAt?: string | null;
}

export interface GallerySearchParams {
  search?: string;
  status?: string;
  category?: string;
  featuredOnly?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface GalleryStats {
  total: number;
  published: number;
  drafts: number;
  featured: number;
}

export interface GalleryPageResult {
  items: GalleryItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  stats: GalleryStats;
  availableCategories: string[];
}

export const GALLERY_STORAGE_KEY = 'arvind_thevar_gallery_v2';
export const GALLERY_UPDATED_EVENT = 'arvind-gallery-updated';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080';

function galleryApiBase(): string {
  return `${API_BASE_URL.replace(/\/+$/, '')}/api/gallery`;
}

function normalizeStatus(rawStatus: unknown): GalleryStatus {
  const normalized = String(rawStatus ?? '').trim().toLowerCase();
  if (normalized === 'draft') return 'Draft';
  return 'Published';
}

function sanitizeGalleryRecord(raw: GalleryItem): GalleryItem {
  const title = String(raw.title ?? '');
  return {
    ...raw,
    id: String(raw.id),
    galleryCode: String(raw.galleryCode ?? ''),
    title,
    caption: String(raw.caption ?? ''),
    category: String(raw.category ?? '').trim() || 'Training',
    imageUrl: resolveResourceUrl(String(raw.imageUrl ?? '')),
    imageName: String(raw.imageName ?? ''),
    altText: String(raw.altText ?? '').trim() || title,
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => String(t)) : [],
    featured: Boolean(raw.featured),
    displayOrder: Number(raw.displayOrder ?? 1),
    status: normalizeStatus(raw.status),
    takenAt: raw.takenAt ? String(raw.takenAt).slice(0, 10) : null,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  };
}

function sanitizeGalleryPage(
  raw: GalleryPageResult,
  defaultSize = 12
): GalleryPageResult {
  return {
    items: (raw.items ?? []).map(sanitizeGalleryRecord),
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
      featured: Number(raw.stats?.featured ?? 0),
    },
    availableCategories: Array.isArray(raw.availableCategories)
      ? raw.availableCategories.filter(Boolean)
      : [],
  };
}

function buildSearchUrl(path: string, params: GallerySearchParams, defaultSize: number): string {
  const url = new URL(`${galleryApiBase()}${path}`);
  if (params.search && params.search.trim()) {
    url.searchParams.set('search', params.search.trim());
  }
  if (params.status && params.status !== 'All') {
    url.searchParams.set('status', params.status);
  }
  if (params.category && params.category !== 'All') {
    url.searchParams.set('category', params.category);
  }
  if (params.featuredOnly) {
    url.searchParams.set('featuredOnly', 'true');
  }
  url.searchParams.set('page', String(Math.max(0, params.page ?? 0)));
  url.searchParams.set('size', String(Math.max(1, params.size ?? defaultSize)));
  if (params.sortBy) {
    url.searchParams.set('sortBy', params.sortBy);
  }
  if (params.sortDir) {
    url.searchParams.set('sortDir', params.sortDir);
  }
  return url.toString();
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

export function buildEmptyPublicGalleryPage(
  params: GallerySearchParams = {}
): GalleryPageResult {
  return {
    items: [],
    page: Math.max(0, params.page ?? 0),
    size: Math.max(1, params.size ?? 12),
    totalItems: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    stats: {
      total: 0,
      published: 0,
      drafts: 0,
      featured: 0,
    },
    availableCategories: [],
  };
}

function notifyGalleryChanged(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GALLERY_STORAGE_KEY, String(Date.now()));
  } catch {
    // Ignore storage quota issues
  }
  window.dispatchEvent(new CustomEvent(GALLERY_UPDATED_EVENT));
}

export async function fetchPublicGalleryPageAsync(
  params: GallerySearchParams = {},
  signal?: AbortSignal
): Promise<{ page: GalleryPageResult; fromApi: boolean }> {
  if (typeof window === 'undefined') {
    return { page: buildEmptyPublicGalleryPage(params), fromApi: false };
  }
  try {
    const response = await fetch(buildSearchUrl('/public/search', params, 12), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal,
    });
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }
    const json = (await response.json()) as { data?: GalleryPageResult };
    if (json.data) {
      return { page: sanitizeGalleryPage(json.data, 12), fromApi: true };
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    // Render clean empty state UI when backend is unavailable
  }
  return { page: buildEmptyPublicGalleryPage(params), fromApi: false };
}

export async function fetchAdminGalleryPageBackend(
  params: GallerySearchParams = {},
  signal?: AbortSignal
): Promise<GalleryPageResult> {
  const response = await fetch(buildSearchUrl('', params, 5), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: GalleryPageResult };
  if (!json.data) {
    throw new Error('Unexpected response format from server.');
  }
  return sanitizeGalleryPage(json.data, 5);
}

export async function fetchAllGalleryItemsBackend(): Promise<GalleryItem[]> {
  try {
    const response = await fetch(`${galleryApiBase()}/all`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }
    const json = (await response.json()) as { data?: GalleryItem[] };
    if (Array.isArray(json.data)) {
      return json.data.map(sanitizeGalleryRecord);
    }
  } catch {
    // Let paginated endpoint surface connectivity errors
  }
  return [];
}

export async function fetchNextGalleryCodeBackend(): Promise<string> {
  const response = await fetch(`${galleryApiBase()}/next-code`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: { galleryCode?: string } };
  return json.data?.galleryCode ?? 'GALLERY-001';
}

export async function uploadGalleryImageBackend(
  file: File
): Promise<ProjectUploadedFileResult> {
  return uploadProjectFileBackend(file, 'gallery');
}

export async function createGalleryItemBackend(
  payload: GalleryFormPayload
): Promise<GalleryItem> {
  const normalizedBody = {
    ...payload,
    takenAt: payload.takenAt && payload.takenAt.trim() ? payload.takenAt.trim() : null,
  };
  const response = await fetch(galleryApiBase(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(normalizedBody),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: GalleryItem };
  if (!json.data) throw new Error('Unexpected response from server.');
  const saved = sanitizeGalleryRecord(json.data);
  notifyGalleryChanged();
  return saved;
}

export async function updateGalleryItemBackend(
  id: string,
  payload: GalleryFormPayload
): Promise<GalleryItem> {
  const normalizedBody = {
    ...payload,
    takenAt: payload.takenAt && payload.takenAt.trim() ? payload.takenAt.trim() : null,
  };
  const response = await fetch(
    `${galleryApiBase()}/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(normalizedBody),
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: GalleryItem };
  if (!json.data) throw new Error('Unexpected response from server.');
  const saved = sanitizeGalleryRecord(json.data);
  notifyGalleryChanged();
  return saved;
}

export async function toggleGalleryStatusBackend(
  id: string,
  status?: GalleryStatus
): Promise<GalleryItem> {
  const response = await fetch(
    `${galleryApiBase()}/${encodeURIComponent(id)}/status`,
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
  const json = (await response.json()) as { data?: GalleryItem };
  if (!json.data) throw new Error('Unexpected response from server.');
  const saved = sanitizeGalleryRecord(json.data);
  notifyGalleryChanged();
  return saved;
}

export async function toggleGalleryFeaturedBackend(
  id: string,
  featured?: boolean
): Promise<GalleryItem> {
  const response = await fetch(
    `${galleryApiBase()}/${encodeURIComponent(id)}/featured`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(typeof featured === 'boolean' ? { featured } : {}),
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: GalleryItem };
  if (!json.data) throw new Error('Unexpected response from server.');
  const saved = sanitizeGalleryRecord(json.data);
  notifyGalleryChanged();
  return saved;
}

export async function deleteGalleryItemBackend(id: string): Promise<void> {
  const response = await fetch(
    `${galleryApiBase()}/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  notifyGalleryChanged();
}
