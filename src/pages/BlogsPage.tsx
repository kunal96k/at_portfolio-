import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { ContactSection } from '../components/ContactSection';
import { OutlineButton } from '../components/OutlineButton';
import { PublicDetailModal } from '../components/PublicDetailModal';
import { SafeImage } from '../components/SafeImage';
import { TruncatedTextWithMore } from '../components/TruncatedTextWithMore';
import { usePublicBlogs } from '../hooks/usePublicBlogs';
import type { BlogArticle } from '../services/blogsService';

interface BlogsPageProps {
  onNavigate: (path: string) => void;
}

export function BlogsPage({ onNavigate }: BlogsPageProps) {
  const [selectedPost, setSelectedPost] = useState<BlogArticle | null>(null);
  const {
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
  } = usePublicBlogs();

  const posts = pageData.items;
  const isDefaultUnfilteredFirstPage =
    query.page === 0 &&
    query.category === 'All' &&
    query.search.trim() === '' &&
    query.sortBy === 'displayOrder';

  // First Most Viewed article as full-width hero spotlight; remaining 4 in 2x2 grid (5 per page)
  const heroPost =
    isDefaultUnfilteredFirstPage && posts.length > 0 ? posts[0] : null;

  const gridPosts = heroPost ? posts.slice(1, 5) : posts.slice(0, 5);

  const hasActiveFilter =
    query.category !== 'All' || query.search.trim() !== '';

  const startItem =
    pageData.totalItems === 0 ? 0 : pageData.page * pageData.size + 1;
  const endItem = Math.min(
    pageData.totalItems,
    pageData.page * pageData.size + posts.length
  );

  return (
    <main id="main-content" className="relative z-10">
      <section className="px-5 sm:px-8 pt-32 sm:pt-40 pb-14 sm:pb-20">
        <div className="mx-auto max-w-[1120px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[780px]"
          >
            <h1 className="font-display text-[56px] sm:text-[82px] lg:text-[98px] font-bold leading-[1.03] tracking-[-0.02em] uppercase text-[#303030] dark:text-white">
              INFRASTRUCTURE INSIGHTS &amp; GUIDES
            </h1>
            <p className="mt-4 text-[16px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[580px]">
              Practical articles on Red Hat Linux, Cisco networking, Windows
              Server, cloud migration and live troubleshooting—shaped by 15+
              years of real industry experience.
            </p>
          </motion.div>

          {/* Dynamic Category Pills + Search + Sort Bar */}
          {(pageData.totalItems > 0 || hasActiveFilter) && (
            <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div
                role="tablist"
                aria-label="Filter blog articles by category"
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
                  All Guides
                </button>
                {pageData.availableCategories.map((cat) => {
                  const selected =
                    query.category.toLowerCase() === cat.toLowerCase();
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

              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="relative min-w-0 sm:w-[270px]">
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
                    placeholder="Search articles, topics, tags..."
                    aria-label="Search blog articles"
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
                        aria-label="Clear blogs search"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[#5C5C5C] hover:bg-black/5 dark:text-white/70"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <select
                  aria-label="Sort blog articles"
                  value={`${query.sortBy}:${query.sortDir}`}
                  onChange={(e) => {
                    const [sortBy, sortDir] = e.target.value.split(':') as [
                      'displayOrder' | 'createdAt' | 'viewsCount',
                      'asc' | 'desc',
                    ];
                    setSort(sortBy, sortDir);
                  }}
                  className="h-[44px] rounded-full border border-[#303030]/15 dark:border-white/15 bg-[#F5F5F5] dark:bg-[#2C2C2D] px-4 text-[13.5px] text-[#303030] dark:text-white focus:border-[#5E67E6] dark:focus:border-[#D0FF71] focus:outline-none"
                >
                  <option value="displayOrder:asc">Most Viewed &amp; Order</option>
                  <option value="createdAt:desc">Latest Articles</option>
                  <option value="viewsCount:desc">Highest Views</option>
                </select>
              </div>
            </div>
          )}

          {/* Loading Skeleton or Clean Empty State UI */}
          {loading && posts.length === 0 ? (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
              {[0, 1].map((skeleton) => (
                <div
                  key={skeleton}
                  className="animate-pulse rounded-[20px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-5"
                >
                  <div className="aspect-[16/10] rounded-[16px] bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                  <div className="mt-4 h-5 w-1/3 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                  <div className="mt-3 h-7 w-4/5 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="mt-12 rounded-[26px] border border-dashed border-[#D6D8E4] bg-[#F5F5F5] px-6 py-12 text-center sm:px-10 sm:py-16 dark:border-[#3A3A3E] dark:bg-[#252528]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5E67E6]/12 text-[#5E67E6] dark:bg-[#D0FF71]/15 dark:text-[#D0FF71]">
                <BookOpen className="h-8 w-8" aria-hidden="true" />
              </div>

              <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#5E67E6] shadow-xs dark:bg-[#1C1C1E] dark:text-[#D0FF71]">
                {hasActiveFilter ? 'Filter Update' : 'Insights Update'}
              </p>

              <h2 className="mx-auto mt-3 max-w-[560px] font-display text-[28px] font-bold uppercase leading-[1.12] text-[#303030] sm:text-[36px] dark:text-white">
                {hasActiveFilter
                  ? 'NO MATCHING BLOG ARTICLES FOUND'
                  : 'NO BLOG ARTICLES AVAILABLE RIGHT NOW'}
              </h2>

              <p className="mx-auto mt-3 max-w-[540px] text-[15px] leading-[1.65] font-light text-[#5C5C5C] sm:text-[16px] dark:text-white/75">
                {hasActiveFilter
                  ? 'No articles match your current search or category filter. Clear the filters to browse all published insights.'
                  : 'Our technical guides library is currently being updated with fresh Red Hat Linux, Cisco networking, AWS cloud, and troubleshooting articles. Explore study notes or view upcoming batches in the meantime.'}
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                {hasActiveFilter ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#5E67E6] px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 dark:bg-[#D0FF71] dark:text-[#1A1A1B] cursor-pointer"
                  >
                    Reset Filters
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onNavigate('/resources')}
                      className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#5E67E6] px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 dark:bg-[#D0FF71] dark:text-[#1A1A1B] cursor-pointer"
                    >
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      <span>Explore Study Notes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('/upcoming-batches')}
                      className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-[#303030]/20 bg-white px-5 py-3 text-[14px] font-medium text-[#303030] transition-colors hover:bg-[#303030] hover:text-white dark:border-white/20 dark:bg-[#1E1E20] dark:text-white dark:hover:bg-white dark:hover:text-[#1A1A1B] cursor-pointer"
                    >
                      <CalendarClock className="h-4 w-4" aria-hidden="true" />
                      <span>Upcoming Batches</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('/contact')}
                      className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-transparent px-4 py-3 text-[14px] font-medium text-[#5E67E6] hover:underline dark:text-[#D0FF71] cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" aria-hidden="true" />
                      <span>Book Consultation</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* 1st Blog: MOST VIEWED Hero Article Card */}
              {heroPost && (
                <motion.article
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.08 }}
                  className="group mt-12 rounded-[24px]"
                >
                  <a
                    href={`/blogs/${heroPost.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/blogs/${heroPost.slug}`);
                    }}
                    className="block rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
                  >
                    <div className="relative overflow-hidden rounded-[24px] aspect-[16/9] sm:aspect-[16/8.5] bg-[#ECECEE] dark:bg-[#2C2C2D]">
                      <SafeImage
                        src={
                          heroPost.coverImage ||
                          '/assets/images/hands_on_troubleshooting_1795164485759.jpg'
                        }
                        alt={heroPost.title}
                        loading="eager"
                        className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                      />
                      <span className="absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-5 py-1.5 font-display text-[18px] sm:text-[22px] font-bold uppercase tracking-wide text-white dark:text-[#1A1A1B] shadow-md">
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        <span>MOST VIEWED</span>
                      </span>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-3.5 py-0.5 text-[13px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
                        {heroPost.category}
                      </span>
                      <span className="text-[14px] font-light text-[#5C5C5C] dark:text-white/70">
                        {heroPost.guideLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[13.5px] font-light text-[#5C5C5C] dark:text-white/70">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {heroPost.readTime}
                      </span>
                      {heroPost.attachmentCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                          <Paperclip className="w-3.5 h-3.5" aria-hidden="true" />
                          {heroPost.attachmentCount}{' '}
                          {heroPost.attachmentCount === 1 ? 'file' : 'files'}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3.5 font-display text-[32px] sm:text-[42px] font-bold uppercase leading-[1.15] text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors line-clamp-2">
                      {heroPost.title}
                    </h2>
                  </a>
                  <div className="mt-2.5 max-w-[680px]">
                    <TruncatedTextWithMore
                      lines={3}
                      text={heroPost.excerpt}
                      className="text-[16px] sm:text-[17px] font-light leading-[1.6] text-[#303030] dark:text-white/75"
                      ariaLabel={`Read full summary for ${heroPost.title}`}
                      onMore={() => setSelectedPost(heroPost)}
                    />
                  </div>
                </motion.article>
              )}

              {/* Other 4 Articles in 2-Column Grid */}
              {gridPosts.length > 0 && (
                <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-10">
                  {gridPosts.map((post, idx) => (
                    <motion.article
                      key={post.id || post.slug}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.55, delay: idx * 0.05 }}
                      className="group flex h-full flex-col rounded-[20px]"
                    >
                      <a
                        href={`/blogs/${post.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(`/blogs/${post.slug}`);
                        }}
                        className="block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
                      >
                        <div className="relative overflow-hidden rounded-[20px] aspect-[16/10] bg-[#ECECEE] dark:bg-[#2C2C2D]">
                          <SafeImage
                            src={
                              post.coverImage ||
                              '/assets/images/cisco_network_lab_1795164486189.jpg'
                            }
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                          />
                          {post.featured && (
                            <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-3 py-1 font-display text-[12px] font-bold uppercase tracking-wide text-white dark:text-[#1A1A1B] shadow">
                              <Sparkles className="w-3 h-3" aria-hidden="true" />
                              <span>MOST VIEWED</span>
                            </span>
                          )}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-3.5 py-0.5 text-[13px] font-light text-[#5E67E6] dark:text-[#D0FF71]">
                            {post.category}
                          </span>
                          <span className="text-[14px] font-light text-[#5C5C5C] dark:text-white/70 line-clamp-1">
                            {post.guideLabel}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[13px] font-light text-[#5C5C5C] dark:text-white/70">
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            {post.readTime}
                          </span>
                        </div>

                        <h3 className="mt-3 font-display text-[28px] sm:text-[32px] font-bold uppercase leading-[1.2] text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                      </a>

                      <div className="mt-2">
                        <TruncatedTextWithMore
                          lines={3}
                          text={post.excerpt}
                          className="text-[15px] sm:text-[16px] font-light leading-[1.6] text-[#303030] dark:text-white/75"
                          ariaLabel={`Read full summary for ${post.title}`}
                          onMore={() => setSelectedPost(post)}
                        />
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}

              <PublicDetailModal
                open={Boolean(selectedPost)}
                onClose={() => setSelectedPost(null)}
                titleId="blogs-page-modal-title"
                closeLabel="Close article summary"
                maxWidthClass="max-w-[700px]"
              >
                {selectedPost && (
                  <div>
                    <div className="aspect-[16/9] w-full overflow-hidden bg-[#141415]">
                      <SafeImage
                        src={
                          selectedPost.coverImage ||
                          '/assets/images/cisco_network_lab_1795164486189.jpg'
                        }
                        alt={selectedPost.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center rounded-full border border-[#5E67E6] dark:border-[#D0FF71] px-3.5 py-0.5 text-[12.5px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                          {selectedPost.category}
                        </span>
                        <span className="text-[13px] font-light text-[#5C5C5C] dark:text-white/70">
                          {selectedPost.guideLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[13px] font-light text-[#5C5C5C] dark:text-white/70">
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          {selectedPost.readTime}
                        </span>
                      </div>
                      <h3
                        id="blogs-page-modal-title"
                        className="mt-3 font-display text-[28px] sm:text-[34px] font-bold uppercase leading-[1.15] text-[#303030] dark:text-white"
                      >
                        {selectedPost.title}
                      </h3>
                      <p className="mt-3 whitespace-pre-line text-[15.5px] font-light leading-[1.65] text-[#303030] dark:text-white/80">
                        {selectedPost.excerpt}
                      </p>
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            const slug = selectedPost.slug;
                            setSelectedPost(null);
                            onNavigate(`/blogs/${slug}`);
                          }}
                          className="inline-flex items-center gap-2 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-6 py-2.5 text-[14px] font-semibold text-white dark:text-[#1A1A1B] hover:opacity-90 cursor-pointer"
                        >
                          <span>Read Full Guide</span>
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </PublicDetailModal>
            </>
          )}

          {/* Server-Side Pagination UI (5 blogs per page) */}
          {pageData.totalItems > 0 && pageData.totalPages > 1 && (
            <nav
              aria-label="Blog pages navigation"
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
                blogs · Page {pageData.page + 1} of {pageData.totalPages}
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

          {posts.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <OutlineButton onClick={() => onNavigate('/resources')}>
                NOTES &amp; LAB WORKBOOKS
              </OutlineButton>
              <OutlineButton onClick={() => onNavigate('/upcoming-batches')}>
                EXPLORE UPCOMING BATCHES
              </OutlineButton>
            </div>
          )}
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
