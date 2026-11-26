import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedThrottledSearch } from '../../../src/hooks/useDebouncedThrottledValue';
import { galleryAdminService } from '../services/galleryService';
import type {
  GalleryFormPayload,
  GalleryItem,
  GalleryPageResult,
  GalleryQueryState,
} from '../types/gallery';

const DEFAULT_QUERY: GalleryQueryState = {
  search: '',
  status: 'All',
  category: 'All',
  visibilityFilter: 'all',
  sortBy: 'displayOrder',
  sortDir: 'asc',
  page: 1,
  pageSize: 5,
};

const EMPTY_PAGE: GalleryPageResult = {
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
    featured: 0,
  },
  availableCategories: [],
};

export function useGallery(
  onCountChange?: (totalCount: number, publishedCount: number) => void
) {
  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [pageData, setPageData] = useState<GalleryPageResult>(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState<GalleryQueryState>(DEFAULT_QUERY);
  const [refreshTick, setRefreshTick] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
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
      const fullList = await galleryAdminService.listAll();
      setAllItems(fullList);
    } catch {
      // Surfaced by main paginated query
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

    void galleryAdminService
      .searchPage(
        {
          search: debouncedSearch,
          status: query.status,
          category: query.category,
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
              : 'Unable to load gallery items.'
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

  const updateQuery = useCallback((patch: Partial<GalleryQueryState>) => {
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
    [
      pageData.items,
      pageData.totalItems,
      pageData.totalPages,
      pageData.page,
      startIndex,
      endIndex,
    ]
  );

  const availableCategories = useMemo(
    () =>
      pageData.availableCategories.length > 0
        ? pageData.availableCategories
        : Array.from(
            new Set(allItems.map((g) => g.category.trim()).filter(Boolean))
          ).sort((a, b) => a.localeCompare(b)),
    [pageData.availableCategories, allItems]
  );

  const existingCodes = useMemo(
    () => allItems.map((g) => g.galleryCode),
    [allItems]
  );

  const nextDisplayOrder = useMemo(() => {
    if (allItems.length === 0) return pageData.stats.total + 1;
    return Math.max(...allItems.map((g) => g.displayOrder)) + 1;
  }, [allItems, pageData.stats.total]);

  const createItem = useCallback(
    async (values: GalleryFormPayload): Promise<GalleryItem> => {
      if (submitting) {
        throw new Error('Submission already in progress.');
      }
      setSubmitting(true);
      try {
        const created = await galleryAdminService.createItem(values);
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

  const updateItem = useCallback(
    async (id: string, values: GalleryFormPayload): Promise<GalleryItem> => {
      if (submitting) {
        throw new Error('Submission already in progress.');
      }
      setSubmitting(true);
      try {
        const updated = await galleryAdminService.updateItem(id, values);
        reload();
        return updated;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, reload]
  );

  const toggleStatus = useCallback(
    async (item: GalleryItem): Promise<GalleryItem> => {
      const next = item.status === 'Published' ? 'Draft' : 'Published';
      const updated = await galleryAdminService.toggleStatus(item.id, next);
      reload();
      return updated;
    },
    [reload]
  );

  const toggleFeatured = useCallback(
    async (item: GalleryItem): Promise<GalleryItem> => {
      const updated = await galleryAdminService.toggleFeatured(
        item.id,
        !item.featured
      );
      reload();
      return updated;
    },
    [reload]
  );

  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      await galleryAdminService.deleteItem(id);
      reload();
    },
    [reload]
  );

  return {
    items: pageData.items,
    allItems,
    paginated,
    stats,
    availableCategories,
    query,
    loading,
    searching: searching || isDebouncing,
    error,
    submitting,
    existingCodes,
    nextDisplayOrder,
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
