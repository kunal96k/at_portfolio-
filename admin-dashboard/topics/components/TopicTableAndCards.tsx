import { Paperclip, Star } from 'lucide-react';
import {
  ResponsiveDataView,
  type CardField,
  type RowAction,
  type TableColumn,
} from '../../components/ResponsiveDataView';
import { StatusBadge } from '../../components/StatusBadge';
import { formatShortDate } from '../../utils/adminLogic';
import type { Topic, TopicSortField } from '../types/topic';

interface TopicTableAndCardsProps {
  topics: Topic[];
  loading: boolean;
  sortBy: TopicSortField;
  sortDir: 'asc' | 'desc';
  onSort: (field: TopicSortField) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPreview: (topic: Topic) => void;
  onEdit: (topic: Topic) => void;
  onToggleFeatured: (topic: Topic) => void;
  onToggleStatus: (topic: Topic) => void;
  onDelete: (topic: Topic) => void;
  onCreateNew: () => void;
}

export function TopicTableAndCards({
  topics,
  loading,
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
  onToggleStatus,
  onDelete,
  onCreateNew,
}: TopicTableAndCardsProps) {
  const columns: TableColumn<Topic>[] = [
    {
      key: 'displayOrder',
      header: 'Order',
      sortable: true,
      render: (topic) => (
        <span className="font-mono text-xs font-semibold text-[#475569] tabular-nums">
          #{String(topic.displayOrder).padStart(2, '0')}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Topic',
      sortable: true,
      render: (topic) => (
        <div className="flex items-center gap-3">
          <img
            src={topic.coverImage}
            alt={topic.title}
            referrerPolicy="no-referrer"
            className="h-11 w-14 shrink-0 rounded-lg border border-[#E2E8F0] object-cover"
          />
          <div className="min-w-0 max-w-[235px]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onPreview(topic)}
                className="truncate text-left font-semibold text-[#0B1736] hover:text-[#145BFF]"
              >
                {topic.title}
              </button>
              {topic.featured && (
                <Star
                  className="h-3.5 w-3.5 shrink-0 fill-[#D97706] text-[#D97706]"
                  aria-label="Featured topic"
                />
              )}
            </div>
            <p className="truncate font-mono text-[11px] text-[#64748B]">
              /{topic.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'relatedCourse',
      header: 'Course & Level',
      render: (topic) => (
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#0B1736]">{topic.relatedCourse}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">
            {topic.learningLevel} · {topic.subject}
          </p>
        </div>
      ),
    },
    {
      key: 'attachments',
      header: 'Resources',
      render: (topic) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#475569] tabular-nums">
          <Paperclip className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
          {topic.attachments.length} {topic.attachments.length === 1 ? 'file' : 'files'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (topic) => <StatusBadge status={topic.status} />,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      align: 'right',
      render: (topic) => (
        <div className="text-right text-xs tabular-nums">
          <p className="font-medium text-[#0B1736]">{formatShortDate(topic.updatedAt)}</p>
          <p className="text-[11px] text-[#64748B]">
            Created {formatShortDate(topic.createdAt)}
          </p>
        </div>
      ),
    },
  ];

  const cardPrimaryFields: CardField<Topic>[] = [
    {
      label: 'Course / Track',
      render: (topic) => topic.relatedCourse,
    },
    {
      label: 'Level & Order',
      render: (topic) => `${topic.learningLevel} · #${topic.displayOrder}`,
    },
    {
      label: 'Resources',
      render: (topic) =>
        `${topic.attachments.length} ${topic.attachments.length === 1 ? 'file' : 'files'}`,
    },
    {
      label: 'Last Updated',
      render: (topic) => formatShortDate(topic.updatedAt),
    },
  ];

  const cardExpandedFields: CardField<Topic>[] = [
    {
      label: 'Slug',
      render: (topic) => <span className="font-mono text-xs">/{topic.slug}</span>,
    },
    {
      label: 'Summary',
      render: (topic) => topic.shortDescription,
    },
    {
      label: 'Tags',
      render: (topic) =>
        topic.tags.length > 0 ? topic.tags.join(' · ') : 'No tags assigned',
    },
    {
      label: 'Created / Featured',
      render: (topic) =>
        `${formatShortDate(topic.createdAt)} · ${topic.featured ? 'Featured on site' : 'Standard listing'}`,
    },
  ];

  const actions: RowAction<Topic>[] = [
    {
      id: 'preview',
      label: 'Preview',
      onClick: onPreview,
    },
    {
      id: 'edit',
      label: 'Edit',
      onClick: onEdit,
    },
    {
      id: 'toggle-status',
      label: 'Publish / Draft',
      onClick: onToggleStatus,
    },
    {
      id: 'toggle-featured',
      label: 'Toggle Featured',
      onClick: onToggleFeatured,
    },
    {
      id: 'delete',
      label: 'Delete',
      destructive: true,
      onClick: onDelete,
    },
  ];

  return (
    <ResponsiveDataView
      items={topics}
      loading={loading}
      emptyTitle="No matching topics found"
      emptyDescription="Try clearing your search or filters, or create a new topic with notes and downloadable resources."
      emptyActionLabel="Create Topic"
      onEmptyAction={onCreateNew}
      columns={columns}
      getCardTitle={(topic) => topic.title}
      getCardSubtitle={(topic) =>
        `${topic.subject}${topic.featured ? ' · Featured' : ''}`
      }
      getCardStatus={(topic) => topic.status}
      getCardThumbnail={(topic) => topic.coverImage}
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
