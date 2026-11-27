import {
  Building2,
  Edit2,
  Eye,
  GraduationCap,
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
import type {
  StudentTestimonial,
  TestimonialSortField,
} from '../types/testimonial';

interface TestimonialTableAndCardsProps {
  items: StudentTestimonial[];
  loading: boolean;
  totalRecordsCount: number;
  sortBy: TestimonialSortField;
  sortDir: 'asc' | 'desc';
  onSort: (field: TestimonialSortField) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPreview: (item: StudentTestimonial) => void;
  onEdit: (item: StudentTestimonial) => void;
  onToggleFeatured: (item: StudentTestimonial) => void;
  onDelete: (item: StudentTestimonial) => void;
  onCreateNew: () => void;
}

export function TestimonialTableAndCards({
  items,
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
}: TestimonialTableAndCardsProps) {
  const columns: TableColumn<StudentTestimonial>[] = [
    {
      key: 'displayOrder',
      header: 'Order',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-[#475569] tabular-nums">
          #{String(item.displayOrder).padStart(2, '0')}
        </span>
      ),
    },
    {
      key: 'studentName',
      header: 'Student & Placement',
      sortable: true,
      render: (item) => (
        <div className="flex max-w-[300px] items-center gap-3 overflow-hidden xl:max-w-[340px]">
          {item.avatarUrl ? (
            <img
              src={item.avatarUrl}
              alt={item.studentName}
              referrerPolicy="no-referrer"
              className="h-11 w-11 shrink-0 rounded-full border border-[#E2E8F0] object-cover object-top"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-bold text-[#145BFF]">
              {item.studentName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onPreview(item)}
                title={item.studentName}
                className="min-w-0 truncate text-left font-semibold text-[#0B1736] hover:text-[#145BFF]"
              >
                {item.studentName}
              </button>
              {item.featured && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-[#EEF2FF] px-1.5 py-0.5 text-[10px] font-bold text-[#145BFF]">
                  <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                  Featured
                </span>
              )}
            </div>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] text-[#64748B]">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {[item.role, item.company].filter(Boolean).join(' · ') || 'Placed Alumni'}
              </span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'courseTrack',
      header: 'Course Track',
      sortable: true,
      render: (item) => (
        <div className="min-w-0 max-w-[210px]">
          <p className="flex items-center gap-1.5 truncate text-xs font-semibold text-[#0B1736]">
            <GraduationCap className="h-3.5 w-3.5 shrink-0 text-[#145BFF]" />
            <span className="truncate">{item.courseTrack || 'Optional / Unspecified'}</span>
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-[#64748B]">
            {item.testimonialCode}
          </p>
        </div>
      ),
    },
    {
      key: 'quote',
      header: 'Quote Preview',
      render: (item) => (
        <p className="line-clamp-2 max-w-[260px] text-xs text-[#334155]">
          &ldquo;{item.quote}&rdquo;
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="text-xs font-medium text-[#475569] tabular-nums">
          {formatShortDate(item.updatedAt)}
        </span>
      ),
    },
  ];

  const cardPrimaryFields: CardField<StudentTestimonial>[] = [
    {
      label: 'Course Track',
      render: (item) => item.courseTrack || 'Optional / Unspecified',
    },
    {
      label: 'Placement',
      render: (item) => [item.company, item.role].filter(Boolean).join(' | ') || '—',
    },
    {
      label: 'Code & Order',
      render: (item) => `${item.testimonialCode} · #${item.displayOrder}`,
    },
    {
      label: 'Updated',
      render: (item) => formatShortDate(item.updatedAt),
    },
  ];

  const cardExpandedFields: CardField<StudentTestimonial>[] = [
    {
      label: 'Student Quote',
      render: (item) => `"${item.quote}"`,
    },
  ];

  const actions: RowAction<StudentTestimonial>[] = [
    {
      id: 'preview',
      label: 'Preview Card',
      icon: <Eye className="h-4 w-4 text-[#64748B]" />,
      onClick: onPreview,
    },
    {
      id: 'edit',
      label: 'Edit Testimonial',
      icon: <Edit2 className="h-4 w-4 text-[#64748B]" />,
      onClick: onEdit,
    },
    {
      id: 'toggle-featured',
      label: (item) =>
        item.featured ? 'Remove Featured' : 'Mark Featured',
      icon: <Sparkles className="h-4 w-4 text-[#145BFF]" />,
      onClick: onToggleFeatured,
    },
    {
      id: 'delete',
      label: 'Delete Testimonial',
      destructive: true,
      icon: <Trash2 className="h-4 w-4 text-[#DC2626]" />,
      onClick: onDelete,
    },
  ];

  const noRecordsAtAll = totalRecordsCount === 0;

  return (
    <ResponsiveDataView
      items={items}
      loading={loading}
      emptyTitle={
        noRecordsAtAll
          ? 'No student testimonials found in database'
          : 'No matching testimonials found'
      }
      emptyDescription={
        noRecordsAtAll
          ? 'Add placed student reviews and photos to showcase real career transformations on the public site.'
          : 'Try clearing your search or status/course track filters.'
      }
      emptyActionLabel="Add Testimonial"
      onEmptyAction={onCreateNew}
      columns={columns}
      getCardTitle={(item) => item.studentName}
      getCardSubtitle={(item) =>
        `${[item.testimonialCode, item.courseTrack].filter(Boolean).join(' · ')}${item.featured ? ' · Featured' : ''}`
      }
      getCardStatus={(item) => item.status}
      getCardThumbnail={(item) => item.avatarUrl}
      cardPrimaryFields={cardPrimaryFields}
      cardExpandedFields={cardExpandedFields}
      actions={actions}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={(key) => {
        if (
          key === 'displayOrder' ||
          key === 'studentName' ||
          key === 'courseTrack' ||
          key === 'updatedAt' ||
          key === 'createdAt'
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
