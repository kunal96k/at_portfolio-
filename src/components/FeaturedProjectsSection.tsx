import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import { PROJECTS, type ProjectItem } from '../data/portfolioData';
import { computeStackedCardTransform } from '../utils/scrollMath';
import { useResponsiveReveal } from '../hooks/useResponsiveReveal';
import { OutlineButton } from './OutlineButton';
import { SafeImage } from './SafeImage';

interface FeaturedProjectsSectionProps {
  onNavigate: (path: string) => void;
  showBrowseButton?: boolean;
  asMainHeading?: boolean;
}

interface StackedTrackCardProps {
  project: ProjectItem;
  index: number;
  totalCards: number;
  scrollProgress: MotionValue<number>;
  onNavigate: (path: string) => void;
}

function StackedTrackCard({
  project,
  index,
  totalCards,
  scrollProgress,
  onNavigate,
}: StackedTrackCardProps) {
  const scale = useTransform(
    scrollProgress,
    (p) => computeStackedCardTransform(p, index, totalCards).scale
  );
  const y = useTransform(scrollProgress, (p) => computeStackedCardTransform(p, index, totalCards).y);
  const dimOpacity = useTransform(
    scrollProgress,
    (p) => computeStackedCardTransform(p, index, totalCards).dimOpacity
  );

  // Stagger sticky top offset subtly (0, +10, +20, +30px) so the stacked deck reveals crisp layered edges
  const stickyTopOffset = 92 + index * 10;

  return (
    <div
      className="sticky will-change-transform"
      style={{
        top: `${stickyTopOffset}px`,
        zIndex: index + 1,
      }}
    >
      <motion.div
        style={{
          scale,
          y,
          transformOrigin: 'top center',
        }}
        className="will-change-transform"
      >
        <a
          href={`/projects/${project.slug}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(`/projects/${project.slug}`);
          }}
          className="group relative block w-full overflow-hidden rounded-[22px] sm:rounded-[28px] aspect-[4/3] sm:aspect-[16/10] max-h-[72vh] bg-[#121213] shadow-[0_24px_60px_rgba(0,0,0,0.14)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E67E6] dark:focus-visible:ring-[#D0FF71]"
        >
          <SafeImage
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />

          {/* Base editorial vignette */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/30 transition-opacity duration-500 group-hover:from-black/85 group-hover:via-black/55"
          />

          {/* Scroll-driven depth veil when subsequent cards glide over */}
          <motion.div
            aria-hidden="true"
            style={{ opacity: dimOpacity }}
            className="pointer-events-none absolute inset-0 bg-black"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-12 text-center">
            <span className="inline-flex items-center rounded-full bg-[#5E67E6] dark:bg-[#D0FF71] px-4 py-1 text-[13px] sm:text-[14px] font-normal text-white dark:text-[#1A1A1B] transition-transform duration-300 group-hover:-translate-y-1">
              {project.category}
            </span>

            <h3 className="mt-4 sm:mt-5 font-display text-[30px] sm:text-[48px] lg:text-[56px] font-bold uppercase leading-[1.08] tracking-[-0.01em] text-white max-w-[900px] text-balance">
              {project.title}
            </h3>

            <p className="mt-3 sm:mt-4 max-w-[620px] text-[14px] sm:text-[16px] font-light leading-[1.55] text-white/90 line-clamp-3">
              {project.shortDescription}
            </p>
          </div>
        </a>
      </motion.div>
    </div>
  );
}

export function FeaturedProjectsSection({
  onNavigate,
  showBrowseButton = true,
  asMainHeading = false,
}: FeaturedProjectsSectionProps) {
  const featured = PROJECTS.filter((p) => p.featured);
  const HeadingTag = asMainHeading ? 'h1' : 'h2';
  const stackRef = useRef<HTMLDivElement | null>(null);
  const reveal = useResponsiveReveal(0.25, 0.6);

  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    mass: 0.35,
  });

  return (
    <section
      aria-label="Hands-On Training Tracks and Corporate Delivery"
      className="relative z-10 w-full px-5 sm:px-8 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-[1120px]">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={reveal.viewport}
          transition={{ duration: reveal.duration, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[620px]"
        >
          <HeadingTag
            className={`font-display font-bold uppercase text-[#303030] dark:text-white leading-[1.12] ${
              asMainHeading
                ? 'text-[56px] sm:text-[78px] lg:text-[96px] tracking-[-0.02em]'
                : 'text-[44px] sm:text-[56px] lg:text-[60px]'
            }`}
          >
            HANDS-ON LAB TRACKS
          </HeadingTag>
          <p className="mt-4 text-[16px] sm:text-[18px] font-light leading-[1.55] text-[#303030] dark:text-white/80">
            Practical, lab-driven tracks and institutional training programmes built around live
            production environments, real configurations and structured troubleshooting.
          </p>
        </motion.div>

        {/* Portavia-style Sticky Stacking Card Deck */}
        <div
          ref={stackRef}
          className="relative mt-12 sm:mt-16 flex flex-col gap-10 sm:gap-14 pb-6"
        >
          {featured.map((project, index) => (
            <StackedTrackCard
              key={project.slug}
              project={project}
              index={index}
              totalCards={featured.length}
              scrollProgress={smoothProgress}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {showBrowseButton && (
          <div className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-4">
            <OutlineButton onClick={() => onNavigate('/upcoming-batches')}>
              EXPLORE UPCOMING BATCHES
            </OutlineButton>
            <OutlineButton onClick={() => onNavigate('/projects')}>VIEW ALL TRACKS</OutlineButton>
          </div>
        )}
      </div>
    </section>
  );
}
