import {
  Calendar,
  Edit3,
  Hash,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Tag,
} from 'lucide-react';
import { MobileModalShell } from '../../components/MobileModalShell';
import { StatusBadge } from '../../components/StatusBadge';
import { formatShortDate } from '../../utils/adminLogic';
import type { GalleryItem } from '../types/gallery';

interface GalleryPreviewModalProps {
  item: GalleryItem | null;
  onClose: () => void;
  onEdit: (item: GalleryItem) => void;
  onToggleStatus: (item: GalleryItem) => void;
  onToggleFeatured: (item: GalleryItem) => void;
}

export function GalleryPreviewModal({
  item,
  onClose,
  onEdit,
  onToggleStatus,
  onToggleFeatured,
}: GalleryPreviewModalProps) {
  if (!item) return null;

  return (
    <MobileModalShell
      open={Boolean(item)}
      fullScreen
      title={item.title}
      subtitle={`${item.galleryCode} · /gallery`}
      titleId="gallery-preview-title"
      onClose={onClose}
      headerBadge={
        <>
          <StatusBadge status={item.status} />
          <span className="rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#145BFF]">
            {item.category}
          </span>
          {item.featured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          )}
        </>
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus(item)}
              className="h-[40px] rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#0F172A] shadow-xs hover:bg-[#F8FAFC]"
            >
              {item.status === 'Published'
                ? 'Move to Draft'
                : 'Publish to Website'}
            </button>
            <button
              type="button"
              onClick={() => onToggleFeatured(item)}
              className="inline-flex h-[40px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#145BFF] shadow-xs hover:bg-[#EFF6FF]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {item.featured ? 'Remove Featured' : 'Mark Featured'}
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
                onEdit(item);
              }}
              className="inline-flex h-[40px] w-full min-w-0 items-center justify-center gap-1.5 rounded-lg bg-[#145BFF] px-5 text-[13px] font-semibold text-white shadow-xs hover:bg-[#0F4AD6] sm:w-auto whitespace-nowrap"
            >
              <Edit3 className="h-4 w-4 shrink-0" />
              <span>Edit Photo</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#0B1736]/5 shadow-2xs">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.altText || item.title}
                referrerPolicy="no-referrer"
                className="max-h-[460px] w-full object-contain bg-[#0F172A]/95"
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-[#64748B]">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}
            {item.featured && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#145BFF] px-3 py-1 text-xs font-bold uppercase text-white shadow">
                <Sparkles className="h-3.5 w-3.5" />
                Featured Highlight
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Photo Caption &amp; Context
            </h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#334155]">
              {item.caption || 'No caption provided for this gallery photo.'}
            </p>
          </div>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Photo Metadata
            </h3>
            <dl className="mt-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Hash className="h-3.5 w-3.5" /> Code
                </dt>
                <dd className="font-mono font-semibold text-[#0B1736]">
                  {item.galleryCode} · #{item.displayOrder}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Layers className="h-3.5 w-3.5" /> Category
                </dt>
                <dd className="font-semibold text-[#0B1736]">{item.category}</dd>
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Calendar className="h-3.5 w-3.5" /> Photo Date
                </dt>
                <dd className="font-medium text-[#0B1736]">
                  {item.takenAt || formatShortDate(item.createdAt)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <ImageIcon className="h-3.5 w-3.5 shrink-0" /> Alt Text
                </dt>
                <dd className="text-right font-medium text-[#334155]">
                  {item.altText || item.title}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="inline-flex items-center gap-1.5 font-medium text-[#64748B]">
                  <Tag className="h-3.5 w-3.5 shrink-0" /> Tags
                </dt>
                <dd className="flex flex-wrap justify-end gap-1">
                  {item.tags.length > 0 ? (
                    item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#334155]"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#94A3B8]">None</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </MobileModalShell>
  );
}
