import {
  CheckCircle2,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  StickyNote,
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
  ContactEnquiryItem,
  EnquirySortField,
  EnquiryStatus,
} from '../types/enquiry';

interface EnquiryTableAndCardsProps {
  items: ContactEnquiryItem[];
  loading: boolean;
  totalRecordsCount: number;
  sortBy: EnquirySortField;
  sortDir: 'asc' | 'desc';
  onSort: (field: EnquirySortField) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onViewDetail: (item: ContactEnquiryItem) => void;
  onQuickStatus: (item: ContactEnquiryItem, status: EnquiryStatus) => void;
  onDelete: (item: ContactEnquiryItem) => void;
  onCreateManual: () => void;
}

export function EnquiryTableAndCards({
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
  onViewDetail,
  onQuickStatus,
  onDelete,
  onCreateManual,
}: EnquiryTableAndCardsProps) {
  const columns: TableColumn<ContactEnquiryItem>[] = [
    {
      key: 'name',
      header: 'Lead Contact',
      sortable: true,
      render: (item) => (
        <div className="min-w-0 max-w-[240px]">
          <button
            type="button"
            onClick={() => onViewDetail(item)}
            className="truncate text-left font-semibold text-[#0B1736] hover:text-[#145BFF]"
          >
            {item.name}
          </button>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#475569]">
            <Mail className="h-3 w-3 shrink-0 text-[#64748B]" />
            <span className="truncate">{item.email}</span>
          </p>
          {item.phone && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-[#64748B] tabular-nums">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="truncate">{item.phone}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'service',
      header: 'Course & Channel',
      sortable: true,
      render: (item) => (
        <div className="min-w-0 max-w-[220px]">
          <p
            title={item.service || 'General Enquiry'}
            className="truncate text-xs font-semibold text-[#0B1736]"
          >
            {item.service || 'General Consultation'}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[#64748B]">
            {item.channel}
            {item.sourcePage ? ` · ${item.sourcePage}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'message',
      header: 'Message & Notes',
      render: (item) => (
        <div className="min-w-0 max-w-[260px]">
          <p className="line-clamp-2 text-xs text-[#334155]">
            {item.message || 'No additional message provided.'}
          </p>
          {item.adminNotes && (
            <p className="mt-1 inline-flex max-w-full items-center gap-1 truncate rounded bg-[#FEFCE8] px-1.5 py-0.5 text-[10.5px] font-medium text-[#A16207]">
              <StickyNote className="h-3 w-3 shrink-0" />
              <span className="truncate">{item.adminNotes}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      header: 'Received',
      sortable: true,
      align: 'right',
      render: (item) => (
        <div className="text-right text-xs tabular-nums">
          <p className="font-medium text-[#0B1736]">
            {formatShortDate(item.createdAt)}
          </p>
          <p className="text-[11px] text-[#64748B]">
            {item.createdAt ? item.createdAt.slice(11, 16) : ''}
          </p>
        </div>
      ),
    },
  ];

  const cardPrimaryFields: CardField<ContactEnquiryItem>[] = [
    {
      label: 'Email',
      render: (item) => item.email,
    },
    {
      label: 'Phone',
      render: (item) => item.phone || 'Not shared',
    },
    {
      label: 'Channel',
      render: (item) => item.channel,
    },
    {
      label: 'Received',
      render: (item) => formatShortDate(item.createdAt),
    },
  ];

  const cardExpandedFields: CardField<ContactEnquiryItem>[] = [
    {
      label: 'Message',
      render: (item) => item.message || 'No message body.',
    },
    {
      label: 'Admin Follow-Up Notes',
      render: (item) => item.adminNotes || 'No follow-up notes logged yet.',
    },
  ];

  const actions: RowAction<ContactEnquiryItem>[] = [
    {
      id: 'view',
      label: 'Inspect & Log Notes',
      icon: <MessageSquare className="h-4 w-4 text-[#145BFF]" />,
      onClick: onViewDetail,
    },
    {
      id: 'mark-read',
      label: (item) =>
        item.status === 'New' ? 'Mark as Read' : 'Mark as Replied',
      icon: <Eye className="h-4 w-4 text-[#64748B]" />,
      onClick: (item) =>
        onQuickStatus(item, item.status === 'New' ? 'Read' : 'Replied'),
    },
    {
      id: 'mark-replied',
      label: 'Mark Replied',
      icon: <CheckCircle2 className="h-4 w-4 text-[#027A48]" />,
      onClick: (item) => onQuickStatus(item, 'Replied'),
    },
    {
      id: 'delete',
      label: 'Delete Enquiry',
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
          ? 'No contact enquiries in database yet'
          : 'No matching enquiries found'
      }
      emptyDescription={
        noRecordsAtAll
          ? 'Incoming leads from the website Contact form and Batch Waitlist modal appear here automatically.'
          : 'Try clearing your search keyword or status/channel filters.'
      }
      emptyActionLabel="Log Offline Lead"
      onEmptyAction={onCreateManual}
      columns={columns}
      getCardTitle={(item) => item.name}
      getCardSubtitle={(item) =>
        `${item.service || 'General Enquiry'} · ${item.channel}`
      }
      getCardStatus={(item) => item.status}
      cardPrimaryFields={cardPrimaryFields}
      cardExpandedFields={cardExpandedFields}
      actions={actions}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={(key) => {
        if (
          key === 'createdAt' ||
          key === 'updatedAt' ||
          key === 'name' ||
          key === 'status' ||
          key === 'service' ||
          key === 'channel'
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
