import {
  Calendar,
  Clock,
  Edit2,
  Eye,
  Paperclip,
  Trash2,
} from 'lucide-react';
import {
  formatBatchDateDisplay,
  formatBatchTimeDisplay,
  isBatchStarted,
} from '../../../src/services/batchesService';
import {
  ResponsiveDataView,
  type CardField,
  type RowAction,
  type TableColumn,
} from '../../components/ResponsiveDataView';
import { StatusBadge } from '../../components/StatusBadge';
import { formatShortDate } from '../../utils/adminLogic';
import type { Batch, BatchSortField } from '../types/batch';

interface BatchTableAndCardsProps {
  batches: Batch[];
  loading: boolean;
  totalRecordsCount: number;
  sortBy: BatchSortField;
  sortDir: 'asc' | 'desc';
  onSort: (field: BatchSortField) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPreview: (batch: Batch) => void;
  onEdit: (batch: Batch) => void;
  onDelete: (batch: Batch) => void;
  onCreateNew: () => void;
}

export function BatchTableAndCards({
  batches,
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
}: BatchTableAndCardsProps) {
  const columns: TableColumn<Batch>[] = [
    {
      key: 'displayOrder',
      header: 'Order',
      sortable: true,
      render: (batch) => (
        <span className="font-mono text-xs font-semibold text-[#475569] tabular-nums">
          #{String(batch.displayOrder).padStart(2, '0')}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Batch Details',
      sortable: true,
      render: (batch) => (
        <div className="flex max-w-[260px] items-center gap-3 overflow-hidden xl:max-w-[310px]">
          <img
            src={batch.coverImage}
            alt={batch.title}
            referrerPolicy="no-referrer"
            className="h-11 w-14 shrink-0 rounded-lg border border-[#E2E8F0] object-cover"
          />
          <div className="min-w-0 flex-1 overflow-hidden">
            <button
              type="button"
              onClick={() => onPreview(batch)}
              title={batch.title}
              className="block w-full truncate text-left font-semibold text-[#0B1736] hover:text-[#145BFF]"
            >
              {batch.title}
            </button>
            <p
              title={`${batch.batchCode} · ${batch.category} · ${batch.learningLevel}`}
              className="truncate font-mono text-[11px] text-[#64748B]"
            >
              {batch.batchCode} · {batch.category} · {batch.learningLevel}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'batchStartAt',
      header: 'Schedule & Mode',
      sortable: true,
      render: (batch) => {
        const displayDate = formatBatchDateDisplay(batch.batchDate);
        const displayTime = formatBatchTimeDisplay(batch.batchTime);
        const started = isBatchStarted(batch);
        return (
          <div className="min-w-0 max-w-[225px] overflow-hidden xl:max-w-[260px]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1736]">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-[#145BFF]" />
              <span className="truncate">{displayDate}</span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  started
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {started ? 'Started' : 'Upcoming'}
              </span>
            </div>
            <p
              title={`${displayTime} · ${batch.mode}`}
              className="mt-0.5 flex items-center gap-1.5 text-xs text-[#64748B]"
            >
              <Clock className="h-3 w-3 shrink-0 text-[#94A3B8]" />
              <span className="min-w-0 flex-1 truncate">
                {displayTime} · {batch.mode}
              </span>
            </p>
          </div>
        );
      },
    },
    {
      key: 'attachments',
      header: 'Documents',
      render: (batch) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#475569] tabular-nums">
          <Paperclip className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
          {batch.attachments.length}{' '}
          {batch.attachments.length === 1 ? 'file' : 'files'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (batch) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={batch.status} />
          {batch.status === 'Published' && isBatchStarted(batch) && (
            <span className="text-[10px] font-medium text-amber-700">
              Hidden on website (started)
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      align: 'right',
      render: (batch) => (
        <div className="text-right text-xs tabular-nums">
          <p className="font-medium text-[#0B1736]">
            {formatShortDate(batch.updatedAt)}
          </p>
          <p className="text-[11px] text-[#64748B]">
            Seats: {batch.seatsTotal}
          </p>
        </div>
      ),
    },
  ];

  const cardPrimaryFields: CardField<Batch>[] = [
    {
      label: 'Start Date & Time',
      render: (batch) => {
        const started = isBatchStarted(batch);
        return `${formatBatchDateDisplay(batch.batchDate)} · ${formatBatchTimeDisplay(batch.batchTime)} (${started ? 'Started' : 'Upcoming'})`;
      },
    },
    {
      label: 'Category & Mode',
      render: (batch) => `${batch.category} · ${batch.mode}`,
    },
    {
      label: 'Documents',
      render: (batch) =>
        `${batch.attachments.length} ${
          batch.attachments.length === 1 ? 'file' : 'files'
        }`,
    },
    {
      label: 'Seats & Order',
      render: (batch) => `${batch.seatsTotal} seats · #${batch.displayOrder}`,
    },
  ];

  const cardExpandedFields: CardField<Batch>[] = [
    {
      label: 'Batch Code & Track',
      render: (batch) => `${batch.batchCode} · ${batch.relatedCourse}`,
    },
    {
      label: 'Summary',
      render: (batch) => batch.shortDescription,
    },
    {
      label: 'Location & Level',
      render: (batch) => `${batch.location} · ${batch.learningLevel}`,
    },
    {
      label: 'Last Updated',
      render: (batch) => formatShortDate(batch.updatedAt),
    },
  ];

  const actions: RowAction<Batch>[] = [
    {
      id: 'preview',
      label: 'Preview Batch',
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
      label: 'Delete Batch',
      destructive: true,
      icon: <Trash2 className="h-4 w-4 text-[#DC2626]" />,
      onClick: onDelete,
    },
  ];

  const noRecordsAtAll = totalRecordsCount === 0;

  return (
    <ResponsiveDataView
      items={batches}
      loading={loading}
      emptyTitle={
        noRecordsAtAll
          ? 'No batches scheduled yet'
          : 'No matching batches found'
      }
      emptyDescription={
        noRecordsAtAll
          ? 'There are no training batches in the database right now. The public website (/upcoming-batches) displays its empty-state schedule UI until an upcoming published batch is added.'
          : 'Try clearing your search or filters, or create a new upcoming training batch with schedule and brochure files.'
      }
      emptyActionLabel="Create New Batch"
      onEmptyAction={onCreateNew}
      columns={columns}
      getCardTitle={(batch) => batch.title}
      getCardSubtitle={(batch) => `${batch.batchCode} · ${batch.category}`}
      getCardStatus={(batch) => batch.status}
      getCardThumbnail={(batch) => batch.coverImage}
      cardPrimaryFields={cardPrimaryFields}
      cardExpandedFields={cardExpandedFields}
      actions={actions}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={(key) => {
        if (
          key === 'displayOrder' ||
          key === 'batchStartAt' ||
          key === 'batchDate' ||
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
