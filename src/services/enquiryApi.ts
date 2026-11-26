/**
 * API service for public Contact / Waitlist form submissions and Admin Dashboard
 * server-side paginated Enquiry management.
 */

import { adminFetch } from './authService';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080';

export const ENQUIRIES_UPDATED_EVENT = 'arvind-enquiries-updated';
export const NOTIFICATION_LIMIT = 5;

export type EnquiryStatus = 'New' | 'Read' | 'Replied' | 'Archived';

export interface SubmitEnquiryPayload {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  sourcePage?: string;
  channel?: string;
  honeypot?: string;
}

export interface ManualEnquiryPayload {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  sourcePage?: string;
  channel?: string;
  status?: EnquiryStatus;
  adminNotes?: string;
}

export interface ContactEnquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  sourcePage: string;
  channel: string;
  status: EnquiryStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryStats {
  total: number;
  newCount: number;
  readCount: number;
  repliedCount: number;
  archivedCount: number;
}

export interface EnquiryPageResult {
  items: ContactEnquiryItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  stats: EnquiryStats;
  availableChannels: string[];
  availableServices: string[];
}

export interface EnquirySearchParams {
  search?: string;
  status?: 'All' | EnquiryStatus;
  channel?: string;
  service?: string;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'status' | 'channel' | 'service';
  sortDir?: 'asc' | 'desc';
}

export interface EnquiryApiResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

function enquiriesApiBase(): string {
  return `${API_BASE_URL.replace(/\/+$/, '')}/api/enquiries`;
}

function normalizeStatus(rawStatus: unknown): EnquiryStatus {
  const s = String(rawStatus ?? '').trim().toLowerCase();
  if (s === 'read') return 'Read';
  if (s === 'replied') return 'Replied';
  if (s === 'archived') return 'Archived';
  return 'New';
}

function mapEnquiry(raw: Record<string, unknown>): ContactEnquiryItem {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    phone: raw.phone ? String(raw.phone) : '',
    service: raw.service ? String(raw.service) : '',
    message: raw.message ? String(raw.message) : '',
    sourcePage: raw.sourcePage ? String(raw.sourcePage) : '',
    channel: raw.channel ? String(raw.channel) : 'Website Form',
    status: normalizeStatus(raw.status),
    adminNotes: raw.adminNotes ? String(raw.adminNotes) : '',
    createdAt: raw.createdAt ? String(raw.createdAt) : '',
    updatedAt: raw.updatedAt
      ? String(raw.updatedAt)
      : raw.createdAt
        ? String(raw.createdAt)
        : '',
  };
}

function mapEnquiryPage(
  raw: Record<string, unknown> | undefined,
  defaultSize = 5
): EnquiryPageResult {
  const rawItems = Array.isArray(raw?.items)
    ? (raw.items as Record<string, unknown>[])
    : [];
  const rawStats = (raw?.stats ?? {}) as Record<string, unknown>;

  return {
    items: rawItems.map(mapEnquiry),
    page: Number(raw?.page ?? 0),
    size: Number(raw?.size ?? defaultSize),
    totalItems: Number(raw?.totalItems ?? 0),
    totalPages: Math.max(1, Number(raw?.totalPages ?? 1)),
    hasNext: Boolean(raw?.hasNext),
    hasPrevious: Boolean(raw?.hasPrevious),
    stats: {
      total: Number(rawStats.total ?? 0),
      newCount: Number(rawStats.newCount ?? 0),
      readCount: Number(rawStats.readCount ?? 0),
      repliedCount: Number(rawStats.repliedCount ?? 0),
      archivedCount: Number(rawStats.archivedCount ?? 0),
    },
    availableChannels: Array.isArray(raw?.availableChannels)
      ? raw.availableChannels.map(String).filter(Boolean)
      : [],
    availableServices: Array.isArray(raw?.availableServices)
      ? raw.availableServices.map(String).filter(Boolean)
      : [],
  };
}

export async function parseEnquiryApiError(response: Response): Promise<string> {
  try {
    const text = await response.text();
    if (!text) return `Request failed with status ${response.status}`;
    const json = JSON.parse(text) as {
      message?: string;
      validationErrors?: Record<string, string>;
    };
    if (json?.validationErrors && typeof json.validationErrors === 'object') {
      const messages = Object.values(json.validationErrors).filter(Boolean);
      if (messages.length > 0) {
        return messages.join(' ');
      }
    }
    if (json?.message) {
      return json.message;
    }
  } catch {
    // Non-JSON response fallback
  }
  return `Request failed with status ${response.status}`;
}

function notifyEnquiriesUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ENQUIRIES_UPDATED_EVENT));
  }
}

export async function submitContactEnquiry(
  payload: SubmitEnquiryPayload
): Promise<EnquiryApiResponse> {
  const endpoint = `${API_BASE_URL.replace(/\/+$/, '')}/api/contact/submit`;
  const cleanPhone = payload.phone?.trim();

  const body: SubmitEnquiryPayload = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    ...(cleanPhone ? { phone: cleanPhone } : {}),
    ...(payload.service?.trim() ? { service: payload.service.trim() } : {}),
    ...(payload.message?.trim() ? { message: payload.message.trim() } : {}),
    ...(payload.sourcePage?.trim()
      ? { sourcePage: payload.sourcePage.trim() }
      : {}),
    ...(payload.channel?.trim() ? { channel: payload.channel.trim() } : {}),
    ...(payload.honeypot ? { honeypot: payload.honeypot } : {}),
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseEnquiryApiError(response));
  }

  const data = (await response.json()) as EnquiryApiResponse;
  notifyEnquiriesUpdated();
  return data;
}

export async function fetchAdminEnquiriesPageBackend(
  params: EnquirySearchParams,
  signal?: AbortSignal
): Promise<EnquiryPageResult> {
  const url = new URL(`${enquiriesApiBase()}/search`);
  if (params.search && params.search.trim()) {
    url.searchParams.set('search', params.search.trim());
  }
  if (params.status && params.status !== 'All') {
    url.searchParams.set('status', params.status);
  }
  if (params.channel && params.channel !== 'All') {
    url.searchParams.set('channel', params.channel);
  }
  if (params.service && params.service !== 'All') {
    url.searchParams.set('service', params.service);
  }
  url.searchParams.set('page', String(Math.max(0, params.page ?? 0)));
  url.searchParams.set('size', String(Math.max(1, params.size ?? 5)));
  url.searchParams.set('sortBy', params.sortBy ?? 'createdAt');
  url.searchParams.set('sortDir', params.sortDir ?? 'desc');

  const response = await adminFetch(url.toString(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    throw new Error(await parseEnquiryApiError(response));
  }
  const json = (await response.json()) as { data?: Record<string, unknown> };
  return mapEnquiryPage(json?.data, params.size ?? 5);
}

export async function createManualEnquiryBackend(
  payload: ManualEnquiryPayload
): Promise<ContactEnquiryItem> {
  const cleanPhone = payload.phone?.trim();
  const response = await adminFetch(`${enquiriesApiBase()}/manual`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: cleanPhone || '',
      service: payload.service?.trim() || '',
      message: payload.message?.trim() || '',
      sourcePage: payload.sourcePage?.trim() || 'Admin Dashboard',
      channel: payload.channel?.trim() || 'Direct Call / WhatsApp',
      status: payload.status ?? 'New',
      adminNotes: payload.adminNotes?.trim() || '',
    }),
  });
  if (!response.ok) {
    throw new Error(await parseEnquiryApiError(response));
  }
  const json = (await response.json()) as { data?: Record<string, unknown> };
  if (!json?.data) throw new Error('Invalid server response.');
  notifyEnquiriesUpdated();
  return mapEnquiry(json.data);
}

export async function updateEnquiryAdminBackend(
  id: string,
  payload: { status?: EnquiryStatus; adminNotes?: string }
): Promise<ContactEnquiryItem> {
  const response = await adminFetch(
    `${enquiriesApiBase()}/${encodeURIComponent(id)}`,
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
    throw new Error(await parseEnquiryApiError(response));
  }
  const json = (await response.json()) as { data?: Record<string, unknown> };
  if (!json?.data) throw new Error('Invalid server response.');
  notifyEnquiriesUpdated();
  return mapEnquiry(json.data);
}

export async function updateEnquiryStatusBackend(
  id: string,
  status: EnquiryStatus
): Promise<ContactEnquiryItem> {
  const response = await adminFetch(
    `${enquiriesApiBase()}/${encodeURIComponent(id)}/status`,
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
    throw new Error(await parseEnquiryApiError(response));
  }
  const json = (await response.json()) as { data?: Record<string, unknown> };
  if (!json?.data) throw new Error('Invalid server response.');
  notifyEnquiriesUpdated();
  return mapEnquiry(json.data);
}

export async function deleteEnquiryBackend(id: string): Promise<void> {
  const response = await adminFetch(
    `${enquiriesApiBase()}/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    }
  );
  if (!response.ok) {
    throw new Error(await parseEnquiryApiError(response));
  }
  notifyEnquiriesUpdated();
}

export async function fetchUnreadNotificationsBackend(
  limit = NOTIFICATION_LIMIT,
  signal?: AbortSignal
): Promise<{ items: ContactEnquiryItem[]; totalUnread: number }> {
  const safeLimit = Math.min(NOTIFICATION_LIMIT, Math.max(1, limit));
  const result = await fetchAdminEnquiriesPageBackend(
    {
      status: 'New',
      page: 0,
      size: safeLimit,
      sortBy: 'createdAt',
      sortDir: 'desc',
    },
    signal
  );
  return {
    items: result.items
      .filter((item) => item.status === 'New')
      .slice(0, NOTIFICATION_LIMIT),
    totalUnread: result.stats.newCount,
  };
}

export async function markAllNewEnquiriesReadBackend(): Promise<number> {
  const response = await adminFetch(`${enquiriesApiBase()}/mark-all-read`, {
    method: 'PATCH',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(await parseEnquiryApiError(response));
  }
  const json = (await response.json()) as {
    data?: { updatedCount?: number };
  };
  notifyEnquiriesUpdated();
  return Number(json?.data?.updatedCount ?? 0);
}
