import {
  Calendar,
  Download,
  Edit3,
  FileText,
  Layers,
  Star,
} from 'lucide-react';
import { MobileModalShell } from '../../components/MobileModalShell';
import { StatusBadge } from '../../components/StatusBadge';
import { formatFileSize, formatShortDate } from '../../utils/adminLogic';
import type { Topic } from '../types/topic';

interface TopicPreviewModalProps {
  topic: Topic | null;
  onClose: () => void;
  onEdit: (topic: Topic) => void;
  onToggleStatus: (topic: Topic) => void;
}

export function TopicPreviewModal({
  topic,
  onClose,
  onEdit,
  onToggleStatus,
}: TopicPreviewModalProps) {
  if (!topic) return null;

  return (
    <MobileModalShell
      open={Boolean(topic)}
      title={topic.title}
      subtitle={`/topics/${topic.slug}`}
      titleId="topic-preview-title"
      maxWidthClass="sm:max-w-3xl"
      onClose={onClose}
      headerBadge={
        <>
          <StatusBadge status={topic.status} />
          {topic.featured && <StatusBadge status="Featured" />}
          <span className="text-[11px] font-medium text-[#64748B]">
            Pre-publish Preview
          </span>
        </>
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => onToggleStatus(topic)}
            className="min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#0B1736] hover:bg-[#F5F7FC] sm:w-auto"
          >
            {topic.status === 'Published' ? 'Move to Draft' : 'Publish Now'}
          </button>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] w-full min-w-0 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#475569] hover:bg-[#F5F7FC] sm:w-auto"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(topic);
              }}
              className="inline-flex min-h-[44px] w-full min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[#145BFF] px-4 text-sm font-semibold text-white hover:bg-[#0F4AD6] sm:w-auto whitespace-nowrap"
            >
              <Edit3 className="h-4 w-4 shrink-0" />
              <span>Edit Topic</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {topic.coverImage && (
          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F5F7FC]">
            <img
              src={topic.coverImage}
              alt={topic.title}
              referrerPolicy="no-referrer"
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#475569]">
          <span className="inline-flex items-center gap-1 text-[#145BFF]">
            <Layers className="h-3.5 w-3.5 shrink-0" />
            {topic.relatedCourse}
          </span>
          <span aria-hidden="true">·</span>
          <span>{topic.subject}</span>
          <span aria-hidden="true">·</span>
          <span>{topic.learningLevel}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            Order #{topic.displayOrder}
          </span>
        </div>

        <p className="rounded-xl bg-[#F5F7FC] p-4 text-sm leading-relaxed text-[#334155]">
          {topic.shortDescription}
        </p>

        <div>
          <h3 className="text-sm font-bold text-[#0B1736]">
            Detailed Topic Content
          </h3>
          <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#334155]">
            {topic.detailedContent}
          </div>
        </div>

        {/* Tags & Dates */}
        <div className="grid grid-cols-1 gap-3 border-t border-[#E2E8F0] pt-4 text-xs sm:grid-cols-2">
          <div>
            <p className="font-semibold text-[#64748B]">Tags</p>
            <p className="mt-1 font-medium text-[#0B1736]">
              {topic.tags.length > 0 ? topic.tags.join(' · ') : 'No tags'}
            </p>
          </div>
          <div className="flex flex-col gap-1 tabular-nums">
            <p className="inline-flex items-center gap-1.5 text-[#475569]">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-[#64748B]" />
              <span>Created: {formatShortDate(topic.createdAt)}</span>
            </p>
            <p className="inline-flex items-center gap-1.5 text-[#475569]">
              <Star className="h-3.5 w-3.5 shrink-0 text-[#64748B]" />
              <span>Last updated: {formatShortDate(topic.updatedAt)}</span>
            </p>
          </div>
        </div>

        {/* Attached Resources */}
        <div className="border-t border-[#E2E8F0] pt-4">
          <h3 className="text-sm font-bold text-[#0B1736]">
            Attached Learning Resources ({topic.attachments.length})
          </h3>
          {topic.attachments.length === 0 ? (
            <p className="mt-1.5 text-xs text-[#64748B]">
              No PDF notes or documents attached to this topic yet.
            </p>
          ) : (
            <ul className="mt-2.5 space-y-2">
              {topic.attachments.map((file) => (
                <li
                  key={file.id}
                  className="flex flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
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
                  {file.url && (
                    <a
                      href={file.url}
                      download={file.name}
                      className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#145BFF] hover:bg-[#EFF6FF]"
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
    </MobileModalShell>
  );
}
