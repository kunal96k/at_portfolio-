import {
  ChevronRight,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type {
  TestimonialQueryState,
  TestimonialSortField,
  TestimonialStatus,
  TestimonialVisibilityFilter,
} from '../types/testimonial';

interface TestimonialFiltersBarProps {
  query: TestimonialQueryState;
  courseTracks: string[];
  searching?: boolean;
  onUpdateQuery: (patch: Partial<TestimonialQueryState>) => void;
  onFlushSearch?: (value?: string) => void;
  onResetFilters: () => void;
  onCreateNew: () => void;
}

export function TestimonialFiltersBar({
  query,
  courseTracks,
  searching = false,
  onUpdateQuery,
  onFlushSearch,
  onResetFilters,
  onCreateNew,
}: TestimonialFiltersBarProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const activeFilterCount =
    (query.search.trim() !== '' ? 1 : 0) +
    (query.status !== 'All' ? 1 : 0) +
    (query.courseTrack !== 'All' ? 1 : 0) +
    (query.visibilityFilter !== 'all' ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  const selectClass =
    'h-[42px] w-full min-w-0 appearance-none rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2 pr-8 pl-3 text-xs sm:text-[13px] font-medium text-[#0B1736] transition-colors hover:border-[#CBD5E1] focus:border-[#145BFF] focus:bg-white focus:ring-2 focus:ring-[#145BFF]/15 focus:outline-none';

  return (
    <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-2xs sm:p-4">
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
            placeholder="Search testimonials by student name, code, company, role, or quote…"
            aria-label="Search student testimonials"
            className="h-[44px] w-full min-w-0 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2 pr-20 pl-10 text-sm text-[#0B1736] placeholder:text-[#64748B] transition-colors hover:border-[#CBD5E1] focus:border-[#145BFF] focus:bg-white focus:ring-2 focus:ring-[#145BFF]/15 focus:outline-none"
          />
          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
            {searching && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#EFF6FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#145BFF]">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                <span className="hidden sm:inline">Searching</span>
              </span>
            )}
            {query.search && (
              <button
                type="button"
                onClick={() => {
                  onUpdateQuery({ search: '' });
                  onFlushSearch?.('');
                }}
                aria-label="Clear testimonials search"
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

          <button
            type="button"
            onClick={onCreateNew}
            className="col-span-2 inline-flex h-[44px] w-full min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[#145BFF] px-4 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#0F4AD6] sm:col-span-1 sm:w-auto whitespace-nowrap"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Add Testimonial</span>
          </button>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid lg:grid-cols-12 ${
          filtersExpanded ? 'grid' : 'hidden lg:grid'
        }`}
      >
        <div className="relative min-w-0 lg:col-span-3">
          <select
            aria-label="Filter by testimonial status"
            value={query.status}
            onChange={(e) =>
              onUpdateQuery({ status: e.target.value as 'All' | TestimonialStatus })
            }
            className={selectClass}
          >
            <option value="All">All statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
          <ChevronRight
            className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
            aria-hidden="true"
          />
        </div>

        <div className="relative min-w-0 lg:col-span-3">
          <select
            aria-label="Filter by course track"
            value={query.courseTrack}
            onChange={(e) => onUpdateQuery({ courseTrack: e.target.value })}
            className={selectClass}
          >
            <option value="All">All course tracks</option>
            {courseTracks.map((track) => (
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

        <div className="relative min-w-0 lg:col-span-3">
          <select
            aria-label="Filter by featured visibility"
            value={query.visibilityFilter}
            onChange={(e) =>
              onUpdateQuery({
                visibilityFilter: e.target.value as TestimonialVisibilityFilter,
              })
            }
            className={selectClass}
          >
            <option value="all">All testimonials</option>
            <option value="featured">Featured on Homepage</option>
          </select>
          <ChevronRight
            className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#64748B]"
            aria-hidden="true"
          />
        </div>

        <div className="flex min-w-0 items-center gap-2 lg:col-span-3">
          <div className="relative min-w-0 flex-1">
            <select
              aria-label="Sort student testimonials"
              value={`${query.sortBy}:${query.sortDir}`}
              onChange={(e) => {
                const [sortBy, sortDir] = e.target.value.split(':') as [
                  TestimonialSortField,
                  'asc' | 'desc',
                ];
                onUpdateQuery({ sortBy, sortDir });
              }}
              className={selectClass}
            >
              <option value="displayOrder:asc">Order: Low to High</option>
              <option value="displayOrder:desc">Order: High to Low</option>
              <option value="updatedAt:desc">Recently Updated</option>
              <option value="createdAt:desc">Newest Added</option>
              <option value="studentName:asc">Student Name (A–Z)</option>
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
