import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedThrottledSearch } from '../../../src/hooks/useDebouncedThrottledValue';
import { resourceService } from '../services/resourceService';
import type { StudyResourceFilePatchPayload } from '../../../src/services/resourcesService';
import type {
  ResourceDownloadAccessFilter,
  ResourceQueryState,
  StudyResourceFormPayload,
  StudyResourceNote,
  StudyResourcePage,
} from '../types/resource';

const DEFAULT_QUERY: ResourceQueryState = {
  search: '',
  status: 'All',
  sectionType: 'All',
  domain: 'All',
  fileType: 'All',
  hasFilesOnly: false,
  downloadAccess: 'All',
  sortBy: 'displayOrder',
  sortDir: 'asc',
  page: 1,
  pageSize: 5,
};

const EMPTY_PAGE: StudyResourcePage = {
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
    totalDownloads: 0,
    downloadEnabledCount: 0,
    previewOnlyCount: 0,
  },
  availableDomains: [],
  availableFileTypes: [],
};

export function useResources(
  onCountChange?: (totalCount: number, publishedCount: number) => void
) {
  const [query, setQuery] = useState<ResourceQueryState>(DEFAULT_QUERY);
  const [pageData, setPageData] = useState<StudyResourcePage>(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);
    setError(null);

    void resourceService
      .searchPage(
        {
          search: debouncedSearch,
          status: query.status,
          sectionType: query.sectionType,
          domain: query.domain,
          fileType: query.fileType,
          hasFileOnly: query.hasFilesOnly,
          downloadAccess: query.downloadAccess,
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
              : 'Unable to load resources & notes.'
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
    query.sectionType,
    query.domain,
    query.fileType,
    query.hasFilesOnly,
    query.downloadAccess,
    query.page,
    query.pageSize,
    query.sortBy,
    query.sortDir,
    refreshTick,
  ]);

  const updateQuery = useCallback((patch: Partial<ResourceQueryState>) => {
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

  const createResource = useCallback(
    async (values: StudyResourceFormPayload): Promise<StudyResourceNote> => {
      if (submitting) throw new Error('Submission already in progress.');
      setSubmitting(true);
      try {
        const created = await resourceService.createResource(values);
        flushNow('');
        setQuery((prev) => ({
          ...prev,
          search: '',
          status: 'All',
          sectionType: 'All',
          domain: 'All',
          fileType: 'All',
          hasFilesOnly: false,
          downloadAccess: 'All' as ResourceDownloadAccessFilter,
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

  const updateResource = useCallback(
    async (
      id: string,
      values: StudyResourceFormPayload
    ): Promise<StudyResourceNote> => {
      if (submitting) throw new Error('Submission already in progress.');
      setSubmitting(true);
      try {
        const updated = await resourceService.updateResource(id, values);
        reload();
        return updated;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, reload]
  );

  const toggleStatus = useCallback(
    async (note: StudyResourceNote): Promise<StudyResourceNote> => {
      const nextStatus = note.status === 'Published' ? 'Draft' : 'Published';
      const updated = await resourceService.patchStatus(note.id, nextStatus);
      reload();
      return updated;
    },
    [reload]
  );

  const toggleDownloadAccess = useCallback(
    async (note: StudyResourceNote): Promise<StudyResourceNote> => {
      const updated = await resourceService.patchDownloadAccess(
        note.id,
        !note.downloadEnabled
      );
      reload();
      return updated;
    },
    [reload]
  );

  const updateFileAttachment = useCallback(
    async (
      id: string,
      payload: StudyResourceFilePatchPayload
    ): Promise<StudyResourceNote> => {
      if (submitting) throw new Error('Submission already in progress.');
      setSubmitting(true);
      try {
        const updated = await resourceService.patchFileAttachment(id, payload);
        reload();
        return updated;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, reload]
  );

  const deleteResource = useCallback(
    async (id: string): Promise<void> => {
      await resourceService.deleteResource(id);
      reload();
    },
    [reload]
  );

  const existingSlugs = useMemo(
    () => pageData.items.map((r) => r.slug),
    [pageData.items]
  );

  const existingCodes = useMemo(
    () => pageData.items.map((r) => r.noteCode),
    [pageData.items]
  );

  const nextDisplayOrder = pageData.stats.total + 1;

  const startIndex =
    pageData.totalItems === 0 ? 0 : pageData.page * pageData.size;
  const endIndex = startIndex + pageData.items.length;

  return {
    items: pageData.items,
    stats: pageData.stats,
    availableDomains: pageData.availableDomains,
    availableFileTypes: pageData.availableFileTypes,
    currentPage: pageData.page + 1,
    totalPages: pageData.totalPages,
    totalItems: pageData.totalItems,
    startIndex,
    endIndex,
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
    createResource,
    updateResource,
    toggleStatus,
    toggleDownloadAccess,
    updateFileAttachment,
    deleteResource,
  };
}
