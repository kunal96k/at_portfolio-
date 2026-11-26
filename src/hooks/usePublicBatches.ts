import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BATCHES_STORAGE_KEY,
  BATCHES_UPDATED_EVENT,
  buildEmptyPublicBatchPage,
  fetchPublicBatchesPageAsync,
  type BatchPageResult,
  type BatchSearchParams,
} from '../services/batchesService';
import {
  COURSES_STORAGE_KEY,
  COURSES_UPDATED_EVENT,
} from '../services/coursesService';
import { useDebouncedThrottledSearch } from './useDebouncedThrottledValue';

export type PublicBatchSortBy =
  | 'displayOrder'
  | 'batchStartAt'
  | 'createdAt'
  | 'title';

interface PublicBatchesQueryState {
  search: string;
  category: string;
  sortBy: PublicBatchSortBy;
  sortDir: 'asc' | 'desc';
  page: number;
  size: number;
}

const DEFAULT_PUBLIC_BATCH_QUERY: PublicBatchesQueryState = {
  search: '',
  category: 'All',
  sortBy: 'displayOrder',
  sortDir: 'asc',
  page: 0,
  size: 5,
};

/**
 * Dynamic hook for the public Upcoming Batches page (/upcoming-batches) & Home showcase.
 * Fetches 5 upcoming (not-yet-started) Published batches per page from the backend
 * via JPA Specifications and automatically hides started batches.
 */
export function usePublicBatches() {
  const [query, setQuery] = useState<PublicBatchesQueryState>(
    DEFAULT_PUBLIC_BATCH_QUERY
  );
  const [pageData, setPageData] = useState<BatchPageResult>(() =>
    buildEmptyPublicBatchPage(DEFAULT_PUBLIC_BATCH_QUERY)
  );
  const [loading, setLoading] = useState(typeof window !== 'undefined');
  const [refreshTick, setRefreshTick] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  const {
    committedValue: debouncedSearch,
    isDebouncing,
    flushNow,
  } = useDebouncedThrottledSearch(query.search, {
    debounceMs: 320,
    throttleMs: 400,
  });

  useEffect(() => {
    const refresh = () => setRefreshTick((t) => t + 1);
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === null ||
        e.key === BATCHES_STORAGE_KEY ||
        e.key === COURSES_STORAGE_KEY
      ) {
        refresh();
      }
    };
    window.addEventListener(BATCHES_UPDATED_EVENT, refresh);
    window.addEventListener(COURSES_UPDATED_EVENT, refresh);
    window.addEventListener('storage', handleStorage);
    // Periodically refresh so batches whose start time just arrived drop off automatically
    const intervalId = window.setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener(BATCHES_UPDATED_EVENT, refresh);
      window.removeEventListener(COURSES_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', handleStorage);
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const params: BatchSearchParams = {
      search: debouncedSearch,
      category: query.category,
      page: query.page,
      size: query.size,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
    };

    setLoading(true);
    void fetchPublicBatchesPageAsync(params, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) {
          setPageData(res.page);
          if (res.page.page !== query.page && res.page.totalItems > 0) {
            setQuery((prev) =>
              prev.page !== res.page.page
                ? { ...prev, page: res.page.page }
                : prev
            );
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setPageData(buildEmptyPublicBatchPage(DEFAULT_PUBLIC_BATCH_QUERY));
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    debouncedSearch,
    query.category,
    query.sortBy,
    query.sortDir,
    query.page,
    query.size,
    refreshTick,
  ]);

  const setSearch = useCallback((search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 0 }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setQuery((prev) => ({ ...prev, category, page: 0 }));
  }, []);

  const setSort = useCallback(
    (sortBy: PublicBatchSortBy, sortDir: 'asc' | 'desc') => {
      setQuery((prev) => ({ ...prev, sortBy, sortDir, page: 0 }));
    },
    []
  );

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page: Math.max(0, page) }));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const resetFilters = useCallback(() => {
    flushNow('');
    setQuery(DEFAULT_PUBLIC_BATCH_QUERY);
  }, [flushNow]);

  return {
    batches: pageData.items,
    query,
    pageData,
    loading,
    isDebouncing,
    setSearch,
    flushSearch: flushNow,
    setCategory,
    setSort,
    setPage,
    resetFilters,
  };
}
