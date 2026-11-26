import { Download, ExternalLink, FileText, FolderOpen } from 'lucide-react';
import { MobileModalShell } from '../../components/MobileModalShell';
import { formatFileSize } from '../../utils/adminLogic';
import { sanitizeSafeHref } from '../../../src/utils/scrollMath';
import type { BlogArticle } from '../types/blog';

interface BlogFilesModalProps {
  open: boolean;
  blogs: BlogArticle[];
  onClose: () => void;
  onPreviewBlog: (blog: BlogArticle) => void;
}

export function BlogFilesModal({
  open,
  blogs,
  onClose,
  onPreviewBlog,
}: BlogFilesModalProps) {
  const rows = blogs.flatMap((blog) =>
    blog.attachments.map((file) => ({ blog, file }))
  );

  return (
    <MobileModalShell
      open={open}
      title="Blog Companion Files"
      subtitle="All PDFs and lab reference documents attached to published & draft blog articles."
      titleId="blog-files-modal-title"
      maxWidthClass="sm:max-w-2xl"
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] rounded-lg border border-[#CBD5E1] bg-white px-5 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC]"
          >
            Close
          </button>
        </div>
      }
    >
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center">
          <FolderOpen className="mx-auto h-8 w-8 text-[#64748B]" />
          <p className="mt-2.5 text-sm font-bold text-[#0B1736]">
            No companion files uploaded yet
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            Upload optional guide PDFs inside any blog article editor to store them in the project folder and list them here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map(({ blog, file }) => (
            <li
              key={`${blog.id}-${file.id}`}
              className="flex flex-col justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-[#145BFF]">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#0B1736]">
                    {file.name}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-[#64748B]">
                    <span className="font-mono font-semibold text-[#145BFF]">
                      {blog.blogCode}
                    </span>{' '}
                    · {blog.title} · {formatFileSize(file.sizeBytes)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onPreviewBlog(blog);
                  }}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold text-[#334155] hover:bg-[#F1F5F9]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Article</span>
                </button>
                {sanitizeSafeHref(file.url) && (
                  <a
                    href={sanitizeSafeHref(file.url)!}
                    download={file.name}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#145BFF] px-3 text-xs font-semibold text-white hover:bg-[#0F4AD6]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </MobileModalShell>
  );
}
