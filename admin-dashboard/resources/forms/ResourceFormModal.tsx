import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Info,
  Lock,
  RefreshCw,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  DocumentUploadList,
  type UploadedDocItem,
} from '../../components/FileUploadZone';
import { MobileModalShell } from '../../components/MobileModalShell';
import {
  clampToMaxWords,
  countWords,
  generateNextNoteCode,
  generateUniqueSlug,
  RESOURCE_FIELD_LIMITS,
  slugifyText,
  validateResourceForm,
} from '../../utils/adminLogic';
import {
  COURSES_UPDATED_EVENT,
  fetchAllCoursesBackend,
} from '../../../src/services/coursesService';
import { resourceService } from '../services/resourceService';
import type {
  ResourceSectionType,
  ResourceStatus,
  ResourceValidationErrors,
  StudyResourceFormPayload,
  StudyResourceNote,
} from '../types/resource';

interface ResourceFormModalProps {
  open: boolean;
  editingResource: StudyResourceNote | null;
  existingSlugs: string[];
  existingCodes: string[];
  defaultDisplayOrder: number;
  domainSuggestions?: string[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: StudyResourceFormPayload) => Promise<void>;
  onPreviewDraft: (values: StudyResourceFormPayload) => void;
}

type ResourceFormTabId = 'identity' | 'content' | 'files';

const FILE_TYPE_OPTIONS = [
  'PDF',
  'DOCX',
  'TXT',
  'PPTX',
  'Lab Topology',
  'Cheat Sheet',
  'ZIP',
];

function inferFileType(fileName: string, fallback = 'PDF'): string {
  const lower = fileName.trim().toLowerCase();
  if (lower.endsWith('.pdf')) return 'PDF';
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'DOCX';
  if (lower.endsWith('.ppt') || lower.endsWith('.pptx')) return 'PPTX';
  if (lower.endsWith('.txt') || lower.endsWith('.md')) return 'TXT';
  if (lower.endsWith('.pkt')) return 'Lab Topology';
  if (lower.endsWith('.zip')) return 'ZIP';
  return fallback;
}

function getCounterTone(current: number, max: number): string {
  if (current >= max) return 'text-[#DC2626] font-semibold';
  if (current >= Math.floor(max * 0.85)) return 'text-[#D97706] font-semibold';
  return 'text-[#64748B]';
}

function buildInitialValues(
  editingResource: StudyResourceNote | null,
  defaultDisplayOrder: number,
  existingCodes: string[]
): StudyResourceFormPayload {
  if (editingResource) {
    const exists = Boolean(
      editingResource.hasFile ||
      editingResource.hasUploadedFile ||
      String(editingResource.fileUrl ?? '').trim() !== ''
    );
    return {
      noteCode: editingResource.noteCode,
      title: editingResource.title,
      slug: editingResource.slug,
      sectionType: editingResource.sectionType,
      domain: editingResource.domain,
      summary: editingResource.summary,
      topicsText: editingResource.topicsText,
      fileName: exists ? editingResource.fileName : '',
      fileType: editingResource.fileType || 'PDF',
      mimeType: exists ? editingResource.mimeType || 'application/pdf' : '',
      fileSizeBytes: exists ? editingResource.fileSizeBytes || 0 : 0,
      fileUrl: exists ? editingResource.fileUrl || '' : '',
      storedFilePath: undefined,
      fileData: undefined,
      removeFile: false,
      downloadEnabled: Boolean(editingResource.downloadEnabled),
      displayOrder: editingResource.displayOrder,
      status: editingResource.status,
    };
  }

  return {
    noteCode: generateNextNoteCode(existingCodes),
    title: '',
    slug: '',
    sectionType: 'Notes',
    domain: '',
    summary: '',
    topicsText: '',
    fileName: '',
    fileType: 'PDF',
    mimeType: '',
    fileSizeBytes: 0,
    fileUrl: '',
    storedFilePath: undefined,
    fileData: undefined,
    removeFile: false,
    downloadEnabled: false,
    displayOrder: defaultDisplayOrder,
    status: 'Published',
  };
}

export function ResourceFormModal({
  open,
  editingResource,
  existingSlugs,
  existingCodes,
  defaultDisplayOrder,
  domainSuggestions = [],
  submitting,
  onClose,
  onSubmit,
  onPreviewDraft,
}: ResourceFormModalProps) {
  const [values, setValues] = useState<StudyResourceFormPayload>(() =>
    buildInitialValues(editingResource, defaultDisplayOrder, existingCodes)
  );
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocItem[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(editingResource)
  );
  const [errors, setErrors] = useState<ResourceValidationErrors>({});
  const [activeTab, setActiveTab] = useState<ResourceFormTabId>('identity');
  const [liveCourseDomains, setLiveCourseDomains] = useState<string[]>([]);
  const [customDomainMode, setCustomDomainMode] = useState(false);
  const activeSessionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const syncDomains = () => {
      void fetchAllCoursesBackend()
        .then((items) => {
          if (!active) return;
          setLiveCourseDomains(items.map((c) => c.title.trim()).filter(Boolean));
        })
        .catch(() => {
          if (active) setLiveCourseDomains([]);
        });
    };
    syncDomains();
    window.addEventListener(COURSES_UPDATED_EVENT, syncDomains);
    return () => {
      active = false;
      window.removeEventListener(COURSES_UPDATED_EVENT, syncDomains);
    };
  }, []);

  const mergedDomainOptions = Array.from(
    new Map(
      [...liveCourseDomains, ...domainSuggestions]
        .map((d) => d.trim())
        .filter(Boolean)
        .map((d) => [d.toLowerCase(), d])
    ).values()
  );

  useEffect(() => {
    if (!open) {
      activeSessionKeyRef.current = null;
      return;
    }
    const sessionKey = editingResource ? `edit:${editingResource.id}` : 'create';
    if (activeSessionKeyRef.current === sessionKey) {
      return;
    }
    activeSessionKeyRef.current = sessionKey;

    const initial = buildInitialValues(
      editingResource,
      defaultDisplayOrder,
      existingCodes
    );
    setValues(initial);
    setActiveTab('identity');
    const hasMatchInCatalog =
      initial.domain.trim() === '' ||
      mergedDomainOptions.some(
        (d) => d.toLowerCase() === initial.domain.trim().toLowerCase()
      );
    setCustomDomainMode(!hasMatchInCatalog);

    const hasExistingAttachment = Boolean(
      editingResource &&
      (editingResource.hasFile ||
        editingResource.hasUploadedFile ||
        String(editingResource.fileUrl ?? '').trim() !== '')
    );
    setUploadedDocs(
      editingResource && hasExistingAttachment
        ? [
          {
            id: `existing-${editingResource.id}`,
            name: editingResource.fileName || 'attached-study-file',
            type: editingResource.mimeType || 'application/pdf',
            sizeBytes: editingResource.fileSizeBytes || 0,
            url: editingResource.fileUrl,
            uploadedAt: editingResource.updatedAt,
          },
        ]
        : []
    );
    setSlugManuallyEdited(Boolean(editingResource));
    setErrors({});

    if (!editingResource) {
      let active = true;
      void resourceService.getNextNoteCode().then((code) => {
        if (active && code) {
          setValues((prev) => ({ ...prev, noteCode: code }));
        }
      });
      return () => {
        active = false;
      };
    }
  }, [open, editingResource, defaultDisplayOrder, existingCodes]);

  const updateField = <K extends keyof StudyResourceFormPayload>(
    field: K,
    val: StudyResourceFormPayload[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTitleChange = (rawTitle: string) => {
    const title = clampToMaxWords(rawTitle, RESOURCE_FIELD_LIMITS.titleMaxWords);
    setValues((prev) => ({
      ...prev,
      title,
      slug: slugManuallyEdited
        ? prev.slug
        : generateUniqueSlug(title, existingSlugs, editingResource?.slug),
    }));
    setErrors((prev) => ({ ...prev, title: undefined, slug: undefined }));
  };

  const handleManualSlugChange = (rawSlug: string) => {
    setSlugManuallyEdited(true);
    updateField('slug', slugifyText(rawSlug));
  };

  const handleRegenerateUniqueSlug = () => {
    const source = values.title.trim() || values.slug.trim() || 'study-note';
    const nextUnique = generateUniqueSlug(
      source,
      existingSlugs,
      editingResource?.slug
    );
    setSlugManuallyEdited(false);
    updateField('slug', nextUnique);
  };

  const handleAttachFile = (docs: UploadedDocItem[]) => {
    const first = docs[0];
    if (!first) return;
    setUploadedDocs([first]);
    const isDataUrl = Boolean(first.url && first.url.startsWith('data:'));
    setValues((prev) => ({
      ...prev,
      fileName: first.name,
      fileType: inferFileType(first.name, prev.fileType || 'PDF'),
      mimeType: first.type || 'application/octet-stream',
      fileSizeBytes: first.sizeBytes,
      storedFilePath: first.storedPath,
      fileData: !first.storedPath && isDataUrl ? first.url : undefined,
      fileUrl: '',
      removeFile: false,
    }));
    setErrors((prev) => ({ ...prev, fileUrl: undefined }));
  };

  const handleRemoveFile = () => {
    setUploadedDocs([]);
    setValues((prev) => ({
      ...prev,
      fileName: '',
      mimeType: '',
      fileSizeBytes: 0,
      storedFilePath: undefined,
      fileData: undefined,
      fileUrl: '',
      removeFile: true,
    }));
    setErrors((prev) => ({ ...prev, fileUrl: undefined }));
  };

  const handleSubmitWithStatus = async (
    targetStatus: ResourceStatus,
    e?: FormEvent
  ) => {
    e?.preventDefault();
    if (submitting) return;
    const candidate: StudyResourceFormPayload = {
      ...values,
      status: targetStatus,
    };
    const nextErrors = validateResourceForm(
      candidate,
      existingSlugs,
      editingResource?.slug
    );
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (
        nextErrors.title ||
        nextErrors.slug ||
        nextErrors.domain ||
        nextErrors.displayOrder
      ) {
        setActiveTab('identity');
      } else if (nextErrors.summary || nextErrors.topicsText) {
        setActiveTab('content');
      } else if (nextErrors.fileUrl) {
        setActiveTab('files');
      }
      return;
    }
    await onSubmit(candidate);
  };

  const isDuplicateSlug =
    Boolean(values.slug) &&
    existingSlugs.some(
      (s) => s === values.slug && s !== editingResource?.slug
    );

  const hasUploadedFile = Boolean(
    !values.removeFile &&
    (Boolean(values.storedFilePath) ||
      Boolean(values.fileData) ||
      uploadedDocs.some(
        (d) =>
          Boolean(d.storedPath) ||
          d.url?.startsWith('data:') ||
          d.url?.includes('/api/resources/')
      ))
  );

  const hasIdentityErrors = Boolean(
    errors.title ||
    errors.slug ||
    isDuplicateSlug ||
    errors.domain ||
    errors.displayOrder
  );
  const hasContentErrors = Boolean(errors.summary || errors.topicsText);
  const hasFileErrors = Boolean(errors.fileUrl);

  const tabs: Array<{
    id: ResourceFormTabId;
    stepNum: number;
    label: string;
    icon: typeof BookOpen;
    hasError: boolean;
  }> = [
      {
        id: 'identity',
        stepNum: 1,
        label: 'Identity & Domain',
        icon: FileText,
        hasError: hasIdentityErrors,
      },
      {
        id: 'content',
        stepNum: 2,
        label: 'Content & Topics',
        icon: BookOpen,
        hasError: hasContentErrors,
      },
      {
        id: 'files',
        stepNum: 3,
        label: 'Files & Access',
        icon: ShieldCheck,
        hasError: hasFileErrors,
      },
    ];

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);

  const summaryWords = countWords(values.summary);
  const topicsWords = countWords(values.topicsText);

  const selectClass =
    'mt-1 h-[40px] w-full min-w-0 appearance-none rounded-lg border border-[#CBD5E1] bg-white py-1.5 pr-8 pl-3 text-[13px] font-medium text-[#0F172A] transition-colors focus:border-[#145BFF] focus:ring-1 focus:ring-[#145BFF] focus:outline-none';

  return (
    <MobileModalShell
      open={open}
      fullScreen
      title={
        editingResource ? 'Edit Resource / Study Note' : 'Create Resource / Note'
      }
      subtitle="Switch tabs below or use Previous / Next to configure Identity & Domain, Content & Topics, and Study File Access without scrolling."
      titleId="resource-form-modal-title"
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
                ? 'Saving…'
                : editingResource
                  ? 'Save & Publish'
                  : 'Publish Note'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Sticky Top Section Tabs (matching BlogFormModal) */}
        <div
          role="tablist"
          aria-label="Study material editor sections"
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
                className={`flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-semibold transition-colors ${isActive
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
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? 'bg-[#FECACA]' : 'bg-[#DC2626]'
                      }`}
                    title="Needs attention"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-3.5 py-2.5 text-xs leading-relaxed text-[#1E3A8A]">
          <Info className="h-4 w-4 shrink-0 text-[#145BFF]" />
          <span>
            Fields marked <strong className="text-[#DC2626]">*</strong> are
            required. Attach a study PDF/document and control public download
            protection in Tab 3.
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

        {/* TAB 1: IDENTITY & DOMAIN */}
        {activeTab === 'identity' && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Resource / Note Identity
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
                <div className="md:col-span-5">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="res-title"
                      className="block text-[12.5px] font-semibold text-[#334155]"
                    >
                      Note / Resource Title <span className="text-[#DC2626]">*</span>
                    </label>
                    <span
                      className={`text-[11px] tabular-nums ${getCounterTone(
                        values.title.length,
                        RESOURCE_FIELD_LIMITS.titleMaxChars
                      )}`}
                    >
                      {values.title.length}/{RESOURCE_FIELD_LIMITS.titleMaxChars}
                    </span>
                  </div>
                  <input
                    id="res-title"
                    type="text"
                    required
                    maxLength={RESOURCE_FIELD_LIMITS.titleMaxChars}
                    value={values.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Red Hat Enterprise Linux (RHEL) Administration Notes"
                    className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${errors.title
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

                <div className="md:col-span-4">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="res-slug"
                      className="block text-[12.5px] font-semibold text-[#334155]"
                    >
                      Auto URL Slug <span className="text-[#DC2626]">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] tabular-nums ${getCounterTone(
                          values.slug.length,
                          RESOURCE_FIELD_LIMITS.slugMaxChars
                        )}`}
                      >
                        {values.slug.length}/{RESOURCE_FIELD_LIMITS.slugMaxChars}
                      </span>
                      <button
                        type="button"
                        onClick={handleRegenerateUniqueSlug}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#145BFF] hover:underline"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Unique</span>
                      </button>
                    </div>
                  </div>
                  <input
                    id="res-slug"
                    type="text"
                    required
                    maxLength={RESOURCE_FIELD_LIMITS.slugMaxChars}
                    inputMode="url"
                    value={values.slug}
                    onChange={(e) => handleManualSlugChange(e.target.value)}
                    placeholder="rhel-administration-notes"
                    className={`mt-1 h-[40px] w-full rounded-lg border bg-white px-3 font-mono text-[13px] text-[#0F172A] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${errors.slug || isDuplicateSlug
                      ? 'border-[#DC2626]'
                      : 'border-[#CBD5E1] focus:border-[#145BFF]'
                      }`}
                  />
                  <p className="mt-1 truncate font-mono text-[11px] text-[#64748B]">
                    URL: /resources/{values.slug || 'auto-generated-slug'}
                  </p>
                  {(errors.slug || isDuplicateSlug) && (
                    <p className="mt-0.5 text-xs font-medium text-[#DC2626]">
                      {errors.slug || 'This slug already exists.'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label
                    htmlFor="res-code"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Note Code
                  </label>
                  <input
                    id="res-code"
                    type="text"
                    readOnly
                    aria-readonly="true"
                    value={values.noteCode}
                    className="mt-1 h-[40px] w-full cursor-not-allowed rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 font-mono text-[13px] font-semibold text-[#475569] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <label
                    htmlFor="res-section-type"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Section Type <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="res-section-type"
                      value={values.sectionType}
                      onChange={(e) =>
                        updateField(
                          'sectionType',
                          e.target.value as ResourceSectionType
                        )
                      }
                      className={selectClass}
                    >
                      <option value="Notes">Notes</option>
                      <option value="Lab Sections">Lab Sections</option>
                    </select>
                    <ChevronRight
                      className="pointer-events-none absolute top-1/2 right-2.5 mt-0.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="res-domain-select"
                      className="block text-[12.5px] font-semibold text-[#334155]"
                    >
                      Course / Domain <span className="text-[#DC2626]">*</span>
                    </label>
                    <span
                      className={`text-[11px] tabular-nums ${getCounterTone(
                        values.domain.length,
                        RESOURCE_FIELD_LIMITS.domainMaxChars
                      )}`}
                    >
                      {values.domain.length}/{RESOURCE_FIELD_LIMITS.domainMaxChars}
                    </span>
                  </div>
                  {(() => {
                    const matchedOption = mergedDomainOptions.find(
                      (d) => d.toLowerCase() === values.domain.trim().toLowerCase()
                    );
                    const selectValue = customDomainMode
                      ? '__custom__'
                      : matchedOption ?? (values.domain.trim() ? '__custom__' : '');
                    return (
                      <>
                        <div className="relative">
                          <select
                            id="res-domain-select"
                            value={selectValue}
                            onChange={(e) => {
                              const nextVal = e.target.value;
                              if (nextVal === '__custom__') {
                                setCustomDomainMode(true);
                                if (matchedOption) {
                                  updateField('domain', '');
                                }
                              } else {
                                setCustomDomainMode(false);
                                updateField('domain', nextVal);
                              }
                            }}
                            className={`${selectClass} ${errors.domain ? 'border-[#DC2626]' : ''
                              }`}
                          >
                            <option value="" disabled>
                              Select Course / Domain…
                            </option>
                            {mergedDomainOptions.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                            <option value="__custom__">
                              + Custom / Other Domain (Type manually)
                            </option>
                          </select>
                          <ChevronRight
                            className="pointer-events-none absolute top-1/2 right-2.5 mt-0.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
                            aria-hidden="true"
                          />
                        </div>

                        {(customDomainMode || selectValue === '__custom__') && (
                          <input
                            id="res-domain"
                            type="text"
                            required
                            maxLength={RESOURCE_FIELD_LIMITS.domainMaxChars}
                            value={values.domain}
                            onChange={(e) => updateField('domain', e.target.value)}
                            placeholder="Enter custom domain name (e.g., Linux & RHEL)"
                            className={`mt-2 h-[40px] w-full rounded-lg border bg-white px-3 text-[13px] text-[#0F172A] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${errors.domain
                              ? 'border-[#DC2626]'
                              : 'border-[#CBD5E1] focus:border-[#145BFF]'
                              }`}
                          />
                        )}
                      </>
                    );
                  })()}
                  {errors.domain && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.domain}
                    </p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label
                    htmlFor="res-filetype"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    File Type
                  </label>
                  <div className="relative">
                    <select
                      id="res-filetype"
                      value={values.fileType}
                      onChange={(e) => updateField('fileType', e.target.value)}
                      className={selectClass}
                    >
                      {FILE_TYPE_OPTIONS.map((ft) => (
                        <option key={ft} value={ft}>
                          {ft}
                        </option>
                      ))}
                    </select>
                    <ChevronRight
                      className="pointer-events-none absolute top-1/2 right-2.5 mt-0.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <label
                    htmlFor="res-order"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Order
                  </label>
                  <input
                    id="res-order"
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

                <div className="lg:col-span-2">
                  <label
                    htmlFor="res-status"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Status
                  </label>
                  <div className="relative">
                    <select
                      id="res-status"
                      value={values.status}
                      onChange={(e) =>
                        updateField('status', e.target.value as ResourceStatus)
                      }
                      className={selectClass}
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
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
        )}

        {/* TAB 2: NOTES SUMMARY & TOPICS */}
        {activeTab === 'content' && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Notes Summary &amp; Topics Outline
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="res-summary"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Summary / Description (optional)
                  </label>
                  <span
                    className={`text-[11px] tabular-nums ${getCounterTone(
                      summaryWords,
                      RESOURCE_FIELD_LIMITS.summaryMaxWords
                    )}`}
                  >
                    {summaryWords} / {RESOURCE_FIELD_LIMITS.summaryMaxWords} words
                  </span>
                </div>
                <textarea
                  id="res-summary"
                  rows={4}
                  maxLength={RESOURCE_FIELD_LIMITS.summaryMaxChars}
                  value={values.summary}
                  onChange={(e) =>
                    updateField(
                      'summary',
                      clampToMaxWords(
                        e.target.value,
                        RESOURCE_FIELD_LIMITS.summaryMaxWords
                      )
                    )
                  }
                  placeholder="Concise description of commands, labs, and exam prep covered…"
                  className={`mt-1 w-full rounded-lg border bg-white p-3 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${errors.summary
                    ? 'border-[#DC2626]'
                    : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                />
                {errors.summary && (
                  <p className="mt-1 text-xs font-medium text-[#DC2626]">
                    {errors.summary}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="res-topics"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Topics / Lab Outline (optional, one per line)
                  </label>
                  <span
                    className={`text-[11px] tabular-nums ${getCounterTone(
                      topicsWords,
                      RESOURCE_FIELD_LIMITS.topicsMaxWords
                    )}`}
                  >
                    {topicsWords} / {RESOURCE_FIELD_LIMITS.topicsMaxWords} words
                  </span>
                </div>
                <textarea
                  id="res-topics"
                  rows={4}
                  maxLength={RESOURCE_FIELD_LIMITS.topicsMaxChars}
                  value={values.topicsText}
                  onChange={(e) =>
                    updateField(
                      'topicsText',
                      clampToMaxWords(
                        e.target.value,
                        RESOURCE_FIELD_LIMITS.topicsMaxWords
                      )
                    )
                  }
                  placeholder={
                    'File system permissions & ACLs\nStorage partitioning & LVM\nManaging systemd units'
                  }
                  className={`mt-1 w-full rounded-lg border bg-white p-3 text-[13px] leading-relaxed text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:ring-1 focus:ring-[#145BFF] focus:outline-none ${errors.topicsText
                    ? 'border-[#DC2626]'
                    : 'border-[#CBD5E1] focus:border-[#145BFF]'
                    }`}
                />
                {errors.topicsText && (
                  <p className="mt-1 text-xs font-medium text-[#DC2626]">
                    {errors.topicsText}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: FILES & DOWNLOAD PROTECTION */}
        {activeTab === 'files' && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs sm:p-5">
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Study File &amp; Download Protection
            </h3>

            {/* Public Download Access Toggle Card */}
            <div
              className={`mb-4 flex flex-col justify-between gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center ${values.downloadEnabled
                ? 'border-emerald-200 bg-emerald-50/70'
                : 'border-amber-200 bg-amber-50/70'
                }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${values.downloadEnabled
                    ? 'border-emerald-200 bg-white text-emerald-600'
                    : 'border-amber-200 bg-white text-amber-600'
                    }`}
                >
                  {values.downloadEnabled ? (
                    <Unlock className="h-4.5 w-4.5" />
                  ) : (
                    <Lock className="h-4.5 w-4.5" />
                  )}
                </span>
                <div>
                  <p className="text-[13px] font-bold text-[#0F172A]">
                    {values.downloadEnabled
                      ? 'Public Download Enabled'
                      : 'Preview Only — Download Disabled'}
                  </p>
                  <p className="mt-0.5 text-xs text-[#475569]">
                    {values.downloadEnabled
                      ? 'Anyone visiting your website Notes page can download the study file directly.'
                      : 'Visitors can preview pages online with watermark & save protection, and see a "Contact to Download" notice.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={values.downloadEnabled}
                onClick={() =>
                  updateField('downloadEnabled', !values.downloadEnabled)
                }
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-4 text-xs font-bold transition-colors whitespace-nowrap ${values.downloadEnabled
                  ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'border-amber-400 bg-white text-amber-800 hover:bg-amber-100'
                  }`}
              >
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${values.downloadEnabled ? 'bg-white' : 'bg-amber-500'
                    }`}
                />
                <span>
                  {values.downloadEnabled
                    ? 'Download: ON (Click to Lock)'
                    : 'Download: OFF (Click to Enable)'}
                </span>
              </button>
            </div>

            {!values.downloadEnabled &&
              values.fileUrl.trim().toLowerCase().startsWith('http') && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
                  External web links cannot display watermarked pages inside the website preview. Upload the PDF on the left if you want students to view pages online without downloading.
                </div>
              )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DocumentUploadList
                label="Upload Study Note / Workbook (max 5 MB)"
                uploadFolder="resources"
                multiple={false}
                files={uploadedDocs}
                onAddFiles={handleAttachFile}
                onRemoveFile={handleRemoveFile}
                onReplaceFile={(_, rep) => handleAttachFile([rep])}
              />

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="res-file-url"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Static / External File URL (optional if uploading file)
                  </label>
                  <input
                    id="res-file-url"
                    type="text"
                    maxLength={500}
                    disabled={hasUploadedFile}
                    value={hasUploadedFile ? '' : values.fileUrl}
                    onChange={(e) => {
                      const nextUrl = e.target.value;
                      setValues((prev) => ({
                        ...prev,
                        fileUrl: nextUrl,
                        removeFile: false,
                      }));
                      if ('fileUrl' in errors) {
                        setErrors((prev) => ({ ...prev, fileUrl: undefined }));
                      }
                    }}
                    placeholder={
                      hasUploadedFile
                        ? 'Uploaded file active (click Remove on the left to use a link instead)'
                        : '/seed-materials/rhel-administration-notes.pdf or https://...'
                    }
                    className={`mt-1 h-[40px] w-full rounded-lg border px-3 font-mono text-[13px] focus:outline-none ${hasUploadedFile
                      ? 'cursor-not-allowed border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
                      : errors.fileUrl
                        ? 'border-[#DC2626] bg-white text-[#0F172A] focus:ring-1 focus:ring-[#145BFF]'
                        : 'border-[#CBD5E1] bg-white text-[#0F172A] focus:border-[#145BFF] focus:ring-1 focus:ring-[#145BFF]'
                      }`}
                  />
                  {errors.fileUrl && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.fileUrl}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="res-file-name"
                    className="block text-[12.5px] font-semibold text-[#334155]"
                  >
                    Display File Name
                  </label>
                  <input
                    id="res-file-name"
                    type="text"
                    maxLength={255}
                    value={values.fileName}
                    onChange={(e) => updateField('fileName', e.target.value)}
                    placeholder="rhel-administration-notes.pdf"
                    className="mt-1 h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 font-mono text-[13px] text-[#0F172A] focus:border-[#145BFF] focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs text-[#334155]">
                  <p className="font-bold text-[#0B1736]">Study Material Summary</p>
                  <ul className="mt-2 space-y-1 text-[#475569]">
                    <li>
                      Title:{' '}
                      <strong className="text-[#0B1736]">
                        {values.title.trim() || 'Not set yet'}
                      </strong>
                    </li>
                    <li>
                      Domain:{' '}
                      <strong className="text-[#0B1736]">
                        {values.domain.trim() || 'Not selected'} ({values.sectionType})
                      </strong>
                    </li>
                    <li>
                      Access:{' '}
                      <strong className="text-[#145BFF]">
                        {values.downloadEnabled
                          ? 'Download Open'
                          : 'Preview Only (Protected)'}{' '}
                        · {values.status}
                      </strong>
                    </li>
                    <li>
                      File: {values.fileName.trim() || values.fileUrl.trim() || 'No file attached yet'}
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
