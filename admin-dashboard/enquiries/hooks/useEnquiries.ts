import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedThrottledSearch } from '../../../src/hooks/useDebouncedThrottledValue';
import { ENQUIRIES_UPDATED_EVENT } from '../../../src/services/enquiryApi';
import { enquiriesAdminService } from '../services/enquiriesService';
import type {
  ContactEnquiryItem,
  EnquiryPageResult,
  EnquiryQueryState,
  EnquiryStatus,
  ManualEnquiryPayload,
} from '../types/enquiry';

const DEFAULT_QUERY: EnquiryQueryState = {
  search: '',
  status: 'All',
  channel: 'All',
  service: 'All',
  sortBy: 'createdAt',
  sortDir: 'desc',
  page: 1,
  pageSize: 5,
};

const EMPTY_PAGE: EnquiryPageResult = {
  items: [],
  page: 0,
  size: 5,
  totalItems: 0,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
  stats: {
    total: 0,
    newCount: 0,
    readCount: 0,
    repliedCount: 0,
    archivedCount: 0,
  },
  availableChannels: [],
  availableServices: [],
};

export function useEnquiries(
  onCountChange?: (totalCount: number, newCount: number) => void
) {
  const [pageData, setPageData] = useState<EnquiryPageResult>(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState<EnquiryQueryState>(DEFAULT_QUERY);
  const [refreshTick, setRefreshTick] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

  const {
    committedValue: debouncedSearch,
    flushNow,
  } = useDebouncedThrottledSearch(query.search, {
    debounceMs: 320,
    throttleMs: 400,
  });

  useEffect(() => {
    const refresh = () => setRefreshTick((t) => t + 1);
    window.addEventListener(ENQUIRIES_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener(ENQUIRIES_UPDATED_EVENT, refresh);
    };
  }, []);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);
    setError(null);

    void enquiriesAdminService
      .searchPage(
        {
          search: debouncedSearch,
          status: query.status,
          channel: query.channel,
          service: query.service,
          page: Math.max(0, query.page - 1),
          size: query.pageSize,
          sortBy: query.sortBy,
          sortDir: query.sortDir,
        },
        controller.signal
      )
      .then((res) => {
        if (controller.signal.aborted) return;
        setPageData(res);
        const clampedUiPage = Math.max(1, res.page + 1);
        if (clampedUiPage !== query.page && res.totalItems > 0) {
          setQuery((prev) =>
            prev.page !== clampedUiPage ? { ...prev, page: clampedUiPage } : prev
          );
        }
        onCountChangeRef.current?.(res.stats.total, res.stats.newCount);
        setLoading(false);
        setSearching(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load contact enquiries.'
          );
          setLoading(false);
          setSearching(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    debouncedSearch,
    query.status,
    query.channel,
    query.service,
    query.page,
    query.pageSize,
    query.sortBy,
    query.sortDir,
    refreshTick,
  ]);

  const updateQuery = useCallback((patch: Partial<EnquiryQueryState>) => {
    setQuery((prev) => {
      const resetPage =
        patch.search !== undefined ||
        patch.status !== undefined ||
        patch.channel !== undefined ||
        patch.service !== undefined ||
        patch.sortBy !== undefined ||
        patch.sortDir !== undefined ||
        patch.pageSize !== undefined;
      return {
        ...prev,
        ...patch,
        page: resetPage && patch.page === undefined ? 1 : patch.page ?? prev.page,
      };
    });
  }, []);

  const resetFilters = useCallback(() => {
    flushNow('');
    setQuery(DEFAULT_QUERY);
  }, [flushNow]);

  const reload = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  const createManual = useCallback(async (payload: ManualEnquiryPayload) => {
    setSubmitting(true);
    try {
      const created = await enquiriesAdminService.createManual(payload);
      setRefreshTick((t) => t + 1);
      return created;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const updateEnquiry = useCallback(
    async (
      id: string,
      payload: { status?: EnquiryStatus; adminNotes?: string }
    ): Promise<ContactEnquiryItem> => {
      setSubmitting(true);
      try {
        const updated = await enquiriesAdminService.updateAdmin(id, payload);
        setRefreshTick((t) => t + 1);
        return updated;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const updateStatus = useCallback(
    async (id: string, status: EnquiryStatus): Promise<ContactEnquiryItem> => {
      const updated = await enquiriesAdminService.updateStatus(id, status);
      setRefreshTick((t) => t + 1);
      return updated;
    },
    []
  );

  const deleteItem = useCallback(async (id: string) => {
    await enquiriesAdminService.deleteItem(id);
    setRefreshTick((t) => t + 1);
  }, []);

  const startIndex =
    pageData.totalItems === 0 ? 0 : pageData.page * pageData.size + 1;
  const endIndex = Math.min(
    pageData.totalItems,
    pageData.page * pageData.size + pageData.items.length
  );

  return {
    items: pageData.items,
    stats: pageData.stats,
    availableChannels: pageData.availableChannels,
    availableServices: pageData.availableServices,
    query,
    loading,
    searching,
    error,
    submitting,
    paginated: {
      currentPage: Math.max(1, pageData.page + 1),
      totalPages: Math.max(1, pageData.totalPages),
      totalItems: pageData.totalItems,
      startIndex,
      endIndex,
    },
    updateQuery,
    flushSearch: flushNow,
    resetFilters,
    reload,
    createManual,
    updateEnquiry,
    updateStatus,
    deleteItem,
  };
}
