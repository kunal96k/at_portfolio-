import {
  ChevronRight,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import { COURSE_TRACK_OPTIONS } from '../../data/mockAdminData';
import type {
  TopicLearningLevel,
  TopicQueryState,
  TopicSortField,
  TopicStatus,
} from '../types/topic';

interface TopicFiltersBarProps {
  query: TopicQueryState;
  onUpdateQuery: (patch: Partial<TopicQueryState>) => void;
  onResetFilters: () => void;
  onCreateNew: () => void;
}

export function TopicFiltersBar({
  query,
  onUpdateQuery,
  onResetFilters,
  onCreateNew,
}: TopicFiltersBarProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const hasActiveFilters =
    query.search.trim() !== '' ||
    query.status !== 'All' ||
    query.level !== 'All' ||
    query.course !== 'All' ||
    query.featuredOnly;

  const selectClass =
    'min-h-[44px] w-full min-w-0 appearance-none rounded-xl border border-[#E2E8F0] bg-white py-2 pr-9 pl-3 text-sm text-[#0B1736] focus:border-[#145BFF] focus:outline-none';

  return (
    <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 sm:p-4">
      {/* Row 1: Search + Mobile Filter Toggle + Primary Action */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query.search}
            onChange={(e) => onUpdateQuery({ search: e.target.value })}
            placeholder="Search topics by title, slug, tag, or track…"
            aria-label="Search topics"
            className="min-h-[44px] w-full min-w-0 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] py-2 pr-3 pl-10 text-sm text-[#0B1736] placeholder:text-[#64748B] focus:border-[#145BFF] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 min-[340px]:grid-cols-2 sm:flex sm:shrink-0 sm:items-center">
          <button
            type="button"
            onClick={() => setFiltersExpanded((prev) => !prev)}
            aria-expanded={filtersExpanded}
            className="inline-flex min-h-[44px] w-full min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#0B1736] hover:bg-[#F5F7FC] sm:w-auto lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#145BFF]" />
            <span className="truncate">Filters</span>
            <ChevronRight
              className={`h-4 w-4 shrink-0 text-[#64748B] transition-transform ${
                filtersExpanded ? 'rotate-90 text-[#145BFF]' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex min-h-[44px] w-full min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[#145BFF] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0F4AD6] sm:w-auto whitespace-nowrap"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">New Topic</span>
          </button>
        </div>
      </div>

      {/* Row 2: Filters & Sort (Collapsible on Mobile, Always Visible on Desktop) */}
      <div
        className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid lg:grid-cols-5 ${
          filtersExpanded ? 'grid' : 'hidden lg:grid'
        }`}
      >
        <div className="relative min-w-0">
          <select
            aria-label="Filter by status"
            value={query.status}
            onChange={(e) =>
              onUpdateQuery({ status: e.target.value as 'All' | TopicStatus })
            }
            className={selectClass}
          >
            <option value="All">All statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
          <ChevronRight
            className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 rotate-90 text-[#64748B]"
            aria-hidden="true"
          />
        </div>

        <div className="relative min-w-0">
          <select
            aria-label="Filter by learning level"
            value={query.level}
            onChange={(e) =>
              onUpdateQuery({
                level: e.target.value as 'All' | TopicLearningLevel,
              })
            }
            className={selectClass}
          >
            <option value="All">All levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <ChevronRight
            className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 rotate-90 text-[#64748B]"
            aria-hidden="true"
          />
        </div>

        <div className="relative min-w-0">
          <select
            aria-label="Filter by related course"
            value={query.course}
            onChange={(e) => onUpdateQuery({ course: e.target.value })}
            className={selectClass}
          >
            <option value="All">All courses & tracks</option>
            {COURSE_TRACK_OPTIONS.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
          <ChevronRight
            className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 rotate-90 text-[#64748B]"
            aria-hidden="true"
          />
        </div>

        <div className="relative min-w-0">
          <select
            aria-label="Sort topics"
            value={`${query.sortBy}:${query.sortDir}`}
            onChange={(e) => {
              const [sortBy, sortDir] = e.target.value.split(':') as [
                TopicSortField,
                'asc' | 'desc',
              ];
              onUpdateQuery({ sortBy, sortDir });
            }}
            className={selectClass}
          >
            <option value="displayOrder:asc">Order: Low to High</option>
            <option value="displayOrder:desc">Order: High to Low</option>
            <option value="updatedAt:desc">Recently Updated</option>
            <option value="createdAt:desc">Newest Created</option>
            <option value="title:asc">Title (A–Z)</option>
          </select>
          <ChevronRight
            className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 rotate-90 text-[#64748B]"
            aria-hidden="true"
          />
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateQuery({ featuredOnly: !query.featuredOnly })}
            aria-pressed={query.featuredOnly}
            className={`inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors whitespace-nowrap ${
              query.featuredOnly
                ? 'border-[#145BFF] bg-[#EFF6FF] text-[#145BFF]'
                : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F5F7FC]'
            }`}
          >
            <Star className="h-3.5 w-3.5 shrink-0" />
            <span>Featured</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              aria-label="Reset topic filters"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F5F7FC] hover:text-[#0B1736]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
