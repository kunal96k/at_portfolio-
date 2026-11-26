import {
  BookOpen,
  Download,
  Edit2,
  Eye,
  FileText,
  Lock,
  Terminal,
  Trash2,
  Unlock,
  Upload,
} from 'lucide-react';
import {
  ResponsiveDataView,
  type CardField,
  type RowAction,
  type TableColumn,
} from '../../components/ResponsiveDataView';
import { StatusBadge } from '../../components/StatusBadge';
import { formatShortDate } from '../../utils/adminLogic';
import type {
  ResourceSortField,
  StudyResourceNote,
} from '../types/resource';

interface ResourceTableAndCardsProps {
  resources: StudyResourceNote[];
  loading: boolean;
  totalDatabaseRecords: number;
  sortBy: ResourceSortField;
  sortDir: 'asc' | 'desc';
  onSort: (field: ResourceSortField) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPreview: (note: StudyResourceNote) => void;
  onEdit: (note: StudyResourceNote) => void;
  onManageFile: (note: StudyResourceNote) => void;
  onToggleDownloadAccess: (note: StudyResourceNote) => void;
  onDownload: (note: StudyResourceNote) => void;
  onDelete: (note: StudyResourceNote) => void;
  onCreateNew: () => void;
}

export function ResourceTableAndCards({
  resources,
  loading,
  totalDatabaseRecords,
  sortBy,
  sortDir,
  onSort,
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPreview,
  onEdit,
  onManageFile,
  onToggleDownloadAccess,
  onDownload,
  onDelete,
  onCreateNew,
}: ResourceTableAndCardsProps) {
  const columns: TableColumn<StudyResourceNote>[] = [
    {
      key: 'displayOrder',
      header: 'Order',
      sortable: true,
      render: (note) => (
        <span className="font-mono text-xs font-semibold text-[#475569] tabular-nums">
          #{String(note.displayOrder).padStart(2, '0')}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Resource / Note',
      sortable: true,
      render: (note) => {
        const isLab = note.sectionType === 'Lab Sections';
        return (
          <div className="flex max-w-[250px] items-center gap-3 overflow-hidden xl:max-w-[300px]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#145BFF]">
              {isLab ? (
                <Terminal className="h-5 w-5" aria-hidden="true" />
              ) : (
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <button
                type="button"
                onClick={() => onPreview(note)}
                title={note.title}
                className="block w-full truncate text-left font-semibold text-[#0B1736] hover:text-[#145BFF]"
              >
                {note.title}
              </button>
              <p
                title={`${note.noteCode} · ${note.sectionType} · ${note.domain}`}
                className="truncate text-[11.5px] text-[#64748B]"
              >
                <span className="font-mono">{note.noteCode}</span> ·{' '}
                {note.sectionType} · {note.domain}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'file',
      header: 'Study File',
      render: (note) => {
        const hasAttachedFile = Boolean(
          note.hasFile ||
            note.hasUploadedFile ||
            String(note.fileUrl ?? '').trim() !== ''
        );
        if (!hasAttachedFile) {
          return (
            <div className="min-w-0 max-w-[190px] overflow-hidden xl:max-w-[220px]">
              <p className="text-xs font-medium text-[#64748B]">
                No file attached
              </p>
              <button
                type="button"
                onClick={() => onManageFile(note)}
                className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#145BFF] hover:underline"
              >
                <Upload className="h-3 w-3 shrink-0" />
                <span>Upload file</span>
              </button>
            </div>
          );
        }
        return (
          <div className="min-w-0 max-w-[190px] overflow-hidden xl:max-w-[220px]">
            <p
              title={note.fileName || note.fileUrl}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1736]"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-[#145BFF]" />
              <span className="min-w-0 flex-1 truncate">
                {note.fileName || 'Attached File'}
              </span>
            </p>
            <p className="mt-0.5 truncate text-[11px] text-[#64748B] tabular-nums">
              {note.fileType} · {note.fileSizeLabel}
            </p>
          </div>
        );
      },
    },
    {
      key: 'downloadEnabled',
      header: 'Download Access',
      render: (note) => (
        <button
          type="button"
          onClick={() => onToggleDownloadAccess(note)}
          aria-pressed={note.downloadEnabled}
          title={
            note.downloadEnabled
              ? 'Click to lock as Preview-Only (disable public download)'
              : 'Click to enable public file download'
          }
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors whitespace-nowrap ${
            note.downloadEnabled
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          {note.downloadEnabled ? (
            <>
              <Unlock className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>Download On</span>
            </>
          ) : (
            <>
              <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>Preview Only</span>
            </>
          )}
        </button>
      ),
    },
    {
      key: 'downloads',
      header: 'Downloads',
      sortable: true,
      render: (note) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B1736] tabular-nums">
          <Download className="h-3.5 w-3.5 text-[#145BFF]" aria-hidden="true" />
          {note.downloads}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (note) => <StatusBadge status={note.status} />,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      align: 'right',
      render: (note) => (
        <div className="text-right text-xs tabular-nums">
          <p className="font-medium text-[#0B1736]">
            {formatShortDate(note.updatedAt)}
          </p>
          <p className="text-[11px] text-[#64748B]">
            {note.topics.length} topics
          </p>
        </div>
      ),
    },
  ];

  const cardPrimaryFields: CardField<StudyResourceNote>[] = [
    {
      label: 'Section & Domain',
      render: (note) => `${note.sectionType} · ${note.domain}`,
    },
    {
      label: 'Download Access',
      render: (note) => (
        <button
          type="button"
          onClick={() => onToggleDownloadAccess(note)}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
            note.downloadEnabled
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          {note.downloadEnabled ? 'Download On' : 'Preview Only'}
        </button>
      ),
    },
    {
      label: 'Downloads',
      render: (note) => `${note.downloads}`,
    },
    {
      label: 'Order & Code',
      render: (note) => `#${note.displayOrder} · ${note.noteCode}`,
    },
  ];

  const hasAttachedFile = (note: StudyResourceNote) =>
    Boolean(
      note.hasFile ||
        note.hasUploadedFile ||
        String(note.fileUrl ?? '').trim() !== ''
    );

  const cardExpandedFields: CardField<StudyResourceNote>[] = [
    {
      label: 'Study File',
      render: (note) =>
        hasAttachedFile(note)
          ? `${note.fileName || 'Attached file'} (${note.fileSizeLabel})`
          : 'No file attached',
    },
    {
      label: 'URL Slug',
      render: (note) => `/resources/${note.slug}`,
    },
    {
      label: 'Summary',
      render: (note) => note.summary,
    },
  ];

  const actions: RowAction<StudyResourceNote>[] = [
    {
      id: 'preview',
      label: 'Preview Note',
      icon: <Eye className="h-4 w-4 text-[#64748B]" />,
      onClick: onPreview,
    },
    {
      id: 'upload-file',
      label: (note) =>
        hasAttachedFile(note) ? 'Upload / Replace File' : 'Upload File',
      icon: <Upload className="h-4 w-4 text-[#145BFF]" />,
      onClick: onManageFile,
    },
    {
      id: 'toggle-download',
      label: (note) =>
        note.downloadEnabled
          ? 'Lock Public Download (Preview Only)'
          : 'Enable Public Download',
      icon: <Lock className="h-4 w-4 text-amber-600" />,
      onClick: onToggleDownloadAccess,
    },
    {
      id: 'edit',
      label: 'Edit Details',
      icon: <Edit2 className="h-4 w-4 text-[#64748B]" />,
      onClick: onEdit,
    },
    {
      id: 'download',
      label: 'Download File',
      icon: <Download className="h-4 w-4 text-[#145BFF]" />,
      hidden: (note) => !hasAttachedFile(note),
      onClick: onDownload,
    },
    {
      id: 'delete',
      label: 'Delete Note',
      destructive: true,
      icon: <Trash2 className="h-4 w-4 text-[#DC2626]" />,
      onClick: onDelete,
    },
  ];

  const noRecordsAtAll = totalDatabaseRecords === 0;

  return (
    <ResponsiveDataView
      items={resources}
      loading={loading}
      emptyTitle={
        noRecordsAtAll
          ? 'No study notes or resources in database'
          : 'No matching study notes found'
      }
      emptyDescription={
        noRecordsAtAll
          ? 'Create a study note or start the Spring Boot backend so StudyResourceInitializer populates default notes.'
          : 'Try adjusting your search query or filters.'
      }
      emptyActionLabel="New Note / Resource"
      onEmptyAction={onCreateNew}
      columns={columns}
      getCardTitle={(note) => note.title}
      getCardSubtitle={(note) => `${note.noteCode} · ${note.domain}`}
      getCardStatus={(note) => note.status}
      cardPrimaryFields={cardPrimaryFields}
      cardExpandedFields={cardExpandedFields}
      actions={actions}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={(key) => {
        if (
          key === 'displayOrder' ||
          key === 'title' ||
          key === 'downloads' ||
          key === 'updatedAt' ||
          key === 'createdAt'
        ) {
          onSort(key);
        }
      }}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      startIndex={startIndex}
      endIndex={endIndex}
      onPageChange={onPageChange}
    />
  );
}
