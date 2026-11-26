import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  DocumentUploadList,
  ImageUploadZone,
} from '../../components/FileUploadZone';
import { MobileModalShell } from '../../components/MobileModalShell';
import {
  BLOG_FIELD_LIMITS,
  clampToMaxWords,
  countWords,
  generateNextBlogCode,
  generateUniqueSlug,
  slugifyText,
  validateBlogForm,
} from '../../utils/adminLogic';
import { blogService } from '../services/blogService';
import type {
  BlogArticle,
  BlogFormPayload,
  BlogSectionItem,
  BlogStatus,
  BlogValidationErrors,
} from '../types/blog';

interface BlogFormModalProps {
  open: boolean;
  editingBlog: BlogArticle | null;
  existingSlugs: string[];
  existingCodes: string[];
  defaultDisplayOrder: number;
  domainSuggestions?: string[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: BlogFormPayload) => Promise<void>;
  onPreviewDraft: (values: BlogFormPayload) => void;
}

type BlogFormTabId = 'identity' | 'content' | 'media';

const DEFAULT_BLOG_CATEGORIES = [
  'Training Philosophy',
  'Linux & RHEL',
  'Cisco Networking',
  'Cloud & Servers',
  'DevOps & Automation',
  'Network Security',
  'Career Guidance',
];

const SAMPLE_COVER_PRESETS = [
  {
    label: 'Troubleshooting Lab',
    url: '/assets/images/hands_on_troubleshooting_1795164485759.jpg',
    name: 'hands_on_troubleshooting_1795164485759.jpg',
  },
  {
    label: 'RHEL Server Lab',
    url: '/assets/images/linux_rhel_lab_1795164484674.jpg',
    name: 'linux_rhel_lab_1795164484674.jpg',
  },
  {
    label: 'Cisco Rack Lab',
    url: '/assets/images/cisco_network_lab_1795164486189.jpg',
    name: 'cisco_network_lab_1795164486189.jpg',
  },
  {
    label: 'AWS Cloud Lab',
    url: '/assets/images/aws_cloud_infra_1795164482369.jpg',
    name: 'aws_cloud_infra_1795164482369.jpg',
  },
];

function getCounterTone(current: number, max: number): string {
  if (current >= max) return 'text-[#DC2626] font-semibold';
  if (current >= Math.floor(max * 0.85)) return 'text-[#D97706] font-semibold';
  return 'text-[#64748B]';
}

function toLocalDateTimeInputValue(raw?: string | null): string {
  if (raw) {
    const trimmed = raw.trim();
    if (trimmed.length >= 16 && trimmed.includes('T')) {
      return trimmed.slice(0, 16);
    }
  }
  return '';
}

function getDefaultFutureScheduleInput(): string {
  const date = new Date(Date.now() + 15 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildInitialValues(
  editingBlog: BlogArticle | null,
  defaultDisplayOrder: number,
  existingCodes: string[]
): BlogFormPayload {
  if (editingBlog) {
    return {
      blogCode: editingBlog.blogCode,
      title: editingBlog.title,
      slug: editingBlog.slug,
      category: editingBlog.category,
      author: editingBlog.author || 'Arvind Thevar',
      readTime: editingBlog.readTime || '5 min read',
      guideLabel: editingBlog.guideLabel || 'Infrastructure Guide',
      excerpt: editingBlog.excerpt,
      sections:
        editingBlog.sections.length > 0
          ? editingBlog.sections.map((s) => ({
              heading: s.heading,
              body: s.body,
              images: s.images ? [...s.images] : [],
            }))
          : [{ heading: '', body: '', images: [] }],
      tags: [...editingBlog.tags],
      coverImage: editingBlog.coverImage,
      coverImageName: editingBlog.coverImageName || 'blog-cover.jpg',
      attachments: [...editingBlog.attachments],
      featured: Boolean(editingBlog.featured),
      displayOrder: editingBlog.displayOrder,
      status: editingBlog.status,
      scheduledAt: editingBlog.scheduledAt ?? null,
    };
  }

  return {
    blogCode: generateNextBlogCode(existingCodes),
    title: '',
    slug: '',
    category: '',
    author: 'Arvind Thevar',
    readTime: '6 min read',
    guideLabel: 'Infrastructure Guide',
    excerpt: '',
    sections: [{ heading: '', body: '', images: [] }],
    tags: [],
    coverImage: '/assets/images/cisco_network_lab_1795164486189.jpg',
    coverImageName: 'cisco_network_lab_1795164486189.jpg',
    attachments: [],
    featured: false,
    displayOrder: defaultDisplayOrder,
    status: 'Published',
    scheduledAt: null,
  };
}

export function BlogFormModal({
  open,
  editingBlog,
  existingSlugs,
  existingCodes,
  defaultDisplayOrder,
  domainSuggestions = [],
  submitting,
  onClose,
  onSubmit,
  onPreviewDraft,
}: BlogFormModalProps) {
  const mergedCategoryOptions = useMemo(
    () =>
      Array.from(
        new Map(
          [...domainSuggestions, ...DEFAULT_BLOG_CATEGORIES]
            .map((c) => c.trim())
            .filter(Boolean)
            .map((c) => [c.toLowerCase(), c])
        ).values()
      ),
    [domainSuggestions]
  );

  const [values, setValues] = useState<BlogFormPayload>(() =>
    buildInitialValues(editingBlog, defaultDisplayOrder, existingCodes)
  );
  const [activeTab, setActiveTab] = useState<BlogFormTabId>('identity');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(editingBlog)
  );
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<BlogValidationErrors>({});
  const activeSessionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      activeSessionKeyRef.current = null;
      return;
    }
    const sessionKey = editingBlog ? `edit:${editingBlog.id}` : 'create';
    if (activeSessionKeyRef.current === sessionKey) {
      return;
    }
    activeSessionKeyRef.current = sessionKey;

    const initial = buildInitialValues(
      editingBlog,
      defaultDisplayOrder,
      existingCodes
    );
    setValues(initial);
    setActiveTab('identity');
    const matchesCatalog =
      initial.category.trim() === '' ||
      mergedCategoryOptions.some(
        (cat) => cat.toLowerCase() === initial.category.trim().toLowerCase()
      );
    setCustomCategoryMode(!matchesCatalog);
    setSlugManuallyEdited(Boolean(editingBlog));
    setTagInput('');
    setErrors({});

    if (!editingBlog) {
      let active = true;
      void blogService.getNextBlogCode().then((code) => {
        if (active && code) {
          setValues((prev) => ({ ...prev, blogCode: code }));
        }
      });
      return () => {
        active = false;
      };
    }
  }, [
    open,
    editingBlog,
    defaultDisplayOrder,
    existingCodes,
    mergedCategoryOptions,
  ]);

  const updateField = <K extends keyof BlogFormPayload>(
    field: K,
    val: BlogFormPayload[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleStatusChange = (nextStatus: BlogStatus) => {
    setValues((prev) => ({
      ...prev,
      status: nextStatus,
      scheduledAt:
        nextStatus === 'Scheduled'
          ? prev.scheduledAt || `${getDefaultFutureScheduleInput()}:00`
          : null,
    }));
    if (errors.scheduledAt) {
      setErrors((prev) => ({ ...prev, scheduledAt: undefined }));
    }
  };

  const handleTitleChange = (rawTitle: string) => {
    const title = clampToMaxWords(rawTitle, BLOG_FIELD_LIMITS.titleMaxWords);
    setValues((prev) => ({
      ...prev,
      title,
      slug: slugManuallyEdited
        ? prev.slug
        : generateUniqueSlug(title, existingSlugs, editingBlog?.slug),
    }));
    setErrors((prev) => ({ ...prev, title: undefined, slug: undefined }));
  };

  const handleManualSlugChange = (rawSlug: string) => {
    setSlugManuallyEdited(true);
    updateField('slug', slugifyText(rawSlug));
  };

  const handleRegenerateUniqueSlug = () => {
    const source = values.title.trim() || values.slug.trim() || 'blog-article';
    const nextUnique = generateUniqueSlug(
      source,
      existingSlugs,
      editingBlog?.slug
    );
    setSlugManuallyEdited(false);
    updateField('slug', nextUnique);
  };

  const handleAddTag = () => {
    const cleaned = tagInput.trim().slice(0, BLOG_FIELD_LIMITS.tagMaxChars);
    if (!cleaned || values.tags.length >= BLOG_FIELD_LIMITS.maxTags) return;
    if (values.tags.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      setTagInput('');
      return;
    }
    updateField('tags', [...values.tags, cleaned]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateField(
      'tags',
      values.tags.filter((t) => t !== tagToRemove)
    );
  };

  const updateSection = (idx: number, patch: Partial<BlogSectionItem>) => {
    setValues((prev) => ({
      ...prev,
      sections: prev.sections.map((sec, i) =>
        i === idx ? { ...sec, ...patch } : sec
      ),
    }));
    if (errors.sections) {
      setErrors((prev) => ({ ...prev, sections: undefined }));
    }
  };

  const addSection = () => {
    if (values.sections.length >= 20) return;
    updateField('sections', [
      ...values.sections,
      { heading: '', body: '', images: [] },
    ]);
  };

  const removeSection = (idx: number) => {
    if (values.sections.length <= 1) {
      updateSection(0, { heading: '', body: '', images: [] });
      return;
    }
    updateField(
      'sections',
      values.sections.filter((_, i) => i !== idx)
    );
  };

  const moveSection = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= values.sections.length) return;
    const next = [...values.sections];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    updateField('sections', next);
  };

  const handleSubmitWithStatus = async (
    targetStatus: BlogStatus,
    e?: FormEvent
  ) => {
    e?.preventDefault();
    if (submitting) return;

    const cleanedSections = values.sections.filter(
      (sec) =>
        sec.heading.trim() !== '' ||
        sec.body.trim() !== '' ||
        (sec.images && sec.images.length > 0)
    );

    const normalizedSchedule =
      targetStatus === 'Scheduled'
        ? values.scheduledAt && values.scheduledAt.length === 16
          ? `${values.scheduledAt}:00`
          : values.scheduledAt || null
        : null;

    const candidate: BlogFormPayload = {
      ...values,
      sections: cleanedSections,
      status: targetStatus,
      scheduledAt: normalizedSchedule,
    };

    const nextErrors = validateBlogForm(
      candidate,
      existingSlugs,
      editingBlog?.slug
    );
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (
        nextErrors.title ||
        nextErrors.slug ||
        nextErrors.category ||
        nextErrors.author ||
        nextErrors.scheduledAt ||
        nextErrors.displayOrder
      ) {
        setActiveTab('identity');
      } else if (nextErrors.excerpt || nextErrors.sections) {
        setActiveTab('content');
      }
      return;
    }

    await onSubmit(candidate);
  };

  const isDuplicateSlug =
    Boolean(values.slug) &&
    existingSlugs.some((s) => s === values.slug && s !== editingBlog?.slug);

  const excerptWords = countWords(values.excerpt);

  const hasIdentityErrors = Boolean(
    errors.title ||
      errors.slug ||
      isDuplicateSlug ||
      errors.category ||
      errors.author ||
      errors.scheduledAt ||
      errors.displayOrder
  );
  const hasContentErrors = Boolean(errors.excerpt || errors.sections);

  const tabs: Array<{
    id: BlogFormTabId;
    stepNum: number;
    label: string;
    icon: typeof BookOpen;
    hasError: boolean;
  }> = [
    {
      id: 'identity',
      stepNum: 1,
      label: 'Identity & Schedule',
      icon: CalendarClock,
      hasError: hasIdentityErrors,
    },
    {
      id: 'content',
      stepNum: 2,
      label: 'Excerpt & Sections',
      icon: FileText,
      hasError: hasContentErrors,
    },
    {
      id: 'media',
      stepNum: 3,
      label: 'Cover & Files',
      icon: ImageIcon,
      hasError: false,
    },
  ];

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);

  const selectClass =
    'mt-1 h-[40px] w-full min-w-0 appearance-none rounded-lg border border-[#CBD5E1] bg-white py-1.5 pr-8 pl-3 text-[13px] font-medium text-[#0F172A] transition-colors focus:border-[#145BFF] focus:ring-1 focus:ring-[#145BFF] focus:outline-none';

  return (
    <MobileModalShell
      open={open}
      fullScreen
      title={editingBlog ? 'Edit Blog Article' : 'Create Blog Article'}
      subtitle="Switch tabs below or use Previous / Next to configure Identity & Schedule, Content Sections, and Cover Media without scrolling."
      titleId="blog-form-modal-title"
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
              <Eye className="h-4 w-4 text-[#145BFF]" />
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
              onClick={() =>
                void handleSubmitWithStatus(
                  values.status === 'Scheduled' ? 'Scheduled' : 'Published'
                )
              }
              className="col-span-2 h-[40px] w-full min-w-0 rounded-lg bg-[#145BFF] px-5 text-[13px] font-semibold text-white shadow-xs transition-colors hover:bg-[#0F4AD6] disabled:opacity-50 sm:col-span-1 sm:w-auto whitespace-nowrap"
            >
              {submitting
                ? 'Saving…'
                : values.status === 'Scheduled'
                  ? 'Schedule Publish'
                  : editingBlog
                    ? 'Save & Publish'
                    : 'Publish Article'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Sticky Top Section Tabs */}
        <div
          role="tablist"
          aria-label="Blog article editor sections"
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

        {/* TAB 1: IDENTITY & SCHEDULE */}
        {activeTab === 'identity' && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Article Identity, Category &amp; Publish Schedule
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
                <div className="md:col-span-5">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="blog-title"
                      className="block text-[12.5px] font-semibold text-[#334155]"
                    >
                      Article Title <span className="text-[#DC2626]">*</span>
                    </label>
                    <span
                      className={`text-[11px] tabular-nums ${getCounterTone(
                        countWords(values.title),
                        BLOG_FIELD_LIMITS.titleMaxWords
                      )}`}
                    >
                      {countWords(values.title)}/{BLOG_FIELD_LIMITS.titleMaxWords}{' '}
                      words
                    </span>
                  </div>
                  <input
                    id="blog-title"
                    type="text"
                    required
                    maxLength={BLOG_FIELD_LIMITS.titleMaxChars}
                    value={values.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Practical Roadmap to Red Hat Enterprise Linux"
                    className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                      errors.title
                        ? 'border-[#DC2626]'
                        : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="md:col-span-5">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="blog-slug"
                      className="block text-[12.5px] font-semibold text-[#334155]"
                    >
                      URL Slug <span className="text-[#DC2626]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateUniqueSlug}
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold text-[#145BFF] hover:bg-[#EFF6FF]"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Unique</span>
                    </button>
                  </div>
                  <input
                    id="blog-slug"
                    type="text"
                    required
                    maxLength={BLOG_FIELD_LIMITS.slugMaxChars}
                    value={values.slug}
                    onChange={(e) => handleManualSlugChange(e.target.value)}
                    placeholder="practical-roadmap-red-hat-linux"
                    className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 font-mono text-[13px] text-[#0F172A] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                      errors.slug || isDuplicateSlug
                        ? 'border-[#DC2626]'
                        : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                  />
                  <p className="mt-1 truncate font-mono text-[11px] text-[#64748B]">
                    URL: /blogs/{values.slug || 'auto-generated-slug'}
                  </p>
                  {(errors.slug || isDuplicateSlug) && (
                    <p className="mt-0.5 text-xs font-medium text-[#DC2626]">
                      {errors.slug || 'This slug already exists.'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="blog-code"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Blog Code
                  </label>
                  <input
                    id="blog-code"
                    type="text"
                    readOnly
                    aria-readonly="true"
                    value={values.blogCode}
                    className="mt-1 h-[40px] w-full cursor-not-allowed rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 font-mono text-[13px] font-semibold text-[#475569] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="blog-category-select"
                      className="block text-[12.5px] font-semibold text-[#334155]"
                    >
                      Category / Domain <span className="text-[#DC2626]">*</span>
                    </label>
                    <span
                      className={`text-[11px] tabular-nums ${getCounterTone(
                        values.category.length,
                        BLOG_FIELD_LIMITS.categoryMaxChars
                      )}`}
                    >
                      {values.category.length}/{BLOG_FIELD_LIMITS.categoryMaxChars}
                    </span>
                  </div>
                  {(() => {
                    const matchedOption = mergedCategoryOptions.find(
                      (c) =>
                        c.toLowerCase() === values.category.trim().toLowerCase()
                    );
                    const selectValue = customCategoryMode
                      ? '__custom__'
                      : matchedOption ??
                        (values.category.trim() ? '__custom__' : '');
                    return (
                      <>
                        <div className="relative">
                          <select
                            id="blog-category-select"
                            value={selectValue}
                            onChange={(e) => {
                              const nextVal = e.target.value;
                              if (nextVal === '__custom__') {
                                setCustomCategoryMode(true);
                                if (matchedOption) {
                                  updateField('category', '');
                                }
                              } else {
                                setCustomCategoryMode(false);
                                updateField('category', nextVal);
                              }
                            }}
                            className={`${selectClass} ${
                              errors.category ? 'border-[#DC2626]' : ''
                            }`}
                          >
                            <option value="" disabled>
                              Select Category / Domain…
                            </option>
                            {mergedCategoryOptions.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                            <option value="__custom__">
                              + Custom Category (Type manually)
                            </option>
                          </select>
                          <ChevronRight
                            className="pointer-events-none absolute top-1/2 right-2.5 mt-0.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
                            aria-hidden="true"
                          />
                        </div>

                        {(customCategoryMode ||
                          selectValue === '__custom__') && (
                          <input
                            id="blog-category"
                            type="text"
                            maxLength={BLOG_FIELD_LIMITS.categoryMaxChars}
                            value={values.category}
                            onChange={(e) =>
                              updateField(
                                'category',
                                clampToMaxWords(
                                  e.target.value,
                                  BLOG_FIELD_LIMITS.categoryMaxWords
                                )
                              )
                            }
                            placeholder="Enter custom category (e.g., Linux & RHEL)"
                            className={`mt-2 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                              errors.category
                                ? 'border-[#DC2626]'
                                : 'border-[#CBD5E1] focus:border-[#145BFF]'
                            }`}
                          />
                        )}
                      </>
                    );
                  })()}
                  {errors.category && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="lg:col-span-3">
                  <label
                    htmlFor="blog-author"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Author Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    id="blog-author"
                    type="text"
                    maxLength={BLOG_FIELD_LIMITS.authorMaxChars}
                    value={values.author}
                    onChange={(e) => updateField('author', e.target.value)}
                    placeholder="Arvind Thevar"
                    className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                      errors.author
                        ? 'border-[#DC2626]'
                        : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                  />
                  {errors.author && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.author}
                    </p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label
                    htmlFor="blog-read-time"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Read Time
                  </label>
                  <input
                    id="blog-read-time"
                    type="text"
                    maxLength={BLOG_FIELD_LIMITS.readTimeMaxChars}
                    value={values.readTime}
                    onChange={(e) => updateField('readTime', e.target.value)}
                    placeholder="6 min read"
                    className="mt-1 h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#0F172A] focus:border-[#145BFF] focus:ring-1 focus:ring-[#145BFF] focus:outline-none"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label
                    htmlFor="blog-guide-label"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Guide Label
                  </label>
                  <input
                    id="blog-guide-label"
                    type="text"
                    maxLength={BLOG_FIELD_LIMITS.guideLabelMaxChars}
                    value={values.guideLabel}
                    onChange={(e) => updateField('guideLabel', e.target.value)}
                    placeholder="Infrastructure Guide"
                    className="mt-1 h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#0F172A] focus:border-[#145BFF] focus:ring-1 focus:ring-[#145BFF] focus:outline-none"
                  />
                </div>

                <div className="lg:col-span-1">
                  <label
                    htmlFor="blog-order"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Order
                  </label>
                  <input
                    id="blog-order"
                    type="number"
                    min={1}
                    max={999}
                    value={values.displayOrder}
                    onChange={(e) =>
                      updateField(
                        'displayOrder',
                        Math.min(999, Math.max(0, Number(e.target.value) || 0))
                      )
                    }
                    className="mt-1 h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-[13px] text-[#0F172A] tabular-nums focus:border-[#145BFF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Publish Mode & Auto-Scheduler */}
              <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 lg:col-span-7">
                  <p className="text-[12.5px] font-bold text-[#0F172A]">
                    Publishing Mode &amp; Timed Scheduler
                  </p>
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
                    {(['Published', 'Draft', 'Scheduled'] as BlogStatus[]).map(
                      (mode) => {
                        const active = values.status === mode;
                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => handleStatusChange(mode)}
                            className={`h-[38px] rounded-lg border px-2.5 text-xs font-bold transition-colors ${
                              active
                                ? 'border-[#145BFF] bg-[#145BFF] text-white'
                                : 'border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#EFF6FF]'
                            }`}
                          >
                            {mode === 'Scheduled'
                              ? 'Schedule Time'
                              : mode}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {values.status === 'Scheduled' && (
                    <div className="mt-3 rounded-xl border border-[#BFDBFE] bg-white p-3">
                      <label
                        htmlFor="blog-scheduled-at"
                        className="block text-[12px] font-semibold text-[#145BFF]"
                      >
                        Auto-Publish Date &amp; Time{' '}
                        <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        id="blog-scheduled-at"
                        type="datetime-local"
                        value={toLocalDateTimeInputValue(values.scheduledAt)}
                        onChange={(e) => {
                          const raw = e.target.value;
                          updateField(
                            'scheduledAt',
                            raw ? (raw.length === 16 ? `${raw}:00` : raw) : null
                          );
                        }}
                        className={`mt-1.5 h-[40px] w-full rounded-lg border px-3 text-[13px] font-medium text-[#0F172A] focus:outline-none ${
                          errors.scheduledAt
                            ? 'border-[#DC2626]'
                            : 'border-[#CBD5E1] focus:border-[#145BFF]'
                        }`}
                      />
                      <p className="mt-1.5 text-[11px] text-[#475569]">
                        Spring Boot scheduler automatically publishes this blog article live once the selected date &amp; time arrives.
                      </p>
                      {errors.scheduledAt && (
                        <p className="mt-1 text-xs font-medium text-[#DC2626]">
                          {errors.scheduledAt}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 lg:col-span-5">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                        values.featured
                          ? 'border-blue-200 bg-[#EFF6FF] text-[#145BFF]'
                          : 'border-[#E2E8F0] bg-white text-[#64748B]'
                      }`}
                    >
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[13px] font-bold text-[#0F172A]">
                        {values.featured
                          ? 'Most Viewed Highlight: ON'
                          : 'Standard Article Card'}
                      </p>
                      <p className="text-xs text-[#475569]">
                        Pinned 1st on the public Blogs page hero spotlight above the 4-card grid.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={values.featured}
                    onClick={() => updateField('featured', !values.featured)}
                    className={`inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border px-3.5 text-xs font-bold transition-colors ${
                      values.featured
                        ? 'border-[#145BFF] bg-[#145BFF] text-white hover:bg-[#0F4AD6]'
                        : 'border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>
                      {values.featured
                        ? 'Pinned as Most Viewed'
                        : 'Mark as Most Viewed'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: EXCERPT, STRUCTURED SECTIONS & TAGS */}
        {activeTab === 'content' && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="blog-excerpt"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Article Summary / Excerpt{' '}
                    <span className="text-[#DC2626]">*</span>
                  </label>
                  <span
                    className={`text-[11px] tabular-nums ${getCounterTone(
                      excerptWords,
                      BLOG_FIELD_LIMITS.excerptMaxWords
                    )}`}
                  >
                    {excerptWords} / {BLOG_FIELD_LIMITS.excerptMaxWords} words
                  </span>
                </div>
                <textarea
                  id="blog-excerpt"
                  rows={3}
                  maxLength={BLOG_FIELD_LIMITS.excerptMaxChars}
                  value={values.excerpt}
                  onChange={(e) =>
                    updateField(
                      'excerpt',
                      clampToMaxWords(
                        e.target.value,
                        BLOG_FIELD_LIMITS.excerptMaxWords
                      )
                    )
                  }
                  placeholder="Write a clear summary displayed on the Blogs listing page and SEO meta description..."
                  className={`mt-1 w-full rounded-lg border bg-white p-3 text-[13px] leading-relaxed text-[#0F172A] focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                    errors.excerpt
                      ? 'border-[#DC2626]'
                      : 'border-[#CBD5E1] focus:border-[#145BFF]'
                  }`}
                />
                {errors.excerpt && (
                  <p className="mt-1 text-xs font-medium text-[#DC2626]">
                    {errors.excerpt}
                  </p>
                )}
              </div>

              <div className="space-y-3 border-t border-[#F1F5F9] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Structured Article Sections ({values.sections.length})
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      Add sections with clear headings, practical explanations, and optional lab diagrams.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={values.sections.length >= 20}
                    onClick={addSection}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#145BFF]/30 bg-[#EFF6FF] px-3 text-xs font-semibold text-[#145BFF] transition-colors hover:bg-[#DBEAFE] disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Section</span>
                  </button>
                </div>

                {errors.sections && (
                  <p className="text-xs font-medium text-[#DC2626]">
                    {errors.sections}
                  </p>
                )}

                <div className="space-y-3">
                  {values.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 sm:p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#145BFF]">
                          Section #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveSection(idx, -1)}
                            aria-label={`Move section ${idx + 1} up`}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#CBD5E1] bg-white text-[#475569] hover:text-[#145BFF] disabled:opacity-40"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === values.sections.length - 1}
                            onClick={() => moveSection(idx, 1)}
                            aria-label={`Move section ${idx + 1} down`}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#CBD5E1] bg-white text-[#475569] hover:text-[#145BFF] disabled:opacity-40"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSection(idx)}
                            aria-label={`Remove section ${idx + 1}`}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#FECACA] bg-white text-[#DC2626] hover:bg-[#FEF2F2]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        maxLength={220}
                        value={section.heading}
                        onChange={(e) =>
                          updateSection(idx, {
                            heading: clampToMaxWords(
                              e.target.value,
                              BLOG_FIELD_LIMITS.sectionHeadingMaxWords
                            ),
                          })
                        }
                        placeholder={`Section ${idx + 1} Heading (e.g., 1. Concept First, in Plain Language)`}
                        className="h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-[13px] font-semibold text-[#0F172A] focus:border-[#145BFF] focus:outline-none"
                      />

                      <textarea
                        rows={3}
                        maxLength={5000}
                        value={section.body}
                        onChange={(e) =>
                          updateSection(idx, {
                            body: clampToMaxWords(
                              e.target.value,
                              BLOG_FIELD_LIMITS.sectionBodyMaxWords
                            ),
                          })
                        }
                        placeholder="Write practical explanation, commands, or troubleshooting workflow for this section..."
                        className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3 text-[13px] leading-relaxed text-[#0F172A] focus:border-[#145BFF] focus:outline-none"
                      />

                      <ImageUploadZone
                        label={`Optional Section ${idx + 1} Diagram / Photo`}
                        uploadFolder="blogs"
                        helperText="Optional visual illustration for this section (saved to project uploads/blogs)"
                        valueUrl={section.images?.[0] ?? ''}
                        onChange={(url) =>
                          updateSection(idx, { images: url ? [url] : [] })
                        }
                        onRemove={() => updateSection(idx, { images: [] })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#F1F5F9] pt-4">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="blog-tag-input"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Topic Tags
                  </label>
                  <span
                    className={`text-[11px] tabular-nums ${getCounterTone(
                      values.tags.length,
                      BLOG_FIELD_LIMITS.maxTags
                    )}`}
                  >
                    {values.tags.length} / {BLOG_FIELD_LIMITS.maxTags} tags
                  </span>
                </div>
                <div className="mt-1 flex min-w-0 gap-2">
                  <input
                    id="blog-tag-input"
                    type="text"
                    maxLength={BLOG_FIELD_LIMITS.tagMaxChars}
                    disabled={values.tags.length >= BLOG_FIELD_LIMITS.maxTags}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="e.g. rhel-9, ccnp, aws-vpc (press Enter)"
                    className="h-[40px] min-w-0 flex-1 rounded-lg border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#0F172A] focus:border-[#145BFF] focus:outline-none disabled:bg-[#F8FAFC]"
                  />
                  <button
                    type="button"
                    disabled={values.tags.length >= BLOG_FIELD_LIMITS.maxTags}
                    onClick={handleAddTag}
                    className="inline-flex h-[40px] shrink-0 items-center gap-1 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-4 text-[13px] font-semibold text-[#0F172A] hover:bg-[#EFF6FF] hover:text-[#145BFF] disabled:opacity-50"
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
                        className="inline-flex h-[28px] items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-[#F1F5F9] px-2.5 text-xs font-medium text-[#334155] hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
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

        {/* TAB 3: COVER IMAGE & COMPANION FILES */}
        {activeTab === 'media' && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Cover Visual &amp; Companion Lab Files
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <ImageUploadZone
                  label="Blog Cover Banner"
                  uploadFolder="blogs"
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
                      className="rounded-md border border-[#CBD5E1] bg-white px-2 py-0.5 text-[11px] font-medium text-[#475569] hover:border-[#145BFF] hover:text-[#145BFF]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <DocumentUploadList
                  label="Optional Guide PDFs / Reference Files"
                  uploadFolder="blogs"
                  files={values.attachments}
                  onAddFiles={(newFiles) =>
                    updateField('attachments', [...values.attachments, ...newFiles])
                  }
                  onRemoveFile={(id) =>
                    updateField(
                      'attachments',
                      values.attachments.filter((f) => f.id !== id)
                    )
                  }
                  onReplaceFile={(id, rep) =>
                    updateField(
                      'attachments',
                      values.attachments.map((f) => (f.id === id ? rep : f))
                    )
                  }
                />

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs text-[#334155]">
                  <p className="font-bold text-[#0B1736]">Article Summary</p>
                  <ul className="mt-2 space-y-1 text-[#475569]">
                    <li>
                      Title:{' '}
                      <strong className="text-[#0B1736]">
                        {values.title.trim() || 'Not set yet'}
                      </strong>
                    </li>
                    <li>
                      Category:{' '}
                      <strong className="text-[#0B1736]">
                        {values.category.trim() || 'Not selected'}
                      </strong>
                    </li>
                    <li>
                      Status:{' '}
                      <strong className="text-[#145BFF]">
                        {values.status}
                        {values.status === 'Scheduled' && values.scheduledAt
                          ? ` (${values.scheduledAt.replace('T', ' ').slice(0, 16)})`
                          : ''}
                      </strong>
                    </li>
                    <li>
                      Sections: {values.sections.filter((s) => s.heading.trim() || s.body.trim()).length} · Tags:{' '}
                      {values.tags.length} · Files: {values.attachments.length}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </MobileModalShell>
  );
}
