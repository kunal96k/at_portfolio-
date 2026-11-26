import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedThrottledSearch } from '../../../src/hooks/useDebouncedThrottledValue';
import type { BatchPageResult } from '../../../src/services/batchesService';
import { batchService } from '../services/batchService';
import type {
  Batch,
  BatchFormValues,
  BatchQueryState,
} from '../types/batch';

const DEFAULT_QUERY: BatchQueryState = {
  search: '',
  status: 'All',
  category: 'All',
  relatedCourse: 'All',
  level: 'All',
  hasFilesOnly: false,
  scheduleFilter: 'All',
  sortBy: 'displayOrder',
  sortDir: 'asc',
  page: 1,
  pageSize: 5,
};

const EMPTY_PAGE: BatchPageResult = {
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
    upcoming: 0,
    started: 0,
    totalDocuments: 0,
  },
  availableCategories: [],
  availableCourses: [],
};

export function useBatches(
  onGlobalSync?: (batches: Batch[]) => void,
  onCountChange?: (totalCount: number, publishedCount: number) => void
) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [pageData, setPageData] = useState<BatchPageResult>(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState<BatchQueryState>(DEFAULT_QUERY);
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
      const fullList = await batchService.listBatches();
      setBatches(fullList);
      onGlobalSyncRef.current?.(fullList);
    } catch {
      // Main search call handles user-visible error alert
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

    void batchService
      .searchPage(
        {
          search: debouncedSearch,
          status: query.status,
          category: query.category,
          relatedCourse: query.relatedCourse,
          learningLevel: query.level,
          hasFilesOnly: query.hasFilesOnly,
          scheduleFilter: query.scheduleFilter,
          page: Math.max(0, query.page - 1),
          size: query.pageSize,
          sortBy: query.sortBy,
          sortDir: query.sortDir,
        },
        controller.signal
      )
      .then((res) => {
        if (!controller.signal.aborted) {
          setPageData(res);
          onCountChangeRef.current?.(res.stats.total, res.stats.published);
          setLoading(false);
          setSearching(false);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : 'Unable to load batches.'
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
    query.relatedCourse,
    query.level,
    query.hasFilesOnly,
    query.scheduleFilter,
    query.sortBy,
    query.sortDir,
    query.page,
    query.pageSize,
    refreshTick,
  ]);

  const reload = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  const updateQuery = useCallback((patch: Partial<BatchQueryState>) => {
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

  const paginated = useMemo(() => {
    const startIndex =
      pageData.totalItems === 0 ? 0 : pageData.page * pageData.size;
    return {
      items: pageData.items,
      totalItems: pageData.totalItems,
      totalPages: pageData.totalPages,
      currentPage: pageData.page + 1,
      startIndex,
      endIndex: startIndex + pageData.items.length,
    };
  }, [pageData]);

  const stats = useMemo(
    () => ({
      total: pageData.stats.total,
      published: pageData.stats.published,
      drafts: pageData.stats.drafts,
      upcoming: pageData.stats.upcoming,
      started: pageData.stats.started,
      resources: pageData.stats.totalDocuments,
    }),
    [pageData.stats]
  );

  const existingSlugs = useMemo(() => batches.map((b) => b.slug), [batches]);
  const existingCodes = useMemo(() => batches.map((b) => b.batchCode), [batches]);

  const nextDisplayOrder = useMemo(() => {
    if (batches.length === 0) return 1;
    return Math.max(...batches.map((b) => b.displayOrder)) + 1;
  }, [batches]);

  const createBatch = useCallback(
    async (values: BatchFormValues): Promise<Batch> => {
      if (submitting) {
        throw new Error('Submission already in progress.');
      }
      setSubmitting(true);
      try {
        const created = await batchService.createBatch(values);
        flushNow('');
        setQuery({
          ...DEFAULT_QUERY,
          sortBy: 'updatedAt',
          sortDir: 'desc',
        });
        setRefreshTick((t) => t + 1);
        return created;
      } finally {
        setSubmitting(false);
      }
    },
    [flushNow, submitting]
  );

  const updateBatch = useCallback(
    async (id: string, values: BatchFormValues): Promise<Batch> => {
      if (submitting) {
        throw new Error('Submission already in progress.');
      }
      setSubmitting(true);
      try {
        const updated = await batchService.updateBatch(id, values);
        setRefreshTick((t) => t + 1);
        return updated;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting]
  );

  const toggleStatus = useCallback(async (batch: Batch): Promise<Batch> => {
    const nextStatus = batch.status === 'Published' ? 'Draft' : 'Published';
    const updated = await batchService.toggleStatus(batch.id, nextStatus);
    setRefreshTick((t) => t + 1);
    return updated;
  }, []);

  const toggleFeatured = useCallback(async (batch: Batch): Promise<Batch> => {
    const updated = await batchService.toggleFeatured(batch.id, !batch.featured);
    setRefreshTick((t) => t + 1);
    return updated;
  }, []);

  const deleteBatch = useCallback(async (id: string): Promise<void> => {
    await batchService.deleteBatch(id);
    setRefreshTick((t) => t + 1);
  }, []);

  return {
    batches,
    pageData,
    paginated,
    stats,
    query,
    loading,
    searching,
    isDebouncing,
    flushSearch: flushNow,
    error,
    submitting,
    existingSlugs,
    existingCodes,
    nextDisplayOrder,
    updateQuery,
    resetFilters,
    reload,
    createBatch,
    updateBatch,
    toggleStatus,
    toggleFeatured,
    deleteBatch,
  };
}
