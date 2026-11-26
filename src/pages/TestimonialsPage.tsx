import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquareQuote,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { ContactSection } from '../components/ContactSection';
import { OutlineButton } from '../components/OutlineButton';
import { SafeImage } from '../components/SafeImage';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { usePublicTestimonials } from '../hooks/usePublicTestimonials';

interface TestimonialsPageProps {
  onNavigate: (path: string) => void;
}

export function TestimonialsPage({ onNavigate }: TestimonialsPageProps) {
  const {
    query,
    pageData,
    loading,
    isDebouncing,
    setSearch,
    flushSearch,
    setCourseTrack,
    setFeaturedOnly,
    setSort,
    setPage,
    resetFilters,
  } = usePublicTestimonials({ size: 6 });

  const visibleItems = pageData.items;
  const hasActiveFilter =
    query.courseTrack !== 'All' ||
    query.search.trim() !== '' ||
    query.featuredOnly;

  const startItem =
    pageData.totalItems === 0 ? 0 : pageData.page * pageData.size + 1;
  const endItem = Math.min(
    pageData.totalItems,
    pageData.page * pageData.size + visibleItems.length
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
              className="max-w-[740px]"
            >
              <h1 className="font-display text-[56px] sm:text-[84px] lg:text-[104px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white">
                STUDENT TESTIMONIALS
              </h1>
              <p className="mt-5 text-[16px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[600px]">
                Real placed learner photos and written testimonials from alumni trained across Linux,
                Cisco networking, Windows Server, virtualization, and cloud batches.
              </p>
            </motion.div>
          </div>

          {/* Course Track Filter Pills + Featured Toggle + Search + Sort Bar */}
          {(pageData.totalItems > 0 || hasActiveFilter) && (
            <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div
                role="tablist"
                aria-label="Filter student testimonials by course track"
                className="flex flex-wrap items-center gap-2.5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={query.courseTrack === 'All'}
                  onClick={() => setCourseTrack('All')}
                  className={`rounded-full px-5 py-2.5 text-[14px] transition-colors cursor-pointer min-h-[44px] ${
                    query.courseTrack === 'All'
                      ? 'bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] font-medium'
                      : 'bg-[#F5F5F5] dark:bg-[#2C2C2D] text-[#303030] dark:text-white/85 font-light hover:bg-[#EAEAEA] dark:hover:bg-[#38383A]'
                  }`}
                >
                  All Stories
                </button>
                {pageData.availableCourseTracks.map((track) => {
                  const selected =
                    query.courseTrack.toLowerCase() === track.toLowerCase();
                  return (
                    <button
                      key={track}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setCourseTrack(track)}
                      className={`rounded-full px-5 py-2.5 text-[14px] transition-colors cursor-pointer min-h-[44px] ${
                        selected
                          ? 'bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] font-medium'
                          : 'bg-[#F5F5F5] dark:bg-[#2C2C2D] text-[#303030] dark:text-white/85 font-light hover:bg-[#EAEAEA] dark:hover:bg-[#38383A]'
                      }`}
                    >
                      {track}
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-pressed={query.featuredOnly}
                  onClick={() => setFeaturedOnly(!query.featuredOnly)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13.5px] transition-colors cursor-pointer min-h-[44px] ${
                    query.featuredOnly
                      ? 'bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] font-medium'
                      : 'border border-[#303030]/15 dark:border-white/15 bg-transparent text-[#303030] dark:text-white/85 hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2D]'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Featured</span>
                </button>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="relative min-w-0 sm:w-[250px]">
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
                    placeholder="Search students, roles, companies..."
                    aria-label="Search student testimonials"
                    className="h-[44px] w-full rounded-full border border-[#303030]/15 dark:border-white/15 bg-[#F5F5F5] dark:bg-[#2C2C2D] py-2 pr-10 pl-10 text-[13.5px] text-[#303030] dark:text-white placeholder:text-[#64748B] focus:border-[#5E67E6] dark:focus:border-[#D0FF71] focus:outline-none"
                  />
                  <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1">
                    {(loading || isDebouncing) && (
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
                        aria-label="Clear testimonials search"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[#5C5C5C] hover:bg-black/5 dark:text-white/70"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <select
                  aria-label="Sort student testimonials"
                  value={`${query.sortBy}:${query.sortDir}`}
                  onChange={(e) => {
                    const [sortBy, sortDir] = e.target.value.split(':') as [
                      'displayOrder' | 'createdAt' | 'studentName',
                      'asc' | 'desc',
                    ];
                    setSort(sortBy, sortDir);
                  }}
                  className="h-[44px] rounded-full border border-[#303030]/15 dark:border-white/15 bg-[#F5F5F5] dark:bg-[#2C2C2D] px-4 text-[13.5px] text-[#303030] dark:text-white focus:border-[#5E67E6] dark:focus:border-[#D0FF71] focus:outline-none"
                >
                  <option value="displayOrder:asc">Featured &amp; Order</option>
                  <option value="createdAt:desc">Recently Added</option>
                  <option value="studentName:asc">Student Name (A–Z)</option>
                </select>
              </div>
            </div>
          )}

          {/* Testimonials Grid, Skeleton Loaders, or Verified Empty State */}
          <div className="mt-10">
            {loading && visibleItems.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="animate-pulse rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-7 space-y-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-16 rounded-full bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-32 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                        <div className="h-3 w-44 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                      </div>
                    </div>
                    <div className="h-3.5 w-36 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                      <div className="h-3 w-5/6 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#D6D6DA] dark:border-[#3A3A3D] bg-[#F8F8FA] dark:bg-[#232325] p-8 sm:p-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#5E67E6]/10 dark:bg-[#D0FF71]/15 text-[#5E67E6] dark:text-[#D0FF71] flex items-center justify-center">
                  <MessageSquareQuote className="w-6 h-6" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-[30px] font-bold uppercase text-[#303030] dark:text-white">
                  {hasActiveFilter
                    ? 'NO MATCHING TESTIMONIALS FOUND'
                    : 'VERIFIED STUDENT TESTIMONIALS'}
                </h2>
                <p className="mt-2 mx-auto max-w-[520px] text-[15px] sm:text-[16px] font-light leading-[1.6] text-[#5C5C5C] dark:text-white/75">
                  {hasActiveFilter
                    ? 'No student reviews match your selected track, search keyword, or featured filter. Reset filters to view all placed alumni stories.'
                    : 'Verified student reviews and placement outcomes published from the Admin Dashboard will appear here automatically.'}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {hasActiveFilter ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center justify-center rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-6 py-2.5 text-[14px] font-medium text-white dark:text-[#1A1A1B] cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  ) : (
                    <>
                      <OutlineButton onClick={() => onNavigate('/upcoming-batches')}>
                        EXPLORE TRAINING
                      </OutlineButton>
                      <OutlineButton onClick={() => onNavigate('/contact')}>
                        BOOK CONSULTATION
                      </OutlineButton>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleItems.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-7 border border-black/[0.04] dark:border-white/[0.06]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3.5">
                          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-[#5E67E6]/25 dark:ring-[#D0FF71]/35 bg-[#5E67E6]/15 dark:bg-[#D0FF71]/15 flex items-center justify-center text-[#5E67E6] dark:text-[#D0FF71] font-display text-[22px] font-bold">
                            {item.avatarUrl ? (
                              <SafeImage
                                src={item.avatarUrl}
                                alt={item.studentName}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              item.studentName.slice(0, 1).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h2 className="text-[17px] font-semibold text-[#303030] dark:text-white leading-snug">
                              {item.studentName}
                            </h2>
                            {(item.company || item.role) && (
                              <p className="mt-0.5 text-[13px] font-medium text-[#5E67E6] dark:text-[#D0FF71] leading-snug">
                                {[item.company, item.role].filter(Boolean).join(' | ')}
                              </p>
                            )}
                          </div>
                        </div>
                        {item.featured && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#5E67E6]/10 dark:bg-[#D0FF71]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#5E67E6] dark:text-[#D0FF71]">
                            <Sparkles className="w-3 h-3" aria-hidden="true" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>

                      <p className="mt-4 text-[13px] font-medium uppercase tracking-wider text-[#5E67E6] dark:text-[#D0FF71]">
                        {item.courseTrack}
                      </p>

                      <blockquote className="mt-3 text-[15px] font-light leading-[1.65] text-[#303030] dark:text-white/80">
                        &ldquo;{item.quote}&rdquo;
                      </blockquote>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E5E5E5] dark:border-[#38383A] flex items-center justify-between text-[12.5px] font-light text-[#5C5C5C] dark:text-white/60">
                      <span>Verified Learner</span>
                      <span className="font-mono text-[11.5px]">{item.testimonialCode}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Server-Side Pagination UI (6 stories per page, matching Blogs & Gallery pages) */}
          {pageData.totalItems > 0 && pageData.totalPages > 1 && (
            <nav
              aria-label="Testimonials pagination"
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
                testimonials · Page {pageData.page + 1} of {pageData.totalPages}
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

      {/* Corporate Partners & Why Learn Credibility Section (no duplicate student cards) */}
      <TestimonialsSection onNavigate={onNavigate} showStudentCards={false} />

      <ContactSection />
    </main>
  );
}
