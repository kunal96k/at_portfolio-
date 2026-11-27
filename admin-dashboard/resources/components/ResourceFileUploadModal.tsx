import { Download, FileText, Lock, Unlock } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import type { StudyResourceFilePatchPayload } from '../../../src/services/resourcesService';
import {
  DocumentUploadList,
  type UploadedDocItem,
} from '../../components/FileUploadZone';
import { MobileModalShell } from '../../components/MobileModalShell';
import type { StudyResourceNote } from '../types/resource';

interface ResourceFileUploadModalProps {
  resource: StudyResourceNote | null;
  submitting?: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    payload: StudyResourceFilePatchPayload
  ) => Promise<void>;
  onDownload: (note: StudyResourceNote) => void;
}

const FILE_TYPE_OPTIONS = [
  'PDF',
  'DOCX',
  'TXT',
  'PPTX',
  'Lab Topology',
  'Cheat Sheet',
  'ZIP',
];

function inferFileTypeFromName(fileName: string, fallback = 'PDF'): string {
  const lower = fileName.trim().toLowerCase();
  if (lower.endsWith('.pdf')) return 'PDF';
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'DOCX';
  if (lower.endsWith('.ppt') || lower.endsWith('.pptx')) return 'PPTX';
  if (lower.endsWith('.txt') || lower.endsWith('.md')) return 'TXT';
  if (lower.endsWith('.pkt')) return 'Lab Topology';
  if (lower.endsWith('.zip')) return 'ZIP';
  return fallback;
}

function hasValidResourceUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return true;
  if (
    trimmed.startsWith('/seed-materials/') ||
    trimmed.startsWith('/api/files/') ||
    trimmed.startsWith('/study-materials/') ||
    trimmed.startsWith('/api/resources/')
  ) {
    return trimmed.length > 1;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function ResourceFileUploadModal({
  resource,
  submitting = false,
  onClose,
  onSave,
  onDownload,
}: ResourceFileUploadModalProps) {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocItem[]>([]);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('PDF');
  const [mimeType, setMimeType] = useState('');
  const [fileSizeBytes, setFileSizeBytes] = useState(0);
  const [fileUrl, setFileUrl] = useState('');
  const [storedFilePath, setStoredFilePath] = useState<string | undefined>(undefined);
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [removeFile, setRemoveFile] = useState(false);
  const [downloadEnabled, setDownloadEnabled] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!resource) return;
    const exists = Boolean(
      resource.hasFile ||
        resource.hasUploadedFile ||
        String(resource.fileUrl ?? '').trim() !== ''
    );
    setFileName(exists ? resource.fileName || '' : '');
    setFileType(resource.fileType || 'PDF');
    setMimeType(exists ? resource.mimeType || 'application/pdf' : '');
    setFileSizeBytes(exists ? resource.fileSizeBytes || 0 : 0);
    setFileUrl(exists ? resource.fileUrl || '' : '');
    setStoredFilePath(undefined);
    setFileData(undefined);
    setRemoveFile(false);
    setDownloadEnabled(Boolean(resource.downloadEnabled));
    setFormError(null);
    setUploadedDocs(
      exists
        ? [
            {
              id: `existing-${resource.id}`,
              name: resource.fileName || 'attached-file',
              type: resource.mimeType || 'application/pdf',
              sizeBytes: resource.fileSizeBytes || 0,
              url: resource.fileUrl || '',
              uploadedAt: resource.updatedAt,
            },
          ]
        : []
    );
  }, [resource]);

  if (!resource) return null;

  const hasUploadedAttachment = Boolean(
    !removeFile &&
      (Boolean(storedFilePath) ||
        Boolean(fileData) ||
        uploadedDocs.some((d) => Boolean(d.storedPath) || d.url?.startsWith('data:') || d.url?.includes('/api/resources/')))
  );

  const currentlyAttached = Boolean(
    !removeFile &&
      (uploadedDocs.length > 0 ||
        Boolean(storedFilePath) ||
        Boolean(fileData) ||
        Boolean(fileUrl.trim()) ||
        resource.hasFile)
  );

  const handleAttach = (docs: UploadedDocItem[]) => {
    const first = docs[0];
    if (!first) return;
    const isDataUrl = Boolean(first.url && first.url.startsWith('data:'));
    setUploadedDocs([first]);
    setFileName(first.name);
    setFileType((prev) => inferFileTypeFromName(first.name, prev || 'PDF'));
    setMimeType(first.type || 'application/octet-stream');
    setFileSizeBytes(first.sizeBytes);
    setStoredFilePath(first.storedPath);
    setFileData(!first.storedPath && isDataUrl ? first.url : undefined);
    setFileUrl('');
    setRemoveFile(false);
    setFormError(null);
  };

  const handleRemove = () => {
    setUploadedDocs([]);
    setFileName('');
    setMimeType('');
    setFileSizeBytes(0);
    setStoredFilePath(undefined);
    setFileData(undefined);
    setFileUrl('');
    setRemoveFile(true);
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!hasUploadedAttachment && !hasValidResourceUrl(fileUrl)) {
      setFormError(
        'Enter a valid http(s):// document link or leave the link blank and upload a file above.'
      );
      return;
    }

    const willHaveFile = Boolean(
      !removeFile &&
        (Boolean(storedFilePath) ||
          Boolean(fileData) ||
          Boolean(fileUrl.trim()) ||
          uploadedDocs.length > 0)
    );

    const payload: StudyResourceFilePatchPayload = {
      removeFile: removeFile || !willHaveFile,
      downloadEnabled,
    };

    if (willHaveFile && !removeFile) {
      payload.fileName = fileName.trim();
      payload.fileType = fileType;
      payload.mimeType = mimeType.trim();
      payload.fileSizeBytes = fileSizeBytes;
      payload.fileUrl = hasUploadedAttachment ? '' : fileUrl.trim();
      if (storedFilePath) {
        payload.storedFilePath = storedFilePath;
      } else if (fileData) {
        payload.fileData = fileData;
      }
    }

    await onSave(resource.id, payload);
  };

  return (
    <MobileModalShell
      open={Boolean(resource)}
      title="Upload or Replace Study File"
      subtitle={`${resource.noteCode} · ${resource.title}`}
      titleId="resource-file-upload-modal-title"
      maxWidthClass="sm:max-w-2xl"
      busy={submitting}
      asForm
      onFormSubmit={(e) => void handleSubmit(e)}
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {currentlyAttached && resource.hasFile && !fileData && !removeFile && (
              <button
                type="button"
                onClick={() => onDownload(resource)}
                className="inline-flex h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3.5 text-xs font-semibold text-[#0B1736] hover:bg-[#F8FAFC]"
              >
                <Download className="h-3.5 w-3.5 text-[#145BFF]" />
                <span>Download Current File</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC] sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-[40px] w-full items-center justify-center rounded-lg bg-[#145BFF] px-5 text-[13px] font-semibold text-white hover:bg-[#0F4AD6] disabled:opacity-60 sm:w-auto whitespace-nowrap"
            >
              {submitting ? 'Saving...' : 'Save File Changes'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Current Attachment Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0B1736]">
            <FileText className="h-4 w-4 text-[#145BFF]" />
            <span>
              {currentlyAttached
                ? `Active file: ${fileName || fileUrl || 'Attached document'}`
                : 'No study file attached yet — note is summary-only'}
            </span>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              currentlyAttached
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {currentlyAttached ? 'File Ready' : 'No File'}
          </span>
        </div>

        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-xs font-medium text-[#B91C1C]"
          >
            {formError}
          </div>
        )}

        <DocumentUploadList
          label="Upload, Replace, or Remove File (saved in project folder · max 50 MB)"
          multiple={false}
          uploadFolder="resources"
          files={uploadedDocs}
          onAddFiles={handleAttach}
          onReplaceFile={(_, replacement) => handleAttach([replacement])}
          onRemoveFile={handleRemove}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label
              htmlFor="upload-modal-file-url"
              className="block text-[12px] font-semibold text-[#334155]"
            >
              External File Link (optional if no file uploaded)
            </label>
            <input
              id="upload-modal-file-url"
              type="text"
              maxLength={500}
              disabled={hasUploadedAttachment}
              value={hasUploadedAttachment ? '' : fileUrl}
              onChange={(e) => {
                if (hasUploadedAttachment) return;
                const nextUrl = e.target.value;
                setFileUrl(nextUrl);
                if (nextUrl.trim()) {
                  setRemoveFile(false);
                }
                setFormError(null);
              }}
              placeholder={
                hasUploadedAttachment
                  ? 'Uploaded file active (click Remove above to use a link instead)'
                  : 'https://... or /seed-materials/notes.pdf'
              }
              className={`mt-1 h-[40px] w-full rounded-lg border px-3 font-mono text-[12.5px] focus:outline-none ${
                hasUploadedAttachment
                  ? 'cursor-not-allowed border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
                  : 'border-[#CBD5E1] bg-white text-[#0F172A] focus:border-[#145BFF]'
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="upload-modal-file-type"
              className="block text-[12px] font-semibold text-[#334155]"
            >
              File Format
            </label>
            <select
              id="upload-modal-file-type"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="mt-1 h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-[12.5px] font-medium text-[#0F172A] focus:border-[#145BFF] focus:outline-none"
            >
              {FILE_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="upload-modal-file-name"
            className="block text-[12px] font-semibold text-[#334155]"
          >
            Display File Name
          </label>
          <input
            id="upload-modal-file-name"
            type="text"
            maxLength={255}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Optional display filename (e.g. rhel-notes.pdf)"
            className="mt-1 h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 font-mono text-[12.5px] text-[#0F172A] focus:border-[#145BFF] focus:outline-none"
          />
        </div>

        {/* Website Download Protection Control */}
        <div
          className={`flex flex-col justify-between gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center ${
            downloadEnabled
              ? 'border-emerald-200 bg-emerald-50/70'
              : 'border-amber-200 bg-amber-50/70'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-white ${
                downloadEnabled
                  ? 'border-emerald-200 text-emerald-600'
                  : 'border-amber-200 text-amber-600'
              }`}
            >
              {downloadEnabled ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </span>
            <div>
              <p className="text-xs font-bold text-[#0F172A]">
                {downloadEnabled
                  ? 'Public Website Download: Enabled'
                  : 'Public Website: View-Only Preview'}
              </p>
              <p className="mt-0.5 text-[11px] text-[#475569]">
                Admin Dashboard downloads are always available when a file is attached.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={downloadEnabled}
            onClick={() => setDownloadEnabled((prev) => !prev)}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold whitespace-nowrap ${
              downloadEnabled
                ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                : 'border-amber-400 bg-white text-amber-800 hover:bg-amber-100'
            }`}
          >
            {downloadEnabled ? 'Download: ON' : 'Download: OFF'}
          </button>
        </div>
      </div>
    </MobileModalShell>
  );
}
