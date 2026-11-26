import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  MapPin,
  Search,
  Users,
  X,
} from 'lucide-react';
import { BatchEmptyStateCard } from '../components/BatchEmptyStateCard';
import { BatchEmptyStateModal } from '../components/BatchEmptyStateModal';
import { ContactSection } from '../components/ContactSection';
import { OutlineButton } from '../components/OutlineButton';
import { SafeImage } from '../components/SafeImage';
import {
  usePublicBatches,
  type PublicBatchSortBy,
} from '../hooks/usePublicBatches';
import {
  formatBatchDateDisplay,
  formatBatchTimeDisplay,
} from '../services/batchesService';

interface UpcomingTrainingPageProps {
  onContactClick: () => void;
  onNavigate?: (path: string) => void;
}

export function UpcomingTrainingPage({
  onContactClick,
  onNavigate,
}: UpcomingTrainingPageProps) {
  const {
    batches,
    query,
    pageData,
    loading,
    isDebouncing,
    setSearch,
    flushSearch,
    setCategory,
    setSort,
    setPage,
    resetFilters,
  } = usePublicBatches();

  const [expandedId, setExpandedId] = useState<string | null>(
    () => batches[0]?.id ?? null
  );
  const [emptyModalOpen, setEmptyModalOpen] = useState(false);
  const autoShownForEmptyRef = useRef(false);

  const hasActiveFilter =
    query.category !== 'All' || query.search.trim() !== '';

  // Sync accordion selection and open empty-state prompt only when DB actually has 0 upcoming batches
  useEffect(() => {
    if (loading) return;

    if (batches.length === 0) {
      setExpandedId(null);
      if (!hasActiveFilter && !autoShownForEmptyRef.current) {
        autoShownForEmptyRef.current = true;
        setEmptyModalOpen(true);
      }
      return;
    }

    autoShownForEmptyRef.current = false;
    setEmptyModalOpen(false);
    setExpandedId((prev) =>
      prev && batches.some((b) => b.id === prev) ? prev : batches[0].id
    );
  }, [batches, loading, hasActiveFilter]);

  const startItem =
    pageData.totalItems === 0 ? 0 : pageData.page * pageData.size + 1;
  const endItem = Math.min(
    pageData.totalItems,
    pageData.page * pageData.size + batches.length
  );

  return (
    <main id="main-content" className="relative z-10">
      <section className="px-5 sm:px-8 pt-32 sm:pt-40 pb-12 sm:pb-16">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[760px]"
            >
              <h1 className="font-display text-[56px] sm:text-[84px] lg:text-[104px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white">
                UPCOMING BATCHES
              </h1>
              <p className="mt-5 text-[16px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[600px]">
                Explore upcoming hands-on cohorts in Red Hat Linux (RHEL), Cisco
                CCNA, AWS Cloud Architecture, and DevOps &amp; Automation. Only
                active upcoming schedules open for enrollment are shown here.
              </p>
            </motion.div>
          </div>

          {/* Dynamic Category Pills + Search + Sort Bar (Server-Side Filtered) */}
          {(pageData.totalItems > 0 || hasActiveFilter) && (
            <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div
                role="tablist"
                aria-label="Filter upcoming training batches"
                className="flex flex-wrap items-center gap-2.5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={query.category === 'All'}
                  onClick={() => setCategory('All')}
                  className={`rounded-full px-5 py-2.5 text-[14px] transition-colors cursor-pointer min-h-[44px] ${
                    query.category === 'All'
                      ? 'bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] font-medium'
                      : 'bg-[#F5F5F5] dark:bg-[#2C2C2D] text-[#303030] dark:text-white/85 font-light hover:bg-[#EAEAEA] dark:hover:bg-[#38383A]'
                  }`}
                >
                  All Batches
                </button>
                {pageData.availableCategories.map((cat) => {
                  const selected = query.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setCategory(cat)}
                      className={`rounded-full px-5 py-2.5 text-[14px] transition-colors cursor-pointer min-h-[44px] ${
                        selected
                          ? 'bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] font-medium'
                          : 'bg-[#F5F5F5] dark:bg-[#2C2C2D] text-[#303030] dark:text-white/85 font-light hover:bg-[#EAEAEA] dark:hover:bg-[#38383A]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[230px] flex-1 sm:w-[270px] sm:flex-none">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#5C5C5C] dark:text-white/60"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    maxLength={120}
                    value={query.search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        flushSearch(query.search);
                      }
                    }}
                    placeholder="Search batches…"
                    aria-label="Search upcoming batches"
                    className="h-[44px] w-full rounded-full border border-[#303030]/15 dark:border-white/15 bg-[#F5F5F5] dark:bg-[#2C2C2D] pr-12 pl-10 text-[14px] text-[#303030] dark:text-white placeholder:text-[#5C5C5C]/70 dark:placeholder:text-white/50 focus:border-[#5E67E6] dark:focus:border-[#D0FF71] focus:outline-none"
                  />
                  <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
                    {(isDebouncing || (loading && batches.length > 0)) && (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin text-[#5E67E6] dark:text-[#D0FF71]"
                        aria-hidden="true"
                      />
                    )}
                    {query.search && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch('');
                          flushSearch('');
                        }}
                        aria-label="Clear batch search"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[#5C5C5C] hover:bg-black/5 dark:text-white/70"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <select
                  aria-label="Sort upcoming batches"
                  value={`${query.sortBy}:${query.sortDir}`}
                  onChange={(e) => {
                    const [sortBy, sortDir] = e.target.value.split(':') as [
                      PublicBatchSortBy,
                      'asc' | 'desc',
                    ];
                    setSort(sortBy, sortDir);
                  }}
                  className="h-[44px] rounded-full border border-[#303030]/15 dark:border-white/15 bg-[#F5F5F5] dark:bg-[#2C2C2D] px-4 text-[13.5px] text-[#303030] dark:text-white focus:border-[#5E67E6] dark:focus:border-[#D0FF71] focus:outline-none"
                >
                  <option value="displayOrder:asc">Upcoming Schedule</option>
                  <option value="batchStartAt:asc">Starting Soonest</option>
                  <option value="createdAt:desc">Latest Batches</option>
                  <option value="title:asc">Title (A–Z)</option>
                </select>
              </div>
            </div>
          )}

          {/* Loading Skeleton, Empty State UI, or 5-Per-Page Upcoming Batch Cards */}
          <div className="mt-10 space-y-7">
            {loading && batches.length === 0 ? (
              <div className="space-y-6">
                {[0, 1].map((skeleton) => (
                  <div
                    key={skeleton}
                    className="grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr] gap-6 sm:gap-8 animate-pulse rounded-[24px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-5 sm:p-7"
                  >
                    <div className="aspect-[16/10] rounded-[18px] bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                    <div className="space-y-4 py-2">
                      <div className="h-5 w-28 rounded-full bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                      <div className="h-9 w-3/4 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                      <div className="h-4 w-full rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                      <div className="h-4 w-2/3 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : batches.length === 0 ? (
              hasActiveFilter ? (
                <BatchEmptyStateCard
                  variant="category"
                  selectedCategory={
                    query.category !== 'All'
                      ? query.category
                      : `"${query.search.trim()}"`
                  }
                  onOpenModal={() => setEmptyModalOpen(true)}
                  onShowAllCategories={resetFilters}
                  onContactClick={onContactClick}
                />
              ) : (
                <BatchEmptyStateCard
                  variant="all"
                  onOpenModal={() => setEmptyModalOpen(true)}
                  onContactClick={onContactClick}
                  onNavigateResources={
                    onNavigate ? () => onNavigate('/resources') : undefined
                  }
                />
              )
            ) : (
              batches.map((program, idx) => {
                const isOpen = expandedId === program.id;
                const modules =
                  program.modules.length > 0
                    ? program.modules
                    : program.detailedContent
                        .split(/\r?\n/)
                        .map((l) => l.trim())
                        .filter(Boolean);
                return (
                  <motion.article
                    key={program.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: idx * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr] gap-6 sm:gap-8 rounded-[24px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-5 sm:p-7 overflow-hidden"
                  >
                    <div className="rounded-[18px] overflow-hidden aspect-[16/10] lg:aspect-auto lg:h-full bg-[#E2E2E5] dark:bg-[#1F1F21]">
                      <SafeImage
                        src={program.coverImage}
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] px-3.5 py-1 text-[12px] font-medium">
                              {program.category}
                            </span>
                            {program.relatedCourse && (
                              <span className="rounded-full bg-white/80 dark:bg-[#1F1F21] px-3 py-1 text-[12px] font-medium text-[#303030] dark:text-white/80">
                                {program.relatedCourse}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-[#5C5C5C] dark:text-white/70">
                            {program.learningLevel && (
                              <span className="rounded-full bg-white/80 dark:bg-[#1F1F21] px-2.5 py-0.5">
                                {program.learningLevel}
                              </span>
                            )}
                            {program.batchCode && (
                              <span className="font-mono opacity-80">
                                {program.batchCode}
                              </span>
                            )}
                          </div>
                        </div>

                        <h2 className="mt-4 font-display text-[32px] sm:text-[40px] font-bold leading-[1.1] uppercase text-[#303030] dark:text-white">
                          {program.title}
                        </h2>

                        <p className="mt-3 text-[15px] sm:text-[16px] font-light leading-[1.6] text-[#303030] dark:text-white/80">
                          {program.shortDescription}
                        </p>

                        {/* Schedule Metadata */}
                        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[14px] font-light text-[#5C5C5C] dark:text-white/70">
                          <span className="inline-flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#5E67E6] dark:text-[#D0FF71]" />
                            {formatBatchDateDisplay(program.batchDate)}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#5E67E6] dark:text-[#D0FF71]" />
                            {formatBatchTimeDisplay(program.batchTime)}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#5E67E6] dark:text-[#D0FF71]" />
                            {program.mode} · {program.seatsTotal} seats
                          </span>
                          {program.location && (
                            <span className="inline-flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#5E67E6] dark:text-[#D0FF71]" />
                              {program.location}
                            </span>
                          )}
                        </div>

                        {/* Expandable Syllabus */}
                        <div className="mt-6 border-t border-[#E2E2E4] dark:border-[#3A3A3D] pt-4">
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() =>
                              setExpandedId(isOpen ? null : program.id)
                            }
                            className="w-full flex items-center justify-between text-left py-1 text-[15px] font-medium text-[#303030] dark:text-white cursor-pointer"
                          >
                            <span>Key Lab Modules ({modules.length})</span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                              aria-hidden="true"
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.ul
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{
                                  duration: 0.24,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                className="overflow-hidden mt-3 space-y-2"
                              >
                                {modules.map((mod, mIdx) => (
                                  <li
                                    key={`${mod}-${mIdx}`}
                                    className="flex items-start gap-2.5 text-[14px] sm:text-[15px] font-light text-[#303030] dark:text-white/80"
                                  >
                                    <span className="font-display text-[15px] font-bold text-[#5E67E6] dark:text-[#D0FF71] tabular-nums">
                                      {String(mIdx + 1).padStart(2, '0')}.
                                    </span>
                                    <span>{mod}</span>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-3 pt-2">
                        <OutlineButton onClick={onContactClick}>
                          ENQUIRE FOR BATCH
                        </OutlineButton>

                        {program.attachments.length > 0 &&
                          program.attachments[0]?.url && (
                            <a
                              href={program.attachments[0].url}
                              download={program.attachments[0].name}
                              className="inline-flex items-center gap-2 rounded-full border border-[#303030]/20 dark:border-white/20 px-4 py-2.5 text-[13px] font-medium text-[#303030] dark:text-white/90 hover:bg-[#303030] hover:text-white dark:hover:bg-white dark:hover:text-[#1A1A1B] transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Syllabus PDF</span>
                            </a>
                          )}
                      </div>
                    </div>
                  </motion.article>
                );
              })
            )}
          </div>

          {/* Server-Side Pagination UI (5 upcoming batches per page — matches BlogsPage UI) */}
          {pageData.totalItems > 0 && pageData.totalPages > 1 && (
            <nav
              aria-label="Upcoming batches navigation"
              className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[18px] bg-[#F5F5F5] dark:bg-[#2C2C2D] px-5 py-3.5"
            >
              <p className="text-[13.5px] text-[#5C5C5C] dark:text-white/75 tabular-nums">
                Showing{' '}
                <strong className="text-[#303030] dark:text-white">
                  {startItem}–{endItem}
                </strong>{' '}
                of{' '}
                <strong className="text-[#303030] dark:text-white">
                  {pageData.totalItems}
                </strong>{' '}
                batches · Page {pageData.page + 1} of {pageData.totalPages}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!pageData.hasPrevious}
                  onClick={() => setPage(pageData.page - 1)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#303030]/20 dark:border-white/20 px-4 py-1.5 text-[13px] text-[#303030] dark:text-white disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {Array.from(
                  { length: pageData.totalPages },
                  (_, idx) => idx
                ).map((idx) => {
                  const active = idx === pageData.page;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPage(idx)}
                      aria-current={active ? 'page' : undefined}
                      className={`h-8 min-w-[32px] rounded-full px-2.5 text-[13px] font-medium tabular-nums transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B]'
                          : 'border border-[#303030]/15 dark:border-white/15 text-[#303030] dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={!pageData.hasNext}
                  onClick={() => setPage(pageData.page + 1)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#303030]/20 dark:border-white/20 px-4 py-1.5 text-[13px] text-[#303030] dark:text-white disabled:opacity-40 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </nav>
          )}
        </div>
      </section>

      <BatchEmptyStateModal
        open={emptyModalOpen}
        initialCategory={query.category}
        onClose={() => setEmptyModalOpen(false)}
        onContactClick={onContactClick}
        onNavigate={onNavigate}
      />

      <ContactSection />
    </main>
  );
}
