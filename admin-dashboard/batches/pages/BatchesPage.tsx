import {
  AlertCircle,
  CalendarRange,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  isBatchStarted,
  parseBatchModules,
} from '../../../src/services/batchesService';
import {
  COURSES_UPDATED_EVENT,
  fetchAllCoursesFromApiOrStorage,
  loadPublicCoursesFromStorage,
} from '../../../src/services/coursesService';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { ToastItem } from '../../types/admin';
import { slugifyText } from '../../utils/adminLogic';
import { BatchFilesModal } from '../components/BatchFilesModal';
import { BatchFiltersBar } from '../components/BatchFiltersBar';
import { BatchPreviewModal } from '../components/BatchPreviewModal';
import { BatchTableAndCards } from '../components/BatchTableAndCards';
import { BatchFormModal } from '../forms/BatchFormModal';
import { useBatches } from '../hooks/useBatches';
import type {
  Batch,
  BatchFormValues,
  BatchSortField,
} from '../types/batch';

interface BatchesPageProps {
  onToast: (toast: Omit<ToastItem, 'id'>) => void;
  onCountChange?: (count: number) => void;
  availableCourseTracks?: string[];
}

export function BatchesPage({
  onToast,
  onCountChange,
  availableCourseTracks,
}: BatchesPageProps) {
  const {
    batches,
    paginated,
    stats,
    query,
    loading,
    searching,
    isDebouncing,
    flushSearch,
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
    deleteBatch,
  } = useBatches(undefined, (totalCount) => onCountChange?.(totalCount));

  const [formOpen, setFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [previewBatch, setPreviewBatch] = useState<Batch | null>(null);
  const [filesModalOpen, setFilesModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [liveCourseTracks, setLiveCourseTracks] = useState<string[]>(() =>
    availableCourseTracks && availableCourseTracks.length > 0
      ? availableCourseTracks
      : loadPublicCoursesFromStorage().map((c) => c.title)
  );
  const [liveCourseCategories, setLiveCourseCategories] = useState<string[]>(() =>
    loadPublicCoursesFromStorage().map((c) => c.category)
  );

  useEffect(() => {
    let active = true;
    const syncCourses = () => {
      void fetchAllCoursesFromApiOrStorage().then((res) => {
        if (!active) return;
        const fromBackend = res.items.map((c) => c.title.trim()).filter(Boolean);
        const categoriesFromBackend = res.items
          .map((c) => c.category.trim())
          .filter(Boolean);
        if (res.fromBackend || fromBackend.length > 0) {
          setLiveCourseTracks(fromBackend);
          setLiveCourseCategories(categoriesFromBackend);
        } else if (availableCourseTracks && availableCourseTracks.length > 0) {
          setLiveCourseTracks(availableCourseTracks);
        }
      });
    };
    syncCourses();
    window.addEventListener(COURSES_UPDATED_EVENT, syncCourses);
    return () => {
      active = false;
      window.removeEventListener(COURSES_UPDATED_EVENT, syncCourses);
    };
  }, [availableCourseTracks]);

  const mergedDomainTracks = Array.from(
    new Map(
      [
        ...(liveCourseTracks.length > 0
          ? liveCourseTracks
          : availableCourseTracks ?? []),
        ...batches.map((b) => b.relatedCourse).filter(Boolean),
      ]
        .map((title) => title.trim())
        .filter(Boolean)
        .map((title) => [title.toLowerCase(), title])
    ).values()
  );

  const mergedCategories = Array.from(
    new Map(
      [
        ...liveCourseCategories,
        ...batches.map((b) => b.category).filter(Boolean),
      ]
        .map((cat) => cat.trim())
        .filter(Boolean)
        .map((cat) => [cat.toLowerCase(), cat])
    ).values()
  );

  const handleSort = (field: BatchSortField) => {
    const nextDir =
      query.sortBy === field && query.sortDir === 'asc' ? 'desc' : 'asc';
    updateQuery({ sortBy: field, sortDir: nextDir });
  };

  const handleSubmitForm = async (values: BatchFormValues) => {
    try {
      if (editingBatch) {
        const updated = await updateBatch(editingBatch.id, values);
        onToast({
          tone: 'success',
          title: 'Batch updated',
          description: `"${updated.title}" (${updated.batchCode}) saved.`,
        });
      } else {
        const created = await createBatch(values);
        onToast({
          tone: 'success',
          title: 'New batch created',
          description: `"${created.title}" allocated code ${created.batchCode}.`,
        });
      }
      setFormOpen(false);
      setEditingBatch(null);
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Could not save batch',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteBatch(deleteTarget.id);
      onToast({
        tone: 'success',
        title: 'Batch permanently deleted',
        description: `"${deleteTarget.title}" and its uploaded files were removed.`,
      });
      setDeleteTarget(null);
    } catch {
      onToast({
        tone: 'error',
        title: 'Delete failed',
        description: 'Unable to delete this batch right now.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (batch: Batch) => {
    const updated = await toggleStatus(batch);
    if (previewBatch?.id === updated.id) {
      setPreviewBatch(updated);
    }
    const started = isBatchStarted(updated);
    onToast({
      tone: 'success',
      title:
        updated.status === 'Published'
          ? started
            ? 'Batch marked Published (hidden publicly since start time passed)'
            : 'Batch published live on /upcoming-batches'
          : 'Batch moved to Draft',
      description: updated.title,
    });
  };

  const handlePreviewDraft = (draft: BatchFormValues) => {
    const now = new Date().toISOString();
    const parsedModules = parseBatchModules(draft.detailedContent);
    setPreviewBatch({
      id: editingBatch?.id ?? 'preview-draft',
      batchCode: draft.batchCode.trim() || 'BATCH-NEW',
      title: draft.title.trim() || 'Untitled Batch Draft',
      slug: slugifyText(draft.slug || draft.title || 'untitled-batch'),
      shortDescription:
        draft.shortDescription.trim() || 'No short description entered yet.',
      detailedContent:
        draft.detailedContent.trim() || 'No lab modules entered yet.',
      modules: parsedModules,
      category: draft.category,
      relatedCourse: draft.relatedCourse,
      batchDate: draft.batchDate.trim() || 'Announced Soon',
      batchTime: draft.batchTime.trim() || 'Flexible Slots',
      mode: draft.mode || 'Live Lab-Driven Training',
      seatsTotal: draft.seatsTotal || 20,
      location: draft.location.trim() || 'Nashik & Live Online',
      coverImage: draft.coverImage,
      coverImageName: draft.coverImageName,
      tags: draft.tags,
      learningLevel: draft.learningLevel,
      attachments: draft.attachments,
      displayOrder: draft.displayOrder || 1,
      featured: draft.featured,
      status: draft.status,
      createdAt: editingBatch?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <div className="space-y-4">
      {/* Compact 4-Card KPI Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Total Batches
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#145BFF]">
              <CalendarRange className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#0B1736] tabular-nums">
              {stats.total}
            </p>
            <p className="mt-1 text-[11.5px] font-medium text-[#64748B]">
              {stats.upcoming} upcoming · {stats.started} started
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Published Batches
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-emerald-600 tabular-nums">
              {stats.published}
            </p>
            <p className="mt-1 text-[11.5px] font-medium text-[#64748B]">
              Only upcoming dates show on /upcoming-batches
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Draft Batches
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
              <Clock className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-amber-600 tabular-nums">
              {stats.drafts}
            </p>
            <p className="mt-1 text-[11.5px] font-medium text-[#64748B]">
              Hidden / awaiting release
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#145BFF]/40">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Batch Documents
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <FileText className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-bold text-[#145BFF] tabular-nums">
                {stats.resources}
              </p>
              <p className="mt-1 text-[11.5px] font-medium text-[#64748B]">
                Syllabus &amp; lab files
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFilesModalOpen(true)}
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#EFF6FF] px-2.5 text-xs font-semibold text-[#145BFF] transition-colors hover:bg-[#DBEAFE]"
            >
              <span>View all</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters, Search, Documents & New Batch Bar */}
      <BatchFiltersBar
        query={query}
        domainTracks={mergedDomainTracks}
        categoryOptions={mergedCategories}
        searching={searching}
        isDebouncing={isDebouncing}
        onFlushSearch={flushSearch}
        onUpdateQuery={updateQuery}
        onResetFilters={resetFilters}
        totalFiles={stats.resources}
        onViewFiles={() => setFilesModalOpen(true)}
        onCreateNew={() => {
          setEditingBatch(null);
          setFormOpen(true);
        }}
      />

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-2.5 text-sm font-medium text-[#B91C1C]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => reload()}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#0B1736]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Adaptive Table / Mobile Stacked Cards with Kebab Three-Dots Menu */}
      <BatchTableAndCards
        batches={paginated.items}
        loading={loading}
        totalRecordsCount={stats.total}
        sortBy={query.sortBy}
        sortDir={query.sortDir}
        onSort={handleSort}
        currentPage={paginated.currentPage}
        totalPages={paginated.totalPages}
        totalItems={paginated.totalItems}
        startIndex={paginated.startIndex}
        endIndex={paginated.endIndex}
        onPageChange={(page) => updateQuery({ page })}
        onPreview={(batch) => setPreviewBatch(batch)}
        onEdit={(batch) => {
          setEditingBatch(batch);
          setFormOpen(true);
        }}
        onDelete={(batch) => setDeleteTarget(batch)}
        onCreateNew={() => {
          setEditingBatch(null);
          setFormOpen(true);
        }}
      />

      {/* Create / Edit Batch Full-Screen Modal */}
      <BatchFormModal
        open={formOpen}
        editingBatch={editingBatch}
        existingSlugs={existingSlugs}
        existingCodes={existingCodes}
        defaultDisplayOrder={nextDisplayOrder}
        availableCourseTracks={mergedDomainTracks}
        availableCourseCategories={mergedCategories}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false);
          setEditingBatch(null);
        }}
        onSubmit={handleSubmitForm}
        onPreviewDraft={handlePreviewDraft}
      />

      {/* Preview Batch Full-Screen Modal */}
      <BatchPreviewModal
        batch={previewBatch}
        onClose={() => setPreviewBatch(null)}
        onEdit={(batch) => {
          setEditingBatch(batch);
          setFormOpen(true);
        }}
        onToggleStatus={(batch) => void handleToggleStatus(batch)}
      />

      {/* View All Batch Documents / Brochures Modal */}
      <BatchFilesModal
        open={filesModalOpen}
        batches={batches}
        onClose={() => setFilesModalOpen(false)}
        onPreviewBatch={(batch) => setPreviewBatch(batch)}
      />

      {/* Delete Single Batch Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete batch?"
        description={
          deleteTarget
            ? `Are you sure you want to permanently remove "${deleteTarget.title}" and delete any uploaded brochure/image files from disk? If no upcoming published batches remain, /upcoming-batches will display the Empty State schedule notice.`
            : ''
        }
        confirmLabel="Delete Batch"
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
