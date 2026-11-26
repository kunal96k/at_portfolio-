import {
  Download,
  Eye,
  FileCode,
  FileSpreadsheet,
  FileText,
  Paperclip,
  Search,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { MobileModalShell } from '../../components/MobileModalShell';
import { formatFileSize, formatShortDate } from '../../utils/adminLogic';
import { sanitizeSafeHref } from '../../../src/utils/scrollMath';
import type { Batch, BatchAttachment } from '../types/batch';

interface FlattenedBatchFile {
  file: BatchAttachment;
  batchId: string;
  batchTitle: string;
  batchCategory: string;
  batchStatus: string;
}

interface BatchFilesModalProps {
  open: boolean;
  batches: Batch[];
  onClose: () => void;
  onPreviewBatch: (batch: Batch) => void;
}

function getFileIcon(fileName: string, mimeType: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf') || mimeType.includes('pdf')) {
    return <FileText className="h-5 w-5 text-red-500" aria-hidden="true" />;
  }
  if (
    lower.endsWith('.xls') ||
    lower.endsWith('.xlsx') ||
    lower.endsWith('.csv') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel')
  ) {
    return (
      <FileSpreadsheet
        className="h-5 w-5 text-emerald-600"
        aria-hidden="true"
      />
    );
  }
  if (
    lower.endsWith('.sh') ||
    lower.endsWith('.yaml') ||
    lower.endsWith('.yml') ||
    lower.endsWith('.json') ||
    lower.endsWith('.py') ||
    lower.endsWith('.ts')
  ) {
    return <FileCode className="h-5 w-5 text-indigo-500" aria-hidden="true" />;
  }
  return <Paperclip className="h-5 w-5 text-blue-500" aria-hidden="true" />;
}

export function BatchFilesModal({
  open,
  batches,
  onClose,
  onPreviewBatch,
}: BatchFilesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<
    'All' | 'PDF' | 'Docs' | 'Scripts'
  >('All');

  const allFiles = useMemo<FlattenedBatchFile[]>(() => {
    const list: FlattenedBatchFile[] = [];
    for (const batch of batches) {
      for (const file of batch.attachments) {
        list.push({
          file,
          batchId: batch.id,
          batchTitle: batch.title,
          batchCategory: batch.category,
          batchStatus: batch.status,
        });
      }
    }
    return list;
  }, [batches]);

  const filteredFiles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allFiles.filter((item) => {
      const fileNameLower = item.file.name.toLowerCase();
      if (typeFilter === 'PDF' && !fileNameLower.endsWith('.pdf')) return false;
      if (
        typeFilter === 'Docs' &&
        !(
          fileNameLower.endsWith('.doc') ||
          fileNameLower.endsWith('.docx') ||
          fileNameLower.endsWith('.txt') ||
          fileNameLower.endsWith('.md')
        )
      ) {
        return false;
      }
      if (
        typeFilter === 'Scripts' &&
        !(
          fileNameLower.endsWith('.sh') ||
          fileNameLower.endsWith('.yaml') ||
          fileNameLower.endsWith('.yml') ||
          fileNameLower.endsWith('.json') ||
          fileNameLower.endsWith('.py')
        )
      ) {
        return false;
      }

      if (!term) return true;
      return (
        fileNameLower.includes(term) ||
        item.batchTitle.toLowerCase().includes(term) ||
        item.batchCategory.toLowerCase().includes(term)
      );
    });
  }, [allFiles, searchTerm, typeFilter]);

  if (!open) return null;

  return (
    <MobileModalShell
      open={open}
      onClose={onClose}
      title="Batch Documents & Brochures"
      subtitle={`${allFiles.length} total syllabus PDFs, schedules, and lab manuals across batches`}
      titleId="batch-files-modal-title"
      maxWidthClass="sm:max-w-3xl"
      footer={
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#64748B] tabular-nums">
            Showing <strong className="text-[#0B1736]">{filteredFiles.length}</strong> of{' '}
            <strong className="text-[#0B1736]">{allFiles.length}</strong> documents
          </p>
          <button
            type="button"
            onClick={onClose}
            className="h-[36px] rounded-lg border border-[#CBD5E1] bg-white px-4 text-xs font-semibold text-[#334155] shadow-xs transition-colors hover:bg-[#F8FAFC]"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />
            <input
              type="text"
              maxLength={120}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by file name, batch title, or domain…"
              className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pr-8 pl-9 text-xs text-[#0B1736] placeholder:text-[#64748B] focus:border-[#145BFF] focus:bg-white focus:ring-2 focus:ring-[#145BFF]/15 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#64748B] hover:text-[#0B1736]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1">
            {(['All', 'PDF', 'Docs', 'Scripts'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setTypeFilter(tab)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  typeFilter === tab
                    ? 'bg-white text-[#145BFF] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B1736]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Files List */}
        {filteredFiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] p-8 text-center">
            <Paperclip
              className="mx-auto h-8 w-8 text-[#94A3B8]"
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-semibold text-[#0B1736]">
              No documents found
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              {allFiles.length === 0
                ? 'No brochures or syllabus PDFs have been attached to batches yet.'
                : 'Try adjusting your search keywords or document type filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9] rounded-xl border border-[#E2E8F0] bg-white">
            {filteredFiles.map((item) => {
              const matchedBatch = batches.find((b) => b.id === item.batchId);
              return (
                <div
                  key={`${item.batchId}-${item.file.id}`}
                  className="flex flex-col gap-2 p-3 transition-colors hover:bg-[#F8FAFC] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9]">
                      {getFileIcon(item.file.name, item.file.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-[#0B1736]">
                        {item.file.name}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-[#64748B]">
                        <span className="font-mono tabular-nums">
                          {formatFileSize(item.file.sizeBytes)}
                        </span>
                        <span>·</span>
                        <span className="max-w-[230px] truncate">
                          Batch:{' '}
                          <strong className="text-[#334155]">
                            {item.batchTitle}
                          </strong>
                        </span>
                        <span>·</span>
                        <span>{formatShortDate(item.file.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                    {matchedBatch && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onPreviewBatch(matchedBatch);
                        }}
                        className="inline-flex h-[32px] items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0B1736]"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#64748B]" />
                        <span>View Batch</span>
                      </button>
                    )}
                    {sanitizeSafeHref(item.file.url) ? (
                      <a
                        href={sanitizeSafeHref(item.file.url)!}
                        download={item.file.name}
                        className="inline-flex h-[32px] items-center gap-1 rounded-lg bg-[#145BFF] px-2.5 text-xs font-semibold text-white hover:bg-[#0F4AD6]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    ) : (
                      <span className="inline-flex h-[32px] items-center rounded-lg bg-[#F1F5F9] px-2.5 text-xs font-medium text-[#64748B]">
                        Stored locally
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobileModalShell>
  );
}
