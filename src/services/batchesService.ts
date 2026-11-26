import { ASSETS } from '../data/portfolioData';
import { adminFetch } from './authService';
import { resolveResourceUrl } from './resourcesService';

export type BatchCategory = 'Linux' | 'Networking' | 'Cloud' | 'DevOps' | (string & {});

export type BatchStatus = 'Published' | 'Draft';

export type BatchLearningLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface BatchAttachment {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  url?: string;
  uploadedAt: string;
}

export interface ManagedBatch {
  id: string;
  batchCode: string;
  title: string;
  slug: string;
  shortDescription: string;
  detailedContent: string;
  modules: string[];
  category: BatchCategory;
  relatedCourse: string;
  batchDate: string;
  batchTime: string;
  batchStartAt?: string | null;
  started?: boolean;
  mode: string;
  seatsTotal: number;
  location: string;
  coverImage: string;
  coverImageName?: string;
  tags: string[];
  learningLevel: BatchLearningLevel;
  attachments: BatchAttachment[];
  attachmentCount?: number;
  displayOrder: number;
  featured: boolean;
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BatchFormPayload {
  batchCode: string;
  title: string;
  slug: string;
  shortDescription: string;
  detailedContent: string;
  category: BatchCategory | string;
  relatedCourse: string;
  batchDate: string;
  batchTime: string;
  mode: string;
  seatsTotal: number;
  location: string;
  coverImage: string;
  coverImageName: string;
  tags: string[];
  learningLevel: BatchLearningLevel;
  attachments: BatchAttachment[];
  displayOrder: number;
  featured: boolean;
  status: BatchStatus;
}

export interface BatchSearchParams {
  search?: string;
  status?: string;
  category?: string;
  relatedCourse?: string;
  learningLevel?: string;
  hasFilesOnly?: boolean;
  scheduleFilter?: 'All' | 'upcoming' | 'started';
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface BatchStats {
  total: number;
  published: number;
  drafts: number;
  upcoming: number;
  started: number;
  totalDocuments: number;
}

export interface BatchPageResult {
  items: ManagedBatch[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  stats: BatchStats;
  availableCategories: string[];
  availableCourses: string[];
}

export const BATCHES_STORAGE_KEY = 'arvind_thevar_batches_v2';
export const BATCHES_UPDATED_EVENT = 'arvind-batches-updated';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080';

function batchesApiBase(): string {
  return `${API_BASE_URL.replace(/\/+$/, '')}/api/batches`;
}

export const COVER_BY_BATCH_CATEGORY: Record<string, string> = {
  Linux: ASSETS.courseLinux,
  Networking: ASSETS.courseCisco,
  Cloud: ASSETS.courseAws,
  DevOps: ASSETS.courseCorporate,
};

export function parseBatchModules(detailedContent: string): string[] {
  return detailedContent
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, '').trim())
    .filter(
      (line) => line.length > 0 && !line.startsWith('Sample Frontend Outline')
    );
}

/**
 * Formats YYYY-MM-DD dates into readable display labels (e.g., "12 Apr 2026").
 * Preserves legacy text strings safely if already non-ISO.
 */
export function formatBatchDateDisplay(rawDate: string): string {
  const trimmed = rawDate.trim();
  if (!trimmed) return 'Date to be announced';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
  }
  return trimmed;
}

/**
 * Normalizes a stored date string into YYYY-MM-DD format required by <input type="date">.
 */
export function normalizeDateForInput(rawDate: string): string {
  const trimmed = rawDate.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
}

/**
 * Formats 24h HH:mm input time into readable 12h time (e.g., "19:00" -> "07:00 PM IST").
 */
export function formatBatchTimeDisplay(rawTime: string): string {
  const trimmed = rawTime.trim();
  if (!trimmed) return 'Flexible Slots';
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (match) {
    const hour24 = Number(match[1]);
    const mins = match[2];
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${mins} ${period} IST`;
  }
  return trimmed;
}

/**
 * Normalizes a stored time string into HH:mm (24h) format required by <input type="time">.
 */
export function normalizeTimeForInput(rawTime: string): string {
  const trimmed = rawTime.trim();
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) return trimmed;
  const twelveHourMatch = /(\d{1,2}):([0-5]\d)\s*(AM|PM)/i.exec(trimmed);
  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const mins = twelveHourMatch[2];
    const period = twelveHourMatch[3].toUpperCase();
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${mins}`;
  }
  const plainMatch = /([01]?\d|2[0-3]):([0-5]\d)/.exec(trimmed);
  if (plainMatch) {
    return `${String(Number(plainMatch[1])).padStart(2, '0')}:${plainMatch[2]}`;
  }
  return '';
}

/**
 * Determines whether a batch's scheduled start date+time has already started.
 * Started batches are excluded from the public /upcoming-batches showcase.
 */
export function isBatchStarted(
  batch: Pick<ManagedBatch, 'batchDate' | 'batchTime' | 'batchStartAt' | 'started'>,
  nowMs: number = Date.now()
): boolean {
  if (typeof batch.started === 'boolean') {
    return batch.started;
  }
  if (batch.batchStartAt) {
    const parsedStart = new Date(batch.batchStartAt);
    if (!Number.isNaN(parsedStart.getTime())) {
      return parsedStart.getTime() <= nowMs;
    }
  }
  const isoDate = normalizeDateForInput(batch.batchDate || '');
  if (!isoDate) return false;
  const [y, m, d] = isoDate.split('-').map(Number);
  const hhmm = normalizeTimeForInput(batch.batchTime || '') || '23:59';
  const [hh, mm] = hhmm.split(':').map(Number);
  const localStart = new Date(y, m - 1, d, hh, mm, 0, 0);
  if (Number.isNaN(localStart.getTime())) return false;
  return localStart.getTime() <= nowMs;
}

function normalizeCategory(raw: unknown): BatchCategory {
  const cleaned = String(raw ?? '').trim();
  return cleaned || 'Linux';
}

function normalizeLevel(raw: unknown): BatchLearningLevel {
  if (raw === 'Beginner' || raw === 'Intermediate' || raw === 'Advanced') {
    return raw;
  }
  return 'Intermediate';
}

function normalizeStatus(raw: unknown): BatchStatus {
  return String(raw ?? '').trim().toLowerCase() === 'draft'
    ? 'Draft'
    : 'Published';
}

function sanitizeBatchRecord(raw: ManagedBatch): ManagedBatch {
  const category = normalizeCategory(raw.category);
  const brokenCover =
    !raw.coverImage ||
    raw.coverImage.includes('framerusercontent.com') ||
    raw.coverImage.startsWith('/src/assets/images/');

  const modules =
    Array.isArray(raw.modules) && raw.modules.length > 0
      ? raw.modules.map((m) => String(m))
      : parseBatchModules(raw.detailedContent || '');

  const attachments: BatchAttachment[] = Array.isArray(raw.attachments)
    ? raw.attachments.map((att) => ({
      ...att,
      url: att?.url ? resolveResourceUrl(String(att.url)) : att?.url,
    }))
    : [];

  return {
    ...raw,
    id: String(raw.id),
    batchCode: String(raw.batchCode ?? ''),
    title: String(raw.title ?? ''),
    slug: String(raw.slug ?? ''),
    shortDescription: String(raw.shortDescription ?? ''),
    detailedContent: String(raw.detailedContent ?? ''),
    modules,
    category,
    relatedCourse: String(raw.relatedCourse ?? ''),
    batchDate: String(raw.batchDate ?? ''),
    batchTime: String(raw.batchTime ?? ''),
    batchStartAt: raw.batchStartAt ? String(raw.batchStartAt) : null,
    started:
      typeof raw.started === 'boolean' ? raw.started : isBatchStarted(raw),
    mode: String(raw.mode ?? 'Live Lab-Driven Training'),
    seatsTotal: Number(raw.seatsTotal ?? 20),
    location: String(raw.location ?? 'Nashik Classroom & Live Online'),
    coverImage: brokenCover
      ? COVER_BY_BATCH_CATEGORY[category] ?? ASSETS.courseLinux
      : resolveResourceUrl(String(raw.coverImage)),
    coverImageName: String(raw.coverImageName ?? ''),
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => String(t)) : [],
    learningLevel: normalizeLevel(raw.learningLevel),
    attachments,
    attachmentCount: Number(raw.attachmentCount ?? attachments.length),
    displayOrder: Number(raw.displayOrder ?? 1),
    featured: Boolean(raw.featured),
    status: normalizeStatus(raw.status),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  };
}

function sanitizeBatchPage(raw: BatchPageResult): BatchPageResult {
  return {
    items: (raw.items ?? []).map(sanitizeBatchRecord),
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
      upcoming: Number(raw.stats?.upcoming ?? 0),
      started: Number(raw.stats?.started ?? 0),
      totalDocuments: Number(raw.stats?.totalDocuments ?? 0),
    },
    availableCategories: Array.isArray(raw.availableCategories)
      ? raw.availableCategories.filter(Boolean)
      : [],
    availableCourses: Array.isArray(raw.availableCourses)
      ? raw.availableCourses.filter(Boolean)
      : [],
  };
}

function buildSearchUrl(path: string, params: BatchSearchParams): string {
  const url = new URL(`${batchesApiBase()}${path}`);
  if (params.search && params.search.trim()) {
    url.searchParams.set('search', params.search.trim());
  }
  if (params.status && params.status !== 'All') {
    url.searchParams.set('status', params.status);
  }
  if (params.category && params.category !== 'All') {
    url.searchParams.set('category', params.category);
  }
  if (params.relatedCourse && params.relatedCourse !== 'All') {
    url.searchParams.set('relatedCourse', params.relatedCourse);
  }
  if (params.learningLevel && params.learningLevel !== 'All') {
    url.searchParams.set('learningLevel', params.learningLevel);
  }
  if (params.hasFilesOnly) {
    url.searchParams.set('hasFilesOnly', 'true');
  }
  if (params.scheduleFilter && params.scheduleFilter !== 'All') {
    url.searchParams.set('scheduleFilter', params.scheduleFilter);
  }
  url.searchParams.set('page', String(Math.max(0, params.page ?? 0)));
  url.searchParams.set('size', String(Math.max(1, params.size ?? 5)));
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

export function buildEmptyPublicBatchPage(
  params: BatchSearchParams = {}
): BatchPageResult {
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
      upcoming: 0,
      started: 0,
      totalDocuments: 0,
    },
    availableCategories: [],
    availableCourses: [],
  };
}

/**
 * Loads previously synced backend batches from browser storage (NO hardcoded mock seeds).
 * Always filters out Drafts and batches whose start date/time has already passed.
 */
export function loadPublicBatchesFromStorage(): ManagedBatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BATCHES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ManagedBatch[];
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed
      .map(sanitizeBatchRecord)
      .filter((b) => b.status === 'Published' && !isBatchStarted(b, now))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  } catch {
    return [];
  }
}

export function saveBatchesSnapshotToStorage(batches: ManagedBatch[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BATCHES_STORAGE_KEY, JSON.stringify(batches));
    window.dispatchEvent(new CustomEvent(BATCHES_UPDATED_EVENT));
  } catch {
    // Ignore storage quota errors
  }
}

export async function fetchAdminBatchesPageBackend(
  params: BatchSearchParams = {},
  signal?: AbortSignal
): Promise<BatchPageResult> {
  const response = await adminFetch(buildSearchUrl('/search', params), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: BatchPageResult };
  if (!json.data) {
    throw new Error('Unexpected response format from server.');
  }
  return sanitizeBatchPage(json.data);
}

/**
 * Dynamic server-side paginated fetch (5 upcoming batches per page) for /upcoming-batches.
 * Returns an empty page when no upcoming batches exist or the API is offline (zero mock data).
 */
export async function fetchPublicBatchesPageAsync(
  params: BatchSearchParams = {},
  signal?: AbortSignal
): Promise<{ page: BatchPageResult; fromApi: boolean }> {
  if (typeof window === 'undefined') {
    return { page: buildEmptyPublicBatchPage(params), fromApi: false };
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
    const json = (await response.json()) as { data?: BatchPageResult };
    if (json.data) {
      return { page: sanitizeBatchPage(json.data), fromApi: true };
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    // Render clean empty state if server unreachable
  }
  return { page: buildEmptyPublicBatchPage(params), fromApi: false };
}

export async function fetchAllBatchesBackend(): Promise<ManagedBatch[]> {
  const response = await adminFetch(batchesApiBase(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: ManagedBatch[] };
  return Array.isArray(json.data) ? json.data.map(sanitizeBatchRecord) : [];
}

export async function fetchAllBatchesFromApiOrStorage(): Promise<{
  items: ManagedBatch[];
  fromApi: boolean;
}> {
  try {
    const response = await adminFetch(batchesApiBase(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }
    const json = (await response.json()) as { data?: ManagedBatch[] };
    if (Array.isArray(json.data)) {
      const items = json.data.map(sanitizeBatchRecord);
      saveBatchesSnapshotToStorage(items);
      return { items, fromApi: true };
    }
  } catch {
    // Return cached snapshot or empty array
  }
  return { items: loadPublicBatchesFromStorage(), fromApi: false };
}

export async function fetchPublicBatchesAsync(): Promise<{
  items: ManagedBatch[];
  fromApi: boolean;
}> {
  if (typeof window === 'undefined') {
    return { items: [], fromApi: false };
  }
  try {
    const response = await fetch(`${batchesApiBase()}/public`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }
    const json = (await response.json()) as { data?: ManagedBatch[] };
    if (Array.isArray(json.data)) {
      const items = json.data.map(sanitizeBatchRecord);
      saveBatchesSnapshotToStorage(items);
      return { items, fromApi: true };
    }
  } catch {
    // Return clean empty list when server unreachable
  }
  return { items: [], fromApi: false };
}

export async function fetchPublicBatches(): Promise<ManagedBatch[]> {
  const res = await fetchPublicBatchesAsync();
  return res.items;
}

export async function fetchNextBatchCodeBackend(): Promise<string> {
  const response = await adminFetch(`${batchesApiBase()}/next-code`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: { batchCode?: string } };
  return json.data?.batchCode ?? 'BATCH-001';
}

export async function createBatchBackend(
  payload: BatchFormPayload
): Promise<ManagedBatch> {
  const response = await adminFetch(batchesApiBase(), {
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
  const json = (await response.json()) as { data?: ManagedBatch };
  if (!json.data) throw new Error('Unexpected response from server.');
  const saved = sanitizeBatchRecord(json.data);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BATCHES_UPDATED_EVENT));
  }
  return saved;
}

export async function updateBatchBackend(
  id: string,
  payload: BatchFormPayload
): Promise<ManagedBatch> {
  const response = await adminFetch(
    `${batchesApiBase()}/${encodeURIComponent(id)}`,
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
  const json = (await response.json()) as { data?: ManagedBatch };
  if (!json.data) throw new Error('Unexpected response from server.');
  const saved = sanitizeBatchRecord(json.data);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BATCHES_UPDATED_EVENT));
  }
  return saved;
}

export async function patchBatchStatusBackend(
  id: string,
  status: BatchStatus
): Promise<ManagedBatch> {
  const response = await adminFetch(
    `${batchesApiBase()}/${encodeURIComponent(id)}/status`,
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
  const json = (await response.json()) as { data?: ManagedBatch };
  if (!json.data) throw new Error('Unexpected response from server.');
  const saved = sanitizeBatchRecord(json.data);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BATCHES_UPDATED_EVENT));
  }
  return saved;
}

export async function patchBatchFeaturedBackend(
  id: string,
  featured: boolean
): Promise<ManagedBatch> {
  const response = await adminFetch(
    `${batchesApiBase()}/${encodeURIComponent(id)}/featured`,
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
  const json = (await response.json()) as { data?: ManagedBatch };
  if (!json.data) throw new Error('Unexpected response from server.');
  const saved = sanitizeBatchRecord(json.data);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BATCHES_UPDATED_EVENT));
  }
  return saved;
}

export async function deleteBatchBackend(id: string): Promise<void> {
  const response = await adminFetch(
    `${batchesApiBase()}/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BATCHES_UPDATED_EVENT));
  }
}
