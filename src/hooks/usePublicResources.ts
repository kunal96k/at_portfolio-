import { useCallback, useEffect, useRef, useState } from 'react';
import {
  COURSES_STORAGE_KEY,
  COURSES_UPDATED_EVENT,
} from '../services/coursesService';
import {
  buildFallbackPublicResourcePage,
  fetchPublicResourcesPageAsync,
  recordResourceDownloadBackend,
  type ResourceSearchParams,
  type StudyResourcePage,
} from '../services/resourcesService';
import { useDebouncedThrottledSearch } from './useDebouncedThrottledValue';

interface PublicResourcesQueryState {
  search: string;
  sectionType: 'All' | 'Notes' | 'Lab Sections';
  domain: string;
  page: number;
  size: number;
}

const DEFAULT_PUBLIC_QUERY: PublicResourcesQueryState = {
  search: '',
  sectionType: 'All',
  domain: 'All',
  page: 0,
  size: 6,
};

/**
 * Dynamic hook for the public Study Materials / Notes page (/resources).
 * Combines debounced + throttled search with server-side JPA Specifications pagination.
 */
export function usePublicResources() {
  const [query, setQuery] = useState<PublicResourcesQueryState>(
    DEFAULT_PUBLIC_QUERY
  );
  const [pageData, setPageData] = useState<StudyResourcePage>(() =>
    typeof window === 'undefined'
      ? buildFallbackPublicResourcePage(DEFAULT_PUBLIC_QUERY)
      : {
          items: [],
          page: 0,
          size: DEFAULT_PUBLIC_QUERY.size,
          totalItems: 0,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
          stats: {
            total: 0,
            published: 0,
            drafts: 0,
            totalDownloads: 0,
            downloadEnabledCount: 0,
            previewOnlyCount: 0,
          },
          availableDomains: [],
          availableFileTypes: [],
        }
  );
  const [loading, setLoading] = useState(typeof window !== 'undefined');
  const [refreshTick, setRefreshTick] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  const { committedValue: debouncedSearch, isDebouncing, flushNow } =
    useDebouncedThrottledSearch(query.search, {
      debounceMs: 320,
      throttleMs: 400,
    });

  useEffect(() => {
    const refreshOnCoursesUpdate = () => setRefreshTick((t) => t + 1);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === COURSES_STORAGE_KEY) {
        refreshOnCoursesUpdate();
      }
    };
    window.addEventListener(COURSES_UPDATED_EVENT, refreshOnCoursesUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(COURSES_UPDATED_EVENT, refreshOnCoursesUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const params: ResourceSearchParams = {
      search: debouncedSearch,
      sectionType: query.sectionType,
      domain: query.domain,
      page: query.page,
      size: query.size,
      sortBy: 'displayOrder',
      sortDir: 'asc',
    };

    setLoading(true);
    void fetchPublicResourcesPageAsync(params, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) {
          setPageData(res.page);
          if (res.page.page !== query.page && res.page.totalItems > 0) {
            setQuery((prev) =>
              prev.page !== res.page.page ? { ...prev, page: res.page.page } : prev
            );
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debouncedSearch, query.sectionType, query.domain, query.page, query.size, refreshTick]);

  const setSearch = useCallback((search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 0 }));
  }, []);

  const setSectionType = useCallback(
    (sectionType: 'All' | 'Notes' | 'Lab Sections') => {
      setQuery((prev) => ({ ...prev, sectionType, page: 0 }));
    },
    []
  );

  const setDomain = useCallback((domain: string) => {
    setQuery((prev) => ({ ...prev, domain, page: 0 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page: Math.max(0, page) }));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const resetFilters = useCallback(() => {
    flushNow('');
    setQuery(DEFAULT_PUBLIC_QUERY);
  }, [flushNow]);

  const trackDownload = useCallback((id: string, nextCount?: number) => {
    setPageData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id
          ? {
            ...item,
            downloads:
              typeof nextCount === 'number' ? nextCount : item.downloads + 1,
          }
          : item
      ),
    }));
  }, []);

  const syncDownloadTelemetry = useCallback((id: string) => {
    void recordResourceDownloadBackend(id);
  }, []);

  return {
    query,
    pageData,
    loading: loading || isDebouncing,
    isDebouncing,
    setSearch,
    flushSearch: flushNow,
    setSectionType,
    setDomain,
    setPage,
    resetFilters,
    trackDownload,
    syncDownloadTelemetry,
  };
}
