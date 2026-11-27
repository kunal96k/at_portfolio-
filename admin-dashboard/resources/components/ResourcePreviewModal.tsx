import {
  BookOpen,
  Calendar,
  Download,
  Edit3,
  Eye,
  FileText,
  Hash,
  Layers,
  Lock,
  Unlock,
} from 'lucide-react';
import { MobileModalShell } from '../../components/MobileModalShell';
import { StatusBadge } from '../../components/StatusBadge';
import { formatShortDate } from '../../utils/adminLogic';
import type { StudyResourceNote } from '../types/resource';

interface ResourcePreviewModalProps {
  resource: StudyResourceNote | null;
  onClose: () => void;
  onEdit: (note: StudyResourceNote) => void;
  onManageFile?: (note: StudyResourceNote) => void;
  onToggleStatus: (note: StudyResourceNote) => void;
  onToggleDownloadAccess: (note: StudyResourceNote) => void;
  onInspectProtectedPreview: (note: StudyResourceNote) => void;
  onDownload: (note: StudyResourceNote) => void;
}

export function ResourcePreviewModal({
  resource,
  onClose,
  onEdit,
  onManageFile,
  onToggleStatus,
  onToggleDownloadAccess,
  onInspectProtectedPreview,
  onDownload,
}: ResourcePreviewModalProps) {
  if (!resource) return null;

  const hasAttachedFile = Boolean(
    resource.hasFile ||
      resource.hasUploadedFile ||
      String(resource.fileUrl ?? '').trim() !== ''
  );

  return (
    <MobileModalShell
      open={Boolean(resource)}
      fullScreen
      title={resource.title}
      subtitle={`${resource.noteCode} · ${resource.sectionType} · ${resource.domain}`}
      titleId="resource-preview-title"
      onClose={onClose}
      headerBadge={
        <>
          <StatusBadge status={resource.status} />
          <span className="rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#145BFF]">
            {resource.sectionType}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
              resource.downloadEnabled
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {resource.downloadEnabled ? (
              <>
                <Unlock className="h-3 w-3" />
                Download Enabled
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Preview Only
              </>
            )}
          </span>
        </>
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus(resource)}
              className="h-[40px] flex-1 rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#0F172A] shadow-xs transition-colors hover:bg-[#F8FAFC] sm:flex-none whitespace-nowrap"
            >
              {resource.status === 'Published'
                ? 'Move to Draft'
                : 'Publish to Notes Page'}
            </button>
            <button
              type="button"
              onClick={() => onToggleDownloadAccess(resource)}
              className={`inline-flex h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg border px-4 text-[13px] font-semibold shadow-xs transition-colors sm:flex-none whitespace-nowrap ${
                resource.downloadEnabled
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {resource.downloadEnabled ? (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Disable Download (Preview Only)</span>
                </>
              ) : (
                <>
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Enable Public Download</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={onClose}
              className="h-[40px] w-full min-w-0 rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#475569] shadow-xs transition-colors hover:bg-[#F8FAFC] sm:w-auto"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(resource);
              }}
              className="inline-flex h-[40px] w-full min-w-0 items-center justify-center gap-1.5 rounded-lg bg-[#145BFF] px-5 text-[13px] font-semibold text-white shadow-xs transition-colors hover:bg-[#0F4AD6] sm:w-auto whitespace-nowrap"
            >
              <Edit3 className="h-4 w-4 shrink-0" />
              <span>Edit Note</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Study Note Summary
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#334155]">
              {resource.summary.trim() || 'No summary description provided.'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-[#0B1736]">
              Topics &amp; Lab Outline ({resource.topics.length})
            </h3>
            {resource.topics.length > 0 ? (
              <ul className="mt-3 space-y-2.5">
                {resource.topics.map((topic, idx) => (
                  <li
                    key={`${topic}-${idx}`}
                    className="flex items-start gap-2.5 rounded-xl bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#334155]"
                  >
                    <span className="pt-0.5 font-mono text-xs font-bold text-[#145BFF] tabular-nums">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-[#64748B]">
                No bullet topics added yet.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Note Specifications
            </h3>

            <dl className="mt-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <BookOpen className="h-4 w-4 text-[#145BFF]" />
                  <span>Section Type</span>
                </dt>
                <dd className="font-semibold text-[#0B1736]">
                  {resource.sectionType}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Layers className="h-4 w-4 text-[#145BFF]" />
                  <span>Subject / Domain</span>
                </dt>
                <dd className="font-semibold text-[#0B1736]">
                  {resource.domain}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Hash className="h-4 w-4 text-[#64748B]" />
                  <span>Note Code &amp; Order</span>
                </dt>
                <dd className="font-mono font-semibold text-[#0B1736] tabular-nums">
                  {resource.noteCode} · #{String(resource.displayOrder).padStart(2, '0')}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Download className="h-4 w-4 text-[#145BFF]" />
                  <span>Downloads</span>
                </dt>
                <dd className="font-mono font-semibold text-[#0B1736] tabular-nums">
                  {resource.downloads}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Calendar className="h-4 w-4 text-[#64748B]" />
                  <span>Last Updated</span>
                </dt>
                <dd className="font-mono font-semibold text-[#475569] tabular-nums">
                  {formatShortDate(resource.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-[#0B1736]">
              Study File Attachment
            </h3>
            <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 shrink-0 text-[#145BFF]" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#0B1736]">
                    {hasAttachedFile ? resource.fileName || 'Attached study file' : 'No file attached'}
                  </p>
                  <p className="text-[11px] text-[#64748B] tabular-nums">
                    {hasAttachedFile
                      ? `${resource.fileType || 'File'} · ${resource.fileSizeLabel}`
                      : 'Upload or link a PDF, DOCX, PPTX, TXT, PKT, or ZIP file'}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onInspectProtectedPreview(resource)}
                  className="inline-flex h-[36px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0B1736] hover:bg-[#F1F5F9]"
                >
                  <Eye className="h-3.5 w-3.5 text-[#145BFF]" />
                  <span>Open Document Preview</span>
                </button>
                {onManageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onManageFile(resource);
                    }}
                    className="inline-flex h-[36px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#0B1736] hover:bg-[#F1F5F9]"
                  >
                    <span>{hasAttachedFile ? 'Manage / Replace File' : 'Upload File'}</span>
                  </button>
                )}
                {hasAttachedFile && (
                  <button
                    type="button"
                    onClick={() => onDownload(resource)}
                    className="inline-flex h-[36px] items-center gap-1.5 rounded-lg bg-[#145BFF] px-3 text-xs font-semibold text-white hover:bg-[#0F4AD6]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download File</span>
                  </button>
                )}
              </div>
              {hasAttachedFile && !resource.downloadEnabled && (
                <p className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Admin downloads stay active. Public website visitors see view-only preview until Download On is enabled.
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileModalShell>
  );
}
