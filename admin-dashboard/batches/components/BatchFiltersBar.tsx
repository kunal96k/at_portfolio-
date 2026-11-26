import {
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type {
  BatchCategory,
  BatchLearningLevel,
  BatchQueryState,
  BatchScheduleFilter,
  BatchSortField,
  BatchStatus,
} from '../types/batch';

interface BatchFiltersBarProps {
  query: BatchQueryState;
  domainTracks?: string[];
  categoryOptions?: string[];
  searching?: boolean;
  isDebouncing?: boolean;
  onFlushSearch?: (value: string) => void;
  onUpdateQuery: (patch: Partial<BatchQueryState>) => void;
  onResetFilters: () => void;
  onCreateNew: () => void;
  totalFiles?: number;
  onViewFiles?: () => void;
}

export function BatchFiltersBar({
  query,
  domainTracks = [],
  categoryOptions = [],
  searching = false,
  isDebouncing = false,
  onFlushSearch,
  onUpdateQuery,
  onResetFilters,
  onCreateNew,
  totalFiles = 0,
  onViewFiles,
}: BatchFiltersBarProps) {
  const mergedCategories = Array.from(
    new Map(
      categoryOptions
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => [c.toLowerCase(), c])
    ).values()
  );
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const activeFilterCount =
    (query.search.trim() !== '' ? 1 : 0) +
    (query.status !== 'All' ? 1 : 0) +
    (query.scheduleFilter && query.scheduleFilter !== 'All' ? 1 : 0) +
    (query.category !== 'All' ? 1 : 0) +
    (query.relatedCourse && query.relatedCourse !== 'All' ? 1 : 0) +
    (query.level !== 'All' ? 1 : 0) +
    (query.hasFilesOnly ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  const selectClass =
    'h-[42px] w-full min-w-0 appearance-none rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2 pr-8 pl-3 text-xs sm:text-[13px] font-medium text-[#0B1736] transition-colors hover:border-[#CBD5E1] focus:border-[#145BFF] focus:bg-white focus:ring-2 focus:ring-[#145BFF]/15 focus:outline-none';

  return (
    <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-2xs sm:p-4">
      {/* Row 1: Search Input + View Documents + New Batch */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />
          <input
            type="text"
            maxLength={120}
            value={query.search}
            onChange={(e) => onUpdateQuery({ search: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onFlushSearch) {
                e.preventDefault();
                onFlushSearch(query.search);
              }
            }}
            placeholder="Search batches by title, code, timing, location, or track…"
            aria-label="Search batches"
            className="h-[44px] w-full min-w-0 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2 pr-14 pl-10 text-sm text-[#0B1736] placeholder:text-[#64748B] transition-colors hover:border-[#CBD5E1] focus:border-[#145BFF] focus:bg-white focus:ring-2 focus:ring-[#145BFF]/15 focus:outline-none"
          />
          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
            {(searching || isDebouncing) && (
              <Loader2
                className="h-3.5 w-3.5 animate-spin text-[#145BFF]"
                aria-hidden="true"
              />
            )}
            {query.search && (
              <button
                type="button"
                onClick={() => {
                  onUpdateQuery({ search: '' });
                  onFlushSearch?.('');
                }}
                aria-label="Clear search"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#E2E8F0]/60 hover:text-[#0B1736]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
          <button
            type="button"
            onClick={() => setFiltersExpanded((prev) => !prev)}
            aria-expanded={filtersExpanded}
            className="inline-flex h-[44px] w-full min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs sm:text-sm font-semibold text-[#0B1736] hover:bg-[#F8FAFC] sm:w-auto lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#145BFF]" />
            <span className="truncate">Filters</span>
            {hasActiveFilters && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#EFF6FF] px-1.5 text-[11px] font-bold text-[#145BFF] tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>

          {onViewFiles && (
            <button
              type="button"
              onClick={onViewFiles}
              className="inline-flex h-[44px] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs sm:text-sm font-semibold text-[#0B1736] shadow-2xs transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC] sm:w-auto whitespace-nowrap"
            >
              <FileText
                className="h-4 w-4 shrink-0 text-[#145BFF]"
                aria-hidden="true"
              />
              <span>Documents</span>
              <span className="inline-flex h-5 min-w-[22px] items-center justify-center rounded-full bg-[#EFF6FF] px-1.5 text-[11px] font-bold text-[#145BFF] tabular-nums">
                {totalFiles}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onCreateNew}
            className="col-span-2 inline-flex h-[44px] w-full min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[#145BFF] px-4 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#0F4AD6] sm:col-span-1 sm:w-auto whitespace-nowrap"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">New Batch</span>
          </button>
        </div>
      </div>

      {/* Row 2: Server-Side Filter & Sort Controls */}
      <div
        className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid lg:grid-cols-12 ${filtersExpanded ? 'grid' : 'hidden lg:grid'
          }`}
      >
        <div className="relative min-w-0 lg:col-span-2">
          <select
            aria-label="Filter by schedule timing"
            value={query.scheduleFilter ?? 'All'}
            onChange={(e) =>
              onUpdateQuery({
                scheduleFilter: e.target.value as BatchScheduleFilter,
              })
            }
            className={selectClass}
          >
            <option value="All">All schedules</option>
            <option value="upcoming">Upcoming only</option>
            <option value="started">Already started</option>
          </select>
          <ChevronRight
            className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
            aria-hidden="true"
          />
        </div>

        <div className="relative min-w-0 lg:col-span-2">
          <select
            aria-label="Filter by status"
            value={query.status}
            onChange={(e) =>
              onUpdateQuery({ status: e.target.value as 'All' | BatchStatus })
            }
            className={selectClass}
          >
            <option value="All">All statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
          <ChevronRight
            className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
            aria-hidden="true"
          />
        </div>

        <div className="relative min-w-0 lg:col-span-2">
          <select
            aria-label="Filter by domain category"
            value={query.category}
            onChange={(e) =>
              onUpdateQuery({
                category: e.target.value as 'All' | BatchCategory,
              })
            }
            className={selectClass}
          >
            <option value="All">All categories</option>
            {mergedCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronRight
            className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
            aria-hidden="true"
          />
        </div>

        <div className="relative min-w-0 lg:col-span-2">
          <select
            aria-label="Filter by course or domain"
            value={query.relatedCourse ?? 'All'}
            onChange={(e) =>
              onUpdateQuery({ relatedCourse: e.target.value })
            }
            className={selectClass}
          >
            <option value="All">All domains</option>
            {domainTracks.map((track) => (
              <option key={track} value={track}>
                {track}
              </option>
            ))}
          </select>
          <ChevronRight
            className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
            aria-hidden="true"
          />
        </div>

        <div className="relative min-w-0 lg:col-span-2">
          <select
            aria-label="Filter by learning level or files"
            value={
              query.hasFilesOnly
                ? 'LEVEL:FILES'
                : query.level
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'LEVEL:FILES') {
                onUpdateQuery({ level: 'All', hasFilesOnly: true });
              } else {
                onUpdateQuery({
                  level: val as 'All' | BatchLearningLevel,
                  hasFilesOnly: false,
                });
              }
            }}
            className={selectClass}
          >
            <option value="All">All levels &amp; files</option>
            <option value="Beginner">Level: Beginner</option>
            <option value="Intermediate">Level: Intermediate</option>
            <option value="Advanced">Level: Advanced</option>
            <option value="LEVEL:FILES">With attached files</option>
          </select>
          <ChevronRight
            className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
            aria-hidden="true"
          />
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:col-span-2 lg:col-span-2">
          <div className="relative min-w-0 flex-1">
            <select
              aria-label="Sort batches"
              value={`${query.sortBy}:${query.sortDir}`}
              onChange={(e) => {
                const [sortBy, sortDir] = e.target.value.split(':') as [
                  BatchSortField,
                  'asc' | 'desc',
                ];
                onUpdateQuery({ sortBy, sortDir });
              }}
              className={selectClass}
            >
              <option value="displayOrder:asc">Order: Low to High</option>
              <option value="batchStartAt:asc">Soonest Batch Date</option>
              <option value="updatedAt:desc">Recently Updated</option>
              <option value="createdAt:desc">Newest Created</option>
              <option value="title:asc">Title (A–Z)</option>
            </select>
            <ChevronRight
              className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
              aria-hidden="true"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              aria-label={`Reset ${activeFilterCount} active filters`}
              title="Reset filters"
              className="inline-flex h-[42px] shrink-0 items-center justify-center gap-1 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#DC2626] transition-colors hover:border-[#FECACA] hover:bg-[#FEF2F2]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="tabular-nums">{activeFilterCount}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
