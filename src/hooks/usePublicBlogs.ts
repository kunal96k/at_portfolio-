import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BLOGS_STORAGE_KEY,
  BLOGS_UPDATED_EVENT,
  buildEmptyPublicBlogPage,
  fetchPublicBlogsPageAsync,
  type BlogPageResult,
  type BlogSearchParams,
} from '../services/blogsService';
import {
  COURSES_STORAGE_KEY,
  COURSES_UPDATED_EVENT,
} from '../services/coursesService';
import { useDebouncedThrottledSearch } from './useDebouncedThrottledValue';

interface PublicBlogsQueryState {
  search: string;
  category: string;
  sortBy: 'displayOrder' | 'createdAt' | 'viewsCount';
  sortDir: 'asc' | 'desc';
  page: number;
  size: number;
}

const DEFAULT_PUBLIC_QUERY: PublicBlogsQueryState = {
  search: '',
  category: 'All',
  sortBy: 'displayOrder',
  sortDir: 'asc',
  page: 0,
  size: 5,
};

/**
 * Dynamic hook for the public Blogs & Guides page (/blogs).
 * Fetches 5 blogs per page from the backend via JPA Specifications (1 Most Viewed + 4 grid posts).
 */
export function usePublicBlogs() {
  const [query, setQuery] =
    useState<PublicBlogsQueryState>(DEFAULT_PUBLIC_QUERY);
  const [pageData, setPageData] = useState<BlogPageResult>(() =>
    buildEmptyPublicBlogPage(DEFAULT_PUBLIC_QUERY)
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
    const refresh = () => setRefreshTick((t) => t + 1);
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === null ||
        e.key === BLOGS_STORAGE_KEY ||
        e.key === COURSES_STORAGE_KEY
      ) {
        refresh();
      }
    };
    window.addEventListener(BLOGS_UPDATED_EVENT, refresh);
    window.addEventListener(COURSES_UPDATED_EVENT, refresh);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(BLOGS_UPDATED_EVENT, refresh);
      window.removeEventListener(COURSES_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const params: BlogSearchParams = {
      search: debouncedSearch,
      category: query.category,
      page: query.page,
      size: query.size,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
    };

    setLoading(true);
    void fetchPublicBlogsPageAsync(params, controller.signal)
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
          setPageData(buildEmptyPublicBlogPage(DEFAULT_PUBLIC_QUERY));
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
    (
      sortBy: 'displayOrder' | 'createdAt' | 'viewsCount',
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
    setSort,
    setPage,
    resetFilters,
  };
}
