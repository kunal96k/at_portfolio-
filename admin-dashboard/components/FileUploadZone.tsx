import {
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Info,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import { useId, useRef, useState } from 'react';
import {
  resolveResourceUrl,
  uploadProjectFileBackend,
} from '../../src/services/resourcesService';
import {
  formatFileSize,
  MAX_DOCUMENT_UPLOAD_BYTES,
  MAX_UPLOAD_BYTES,
  validateUploadFile,
} from '../utils/adminLogic';

const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_DOC_EXTS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.txt',
  '.md',
  '.zip',
  '.pkt',
];

interface ImageUploadZoneProps {
  label: string;
  helperText?: string;
  valueUrl: string;
  fileName?: string;
  uploadFolder?: 'courses' | 'batches' | 'blogs' | 'gallery' | 'media' | 'testimonials';
  onChange: (url: string, fileName: string) => void;
  onRemove?: () => void;
}

export function ImageUploadZone({
  label,
  helperText = 'JPG, PNG, or WebP · Max 5 MB · Recommended 16:9 (1200×675px)',
  valueUrl,
  fileName,
  uploadFolder = 'media',
  onChange,
  onRemove,
}: ImageUploadZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [imgError, setImgError] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size <= 0) {
      setUploadError('Selected image file is empty (0 bytes).');
      return;
    }
    const check = validateUploadFile(file, ALLOWED_IMAGE_EXTS, MAX_UPLOAD_BYTES);
    if (!check.valid) {
      setUploadError(check.error ?? 'File exceeds 5 MB limit.');
      return;
    }
    setUploadError(null);
    setImgError(false);
    setProgress(35);

    try {
      const saved = await uploadProjectFileBackend(file, uploadFolder);
      setProgress(100);
      onChange(saved.url || `/api/files/${saved.storedPath}`, saved.fileName);
      window.setTimeout(() => setProgress(null), 250);
    } catch (err) {
      setUploadError(
        err instanceof TypeError
          ? 'Unable to upload file to Spring Boot backend (/api/files/upload). Please verify the backend server is running.'
          : err instanceof Error
            ? err.message
            : 'Unable to upload image file.'
      );
      setProgress(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label htmlFor={inputId} className="text-[12.5px] font-semibold text-[#334155]">
          {label}
        </label>
        <span className="text-[11px] font-semibold text-[#145BFF]">
          Max 5 MB
        </span>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {uploadError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-xs font-medium text-[#B91C1C]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {valueUrl ? (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F5F7FC]">
          <div className="relative aspect-[16/9] w-full bg-[#0B1736]/5">
            {!imgError ? (
              <img
                src={resolveResourceUrl(valueUrl)}
                alt={fileName || label}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-[#64748B]">
                <ImageIcon className="h-7 w-7" />
                <span className="text-xs font-medium">Preview unavailable</span>
              </div>
            )}
          </div>

          {progress !== null && (
            <div className="px-3 pt-2.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full bg-[#145BFF] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs font-medium text-[#145BFF] tabular-nums">
                Uploading {progress}%
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-[#E2E8F0] bg-white p-2.5 sm:flex-row sm:items-center sm:justify-between">
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#334155]">
              {fileName || 'cover-image.jpg'}
            </span>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#0B1736] hover:bg-[#F5F7FC]"
              >
                <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                <span>Replace</span>
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label={`Remove ${label}`}
                  className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 text-xs font-semibold text-[#DC2626] hover:bg-[#FEE2E2]"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[116px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F5F7FC] px-4 py-4 text-center transition-colors hover:border-[#145BFF] hover:bg-[#EFF6FF]/60"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#145BFF]">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0F172A]">
              Tap to upload image
            </p>
            <p className="mt-0.5 text-xs text-[#64748B]">{helperText}</p>
          </div>
          {progress !== null && (
            <div className="mt-1 w-full max-w-xs">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full bg-[#145BFF] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </button>
      )}

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-[#64748B]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#145BFF]" />
        <span>Guideline: {helperText}</span>
      </p>
    </div>
  );
}

export interface UploadedDocItem {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  url?: string;
  storedPath?: string;
  uploadedAt: string;
}

interface DocumentUploadListProps {
  label: string;
  helperText?: string;
  files: UploadedDocItem[];
  multiple?: boolean;
  maxBytes?: number;
  uploadFolder?: 'resources' | 'courses' | 'batches' | 'blogs' | 'media';
  onAddFiles: (newFiles: UploadedDocItem[]) => void;
  onRemoveFile: (id: string) => void;
  onReplaceFile?: (id: string, replacement: UploadedDocItem) => void;
}

export function DocumentUploadList({
  label,
  helperText = 'PDF, DOCX, PPTX, TXT, PKT, or ZIP · Max 50 MB per file',
  files,
  multiple = true,
  maxBytes = MAX_DOCUMENT_UPLOAD_BYTES,
  uploadFolder,
  onAddFiles,
  onRemoveFile,
  onReplaceFile,
}: DocumentUploadListProps) {
  const inputId = useId();
  const addRef = useRef<HTMLInputElement | null>(null);
  const replaceRef = useRef<HTMLInputElement | null>(null);
  const activeReplaceIdRef = useRef<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelection = async (
    selected: FileList | null,
    targetReplaceId?: string
  ) => {
    if (!selected || selected.length === 0) return;
    const validFiles: File[] = [];
    const rejectedMessages: string[] = [];

    Array.from(selected).forEach((file) => {
      if (file.size <= 0) {
        rejectedMessages.push(
          `"${file.name}" is empty (0 bytes). Please choose a valid non-empty file.`
        );
        return;
      }
      const check = validateUploadFile(file, ALLOWED_DOC_EXTS, maxBytes);
      if (check.valid) {
        validFiles.push(file);
      } else if (check.error) {
        rejectedMessages.push(check.error);
      }
    });

    if (rejectedMessages.length > 0) {
      setUploadError(rejectedMessages[0]);
    } else {
      setUploadError(null);
    }

    if (validFiles.length === 0) return;

    setUploadProgress(40);
    const items: UploadedDocItem[] = [];
    for (let idx = 0; idx < validFiles.length; idx++) {
      const file = validFiles[idx];
      let savedPath: string | undefined;
      let savedUrl = '';
      let savedName = file.name;
      let savedMime = file.type || 'application/octet-stream';
      let savedSize = file.size;

      if (!uploadFolder) {
        setUploadError(
          `Backend upload folder is required to save "${file.name}".`
        );
        setUploadProgress(null);
        return;
      }

      try {
        const uploaded = await uploadProjectFileBackend(file, uploadFolder);
        savedPath = uploaded.storedPath;
        savedUrl = uploaded.url;
        savedName = uploaded.fileName;
        savedMime = uploaded.mimeType;
        savedSize = uploaded.sizeBytes;
      } catch (err) {
        setUploadError(
          err instanceof TypeError
            ? `Unable to upload "${file.name}" to Spring Boot backend (/api/files/upload).`
            : err instanceof Error
              ? err.message
              : `Could not save "${file.name}" into backend storage.`
        );
        setUploadProgress(null);
        return;
      }

      if (!savedPath) {
        setUploadError(
          `Could not save "${file.name}" into backend storage.`
        );
        setUploadProgress(null);
        return;
      }

      items.push({
        id: `doc-${Date.now()}-${idx}`,
        name: savedName,
        type: savedMime,
        sizeBytes: savedSize,
        url: savedUrl,
        storedPath: savedPath,
        uploadedAt: new Date().toISOString(),
      });
    }

    setUploadProgress(100);
    if (targetReplaceId && onReplaceFile && items[0]) {
      onReplaceFile(targetReplaceId, items[0]);
    } else if (!multiple && files.length > 0 && onReplaceFile && items[0]) {
      onReplaceFile(files[0].id, items[0]);
    } else {
      onAddFiles(items);
    }
    window.setTimeout(() => {
      setUploadProgress(null);
    }, 220);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-[12.5px] font-semibold text-[#334155]">
          {label}
        </label>
        <span className="text-[11px] font-semibold text-[#145BFF] tabular-nums">
          Max {Math.round(maxBytes / (1024 * 1024))} MB · {files.length} {files.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      <input
        ref={addRef}
        id={inputId}
        type="file"
        multiple={multiple}
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.zip,.pkt"
        className="sr-only"
        onChange={(e) => {
          void handleFileSelection(e.target.files);
          e.target.value = '';
        }}
      />

      <input
        ref={replaceRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.zip,.pkt"
        className="sr-only"
        onChange={(e) => {
          const targetId = activeReplaceIdRef.current;
          activeReplaceIdRef.current = null;
          if (targetId) {
            void handleFileSelection(e.target.files, targetId);
          }
          e.target.value = '';
        }}
      />

      {uploadError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-xs font-medium text-[#B91C1C]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {(multiple || files.length === 0) && (
        <button
          type="button"
          onClick={() => addRef.current?.click()}
          className="flex min-h-[88px] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F5F7FC] px-4 py-4 text-center transition-colors hover:border-[#145BFF] hover:bg-[#EFF6FF]/60"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[#145BFF]">
            <Upload className="h-4 w-4 shrink-0" />
            <span>Choose PDF, Notes or Document</span>
          </div>
          <span className="text-xs text-[#64748B]">{helperText}</span>
        </button>
      )}

      {uploadProgress !== null && (
        <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#145BFF]">
            <span>Uploading file…</span>
            <span className="tabular-nums">{uploadProgress}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[#145BFF] transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {files.length > 0 && (
        <ul className="divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] bg-white">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex flex-col gap-2.5 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#145BFF]">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#0B1736]">
                    {file.name}
                  </p>
                  <p className="text-xs text-[#64748B] tabular-nums">
                    {formatFileSize(file.sizeBytes)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                {onReplaceFile && (
                  <button
                    type="button"
                    onClick={() => {
                      activeReplaceIdRef.current = file.id;
                      replaceRef.current?.click();
                    }}
                    className="inline-flex min-h-[40px] items-center justify-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-semibold text-[#0B1736] hover:bg-[#F5F7FC]"
                  >
                    <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                    <span>Replace</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setUploadError(null);
                    onRemoveFile(file.id);
                  }}
                  aria-label={`Remove ${file.name}`}
                  className="inline-flex min-h-[40px] items-center justify-center gap-1 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2.5 text-xs font-semibold text-[#DC2626] hover:bg-[#FEE2E2]"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Remove</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-[#64748B]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#145BFF]" />
        <span>
          Upload guideline: Keep each file under {Math.round(maxBytes / (1024 * 1024))} MB. Use clear lowercase names
          like <span className="font-mono">rhel-lab-notes.pdf</span>.
        </span>
      </p>
    </div>
  );
}
