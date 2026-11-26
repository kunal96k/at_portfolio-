import {
  Calendar,
  Clock,
  Download,
  Edit3,
  Eye,
  FileText,
  Hash,
  Layers,
  Sparkles,
  User,
} from 'lucide-react';
import { MobileModalShell } from '../../components/MobileModalShell';
import { StatusBadge } from '../../components/StatusBadge';
import { formatFileSize, formatShortDate } from '../../utils/adminLogic';
import { sanitizeSafeHref } from '../../../src/utils/scrollMath';
import type { BlogArticle } from '../types/blog';

interface BlogPreviewModalProps {
  blog: BlogArticle | null;
  onClose: () => void;
  onEdit: (blog: BlogArticle) => void;
  onToggleStatus: (blog: BlogArticle) => void;
  onToggleFeatured: (blog: BlogArticle) => void;
}

export function BlogPreviewModal({
  blog,
  onClose,
  onEdit,
  onToggleStatus,
  onToggleFeatured,
}: BlogPreviewModalProps) {
  if (!blog) return null;

  return (
    <MobileModalShell
      open={Boolean(blog)}
      fullScreen
      title={blog.title}
      subtitle={`${blog.blogCode} · /blogs/${blog.slug}`}
      titleId="blog-preview-title"
      onClose={onClose}
      headerBadge={
        <>
          <StatusBadge status={blog.status} />
          <span className="rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#145BFF]">
            {blog.category}
          </span>
          {blog.featured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              <Sparkles className="h-3 w-3" />
              Most Viewed
            </span>
          )}
        </>
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus(blog)}
              className="h-[40px] rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#0F172A] shadow-xs hover:bg-[#F8FAFC]"
            >
              {blog.status === 'Published'
                ? 'Move to Draft'
                : 'Publish to Website'}
            </button>
            <button
              type="button"
              onClick={() => onToggleFeatured(blog)}
              className="inline-flex h-[40px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#145BFF] shadow-xs hover:bg-[#EFF6FF]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {blog.featured ? 'Unmark Most Viewed' : 'Mark Most Viewed'}
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
                onEdit(blog);
              }}
              className="inline-flex h-[40px] w-full min-w-0 items-center justify-center gap-1.5 rounded-lg bg-[#145BFF] px-5 text-[13px] font-semibold text-white shadow-xs hover:bg-[#0F4AD6] sm:w-auto whitespace-nowrap"
            >
              <Edit3 className="h-4 w-4 shrink-0" />
              <span>Edit Article</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          {blog.coverImage && (
            <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs">
              <img
                src={blog.coverImage}
                alt={blog.title}
                referrerPolicy="no-referrer"
                className="max-h-[340px] w-full object-cover"
              />
              {blog.featured && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#145BFF] px-3 py-1 text-xs font-bold uppercase text-white shadow">
                  <Sparkles className="h-3.5 w-3.5" />
                  MOST VIEWED
                </span>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Summary / Excerpt
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#334155]">
              {blog.excerpt}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-[#0B1736]">
              Article Body Sections ({blog.sections.length})
            </h3>
            {blog.sections.length === 0 ? (
              <p className="mt-2 text-xs text-[#64748B]">
                No structured body sections added yet. Edit this blog article to write detailed sections.
              </p>
            ) : (
              <div className="mt-4 space-y-5">
                {blog.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="space-y-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                  >
                    <h4 className="text-sm font-bold text-[#0B1736]">
                      {sec.heading || `Section ${idx + 1}`}
                    </h4>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-[#334155]">
                      {sec.body}
                    </p>
                    {sec.images && sec.images.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                        {sec.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`${sec.heading} illustration`}
                            referrerPolicy="no-referrer"
                            className="max-h-48 w-full rounded-lg border border-[#E2E8F0] object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Editorial Metadata
            </h3>
            <dl className="mt-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Layers className="h-4 w-4 text-[#145BFF]" />
                  <span>Category</span>
                </dt>
                <dd className="font-semibold text-[#0B1736]">{blog.category}</dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <User className="h-4 w-4 text-[#64748B]" />
                  <span>Author</span>
                </dt>
                <dd className="font-semibold text-[#0B1736]">{blog.author}</dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Clock className="h-4 w-4 text-[#64748B]" />
                  <span>Read Time</span>
                </dt>
                <dd className="font-semibold text-[#0B1736]">
                  {blog.readTime} · {blog.guideLabel}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Hash className="h-4 w-4 text-[#64748B]" />
                  <span>Code &amp; Order</span>
                </dt>
                <dd className="font-mono font-semibold text-[#0B1736] tabular-nums">
                  {blog.blogCode} · #{String(blog.displayOrder).padStart(2, '0')}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Eye className="h-4 w-4 text-[#64748B]" />
                  <span>Reader Views</span>
                </dt>
                <dd className="font-semibold text-[#0B1736] tabular-nums">
                  {blog.viewsCount}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Calendar className="h-4 w-4 text-[#64748B]" />
                  <span>Last Updated</span>
                </dt>
                <dd className="font-mono font-semibold text-[#475569] tabular-nums">
                  {formatShortDate(blog.updatedAt)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-[#F1F5F9] pt-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Tags
              </p>
              {blog.tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-xs font-medium text-[#334155]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-xs text-[#64748B]">No tags</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-[#0B1736]">
              Companion Files ({blog.attachments.length})
            </h3>
            {blog.attachments.length === 0 ? (
              <p className="mt-2 text-xs text-[#64748B]">
                No companion PDF or reference files attached.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {blog.attachments.map((file) => (
                  <li
                    key={file.id}
                    className="flex flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FileText className="h-4 w-4 shrink-0 text-[#145BFF]" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#0B1736]">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-[#64748B] tabular-nums">
                          {formatFileSize(file.sizeBytes)}
                        </p>
                      </div>
                    </div>
                    {sanitizeSafeHref(file.url) && (
                      <a
                        href={sanitizeSafeHref(file.url)!}
                        download={file.name}
                        className="inline-flex min-h-[36px] shrink-0 items-center justify-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#145BFF] hover:bg-[#EFF6FF]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </MobileModalShell>
  );
}
