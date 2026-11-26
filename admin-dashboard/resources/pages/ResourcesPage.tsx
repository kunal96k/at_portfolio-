import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { ProtectedResourcePreviewModal } from '../../../src/components/ProtectedResourcePreviewModal';
import {
  downloadResourceSafely,
  parseTopicLines,
  type StudyResourceFilePatchPayload,
} from '../../../src/services/resourcesService';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { ToastItem } from '../../types/admin';
import { slugifyText } from '../../utils/adminLogic';
import { ResourceFileUploadModal } from '../components/ResourceFileUploadModal';
import { ResourceFiltersBar } from '../components/ResourceFiltersBar';
import { ResourcePreviewModal } from '../components/ResourcePreviewModal';
import { ResourceTableAndCards } from '../components/ResourceTableAndCards';
import { ResourceFormModal } from '../forms/ResourceFormModal';
import { useResources } from '../hooks/useResources';
import type {
  ResourceSortField,
  StudyResourceFormPayload,
  StudyResourceNote,
} from '../types/resource';

interface ResourcesPageProps {
  onToast: (toast: Omit<ToastItem, 'id'>) => void;
  onCountChange?: (totalCount: number, publishedCount: number) => void;
  domainSuggestions?: string[];
}

export function ResourcesPage({
  onToast,
  onCountChange,
  domainSuggestions = [],
}: ResourcesPageProps) {
  const {
    items,
    stats,
    availableDomains,
    availableFileTypes,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
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
    createResource,
    updateResource,
    toggleStatus,
    toggleDownloadAccess,
    updateFileAttachment,
    deleteResource,
  } = useResources(onCountChange);

  const [formOpen, setFormOpen] = useState(false);
  const [editingResource, setEditingResource] =
    useState<StudyResourceNote | null>(null);
  const [fileModalResource, setFileModalResource] =
    useState<StudyResourceNote | null>(null);
  const [previewResource, setPreviewResource] =
    useState<StudyResourceNote | null>(null);
  const [protectedPreviewNote, setProtectedPreviewNote] =
    useState<StudyResourceNote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudyResourceNote | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const handleSort = (field: ResourceSortField) => {
    if (query.sortBy === field) {
      updateQuery({ sortDir: query.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      updateQuery({
        sortBy: field,
        sortDir: field === 'displayOrder' ? 'asc' : 'desc',
      });
    }
  };

  const handleSubmitForm = async (values: StudyResourceFormPayload) => {
    try {
      if (editingResource) {
        const updated = await updateResource(editingResource.id, values);
        onToast({
          tone: 'success',
          title: 'Resource / Note updated',
          description: `"${updated.title}" saved as ${updated.status}.`,
        });
      } else {
        const created = await createResource(values);
        onToast({
          tone: 'success',
          title:
            created.status === 'Published'
              ? 'Study note published live'
              : 'Draft saved to database',
          description: `"${created.title}" added (${created.noteCode}).`,
        });
      }
      setFormOpen(false);
      setEditingResource(null);
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Could not save Resource / Note',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteResource(deleteTarget.id);
      onToast({
        tone: 'success',
        title: 'Resource / Note deleted',
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
            : 'Unable to delete this study note right now.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (note: StudyResourceNote) => {
    try {
      const updated = await toggleStatus(note);
      if (previewResource?.id === updated.id) {
        setPreviewResource(updated);
      }
      if (protectedPreviewNote?.id === updated.id) {
        setProtectedPreviewNote(updated);
      }
      onToast({
        tone: 'success',
        title:
          updated.status === 'Published'
            ? 'Study note published on website'
            : 'Study note moved to Draft',
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

  const handleToggleDownloadAccess = async (note: StudyResourceNote) => {
    try {
      const updated = await toggleDownloadAccess(note);
      if (previewResource?.id === updated.id) {
        setPreviewResource(updated);
      }
      if (protectedPreviewNote?.id === updated.id) {
        setProtectedPreviewNote(updated);
      }
      onToast({
        tone: updated.downloadEnabled ? 'success' : 'info',
        title: updated.downloadEnabled
          ? 'Public download enabled'
          : 'Locked in Preview-Only mode',
        description: updated.downloadEnabled
          ? `Visitors can now download "${updated.title}".`
          : `"${updated.title}" now shows "Contact to Download" on the website.`,
      });
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Download setting update failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleDownloadNote = async (note: StudyResourceNote) => {
    const hasAttachedFile = Boolean(
      note.hasFile ||
        note.hasUploadedFile ||
        String(note.fileUrl ?? '').trim() !== ''
    );
    if (!hasAttachedFile) {
      onToast({
        tone: 'info',
        title: 'No study file attached',
        description: `Upload a file to "${note.noteCode}" first using Upload File.`,
      });
      return;
    }

    try {
      const res = await downloadResourceSafely(note, { isAdmin: true });
      if (res.blocked) {
        onToast({
          tone: 'info',
          title: 'Unable to download file',
          description: res.message,
        });
      } else {
        const nextCount =
          typeof res.updatedDownloads === 'number'
            ? res.updatedDownloads
            : note.downloads + 1;
        setPreviewResource((prev) =>
          prev && prev.id === note.id ? { ...prev, downloads: nextCount } : prev
        );
        setProtectedPreviewNote((prev) =>
          prev && prev.id === note.id ? { ...prev, downloads: nextCount } : prev
        );
        setFileModalResource((prev) =>
          prev && prev.id === note.id ? { ...prev, downloads: nextCount } : prev
        );
        reload();
      }
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Download failed',
        description: err instanceof Error ? err.message : 'Unable to download file.',
      });
    }
  };

  const handleSaveFileAttachment = async (
    id: string,
    payload: StudyResourceFilePatchPayload
  ) => {
    try {
      const updated = await updateFileAttachment(id, payload);
      setPreviewResource((prev) => (prev && prev.id === updated.id ? updated : prev));
      setProtectedPreviewNote((prev) =>
        prev && prev.id === updated.id ? updated : prev
      );
      setEditingResource((prev) =>
        prev && prev.id === updated.id ? updated : prev
      );
      setFileModalResource(null);
      onToast({
        tone: 'success',
        title: updated.hasFile ? 'Study file updated' : 'Study file removed',
        description: updated.hasFile
          ? `"${updated.fileName || 'File'}" saved on ${updated.noteCode}.`
          : `"${updated.noteCode}" is now summary-only with no file attached.`,
      });
    } catch (err) {
      onToast({
        tone: 'error',
        title: 'Could not update study file',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handlePreviewDraft = (draft: StudyResourceFormPayload) => {
    const now = new Date().toISOString();
    const draftHasFile = Boolean(
      !draft.removeFile &&
        (draft.fileData || String(draft.fileUrl ?? '').trim() !== '')
    );
    setPreviewResource({
      id: editingResource?.id ?? 'preview-draft',
      noteCode: draft.noteCode.trim() || 'NOTE-NEW',
      title: draft.title.trim() || 'Untitled Note Draft',
      slug: slugifyText(draft.slug || draft.title || 'untitled-note'),
      sectionType: draft.sectionType,
      domain: draft.domain.trim() || 'IT Infrastructure',
      summary: draft.summary.trim() || 'No summary entered yet.',
      topicsText: draft.topicsText.trim(),
      topics: parseTopicLines(draft.topicsText),
      fileName: draftHasFile ? draft.fileName.trim() : '',
      fileType: draft.fileType || 'PDF',
      mimeType: draftHasFile ? draft.mimeType || 'application/pdf' : '',
      fileSizeBytes: draftHasFile ? draft.fileSizeBytes || 0 : 0,
      fileSizeLabel: !draftHasFile
        ? 'No file attached'
        : draft.fileSizeBytes > 0
          ? `${Math.round(draft.fileSizeBytes / 1024)} KB`
          : 'Linked file',
      fileUrl: draftHasFile ? draft.fileUrl || draft.fileData || '' : '',
      hasFile: draftHasFile,
      hasUploadedFile: Boolean(!draft.removeFile && draft.fileData),
      downloadEnabled: Boolean(draft.downloadEnabled),
      previewMode: 'METADATA_ONLY',
      downloads: editingResource?.downloads ?? 0,
      displayOrder: draft.displayOrder || 1,
      status: draft.status,
      createdAt: editingResource?.createdAt ?? now,
      updatedAt: now,
    });
  };

  const combinedDomainSuggestions = Array.from(
    new Map(
      [...domainSuggestions, ...availableDomains]
        .map((d) => d.trim())
        .filter(Boolean)
        .map((d) => [d.toLowerCase(), d])
    ).values()
  );

  return (
    <div className="space-y-4">
      {/* Compact 4-Card KPI Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Total Notes &amp; Manuals
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#145BFF]">
              <FileText className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#0B1736] tabular-nums">
              {stats.total}
            </p>
            <p className="mt-1 text-[11.5px] font-medium text-[#64748B]">
              Synced with public Notes page
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Published Notes
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
              Live on website Notes page
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Draft Notes
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
              Hidden from public site
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors hover:border-[#CBD5E1]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#64748B]">
              Total Downloads
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <Download className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#145BFF] tabular-nums">
              {stats.totalDownloads}
            </p>
            <p className="mt-1 text-[11.5px] font-medium text-[#64748B] tabular-nums">
              {stats.downloadEnabledCount} open · {stats.previewOnlyCount} preview-only
            </p>
          </div>
        </div>
      </div>

      {/* Filters, Debounced/Throttled Search & New Note Bar */}
      <ResourceFiltersBar
        query={query}
        domains={combinedDomainSuggestions}
        fileTypes={availableFileTypes}
        searching={searching}
        onUpdateQuery={updateQuery}
        onFlushSearch={flushSearch}
        onResetFilters={resetFilters}
        onCreateNew={() => {
          setEditingResource(null);
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
            onClick={reload}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#0B1736]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Server-Side Paginated Table / Mobile Cards */}
      <ResourceTableAndCards
        resources={items}
        loading={loading}
        totalDatabaseRecords={stats.total}
        sortBy={query.sortBy}
        sortDir={query.sortDir}
        onSort={handleSort}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={(page) => updateQuery({ page })}
        onPreview={(note) => setPreviewResource(note)}
        onEdit={(note) => {
          setEditingResource(note);
          setFormOpen(true);
        }}
        onManageFile={(note) => setFileModalResource(note)}
        onToggleDownloadAccess={(note) => void handleToggleDownloadAccess(note)}
        onDownload={(note) => void handleDownloadNote(note)}
        onDelete={(note) => setDeleteTarget(note)}
        onCreateNew={() => {
          setEditingResource(null);
          setFormOpen(true);
        }}
      />

      <ResourceFormModal
        open={formOpen}
        editingResource={editingResource}
        existingSlugs={existingSlugs}
        existingCodes={existingCodes}
        defaultDisplayOrder={nextDisplayOrder}
        domainSuggestions={combinedDomainSuggestions}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false);
          setEditingResource(null);
        }}
        onSubmit={handleSubmitForm}
        onPreviewDraft={handlePreviewDraft}
      />

      <ResourcePreviewModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
        onEdit={(note) => {
          setEditingResource(note);
          setFormOpen(true);
        }}
        onManageFile={(note) => setFileModalResource(note)}
        onToggleStatus={(note) => void handleToggleStatus(note)}
        onToggleDownloadAccess={(note) => void handleToggleDownloadAccess(note)}
        onInspectProtectedPreview={(note) => setProtectedPreviewNote(note)}
        onDownload={(note) => void handleDownloadNote(note)}
      />

      <ResourceFileUploadModal
        resource={fileModalResource}
        submitting={submitting}
        onClose={() => setFileModalResource(null)}
        onSave={handleSaveFileAttachment}
        onDownload={(note) => void handleDownloadNote(note)}
      />

      <ProtectedResourcePreviewModal
        resource={protectedPreviewNote}
        isPublic={false}
        onClose={() => setProtectedPreviewNote(null)}
        onDownload={(note) => void handleDownloadNote(note)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Study Note?"
        description={
          deleteTarget
            ? `Are you sure you want to remove "${deleteTarget.title}" (${deleteTarget.noteCode})?`
            : ''
        }
        confirmLabel="Delete Note"
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
