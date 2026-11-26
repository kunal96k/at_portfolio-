import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { parseCourseModules } from '../../../src/services/coursesService';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { ToastItem } from '../../types/admin';
import { slugifyText } from '../../utils/adminLogic';
import { CourseFilesModal } from '../components/CourseFilesModal';
import { CourseFiltersBar } from '../components/CourseFiltersBar';
import { CoursePreviewModal } from '../components/CoursePreviewModal';
import { CourseTableAndCards } from '../components/CourseTableAndCards';
import { CourseFormModal } from '../forms/CourseFormModal';
import { useCourses } from '../hooks/useCourses';
import type {
  CourseDomain,
  CourseDomainFormPayload,
  CourseSortField,
} from '../types/course';

interface CoursesPageProps {
  onToast: (toast: Omit<ToastItem, 'id'>) => void;
  onCountChange?: (count: number) => void;
  onCoursesChange?: (courses: CourseDomain[]) => void;
}

export function CoursesPage({
  onToast,
  onCountChange,
  onCoursesChange,
}: CoursesPageProps) {
  const {
    courses,
    paginated,
    stats,
    categories,
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
    createCourse,
    updateCourse,
    toggleStatus,
    deleteCourse,
  } = useCourses(onCoursesChange);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseDomain | null>(null);
  const [previewCourse, setPreviewCourse] = useState<CourseDomain | null>(null);
  const [filesModalOpen, setFilesModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CourseDomain | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSort = (field: CourseSortField) => {
    if (query.sortBy === field) {
      updateQuery({ sortDir: query.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      updateQuery({
        sortBy: field,
        sortDir: field === 'displayOrder' ? 'asc' : 'desc',
      });
    }
  };

  const handleSubmitForm = async (values: CourseDomainFormPayload) => {
    try {
      if (editingCourse) {
        const updated = await updateCourse(editingCourse.id, values);
        onToast({
          tone: 'success',
          title: 'Course / Domain updated',
          description: `"${updated.title}" saved as ${updated.status}.`,
        });
      } else {
        const created = await createCourse(values);
        onCountChange?.(stats.total + 1);
        onToast({
          tone: 'success',
          title:
            created.status === 'Published'
              ? 'Course / Domain published live'
              : 'Draft saved to database',
          description: `"${created.title}" added (${created.domainCode}).`,
        });
      }
      setFormOpen(false);
      setEditingCourse(null);
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Could not save Course / Domain',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteCourse(deleteTarget.id);
      onCountChange?.(Math.max(0, stats.total - 1));
      onToast({
        tone: 'success',
        title: 'Course / Domain deleted',
        description: `"${deleteTarget.title}" removed.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Delete failed',
        description:
          err instanceof Error
            ? err.message
            : 'Unable to delete this course / domain right now.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (course: CourseDomain) => {
    try {
      const updated = await toggleStatus(course);
      if (previewCourse?.id === updated.id) {
        setPreviewCourse(updated);
      }
      onToast({
        tone: 'success',
        title:
          updated.status === 'Published'
            ? 'Domain published on website'
            : 'Domain moved to Draft',
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

  const handlePreviewDraft = (draft: CourseDomainFormPayload) => {
    const now = new Date().toISOString();
    setPreviewCourse({
      id: editingCourse?.id ?? 'preview-draft',
      domainCode: draft.domainCode.trim() || 'DOM-NEW',
      title: draft.title.trim() || 'Untitled Domain Draft',
      slug: slugifyText(draft.slug || draft.title || 'untitled-domain'),
      category: draft.category.trim() || 'Uncategorized',
      shortDescription:
        draft.shortDescription.trim() || 'No description entered yet.',
      detailedSyllabus: draft.detailedSyllabus.trim(),
      modules: parseCourseModules(draft.detailedSyllabus),
      coverImage: draft.coverImage,
      coverImageName: draft.coverImageName,
      tags: draft.tags,
      attachments: draft.attachments,
      displayOrder: draft.displayOrder || 1,
      status: draft.status,
      createdAt: editingCourse?.createdAt ?? now,
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
              Total Course / Domains
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#145BFF]">
              <GraduationCap className="h-4.5 w-4.5" aria-hidden="true" />
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
              Published Domains
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
              Live on public website
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Draft Domains
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
              Hidden from public website
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#145BFF]/40">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Syllabus Documents
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
                Course guides &amp; PDFs
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

      {/* Filters, Search, Documents & New Course / Domain Bar */}
      <CourseFiltersBar
        query={query}
        categories={categories}
        searching={searching}
        onUpdateQuery={updateQuery}
        onFlushSearch={flushSearch}
        onResetFilters={resetFilters}
        totalFiles={stats.resources}
        onViewFiles={() => setFilesModalOpen(true)}
        onCreateNew={() => {
          setEditingCourse(null);
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

      {/* Adaptive Table / Mobile Stacked Cards with Kebab Three-Dots Menu */}
      <CourseTableAndCards
        courses={paginated.items}
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
        onPreview={(course) => setPreviewCourse(course)}
        onEdit={(course) => {
          setEditingCourse(course);
          setFormOpen(true);
        }}
        onDelete={(course) => setDeleteTarget(course)}
        onCreateNew={() => {
          setEditingCourse(null);
          setFormOpen(true);
        }}
      />

      {/* Full-Screen Create / Edit Course / Domain Modal */}
      <CourseFormModal
        open={formOpen}
        editingCourse={editingCourse}
        existingSlugs={existingSlugs}
        existingCodes={existingCodes}
        defaultDisplayOrder={nextDisplayOrder}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false);
          setEditingCourse(null);
        }}
        onSubmit={handleSubmitForm}
        onPreviewDraft={handlePreviewDraft}
      />

      {/* Full-Screen Preview Modal */}
      <CoursePreviewModal
        course={previewCourse}
        onClose={() => setPreviewCourse(null)}
        onEdit={(course) => {
          setEditingCourse(course);
          setFormOpen(true);
        }}
        onToggleStatus={(course) => void handleToggleStatus(course)}
      />

      {/* View All Course / Domain Documents Modal */}
      <CourseFilesModal
        open={filesModalOpen}
        courses={courses}
        onClose={() => setFilesModalOpen(false)}
        onPreviewCourse={(course) => setPreviewCourse(course)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Course / Domain?"
        description={
          deleteTarget
            ? `Are you sure you want to remove "${deleteTarget.title}" (${deleteTarget.domainCode})? Website domain sections and Batch tracks will update accordingly.`
            : ''
        }
        confirmLabel="Delete Domain"
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
