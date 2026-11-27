import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MobileModalShell } from './MobileModalShell';
import { StatusBadge } from './StatusBadge';

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  sortable?: boolean;
  render: (item: T) => ReactNode;
}

export interface CardField<T> {
  label: string;
  render: (item: T) => ReactNode;
}

export interface RowAction<T> {
  id: string;
  label: string | ((item: T) => string);
  destructive?: boolean;
  icon?: ReactNode;
  hidden?: (item: T) => boolean;
  onClick: (item: T) => void;
}

interface ResponsiveDataViewProps<T extends { id: string }> {
  items: T[];
  loading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  secondaryEmptyActionLabel?: string;
  onSecondaryEmptyAction?: () => void;
  columns: TableColumn<T>[];
  getCardTitle: (item: T) => string;
  getCardSubtitle?: (item: T) => string;
  getCardStatus?: (item: T) => string;
  getCardThumbnail?: (item: T) => string | undefined;
  cardPrimaryFields: CardField<T>[];
  cardExpandedFields?: CardField<T>[];
  actions: RowAction<T>[];
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
}

export function ResponsiveDataView<T extends { id: string }>({
  items,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  secondaryEmptyActionLabel,
  onSecondaryEmptyAction,
  columns,
  getCardTitle,
  getCardSubtitle,
  getCardStatus,
  getCardThumbnail,
  cardPrimaryFields,
  cardExpandedFields = [],
  actions,
  sortBy,
  sortDir,
  onSort,
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
}: ResponsiveDataViewProps<T>) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [desktopMenuState, setDesktopMenuState] = useState<{
    id: string;
    top: number;
    right: number;
    openUp: boolean;
  } | null>(null);
  const [mobileActionItem, setMobileActionItem] = useState<T | null>(null);
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!desktopMenuState) return;
    const onPointerDown = (e: MouseEvent) => {
      if (
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(e.target as Node)
      ) {
        setDesktopMenuState(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDesktopMenuState(null);
      }
    };
    const onScrollOrResize = () => {
      setDesktopMenuState(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [desktopMenuState]);

  const toggleDesktopMenu = (id: string, buttonEl: HTMLButtonElement) => {
    if (desktopMenuState?.id === id) {
      setDesktopMenuState(null);
      return;
    }
    const rect = buttonEl.getBoundingClientRect();
    const estimatedMenuHeight = actions.length * 36 + 16;
    const spaceBelow = window.innerHeight - rect.bottom - 64;
    const openUp = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;
    setDesktopMenuState({
      id,
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      right: Math.max(12, window.innerWidth - rect.right),
      openUp,
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading records">
        {[1, 2, 3, 4].map((row) => (
          <div
            key={row}
            className="animate-pulse rounded-xl border border-[#E2E8F0] bg-white p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="h-4 w-2/5 rounded bg-[#E2E8F0]" />
              <div className="h-5 w-20 rounded bg-[#F1F5F9]" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="h-3.5 w-3/4 rounded bg-[#F1F5F9]" />
              <div className="h-3.5 w-2/3 rounded bg-[#F1F5F9]" />
              <div className="h-3.5 w-1/2 rounded bg-[#F1F5F9]" />
              <div className="h-3.5 w-2/5 rounded bg-[#F1F5F9]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E2E8F0] bg-white px-5 py-12 text-center">
        <p className="text-base font-bold text-[#0B1736]">{emptyTitle}</p>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-[#475569]">
          {emptyDescription}
        </p>
        {((emptyActionLabel && onEmptyAction) ||
          (secondaryEmptyActionLabel && onSecondaryEmptyAction)) && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {emptyActionLabel && onEmptyAction && (
                <button
                  type="button"
                  onClick={onEmptyAction}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#145BFF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0F4AD6]"
                >
                  {emptyActionLabel}
                </button>
              )}
              {secondaryEmptyActionLabel && onSecondaryEmptyAction && (
                <button
                  type="button"
                  onClick={onSecondaryEmptyAction}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1736] transition-colors hover:bg-[#F8FAFC]"
                >
                  {secondaryEmptyActionLabel}
                </button>
              )}
            </div>
          )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop & Large Tablet Data Table */}
      <div className="hidden rounded-2xl border border-[#E2E8F0] bg-white lg:block">
        <div className="overflow-x-auto admin-scroll">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-4 py-3 text-xs font-semibold text-[#475569] ${col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                  >
                    {col.sortable && onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        className={`inline-flex items-center gap-1.5 font-semibold text-[#475569] hover:text-[#0B1736] ${col.align === 'right' ? 'flex-row-reverse' : ''
                          }`}
                      >
                        <span>{col.header}</span>
                        <ArrowUpDown
                          className={`h-3.5 w-3.5 ${sortBy === col.key ? 'text-[#145BFF]' : 'text-[#94A3B8]'
                            }`}
                          aria-hidden="true"
                        />
                        {sortBy === col.key && (
                          <span className="sr-only">
                            sorted {sortDir === 'asc' ? 'ascending' : 'descending'}
                          </span>
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold text-[#475569]"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-[#F5F7FC]/75"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3.5 align-middle text-[#0B1736] ${col.align === 'right' ? 'text-right tabular-nums' : 'text-left'
                        }`}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                  <td className="px-4 py-3.5 text-right align-middle">
                    <div
                      className="relative inline-flex items-center justify-end"
                      ref={desktopMenuState?.id === item.id ? desktopMenuRef : undefined}
                    >
                      <button
                        type="button"
                        onClick={(e) => toggleDesktopMenu(item.id, e.currentTarget)}
                        aria-expanded={desktopMenuState?.id === item.id}
                        aria-haspopup="menu"
                        aria-label={`Actions for ${getCardTitle(item)}`}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${desktopMenuState?.id === item.id
                            ? 'border-[#145BFF] bg-[#EFF6FF] text-[#145BFF]'
                            : 'border-transparent text-[#64748B] hover:border-[#E2E8F0] hover:bg-slate-100 hover:text-[#0B1736]'
                          }`}
                      >
                        <MoreVertical className="h-4 w-4" aria-hidden="true" />
                      </button>

                      {desktopMenuState?.id === item.id && (
                        <div
                          role="menu"
                          style={{
                            position: 'fixed',
                            top: desktopMenuState.top,
                            right: desktopMenuState.right,
                            transform: desktopMenuState.openUp
                              ? 'translateY(-100%)'
                              : undefined,
                          }}
                          className="z-50 w-52 rounded-xl border border-[#E2E8F0] bg-white p-1.5 text-left shadow-xl ring-1 ring-black/5"
                        >
                          {actions
                            .filter((action) => !action.hidden?.(item))
                            .map((action) => {
                              const resolvedLabel =
                                typeof action.label === 'function'
                                  ? action.label(item)
                                  : action.label;
                              return (
                                <button
                                  key={action.id}
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setDesktopMenuState(null);
                                    action.onClick(item);
                                  }}
                                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors text-left ${action.destructive
                                      ? 'text-[#DC2626] hover:bg-[#FEF2F2]'
                                      : 'text-[#0B1736] hover:bg-[#F8FAFC]'
                                    }`}
                                >
                                  {action.icon && (
                                    <span className="shrink-0">{action.icon}</span>
                                  )}
                                  <span className="truncate">{resolvedLabel}</span>
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile & Compact Tablet Stacked Cards */}
      <div className="space-y-3 lg:hidden" data-testid="mobile-card-list">
        {items.map((item) => {
          const title = getCardTitle(item);
          const subtitle = getCardSubtitle?.(item);
          const status = getCardStatus?.(item);
          const thumb = getCardThumbnail?.(item);
          const isExpanded = Boolean(expandedIds[item.id]);

          return (
            <article
              key={item.id}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  {thumb && (
                    <img
                      src={thumb}
                      alt={title}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 shrink-0 rounded-xl border border-[#E2E8F0] object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {status && <StatusBadge status={status} />}
                    </div>
                    <h3 className="mt-1.5 break-words text-sm font-bold leading-snug text-[#0B1736]">
                      {title}
                    </h3>
                    {subtitle && (
                      <p className="mt-0.5 truncate text-xs leading-relaxed text-[#475569]">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mobile Tactile Kebab Menu Action Trigger */}
                <button
                  type="button"
                  onClick={() => setMobileActionItem(item)}
                  aria-haspopup="dialog"
                  aria-label={`Actions for ${title}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#475569] shadow-xs transition-colors hover:border-[#145BFF] hover:bg-[#EFF6FF] hover:text-[#145BFF]"
                >
                  <MoreVertical className="h-4.5 w-4.5" aria-hidden="true" />
                </button>
              </div>

              {/* Primary Key-Value Pairs */}
              <dl className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-[#E2E8F0] pt-3 text-xs">
                {cardPrimaryFields.map((field) => (
                  <div key={field.label} className="min-w-0">
                    <dt className="text-[11px] font-medium text-[#64748B]">
                      {field.label}
                    </dt>
                    <dd className="mt-0.5 truncate font-semibold text-[#0B1736]">
                      {field.render(item)}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Expandable Extra Details */}
              {cardExpandedFields.length > 0 && (
                <div className="mt-3 border-t border-[#E2E8F0] pt-2.5">
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    aria-expanded={isExpanded}
                    className="flex min-h-[40px] w-full items-center justify-between rounded-lg px-1 text-xs font-semibold text-[#145BFF]"
                  >
                    <span>{isExpanded ? 'Hide details' : 'Show more details'}</span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''
                        }`}
                    />
                  </button>

                  {isExpanded && (
                    <dl className="mt-2 space-y-2.5 rounded-xl bg-[#F5F7FC] p-3 text-xs">
                      {cardExpandedFields.map((field) => (
                        <div key={field.label}>
                          <dt className="text-[11px] font-medium text-[#64748B]">
                            {field.label}
                          </dt>
                          <dd className="mt-0.5 break-words leading-relaxed text-[#0B1736]">
                            {field.render(item)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Mobile Touch Action Bottom Sheet */}
      <MobileModalShell
        open={Boolean(mobileActionItem)}
        title={mobileActionItem ? getCardTitle(mobileActionItem) : 'Actions'}
        subtitle="Choose an action for this record"
        titleId="mobile-record-actions-title"
        maxWidthClass="sm:max-w-md"
        onClose={() => setMobileActionItem(null)}
      >
        {mobileActionItem && (
          <div className="space-y-2">
            {actions
              .filter((action) => !action.hidden?.(mobileActionItem))
              .map((action) => {
                const resolvedLabel =
                  typeof action.label === 'function'
                    ? action.label(mobileActionItem)
                    : action.label;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                      const target = mobileActionItem;
                      setMobileActionItem(null);
                      action.onClick(target);
                    }}
                    className={`flex min-h-[46px] w-full items-center justify-between rounded-xl border px-3.5 text-left text-xs font-semibold transition-colors ${action.destructive
                        ? 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]'
                        : 'border-[#E2E8F0] bg-[#F5F7FC] text-[#0B1736] hover:bg-[#EFF6FF] hover:text-[#145BFF]'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {action.icon && <span className="shrink-0">{action.icon}</span>}
                      <span>{resolvedLabel}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
                  </button>
                );
              })}
          </div>
        )}
      </MobileModalShell>

      {/* Fixed Bottom Pagination Bar (Docked to bottom as per screens: sm, md, lg) */}
      <div
        data-testid="fixed-pagination-bar"
        className="fixed right-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] left-0 z-20 border-t border-[#CBD5E1] bg-white/95 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md sm:px-5 sm:py-2.5 lg:bottom-0 lg:left-[var(--admin-sidebar-width,244px)] lg:px-7 lg:py-3"
      >
        <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-1.5 min-[420px]:flex-row min-[420px]:gap-3">
          <p className="text-center text-[12px] font-medium text-[#475569] tabular-nums min-[420px]:text-left">
            Showing <span className="font-semibold text-[#0F172A]">{totalItems === 0 ? 0 : startIndex + 1}–{endIndex}</span> of{' '}
            <span className="font-semibold text-[#0F172A]">{totalItems}</span> {totalItems === 1 ? 'record' : 'records'}
          </p>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="inline-flex h-[32px] sm:h-[34px] items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 sm:px-3 text-xs font-semibold text-[#0F172A] shadow-xs transition-colors hover:bg-[#F8FAFC] disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>

            <span className="px-2 text-xs font-semibold text-[#0F172A] tabular-nums">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className="inline-flex h-[32px] sm:h-[34px] items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 sm:px-3 text-xs font-semibold text-[#0F172A] shadow-xs transition-colors hover:bg-[#F8FAFC] disabled:opacity-40 disabled:hover:bg-white"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
