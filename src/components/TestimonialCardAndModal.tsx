import type { StudentTestimonial } from '../services/testimonialsService';
import { PublicDetailModal } from './PublicDetailModal';
import { SafeImage } from './SafeImage';
import { TruncatedTextWithMore } from './TruncatedTextWithMore';

interface TestimonialCardProps {
  testimonial: StudentTestimonial;
  onOpenModal: (item: StudentTestimonial) => void;
  avatarSizeClass?: string;
}

/**
 * Shared uniform-height testimonial card with clamped quote and "More" trigger.
 */
export function TestimonialCard({
  testimonial,
  onOpenModal,
  avatarSizeClass = 'w-14 h-14',
}: TestimonialCardProps) {
  const companyAndRole = [testimonial.company, testimonial.role]
    .filter(Boolean)
    .join(' | ');

  return (
    <article className="flex h-full flex-col justify-between rounded-[22px] border border-black/[0.04] bg-[#F5F5F5] p-6 sm:p-7 dark:border-white/[0.06] dark:bg-[#2C2C2D]">
      <div>
        <div className="flex items-center gap-3.5">
          <div
            className={`${avatarSizeClass} rounded-full overflow-hidden shrink-0 ring-2 ring-[#5E67E6]/25 dark:ring-[#D0FF71]/35 bg-[#5E67E6]/15 dark:bg-[#D0FF71]/15 flex items-center justify-center text-[#5E67E6] dark:text-[#D0FF71] font-display text-[20px] font-bold`}
          >
            {testimonial.avatarUrl ? (
              <SafeImage
                src={testimonial.avatarUrl}
                alt={testimonial.studentName}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              testimonial.studentName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-[16px] font-semibold text-[#303030] dark:text-white line-clamp-1">
              {testimonial.studentName}
            </h4>
            {companyAndRole && (
              <p className="mt-0.5 text-[12.5px] font-medium text-[#5E67E6] dark:text-[#D0FF71] leading-snug line-clamp-1">
                {companyAndRole}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <TruncatedTextWithMore
            as="blockquote"
            lines={4}
            prefix="“"
            suffix="”"
            text={testimonial.quote}
            className="text-[14.5px] sm:text-[15px] font-light leading-[1.6] text-[#303030] dark:text-white/85"
            ariaLabel={`Read full testimonial from ${testimonial.studentName}`}
            onMore={() => onOpenModal(testimonial)}
          />
        </div>
      </div>

      {testimonial.courseTrack && (
        <div className="mt-5 pt-3 border-t border-[#E2E2E4] dark:border-[#3A3A3D]">
          <span className="block text-[12.5px] font-medium text-[#5C5C5C] dark:text-white/65 line-clamp-1">
            {testimonial.courseTrack}
          </span>
        </div>
      )}
    </article>
  );
}

interface TestimonialDetailModalProps {
  testimonial: StudentTestimonial | null;
  onClose: () => void;
}

/**
 * Modal displaying the full unclipped student review and placement context.
 */
export function TestimonialDetailModal({
  testimonial,
  onClose,
}: TestimonialDetailModalProps) {
  const companyAndRole = testimonial
    ? [testimonial.company, testimonial.role].filter(Boolean).join(' | ')
    : '';

  return (
    <PublicDetailModal
      open={Boolean(testimonial)}
      onClose={onClose}
      titleId="student-testimonial-modal-title"
      closeLabel="Close student testimonial"
      maxWidthClass="max-w-[640px]"
    >
      {testimonial && (
        <div className="p-6 sm:p-8 pr-14">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden shrink-0 ring-2 ring-[#5E67E6]/30 dark:ring-[#D0FF71]/40 bg-[#5E67E6]/15 dark:bg-[#D0FF71]/15 flex items-center justify-center text-[#5E67E6] dark:text-[#D0FF71] font-display text-[22px] font-bold">
              {testimonial.avatarUrl ? (
                <SafeImage
                  src={testimonial.avatarUrl}
                  alt={testimonial.studentName}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                testimonial.studentName.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h3
                id="student-testimonial-modal-title"
                className="font-display text-[24px] sm:text-[28px] font-bold uppercase leading-tight text-[#303030] dark:text-white"
              >
                {testimonial.studentName}
              </h3>
              {companyAndRole && (
                <p className="mt-0.5 text-[13.5px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                  {companyAndRole}
                </p>
              )}
            </div>
          </div>

          {testimonial.courseTrack && (
            <div className="mt-4">
              <span className="inline-block rounded-full bg-[#5E67E6]/10 dark:bg-[#D0FF71]/15 px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#5E67E6] dark:text-[#D0FF71]">
                {testimonial.courseTrack}
              </span>
            </div>
          )}

          <blockquote className="mt-5 whitespace-pre-line text-[15.5px] sm:text-[16px] font-light leading-[1.7] text-[#303030] dark:text-white/85">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>
        </div>
      )}
    </PublicDetailModal>
  );
}
