import {
  BookOpen,
  Clock,
  Edit2,
  Eye,
  Layers,
  Paperclip,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveDataView,
  type CardField,
  type RowAction,
  type TableColumn,
} from '../../components/ResponsiveDataView';
import { StatusBadge } from '../../components/StatusBadge';
import { formatShortDate } from '../../utils/adminLogic';
import type { BlogArticle, BlogSortField } from '../types/blog';

interface BlogTableAndCardsProps {
  blogs: BlogArticle[];
  loading: boolean;
  totalRecordsCount: number;
  sortBy: BlogSortField;
  sortDir: 'asc' | 'desc';
  onSort: (field: BlogSortField) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPreview: (blog: BlogArticle) => void;
  onEdit: (blog: BlogArticle) => void;
  onToggleFeatured: (blog: BlogArticle) => void;
  onDelete: (blog: BlogArticle) => void;
  onCreateNew: () => void;
}

export function BlogTableAndCards({
  blogs,
  loading,
  totalRecordsCount,
  sortBy,
  sortDir,
  onSort,
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPreview,
  onEdit,
  onToggleFeatured,
  onDelete,
  onCreateNew,
}: BlogTableAndCardsProps) {
  const columns: TableColumn<BlogArticle>[] = [
    {
      key: 'displayOrder',
      header: 'Order',
      sortable: true,
      render: (blog) => (
        <span className="font-mono text-xs font-semibold text-[#475569] tabular-nums">
          #{String(blog.displayOrder).padStart(2, '0')}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Blog Article',
      sortable: true,
      render: (blog) => (
        <div className="flex max-w-[280px] items-center gap-3 overflow-hidden xl:max-w-[340px]">
          {blog.coverImage ? (
            <img
              src={blog.coverImage}
              alt={blog.title}
              referrerPolicy="no-referrer"
              className="h-11 w-14 shrink-0 rounded-lg border border-[#E2E8F0] object-cover"
            />
          ) : (
            <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#145BFF]">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onPreview(blog)}
                title={blog.title}
                className="min-w-0 truncate text-left font-semibold text-[#0B1736] hover:text-[#145BFF]"
              >
                {blog.title}
              </button>
              {blog.featured && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-[#EEF2FF] px-1.5 py-0.5 text-[10px] font-bold text-[#145BFF]">
                  <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                  Most Viewed
                </span>
              )}
            </div>
            <p
              title={`${blog.blogCode} · ${blog.excerpt}`}
              className="truncate text-[11.5px] text-[#64748B]"
            >
              <span className="font-mono">{blog.blogCode}</span> · {blog.excerpt}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category / Slug',
      render: (blog) => (
        <div className="min-w-0 max-w-[205px] overflow-hidden xl:max-w-[240px]">
          <p
            title={blog.category}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1736]"
          >
            <Layers className="h-3.5 w-3.5 shrink-0 text-[#145BFF]" />
            <span className="min-w-0 flex-1 truncate">{blog.category}</span>
          </p>
          <p
            title={`/blogs/${blog.slug}`}
            className="mt-0.5 truncate font-mono text-[11px] text-[#64748B]"
          >
            /blogs/{blog.slug}
          </p>
        </div>
      ),
    },
    {
      key: 'author',
      header: 'Author & Meta',
      render: (blog) => (
        <div className="min-w-0 text-xs">
          <p className="truncate font-medium text-[#0B1736]">{blog.author}</p>
          <p className="mt-0.5 flex items-center gap-2 text-[11px] text-[#64748B]">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {blog.readTime}
            </span>
            {blog.attachments.length > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[#145BFF]">
                <Paperclip className="h-3 w-3" aria-hidden="true" />
                {blog.attachments.length}
              </span>
            )}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (blog) => (
        <div className="space-y-1">
          <StatusBadge status={blog.status} />
          {blog.status === 'Scheduled' && blog.scheduledAt ? (
            <p className="text-[11px] font-medium text-[#145BFF] tabular-nums">
              {blog.scheduledAt.replace('T', ' ').slice(0, 16)}
            </p>
          ) : (
            <p className="text-[11px] font-medium text-[#64748B] tabular-nums">
              {blog.viewsCount} {blog.viewsCount === 1 ? 'view' : 'views'}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      align: 'right',
      render: (blog) => (
        <div className="text-right text-xs tabular-nums">
          <p className="font-medium text-[#0B1736]">
            {formatShortDate(blog.updatedAt)}
          </p>
          <p className="text-[11px] text-[#64748B]">
            {blog.sections.length}{' '}
            {blog.sections.length === 1 ? 'section' : 'sections'}
          </p>
        </div>
      ),
    },
  ];

  const cardPrimaryFields: CardField<BlogArticle>[] = [
    {
      label: 'Category',
      render: (blog) => blog.category,
    },
    {
      label: 'Order & Code',
      render: (blog) => `#${blog.displayOrder} · ${blog.blogCode}`,
    },
    {
      label: 'Read Time',
      render: (blog) => `${blog.readTime} · ${blog.viewsCount} views`,
    },
    {
      label: 'Updated',
      render: (blog) => formatShortDate(blog.updatedAt),
    },
  ];

  const cardExpandedFields: CardField<BlogArticle>[] = [
    {
      label: 'URL Slug',
      render: (blog) => `/blogs/${blog.slug}`,
    },
    {
      label: 'Excerpt',
      render: (blog) => blog.excerpt,
    },
  ];

  const actions: RowAction<BlogArticle>[] = [
    {
      id: 'preview',
      label: 'Preview Article',
      icon: <Eye className="h-4 w-4 text-[#64748B]" />,
      onClick: onPreview,
    },
    {
      id: 'edit',
      label: 'Edit Article',
      icon: <Edit2 className="h-4 w-4 text-[#64748B]" />,
      onClick: onEdit,
    },
    {
      id: 'toggle-featured',
      label: (blog) =>
        blog.featured ? 'Remove Most Viewed' : 'Mark Most Viewed',
      icon: <Sparkles className="h-4 w-4 text-[#145BFF]" />,
      onClick: onToggleFeatured,
    },
    {
      id: 'delete',
      label: 'Delete Article',
      destructive: true,
      icon: <Trash2 className="h-4 w-4 text-[#DC2626]" />,
      onClick: onDelete,
    },
  ];

  const noRecordsAtAll = totalRecordsCount === 0;

  return (
    <ResponsiveDataView
      items={blogs}
      loading={loading}
      emptyTitle={
        noRecordsAtAll
          ? 'No blog articles found in database'
          : 'No matching blog articles found'
      }
      emptyDescription={
        noRecordsAtAll
          ? 'Create your first infrastructure blog article or study guide to publish it live on the website.'
          : 'Try clearing your search or filters, or create a new blog article.'
      }
      emptyActionLabel="New Blog Article"
      onEmptyAction={onCreateNew}
      columns={columns}
      getCardTitle={(blog) => blog.title}
      getCardSubtitle={(blog) =>
        `${blog.blogCode} · ${blog.category}${blog.featured ? ' · Most Viewed' : ''}`
      }
      getCardStatus={(blog) => blog.status}
      getCardThumbnail={(blog) => blog.coverImage}
      cardPrimaryFields={cardPrimaryFields}
      cardExpandedFields={cardExpandedFields}
      actions={actions}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={(key) => {
        if (
          key === 'displayOrder' ||
          key === 'title' ||
          key === 'updatedAt' ||
          key === 'createdAt' ||
          key === 'viewsCount'
        ) {
          onSort(key);
        }
      }}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      startIndex={startIndex}
      endIndex={endIndex}
      onPageChange={onPageChange}
    />
  );
}
