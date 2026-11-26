import {
  Calendar,
  Edit2,
  Eye,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Tag,
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
import type { GalleryItem, GallerySortField } from '../types/gallery';

interface GalleryTableAndCardsProps {
  items: GalleryItem[];
  loading: boolean;
  totalRecordsCount: number;
  sortBy: GallerySortField;
  sortDir: 'asc' | 'desc';
  onSort: (field: GallerySortField) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPreview: (item: GalleryItem) => void;
  onEdit: (item: GalleryItem) => void;
  onToggleFeatured: (item: GalleryItem) => void;
  onDelete: (item: GalleryItem) => void;
  onCreateNew: () => void;
}

export function GalleryTableAndCards({
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
}: GalleryTableAndCardsProps) {
  const columns: TableColumn<GalleryItem>[] = [
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
      key: 'title',
      header: 'Gallery Photo',
      sortable: true,
      render: (item) => (
        <div className="flex max-w-[300px] items-center gap-3 overflow-hidden xl:max-w-[360px]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.altText || item.title}
              referrerPolicy="no-referrer"
              className="h-12 w-16 shrink-0 rounded-lg border border-[#E2E8F0] object-cover"
            />
          ) : (
            <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#145BFF]">
              <ImageIcon className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onPreview(item)}
                title={item.title}
                className="min-w-0 truncate text-left font-semibold text-[#0B1736] hover:text-[#145BFF]"
              >
                {item.title}
              </button>
              {item.featured && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-[#EEF2FF] px-1.5 py-0.5 text-[10px] font-bold text-[#145BFF]">
                  <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                  Featured
                </span>
              )}
            </div>
            <p
              title={`${item.galleryCode} · ${item.caption}`}
              className="truncate text-[11.5px] text-[#64748B]"
            >
              <span className="font-mono">{item.galleryCode}</span>
              {item.caption ? ` · ${item.caption}` : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category & Tags',
      render: (item) => (
        <div className="min-w-0 max-w-[210px] overflow-hidden">
          <p
            title={item.category}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1736]"
          >
            <Layers className="h-3.5 w-3.5 shrink-0 text-[#145BFF]" />
            <span className="min-w-0 flex-1 truncate">{item.category}</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-[#64748B]">
            <Tag className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {item.tags.length > 0 ? item.tags.join(', ') : 'No tags'}
            </span>
          </p>
        </div>
      ),
    },
    {
      key: 'takenAt',
      header: 'Photo Date',
      sortable: true,
      render: (item) => (
        <div className="text-xs text-[#475569] tabular-nums">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
            {item.takenAt || formatShortDate(item.createdAt)}
          </span>
        </div>
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
        <div className="text-right text-xs tabular-nums">
          <p className="font-medium text-[#0B1736]">
            {formatShortDate(item.updatedAt)}
          </p>
          <p className="truncate text-[11px] text-[#64748B] max-w-[120px] ml-auto">
            {item.imageName || 'photo'}
          </p>
        </div>
      ),
    },
  ];

  const cardPrimaryFields: CardField<GalleryItem>[] = [
    { label: 'Category', render: (item) => item.category },
    {
      label: 'Order & Code',
      render: (item) => `#${item.displayOrder} · ${item.galleryCode}`,
    },
    {
      label: 'Photo Date',
      render: (item) => item.takenAt || formatShortDate(item.createdAt),
    },
    {
      label: 'Tags',
      render: (item) =>
        item.tags.length > 0 ? item.tags.join(', ') : 'None',
    },
  ];

  const cardExpandedFields: CardField<GalleryItem>[] = [
    {
      label: 'Alt Text',
      render: (item) => item.altText || item.title,
    },
    {
      label: 'Caption',
      render: (item) => item.caption || 'No caption added.',
    },
  ];

  const actions: RowAction<GalleryItem>[] = [
    {
      id: 'preview',
      label: 'Preview Photo',
      icon: <Eye className="h-4 w-4 text-[#64748B]" />,
      onClick: onPreview,
    },
    {
      id: 'edit',
      label: 'Edit Photo',
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
      label: 'Delete Photo',
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
          ? 'No gallery photos found in database'
          : 'No matching gallery photos found'
      }
      emptyDescription={
        noRecordsAtAll
          ? 'Upload lab session photos, Cisco switch racks, or workshop snapshots to display them on the website Gallery page.'
          : 'Try clearing your search or filters, or upload a new gallery photo.'
      }
      emptyActionLabel="New Gallery Photo"
      onEmptyAction={onCreateNew}
      columns={columns}
      getCardTitle={(item) => item.title}
      getCardSubtitle={(item) =>
        `${item.galleryCode} · ${item.category}${item.featured ? ' · Featured' : ''}`
      }
      getCardStatus={(item) => item.status}
      getCardThumbnail={(item) => item.imageUrl}
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
          key === 'takenAt'
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
