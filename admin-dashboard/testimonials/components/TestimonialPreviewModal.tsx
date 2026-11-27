import {
  Building2,
  Calendar,
  Edit3,
  GraduationCap,
  Hash,
  Sparkles,
} from 'lucide-react';
import { MobileModalShell } from '../../components/MobileModalShell';
import { StatusBadge } from '../../components/StatusBadge';
import { formatShortDate } from '../../utils/adminLogic';
import type { StudentTestimonial } from '../types/testimonial';

interface TestimonialPreviewModalProps {
  item: StudentTestimonial | null;
  onClose: () => void;
  onEdit: (item: StudentTestimonial) => void;
  onToggleStatus: (item: StudentTestimonial) => void;
  onToggleFeatured: (item: StudentTestimonial) => void;
}

export function TestimonialPreviewModal({
  item,
  onClose,
  onEdit,
  onToggleStatus,
  onToggleFeatured,
}: TestimonialPreviewModalProps) {
  if (!item) return null;

  return (
    <MobileModalShell
      open={Boolean(item)}
      fullScreen
      title={item.studentName}
      subtitle={`${item.testimonialCode} · /testimonials`}
      titleId="testimonial-preview-title"
      onClose={onClose}
      headerBadge={
        <>
          <StatusBadge status={item.status} />
          {item.courseTrack && (
            <span className="rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#145BFF]">
              {item.courseTrack}
            </span>
          )}
          {item.featured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          )}
        </>
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus(item)}
              className="h-[40px] rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#0F172A] shadow-xs hover:bg-[#F8FAFC]"
            >
              {item.status === 'Published'
                ? 'Move to Draft'
                : 'Publish to Website'}
            </button>
            <button
              type="button"
              onClick={() => onToggleFeatured(item)}
              className="inline-flex h-[40px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#145BFF] shadow-xs hover:bg-[#EFF6FF]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {item.featured ? 'Remove Featured' : 'Mark Featured'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={onClose}
              className="h-[40px] w-full min-w-0 rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#475569] shadow-xs hover:bg-[#F8FAFC] sm:w-auto"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="inline-flex h-[40px] w-full min-w-0 items-center justify-center gap-1.5 rounded-lg bg-[#145BFF] px-5 text-[13px] font-semibold text-white shadow-xs hover:bg-[#0F4AD6] sm:w-auto whitespace-nowrap"
            >
              <Edit3 className="h-4 w-4 shrink-0" />
              <span>Edit Story</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Website Card Preview */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 sm:p-8 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Public Website Card Preview
            </p>
            <article className="mt-4 rounded-[22px] border border-[#E2E8F0] bg-white p-7 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-[#5E67E6]/25 bg-[#EFF6FF] flex items-center justify-center font-bold text-xl text-[#145BFF]">
                    {item.avatarUrl ? (
                      <img
                        src={item.avatarUrl}
                        alt={item.studentName}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      item.studentName.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0B1736]">
                      {item.studentName}
                    </h3>
                    {(item.company || item.role) && (
                      <p className="mt-0.5 text-sm font-medium text-[#145BFF]">
                        {[item.company, item.role].filter(Boolean).join(' | ')}
                      </p>
                    )}
                  </div>
                </div>
                {item.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-bold text-[#145BFF]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Featured
                  </span>
                )}
              </div>

              {item.courseTrack && (
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#145BFF]">
                  {item.courseTrack}
                </p>
              )}

              <blockquote className="mt-3 text-base leading-relaxed text-[#334155]">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
            </article>
          </div>
        </div>

        {/* Metadata Column */}
        <div className="space-y-5 lg:col-span-4">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Story Metadata
            </h3>
            <dl className="mt-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Hash className="h-3.5 w-3.5" /> Code &amp; Order
                </dt>
                <dd className="font-mono font-semibold text-[#0B1736]">
                  {item.testimonialCode} · #{item.displayOrder}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <GraduationCap className="h-3.5 w-3.5" /> Track
                </dt>
                <dd className="text-right font-semibold text-[#0B1736]">
                  {item.courseTrack}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Building2 className="h-3.5 w-3.5" /> Organization
                </dt>
                <dd className="text-right font-semibold text-[#0B1736]">
                  {item.company || '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Calendar className="h-3.5 w-3.5" /> Last Updated
                </dt>
                <dd className="font-medium text-[#334155] tabular-nums">
                  {formatShortDate(item.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </MobileModalShell>
  );
}
