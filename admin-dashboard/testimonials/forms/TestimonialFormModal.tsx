import {
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { containsDangerousMarkup } from '../../../src/utils/scrollMath';
import { ImageUploadZone } from '../../components/FileUploadZone';
import { MobileModalShell } from '../../components/MobileModalShell';
import { testimonialsAdminService } from '../services/testimonialsService';
import type {
  StudentTestimonial,
  TestimonialFormPayload,
  TestimonialStatus,
  TestimonialValidationErrors,
} from '../types/testimonial';

interface TestimonialFormModalProps {
  open: boolean;
  editingItem: StudentTestimonial | null;
  existingCodes: string[];
  domainSuggestions: string[];
  defaultDisplayOrder: number;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: TestimonialFormPayload) => Promise<void>;
  onPreviewDraft: (values: TestimonialFormPayload) => void;
}

type FormTabId = 'student' | 'quoteMedia';

function generateNextCodeLocal(existingCodes: string[]): string {
  const nums = existingCodes
    .map((c) => /TEST-(\d+)$/i.exec(c.trim()))
    .filter((m): m is RegExpExecArray => Boolean(m))
    .map((m) => Number(m[1]));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `TEST-${String(next).padStart(3, '0')}`;
}

function validateValues(
  v: TestimonialFormPayload
): TestimonialValidationErrors {
  const errors: TestimonialValidationErrors = {};
  if (v.studentName.trim().length < 2) {
    errors.studentName = 'Student name must contain at least 2 characters.';
  } else if (containsDangerousMarkup(v.studentName)) {
    errors.studentName = 'Student name cannot contain HTML tags or < > brackets.';
  }
  if (v.role.trim().length < 2) {
    errors.role = 'Role / job title must contain at least 2 characters.';
  } else if (containsDangerousMarkup(v.role)) {
    errors.role = 'Role cannot contain HTML tags or < > brackets.';
  }
  if (v.courseTrack.trim().length < 2) {
    errors.courseTrack = 'Please select or enter a course track.';
  } else if (containsDangerousMarkup(v.courseTrack)) {
    errors.courseTrack = 'Course track cannot contain HTML tags or < > brackets.';
  }
  if (v.quote.trim().length < 10) {
    errors.quote = 'Testimonial quote must contain at least 10 characters.';
  } else if (v.quote.trim().length > 2000) {
    errors.quote = 'Quote cannot exceed 2000 characters.';
  } else if (containsDangerousMarkup(v.quote)) {
    errors.quote = 'Quote cannot contain HTML tags or script markup.';
  }
  if (!Number.isFinite(v.displayOrder) || v.displayOrder < 1) {
    errors.displayOrder = 'Display order must be 1 or greater.';
  }
  return errors;
}

function buildInitial(
  editingItem: StudentTestimonial | null,
  defaultDisplayOrder: number,
  existingCodes: string[],
  firstTrack: string
): TestimonialFormPayload {
  if (editingItem) {
    return {
      testimonialCode: editingItem.testimonialCode,
      studentName: editingItem.studentName,
      role: editingItem.role,
      company: editingItem.company,
      courseTrack: editingItem.courseTrack,
      quote: editingItem.quote,
      avatarUrl: editingItem.avatarUrl,
      avatarName: editingItem.avatarName,
      featured: Boolean(editingItem.featured),
      displayOrder: editingItem.displayOrder,
      status: editingItem.status,
    };
  }

  return {
    testimonialCode: generateNextCodeLocal(existingCodes),
    studentName: '',
    role: '',
    company: '',
    courseTrack: firstTrack || 'Linux & Network Security',
    quote: '',
    avatarUrl: '',
    avatarName: '',
    featured: true,
    displayOrder: defaultDisplayOrder,
    status: 'Published',
  };
}

export function TestimonialFormModal({
  open,
  editingItem,
  existingCodes,
  domainSuggestions,
  defaultDisplayOrder,
  submitting,
  onClose,
  onSubmit,
  onPreviewDraft,
}: TestimonialFormModalProps) {
  const trackOptions = useMemo(() => {
    const merged = Array.from(
      new Set([
        ...domainSuggestions,
        'Linux & Network Security',
        'Red Hat Linux (RHEL) & Windows Server',
        'Cisco CCNA & Enterprise Networking',
        ...(editingItem?.courseTrack ? [editingItem.courseTrack] : []),
      ])
    ).filter(Boolean);
    return merged;
  }, [domainSuggestions, editingItem]);

  const [values, setValues] = useState<TestimonialFormPayload>(() =>
    buildInitial(
      editingItem,
      defaultDisplayOrder,
      existingCodes,
      trackOptions[0] ?? ''
    )
  );
  const [activeTab, setActiveTab] = useState<FormTabId>('student');
  const [customTrackMode, setCustomTrackMode] = useState(false);
  const [errors, setErrors] = useState<TestimonialValidationErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const initial = buildInitial(
      editingItem,
      defaultDisplayOrder,
      existingCodes,
      trackOptions[0] ?? ''
    );
    setValues(initial);
    setActiveTab('student');
    setCustomTrackMode(false);
    setErrors({});
    setSubmitAttempted(false);

    if (!editingItem) {
      void testimonialsAdminService
        .getNextCode()
        .then((code) => {
          setValues((prev) =>
            prev.testimonialCode ? { ...prev, testimonialCode: code } : prev
          );
        })
        .catch(() => {
          // Fallback sequential local code already set
        });
    }
  }, [open, editingItem, defaultDisplayOrder, existingCodes, trackOptions]);

  const liveErrors = validateValues(values);
  const hasStudentErrors = Boolean(
    liveErrors.studentName ||
      liveErrors.role ||
      liveErrors.courseTrack ||
      liveErrors.displayOrder
  );
  const hasQuoteMediaErrors = Boolean(liveErrors.quote);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const vErrors = validateValues(values);
    setErrors(vErrors);
    if (Object.keys(vErrors).length > 0) {
      if (
        vErrors.studentName ||
        vErrors.role ||
        vErrors.courseTrack ||
        vErrors.displayOrder
      ) {
        setActiveTab('student');
      } else {
        setActiveTab('quoteMedia');
      }
      return;
    }

    await onSubmit({
      ...values,
      studentName: values.studentName.trim(),
      role: values.role.trim(),
      company: values.company.trim(),
      courseTrack: values.courseTrack.trim(),
      quote: values.quote.trim(),
    });
  };

  return (
    <MobileModalShell
      open={open}
      fullScreen
      title={
        editingItem
          ? `Edit Testimonial (${editingItem.testimonialCode})`
          : 'Add Student Testimonial'
      }
      subtitle="Saved directly to MySQL (student_testimonials) and rendered live on /testimonials & Home"
      titleId="testimonial-form-modal-title"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPreviewDraft(values)}
              className="inline-flex h-[42px] items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-4 text-xs font-semibold text-[#0B1736] hover:bg-[#F8FAFC]"
            >
              <Eye className="h-4 w-4 text-[#145BFF]" />
              <span>Preview Card</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            {activeTab === 'quoteMedia' ? (
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className="inline-flex h-[42px] items-center justify-center gap-1 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC]"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="h-[42px] rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
            )}

            {activeTab === 'student' ? (
              <button
                type="button"
                onClick={() => setActiveTab('quoteMedia')}
                className="inline-flex h-[42px] items-center justify-center gap-1 rounded-xl bg-[#0B1736] px-5 text-sm font-semibold text-white hover:bg-[#1E293B]"
              >
                <span>Next: Quote &amp; Photo</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="testimonial-form"
                disabled={submitting}
                className="h-[42px] rounded-xl bg-[#145BFF] px-6 text-sm font-semibold text-white shadow-xs hover:bg-[#0F4AD6] disabled:opacity-60"
              >
                {submitting
                  ? 'Saving…'
                  : editingItem
                    ? 'Save Testimonial'
                    : 'Create Testimonial'}
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="mx-auto max-w-4xl space-y-5">
        {/* 2-Tab Navigation Bar */}
        <div
          role="tablist"
          aria-label="Testimonial editor sections"
          className="grid grid-cols-2 gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'student'}
            onClick={() => setActiveTab('student')}
            className={`relative flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'student'
                ? 'bg-white text-[#145BFF] shadow-xs'
                : 'text-[#64748B] hover:text-[#0B1736]'
            }`}
          >
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span>1. Student &amp; Course</span>
            {submitAttempted && hasStudentErrors && (
              <span
                className="h-2 w-2 rounded-full bg-[#DC2626]"
                aria-label="Validation error in Student tab"
              />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'quoteMedia'}
            onClick={() => setActiveTab('quoteMedia')}
            className={`relative flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'quoteMedia'
                ? 'bg-white text-[#145BFF] shadow-xs'
                : 'text-[#64748B] hover:text-[#0B1736]'
            }`}
          >
            <ImageIcon className="h-4 w-4 shrink-0" />
            <span>2. Quote, Photo &amp; Publish</span>
            {submitAttempted && hasQuoteMediaErrors && (
              <span
                className="h-2 w-2 rounded-full bg-[#DC2626]"
                aria-label="Validation error in Quote and Photo tab"
              />
            )}
          </button>
        </div>

        <form
          id="testimonial-form"
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
          className="space-y-5"
        >
          {activeTab === 'student' && (
            <div className="space-y-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="test-code"
                    className="block text-xs font-semibold text-[#0B1736]"
                  >
                    Testimonial Code
                  </label>
                  <input
                    id="test-code"
                    type="text"
                    maxLength={32}
                    value={values.testimonialCode}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        testimonialCode: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Enter testimonial code"
                    className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 font-mono text-sm font-semibold text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="test-student-name"
                    className="block text-xs font-semibold text-[#0B1736]"
                  >
                    Student Full Name *
                  </label>
                  <input
                    id="test-student-name"
                    type="text"
                    maxLength={120}
                    value={values.studentName}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, studentName: e.target.value }))
                    }
                    placeholder="Enter student full name"
                    className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
                  />
                  {(submitAttempted || errors.studentName) &&
                    liveErrors.studentName && (
                      <p className="mt-1 text-xs text-[#DC2626]">
                        {liveErrors.studentName}
                      </p>
                    )}
                </div>

                <div>
                  <label
                    htmlFor="test-order"
                    className="block text-xs font-semibold text-[#0B1736]"
                  >
                    Display Order *
                  </label>
                  <input
                    id="test-order"
                    type="number"
                    min={1}
                    value={values.displayOrder}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        displayOrder: Math.max(1, Number(e.target.value) || 1),
                      }))
                    }
                    className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0B1736] tabular-nums focus:border-[#145BFF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="test-role"
                    className="block text-xs font-semibold text-[#0B1736]"
                  >
                    Placed Role / Designation *
                  </label>
                  <input
                    id="test-role"
                    type="text"
                    maxLength={150}
                    value={values.role}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, role: e.target.value }))
                    }
                    placeholder="Enter job role or designation"
                    className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
                  />
                  {(submitAttempted || errors.role) && liveErrors.role && (
                    <p className="mt-1 text-xs text-[#DC2626]">
                      {liveErrors.role}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="test-company"
                    className="block text-xs font-semibold text-[#0B1736]"
                  >
                    Hiring Organization / Company
                  </label>
                  <input
                    id="test-company"
                    type="text"
                    maxLength={150}
                    value={values.company}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, company: e.target.value }))
                    }
                    placeholder="Enter company or organization"
                    className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="test-track"
                    className="block text-xs font-semibold text-[#0B1736]"
                  >
                    Course / Training Track *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomTrackMode((m) => !m)}
                    className="text-xs font-semibold text-[#145BFF] hover:underline"
                  >
                    {customTrackMode
                      ? 'Choose from Course Domains'
                      : 'Enter custom track name'}
                  </button>
                </div>
                {customTrackMode ? (
                  <input
                    id="test-track"
                    type="text"
                    maxLength={150}
                    value={values.courseTrack}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, courseTrack: e.target.value }))
                    }
                    placeholder="Enter course or training track"
                    className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
                  />
                ) : (
                  <select
                    id="test-track"
                    value={values.courseTrack}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, courseTrack: e.target.value }))
                    }
                    className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
                  >
                    {trackOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
                {(submitAttempted || errors.courseTrack) &&
                  liveErrors.courseTrack && (
                    <p className="mt-1 text-xs text-[#DC2626]">
                      {liveErrors.courseTrack}
                    </p>
                  )}
              </div>
            </div>
          )}

          {activeTab === 'quoteMedia' && (
            <div className="space-y-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="test-quote"
                    className="block text-xs font-semibold text-[#0B1736]"
                  >
                    Verified Student Testimonial Quote *
                  </label>
                  <span className="text-[11px] text-[#64748B] tabular-nums">
                    {values.quote.length}/2000 chars
                  </span>
                </div>
                <textarea
                  id="test-quote"
                  rows={5}
                  maxLength={2000}
                  value={values.quote}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, quote: e.target.value }))
                  }
                  placeholder="Write what the learner experienced in hands-on lab sessions and how it helped them succeed in interviews…"
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
                />
                {(submitAttempted || errors.quote) && liveErrors.quote && (
                  <p className="mt-1 text-xs text-[#DC2626]">
                    {liveErrors.quote}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <ImageUploadZone
                  label="Student Portrait Photo"
                  helperText="JPG, PNG, or WebP · Uploaded into /uploads/testimonials/"
                  valueUrl={values.avatarUrl}
                  fileName={values.avatarName}
                  uploadFolder="testimonials"
                  onChange={(url, fileName) =>
                    setValues((v) => ({
                      ...v,
                      avatarUrl: url,
                      avatarName: fileName,
                    }))
                  }
                  onRemove={() =>
                    setValues((v) => ({
                      ...v,
                      avatarUrl: '',
                      avatarName: '',
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="test-status"
                    className="block text-xs font-semibold text-[#0B1736]"
                  >
                    Publish Visibility
                  </label>
                  <select
                    id="test-status"
                    value={values.status}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        status: e.target.value as TestimonialStatus,
                      }))
                    }
                    className="mt-1.5 h-[42px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm font-medium text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
                  >
                    <option value="Published">Published (Visible live)</option>
                    <option value="Draft">Draft (Admin only)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex h-[42px] w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#CBD5E1] bg-white px-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1736]">
                      <Sparkles className="h-4 w-4 text-[#145BFF]" />
                      Feature on Homepage
                    </span>
                    <input
                      type="checkbox"
                      checked={values.featured}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, featured: e.target.checked }))
                      }
                      className="h-4 w-4 accent-[#145BFF]"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </MobileModalShell>
  );
}
