import {
  Calendar,
  Clock,
  Download,
  Edit3,
  FileText,
  Layers,
  MapPin,
  Star,
  Users,
} from 'lucide-react';
import {
  formatBatchDateDisplay,
  formatBatchTimeDisplay,
} from '../../../src/services/batchesService';
import { MobileModalShell } from '../../components/MobileModalShell';
import { StatusBadge } from '../../components/StatusBadge';
import { formatFileSize, formatShortDate } from '../../utils/adminLogic';
import { sanitizeSafeHref } from '../../../src/utils/scrollMath';
import type { Batch } from '../types/batch';

interface BatchPreviewModalProps {
  batch: Batch | null;
  onClose: () => void;
  onEdit: (batch: Batch) => void;
  onToggleStatus: (batch: Batch) => void;
}

export function BatchPreviewModal({
  batch,
  onClose,
  onEdit,
  onToggleStatus,
}: BatchPreviewModalProps) {
  if (!batch) return null;

  return (
    <MobileModalShell
      open={Boolean(batch)}
      fullScreen
      title={batch.title}
      subtitle={`${batch.batchCode} · /upcoming-batches/${batch.slug}`}
      titleId="batch-preview-title"
      onClose={onClose}
      headerBadge={
        <>
          <StatusBadge status={batch.status} />
          <span className="rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#145BFF]">
            {batch.category}
          </span>
        </>
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => onToggleStatus(batch)}
            className="h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#0F172A] shadow-xs transition-colors hover:bg-[#F8FAFC] sm:w-auto"
          >
            {batch.status === 'Published' ? 'Move to Draft' : 'Publish to Website'}
          </button>

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
                onEdit(batch);
              }}
              className="inline-flex h-[40px] w-full min-w-0 items-center justify-center gap-1.5 rounded-lg bg-[#145BFF] px-5 text-[13px] font-semibold text-white shadow-xs transition-colors hover:bg-[#0F4AD6] sm:w-auto whitespace-nowrap"
            >
              <Edit3 className="h-4 w-4 shrink-0" />
              <span>Edit Batch</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Main Content Column */}
        <div className="space-y-5 lg:col-span-7">
          {batch.coverImage && (
            <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs">
              <img
                src={batch.coverImage}
                alt={batch.title}
                referrerPolicy="no-referrer"
                className="max-h-[320px] w-full object-cover"
              />
            </div>
          )}

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Overview Summary
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#334155]">
              {batch.shortDescription}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-[#0B1736]">
              Key Lab Modules ({batch.modules.length})
            </h3>
            {batch.modules.length > 0 ? (
              <ul className="mt-3 space-y-2.5">
                {batch.modules.map((mod, idx) => (
                  <li
                    key={`${mod}-${idx}`}
                    className="flex items-start gap-2.5 rounded-xl bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#334155]"
                  >
                    <span className="pt-0.5 font-mono text-xs font-bold text-[#145BFF] tabular-nums">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span>{mod}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#64748B]">
                {batch.detailedContent.trim() || 'No lab modules listed.'}
              </div>
            )}
          </div>
        </div>

        {/* Right Metadata & Documents Column */}
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Schedule &amp; Configuration
            </h3>

            <dl className="mt-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Calendar className="h-4 w-4 text-[#145BFF]" />
                  <span>Start Date</span>
                </dt>
                <dd className="font-semibold text-[#0B1736]">
                  {formatBatchDateDisplay(batch.batchDate)}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Clock className="h-4 w-4 text-[#145BFF]" />
                  <span>Batch Timings</span>
                </dt>
                <dd className="text-right font-semibold text-[#0B1736]">
                  {formatBatchTimeDisplay(batch.batchTime)}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Users className="h-4 w-4 text-[#64748B]" />
                  <span>Mode &amp; Capacity</span>
                </dt>
                <dd className="text-right font-semibold text-[#0B1736]">
                  {batch.mode} ({batch.seatsTotal} seats)
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <MapPin className="h-4 w-4 text-[#64748B]" />
                  <span>Location</span>
                </dt>
                <dd className="text-right font-semibold text-[#0B1736]">
                  {batch.location}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Layers className="h-4 w-4 text-[#145BFF]" />
                  <span>Track &amp; Level</span>
                </dt>
                <dd className="text-right font-semibold text-[#0B1736]">
                  {batch.relatedCourse} · {batch.learningLevel}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Star className="h-4 w-4 text-[#64748B]" />
                  <span>Order &amp; Updated</span>
                </dt>
                <dd className="font-mono font-semibold text-[#475569] tabular-nums">
                  #{batch.displayOrder} · {formatShortDate(batch.updatedAt)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-[#F1F5F9] pt-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Tags
              </p>
              {batch.tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {batch.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-xs font-medium text-[#334155]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-xs text-[#64748B]">No tags</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-[#0B1736]">
              Attached Documents &amp; Brochures ({batch.attachments.length})
            </h3>
            {batch.attachments.length === 0 ? (
              <p className="mt-2 text-xs text-[#64748B]">
                No brochures or syllabus PDFs attached to this batch yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {batch.attachments.map((file) => (
                  <li
                    key={file.id}
                    className="flex flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FileText className="h-4 w-4 shrink-0 text-[#145BFF]" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#0B1736]">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-[#64748B] tabular-nums">
                          {formatFileSize(file.sizeBytes)}
                        </p>
                      </div>
                    </div>
                    {sanitizeSafeHref(file.url) && (
                      <a
                        href={sanitizeSafeHref(file.url)!}
                        download={file.name}
                        className="inline-flex min-h-[36px] shrink-0 items-center justify-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#145BFF] hover:bg-[#EFF6FF]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </MobileModalShell>
  );
}
