import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  Layers,
  Plus,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  COURSES_UPDATED_EVENT,
  fetchAllCoursesFromApiOrStorage,
  loadPublicCoursesFromStorage,
  type CourseDomain,
} from '../../../src/services/coursesService';
import {
  normalizeDateForInput,
  normalizeTimeForInput,
} from '../../../src/services/batchesService';
import {
  DocumentUploadList,
  ImageUploadZone,
} from '../../components/FileUploadZone';
import { MobileModalShell } from '../../components/MobileModalShell';
import {
  BATCH_FIELD_LIMITS,
  clampToMaxWords,
  countWords,
  generateNextBatchCode,
  generateUniqueSlug,
  slugifyText,
  validateBatchForm,
} from '../../utils/adminLogic';
import { batchService } from '../services/batchService';
import type {
  Batch,
  BatchCategory,
  BatchFormValues,
  BatchLearningLevel,
  BatchStatus,
  BatchValidationErrors,
} from '../types/batch';

interface BatchFormModalProps {
  open: boolean;
  editingBatch: Batch | null;
  existingSlugs: string[];
  existingCodes: string[];
  defaultDisplayOrder: number;
  availableCourseTracks?: string[];
  availableCourseCategories?: string[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: BatchFormValues) => Promise<void>;
  onPreviewDraft: (values: BatchFormValues) => void;
}

type BatchFormTabId = 'identity' | 'schedule' | 'media';

const DEFAULT_BATCH_CATEGORIES: string[] = [
  'Linux',
  'Networking',
  'Cloud',
  'DevOps',
];

const SAMPLE_COVER_PRESETS = [
  {
    label: 'Linux RHEL Lab',
    url: '/assets/images/linux_rhel_lab_1795164484674.jpg',
    name: 'linux_rhel_lab_1795164484674.jpg',
  },
  {
    label: 'Cisco Network Rack',
    url: '/assets/images/cisco_network_lab_1795164486189.jpg',
    name: 'cisco_network_lab_1795164486189.jpg',
  },
  {
    label: 'AWS Cloud Desk',
    url: '/assets/images/aws_cloud_infra_1795164482369.jpg',
    name: 'aws_cloud_infra_1795164482369.jpg',
  },
  {
    label: 'DevOps Workshop',
    url: '/assets/images/corporate_it_workshop_1795164484663.jpg',
    name: 'corporate_it_workshop_1795164484663.jpg',
  },
];

const MODE_OPTIONS = [
  'Online Live',
  'Live Lab-Driven Training',
  'Classroom & Online',
  'Corporate Workshop',
];

function getCounterTone(current: number, max: number): string {
  if (current >= max) return 'text-[#DC2626] font-semibold';
  if (current >= Math.floor(max * 0.85)) return 'text-[#D97706] font-semibold';
  return 'text-[#64748B]';
}

function getTodayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildInitialValues(
  editingBatch: Batch | null,
  defaultDisplayOrder: number,
  existingCodes: string[],
  defaultCourseTrack: string,
  defaultCategory: string
): BatchFormValues {
  if (editingBatch) {
    return {
      batchCode: editingBatch.batchCode,
      title: editingBatch.title,
      slug: editingBatch.slug,
      shortDescription: editingBatch.shortDescription,
      detailedContent: editingBatch.detailedContent,
      category: editingBatch.category,
      relatedCourse: editingBatch.relatedCourse,
      batchDate:
        normalizeDateForInput(editingBatch.batchDate) || getTodayIsoDate(),
      batchTime: normalizeTimeForInput(editingBatch.batchTime) || '19:00',
      mode: editingBatch.mode || 'Online Live',
      seatsTotal: editingBatch.seatsTotal,
      location: editingBatch.location,
      coverImage: editingBatch.coverImage,
      coverImageName: editingBatch.coverImageName || 'cover-image.jpg',
      tags: editingBatch.tags,
      learningLevel: editingBatch.learningLevel,
      attachments: editingBatch.attachments,
      displayOrder: editingBatch.displayOrder,
      featured: Boolean(editingBatch.featured),
      status: editingBatch.status,
    };
  }

  return {
    batchCode: generateNextBatchCode(existingCodes),
    title: '',
    slug: '',
    shortDescription: '',
    detailedContent: '',
    category: (defaultCategory || 'Linux') as BatchCategory,
    relatedCourse: defaultCourseTrack,
    batchDate: getTodayIsoDate(),
    batchTime: '19:00',
    mode: 'Online Live',
    seatsTotal: 20,
    location: 'Online Live / Nashik Classroom',
    coverImage: SAMPLE_COVER_PRESETS[0].url,
    coverImageName: SAMPLE_COVER_PRESETS[0].name,
    tags: [],
    learningLevel: 'Intermediate',
    attachments: [],
    displayOrder: defaultDisplayOrder,
    featured: false,
    status: 'Published',
  };
}

export function BatchFormModal({
  open,
  editingBatch,
  existingSlugs,
  existingCodes,
  defaultDisplayOrder,
  availableCourseTracks,
  availableCourseCategories,
  submitting,
  onClose,
  onSubmit,
  onPreviewDraft,
}: BatchFormModalProps) {
  const [liveCourses, setLiveCourses] = useState<CourseDomain[]>(() =>
    loadPublicCoursesFromStorage()
  );
  const [activeTab, setActiveTab] = useState<BatchFormTabId>('identity');
  const [values, setValues] = useState<BatchFormValues>(() =>
    buildInitialValues(
      editingBatch,
      defaultDisplayOrder,
      existingCodes,
      availableCourseTracks?.[0] ?? liveCourses[0]?.title ?? '',
      availableCourseCategories?.[0] ?? liveCourses[0]?.category ?? 'Linux'
    )
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(editingBatch)
  );
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<BatchValidationErrors>({});
  const activeSessionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const syncCourses = () => {
      void fetchAllCoursesFromApiOrStorage().then((res) => {
        if (!active) return;
        if (res.fromBackend || res.items.length > 0) {
          setLiveCourses(res.items);
        }
      });
    };
    syncCourses();
    window.addEventListener(COURSES_UPDATED_EVENT, syncCourses);
    return () => {
      active = false;
      window.removeEventListener(COURSES_UPDATED_EVENT, syncCourses);
    };
  }, []);

  const courseTrackOptions = useMemo(() => {
    const liveTitles = liveCourses.map((c) => c.title.trim()).filter(Boolean);
    const merged = [
      ...(liveTitles.length > 0 ? liveTitles : availableCourseTracks ?? []),
      ...(values.relatedCourse ? [values.relatedCourse] : []),
    ];
    return Array.from(
      new Map(
        merged
          .map((c) => c.trim())
          .filter(Boolean)
          .map((c) => [c.toLowerCase(), c])
      ).values()
    );
  }, [liveCourses, availableCourseTracks, values.relatedCourse]);

  const categoryOptions = useMemo(() => {
    const dynamicCategories = liveCourses
      .map((c) => c.category.trim())
      .filter(Boolean);
    const merged = [
      ...dynamicCategories,
      ...(availableCourseCategories ?? []),
      ...DEFAULT_BATCH_CATEGORIES,
    ];
    return Array.from(
      new Map(
        merged
          .map((c) => c.trim())
          .filter(Boolean)
          .map((c) => [c.toLowerCase(), c])
      ).values()
    );
  }, [liveCourses, availableCourseCategories]);

  useEffect(() => {
    if (!open) {
      activeSessionKeyRef.current = null;
      return;
    }
    const sessionKey = editingBatch ? `edit:${editingBatch.id}` : 'create';
    if (activeSessionKeyRef.current === sessionKey) {
      return;
    }
    activeSessionKeyRef.current = sessionKey;

    const firstCourseTitle =
      liveCourses[0]?.title.trim() || availableCourseTracks?.[0] || '';
    const firstCourseCategory =
      liveCourses[0]?.category.trim() ||
      availableCourseCategories?.[0] ||
      'Linux';

    const initial = buildInitialValues(
      editingBatch,
      defaultDisplayOrder,
      existingCodes,
      firstCourseTitle,
      firstCourseCategory
    );
    setValues(initial);
    setActiveTab('identity');

    const matchesCategoryCatalog = categoryOptions.some(
      (cat) => cat.toLowerCase() === String(initial.category).trim().toLowerCase()
    );
    setCustomCategoryMode(
      Boolean(initial.category) && !matchesCategoryCatalog
    );
    setSlugManuallyEdited(Boolean(editingBatch));
    setTagInput('');
    setErrors({});

    if (!editingBatch) {
      let active = true;
      void batchService.getNextBatchCode().then((nextCode) => {
        if (!active) return;
        setValues((prev) => ({ ...prev, batchCode: nextCode }));
      });
      return () => {
        active = false;
      };
    }
  }, [
    open,
    editingBatch,
    defaultDisplayOrder,
    existingCodes,
    liveCourses,
    availableCourseTracks,
    availableCourseCategories,
    categoryOptions,
  ]);

  // If course catalog finished loading after opening Create modal, auto-populate empty course track
  useEffect(() => {
    if (!open || editingBatch) return;
    if (!values.relatedCourse && courseTrackOptions.length > 0) {
      const matched = liveCourses.find(
        (c) => c.title.trim().toLowerCase() === courseTrackOptions[0].toLowerCase()
      );
      setValues((prev) => ({
        ...prev,
        relatedCourse: prev.relatedCourse || courseTrackOptions[0],
        category: (matched?.category?.trim() || prev.category) as BatchCategory,
      }));
    }
  }, [open, editingBatch, values.relatedCourse, courseTrackOptions, liveCourses]);

  const updateField = <K extends keyof BatchFormValues>(
    field: K,
    val: BatchFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCourseTrackChange = (selectedTitle: string) => {
    const matchedCourse = liveCourses.find(
      (c) => c.title.trim().toLowerCase() === selectedTitle.trim().toLowerCase()
    );
    setValues((prev) => ({
      ...prev,
      relatedCourse: selectedTitle,
      category:
        !editingBatch && matchedCourse?.category?.trim()
          ? (matchedCourse.category.trim() as BatchCategory)
          : prev.category,
    }));
    setErrors((prev) => ({ ...prev, relatedCourse: undefined }));
  };

  const handleTitleChange = (rawTitle: string) => {
    const title = clampToMaxWords(rawTitle, BATCH_FIELD_LIMITS.titleMaxWords);
    setValues((prev) => ({
      ...prev,
      title,
      slug: slugManuallyEdited
        ? prev.slug
        : generateUniqueSlug(title, existingSlugs, editingBatch?.slug),
    }));
    setErrors((prev) => ({ ...prev, title: undefined, slug: undefined }));
  };

  const handleManualSlugChange = (rawSlug: string) => {
    setSlugManuallyEdited(true);
    updateField('slug', slugifyText(rawSlug));
  };

  const handleRegenerateUniqueSlug = () => {
    const source = values.title.trim() || values.slug.trim() || 'batch';
    const nextUnique = generateUniqueSlug(
      source,
      existingSlugs,
      editingBatch?.slug
    );
    setSlugManuallyEdited(false);
    updateField('slug', nextUnique);
  };

  const handleAddTag = () => {
    if (values.tags.length >= BATCH_FIELD_LIMITS.maxTags) return;
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
    targetStatus: BatchStatus,
    e?: FormEvent
  ) => {
    e?.preventDefault();
    if (submitting) return;
    const candidate: BatchFormValues = {
      ...values,
      status: targetStatus,
    };
    const nextErrors = validateBatchForm(
      candidate,
      existingSlugs,
      editingBatch?.slug
    );
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (
        nextErrors.title ||
        nextErrors.slug ||
        nextErrors.relatedCourse ||
        nextErrors.displayOrder
      ) {
        setActiveTab('identity');
      } else if (
        nextErrors.batchDate ||
        nextErrors.batchTime ||
        nextErrors.shortDescription ||
        nextErrors.detailedContent
      ) {
        setActiveTab('schedule');
      }
      return;
    }
    await onSubmit(candidate);
  };

  const isDuplicateSlug =
    Boolean(values.slug) &&
    existingSlugs.some(
      (s) => s === values.slug && s !== editingBatch?.slug
    );

  const shortDescWords = countWords(values.shortDescription);
  const detailedWords = countWords(values.detailedContent);

  const hasIdentityErrors = Boolean(
    errors.title ||
      errors.slug ||
      isDuplicateSlug ||
      errors.relatedCourse ||
      errors.displayOrder
  );
  const hasScheduleErrors = Boolean(
    errors.batchDate ||
      errors.batchTime ||
      errors.shortDescription ||
      errors.detailedContent
  );

  const tabs: Array<{
    id: BatchFormTabId;
    stepNum: number;
    label: string;
    icon: typeof Layers;
    hasError: boolean;
  }> = [
    {
      id: 'identity',
      stepNum: 1,
      label: 'Identity & Course',
      icon: Layers,
      hasError: hasIdentityErrors,
    },
    {
      id: 'schedule',
      stepNum: 2,
      label: 'Schedule & Syllabus',
      icon: CalendarClock,
      hasError: hasScheduleErrors,
    },
    {
      id: 'media',
      stepNum: 3,
      label: 'Cover, Files & Publish',
      icon: ImageIcon,
      hasError: false,
    },
  ];

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);

  const selectClass =
    'mt-1 h-[40px] w-full min-w-0 appearance-none rounded-lg border border-[#CBD5E1] bg-white py-1.5 pr-8 pl-3 text-[13px] font-medium text-[#0F172A] focus:border-[#145BFF] focus:ring-1 focus:ring-[#145BFF] focus:outline-none transition-colors';

  const moduleLinesCount = values.detailedContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean).length;

  return (
    <MobileModalShell
      open={open}
      fullScreen
      title={editingBatch ? 'Edit Batch Schedule' : 'Create New Batch'}
      subtitle="Switch tabs below or use Previous / Next to configure Identity & Course, Schedule & Syllabus, and Cover Media without scrolling."
      titleId="batch-form-modal-title"
      busy={submitting}
      onClose={onClose}
      asForm
      onFormSubmit={(e) => void handleSubmitWithStatus(values.status, e)}
      footer={
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {currentTabIndex > 0 && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => setActiveTab(tabs[currentTabIndex - 1].id)}
                className="inline-flex h-[40px] items-center justify-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-3.5 text-[13px] font-semibold text-[#0F172A] shadow-xs hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 text-[#475569]" />
                <span>Previous</span>
              </button>
            )}
            {currentTabIndex < tabs.length - 1 && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => setActiveTab(tabs[currentTabIndex + 1].id)}
                className="inline-flex h-[40px] items-center justify-center gap-1 rounded-lg border border-[#145BFF]/30 bg-[#EFF6FF] px-4 text-[13px] font-semibold text-[#145BFF] shadow-xs hover:bg-[#DBEAFE] disabled:opacity-50"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onPreviewDraft(values)}
              className="inline-flex h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3.5 text-[13px] font-semibold text-[#0F172A] shadow-xs hover:bg-[#F8FAFC]"
            >
              <Eye className="h-4 w-4 shrink-0 text-[#145BFF]" />
              <span>Preview</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="h-[40px] w-full min-w-0 rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#475569] shadow-xs transition-colors hover:bg-[#F8FAFC] disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmitWithStatus('Draft')}
              className="h-[40px] w-full min-w-0 rounded-lg border border-[#145BFF] bg-white px-4 text-[13px] font-semibold text-[#145BFF] shadow-xs transition-colors hover:bg-[#EFF6FF] disabled:opacity-50 sm:w-auto whitespace-nowrap"
            >
              {submitting ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmitWithStatus('Published')}
              className="col-span-2 h-[40px] w-full min-w-0 rounded-lg bg-[#145BFF] px-5 text-[13px] font-semibold text-white shadow-xs transition-colors hover:bg-[#0F4AD6] disabled:opacity-50 sm:col-span-1 sm:w-auto whitespace-nowrap"
            >
              {submitting
                ? 'Publishing…'
                : editingBatch
                  ? 'Save & Publish'
                  : 'Publish Batch'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Sticky Top Section Tabs (matching BlogFormModal) */}
        <div
          role="tablist"
          aria-label="Training batch editor sections"
          className="grid grid-cols-1 gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 sm:grid-cols-3"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#145BFF] text-white shadow-xs'
                    : tab.hasError
                      ? 'border border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C]'
                      : 'bg-white text-[#334155] hover:bg-[#EFF6FF] hover:text-[#145BFF]'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {tab.stepNum}. {tab.label}
                  </span>
                </span>
                {tab.hasError && (
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      isActive ? 'bg-[#FECACA]' : 'bg-[#DC2626]'
                    }`}
                    title="Needs attention"
                  />
                )}
              </button>
            );
          })}
        </div>

        {Object.keys(errors).length > 0 && (
          <div
            role="alert"
            className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-2.5 text-xs font-medium text-[#B91C1C]"
          >
            Please review the highlighted fields before saving this batch.
          </div>
        )}

        {/* TAB 1: IDENTITY & COURSE */}
        {activeTab === 'identity' && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Batch Identity, Course Track &amp; Categorization
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
                <div className="md:col-span-5">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="batch-title"
                      className="block text-[12.5px] font-semibold text-[#334155]"
                    >
                      Batch Title <span className="text-[#DC2626]">*</span>
                    </label>
                    <span
                      className={`text-[11px] tabular-nums ${getCounterTone(
                        values.title.length,
                        BATCH_FIELD_LIMITS.titleMaxChars
                      )}`}
                    >
                      {values.title.length}/{BATCH_FIELD_LIMITS.titleMaxChars}
                    </span>
                  </div>
                  <input
                    id="batch-title"
                    type="text"
                    required
                    maxLength={BATCH_FIELD_LIMITS.titleMaxChars}
                    value={values.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Red Hat Linux (RHEL)"
                    className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                      errors.title
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
                      htmlFor="batch-slug"
                      className="block text-[12.5px] font-semibold text-[#334155]"
                    >
                      SEO URL Slug <span className="text-[#DC2626]">*</span>
                    </label>
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
                  <input
                    id="batch-slug"
                    type="text"
                    required
                    maxLength={BATCH_FIELD_LIMITS.slugMaxChars}
                    inputMode="url"
                    value={values.slug}
                    onChange={(e) => handleManualSlugChange(e.target.value)}
                    placeholder="red-hat-linux-rhel-batch"
                    className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 font-mono text-[13px] text-[#0F172A] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                      errors.slug || isDuplicateSlug
                        ? 'border-[#DC2626] focus:border-[#DC2626]'
                        : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                  />
                  <p className="mt-1 truncate font-mono text-[11px] text-[#64748B]">
                    URL: /upcoming-batches/{values.slug || 'auto-generated-slug'}
                  </p>
                  {(errors.slug || isDuplicateSlug) && (
                    <p className="mt-0.5 text-xs font-medium text-[#DC2626]">
                      {errors.slug ||
                        'This slug already exists. Click "Unique" or modify it.'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label
                    htmlFor="batch-code"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Batch Code
                  </label>
                  <input
                    id="batch-code"
                    type="text"
                    readOnly
                    aria-readonly="true"
                    value={values.batchCode}
                    title="Auto-generated sequential batch code (authoritatively assigned by backend sequence)"
                    className="mt-1 h-[40px] w-full cursor-not-allowed rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 font-mono text-[13px] font-semibold text-[#475569] focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-[#64748B]">
                    Auto-incremented backend code
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label
                    htmlFor="batch-course"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Course Track <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="batch-course"
                      value={values.relatedCourse}
                      onChange={(e) => handleCourseTrackChange(e.target.value)}
                      className={selectClass}
                    >
                      {courseTrackOptions.length === 0 ? (
                        <option value="">No courses published yet</option>
                      ) : (
                        courseTrackOptions.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronRight
                      className="pointer-events-none absolute top-1/2 right-2.5 mt-0.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
                      aria-hidden="true"
                    />
                  </div>
                  {errors.relatedCourse && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.relatedCourse}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="batch-category"
                      className="block text-[12.5px] font-semibold text-[#334155]"
                    >
                      Website Category <span className="text-[#DC2626]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomCategoryMode((prev) => !prev)}
                      className="text-[11px] font-semibold text-[#145BFF] hover:underline"
                    >
                      {customCategoryMode ? 'Use list' : 'Custom'}
                    </button>
                  </div>
                  {customCategoryMode ? (
                    <input
                      id="batch-category"
                      type="text"
                      value={values.category}
                      onChange={(e) =>
                        updateField('category', e.target.value as BatchCategory)
                      }
                      placeholder="e.g., Security & Firewalls"
                      className="mt-1 h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-[13px] font-medium text-[#0F172A] focus:border-[#145BFF] focus:ring-1 focus:ring-[#145BFF] focus:outline-none"
                    />
                  ) : (
                    <div className="relative">
                      <select
                        id="batch-category"
                        value={values.category}
                        onChange={(e) =>
                          updateField(
                            'category',
                            e.target.value as BatchCategory
                          )
                        }
                        className={selectClass}
                      >
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <ChevronRight
                        className="pointer-events-none absolute top-1/2 right-2.5 mt-0.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="batch-level"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Learning Level
                  </label>
                  <div className="relative">
                    <select
                      id="batch-level"
                      value={values.learningLevel}
                      onChange={(e) =>
                        updateField(
                          'learningLevel',
                          e.target.value as BatchLearningLevel
                        )
                      }
                      className={selectClass}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <ChevronRight
                      className="pointer-events-none absolute top-1/2 right-2.5 mt-0.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="batch-order"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Display Order
                  </label>
                  <input
                    id="batch-order"
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
                    className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] tabular-nums transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                      errors.displayOrder
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
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: SCHEDULE & SYLLABUS */}
        {activeTab === 'schedule' && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Schedule Timing, Overview &amp; Curriculum Modules
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label
                    htmlFor="batch-date"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Start Date <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    id="batch-date"
                    type="date"
                    value={values.batchDate}
                    onChange={(e) => updateField('batchDate', e.target.value)}
                    className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                      errors.batchDate
                        ? 'border-[#DC2626]'
                        : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                  />
                  {errors.batchDate && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.batchDate}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="batch-time"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Batch Start Time <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    id="batch-time"
                    type="time"
                    value={values.batchTime}
                    onChange={(e) => updateField('batchTime', e.target.value)}
                    className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                      errors.batchTime
                        ? 'border-[#DC2626]'
                        : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                  />
                  {errors.batchTime && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.batchTime}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="batch-mode"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Delivery Mode
                  </label>
                  <div className="relative">
                    <select
                      id="batch-mode"
                      value={values.mode}
                      onChange={(e) => updateField('mode', e.target.value)}
                      className={selectClass}
                    >
                      {MODE_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <ChevronRight
                      className="pointer-events-none absolute top-1/2 right-2.5 mt-0.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label
                      htmlFor="batch-seats"
                      className="block text-[12.5px] font-semibold text-[#334155]"
                    >
                      Seats
                    </label>
                    <input
                      id="batch-seats"
                      type="number"
                      min={1}
                      max={500}
                      value={values.seatsTotal}
                      onChange={(e) =>
                        updateField(
                          'seatsTotal',
                          Math.min(500, Math.max(1, Number(e.target.value) || 20))
                        )
                      }
                      className="mt-1 h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-[13px] text-[#0F172A] tabular-nums focus:border-[#145BFF] focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center justify-between gap-1">
                      <label
                        htmlFor="batch-location"
                        className="block text-[12.5px] font-semibold text-[#334155]"
                      >
                        Location
                      </label>
                      <span
                        className={`text-[10.5px] tabular-nums ${getCounterTone(
                          values.location.length,
                          BATCH_FIELD_LIMITS.locationMaxChars
                        )}`}
                      >
                        {values.location.length}/
                        {BATCH_FIELD_LIMITS.locationMaxChars}
                      </span>
                    </div>
                    <input
                      id="batch-location"
                      type="text"
                      maxLength={BATCH_FIELD_LIMITS.locationMaxChars}
                      value={values.location}
                      onChange={(e) =>
                        updateField(
                          'location',
                          clampToMaxWords(
                            e.target.value,
                            BATCH_FIELD_LIMITS.locationMaxWords
                          )
                        )
                      }
                      placeholder="Nashik / Online"
                      className="mt-1 h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-[13px] text-[#0F172A] focus:border-[#145BFF] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="batch-short-desc"
                      className="block text-[12.5px] font-semibold text-[#334155]"
                    >
                      Short Summary <span className="text-[#DC2626]">*</span>
                    </label>
                    <span
                      className={`text-[11px] tabular-nums ${getCounterTone(
                        shortDescWords,
                        BATCH_FIELD_LIMITS.shortDescriptionMaxWords
                      )}`}
                    >
                      {shortDescWords} /{' '}
                      {BATCH_FIELD_LIMITS.shortDescriptionMaxWords} words
                    </span>
                  </div>
                  <textarea
                    id="batch-short-desc"
                    rows={4}
                    maxLength={BATCH_FIELD_LIMITS.shortDescriptionMaxChars}
                    value={values.shortDescription}
                    onChange={(e) =>
                      updateField(
                        'shortDescription',
                        clampToMaxWords(
                          e.target.value,
                          BATCH_FIELD_LIMITS.shortDescriptionMaxWords
                        )
                      )
                    }
                    placeholder="Brief 1–2 sentence overview displayed on website cards…"
                    className={`mt-1 w-full rounded-lg border bg-white p-3 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                      errors.shortDescription
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
                      htmlFor="batch-content"
                      className="block text-[12.5px] font-semibold text-[#334155]"
                    >
                      Key Lab Modules (one per line){' '}
                      <span className="text-[#DC2626]">*</span>
                    </label>
                    <span
                      className={`text-[11px] tabular-nums ${getCounterTone(
                        detailedWords,
                        BATCH_FIELD_LIMITS.detailedContentMaxWords
                      )}`}
                    >
                      {detailedWords} /{' '}
                      {BATCH_FIELD_LIMITS.detailedContentMaxWords} words
                    </span>
                  </div>
                  <textarea
                    id="batch-content"
                    rows={4}
                    maxLength={BATCH_FIELD_LIMITS.detailedContentMaxChars}
                    value={values.detailedContent}
                    onChange={(e) =>
                      updateField(
                        'detailedContent',
                        clampToMaxWords(
                          e.target.value,
                          BATCH_FIELD_LIMITS.detailedContentMaxWords
                        )
                      )
                    }
                    placeholder={
                      '1. Installation & Core Administration\n2. Storage, Networking & Security Labs\n3. Live Troubleshooting & Certification Prep'
                    }
                    className={`mt-1 w-full rounded-lg border bg-white p-3 text-[13px] leading-relaxed text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                      errors.detailedContent
                        ? 'border-[#DC2626]'
                        : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                  />
                  {errors.detailedContent && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.detailedContent}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="batch-tag-input"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Batch Tags
                  </label>
                  <span
                    className={`text-[11px] tabular-nums ${getCounterTone(
                      values.tags.length,
                      BATCH_FIELD_LIMITS.maxTags
                    )}`}
                  >
                    {values.tags.length} / {BATCH_FIELD_LIMITS.maxTags} tags
                  </span>
                </div>
                <div className="mt-1 flex min-w-0 gap-2">
                  <input
                    id="batch-tag-input"
                    type="text"
                    maxLength={BATCH_FIELD_LIMITS.tagMaxChars}
                    disabled={values.tags.length >= BATCH_FIELD_LIMITS.maxTags}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder={
                      values.tags.length >= BATCH_FIELD_LIMITS.maxTags
                        ? 'Maximum 10 tags reached'
                        : 'e.g. rhel-9, weekend, rhcsa (press Enter)'
                    }
                    className="h-[40px] min-w-0 flex-1 rounded-lg border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#0F172A] transition-colors focus:border-[#145BFF] focus:ring-1 focus:ring-[#145BFF] focus:outline-none disabled:bg-[#F8FAFC]"
                  />
                  <button
                    type="button"
                    disabled={values.tags.length >= BATCH_FIELD_LIMITS.maxTags}
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
        )}

        {/* TAB 3: COVER, FILES & PUBLISH */}
        {activeTab === 'media' && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Media, Brochures &amp; Publishing
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <ImageUploadZone
                    label="Batch Thumbnail / Cover Image"
                    uploadFolder="batches"
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
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-[#64748B]">
                      Quick presets:
                    </span>
                    {SAMPLE_COVER_PRESETS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => {
                          updateField('coverImage', preset.url);
                          updateField('coverImageName', preset.name);
                        }}
                        className="rounded-md border border-[#CBD5E1] bg-white px-2 py-0.5 text-[11px] font-medium text-[#475569] transition-colors hover:border-[#145BFF] hover:text-[#145BFF]"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <DocumentUploadList
                    label="Batch Brochure, Syllabus & Schedule PDFs"
                    uploadFolder="batches"
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
                        values.attachments.map((f) =>
                          f.id === id ? replacement : f
                        )
                      )
                    }
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] font-semibold text-[#0F172A]">
                      <input
                        type="checkbox"
                        checked={values.featured}
                        onChange={(e) =>
                          updateField('featured', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-[#CBD5E1] text-[#145BFF] focus:ring-[#145BFF]"
                      />
                      <Sparkles className="h-3.5 w-3.5 text-[#145BFF]" />
                      <span>Feature at top of Upcoming Batches</span>
                    </label>

                    <div className="relative shrink-0">
                      <select
                        aria-label="Batch publish status"
                        value={values.status}
                        onChange={(e) =>
                          updateField('status', e.target.value as BatchStatus)
                        }
                        className="h-[36px] appearance-none rounded-lg border border-[#CBD5E1] bg-white py-1 pr-7 pl-3 text-xs font-semibold text-[#0F172A] focus:border-[#145BFF] focus:outline-none"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                      </select>
                      <ChevronRight
                        className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs text-[#334155]">
                    <p className="font-bold text-[#0B1736]">Batch Summary</p>
                    <ul className="mt-2 space-y-1 text-[#475569]">
                      <li>
                        Title:{' '}
                        <strong className="text-[#0B1736]">
                          {values.title.trim() || 'Not set yet'}
                        </strong>
                      </li>
                      <li>
                        Course Track:{' '}
                        <strong className="text-[#0B1736]">
                          {values.relatedCourse.trim() || 'Not selected'}
                        </strong>{' '}
                        · Category:{' '}
                        <strong className="text-[#0B1736]">
                          {values.category || 'Linux'}
                        </strong>
                      </li>
                      <li>
                        Start Schedule:{' '}
                        <strong className="text-[#145BFF]">
                          {values.batchDate || 'Not set'} ·{' '}
                          {values.batchTime || 'Not set'}
                        </strong>{' '}
                        ({values.seatsTotal} seats)
                      </li>
                      <li>
                        Modules: {moduleLinesCount} · Tags: {values.tags.length}{' '}
                        · Files: {values.attachments.length}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </MobileModalShell>
  );
}
