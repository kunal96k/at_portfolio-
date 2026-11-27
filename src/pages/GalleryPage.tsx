import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { ContactSection } from '../components/ContactSection';
import { OutlineButton } from '../components/OutlineButton';
import { SafeImage } from '../components/SafeImage';
import { usePublicGallery } from '../hooks/usePublicGallery';
import type { GalleryItem } from '../services/galleryService';

interface GalleryPageProps {
  onNavigate?: (path: string) => void;
}

export function GalleryPage({ onNavigate }: GalleryPageProps) {
  const {
    query,
    pageData,
    loading,
    isDebouncing,
    setSearch,
    flushSearch,
    setCategory,
    setFeaturedOnly,
    setSort,
    setPage,
    resetFilters,
  } = usePublicGallery();

  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const visibleItems = pageData.items;
  const hasActiveFilter =
    query.category !== 'All' ||
    query.search.trim() !== '' ||
    query.featuredOnly;

  const startItem =
    pageData.totalItems === 0 ? 0 : pageData.page * pageData.size + 1;
  const endItem = Math.min(
    pageData.totalItems,
    pageData.page * pageData.size + visibleItems.length
  );

  useEffect(() => {
    if (!selectedPhoto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (e.key === 'ArrowRight') {
        const idx = visibleItems.findIndex((p) => p.id === selectedPhoto.id);
        if (idx >= 0) {
          setSelectedPhoto(visibleItems[(idx + 1) % visibleItems.length]);
        }
      } else if (e.key === 'ArrowLeft') {
        const idx = visibleItems.findIndex((p) => p.id === selectedPhoto.id);
        if (idx >= 0) {
          setSelectedPhoto(
            visibleItems[
              (idx - 1 + visibleItems.length) % visibleItems.length
            ]
          );
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPhoto, visibleItems]);

  const navigateLightbox = (direction: -1 | 1) => {
    if (!selectedPhoto || visibleItems.length === 0) return;
    const idx = visibleItems.findIndex((p) => p.id === selectedPhoto.id);
    if (idx < 0) return;
    const nextIdx =
      (idx + direction + visibleItems.length) % visibleItems.length;
    setSelectedPhoto(visibleItems[nextIdx]);
  };

  return (
    <main id="main-content" className="relative z-10">
      <section className="px-5 sm:px-8 pt-32 sm:pt-40 pb-14 sm:pb-20">
        <div className="mx-auto max-w-[1120px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[700px]"
          >
            <h1 className="font-display text-[56px] sm:text-[84px] lg:text-[104px] font-bold leading-[1.02] tracking-[-0.03em] uppercase text-[#303030] dark:text-white">
              GALLERY
            </h1>
            <p className="mt-5 text-[16px] sm:text-[18px] font-light leading-[1.6] text-[#303030] dark:text-white/80 max-w-[540px]">
              Snapshots of live lab environments, hands-on training setups,
              Cisco switch racks, and IT infrastructure workshops.
            </p>
          </motion.div>

          {/* Dynamic Category Pills + Featured Toggle + Search + Sort Bar */}
          {(pageData.totalItems > 0 || hasActiveFilter) && (
            <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div
                role="tablist"
                aria-label="Filter gallery images"
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
                  All Photos
                </button>
                {pageData.availableCategories.map((category) => {
                  const selected =
                    query.category.toLowerCase() === category.toLowerCase();
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setCategory(category)}
                      className={`rounded-full px-5 py-2.5 text-[14px] transition-colors cursor-pointer min-h-[44px] ${
                        selected
                          ? 'bg-[#5E67E6] dark:bg-[#D0FF71] text-white dark:text-[#1A1A1B] font-medium'
                          : 'bg-[#F5F5F5] dark:bg-[#2C2C2D] text-[#303030] dark:text-white/85 font-light hover:bg-[#EAEAEA] dark:hover:bg-[#38383A]'
                      }`}
                    >
                      {category}
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
                    placeholder="Search labs, photos, tags..."
                    aria-label="Search gallery photos"
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
                        aria-label="Clear gallery search"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[#5C5C5C] hover:bg-black/5 dark:text-white/70"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <select
                  aria-label="Sort gallery photos"
                  value={`${query.sortBy}:${query.sortDir}`}
                  onChange={(e) => {
                    const [sortBy, sortDir] = e.target.value.split(':') as [
                      'displayOrder' | 'createdAt' | 'takenAt',
                      'asc' | 'desc',
                    ];
                    setSort(sortBy, sortDir);
                  }}
                  className="h-[44px] rounded-full border border-[#303030]/15 dark:border-white/15 bg-[#F5F5F5] dark:bg-[#2C2C2D] px-4 text-[13.5px] text-[#303030] dark:text-white focus:border-[#5E67E6] dark:focus:border-[#D0FF71] focus:outline-none"
                >
                  <option value="displayOrder:asc">Featured &amp; Order</option>
                  <option value="takenAt:desc">Newest Photo Date</option>
                  <option value="createdAt:desc">Recently Added</option>
                </select>
              </div>
            </div>
          )}

          {/* Loading Skeleton or Clean Empty State UI */}
          {loading && visibleItems.length === 0 ? (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((skeleton) => (
                <div
                  key={skeleton}
                  className="animate-pulse rounded-[22px] overflow-hidden bg-[#F5F5F5] dark:bg-[#2C2C2D]"
                >
                  <div className="aspect-[4/3] bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-24 rounded-full bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                    <div className="h-6 w-3/4 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                    <div className="h-4 w-full rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="mt-12 rounded-[24px] border border-dashed border-[#D4D4D8] dark:border-[#3A3A3D] bg-[#F5F5F5] dark:bg-[#2C2C2D] px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-[#1E1E1F] text-[#5E67E6] dark:text-[#D0FF71] shadow-xs">
                <ImageIcon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-display text-[28px] sm:text-[34px] font-bold uppercase text-[#303030] dark:text-white">
                {hasActiveFilter
                  ? 'No Matching Gallery Photos Found'
                  : 'No Gallery Photos Available Right Now'}
              </h2>
              <p className="mx-auto mt-2.5 max-w-[540px] text-[15px] sm:text-[16px] font-light leading-[1.6] text-[#5C5C5C] dark:text-white/75">
                {hasActiveFilter
                  ? 'No photos match your current category, search, or featured filter. Clear filters to view all training lab snapshots.'
                  : 'Snapshots of Cisco networking racks, RHEL server labs, and workshops published from the Admin Dashboard will appear here automatically.'}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                {hasActiveFilter ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center justify-center rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-6 py-2.5 text-[14px] font-medium text-white dark:text-[#1A1A1B] cursor-pointer"
                  >
                    Reset Filters
                  </button>
                ) : (
                  onNavigate && (
                    <>
                      <OutlineButton
                        onClick={() => onNavigate('/upcoming-batches')}
                      >
                        UPCOMING BATCHES
                      </OutlineButton>
                      <OutlineButton onClick={() => onNavigate('/resources')}>
                        EXPLORE STUDY NOTES
                      </OutlineButton>
                    </>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPhoto(item)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: idx * 0.04 }}
                  aria-label={`Open gallery image: ${item.title}`}
                  className="group flex flex-col text-left rounded-[22px] overflow-hidden bg-[#F5F5F5] dark:bg-[#2C2C2D] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E2E2E5] dark:bg-[#1F1F21]">
                    <SafeImage
                      src={
                        item.imageUrl ||
                        '/assets/images/cisco_network_lab_1795164486189.jpg'
                      }
                      alt={item.altText || item.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-block rounded-full bg-white dark:bg-[#1E1E1F] px-3 py-1 text-[12px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                        {item.category}
                      </span>
                      {item.takenAt && (
                        <span className="inline-flex items-center gap-1 text-[12px] font-light text-[#5C5C5C] dark:text-white/65 tabular-nums">
                          <Calendar className="w-3 h-3" aria-hidden="true" />
                          {item.takenAt}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 font-display text-[22px] font-bold uppercase leading-[1.2] text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors">
                      {item.title}
                    </h2>
                    {item.caption && (
                      <p className="mt-1.5 text-[14px] font-light leading-[1.55] text-[#5C5C5C] dark:text-white/70 line-clamp-3">
                        {item.caption}
                      </p>
                    )}
                    {item.tags.length > 0 && (
                      <div className="mt-auto pt-3.5 flex flex-wrap gap-1.5">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-white/80 dark:bg-[#1E1E1F] px-2 py-0.5 text-[11px] font-medium text-[#5C5C5C] dark:text-white/70"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Server-Side Pagination UI (12 photos per page, matching Blogs page) */}
          {pageData.totalItems > 0 && pageData.totalPages > 1 && (
            <nav
              aria-label="Gallery pages navigation"
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
                photos · Page {pageData.page + 1} of {pageData.totalPages}
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

          {visibleItems.length > 0 && onNavigate && (
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <OutlineButton onClick={() => onNavigate('/blogs')}>
                READ BLOGS &amp; GUIDES
              </OutlineButton>
              <OutlineButton onClick={() => onNavigate('/resources')}>
                NOTES &amp; LAB WORKBOOKS
              </OutlineButton>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal (portaled above Navbar & page stacking contexts) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedPhoto && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={selectedPhoto.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPhoto(null)}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  transition={{ duration: 0.22 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-[880px] rounded-[24px] overflow-hidden bg-white dark:bg-[#1E1E1F] shadow-2xl"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    aria-label="Close image preview"
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="relative aspect-[16/10] bg-[#141415]">
                    <SafeImage
                      src={selectedPhoto.imageUrl}
                      alt={selectedPhoto.altText || selectedPhoto.title}
                      className="w-full h-full object-cover"
                    />
                    {visibleItems.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => navigateLightbox(-1)}
                          aria-label="Previous image"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 text-white hover:bg-black/80 flex items-center justify-center cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateLightbox(1)}
                          aria-label="Next image"
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 text-white hover:bg-black/80 flex items-center justify-center cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="p-6 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[12px] font-medium uppercase tracking-wider text-[#5E67E6] dark:text-[#D0FF71]">
                        {selectedPhoto.category}
                      </span>
                      {selectedPhoto.takenAt && (
                        <span className="text-[12px] text-[#5C5C5C] dark:text-white/65 tabular-nums">
                          · {selectedPhoto.takenAt}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-[26px] font-bold uppercase text-[#303030] dark:text-white">
                      {selectedPhoto.title}
                    </h3>
                    {selectedPhoto.caption && (
                      <p className="text-[15px] font-light text-[#5C5C5C] dark:text-white/75">
                        {selectedPhoto.caption}
                      </p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <ContactSection />
    </main>
  );
}
