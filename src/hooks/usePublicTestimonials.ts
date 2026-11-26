import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildEmptyPublicTestimonialsPage,
  fetchPublicTestimonialsPageAsync,
  TESTIMONIALS_UPDATED_EVENT,
  type TestimonialPageResult,
  type TestimonialSearchParams,
} from '../services/testimonialsService';
import { useDebouncedThrottledSearch } from './useDebouncedThrottledValue';

interface PublicTestimonialsQueryState {
  search: string;
  courseTrack: string;
  featuredOnly: boolean;
  sortBy: 'displayOrder' | 'createdAt' | 'studentName';
  sortDir: 'asc' | 'desc';
  page: number;
  size: number;
}

interface UsePublicTestimonialsOptions {
  featuredOnly?: boolean;
  size?: number;
  enabled?: boolean;
}

/**
 * Server-side paginated & specification-filtered hook for Student Testimonials
 * across the dedicated /testimonials page and HomePage showcase.
 */
export function usePublicTestimonials(options: UsePublicTestimonialsOptions = {}) {
  const defaultSize = options.size ?? 6;
  const defaultFeaturedOnly = Boolean(options.featuredOnly);
  const enabled = options.enabled ?? true;

  const [query, setQuery] = useState<PublicTestimonialsQueryState>({
    search: '',
    courseTrack: 'All',
    featuredOnly: defaultFeaturedOnly,
    sortBy: 'displayOrder',
    sortDir: 'asc',
    page: 0,
    size: defaultSize,
  });

  const [pageData, setPageData] = useState<TestimonialPageResult>(() =>
    buildEmptyPublicTestimonialsPage({ page: 0, size: defaultSize })
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
    window.addEventListener(TESTIMONIALS_UPDATED_EVENT, refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => {
      window.removeEventListener(TESTIMONIALS_UPDATED_EVENT, refresh);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const params: TestimonialSearchParams = {
      search: debouncedSearch,
      courseTrack: query.courseTrack,
      featuredOnly: query.featuredOnly ? true : undefined,
      page: query.page,
      size: query.size,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
    };

    setLoading(true);
    void fetchPublicTestimonialsPageAsync(params, controller.signal)
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
          setPageData(buildEmptyPublicTestimonialsPage({ page: 0, size: defaultSize }));
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    debouncedSearch,
    query.courseTrack,
    query.featuredOnly,
    query.sortBy,
    query.sortDir,
    query.page,
    query.size,
    refreshTick,
    defaultSize,
    enabled,
  ]);

  const setSearch = useCallback((search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 0 }));
  }, []);

  const setCourseTrack = useCallback((courseTrack: string) => {
    setQuery((prev) => ({ ...prev, courseTrack, page: 0 }));
  }, []);

  const setFeaturedOnly = useCallback((featuredOnly: boolean) => {
    setQuery((prev) => ({ ...prev, featuredOnly, page: 0 }));
  }, []);

  const setSort = useCallback(
    (
      sortBy: 'displayOrder' | 'createdAt' | 'studentName',
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
    setQuery({
      search: '',
      courseTrack: 'All',
      featuredOnly: defaultFeaturedOnly,
      sortBy: 'displayOrder',
      sortDir: 'asc',
      page: 0,
      size: defaultSize,
    });
  }, [flushNow, defaultFeaturedOnly, defaultSize]);

  return {
    query,
    pageData,
    loading,
    isDebouncing,
    setSearch,
    flushSearch: flushNow,
    setCourseTrack,
    setFeaturedOnly,
    setSort,
    setPage,
    resetFilters,
  };
}
