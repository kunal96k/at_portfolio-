import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildEmptyPublicGalleryPage,
  fetchPublicGalleryPageAsync,
  GALLERY_STORAGE_KEY,
  GALLERY_UPDATED_EVENT,
  type GalleryPageResult,
  type GallerySearchParams,
} from '../services/galleryService';
import { useDebouncedThrottledSearch } from './useDebouncedThrottledValue';

interface PublicGalleryQueryState {
  search: string;
  category: string;
  featuredOnly: boolean;
  sortBy: 'displayOrder' | 'createdAt' | 'takenAt';
  sortDir: 'asc' | 'desc';
  page: number;
  size: number;
}

const DEFAULT_PUBLIC_QUERY: PublicGalleryQueryState = {
  search: '',
  category: 'All',
  featuredOnly: false,
  sortBy: 'displayOrder',
  sortDir: 'asc',
  page: 0,
  size: 12,
};

/**
 * Dynamic hook for the public Lab & Workshop Gallery page (/gallery).
 * Fetches 12 photos per page from the Spring Boot backend via JPA Specifications.
 */
export function usePublicGallery() {
  const [query, setQuery] =
    useState<PublicGalleryQueryState>(DEFAULT_PUBLIC_QUERY);
  const [pageData, setPageData] = useState<GalleryPageResult>(() =>
    buildEmptyPublicGalleryPage(DEFAULT_PUBLIC_QUERY)
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
      if (e.key === null || e.key === GALLERY_STORAGE_KEY) {
        refresh();
      }
    };
    window.addEventListener(GALLERY_UPDATED_EVENT, refresh);
    window.addEventListener('storage', handleStorage);
    const timer = window.setInterval(refresh, 60000);
    return () => {
      window.removeEventListener(GALLERY_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', handleStorage);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const params: GallerySearchParams = {
      search: debouncedSearch,
      category: query.category,
      featuredOnly: query.featuredOnly ? true : undefined,
      page: query.page,
      size: query.size,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
    };

    setLoading(true);
    void fetchPublicGalleryPageAsync(params, controller.signal)
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
          setPageData(buildEmptyPublicGalleryPage(DEFAULT_PUBLIC_QUERY));
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    debouncedSearch,
    query.category,
    query.featuredOnly,
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

  const setFeaturedOnly = useCallback((featuredOnly: boolean) => {
    setQuery((prev) => ({ ...prev, featuredOnly, page: 0 }));
  }, []);

  const setSort = useCallback(
    (
      sortBy: 'displayOrder' | 'createdAt' | 'takenAt',
      sortDir: 'asc' | 'desc'
    ) => {
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
    setQuery(DEFAULT_PUBLIC_QUERY);
  }, [flushNow]);

  return {
    query,
    pageData,
    loading,
    isDebouncing,
    setSearch,
    flushSearch: flushNow,
    setCategory,
    setFeaturedOnly,
    setSort,
    setPage,
    resetFilters,
  };
}
