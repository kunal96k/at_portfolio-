import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { ToastItem } from '../../types/admin';
import { slugifyText } from '../../utils/adminLogic';
import { BlogFilesModal } from '../components/BlogFilesModal';
import { BlogFiltersBar } from '../components/BlogFiltersBar';
import { BlogPreviewModal } from '../components/BlogPreviewModal';
import { BlogTableAndCards } from '../components/BlogTableAndCards';
import { BlogFormModal } from '../forms/BlogFormModal';
import { useBlogs } from '../hooks/useBlogs';
import type {
  BlogArticle,
  BlogFormPayload,
  BlogSortField,
} from '../types/blog';

interface BlogsPageProps {
  onToast: (toast: Omit<ToastItem, 'id'>) => void;
  onCountChange?: (totalCount: number, publishedCount: number) => void;
  onBlogsChange?: (blogs: BlogArticle[]) => void;
  domainSuggestions?: string[];
}

export function BlogsPage({
  onToast,
  onCountChange,
  onBlogsChange,
  domainSuggestions = [],
}: BlogsPageProps) {
  const {
    blogs,
    paginated,
    stats,
    availableCategories,
    query,
    loading,
    searching,
    error,
    submitting,
    existingSlugs,
    existingCodes,
    nextDisplayOrder,
    updateQuery,
    flushSearch,
    resetFilters,
    reload,
    createBlog,
    updateBlog,
    toggleStatus,
    toggleFeatured,
    deleteBlog,
  } = useBlogs(onBlogsChange, onCountChange);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogArticle | null>(null);
  const [previewBlog, setPreviewBlog] = useState<BlogArticle | null>(null);
  const [filesModalOpen, setFilesModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogArticle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const combinedCategories = Array.from(
    new Map(
      [...availableCategories, ...domainSuggestions]
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => [c.toLowerCase(), c])
    ).values()
  ).sort((a, b) => a.localeCompare(b));

  const handleSort = (field: BlogSortField) => {
    if (query.sortBy === field) {
      updateQuery({ sortDir: query.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      updateQuery({
        sortBy: field,
        sortDir: field === 'displayOrder' ? 'asc' : 'desc',
      });
    }
  };

  const handleSubmitForm = async (values: BlogFormPayload) => {
    try {
      if (editingBlog) {
        const updated = await updateBlog(editingBlog.id, values);
        onToast({
          tone: 'success',
          title:
            updated.status === 'Scheduled'
              ? 'Blog article scheduled'
              : 'Blog article updated',
          description:
            updated.status === 'Scheduled' && updated.scheduledAt
              ? `"${updated.title}" will auto-publish at ${updated.scheduledAt.replace('T', ' ').slice(0, 16)}.`
              : `"${updated.title}" saved as ${updated.status}.`,
        });
      } else {
        const created = await createBlog(values);
        onToast({
          tone: 'success',
          title:
            created.status === 'Published'
              ? 'Blog article published live'
              : created.status === 'Scheduled'
                ? 'Blog article scheduled for auto-publish'
                : 'Blog draft saved to database',
          description:
            created.status === 'Scheduled' && created.scheduledAt
              ? `"${created.title}" queued for ${created.scheduledAt.replace('T', ' ').slice(0, 16)} (${created.blogCode}).`
              : `"${created.title}" added (${created.blogCode}).`,
        });
      }
      setFormOpen(false);
      setEditingBlog(null);
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Could not save blog article',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteBlog(deleteTarget.id);
      onToast({
        tone: 'success',
        title: 'Blog article permanently deleted',
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
            : 'Unable to delete this blog article right now.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (blog: BlogArticle) => {
    try {
      const updated = await toggleStatus(blog);
      if (previewBlog?.id === updated.id) {
        setPreviewBlog(updated);
      }
      onToast({
        tone: 'success',
        title:
          updated.status === 'Published'
            ? 'Article published on website'
            : 'Article moved to Draft',
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

  const handleToggleFeatured = async (blog: BlogArticle) => {
    try {
      const updated = await toggleFeatured(blog);
      if (previewBlog?.id === updated.id) {
        setPreviewBlog(updated);
      }
      onToast({
        tone: 'success',
        title: updated.featured
          ? 'Marked as Most Viewed'
          : 'Removed Most Viewed highlight',
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

  const handlePreviewDraft = (draft: BlogFormPayload) => {
    const now = new Date().toISOString();
    setPreviewBlog({
      id: editingBlog?.id ?? 'preview-draft',
      blogCode: draft.blogCode.trim() || 'BLOG-NEW',
      title: draft.title.trim() || 'Untitled Blog Article Draft',
      slug: slugifyText(draft.slug || draft.title || 'untitled-blog-article'),
      category: draft.category.trim() || 'IT Infrastructure',
      author: draft.author.trim() || 'Arvind Thevar',
      readTime: draft.readTime.trim() || '5 min read',
      guideLabel: draft.guideLabel.trim() || 'Infrastructure Guide',
      excerpt: draft.excerpt.trim() || 'No summary entered yet.',
      sections: draft.sections.filter(
        (s) => s.heading.trim() || s.body.trim() || (s.images?.length ?? 0) > 0
      ),
      tags: draft.tags,
      coverImage: draft.coverImage,
      coverImageName: draft.coverImageName,
      attachments: draft.attachments,
      attachmentCount: draft.attachments.length,
      featured: Boolean(draft.featured),
      viewsCount: editingBlog?.viewsCount ?? 0,
      displayOrder: draft.displayOrder || 1,
      status: draft.status,
      scheduledAt: draft.scheduledAt ?? null,
      createdAt: editingBlog?.createdAt ?? now,
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
              Total Blog Articles
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#145BFF]">
              <BookOpen className="h-4.5 w-4.5" aria-hidden="true" />
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
              Published Articles
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
              Live on public Blogs page
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Drafts &amp; Scheduled
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
              <Clock className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-amber-600 tabular-nums">
              {stats.drafts + stats.scheduled}
            </p>
            <p className="mt-1 text-[11.5px] font-medium text-[#64748B] tabular-nums">
              {stats.scheduled} scheduled · {stats.drafts} drafts
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#145BFF]/40">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Featured &amp; Views
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-bold text-[#145BFF] tabular-nums">
                {stats.featured}
              </p>
              <p className="mt-1 text-[11.5px] font-medium text-[#64748B] tabular-nums">
                {stats.totalViews} total views
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFilesModalOpen(true)}
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#EFF6FF] px-2.5 text-xs font-semibold text-[#145BFF] transition-colors hover:bg-[#DBEAFE]"
            >
              <span>Files ({stats.totalDocuments})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search, Filters, Attachments & Create CTA */}
      <BlogFiltersBar
        query={query}
        categories={combinedCategories}
        searching={searching}
        onUpdateQuery={updateQuery}
        onFlushSearch={flushSearch}
        onResetFilters={resetFilters}
        totalFiles={stats.totalDocuments}
        onViewFiles={() => setFilesModalOpen(true)}
        onCreateNew={() => {
          setEditingBlog(null);
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
            Retry
          </button>
        </div>
      )}

      {/* Adaptive Table / Mobile Stacked Cards */}
      <BlogTableAndCards
        blogs={paginated.items}
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
        onPreview={(blog) => setPreviewBlog(blog)}
        onEdit={(blog) => {
          setEditingBlog(blog);
          setFormOpen(true);
        }}
        onToggleFeatured={(blog) => void handleToggleFeatured(blog)}
        onDelete={(blog) => setDeleteTarget(blog)}
        onCreateNew={() => {
          setEditingBlog(null);
          setFormOpen(true);
        }}
      />

      {/* Full-Screen Create / Edit Blog Modal */}
      <BlogFormModal
        open={formOpen}
        editingBlog={editingBlog}
        existingSlugs={existingSlugs}
        existingCodes={existingCodes}
        defaultDisplayOrder={nextDisplayOrder}
        domainSuggestions={domainSuggestions}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false);
          setEditingBlog(null);
        }}
        onSubmit={handleSubmitForm}
        onPreviewDraft={handlePreviewDraft}
      />

      {/* Full-Screen Reader Preview Modal */}
      <BlogPreviewModal
        blog={previewBlog}
        onClose={() => setPreviewBlog(null)}
        onEdit={(blog) => {
          setEditingBlog(blog);
          setFormOpen(true);
        }}
        onToggleStatus={(blog) => void handleToggleStatus(blog)}
        onToggleFeatured={(blog) => void handleToggleFeatured(blog)}
      />

      {/* Companion Files Modal */}
      <BlogFilesModal
        open={filesModalOpen}
        blogs={blogs}
        onClose={() => setFilesModalOpen(false)}
        onPreviewBlog={(blog) => setPreviewBlog(blog)}
      />

      {/* Hard Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Blog Article?"
        description={
          deleteTarget
            ? `Are you sure you want to permanently remove "${deleteTarget.title}" (${deleteTarget.blogCode})? This permanently deletes the database record and any uploaded images/files.`
            : ''
        }
        confirmLabel="Delete Permanently"
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
