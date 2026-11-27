import { ChevronRight, Eye, Info, Plus, RefreshCw, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  DocumentUploadList,
  ImageUploadZone,
} from '../../components/FileUploadZone';
import { MobileModalShell } from '../../components/MobileModalShell';
import {
  COURSE_FIELD_LIMITS,
  clampToMaxWords,
  countWords,
  generateNextDomainCode,
  generateUniqueSlug,
  slugifyText,
  validateCourseForm,
} from '../../utils/adminLogic';
import type {
  CourseDomain,
  CourseDomainFormPayload,
  CourseDomainStatus,
  CourseValidationErrors,
} from '../types/course';

interface CourseFormModalProps {
  open: boolean;
  editingCourse: CourseDomain | null;
  existingSlugs: string[];
  existingCodes: string[];
  defaultDisplayOrder: number;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: CourseDomainFormPayload) => Promise<void>;
  onPreviewDraft: (values: CourseDomainFormPayload) => void;
}

function getCounterTone(current: number, max: number): string {
  if (current >= max) return 'text-[#DC2626] font-semibold';
  if (current >= Math.floor(max * 0.85)) return 'text-[#D97706] font-semibold';
  return 'text-[#64748B]';
}

function buildInitialValues(
  editingCourse: CourseDomain | null,
  defaultDisplayOrder: number,
  existingCodes: string[]
): CourseDomainFormPayload {
  if (editingCourse) {
    return {
      domainCode: editingCourse.domainCode,
      title: editingCourse.title,
      slug: editingCourse.slug,
      category: editingCourse.category,
      shortDescription: editingCourse.shortDescription,
      detailedSyllabus: editingCourse.detailedSyllabus,
      coverImage: editingCourse.coverImage,
      coverImageName: editingCourse.coverImageName || 'domain-cover.jpg',
      tags: editingCourse.tags,
      attachments: editingCourse.attachments,
      displayOrder: editingCourse.displayOrder,
      status: editingCourse.status,
    };
  }

  return {
    domainCode: generateNextDomainCode(existingCodes),
    title: '',
    slug: '',
    category: '',
    shortDescription: '',
    detailedSyllabus: '',
    coverImage: '',
    coverImageName: '',
    tags: [],
    attachments: [],
    displayOrder: defaultDisplayOrder,
    status: 'Published',
  };
}

export function CourseFormModal({
  open,
  editingCourse,
  existingSlugs,
  existingCodes,
  defaultDisplayOrder,
  submitting,
  onClose,
  onSubmit,
  onPreviewDraft,
}: CourseFormModalProps) {
  const [values, setValues] = useState<CourseDomainFormPayload>(() =>
    buildInitialValues(editingCourse, defaultDisplayOrder, existingCodes)
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(editingCourse)
  );
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<CourseValidationErrors>({});
  const activeSessionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      activeSessionKeyRef.current = null;
      return;
    }
    const sessionKey = editingCourse ? `edit:${editingCourse.id}` : 'create';
    if (activeSessionKeyRef.current === sessionKey) {
      return;
    }
    activeSessionKeyRef.current = sessionKey;
    setValues(
      buildInitialValues(editingCourse, defaultDisplayOrder, existingCodes)
    );
    setSlugManuallyEdited(Boolean(editingCourse));
    setTagInput('');
    setErrors({});
  }, [open, editingCourse, defaultDisplayOrder, existingCodes]);

  const updateField = <K extends keyof CourseDomainFormPayload>(
    field: K,
    val: CourseDomainFormPayload[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTitleChange = (rawTitle: string) => {
    const title = clampToMaxWords(rawTitle, COURSE_FIELD_LIMITS.titleMaxWords);
    setValues((prev) => ({
      ...prev,
      title,
      slug: slugManuallyEdited
        ? prev.slug
        : generateUniqueSlug(title, existingSlugs, editingCourse?.slug),
    }));
    setErrors((prev) => ({ ...prev, title: undefined, slug: undefined }));
  };

  const handleManualSlugChange = (rawSlug: string) => {
    setSlugManuallyEdited(true);
    updateField('slug', slugifyText(rawSlug));
  };

  const handleRegenerateUniqueSlug = () => {
    const source = values.title.trim() || values.slug.trim() || 'domain';
    const nextUnique = generateUniqueSlug(
      source,
      existingSlugs,
      editingCourse?.slug
    );
    setSlugManuallyEdited(false);
    updateField('slug', nextUnique);
  };

  const handleAddTag = () => {
    if (values.tags.length >= COURSE_FIELD_LIMITS.maxTags) return;
    const cleaned = slugifyText(tagInput);
    if (!cleaned) return;
    if (!values.tags.includes(cleaned)) {
      updateField('tags', [...values.tags, cleaned]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateField(
      'tags',
      values.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleSubmitWithStatus = async (
    targetStatus: CourseDomainStatus,
    e?: FormEvent
  ) => {
    e?.preventDefault();
    if (submitting) return;
    const candidate: CourseDomainFormPayload = {
      ...values,
      status: targetStatus,
    };
    const nextErrors = validateCourseForm(
      candidate,
      existingSlugs,
      editingCourse?.slug
    );
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    await onSubmit(candidate);
  };

  const isDuplicateSlug =
    Boolean(values.slug) &&
    existingSlugs.some(
      (s) => s === values.slug && s !== editingCourse?.slug
    );

  const shortDescWords = countWords(values.shortDescription);
  const syllabusWords = countWords(values.detailedSyllabus);

  return (
    <MobileModalShell
      open={open}
      fullScreen
      title={
        editingCourse ? 'Edit Course / Domain' : 'Create New Course / Domain'
      }
      subtitle="Published items sync dynamically to website Core Domains and Batches course tracks."
      titleId="course-form-modal-title"
      busy={submitting}
      onClose={onClose}
      asForm
      onFormSubmit={(e) => void handleSubmitWithStatus(values.status, e)}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => onPreviewDraft(values)}
            className="inline-flex h-[40px] w-full items-center justify-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#0F172A] shadow-xs transition-colors hover:bg-[#F8FAFC] sm:w-auto"
          >
            <Eye className="h-4 w-4 shrink-0 text-[#145BFF]" />
            <span>Preview</span>
          </button>

          <div className="grid grid-cols-1 gap-2 min-[350px]:grid-cols-2 sm:flex sm:items-center">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="hidden h-[40px] rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#475569] shadow-xs transition-colors hover:bg-[#F8FAFC] sm:inline-flex sm:items-center"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmitWithStatus('Draft')}
              className="h-[40px] w-full min-w-0 rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#0F172A] shadow-xs transition-colors hover:bg-[#F8FAFC] disabled:opacity-50 sm:w-auto"
            >
              {submitting ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmitWithStatus('Published')}
              className="h-[40px] w-full min-w-0 rounded-lg bg-[#145BFF] px-5 text-[13px] font-semibold text-white shadow-xs transition-colors hover:bg-[#0F4AD6] disabled:opacity-50 sm:w-auto whitespace-nowrap"
            >
              {submitting
                ? 'Saving…'
                : editingCourse
                  ? 'Save & Publish'
                  : 'Publish Domain'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-3.5 py-2.5 text-xs leading-relaxed text-[#1E3A8A]">
          <Info className="h-4 w-4 shrink-0 text-[#145BFF]" />
          <span>
            Fields marked <strong className="text-[#DC2626]">*</strong> are
            required.
          </span>
        </div>

        {Object.keys(errors).length > 0 && (
          <div
            role="alert"
            className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-2.5 text-xs font-medium text-[#B91C1C]"
          >
            Please review the highlighted fields before saving.
          </div>
        )}

        {/* Section 1: Identity & Classification */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
          <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Course / Domain Identity
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
              <div className="md:col-span-5">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="course-title"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Course / Domain Title <span className="text-[#DC2626]">*</span>
                  </label>
                  <span
                    className={`text-[11px] tabular-nums ${getCounterTone(
                      values.title.length,
                      COURSE_FIELD_LIMITS.titleMaxChars
                    )}`}
                  >
                    {values.title.length}/{COURSE_FIELD_LIMITS.titleMaxChars}
                  </span>
                </div>
                <input
                  id="course-title"
                  type="text"
                  required
                  maxLength={COURSE_FIELD_LIMITS.titleMaxChars}
                  value={values.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., Red Hat or Cloud Security"
                  className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${errors.title
                    ? 'border-[#DC2626] focus:border-[#DC2626]'
                    : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs font-medium text-[#DC2626]">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="md:col-span-4">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="course-slug"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Auto URL Slug <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] tabular-nums ${getCounterTone(
                        values.slug.length,
                        COURSE_FIELD_LIMITS.slugMaxChars
                      )}`}
                    >
                      {values.slug.length}/{COURSE_FIELD_LIMITS.slugMaxChars}
                    </span>
                    <button
                      type="button"
                      onClick={handleRegenerateUniqueSlug}
                      title="Regenerate unique URL slug from title"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#145BFF] hover:underline"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Unique</span>
                    </button>
                  </div>
                </div>
                <input
                  id="course-slug"
                  type="text"
                  required
                  maxLength={COURSE_FIELD_LIMITS.slugMaxChars}
                  inputMode="url"
                  value={values.slug}
                  onChange={(e) => handleManualSlugChange(e.target.value)}
                  placeholder="red-hat"
                  className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 font-mono text-[13px] text-[#0F172A] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${errors.slug || isDuplicateSlug
                    ? 'border-[#DC2626] focus:border-[#DC2626]'
                    : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                />
                <p className="mt-1 truncate font-mono text-[11px] text-[#64748B]">
                  URL: /training/{values.slug || 'auto-generated-slug'}
                </p>
                {(errors.slug || isDuplicateSlug) && (
                  <p className="mt-0.5 text-xs font-medium text-[#DC2626]">
                    {errors.slug ||
                      'This slug already exists. Click "Unique" or modify it.'}
                  </p>
                )}
              </div>

              <div className="md:col-span-3">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="course-code"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Domain Code
                  </label>
                </div>
                <input
                  id="course-code"
                  type="text"
                  readOnly
                  aria-readonly="true"
                  value={values.domainCode}
                  title="Auto-incremented unique domain code assigned sequentially by backend"
                  className="mt-1 h-[40px] w-full cursor-not-allowed rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 font-mono text-[13px] font-semibold text-[#475569] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#64748B]">
                  Backend unique auto-increment code
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
              <div className="md:col-span-6">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="course-category"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Website Category <span className="text-[#DC2626]">*</span>
                  </label>
                  <span
                    className={`text-[11px] tabular-nums ${getCounterTone(
                      values.category.length,
                      COURSE_FIELD_LIMITS.categoryMaxChars
                    )}`}
                  >
                    {values.category.length}/{COURSE_FIELD_LIMITS.categoryMaxChars}
                  </span>
                </div>
                <input
                  id="course-category"
                  type="text"
                  required
                  maxLength={COURSE_FIELD_LIMITS.categoryMaxChars}
                  value={values.category}
                  onChange={(e) =>
                    updateField(
                      'category',
                      clampToMaxWords(
                        e.target.value,
                        COURSE_FIELD_LIMITS.categoryMaxWords
                      )
                    )
                  }
                  placeholder="e.g., Enterprise Linux, Cloud Infrastructure, Networking"
                  className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${errors.category
                    ? 'border-[#DC2626] focus:border-[#DC2626]'
                    : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                />
                {errors.category && (
                  <p className="mt-1 text-xs font-medium text-[#DC2626]">
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="md:col-span-3">
                <label
                  htmlFor="course-order"
                  className="block text-[12.5px] font-semibold text-[#334155]"
                >
                  Display Order <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  id="course-order"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={999}
                  value={values.displayOrder}
                  onChange={(e) =>
                    updateField(
                      'displayOrder',
                      Math.min(999, Math.max(0, Number(e.target.value) || 0))
                    )
                  }
                  className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] tabular-nums transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${errors.displayOrder
                    ? 'border-[#DC2626]'
                    : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                />
                {errors.displayOrder && (
                  <p className="mt-1 text-xs font-medium text-[#DC2626]">
                    {errors.displayOrder}
                  </p>
                )}
              </div>

              <div className="md:col-span-3">
                <label
                  htmlFor="course-status"
                  className="block text-[12.5px] font-semibold text-[#334155]"
                >
                  Publish Status
                </label>
                <div className="relative">
                  <select
                    id="course-status"
                    value={values.status}
                    onChange={(e) =>
                      updateField('status', e.target.value as CourseDomainStatus)
                    }
                    className="mt-1 h-[40px] w-full min-w-0 appearance-none rounded-lg border border-[#CBD5E1] bg-white py-1.5 pr-8 pl-3 text-[13px] font-medium text-[#0F172A] transition-colors focus:border-[#145BFF] focus:ring-1 focus:ring-[#145BFF] focus:outline-none"
                  >
                    <option value="Published">Published (Live)</option>
                    <option value="Draft">Draft (Hidden)</option>
                  </select>
                  <ChevronRight
                    className="pointer-events-none absolute top-1/2 right-2.5 mt-0.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Description, Syllabus & Tags */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
          <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Website Domain Content
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="course-short-desc"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Domain Description <span className="text-[#DC2626]">*</span>
                  </label>
                  <span
                    className={`text-[11px] tabular-nums ${getCounterTone(
                      shortDescWords,
                      COURSE_FIELD_LIMITS.shortDescriptionMaxWords
                    )}`}
                  >
                    {shortDescWords} /{' '}
                    {COURSE_FIELD_LIMITS.shortDescriptionMaxWords} words
                  </span>
                </div>
                <textarea
                  id="course-short-desc"
                  rows={4}
                  maxLength={COURSE_FIELD_LIMITS.shortDescriptionMaxChars}
                  value={values.shortDescription}
                  onChange={(e) =>
                    updateField(
                      'shortDescription',
                      clampToMaxWords(
                        e.target.value,
                        COURSE_FIELD_LIMITS.shortDescriptionMaxWords
                      )
                    )
                  }
                  placeholder="Displayed live inside the Core Domains section on your public website…"
                  className={`mt-1 w-full rounded-lg border bg-white p-3 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${errors.shortDescription
                    ? 'border-[#DC2626]'
                    : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                />
                {errors.shortDescription && (
                  <p className="mt-1 text-xs font-medium text-[#DC2626]">
                    {errors.shortDescription}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="course-syllabus"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Detailed Syllabus Topics (optional, one per line)
                  </label>
                  <span
                    className={`text-[11px] tabular-nums ${getCounterTone(
                      syllabusWords,
                      COURSE_FIELD_LIMITS.detailedSyllabusMaxWords
                    )}`}
                  >
                    {syllabusWords} /{' '}
                    {COURSE_FIELD_LIMITS.detailedSyllabusMaxWords} words
                  </span>
                </div>
                <textarea
                  id="course-syllabus"
                  rows={4}
                  maxLength={COURSE_FIELD_LIMITS.detailedSyllabusMaxChars}
                  value={values.detailedSyllabus}
                  onChange={(e) =>
                    updateField(
                      'detailedSyllabus',
                      clampToMaxWords(
                        e.target.value,
                        COURSE_FIELD_LIMITS.detailedSyllabusMaxWords
                      )
                    )
                  }
                  placeholder={
                    'Optional module breakdown, e.g.\n1. Core Fundamentals\n2. Live Lab Practice'
                  }
                  className={`mt-1 w-full rounded-lg border bg-white p-3 text-[13px] leading-relaxed text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${errors.detailedSyllabus
                    ? 'border-[#DC2626]'
                    : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                />
                {errors.detailedSyllabus && (
                  <p className="mt-1 text-xs font-medium text-[#DC2626]">
                    {errors.detailedSyllabus}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="course-tag-input"
                  className="block text-[12.5px] font-semibold text-[#334155]"
                >
                  Keywords / Tags
                </label>
                <span
                  className={`text-[11px] tabular-nums ${getCounterTone(
                    values.tags.length,
                    COURSE_FIELD_LIMITS.maxTags
                  )}`}
                >
                  {values.tags.length} / {COURSE_FIELD_LIMITS.maxTags} tags
                </span>
              </div>
              <div className="mt-1 flex min-w-0 gap-2">
                <input
                  id="course-tag-input"
                  type="text"
                  maxLength={COURSE_FIELD_LIMITS.tagMaxChars}
                  disabled={values.tags.length >= COURSE_FIELD_LIMITS.maxTags}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder={
                    values.tags.length >= COURSE_FIELD_LIMITS.maxTags
                      ? 'Maximum 10 tags reached'
                      : 'e.g. rhel-9, aws, ccna (press Enter)'
                  }
                  className="h-[40px] min-w-0 flex-1 rounded-lg border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#0F172A] transition-colors focus:border-[#145BFF] focus:ring-1 focus:ring-[#145BFF] focus:outline-none disabled:bg-[#F8FAFC]"
                />
                <button
                  type="button"
                  disabled={values.tags.length >= COURSE_FIELD_LIMITS.maxTags}
                  onClick={handleAddTag}
                  className="inline-flex h-[40px] shrink-0 items-center gap-1 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-4 text-[13px] font-semibold text-[#0F172A] transition-colors hover:bg-[#EFF6FF] hover:text-[#145BFF] disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span>Add</span>
                </button>
              </div>
              {values.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {values.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className="inline-flex h-[28px] items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-[#F1F5F9] px-2.5 text-xs font-medium text-[#334155] transition-colors hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                    >
                      <span>{tag}</span>
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Media & Syllabus Documents */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
          <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Thumbnail &amp; Syllabus Documents
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ImageUploadZone
              label="Course / Domain Thumbnail"
              uploadFolder="courses"
              valueUrl={values.coverImage}
              fileName={values.coverImageName}
              onChange={(url, name) => {
                updateField('coverImage', url);
                updateField('coverImageName', name);
              }}
              onRemove={() => {
                updateField('coverImage', '');
                updateField('coverImageName', '');
              }}
            />

            <DocumentUploadList
              label="Syllabus PDFs & Study Handouts"
              uploadFolder="courses"
              files={values.attachments}
              onAddFiles={(newFiles) =>
                updateField('attachments', [
                  ...values.attachments,
                  ...newFiles,
                ])
              }
              onRemoveFile={(id) =>
                updateField(
                  'attachments',
                  values.attachments.filter((f) => f.id !== id)
                )
              }
              onReplaceFile={(id, replacement) =>
                updateField(
                  'attachments',
                  values.attachments.map((f) => (f.id === id ? replacement : f))
                )
              }
            />
          </div>
        </section>
      </div>
    </MobileModalShell>
  );
}
