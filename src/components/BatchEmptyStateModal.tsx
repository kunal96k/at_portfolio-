import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  BellRing,
  CalendarOff,
  CheckCircle2,
  Mail,
  MessageSquare,
  Phone,
  X,
} from 'lucide-react';
import { PROFILE } from '../data/portfolioData';
import { usePublicCourses } from '../hooks/usePublicCourses';
import type { CourseDomain } from '../services/coursesService';
import { submitContactEnquiry } from '../services/enquiryApi';
import {
  containsDangerousMarkup,
  isValidEmail,
  isValidPhone,
  PUBLIC_INPUT_LIMITS,
  sanitizePhoneInput,
} from '../utils/scrollMath';

interface BatchEmptyStateModalProps {
  open: boolean;
  initialCategory?: string;
  onClose: () => void;
  onContactClick?: () => void;
  onNavigate?: (path: string) => void;
}

const GENERAL_WAITLIST_OPTION = '1-on-1 Fast-Track / Corporate Training';

function resolveTrackDefault(
  cat: string | undefined,
  courses: CourseDomain[],
  options: string[]
): string {
  const firstOption = options[0] || GENERAL_WAITLIST_OPTION;
  if (!cat || cat === 'All') {
    return firstOption;
  }
  const normalizedCat = cat.trim().toLowerCase();
  const matchedCourse = courses.find(
    (c) =>
      c.category.trim().toLowerCase() === normalizedCat ||
      c.category.trim().toLowerCase().includes(normalizedCat) ||
      c.title.trim().toLowerCase().includes(normalizedCat)
  );
  if (matchedCourse?.title.trim()) {
    return matchedCourse.title.trim();
  }
  return firstOption;
}

export function BatchEmptyStateModal({
  open,
  initialCategory,
  onClose,
  onContactClick,
  onNavigate,
}: BatchEmptyStateModalProps) {
  const { courses } = usePublicCourses();

  const trackOptions = useMemo(() => {
    const dynamicTitles = Array.from(
      new Map(
        courses
          .map((c) => c.title.trim())
          .filter(Boolean)
          .map((title) => [title.toLowerCase(), title])
      ).values()
    );
    if (!dynamicTitles.some((t) => t.toLowerCase() === GENERAL_WAITLIST_OPTION.toLowerCase())) {
      dynamicTitles.push(GENERAL_WAITLIST_OPTION);
    }
    return dynamicTitles;
  }, [courses]);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [track, setTrack] = useState(() =>
    resolveTrackDefault(initialCategory, courses, trackOptions)
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setTrack((prev) => {
      if (prev && trackOptions.includes(prev) && (!initialCategory || initialCategory === 'All')) {
        return prev;
      }
      return resolveTrackDefault(initialCategory, courses, trackOptions);
    });
  }, [open, initialCategory, courses, trackOptions]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanContact = contact.trim();

    if (!cleanName || cleanName.length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }
    if (cleanName.length > PUBLIC_INPUT_LIMITS.nameMax || containsDangerousMarkup(cleanName)) {
      setError('Please enter a valid name without HTML tags or special brackets (< >).');
      return;
    }
    if (!cleanContact || containsDangerousMarkup(cleanContact)) {
      setError('Please enter a valid email address or phone number.');
      return;
    }

    const isEmail = cleanContact.includes('@');
    if (isEmail && !isValidEmail(cleanContact)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!isEmail && !isValidPhone(cleanContact)) {
      setError('Please provide a valid 7–15 digit phone number (or email address).');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await submitContactEnquiry({
        name: cleanName,
        email: isEmail ? cleanContact : 'waitlist-callback@arvindthevar.in',
        phone: !isEmail ? cleanContact : undefined,
        service: `${track} (Batch Waitlist)`,
        message: `Requested schedule alert when the next "${track}" batch opens.`,
        sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/upcoming-batches',
        channel: 'Batch Waitlist Modal',
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message.trim()
          ? err.message
          : 'Unable to submit your waitlist request right now. Please try again or contact us directly.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const modalTree = (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="batch-empty-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-[#1A1A1B]/70 backdrop-blur-xs"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-[#E5E5E5] bg-white shadow-2xl sm:max-w-lg sm:rounded-[26px] dark:border-[#3A3A3D] dark:bg-[#222224]"
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#EAEAEA] px-5 py-4 sm:px-6 dark:border-[#343437]">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5E67E6]/10 px-3 py-1 text-[11.5px] font-semibold uppercase tracking-wide text-[#5E67E6] dark:bg-[#D0FF71]/15 dark:text-[#D0FF71]">
                  <CalendarOff className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Batch Schedule Notice</span>
                </span>
                <h2
                  id="batch-empty-modal-title"
                  className="mt-2 font-display text-[24px] font-bold uppercase leading-[1.1] text-[#303030] sm:text-[28px] dark:text-white"
                >
                  NO BATCHES OPEN RIGHT NOW
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close notice modal"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] text-[#303030] transition-colors hover:bg-[#EAEAEA] dark:bg-[#2E2E30] dark:text-white dark:hover:bg-[#3A3A3D] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <p className="text-[14.5px] leading-[1.6] font-light text-[#5C5C5C] dark:text-white/75">
                {initialCategory && initialCategory !== 'All'
                  ? `There are currently no published ${initialCategory} batches scheduled on the calendar.`
                  : 'New upcoming training batch dates are currently being finalized.'}{' '}
                Leave your contact details below to get notified first when new seats open, or reach out directly for custom 1-on-1 / corporate timings.
              </p>

              {submitted ? (
                <div className="mt-5 rounded-2xl border border-[#5E67E6]/25 bg-[#5E67E6]/5 p-5 dark:border-[#D0FF71]/30 dark:bg-[#D0FF71]/10">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#5E67E6] dark:text-[#D0FF71]"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-semibold text-[#303030] dark:text-white">
                        You&apos;re on the Priority Batch Waitlist!
                      </p>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-[#5C5C5C] dark:text-white/75">
                        Thank you, <span className="font-medium text-[#303030] dark:text-white">{name}</span>. We&apos;ll notify you at{' '}
                        <span className="font-medium text-[#303030] dark:text-white">{contact}</span> as soon as the{' '}
                        <span className="font-medium text-[#5E67E6] dark:text-[#D0FF71]">{track}</span> schedule is published.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setName('');
                          setContact('');
                          onClose();
                        }}
                        className="mt-4 rounded-full bg-[#5E67E6] px-5 py-2 text-[13px] font-semibold text-white hover:opacity-90 dark:bg-[#D0FF71] dark:text-[#1A1A1B] cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3.5">
                  <div>
                    <label
                      htmlFor="waitlist-track"
                      className="block text-[13px] font-medium text-[#303030] dark:text-white/90"
                    >
                      Preferred Course Track
                    </label>
                    <select
                      id="waitlist-track"
                      value={track}
                      onChange={(e) => setTrack(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#E2E2E4] bg-[#F8F8FA] px-3.5 text-[14px] text-[#303030] focus:border-[#5E67E6] focus:outline-none dark:border-[#3A3A3D] dark:bg-[#2C2C2E] dark:text-white dark:focus:border-[#D0FF71]"
                    >
                      {trackOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="waitlist-name"
                        className="block text-[13px] font-medium text-[#303030] dark:text-white/90"
                      >
                        Your Name
                      </label>
                      <input
                        id="waitlist-name"
                        type="text"
                        maxLength={PUBLIC_INPUT_LIMITS.nameMax}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setError(null);
                        }}
                        placeholder="Enter your full name"
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#E2E2E4] bg-[#F8F8FA] px-3.5 text-[14px] text-[#303030] focus:border-[#5E67E6] focus:outline-none dark:border-[#3A3A3D] dark:bg-[#2C2C2E] dark:text-white dark:focus:border-[#D0FF71]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="waitlist-contact"
                        className="block text-[13px] font-medium text-[#303030] dark:text-white/90"
                      >
                        Email or Phone Number
                      </label>
                      <input
                        id="waitlist-contact"
                        type="text"
                        maxLength={PUBLIC_INPUT_LIMITS.emailMax}
                        value={contact}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const next =
                            !raw.includes('@') && /^[+\d\s().-]+$/.test(raw)
                              ? sanitizePhoneInput(raw)
                              : raw;
                          setContact(next);
                          setError(null);
                        }}
                        placeholder="Enter your email or phone number"
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#E2E2E4] bg-[#F8F8FA] px-3.5 text-[14px] text-[#303030] focus:border-[#5E67E6] focus:outline-none dark:border-[#3A3A3D] dark:bg-[#2C2C2E] dark:text-white dark:focus:border-[#D0FF71]"
                      />
                    </div>
                  </div>

                  {error && (
                    <p role="alert" className="text-[12.5px] font-medium text-[#E53935] dark:text-[#FF7B7B]">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#5E67E6] px-5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-[#D0FF71] dark:text-[#1A1A1B] cursor-pointer"
                  >
                    <BellRing className="h-4 w-4" aria-hidden="true" />
                    <span>{submitting ? 'Submitting…' : 'Notify Me When Batch Starts'}</span>
                  </button>
                </form>
              )}

              {/* Direct Quick Contact Strip */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#EAEAEA] pt-4 text-[13px] dark:border-[#343437]">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={PROFILE.phoneHref}
                    className="inline-flex items-center gap-1.5 font-medium text-[#303030] hover:text-[#5E67E6] dark:text-white/85 dark:hover:text-[#D0FF71]"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#5E67E6] dark:text-[#D0FF71]" />
                    <span className="tabular-nums">{PROFILE.phone}</span>
                  </a>
                  <a
                    href={`mailto:${PROFILE.email}`}
                    className="inline-flex items-center gap-1.5 font-medium text-[#303030] hover:text-[#5E67E6] dark:text-white/85 dark:hover:text-[#D0FF71]"
                  >
                    <Mail className="h-3.5 w-3.5 text-[#5E67E6] dark:text-[#D0FF71]" />
                    <span>{PROFILE.email}</span>
                  </a>
                </div>

                {(onContactClick || onNavigate) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onContactClick) {
                        onContactClick();
                      } else if (onNavigate) {
                        onNavigate('/contact');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#5E67E6] hover:underline dark:text-[#D0FF71] cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Full Enquiry Form</span>
                  </button>
                )}
              </div>
            </div>

            {/* Footer Clearance */}
            <div
              style={{
                paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
              }}
              className="flex shrink-0 items-center justify-between gap-3 border-t border-[#EAEAEA] bg-[#FAFAFC] px-5 pt-3.5 sm:px-6 dark:border-[#343437] dark:bg-[#1C1C1E]"
            >
              {onNavigate ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('/resources');
                  }}
                  className="text-[13px] font-medium text-[#5C5C5C] hover:text-[#5E67E6] dark:text-white/70 dark:hover:text-[#D0FF71] cursor-pointer"
                >
                  Browse Free Study Notes &rarr;
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#303030]/20 px-4 py-1.5 text-[13px] font-medium text-[#303030] hover:bg-[#303030] hover:text-white dark:border-white/20 dark:text-white dark:hover:bg-white dark:hover:text-[#1A1A1B] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalTree, document.body);
}
