import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedThrottledSearch } from '../../../src/hooks/useDebouncedThrottledValue';
import { blogService } from '../services/blogService';
import type {
  BlogArticle,
  BlogFormPayload,
  BlogPageResult,
  BlogQueryState,
} from '../types/blog';

const DEFAULT_QUERY: BlogQueryState = {
  search: '',
  status: 'All',
  category: 'All',
  visibilityFilter: 'all',
  sortBy: 'displayOrder',
  sortDir: 'asc',
  page: 1,
  pageSize: 5,
};

const EMPTY_PAGE: BlogPageResult = {
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
    scheduled: 0,
    featured: 0,
    totalViews: 0,
    totalDocuments: 0,
  },
  availableCategories: [],
};

export function useBlogs(
  onGlobalSync?: (blogs: BlogArticle[]) => void,
  onCountChange?: (totalCount: number, publishedCount: number) => void
) {
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [pageData, setPageData] = useState<BlogPageResult>(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState<BlogQueryState>(DEFAULT_QUERY);
  const [refreshTick, setRefreshTick] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const onGlobalSyncRef = useRef(onGlobalSync);
  onGlobalSyncRef.current = onGlobalSync;
  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

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
      const fullList = await blogService.listBlogs();
      setBlogs(fullList);
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

    void blogService
      .searchPage(
        {
          search: debouncedSearch,
          status: query.status,
          category: query.category,
          featuredOnly: query.visibilityFilter === 'featured',
          hasFilesOnly: query.visibilityFilter === 'with-files',
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
              : 'Unable to load blog articles.'
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
    query.visibilityFilter,
    query.page,
    query.pageSize,
    query.sortBy,
    query.sortDir,
    refreshTick,
  ]);

  const updateQuery = useCallback((patch: Partial<BlogQueryState>) => {
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

  // Poll cleanly while any Scheduled blog is awaiting auto-publish
  useEffect(() => {
    if (pageData.stats.scheduled <= 0) return;
    const timer = window.setInterval(() => {
      setRefreshTick((t) => t + 1);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [pageData.stats.scheduled]);

  const stats = pageData.stats;
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

  const availableCategories = useMemo(
    () =>
      pageData.availableCategories.length > 0
        ? pageData.availableCategories
        : Array.from(
            new Set(blogs.map((b) => b.category.trim()).filter(Boolean))
          ).sort((a, b) => a.localeCompare(b)),
    [pageData.availableCategories, blogs]
  );

  const existingSlugs = useMemo(() => blogs.map((b) => b.slug), [blogs]);
  const existingCodes = useMemo(() => blogs.map((b) => b.blogCode), [blogs]);

  const nextDisplayOrder = useMemo(() => {
    if (blogs.length === 0) return pageData.stats.total + 1;
    return Math.max(...blogs.map((b) => b.displayOrder)) + 1;
  }, [blogs, pageData.stats.total]);

  const createBlog = useCallback(
    async (values: BlogFormPayload): Promise<BlogArticle> => {
      if (submitting) {
        throw new Error('Submission already in progress.');
      }
      setSubmitting(true);
      try {
        const created = await blogService.createBlog(values);
        flushNow('');
        setQuery((prev) => ({
          ...prev,
          search: '',
          status: 'All',
          category: 'All',
          visibilityFilter: 'all',
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

  const updateBlog = useCallback(
    async (id: string, values: BlogFormPayload): Promise<BlogArticle> => {
      if (submitting) {
        throw new Error('Submission already in progress.');
      }
      setSubmitting(true);
      try {
        const updated = await blogService.updateBlog(id, values);
        reload();
        return updated;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, reload]
  );

  const toggleStatus = useCallback(
    async (blog: BlogArticle): Promise<BlogArticle> => {
      const next = blog.status === 'Published' ? 'Draft' : 'Published';
      const updated = await blogService.toggleStatus(blog.id, next);
      reload();
      return updated;
    },
    [reload]
  );

  const toggleFeatured = useCallback(
    async (blog: BlogArticle): Promise<BlogArticle> => {
      const updated = await blogService.toggleFeatured(blog.id, !blog.featured);
      reload();
      return updated;
    },
    [reload]
  );

  const deleteBlog = useCallback(
    async (id: string): Promise<void> => {
      await blogService.deleteBlog(id);
      reload();
    },
    [reload]
  );

  return {
    blogs,
    paginated,
    stats,
    availableCategories,
    query,
    loading,
    searching: searching || isDebouncing,
    error,
    submitting,
    existingSlugs,
    existingCodes,
    nextDisplayOrder,
    updateQuery,
    flushSearch: flushNow,
    resetFilters,
    reload,
    createBlog,
    updateBlog,
    toggleStatus,
    toggleFeatured,
    deleteBlog,
  };
}
