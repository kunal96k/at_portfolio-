import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedThrottledSearch } from '../../../src/hooks/useDebouncedThrottledValue';
import { TESTIMONIALS_UPDATED_EVENT } from '../../../src/services/testimonialsService';
import { testimonialsAdminService } from '../services/testimonialsService';
import type {
  StudentTestimonial,
  TestimonialFormPayload,
  TestimonialPageResult,
  TestimonialQueryState,
  TestimonialStatus,
} from '../types/testimonial';

const DEFAULT_QUERY: TestimonialQueryState = {
  search: '',
  status: 'All',
  courseTrack: 'All',
  visibilityFilter: 'all',
  sortBy: 'displayOrder',
  sortDir: 'asc',
  page: 1,
  pageSize: 5,
};

const EMPTY_PAGE: TestimonialPageResult = {
  items: [],
  page: 0,
  size: 5,
  totalItems: 0,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
  stats: {
    total: 0,
    published: 0,
    drafts: 0,
    archived: 0,
    featured: 0,
  },
  availableCourseTracks: [],
};

export function useTestimonials(
  onCountChange?: (totalCount: number, publishedCount: number) => void
) {
  const [allItems, setAllItems] = useState<StudentTestimonial[]>([]);
  const [pageData, setPageData] = useState<TestimonialPageResult>(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState<TestimonialQueryState>(DEFAULT_QUERY);
  const [refreshTick, setRefreshTick] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

  const { committedValue: debouncedSearch, flushNow } =
    useDebouncedThrottledSearch(query.search, {
      debounceMs: 320,
      throttleMs: 400,
    });

  useEffect(() => {
    const refresh = () => setRefreshTick((t) => t + 1);
    window.addEventListener(TESTIMONIALS_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener(TESTIMONIALS_UPDATED_EVENT, refresh);
    };
  }, []);

  useEffect(() => {
    void testimonialsAdminService
      .listAll()
      .then(setAllItems)
      .catch(() => {
        // Surfaced by main paginated query
      });
  }, [refreshTick]);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);
    setError(null);

    void testimonialsAdminService
      .searchPage(
        {
          search: debouncedSearch,
          status: query.status,
          courseTrack: query.courseTrack,
          featuredOnly: query.visibilityFilter === 'featured',
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
        onCountChangeRef.current?.(res.stats.total, res.stats.published);
        setLoading(false);
        setSearching(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load student testimonials.'
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
    query.courseTrack,
    query.visibilityFilter,
    query.page,
    query.pageSize,
    query.sortBy,
    query.sortDir,
    refreshTick,
  ]);

  const updateQuery = useCallback((patch: Partial<TestimonialQueryState>) => {
    setQuery((prev) => {
      const resetPage =
        patch.search !== undefined ||
        patch.status !== undefined ||
        patch.courseTrack !== undefined ||
        patch.visibilityFilter !== undefined ||
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

  const createItem = useCallback(async (payload: TestimonialFormPayload) => {
    setSubmitting(true);
    try {
      const created = await testimonialsAdminService.createItem(payload);
      setRefreshTick((t) => t + 1);
      return created;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const updateItem = useCallback(
    async (id: string, payload: TestimonialFormPayload) => {
      setSubmitting(true);
      try {
        const updated = await testimonialsAdminService.updateItem(id, payload);
        setRefreshTick((t) => t + 1);
        return updated;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const toggleStatus = useCallback(
    async (item: StudentTestimonial, nextStatus?: TestimonialStatus) => {
      const updated = await testimonialsAdminService.toggleStatus(
        item.id,
        nextStatus
      );
      setRefreshTick((t) => t + 1);
      return updated;
    },
    []
  );

  const toggleFeatured = useCallback(async (item: StudentTestimonial) => {
    const updated = await testimonialsAdminService.toggleFeatured(
      item.id,
      !item.featured
    );
    setRefreshTick((t) => t + 1);
    return updated;
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await testimonialsAdminService.deleteItem(id);
    setRefreshTick((t) => t + 1);
  }, []);

  const existingCodes = useMemo(
    () => allItems.map((t) => t.testimonialCode),
    [allItems]
  );

  const nextDisplayOrder = useMemo(
    () =>
      allItems.reduce((max, t) => Math.max(max, Number(t.displayOrder ?? 0)), 0) +
      1,
    [allItems]
  );

  const startIndex =
    pageData.totalItems === 0 ? 0 : pageData.page * pageData.size + 1;
  const endIndex = Math.min(
    pageData.totalItems,
    pageData.page * pageData.size + pageData.items.length
  );

  return {
    items: pageData.items,
    stats: pageData.stats,
    availableCourseTracks: pageData.availableCourseTracks,
    query,
    loading,
    searching,
    error,
    submitting,
    existingCodes,
    nextDisplayOrder,
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
    createItem,
    updateItem,
    toggleStatus,
    toggleFeatured,
    deleteItem,
  };
}
