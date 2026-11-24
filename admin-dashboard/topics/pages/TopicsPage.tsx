import { AlertCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { ToastItem } from '../../types/admin';
import { slugifyText } from '../../utils/adminLogic';
import { TopicFiltersBar } from '../components/TopicFiltersBar';
import { TopicPreviewModal } from '../components/TopicPreviewModal';
import { TopicTableAndCards } from '../components/TopicTableAndCards';
import { TopicFormModal } from '../forms/TopicFormModal';
import { useTopics } from '../hooks/useTopics';
import type { Topic, TopicFormValues, TopicSortField } from '../types/topic';

interface TopicsPageProps {
  onToast: (toast: Omit<ToastItem, 'id'>) => void;
  onCountChange?: (count: number) => void;
}

export function TopicsPage({ onToast, onCountChange }: TopicsPageProps) {
  const {
    paginated,
    stats,
    query,
    loading,
    error,
    submitting,
    existingSlugs,
    nextDisplayOrder,
    updateQuery,
    resetFilters,
    reload,
    createTopic,
    updateTopic,
    toggleFeatured,
    toggleStatus,
    deleteTopic,
  } = useTopics();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSort = (field: TopicSortField) => {
    if (query.sortBy === field) {
      updateQuery({ sortDir: query.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      updateQuery({ sortBy: field, sortDir: field === 'displayOrder' ? 'asc' : 'desc' });
    }
  };

  const handleSubmitForm = async (values: TopicFormValues) => {
    try {
      if (editingTopic) {
        const updated = await updateTopic(editingTopic.id, values);
        onToast({
          tone: 'success',
          title: 'Topic updated',
          description: `"${updated.title}" saved as ${updated.status}.`,
        });
      } else {
        const created = await createTopic(values);
        onCountChange?.(stats.total + 1);
        onToast({
          tone: 'success',
          title: created.status === 'Published' ? 'Topic published' : 'Draft created',
          description: `"${created.title}" added to Topics.`,
        });
      }
      setFormOpen(false);
      setEditingTopic(null);
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Could not save topic',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteTopic(deleteTarget.id);
      onCountChange?.(Math.max(0, stats.total - 1));
      onToast({
        tone: 'success',
        title: 'Topic deleted',
        description: `"${deleteTarget.title}" was removed.`,
      });
      setDeleteTarget(null);
    } catch {
      onToast({
        tone: 'error',
        title: 'Delete failed',
        description: 'Unable to delete this topic right now.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFeatured = async (topic: Topic) => {
    const updated = await toggleFeatured(topic);
    onToast({
      tone: 'info',
      title: updated.featured ? 'Marked as featured' : 'Removed from featured',
      description: updated.title,
    });
  };

  const handleToggleStatus = async (topic: Topic) => {
    const updated = await toggleStatus(topic);
    if (previewTopic?.id === updated.id) {
      setPreviewTopic(updated);
    }
    onToast({
      tone: 'success',
      title: `Topic moved to ${updated.status}`,
      description: updated.title,
    });
  };

  const handlePreviewDraft = (draft: TopicFormValues) => {
    const now = new Date().toISOString();
    setPreviewTopic({
      id: editingTopic?.id ?? 'preview-draft',
      title: draft.title.trim() || 'Untitled Topic Draft',
      slug: slugifyText(draft.slug || draft.title || 'untitled-topic'),
      shortDescription:
        draft.shortDescription.trim() || 'No short description entered yet.',
      detailedContent:
        draft.detailedContent.trim() || 'No detailed content entered yet.',
      relatedCourse: draft.relatedCourse,
      subject: draft.subject.trim() || 'General Track',
      coverImage: draft.coverImage,
      coverImageName: draft.coverImageName,
      tags: draft.tags,
      learningLevel: draft.learningLevel,
      attachments: draft.attachments,
      displayOrder: draft.displayOrder || 1,
      featured: draft.featured,
      status: draft.status,
      createdAt: editingTopic?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <div className="space-y-5">
      {/* Compact Stats Strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs font-medium text-[#64748B]">Total Topics</p>
          <p className="mt-1 text-2xl font-bold text-[#0B1736] tabular-nums">
            {stats.total}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs font-medium text-[#64748B]">Published</p>
          <p className="mt-1 text-2xl font-bold text-[#027A48] tabular-nums">
            {stats.published}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs font-medium text-[#64748B]">Drafts</p>
          <p className="mt-1 text-2xl font-bold text-[#475569] tabular-nums">
            {stats.drafts}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs font-medium text-[#64748B]">Featured · Files</p>
          <p className="mt-1 text-2xl font-bold text-[#145BFF] tabular-nums">
            {stats.featured}{' '}
            <span className="text-sm font-semibold text-[#64748B]">
              · {stats.resources} files
            </span>
          </p>
        </div>
      </div>

      {/* Filters & Primary CTA */}
      <TopicFiltersBar
        query={query}
        onUpdateQuery={updateQuery}
        onResetFilters={resetFilters}
        onCreateNew={() => {
          setEditingTopic(null);
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
            onClick={() => void reload()}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-white px-3.5 text-xs font-semibold text-[#0B1736] border border-[#E2E8F0]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Adaptive Table / Mobile Stacked Cards */}
      <TopicTableAndCards
        topics={paginated.items}
        loading={loading}
        sortBy={query.sortBy}
        sortDir={query.sortDir}
        onSort={handleSort}
        currentPage={paginated.currentPage}
        totalPages={paginated.totalPages}
        totalItems={paginated.totalItems}
        startIndex={paginated.startIndex}
        endIndex={paginated.endIndex}
        onPageChange={(page) => updateQuery({ page })}
        onPreview={(topic) => setPreviewTopic(topic)}
        onEdit={(topic) => {
          setEditingTopic(topic);
          setFormOpen(true);
        }}
        onToggleFeatured={(topic) => void handleToggleFeatured(topic)}
        onToggleStatus={(topic) => void handleToggleStatus(topic)}
        onDelete={(topic) => setDeleteTarget(topic)}
        onCreateNew={() => {
          setEditingTopic(null);
          setFormOpen(true);
        }}
      />

      {/* Create / Edit Topic Form Modal */}
      <TopicFormModal
        open={formOpen}
        editingTopic={editingTopic}
        existingSlugs={existingSlugs}
        defaultDisplayOrder={nextDisplayOrder}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false);
          setEditingTopic(null);
        }}
        onSubmit={handleSubmitForm}
        onPreviewDraft={handlePreviewDraft}
      />

      {/* Preview Topic Modal */}
      <TopicPreviewModal
        topic={previewTopic}
        onClose={() => setPreviewTopic(null)}
        onEdit={(topic) => {
          setEditingTopic(topic);
          setFormOpen(true);
        }}
        onToggleStatus={(topic) => void handleToggleStatus(topic)}
      />

      {/* Destructive Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete topic?"
        description={
          deleteTarget
            ? `Are you sure you want to permanently remove "${deleteTarget.title}" from the mock workspace?`
            : ''
        }
        confirmLabel="Delete Topic"
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
