import { motion } from 'motion/react';
import {
  EXPERTISE_DOMAINS,
  INITIAL_UPCOMING_BATCHES,
  PROFILE,
  TRAINING_PHILOSOPHY,
} from '../data/portfolioData';
import { BlogsPreviewSection } from '../components/BlogsPreviewSection';
import { ContactSection } from '../components/ContactSection';
import { FaqSection } from '../components/FaqSection';
import { FeaturedProjectsSection } from '../components/FeaturedProjectsSection';
import { FloatingContactToggler } from '../components/FloatingContactToggler';
import { OutlineButton } from '../components/OutlineButton';
import { PortraitShowcaseSection } from '../components/PortraitShowcaseSection';
import { SafeImage } from '../components/SafeImage';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { useResponsiveReveal } from '../hooks/useResponsiveReveal';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onContactClick: () => void;
}

export function HomePage({ onNavigate, onContactClick }: HomePageProps) {
  const headerReveal = useResponsiveReveal(0.2, 0.6);
  const cardReveal = useResponsiveReveal(0.15, 0.45);

  return (
    <main>
      <PortraitShowcaseSection onNavigate={onNavigate} onContactClick={onContactClick} />

      {/* Ten Core Domains + Upcoming Training Overview */}
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
              TEN CORE DOMAINS
            </h2>
            <p className="mt-3 text-[18px] font-medium text-[#5E67E6] dark:text-[#D0FF71]">
              Ten core domains. One goal: job-ready skills.
            </p>
            <p className="mt-3 text-[16px] sm:text-[17px] font-light leading-[1.6] text-[#303030] dark:text-white/80">
              {PROFILE.heroIntro1}
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {EXPERTISE_DOMAINS.map((domain, idx) => (
              <motion.article
                key={domain.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={cardReveal.viewport}
                transition={{
                  duration: cardReveal.duration,
                  delay: cardReveal.isCompactViewport ? 0 : idx * 0.03,
                }}
                className="rounded-[20px] bg-[#F5F5F5] dark:bg-[#2C2C2D] p-5 flex flex-col justify-between"
              >
                <div>
                  <span className="font-display text-[26px] font-bold text-[#5E67E6] dark:text-[#D0FF71]">
                    {domain.number}
                  </span>
                  <h3 className="mt-2 font-display text-[20px] font-bold uppercase leading-[1.2] text-[#303030] dark:text-white">
                    {domain.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] font-light leading-[1.55] text-[#5C5C5C] dark:text-white/75">
                    {domain.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Upcoming Training Preview Strip */}
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
              <OutlineButton onClick={() => onNavigate('/upcoming-training')}>
                VIEW SCHEDULE
              </OutlineButton>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {INITIAL_UPCOMING_BATCHES.map((batch) => (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() => onNavigate('/upcoming-training')}
                  className="group text-left rounded-[22px] overflow-hidden bg-[#F5F5F5] dark:bg-[#2C2C2D] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-[#E2E2E5] dark:bg-[#1F1F21]">
                    <SafeImage
                      src={batch.coverImage}
                      alt={batch.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <span className="inline-block rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-3 py-0.5 text-[12px] font-medium text-white dark:text-[#1A1A1B]">
                      {batch.category}
                    </span>
                    <h3 className="mt-3 font-display text-[24px] font-bold uppercase leading-[1.18] text-[#303030] dark:text-white group-hover:text-[#5E67E6] dark:group-hover:text-[#D0FF71] transition-colors">
                      {batch.title}
                    </h3>
                    <p className="mt-2 text-[14px] font-light leading-[1.55] text-[#5C5C5C] dark:text-white/75 line-clamp-3">
                      {batch.summary}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

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

      <FeaturedProjectsSection onNavigate={onNavigate} showBrowseButton />
      <TestimonialsSection onNavigate={onNavigate} showTestimonialsLink />
      <FaqSection />
      <BlogsPreviewSection onNavigate={onNavigate} />
      <ContactSection />
      <FloatingContactToggler onContactClick={onContactClick} />
    </main>
  );
}
