import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Image as ImageIcon,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ImageUploadZone } from '../../components/FileUploadZone';
import { MobileModalShell } from '../../components/MobileModalShell';
import {
  clampToMaxWords,
  countWords,
  GALLERY_FIELD_LIMITS,
  generateNextGalleryCode,
  validateGalleryForm,
} from '../../utils/adminLogic';
import {
  COURSES_UPDATED_EVENT,
  fetchAllCoursesFromApiOrStorage,
  loadPublicCoursesFromStorage,
} from '../../../src/services/coursesService';
import { galleryAdminService } from '../services/galleryService';
import type {
  GalleryFormPayload,
  GalleryItem,
  GalleryStatus,
  GalleryValidationErrors,
} from '../types/gallery';

interface GalleryFormModalProps {
  open: boolean;
  editingItem: GalleryItem | null;
  existingCodes: string[];
  availableCategories?: string[];
  defaultDisplayOrder: number;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: GalleryFormPayload) => Promise<void>;
  onPreviewDraft: (values: GalleryFormPayload) => void;
}

type GalleryFormTabId = 'identity' | 'media';

const DEFAULT_GALLERY_CATEGORIES = [
  'Training',
  'Labs',
  'Infrastructure',
  'Events',
];

const SAMPLE_GALLERY_PRESETS = [
  {
    label: 'Cisco Switch Rack',
    url: '/assets/images/cisco_network_lab_1795164486189.jpg',
    name: 'cisco_network_lab_1795164486189.jpg',
  },
  {
    label: 'Corporate IT Workshop',
    url: '/assets/images/corporate_it_workshop_1795164484663.jpg',
    name: 'corporate_it_workshop_1795164484663.jpg',
  },
  {
    label: 'RHEL Server Lab',
    url: '/assets/images/linux_rhel_lab_1795164484674.jpg',
    name: 'linux_rhel_lab_1795164484674.jpg',
  },
  {
    label: 'AWS Cloud Desk',
    url: '/assets/images/aws_cloud_infra_1795164482369.jpg',
    name: 'aws_cloud_infra_1795164482369.jpg',
  },
];

function getCounterTone(current: number, max: number): string {
  if (current >= max) return 'text-[#DC2626] font-semibold';
  if (current >= Math.floor(max * 0.85)) return 'text-[#D97706] font-semibold';
  return 'text-[#64748B]';
}

function buildInitialValues(
  editingItem: GalleryItem | null,
  defaultDisplayOrder: number,
  existingCodes: string[]
): GalleryFormPayload {
  if (editingItem) {
    return {
      galleryCode: editingItem.galleryCode,
      title: editingItem.title,
      caption: editingItem.caption,
      category: editingItem.category,
      imageUrl: editingItem.imageUrl,
      imageName: editingItem.imageName || 'gallery-photo.jpg',
      altText: editingItem.altText || editingItem.title,
      tags: [...editingItem.tags],
      featured: Boolean(editingItem.featured),
      displayOrder: editingItem.displayOrder,
      status: editingItem.status,
      takenAt: editingItem.takenAt ?? '',
    };
  }

  return {
    galleryCode: generateNextGalleryCode(existingCodes),
    title: '',
    caption: '',
    category: 'Labs',
    imageUrl: '',
    imageName: '',
    altText: '',
    tags: [],
    featured: false,
    displayOrder: defaultDisplayOrder,
    status: 'Published',
    takenAt: new Date().toISOString().slice(0, 10),
  };
}

export function GalleryFormModal({
  open,
  editingItem,
  existingCodes,
  availableCategories = [],
  defaultDisplayOrder,
  submitting,
  onClose,
  onSubmit,
  onPreviewDraft,
}: GalleryFormModalProps) {
  const [values, setValues] = useState<GalleryFormPayload>(() =>
    buildInitialValues(editingItem, defaultDisplayOrder, existingCodes)
  );
  const [activeTab, setActiveTab] = useState<GalleryFormTabId>('identity');
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<GalleryValidationErrors>({});
  const [liveCourseCategories, setLiveCourseCategories] = useState<string[]>(
    () => loadPublicCoursesFromStorage().map((c) => c.category)
  );
  const activeSessionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const syncCourses = () => {
      void fetchAllCoursesFromApiOrStorage().then((res) => {
        if (!active) return;
        const cats = res.items.map((c) => c.category.trim()).filter(Boolean);
        if (res.fromBackend || cats.length > 0) {
          setLiveCourseCategories(cats);
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

  const mergedCategoryOptions = useMemo(
    () =>
      Array.from(
        new Map(
          [
            ...DEFAULT_GALLERY_CATEGORIES,
            ...availableCategories,
            ...liveCourseCategories,
          ]
            .map((c) => c.trim())
            .filter(Boolean)
            .map((c) => [c.toLowerCase(), c])
        ).values()
      ),
    [availableCategories, liveCourseCategories]
  );

  useEffect(() => {
    if (!open) {
      activeSessionKeyRef.current = null;
      return;
    }
    const sessionKey = editingItem ? `edit:${editingItem.id}` : 'create';
    if (activeSessionKeyRef.current === sessionKey) {
      return;
    }
    activeSessionKeyRef.current = sessionKey;

    const initial = buildInitialValues(
      editingItem,
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
    setTagInput('');
    setErrors({});

    if (!editingItem) {
      let active = true;
      void galleryAdminService.getNextCode().then((code) => {
        if (active && code) {
          setValues((prev) => ({ ...prev, galleryCode: code }));
        }
      });
      return () => {
        active = false;
      };
    }
  }, [
    open,
    editingItem,
    defaultDisplayOrder,
    existingCodes,
    mergedCategoryOptions,
  ]);

  const updateField = <K extends keyof GalleryFormPayload>(
    field: K,
    val: GalleryFormPayload[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddTag = () => {
    const cleaned = tagInput.trim().slice(0, GALLERY_FIELD_LIMITS.tagMaxChars);
    if (!cleaned || values.tags.length >= GALLERY_FIELD_LIMITS.maxTags) return;
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

  const handleSubmitWithStatus = async (
    targetStatus: GalleryStatus,
    e?: FormEvent
  ) => {
    e?.preventDefault();
    if (submitting) return;

    const candidate: GalleryFormPayload = {
      ...values,
      status: targetStatus,
      altText: values.altText.trim() || values.title.trim(),
      takenAt: values.takenAt && values.takenAt.trim() ? values.takenAt.trim() : null,
    };

    const nextErrors = validateGalleryForm(candidate);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (
        nextErrors.title ||
        nextErrors.category ||
        nextErrors.caption ||
        nextErrors.altText ||
        nextErrors.displayOrder
      ) {
        setActiveTab('identity');
      } else if (nextErrors.imageUrl) {
        setActiveTab('media');
      }
      return;
    }

    await onSubmit(candidate);
  };

  const hasIdentityErrors = Boolean(
    errors.title ||
      errors.category ||
      errors.caption ||
      errors.altText ||
      errors.displayOrder
  );
  const hasMediaErrors = Boolean(errors.imageUrl);

  const tabs: Array<{
    id: GalleryFormTabId;
    stepNum: number;
    label: string;
    icon: typeof ImageIcon;
    hasError: boolean;
  }> = [
    {
      id: 'identity',
      stepNum: 1,
      label: 'Identity & Details',
      icon: FileText,
      hasError: hasIdentityErrors,
    },
    {
      id: 'media',
      stepNum: 2,
      label: 'Image & Publish',
      icon: ImageIcon,
      hasError: hasMediaErrors,
    },
  ];

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);

  const selectClass =
    'mt-1 h-[40px] w-full min-w-0 appearance-none rounded-lg border border-[#CBD5E1] bg-white py-1.5 pr-8 pl-3 text-[13px] font-medium text-[#0F172A] transition-colors focus:border-[#145BFF] focus:ring-1 focus:ring-[#145BFF] focus:outline-none';

  return (
    <MobileModalShell
      open={open}
      fullScreen
      title={editingItem ? 'Edit Gallery Photo' : 'Add Gallery Photo'}
      subtitle="Switch tabs below or use Previous / Next to add photo details, upload images into uploads/gallery, and publish live."
      titleId="gallery-form-modal-title"
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
              onClick={() => void handleSubmitWithStatus('Published')}
              className="col-span-2 h-[40px] w-full min-w-0 rounded-lg bg-[#145BFF] px-5 text-[13px] font-semibold text-white shadow-xs transition-colors hover:bg-[#0F4AD6] disabled:opacity-50 sm:col-span-1 sm:w-auto whitespace-nowrap"
            >
              {submitting
                ? 'Saving…'
                : editingItem
                  ? 'Save & Publish'
                  : 'Publish Photo'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Sticky 2-Tab Navigation */}
        <div
          role="tablist"
          aria-label="Gallery photo editor sections"
          className="grid grid-cols-1 gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 sm:grid-cols-2"
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

        {/* TAB 1: IDENTITY & DETAILS */}
        {activeTab === 'identity' && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Photo Identity, Category &amp; Caption Details
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
                <div className="md:col-span-6">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="gal-title"
                      className="block text-[12.5px] font-semibold text-[#334155]"
                    >
                      Photo Title <span className="text-[#DC2626]">*</span>
                    </label>
                    <span
                      className={`text-[11px] tabular-nums ${getCounterTone(
                        countWords(values.title),
                        GALLERY_FIELD_LIMITS.titleMaxWords
                      )}`}
                    >
                      {countWords(values.title)}/
                      {GALLERY_FIELD_LIMITS.titleMaxWords} words
                    </span>
                  </div>
                  <input
                    id="gal-title"
                    type="text"
                    required
                    maxLength={GALLERY_FIELD_LIMITS.titleMaxChars}
                    value={values.title}
                    onChange={(e) =>
                      updateField(
                        'title',
                        clampToMaxWords(
                          e.target.value,
                          GALLERY_FIELD_LIMITS.titleMaxWords
                        )
                      )
                    }
                    placeholder="e.g., Enterprise Cisco Rack & Patch Panel Lab"
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

                <div className="md:col-span-3">
                  <label
                    htmlFor="gal-code"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Gallery Code
                  </label>
                  <input
                    id="gal-code"
                    type="text"
                    readOnly
                    aria-readonly="true"
                    value={values.galleryCode}
                    className="mt-1 h-[40px] w-full cursor-not-allowed rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 font-mono text-[13px] font-semibold text-[#475569] focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label
                    htmlFor="gal-order"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Display Order <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    id="gal-order"
                    type="number"
                    min={1}
                    max={9999}
                    value={values.displayOrder}
                    onChange={(e) =>
                      updateField(
                        'displayOrder',
                        Math.min(9999, Math.max(0, Number(e.target.value) || 0))
                      )
                    }
                    className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] tabular-nums focus:outline-none ${
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

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <label
                    htmlFor="gal-category-select"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Category <span className="text-[#DC2626]">*</span>
                  </label>
                  {(() => {
                    const matched = mergedCategoryOptions.find(
                      (c) =>
                        c.toLowerCase() === values.category.trim().toLowerCase()
                    );
                    const selectValue = customCategoryMode
                      ? '__custom__'
                      : matched ?? (values.category.trim() ? '__custom__' : '');
                    return (
                      <>
                        <div className="relative">
                          <select
                            id="gal-category-select"
                            value={selectValue}
                            onChange={(e) => {
                              const nextVal = e.target.value;
                              if (nextVal === '__custom__') {
                                setCustomCategoryMode(true);
                                if (matched) {
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
                              Select category…
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
                            id="gal-category-custom"
                            type="text"
                            maxLength={GALLERY_FIELD_LIMITS.categoryMaxChars}
                            value={values.category}
                            onChange={(e) =>
                              updateField('category', e.target.value)
                            }
                            placeholder="Enter custom category (e.g., Workshops)"
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

                <div className="lg:col-span-4">
                  <label
                    htmlFor="gal-alt"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Alt Text (SEO &amp; Accessibility)
                  </label>
                  <input
                    id="gal-alt"
                    type="text"
                    maxLength={GALLERY_FIELD_LIMITS.altTextMaxChars}
                    value={values.altText}
                    onChange={(e) => updateField('altText', e.target.value)}
                    placeholder="Defaults to Photo Title if blank"
                    className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                      errors.altText
                        ? 'border-[#DC2626]'
                        : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                  />
                  {errors.altText && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.altText}
                    </p>
                  )}
                </div>

                <div className="lg:col-span-4">
                  <label
                    htmlFor="gal-taken-at"
                    className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#334155]"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#145BFF]" />
                    <span>Photo Date (optional)</span>
                  </label>
                  <input
                    id="gal-taken-at"
                    type="date"
                    value={values.takenAt ?? ''}
                    onChange={(e) => updateField('takenAt', e.target.value)}
                    className="mt-1 h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#0F172A] focus:border-[#145BFF] focus:ring-1 focus:ring-[#145BFF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="gal-caption"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Photo Caption / Description
                  </label>
                  <span
                    className={`text-[11px] tabular-nums ${getCounterTone(
                      countWords(values.caption),
                      GALLERY_FIELD_LIMITS.captionMaxWords
                    )}`}
                  >
                    {countWords(values.caption)}/
                    {GALLERY_FIELD_LIMITS.captionMaxWords} words
                  </span>
                </div>
                <textarea
                  id="gal-caption"
                  rows={3}
                  maxLength={GALLERY_FIELD_LIMITS.captionMaxChars}
                  value={values.caption}
                  onChange={(e) =>
                    updateField(
                      'caption',
                      clampToMaxWords(
                        e.target.value,
                        GALLERY_FIELD_LIMITS.captionMaxWords
                      )
                    )
                  }
                  placeholder="Short description of the training session, lab rack hardware, or hands-on workshop…"
                  className={`mt-1 w-full rounded-lg border bg-white p-3 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${
                    errors.caption
                      ? 'border-[#DC2626]'
                      : 'border-[#CBD5E1] focus:border-[#145BFF]'
                  }`}
                />
                {errors.caption && (
                  <p className="mt-1 text-xs font-medium text-[#DC2626]">
                    {errors.caption}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label
                  htmlFor="gal-tag-input"
                  className="block text-[12.5px] font-semibold text-[#334155]"
                >
                  Tags ({values.tags.length}/{GALLERY_FIELD_LIMITS.maxTags})
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    id="gal-tag-input"
                    type="text"
                    maxLength={GALLERY_FIELD_LIMITS.tagMaxChars}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Type tag (e.g., Cisco, RHEL, AWS) and press Enter…"
                    className="h-[40px] flex-1 rounded-lg border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#0F172A] focus:border-[#145BFF] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="inline-flex h-[40px] shrink-0 items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-3.5 text-xs font-semibold text-[#0B1736] hover:bg-[#F8FAFC]"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#145BFF]" />
                    <span>Add</span>
                  </button>
                </div>
                {values.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {values.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        title="Remove tag"
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

        {/* TAB 2: IMAGE & PUBLISH */}
        {activeTab === 'media' && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Photo Upload &amp; Visibility Settings
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <ImageUploadZone
                  label="Gallery Photo Upload *"
                  helperText="JPG, PNG, or WebP · Max 5 MB · Recommended 4:3 or 16:9 high-res photo"
                  uploadFolder="gallery"
                  valueUrl={values.imageUrl}
                  fileName={values.imageName}
                  onChange={(url, name) => {
                    updateField('imageUrl', url);
                    updateField('imageName', name);
                  }}
                  onRemove={() => {
                    updateField('imageUrl', '');
                    updateField('imageName', '');
                  }}
                />
                {errors.imageUrl && (
                  <p className="text-xs font-medium text-[#DC2626]">
                    {errors.imageUrl}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-[#64748B]">
                    Quick presets:
                  </span>
                  {SAMPLE_GALLERY_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        updateField('imageUrl', preset.url);
                        updateField('imageName', preset.name);
                      }}
                      className="rounded-md border border-[#CBD5E1] bg-white px-2 py-0.5 text-[11px] font-medium text-[#475569] hover:border-[#145BFF] hover:text-[#145BFF]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label
                    htmlFor="gal-image-url"
                    className="block text-[12px] font-semibold text-[#334155]"
                  >
                    Or Image Path / External URL
                  </label>
                  <input
                    id="gal-image-url"
                    type="text"
                    maxLength={500}
                    value={
                      values.imageUrl.startsWith('data:')
                        ? ''
                        : values.imageUrl
                    }
                    onChange={(e) => {
                      updateField('imageUrl', e.target.value);
                      if (!values.imageName) {
                        updateField(
                          'imageName',
                          e.target.value.split('/').pop() || 'photo.jpg'
                        );
                      }
                    }}
                    placeholder="/api/files/gallery/... or /assets/images/..."
                    className="mt-1 h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 font-mono text-[12.5px] text-[#0F172A] focus:border-[#145BFF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="gal-status"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Publish Status
                  </label>
                  <div className="relative">
                    <select
                      id="gal-status"
                      value={values.status}
                      onChange={(e) =>
                        updateField('status', e.target.value as GalleryStatus)
                      }
                      className={selectClass}
                    >
                      <option value="Published">Published (Visible Live)</option>
                      <option value="Draft">Draft (Hidden from Public)</option>
                    </select>
                    <ChevronRight
                      className="pointer-events-none absolute top-1/2 right-2.5 mt-0.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 transition-colors hover:border-[#145BFF]/40">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#145BFF]" />
                    <div>
                      <p className="text-[13px] font-semibold text-[#0B1736]">
                        Feature as Highlight Photo
                      </p>
                      <p className="text-[11.5px] text-[#64748B]">
                        Featured photos appear first in the public Gallery grid and Featured filter.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={values.featured}
                    onChange={(e) => updateField('featured', e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-[#CBD5E1] text-[#145BFF] focus:ring-[#145BFF]"
                  />
                </label>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs text-[#334155]">
                  <p className="font-bold text-[#0B1736]">Gallery Photo Summary</p>
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
                      Code:{' '}
                      <strong className="font-mono text-[#0B1736]">
                        {values.galleryCode} (#{values.displayOrder})
                      </strong>
                    </li>
                    <li>
                      Status:{' '}
                      <strong className="text-[#145BFF]">
                        {values.status}
                        {values.featured ? ' · Featured' : ''}
                      </strong>
                    </li>
                    <li>
                      Photo Date: {values.takenAt || 'Not set'} · Tags:{' '}
                      {values.tags.length}
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
