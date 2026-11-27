import { ChevronLeft, ChevronRight } from 'lucide-react';

export type PaginationToken = number | 'ellipsis';

/**
 * Computes compact, non-wrapping page tokens.
 * - Up to 10 pages: renders every page number directly.
 * - Over 10 pages: renders boundary pages + sliding sibling window with '...' gaps.
 */
export function buildPaginationTokens(
  currentPageZeroBased: number,
  totalPages: number
): PaginationToken[] {
  if (totalPages <= 1) return [];
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, idx) => idx);
  }

  const safeCurrent = Math.min(Math.max(0, currentPageZeroBased), totalPages - 1);
  const last = totalPages - 1;
  const pages = new Set<number>([0, last]);

  if (safeCurrent <= 4) {
    for (let i = 1; i <= 6; i += 1) {
      pages.add(i);
    }
  } else if (safeCurrent >= last - 4) {
    for (let i = last - 6; i < last; i += 1) {
      pages.add(i);
    }
  } else {
    for (let i = safeCurrent - 2; i <= safeCurrent + 2; i += 1) {
      pages.add(i);
    }
  }

  const sorted = Array.from(pages)
    .filter((p) => p >= 0 && p <= last)
    .sort((a, b) => a - b);

  const tokens: PaginationToken[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const curr = sorted[i];
    if (i > 0 && curr - sorted[i - 1] > 1) {
      tokens.push('ellipsis');
    }
    tokens.push(curr);
  }
  return tokens;
}

interface PublicPaginationProps {
  ariaLabel: string;
  itemLabel: string;
  page: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (pageZeroBased: number) => void;
}

/**
 * Shared server-side pagination footer with compact ellipsis windowing for 100+ items.
 */
export function PublicPagination({
  ariaLabel,
  itemLabel,
  page,
  totalPages,
  totalItems,
  startItem,
  endItem,
  hasPrevious,
  hasNext,
  onPageChange,
}: PublicPaginationProps) {
  if (totalItems <= 0 || totalPages <= 1) {
    return null;
  }

  const tokens = buildPaginationTokens(page, totalPages);

  return (
    <nav
      aria-label={ariaLabel}
      className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[18px] bg-[#F5F5F5] dark:bg-[#2C2C2D] px-5 py-3.5"
    >
      <p className="text-[13.5px] text-[#5C5C5C] dark:text-white/75 tabular-nums">
        Showing{' '}
        <strong className="text-[#303030] dark:text-white">
          {startItem}–{endItem}
        </strong>{' '}
        of{' '}
        <strong className="text-[#303030] dark:text-white">{totalItems}</strong>{' '}
        {itemLabel} · Page {page + 1} of {totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 rounded-full border border-[#303030]/20 dark:border-white/20 px-3.5 py-1.5 text-[13px] text-[#303030] dark:text-white disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Previous</span>
        </button>

        {tokens.map((token, idx) => {
          if (token === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                aria-hidden="true"
                className="px-1.5 text-[13px] font-medium text-[#5C5C5C] dark:text-white/60 select-none"
              >
                …
              </span>
            );
          }
          const active = token === page;
          return (
            <button
              key={token}
              type="button"
              onClick={() => onPageChange(token)}
              aria-label={`Page ${token + 1}`}
              aria-current={active ? 'page' : undefined}
              className={`h-8 min-w-[32px] rounded-full px-2.5 text-[13px] font-medium tabular-nums transition-colors cursor-pointer ${
                active
                  ? 'bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B]'
                  : 'border border-[#303030]/15 dark:border-white/15 text-[#303030] dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {token + 1}
            </button>
          );
        })}

        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 rounded-full border border-[#303030]/20 dark:border-white/20 px-3.5 py-1.5 text-[13px] text-[#303030] dark:text-white disabled:opacity-40 cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
