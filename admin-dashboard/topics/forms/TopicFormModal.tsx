import { ChevronRight, Eye, Info, Plus, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import {
  DocumentUploadList,
  ImageUploadZone,
} from '../../components/FileUploadZone';
import { MobileModalShell } from '../../components/MobileModalShell';
import { COURSE_TRACK_OPTIONS } from '../../data/mockAdminData';
import { slugifyText, validateTopicForm } from '../../utils/adminLogic';
import type {
  Topic,
  TopicFormValues,
  TopicLearningLevel,
  TopicStatus,
  TopicValidationErrors,
} from '../types/topic';

interface TopicFormModalProps {
  open: boolean;
  editingTopic: Topic | null;
  existingSlugs: string[];
  defaultDisplayOrder: number;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: TopicFormValues) => Promise<void>;
  onPreviewDraft: (values: TopicFormValues) => void;
}

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
];

function buildInitialValues(
  editingTopic: Topic | null,
  defaultDisplayOrder: number
): TopicFormValues {
  if (editingTopic) {
    return {
      title: editingTopic.title,
      slug: editingTopic.slug,
      shortDescription: editingTopic.shortDescription,
      detailedContent: editingTopic.detailedContent,
      relatedCourse: editingTopic.relatedCourse,
      subject: editingTopic.subject,
      coverImage: editingTopic.coverImage,
      coverImageName: editingTopic.coverImageName || 'cover-image.jpg',
      tags: editingTopic.tags,
      learningLevel: editingTopic.learningLevel,
      attachments: editingTopic.attachments,
      displayOrder: editingTopic.displayOrder,
      featured: editingTopic.featured,
      status: editingTopic.status,
    };
  }

  return {
    title: '',
    slug: '',
    shortDescription: '',
    detailedContent: '',
    relatedCourse: COURSE_TRACK_OPTIONS[0],
    subject: '',
    coverImage: SAMPLE_COVER_PRESETS[0].url,
    coverImageName: SAMPLE_COVER_PRESETS[0].name,
    tags: [],
    learningLevel: 'Intermediate',
    attachments: [],
    displayOrder: defaultDisplayOrder,
    featured: false,
    status: 'Draft',
  };
}

export function TopicFormModal({
  open,
  editingTopic,
  existingSlugs,
  defaultDisplayOrder,
  submitting,
  onClose,
  onSubmit,
  onPreviewDraft,
}: TopicFormModalProps) {
  const [values, setValues] = useState<TopicFormValues>(() =>
    buildInitialValues(editingTopic, defaultDisplayOrder)
  );
  const [slugLocked, setSlugLocked] = useState(Boolean(editingTopic));
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<TopicValidationErrors>({});

  useEffect(() => {
    if (!open) return;
    setValues(buildInitialValues(editingTopic, defaultDisplayOrder));
    setSlugLocked(Boolean(editingTopic));
    setTagInput('');
    setErrors({});
  }, [open, editingTopic, defaultDisplayOrder]);

  const updateField = <K extends keyof TopicFormValues>(
    field: K,
    val: TopicFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTitleChange = (title: string) => {
    setValues((prev) => ({
      ...prev,
      title,
      slug: slugLocked ? prev.slug : slugifyText(title),
    }));
    setErrors((prev) => ({ ...prev, title: undefined, slug: undefined }));
  };

  const handleAddTag = () => {
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
    targetStatus: TopicStatus,
    e?: FormEvent
  ) => {
    e?.preventDefault();
    if (submitting) return;
    const candidate: TopicFormValues = {
      ...values,
      status: targetStatus,
    };
    const nextErrors = validateTopicForm(
      candidate,
      existingSlugs,
      editingTopic?.slug
    );
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    await onSubmit(candidate);
  };

  const selectClass =
    'mt-1.5 min-h-[44px] w-full min-w-0 appearance-none rounded-xl border border-[#E2E8F0] bg-white py-2 pr-9 pl-3.5 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none';

  return (
    <MobileModalShell
      open={open}
      title={editingTopic ? 'Edit Topic' : 'Create New Topic'}
      subtitle="Add topic metadata, syllabus notes, cover image, and downloadable files."
      titleId="topic-form-modal-title"
      maxWidthClass="sm:max-w-4xl"
      busy={submitting}
      onClose={onClose}
      asForm
      onFormSubmit={(e) => void handleSubmitWithStatus(values.status, e)}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => onPreviewDraft(values)}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#0B1736] hover:bg-[#F5F7FC] sm:w-auto"
          >
            <Eye className="h-4 w-4 shrink-0 text-[#145BFF]" />
            <span>Preview</span>
          </button>

          <div className="grid grid-cols-1 gap-2 min-[350px]:grid-cols-2 sm:flex sm:items-center">
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmitWithStatus('Draft')}
              className="min-h-[44px] w-full min-w-0 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-sm font-semibold text-[#0B1736] hover:bg-[#F5F7FC] disabled:opacity-50 sm:w-auto"
            >
              {submitting ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmitWithStatus('Published')}
              className="min-h-[44px] w-full min-w-0 rounded-xl bg-[#145BFF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0F4AD6] disabled:opacity-50 sm:w-auto whitespace-nowrap"
            >
              {submitting
                ? 'Publishing…'
                : editingTopic
                  ? 'Save & Publish'
                  : 'Publish Topic'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Form Guidelines */}
        <div className="flex items-start gap-2.5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF]/70 px-3.5 py-2.5 text-xs leading-relaxed text-[#1E3A8A]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#145BFF]" />
          <span>
            Fields marked <strong className="text-[#DC2626]">*</strong> are
            required. Uploaded cover images and PDF/lab notes must each be{' '}
            <strong>5 MB or smaller</strong>.
          </span>
        </div>

        {Object.keys(errors).length > 0 && (
          <div
            role="alert"
            className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-xs font-medium text-[#B91C1C]"
          >
            Please review the highlighted fields before saving this topic.
          </div>
        )}

        {/* Title & Slug */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="topic-title"
              className="block text-sm font-semibold text-[#0B1736]"
            >
              Topic Title <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="topic-title"
              type="text"
              required
              value={values.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., RHEL 9 Firewalld Zones & Rich Rules"
              className={`mt-1.5 min-h-[44px] w-full rounded-xl border bg-white px-3.5 text-sm text-[#0B1736] focus:outline-none ${
                errors.title
                  ? 'border-[#DC2626] focus:border-[#DC2626]'
                  : 'border-[#E2E8F0] focus:border-[#145BFF]'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs font-medium text-[#DC2626]">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="topic-slug"
              className="block text-sm font-semibold text-[#0B1736]"
            >
              URL Slug <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="topic-slug"
              type="text"
              required
              inputMode="url"
              value={values.slug}
              onChange={(e) => {
                setSlugLocked(true);
                updateField('slug', slugifyText(e.target.value));
              }}
              placeholder="rhel-9-firewalld-zones"
              className={`mt-1.5 min-h-[44px] w-full rounded-xl border bg-white px-3.5 font-mono text-sm text-[#0B1736] focus:outline-none ${
                errors.slug
                  ? 'border-[#DC2626] focus:border-[#DC2626]'
                  : 'border-[#E2E8F0] focus:border-[#145BFF]'
              }`}
            />
            {errors.slug && (
              <p className="mt-1 text-xs font-medium text-[#DC2626]">
                {errors.slug}
              </p>
            )}
          </div>
        </div>

        {/* Course, Subject, Level, Display Order */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="topic-course"
              className="block text-sm font-semibold text-[#0B1736]"
            >
              Related Course / Technology{' '}
              <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <select
                id="topic-course"
                value={values.relatedCourse}
                onChange={(e) => updateField('relatedCourse', e.target.value)}
                className={selectClass}
              >
                {COURSE_TRACK_OPTIONS.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              <ChevronRight
                className="pointer-events-none absolute top-1/2 right-3 mt-0.5 h-4 w-4 -translate-y-1/2 rotate-90 text-[#64748B]"
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
            <label
              htmlFor="topic-subject"
              className="block text-sm font-semibold text-[#0B1736]"
            >
              Subject / Module Area
            </label>
            <input
              id="topic-subject"
              type="text"
              value={values.subject}
              onChange={(e) => updateField('subject', e.target.value)}
              placeholder="e.g., Network Security, Linux Storage"
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="topic-level"
              className="block text-sm font-semibold text-[#0B1736]"
            >
              Learning Level
            </label>
            <div className="relative">
              <select
                id="topic-level"
                value={values.learningLevel}
                onChange={(e) =>
                  updateField(
                    'learningLevel',
                    e.target.value as TopicLearningLevel
                  )
                }
                className={selectClass}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <ChevronRight
                className="pointer-events-none absolute top-1/2 right-3 mt-0.5 h-4 w-4 -translate-y-1/2 rotate-90 text-[#64748B]"
                aria-hidden="true"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="topic-order"
              className="block text-sm font-semibold text-[#0B1736]"
            >
              Display Order
            </label>
            <input
              id="topic-order"
              type="number"
              inputMode="numeric"
              min={1}
              value={values.displayOrder}
              onChange={(e) =>
                updateField(
                  'displayOrder',
                  Math.max(0, Number(e.target.value) || 0)
                )
              }
              className={`mt-1.5 min-h-[44px] w-full rounded-xl border bg-white px-3.5 text-sm text-[#0B1736] tabular-nums focus:outline-none ${
                errors.displayOrder
                  ? 'border-[#DC2626]'
                  : 'border-[#E2E8F0] focus:border-[#145BFF]'
              }`}
            />
            {errors.displayOrder && (
              <p className="mt-1 text-xs font-medium text-[#DC2626]">
                {errors.displayOrder}
              </p>
            )}
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label
            htmlFor="topic-short-desc"
            className="block text-sm font-semibold text-[#0B1736]"
          >
            Short Description <span className="text-[#DC2626]">*</span>
          </label>
          <textarea
            id="topic-short-desc"
            rows={2}
            value={values.shortDescription}
            onChange={(e) => updateField('shortDescription', e.target.value)}
            placeholder="Brief 1–2 sentence overview shown on cards and listings…"
            className={`mt-1.5 w-full rounded-xl border bg-white p-3.5 text-sm text-[#0B1736] focus:outline-none ${
              errors.shortDescription
                ? 'border-[#DC2626]'
                : 'border-[#E2E8F0] focus:border-[#145BFF]'
            }`}
          />
          {errors.shortDescription && (
            <p className="mt-1 text-xs font-medium text-[#DC2626]">
              {errors.shortDescription}
            </p>
          )}
        </div>

        {/* Detailed Content */}
        <div>
          <label
            htmlFor="topic-content"
            className="block text-sm font-semibold text-[#0B1736]"
          >
            Detailed Content / Lab Outline{' '}
            <span className="text-[#DC2626]">*</span>
          </label>
          <textarea
            id="topic-content"
            rows={5}
            value={values.detailedContent}
            onChange={(e) => updateField('detailedContent', e.target.value)}
            placeholder="Step-by-step topic notes, lab objectives, commands, or learning checklist…"
            className={`mt-1.5 w-full rounded-xl border bg-white p-3.5 text-sm leading-relaxed text-[#0B1736] focus:outline-none ${
              errors.detailedContent
                ? 'border-[#DC2626]'
                : 'border-[#E2E8F0] focus:border-[#145BFF]'
            }`}
          />
          {errors.detailedContent && (
            <p className="mt-1 text-xs font-medium text-[#DC2626]">
              {errors.detailedContent}
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="topic-tag-input"
            className="block text-sm font-semibold text-[#0B1736]"
          >
            Topic Tags
          </label>
          <div className="mt-1.5 flex min-w-0 gap-2">
            <input
              id="topic-tag-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="e.g. firewalld"
              className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] px-3.5 text-sm font-semibold text-[#0B1736] hover:bg-[#EFF6FF] hover:text-[#145BFF]"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Add</span>
            </button>
          </div>
          {values.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {values.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                  className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F5F7FC] px-2.5 text-xs font-medium text-[#0B1736] hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                >
                  <span>{tag}</span>
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Uploads: Cover Image + Learning Resources */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2.5">
            <ImageUploadZone
              label="Topic Thumbnail / Cover Image"
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
                  className="rounded-md border border-[#E2E8F0] bg-white px-2 py-1 text-[11px] font-semibold text-[#475569] hover:border-[#145BFF] hover:text-[#145BFF]"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <DocumentUploadList
            label="PDF, Notes & Learning Resources"
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
            onReplaceFile={(id, replacement) =>
              updateField(
                'attachments',
                values.attachments.map((f) => (f.id === id ? replacement : f))
              )
            }
          />
        </div>

        {/* Visibility & Publishing Controls */}
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F5F7FC] p-3.5 sm:grid-cols-2 sm:p-4">
          <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0B1736]">
                Featured Topic
              </p>
              <p className="text-xs text-[#64748B]">
                Highlight at the top of the public topics showcase.
              </p>
            </div>
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(e) => updateField('featured', e.target.checked)}
              className="h-5 w-5 shrink-0 rounded border-[#CBD5E1] accent-[#145BFF]"
            />
          </label>

          <div className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0B1736]">Status</p>
              <p className="text-xs text-[#64748B]">
                Save as Draft or publish immediately.
              </p>
            </div>
            <div className="relative shrink-0">
              <select
                aria-label="Topic publish status"
                value={values.status}
                onChange={(e) =>
                  updateField('status', e.target.value as TopicStatus)
                }
                className="min-h-[40px] appearance-none rounded-lg border border-[#E2E8F0] bg-[#F5F7FC] py-1.5 pr-7 pl-2.5 text-xs font-semibold text-[#0B1736]"
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
        </div>
      </div>
    </MobileModalShell>
  );
}
