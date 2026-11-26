import { STUDY_RESOURCES } from '../data/portfolioData';

export type ResourceSectionType = 'Notes' | 'Lab Sections';

export type ResourceStatus = 'Published' | 'Draft';

export type ResourcePreviewMode = 'PDF_PAGES' | 'TEXT' | 'METADATA_ONLY';

export type ResourceDownloadAccessFilter = 'All' | 'enabled' | 'preview-only';

export interface StudyResourceNote {
  id: string;
  noteCode: string;
  title: string;
  slug: string;
  sectionType: ResourceSectionType;
  domain: string;
  summary: string;
  topicsText: string;
  topics: string[];
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSizeBytes: number;
  fileSizeLabel: string;
  fileUrl: string;
  hasFile: boolean;
  hasUploadedFile: boolean;
  downloadEnabled: boolean;
  previewMode: ResourcePreviewMode;
  downloads: number;
  displayOrder: number;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudyResourceStats {
  total: number;
  published: number;
  drafts: number;
  totalDownloads: number;
  downloadEnabledCount: number;
  previewOnlyCount: number;
}

export interface StudyResourcePage {
  items: StudyResourceNote[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  stats: StudyResourceStats;
  availableDomains: string[];
  availableFileTypes: string[];
}

export interface StudyResourceFormPayload {
  noteCode: string;
  title: string;
  slug: string;
  sectionType: ResourceSectionType;
  domain: string;
  summary: string;
  topicsText: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSizeBytes: number;
  fileUrl: string;
  storedFilePath?: string;
  fileData?: string;
  removeFile?: boolean;
  downloadEnabled: boolean;
  displayOrder: number;
  status: ResourceStatus;
}

export interface StudyResourceFilePatchPayload {
  fileName?: string;
  fileType?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  fileUrl?: string;
  storedFilePath?: string;
  fileData?: string;
  removeFile?: boolean;
  downloadEnabled?: boolean;
}

export interface ProjectUploadedFileResult {
  storedPath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

export interface ResourcePreviewInfo {
  id: string;
  noteCode: string;
  title: string;
  slug: string;
  sectionType: ResourceSectionType;
  domain: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSizeLabel: string;
  hasFile?: boolean;
  summary: string;
  topics: string[];
  downloadEnabled: boolean;
  previewMode: ResourcePreviewMode;
  pageCount: number;
  textContent?: string;
  status: ResourceStatus;
}

export interface ResourceSearchParams {
  search?: string;
  status?: string;
  sectionType?: string;
  domain?: string;
  fileType?: string;
  hasFileOnly?: boolean;
  downloadAccess?: ResourceDownloadAccessFilter;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080';

function resourcesApiBase(): string {
  return `${API_BASE_URL.replace(/\/+$/, '')}/api/resources`;
}

export function resolveResourceUrl(fileUrl: string): string {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('/api/')) {
    return `${API_BASE_URL.replace(/\/+$/, '')}${fileUrl}`;
  }
  return fileUrl;
}

export async function uploadProjectFileBackend(
  file: File,
  folder: 'resources' | 'courses' | 'batches' | 'blogs' | 'gallery' | 'media' | 'testimonials' = 'media'
): Promise<ProjectUploadedFileResult> {
  const formData = new FormData();
  formData.append('file', file);
  const base = API_BASE_URL.replace(/\/+$/, '');
  const response = await fetch(
    `${base}/api/files/upload?folder=${encodeURIComponent(folder)}`,
    {
      method: 'POST',
      body: formData,
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as {
    data?: Record<string, unknown>;
  };
  const data = json?.data ?? {};
  return {
    storedPath: String(data.storedPath ?? ''),
    fileName: String(data.fileName ?? file.name),
    mimeType: String(data.mimeType ?? file.type ?? 'application/octet-stream'),
    sizeBytes: Number(data.sizeBytes ?? file.size),
    url: String(data.url ?? ''),
  };
}

export function parseTopicLines(topicsText: string): string[] {
  if (!topicsText) return [];
  return topicsText
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, '').trim())
    .filter((line) => line.length > 0);
}

function slugifyResourceTitle(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Lightweight fallback strictly mirroring portfolioData.ts STUDY_RESOURCES for
 * build-time SSR prerendering or offline static viewing when backend is unreachable.
 */
export const DEFAULT_WEBSITE_STUDY_NOTES: StudyResourceNote[] =
  STUDY_RESOURCES.map((item, idx) => {
    const order = idx + 1;
    return {
      id: item.id,
      noteCode: `NOTE-${String(order).padStart(3, '0')}`,
      title: item.title,
      slug: slugifyResourceTitle(item.title),
      sectionType: item.sectionType,
      domain: item.domain,
      summary: item.summary,
      topicsText: item.topics.join('\n'),
      topics: item.topics,
      fileName: item.fileName,
      fileType: 'PDF',
      mimeType: 'application/pdf',
      fileSizeBytes: 0,
      fileSizeLabel: 'Preview PDF',
      fileUrl: '',
      hasFile: false,
      hasUploadedFile: false,
      downloadEnabled: false,
      previewMode: 'METADATA_ONLY',
      downloads: 0,
      displayOrder: order,
      status: 'Published',
      createdAt: '2026-03-01T09:00:00',
      updatedAt: '2026-03-19T12:00:00',
    };
  });

function mapPreviewMode(raw: unknown): ResourcePreviewMode {
  if (raw === 'PDF_PAGES' || raw === 'TEXT') return raw;
  return 'METADATA_ONLY';
}

function mapApiResource(raw: Record<string, unknown>): StudyResourceNote {
  const sectionType: ResourceSectionType =
    raw.sectionType === 'Lab Sections' ? 'Lab Sections' : 'Notes';
  const topicsText = String(raw.topicsText ?? '');
  const topics = Array.isArray(raw.topics)
    ? raw.topics.map(String)
    : parseTopicLines(topicsText);

  return {
    id: String(raw.id ?? ''),
    noteCode: String(raw.noteCode ?? ''),
    title: String(raw.title ?? ''),
    slug: String(raw.slug ?? ''),
    sectionType,
    domain: String(raw.domain ?? ''),
    summary: String(raw.summary ?? ''),
    topicsText,
    topics,
    fileName: String(raw.fileName ?? ''),
    fileType: String(raw.fileType ?? 'PDF'),
    mimeType: String(raw.mimeType ?? 'application/pdf'),
    fileSizeBytes: Number(raw.fileSizeBytes ?? 0),
    fileSizeLabel: String(raw.fileSizeLabel ?? 'No file attached'),
    fileUrl: String(raw.fileUrl ?? ''),
    hasFile: Boolean(
      raw.hasFile ??
      (Boolean(raw.hasUploadedFile) || String(raw.fileUrl ?? '').trim() !== '')
    ),
    hasUploadedFile: Boolean(raw.hasUploadedFile),
    downloadEnabled: Boolean(raw.downloadEnabled),
    previewMode: mapPreviewMode(raw.previewMode),
    downloads: Number(raw.downloads ?? 0),
    displayOrder: Number(raw.displayOrder ?? 1),
    status: raw.status === 'Draft' ? 'Draft' : 'Published',
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
  };
}

function mapPagePayload(
  rawData: Record<string, unknown> | undefined
): StudyResourcePage {
  const rawItems = Array.isArray(rawData?.items)
    ? (rawData.items as Record<string, unknown>[])
    : [];
  const rawStats = (rawData?.stats ?? {}) as Record<string, unknown>;

  return {
    items: rawItems.map(mapApiResource),
    page: Number(rawData?.page ?? 0),
    size: Number(rawData?.size ?? 5),
    totalItems: Number(rawData?.totalItems ?? rawItems.length),
    totalPages: Math.max(1, Number(rawData?.totalPages ?? 1)),
    hasNext: Boolean(rawData?.hasNext),
    hasPrevious: Boolean(rawData?.hasPrevious),
    stats: {
      total: Number(rawStats.total ?? rawItems.length),
      published: Number(rawStats.published ?? 0),
      drafts: Number(rawStats.drafts ?? 0),
      totalDownloads: Number(rawStats.totalDownloads ?? 0),
      downloadEnabledCount: Number(rawStats.downloadEnabledCount ?? 0),
      previewOnlyCount: Number(
        rawStats.previewOnlyCount ?? rawStats.total ?? rawItems.length
      ),
    },
    availableDomains: Array.isArray(rawData?.availableDomains)
      ? rawData.availableDomains.map(String)
      : [],
    availableFileTypes: Array.isArray(rawData?.availableFileTypes)
      ? rawData.availableFileTypes.map(String)
      : [],
  };
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
    // Fallback below
  }
  return `Request failed with status ${response.status}`;
}

function buildQueryString(params: ResourceSearchParams): string {
  const searchParams = new URLSearchParams();
  if (params.search && params.search.trim()) {
    searchParams.set('search', params.search.trim());
  }
  if (params.status && params.status !== 'All') {
    searchParams.set('status', params.status);
  }
  if (params.sectionType && params.sectionType !== 'All') {
    searchParams.set('sectionType', params.sectionType);
  }
  if (params.domain && params.domain !== 'All') {
    searchParams.set('domain', params.domain);
  }
  if (params.fileType && params.fileType !== 'All') {
    searchParams.set('fileType', params.fileType);
  }
  if (params.hasFileOnly) {
    searchParams.set('hasFileOnly', 'true');
  }
  if (params.downloadAccess === 'enabled') {
    searchParams.set('downloadEnabled', 'true');
  } else if (params.downloadAccess === 'preview-only') {
    searchParams.set('downloadEnabled', 'false');
  }
  searchParams.set('page', String(Math.max(0, params.page ?? 0)));
  searchParams.set('size', String(Math.max(1, params.size ?? 5)));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  return searchParams.toString();
}

export function buildFallbackPublicResourcePage(
  params: ResourceSearchParams
): StudyResourcePage {
  const q = (params.search ?? '').trim().toLowerCase();
  const filtered = DEFAULT_WEBSITE_STUDY_NOTES.filter((item) => {
    if (
      params.sectionType &&
      params.sectionType !== 'All' &&
      item.sectionType !== params.sectionType
    ) {
      return false;
    }
    if (
      params.domain &&
      params.domain !== 'All' &&
      item.domain.toLowerCase() !== params.domain.toLowerCase()
    ) {
      return false;
    }
    if (!q) return true;
    return [
      item.title,
      item.noteCode,
      item.domain,
      item.sectionType,
      item.summary,
      item.fileName,
      item.topicsText,
    ]
      .join(' ')
      .toLowerCase()
      .includes(q);
  });

  const pageSize = Math.max(1, params.size ?? 6);
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(0, params.page ?? 0), totalPages - 1);
  const start = safePage * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    page: safePage,
    size: pageSize,
    totalItems,
    totalPages,
    hasNext: safePage < totalPages - 1,
    hasPrevious: safePage > 0,
    stats: {
      total: DEFAULT_WEBSITE_STUDY_NOTES.length,
      published: DEFAULT_WEBSITE_STUDY_NOTES.length,
      drafts: 0,
      totalDownloads: 0,
      downloadEnabledCount: 0,
      previewOnlyCount: DEFAULT_WEBSITE_STUDY_NOTES.length,
    },
    availableDomains: Array.from(
      new Set(DEFAULT_WEBSITE_STUDY_NOTES.map((r) => r.domain))
    ).sort(),
    availableFileTypes: ['PDF'],
  };
}

export async function fetchAdminResourcesPageBackend(
  params: ResourceSearchParams,
  signal?: AbortSignal
): Promise<StudyResourcePage> {
  const qs = buildQueryString(params);
  const response = await fetch(`${resourcesApiBase()}?${qs}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as {
    data?: Record<string, unknown>;
  };
  return mapPagePayload(json?.data);
}

export async function fetchPublicResourcesPageAsync(
  params: ResourceSearchParams,
  signal?: AbortSignal
): Promise<{ page: StudyResourcePage; fromBackend: boolean }> {
  if (typeof fetch !== 'function' || typeof window === 'undefined') {
    return {
      page: buildFallbackPublicResourcePage(params),
      fromBackend: false,
    };
  }
  try {
    const qs = buildQueryString(params);
    const response = await fetch(`${resourcesApiBase()}/public?${qs}`, {
      headers: { Accept: 'application/json' },
      signal,
    });
    if (!response.ok) {
      return {
        page: buildFallbackPublicResourcePage(params),
        fromBackend: false,
      };
    }
    const json = (await response.json()) as {
      data?: Record<string, unknown>;
    };
    return {
      page: mapPagePayload(json?.data),
      fromBackend: true,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    return {
      page: buildFallbackPublicResourcePage(params),
      fromBackend: false,
    };
  }
}

export async function fetchNextNoteCodeBackend(): Promise<string> {
  const response = await fetch(`${resourcesApiBase()}/next-code`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: { noteCode?: string } };
  return json?.data?.noteCode || 'NOTE-001';
}

export async function createResourceBackend(
  payload: StudyResourceFormPayload
): Promise<StudyResourceNote> {
  const response = await fetch(resourcesApiBase(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: Record<string, unknown> };
  if (!json?.data) throw new Error('Invalid response from server.');
  return mapApiResource(json.data);
}

export async function updateResourceBackend(
  id: string,
  payload: StudyResourceFormPayload
): Promise<StudyResourceNote> {
  const response = await fetch(
    `${resourcesApiBase()}/${encodeURIComponent(id)}`,
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
  return mapApiResource(json.data);
}

export async function patchResourceStatusBackend(
  id: string,
  status: ResourceStatus
): Promise<StudyResourceNote> {
  const response = await fetch(
    `${resourcesApiBase()}/${encodeURIComponent(id)}/status`,
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
  return mapApiResource(json.data);
}

export async function patchResourceDownloadAccessBackend(
  id: string,
  downloadEnabled: boolean
): Promise<StudyResourceNote> {
  const response = await fetch(
    `${resourcesApiBase()}/${encodeURIComponent(id)}/download-access`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ downloadEnabled }),
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: Record<string, unknown> };
  if (!json?.data) throw new Error('Invalid response from server.');
  return mapApiResource(json.data);
}

export async function patchResourceFileAttachmentBackend(
  id: string,
  payload: StudyResourceFilePatchPayload
): Promise<StudyResourceNote> {
  const response = await fetch(
    `${resourcesApiBase()}/${encodeURIComponent(id)}/file-attachment`,
    {
      method: 'PATCH',
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
  return mapApiResource(json.data);
}

export async function fetchResourcePreviewInfo(
  id: string,
  isPublic = true,
  signal?: AbortSignal
): Promise<ResourcePreviewInfo> {
  const path = isPublic
    ? `${resourcesApiBase()}/public/${encodeURIComponent(id)}/preview-info`
    : `${resourcesApiBase()}/${encodeURIComponent(id)}/preview-info`;
  const response = await fetch(path, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  const json = (await response.json()) as { data?: Record<string, unknown> };
  const raw = json?.data;
  if (!raw) throw new Error('Invalid preview metadata response.');
  const previewMode = mapPreviewMode(raw.previewMode);
  const fileName = String(raw.fileName ?? '');
  return {
    id: String(raw.id ?? id),
    noteCode: String(raw.noteCode ?? ''),
    title: String(raw.title ?? ''),
    slug: String(raw.slug ?? ''),
    sectionType: raw.sectionType === 'Lab Sections' ? 'Lab Sections' : 'Notes',
    domain: String(raw.domain ?? ''),
    fileName,
    fileType: String(raw.fileType ?? 'PDF'),
    mimeType: String(raw.mimeType ?? 'application/pdf'),
    fileSizeLabel: String(raw.fileSizeLabel ?? 'No file attached'),
    hasFile: Boolean(
      raw.hasFile ?? (fileName.trim() !== '' || previewMode !== 'METADATA_ONLY')
    ),
    summary: String(raw.summary ?? ''),
    topics: Array.isArray(raw.topics) ? raw.topics.map(String) : [],
    downloadEnabled: Boolean(raw.downloadEnabled),
    previewMode,
    pageCount: Number(raw.pageCount ?? 0),
    textContent: typeof raw.textContent === 'string' ? raw.textContent : undefined,
    status: raw.status === 'Draft' ? 'Draft' : 'Published',
  };
}

export function getResourcePreviewPageUrl(
  id: string,
  pageIndex: number,
  isPublic = true
): string {
  const safePage = Math.max(1, Math.floor(pageIndex));
  return isPublic
    ? `${resourcesApiBase()}/public/${encodeURIComponent(id)}/preview/pages/${safePage}`
    : `${resourcesApiBase()}/${encodeURIComponent(id)}/preview/pages/${safePage}`;
}

export async function recordResourceDownloadBackend(
  id: string,
  isAdmin = false
): Promise<StudyResourceNote | null> {
  try {
    const endpoint = isAdmin
      ? `${resourcesApiBase()}/admin/${encodeURIComponent(id)}/download`
      : `${resourcesApiBase()}/${encodeURIComponent(id)}/download`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const json = (await response.json()) as { data?: Record<string, unknown> };
    return json?.data ? mapApiResource(json.data) : null;
  } catch {
    return null;
  }
}

export async function downloadResourceSafely(
  note: StudyResourceNote,
  options?: { isAdmin?: boolean }
): Promise<{
  blocked: boolean;
  message?: string;
  updatedDownloads?: number;
  updatedNote?: StudyResourceNote | null;
}> {
  const isAdmin = Boolean(options?.isAdmin);

  if (!isAdmin && !note.downloadEnabled) {
    return {
      blocked: true,
      message:
        'Download is disabled for this study note. Please contact Arvind Thevar to request download access.',
    };
  }

  const hasAttachedFile = Boolean(
    note.hasFile || note.hasUploadedFile || String(note.fileUrl ?? '').trim() !== ''
  );
  if (!hasAttachedFile) {
    return {
      blocked: true,
      message: 'No study file has been uploaded for this note yet.',
    };
  }

  const isNumericId = /^\d+$/.test(note.id);
  const resolved = resolveResourceUrl(note.fileUrl);
  const usesInternalFile =
    isNumericId &&
    (!resolved ||
      resolved.includes('/api/resources/') ||
      note.fileUrl.startsWith('/seed-materials/'));

  const targetUrl =
    isAdmin && usesInternalFile
      ? `${resourcesApiBase()}/admin/${encodeURIComponent(note.id)}/file?download=true`
      : resolved ||
      (isNumericId
        ? `${resourcesApiBase()}/${encodeURIComponent(note.id)}/file?download=true`
        : '');

  if (!targetUrl) {
    return { blocked: true, message: 'No downloadable file is attached.' };
  }

  if (targetUrl.includes('/api/resources/')) {
    const downloadUrl = targetUrl.includes('?')
      ? targetUrl
      : `${targetUrl}?download=true`;
    const response = await fetch(downloadUrl, { method: 'GET' });
    if (response.status === 403) {
      return {
        blocked: true,
        message: await parseApiError(response),
      };
    }
    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = note.fileName || `${note.slug || 'study-note'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }
    return { blocked: false, updatedDownloads: note.downloads + 1 };
  }

  const updatedNote = await recordResourceDownloadBackend(note.id, isAdmin);
  if (typeof window !== 'undefined') {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }
  return {
    blocked: false,
    updatedDownloads: updatedNote?.downloads ?? note.downloads + 1,
    updatedNote,
  };
}

export async function deleteResourceBackend(id: string): Promise<void> {
  const response = await fetch(
    `${resourcesApiBase()}/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}
