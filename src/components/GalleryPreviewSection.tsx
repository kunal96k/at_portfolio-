import { useEffect, useState } from 'react';
import { Calendar, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import {
  fetchPublicGalleryPageAsync,
  GALLERY_STORAGE_KEY,
  GALLERY_UPDATED_EVENT,
  type GalleryItem,
} from '../services/galleryService';
import { useResponsiveReveal } from '../hooks/useResponsiveReveal';
import { OutlineButton } from './OutlineButton';
import { SafeImage } from './SafeImage';

interface GalleryPreviewSectionProps {
  onNavigate: (path: string) => void;
}

export function GalleryPreviewSection({ onNavigate }: GalleryPreviewSectionProps) {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const headerReveal = useResponsiveReveal(0.25, 0.6);
  const cardReveal = useResponsiveReveal(0.15, 0.55);

  useEffect(() => {
    let active = true;
    const loadPhotos = () => {
      void fetchPublicGalleryPageAsync({
        featuredOnly: true,
        page: 0,
        size: 3,
        sortBy: 'displayOrder',
        sortDir: 'asc',
      })
        .then((res) => {
          if (active) {
            setPhotos(res.page.items.slice(0, 3));
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) {
            setPhotos([]);
            setLoading(false);
          }
        });
    };
    loadPhotos();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === GALLERY_STORAGE_KEY) {
        loadPhotos();
      }
    };
    window.addEventListener(GALLERY_UPDATED_EVENT, loadPhotos);
    window.addEventListener('storage', handleStorage);
    return () => {
      active = false;
      window.removeEventListener(GALLERY_UPDATED_EVENT, loadPhotos);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <section
      aria-label="Lab and Workshop Highlights Gallery"
      className="relative z-10 w-full px-5 sm:px-8 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-[1120px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={headerReveal.viewport}
          transition={{ duration: headerReveal.duration, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div className="max-w-[600px]">
            <h2 className="font-display text-[44px] sm:text-[56px] lg:text-[60px] font-bold leading-[1.12] uppercase text-[#303030] dark:text-white">
              LAB &amp; WORKSHOP GALLERY
            </h2>
            <p className="mt-4 text-[16px] sm:text-[18px] font-light leading-[1.55] text-[#303030] dark:text-white/80">
              Glimpses from enterprise Cisco racks, Red Hat Linux lab rooms, and hands-on corporate sessions.
            </p>
          </div>
          <OutlineButton onClick={() => onNavigate('/gallery')}>
            VIEW FULL GALLERY
          </OutlineButton>
        </motion.div>

        {loading && photos.length === 0 ? (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((skeleton) => (
              <div
                key={skeleton}
                className="animate-pulse rounded-[22px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-5 space-y-3"
              >
                <div className="aspect-[4/3] rounded-[16px] bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                <div className="h-4 w-24 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
                <div className="h-6 w-3/4 rounded bg-[#E2E2E6] dark:bg-[#3A3A3D]" />
              </div>
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="mt-10 rounded-[24px] border border-dashed border-[#D6D8E4] dark:border-[#3A3A3E] bg-[#F5F5F5] dark:bg-[#252528] p-8 sm:p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5E67E6]/12 text-[#5E67E6] dark:bg-[#D0FF71]/15 dark:text-[#D0FF71]">
              <ImageIcon className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="mt-4 text-[15px] font-light text-[#5C5C5C] dark:text-white/75">
              Featured lab and training snapshots will appear here once published from the Admin Dashboard.
            </p>
            <div className="mt-5 flex justify-center">
              <OutlineButton onClick={() => onNavigate('/gallery')}>
                EXPLORE GALLERY
              </OutlineButton>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {photos.slice(0, 3).map((item, idx) => (
              <motion.a
                key={item.id}
                href="/gallery"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/gallery');
                }}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={cardReveal.viewport}
                transition={{
                  duration: cardReveal.duration,
                  delay: cardReveal.isCompactViewport ? 0 : idx * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
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
                  <h3 className="mt-3 font-display text-[22px] font-bold uppercase leading-[1.2] text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="mt-1.5 text-[14px] font-light leading-[1.55] text-[#5C5C5C] dark:text-white/70 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
