import {
  AlertCircle,
  CheckCircle2,
  FileEdit,
  MessageSquareQuote,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { ToastItem } from '../../types/admin';
import { TestimonialFiltersBar } from '../components/TestimonialFiltersBar';
import { TestimonialPreviewModal } from '../components/TestimonialPreviewModal';
import { TestimonialTableAndCards } from '../components/TestimonialTableAndCards';
import { TestimonialFormModal } from '../forms/TestimonialFormModal';
import { useTestimonials } from '../hooks/useTestimonials';
import type {
  StudentTestimonial,
  TestimonialFormPayload,
  TestimonialSortField,
} from '../types/testimonial';

interface TestimonialsPageProps {
  onToast: (toast: Omit<ToastItem, 'id'>) => void;
  domainSuggestions?: string[];
  onCountChange?: (totalCount: number, publishedCount: number) => void;
}

export function TestimonialsPage({
  onToast,
  domainSuggestions = [],
  onCountChange,
}: TestimonialsPageProps) {
  const {
    items,
    stats,
    availableCourseTracks,
    query,
    loading,
    searching,
    error,
    submitting,
    existingCodes,
    nextDisplayOrder,
    paginated,
    updateQuery,
    flushSearch,
    resetFilters,
    reload,
    createItem,
    updateItem,
    toggleStatus,
    toggleFeatured,
    deleteItem,
  } = useTestimonials(onCountChange);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentTestimonial | null>(
    null
  );
  const [previewItem, setPreviewItem] = useState<StudentTestimonial | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<StudentTestimonial | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const combinedTracks = Array.from(
    new Map(
      [...domainSuggestions, ...availableCourseTracks]
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => [t.toLowerCase(), t])
    ).values()
  ).sort((a, b) => a.localeCompare(b));

  const handleSort = (field: TestimonialSortField) => {
    if (query.sortBy === field) {
      updateQuery({ sortDir: query.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      updateQuery({
        sortBy: field,
        sortDir: field === 'displayOrder' || field === 'studentName' ? 'asc' : 'desc',
      });
    }
  };

  const handleSubmitForm = async (values: TestimonialFormPayload) => {
    try {
      if (editingItem) {
        const updated = await updateItem(editingItem.id, values);
        onToast({
          tone: 'success',
          title: 'Testimonial updated',
          description: `"${updated.studentName}" saved as ${updated.status}.`,
        });
      } else {
        const created = await createItem(values);
        onToast({
          tone: 'success',
          title:
            created.status === 'Published'
              ? 'Testimonial published live'
              : 'Testimonial draft saved',
          description: `"${created.studentName}" added (${created.testimonialCode}).`,
        });
      }
      setFormOpen(false);
      setEditingItem(null);
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Could not save testimonial',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleToggleStatus = async (item: StudentTestimonial) => {
    try {
      const updated = await toggleStatus(item);
      if (previewItem?.id === updated.id) {
        setPreviewItem(updated);
      }
      onToast({
        tone: 'success',
        title: `Moved to ${updated.status}`,
        description: `"${updated.studentName}" visibility updated.`,
      });
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Status update failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleToggleFeatured = async (item: StudentTestimonial) => {
    if (!item.featured && stats.featured >= 10) {
      onToast({
        tone: 'error',
        title: 'Homepage Featured Limit Reached (10/10)',
        description:
          'Maximum 10 testimonials can be featured on the Homepage. Remove one featured testimonial first.',
      });
      return;
    }
    try {
      const updated = await toggleFeatured(item);
      if (previewItem?.id === updated.id) {
        setPreviewItem(updated);
      }
      onToast({
        tone: 'info',
        title: updated.featured ? 'Featured on Homepage' : 'Removed from Featured',
        description: `"${updated.studentName}" homepage visibility updated.`,
      });
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Featured update failed',
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
        title: 'Testimonial permanently deleted',
        description: `"${deleteTarget.studentName}" removed from database.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const kpiCards = [
    {
      label: 'Total Stories',
      value: stats.total,
      icon: MessageSquareQuote,
      tone: 'text-[#145BFF] bg-[#EFF6FF]',
    },
    {
      label: 'Published Live',
      value: stats.published,
      icon: CheckCircle2,
      tone: 'text-[#027A48] bg-[#ECFDF3]',
    },
    {
      label: 'Drafts & Archived',
      value: stats.drafts + stats.archived,
      icon: FileEdit,
      tone: 'text-[#475569] bg-[#F1F5F9]',
    },
    {
      label: 'Featured on Home',
      value: stats.featured,
      icon: Sparkles,
      tone: 'text-[#A16207] bg-[#FEFCE8]',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0B1736] sm:text-2xl">
            Student Testimonials
          </h1>
          <p className="mt-0.5 text-xs text-[#64748B] sm:text-sm">
            Manage verified placed learner reviews, student portraits, and Homepage featured highlights.
          </p>
        </div>

        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="inline-flex h-[40px] items-center justify-center gap-1.5 self-start rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#0B1736] shadow-2xs transition-colors hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${searching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs"
            >
              <div>
                <p className="text-xs font-medium text-[#64748B]">{kpi.label}</p>
                <p className="mt-1 text-2xl font-bold text-[#0B1736] tabular-nums">
                  {kpi.value}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.tone}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Failed to load student testimonials</p>
            <p className="mt-0.5 text-xs text-[#B91C1C]">{error}</p>
          </div>
          <button
            type="button"
            onClick={reload}
            className="shrink-0 rounded-lg border border-[#FCA5A5] bg-white px-3 py-1.5 text-xs font-semibold text-[#991B1B]"
          >
            Retry
          </button>
        </div>
      )}

      <TestimonialFiltersBar
        query={query}
        courseTracks={combinedTracks}
        searching={searching}
        onUpdateQuery={updateQuery}
        onFlushSearch={flushSearch}
        onResetFilters={resetFilters}
        onCreateNew={() => {
          setEditingItem(null);
          setFormOpen(true);
        }}
      />

      <TestimonialTableAndCards
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

      <TestimonialFormModal
        open={formOpen}
        editingItem={editingItem}
        existingCodes={existingCodes}
        domainSuggestions={combinedTracks}
        defaultDisplayOrder={nextDisplayOrder}
        featuredCount={stats.featured}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmitForm}
        onPreviewDraft={(draft) => {
          const tempPreview: StudentTestimonial = {
            id: editingItem?.id ?? 'draft-preview',
            testimonialCode: draft.testimonialCode || 'TEST-NEW',
            studentName: draft.studentName || 'Student Name',
            role: draft.role || 'Placed Engineer',
            company: draft.company || '',
            courseTrack: draft.courseTrack || 'IT Training',
            quote: draft.quote || 'Preview testimonial quote.',
            avatarUrl: draft.avatarUrl,
            avatarName: draft.avatarName,
            featured: draft.featured,
            displayOrder: draft.displayOrder,
            status: draft.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setPreviewItem(tempPreview);
        }}
      />

      <TestimonialPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onEdit={(item) => {
          if (item.id === 'draft-preview') return;
          setEditingItem(item);
          setFormOpen(true);
        }}
        onToggleStatus={(item) => {
          if (item.id === 'draft-preview') return;
          void handleToggleStatus(item);
        }}
        onToggleFeatured={(item) => {
          if (item.id === 'draft-preview') return;
          void handleToggleFeatured(item);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this student testimonial?"
        description={
          deleteTarget
            ? `Permanently delete the review by "${deleteTarget.studentName}" (${deleteTarget.testimonialCode})?`
            : ''
        }
        confirmLabel={deleting ? 'Deleting…' : 'Delete Testimonial'}
        destructive
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
