import {
  Edit2,
  Eye,
  GraduationCap,
  Layers,
  Paperclip,
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
import type { CourseDomain, CourseSortField } from '../types/course';

interface CourseTableAndCardsProps {
  courses: CourseDomain[];
  loading: boolean;
  totalRecordsCount: number;
  sortBy: CourseSortField;
  sortDir: 'asc' | 'desc';
  onSort: (field: CourseSortField) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPreview: (course: CourseDomain) => void;
  onEdit: (course: CourseDomain) => void;
  onDelete: (course: CourseDomain) => void;
  onCreateNew: () => void;
}

export function CourseTableAndCards({
  courses,
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
  onDelete,
  onCreateNew,
}: CourseTableAndCardsProps) {
  const columns: TableColumn<CourseDomain>[] = [
    {
      key: 'displayOrder',
      header: 'Order',
      sortable: true,
      render: (course) => (
        <span className="font-mono text-xs font-semibold text-[#475569] tabular-nums">
          #{String(course.displayOrder).padStart(2, '0')}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Course / Domain',
      sortable: true,
      render: (course) => (
        <div className="flex max-w-[270px] items-center gap-3 overflow-hidden xl:max-w-[330px]">
          {course.coverImage ? (
            <img
              src={course.coverImage}
              alt={course.title}
              referrerPolicy="no-referrer"
              className="h-11 w-14 shrink-0 rounded-lg border border-[#E2E8F0] object-cover"
            />
          ) : (
            <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#145BFF]">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1 overflow-hidden">
            <button
              type="button"
              onClick={() => onPreview(course)}
              title={course.title}
              className="block w-full truncate text-left font-semibold text-[#0B1736] hover:text-[#145BFF]"
            >
              {course.title}
            </button>
            <p
              title={`${course.domainCode} · ${course.shortDescription}`}
              className="truncate text-[11.5px] text-[#64748B]"
            >
              <span className="font-mono">{course.domainCode}</span> ·{' '}
              {course.shortDescription}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Website Category',
      render: (course) => (
        <div className="min-w-0 max-w-[205px] overflow-hidden xl:max-w-[240px]">
          <p
            title={course.category}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1736]"
          >
            <Layers className="h-3.5 w-3.5 shrink-0 text-[#145BFF]" />
            <span className="min-w-0 flex-1 truncate">{course.category}</span>
          </p>
          <p
            title={`/${course.slug}`}
            className="mt-0.5 truncate font-mono text-[11px] text-[#64748B]"
          >
            /{course.slug}
          </p>
        </div>
      ),
    },
    {
      key: 'attachments',
      header: 'Documents',
      render: (course) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#475569] tabular-nums">
          <Paperclip className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
          {course.attachments.length}{' '}
          {course.attachments.length === 1 ? 'file' : 'files'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (course) => <StatusBadge status={course.status} />,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      align: 'right',
      render: (course) => (
        <div className="text-right text-xs tabular-nums">
          <p className="font-medium text-[#0B1736]">
            {formatShortDate(course.updatedAt)}
          </p>
          {course.modules.length > 0 && (
            <p className="text-[11px] text-[#64748B]">
              {course.modules.length} topics
            </p>
          )}
        </div>
      ),
    },
  ];

  const cardPrimaryFields: CardField<CourseDomain>[] = [
    {
      label: 'Website Category',
      render: (course) => course.category,
    },
    {
      label: 'Order & Code',
      render: (course) => `#${course.displayOrder} · ${course.domainCode}`,
    },
    {
      label: 'Documents',
      render: (course) =>
        `${course.attachments.length} ${course.attachments.length === 1 ? 'file' : 'files'
        }`,
    },
    {
      label: 'Updated',
      render: (course) => formatShortDate(course.updatedAt),
    },
  ];

  const cardExpandedFields: CardField<CourseDomain>[] = [
    {
      label: 'URL Slug',
      render: (course) => `/${course.slug}`,
    },
    {
      label: 'Description',
      render: (course) => course.shortDescription,
    },
  ];

  const actions: RowAction<CourseDomain>[] = [
    {
      id: 'preview',
      label: 'Preview Course / Domain',
      icon: <Eye className="h-4 w-4 text-[#64748B]" />,
      onClick: onPreview,
    },
    {
      id: 'edit',
      label: 'Edit Details',
      icon: <Edit2 className="h-4 w-4 text-[#64748B]" />,
      onClick: onEdit,
    },
    {
      id: 'delete',
      label: 'Delete Course / Domain',
      destructive: true,
      icon: <Trash2 className="h-4 w-4 text-[#DC2626]" />,
      onClick: onDelete,
    },
  ];

  const noRecordsAtAll = totalRecordsCount === 0;

  return (
    <ResponsiveDataView
      items={courses}
      loading={loading}
      emptyTitle={
        noRecordsAtAll
          ? 'No courses or domains found in database'
          : 'No matching courses or domains found'
      }
      emptyDescription={
        noRecordsAtAll
          ? 'Create a course / domain below or start the Spring Boot backend so DataInitializer populates the default website domains.'
          : 'Try clearing your search or filters, or create a new course / domain.'
      }
      emptyActionLabel="New Course / Domain"
      onEmptyAction={onCreateNew}
      columns={columns}
      getCardTitle={(course) => course.title}
      getCardSubtitle={(course) => `${course.domainCode} · ${course.category}`}
      getCardStatus={(course) => course.status}
      getCardThumbnail={(course) => course.coverImage}
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
