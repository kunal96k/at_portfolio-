import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GALLERY_ITEMS, type GalleryPhoto } from '../data/portfolioData';
import { ContactSection } from '../components/ContactSection';
import { SafeImage } from '../components/SafeImage';

const GALLERY_FILTERS = ['All', 'Training', 'Labs', 'Infrastructure'] as const;

export function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState<(typeof GALLERY_FILTERS)[number]>('All');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const visibleItems =
    activeFilter === 'All'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

  useEffect(() => {
    if (!selectedPhoto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (e.key === 'ArrowRight') {
        const idx = visibleItems.findIndex((p) => p.id === selectedPhoto.id);
        if (idx >= 0) setSelectedPhoto(visibleItems[(idx + 1) % visibleItems.length]);
      } else if (e.key === 'ArrowLeft') {
        const idx = visibleItems.findIndex((p) => p.id === selectedPhoto.id);
        if (idx >= 0)
          setSelectedPhoto(visibleItems[(idx - 1 + visibleItems.length) % visibleItems.length]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPhoto, visibleItems]);

  const navigateLightbox = (direction: -1 | 1) => {
    if (!selectedPhoto || visibleItems.length === 0) return;
    const idx = visibleItems.findIndex((p) => p.id === selectedPhoto.id);
    if (idx < 0) return;
    const nextIdx = (idx + direction + visibleItems.length) % visibleItems.length;
    setSelectedPhoto(visibleItems[nextIdx]);
  };

  return (
    <main className="relative z-10">
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
              Snapshots of live lab environments, hands-on training setups, and IT infrastructure
              sessions.
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter gallery images"
            className="mt-10 flex flex-wrap items-center gap-2.5"
          >
            {GALLERY_FILTERS.map((category) => {
              const selected = activeFilter === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveFilter(category)}
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
          </div>

          {/* Gallery Grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleItems.map((item, idx) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => setSelectedPhoto(item)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                aria-label={`Open gallery image: ${item.title}`}
                className="group text-left rounded-[22px] overflow-hidden bg-[#F5F5F5] dark:bg-[#2C2C2D] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#E2E2E5] dark:bg-[#1F1F21]">
                  <SafeImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-block rounded-full bg-white dark:bg-[#1E1E1F] px-3 py-1 text-[12px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                    {item.category}
                  </span>
                  <h2 className="mt-3 font-display text-[22px] font-bold uppercase leading-[1.2] text-[#303030] dark:text-white">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-[14px] font-light leading-[1.55] text-[#5C5C5C] dark:text-white/70">
                    {item.caption}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8"
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
                  src={selectedPhoto.image}
                  alt={selectedPhoto.title}
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

              <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-[12px] font-medium uppercase tracking-wider text-[#5E67E6] dark:text-[#D0FF71]">
                    {selectedPhoto.category}
                  </span>
                  <h3 className="mt-1 font-display text-[26px] font-bold uppercase text-[#303030] dark:text-white">
                    {selectedPhoto.title}
                  </h3>
                  <p className="mt-1 text-[15px] font-light text-[#5C5C5C] dark:text-white/75">
                    {selectedPhoto.caption}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContactSection />
    </main>
  );
}
