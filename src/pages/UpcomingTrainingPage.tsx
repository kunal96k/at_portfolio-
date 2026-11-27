import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Calendar,
  ChevronDown,
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
import { PublicDetailModal } from '../components/PublicDetailModal';
import { PublicPagination } from '../components/PublicPagination';
import { SafeImage } from '../components/SafeImage';
import { TruncatedTextWithMore } from '../components/TruncatedTextWithMore';
import {
  usePublicBatches,
  type PublicBatchSortBy,
} from '../hooks/usePublicBatches';
import {
  formatBatchDateDisplay,
  formatBatchTimeDisplay,
  type ManagedBatch,
} from '../services/batchesService';
import { sanitizeSafeHref } from '../utils/scrollMath';

interface UpcomingTrainingPageProps {
  onContactClick: () => void;
  onNavigate?: (path: string) => void;
}

export function UpcomingTrainingPage({
  onContactClick,
  onNavigate,
}: UpcomingTrainingPageProps) {
  const [selectedBatch, setSelectedBatch] = useState<ManagedBatch | null>(
    null
  );
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

          {/* Loading Skeleton, Empty State UI, or Upcoming Batch Cards matching Home Layout */}
          <div className="mt-10">
            {loading && batches.length === 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((skeleton) => (
                  <div
                    key={skeleton}
                    className="flex flex-col overflow-hidden rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] animate-pulse"
                  >
                    <div className="aspect-[16/10] w-full bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                    <div className="space-y-3 p-6">
                      <div className="flex items-center justify-between">
                        <div className="h-5 w-24 rounded-full bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                        <div className="h-4 w-20 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                      </div>
                      <div className="h-7 w-3/4 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
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
              <div
                className={`grid grid-cols-1 gap-6 ${
                  batches.length === 1
                    ? 'max-w-xl'
                    : batches.length === 2
                      ? 'md:grid-cols-2'
                      : 'md:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {batches.map((program, idx) => {
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
                      className="group flex h-full flex-col overflow-hidden rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D]"
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden bg-[#E2E2E5] dark:bg-[#1F1F21]">
                        <SafeImage
                          src={program.coverImage}
                          alt={program.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-block rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-3 py-0.5 text-[12px] font-medium text-white dark:text-[#1A1A1B]">
                              {program.category}
                            </span>
                            {program.learningLevel && (
                              <span className="rounded-full bg-white/80 dark:bg-[#1F1F21] px-2.5 py-0.5 text-[11.5px] font-medium text-[#303030] dark:text-white/80">
                                {program.learningLevel}
                              </span>
                            )}
                          </div>
                          <span className="text-[12px] font-medium text-[#5C5C5C] dark:text-white/65">
                            {formatBatchDateDisplay(program.batchDate)}
                          </span>
                        </div>

                        <h2 className="mt-3 font-display text-[24px] sm:text-[26px] font-bold uppercase leading-[1.18] text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors line-clamp-2">
                          {program.title}
                        </h2>

                        {program.relatedCourse && (
                          <p className="mt-1 text-[12.5px] font-medium text-[#5E67E6] dark:text-[#D0FF71] line-clamp-1">
                            {program.relatedCourse}
                          </p>
                        )}

                        <div className="mt-2.5">
                          <TruncatedTextWithMore
                            lines={3}
                            text={program.shortDescription}
                            className="text-[14.5px] font-light leading-[1.6] text-[#5C5C5C] dark:text-white/75"
                            ariaLabel={`Read full batch description for ${program.title}`}
                            onMore={() => setSelectedBatch(program)}
                          />
                        </div>

                        {/* Schedule Metadata */}
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-light text-[#5C5C5C] dark:text-white/70">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#5E67E6] dark:text-[#D0FF71]" />
                            {formatBatchDateDisplay(program.batchDate)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#5E67E6] dark:text-[#D0FF71]" />
                            {formatBatchTimeDisplay(program.batchTime)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#5E67E6] dark:text-[#D0FF71]" />
                            {program.mode} · {program.seatsTotal} seats
                          </span>
                          {program.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#5E67E6] dark:text-[#D0FF71]" />
                              {program.location}
                            </span>
                          )}
                        </div>

                        {/* Optional Expandable Syllabus */}
                        {modules.length > 0 && (
                          <div className="mt-4 border-t border-[#E2E2E4] dark:border-[#3A3A3D] pt-3">
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              onClick={() =>
                                setExpandedId(isOpen ? null : program.id)
                              }
                              className="w-full flex items-center justify-between text-left py-1 text-[14px] font-medium text-[#303030] dark:text-white cursor-pointer"
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
                                  className="overflow-hidden mt-2.5 space-y-2"
                                >
                                  {modules.map((mod, mIdx) => (
                                    <li
                                      key={`${mod}-${mIdx}`}
                                      className="flex items-start gap-2 text-[13.5px] font-light text-[#303030] dark:text-white/80"
                                    >
                                      <span className="font-display text-[14px] font-bold text-[#5E67E6] dark:text-[#D0FF71] tabular-nums">
                                        {String(mIdx + 1).padStart(2, '0')}.
                                      </span>
                                      <span>{mod}</span>
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
                          <OutlineButton onClick={onContactClick}>
                            ENQUIRE FOR BATCH
                          </OutlineButton>

                          {program.attachments.length > 0 &&
                            sanitizeSafeHref(program.attachments[0]?.url) && (
                              <a
                                href={sanitizeSafeHref(program.attachments[0]?.url)!}
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
                })}
              </div>
            )}
          </div>

          <PublicDetailModal
            open={Boolean(selectedBatch)}
            onClose={() => setSelectedBatch(null)}
            titleId="upcoming-batch-modal-title"
            closeLabel="Close batch details"
            maxWidthClass="max-w-[700px]"
          >
            {selectedBatch && (() => {
              const modalModules =
                selectedBatch.modules.length > 0
                  ? selectedBatch.modules
                  : selectedBatch.detailedContent
                      .split(/\r?\n/)
                      .map((l) => l.trim())
                      .filter(Boolean);
              return (
                <div>
                  <div className="aspect-[16/9] w-full overflow-hidden bg-[#141415]">
                    <SafeImage
                      src={selectedBatch.coverImage}
                      alt={selectedBatch.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-block rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-3 py-0.5 text-[12px] font-medium text-white dark:text-[#1A1A1B]">
                          {selectedBatch.category}
                        </span>
                        {selectedBatch.learningLevel && (
                          <span className="rounded-full bg-[#F5F5F5] dark:bg-[#2C2C2D] px-2.5 py-0.5 text-[12px] font-medium text-[#303030] dark:text-white/80">
                            {selectedBatch.learningLevel}
                          </span>
                        )}
                      </div>
                      <span className="text-[12.5px] font-medium text-[#5C5C5C] dark:text-white/70">
                        {formatBatchDateDisplay(selectedBatch.batchDate)}
                      </span>
                    </div>

                    <h3
                      id="upcoming-batch-modal-title"
                      className="mt-3 font-display text-[26px] sm:text-[32px] font-bold uppercase leading-[1.15] text-[#303030] dark:text-white"
                    >
                      {selectedBatch.title}
                    </h3>

                    {selectedBatch.relatedCourse && (
                      <p className="mt-1 text-[13px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                        {selectedBatch.relatedCourse}
                      </p>
                    )}

                    <p className="mt-3 whitespace-pre-line text-[15px] font-light leading-[1.65] text-[#303030] dark:text-white/80">
                      {selectedBatch.shortDescription}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-light text-[#5C5C5C] dark:text-white/70">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#5E67E6] dark:text-[#D0FF71]" />
                        {formatBatchDateDisplay(selectedBatch.batchDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#5E67E6] dark:text-[#D0FF71]" />
                        {formatBatchTimeDisplay(selectedBatch.batchTime)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#5E67E6] dark:text-[#D0FF71]" />
                        {selectedBatch.mode} · {selectedBatch.seatsTotal} seats
                      </span>
                      {selectedBatch.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#5E67E6] dark:text-[#D0FF71]" />
                          {selectedBatch.location}
                        </span>
                      )}
                    </div>

                    {modalModules.length > 0 && (
                      <div className="mt-5 border-t border-[#E2E2E4] dark:border-[#3A3A3D] pt-4">
                        <h4 className="text-[14px] font-semibold text-[#303030] dark:text-white">
                          Key Lab Modules ({modalModules.length})
                        </h4>
                        <ul className="mt-2.5 space-y-2">
                          {modalModules.map((mod, mIdx) => (
                            <li
                              key={`${mod}-${mIdx}`}
                              className="flex items-start gap-2 text-[13.5px] font-light text-[#303030] dark:text-white/80"
                            >
                              <span className="font-display text-[14px] font-bold text-[#5E67E6] dark:text-[#D0FF71] tabular-nums">
                                {String(mIdx + 1).padStart(2, '0')}.
                              </span>
                              <span>{mod}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <OutlineButton
                        onClick={() => {
                          setSelectedBatch(null);
                          onContactClick();
                        }}
                      >
                        ENQUIRE FOR BATCH
                      </OutlineButton>

                      {selectedBatch.attachments.length > 0 &&
                        sanitizeSafeHref(selectedBatch.attachments[0]?.url) && (
                          <a
                            href={sanitizeSafeHref(selectedBatch.attachments[0]?.url)!}
                            download={selectedBatch.attachments[0].name}
                            className="inline-flex items-center gap-2 rounded-full border border-[#303030]/20 dark:border-white/20 px-4 py-2.5 text-[13px] font-medium text-[#303030] dark:text-white/90 hover:bg-[#303030] hover:text-white dark:hover:bg-white dark:hover:text-[#1A1A1B] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Syllabus PDF</span>
                          </a>
                        )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </PublicDetailModal>

          {/* Server-Side Pagination UI (5 upcoming batches per page, compact ellipsis when > 10 pages) */}
          <PublicPagination
            ariaLabel="Upcoming batches navigation"
            itemLabel="batches"
            page={pageData.page}
            totalPages={pageData.totalPages}
            totalItems={pageData.totalItems}
            startItem={startItem}
            endItem={endItem}
            hasPrevious={pageData.hasPrevious}
            hasNext={pageData.hasNext}
            onPageChange={setPage}
          />
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
