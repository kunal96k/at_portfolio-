import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedThrottledSearch } from '../../../src/hooks/useDebouncedThrottledValue';
import type { CourseDomainPage } from '../../../src/services/coursesService';
import { courseService } from '../services/courseService';
import type {
  CourseDomain,
  CourseDomainFormPayload,
  CourseQueryState,
} from '../types/course';

const DEFAULT_QUERY: CourseQueryState = {
  search: '',
  status: 'All',
  category: 'All',
  hasFilesOnly: false,
  sortBy: 'displayOrder',
  sortDir: 'asc',
  page: 1,
  pageSize: 5,
};

const EMPTY_PAGE: CourseDomainPage = {
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
    totalDocuments: 0,
  },
  availableCategories: [],
};

export function useCourses(onGlobalSync?: (courses: CourseDomain[]) => void) {
  const [courses, setCourses] = useState<CourseDomain[]>([]);
  const [pageData, setPageData] = useState<CourseDomainPage>(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState<CourseQueryState>(DEFAULT_QUERY);
  const [refreshTick, setRefreshTick] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const onGlobalSyncRef = useRef(onGlobalSync);
  onGlobalSyncRef.current = onGlobalSync;

  const {
    committedValue: debouncedSearch,
    isDebouncing,
    flushNow,
  } = useDebouncedThrottledSearch(query.search, {
    debounceMs: 320,
    throttleMs: 400,
  });

  const syncFullCatalog = useCallback(async () => {
    try {
      const fullList = await courseService.listCourses();
      setCourses(fullList);
      onGlobalSyncRef.current?.(fullList);
    } catch {
      // Errors surfaced by main paginated query
    }
  }, []);

  useEffect(() => {
    void syncFullCatalog();
  }, [syncFullCatalog, refreshTick]);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);
    setError(null);

    void courseService
      .searchPage(
        {
          search: debouncedSearch,
          status: query.status,
          category: query.category,
          hasFilesOnly: query.hasFilesOnly,
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
        setLoading(false);
        setSearching(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load courses & domains.'
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
    query.category,
    query.hasFilesOnly,
    query.page,
    query.pageSize,
    query.sortBy,
    query.sortDir,
    refreshTick,
  ]);

  const updateQuery = useCallback((patch: Partial<CourseQueryState>) => {
    setQuery((prev) => ({
      ...prev,
      ...patch,
      page: patch.page !== undefined ? patch.page : 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    flushNow('');
    setQuery(DEFAULT_QUERY);
  }, [flushNow]);

  const reload = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  const stats = useMemo(
    () => ({
      total: pageData.stats.total,
      published: pageData.stats.published,
      drafts: pageData.stats.drafts,
      resources: pageData.stats.totalDocuments,
    }),
    [pageData.stats]
  );

  const startIndex =
    pageData.totalItems === 0 ? 0 : pageData.page * pageData.size;
  const endIndex = startIndex + pageData.items.length;

  const paginated = useMemo(
    () => ({
      items: pageData.items,
      totalItems: pageData.totalItems,
      totalPages: pageData.totalPages,
      currentPage: pageData.page + 1,
      startIndex,
      endIndex,
    }),
    [pageData.items, pageData.totalItems, pageData.totalPages, pageData.page, startIndex, endIndex]
  );

  const categories = useMemo(
    () =>
      pageData.availableCategories.length > 0
        ? pageData.availableCategories
        : Array.from(
            new Set(courses.map((c) => c.category.trim()).filter(Boolean))
          ).sort((a, b) => a.localeCompare(b)),
    [pageData.availableCategories, courses]
  );

  const existingSlugs = useMemo(() => courses.map((c) => c.slug), [courses]);
  const existingCodes = useMemo(
    () => courses.map((c) => c.domainCode),
    [courses]
  );

  const nextDisplayOrder = useMemo(() => {
    if (courses.length === 0) return pageData.stats.total + 1;
    return Math.max(...courses.map((c) => c.displayOrder)) + 1;
  }, [courses, pageData.stats.total]);

  const createCourse = useCallback(
    async (values: CourseDomainFormPayload): Promise<CourseDomain> => {
      if (submitting) {
        throw new Error('Submission already in progress.');
      }
      setSubmitting(true);
      try {
        const created = await courseService.createCourse(values);
        flushNow('');
        setQuery((prev) => ({
          ...prev,
          search: '',
          status: 'All',
          category: 'All',
          hasFilesOnly: false,
          sortBy: 'updatedAt',
          sortDir: 'desc',
          page: 1,
        }));
        reload();
        return created;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, flushNow, reload]
  );

  const updateCourse = useCallback(
    async (
      id: string,
      values: CourseDomainFormPayload
    ): Promise<CourseDomain> => {
      if (submitting) {
        throw new Error('Submission already in progress.');
      }
      setSubmitting(true);
      try {
        const updated = await courseService.updateCourse(id, values);
        reload();
        return updated;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, reload]
  );

  const toggleStatus = useCallback(
    async (course: CourseDomain): Promise<CourseDomain> => {
      const nextStatus = course.status === 'Published' ? 'Draft' : 'Published';
      const updated = await courseService.patchStatus(course.id, nextStatus);
      reload();
      return updated;
    },
    [reload]
  );

  const deleteCourse = useCallback(
    async (id: string): Promise<void> => {
      await courseService.deleteCourse(id);
      reload();
    },
    [reload]
  );

  return {
    courses,
    paginated,
    stats,
    categories,
    query,
    loading,
    searching: searching || isDebouncing,
    isDebouncing,
    error,
    submitting,
    existingSlugs,
    existingCodes,
    nextDisplayOrder,
    updateQuery,
    flushSearch: flushNow,
    resetFilters,
    reload,
    createCourse,
    updateCourse,
    toggleStatus,
    deleteCourse,
  };
}
