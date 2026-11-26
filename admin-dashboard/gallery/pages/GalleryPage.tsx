import {
  AlertCircle,
  CheckCircle2,
  FileEdit,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { ToastItem } from '../../types/admin';
import { GalleryFiltersBar } from '../components/GalleryFiltersBar';
import { GalleryPreviewModal } from '../components/GalleryPreviewModal';
import { GalleryTableAndCards } from '../components/GalleryTableAndCards';
import { GalleryFormModal } from '../forms/GalleryFormModal';
import { useGallery } from '../hooks/useGallery';
import type {
  GalleryFormPayload,
  GalleryItem,
  GallerySortField,
} from '../types/gallery';

interface GalleryPageProps {
  onToast: (toast: Omit<ToastItem, 'id'>) => void;
  onCountChange?: (totalCount: number, publishedCount: number) => void;
}

export function GalleryPage({ onToast, onCountChange }: GalleryPageProps) {
  const {
    items,
    paginated,
    stats,
    availableCategories,
    query,
    loading,
    searching,
    error,
    submitting,
    existingCodes,
    nextDisplayOrder,
    updateQuery,
    flushSearch,
    resetFilters,
    reload,
    createItem,
    updateItem,
    toggleStatus,
    toggleFeatured,
    deleteItem,
  } = useGallery(onCountChange);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const combinedCategories = Array.from(
    new Map(
      ['Training', 'Labs', 'Infrastructure', 'Events', ...availableCategories]
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => [c.toLowerCase(), c])
    ).values()
  ).sort((a, b) => a.localeCompare(b));

  const handleSort = (field: GallerySortField) => {
    if (query.sortBy === field) {
      updateQuery({ sortDir: query.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      updateQuery({
        sortBy: field,
        sortDir: field === 'displayOrder' ? 'asc' : 'desc',
      });
    }
  };

  const handleSubmitForm = async (values: GalleryFormPayload) => {
    try {
      if (editingItem) {
        const updated = await updateItem(editingItem.id, values);
        onToast({
          tone: 'success',
          title: 'Gallery photo updated',
          description: `"${updated.title}" saved as ${updated.status}.`,
        });
      } else {
        const created = await createItem(values);
        onToast({
          tone: 'success',
          title:
            created.status === 'Published'
              ? 'Gallery photo published live'
              : 'Gallery photo draft saved',
          description: `"${created.title}" added (${created.galleryCode}).`,
        });
      }
      setFormOpen(false);
      setEditingItem(null);
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Could not save gallery photo',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteItem(deleteTarget.id);
      onToast({
        tone: 'success',
        title: 'Gallery photo permanently deleted',
        description: `"${deleteTarget.title}" removed from database and uploads folder.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Delete failed',
        description:
          err instanceof Error
            ? err.message
            : 'Unable to delete this gallery photo right now.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (item: GalleryItem) => {
    try {
      const updated = await toggleStatus(item);
      if (previewItem?.id === updated.id) {
        setPreviewItem(updated);
      }
      onToast({
        tone: 'success',
        title:
          updated.status === 'Published'
            ? 'Photo published on Gallery page'
            : 'Photo moved to Draft',
        description: updated.title,
      });
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Status update failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleToggleFeatured = async (item: GalleryItem) => {
    try {
      const updated = await toggleFeatured(item);
      if (previewItem?.id === updated.id) {
        setPreviewItem(updated);
      }
      onToast({
        tone: 'success',
        title: updated.featured
          ? 'Marked as Featured Highlight'
          : 'Removed Featured highlight',
        description: updated.title,
      });
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Featured update failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handlePreviewDraft = (draft: GalleryFormPayload) => {
    const now = new Date().toISOString();
    setPreviewItem({
      id: editingItem?.id ?? 'preview-draft',
      galleryCode: draft.galleryCode.trim() || 'GALLERY-NEW',
      title: draft.title.trim() || 'Untitled Gallery Photo Draft',
      caption: draft.caption.trim() || 'No caption entered yet.',
      category: draft.category.trim() || 'Training',
      imageUrl: draft.imageUrl,
      imageName: draft.imageName || 'gallery-photo.jpg',
      altText: draft.altText.trim() || draft.title.trim() || 'Gallery photo preview',
      tags: draft.tags,
      featured: Boolean(draft.featured),
      displayOrder: draft.displayOrder || 1,
      status: draft.status,
      takenAt: draft.takenAt || null,
      createdAt: editingItem?.createdAt ?? now,
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
              Total Gallery Photos
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#145BFF]">
              <ImageIcon className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#0B1736] tabular-nums">
              {stats.total}
            </p>
            <p className="mt-1 text-[11.5px] font-medium text-[#64748B]">
              Synced with Spring Boot DB
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Published Photos
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
              Live on website Gallery
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Draft Photos
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
              <FileEdit className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-amber-600 tabular-nums">
              {stats.drafts}
            </p>
            <p className="mt-1 text-[11.5px] font-medium text-[#64748B]">
              Hidden until published
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#145BFF]/40">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Featured Highlights
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#145BFF] tabular-nums">
              {stats.featured}
            </p>
            <p className="mt-1 text-[11.5px] font-medium text-[#64748B]">
              Shown first on public grid
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Create CTA */}
      <GalleryFiltersBar
        query={query}
        categories={combinedCategories}
        searching={searching}
        onUpdateQuery={updateQuery}
        onFlushSearch={flushSearch}
        onResetFilters={resetFilters}
        onCreateNew={() => {
          setEditingItem(null);
          setFormOpen(true);
        }}
      />

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
            onClick={() => void reload()}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#0B1736]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      <GalleryTableAndCards
        items={items}
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
        onPreview={(item) => setPreviewItem(item)}
        onEdit={(item) => {
          setEditingItem(item);
          setFormOpen(true);
        }}
        onToggleFeatured={(item) => void handleToggleFeatured(item)}
        onDelete={(item) => setDeleteTarget(item)}
        onCreateNew={() => {
          setEditingItem(null);
          setFormOpen(true);
        }}
      />

      <GalleryFormModal
        open={formOpen}
        editingItem={editingItem}
        existingCodes={existingCodes}
        availableCategories={combinedCategories}
        defaultDisplayOrder={nextDisplayOrder}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmitForm}
        onPreviewDraft={handlePreviewDraft}
      />

      <GalleryPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onEdit={(item) => {
          setEditingItem(item);
          setFormOpen(true);
        }}
        onToggleStatus={(item) => void handleToggleStatus(item)}
        onToggleFeatured={(item) => void handleToggleFeatured(item)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete gallery photo permanently?"
        description={
          deleteTarget
            ? `Are you sure you want to permanently remove "${deleteTarget.title}" (${deleteTarget.galleryCode}) from the database and project uploads folder?`
            : ''
        }
        confirmLabel={deleting ? 'Deleting…' : 'Delete Permanently'}
        destructive
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
