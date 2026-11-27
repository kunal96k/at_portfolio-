import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PROFILE } from '../data/portfolioData';
import {
  fetchResourcePreviewInfo,
  getResourcePreviewPageUrl,
  type ResourcePreviewInfo,
  type StudyResourceNote,
} from '../services/resourcesService';

interface ProtectedResourcePreviewModalProps {
  resource: StudyResourceNote | null;
  isPublic?: boolean;
  onClose: () => void;
  onDownload?: (note: StudyResourceNote) => void;
  onRequestDownload?: (note: StudyResourceNote) => void;
}

export function ProtectedResourcePreviewModal({
  resource,
  isPublic = true,
  onClose,
  onDownload,
  onRequestDownload,
}: ProtectedResourcePreviewModalProps) {
  const [previewInfo, setPreviewInfo] = useState<ResourcePreviewInfo | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [pageImageLoading, setPageImageLoading] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [imageError, setImageError] = useState(false);

  const open = Boolean(resource);

  useEffect(() => {
    setPageInput(String(pageNumber));
  }, [pageNumber]);

  useEffect(() => {
    if (!resource || typeof window === 'undefined') {
      setPreviewInfo(null);
      return;
    }

    setPageNumber(1);
    setPageInput('1');
    setPageImageLoading(false);
    setZoomPercent(100);
    setImageError(false);

    // Offline / static / draft-before-save fallback uses in-memory metadata
    const hasAttachedFile = Boolean(
      resource.hasFile ||
        resource.hasUploadedFile ||
        String(resource.fileUrl ?? '').trim() !== ''
    );
    if (!/^\d+$/.test(resource.id)) {
      setPreviewInfo({
        id: resource.id,
        noteCode: resource.noteCode,
        title: resource.title,
        slug: resource.slug,
        sectionType: resource.sectionType,
        domain: resource.domain,
        fileName: resource.fileName,
        fileType: resource.fileType,
        mimeType: resource.mimeType,
        fileSizeLabel: resource.fileSizeLabel,
        hasFile: hasAttachedFile,
        summary: resource.summary,
        topics: resource.topics,
        downloadEnabled: resource.downloadEnabled,
        previewMode: 'METADATA_ONLY',
        pageCount: 0,
        status: resource.status,
      });
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    void fetchResourcePreviewInfo(resource.id, isPublic, controller.signal)
      .then((info) => {
        if (!controller.signal.aborted) {
          setPreviewInfo(info);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setPreviewInfo({
            id: resource.id,
            noteCode: resource.noteCode,
            title: resource.title,
            slug: resource.slug,
            sectionType: resource.sectionType,
            domain: resource.domain,
            fileName: resource.fileName,
            fileType: resource.fileType,
            mimeType: resource.mimeType,
            fileSizeLabel: resource.fileSizeLabel,
            hasFile: hasAttachedFile,
            summary: resource.summary,
            topics: resource.topics,
            downloadEnabled: resource.downloadEnabled,
            previewMode: 'METADATA_ONLY',
            pageCount: 0,
            status: resource.status,
          });
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [resource, isPublic]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClose();
        return;
      }
      // Block Save / Print keyboard shortcuts while preview-only modal is active
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'p')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (previewInfo?.previewMode === 'PDF_PAGES' && previewInfo.pageCount > 1) {
        if (e.key === 'ArrowRight') {
          setImageError(false);
          setPageImageLoading(true);
          setPageNumber((p) => Math.min(previewInfo.pageCount, p + 1));
        } else if (e.key === 'ArrowLeft') {
          setImageError(false);
          setPageImageLoading(true);
          setPageNumber((p) => Math.max(1, p - 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open, onClose, previewInfo]);

  if (!resource || typeof document === 'undefined') return null;

  const fallbackHasFile = Boolean(
    resource.hasFile ||
      resource.hasUploadedFile ||
      String(resource.fileUrl ?? '').trim() !== ''
  );

  const effective = previewInfo ?? {
    id: resource.id,
    noteCode: resource.noteCode,
    title: resource.title,
    slug: resource.slug,
    sectionType: resource.sectionType,
    domain: resource.domain,
    fileName: resource.fileName,
    fileType: resource.fileType,
    mimeType: resource.mimeType,
    fileSizeLabel: resource.fileSizeLabel,
    hasFile: fallbackHasFile,
    summary: resource.summary,
    topics: resource.topics,
    downloadEnabled: resource.downloadEnabled,
    previewMode: resource.previewMode,
    pageCount: 0,
    status: resource.status,
  };

  const resourceHasFile = Boolean(effective.hasFile ?? fallbackHasFile);
  const canDownload = effective.downloadEnabled && resourceHasFile;
  const allowAdminDownload = !isPublic && resourceHasFile;
  const showDownloadAction = Boolean(onDownload && (canDownload || allowAdminDownload));
  const whatsappHref = `https://wa.me/91${PROFILE.whatsappNumber}?text=${encodeURIComponent(
    isPublic
      ? `Hello Arvind Sir, I would like to request download access for study note: ${effective.title}.`
      : `Hello Arvind Sir, I would like to request download access for study note ${effective.noteCode}: ${effective.title}.`
  )}`;

  const pageImageUrl =
    effective.previewMode === 'PDF_PAGES' &&
    effective.pageCount > 0 &&
    /^\d+$/.test(effective.id)
      ? getResourcePreviewPageUrl(effective.id, pageNumber, isPublic)
      : '';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="protected-preview-title"
      onContextMenu={(e) => {
        if (!canDownload) e.preventDefault();
      }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#0F172A]/75 backdrop-blur-xs sm:p-4 lg:p-6"
    >
      {!canDownload && (
        <style>{`@media print { [data-protected-preview-surface="true"] { display: none !important; } }`}</style>
      )}

      <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white dark:bg-[#1E1E20] shadow-2xl sm:rounded-2xl sm:border sm:border-black/10 dark:sm:border-white/10">
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-black/10 dark:border-white/10 bg-[#FAFAFC] dark:bg-[#252528] px-4 py-3.5 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#5E67E6]/10 dark:bg-[#D0FF71]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#5E67E6] dark:text-[#D0FF71]">
                {isPublic
                  ? effective.sectionType
                  : `${effective.noteCode} · ${effective.sectionType}`}
              </span>
              {canDownload && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  Download Available
                </span>
              )}
            </div>
            <h2
              id="protected-preview-title"
              className="mt-1.5 truncate text-base sm:text-lg font-bold text-[#1E293B] dark:text-white"
            >
              {effective.title}
            </h2>
            <p className="truncate text-xs text-[#64748B] dark:text-white/65">
              {effective.domain}
              {effective.fileName
                ? ` · ${effective.fileName} (${effective.fileType})`
                : ' · Study Summary'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close document preview"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-[#1E1E20] px-3 text-xs font-semibold text-[#334155] dark:text-white hover:bg-[#F1F5F9] dark:hover:bg-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </header>

        {/* Scrollable Protected Preview Surface */}
        <div
          data-protected-preview-surface="true"
          className={`min-h-0 flex-1 overflow-y-auto bg-[#F1F5F9] dark:bg-[#141416] p-4 sm:p-6 ${
            !canDownload ? 'select-none' : ''
          }`}
        >
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-[#64748B] dark:text-white/70">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5E67E6] border-t-transparent" />
              <span>Opening preview…</span>
            </div>
          ) : effective.previewMode === 'PDF_PAGES' && pageImageUrl ? (
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-4">
              {/* Viewer Toolbar */}
              <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E1E20] px-3.5 py-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={pageNumber <= 1}
                    onClick={() => {
                      setImageError(false);
                      setPageImageLoading(true);
                      setPageNumber((p) => Math.max(1, p - 1));
                    }}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-black/10 dark:border-white/15 px-2.5 font-semibold text-[#334155] dark:text-white disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </button>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const parsed = Number.parseInt(pageInput, 10);
                      if (!Number.isNaN(parsed)) {
                        const clamped = Math.min(
                          effective.pageCount,
                          Math.max(1, parsed)
                        );
                        setImageError(false);
                        if (clamped !== pageNumber) {
                          setPageImageLoading(true);
                          setPageNumber(clamped);
                        } else {
                          setPageInput(String(clamped));
                        }
                      } else {
                        setPageInput(String(pageNumber));
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-1.5 font-mono font-semibold text-[#1E293B] dark:text-white tabular-nums"
                  >
                    <span>Page</span>
                    <input
                      type="number"
                      min={1}
                      max={effective.pageCount}
                      aria-label="Go to page number"
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onBlur={() => {
                        const parsed = Number.parseInt(pageInput, 10);
                        if (!Number.isNaN(parsed)) {
                          const clamped = Math.min(
                            effective.pageCount,
                            Math.max(1, parsed)
                          );
                          if (clamped !== pageNumber) {
                            setImageError(false);
                            setPageImageLoading(true);
                            setPageNumber(clamped);
                          }
                          setPageInput(String(clamped));
                        } else {
                          setPageInput(String(pageNumber));
                        }
                      }}
                      className="h-7 w-14 rounded-md border border-black/15 dark:border-white/20 bg-transparent px-1.5 text-center text-xs font-semibold focus:border-[#5E67E6] focus:outline-none"
                    />
                    <span>of {effective.pageCount}</span>
                  </form>
                  <button
                    type="button"
                    disabled={pageNumber >= effective.pageCount}
                    onClick={() => {
                      setImageError(false);
                      setPageImageLoading(true);
                      setPageNumber((p) =>
                        Math.min(effective.pageCount, p + 1)
                      );
                    }}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-black/10 dark:border-white/15 px-2.5 font-semibold text-[#334155] dark:text-white disabled:opacity-40 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={zoomPercent <= 75}
                    onClick={() => setZoomPercent((z) => Math.max(75, z - 25))}
                    aria-label="Zoom out"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 dark:border-white/15 text-[#334155] dark:text-white disabled:opacity-40 cursor-pointer"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-12 text-center font-mono font-semibold text-[#334155] dark:text-white tabular-nums">
                    {zoomPercent}%
                  </span>
                  <button
                    type="button"
                    disabled={zoomPercent >= 150}
                    onClick={() => setZoomPercent((z) => Math.min(150, z + 25))}
                    aria-label="Zoom in"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 dark:border-white/15 text-[#334155] dark:text-white disabled:opacity-40 cursor-pointer"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Guarded Page Frame (blocks right-click & drag-to-save) */}
              <div
                style={{ width: `${zoomPercent}%`, maxWidth: '100%' }}
                className="relative overflow-hidden rounded-xl border border-black/10 dark:border-white/15 bg-white shadow-lg"
              >
                {!imageError ? (
                  <>
                    {pageImageLoading && (
                      <div className="flex items-center justify-center py-12 text-xs font-medium text-[#64748B]">
                        Rendering page {pageNumber}…
                      </div>
                    )}
                    <img
                      src={pageImageUrl}
                      alt={`${effective.title} — Page ${pageNumber}`}
                      crossOrigin={!isPublic ? 'use-credentials' : undefined}
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      onLoad={() => setPageImageLoading(false)}
                      onError={() => {
                        setPageImageLoading(false);
                        setImageError(true);
                      }}
                      className={`pointer-events-none block h-auto w-full select-none ${
                        pageImageLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                    {/* Transparent interaction shield so browsers cannot save/drag the PNG directly */}
                    <div
                      aria-hidden="true"
                      onContextMenu={(e) => e.preventDefault()}
                      className="absolute inset-0 z-10 select-none bg-transparent"
                    />
                  </>
                ) : (
                  <div className="p-8 text-center text-sm text-[#64748B]">
                    Unable to render page image. Review topics outline below or
                    contact Arvind Thevar.
                  </div>
                )}
              </div>
            </div>
          ) : effective.previewMode === 'TEXT' && effective.textContent ? (
            <div className="mx-auto max-w-4xl rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E1E20] p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-2.5 text-xs font-semibold text-[#64748B] dark:text-white/65">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-[#5E67E6] dark:text-[#D0FF71]" />
                  {effective.fileName}
                </span>
                {!canDownload && <span>Read-Only Preview</span>}
              </div>
              <pre
                onContextMenu={(e) => {
                  if (!canDownload) e.preventDefault();
                }}
                className={`overflow-x-auto whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-[#1E293B] dark:text-white/85 ${
                  !canDownload ? 'select-none' : ''
                }`}
              >
                {effective.textContent}
              </pre>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E1E20] p-5 sm:p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5E67E6] dark:text-[#D0FF71]">
                  Study Resource Overview
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#334155] dark:text-white/85">
                  {effective.summary.trim() || 'No summary overview provided for this note.'}
                </p>

                {!canDownload && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-200">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      {effective.hasFile === false
                        ? 'No document file is attached to this note yet. You can read the study summary and syllabus details below.'
                        : effective.fileType &&
                            !effective.fileType.toLowerCase().includes('pdf') &&
                            !effective.fileType.toLowerCase().includes('txt')
                          ? `This ${effective.fileType} file is view-only here. Please read the summary below or contact Arvind Thevar to request a copy.`
                          : effective.previewMode === 'METADATA_ONLY' &&
                              (effective.fileType || '').toLowerCase().includes('pdf')
                            ? 'This PDF link could not be loaded for preview right now. Please re-upload the PDF file in Admin Dashboard or contact Arvind Thevar for a copy.'
                            : 'View-only mode is active for this note. Please contact Arvind Thevar if you need a downloadable copy.'}
                    </span>
                  </div>
                )}
              </div>

              {effective.topics.length > 0 && (
                <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E1E20] p-5 sm:p-6">
                  <h3 className="text-sm font-bold text-[#1E293B] dark:text-white">
                    Topics &amp; Lab Outline ({effective.topics.length})
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {effective.topics.map((topic, i) => (
                      <li
                        key={`${topic}-${i}`}
                        className="flex items-start gap-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#252528] px-3.5 py-2.5 text-sm text-[#334155] dark:text-white/85"
                      >
                        <span className="font-mono text-xs font-bold text-[#5E67E6] dark:text-[#D0FF71] tabular-nums">
                          {String(i + 1).padStart(2, '0')}.
                        </span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <footer
          style={{
            paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          }}
          className="shrink-0 border-t border-black/10 dark:border-white/10 bg-[#FAFAFC] dark:bg-[#252528] px-4 pt-3.5 sm:px-6"
        >
          {showDownloadAction ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#64748B] dark:text-white/70">
                {!canDownload && allowAdminDownload
                  ? `Admin download access · Visitors currently see view-only preview (${effective.fileSizeLabel})`
                  : `Download available · ${effective.fileSizeLabel}`}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-full border border-black/15 dark:border-white/20 px-4 text-xs font-semibold text-[#334155] dark:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => onDownload?.(resource)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-5 text-xs font-semibold text-white dark:text-[#1A1A1B] cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download {effective.fileType || 'File'}</span>
                </button>
              </div>
            </div>
          ) : !resourceHasFile ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#64748B] dark:text-white/70">
                No study file attached yet — showing note summary and topics.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="h-9 self-end rounded-full border border-black/15 dark:border-white/20 px-4 text-xs font-semibold text-[#334155] dark:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5 text-xs text-[#475569] dark:text-white/80">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold text-[#1E293B] dark:text-white">
                    Contact Arvind Thevar to download this file
                  </p>
                  <p className="text-[11.5px] text-[#64748B] dark:text-white/65">
                    Call / WhatsApp {PROFILE.phone} or submit a download request
                    from the website contact form.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`mailto:${PROFILE.email}?subject=${encodeURIComponent(
                    isPublic
                      ? `Download Request: ${effective.title}`
                      : `Download Request: ${effective.noteCode} - ${effective.title}`
                  )}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/15 dark:border-white/20 px-3.5 text-xs font-semibold text-[#334155] dark:text-white"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email</span>
                </a>
                <a
                  href={PROFILE.phoneHref}
                  className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full border border-black/15 dark:border-white/20 px-3.5 text-xs font-semibold text-[#334155] dark:text-white"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call</span>
                </a>
                {onRequestDownload && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequestDownload(resource);
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-4 text-xs font-semibold text-white dark:text-[#1A1A1B] cursor-pointer"
                  >
                    <span>Request Download</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}
