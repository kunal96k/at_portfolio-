import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import {
  PROFILE,
  TRAINING_PHILOSOPHY,
} from '../data/portfolioData';
import { BatchEmptyStateCard } from '../components/BatchEmptyStateCard';
import { BatchEmptyStateModal } from '../components/BatchEmptyStateModal';
import { BlogsPreviewSection } from '../components/BlogsPreviewSection';
import { ContactSection } from '../components/ContactSection';
import { FaqSection } from '../components/FaqSection';
import { FeaturedProjectsSection } from '../components/FeaturedProjectsSection';
import { FloatingContactToggler } from '../components/FloatingContactToggler';
import { GalleryPreviewSection } from '../components/GalleryPreviewSection';
import { OutlineButton } from '../components/OutlineButton';
import { PortraitShowcaseSection } from '../components/PortraitShowcaseSection';
import { PublicDetailModal } from '../components/PublicDetailModal';
import { SafeImage } from '../components/SafeImage';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { TruncatedTextWithMore } from '../components/TruncatedTextWithMore';
import { usePublicBatches } from '../hooks/usePublicBatches';
import { usePublicCourses } from '../hooks/usePublicCourses';
import { useResponsiveReveal } from '../hooks/useResponsiveReveal';
import { formatBatchDateDisplay, type ManagedBatch } from '../services/batchesService';
import type { CourseDomain } from '../services/coursesService';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onContactClick: () => void;
}

export function HomePage({ onNavigate, onContactClick }: HomePageProps) {
  const headerReveal = useResponsiveReveal(0.2, 0.6);
  const cardReveal = useResponsiveReveal(0.15, 0.45);
  const { batches } = usePublicBatches();
  const { courses } = usePublicCourses();
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<CourseDomain | null>(
    null
  );
  const [selectedBatch, setSelectedBatch] = useState<ManagedBatch | null>(
    null
  );

  const visibleBatches = [...batches].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
  const featuredBatches = visibleBatches.filter((b) => b.featured);
  const homeBatches = (
    featuredBatches.length > 0 ? featuredBatches : visibleBatches
  ).slice(0, 3);
  const visibleDomains = [...courses].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <main>
      <PortraitShowcaseSection onNavigate={onNavigate} onContactClick={onContactClick} />

      {/* 10 Core Domains + Upcoming Batches Overview */}
      <section
        aria-label="Ten Core Training Domains"
        className="relative z-10 w-full px-5 sm:px-8 py-16 sm:py-24"
      >
        <div className="mx-auto max-w-[1120px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={headerReveal.viewport}
            transition={{ duration: headerReveal.duration, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[660px]"
          >
            <h2 className="font-display text-[44px] sm:text-[56px] lg:text-[60px] font-bold leading-[1.12] uppercase text-[#303030] dark:text-white">
              {visibleDomains.length > 0
                ? `${visibleDomains.length} CORE DOMAINS`
                : 'CORE DOMAINS'}
            </h2>
            <p className="mt-3 text-[18px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
              {visibleDomains.length === 10
                ? 'Ten core enterprise domains.'
                : `${visibleDomains.length} core enterprise domains.`}{' '}
              One goal: job-ready skills.
            </p>
            <p className="mt-3 text-[16px] sm:text-[17px] font-light leading-[1.6] text-[#303030] dark:text-white/80">
              {PROFILE.heroIntro1}
            </p>
          </motion.div>

          {visibleDomains.length === 0 ? (
            <div className="mt-10 rounded-[20px] border border-dashed border-[#D4D4D8] dark:border-[#3A3A3D] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-8 text-center">
              <p className="font-display text-[22px] font-bold uppercase text-[#303030] dark:text-white">
                No Published Domains Yet
              </p>
              <p className="mt-2 text-[14.5px] font-light text-[#5C5C5C] dark:text-white/75">
                Core domains published from the Course / Domain admin dashboard will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
              {visibleDomains.map((domain, idx) => (
                <motion.article
                  key={domain.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={cardReveal.viewport}
                  transition={{
                    duration: cardReveal.duration,
                    delay: cardReveal.isCompactViewport ? 0 : idx * 0.03,
                  }}
                  className="rounded-[20px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-5 flex h-full flex-col justify-between"
                >
                  <div>
                    <span className="font-display text-[26px] font-bold text-[#5E67E6] dark:text-[#D0FF71]">
                      {String(domain.displayOrder || idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-2 font-display text-[20px] font-bold uppercase leading-[1.2] text-[#303030] dark:text-white line-clamp-2">
                      {domain.title}
                    </h3>
                    <div className="mt-2">
                      <TruncatedTextWithMore
                        lines={3}
                        text={domain.shortDescription}
                        className="text-[13.5px] font-light leading-[1.55] text-[#5C5C5C] dark:text-white/75"
                        ariaLabel={`Read more about ${domain.title}`}
                        onMore={() => setSelectedDomain(domain)}
                      />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Upcoming Batches Preview Strip */}
          <div className="mt-16 pt-14 border-t border-[#E5E5E5] dark:border-[#333335]">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 className="font-display text-[38px] sm:text-[48px] font-bold leading-[1.12] uppercase text-[#303030] dark:text-white">
                  UPCOMING BATCHES
                </h2>
                <p className="mt-2 text-[16px] font-light text-[#5C5C5C] dark:text-white/75">
                  Flagship lab-driven batches in Red Hat Linux, Cisco CCNA and AWS Solutions
                  Architect Associate.
                </p>
              </div>
              <OutlineButton onClick={() => onNavigate('/upcoming-batches')}>
                VIEW SCHEDULE
              </OutlineButton>
            </div>

            {homeBatches.length === 0 ? (
              <div className="mt-8">
                <BatchEmptyStateCard
                  variant="all"
                  onOpenModal={() => setBatchModalOpen(true)}
                  onContactClick={onContactClick}
                  onNavigateResources={() => onNavigate('/resources')}
                />
              </div>
            ) : (
              <div
                className={`mt-8 grid grid-cols-1 gap-6 ${homeBatches.length === 1
                  ? 'max-w-xl'
                  : homeBatches.length === 2
                    ? 'md:grid-cols-2'
                    : 'md:grid-cols-3'
                  }`}
              >
                {homeBatches.map((batch) => (
                  <article
                    key={batch.id}
                    className="group flex h-full flex-col text-left rounded-[22px] overflow-hidden bg-[#F5F5F5] dark:bg-[#2C2C2D]"
                  >
                    <button
                      type="button"
                      onClick={() => onNavigate('/upcoming-batches')}
                      className="block w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-[#E2E2E5] dark:bg-[#1F1F21]">
                        <SafeImage
                          src={batch.coverImage}
                          alt={batch.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </button>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-block rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-3 py-0.5 text-[12px] font-medium text-white dark:text-[#1A1A1B]">
                          {batch.category}
                        </span>
                        <span className="text-[12px] font-medium text-[#5C5C5C] dark:text-white/65">
                          {formatBatchDateDisplay(batch.batchDate)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('/upcoming-batches')}
                        className="mt-3 block text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
                      >
                        <h3 className="font-display text-[24px] font-bold uppercase leading-[1.18] text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors line-clamp-2">
                          {batch.title}
                        </h3>
                      </button>
                      <div className="mt-2">
                        <TruncatedTextWithMore
                          lines={3}
                          text={batch.shortDescription}
                          className="text-[14px] font-light leading-[1.55] text-[#5C5C5C] dark:text-white/75"
                          ariaLabel={`Read more about ${batch.title}`}
                          onMore={() => setSelectedBatch(batch)}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <PublicDetailModal
            open={Boolean(selectedDomain)}
            onClose={() => setSelectedDomain(null)}
            titleId="home-domain-modal-title"
            closeLabel="Close domain summary"
            maxWidthClass="max-w-[580px]"
          >
            {selectedDomain && (
              <div className="p-6 sm:p-8 pr-14">
                <span className="font-display text-[26px] font-bold text-[#5E67E6] dark:text-[#D0FF71]">
                  {selectedDomain.domainCode || selectedDomain.category}
                </span>
                <h3
                  id="home-domain-modal-title"
                  className="mt-2 font-display text-[26px] sm:text-[32px] font-bold uppercase leading-[1.15] text-[#303030] dark:text-white"
                >
                  {selectedDomain.title}
                </h3>
                <p className="mt-3 whitespace-pre-line text-[15px] font-light leading-[1.65] text-[#5C5C5C] dark:text-white/80">
                  {selectedDomain.shortDescription}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDomain(null);
                      onNavigate('/upcoming-batches');
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-5 py-2.5 text-[14px] font-semibold text-white dark:text-[#1A1A1B] hover:opacity-90 cursor-pointer"
                  >
                    <span>Explore Upcoming Batches</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </PublicDetailModal>

          <PublicDetailModal
            open={Boolean(selectedBatch)}
            onClose={() => setSelectedBatch(null)}
            titleId="home-batch-modal-title"
            closeLabel="Close batch overview"
            maxWidthClass="max-w-[680px]"
          >
            {selectedBatch && (
              <div>
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#141415]">
                  <SafeImage
                    src={selectedBatch.coverImage}
                    alt={selectedBatch.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-block rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-3 py-0.5 text-[12px] font-medium text-white dark:text-[#1A1A1B]">
                      {selectedBatch.category}
                    </span>
                    <span className="text-[12.5px] font-medium text-[#5C5C5C] dark:text-white/70">
                      {formatBatchDateDisplay(selectedBatch.batchDate)}
                    </span>
                  </div>
                  <h3
                    id="home-batch-modal-title"
                    className="mt-3 font-display text-[26px] sm:text-[32px] font-bold uppercase leading-[1.15] text-[#303030] dark:text-white"
                  >
                    {selectedBatch.title}
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-[15px] font-light leading-[1.65] text-[#5C5C5C] dark:text-white/80">
                    {selectedBatch.shortDescription}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBatch(null);
                        onNavigate('/upcoming-batches');
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-5 py-2.5 text-[14px] font-semibold text-white dark:text-[#1A1A1B] hover:opacity-90 cursor-pointer"
                    >
                      <span>View All Batch Details</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </PublicDetailModal>

          <BatchEmptyStateModal
            open={batchModalOpen}
            onClose={() => setBatchModalOpen(false)}
            onContactClick={onContactClick}
            onNavigate={onNavigate}
          />

          {/* Training Philosophy Highlight */}
          <div className="mt-16 pt-14 border-t border-[#E5E5E5] dark:border-[#333335]">
            <div className="max-w-[660px]">
              <h2 className="font-display text-[38px] sm:text-[48px] font-bold leading-[1.12] uppercase text-[#303030] dark:text-white">
                MY TRAINING PHILOSOPHY
              </h2>
              <p className="mt-2 text-[18px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
                {TRAINING_PHILOSOPHY.tagline}
              </p>
              <p className="mt-3 text-[16px] font-light leading-[1.6] text-[#303030] dark:text-white/80">
                {TRAINING_PHILOSOPHY.intro[0]}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {TRAINING_PHILOSOPHY.steps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-[20px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-5"
                >
                  <span className="font-display text-[24px] font-bold text-[#5E67E6] dark:text-[#D0FF71]">
                    {step.number}
                  </span>
                  <h3 className="mt-1.5 text-[16px] font-semibold text-[#303030] dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] font-light leading-[1.55] text-[#5C5C5C] dark:text-white/75">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FeaturedProjectsSection
        onNavigate={onNavigate}
        showBrowseButton
        maxItems={3}
      />
      <TestimonialsSection onNavigate={onNavigate} showTestimonialsLink />
      <FaqSection />
      <BlogsPreviewSection
        onNavigate={onNavigate}
        onContactClick={onContactClick}
      />
      <GalleryPreviewSection onNavigate={onNavigate} />
      <ContactSection />
      <FloatingContactToggler onContactClick={onContactClick} />
    </main>
  );
}
